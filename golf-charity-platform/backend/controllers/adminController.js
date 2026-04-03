const User = require('../models/User');
const Score = require('../models/Score');
const Charity = require('../models/Charity');
const Draw = require('../models/Draw');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const [totalUsers, activeSubscribers, totalCharities, draws] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ 'subscription.status': 'active' }),
      Charity.countDocuments({ isActive: true }),
      Draw.find({ status: { $in: ['published', 'completed'] } }).sort({ year: -1, month: -1 }).limit(5)
    ]);

    // Total prize pool paid
    const prizeStats = await Draw.aggregate([
      { $match: { status: { $in: ['published', 'completed'] } } },
      { $group: { _id: null, totalPrizePool: { $sum: '$prizePool.total' }, count: { $sum: 1 } } }
    ]);

    // Total donations
    const donationStats = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$totalDonated' } } }
    ]);

    // Monthly revenue approx
    const revUsers = await User.find({ 'subscription.status': 'active' }, 'subscription.plan subscription.monthlyFee');
    const monthlyRevenue = revUsers.reduce((sum, u) => sum + (u.subscription.monthlyFee || 20), 0);

    // Recent signups
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('firstName lastName email subscription.status createdAt');

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeSubscribers,
        totalCharities,
        monthlyRevenue: monthlyRevenue.toFixed(2),
        totalPrizePoolPaid: prizeStats[0]?.totalPrizePool || 0,
        totalDrawsRun: prizeStats[0]?.count || 0,
        totalDonations: donationStats[0]?.total || 0,
        recentDraws: draws,
        recentUsers
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const query = { role: 'user' };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query['subscription.status'] = status;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .populate('selectedCharity', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, users, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get users' });
  }
};

// @desc    Get single user with scores
// @route   GET /api/admin/users/:id
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('selectedCharity', 'name logoUrl');
    if (!user) return res.status(404).json({ error: 'User not found' });
    const scoreDoc = await Score.findOne({ user: user._id });
    res.json({ success: true, user, scores: scoreDoc?.scores || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user' });
  }
};

// @desc    Update user (admin)
// @route   PUT /api/admin/users/:id
exports.updateUser = async (req, res) => {
  try {
    const allowed = ['firstName', 'lastName', 'email', 'isActive', 'subscription', 'selectedCharity', 'charityContributionPercent'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).populate('selectedCharity', 'name');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// @desc    Admin: edit user scores
// @route   PUT /api/admin/users/:id/scores
exports.editUserScores = async (req, res) => {
  const { scores } = req.body; // Array of {value, datePlayed, course}
  try {
    const validated = (scores || []).slice(0, 5).map(s => ({
      value: Math.max(1, Math.min(45, Number(s.value))),
      datePlayed: new Date(s.datePlayed),
      course: s.course || '',
      notes: s.notes || ''
    }));

    const doc = await Score.findOneAndUpdate(
      { user: req.params.id },
      { scores: validated },
      { new: true, upsert: true }
    );
    res.json({ success: true, scores: doc.scores });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update scores' });
  }
};

// @desc    Get all winners for verification
// @route   GET /api/admin/winners
exports.getWinners = async (req, res) => {
  try {
    const { status } = req.query;
    const draws = await Draw.find({ 'winners.0': { $exists: true } })
      .populate('winners.user', 'firstName lastName email country')
      .sort({ publishedAt: -1 });

    let allWinners = [];
    draws.forEach(draw => {
      draw.winners.forEach(w => {
        if (!status || w.paymentStatus === status) {
          allWinners.push({
            drawId: draw._id,
            drawNumber: draw.drawNumber,
            month: draw.month,
            year: draw.year,
            winnerId: w._id,
            user: w.user,
            matchType: w.matchType,
            matchedNumbers: w.matchedNumbers,
            prizeAmount: w.prizeAmount,
            paymentStatus: w.paymentStatus,
            proofImageUrl: w.proofImageUrl,
            verifiedAt: w.verifiedAt,
            paidAt: w.paidAt
          });
        }
      });
    });

    res.json({ success: true, winners: allWinners });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get winners' });
  }
};

// @desc    Verify winner / update payout status
// @route   PUT /api/admin/winners/:drawId/:winnerId
exports.updateWinnerStatus = async (req, res) => {
  const { paymentStatus, notes } = req.body;

  try {
    const draw = await Draw.findById(req.params.drawId);
    if (!draw) return res.status(404).json({ error: 'Draw not found' });

    const winner = draw.winners.id(req.params.winnerId);
    if (!winner) return res.status(404).json({ error: 'Winner not found' });

    winner.paymentStatus = paymentStatus;
    if (notes) winner.notes = notes;
    if (paymentStatus === 'verified') winner.verifiedAt = new Date();
    if (paymentStatus === 'paid') {
      winner.paidAt = new Date();
      winner.verifiedAt = winner.verifiedAt || new Date();
    }

    await draw.save();
    res.json({ success: true, winner, message: `Winner status updated to ${paymentStatus}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update winner status' });
  }
};

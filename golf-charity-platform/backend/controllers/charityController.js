const Charity = require('../models/Charity');
const User = require('../models/User');

// @desc    Get all charities (public)
// @route   GET /api/charities
exports.getCharities = async (req, res) => {
  try {
    const { search, category, featured, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;

    const total = await Charity.countDocuments(query);
    const charities = await Charity.find(query)
      .sort({ isFeatured: -1, totalDonationsReceived: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-events');

    res.json({
      success: true,
      charities,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get charities' });
  }
};

// @desc    Get single charity
// @route   GET /api/charities/:id
exports.getCharity = async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity || !charity.isActive) return res.status(404).json({ error: 'Charity not found' });
    res.json({ success: true, charity });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get charity' });
  }
};

// @desc    Select charity for user
// @route   POST /api/charities/select
exports.selectCharity = async (req, res) => {
  const { charityId, contributionPercent } = req.body;

  try {
    const charity = await Charity.findById(charityId);
    if (!charity || !charity.isActive) return res.status(404).json({ error: 'Charity not found' });

    const percent = Math.max(10, Math.min(100, contributionPercent || 10));

    await User.findByIdAndUpdate(req.user._id, {
      selectedCharity: charityId,
      charityContributionPercent: percent
    });

    res.json({ success: true, message: 'Charity selection updated', charity, contributionPercent: percent });
  } catch (err) {
    res.status(500).json({ error: 'Failed to select charity' });
  }
};

// @desc    Create charity (admin)
// @route   POST /api/charities
exports.createCharity = async (req, res) => {
  try {
    const charity = await Charity.create(req.body);
    res.status(201).json({ success: true, charity });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create charity' });
  }
};

// @desc    Update charity (admin)
// @route   PUT /api/charities/:id
exports.updateCharity = async (req, res) => {
  try {
    const charity = await Charity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!charity) return res.status(404).json({ error: 'Charity not found' });
    res.json({ success: true, charity });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update charity' });
  }
};

// @desc    Delete charity (admin)
// @route   DELETE /api/charities/:id
exports.deleteCharity = async (req, res) => {
  try {
    await Charity.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Charity deactivated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete charity' });
  }
};

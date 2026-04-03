const Draw = require('../models/Draw');
const User = require('../models/User');
const Score = require('../models/Score');

// ─── Draw Engine ─────────────────────────────────────────────────────────────

// Random draw: pick 5 unique numbers from 1-45
const randomDraw = () => {
  const nums = new Set();
  while (nums.size < 5) nums.add(Math.floor(Math.random() * 45) + 1);
  return Array.from(nums).sort((a, b) => a - b);
};

// Algorithmic draw: weighted by frequency of user scores
const algorithmicDraw = async () => {
  const scores = await Score.find({});
  const freq = {};
  scores.forEach(doc => doc.scores.forEach(s => {
    freq[s.value] = (freq[s.value] || 0) + 1;
  }));

  // Build weighted pool
  const pool = [];
  for (let n = 1; n <= 45; n++) {
    const weight = freq[n] || 1; // at least 1 weight for each number
    for (let i = 0; i < weight; i++) pool.push(n);
  }

  // Shuffle and pick 5 unique
  const selected = new Set();
  const shuffled = pool.sort(() => Math.random() - 0.5);
  for (const n of shuffled) {
    selected.add(n);
    if (selected.size === 5) break;
  }
  // Fallback to fill
  for (let n = 1; n <= 45 && selected.size < 5; n++) selected.add(n);
  return Array.from(selected).sort((a, b) => a - b);
};

// ─── Prize Pool Calculator ────────────────────────────────────────────────────

const calcPrizePool = (subscriberCount, avgFee, rollover = 0) => {
  const total = subscriberCount * avgFee * 0.6 + rollover; // 60% of revenue + rollover
  return {
    total: parseFloat(total.toFixed(2)),
    fiveMatch: parseFloat((total * 0.40).toFixed(2)),
    fourMatch: parseFloat((total * 0.35).toFixed(2)),
    threeMatch: parseFloat((total * 0.25).toFixed(2)),
    jackpotRollover: rollover
  };
};

// ─── Match Checker ────────────────────────────────────────────────────────────

const checkUserMatches = (userScores, drawnNumbers) => {
  const userNums = userScores.map(s => s.value);
  const drawn = new Set(drawnNumbers);
  const matched = userNums.filter(n => drawn.has(n));
  const unique = [...new Set(matched)];

  if (unique.length >= 5) return { type: '5-match', matched: unique.slice(0, 5) };
  if (unique.length === 4) return { type: '4-match', matched: unique };
  if (unique.length === 3) return { type: '3-match', matched: unique };
  return null;
};

// ─── Controllers ─────────────────────────────────────────────────────────────

// @desc    Get all draws (public — published only)
// @route   GET /api/draws
exports.getDraws = async (req, res) => {
  try {
    const draws = await Draw.find({ status: { $in: ['published', 'completed'] } })
      .sort({ year: -1, month: -1 })
      .limit(12)
      .populate('winners.user', 'firstName lastName country');
    res.json({ success: true, draws });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get draws' });
  }
};

// @desc    Get upcoming draw
// @route   GET /api/draws/upcoming
exports.getUpcoming = async (req, res) => {
  try {
    const now = new Date();
    const draw = await Draw.findOne({
      status: { $in: ['upcoming', 'simulation'] },
      year: { $gte: now.getFullYear() }
    }).sort({ year: 1, month: 1 });

    // Get current prize pool estimate
    const activeCount = await User.countDocuments({ 'subscription.status': 'active' });

    res.json({ success: true, draw, estimatedActiveSubscribers: activeCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get upcoming draw' });
  }
};

// @desc    Admin: create a new draw
// @route   POST /api/draws
exports.createDraw = async (req, res) => {
  const { month, year, drawType, notes } = req.body;

  try {
    const existing = await Draw.findOne({ month, year });
    if (existing) return res.status(400).json({ error: 'Draw for this month/year already exists' });

    const lastDraw = await Draw.findOne().sort({ drawNumber: -1 });
    const drawNumber = lastDraw ? lastDraw.drawNumber + 1 : 1;

    // Get last jackpot rollover
    const lastPublished = await Draw.findOne({ status: { $in: ['published', 'completed'] } })
      .sort({ year: -1, month: -1 });
    const rollover = lastPublished && !lastPublished.hasJackpotWinner ? lastPublished.prizePool.fiveMatch : 0;

    const activeSubscribers = await User.find({ 'subscription.status': 'active' });
    const avgFee = activeSubscribers.reduce((sum, u) => sum + (u.subscription.monthlyFee || 20), 0) / (activeSubscribers.length || 1);
    const prizePool = calcPrizePool(activeSubscribers.length, avgFee, rollover);

    const draw = await Draw.create({
      drawNumber,
      month: Number(month),
      year: Number(year),
      drawType: drawType || 'random',
      prizePool,
      activeSubscriberCount: activeSubscribers.length,
      subscriptionRevenue: activeSubscribers.length * avgFee,
      notes
    });

    res.status(201).json({ success: true, draw });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create draw' });
  }
};

// @desc    Admin: run simulation
// @route   POST /api/draws/:id/simulate
exports.simulateDraw = async (req, res) => {
  try {
    const draw = await Draw.findById(req.params.id);
    if (!draw) return res.status(404).json({ error: 'Draw not found' });

    const drawnNumbers = draw.drawType === 'algorithmic' ? await algorithmicDraw() : randomDraw();

    // Check all active subscribers
    const activeUsers = await User.find({ 'subscription.status': 'active' });
    const scoresDocs = await Score.find({ user: { $in: activeUsers.map(u => u._id) } });
    const scoreMap = {};
    scoresDocs.forEach(doc => { scoreMap[doc.user.toString()] = doc.scores; });

    const fiveMatches = [], fourMatches = [], threeMatches = [];
    activeUsers.forEach(user => {
      const userScores = scoreMap[user._id.toString()] || [];
      const result = checkUserMatches(userScores, drawnNumbers);
      if (!result) return;
      const entry = { userId: user._id, name: user.fullName || `${user.firstName} ${user.lastName}`, ...result };
      if (result.type === '5-match') fiveMatches.push(entry);
      else if (result.type === '4-match') fourMatches.push(entry);
      else threeMatches.push(entry);
    });

    const simulation = {
      drawnNumbers,
      fiveMatches: fiveMatches.length,
      fourMatches: fourMatches.length,
      threeMatches: threeMatches.length,
      prizePool: draw.prizePool,
      prizePerFiveWinner: fiveMatches.length ? (draw.prizePool.fiveMatch / fiveMatches.length).toFixed(2) : draw.prizePool.fiveMatch,
      prizePerFourWinner: fourMatches.length ? (draw.prizePool.fourMatch / fourMatches.length).toFixed(2) : 0,
      prizePerThreeWinner: threeMatches.length ? (draw.prizePool.threeMatch / threeMatches.length).toFixed(2) : 0,
    };

    draw.simulationResults = simulation;
    draw.status = 'simulation';
    await draw.save();

    res.json({ success: true, simulation, draw });
  } catch (err) {
    res.status(500).json({ error: 'Simulation failed' });
  }
};

// @desc    Admin: publish draw results
// @route   POST /api/draws/:id/publish
exports.publishDraw = async (req, res) => {
  try {
    const draw = await Draw.findById(req.params.id);
    if (!draw) return res.status(404).json({ error: 'Draw not found' });
    if (draw.status === 'published' || draw.status === 'completed') {
      return res.status(400).json({ error: 'Draw already published' });
    }

    const drawnNumbers = draw.drawType === 'algorithmic' ? await algorithmicDraw() : randomDraw();
    draw.drawnNumbers = drawnNumbers;

    // Find winners
    const activeUsers = await User.find({ 'subscription.status': 'active' });
    const scoresDocs = await Score.find({ user: { $in: activeUsers.map(u => u._id) } });
    const scoreMap = {};
    scoresDocs.forEach(doc => { scoreMap[doc.user.toString()] = doc.scores; });

    const fiveW = [], fourW = [], threeW = [];
    activeUsers.forEach(user => {
      const userScores = scoreMap[user._id.toString()] || [];
      const result = checkUserMatches(userScores, drawnNumbers);
      if (!result) return;
      if (result.type === '5-match') fiveW.push({ user: user._id, matchedNumbers: result.matched });
      else if (result.type === '4-match') fourW.push({ user: user._id, matchedNumbers: result.matched });
      else threeW.push({ user: user._id, matchedNumbers: result.matched });
    });

    // Calculate per-winner prize
    const buildWinners = (arr, pool, matchType) =>
      arr.map(w => ({ ...w, matchType, prizeAmount: arr.length ? parseFloat((pool / arr.length).toFixed(2)) : 0 }));

    draw.winners = [
      ...buildWinners(fiveW, draw.prizePool.fiveMatch, '5-match'),
      ...buildWinners(fourW, draw.prizePool.fourMatch, '4-match'),
      ...buildWinners(threeW, draw.prizePool.threeMatch, '3-match'),
    ];

    draw.hasJackpotWinner = fiveW.length > 0;
    draw.status = 'published';
    draw.publishedAt = new Date();
    draw.publishedBy = req.user._id;
    draw.drawDate = new Date();
    await draw.save();

    // Update user stats
    for (const w of draw.winners) {
      await User.findByIdAndUpdate(w.user, {
        $inc: { totalWinnings: w.prizeAmount, drawsEntered: 1 }
      });
    }
    for (const u of activeUsers) {
      await User.findByIdAndUpdate(u._id, { $inc: { drawsEntered: 1 } });
    }

    await draw.populate('winners.user', 'firstName lastName email country');
    res.json({ success: true, draw, message: `Draw published! ${draw.winners.length} winner(s) found.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to publish draw' });
  }
};

// @desc    Admin: get all draws
// @route   GET /api/draws/admin
exports.adminGetDraws = async (req, res) => {
  try {
    const draws = await Draw.find()
      .sort({ year: -1, month: -1 })
      .populate('winners.user', 'firstName lastName email')
      .populate('publishedBy', 'firstName lastName');
    res.json({ success: true, draws });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get draws' });
  }
};

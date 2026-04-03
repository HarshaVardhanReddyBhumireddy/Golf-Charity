const Score = require('../models/Score');
const User = require('../models/User');

// @desc    Get user scores
// @route   GET /api/scores
exports.getScores = async (req, res) => {
  try {
    let scoreDoc = await Score.findOne({ user: req.user._id });
    if (!scoreDoc) {
      scoreDoc = await Score.create({ user: req.user._id, scores: [] });
    }
    const sorted = [...scoreDoc.scores].sort((a, b) => new Date(b.datePlayed) - new Date(a.datePlayed));
    const avg = sorted.length ? (sorted.reduce((s, x) => s + x.value, 0) / sorted.length).toFixed(1) : 0;

    res.json({ success: true, scores: sorted, average: parseFloat(avg), count: sorted.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get scores' });
  }
};

// @desc    Add a score
// @route   POST /api/scores
exports.addScore = async (req, res) => {
  const { value, datePlayed, course, notes } = req.body;

  if (!value || value < 1 || value > 45) {
    return res.status(400).json({ error: 'Score must be between 1 and 45 (Stableford)' });
  }
  if (!datePlayed) {
    return res.status(400).json({ error: 'Date played is required' });
  }

  try {
    let scoreDoc = await Score.findOne({ user: req.user._id });
    if (!scoreDoc) {
      scoreDoc = await Score.create({ user: req.user._id, scores: [] });
    }

    scoreDoc.addScore({ value: Number(value), datePlayed: new Date(datePlayed), course, notes });
    await scoreDoc.save();

    const sorted = [...scoreDoc.scores].sort((a, b) => new Date(b.datePlayed) - new Date(a.datePlayed));
    res.status(201).json({ success: true, scores: sorted, message: 'Score added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add score' });
  }
};

// @desc    Update a score
// @route   PUT /api/scores/:scoreId
exports.updateScore = async (req, res) => {
  const { value, datePlayed, course, notes } = req.body;

  try {
    const scoreDoc = await Score.findOne({ user: req.user._id });
    if (!scoreDoc) return res.status(404).json({ error: 'Score record not found' });

    const entry = scoreDoc.scores.id(req.params.scoreId);
    if (!entry) return res.status(404).json({ error: 'Score entry not found' });

    if (value !== undefined) entry.value = Number(value);
    if (datePlayed !== undefined) entry.datePlayed = new Date(datePlayed);
    if (course !== undefined) entry.course = course;
    if (notes !== undefined) entry.notes = notes;

    await scoreDoc.save();
    const sorted = [...scoreDoc.scores].sort((a, b) => new Date(b.datePlayed) - new Date(a.datePlayed));
    res.json({ success: true, scores: sorted, message: 'Score updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update score' });
  }
};

// @desc    Delete a score
// @route   DELETE /api/scores/:scoreId
exports.deleteScore = async (req, res) => {
  try {
    const scoreDoc = await Score.findOne({ user: req.user._id });
    if (!scoreDoc) return res.status(404).json({ error: 'Score record not found' });

    scoreDoc.scores = scoreDoc.scores.filter(s => s._id.toString() !== req.params.scoreId);
    await scoreDoc.save();
    const sorted = [...scoreDoc.scores].sort((a, b) => new Date(b.datePlayed) - new Date(a.datePlayed));
    res.json({ success: true, scores: sorted, message: 'Score deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete score' });
  }
};

// routes/winners.js
const express = require('express');
const router = express.Router();
const Draw = require('../models/Draw');
const { protect, requireSubscription } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/proofs/'),
  filename: (req, file, cb) => cb(null, `proof_${req.user._id}_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Get user's winnings
router.get('/my', protect, async (req, res) => {
  try {
    const draws = await Draw.find({ 'winners.user': req.user._id, status: { $in: ['published', 'completed'] } })
      .sort({ publishedAt: -1 });

    const winnings = [];
    draws.forEach(draw => {
      draw.winners.filter(w => w.user.toString() === req.user._id.toString()).forEach(w => {
        winnings.push({
          drawId: draw._id,
          drawNumber: draw.drawNumber,
          month: draw.month,
          year: draw.year,
          matchType: w.matchType,
          prizeAmount: w.prizeAmount,
          paymentStatus: w.paymentStatus,
          proofImageUrl: w.proofImageUrl,
          drawnNumbers: draw.drawnNumbers,
          winnerId: w._id
        });
      });
    });

    res.json({ success: true, winnings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get winnings' });
  }
});

// Upload proof
router.post('/:drawId/:winnerId/proof', protect, requireSubscription, upload.single('proof'), async (req, res) => {
  try {
    const draw = await Draw.findById(req.params.drawId);
    if (!draw) return res.status(404).json({ error: 'Draw not found' });

    const winner = draw.winners.id(req.params.winnerId);
    if (!winner || winner.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorised' });
    }

    winner.proofImageUrl = `/uploads/proofs/${req.file.filename}`;
    winner.paymentStatus = 'pending';
    await draw.save();

    res.json({ success: true, message: 'Proof uploaded successfully', proofUrl: winner.proofImageUrl });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload proof' });
  }
});

module.exports = router;

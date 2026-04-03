const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// Update charity contribution
router.put('/charity-contribution', protect, async (req, res) => {
  const { charityId, percent } = req.body;
  const safePercent = Math.max(10, Math.min(100, Number(percent)));
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { selectedCharity: charityId, charityContributionPercent: safePercent },
      { new: true }
    ).populate('selectedCharity', 'name logoUrl slug');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update charity contribution' });
  }
});

module.exports = router;

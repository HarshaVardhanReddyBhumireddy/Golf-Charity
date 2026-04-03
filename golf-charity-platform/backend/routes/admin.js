const express = require('express');
const router = express.Router();
const {
  getStats, getUsers, getUser, updateUser, editUserScores, getWinners, updateWinnerStatus
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.put('/users/:id/scores', editUserScores);
router.get('/winners', getWinners);
router.put('/winners/:drawId/:winnerId', updateWinnerStatus);

module.exports = router;

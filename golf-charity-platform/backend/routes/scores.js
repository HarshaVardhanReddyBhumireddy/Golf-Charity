const express = require('express');
const router = express.Router();
const { getScores, addScore, updateScore, deleteScore } = require('../controllers/scoreController');
const { protect, requireSubscription } = require('../middleware/auth');

router.use(protect);
router.get('/', getScores);
router.post('/', requireSubscription, addScore);
router.put('/:scoreId', requireSubscription, updateScore);
router.delete('/:scoreId', requireSubscription, deleteScore);

module.exports = router;

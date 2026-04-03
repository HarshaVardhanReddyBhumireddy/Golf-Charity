const express = require('express');
const router = express.Router();
const { getDraws, getUpcoming, createDraw, simulateDraw, publishDraw, adminGetDraws } = require('../controllers/drawController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getDraws);
router.get('/upcoming', getUpcoming);
router.get('/admin', protect, adminOnly, adminGetDraws);
router.post('/', protect, adminOnly, createDraw);
router.post('/:id/simulate', protect, adminOnly, simulateDraw);
router.post('/:id/publish', protect, adminOnly, publishDraw);

module.exports = router;

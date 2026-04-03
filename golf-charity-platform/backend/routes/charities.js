// routes/charities.js
const express = require('express');
const router = express.Router();
const { getCharities, getCharity, selectCharity, createCharity, updateCharity, deleteCharity } = require('../controllers/charityController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getCharities);
router.get('/:id', getCharity);
router.post('/select', protect, selectCharity);
router.post('/', protect, adminOnly, createCharity);
router.put('/:id', protect, adminOnly, updateCharity);
router.delete('/:id', protect, adminOnly, deleteCharity);

module.exports = router;

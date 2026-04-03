const express = require('express');
const router = express.Router();
const { getPlans, createCheckout, cancelSubscription, webhook, manualActivate } = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

router.get('/plans', getPlans);
router.post('/webhook', webhook);
router.post('/checkout', protect, createCheckout);
router.post('/cancel', protect, cancelSubscription);
router.post('/manual-activate', protect, manualActivate); // dev only

module.exports = router;

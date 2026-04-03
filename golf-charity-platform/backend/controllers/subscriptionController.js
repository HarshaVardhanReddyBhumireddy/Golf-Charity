const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PLANS = {
  monthly: { price: 20, stripePriceId: process.env.STRIPE_MONTHLY_PRICE_ID },
  yearly: { price: 192, stripePriceId: process.env.STRIPE_YEARLY_PRICE_ID } // ~20% discount
};

// @desc    Get subscription plans
// @route   GET /api/subscriptions/plans
exports.getPlans = async (req, res) => {
  res.json({
    success: true,
    plans: {
      monthly: { price: 20, currency: 'gbp', interval: 'month', description: '£20/month — cancel anytime' },
      yearly: { price: 192, currency: 'gbp', interval: 'year', description: '£192/year — save 20%', savings: 48 }
    }
  });
};

// @desc    Create Stripe checkout session
// @route   POST /api/subscriptions/checkout
exports.createCheckout = async (req, res) => {
  const { plan } = req.body;

  if (!PLANS[plan]) return res.status(400).json({ error: 'Invalid plan' });

  try {
    let customerId = req.user.subscription?.stripeCustomerId;

    // Create stripe customer if not exists
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: `${req.user.firstName} ${req.user.lastName}`,
        metadata: { userId: req.user._id.toString() }
      });
      customerId = customer.id;
      await User.findByIdAndUpdate(req.user._id, { 'subscription.stripeCustomerId': customerId });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: PLANS[plan].stripePriceId,
        quantity: 1,
      }],
      success_url: `${process.env.CLIENT_URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.CLIENT_URL}/subscribe?cancelled=true`,
      metadata: { userId: req.user._id.toString(), plan },
      subscription_data: {
        metadata: { userId: req.user._id.toString(), plan }
      }
    });

    res.json({ success: true, sessionUrl: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

// @desc    Cancel subscription
// @route   POST /api/subscriptions/cancel
exports.cancelSubscription = async (req, res) => {
  try {
    const user = req.user;
    if (!user.subscription?.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    await User.findByIdAndUpdate(user._id, { 'subscription.cancelAtPeriodEnd': true });
    res.json({ success: true, message: 'Subscription will cancel at end of billing period' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
};

// @desc    Stripe webhook handler
// @route   POST /api/subscriptions/webhook
exports.webhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { userId, plan } = session.metadata || {};
        if (!userId) break;

        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        await User.findByIdAndUpdate(userId, {
          'subscription.status': 'active',
          'subscription.plan': plan,
          'subscription.stripeSubscriptionId': subscription.id,
          'subscription.currentPeriodStart': new Date(subscription.current_period_start * 1000),
          'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
          'subscription.monthlyFee': plan === 'monthly' ? 20 : 16, // yearly avg monthly
          'subscription.cancelAtPeriodEnd': false,
        });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const sub = await stripe.subscriptions.retrieve(invoice.subscription);
        const userId = sub.metadata?.userId;
        if (!userId) break;

        await User.findByIdAndUpdate(userId, {
          'subscription.status': 'active',
          'subscription.currentPeriodStart': new Date(sub.current_period_start * 1000),
          'subscription.currentPeriodEnd': new Date(sub.current_period_end * 1000),
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const sub = await stripe.subscriptions.retrieve(invoice.subscription);
        const userId = sub.metadata?.userId;
        if (userId) await User.findByIdAndUpdate(userId, { 'subscription.status': 'lapsed' });
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const userId = sub.metadata?.userId;
        if (userId) await User.findByIdAndUpdate(userId, {
          'subscription.status': 'cancelled',
          'subscription.plan': null,
          'subscription.stripeSubscriptionId': ''
        });
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// @desc    Manual subscription update (dev/testing)
// @route   POST /api/subscriptions/manual-activate
exports.manualActivate = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Not available in production' });
  }

  const { userId, plan } = req.body;
  const targetId = userId || req.user._id;

  const now = new Date();
  const end = new Date(now);
  plan === 'yearly' ? end.setFullYear(end.getFullYear() + 1) : end.setMonth(end.getMonth() + 1);

  const user = await User.findByIdAndUpdate(targetId, {
    'subscription.status': 'active',
    'subscription.plan': plan || 'monthly',
    'subscription.currentPeriodStart': now,
    'subscription.currentPeriodEnd': end,
    'subscription.monthlyFee': plan === 'yearly' ? 16 : 20,
    'subscription.stripeSubscriptionId': 'test_sub_' + Date.now(),
  }, { new: true });

  res.json({ success: true, user, message: 'Subscription manually activated for testing' });
};

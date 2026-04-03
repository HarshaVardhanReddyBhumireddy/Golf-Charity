const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Charity = require('../models/Charity');
const Score = require('../models/Score');
const Draw = require('../models/Draw');

const charities = [
  {
    name: 'Cancer Research UK',
    slug: 'cancer-research-uk',
    description: 'We are the world\'s largest independent cancer research charity, funding scientists, doctors and nurses to help beat cancer sooner.',
    shortDescription: 'Funding world-class cancer research to save lives.',
    category: 'health',
    country: 'GB',
    isFeatured: true,
    tags: ['health', 'cancer', 'research'],
    website: 'https://www.cancerresearchuk.org',
    events: [
      { title: 'Charity Golf Day 2026', description: 'Annual golf fundraiser at Royal Lytham', date: new Date('2026-06-15'), location: 'Royal Lytham Golf Club' },
    ]
  },
  {
    name: 'British Heart Foundation',
    slug: 'british-heart-foundation',
    description: 'We fund research into heart and circulatory diseases, providing information and support for those affected.',
    shortDescription: 'Fighting heart and circulatory disease together.',
    category: 'health',
    country: 'GB',
    isFeatured: true,
    tags: ['health', 'heart', 'research'],
    website: 'https://www.bhf.org.uk',
  },
  {
    name: 'Golf Foundation',
    slug: 'golf-foundation',
    description: 'We inspire young people from all backgrounds to enjoy golf and benefit from the values and life skills it teaches.',
    shortDescription: 'Growing the game of golf from the grassroots up.',
    category: 'sports',
    country: 'GB',
    tags: ['golf', 'youth', 'sports'],
    website: 'https://www.golf-foundation.org',
  },
  {
    name: 'RNLI — Lifeboat Service',
    slug: 'rnli-lifeboat',
    description: 'The RNLI saves lives at sea. Our crews are always ready, 24/7, 365 days a year.',
    shortDescription: 'Saving lives at sea since 1824.',
    category: 'community',
    country: 'GB',
    tags: ['sea', 'rescue', 'community'],
  },
  {
    name: 'Macmillan Cancer Support',
    slug: 'macmillan-cancer-support',
    description: 'We provide medical, emotional, practical and financial support, and push for better cancer care.',
    shortDescription: 'No one should face cancer alone.',
    category: 'health',
    country: 'GB',
    tags: ['cancer', 'support', 'health'],
    isFeatured: true,
  },
  {
    name: 'WWF — World Wildlife Fund',
    slug: 'wwf',
    description: 'We work to protect the world\'s most iconic species and places, and to stop environmental destruction.',
    shortDescription: 'For a living planet.',
    category: 'environment',
    country: 'GB',
    tags: ['environment', 'wildlife', 'conservation'],
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([User.deleteMany({}), Charity.deleteMany({}), Score.deleteMany({}), Draw.deleteMany({})]);
    console.log('🗑️  Cleared existing data');

    // Seed charities
    const createdCharities = await Charity.insertMany(charities);
    console.log(`✅ Created ${createdCharities.length} charities`);

    // Seed admin user
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@golfcharity.com',
      password: 'Admin@123456',
      role: 'admin',
      isActive: true,
    });
    await Score.create({ user: admin._id, scores: [] });
    console.log('✅ Created admin: admin@golfcharity.com / Admin@123456');

    // Seed test subscriber
    const testUser = await User.create({
      firstName: 'John',
      lastName: 'Birdie',
      email: 'john@test.com',
      password: 'Test@123456',
      role: 'user',
      selectedCharity: createdCharities[0]._id,
      charityContributionPercent: 15,
      subscription: {
        status: 'active',
        plan: 'monthly',
        stripeCustomerId: 'cus_test_001',
        stripeSubscriptionId: 'sub_test_001',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        monthlyFee: 20,
      }
    });
    await Score.create({
      user: testUser._id,
      scores: [
        { value: 36, datePlayed: new Date('2026-03-28'), course: 'St Andrews' },
        { value: 29, datePlayed: new Date('2026-03-20'), course: 'Royal Birkdale' },
        { value: 33, datePlayed: new Date('2026-03-10'), course: 'Wentworth' },
        { value: 41, datePlayed: new Date('2026-02-25'), course: 'Augusta' },
        { value: 27, datePlayed: new Date('2026-02-15'), course: 'St Andrews' },
      ]
    });
    console.log('✅ Created test user: john@test.com / Test@123456');

    // Seed a completed draw
    await Draw.create({
      drawNumber: 1,
      month: 2,
      year: 2026,
      drawDate: new Date('2026-02-28'),
      drawType: 'random',
      status: 'published',
      drawnNumbers: [12, 27, 33, 36, 41],
      prizePool: { total: 240, fiveMatch: 96, fourMatch: 84, threeMatch: 60, jackpotRollover: 0 },
      activeSubscriberCount: 12,
      subscriptionRevenue: 240,
      hasJackpotWinner: false,
      publishedAt: new Date('2026-02-28'),
      winners: []
    });
    console.log('✅ Created sample draw');

    console.log('\n🎉 Seed complete!\n');
    console.log('Admin:    admin@golfcharity.com / Admin@123456');
    console.log('User:     john@test.com / Test@123456');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();

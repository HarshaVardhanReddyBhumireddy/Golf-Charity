const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar: { type: String, default: '' },
  phone: { type: String, default: '' },
  country: { type: String, default: 'GB' },
  handicap: { type: Number, default: 0, min: -10, max: 54 },

  // Subscription
  subscription: {
    status: { type: String, enum: ['active', 'inactive', 'cancelled', 'lapsed', 'trialing'], default: 'inactive' },
    plan: { type: String, enum: ['monthly', 'yearly', null], default: null },
    stripeCustomerId: { type: String, default: '' },
    stripeSubscriptionId: { type: String, default: '' },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    monthlyFee: { type: Number, default: 0 },
  },

  // Charity preferences
  selectedCharity: { type: mongoose.Schema.Types.ObjectId, ref: 'Charity', default: null },
  charityContributionPercent: { type: Number, default: 10, min: 10, max: 100 },

  // Stats
  totalWinnings: { type: Number, default: 0 },
  drawsEntered: { type: Number, default: 0 },
  totalDonated: { type: Number, default: 0 },

  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

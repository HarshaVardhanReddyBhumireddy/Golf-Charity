const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  location: { type: String },
  imageUrl: { type: String, default: '' },
});

const charitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, required: true },
  shortDescription: { type: String, maxlength: 200 },
  logoUrl: { type: String, default: '' },
  bannerUrl: { type: String, default: '' },
  images: [{ type: String }],
  website: { type: String, default: '' },
  registrationNumber: { type: String, default: '' },
  category: {
    type: String,
    enum: ['health', 'education', 'environment', 'sports', 'community', 'international', 'other'],
    default: 'other'
  },
  country: { type: String, default: 'GB' },
  events: [eventSchema],
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  totalDonationsReceived: { type: Number, default: 0 },
  subscriberCount: { type: Number, default: 0 },
  tags: [String],
}, { timestamps: true });

// Auto-generate slug
charitySchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Charity', charitySchema);

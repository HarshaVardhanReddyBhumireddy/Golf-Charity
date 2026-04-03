const mongoose = require('mongoose');

const winnerEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  matchType: { type: String, enum: ['5-match', '4-match', '3-match'] },
  matchedNumbers: [Number],
  prizeAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['pending', 'verified', 'paid', 'rejected'], default: 'pending' },
  proofImageUrl: { type: String, default: '' },
  verifiedAt: Date,
  paidAt: Date,
  notes: { type: String, default: '' },
});

const drawSchema = new mongoose.Schema({
  drawNumber: { type: Number, required: true, unique: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true },
  drawDate: { type: Date },
  drawType: { type: String, enum: ['random', 'algorithmic'], default: 'random' },
  status: {
    type: String,
    enum: ['upcoming', 'simulation', 'published', 'completed'],
    default: 'upcoming'
  },

  // The 5 drawn numbers
  drawnNumbers: {
    type: [Number],
    validate: {
      validator: function(v) { return v.length === 0 || v.length === 5; },
      message: 'Draw must have exactly 5 numbers or be empty'
    }
  },

  // Prize pool breakdown
  prizePool: {
    total: { type: Number, default: 0 },
    fiveMatch: { type: Number, default: 0 },  // 40%
    fourMatch: { type: Number, default: 0 },   // 35%
    threeMatch: { type: Number, default: 0 },  // 25%
    jackpotRollover: { type: Number, default: 0 }, // carried from previous
  },

  // Subscriber snapshot at draw time
  activeSubscriberCount: { type: Number, default: 0 },
  subscriptionRevenue: { type: Number, default: 0 },

  // Winners
  winners: [winnerEntrySchema],
  hasJackpotWinner: { type: Boolean, default: false },

  // Simulation results (before official publish)
  simulationResults: { type: mongoose.Schema.Types.Mixed, default: null },

  publishedAt: Date,
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Draw', drawSchema);

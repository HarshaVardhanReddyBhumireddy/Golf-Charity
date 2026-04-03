const mongoose = require('mongoose');

const scoreEntrySchema = new mongoose.Schema({
  value: { type: Number, required: true, min: 1, max: 45 },
  datePlayed: { type: Date, required: true },
  course: { type: String, default: '' },
  notes: { type: String, default: '' },
}, { _id: true, timestamps: true });

const scoreSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  scores: {
    type: [scoreEntrySchema],
    validate: {
      validator: function(v) { return v.length <= 5; },
      message: 'Cannot store more than 5 scores'
    }
  },
}, { timestamps: true });

// Method to add a new score (rolling window of 5)
scoreSchema.methods.addScore = function(scoreData) {
  this.scores.push(scoreData);
  // Keep only latest 5
  if (this.scores.length > 5) {
    // Sort by datePlayed desc, keep 5 most recent
    this.scores.sort((a, b) => new Date(b.datePlayed) - new Date(a.datePlayed));
    this.scores = this.scores.slice(0, 5);
  }
  return this;
};

// Virtual: scores sorted most recent first
scoreSchema.virtual('sortedScores').get(function () {
  return [...this.scores].sort((a, b) => new Date(b.datePlayed) - new Date(a.datePlayed));
});

// Virtual: average score
scoreSchema.virtual('average').get(function () {
  if (!this.scores.length) return 0;
  return (this.scores.reduce((sum, s) => sum + s.value, 0) / this.scores.length).toFixed(1);
});

module.exports = mongoose.model('Score', scoreSchema);

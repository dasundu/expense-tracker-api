const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Food', 'Transportation', 'Entertainment', 'Bills', 'Shopping', 'Savings', 'Other'],
  },
  amount: {
    type: Number,
    required: true,
  },
  spent: {
    type: Number,
    default: 0, // To track the amount already spent
  },
  month: {
    type: String,
    required: true, // Format: 'YYYY-MM'
  },
  notifyThreshold: {
    type: Number,
    default: 0.8, // Notify when 80% of budget is spent
  },
  adjustmentRecommendation: {
    type: Number,
    default: 0, // Suggested increase/decrease based on trends
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Budget', budgetSchema);
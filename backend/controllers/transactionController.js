const Transaction = require('../models/Transaction');
const Goal = require('../models/Goal');
const Budget = require('../models/Budget');
const { createNotification } = require('./notificationController');

const addTransaction = async (req, res) => {
  try {
    const { amount, category, type, notes, tags } = req.body;

    const transaction = new Transaction({
      user: req.user._id,
      amount,
      category,
      type,
      notes,
      tags,
    });

    await transaction.save();

    // Auto-allocate only 10% of income to savings goals
    if (type === 'income') {
      const goals = await Goal.find({ user: req.user._id, autoAllocate: true });

      if (goals.length > 0) {
        const totalAutoAllocate = goals.reduce((acc, goal) => acc + (goal.targetAmount - goal.currentAmount), 0);
        const autoSaveAmount = amount * 0.1; // 🔥 Only 10% of income goes to savings

        for (let goal of goals) {
          const remaining = goal.targetAmount - goal.currentAmount;
          if (remaining > 0) {
            const allocation = (remaining / totalAutoAllocate) * autoSaveAmount;
            goal.currentAmount += Math.min(allocation, remaining);
            await goal.save();
          }
        }
      }
    }

    // Budget check: alert if user exceeds budget
    const budget = await Budget.findOne({ user: req.user._id, category });
    if (budget && amount > budget.amount) {
      await createNotification(req.user._id, `You exceeded your ${category} budget!`, 'Spending Alert');
    }

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Error adding transaction', error: error.message });
  }
};


// Get all transactions for a user
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
};

// Update a transaction
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction || transaction.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const { amount, category, type, notes, tags } = req.body;

    transaction.amount = amount ?? transaction.amount;
    transaction.category = category ?? transaction.category;
    transaction.type = type ?? transaction.type;
    transaction.notes = notes ?? transaction.notes;
    transaction.tags = tags ?? transaction.tags;

    await transaction.save();
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Error updating transaction', error: error.message });
  }
};

// Delete a transaction
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction || transaction.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await transaction.deleteOne();
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting transaction', error: error.message });
  }
};

module.exports = {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
};
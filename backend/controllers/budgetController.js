const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// Create a new budget
const createBudget = async (req, res) => {
  const { category, amount, month, notifyThreshold } = req.body;

  try {
    const budget = new Budget({
      user: req.user._id,
      category,
      amount,
      month,
      notifyThreshold: notifyThreshold || 0.8, // Default to 80%
    });

    await budget.save();
    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create budget', error: error.message });
  }
};

// Get all budgets for logged-in user
const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id });
    res.status(200).json(budgets);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get budgets', error: error.message });
  }
};

// Update a budget (e.g., to adjust amount or threshold)
const updateBudget = async (req, res) => {
  const { id } = req.params;
  const { amount, notifyThreshold } = req.body;

  try {
    const budget = await Budget.findById(id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    if (budget.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this budget' });
    }

    budget.amount = amount || budget.amount;
    budget.notifyThreshold = notifyThreshold || budget.notifyThreshold;

    await budget.save();
    res.status(200).json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update budget', error: error.message });
  }
};

// Delete a budget
const deleteBudget = async (req, res) => {
  const { id } = req.params;

  try {
    const budget = await Budget.findById(id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    if (budget.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this budget' });
    }

    await Budget.findByIdAndDelete(id); // Use findByIdAndDelete instead of remove
    res.status(200).json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error in deleteBudget controller:', error); // Log error
    res.status(500).json({ message: 'Failed to delete budget', error: error.message });
  }
};


// Check if user is nearing/exceeding budget
const checkBudgetStatus = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id });
    const notifications = [];

    for (const budget of budgets) {
      if (budget.spent >= budget.amount * budget.notifyThreshold) {
        notifications.push({
          category: budget.category,
          message: `Warning: You have spent ${budget.spent} out of your ${budget.amount} budget for ${budget.category}.`,
        });
      }
    }

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to check budget status', error: error.message });
  }
};

// Adjust budget based on spending trends
const suggestBudgetAdjustment = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id });
    const budgets = await Budget.find({ user: req.user._id });

    budgets.forEach((budget) => {
      const totalSpent = transactions
        .filter((t) => t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);

      // Suggest a new budget based on average spending (+ 10% buffer)
      const recommendedBudget = Math.ceil(totalSpent * 1.1);
      budget.adjustmentRecommendation = recommendedBudget;
    });

    await Promise.all(budgets.map((budget) => budget.save()));
    res.status(200).json(budgets);
  } catch (error) {
    res.status(500).json({ message: 'Failed to suggest budget adjustments', error: error.message });
  }
};

module.exports = {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
  checkBudgetStatus,
  suggestBudgetAdjustment,
};
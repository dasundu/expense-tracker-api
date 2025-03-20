const User = require('../models/User');
const Transaction = require('../models/Transaction');

// User Dashboard: Display user's financial activity and overview
const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    const totalTransactions = await Transaction.countDocuments({ user: userId });

    const totalIncome = await Transaction.aggregate([
      { $match: { user: userId, type: 'income' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalExpenses = await Transaction.aggregate([
      { $match: { user: userId, type: 'expense' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({
      user: { name: user.name, email: user.email },
      totalTransactions,
      totalIncome: totalIncome[0]?.total || 0,
      totalExpenses: totalExpenses[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user dashboard data', error: error.message });
  }
};

module.exports = { getUserDashboard };

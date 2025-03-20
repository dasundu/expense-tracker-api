const Transaction = require('../models/Transaction');

// Generate financial report
const generateReport = async (req, res) => {
  try {
    const { startDate, endDate, category, tags } = req.query;

    // Build the query
    const filter = { user: req.user._id };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (category) filter.category = category;
    if (tags) filter.tags = { $in: tags.split(',') };

    // Get transactions
    const transactions = await Transaction.find(filter);

    // Calculate totals
    const summary = transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'income') {
          acc.totalIncome += transaction.amount;
        } else if (transaction.type === 'expense') {
          acc.totalExpenses += transaction.amount;
        }
        return acc;
      },
      { totalIncome: 0, totalExpenses: 0 }
    );

    // Format data for chart visualization (group by date)
    const trends = transactions.reduce((acc, transaction) => {
      const date = transaction.date.toISOString().split('T')[0]; // format YYYY-MM-DD
      if (!acc[date]) acc[date] = { income: 0, expenses: 0 };
      if (transaction.type === 'income') {
        acc[date].income += transaction.amount;
      } else if (transaction.type === 'expense') {
        acc[date].expenses += transaction.amount;
      }
      return acc;
    }, {});

    res.status(200).json({
      summary,
      trends,
      transactions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
};

module.exports = { generateReport };

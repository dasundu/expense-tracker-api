// unit/report.test.js
const { generateReport } = require('../controllers/reportController');
const Transaction = require('../models/Transaction');

jest.mock('../models/Transaction');

describe('Generate Financial Report', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { _id: 'user123' },
      query: {
        startDate: '2025-01-01',
        endDate: '2025-03-01',
        category: 'Groceries',
        tags: 'food,essentials',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  /** ✅ Test: Successful report generation */
  it('should generate a financial report successfully', async () => {
    const transactions = [
      { type: 'income', amount: 1000, date: new Date('2025-01-15'), category: 'Groceries', tags: ['food'] },
      { type: 'expense', amount: 200, date: new Date('2025-02-01'), category: 'Groceries', tags: ['food', 'essentials'] },
      { type: 'expense', amount: 100, date: new Date('2025-02-15'), category: 'Groceries', tags: ['essentials'] },
    ];

    // Mock the Transaction.find() method to return the transactions
    Transaction.find.mockResolvedValue(transactions);

    await generateReport(req, res);

    // Check that the response has been sent with the correct status and data
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      summary: { totalIncome: 1000, totalExpenses: 300 },
      trends: {
        '2025-01-15': { income: 1000, expenses: 0 },
        '2025-02-01': { income: 0, expenses: 200 },
        '2025-02-15': { income: 0, expenses: 100 },
      },
      transactions,
    });
  });

  /** ✅ Test: No transactions found */
  it('should return an empty report when no transactions match the filter', async () => {
    // Mock the Transaction.find() method to return an empty array
    Transaction.find.mockResolvedValue([]);

    await generateReport(req, res);

    // Check that the response has been sent with the correct status and data
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      summary: { totalIncome: 0, totalExpenses: 0 },
      trends: {},
      transactions: [],
    });
  });

  /** ✅ Test: Error handling */
  it('should return an error if the report generation fails', async () => {
    const errorMessage = 'Database error';
    
    // Mock the Transaction.find() method to throw an error
    Transaction.find.mockRejectedValue(new Error(errorMessage));

    await generateReport(req, res);

    // Check that the error response has been sent with the correct status and message
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error generating report', error: errorMessage });
  });
});

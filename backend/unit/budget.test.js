// unit/budget.test.js
const { createBudget, getBudgets, updateBudget, deleteBudget, checkBudgetStatus, suggestBudgetAdjustment } = require('../controllers/budgetController');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

jest.mock('../models/Budget');
jest.mock('../models/Transaction');

describe('Budget Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { _id: 'user123' },
      body: {},
      params: { id: 'budget123' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  /** ✅ Test: Get Budgets */
  it('should retrieve all budgets for the user', async () => {
    const budgets = [
      { _id: 'budget123', user: 'user123', category: 'Groceries', amount: 500, month: 'March', notifyThreshold: 0.8 },
    ];

    Budget.find.mockResolvedValue(budgets);

    await getBudgets(req, res);

    expect(Budget.find).toHaveBeenCalledWith({ user: 'user123' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(budgets);
  });

  /** ✅ Test: Delete Budget */
  it('should delete a budget', async () => {
    const budget = {
      _id: 'budget123',
      user: 'user123',
      category: 'Groceries',
      amount: 500,
      month: 'March',
      notifyThreshold: 0.8,
    };

    Budget.findById.mockResolvedValue(budget);
    Budget.findByIdAndDelete.mockResolvedValue(budget);

    await deleteBudget(req, res);

    expect(Budget.findById).toHaveBeenCalledWith('budget123');
    expect(Budget.findByIdAndDelete).toHaveBeenCalledWith('budget123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Budget deleted successfully' });
  });

  /** ✅ Test: Check Budget Status */
  it('should notify when the user is nearing or exceeding budget', async () => {
    const budgets = [
      { _id: 'budget123', user: 'user123', category: 'Groceries', amount: 500, spent: 450, notifyThreshold: 0.8 },
    ];

    Budget.find.mockResolvedValue(budgets);

    await checkBudgetStatus(req, res);

    expect(Budget.find).toHaveBeenCalledWith({ user: 'user123' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{
      category: 'Groceries',
      message: 'Warning: You have spent 450 out of your 500 budget for Groceries.',
    }]);
  });
});

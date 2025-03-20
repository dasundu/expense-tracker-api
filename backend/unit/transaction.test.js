const { addTransaction, getTransactions, updateTransaction, deleteTransaction } = require('../controllers/transactionController');
const Transaction = require('../models/Transaction');
const Goal = require('../models/Goal');
const Budget = require('../models/Budget');
const { createNotification } = require('../controllers/notificationController');

jest.mock('../models/Transaction');
jest.mock('../models/Goal');
jest.mock('../models/Budget');
jest.mock('../controllers/notificationController');

describe('Transaction Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { _id: 'user123' },
      body: { amount: 100, category: 'Food', type: 'expense', notes: 'Lunch', tags: ['meal'] },
      params: { id: 'transaction123' }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /** ✅ Test: Add Transaction - Expense with Budget Exceeded Notification */
  it('should add an expense transaction and trigger a budget alert', async () => {
    req.body.type = 'expense';
    Transaction.prototype.save = jest.fn().mockResolvedValue({ ...req.body, _id: 'transaction123' });

    Budget.findOne = jest.fn().mockResolvedValue({ _id: 'budget123', user: 'user123', category: 'Food', amount: 50 });

    await addTransaction(req, res);

    expect(Transaction.prototype.save).toHaveBeenCalled();
    expect(Budget.findOne).toHaveBeenCalledWith({ user: 'user123', category: 'Food' });
    expect(createNotification).toHaveBeenCalledWith('user123', 'You exceeded your Food budget!', 'Spending Alert');
    expect(res.status).toHaveBeenCalledWith(201);
  });

  /** ✅ Test: Update Transaction */
  it('should update an existing transaction', async () => {
    Transaction.findById = jest.fn().mockResolvedValue({ _id: 'transaction123', user: 'user123', save: jest.fn() });

    await updateTransaction(req, res);

    expect(Transaction.findById).toHaveBeenCalledWith('transaction123');
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ _id: 'transaction123' }));
  });

  /** ✅ Test: Delete Transaction */
  it('should delete a transaction', async () => {
    Transaction.findById = jest.fn().mockResolvedValue({ _id: 'transaction123', user: 'user123', deleteOne: jest.fn() });

    await deleteTransaction(req, res);

    expect(Transaction.findById).toHaveBeenCalledWith('transaction123');
    expect(res.json).toHaveBeenCalledWith({ message: 'Transaction deleted successfully' });
  });
});

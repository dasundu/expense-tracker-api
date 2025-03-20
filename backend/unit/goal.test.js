const { getGoals, updateGoal, deleteGoal, checkGoalReminders } = require('../controllers/goalController');
const Goal = require('../models/Goal');
const { createNotification } = require('../controllers/notificationController');

jest.mock('../models/Goal');
jest.mock('../controllers/notificationController');

describe('Goal Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { _id: 'user123' },
      body: { title: 'Save for a car', targetAmount: 10000, deadline: '2025-12-31', autoAllocate: true },
      params: { id: 'goal123' }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /** ✅ Test: Get Goals */
  it('should get all goals for the user', async () => {
    Goal.find = jest.fn().mockResolvedValue([{ _id: 'goal123', user: 'user123', title: 'Save for a car' }]);

    await getGoals(req, res);

    expect(Goal.find).toHaveBeenCalledWith({ user: 'user123' });
    expect(res.json).toHaveBeenCalledWith([{ _id: 'goal123', user: 'user123', title: 'Save for a car' }]);
  });

  /** ✅ Test: Update Goal */
  it('should update an existing goal', async () => {
    Goal.findById = jest.fn().mockResolvedValue({ _id: 'goal123', user: 'user123', save: jest.fn() });

    await updateGoal(req, res);

    expect(Goal.findById).toHaveBeenCalledWith('goal123');
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ _id: 'goal123' }));
  });

  /** ✅ Test: Delete Goal */
  it('should delete a goal', async () => {
    Goal.findById = jest.fn().mockResolvedValue({ _id: 'goal123', user: 'user123', deleteOne: jest.fn() });

    await deleteGoal(req, res);

    expect(Goal.findById).toHaveBeenCalledWith('goal123');
    expect(res.json).toHaveBeenCalledWith({ message: 'Goal deleted successfully' });
  });

  /** ✅ Test: Goal Reminder - Approaching Deadline */
  it('should send a reminder notification for goals approaching the deadline', async () => {
    const mockDate = new Date('2025-12-30'); // Simulate the deadline being tomorrow
    const goal = { _id: 'goal123', user: 'user123', title: 'Save for a car', deadline: '2025-12-31', isAchieved: false };

    // Mock current date
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    Goal.find = jest.fn().mockResolvedValue([goal]);

    // Use jest.spyOn to mock createNotification correctly
    jest.spyOn(require('../controllers/notificationController'), 'createNotification').mockImplementation(jest.fn());

    await checkGoalReminders();

    expect(Goal.find).toHaveBeenCalled();
    expect(createNotification).toHaveBeenCalledWith('user123', 'Reminder: You\'re approaching your goal deadline for "Save for a car"!', 'Goal Reminder');
  });
});

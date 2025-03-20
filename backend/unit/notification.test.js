// unit/notificationController.test.js
const mongoose = require('mongoose');
const { createNotification, getNotifications, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } = require('../controllers/notificationController');
const Notification = require('../models/Notification');

// Mocking the Notification model methods
jest.mock('../models/Notification');

describe('Notification Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { _id: 'user123' },
      params: { id: 'notification123' },
      body: { message: 'Test notification', type: 'info' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  /** ✅ Test: Create a notification */
  it('should create a notification', async () => {
    const notification = { user: req.user._id, message: 'Test notification', type: 'info', save: jest.fn().mockResolvedValue(true) };
    Notification.mockImplementationOnce(() => notification);

    const createdNotification = await createNotification(req.user._id, req.body.message, req.body.type);

    expect(Notification).toHaveBeenCalledWith({ user: req.user._id, message: req.body.message, type: req.body.type });
    expect(createdNotification).toEqual(notification);
  });

  /** ✅ Test: Mark all notifications as read */
  it('should mark all notifications as read', async () => {
    Notification.updateMany.mockResolvedValue({ nModified: 3 });

    await markAllAsRead(req, res);

    expect(Notification.updateMany).toHaveBeenCalledWith({ user: req.user._id, isRead: false }, { $set: { isRead: true } });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'All notifications marked as read' });
  });

  /** ✅ Test: Delete all notifications */
  it('should delete all notifications', async () => {
    Notification.deleteMany.mockResolvedValue({ n: 5 });

    await deleteAllNotifications(req, res);

    expect(Notification.deleteMany).toHaveBeenCalledWith({ user: req.user._id });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'All notifications deleted successfully' });
  });

  /** ✅ Test: Error while creating a notification */
  it('should handle error while creating a notification', async () => {
    Notification.mockImplementationOnce(() => {
      throw new Error('Error creating notification');
    });

    try {
      await createNotification(req.user._id, req.body.message, req.body.type);
    } catch (error) {
      expect(error.message).toBe('Error creating notification');
    }
  });
});

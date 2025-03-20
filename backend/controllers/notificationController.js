const mongoose = require('mongoose');
const Notification = require('../models/Notification');

// Create a new notification
const createNotification = async (userId, message, type) => {
  try {
    const notification = new Notification({ user: userId, message, type });
    await notification.save();
    console.log('Notification created:', message);
    return notification;  // Returning the notification for possible use in routes
  } catch (error) {
    console.error('Error creating notification:', error.message || error);
    throw error;  // Rethrow error to be handled by the controller
  }
};

// Get all notifications for a user
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message || 'Unknown error' });
  }
};

// Mark a single notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid notification ID' });
    }

    const notification = await Notification.findById(id);
    if (!notification || notification.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Notification not found or access denied' });
    }

    notification.isRead = true;
    await notification.save();
    res.status(200).json({ message: 'Notification marked as read', notification });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read', error: error.message || 'Unknown error' });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { $set: { isRead: true } });
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking all notifications as read', error: error.message || 'Unknown error' });
  }
};

// Delete a single notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid notification ID' });
    }

    const notification = await Notification.findById(id);
    if (!notification || notification.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Notification not found or access denied' });
    }

    await notification.deleteOne();
    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification', error: error.message || 'Unknown error' });
  }
};

// Delete all notifications for a user
const deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id });
    res.status(200).json({ message: 'All notifications deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting all notifications', error: error.message || 'Unknown error' });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
};

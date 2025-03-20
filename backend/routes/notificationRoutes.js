const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification,
  deleteAllNotifications
   // ✅ Import createNotification here!
} = require('../controllers/notificationController');

// Add this route to create a new notification
router.post('/', protect, async (req, res) => {
  try {
    const { message, type } = req.body;
    if (!message || !type) {
      return res.status(400).json({ message: "Message and type are required" });
    }
    
    const notification = await createNotification(req.user._id, message, type);
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Error creating notification", error: error.message });
  }
});
// Get all notifications for the logged-in user
router.get('/', protect, getNotifications);

// Mark a single notification as read
router.patch('/:id/read', protect, markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', protect, markAllAsRead); // Optional if you want a "mark all as read" feature

// Delete a single notification
router.delete('/:id', protect, deleteNotification);

// Delete all notifications
router.delete('/', protect, deleteAllNotifications);

module.exports = router;

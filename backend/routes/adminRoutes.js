const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getAllUsers,
  deleteUser,
  getAllTransactions,
  deleteTransaction,
  getAdminDashboard,
} = require('../controllers/adminController');

router.get('/users', protect, authorize('Admin'), getAllUsers);
router.delete('/users/:id', protect, authorize('Admin'), deleteUser);
router.get('/transactions', protect, authorize('Admin'), getAllTransactions);
router.delete('/transactions/:id', protect, authorize('Admin'), deleteTransaction);
router.get('/dashboard', protect, authorize('Admin'), getAdminDashboard);

module.exports = router;

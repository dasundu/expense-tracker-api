const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');

// Routes for managing transactions
router.post('/', protect, addTransaction); // Add a new transaction
router.get('/', protect, getTransactions); // Get all user's transactions
router.put('/:id', protect, updateTransaction); // Update a transaction by ID
router.delete('/:id', protect, deleteTransaction); // Delete a transaction by ID

module.exports = router;

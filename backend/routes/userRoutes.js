const express = require('express');
const router = express.Router();
const { protect , logout ,authorize } = require('../middleware/authMiddleware');
const { registerUser, loginUser ,getUserProfile  } = require('../controllers/userController');
const {
    addTransaction,
    getUserTransactions,
  } = require('../controllers/transactionController');
  const {
    setBudget,
    getUserBudgets,
  } = require('../controllers/budgetController');
  

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', protect, logout);

router.get('/profile', protect, (req, res) => {
  res.json(req.user);
});


module.exports = router;

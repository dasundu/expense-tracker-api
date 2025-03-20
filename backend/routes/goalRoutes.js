const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  addGoal,
  getGoals,
  updateGoal,
  deleteGoal,
} = require('../controllers/goalController');

// Protect all routes to require login
router.route('/').post(protect, addGoal).get(protect, getGoals);
router.route('/:id').put(protect, updateGoal).delete(protect, deleteGoal);

module.exports = router;

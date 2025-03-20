const express = require('express');
const router = express.Router();
const {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
  checkBudgetStatus,
  suggestBudgetAdjustment,
} = require('../controllers/budgetController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all routes — only logged-in users can access
router.use(protect);

router.route('/')
  .post(createBudget) // Add new budget
  .get(getBudgets); // View user's budgets

router.route('/:id')
  .put(updateBudget) // Update specific budget
  .delete(deleteBudget); // Delete budget

// Additional functionalities
router.get('/status', checkBudgetStatus); // Check if nearing/exceeding budget
router.get('/adjustments', suggestBudgetAdjustment); // Budget suggestions

module.exports = router;

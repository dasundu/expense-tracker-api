const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getUserDashboard } = require('../controllers/userDashboardController');

router.get('/dashboard', protect, getUserDashboard);

module.exports = router;

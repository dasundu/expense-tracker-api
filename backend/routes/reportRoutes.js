const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { generateReport } = require('../controllers/reportController');

router.get('/', protect, generateReport); // Generate financial report

module.exports = router;

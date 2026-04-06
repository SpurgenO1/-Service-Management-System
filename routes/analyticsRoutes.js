const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/roleMiddleware');
const analyticsController = require('../controllers/analyticsController');

router.get('/requests-per-day', requireAuth, analyticsController.requestsPerDay);
router.get('/status-count', requireAuth, analyticsController.statusCount);
router.get('/summary', requireAuth, analyticsController.summary);

module.exports = router;

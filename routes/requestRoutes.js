const express = require('express');
const router = express.Router();
const { createRequest, getMyRequests, submitFeedback } = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

router.route('/requests')
  .post(protect(['client']), createRequest)
  .get(protect(['client']), getMyRequests);

router.post('/feedback', protect(['client']), submitFeedback);

module.exports = router;

const express = require('express');
const router = express.Router();
const { createRequest, getMyRequests, submitFeedback } = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const { createRequestRules, feedbackRules } = require('../validators/requestValidators');

router
  .route('/requests')
  .post(protect(['client']), createRequestRules, validateRequest, createRequest)
  .get(protect(['client']), getMyRequests);

router.post('/feedback', protect(['client']), feedbackRules, validateRequest, submitFeedback);

module.exports = router;

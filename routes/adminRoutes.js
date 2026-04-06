const express = require('express');
const router = express.Router();
const { getAllRequests, updateRequestByAdmin, getStaff } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const {
  adminUpdateRequestRules,
  adminListQueryRules,
} = require('../validators/requestValidators');

router.get('/requests', protect(['admin']), adminListQueryRules, validateRequest, getAllRequests);
router.put(
  '/requests/:id',
  protect(['admin']),
  adminUpdateRequestRules,
  validateRequest,
  updateRequestByAdmin
);
router.get('/staff', protect(['admin']), getStaff);

module.exports = router;

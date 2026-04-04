const express = require('express');
const router = express.Router();
const { getAllRequests, updateRequestByAdmin, getStaff } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

router.get('/requests', protect(['admin']), getAllRequests);
router.put('/requests/:id', protect(['admin']), updateRequestByAdmin);
router.get('/staff', protect(['admin']), getStaff);

module.exports = router;

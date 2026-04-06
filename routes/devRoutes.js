const express = require('express');
const router = express.Router();
const { getAssignedTasks, updateTaskStatus } = require('../controllers/devController');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const { devStatusRules } = require('../validators/requestValidators');

router.get('/tasks', protect(['developer']), getAssignedTasks);
router.put('/tasks/:id/status', protect(['developer']), devStatusRules, validateRequest, updateTaskStatus);

module.exports = router;

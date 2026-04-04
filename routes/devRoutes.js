const express = require('express');
const router = express.Router();
const { getAssignedTasks, updateTaskStatus } = require('../controllers/devController');
const { protect } = require('../middleware/authMiddleware');

router.get('/tasks', protect(['developer']), getAssignedTasks);
router.put('/tasks/:id/status', protect(['developer']), updateTaskStatus);

module.exports = router;

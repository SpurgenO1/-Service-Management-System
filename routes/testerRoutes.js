const express = require('express');
const router = express.Router();
const { getTesterTasks, verifyTask, reportBug } = require('../controllers/testerController');
const { protect } = require('../middleware/authMiddleware');

router.get('/tasks', protect(['tester']), getTesterTasks);
router.put('/tasks/:id/verify', protect(['tester']), verifyTask);
router.put('/tasks/:id/bug', protect(['tester']), reportBug);

module.exports = router;

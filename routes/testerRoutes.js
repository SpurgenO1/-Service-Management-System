const express = require('express');
const router = express.Router();
const { getTesterTasks, verifyTask, reportBug } = require('../controllers/testerController');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const { testerTaskIdRules, reportBugRules } = require('../validators/requestValidators');

router.get('/tasks', protect(['tester']), getTesterTasks);
router.put('/tasks/:id/verify', protect(['tester']), testerTaskIdRules, validateRequest, verifyTask);
router.put('/tasks/:id/bug', protect(['tester']), reportBugRules, validateRequest, reportBug);

module.exports = router;

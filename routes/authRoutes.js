const express = require('express');
const router = express.Router();
const {
  registerUser,
  authUser,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
} = require('../validators/authValidators');
const { validateRequest } = require('../middleware/validateRequest');
const {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
} = require('../middleware/rateLimiters');

router.post('/register', registerLimiter, registerRules, validateRequest, registerUser);
router.post('/login', loginLimiter, loginRules, validateRequest, authUser);
router.post('/forgot-password', forgotPasswordLimiter, forgotPasswordRules, validateRequest, forgotPassword);
router.post('/reset-password', forgotPasswordLimiter, resetPasswordRules, validateRequest, resetPassword);

module.exports = router;

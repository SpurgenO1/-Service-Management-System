/**
 * Core REST API (mounted at app root, before static files).
 *
 * Auth: POST /register, POST /login
 * Tickets: /request, /requests, /request/:id, upload, messages
 */
const express = require('express');
const router = express.Router();
const {
  requireAuth,
  requireAdmin,
  requireClient,
} = require('../middleware/roleMiddleware');
const { registerUser, authUser } = require('../controllers/authController');
const ticketController = require('../controllers/ticketController');
const chatController = require('../controllers/chatController');
const { registerRules, loginRules } = require('../validators/authValidators');
const { validateRequest } = require('../middleware/validateRequest');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiters');
const { uploadSingle } = require('../middleware/uploadTicketFile');

router.post('/register', registerLimiter, registerRules, validateRequest, registerUser);
router.post('/login', loginLimiter, loginRules, validateRequest, authUser);

router.post('/request', requireClient, ticketController.createTicket);
router.get('/requests', requireAuth, ticketController.getRequests);

/** More specific routes first */
router.get('/request/:id/messages', requireAuth, chatController.getMessages);
router.post(
  '/request/:id/upload',
  requireAuth,
  (req, res, next) => {
    uploadSingle(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message || 'Upload failed' });
      }
      next();
    });
  },
  ticketController.addAttachment
);
router.get('/request/:id', requireAuth, ticketController.getRequestById);
router.put('/request/:id', requireAuth, ticketController.updateRequest);
router.delete('/request/:id', requireAdmin, ticketController.deleteRequest);

module.exports = router;

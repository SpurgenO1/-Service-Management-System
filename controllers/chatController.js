const ChatMessage = require('../models/ChatMessage');
const Ticket = require('../models/Ticket');
const { canAccessTicket } = require('../utils/ticketAccess');

/**
 * GET /request/:id/messages — paginated chat history
 */
exports.getMessages = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    if (!canAccessTicket(req.user, ticket)) {
      return res.status(403).json({ message: 'No access to this ticket' });
    }

    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const messages = await ChatMessage.find({ ticket: ticket._id })
      .populate('sender', 'name email role')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

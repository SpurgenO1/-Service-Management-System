const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const { getTicketInsights } = require('../services/openaiTicketInsight');
const { canAccessTicket } = require('../utils/ticketAccess');
const { notifyStatusChangeIfNeeded } = require('../utils/ticketEmail');
const { getIo } = require('../socket');

function emitTicketStatus(ticketId, previousStatus, newStatus) {
  const io = getIo();
  if (io) {
    io.to(`ticket:${ticketId}`).emit('ticket:status', {
      ticketId,
      previousStatus,
      status: newStatus,
    });
  }
}

/**
 * POST /request — only clients may create tickets.
 * Optionally calls OpenAI and stores aiInsights on the ticket.
 */
exports.createTicket = async (req, res) => {
  try {
    const { title, description, priority, deadline } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const insights = await getTicketInsights(String(title).trim(), String(description));

    const ticket = await Ticket.create({
      title: String(title).trim(),
      description: String(description),
      priority: priority || 'Medium',
      deadline: deadline ? new Date(deadline) : null,
      createdBy: req.user.id,
      status: 'Open',
      aiInsights: insights
        ? { possibleCause: insights.possibleCause, suggestedFix: insights.suggestedFix }
        : undefined,
    });

    const populated = await Ticket.findById(ticket._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email role');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /request/:id — single ticket (chat / detail page).
 */
exports.getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ticket id' });
    }
    const ticket = await Ticket.findById(id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role');
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    if (!canAccessTicket(req.user, ticket)) {
      return res.status(403).json({ message: 'No access to this ticket' });
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /request/:id/upload — Multer field name: "file"
 */
exports.addAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ticket id' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded (use field name "file")' });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    if (!canAccessTicket(req.user, ticket)) {
      return res.status(403).json({ message: 'No access to this ticket' });
    }

    const url = `/uploads/tickets/${req.file.filename}`;
    ticket.attachments.push({
      url,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
    });
    await ticket.save();

    const attachment = ticket.attachments[ticket.attachments.length - 1];
    getIo()?.to(`ticket:${id}`).emit('ticket:attachment', {
      ticketId: id,
      attachment,
    });

    const populated = await Ticket.findById(ticket._id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    let filter = {};

    if (role === 'client') {
      filter.createdBy = userId;
    } else if (role === 'developer') {
      filter.assignedTo = userId;
    } else if (role === 'tester') {
      filter.status = { $in: ['In Progress', 'Testing'] };
    } else if (role === 'admin') {
      filter = {};
    } else {
      return res.status(403).json({ message: 'Unknown role' });
    }

    const tickets = await Ticket.find(filter)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ticket id' });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const previousStatus = ticket.status;
    const { role, id: userId } = req.user;
    const body = req.body;

    if (role === 'admin') {
      if (body.title !== undefined) ticket.title = String(body.title).trim();
      if (body.description !== undefined) ticket.description = String(body.description);
      if (body.priority !== undefined) ticket.priority = body.priority;
      if (body.deadline !== undefined) {
        ticket.deadline = body.deadline ? new Date(body.deadline) : null;
      }
      if (body.status !== undefined) ticket.status = body.status;
      if (body.assignedTo !== undefined) {
        ticket.assignedTo = body.assignedTo || null;
      }
      await ticket.save();
    } else if (role === 'developer') {
      if (body.status !== 'In Progress') {
        return res.status(403).json({
          message: 'Developers may only set status to "In Progress".',
        });
      }
      if (!ticket.assignedTo || ticket.assignedTo.toString() !== userId) {
        return res.status(403).json({
          message: 'This ticket is not assigned to you.',
        });
      }
      ticket.status = 'In Progress';
      await ticket.save();
    } else if (role === 'tester') {
      if (body.status !== 'Testing') {
        return res.status(403).json({
          message: 'Testers may only set status to "Testing".',
        });
      }
      if (ticket.status !== 'In Progress') {
        return res.status(400).json({
          message: 'Ticket must be In Progress before moving to Testing.',
        });
      }
      ticket.status = 'Testing';
      await ticket.save();
    } else {
      return res.status(403).json({ message: 'You cannot update tickets.' });
    }

    if (previousStatus !== ticket.status) {
      await notifyStatusChangeIfNeeded(ticket, previousStatus);
      emitTicketStatus(id, previousStatus, ticket.status);
    }

    const populated = await Ticket.findById(ticket._id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ticket id' });
    }

    const ticket = await Ticket.findByIdAndDelete(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json({ message: 'Ticket deleted', id: ticket._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const jwt = require('jsonwebtoken');
const ChatMessage = require('../models/ChatMessage');
const Ticket = require('../models/Ticket');
const { canAccessTicket } = require('../utils/ticketAccess');

let ioInstance = null;

function getIo() {
  return ioInstance;
}

function setIo(io) {
  ioInstance = io;
}

function initSocket(httpServer) {
  const { Server } = require('socket.io');
  const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    process.env.PUBLIC_APP_URL,
  ].filter(Boolean);

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Unauthorized'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('join-ticket', async (ticketId, cb) => {
      try {
        const ticket = await Ticket.findById(ticketId);
        if (!ticket || !canAccessTicket(socket.user, ticket)) {
          if (typeof cb === 'function') cb({ ok: false, error: 'No access' });
          return;
        }
        socket.join(`ticket:${ticketId}`);
        if (typeof cb === 'function') cb({ ok: true });
      } catch (e) {
        if (typeof cb === 'function') cb({ ok: false, error: e.message });
      }
    });

    socket.on('leave-ticket', (ticketId) => {
      socket.leave(`ticket:${ticketId}`);
    });

    socket.on('chat:message', async ({ ticketId, message }, cb) => {
      try {
        const text = String(message || '').trim();
        if (!ticketId || !text) {
          if (typeof cb === 'function') cb({ ok: false, error: 'Invalid message' });
          return;
        }

        const ticket = await Ticket.findById(ticketId);
        if (!ticket || !canAccessTicket(socket.user, ticket)) {
          if (typeof cb === 'function') cb({ ok: false, error: 'No access' });
          return;
        }

        const doc = await ChatMessage.create({
          ticket: ticketId,
          sender: socket.user.id,
          message: text,
        });
        const populated = await ChatMessage.findById(doc._id).populate(
          'sender',
          'name email role'
        );
        const payload = populated.toObject();
        io.to(`ticket:${ticketId}`).emit('chat:message', payload);
        if (typeof cb === 'function') cb({ ok: true, message: payload });
      } catch (e) {
        if (typeof cb === 'function') cb({ ok: false, error: e.message });
      }
    });
  });

  setIo(io);
  return io;
}

module.exports = { initSocket, getIo, setIo };

const mongoose = require('mongoose');

/**
 * Returns true if this JWT user may read/write a ticket (chat, uploads, GET one).
 * `user` = { id, role } from JWT payload.
 */
function canAccessTicket(user, ticket) {
  if (!user || !ticket) return false;
  const uid = user.id?.toString();
  const role = user.role;

  if (role === 'admin') return true;
  if (ticket.createdBy?.toString() === uid) return true;
  if (ticket.assignedTo && ticket.assignedTo.toString() === uid) return true;
  if (role === 'tester' && ['In Progress', 'Testing'].includes(ticket.status)) {
    return true;
  }
  return false;
}

/** Same visibility rules as GET /requests — used for analytics $match */
function ticketQueryFilterForRole(user) {
  const { role, id } = user;
  if (role === 'admin') return {};
  if (role === 'client') return { createdBy: new mongoose.Types.ObjectId(id) };
  if (role === 'developer') return { assignedTo: new mongoose.Types.ObjectId(id) };
  if (role === 'tester') {
    return { status: { $in: ['In Progress', 'Testing'] } };
  }
  return { _id: { $exists: false } };
}

module.exports = { canAccessTicket, ticketQueryFilterForRole };

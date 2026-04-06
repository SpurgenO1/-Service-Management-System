const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { ticketQueryFilterForRole } = require('../utils/ticketAccess');

/**
 * GET /analytics/requests-per-day?days=14
 * Counts tickets created per calendar day (scoped to what the user may see).
 */
exports.requestsPerDay = async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 14, 1), 90);
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const match = {
      ...ticketQueryFilterForRole(req.user),
      createdAt: { $gte: since },
    };

    const rows = await Ticket.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(rows.map((r) => ({ date: r._id, count: r.count })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /analytics/status-count
 * How many tickets per status (scoped to user visibility).
 */
exports.statusCount = async (req, res) => {
  try {
    const match = ticketQueryFilterForRole(req.user);
    const rows = await Ticket.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const out = {};
    for (const r of rows) {
      out[r._id] = r.count;
    }
    res.json(out);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /analytics/summary — optional helper for dashboard KPI cards
 */
exports.summary = async (req, res) => {
  try {
    const match = ticketQueryFilterForRole(req.user);
    const [statusRows, totalAgg, devCount] = await Promise.all([
      Ticket.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Ticket.aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: 1 } } }]),
      req.user.role === 'admin'
        ? User.countDocuments({ role: 'developer' })
        : Promise.resolve(null),
    ]);

    const byStatus = {};
    for (const r of statusRows) {
      byStatus[r._id] = r.count;
    }
    const total = totalAgg[0]?.total || 0;
    const completed = byStatus.Completed || 0;
    const pending =
      (byStatus.Open || 0) + (byStatus['In Progress'] || 0) + (byStatus.Testing || 0);

    res.json({
      totalRequests: total,
      completedTasks: completed,
      pendingTasks: pending,
      activeDevelopers: devCount,
      byStatus,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');

exports.getAllRequests = async (req, res) => {
  try {
    const { status, priority, sort = 'createdAt', order = 'desc' } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const sortField = ['createdAt', 'priority', 'status'].includes(sort) ? sort : 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    const requests = await ServiceRequest.find(filter)
      .populate('client', 'name email')
      .populate('assignedDev', 'name email')
      .populate('assignedTester', 'name email')
      .sort({ [sortField]: sortOrder });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRequestByAdmin = async (req, res) => {
  try {
    const { status, assignedDev, assignedTester, priority, slaDeadline } = req.body;
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (status !== undefined) request.status = status;
    if (assignedDev !== undefined) request.assignedDev = assignedDev || null;
    if (assignedTester !== undefined) request.assignedTester = assignedTester || null;
    if (priority !== undefined) request.priority = priority;
    if (slaDeadline !== undefined) request.slaDeadline = slaDeadline || null;

    // Default status logic based on assignment
    if (assignedDev && request.status === 'Pending Approval') {
      request.status = 'Assigned';
    }

    const updatedRequest = await request.save();
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ['developer', 'tester'] } }).select('-password');
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

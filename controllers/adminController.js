const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({})
      .populate('client', 'name email')
      .populate('assignedDev', 'name email')
      .populate('assignedTester', 'name email')
      .sort({ createdAt: -1 });
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

    if (status) request.status = status;
    if (assignedDev) request.assignedDev = assignedDev;
    if (assignedTester) request.assignedTester = assignedTester;
    if (priority) request.priority = priority;
    if (slaDeadline) request.slaDeadline = slaDeadline;

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

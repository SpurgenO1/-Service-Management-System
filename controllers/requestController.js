const ServiceRequest = require('../models/ServiceRequest');
const Feedback = require('../models/Feedback');

// @desc    Create a service request
// @route   POST /api/client/requests
// @access  Private/Client
exports.createRequest = async (req, res) => {
  const { serviceType, description, priority } = req.body;
  try {
    const request = new ServiceRequest({
      client: req.user.id,
      serviceType,
      description,
      priority,
    });
    const createdRequest = await request.save();
    res.status(201).json(createdRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all requests for logged in client
// @route   GET /api/client/requests
// @access  Private/Client
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ client: req.user.id })
      .populate('assignedDev', 'name email')
      .populate('assignedTester', 'name email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit feedback for a completed request
// @route   POST /api/client/feedback
// @access  Private/Client
exports.submitFeedback = async (req, res) => {
  const { serviceRequestId, rating, comments } = req.body;
  try {
    // Check if request belongs to client and is completed
    const request = await ServiceRequest.findOne({ _id: serviceRequestId, client: req.user.id });
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'Completed') return res.status(400).json({ message: 'Request must be completed to leave feedback' });

    const feedback = new Feedback({
      client: req.user.id,
      serviceRequest: serviceRequestId,
      rating,
      comments
    });

    const createdFeedback = await feedback.save();
    res.status(201).json(createdFeedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

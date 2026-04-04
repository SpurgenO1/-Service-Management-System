const ServiceRequest = require('../models/ServiceRequest');

exports.getAssignedTasks = async (req, res) => {
  try {
    const tasks = await ServiceRequest.find({ assignedDev: req.user.id })
      .populate('client', 'name email')
      .populate('assignedTester', 'name email')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { devStatus } = req.body;
    const request = await ServiceRequest.findOne({ _id: req.params.id, assignedDev: req.user.id });

    if (!request) return res.status(404).json({ message: 'Task not found or not assigned to you' });

    request.devStatus = devStatus;
    
    if (devStatus === 'In Progress') {
      request.status = 'In Development';
    } else if (devStatus === 'Completed') {
      request.status = 'In Testing';
    }

    const updatedRequest = await request.save();
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

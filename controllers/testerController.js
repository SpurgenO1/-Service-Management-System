const ServiceRequest = require('../models/ServiceRequest');

exports.getTesterTasks = async (req, res) => {
  try {
    // Tester sees tasks assigned to them where Dev has completed it
    const tasks = await ServiceRequest.find({ 
      assignedTester: req.user.id,
      devStatus: 'Completed'
    })
      .populate('client', 'name email')
      .populate('assignedDev', 'name email')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyTask = async (req, res) => {
  try {
    const request = await ServiceRequest.findOne({ _id: req.params.id, assignedTester: req.user.id });
    if (!request) return res.status(404).json({ message: 'Task not found or not assigned to you' });

    request.testerStatus = 'Verified';
    request.status = 'Ready for Delivery';
    // Optionally: Mark as Completed right away if no further manual Delivery state is needed
    // request.status = 'Completed'; 
    request.bugsReported = '';

    const updatedRequest = await request.save();
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.reportBug = async (req, res) => {
  try {
    const { bugsReported } = req.body;
    const request = await ServiceRequest.findOne({ _id: req.params.id, assignedTester: req.user.id });
    if (!request) return res.status(404).json({ message: 'Task not found or not assigned to you' });

    request.testerStatus = 'Bugs Found';
    request.devStatus = 'In Progress'; // send back to dev
    request.status = 'In Development';
    request.bugsReported = bugsReported;

    const updatedRequest = await request.save();
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

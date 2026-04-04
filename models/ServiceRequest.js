const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  serviceType: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Pending Approval', 'Assigned', 'In Development', 'In Testing', 'Ready for Delivery', 'Completed', 'Rejected'],
    default: 'Pending Approval',
  },
  assignedDev: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  assignedTester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  devStatus: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started',
  },
  testerStatus: {
    type: String,
    enum: ['Pending', 'Bugs Found', 'Verified'],
    default: 'Pending',
  },
  bugsReported: {
    type: String,
    default: null,
  },
  slaDeadline: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);

const mongoose = require('mongoose');

/**
 * Ticket (service request) for the core REST API (/request, /requests).
 * Separate from ServiceRequest used by the legacy /api/client HTML dashboards.
 */
const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Testing', 'Completed'],
      default: 'Open',
    },
    /** Client who opened the ticket */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    /** Staff member working the ticket (set by admin) */
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    deadline: {
      type: Date,
      default: null,
    },
    /** Files uploaded via Multer — URLs are served from /uploads/... */
    attachments: [
      {
        url: { type: String, required: true },
        originalName: String,
        mimeType: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    /** Optional OpenAI hints when creating the ticket */
    aiInsights: {
      possibleCause: { type: String, default: null },
      suggestedFix: { type: String, default: null },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ticket', ticketSchema);

const { body, param, query } = require('express-validator');

const SERVICE_PRIORITIES = ['Low', 'Medium', 'High'];
const REQUEST_STATUSES = [
  'Pending Approval',
  'Assigned',
  'In Development',
  'In Testing',
  'Ready for Delivery',
  'Completed',
  'Rejected',
];

const createRequestRules = [
  body('serviceType').trim().notEmpty().withMessage('Service type is required').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 10000 }),
  body('priority').optional().isIn(SERVICE_PRIORITIES).withMessage('Invalid priority'),
];

const feedbackRules = [
  body('serviceRequestId').trim().notEmpty().withMessage('serviceRequestId is required').isMongoId().withMessage('Invalid request id'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1–5'),
  body('comments').optional().trim().isLength({ max: 5000 }),
];

const adminUpdateRequestRules = [
  param('id').isMongoId().withMessage('Invalid request id'),
  body('status').optional().isIn(REQUEST_STATUSES).withMessage('Invalid status'),
  body('assignedDev').optional({ nullable: true }).isMongoId().withMessage('Invalid developer id'),
  body('assignedTester').optional({ nullable: true }).isMongoId().withMessage('Invalid tester id'),
  body('priority').optional().isIn(SERVICE_PRIORITIES).withMessage('Invalid priority'),
  body('slaDeadline')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === undefined || value === '') return true;
      const d = new Date(value);
      return !Number.isNaN(d.getTime());
    })
    .withMessage('Invalid slaDeadline'),
];

const adminListQueryRules = [
  query('status').optional().isIn(REQUEST_STATUSES).withMessage('Invalid status filter'),
  query('priority').optional().isIn(SERVICE_PRIORITIES).withMessage('Invalid priority filter'),
  query('sort').optional().isIn(['createdAt', 'priority', 'status']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('order must be asc or desc'),
];

const devStatusRules = [
  param('id').isMongoId().withMessage('Invalid task id'),
  body('devStatus').notEmpty().isIn(['Not Started', 'In Progress', 'Completed']).withMessage('Invalid devStatus'),
];

const testerTaskIdRules = [param('id').isMongoId().withMessage('Invalid task id')];

const reportBugRules = [
  param('id').isMongoId().withMessage('Invalid task id'),
  body('bugsReported').trim().notEmpty().withMessage('Bug description is required').isLength({ max: 10000 }),
];

module.exports = {
  createRequestRules,
  feedbackRules,
  adminUpdateRequestRules,
  adminListQueryRules,
  devStatusRules,
  testerTaskIdRules,
  reportBugRules,
  SERVICE_PRIORITIES,
  REQUEST_STATUSES,
};

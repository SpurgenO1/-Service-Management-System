/**
 * Role-based route guards (JWT must be valid first).
 * Built on top of `protect` in authMiddleware.js.
 */
const { protect } = require('./authMiddleware');

/** Any logged-in user */
const requireAuth = protect([]);

const requireAdmin = protect(['admin']);
const requireClient = protect(['client']);
const requireDeveloper = protect(['developer']);
const requireTester = protect(['tester']);

/** Admin or staff (not clients) — useful for internal-only routes later */
const requireStaff = protect(['admin', 'developer', 'tester']);

module.exports = {
  requireAuth,
  requireAdmin,
  requireClient,
  requireDeveloper,
  requireTester,
  requireStaff,
};

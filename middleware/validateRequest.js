const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array({ onlyFirstError: true })[0];
    return res.status(400).json({
      message: first.msg,
      errors: errors.array(),
    });
  }
  next();
};

module.exports = { validateRequest };

const crypto = require('crypto');
const User = require('../models/User');
// bcryptjs: same API as bcrypt, hashes passwords without native C++ build (beginner-friendly on Windows/Mac).
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendPasswordResetEmail } = require('../utils/email');

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;
const RESET_TOKEN_MS = 60 * 60 * 1000;

const generateToken = (id, role, name) => {
  return jwt.sign({ id, role, name }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'client',
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role, user.name),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.authUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({
        message: 'Account is temporarily locked due to failed login attempts. Try again later.',
      });
    }

    if (user.lockUntil && user.lockUntil <= Date.now()) {
      user.failedLoginAttempts = 0;
      user.lockUntil = null;
    }

    const match = await bcrypt.compare(password, user.password);
    if (match) {
      user.failedLoginAttempts = 0;
      user.lockUntil = null;
      await user.save();
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role, user.name),
      });
    }

    const prev = user.failedLoginAttempts || 0;
    user.failedLoginAttempts = prev + 1;
    if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_MS);
    }
    await user.save();
    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const generic = {
    message: 'If that email is registered, you will receive password reset instructions shortly.',
  };

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json(generic);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = hashResetToken(resetToken);
    user.resetPasswordExpire = new Date(Date.now() + RESET_TOKEN_MS);
    await user.save();

    await sendPasswordResetEmail(user.email, resetToken);

    if (process.env.DEV_RETURN_RESET_TOKEN === 'true') {
      return res.json({
        ...generic,
        resetToken,
        devNote: 'DEV_RETURN_RESET_TOKEN is enabled — remove in production.',
      });
    }

    res.json(generic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    const hashed = hashResetToken(token);
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpire: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    res.json({ message: 'Password updated. You can sign in with your new password.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const User = require('../models/User');
const Score = require('../models/Score');
const { generateToken } = require('../middleware/auth');
const { validationResult } = require('express-validator');

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { firstName, lastName, email, password, country } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const user = await User.create({ firstName, lastName, email, password, country });

    // Create empty score record for the user
    await Score.create({ user: user._id, scores: [] });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
        selectedCharity: user.selectedCharity,
        charityContributionPercent: user.charityContributionPercent,
        country: user.country,
        handicap: user.handicap,
        totalWinnings: user.totalWinnings,
        drawsEntered: user.drawsEntered,
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const user = await User.findOne({ email }).select('+password').populate('selectedCharity', 'name logoUrl slug');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) return res.status(403).json({ error: 'Account has been deactivated' });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
        selectedCharity: user.selectedCharity,
        charityContributionPercent: user.charityContributionPercent,
        country: user.country,
        handicap: user.handicap,
        totalWinnings: user.totalWinnings,
        drawsEntered: user.drawsEntered,
        avatar: user.avatar,
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('selectedCharity', 'name logoUrl slug description');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user' });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  const { firstName, lastName, phone, country, handicap, avatar } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, phone, country, handicap, avatar },
      { new: true, runValidators: true }
    ).populate('selectedCharity', 'name logoUrl slug');

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: 'Profile update failed' });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Password change failed' });
  }
};

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../storage/jsonStore');
const otpService = require('../services/otpService');

const JWT_SECRET = process.env.JWT_SECRET || 'stocksense_jwt_secret_key_2026_super_secure';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
const signup = async (req, res, next) => {
  try {
    const { name, email, password, role = 'Warehouse Staff', warehouse = 'Main Warehouse', phone = '' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const users = store.get('users');
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, message: 'A user with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = store.insert('users', {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      warehouse,
      phone
    });

    const token = generateToken(newUser.id);
    const { password: _, ...userSafe } = newUser;

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: userSafe
    });
  } catch (error) {
    next(error);
  }
};


const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const users = store.get('users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
    }

    const token = generateToken(user.id);
    const { password: _, ...userSafe } = user;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userSafe
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
const getProfile = (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, warehouse, currentPassword, newPassword } = req.body;
    const user = store.findById('users', req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (warehouse) updates.warehouse = warehouse;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Please enter your current password to set a new password.' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
      }
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(newPassword, salt);
    }

    const updatedUser = store.update('users', user.id, updates);
    const { password: _, ...userSafe } = updatedUser;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userSafe
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request OTP for password reset
// @route   POST /api/auth/forgot-password
const forgotPassword = (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Please provide an email address.' });
  }

  const users = store.get('users');
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(404).json({ success: false, message: 'No registered user found with this email address.' });
  }

  const { otp, expiresAt } = otpService.generateOtp(email);

  res.json({
    success: true,
    message: `Password reset OTP has been generated. In this demo/development environment, your OTP is: ${otp}`,
    otp, // Returned for effortless demo testing
    email,
    expiresAt
  });
};

// @desc    Verify OTP code
// @route   POST /api/auth/verify-otp
const verifyOtp = (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Please provide both email and OTP.' });
  }

  const result = otpService.verifyOtp(email, otp);
  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json({
    success: true,
    message: 'OTP verified successfully. You may now reset your password.'
  });
};

// @desc    Reset password after OTP verification
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword, otp } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email and new password are required.' });
    }

    // Double check OTP
    if (otp) {
      const verifyCheck = otpService.verifyOtp(email, otp);
      if (!verifyCheck.success) {
        return res.status(400).json(verifyCheck);
      }
    } else if (!otpService.isOtpVerified(email)) {
      return res.status(400).json({ success: false, message: 'OTP has not been verified for this email.' });
    }

    const users = store.get('users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    store.update('users', user.id, { password: hashedPassword });
    otpService.clearOtp(email);

    res.json({
      success: true,
      message: 'Password has been successfully reset. You can now login with your new credentials.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  verifyOtp,
  resetPassword
};

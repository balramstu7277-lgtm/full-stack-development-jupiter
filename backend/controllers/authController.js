const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');
const { validationResult } = require('express-validator');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });
    const { name, email, password, phone, class: cls, batch } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email, password, phone, class: cls, batch: batch || '' });
    const token = generateToken(user._id);
    res.status(201).json({ success: true, message: 'Account created!', token, user });
  } catch (error) { next(error); }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!(await user.comparePassword(password))) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!user.isActive) return res.status(401).json({ success: false, message: 'Account deactivated' });
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    const token = generateToken(user._id);
    res.json({ success: true, message: 'Login successful!', token, user });
  } catch (error) { next(error); }
};

exports.googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    const { name, email, picture, sub: googleId } = ticket.getPayload();
    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (user) {
      if (!user.googleId) { user.googleId = googleId; user.isGoogleAuth = true; await user.save(); }
    } else {
      user = await User.create({ name, email, googleId, isGoogleAuth: true, avatar: picture, role: 'student' });
    }
    if (!user.isActive) return res.status(401).json({ success: false, message: 'Account deactivated' });
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    const token = generateToken(user._id);
    res.json({ success: true, message: 'Google login successful!', token, user });
  } catch (error) { next(error); }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('enrolledCourses', 'title class fees');
    res.json({ success: true, user });
  } catch (error) { next(error); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, class: cls, batch } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address, class: cls, batch: batch || '' },
      { new: true, runValidators: true }
    );
    res.json({ success: true, message: 'Profile updated!', user });
  } catch (error) { next(error); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!user.password) return res.status(400).json({ success: false, message: 'Use Google login' });
    if (!(await user.comparePassword(currentPassword))) return res.status(400).json({ success: false, message: 'Current password incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed!', token: generateToken(user._id) });
  } catch (error) { next(error); }
};

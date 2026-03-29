const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, minlength: 6, select: false },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  phone: { type: String, trim: true },
  class: { type: String, enum: ['Class 11', 'Class 12', ''], default: '' },
  batch: { type: String, default: '' },
  address: { type: String },
  avatar: { type: String, default: '' },
  googleId: { type: String },
  isGoogleAuth: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  feesPaid: { type: Number, default: 0 },
  feesTotal: { type: Number, default: 0 },
  joinedDate: { type: Date, default: Date.now },
  lastLogin: { type: Date }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

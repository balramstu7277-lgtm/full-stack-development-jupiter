const mongoose = require('mongoose');

// Fee Model
const feeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['course_fee', 'exam_fee', 'material_fee', 'other'], default: 'course_fee' },
  status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
  dueDate: { type: Date },
  paidDate: { type: Date },
  description: { type: String },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  receiptNumber: { type: String },
}, { timestamps: true });

// Attendance Model
const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent', 'late'], default: 'absent' },
  class: { type: String },
  batch: { type: String, default: '' },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Notice Model
const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['general', 'exam', 'holiday', 'result', 'important'], default: 'general' },
  targetClass: { type: String, default: 'all' },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Study Material Model
const studyMaterialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  subject: { type: String },
  class: { type: String },
  fileUrl: { type: String },
  fileType: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Topper Model
const topperSchema = new mongoose.Schema({
  name: { type: String, required: true },
  class: { type: String },
  marks: { type: String },
  percentage: { type: String },
  year: { type: String },
  photo: { type: String },
  rank: { type: Number },
  board: { type: String, default: 'JAC Board' },
}, { timestamps: true });

// Gallery Model
const gallerySchema = new mongoose.Schema({
  title: { type: String },
  imageUrl: { type: String, required: true },
  category: { type: String, default: 'general' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Teacher Model
const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String },
  qualification: { type: String },
  experience: { type: String },
  photo: { type: String },
  bio: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Payment Order Model
const paymentOrderSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fee: { type: mongoose.Schema.Types.ObjectId, ref: 'Fee' },
  razorpayOrderId: { type: String },
  amount: { type: Number },
  status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
}, { timestamps: true });

// Course Model
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  class: { type: String },
  fees: { type: Number, default: 0 },
  duration: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = {
  Fee: mongoose.model('Fee', feeSchema),
  Attendance: mongoose.model('Attendance', attendanceSchema),
  Notice: mongoose.model('Notice', noticeSchema),
  StudyMaterial: mongoose.model('StudyMaterial', studyMaterialSchema),
  Topper: mongoose.model('Topper', topperSchema),
  Gallery: mongoose.model('Gallery', gallerySchema),
  Teacher: mongoose.model('Teacher', teacherSchema),
  PaymentOrder: mongoose.model('PaymentOrder', paymentOrderSchema),
  Course: mongoose.model('Course', courseSchema),
};

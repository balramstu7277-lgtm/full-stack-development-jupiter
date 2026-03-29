const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  questionType: { type: String, enum: ['mcq', 'true_false', 'short_answer', 'long_answer'], default: 'mcq' },
  image: { type: String, default: '' },
  options: [{ type: String }],
  correctAnswer: { type: String },
  marks: { type: Number, default: 1 },
  explanation: { type: String },
});

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  class: { type: String },
  subject: { type: String, default: 'Mathematics' },
  duration: { type: Number, default: 60 },
  totalMarks: { type: Number, default: 0 },
  questions: [questionSchema],
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const testResultSchema = new mongoose.Schema({
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId },
    answer: { type: String },
    isCorrect: { type: Boolean },
    marksAwarded: { type: Number, default: 0 },
    maxMarks: { type: Number, default: 1 },
  }],
  totalMarks: { type: Number, default: 0 },
  marksObtained: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  grade: { type: String },
  status: { type: String, enum: ['pending_review', 'reviewed', 'completed'], default: 'pending_review' },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timeTaken: { type: Number },
}, { timestamps: true });

module.exports = {
  Test: mongoose.model('Test', testSchema),
  TestResult: mongoose.model('TestResult', testResultSchema),
};

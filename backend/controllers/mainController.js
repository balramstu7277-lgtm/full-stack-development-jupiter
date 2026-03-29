const User = require('../models/User');
const { Test, TestResult } = require('../models/Test');
const { Fee, Attendance, Notice, StudyMaterial, Topper, Gallery, Teacher, PaymentOrder, Course } = require('../models/Others');
const { cloudinary } = require('../config/cloudinary');

// ========== STUDENT PDF DOWNLOAD ==========
exports.downloadStudentsPDF = async (req, res, next) => {
  try {
    const { batch, class: cls } = req.query;
    const query = { role: 'student' };
    if (cls) query.class = cls;
    if (batch) query.batch = batch;
    const students = await User.find(query).sort({ rollNumber: 1 });

    const rows = students.map((s, i) => `
      <tr style="background:${i % 2 === 0 ? '#f8fafc' : '#fff'}">
        <td style="padding:8px 12px;border:1px solid #e2e8f0">${s.rollNumber || '—'}</td>
        <td style="padding:8px 12px;border:1px solid #e2e8f0">${s.name}</td>
        <td style="padding:8px 12px;border:1px solid #e2e8f0">${s.class || '—'}</td>
        <td style="padding:8px 12px;border:1px solid #e2e8f0">${s.batch || '—'}</td>
        <td style="padding:8px 12px;border:1px solid #e2e8f0">${s.phone || '—'}</td>
        <td style="padding:8px 12px;border:1px solid #e2e8f0">${s.fatherName || '—'}</td>
        <td style="padding:8px 12px;border:1px solid #e2e8f0">${s.email}</td>
        <td style="padding:8px 12px;border:1px solid #e2e8f0">${s.isActive ? 'Active' : 'Inactive'}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>Student List</title>
    <style>body{font-family:Arial,sans-serif;font-size:12px;margin:20px}
    h1{color:#1e3a8a;margin-bottom:4px}p{color:#64748b;margin:0 0 16px}
    table{width:100%;border-collapse:collapse}
    th{background:#1e3a8a;color:white;padding:10px 12px;text-align:left;border:1px solid #1e40af}
    </style></head><body>
    <h1>Jupiter Classes — Student List</h1>
    <p>${cls ? cls : 'All Classes'} ${batch ? '| ' + batch : ''} | Total: ${students.length} students</p>
    <table>
      <thead><tr>
        <th>Roll No.</th><th>Name</th><th>Class</th><th>Batch</th>
        <th>Phone</th><th>Father Name</th><th>Email</th><th>Status</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin-top:20px;color:#94a3b8;font-size:11px">Generated on ${new Date().toLocaleDateString('en-IN')}</p>
    </body></html>`;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="students-${cls || 'all'}-${Date.now()}.html"`);
    res.send(html);
  } catch (error) { next(error); }
};

// ========== STUDENTS ==========
exports.getStudents = async (req, res, next) => {
  try {
    const { search, class: cls, batch } = req.query;
    const query = { role: 'student' };
    if (cls) query.class = cls;
    if (batch) query.batch = batch;
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const students = await User.find(query).sort({ createdAt: -1 });
    res.json({ success: true, students });
  } catch (error) { next(error); }
};

exports.updateStudent = async (req, res, next) => {
  try {
    const { name, phone, address, class: cls, batch, isActive, feesPaid, feesTotal, fatherName, motherName } = req.body;
    const student = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, address, class: cls, batch: batch || '', isActive, feesPaid, feesTotal, fatherName: fatherName || '', motherName: motherName || '' },
      { new: true }
    );
    res.json({ success: true, student });
  } catch (error) { next(error); }
};

exports.deleteStudent = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Student deleted' });
  } catch (error) { next(error); }
};

// ========== ATTENDANCE (BATCH-WISE) ==========
exports.getAttendance = async (req, res, next) => {
  try {
    const { date, class: cls, batch } = req.query;
    const query = { role: 'student' };
    if (cls) query.class = cls;
    if (batch) query.batch = batch;
    const students = await User.find(query).select('name class batch');
    const attendance = date ? await Attendance.find({ date: new Date(date), ...(batch && { batch }) }) : [];
    res.json({ success: true, students, attendance });
  } catch (error) { next(error); }
};

exports.markAttendance = async (req, res, next) => {
  try {
    const { records, date, batch } = req.body;
    const ops = records.map(r => ({
      updateOne: {
        filter: { student: r.studentId, date: new Date(date) },
        update: { $set: { student: r.studentId, date: new Date(date), status: r.status, batch: batch || '', markedBy: req.user._id } },
        upsert: true
      }
    }));
    await Attendance.bulkWrite(ops);
    res.json({ success: true, message: 'Attendance marked!' });
  } catch (error) { next(error); }
};

exports.getMyAttendance = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const start = new Date(year || new Date().getFullYear(), (month || new Date().getMonth()), 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    const attendance = await Attendance.find({ student: req.user._id, date: { $gte: start, $lte: end } });
    res.json({ success: true, attendance });
  } catch (error) { next(error); }
};

// ========== FEES ==========
exports.getFees = async (req, res, next) => {
  try {
    const fees = req.user.role === 'admin'
      ? await Fee.find().populate('student', 'name class batch email').sort({ createdAt: -1 })
      : await Fee.find({ student: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, fees });
  } catch (error) { next(error); }
};

exports.createFee = async (req, res, next) => {
  try {
    const { studentId, amount, type, dueDate, description } = req.body;
    const receiptNumber = 'JC' + Date.now();
    const fee = await Fee.create({ student: studentId, amount, type, dueDate, description, receiptNumber });
    res.json({ success: true, fee });
  } catch (error) { next(error); }
};

exports.updateFee = async (req, res, next) => {
  try {
    const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, fee });
  } catch (error) { next(error); }
};

exports.deleteFee = async (req, res, next) => {
  try {
    await Fee.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) { next(error); }
};

// Razorpay payment
exports.createPaymentOrder = async (req, res, next) => {
  try {
    const { feeId } = req.body;
    const fee = await Fee.findById(feeId);
    if (!fee) return res.status(404).json({ success: false, message: 'Fee not found' });
    try {
      const Razorpay = require('razorpay');
      const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
      const order = await razorpay.orders.create({ amount: fee.amount * 100, currency: 'INR', receipt: fee.receiptNumber });
      await PaymentOrder.create({ student: req.user._id, fee: feeId, razorpayOrderId: order.id, amount: fee.amount });
      res.json({ success: true, order, key: process.env.RAZORPAY_KEY_ID });
    } catch (e) {
      res.status(500).json({ success: false, message: 'Razorpay not configured yet' });
    }
  } catch (error) { next(error); }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, feeId } = req.body;
    await Fee.findByIdAndUpdate(feeId, { status: 'paid', paidDate: new Date(), razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id });
    await PaymentOrder.findOneAndUpdate({ razorpayOrderId: razorpay_order_id }, { status: 'paid' });
    res.json({ success: true, message: 'Payment verified!' });
  } catch (error) { next(error); }
};

// ========== TESTS ==========
exports.getTests = async (req, res, next) => {
  try {
    const { class: cls } = req.query;
    const query = { isActive: true };
    if (cls && req.user.role === 'student') query.class = cls;
    const tests = await Test.find(query).populate('createdBy', 'name').sort({ createdAt: -1 });
    res.json({ success: true, tests });
  } catch (error) { next(error); }
};

exports.createTest = async (req, res, next) => {
  try {
    const { title, description, class: cls, subject, duration, questions } = req.body;
    const totalMarks = questions.reduce((s, q) => s + (q.marks || 1), 0);
    const test = await Test.create({ title, description, class: cls, subject, duration, questions, totalMarks, createdBy: req.user._id });
    res.json({ success: true, test });
  } catch (error) { next(error); }
};

exports.updateTest = async (req, res, next) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, test });
  } catch (error) { next(error); }
};

exports.deleteTest = async (req, res, next) => {
  try {
    await Test.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) { next(error); }
};

exports.getTestById = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
    res.json({ success: true, test });
  } catch (error) { next(error); }
};

exports.submitTest = async (req, res, next) => {
  try {
    const { answers, timeTaken } = req.body;
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

    const existing = await TestResult.findOne({ test: req.params.id, student: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Already submitted' });

    let marksObtained = 0;
    const processedAnswers = test.questions.map(q => {
      const ans = answers[q._id.toString()] || '';
      let isCorrect = false;
      let marksAwarded = 0;
      if (['mcq', 'true_false'].includes(q.questionType)) {
        isCorrect = ans.toLowerCase() === (q.correctAnswer || '').toLowerCase();
        marksAwarded = isCorrect ? q.marks : 0;
      } else {
        marksAwarded = 0; // manual review needed
      }
      marksObtained += marksAwarded;
      return { questionId: q._id, answer: ans, isCorrect, marksAwarded, maxMarks: q.marks };
    });

    const percentage = test.totalMarks > 0 ? Math.round((marksObtained / test.totalMarks) * 100) : 0;
    const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B+' : percentage >= 60 ? 'B' : percentage >= 50 ? 'C' : 'F';
    const hasSubjective = test.questions.some(q => ['short_answer', 'long_answer'].includes(q.questionType));
    const status = hasSubjective ? 'pending_review' : 'completed';

    const result = await TestResult.create({
      test: test._id, student: req.user._id, answers: processedAnswers,
      totalMarks: test.totalMarks, marksObtained, percentage, grade, status, timeTaken
    });

    res.json({ success: true, result });
  } catch (error) { next(error); }
};

exports.getMyResults = async (req, res, next) => {
  try {
    const results = await TestResult.find({ student: req.user._id }).populate('test', 'title class subject totalMarks').sort({ createdAt: -1 });
    res.json({ success: true, results });
  } catch (error) { next(error); }
};

exports.getAllResults = async (req, res, next) => {
  try {
    const results = await TestResult.find()
      .populate('test', 'title class subject totalMarks questions')
      .populate('student', 'name class batch email')
      .sort({ createdAt: -1 });
    res.json({ success: true, results });
  } catch (error) { next(error); }
};

exports.reviewResult = async (req, res, next) => {
  try {
    const { answers } = req.body;
    const result = await TestResult.findById(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: 'Result not found' });

    let marksObtained = 0;
    const updatedAnswers = result.answers.map(a => {
      const updated = answers[a.questionId.toString()];
      if (updated !== undefined) {
        // Ensure non-negative and within max marks
        const awarded = Math.max(0, Math.min(a.maxMarks, parseFloat(updated) || 0));
        a.marksAwarded = awarded;
      }
      marksObtained += a.marksAwarded;
      return a;
    });

    const percentage = result.totalMarks > 0 ? Math.round((marksObtained / result.totalMarks) * 100) : 0;
    const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B+' : percentage >= 60 ? 'B' : percentage >= 50 ? 'C' : 'F';

    result.answers = updatedAnswers;
    result.marksObtained = marksObtained;
    result.percentage = percentage;
    result.grade = grade;
    result.status = 'reviewed';
    result.reviewedAt = new Date();
    result.reviewedBy = req.user._id;
    await result.save();

    res.json({ success: true, result });
  } catch (error) { next(error); }
};

// ========== NOTICES ==========
exports.getNotices = async (req, res, next) => {
  try {
    const notices = await Notice.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, notices });
  } catch (error) { next(error); }
};

exports.createNotice = async (req, res, next) => {
  try {
    const notice = await Notice.create({ ...req.body, createdBy: req.user._id });
    res.json({ success: true, notice });
  } catch (error) { next(error); }
};

exports.deleteNotice = async (req, res, next) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) { next(error); }
};

// ========== STUDY MATERIALS ==========
exports.getMaterials = async (req, res, next) => {
  try {
    const { class: cls } = req.query;
    const query = { isActive: true };
    if (cls) query.class = cls;
    const materials = await StudyMaterial.find(query).sort({ createdAt: -1 });
    res.json({ success: true, materials });
  } catch (error) { next(error); }
};

exports.createMaterial = async (req, res, next) => {
  try {
    let fileUrl = '', fileType = '';
    if (req.file) { fileUrl = req.file.path; fileType = req.file.mimetype; }
    const material = await StudyMaterial.create({ ...req.body, fileUrl, fileType, uploadedBy: req.user._id });
    res.json({ success: true, material });
  } catch (error) { next(error); }
};

exports.deleteMaterial = async (req, res, next) => {
  try {
    await StudyMaterial.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) { next(error); }
};

// ========== TOPPERS ==========
exports.getToppers = async (req, res, next) => {
  try {
    const toppers = await Topper.find().sort({ rank: 1, year: -1 });
    res.json({ success: true, toppers });
  } catch (error) { next(error); }
};

exports.createTopper = async (req, res, next) => {
  try {
    let photo = '';
    if (req.file) photo = req.file.path;
    const topper = await Topper.create({ ...req.body, photo });
    res.json({ success: true, topper });
  } catch (error) { next(error); }
};

exports.deleteTopper = async (req, res, next) => {
  try {
    await Topper.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) { next(error); }
};

// ========== GALLERY ==========
exports.getGallery = async (req, res, next) => {
  try {
    const gallery = await Gallery.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, gallery });
  } catch (error) { next(error); }
};

exports.uploadGallery = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const item = await Gallery.create({ title: req.body.title || '', imageUrl: req.file.path });
    res.json({ success: true, item });
  } catch (error) { next(error); }
};

exports.deleteGallery = async (req, res, next) => {
  try {
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) { next(error); }
};

// ========== TEACHERS ==========
exports.getTeachers = async (req, res, next) => {
  try {
    const teachers = await Teacher.find({ isActive: true });
    res.json({ success: true, teachers });
  } catch (error) { next(error); }
};

exports.createTeacher = async (req, res, next) => {
  try {
    let photo = '';
    if (req.file) photo = req.file.path;
    const teacher = await Teacher.create({ ...req.body, photo });
    res.json({ success: true, teacher });
  } catch (error) { next(error); }
};

exports.updateTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, teacher });
  } catch (error) { next(error); }
};

exports.deleteTeacher = async (req, res, next) => {
  try {
    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) { next(error); }
};

// ========== DASHBOARD STATS ==========
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const activeStudents = await User.countDocuments({ role: 'student', isActive: true });
    const totalTests = await Test.countDocuments({ isActive: true });
    const pendingReviews = await TestResult.countDocuments({ status: 'pending_review' });
    const totalFees = await Fee.aggregate([{ $group: { _id: null, total: { $sum: '$amount' }, paid: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] } } } }]);
    res.json({
      success: true,
      stats: {
        totalStudents, activeStudents, totalTests, pendingReviews,
        totalFees: totalFees[0]?.total || 0,
        paidFees: totalFees[0]?.paid || 0,
      }
    });
  } catch (error) { next(error); }
};
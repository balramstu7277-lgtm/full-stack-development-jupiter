const express = require('express');
const router = express.Router();
const { protect, adminOnly, teacherOrAdmin } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const c = require('../controllers/mainController');

// Students
router.get('/students', protect, adminOnly, c.getStudents);
router.put('/students/:id', protect, adminOnly, c.updateStudent);
router.delete('/students/:id', protect, adminOnly, c.deleteStudent);

// Attendance
router.get('/attendance', protect, teacherOrAdmin, c.getAttendance);
router.post('/attendance', protect, teacherOrAdmin, c.markAttendance);
router.get('/my-attendance', protect, c.getMyAttendance);

// Fees - IMPORTANT: specific routes BEFORE :id routes
router.post('/fees/payment/create', protect, c.createPaymentOrder);
router.post('/fees/payment/verify', protect, c.verifyPayment);
router.get('/fees', protect, c.getFees);
router.post('/fees', protect, adminOnly, c.createFee);
router.put('/fees/:id', protect, adminOnly, c.updateFee);
router.delete('/fees/:id', protect, adminOnly, c.deleteFee);

// Tests - specific routes BEFORE :id routes
router.get('/tests', protect, c.getTests);
router.post('/tests', protect, teacherOrAdmin, c.createTest);
router.get('/my-results', protect, c.getMyResults);
router.get('/results', protect, adminOnly, c.getAllResults);
router.put('/results/:id/review', protect, teacherOrAdmin, c.reviewResult);
router.put('/tests/:id', protect, teacherOrAdmin, c.updateTest);
router.delete('/tests/:id', protect, adminOnly, c.deleteTest);
router.get('/tests/:id', protect, c.getTestById);
router.post('/tests/:id/submit', protect, c.submitTest);

// Notices
router.get('/notices', c.getNotices);
router.post('/notices', protect, adminOnly, c.createNotice);
router.delete('/notices/:id', protect, adminOnly, c.deleteNotice);

// Study Materials
router.get('/materials', protect, c.getMaterials);
router.post('/materials', protect, teacherOrAdmin, upload.single('file'), c.createMaterial);
router.delete('/materials/:id', protect, adminOnly, c.deleteMaterial);

// Toppers
router.get('/toppers', c.getToppers);
router.post('/toppers', protect, adminOnly, upload.single('photo'), c.createTopper);
router.delete('/toppers/:id', protect, adminOnly, c.deleteTopper);

// Gallery
router.get('/gallery', c.getGallery);
router.post('/gallery', protect, adminOnly, upload.single('file'), c.uploadGallery);
router.delete('/gallery/:id', protect, adminOnly, c.deleteGallery);

// Teachers
router.get('/teachers', c.getTeachers);
router.post('/teachers', protect, adminOnly, upload.single('photo'), c.createTeacher);
router.put('/teachers/:id', protect, adminOnly, c.updateTeacher);
router.delete('/teachers/:id', protect, adminOnly, c.deleteTeacher);

// Dashboard
router.get('/dashboard/stats', protect, adminOnly, c.getDashboardStats);

module.exports = router;

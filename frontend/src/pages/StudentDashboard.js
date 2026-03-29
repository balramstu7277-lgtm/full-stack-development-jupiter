import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSignOutAlt, FaUserEdit, FaTimes, FaDownload, FaClipboardList, FaBell,
  FaFileAlt, FaRupeeSign, FaCalendarCheck, FaBook, FaPrint, FaCheckCircle } from 'react-icons/fa';
import { MdDashboard, MdAssignment } from 'react-icons/md';
import toast from 'react-hot-toast';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const BATCHES = {
  'Class 11': ['8:00 AM - 9:00 AM', '9:00 AM - 10:00 AM', '3:00 PM - 4:00 PM', '4:00 PM - 5:00 PM'],
  'Class 12': ['6:00 AM - 7:00 AM', '7:00 AM - 8:00 AM', '5:00 PM - 6:00 PM', '6:00 PM - 7:00 PM'],
};

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: MdDashboard },
  { id: 'tests', label: 'Tests', icon: MdAssignment },
  { id: 'results', label: 'My Results', icon: FaClipboardList },
  { id: 'attendance', label: 'Attendance', icon: FaCalendarCheck },
  { id: 'fees', label: 'Fees', icon: FaRupeeSign },
  { id: 'materials', label: 'Materials', icon: FaBook },
  { id: 'notices', label: 'Notices', icon: FaBell },
];

// ─── FEE RECEIPT ─────────────────────────────────────────────────────────────
function FeeReceipt({ fee, student, onClose }) {
  const print = () => window.print();

  const downloadPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a5' });
      const pg = doc.internal.pageSize;
      const W = pg.getWidth();

      doc.setFillColor(30, 58, 138);
      doc.rect(0, 0, W, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('JUPITER CLASSES', W / 2, 12, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('of Mathematics — Hazaribagh, Jharkhand', W / 2, 19, { align: 'center' });
      doc.text('Ph: +91 76676 19141', W / 2, 25, { align: 'center' });

      doc.setFillColor(239, 246, 255);
      doc.rect(0, 30, W, 12, 'F');
      doc.setTextColor(30, 58, 138);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('FEE RECEIPT', W / 2, 38, { align: 'center' });

      doc.setTextColor(50, 50, 50);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const rows = [
        ['Receipt No.', fee.receiptNumber || 'JC-' + fee._id?.slice(-6).toUpperCase()],
        ['Student Name', student?.name || '—'],
        ['Class', student?.class || '—'],
        ['Batch', student?.batch || '—'],
        ['Amount', `Rs. ${fee.amount?.toLocaleString('en-IN')}`],
        ['Type', fee.type?.replace('_', ' ').toUpperCase() || '—'],
        ['Status', fee.status?.toUpperCase() || '—'],
        ['Payment Date', fee.paidDate ? new Date(fee.paidDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')],
        ['Transaction ID', fee.razorpayPaymentId || 'CASH PAYMENT'],
      ];

      let y = 50;
      rows.forEach(([label, value], i) => {
        if (i % 2 === 0) { doc.setFillColor(248, 250, 252); doc.rect(10, y - 4, W - 20, 9, 'F'); }
        doc.setFont('helvetica', 'bold'); doc.text(label + ':', 14, y);
        doc.setFont('helvetica', 'normal'); doc.text(String(value), 65, y);
        y += 9;
      });

      doc.setFillColor(220, 252, 231);
      doc.rect(10, y + 3, W - 20, 10, 'F');
      doc.setTextColor(22, 163, 74);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('✓ Payment Received — Thank You!', W / 2, y + 10, { align: 'center' });

      doc.setTextColor(150);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('This is a computer generated receipt.', W / 2, y + 18, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, W / 2, y + 23, { align: 'center' });

      doc.save(`Receipt_${fee.receiptNumber || fee._id}.pdf`);
      toast.success('Receipt downloaded!');
    } catch { toast.error('PDF generation failed'); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="hero-bg p-5 text-white text-center">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mx-auto mb-2">
            <span className="text-primary-900 font-display font-bold text-lg">J</span>
          </div>
          <p className="font-display font-bold text-lg">Jupiter Classes</p>
          <p className="text-blue-200 text-xs">of Mathematics — Hazaribagh, Jharkhand</p>
        </div>
        <div className="bg-blue-50 text-center py-2">
          <p className="font-display font-bold text-primary-800 text-sm tracking-widest">FEE RECEIPT</p>
        </div>
        <div className="p-5 space-y-2 text-sm">
          {[
            ['Receipt No.', fee.receiptNumber || 'JC-' + fee._id?.slice(-6).toUpperCase()],
            ['Student', student?.name],
            ['Class', student?.class],
            ['Batch', student?.batch],
            ['Amount', `₹${fee.amount?.toLocaleString('en-IN')}`],
            ['Type', fee.type?.replace('_', ' ')],
            ['Date', fee.paidDate ? new Date(fee.paidDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')],
            ['Txn ID', fee.razorpayPaymentId || 'Cash Payment'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500 font-medium">{label}</span>
              <span className="text-gray-800 font-semibold text-right max-w-[60%]">{value || '—'}</span>
            </div>
          ))}
        </div>
        <div className="bg-green-50 mx-5 rounded-xl p-3 text-center mb-4">
          <p className="text-green-700 font-bold flex items-center justify-center gap-2">
            <FaCheckCircle /> Payment Received — Thank You!
          </p>
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm font-medium">Close</button>
          <button onClick={print} className="flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-50">
            <FaPrint /> Print
          </button>
          <button onClick={downloadPDF} className="flex items-center gap-2 btn-primary btn-sm">
            <FaDownload /> PDF
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState('dashboard');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [fees, setFees] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [notices, setNotices] = useState([]);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    API.get('/tests').then(r => setTests(r.data.tests || [])).catch(() => {});
    API.get('/my-results').then(r => setResults(r.data.results || [])).catch(() => {});
    API.get('/my-attendance').then(r => setAttendance(r.data.attendance || [])).catch(() => {});
    API.get('/fees').then(r => setFees(r.data.fees || [])).catch(() => {});
    API.get('/materials').then(r => setMaterials(r.data.materials || [])).catch(() => {});
    API.get('/notices').then(r => setNotices(r.data.notices || [])).catch(() => {});
  }, []);

  const openEdit = () => {
    setForm({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '', class: user?.class || '', batch: user?.batch || '' });
    setEditOpen(true);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const r = await API.put('/auth/update-profile', form);
      updateUser(r.data.user);
      toast.success('Profile updated!');
      setEditOpen(false);
    } catch { toast.error('Update failed'); } finally { setSaving(false); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const handlePayNow = async (fee) => {
    try {
      const r = await API.post("/fees/payment/create", { feeId: fee._id });
      const { order, key } = r.data;
      const options = {
        key,
        amount: order.amount,
        currency: "INR",
        name: "Jupiter Classes",
        description: fee.description || "Fee Payment",
        order_id: order.id,
        handler: async (response) => {
          await API.post("/fees/payment/verify", { razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, feeId: fee._id });
          toast.success("Payment successful!");
          const updated = await API.get("/fees");
          setFees(updated.data.fees || []);
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#2563eb" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error("Payment gateway not configured. Contact admin.");
    }
  };

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const attendancePct = attendance.length ? Math.round((presentCount / attendance.length) * 100) : 0;
  const paidFees = fees.filter(f => f.status === 'paid').reduce((s, f) => s + f.amount, 0);
  const pendingFees = fees.filter(f => f.status === 'pending').reduce((s, f) => s + f.amount, 0);

  const tabContent = {
    dashboard: (
      <div>
        <h2 className="font-display text-2xl font-bold text-gray-800 mb-5">Welcome, {user?.name?.split(' ')[0]}! 👋</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Tests Available', value: tests.length, color: 'bg-blue-500', icon: MdAssignment },
            { label: 'Tests Taken', value: results.length, color: 'bg-green-500', icon: FaClipboardList },
            { label: 'Attendance', value: `${attendancePct}%`, color: 'bg-purple-500', icon: FaCalendarCheck },
            { label: 'Pending Fees', value: `₹${pendingFees.toLocaleString()}`, color: 'bg-orange-500', icon: FaRupeeSign },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="card p-4">
              <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center mb-2`}>
                <Icon className="text-white text-base" />
              </div>
              <p className="font-display font-bold text-xl text-gray-800">{value}</p>
              <p className="text-gray-400 text-xs">{label}</p>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="font-bold text-gray-700 mb-3">My Profile</h3>
            <div className="space-y-2 text-sm">
              {[['Name', user?.name], ['Email', user?.email], ['Class', user?.class || '—'], ['Batch', user?.batch || '—'], ['Phone', user?.phone || '—']].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-400">{k}</span>
                  <span className="font-medium text-gray-700">{v}</span>
                </div>
              ))}
            </div>
            <button onClick={openEdit} className="btn-primary btn-sm mt-4 flex items-center gap-2 w-full justify-center">
              <FaUserEdit /> Edit Profile
            </button>
          </div>
          <div className="card p-5">
            <h3 className="font-bold text-gray-700 mb-3">Recent Notices</h3>
            {notices.slice(0, 3).map(n => (
              <div key={n._id} className="py-2 border-b border-gray-50 last:border-0">
                <p className="font-semibold text-sm text-gray-700">{n.title}</p>
                <p className="text-gray-400 text-xs mt-0.5">{n.content?.slice(0, 60)}...</p>
              </div>
            ))}
            {!notices.length && <p className="text-gray-400 text-sm">No notices.</p>}
          </div>
        </div>
      </div>
    ),

    tests: (
      <div>
        <h2 className="font-display text-2xl font-bold text-gray-800 mb-5">Available Tests</h2>
        <div className="space-y-3">
          {tests.map(t => {
            const taken = results.find(r => r.test?._id === t._id);
            return (
              <div key={t._id} className="card p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-800">{t.title}</p>
                  <p className="text-gray-400 text-xs">{t.class} · {t.questions?.length} questions · {t.totalMarks} marks · {t.duration} mins</p>
                </div>
                <div className="shrink-0">
                  {taken ? (
                    <span className="badge badge-green">Submitted</span>
                  ) : (
                    <Link to={`/test/${t._id}`} className="btn-primary btn-sm">Start Test</Link>
                  )}
                </div>
              </div>
            );
          })}
          {!tests.length && <div className="card p-10 text-center text-gray-400">No tests available yet.</div>}
        </div>
      </div>
    ),

    results: (
      <div>
        <h2 className="font-display text-2xl font-bold text-gray-800 mb-5">My Test Results</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-th">Test</th>
                <th className="table-th">Score</th>
                <th className="table-th">Grade</th>
                <th className="table-th">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {results.map(r => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="table-td font-medium">{r.test?.title}</td>
                  <td className="table-td">{r.marksObtained}/{r.totalMarks} ({r.percentage}%)</td>
                  <td className="table-td"><span className="badge badge-blue">{r.grade}</span></td>
                  <td className="table-td">
                    <span className={`badge ${r.status === 'completed' || r.status === 'reviewed' ? 'badge-green' : 'badge-yellow'}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
              {!results.length && <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-400">No results yet. Take a test!</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    ),

    attendance: (
      <div>
        <h2 className="font-display text-2xl font-bold text-gray-800 mb-5">My Attendance</h2>
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { label: 'Present', count: presentCount, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Absent', count: attendance.filter(a => a.status === 'absent').length, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Late', count: attendance.filter(a => a.status === 'late').length, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map(({ label, count, color, bg }) => (
            <div key={label} className={`card p-4 text-center ${bg}`}>
              <p className={`font-display font-bold text-2xl ${color}`}>{count}</p>
              <p className="text-gray-500 text-sm">{label}</p>
            </div>
          ))}
        </div>
        <div className="mb-4 p-4 bg-blue-50 rounded-xl flex items-center justify-between">
          <p className="font-semibold text-blue-800">Overall Attendance</p>
          <p className="font-display font-bold text-2xl text-blue-700">{attendancePct}%</p>
        </div>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="table-th">Date</th><th className="table-th">Batch</th><th className="table-th">Status</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {attendance.slice().reverse().map(a => (
                <tr key={a._id}>
                  <td className="table-td">{new Date(a.date).toLocaleDateString('en-IN')}</td>
                  <td className="table-td text-xs text-gray-400">{a.batch || user?.batch || '—'}</td>
                  <td className="table-td">
                    <span className={`badge ${a.status === 'present' ? 'badge-green' : a.status === 'late' ? 'badge-yellow' : 'badge-red'}`}>{a.status}</span>
                  </td>
                </tr>
              ))}
              {!attendance.length && <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400">No attendance records yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    ),

    fees: (
      <div>
        <h2 className="font-display text-2xl font-bold text-gray-800 mb-5">My Fees</h2>
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="card p-4 bg-green-50">
            <p className="text-gray-500 text-sm">Total Paid</p>
            <p className="font-display font-bold text-2xl text-green-600">₹{paidFees.toLocaleString()}</p>
          </div>
          <div className="card p-4 bg-orange-50">
            <p className="text-gray-500 text-sm">Pending</p>
            <p className="font-display font-bold text-2xl text-orange-600">₹{pendingFees.toLocaleString()}</p>
          </div>
        </div>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[400px]">
            <thead className="bg-gray-50"><tr><th className="table-th">Description</th><th className="table-th">Amount</th><th className="table-th">Due Date</th><th className="table-th">Status</th><th className="table-th">Action</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {fees.map(f => (
                <tr key={f._id} className="hover:bg-gray-50">
                  <td className="table-td">{f.description || f.type?.replace('_', ' ')}</td>
                  <td className="table-td font-semibold">₹{f.amount?.toLocaleString()}</td>
                  <td className="table-td">{f.dueDate ? new Date(f.dueDate).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="table-td">
                    <span className={`badge ${f.status === 'paid' ? 'badge-green' : f.status === 'overdue' ? 'badge-red' : 'badge-yellow'}`}>{f.status}</span>
                  </td>
                  <td className="table-td">
                    {f.status === 'paid' ? (
                      <button onClick={() => setReceipt(f)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs font-medium">
                        <FaPrint /> Receipt
                      </button>
                    ) : (
                      <button onClick={() => handlePayNow(f)} className="btn-primary btn-sm flex items-center gap-1">
                        <FaRupeeSign /> Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!fees.length && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No fee records.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    ),

    materials: (
      <div>
        <h2 className="font-display text-2xl font-bold text-gray-800 mb-5">Study Materials</h2>
        <div className="space-y-3">
          {materials.map(m => (
            <div key={m._id} className="card p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-800">{m.title}</p>
                <p className="text-gray-400 text-xs">{m.class} · {m.subject}</p>
                {m.description && <p className="text-gray-500 text-xs mt-0.5">{m.description}</p>}
              </div>
              {m.fileUrl && (
                <a href={m.fileUrl} target="_blank" rel="noreferrer" className="btn-primary btn-sm flex items-center gap-2 shrink-0">
                  <FaDownload /> Download
                </a>
              )}
            </div>
          ))}
          {!materials.length && <div className="card p-10 text-center text-gray-400">No materials available yet.</div>}
        </div>
      </div>
    ),

    notices: (
      <div>
        <h2 className="font-display text-2xl font-bold text-gray-800 mb-5">Notices</h2>
        <div className="space-y-3">
          {notices.map(n => (
            <div key={n._id} className="card p-4">
              <div className="flex items-start gap-3">
                <span className={`badge mt-0.5 ${n.type === 'important' ? 'badge-red' : n.type === 'exam' ? 'badge-yellow' : 'badge-blue'}`}>{n.type}</span>
                <div>
                  <p className="font-semibold text-gray-800">{n.title}</p>
                  <p className="text-gray-500 text-sm mt-1">{n.content}</p>
                </div>
              </div>
            </div>
          ))}
          {!notices.length && <div className="card p-10 text-center text-gray-400">No notices.</div>}
        </div>
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-primary-950 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-3">
          <button className="md:hidden p-1 mr-1" onClick={() => setMobileMenu(v => !v)}>☰</button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-primary-900 font-display font-bold text-sm">J</span>
            </div>
            <span className="font-display font-bold text-sm hidden sm:block">Jupiter Classes</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold">{user?.name}</p>
            <p className="text-blue-300 text-xs">{user?.class} {user?.batch ? `· ${user.batch}` : ''}</p>
          </div>
          <button onClick={openEdit} className="p-2 hover:bg-white/10 rounded-lg transition-all"><FaUserEdit /></button>
          <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-lg transition-all text-red-300"><FaSignOutAlt /></button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4">
        {/* Tab navigation - horizontal scrollable on mobile */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-5 hide-scrollbar">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActive(id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0
                ${active === id ? 'bg-primary-700 text-white shadow-sm' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-100'}`}>
              <Icon className="text-xs" /> {label}
            </button>
          ))}
        </div>

        <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {tabContent[active]}
        </motion.div>
      </div>

      {/* Edit Profile Modal */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-gray-800">Edit Profile</h3>
              <button onClick={() => setEditOpen(false)}><FaTimes className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label><input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field text-sm" /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Phone</label><input value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field text-sm" /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Address</label><input value={form.address || ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="input-field text-sm" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Class</label>
                  <select value={form.class || ''} onChange={e => setForm(f => ({ ...f, class: e.target.value, batch: '' }))} className="input-field text-sm">
                    <option value="">Select</option><option>Class 11</option><option>Class 12</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Batch</label>
                  <select value={form.batch || ''} onChange={e => setForm(f => ({ ...f, batch: e.target.value }))} className="input-field text-sm" disabled={!form.class}>
                    <option value="">Select</option>
                    {form.class && BATCHES[form.class]?.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              {form.batch && (
                <div className="bg-blue-50 rounded-xl p-2.5 text-xs text-blue-700 font-medium">
                  ✅ {form.class} — {form.batch}
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditOpen(false)} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm text-gray-600">Cancel</button>
              <button onClick={saveProfile} disabled={saving} className="flex-1 btn-primary btn-sm">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Fee Receipt Modal */}
      {receipt && <FeeReceipt fee={receipt} student={user} onClose={() => setReceipt(null)} />}
    </div>
  );
}
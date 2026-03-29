import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUsers, FaBook, FaTrophy, FaImages, FaSignOutAlt, FaPlus, FaTrash, FaSearch,
  FaClipboardList, FaBell, FaFileAlt, FaRupeeSign, FaCalendarCheck, FaChalkboardTeacher,
  FaTimes, FaBars, FaEdit, FaCheck, FaEye } from 'react-icons/fa';
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
  { id: 'students', label: 'Students', icon: FaUsers },
  { id: 'attendance', label: 'Attendance', icon: FaCalendarCheck },
  { id: 'fees', label: 'Fees', icon: FaRupeeSign },
  { id: 'tests', label: 'Tests', icon: MdAssignment },
  { id: 'results', label: 'Results', icon: FaClipboardList },
  { id: 'notices', label: 'Notices', icon: FaBell },
  { id: 'materials', label: 'Materials', icon: FaFileAlt },
  { id: 'toppers', label: 'Toppers', icon: FaTrophy },
  { id: 'gallery', label: 'Gallery', icon: FaImages },
  { id: 'teachers', label: 'Teachers', icon: FaChalkboardTeacher },
];

function Sidebar({ active, setActive, onLogout, onClose }) {
  return (
    <div className="w-64 bg-primary-950 min-h-screen flex flex-col">
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3" onClick={onClose}>
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
            <span className="text-primary-900 font-display font-bold text-lg">J</span>
          </div>
          <div>
            <p className="font-display font-bold text-white text-sm leading-tight">Jupiter Classes</p>
            <p className="text-blue-400 text-xs">Admin Panel</p>
          </div>
        </Link>
        {onClose && <button onClick={onClose} className="text-white/50 hover:text-white md:hidden"><FaTimes /></button>}
      </div>
      <nav className="flex-1 py-3 overflow-y-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => { setActive(id); onClose?.(); }}
            className={`sidebar-link w-full text-left ${active === id ? 'active' : ''}`}>
            <Icon className="text-base shrink-0" /> {label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <button onClick={onLogout} className="sidebar-link w-full text-left text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );
}

// ─── DASHBOARD TAB ───────────────────────────────────────────────────────────
function DashboardTab() {
  const [stats, setStats] = useState(null);
  useEffect(() => { API.get('/dashboard/stats').then(r => setStats(r.data.stats)).catch(() => {}); }, []);
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Students', value: stats?.totalStudents ?? '—', color: 'bg-blue-500', icon: FaUsers },
          { label: 'Active Students', value: stats?.activeStudents ?? '—', color: 'bg-green-500', icon: FaCheck },
          { label: 'Total Tests', value: stats?.totalTests ?? '—', color: 'bg-purple-500', icon: MdAssignment },
          { label: 'Pending Reviews', value: stats?.pendingReviews ?? '—', color: 'bg-orange-500', icon: FaClipboardList },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="card p-4">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className="text-white text-base" />
            </div>
            <p className="font-display font-bold text-2xl text-gray-800">{value}</p>
            <p className="text-gray-400 text-sm">{label}</p>
          </div>
        ))}
      </div>
      {stats && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="font-bold text-gray-700 mb-3">Fee Collection</h3>
            <p className="text-3xl font-display font-bold text-green-600">₹{stats.paidFees?.toLocaleString()}</p>
            <p className="text-gray-400 text-sm">of ₹{stats.totalFees?.toLocaleString()} total</p>
            <div className="mt-3 bg-gray-100 rounded-full h-2">
              <div className="bg-green-500 rounded-full h-2 transition-all" style={{ width: stats.totalFees ? `${(stats.paidFees / stats.totalFees) * 100}%` : '0%' }} />
            </div>
          </div>
          <div className="card p-5 flex items-center justify-center text-center">
            <div>
              <FaChalkboardTeacher className="text-5xl text-blue-300 mx-auto mb-3" />
              <p className="font-bold text-gray-700">Welcome, Sandeep Sir</p>
              <p className="text-gray-400 text-sm mt-1">Jupiter Classes Admin Panel</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STUDENTS TAB ────────────────────────────────────────────────────────────
function StudentsTab() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [editStudent, setEditStudent] = useState(null);
  const [editForm, setEditForm] = useState({});

  const load = () => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (filterClass) params.append('class', filterClass);
    API.get(`/students?${params}`).then(r => setStudents(r.data.students || [])).catch(() => {});
  };

  useEffect(() => { load(); }, [search, filterClass]);

  const openEdit = (s) => { setEditStudent(s); setEditForm({ name: s.name, phone: s.phone || '', class: s.class || '', batch: s.batch || '', isActive: s.isActive }); };

  const saveEdit = async () => {
    try {
      await API.put(`/students/${editStudent._id}`, editForm);
      toast.success('Student updated!');
      setEditStudent(null);
      load();
    } catch { toast.error('Update failed'); }
  };

  const deleteStudent = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    await API.delete(`/students/${id}`);
    toast.success('Deleted');
    load();
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-gray-800 mb-5">Students ({students.length})</h2>
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." className="input-field pl-9 py-2 text-sm" />
        </div>
        <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="input-field py-2 text-sm w-auto">
          <option value="">All Classes</option>
          <option>Class 11</option>
          <option>Class 12</option>
        </select>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-th">Name</th>
              <th className="table-th">Class</th>
              <th className="table-th">Batch</th>
              <th className="table-th">Phone</th>
              <th className="table-th">Status</th>
              <th className="table-th">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {students.map(s => (
              <tr key={s._id} className="hover:bg-gray-50">
                <td className="table-td font-medium">{s.name}</td>
                <td className="table-td">{s.class || '—'}</td>
                <td className="table-td text-xs text-gray-500">{s.batch || '—'}</td>
                <td className="table-td">{s.phone || '—'}</td>
                <td className="table-td">
                  <span className={`badge ${s.isActive ? 'badge-green' : 'badge-red'}`}>{s.isActive ? 'Active' : 'Inactive'}</span>
                </td>
                <td className="table-td">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(s)} className="text-blue-500 hover:text-blue-700 p-1"><FaEdit /></button>
                    <button onClick={() => deleteStudent(s._id)} className="text-red-400 hover:text-red-600 p-1"><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!students.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No students found.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editStudent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-lg text-gray-800">Edit Student</h3>
                <button onClick={() => setEditStudent(null)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
              </div>
              <div className="space-y-3">
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Name</label><input value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="input-field text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Phone</label><input value={editForm.phone || ''} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} className="input-field text-sm" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Class</label>
                    <select value={editForm.class || ''} onChange={e => setEditForm(f => ({ ...f, class: e.target.value, batch: '' }))} className="input-field text-sm">
                      <option value="">Select</option><option>Class 11</option><option>Class 12</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Batch</label>
                    <select value={editForm.batch || ''} onChange={e => setEditForm(f => ({ ...f, batch: e.target.value }))} className="input-field text-sm" disabled={!editForm.class}>
                      <option value="">Select</option>
                      {editForm.class && BATCHES[editForm.class]?.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={editForm.isActive} onChange={e => setEditForm(f => ({ ...f, isActive: e.target.checked }))} id="active" />
                  <label htmlFor="active" className="text-sm text-gray-600">Active Student</label>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setEditStudent(null)} className="flex-1 btn-sm border border-gray-200 text-gray-600 rounded-lg">Cancel</button>
                <button onClick={saveEdit} className="flex-1 btn-primary btn-sm">Save Changes</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── ATTENDANCE TAB ──────────────────────────────────────────────────────────
function AttendanceTab() {
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [cls, setCls] = useState('Class 11');
  const [batch, setBatch] = useState(BATCHES['Class 11'][0]);
  const [saving, setSaving] = useState(false);

  const load = () => {
    API.get(`/attendance?date=${date}&class=${cls}&batch=${encodeURIComponent(batch)}`)
      .then(r => {
        setStudents(r.data.students || []);
        const rec = {};
        (r.data.attendance || []).forEach(a => { rec[a.student] = a.status; });
        setRecords(rec);
      }).catch(() => {});
  };

  useEffect(() => { load(); }, [date, cls, batch]);
  useEffect(() => { setBatch(BATCHES[cls][0]); }, [cls]);

  const save = async () => {
    setSaving(true);
    try {
      const recs = students.map(s => ({ studentId: s._id, status: records[s._id] || 'absent' }));
      await API.post('/attendance', { records: recs, date, batch });
      toast.success('Attendance saved!');
    } catch { toast.error('Error saving'); } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <h2 className="font-display text-2xl font-bold text-gray-800">Attendance</h2>
        <div className="flex flex-wrap gap-3">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field py-2 text-sm" />
          <select value={cls} onChange={e => setCls(e.target.value)} className="input-field py-2 text-sm w-auto">
            <option>Class 11</option><option>Class 12</option>
          </select>
          <select value={batch} onChange={e => setBatch(e.target.value)} className="input-field py-2 text-sm w-auto">
            {BATCHES[cls].map(b => <option key={b}>{b}</option>)}
          </select>
          <button onClick={save} disabled={saving} className="btn-primary btn-sm">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
      <div className="mb-4 p-3 bg-blue-50 rounded-xl text-sm text-blue-700 font-medium">
        📋 {cls} — Batch: {batch} — {students.length} students
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-th">Student</th>
              <th className="table-th">Batch</th>
              <th className="table-th">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {students.map(s => (
              <tr key={s._id} className="hover:bg-gray-50">
                <td className="table-td font-medium">{s.name}</td>
                <td className="table-td text-xs text-gray-400">{s.batch || batch}</td>
                <td className="table-td">
                  <div className="flex gap-2 flex-wrap">
                    {['present', 'absent', 'late'].map(status => (
                      <label key={status} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer text-xs font-medium transition-all
                        ${records[s._id] === status
                          ? (status === 'present' ? 'bg-green-100 text-green-700 ring-2 ring-green-300'
                            : status === 'absent' ? 'bg-red-100 text-red-600 ring-2 ring-red-300'
                            : 'bg-amber-100 text-amber-700 ring-2 ring-amber-300')
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        <input type="radio" name={s._id} value={status} checked={records[s._id] === status}
                          onChange={() => setRecords(r => ({ ...r, [s._id]: status }))} className="sr-only" />
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </label>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {!students.length && <tr><td colSpan={3} className="px-4 py-10 text-center text-gray-400">No students in this batch.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── FEES TAB ────────────────────────────────────────────────────────────────
function FeesTab() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ studentId: '', amount: '', type: 'course_fee', dueDate: '', description: '' });

  const load = () => { API.get('/fees').then(r => setFees(r.data.fees || [])).catch(() => {}); };
  useEffect(() => {
    load();
    API.get('/students').then(r => setStudents(r.data.students || [])).catch(() => {});
  }, []);

  const addFee = async (e) => {
    e.preventDefault();
    try {
      await API.post('/fees', form);
      toast.success('Fee added!');
      setShowAdd(false);
      setForm({ studentId: '', amount: '', type: 'course_fee', dueDate: '', description: '' });
      load();
    } catch { toast.error('Error'); }
  };

  const markPaid = async (id) => {
    await API.put(`/fees/${id}`, { status: 'paid', paidDate: new Date() });
    toast.success('Marked as paid!');
    load();
  };

  const deleteFee = async (id) => {
    if (!window.confirm('Delete?')) return;
    await API.delete(`/fees/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-2xl font-bold text-gray-800">Fees</h2>
        <button onClick={() => setShowAdd(v => !v)} className="btn-primary btn-sm flex items-center gap-2"><FaPlus /> Add Fee</button>
      </div>
      {showAdd && (
        <div className="card p-5 mb-5">
          <h3 className="font-bold text-gray-700 mb-4">Add New Fee</h3>
          <form onSubmit={addFee} className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Student *</label>
              <select value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))} className="input-field text-sm" required>
                <option value="">Select Student</option>
                {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.class})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Amount (₹) *</label>
              <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="input-field text-sm" required min="0" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-field text-sm">
                <option value="course_fee">Course Fee</option>
                <option value="exam_fee">Exam Fee</option>
                <option value="material_fee">Material Fee</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="input-field text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Description</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field text-sm" placeholder="Optional description" />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary btn-sm">Add Fee</button>
              <button type="button" onClick={() => setShowAdd(false)} className="btn-sm border border-gray-200 rounded-lg text-gray-600">Cancel</button>
            </div>
          </form>
        </div>
      )}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-th">Student</th>
              <th className="table-th">Amount</th>
              <th className="table-th">Type</th>
              <th className="table-th">Due Date</th>
              <th className="table-th">Status</th>
              <th className="table-th">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {fees.map(f => (
              <tr key={f._id} className="hover:bg-gray-50">
                <td className="table-td font-medium">{f.student?.name || '—'}</td>
                <td className="table-td font-semibold text-green-700">₹{f.amount?.toLocaleString()}</td>
                <td className="table-td capitalize">{f.type?.replace('_', ' ')}</td>
                <td className="table-td">{f.dueDate ? new Date(f.dueDate).toLocaleDateString('en-IN') : '—'}</td>
                <td className="table-td">
                  <span className={`badge ${f.status === 'paid' ? 'badge-green' : f.status === 'overdue' ? 'badge-red' : 'badge-yellow'}`}>{f.status}</span>
                </td>
                <td className="table-td">
                  <div className="flex gap-2">
                    {f.status !== 'paid' && (
                      <button onClick={() => markPaid(f._id)} className="text-green-600 hover:text-green-800 p-1" title="Mark Paid"><FaCheck /></button>
                    )}
                    <button onClick={() => deleteFee(f._id)} className="text-red-400 hover:text-red-600 p-1"><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!fees.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No fees found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── TESTS TAB ───────────────────────────────────────────────────────────────
function TestsTab() {
  const [tests, setTests] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', class: 'Class 11', subject: 'Mathematics', duration: 60, questions: [] });

  const load = () => { API.get('/tests').then(r => setTests(r.data.tests || [])).catch(() => {}); };
  useEffect(() => { load(); }, []);

  const addQ = () => setForm(f => ({ ...f, questions: [...f.questions, { questionText: '', questionType: 'mcq', image: '', options: ['', '', '', ''], correctAnswer: '', marks: 1 }] }));
  const updQ = (i, k, v) => setForm(f => { const qs = [...f.questions]; qs[i] = { ...qs[i], [k]: v }; return { ...f, questions: qs }; });
  const updOpt = (qi, oi, v) => setForm(f => { const qs = [...f.questions]; qs[qi].options[oi] = v; return { ...f, questions: qs }; });
  const removeQ = (i) => setForm(f => ({ ...f, questions: f.questions.filter((_, idx) => idx !== i) }));

  const uploadImage = async (file, qi) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', 'ml_default');
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/df18s7app/image/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.secure_url) { updQ(qi, 'image', data.secure_url); toast.success('Image uploaded!'); }
      else toast.error('Upload failed');
    } catch { toast.error('Upload failed'); }
  };

  const createTest = async (e) => {
    e.preventDefault();
    if (!form.questions.length) return toast.error('Add at least one question');
    try {
      await API.post('/tests', form);
      toast.success('Test created!');
      setShowCreate(false);
      setForm({ title: '', class: 'Class 11', subject: 'Mathematics', duration: 60, questions: [] });
      load();
    } catch { toast.error('Error creating test'); }
  };

  const deleteTest = async (id) => {
    if (!window.confirm('Delete test?')) return;
    await API.delete(`/tests/${id}`);
    toast.success('Deleted'); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-2xl font-bold text-gray-800">Tests</h2>
        <button onClick={() => setShowCreate(v => !v)} className="btn-primary btn-sm flex items-center gap-2"><FaPlus /> Create Test</button>
      </div>

      {showCreate && (
        <div className="card p-5 mb-5">
          <form onSubmit={createTest} className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs text-gray-500 mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field text-sm" required />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Class</label>
                <select value={form.class} onChange={e => setForm(f => ({ ...f, class: e.target.value }))} className="input-field text-sm">
                  <option>Class 11</option><option>Class 12</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Duration (mins)</label>
                <input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) }))} className="input-field text-sm" min="1" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-gray-700 text-sm">Questions ({form.questions.length})</p>
                <button type="button" onClick={addQ} className="btn-primary btn-sm flex items-center gap-1"><FaPlus /> Add Question</button>
              </div>
              {form.questions.map((q, qi) => (
                <div key={qi} className="border border-gray-200 rounded-xl p-4 mb-3 bg-gray-50">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-1 rounded-lg">Q{qi + 1}</span>
                    <button type="button" onClick={() => removeQ(qi)} className="text-red-400 hover:text-red-600 p-1"><FaTimes /></button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Type</label>
                      <select value={q.questionType} onChange={e => updQ(qi, 'questionType', e.target.value)} className="input-field text-sm">
                        <option value="mcq">MCQ</option>
                        <option value="true_false">True/False</option>
                        <option value="short_answer">Short Answer</option>
                        <option value="long_answer">Long Answer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Question *</label>
                      <textarea value={q.questionText} onChange={e => updQ(qi, 'questionText', e.target.value)} className="input-field resize-none text-sm" rows={2} required />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Question Image (optional)</label>
                      <div className="flex items-center gap-3">
                        <input type="file" accept="image/*" onChange={e => { if (e.target.files[0]) uploadImage(e.target.files[0], qi); }} className="input-field text-sm py-1.5 flex-1" />
                        {q.image && (
                          <div className="relative">
                            <img src={q.image} alt="" className="w-16 h-16 object-cover rounded-lg border" />
                            <button type="button" onClick={() => updQ(qi, 'image', '')} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">✕</button>
                          </div>
                        )}
                      </div>
                    </div>
                    {q.questionType === 'mcq' && (
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Options</label>
                        <div className="grid grid-cols-2 gap-2">
                          {q.options.map((opt, oi) => (
                            <div key={oi} className="flex items-center gap-2">
                              <span className="text-xs text-gray-400 w-4">{String.fromCharCode(65 + oi)}.</span>
                              <input value={opt} onChange={e => updOpt(qi, oi, e.target.value)} className="input-field text-sm py-1.5 flex-1" placeholder={`Option ${String.fromCharCode(65 + oi)}`} />
                            </div>
                          ))}
                        </div>
                        <div className="mt-2">
                          <label className="block text-xs text-gray-500 mb-1">Correct Answer</label>
                          <select value={q.correctAnswer} onChange={e => updQ(qi, 'correctAnswer', e.target.value)} className="input-field text-sm">
                            <option value="">Select</option>
                            {q.options.map((opt, oi) => opt && <option key={oi} value={opt}>{String.fromCharCode(65 + oi)}. {opt}</option>)}
                          </select>
                        </div>
                      </div>
                    )}
                    {q.questionType === 'true_false' && (
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Correct Answer</label>
                        <select value={q.correctAnswer} onChange={e => updQ(qi, 'correctAnswer', e.target.value)} className="input-field text-sm">
                          <option value="">Select</option>
                          <option value="true">True</option>
                          <option value="false">False</option>
                        </select>
                      </div>
                    )}
                    {['short_answer', 'long_answer'].includes(q.questionType) && (
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Model Answer (for review)</label>
                        <textarea value={q.correctAnswer} onChange={e => updQ(qi, 'correctAnswer', e.target.value)} className="input-field resize-none text-sm" rows={2} />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Marks</label>
                      <input type="number" value={q.marks} onChange={e => updQ(qi, 'marks', parseInt(e.target.value) || 1)} className="input-field text-sm" min="1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary btn-sm">Create Test</button>
              <button type="button" onClick={() => setShowCreate(false)} className="btn-sm border border-gray-200 rounded-lg text-gray-600">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {tests.map(t => (
          <div key={t._id} className="card p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-800">{t.title}</p>
              <p className="text-gray-400 text-xs">{t.class} · {t.questions?.length} questions · {t.totalMarks} marks · {t.duration} mins</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => deleteTest(t._id)} className="text-red-400 hover:text-red-600 p-2"><FaTrash /></button>
            </div>
          </div>
        ))}
        {!tests.length && (
          <div className="card p-12 text-center text-gray-400">No tests yet. Create your first test!</div>
        )}
      </div>
    </div>
  );
}

// ─── RESULTS TAB ─────────────────────────────────────────────────────────────
function ResultsTab() {
  const [results, setResults] = useState([]);
  const [reviewing, setReviewing] = useState(null);
  const [marks, setMarks] = useState({});

  const load = () => { API.get('/results').then(r => setResults(r.data.results || [])).catch(() => {}); };
  useEffect(() => { load(); }, []);

  const openReview = (r) => {
    setReviewing(r);
    const m = {};
    r.answers.forEach(a => { m[a.questionId] = { marksAwarded: a.marksAwarded, maxMarks: a.maxMarks }; });
    setMarks(m);
  };

  const submitReview = async () => {
    const marksObj = {};
    Object.keys(marks).forEach(k => { marksObj[k] = marks[k].marksAwarded; });
    await API.put(`/results/${reviewing._id}/review`, { answers: marksObj });
    toast.success('Review saved!');
    setReviewing(null);
    load();
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-gray-800 mb-5">Test Results</h2>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-th">Student</th>
              <th className="table-th">Test</th>
              <th className="table-th">Score</th>
              <th className="table-th">Grade</th>
              <th className="table-th">Status</th>
              <th className="table-th">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {results.map(r => (
              <tr key={r._id} className="hover:bg-gray-50">
                <td className="table-td font-medium">{r.student?.name}</td>
                <td className="table-td">{r.test?.title}</td>
                <td className="table-td">{r.marksObtained}/{r.totalMarks} ({r.percentage}%)</td>
                <td className="table-td"><span className="badge badge-blue">{r.grade}</span></td>
                <td className="table-td">
                  <span className={`badge ${r.status === 'completed' || r.status === 'reviewed' ? 'badge-green' : 'badge-yellow'}`}>{r.status}</span>
                </td>
                <td className="table-td">
                  <button onClick={() => openReview(r)} className="text-blue-500 hover:text-blue-700 p-1" title="Review"><FaEye /></button>
                </td>
              </tr>
            ))}
            {!results.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No results yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto shadow-2xl">
              <div className="sticky top-0 bg-white p-5 border-b flex items-center justify-between">
                <h3 className="font-bold text-gray-800">Review: {reviewing.student?.name}</h3>
                <button onClick={() => setReviewing(null)}><FaTimes className="text-gray-400" /></button>
              </div>
              <div className="p-5 space-y-4">
                {reviewing.answers?.map((a, i) => (
                  <div key={a.questionId} className="border border-gray-100 rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Q{i + 1}: {reviewing.test?.questions?.[i]?.questionText}</p>
                    <p className="text-sm text-blue-600 mb-2">Answer: <span className="font-medium">{a.answer || '(no answer)'}</span></p>
                    <div className="flex items-center gap-3">
                      <label className="text-xs text-gray-500">Marks (max {a.maxMarks}):</label>
                      <input type="number" min={0} max={a.maxMarks} step={0.5}
                        value={marks[a.questionId]?.marksAwarded ?? a.marksAwarded}
                        onChange={e => {
                          const val = Math.max(0, Math.min(a.maxMarks, parseFloat(e.target.value) || 0));
                          setMarks(m => ({ ...m, [a.questionId]: { ...m[a.questionId], marksAwarded: val } }));
                        }}
                        onKeyDown={e => { if (e.key === '-' || e.key === '+') e.preventDefault(); }}
                        className="input-field text-sm py-1.5 w-24" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="sticky bottom-0 bg-white p-5 border-t flex gap-3">
                <button onClick={() => setReviewing(null)} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm text-gray-600">Cancel</button>
                <button onClick={submitReview} className="flex-1 btn-primary btn-sm">Save Review</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── NOTICES TAB ─────────────────────────────────────────────────────────────
function NoticesTab() {
  const [notices, setNotices] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', type: 'general', targetClass: 'all' });

  const load = () => { API.get('/notices').then(r => setNotices(r.data.notices || [])).catch(() => {}); };
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    await API.post('/notices', form);
    toast.success('Notice added!');
    setForm({ title: '', content: '', type: 'general', targetClass: 'all' });
    load();
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-gray-800 mb-5">Notices</h2>
      <div className="card p-5 mb-5">
        <h3 className="font-semibold text-gray-700 mb-3">Add Notice</h3>
        <form onSubmit={add} className="space-y-3">
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Notice title" className="input-field text-sm" required />
          <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Notice content..." className="input-field text-sm resize-none" rows={3} required />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-field text-sm">
              <option value="general">General</option>
              <option value="exam">Exam</option>
              <option value="holiday">Holiday</option>
              <option value="result">Result</option>
              <option value="important">Important</option>
            </select>
            <select value={form.targetClass} onChange={e => setForm(f => ({ ...f, targetClass: e.target.value }))} className="input-field text-sm">
              <option value="all">All</option>
              <option>Class 11</option>
              <option>Class 12</option>
            </select>
          </div>
          <button type="submit" className="btn-primary btn-sm">Post Notice</button>
        </form>
      </div>
      <div className="space-y-3">
        {notices.map(n => (
          <div key={n._id} className="card p-4 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`badge ${n.type === 'important' ? 'badge-red' : n.type === 'exam' ? 'badge-yellow' : 'badge-blue'}`}>{n.type}</span>
                <p className="font-semibold text-gray-800 text-sm">{n.title}</p>
              </div>
              <p className="text-gray-500 text-xs">{n.content}</p>
            </div>
            <button onClick={async () => { await API.delete(`/notices/${n._id}`); toast.success('Deleted'); load(); }} className="text-red-400 hover:text-red-600 shrink-0"><FaTrash /></button>
          </div>
        ))}
        {!notices.length && <div className="card p-10 text-center text-gray-400">No notices yet.</div>}
      </div>
    </div>
  );
}

// ─── MATERIALS TAB ───────────────────────────────────────────────────────────
function MaterialsTab() {
  const [materials, setMaterials] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', subject: 'Mathematics', class: 'Class 11' });
  const [file, setFile] = useState(null);

  const load = () => { API.get('/materials').then(r => setMaterials(r.data.materials || [])).catch(() => {}); };
  useEffect(() => { load(); }, []);

  const upload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Select a file');
    const fd = new FormData();
    Object.keys(form).forEach(k => fd.append(k, form[k]));
    fd.append('file', file);
    try {
      await API.post('/materials', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Material uploaded!');
      setForm({ title: '', description: '', subject: 'Mathematics', class: 'Class 11' });
      setFile(null);
      load();
    } catch { toast.error('Upload failed'); }
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-gray-800 mb-5">Study Materials</h2>
      <div className="card p-5 mb-5">
        <form onSubmit={upload} className="grid sm:grid-cols-2 gap-3">
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Material title *" className="input-field text-sm" required />
          <select value={form.class} onChange={e => setForm(f => ({ ...f, class: e.target.value }))} className="input-field text-sm">
            <option>Class 11</option><option>Class 12</option>
          </select>
          <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" className="input-field text-sm sm:col-span-2" />
          <input type="file" onChange={e => setFile(e.target.files[0])} className="input-field text-sm py-1.5 sm:col-span-2" />
          <div><button type="submit" className="btn-primary btn-sm">Upload Material</button></div>
        </form>
      </div>
      <div className="space-y-3">
        {materials.map(m => (
          <div key={m._id} className="card p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-800">{m.title}</p>
              <p className="text-gray-400 text-xs">{m.class} · {m.subject}</p>
            </div>
            <div className="flex gap-2">
              {m.fileUrl && <a href={m.fileUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 p-1"><FaEye /></a>}
              <button onClick={async () => { await API.delete(`/materials/${m._id}`); load(); }} className="text-red-400 hover:text-red-600 p-1"><FaTrash /></button>
            </div>
          </div>
        ))}
        {!materials.length && <div className="card p-10 text-center text-gray-400">No materials yet.</div>}
      </div>
    </div>
  );
}

// ─── TOPPERS TAB ─────────────────────────────────────────────────────────────
function ToppersTab() {
  const [toppers, setToppers] = useState([]);
  const [form, setForm] = useState({ name: '', class: 'Class 11', marks: '', percentage: '', year: new Date().getFullYear().toString(), rank: 1, board: 'JAC Board' });
  const [photo, setPhoto] = useState(null);

  const load = () => { API.get('/toppers').then(r => setToppers(r.data.toppers || [])).catch(() => {}); };
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.keys(form).forEach(k => fd.append(k, form[k]));
    if (photo) fd.append('photo', photo);
    try {
      await API.post('/toppers', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Topper added!');
      setForm({ name: '', class: 'Class 11', marks: '', percentage: '', year: new Date().getFullYear().toString(), rank: 1, board: 'JAC Board' });
      setPhoto(null);
      load();
    } catch { toast.error('Error'); }
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-gray-800 mb-5">Toppers</h2>
      <div className="card p-5 mb-5">
        <h3 className="font-semibold text-gray-700 mb-3">Add Topper</h3>
        <form onSubmit={add} className="grid sm:grid-cols-3 gap-3">
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Student name *" className="input-field text-sm" required />
          <select value={form.class} onChange={e => setForm(f => ({ ...f, class: e.target.value }))} className="input-field text-sm">
            <option>Class 11</option><option>Class 12</option>
          </select>
          <input value={form.percentage} onChange={e => setForm(f => ({ ...f, percentage: e.target.value }))} placeholder="Percentage (e.g. 95%)" className="input-field text-sm" />
          <input value={form.marks} onChange={e => setForm(f => ({ ...f, marks: e.target.value }))} placeholder="Marks (e.g. 475/500)" className="input-field text-sm" />
          <input value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder="Year" className="input-field text-sm" />
          <input type="number" value={form.rank} onChange={e => setForm(f => ({ ...f, rank: e.target.value }))} placeholder="Rank" className="input-field text-sm" min="1" />
          <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} className="input-field text-sm py-1.5 sm:col-span-3" />
          <div><button type="submit" className="btn-primary btn-sm">Add Topper</button></div>
        </form>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {toppers.map(t => (
          <div key={t._id} className="card p-4 text-center relative">
            <button onClick={async () => { await API.delete(`/toppers/${t._id}`); load(); }} className="absolute top-2 right-2 text-red-400 hover:text-red-600 text-xs p-1"><FaTrash /></button>
            <div className="w-16 h-16 rounded-xl mx-auto mb-2 overflow-hidden bg-blue-100 flex items-center justify-center">
              {t.photo ? <img src={t.photo} alt={t.name} className="w-full h-full object-cover" /> : <span className="text-2xl">🎓</span>}
            </div>
            <p className="font-bold text-gray-800 text-sm">{t.name}</p>
            <p className="text-blue-600 text-sm font-semibold">{t.percentage}</p>
            <p className="text-gray-400 text-xs">{t.class} · {t.year}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── GALLERY TAB ─────────────────────────────────────────────────────────────
function GalleryTab() {
  const [gallery, setGallery] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = () => { API.get('/gallery').then(r => setGallery(r.data.gallery || [])).catch(() => {}); };
  useEffect(() => { load(); }, []);

  const upload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Select an image');
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    if (title) fd.append('title', title);
    try {
      await API.post('/gallery', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Image uploaded!');
      setFile(null); setTitle('');
      load();
    } catch { toast.error('Upload failed'); } finally { setUploading(false); }
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-gray-800 mb-5">Gallery</h2>
      <div className="card p-5 mb-5">
        <form onSubmit={upload} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-xs text-gray-500 mb-1">Caption (optional)</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="input-field text-sm" />
          </div>
          <div className="flex-1 min-w-48">
            <label className="block text-xs text-gray-500 mb-1">Image *</label>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="input-field text-sm py-1.5" />
          </div>
          <button type="submit" disabled={uploading} className="btn-primary btn-sm">{uploading ? 'Uploading...' : 'Upload'}</button>
        </form>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {gallery.map(g => (
          <div key={g._id} className="relative group rounded-2xl overflow-hidden aspect-square">
            <img src={g.imageUrl} alt={g.title || ''} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
              <button onClick={async () => { await API.delete(`/gallery/${g._id}`); load(); }} className="text-white bg-red-500 rounded-full p-2"><FaTrash /></button>
            </div>
          </div>
        ))}
        {!gallery.length && <div className="col-span-4 text-center text-gray-400 py-10">No images yet.</div>}
      </div>
    </div>
  );
}

// ─── TEACHERS TAB ────────────────────────────────────────────────────────────
function TeachersTab() {
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({ name: '', subject: '', qualification: '', experience: '', bio: '' });
  const [photo, setPhoto] = useState(null);

  const load = () => { API.get('/teachers').then(r => setTeachers(r.data.teachers || [])).catch(() => {}); };
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.keys(form).forEach(k => fd.append(k, form[k]));
    if (photo) fd.append('photo', photo);
    try {
      await API.post('/teachers', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Teacher added!');
      setForm({ name: '', subject: '', qualification: '', experience: '', bio: '' });
      setPhoto(null);
      load();
    } catch { toast.error('Error'); }
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-gray-800 mb-5">Teachers / Faculty</h2>
      <div className="card p-5 mb-5">
        <h3 className="font-semibold text-gray-700 mb-3">Add Teacher</h3>
        <form onSubmit={add} className="grid sm:grid-cols-2 gap-3">
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Name *" className="input-field text-sm" required />
          <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Subject" className="input-field text-sm" />
          <input value={form.qualification} onChange={e => setForm(f => ({ ...f, qualification: e.target.value }))} placeholder="Qualification" className="input-field text-sm" />
          <input value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} placeholder="Experience" className="input-field text-sm" />
          <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Bio" className="input-field text-sm resize-none sm:col-span-2" rows={2} />
          <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} className="input-field text-sm py-1.5 sm:col-span-2" />
          <div><button type="submit" className="btn-primary btn-sm">Add Teacher</button></div>
        </form>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map(t => (
          <div key={t._id} className="card p-5 flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-blue-100 flex items-center justify-center shrink-0">
              {t.photo ? <img src={t.photo} alt={t.name} className="w-full h-full object-cover" /> : <FaChalkboardTeacher className="text-blue-500 text-2xl" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800">{t.name}</p>
              <p className="text-blue-600 text-sm">{t.subject}</p>
              <p className="text-gray-400 text-xs">{t.qualification}</p>
            </div>
            <button onClick={async () => { await API.delete(`/teachers/${t._id}`); load(); }} className="text-red-400 hover:text-red-600 shrink-0"><FaTrash /></button>
          </div>
        ))}
        {!teachers.length && <div className="col-span-3 card p-10 text-center text-gray-400">No teachers added yet.</div>}
      </div>
    </div>
  );
}

// ─── MAIN ADMIN DASHBOARD ────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const tabComponents = {
    dashboard: <DashboardTab />,
    students: <StudentsTab />,
    attendance: <AttendanceTab />,
    fees: <FeesTab />,
    tests: <TestsTab />,
    results: <ResultsTab />,
    notices: <NoticesTab />,
    materials: <MaterialsTab />,
    toppers: <ToppersTab />,
    gallery: <GalleryTab />,
    teachers: <TeachersTab />,
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-primary-950 px-4 py-3 flex items-center justify-between shadow-lg">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-primary-900 font-display font-bold text-sm">J</span>
          </div>
          <span className="text-white font-display font-bold text-sm">Jupiter Classes</span>
        </Link>
        <button onClick={() => setMobileOpen(v => !v)} className="text-white text-xl p-1">
          {mobileOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-40 bg-black/60"
            onClick={() => setMobileOpen(false)}>
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              className="w-64 h-full"
              onClick={e => e.stopPropagation()}>
              <Sidebar active={active} setActive={setActive} onLogout={handleLogout} onClose={() => setMobileOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar active={active} setActive={setActive} onLogout={handleLogout} />
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-screen overflow-auto">
        <div className="h-14 md:h-0" /> {/* Mobile top bar spacer */}
        <div className="p-4 md:p-6 max-w-6xl">
          <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {tabComponents[active]}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

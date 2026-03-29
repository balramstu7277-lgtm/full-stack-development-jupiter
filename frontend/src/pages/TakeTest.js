import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaClock, FaCheckCircle, FaArrowRight, FaArrowLeft, FaDownload, FaHome } from 'react-icons/fa';
import toast from 'react-hot-toast';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function TakeTest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef();
  const startTime = useRef(Date.now());

  useEffect(() => {
    API.get(`/tests/${id}`)
      .then(r => {
        setTest(r.data.test);
        setTimeLeft((r.data.test.duration || 60) * 60);
        setLoading(false);
      })
      .catch(() => { toast.error('Test not found'); navigate('/dashboard'); });
    return () => clearInterval(timerRef.current);
  }, [id]);

  useEffect(() => {
    if (!test || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [test, submitted]);

  const handleSubmit = async () => {
    if (submitting) return;
    clearInterval(timerRef.current);
    setSubmitting(true);
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
    try {
      const r = await API.post(`/tests/${id}/submit`, { answers, timeTaken });
      setResult(r.data.result);
      setSubmitted(true);
      toast.success('Test submitted!');
    } catch (err) {
      if (err.response?.data?.message === 'Already submitted') {
        toast.error('You have already submitted this test.');
        navigate('/dashboard');
      } else {
        toast.error('Submission failed');
      }
    } finally { setSubmitting(false); }
  };

  const downloadPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const W = doc.internal.pageSize.getWidth();

      doc.setFillColor(30, 58, 138);
      doc.rect(0, 0, W, 35, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('JUPITER CLASSES', W / 2, 14, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('of Mathematics — Hazaribagh, Jharkhand', W / 2, 21, { align: 'center' });
      doc.text('TEST RESULT', W / 2, 30, { align: 'center' });

      doc.setTextColor(30, 30, 30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(test?.title || 'Test', W / 2, 46, { align: 'center' });

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const pct = result?.percentage ?? 0;
      const grade = result?.grade ?? '—';
      const obtained = result?.marksObtained ?? 0;
      const total = result?.totalMarks ?? 0;

      const info = [
        ['Student', user?.name || '—'],
        ['Class', user?.class || '—'],
        ['Batch', user?.batch || '—'],
        ['Date', new Date().toLocaleDateString('en-IN')],
        ['Marks Obtained', `${obtained} / ${total}`],
        ['Percentage', `${pct}%`],
        ['Grade', grade],
        ['Status', result?.status || '—'],
      ];

      let y = 55;
      info.forEach(([label, val], i) => {
        if (i % 2 === 0) { doc.setFillColor(248, 250, 252); doc.rect(15, y - 4, W - 30, 8, 'F'); }
        doc.setFont('helvetica', 'bold'); doc.text(label + ':', 20, y);
        doc.setFont('helvetica', 'normal'); doc.text(String(val), 80, y);
        y += 8;
      });

      const gradeColor = pct >= 90 ? [22, 163, 74] : pct >= 60 ? [37, 99, 235] : [239, 68, 68];
      doc.setFillColor(...gradeColor);
      doc.roundedRect(W / 2 - 25, y + 4, 50, 20, 4, 4, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(`${pct}% — ${grade}`, W / 2, y + 17, { align: 'center' });

      doc.setTextColor(100);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Generated on ${new Date().toLocaleString('en-IN')}`, W / 2, y + 30, { align: 'center' });

      doc.save(`Result_${test?.title?.replace(/\s+/g, '_')}.pdf`);
      toast.success('Result downloaded!');
    } catch { toast.error('PDF failed'); }
  };

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500">Loading test...</p>
      </div>
    </div>
  );

  // ─── Result screen ───────────────────────────────────────────────────────
  if (submitted && result) {
    const pct = result.percentage;
    const grade = result.grade;
    const color = pct >= 90 ? 'text-green-600' : pct >= 60 ? 'text-blue-600' : 'text-red-600';
    const bg = pct >= 90 ? 'bg-green-50' : pct >= 60 ? 'bg-blue-50' : 'bg-red-50';

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className={`w-24 h-24 ${bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <FaCheckCircle className={`text-4xl ${color}`} />
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-800 mb-1">Test Submitted!</h2>
          <p className="text-gray-400 text-sm mb-5">{test?.title}</p>

          <div className={`${bg} rounded-2xl p-5 mb-5`}>
            <p className={`font-display font-bold text-5xl ${color} mb-1`}>{pct}%</p>
            <p className={`font-bold text-xl ${color}`}>Grade: {grade}</p>
            <p className="text-gray-500 text-sm mt-2">{result.marksObtained} / {result.totalMarks} marks</p>
          </div>

          {result.status === 'pending_review' && (
            <div className="bg-amber-50 rounded-xl p-3 mb-4 text-sm text-amber-700">
              ⏳ Some questions are pending review by the teacher. Final score may change.
            </div>
          )}

          <div className="flex gap-3">
            <Link to="/dashboard" className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium text-sm">
              <FaHome /> Dashboard
            </Link>
            <button onClick={downloadPDF} className="flex-1 btn-primary flex items-center justify-center gap-2">
              <FaDownload /> Download PDF
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Test screen ─────────────────────────────────────────────────────────
  const q = test.questions[current];
  const answered = Object.keys(answers).length;
  const progress = (answered / test.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary-950 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div>
          <p className="font-bold text-sm">{test.title}</p>
          <p className="text-blue-300 text-xs">{test.questions.length} questions · {test.totalMarks} marks</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono font-bold text-sm ${timeLeft < 300 ? 'bg-red-500' : 'bg-white/15'}`}>
          <FaClock className="text-xs" />
          {fmt(timeLeft)}
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white px-4 py-3 border-b">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>Question {current + 1} of {test.questions.length}</span>
          <span>{answered} answered</span>
        </div>
        <div className="bg-gray-100 rounded-full h-2">
          <div className="bg-primary-600 rounded-full h-2 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="card p-6 mb-4">
            <div className="flex items-start gap-3 mb-4">
              <span className="bg-primary-100 text-primary-700 font-bold text-sm px-2.5 py-1 rounded-lg shrink-0">Q{current + 1}</span>
              <div className="flex-1">
                <p className="text-gray-800 font-medium leading-relaxed">{q.questionText}</p>
                {q.image && (
                  <img src={q.image} alt="Question" className="mt-3 rounded-xl border max-w-full max-h-64 object-contain" />
                )}
              </div>
            </div>

            {/* Answer section */}
            {q.questionType === 'mcq' && (
              <div className="space-y-2">
                {q.options?.filter(o => o).map((opt, i) => (
                  <button key={i} onClick={() => setAnswers(a => ({ ...a, [q._id]: opt }))}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left text-sm font-medium transition-all
                      ${answers[q._id] === opt ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                      ${answers[q._id] === opt ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {q.questionType === 'true_false' && (
              <div className="flex gap-3">
                {['True', 'False'].map(v => (
                  <button key={v} onClick={() => setAnswers(a => ({ ...a, [q._id]: v.toLowerCase() }))}
                    className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all
                      ${answers[q._id] === v.toLowerCase() ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-100 hover:border-gray-200'}`}>
                    {v}
                  </button>
                ))}
              </div>
            )}

            {(q.questionType === 'short_answer' || q.questionType === 'long_answer') && (
              <textarea
                value={answers[q._id] || ''}
                onChange={e => setAnswers(a => ({ ...a, [q._id]: e.target.value }))}
                rows={q.questionType === 'long_answer' ? 6 : 3}
                className="input-field resize-none text-sm"
                placeholder="Type your answer here..." />
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <button onClick={() => setCurrent(c => c - 1)} disabled={current === 0} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium disabled:opacity-40 bg-white">
              <FaArrowLeft /> Prev
            </button>
            {current < test.questions.length - 1 ? (
              <button onClick={() => setCurrent(c => c + 1)} className="flex-1 btn-primary flex items-center justify-center gap-2">
                Next <FaArrowRight />
              </button>
            ) : (
              <button onClick={() => {
                if (window.confirm(`Submit test? ${answered}/${test.questions.length} answered.`)) handleSubmit();
              }} disabled={submitting} className="flex-1 btn-primary flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700">
                {submitting ? 'Submitting...' : <><FaCheckCircle /> Submit Test</>}
              </button>
            )}
          </div>

          {/* Question grid */}
          <div className="mt-5 card p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Question Navigator</p>
            <div className="flex flex-wrap gap-2">
              {test.questions.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all
                    ${i === current ? 'bg-primary-600 text-white'
                    : answers[test.questions[i]._id] ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

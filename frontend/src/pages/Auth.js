import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const BATCHES = {
  'Class 11': ['8:00 AM - 9:00 AM', '9:00 AM - 10:00 AM', '3:00 PM - 4:00 PM', '4:00 PM - 5:00 PM'],
  'Class 12': ['6:00 AM - 7:00 AM', '7:00 AM - 8:00 AM', '5:00 PM - 6:00 PM', '6:00 PM - 7:00 PM'],
};

export default function AuthPage({ mode = 'login' }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', class: '', batch: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, signup, googleLogin, user } = useAuth();
  const navigate = useNavigate();
  const isLogin = mode === 'login';

  useEffect(() => {
    document.title = isLogin ? 'Login — Jupiter Classes' : 'Enroll — Jupiter Classes';
    if (user) navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
  }, [user, navigate, isLogin]);

  useEffect(() => {
    if (form.class && BATCHES[form.class]) {
      setForm(f => ({ ...f, batch: BATCHES[form.class][0] }));
    }
  }, [form.class]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLogin && form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (!isLogin && !form.class) return toast.error('Please select your class');
    if (!isLogin && !form.batch) return toast.error('Please select your batch');
    setLoading(true);
    try {
      const u = isLogin ? await login(form.email, form.password) : await signup(form);
      toast.success(isLogin ? `Welcome back, ${u.name.split(' ')[0]}!` : `Welcome, ${u.name.split(' ')[0]}!`);
      navigate(u.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const handleGoogle = async (credentialResponse) => {
    try {
      const u = await googleLogin(credentialResponse.credential);
      toast.success(`Welcome, ${u.name.split(' ')[0]}!`);
      navigate(u.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch { toast.error('Google login failed'); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 hero-bg flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="relative z-10 text-center max-w-md">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <span className="text-primary-900 font-display font-bold text-4xl">J</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Jupiter Classes</h1>
          <p className="text-blue-200 text-lg mb-8">Mathematics by Sandeep Sir</p>
          <div className="glass rounded-2xl p-6 text-left space-y-3">
            {['500+ Board Toppers Produced', 'Class 11 & 12 Mathematics', 'JAC Board Specialist', 'Online Tests & Study Material', 'Batch-wise Attendance System', 'Google Login Supported'].map(item => (
              <div key={item} className="flex items-center gap-3 text-white/90 text-sm">
                <span className="text-green-400 text-lg shrink-0">✓</span> {item}
              </div>
            ))}
          </div>
          <div className="mt-5 glass rounded-2xl p-4 text-left">
            <p className="text-white font-semibold text-sm mb-2">📅 Available Batches</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-blue-300 text-xs font-semibold mb-1">Class 11</p>
                {BATCHES['Class 11'].map(b => <p key={b} className="text-white/70 text-xs mb-0.5">{b}</p>)}
              </div>
              <div>
                <p className="text-blue-300 text-xs font-semibold mb-1">Class 12</p>
                {BATCHES['Class 12'].map(b => <p key={b} className="text-white/70 text-xs mb-0.5">{b}</p>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 min-h-screen">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-primary-600 text-sm mb-6 transition-colors">
            <FaArrowLeft className="text-xs" /> Back to Home
          </Link>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h2 className="font-display text-2xl font-bold text-primary-900 mb-1">
              {isLogin ? 'Welcome Back!' : 'Join Jupiter Classes'}
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              {isLogin ? 'Login to access your dashboard.' : 'Create your student account to get started.'}
            </p>

            <div className="mb-6">
              <GoogleLogin onSuccess={handleGoogle} onError={() => toast.error('Google login failed')}
                width="100%" text={isLogin ? 'signin_with' : 'signup_with'} shape="rectangular" theme="outline" size="large" />
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
              <div className="relative flex justify-center text-xs"><span className="px-3 bg-white text-gray-400">or continue with email</span></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name" className="input-field" required />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="your@email.com" className="input-field" required />
              </div>
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                    <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" className="input-field" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Class *</label>
                      <select value={form.class} onChange={e => set('class', e.target.value)} className="input-field" required>
                        <option value="">Select Class</option>
                        <option>Class 11</option>
                        <option>Class 12</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Batch *</label>
                      <select value={form.batch} onChange={e => set('batch', e.target.value)} className="input-field" required disabled={!form.class}>
                        <option value="">Select Batch</option>
                        {form.class && BATCHES[form.class]?.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                  </div>
                  {form.batch && (
                    <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-700 font-medium">
                      ✅ {form.class} — {form.batch}
                    </div>
                  )}
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder={isLogin ? '••••••••' : 'Min. 6 characters'} className="input-field pr-11" required />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-60">
                {loading ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> {isLogin ? 'Logging in...' : 'Creating...'}</> : isLogin ? 'Login' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-5">
              {isLogin ? "Don't have an account? " : 'Already enrolled? '}
              <Link to={isLogin ? '/signup' : '/login'} className="text-primary-600 font-semibold hover:text-primary-800">
                {isLogin ? 'Enroll Now' : 'Login here'}
              </Link>
            </p>
            {isLogin && <p className="text-center text-xs text-gray-300 mt-3">Demo: admin@jupiterclasses.com / admin123</p>}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

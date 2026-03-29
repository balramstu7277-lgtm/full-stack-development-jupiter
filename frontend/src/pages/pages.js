import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaTrophy, FaStar, FaGraduationCap, FaClock, FaUsers, FaArrowRight,
  FaMedal, FaTimes, FaExpand, FaImages, FaPhone, FaEnvelope, FaMapMarkerAlt, FaWhatsapp,
  FaBook, FaChalkboardTeacher, FaBullseye } from 'react-icons/fa';
import API from '../utils/api';
import { Footer } from '../components/Footer';

// ─── NAVBAR ─────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-lg transition-all ${scrolled ? 'bg-primary-900 text-white' : 'bg-white text-primary-900'}`}>J</div>
          <div>
            <p className={`font-display font-bold text-sm leading-tight ${scrolled ? 'text-primary-900' : 'text-white'}`}>Jupiter Classes</p>
            <p className={`text-xs ${scrolled ? 'text-blue-400' : 'text-blue-200'}`}>of Mathematics</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {[['/', 'Home'], ['/about', 'About'], ['/toppers', 'Toppers'], ['/contact', 'Contact']].map(([to, label]) => (
            <Link key={to} to={to} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${scrolled ? 'text-gray-600 hover:text-primary-700 hover:bg-blue-50' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>{label}</Link>
          ))}
          <Link to="/login" className={`ml-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${scrolled ? 'text-primary-700 hover:bg-blue-50' : 'text-white/80 hover:text-white'}`}>Login</Link>
          <Link to="/signup" className="ml-2 btn-primary btn-sm">Enroll Now</Link>
        </div>

        {/* Mobile */}
        <button className="md:hidden" onClick={() => setMenuOpen(v => !v)}>
          <span className={`text-2xl ${scrolled ? 'text-primary-900' : 'text-white'}`}>☰</span>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-white border-t border-gray-100 px-4 py-3 shadow-lg">
            {[['/', 'Home'], ['/about', 'About'], ['/toppers', 'Toppers'], ['/contact', 'Contact'], ['/login', 'Login']].map(([to, label]) => (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                className="block py-2.5 text-sm text-gray-700 font-medium border-b border-gray-50 last:border-0">{label}</Link>
            ))}
            <Link to="/signup" onClick={() => setMenuOpen(false)} className="block mt-3 btn-primary text-center">Enroll Now</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// ─── HOME PAGE ───────────────────────────────────────────────────────────────
export function HomePage() {
  const [gallery, setGallery] = useState([]);
  const [toppers, setToppers] = useState([]);
  const [notices, setNotices] = useState([]);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    document.title = 'Jupiter Classes — Mathematics by Sandeep Sir';
    API.get('/gallery').then(r => setGallery(r.data.gallery || [])).catch(() => {});
    API.get('/toppers').then(r => setToppers((r.data.toppers || []).slice(0, 6))).catch(() => {});
    API.get('/notices').then(r => setNotices((r.data.notices || []).slice(0, 4))).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="hero-bg min-h-screen flex items-center relative overflow-hidden pt-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-20 relative z-10">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 bg-white/15 text-white text-sm font-medium px-4 py-2 rounded-full mb-6 border border-white/20">
                <FaStar className="text-yellow-400" /> #1 Mathematics Coaching in Hazaribagh
              </span>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
                Excel in <span className="text-yellow-400">Mathematics</span><br />
                with Sandeep Sir
              </h1>
              <p className="text-blue-100 text-lg md:text-xl mb-8 leading-relaxed max-w-2xl">
                Expert coaching for Class 11 &amp; 12 Mathematics. JAC Board specialist with 500+ toppers. 
                Personalized attention in small batch sizes.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/signup" className="btn-primary flex items-center gap-2 text-base px-6 py-3">
                  Enroll Now <FaArrowRight />
                </Link>
                <a href="https://wa.me/917667619141?text=Hello%20Sandeep%20Sir%2C%20I%20want%20to%20join%20Jupiter%20Classes."
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl transition-all text-base">
                  <FaWhatsapp /> WhatsApp Us
                </a>
              </div>
            </motion.div>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            {[['500+', 'Board Toppers', FaTrophy], ['8', 'Batch Timings', FaClock], ['15+', 'Years Experience', FaStar], ['100%', 'Dedication', FaBullseye]].map(([val, label, Icon]) => (
              <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="glass rounded-2xl p-4 text-center">
                <Icon className="text-yellow-400 text-2xl mx-auto mb-2" />
                <p className="font-display font-bold text-white text-2xl">{val}</p>
                <p className="text-blue-200 text-xs">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-900 mb-3">Why Choose Jupiter Classes?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">We provide the best mathematics coaching with proven results and dedicated teaching.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: FaChalkboardTeacher, title: 'Expert Teaching', desc: 'Sandeep Sir with 15+ years of experience in JAC Board Mathematics.', color: 'text-blue-500', bg: 'bg-blue-50' },
              { icon: FaUsers, title: 'Small Batches', desc: 'Max 100 students per batch ensuring personalized attention.', color: 'text-green-500', bg: 'bg-green-50' },
              { icon: FaBook, title: 'Complete Study Material', desc: 'Comprehensive notes, practice papers, and online tests.', color: 'text-purple-500', bg: 'bg-purple-50' },
              { icon: FaTrophy, title: '500+ Toppers', desc: 'Consistently producing district and state level toppers.', color: 'text-yellow-500', bg: 'bg-yellow-50' },
              { icon: FaClock, title: 'Flexible Batches', desc: 'Multiple batch timings for Class 11 and Class 12 students.', color: 'text-orange-500', bg: 'bg-orange-50' },
              { icon: FaCheckCircle, title: 'Digital Management', desc: 'Online attendance, fee payment, and result tracking system.', color: 'text-teal-500', bg: 'bg-teal-50' },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <motion.div key={title} whileHover={{ y: -4 }} className="card p-6">
                <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className={`${color} text-xl`} />
                </div>
                <h3 className="font-display font-bold text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Batch Timings */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-primary-900 mb-3">Batch Timings</h2>
            <p className="text-gray-500">Choose a batch that fits your schedule. Max 100 seats per batch.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { cls: 'Class 11', color: 'from-blue-600 to-blue-800', batches: ['8:00 AM – 9:00 AM', '9:00 AM – 10:00 AM', '3:00 PM – 4:00 PM', '4:00 PM – 5:00 PM'] },
              { cls: 'Class 12', color: 'from-purple-600 to-purple-800', batches: ['6:00 AM – 7:00 AM', '7:00 AM – 8:00 AM', '5:00 PM – 6:00 PM', '6:00 PM – 7:00 PM'] },
            ].map(({ cls, color, batches }) => (
              <div key={cls} className={`card overflow-hidden`}>
                <div className={`bg-gradient-to-r ${color} p-5`}>
                  <h3 className="font-display font-bold text-white text-xl">{cls}</h3>
                  <p className="text-white/70 text-sm">Mathematics</p>
                </div>
                <div className="p-5 space-y-3">
                  {batches.map(b => (
                    <div key={b} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FaClock className="text-blue-400 text-sm" />
                        <span className="text-sm font-medium text-gray-700">{b}</span>
                      </div>
                      <span className="badge badge-blue text-xs">Available</span>
                    </div>
                  ))}
                </div>
                <div className="px-5 pb-5">
                  <Link to="/signup" className="btn-primary w-full text-center block">Enroll for {cls}</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Toppers */}
      {toppers.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold text-primary-900 mb-3">Our Star Toppers</h2>
              <p className="text-gray-500">Proud achievements of our dedicated students</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {toppers.map(t => (
                <motion.div key={t._id} whileHover={{ y: -4 }} className="card p-4 text-center">
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-3 overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    {t.photo ? <img src={t.photo} alt={t.name} className="w-full h-full object-cover" /> : <FaGraduationCap className="text-blue-600 text-2xl" />}
                  </div>
                  <p className="font-bold text-gray-800 text-sm">{t.name}</p>
                  <p className="text-blue-600 font-semibold text-sm">{t.percentage || t.marks}</p>
                  <p className="text-gray-400 text-xs">{t.class} · {t.year}</p>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/toppers" className="btn-primary inline-flex items-center gap-2">View All Toppers <FaArrowRight /></Link>
            </div>
          </div>
        </section>
      )}

      {/* Notices */}
      {notices.length > 0 && (
        <section className="py-16 bg-blue-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-primary-900 mb-6 text-center">Latest Notices</h2>
            <div className="space-y-3">
              {notices.map(n => (
                <div key={n._id} className="card p-4 flex items-start gap-4">
                  <span className={`badge mt-0.5 ${n.type === 'important' ? 'badge-red' : n.type === 'exam' ? 'badge-yellow' : 'badge-blue'}`}>
                    {n.type}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{n.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{n.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl font-bold text-primary-900 mb-3">Gallery</h2>
              <p className="text-gray-500">Glimpses from our classroom and events</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.slice(0, 8).map(img => (
                <motion.div key={img._id} whileHover={{ scale: 1.02 }} onClick={() => setLightbox(img.imageUrl)}
                  className="aspect-square rounded-2xl overflow-hidden cursor-pointer relative group">
                  <img src={img.imageUrl} alt={img.title || 'Gallery'} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <FaExpand className="text-white text-xl" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 hero-bg">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">Ready to Excel in Mathematics?</h2>
          <p className="text-blue-200 mb-8">Join hundreds of successful students. Enroll today and secure your future.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="btn-primary text-base px-8 py-3 flex items-center justify-center gap-2">
              Enroll Now <FaArrowRight />
            </Link>
            <a href="https://wa.me/917667619141?text=Hello%20Sandeep%20Sir%2C%20I%20want%20to%20join%20Jupiter%20Classes."
              target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-xl transition-all text-base">
              <FaWhatsapp /> WhatsApp
            </a>
          </div>
        </div>
      </section>

      <Footer />

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}>
            <button className="absolute top-4 right-4 text-white text-3xl"><FaTimes /></button>
            <img src={lightbox} alt="Gallery" className="max-w-full max-h-[90vh] rounded-2xl" onClick={e => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── ABOUT PAGE ──────────────────────────────────────────────────────────────
export function AboutPage() {
  const [teachers, setTeachers] = useState([]);
  useEffect(() => {
    document.title = 'About — Jupiter Classes';
    API.get('/teachers').then(r => setTeachers(r.data.teachers || [])).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="hero-bg py-20 pt-28 text-center">
        <h1 className="font-display text-4xl font-bold text-white mb-3">About Jupiter Classes</h1>
        <p className="text-blue-200 max-w-xl mx-auto">Shaping the mathematical minds of Jharkhand since 2018</p>
      </div>

      {/* Mission */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-3xl font-bold text-primary-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Jupiter Classes of Mathematics was founded with one simple goal — make every student fall in love with Mathematics.
              Under the expert guidance of Sandeep Kumar Chatra Sir, we have consistently produced outstanding results in JAC Board examinations.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Located at Babugaon Chowk, Jabra, Hazaribagh, we have been nurturing mathematical talent since 2018 with personalized coaching and a student-first approach.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[['500+', 'Board Toppers'], ['8', 'Batch Timings'], ['15+', 'Years Teaching'], ['Class 11 & 12', 'Mathematics']].map(([val, label]) => (
                <div key={label} className="bg-blue-50 rounded-xl p-4">
                  <p className="font-display font-bold text-primary-700 text-xl">{val}</p>
                  <p className="text-gray-500 text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary-900 to-primary-700 rounded-3xl p-8 text-white">
            <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FaChalkboardTeacher className="text-white text-4xl" />
            </div>
            <h3 className="font-display text-xl font-bold text-center mb-3">Sandeep Kumar Chatra</h3>
            <p className="text-blue-200 text-center text-sm mb-4">Mathematics Expert · JAC Board Specialist</p>
            <ul className="space-y-2">
              {['15+ years of teaching experience', 'JAC Board Mathematics Expert', '500+ students coached to board toppers', 'Dedicated to student success'].map(pt => (
                <li key={pt} className="flex items-start gap-2 text-sm text-white/90">
                  <FaCheckCircle className="text-green-400 mt-0.5 shrink-0" /> {pt}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex gap-3 justify-center">
              <a href="tel:+917667619141" className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm transition-all">
                <FaPhone /> Call Now
              </a>
              <a href="https://wa.me/917667619141" target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-xl text-sm transition-all">
                <FaWhatsapp /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {teachers.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-primary-900 mb-8 text-center">Our Faculty</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachers.map(t => (
                <div key={t._id} className="card p-6 text-center">
                  <div className="w-20 h-20 rounded-2xl mx-auto mb-4 overflow-hidden bg-blue-100 flex items-center justify-center">
                    {t.photo ? <img src={t.photo} alt={t.name} className="w-full h-full object-cover" /> : <FaChalkboardTeacher className="text-blue-500 text-3xl" />}
                  </div>
                  <h3 className="font-bold text-gray-800">{t.name}</h3>
                  <p className="text-blue-600 text-sm">{t.subject}</p>
                  <p className="text-gray-400 text-xs mt-1">{t.qualification}</p>
                  {t.bio && <p className="text-gray-500 text-xs mt-2 leading-relaxed">{t.bio}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

// ─── CONTACT PAGE ────────────────────────────────────────────────────────────
export function ContactPage() {
  useEffect(() => { document.title = 'Contact — Jupiter Classes'; }, []);

  const info = [
    { icon: FaMapMarkerAlt, label: 'Address', value: 'Babugaon Chowk, Jabra, Hazaribagh, Jharkhand 825303', color: 'text-red-500', bg: 'bg-red-50', href: 'https://www.google.com/maps?q=Babugaon+Chowk,+Jabra,+Hazaribagh,+Jharkhand+825303' },
    { icon: FaPhone, label: 'Phone', value: '+91 76676 19141', color: 'text-green-600', bg: 'bg-green-50', href: 'tel:+917667619141' },
    { icon: FaWhatsapp, label: 'WhatsApp', value: '+91 76676 19141', color: 'text-green-600', bg: 'bg-green-50', href: 'https://wa.me/917667619141?text=Hello%20Sandeep%20Sir%2C%20I%20want%20to%20join%20Jupiter%20Classes.' },
    { icon: FaEnvelope, label: 'Email', value: 'sandeepkumarchatra599@gmail.com', color: 'text-blue-600', bg: 'bg-blue-50', href: 'mailto:sandeepkumarchatra599@gmail.com' },
    { icon: FaClock, label: 'Timings', value: 'Monday – Sunday: 9:00 AM – 9:00 PM', color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="hero-bg py-20 pt-28 text-center">
        <h1 className="font-display text-4xl font-bold text-white mb-3">Contact Us</h1>
        <p className="text-blue-200">We'd love to hear from you. Reach out anytime.</p>
      </div>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="font-display text-2xl font-bold text-primary-900 mb-6">Get in Touch</h2>
            <div className="space-y-4">
              {info.map(({ icon: Icon, label, value, color, bg, href }) => (
                <div key={label} className={`flex items-start gap-4 p-4 rounded-xl ${bg}`}>
                  <div className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0`}>
                    <Icon className={`${color} text-lg`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                    {href ? (
                      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className={`${color} font-semibold text-sm hover:underline`}>{value}</a>
                    ) : (
                      <p className="text-gray-700 font-semibold text-sm">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <a href="https://wa.me/917667619141?text=Hello%20Sandeep%20Sir%2C%20I%20want%20to%20join%20Jupiter%20Classes."
              target="_blank" rel="noreferrer"
              className="mt-6 flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg w-full text-base">
              <FaWhatsapp className="text-xl" /> Chat on WhatsApp
            </a>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-primary-900 mb-6">Location</h2>
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm h-80 bg-gray-100 flex items-center justify-center">
              <iframe
                title="Jupiter Classes Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.4!2d85.35!3d23.99!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDU5JzI0LjAiTiA4NcKwMjEnMDAuMCJF!5e0!3m2!1sen!2sin!4v1"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <a href="tel:+917667619141" className="flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 rounded-xl transition-all text-sm">
                <FaPhone /> Call Now
              </a>
              <Link to="/signup" className="flex items-center justify-center gap-2 btn-primary text-sm py-3">
                <FaGraduationCap /> Enroll Now
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

// ─── TOPPERS PAGE ────────────────────────────────────────────────────────────
export function TopperPage() {
  const [toppers, setToppers] = useState([]);
  useEffect(() => {
    document.title = 'Toppers — Jupiter Classes';
    API.get('/toppers').then(r => setToppers(r.data.toppers || [])).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="hero-bg py-20 pt-28 text-center">
        <h1 className="font-display text-4xl font-bold text-white mb-3">Our Star Toppers</h1>
        <p className="text-blue-200">500+ students who achieved excellence with Jupiter Classes</p>
      </div>
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {toppers.length === 0 ? (
            <div className="text-center py-20">
              <FaTrophy className="text-gray-300 text-5xl mx-auto mb-4" />
              <p className="text-gray-400">Toppers list coming soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {toppers.map((t, i) => (
                <motion.div key={t._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="card p-5 text-center hover:shadow-md transition-all">
                  {t.rank <= 3 && (
                    <div className="mb-2">
                      <FaMedal className={`mx-auto text-2xl ${t.rank === 1 ? 'text-yellow-500' : t.rank === 2 ? 'text-gray-400' : 'text-amber-600'}`} />
                    </div>
                  )}
                  <div className="w-20 h-20 rounded-2xl mx-auto mb-3 overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    {t.photo ? <img src={t.photo} alt={t.name} className="w-full h-full object-cover" /> : <FaGraduationCap className="text-blue-600 text-3xl" />}
                  </div>
                  <p className="font-bold text-gray-800">{t.name}</p>
                  <p className="text-primary-600 font-bold text-lg">{t.percentage || t.marks}</p>
                  <p className="text-gray-400 text-xs">{t.class}</p>
                  <p className="text-gray-300 text-xs">{t.board} · {t.year}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}

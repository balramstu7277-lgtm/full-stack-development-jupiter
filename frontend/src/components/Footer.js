import React from 'react';
import { Link } from 'react-router-dom';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaWhatsapp, FaYoutube, FaCode } from 'react-icons/fa';

export function Footer() {
  return (
    <footer className="bg-primary-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-primary-900 font-display font-bold text-xl">J</span>
            </div>
            <div>
              <p className="font-display font-bold text-lg leading-tight">Jupiter Classes</p>
              <p className="text-blue-300 text-xs">of Mathematics</p>
            </div>
          </div>
          <p className="text-blue-200/70 text-sm leading-relaxed mb-4">
            Expert Mathematics coaching for Class 11 &amp; 12 students. JAC Board specialist since 2018. 500+ toppers produced.
          </p>
          <a href="https://wa.me/917667619141?text=Hello%20Sandeep%20Sir%2C%20I%20want%20to%20join%20Jupiter%20Classes."
            target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all">
            <FaWhatsapp /> Chat on WhatsApp
          </a>
        </div>

        {/* Quick Links */}
        <div>
          <p className="font-display font-semibold text-base mb-4 text-white">Quick Links</p>
          <ul className="space-y-2">
            {[
              { to: '/', label: 'Home' },
              { to: '/about', label: 'About Us' },
              { to: '/toppers', label: 'Our Toppers' },
              { to: '/contact', label: 'Contact' },
              { to: '/login', label: 'Student Login' },
              { to: '/signup', label: 'Enroll Now' },
            ].map(l => (
              <li key={l.to}>
                <Link to={l.to} className="text-blue-200/70 hover:text-white text-sm transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Batches */}
        <div>
          <p className="font-display font-semibold text-base mb-4 text-white">Batch Timings</p>
          <div className="space-y-3">
            <div>
              <p className="text-blue-300 text-xs font-semibold uppercase tracking-wide mb-1">Class 11</p>
              {['8:00 AM – 9:00 AM', '9:00 AM – 10:00 AM', '3:00 PM – 4:00 PM', '4:00 PM – 5:00 PM'].map(b => (
                <p key={b} className="text-blue-200/70 text-xs mb-0.5">{b}</p>
              ))}
            </div>
            <div>
              <p className="text-blue-300 text-xs font-semibold uppercase tracking-wide mb-1">Class 12</p>
              {['6:00 AM – 7:00 AM', '7:00 AM – 8:00 AM', '5:00 PM – 6:00 PM', '6:00 PM – 7:00 PM'].map(b => (
                <p key={b} className="text-blue-200/70 text-xs mb-0.5">{b}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div>
          <p className="font-display font-semibold text-base mb-4 text-white">Contact Us</p>
          <ul className="space-y-3">
            <li>
              <a href="https://www.google.com/maps?q=Babugaon+Chowk,+Jabra,+Hazaribagh,+Jharkhand+825303"
                target="_blank" rel="noreferrer" className="flex items-start gap-2 text-blue-200/70 hover:text-white text-sm transition-colors">
                <FaMapMarkerAlt className="text-red-400 mt-0.5 shrink-0" />
                Babugaon Chowk, Jabra, Hazaribagh, Jharkhand 825303
              </a>
            </li>
            <li>
              <a href="tel:+917667619141" className="flex items-center gap-2 text-blue-200/70 hover:text-white text-sm transition-colors">
                <FaPhone className="text-green-400 shrink-0" /> +91 76676 19141
              </a>
            </li>
            <li>
              <a href="https://wa.me/917667619141" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-200/70 hover:text-white text-sm transition-colors">
                <FaWhatsapp className="text-green-400 shrink-0" /> +91 76676 19141
              </a>
            </li>
            <li>
              <a href="mailto:sandeepkumarchatra599@gmail.com" className="flex items-center gap-2 text-blue-200/70 hover:text-white text-sm transition-colors">
                <FaEnvelope className="text-blue-400 shrink-0" /> sandeepkumarchatra599@gmail.com
              </a>
            </li>
          </ul>
          <div className="mt-4 p-3 bg-white/5 rounded-xl text-xs text-blue-200/60">
            <p className="font-semibold text-blue-200/80 mb-1">⏰ Timings</p>
            <p>Monday – Sunday: 9:00 AM – 9:00 PM</p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-blue-200/50 text-xs">© 2025 Jupiter Classes of Mathematics. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-blue-200/50 text-xs">
            <FaCode className="text-blue-400" />
            Developed by <span className="text-blue-300 font-semibold">Balram Kumar Rana</span>
            <a href="tel:+918294969670" className="text-blue-300 hover:text-white transition-colors ml-1">+91 82949 69670</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

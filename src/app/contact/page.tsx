'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setName(''); setEmail(''); setPhone(''); setMessage('');
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="font-display text-5xl sm:text-6xl text-white">GET IN TOUCH</h1>
          <p className="text-text-secondary mt-3 text-lg">We&apos;d love to hear from you. Reach out via any channel below.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <form onSubmit={handleSubmit} className="bg-bg-surface rounded-2xl border border-border p-8 space-y-5">
              <h2 className="font-display text-2xl text-white tracking-wider">SEND US A MESSAGE</h2>
              <div>
                <label className="text-sm text-text-secondary mb-1 block">Full Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-accent/50" placeholder="Your name" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-text-secondary mb-1 block">Email *</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-accent/50" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="text-sm text-text-secondary mb-1 block">Phone</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-accent/50" placeholder="+91 99999 99999" />
                </div>
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-1 block">Message *</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={5}
                  className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-accent/50 resize-none" placeholder="Your message..." />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-accent text-bg-primary py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-accent-hover transition-colors disabled:opacity-50">
                <Send size={18} /> {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-6">
            {[
              { icon: <MapPin className="text-accent" size={24} />, title: 'Visit Our Store', lines: ['Sector 14, Gurugram', 'Haryana 122001, India'] },
              { icon: <Phone className="text-accent" size={24} />, title: 'Call Us', lines: ['+91 99999 99999', '+91 88888 88888'] },
              { icon: <Mail className="text-accent" size={24} />, title: 'Email Us', lines: ['info@urbansports.in', 'orders@urbansports.in'] },
              { icon: <Clock className="text-accent" size={24} />, title: 'Business Hours', lines: ['Mon - Sat: 10:00 AM - 8:00 PM', 'Sunday: 11:00 AM - 6:00 PM'] },
            ].map((item) => (
              <div key={item.title} className="bg-bg-surface rounded-2xl border border-border p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-display text-lg text-white tracking-wider">{item.title.toUpperCase()}</h3>
                  {item.lines.map((line, i) => (
                    <p key={i} className="text-text-secondary text-sm mt-1">{line}</p>
                  ))}
                </div>
              </div>
            ))}

            {/* Map embed */}
            <div className="bg-bg-surface rounded-2xl border border-border overflow-hidden h-64">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3507.5!2d77.02!3d28.47!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sSector%2014%2C%20Gurugram!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade" title="Urban Sports Location"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Testimonial } from '@/lib/utils';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/testimonials')
      .then(r => r.json())
      .then(d => setTestimonials(d.testimonials || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="font-display text-5xl sm:text-6xl text-white">CUSTOMER REVIEWS</h1>
          <p className="text-text-secondary mt-3 text-lg">What our customers say about Urban Sports Studio</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(null).map((_, i) => (
              <div key={i} className="skeleton h-48 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-bg-surface rounded-2xl border border-border p-6 hover:border-accent/20 transition-all"
              >
                <div className="flex gap-1 mb-3">
                  {Array(5).fill(null).map((_, j) => (
                    <Star key={j} size={16} className={j < t.rating ? 'text-accent fill-accent' : 'text-white/20'} />
                  ))}
                </div>
                <p className="text-white/90 leading-relaxed mb-4">&quot;{t.review}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent font-bold text-sm">
                    {t.customer_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{t.customer_name}</p>
                    <p className="text-text-secondary text-xs">{t.city}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

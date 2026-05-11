'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface TestimonialRow {
  id: string; customer_name: string; city: string; rating: number; review: string; is_active: number; display_order: number;
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<TestimonialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [city, setCity] = useState('');
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');

  const fetchTestimonials = () => {
    setLoading(true);
    fetch('/api/testimonials').then(r => r.json()).then(d => setTestimonials(d.testimonials || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTestimonials(); }, []);

  const resetForm = () => { setCustomerName(''); setCity(''); setRating(5); setReview(''); setDisplayOrder('0'); setEditing(null); setShowNew(false); };

  const handleCreate = async () => {
    if (!customerName || !review) { toast.error('Name and review are required'); return; }
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_name: customerName, city, rating, review, display_order: parseInt(displayOrder) || 0 }),
      });
      if (res.ok) { toast.success('Testimonial created!'); resetForm(); fetchTestimonials(); }
    } catch { toast.error('Failed to create'); }
  };

  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_name: customerName, city, rating, review, display_order: parseInt(displayOrder) || 0 }),
      });
      if (res.ok) { toast.success('Testimonial updated!'); resetForm(); fetchTestimonials(); }
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    try {
      await fetch(`/api/testimonials/${id}`, { method: 'DELETE' });
      toast.success('Deleted'); fetchTestimonials();
    } catch { toast.error('Failed to delete'); }
  };

  const startEdit = (t: TestimonialRow) => {
    setEditing(t.id); setCustomerName(t.customer_name); setCity(t.city); setRating(t.rating); setReview(t.review); setDisplayOrder(String(t.display_order)); setShowNew(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-text-primary">TESTIMONIALS</h1>
        <button onClick={() => { resetForm(); setShowNew(true); }}
          className="flex items-center gap-2 bg-accent text-bg-primary px-5 py-2.5 rounded-xl font-semibold hover:bg-accent-hover transition-colors">
          <Plus size={18} /> Add Testimonial
        </button>
      </div>

      {(showNew || editing) && (
        <div className="bg-bg-surface rounded-2xl border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-text-primary tracking-wider">{editing ? 'EDIT TESTIMONIAL' : 'NEW TESTIMONIAL'}</h2>
            <button onClick={resetForm} className="p-2 text-text-secondary hover:text-text-primary"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-text-secondary mb-1 block">Customer Name *</label>
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent/50" placeholder="Arjun Mehta" />
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1 block">City</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent/50" placeholder="Delhi" />
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1 block">Rating</label>
              <div className="flex gap-1 pt-2">
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setRating(s)} className="p-1">
                    <Star size={20} className={s <= rating ? 'text-accent fill-accent' : 'text-white/20'} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm text-text-secondary mb-1 block">Review *</label>
            <textarea value={review} onChange={(e) => setReview(e.target.value)} rows={3}
              className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent/50 resize-none" />
          </div>
          <button onClick={() => editing ? handleUpdate(editing) : handleCreate()}
            className="flex items-center gap-2 bg-accent text-bg-primary px-6 py-3 rounded-xl font-semibold hover:bg-accent-hover transition-colors">
            <Save size={16} /> {editing ? 'Update' : 'Create'}
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{Array(3).fill(null).map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-4">
          {testimonials.map(t => (
            <div key={t.id} className="bg-bg-surface rounded-2xl border border-border p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex gap-1 mb-2">
                    {Array(5).fill(null).map((_, j) => (
                      <Star key={j} size={14} className={j < t.rating ? 'text-accent fill-accent' : 'text-white/20'} />
                    ))}
                  </div>
                  <p className="text-white/80 text-sm mb-2">&quot;{t.review}&quot;</p>
                  <p className="text-text-primary text-sm font-medium">{t.customer_name} <span className="text-text-secondary font-normal">— {t.city}</span></p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => startEdit(t)} className="p-2 text-text-secondary hover:text-accent transition-colors"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(t.id)} className="p-2 text-text-secondary hover:text-danger transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface BannerRow {
  id: string; headline: string; subtext: string; cta_label: string; cta_link: string; bg_color: string; is_active: number; display_order: number;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<BannerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  const [headline, setHeadline] = useState('');
  const [subtext, setSubtext] = useState('');
  const [ctaLabel, setCtaLabel] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [bgColor, setBgColor] = useState('#C8F53A');
  const [displayOrder, setDisplayOrder] = useState('0');

  const fetchBanners = () => {
    setLoading(true);
    fetch('/api/banners').then(r => r.json()).then(d => setBanners(d.banners || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchBanners(); }, []);

  const resetForm = () => { setHeadline(''); setSubtext(''); setCtaLabel(''); setCtaLink(''); setBgColor('#C8F53A'); setDisplayOrder('0'); setEditing(null); setShowNew(false); };

  const handleCreate = async () => {
    if (!headline) { toast.error('Headline is required'); return; }
    try {
      const res = await fetch('/api/banners', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headline, subtext, cta_label: ctaLabel, cta_link: ctaLink, bg_color: bgColor, display_order: parseInt(displayOrder) || 0 }),
      });
      if (res.ok) { toast.success('Banner created!'); resetForm(); fetchBanners(); }
    } catch { toast.error('Failed to create'); }
  };

  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch(`/api/banners/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headline, subtext, cta_label: ctaLabel, cta_link: ctaLink, bg_color: bgColor, display_order: parseInt(displayOrder) || 0 }),
      });
      if (res.ok) { toast.success('Banner updated!'); resetForm(); fetchBanners(); }
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    try { await fetch(`/api/banners/${id}`, { method: 'DELETE' }); toast.success('Deleted'); fetchBanners(); } catch { toast.error('Failed to delete'); }
  };

  const startEdit = (b: BannerRow) => {
    setEditing(b.id); setHeadline(b.headline); setSubtext(b.subtext || ''); setCtaLabel(b.cta_label || ''); setCtaLink(b.cta_link || ''); setBgColor(b.bg_color || '#C8F53A'); setDisplayOrder(String(b.display_order)); setShowNew(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-white">BANNERS</h1>
        <button onClick={() => { resetForm(); setShowNew(true); }}
          className="flex items-center gap-2 bg-accent text-bg-primary px-5 py-2.5 rounded-xl font-semibold hover:bg-accent-hover transition-colors">
          <Plus size={18} /> Add Banner
        </button>
      </div>

      {(showNew || editing) && (
        <div className="bg-bg-surface rounded-2xl border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-white tracking-wider">{editing ? 'EDIT BANNER' : 'NEW BANNER'}</h2>
            <button onClick={resetForm} className="p-2 text-text-secondary hover:text-white"><X size={18} /></button>
          </div>
          <div>
            <label className="text-sm text-text-secondary mb-1 block">Headline *</label>
            <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)}
              className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50"
              placeholder="SEASON SALE: Up to 40% OFF" />
          </div>
          <div>
            <label className="text-sm text-text-secondary mb-1 block">Subtext</label>
            <input type="text" value={subtext} onChange={(e) => setSubtext(e.target.value)}
              className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50"
              placeholder="Limited time offer!" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-text-secondary mb-1 block">CTA Label</label>
              <input type="text" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50"
                placeholder="Shop Now" />
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1 block">CTA Link</label>
              <input type="text" value={ctaLink} onChange={(e) => setCtaLink(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50"
                placeholder="/products" />
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1 block">Display Order</label>
              <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50" />
            </div>
          </div>
          <button onClick={() => editing ? handleUpdate(editing) : handleCreate()}
            className="flex items-center gap-2 bg-accent text-bg-primary px-6 py-3 rounded-xl font-semibold hover:bg-accent-hover transition-colors">
            <Save size={16} /> {editing ? 'Update' : 'Create'} Banner
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{Array(2).fill(null).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
      ) : banners.length === 0 ? (
        <div className="text-center py-12 text-text-secondary">No banners yet</div>
      ) : (
        <div className="space-y-4">
          {banners.map(b => (
            <div key={b.id} className="bg-bg-surface rounded-2xl border border-border p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-accent font-display text-xl">{b.headline}</h3>
                  {b.subtext && <p className="text-text-secondary text-sm mt-1">{b.subtext}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-text-secondary">
                    {b.cta_label && <span>CTA: {b.cta_label} → {b.cta_link}</span>}
                    <span>Order: {b.display_order}</span>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => startEdit(b)} className="p-2 text-text-secondary hover:text-accent transition-colors"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(b.id)} className="p-2 text-text-secondary hover:text-danger transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

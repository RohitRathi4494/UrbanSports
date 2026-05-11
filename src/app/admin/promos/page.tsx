'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

interface PromoRow {
  id: string; code: string; discount_type: string; discount_value: number; min_order_value: number;
  expiry_date: string; usage_limit: number; usage_count: number; is_active: number;
}

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<PromoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('0');
  const [expiryDate, setExpiryDate] = useState('');
  const [usageLimit, setUsageLimit] = useState('0');

  const fetchPromos = () => {
    setLoading(true);
    fetch('/api/promos').then(r => r.json()).then(d => setPromos(d.promos || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPromos(); }, []);

  const resetForm = () => { setCode(''); setDiscountType('percentage'); setDiscountValue(''); setMinOrderValue('0'); setExpiryDate(''); setUsageLimit('0'); setShowNew(false); };

  const handleCreate = async () => {
    if (!code || !discountValue) { toast.error('Code and discount value are required'); return; }
    try {
      const res = await fetch('/api/promos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code, discount_type: discountType, discount_value: parseFloat(discountValue),
          min_order_value: parseFloat(minOrderValue) || 0, expiry_date: expiryDate || null,
          usage_limit: parseInt(usageLimit) || 0,
        }),
      });
      if (res.ok) { toast.success('Promo code created!'); resetForm(); fetchPromos(); }
    } catch { toast.error('Failed to create'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this promo code?')) return;
    try { await fetch(`/api/promos/${id}`, { method: 'DELETE' }); toast.success('Deleted'); fetchPromos(); } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-text-primary">PROMO CODES</h1>
        <button onClick={() => { resetForm(); setShowNew(true); }}
          className="flex items-center gap-2 bg-accent text-bg-primary px-5 py-2.5 rounded-xl font-semibold hover:bg-accent-hover transition-colors">
          <Plus size={18} /> Add Promo
        </button>
      </div>

      {showNew && (
        <div className="bg-bg-surface rounded-2xl border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-text-primary tracking-wider">NEW PROMO CODE</h2>
            <button onClick={resetForm} className="p-2 text-text-secondary hover:text-text-primary"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-text-secondary mb-1 block">Code *</label>
              <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent/50 uppercase font-mono"
                placeholder="SUMMER10" />
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1 block">Discount Type</label>
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent/50">
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1 block">Discount Value *</label>
              <input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent/50"
                placeholder={discountType === 'percentage' ? '10' : '200'} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-text-secondary mb-1 block">Min Order Value (₹)</label>
              <input type="number" value={minOrderValue} onChange={(e) => setMinOrderValue(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent/50" />
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1 block">Expiry Date</label>
              <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent/50" />
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1 block">Usage Limit (0 = unlimited)</label>
              <input type="number" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent/50" />
            </div>
          </div>
          <button onClick={handleCreate}
            className="flex items-center gap-2 bg-accent text-bg-primary px-6 py-3 rounded-xl font-semibold hover:bg-accent-hover transition-colors">
            <Save size={16} /> Create Promo Code
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{Array(3).fill(null).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : promos.length === 0 ? (
        <div className="text-center py-12 text-text-secondary">No promo codes yet</div>
      ) : (
        <div className="bg-bg-surface rounded-2xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs text-text-secondary uppercase tracking-wider">Code</th>
                <th className="text-left px-4 py-3 text-xs text-text-secondary uppercase tracking-wider">Discount</th>
                <th className="text-left px-4 py-3 text-xs text-text-secondary uppercase tracking-wider hidden sm:table-cell">Min Order</th>
                <th className="text-left px-4 py-3 text-xs text-text-secondary uppercase tracking-wider hidden md:table-cell">Expiry</th>
                <th className="text-left px-4 py-3 text-xs text-text-secondary uppercase tracking-wider hidden sm:table-cell">Usage</th>
                <th className="text-left px-4 py-3 text-xs text-text-secondary uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs text-text-secondary uppercase tracking-wider">Del</th>
              </tr>
            </thead>
            <tbody>
              {promos.map(p => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-accent font-mono font-bold text-sm">{p.code}</td>
                  <td className="px-4 py-3 text-text-primary text-sm">{p.discount_type === 'percentage' ? `${p.discount_value}%` : formatPrice(p.discount_value)}</td>
                  <td className="px-4 py-3 text-text-secondary text-sm hidden sm:table-cell">{formatPrice(p.min_order_value)}</td>
                  <td className="px-4 py-3 text-text-secondary text-sm hidden md:table-cell">{p.expiry_date || '—'}</td>
                  <td className="px-4 py-3 text-text-secondary text-sm hidden sm:table-cell">{p.usage_count}/{p.usage_limit || '∞'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-lg ${p.is_active ? 'bg-success/10 text-success' : 'bg-white/5 text-text-secondary'}`}>
                      {p.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-text-secondary hover:text-danger transition-colors"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

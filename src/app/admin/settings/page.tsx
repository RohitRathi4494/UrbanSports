'use client';

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => setSettings(d.settings || {}))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) toast.success('Settings saved!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) return <div className="space-y-4">{Array(4).fill(null).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-display text-3xl text-text-primary">SETTINGS</h1>

      {/* Store Info */}
      <div className="bg-bg-surface rounded-2xl border border-border p-6 space-y-4">
        <h2 className="font-display text-lg text-text-primary tracking-wider">STORE INFORMATION</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-text-secondary mb-1 block">Store Name</label>
            <input type="text" value={settings.store_name || ''} onChange={(e) => updateSetting('store_name', e.target.value)}
              className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent/50" />
          </div>
          <div>
            <label className="text-sm text-text-secondary mb-1 block">Store Email</label>
            <input type="email" value={settings.store_email || ''} onChange={(e) => updateSetting('store_email', e.target.value)}
              className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent/50" />
          </div>
        </div>
        <div>
          <label className="text-sm text-text-secondary mb-1 block">GST Number</label>
          <input type="text" value={settings.gst_number || ''} onChange={(e) => updateSetting('gst_number', e.target.value)}
            className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent/50" />
        </div>
      </div>

      {/* WhatsApp */}
      <div className="bg-bg-surface rounded-2xl border border-border p-6 space-y-4">
        <h2 className="font-display text-lg text-text-primary tracking-wider">WHATSAPP</h2>
        <div>
          <label className="text-sm text-text-secondary mb-1 block">WhatsApp Number (with country code, no +)</label>
          <input type="text" value={settings.whatsapp_number || ''} onChange={(e) => updateSetting('whatsapp_number', e.target.value)}
            className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent/50"
            placeholder="919999999999" />
          <p className="text-text-secondary text-xs mt-1">This number is used across all WhatsApp links on the website.</p>
        </div>
      </div>

      {/* Delivery */}
      <div className="bg-bg-surface rounded-2xl border border-border p-6 space-y-4">
        <h2 className="font-display text-lg text-text-primary tracking-wider">DELIVERY CHARGES</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-text-secondary mb-1 block">Free Delivery Above (₹)</label>
            <input type="number" value={settings.delivery_free_above || ''} onChange={(e) => updateSetting('delivery_free_above', e.target.value)}
              className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent/50" />
          </div>
          <div>
            <label className="text-sm text-text-secondary mb-1 block">Delivery Charge (₹)</label>
            <input type="number" value={settings.delivery_charge || ''} onChange={(e) => updateSetting('delivery_charge', e.target.value)}
              className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent/50" />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-bg-surface rounded-2xl border border-border p-6 space-y-4">
        <h2 className="font-display text-lg text-text-primary tracking-wider">SOCIAL MEDIA</h2>
        <div>
          <label className="text-sm text-text-secondary mb-1 block">Instagram URL</label>
          <input type="url" value={settings.instagram_url || ''} onChange={(e) => updateSetting('instagram_url', e.target.value)}
            className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent/50" />
        </div>
        <div>
          <label className="text-sm text-text-secondary mb-1 block">YouTube URL</label>
          <input type="url" value={settings.youtube_url || ''} onChange={(e) => updateSetting('youtube_url', e.target.value)}
            className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent/50" />
        </div>
        <div>
          <label className="text-sm text-text-secondary mb-1 block">Facebook URL</label>
          <input type="url" value={settings.facebook_url || ''} onChange={(e) => updateSetting('facebook_url', e.target.value)}
            className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent/50" />
        </div>
      </div>

      {/* Razorpay (display only) */}
      <div className="bg-bg-surface rounded-2xl border border-border p-6 space-y-4">
        <h2 className="font-display text-lg text-text-primary tracking-wider">PAYMENT (RAZORPAY)</h2>
        <div className="bg-accent/5 border border-accent/10 rounded-xl p-4">
          <p className="text-text-secondary text-sm">Razorpay keys are configured via environment variables for security.</p>
          <p className="text-text-secondary text-xs mt-2">
            <code className="text-accent/70">RAZORPAY_KEY_ID</code> and <code className="text-accent/70">RAZORPAY_KEY_SECRET</code> in <code className="text-accent/70">.env.local</code>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-bg-surface rounded-2xl border border-border p-6 space-y-4">
        <h2 className="font-display text-lg text-text-primary tracking-wider">FOOTER</h2>
        <div>
          <label className="text-sm text-text-secondary mb-1 block">Footer Text</label>
          <input type="text" value={settings.footer_text || ''} onChange={(e) => updateSetting('footer_text', e.target.value)}
            className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent/50" />
        </div>
      </div>

      {/* Save */}
      <button onClick={handleSave} disabled={saving}
        className="flex items-center gap-2 bg-accent text-bg-primary px-8 py-3.5 rounded-xl font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50">
        <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}

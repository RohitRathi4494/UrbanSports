'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { generateSlug } from '@/lib/utils';
import toast from 'react-hot-toast';

interface CategoryRow {
  id: string; name: string; slug: string; description: string; display_order: number; is_active: number; product_count?: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');

  const fetchCategories = () => {
    setLoading(true);
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const resetForm = () => { setName(''); setSlug(''); setDescription(''); setDisplayOrder('0'); setEditing(null); setShowNew(false); };

  const handleCreate = async () => {
    if (!name) { toast.error('Name is required'); return; }
    try {
      const res = await fetch('/api/categories', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug: slug || generateSlug(name), description, display_order: parseInt(displayOrder) || 0 }),
      });
      if (res.ok) { toast.success('Category created!'); resetForm(); fetchCategories(); }
    } catch { toast.error('Failed to create'); }
  };

  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, description, display_order: parseInt(displayOrder) || 0 }),
      });
      if (res.ok) { toast.success('Category updated!'); resetForm(); fetchCategories(); }
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Delete "${catName}"?`)) return;
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      toast.success('Category deleted'); fetchCategories();
    } catch { toast.error('Failed to delete'); }
  };

  const startEdit = (cat: CategoryRow) => {
    setEditing(cat.id); setName(cat.name); setSlug(cat.slug); setDescription(cat.description || ''); setDisplayOrder(String(cat.display_order)); setShowNew(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-text-primary">CATEGORIES</h1>
        <button onClick={() => { resetForm(); setShowNew(true); }}
          className="flex items-center gap-2 bg-accent text-bg-primary px-5 py-2.5 rounded-xl font-semibold hover:bg-accent-hover transition-colors">
          <Plus size={18} /> Add Category
        </button>
      </div>

      {/* New / Edit Form */}
      {(showNew || editing) && (
        <div className="bg-bg-surface rounded-2xl border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-text-primary tracking-wider">{editing ? 'EDIT CATEGORY' : 'NEW CATEGORY'}</h2>
            <button onClick={resetForm} className="p-2 text-text-secondary hover:text-text-primary"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-text-secondary mb-1 block">Name *</label>
              <input type="text" value={name} onChange={(e) => { setName(e.target.value); if (!editing) setSlug(generateSlug(e.target.value)); }}
                className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent/50" />
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1 block">Slug</label>
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent/50" />
            </div>
          </div>
          <div>
            <label className="text-sm text-text-secondary mb-1 block">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent/50 resize-none" />
          </div>
          <div className="w-32">
            <label className="text-sm text-text-secondary mb-1 block">Display Order</label>
            <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)}
              className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent/50" />
          </div>
          <button onClick={() => editing ? handleUpdate(editing) : handleCreate()}
            className="flex items-center gap-2 bg-accent text-bg-primary px-6 py-3 rounded-xl font-semibold hover:bg-accent-hover transition-colors">
            <Save size={16} /> {editing ? 'Update' : 'Create'} Category
          </button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">{Array(4).fill(null).map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
      ) : (
        <div className="bg-bg-surface rounded-2xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs text-text-secondary uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs text-text-secondary uppercase tracking-wider hidden sm:table-cell">Slug</th>
                <th className="text-left px-4 py-3 text-xs text-text-secondary uppercase tracking-wider hidden md:table-cell">Products</th>
                <th className="text-left px-4 py-3 text-xs text-text-secondary uppercase tracking-wider hidden md:table-cell">Order</th>
                <th className="text-right px-4 py-3 text-xs text-text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id} className="border-b border-border last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-text-primary text-sm font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-text-secondary text-sm hidden sm:table-cell">{cat.slug}</td>
                  <td className="px-4 py-3 text-text-secondary text-sm hidden md:table-cell">{cat.product_count ?? '—'}</td>
                  <td className="px-4 py-3 text-text-secondary text-sm hidden md:table-cell">{cat.display_order}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => startEdit(cat)} className="p-2 text-text-secondary hover:text-accent transition-colors"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(cat.id, cat.name)} className="p-2 text-text-secondary hover:text-danger transition-colors"><Trash2 size={16} /></button>
                    </div>
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

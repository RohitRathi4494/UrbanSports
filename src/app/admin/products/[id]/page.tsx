'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, X, Save, Upload } from 'lucide-react';
import { Category, Product, generateSlug } from '@/lib/utils';
import { CldUploadWidget } from 'next-cloudinary';
import toast from 'react-hot-toast';

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>(['']);
  const [features, setFeatures] = useState<string[]>(['']);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([{ key: '', value: '' }]);
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [stock, setStock] = useState('10');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [status, setStatus] = useState('active');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [tags, setTags] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  useEffect(() => {
    if (name && !slug) setSlug(generateSlug(name));
  }, [name, slug]);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch(`/api/products/${productId}`).then(r => r.json()),
    ]).then(([catData, prodData]) => {
      setCategories(catData.categories || []);
      if (prodData.product) {
        const p: Product = prodData.product;
        setName(p.name);
        setSlug(p.slug);
        setCategoryId(p.category_id || '');
        setBrand(p.brand || '');
        setSku(p.sku || '');
        setDescription(p.description || '');
        setImages(p.images?.length ? p.images : ['']);
        setFeatures(p.features?.length ? p.features : ['']);
        const specEntries = p.specifications ? Object.entries(p.specifications).map(([key, value]) => ({ key, value })) : [{ key: '', value: '' }];
        setSpecs(specEntries.length ? specEntries : [{ key: '', value: '' }]);
        setPrice(String(p.price));
        setMrp(String(p.mrp));
        setStock(String(p.stock));
        setLowStockThreshold(String(p.low_stock_threshold));
        setStatus(p.status);
        setIsFeatured(p.is_featured);
        setIsNewArrival(p.is_new_arrival);
        setTags((p.tags || []).join(', '));
        setMetaTitle(p.meta_title || '');
        setMetaDescription(p.meta_description || '');
      }
    }).finally(() => setLoading(false));
  }, [productId]);

  const handleSave = async () => {
    if (!name || !price || !mrp) {
      toast.error('Name, price, and MRP are required');
      return;
    }
    setSaving(true);
    try {
      const specsObj: Record<string, string> = {};
      specs.forEach(s => { if (s.key.trim()) specsObj[s.key.trim()] = s.value.trim(); });

      const finalImages = images.map(i => i.trim()).filter(Boolean);
      if (finalImages.length === 0) {
        toast.error('At least 1 image is required');
        setSaving(false);
        return;
      }
      if (finalImages.length > 6) {
        toast.error('Maximum 6 images allowed');
        setSaving(false);
        return;
      }

      const body = {
        name, slug, category_id: categoryId || null, brand, sku, description,
        features: features.filter(f => f.trim()),
        specifications: specsObj,
        price: parseFloat(price), mrp: parseFloat(mrp),
        images: finalImages,
        stock: parseInt(stock) || 0,
        low_stock_threshold: parseInt(lowStockThreshold) || 5,
        status, is_featured: isFeatured, is_new_arrival: isNewArrival,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        meta_title: metaTitle || `${name} | Urban Sports`,
        meta_description: metaDescription,
      };

      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success('Product updated!');
        router.push('/admin/products');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="space-y-4">{Array(4).fill(null).map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 text-text-secondary hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-display text-3xl text-white">EDIT PRODUCT</h1>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-bg-surface rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-display text-lg text-white tracking-wider">BASIC INFORMATION</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-text-secondary mb-1 block">Product Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50" />
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1 block">Slug</label>
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-text-secondary mb-1 block">Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50">
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1 block">Brand</label>
              <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50" />
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1 block">SKU</label>
              <input type="text" value={sku} onChange={(e) => setSku(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50" />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-bg-surface rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-display text-lg text-white tracking-wider">DESCRIPTION</h2>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6}
            className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 resize-none"
            placeholder="Product description (supports HTML)..." />
        </div>

        {/* Images */}
        <div className="bg-bg-surface rounded-2xl border border-border p-6 space-y-4">
          <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-4">
            <div>
              <h2 className="font-display text-lg text-white tracking-wider">PRODUCT IMAGES</h2>
              <p className="text-sm text-text-secondary">Upload product images (Minimum 1, Maximum 6).</p>
            </div>
            {images.length < 6 && (
              <CldUploadWidget 
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                options={{ maxFiles: 6 - images.length, clientAllowedFormats: ['jpg', 'png', 'jpeg', 'webp'] }}
                onSuccess={(result) => {
                  if (result.info && typeof result.info === 'object' && 'secure_url' in result.info) {
                    setImages(prev => {
                      // Filter out empty strings if any existed from before
                      const current = prev.filter(p => p.trim() !== '');
                      return [...current, (result.info as any).secure_url];
                    });
                  }
                }}
              >
                {({ open }) => (
                  <button onClick={(e) => { e.preventDefault(); open(); }} className="flex items-center justify-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-lg font-medium hover:bg-accent/20 transition-colors border border-accent/20">
                    <Upload size={16} /> Upload Images
                  </button>
                )}
              </CldUploadWidget>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-2">
            {images.filter(img => img.trim() !== '').map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border group bg-bg-primary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={`Product ${i+1}`} className="w-full h-full object-cover" />
                <button 
                  onClick={() => setImages(images.filter((_, j) => j !== i))}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-danger text-white rounded-lg backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {images.filter(img => img.trim() !== '').length === 0 && (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center bg-bg-primary/50">
                <Upload size={32} className="text-text-secondary mb-3 opacity-50" />
                <p className="text-text-secondary">No images uploaded yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="bg-bg-surface rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-display text-lg text-white tracking-wider">KEY FEATURES</h2>
          {features.map((f, i) => (
            <div key={i} className="flex gap-2">
              <input type="text" value={f} onChange={(e) => {
                const copy = [...features]; copy[i] = e.target.value; setFeatures(copy);
              }}
                className="flex-1 bg-bg-primary border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent/50"
                placeholder={`Feature ${i + 1}`} />
              <button onClick={() => setFeatures(features.filter((_, j) => j !== i))}
                className="p-2 text-text-secondary hover:text-danger"><X size={16} /></button>
            </div>
          ))}
          <button onClick={() => setFeatures([...features, ''])}
            className="flex items-center gap-1 text-accent text-sm hover:underline"><Plus size={14} /> Add Feature</button>
        </div>

        {/* Specifications */}
        <div className="bg-bg-surface rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-display text-lg text-white tracking-wider">SPECIFICATIONS</h2>
          {specs.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input type="text" value={s.key} onChange={(e) => {
                const copy = [...specs]; copy[i] = { ...copy[i], key: e.target.value }; setSpecs(copy);
              }}
                className="flex-1 bg-bg-primary border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent/50"
                placeholder="Key" />
              <input type="text" value={s.value} onChange={(e) => {
                const copy = [...specs]; copy[i] = { ...copy[i], value: e.target.value }; setSpecs(copy);
              }}
                className="flex-1 bg-bg-primary border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent/50"
                placeholder="Value" />
              <button onClick={() => setSpecs(specs.filter((_, j) => j !== i))}
                className="p-2 text-text-secondary hover:text-danger"><X size={16} /></button>
            </div>
          ))}
          <button onClick={() => setSpecs([...specs, { key: '', value: '' }])}
            className="flex items-center gap-1 text-accent text-sm hover:underline"><Plus size={14} /> Add Spec</button>
        </div>

        {/* Pricing */}
        <div className="bg-bg-surface rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-display text-lg text-white tracking-wider">PRICING & INVENTORY</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-text-secondary mb-1 block">Selling Price (₹) *</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50" />
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1 block">MRP (₹) *</label>
              <input type="number" value={mrp} onChange={(e) => setMrp(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50" />
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1 block">Stock</label>
              <input type="number" value={stock} onChange={(e) => setStock(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50" />
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1 block">Low Stock Alert</label>
              <input type="number" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50" />
            </div>
          </div>
          {price && mrp && parseFloat(mrp) > parseFloat(price) && (
            <p className="text-accent text-sm">
              Discount: {Math.round(((parseFloat(mrp) - parseFloat(price)) / parseFloat(mrp)) * 100)}% off
            </p>
          )}
        </div>

        {/* Status */}
        <div className="bg-bg-surface rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-display text-lg text-white tracking-wider">STATUS & VISIBILITY</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-text-secondary mb-1 block">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
            <label className="flex items-center gap-3 cursor-pointer pt-6">
              <div className={`w-5 h-5 rounded border ${isFeatured ? 'bg-accent border-accent' : 'border-border'} flex items-center justify-center`}>
                {isFeatured && <svg className="w-3 h-3 text-bg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <span className="text-sm text-text-secondary">Featured (Best Sellers)</span>
              <input type="checkbox" className="hidden" checked={isFeatured} onChange={() => setIsFeatured(!isFeatured)} />
            </label>
            <label className="flex items-center gap-3 cursor-pointer pt-6">
              <div className={`w-5 h-5 rounded border ${isNewArrival ? 'bg-accent border-accent' : 'border-border'} flex items-center justify-center`}>
                {isNewArrival && <svg className="w-3 h-3 text-bg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <span className="text-sm text-text-secondary">New Arrival</span>
              <input type="checkbox" className="hidden" checked={isNewArrival} onChange={() => setIsNewArrival(!isNewArrival)} />
            </label>
          </div>
          <div>
            <label className="text-sm text-text-secondary mb-1 block">Tags (comma-separated)</label>
            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)}
              className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50" />
          </div>
        </div>

        {/* SEO */}
        <div className="bg-bg-surface rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-display text-lg text-white tracking-wider">SEO</h2>
          <div>
            <label className="text-sm text-text-secondary mb-1 block">Meta Title</label>
            <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)}
              className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50" />
          </div>
          <div>
            <label className="text-sm text-text-secondary mb-1 block">Meta Description</label>
            <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={2}
              className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 resize-none" />
          </div>
        </div>

        {/* Save */}
        <div className="flex gap-4">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-accent text-bg-primary px-8 py-3.5 rounded-xl font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50">
            <Save size={18} /> {saving ? 'Saving...' : 'Update Product'}
          </button>
          <Link href="/admin/products"
            className="flex items-center gap-2 border border-border text-white px-8 py-3.5 rounded-xl font-medium hover:bg-white/5 transition-colors">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}

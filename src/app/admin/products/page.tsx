'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Product, formatPrice, calculateDiscount } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProducts = () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '100' });
    if (search) params.set('search', search);
    fetch(`/api/products?${params.toString()}`)
      .then(r => r.json())
      .then(d => setProducts(d.products || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, [search]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      toast.success('Product deleted');
      fetchProducts();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-display text-3xl text-white">PRODUCTS</h1>
        <Link href="/admin/products/new"
          className="flex items-center gap-2 bg-accent text-bg-primary px-5 py-2.5 rounded-xl font-semibold hover:bg-accent-hover transition-colors">
          <Plus size={18} /> Add Product
        </Link>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..." className="w-full bg-bg-surface border border-border rounded-xl pl-12 pr-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-accent/50" />
      </div>

      {loading ? (
        <div className="space-y-3">{Array(5).fill(null).map((_, i) => (<div key={i} className="skeleton h-16 rounded-xl" />))}</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-text-secondary">No products found</div>
      ) : (
        <div className="bg-bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs text-text-secondary uppercase tracking-wider">Product</th>
                  <th className="text-left px-4 py-3 text-xs text-text-secondary uppercase tracking-wider hidden sm:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-xs text-text-secondary uppercase tracking-wider">Price</th>
                  <th className="text-left px-4 py-3 text-xs text-text-secondary uppercase tracking-wider hidden md:table-cell">Stock</th>
                  <th className="text-left px-4 py-3 text-xs text-text-secondary uppercase tracking-wider hidden md:table-cell">Status</th>
                  <th className="text-right px-4 py-3 text-xs text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-border last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-bg-surface-light rounded-lg flex-shrink-0 flex items-center justify-center text-white/20 text-xs">IMG</div>
                        <div>
                          <p className="text-white text-sm font-medium truncate max-w-[200px]">{product.name}</p>
                          <p className="text-text-secondary text-xs">{product.brand} • {product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-sm hidden sm:table-cell">{product.category_name}</td>
                    <td className="px-4 py-3">
                      <p className="text-accent text-sm font-medium">{formatPrice(product.price)}</p>
                      {product.mrp > product.price && (
                        <p className="text-text-secondary text-xs line-through">{formatPrice(product.mrp)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-sm ${product.stock <= (product.low_stock_threshold || 5) ? 'text-warning font-medium' : 'text-text-secondary'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs px-2 py-1 rounded-lg ${
                        product.status === 'active' ? 'bg-success/10 text-success' :
                        product.status === 'out_of_stock' ? 'bg-danger/10 text-danger' :
                        'bg-white/5 text-text-secondary'
                      }`}>
                        {product.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/products/${product.id}`}
                          className="p-2 text-text-secondary hover:text-accent transition-colors">
                          <Edit size={16} />
                        </Link>
                        <button onClick={() => handleDelete(product.id, product.name)}
                          className="p-2 text-text-secondary hover:text-danger transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

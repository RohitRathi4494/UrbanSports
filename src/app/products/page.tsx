'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Filter, X, ChevronDown } from 'lucide-react';
import ProductCard from '@/components/shop/ProductCard';
import { Product, Category } from '@/lib/utils';

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filters
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [inStock, setInStock] = useState(searchParams.get('in_stock') === '1');
  const search = searchParams.get('search') || '';

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (brand) params.set('brand', brand);
      if (sort) params.set('sort', sort);
      if (minPrice) params.set('min_price', minPrice);
      if (maxPrice) params.set('max_price', maxPrice);
      if (inStock) params.set('in_stock', '1');
      if (search) params.set('search', search);
      params.set('page', String(page));
      params.set('limit', '20');

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setBrands(data.brands || []);
      setLoading(false);
    }
    fetchProducts();
  }, [category, brand, sort, minPrice, maxPrice, inStock, search, page]);

  const clearFilters = () => {
    setCategory('');
    setBrand('');
    setMinPrice('');
    setMaxPrice('');
    setInStock(false);
    setSort('newest');
    setPage(1);
  };

  const hasFilters = category || brand || minPrice || maxPrice || inStock;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl sm:text-5xl text-text-primary">
            {search ? `SEARCH: "${search.toUpperCase()}"` : 'ALL PRODUCTS'}
          </h1>
          <p className="text-text-secondary mt-2">{total} products found</p>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar Filters */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg text-text-primary tracking-wider">FILTERS</h3>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-accent text-xs hover:underline">Clear All</button>
                )}
              </div>

              {/* Category */}
              <div>
                <h4 className="text-sm font-medium text-text-primary mb-3">Category</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => { setCategory(''); setPage(1); }}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!category ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { setCategory(cat.slug); setPage(1); }}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${category === cat.slug ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand */}
              {brands.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-text-primary mb-3">Brand</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => { setBrand(''); setPage(1); }}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!brand ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}
                    >
                      All Brands
                    </button>
                    {brands.map((b) => (
                      <button
                        key={b}
                        onClick={() => { setBrand(b); setPage(1); }}
                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${brand === b ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div>
                <h4 className="text-sm font-medium text-text-primary mb-3">Price Range</h4>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                    className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent/50"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                    className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent/50"
                  />
                </div>
              </div>

              {/* In Stock */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`w-5 h-5 rounded border ${inStock ? 'bg-accent border-accent' : 'border-border'} flex items-center justify-center transition-colors`}>
                  {inStock && <svg className="w-3 h-3 text-bg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className="text-sm text-text-secondary">In Stock Only</span>
                <input type="checkbox" className="hidden" checked={inStock} onChange={() => { setInStock(!inStock); setPage(1); }} />
              </label>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort bar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <button
                onClick={() => setFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 bg-bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary"
              >
                <Filter size={16} /> Filters {hasFilters && <span className="w-2 h-2 bg-accent rounded-full" />}
              </button>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-text-secondary text-sm hidden sm:inline">Sort by:</span>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => { setSort(e.target.value); setPage(1); }}
                    className="appearance-none bg-bg-surface border border-border rounded-xl px-4 py-2.5 pr-10 text-sm text-text-primary focus:outline-none focus:border-accent/50 cursor-pointer"
                  >
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price: Low → High</option>
                    <option value="price_desc">Price: High → Low</option>
                    <option value="name">Name A-Z</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Loading skeletons */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {Array(6).fill(null).map((_, i) => (
                  <div key={i} className="skeleton aspect-[3/4] rounded-2xl" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🏏</div>
                <h3 className="font-display text-2xl text-text-primary mb-2">NO PRODUCTS FOUND</h3>
                <p className="text-text-secondary mb-6">Try adjusting your filters or search terms</p>
                <button onClick={clearFilters} className="text-accent hover:underline">Clear all filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {products.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${p === page ? 'bg-accent text-bg-primary' : 'bg-bg-surface border border-border text-text-primary hover:border-accent/30'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {filtersOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50 lg:hidden" onClick={() => setFiltersOpen(false)} />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            className="fixed top-0 left-0 bottom-0 w-80 bg-bg-surface z-50 lg:hidden overflow-y-auto p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl text-text-primary">FILTERS</h3>
              <button onClick={() => setFiltersOpen(false)} className="p-2 text-white/70"><X size={20} /></button>
            </div>
            {/* Same filter content as desktop */}
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-text-primary mb-3">Category</h4>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setCategory(cat.slug); setPage(1); setFiltersOpen(false); }}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${category === cat.slug ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              <button
                onClick={() => { clearFilters(); setFiltersOpen(false); }}
                className="w-full bg-accent text-bg-primary py-3 rounded-xl font-semibold"
              >
                Clear All Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="skeleton w-20 h-20 rounded-full" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}

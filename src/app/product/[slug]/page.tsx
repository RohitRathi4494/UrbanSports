'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Minus, Plus, Star, ChevronRight, Share2, Heart } from 'lucide-react';
import ProductCard from '@/components/shop/ProductCard';
import { Product, formatPrice, calculateDiscount } from '@/lib/utils';
import { useCartStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'features'>('description');
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${slug}`);
        const data = await res.json();
        if (data.product) {
          setProduct(data.product);
          setRelated(data.related || []);
        }
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="skeleton aspect-square rounded-3xl" />
            <div className="space-y-4">
              <div className="skeleton h-8 w-32 rounded-lg" />
              <div className="skeleton h-12 w-3/4 rounded-lg" />
              <div className="skeleton h-6 w-1/2 rounded-lg" />
              <div className="skeleton h-24 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl text-white mb-4">PRODUCT NOT FOUND</h1>
          <Link href="/products" className="text-accent hover:underline">Browse all products</Link>
        </div>
      </div>
    );
  }

  const discount = calculateDiscount(product.mrp, product.price);
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999';
  const waMessage = `Hi! I'd like to order: *${product.name}* | Price: ${formatPrice(product.price)} | Link: ${typeof window !== 'undefined' ? window.location.href : ''}`;

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${product.name} added to cart!`, {
      style: { background: '#1A1A1A', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
      iconTheme: { primary: '#C8F53A', secondary: '#0A0A0A' },
    });
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-secondary mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link href="/products" className="hover:text-white transition-colors">Products</Link>
          {product.category_name && (
            <>
              <ChevronRight size={14} />
              <Link href={`/category/${product.category_slug}`} className="hover:text-white transition-colors">
                {product.category_name}
              </Link>
            </>
          )}
          <ChevronRight size={14} />
          <span className="text-white truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Product */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="aspect-square bg-bg-surface rounded-3xl border border-border overflow-hidden flex items-center justify-center relative">
              <div className="text-center p-8">
                <svg className="w-32 h-32 mx-auto mb-4 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="text-white/30 text-lg">{product.brand} — {product.name}</span>
              </div>
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-accent text-bg-primary text-sm font-bold px-3 py-1.5 rounded-xl">
                  -{discount}% OFF
                </div>
              )}
              {product.is_new_arrival && (
                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm text-white text-sm font-medium px-3 py-1.5 rounded-xl border border-white/20">
                  NEW ARRIVAL
                </div>
              )}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Brand & Category */}
            <div className="flex items-center gap-3">
              {product.brand && (
                <span className="bg-accent/10 text-accent text-xs font-semibold px-3 py-1 rounded-lg uppercase tracking-wider">
                  {product.brand}
                </span>
              )}
              {product.category_name && (
                <span className="bg-white/5 text-text-secondary text-xs px-3 py-1 rounded-lg">
                  {product.category_name}
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="font-display text-3xl sm:text-4xl text-white leading-tight">{product.name.toUpperCase()}</h1>

            {/* SKU */}
            {product.sku && (
              <p className="text-text-secondary text-sm">SKU: {product.sku}</p>
            )}

            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="font-display text-4xl text-accent">{formatPrice(product.price)}</span>
              {product.mrp > product.price && (
                <>
                  <span className="text-xl text-text-secondary line-through">{formatPrice(product.mrp)}</span>
                  <span className="bg-accent/10 text-accent text-sm font-semibold px-2 py-0.5 rounded-lg">
                    Save {formatPrice(product.mrp - product.price)}
                  </span>
                </>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <span className="w-2 h-2 bg-success rounded-full" />
                  <span className="text-success text-sm font-medium">
                    In Stock {product.stock <= (product.low_stock_threshold || 5) ? `— Only ${product.stock} left!` : ''}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-danger rounded-full" />
                  <span className="text-danger text-sm font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Quantity */}
            {product.stock > 0 && (
              <div>
                <label className="text-sm text-text-secondary mb-2 block">Quantity</label>
                <div className="flex items-center gap-1 w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-bg-surface border border-border rounded-lg flex items-center justify-center text-white hover:border-accent/30 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    className="w-16 h-10 bg-bg-surface border border-border rounded-lg text-center text-white focus:outline-none focus:border-accent/50"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 bg-bg-surface border border-border rounded-lg flex items-center justify-center text-white hover:border-accent/30 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              {product.stock > 0 && (
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 bg-accent text-bg-primary py-4 rounded-xl font-semibold text-lg hover:bg-accent-hover transition-all hover:shadow-lg hover:shadow-accent/20"
                >
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
              )}
              <a
                href={`https://wa.me/${phone}?text=${encodeURIComponent(waMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#20BD5A] transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Buy via WhatsApp
              </a>
            </div>

            {/* Share / Wishlist */}
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: product.name, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied to clipboard!');
                  }
                }}
                className="flex items-center gap-2 text-text-secondary hover:text-white text-sm transition-colors"
              >
                <Share2 size={16} /> Share
              </button>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="flex border-b border-border">
            {(['description', 'features', 'specs'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium capitalize transition-colors relative ${
                  activeTab === tab ? 'text-accent' : 'text-text-secondary hover:text-white'
                }`}
              >
                {tab === 'specs' ? 'Specifications' : tab}
                {activeTab === tab && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                )}
              </button>
            ))}
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div
                className="prose prose-invert max-w-none text-text-secondary leading-relaxed [&_h3]:text-white [&_h3]:font-display [&_h3]:text-2xl [&_h3]:mb-4 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:ml-5"
                dangerouslySetInnerHTML={{ __html: product.description || '<p>No description available.</p>' }}
              />
            )}

            {activeTab === 'features' && (
              <ul className="space-y-3">
                {(product.features || []).map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                    <span className="text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>
            )}

            {activeTab === 'specs' && product.specifications && (
              <div className="bg-bg-surface rounded-2xl border border-border overflow-hidden">
                {Object.entries(product.specifications).map(([key, value], i) => (
                  <div key={key} className={`flex ${i > 0 ? 'border-t border-border' : ''}`}>
                    <div className="w-1/3 sm:w-1/4 px-4 py-3 text-sm font-medium text-white bg-white/[0.02]">
                      {key}
                    </div>
                    <div className="flex-1 px-4 py-3 text-sm text-text-secondary">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-3xl text-white mb-8">RELATED PRODUCTS</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

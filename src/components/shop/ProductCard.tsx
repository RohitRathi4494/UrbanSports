'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { formatPrice, calculateDiscount, Product } from '@/lib/utils';
import { useCartStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const discount = calculateDiscount(product.mrp, product.price);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    toast.success(`${product.name} added to cart!`, {
      style: {
        background: '#1A1A1A',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.1)',
      },
      iconTheme: {
        primary: '#C8F53A',
        secondary: '#0A0A0A',
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/product/${product.slug}`} className="group block h-full">
        <div className="product-card bg-bg-surface rounded-2xl border border-border overflow-hidden hover:border-accent/30 transition-all duration-300 hover:shadow-xl hover:shadow-accent/5 flex flex-col h-full">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-bg-surface-light flex-shrink-0">
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-bg-surface-light to-bg-surface product-image transition-transform duration-500">
              <div className="text-center p-6">
                <svg className="w-16 h-16 mx-auto mb-2 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="text-xs text-white/30 font-medium">{product.brand}</span>
              </div>
            </div>

            {/* Discount badge */}
            {discount > 0 && (
              <div className="absolute top-3 left-3 bg-accent text-bg-primary text-xs font-bold px-2.5 py-1 rounded-lg z-10">
                -{discount}%
              </div>
            )}

            {/* New arrival badge */}
            {product.is_new_arrival && (
              <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-sm text-text-primary text-xs font-medium px-2.5 py-1 rounded-lg border border-white/20 z-10">
                NEW
              </div>
            )}

            {/* Stock status overlay */}
            {product.stock <= 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                <span className="text-text-primary font-semibold text-sm bg-danger/80 px-4 py-2 rounded-lg">Out of Stock</span>
              </div>
            )}
          </div>

          {/* Info + Button */}
          <div className="px-6 py-5 flex flex-col flex-1">
            {/* Product details */}
            <div className="flex-1 min-h-0 mb-5">
              {product.brand && (
                <span className="text-xs text-text-secondary uppercase tracking-widest block mb-1.5">{product.brand}</span>
              )}
              <h3 className="text-base font-medium text-text-primary line-clamp-2 group-hover:text-accent transition-colors leading-snug min-h-[3rem]">
                {product.name}
              </h3>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <span className="text-lg font-bold text-accent">{formatPrice(product.price)}</span>
                {product.mrp > product.price && (
                  <span className="text-sm text-text-secondary line-through">{formatPrice(product.mrp)}</span>
                )}
              </div>
              {product.stock > 0 && product.stock <= (product.low_stock_threshold || 5) && (
                <p className="text-xs text-warning mt-2 font-medium">Only {product.stock} left!</p>
              )}
            </div>

            {/* Add to Cart — always visible at the bottom with spacing */}
            <div className="mt-auto pt-2 pb-1">
              {product.stock > 0 ? (
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-accent text-bg-primary py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-accent-hover transition-all duration-200 shadow-lg shadow-accent/10"
                >
                  <ShoppingCart size={18} />
                  Add to Cart
                </button>
              ) : (
                <div className="w-full bg-white/10 border border-white/5 text-text-secondary py-3 rounded-xl text-sm font-semibold text-center cursor-not-allowed">
                  Out of Stock
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

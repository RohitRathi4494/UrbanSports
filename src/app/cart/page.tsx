'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState('');
  const [deliveryCharge, setDeliveryCharge] = useState(0);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const subtotal = getSubtotal();
    setDeliveryCharge(subtotal >= 999 ? 0 : 79);
  }, [mounted, items, getSubtotal]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    try {
      const res = await fetch('/api/promos/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, subtotal: getSubtotal() }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setDiscount(data.discount);
        setPromoApplied(promoCode.toUpperCase());
        toast.success(data.message);
      } else {
        toast.error(data.error || 'Invalid promo code');
      }
    } catch {
      toast.error('Failed to validate promo code');
    }
  };

  if (!mounted) return <div className="min-h-screen" />;

  const subtotal = getSubtotal();
  const total = subtotal + deliveryCharge - discount;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart size={64} className="mx-auto text-white/20 mb-6" />
          <h1 className="font-display text-4xl text-white mb-4">YOUR CART IS EMPTY</h1>
          <p className="text-text-secondary mb-8">Looks like you haven&apos;t added anything yet.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-accent text-bg-primary px-8 py-4 rounded-xl font-semibold hover:bg-accent-hover transition-colors"
          >
            Continue Shopping <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl sm:text-5xl text-white mb-8">YOUR CART</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, i) => (
              <motion.div
                key={item.product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-bg-surface rounded-2xl border border-border p-4 sm:p-6 flex gap-4"
              >
                {/* Product image placeholder */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-bg-surface-light rounded-xl flex-shrink-0 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link href={`/product/${item.product.slug}`} className="text-white font-medium hover:text-accent transition-colors line-clamp-2">
                        {item.product.name}
                      </Link>
                      {item.product.brand && (
                        <p className="text-text-secondary text-sm mt-0.5">{item.product.brand}</p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        removeItem(item.product.id);
                        toast.success('Item removed from cart');
                      }}
                      className="p-2 text-text-secondary hover:text-danger transition-colors flex-shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-end justify-between mt-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 bg-bg-primary border border-border rounded-lg flex items-center justify-center text-white hover:border-accent/30 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-white text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 bg-bg-primary border border-border rounded-lg flex items-center justify-center text-white hover:border-accent/30 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-accent font-bold">{formatPrice(item.product.price * item.quantity)}</p>
                      {item.product.mrp > item.product.price && (
                        <p className="text-text-secondary text-xs line-through">{formatPrice(item.product.mrp * item.quantity)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            <Link href="/products" className="text-accent text-sm hover:underline">
              ← Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-bg-surface rounded-2xl border border-border p-6 space-y-4">
              <h3 className="font-display text-xl text-white tracking-wider">ORDER SUMMARY</h3>
              
              {/* Promo Code */}
              <div>
                <label className="text-sm text-text-secondary mb-2 block">Promo Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 bg-bg-primary border border-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-text-secondary focus:outline-none focus:border-accent/50"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="bg-accent/10 text-accent px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-accent/20 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoApplied && (
                  <p className="text-success text-xs mt-2">✓ {promoApplied} applied — you save {formatPrice(discount)}</p>
                )}
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Subtotal</span>
                  <span className="text-white">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Delivery</span>
                  <span className={deliveryCharge === 0 ? 'text-success' : 'text-white'}>
                    {deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Discount</span>
                    <span className="text-success">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-semibold text-white">Total</span>
                  <span className="font-display text-2xl text-accent">{formatPrice(total)}</span>
                </div>
              </div>

              {subtotal > 0 && subtotal < 999 && (
                <p className="text-xs text-text-secondary bg-accent/5 border border-accent/10 rounded-xl p-3">
                  Add {formatPrice(999 - subtotal)} more for <span className="text-accent font-medium">FREE delivery!</span>
                </p>
              )}

              <Link
                href={`/checkout${promoApplied ? `?promo=${promoApplied}&discount=${discount}` : ''}`}
                className="block w-full bg-accent text-bg-primary py-4 rounded-xl font-semibold text-center text-lg hover:bg-accent-hover transition-colors"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

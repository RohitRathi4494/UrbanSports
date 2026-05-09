'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, ShoppingCart, Package } from 'lucide-react';
import { Order, formatPrice } from '@/lib/utils';

export default function OrderConfirmationPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${params.id}`);
        const data = await res.json();
        setOrder(data.order);
      } catch (error) {
        console.error('Failed to load order:', error);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="skeleton w-20 h-20 rounded-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl text-white mb-4">ORDER NOT FOUND</h1>
          <Link href="/products" className="text-accent hover:underline">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999';

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle size={40} className="text-accent" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 className="font-display text-4xl sm:text-5xl text-white mb-2">ORDER CONFIRMED! 🏏</h1>
          <p className="text-text-secondary text-lg mb-8">Thank you for your order. We&apos;ll get it to you soon!</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-bg-surface rounded-2xl border border-border p-6 text-left space-y-4 mb-8"
        >
          <div className="flex items-center justify-between">
            <span className="text-text-secondary text-sm">Order Number</span>
            <span className="text-white font-mono font-bold">{order.order_number}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary text-sm">Payment Method</span>
            <span className="text-white capitalize">{order.payment_method === 'whatsapp_cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary text-sm">Payment Status</span>
            <span className={`text-sm font-medium px-2 py-0.5 rounded-lg ${order.payment_status === 'paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
              {order.payment_status.toUpperCase()}
            </span>
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-text-secondary">{item.name} × {item.quantity}</span>
                <span className="text-white">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-3 flex justify-between">
            <span className="font-semibold text-white">Total</span>
            <span className="font-display text-2xl text-accent">{formatPrice(order.total)}</span>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-sm text-text-secondary">
              <strong className="text-white">Shipping to:</strong><br />
              {order.customer_name}<br />
              {order.shipping_address?.address}, {order.shipping_address?.city}<br />
              {order.shipping_address?.state} - {order.shipping_address?.pincode}
            </p>
          </div>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={`https://wa.me/${phone}?text=${encodeURIComponent(`Hi, I'd like to track my order #${order.order_number}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#20BD5A] transition-colors"
          >
            <Package size={18} />
            Track via WhatsApp
          </a>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 bg-accent text-bg-primary px-6 py-3 rounded-xl font-semibold hover:bg-accent-hover transition-colors"
          >
            <ShoppingCart size={18} />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

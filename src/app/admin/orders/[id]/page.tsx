'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, MessageCircle } from 'lucide-react';
import { Order, formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [fulfillmentStatus, setFulfillmentStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then(r => r.json())
      .then(d => {
        if (d.order) {
          setOrder(d.order);
          setFulfillmentStatus(d.order.fulfillment_status);
          setPaymentStatus(d.order.payment_status);
          setAdminNotes(d.order.admin_notes || '');
        }
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fulfillment_status: fulfillmentStatus, payment_status: paymentStatus, admin_notes: adminNotes }),
      });
      if (res.ok) {
        toast.success('Order updated!');
        setOrder(prev => prev ? { ...prev, fulfillment_status: fulfillmentStatus as Order['fulfillment_status'], payment_status: paymentStatus as Order['payment_status'], admin_notes: adminNotes } : null);
      }
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="space-y-4">{Array(3).fill(null).map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div>;
  if (!order) return <div className="text-center py-12 text-text-secondary">Order not found</div>;

  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999';

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className="p-2 text-text-secondary hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-display text-3xl text-white">ORDER {order.order_number}</h1>
          <p className="text-text-secondary text-sm">
            Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-bg-surface rounded-2xl border border-border p-6">
            <h2 className="font-display text-lg text-white tracking-wider mb-4">ORDER ITEMS</h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="w-12 h-12 bg-bg-surface-light rounded-lg flex-shrink-0 flex items-center justify-center text-white/20 text-xs">IMG</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{item.name}</p>
                    <p className="text-text-secondary text-xs">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                  <p className="text-accent font-medium text-sm">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-text-secondary">Subtotal</span><span className="text-white">{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Delivery</span><span className="text-white">{order.delivery_charge === 0 ? 'FREE' : formatPrice(order.delivery_charge)}</span></div>
              {order.discount > 0 && <div className="flex justify-between"><span className="text-text-secondary">Discount {order.promo_code && `(${order.promo_code})`}</span><span className="text-success">-{formatPrice(order.discount)}</span></div>}
              <div className="flex justify-between border-t border-border pt-2 font-semibold"><span className="text-white">Total</span><span className="text-accent text-lg">{formatPrice(order.total)}</span></div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-bg-surface rounded-2xl border border-border p-6">
            <h2 className="font-display text-lg text-white tracking-wider mb-4">CUSTOMER DETAILS</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-text-secondary">Name</p>
                <p className="text-white font-medium">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-text-secondary">Phone</p>
                <p className="text-white font-medium">{order.customer_phone}</p>
              </div>
              <div>
                <p className="text-text-secondary">Email</p>
                <p className="text-white font-medium">{order.customer_email || '—'}</p>
              </div>
              <div>
                <p className="text-text-secondary">Shipping Address</p>
                <p className="text-white font-medium">
                  {order.shipping_address?.address}, {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <a
                href={`https://wa.me/${order.customer_phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${order.customer_name}, regarding your Urban Sports order #${order.order_number}...`)}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#20BD5A] transition-colors"
              >
                <MessageCircle size={16} /> Send WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Right col — Update */}
        <div className="space-y-6">
          <div className="bg-bg-surface rounded-2xl border border-border p-6 space-y-4">
            <h2 className="font-display text-lg text-white tracking-wider">UPDATE ORDER</h2>
            <div>
              <label className="text-sm text-text-secondary mb-1 block">Fulfillment Status</label>
              <select value={fulfillmentStatus} onChange={(e) => setFulfillmentStatus(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50">
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="packed">Packed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1 block">Payment Status</label>
              <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50">
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1 block">Admin Notes</label>
              <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={3}
                className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 resize-none text-sm"
                placeholder="Internal notes..." />
            </div>
            <button onClick={handleUpdate} disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-accent text-bg-primary py-3 rounded-xl font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50">
              <Save size={16} /> {saving ? 'Saving...' : 'Update Order'}
            </button>
          </div>

          {/* Payment Info */}
          <div className="bg-bg-surface rounded-2xl border border-border p-6 space-y-3">
            <h2 className="font-display text-lg text-white tracking-wider">PAYMENT INFO</h2>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-text-secondary">Method</span>
                <span className="text-white capitalize">{order.payment_method === 'whatsapp_cod' ? 'COD / WhatsApp' : 'Razorpay'}</span>
              </div>
              {order.razorpay_payment_id && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Transaction ID</span>
                  <span className="text-white font-mono text-xs">{order.razorpay_payment_id}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

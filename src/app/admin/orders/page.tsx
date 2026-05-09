'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { Eye } from 'lucide-react';

interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total: number;
  payment_method: string;
  payment_status: string;
  fulfillment_status: string;
  created_at: string;
  items: { quantity: number }[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter) params.set('fulfillment_status', filter);
    fetch(`/api/orders?${params.toString()}`)
      .then(r => r.json())
      .then(d => setOrders(d.orders || []))
      .finally(() => setLoading(false));
  }, [filter]);

  const statusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-success/10 text-success';
      case 'shipped': case 'packed': case 'confirmed': return 'bg-accent/10 text-accent';
      case 'cancelled': return 'bg-danger/10 text-danger';
      default: return 'bg-warning/10 text-warning';
    }
  };

  const paymentColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-success/10 text-success';
      case 'failed': return 'bg-danger/10 text-danger';
      default: return 'bg-warning/10 text-warning';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-display text-3xl text-white">ORDERS</h1>
        <div className="flex gap-2 flex-wrap">
          {['', 'pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? 'bg-accent text-bg-primary' : 'bg-bg-surface border border-border text-text-secondary hover:text-white'}`}>
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{Array(5).fill(null).map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-text-secondary">No orders found</div>
      ) : (
        <div className="bg-bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs text-text-secondary uppercase tracking-wider">Order</th>
                  <th className="text-left px-4 py-3 text-xs text-text-secondary uppercase tracking-wider hidden sm:table-cell">Customer</th>
                  <th className="text-left px-4 py-3 text-xs text-text-secondary uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th className="text-left px-4 py-3 text-xs text-text-secondary uppercase tracking-wider">Total</th>
                  <th className="text-left px-4 py-3 text-xs text-text-secondary uppercase tracking-wider hidden sm:table-cell">Payment</th>
                  <th className="text-left px-4 py-3 text-xs text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs text-text-secondary uppercase tracking-wider">View</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <p className="text-white text-sm font-mono">{order.order_number}</p>
                      <p className="text-text-secondary text-xs sm:hidden">{order.customer_name}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-white text-sm">{order.customer_name}</p>
                      <p className="text-text-secondary text-xs">{order.customer_phone}</p>
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-sm hidden md:table-cell">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-accent text-sm font-medium">{formatPrice(order.total)}</p>
                      <p className="text-text-secondary text-xs">{order.items.reduce((s, i) => s + i.quantity, 0)} items</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`text-xs px-2 py-1 rounded-lg ${paymentColor(order.payment_status)}`}>
                        {order.payment_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-lg ${statusColor(order.fulfillment_status)}`}>
                        {order.fulfillment_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/orders/${order.id}`} className="p-2 text-text-secondary hover:text-accent transition-colors inline-block">
                        <Eye size={16} />
                      </Link>
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

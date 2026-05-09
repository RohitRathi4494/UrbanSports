'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ShoppingCart, DollarSign, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface Stats {
  totalOrders: number;
  todayOrders: number;
  monthOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  monthRevenue: number;
  totalProducts: number;
  activeProducts: number;
}

interface LowStockItem {
  id: string;
  name: string;
  stock: number;
  low_stock_threshold: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => {
        setStats(data.stats);
        setLowStock(data.lowStock || []);
        setRecentOrders(data.recentOrders || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(null).map((_, i) => (<div key={i} className="skeleton h-32 rounded-2xl" />))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-white">DASHBOARD</h1>
        <p className="text-text-secondary mt-1">Welcome back, Admin. Here&apos;s your store overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <ShoppingCart size={20} />, label: 'Total Orders', value: stats?.totalOrders || 0, sub: `${stats?.todayOrders || 0} today`, color: 'accent' },
          { icon: <DollarSign size={20} />, label: 'Total Revenue', value: formatPrice(stats?.totalRevenue || 0), sub: `${formatPrice(stats?.monthRevenue || 0)} this month`, color: 'accent' },
          { icon: <Clock size={20} />, label: 'Pending Orders', value: stats?.pendingOrders || 0, sub: 'Awaiting fulfillment', color: 'warning' },
          { icon: <Package size={20} />, label: 'Total Products', value: stats?.totalProducts || 0, sub: `${stats?.activeProducts || 0} active`, color: 'accent' },
        ].map((card) => (
          <div key={card.label} className="bg-bg-surface rounded-2xl border border-border p-5">
            <div className={`w-10 h-10 rounded-xl bg-${card.color}/10 flex items-center justify-center text-${card.color} mb-3`}>
              {card.icon}
            </div>
            <p className="text-text-secondary text-sm">{card.label}</p>
            <p className="font-display text-2xl text-white mt-1">{card.value}</p>
            <p className="text-text-secondary text-xs mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-bg-surface rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-white tracking-wider">RECENT ORDERS</h2>
            <Link href="/admin/orders" className="text-accent text-sm hover:underline">View All</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-text-secondary text-sm py-4 text-center">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order: Record<string, unknown>) => (
                <Link key={order.id as string} href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div>
                    <p className="text-white text-sm font-medium">{order.order_number as string}</p>
                    <p className="text-text-secondary text-xs">{order.customer_name as string}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-accent text-sm font-medium">{formatPrice(order.total as number)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-lg ${
                      order.fulfillment_status === 'delivered' ? 'bg-success/10 text-success' :
                      order.fulfillment_status === 'pending' ? 'bg-warning/10 text-warning' :
                      'bg-accent/10 text-accent'
                    }`}>
                      {(order.fulfillment_status as string || '').toUpperCase()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-bg-surface rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-white tracking-wider flex items-center gap-2">
              <AlertTriangle size={18} className="text-warning" />
              LOW STOCK ALERTS
            </h2>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-text-secondary text-sm py-4 text-center">All products are well stocked 🎉</p>
          ) : (
            <div className="space-y-3">
              {lowStock.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-warning/5 border border-warning/10">
                  <p className="text-white text-sm truncate flex-1 mr-4">{item.name}</p>
                  <span className="text-warning text-sm font-bold whitespace-nowrap">{item.stock} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { href: '/admin/products/new', label: 'Add Product', icon: <Package size={20} /> },
          { href: '/admin/orders', label: 'View Orders', icon: <ShoppingCart size={20} /> },
          { href: '/admin/promos', label: 'Manage Promos', icon: <TrendingUp size={20} /> },
          { href: '/', label: 'View Store', icon: <TrendingUp size={20} /> },
        ].map((action) => (
          <Link key={action.href} href={action.href}
            className="bg-bg-surface rounded-2xl border border-border p-4 text-center hover:border-accent/30 transition-colors group">
            <div className="w-10 h-10 mx-auto bg-accent/10 rounded-xl flex items-center justify-center text-accent mb-2 group-hover:bg-accent/20 transition-colors">
              {action.icon}
            </div>
            <p className="text-white text-sm font-medium">{action.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

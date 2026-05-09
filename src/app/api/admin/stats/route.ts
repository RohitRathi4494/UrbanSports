import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();

    const today = new Date().toISOString().split('T')[0];
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    const totalOrders = (await db.prepare('SELECT COUNT(*) as c FROM orders').get() as { c: number }).c;
    const todayOrders = (await db.prepare("SELECT COUNT(*) as c FROM orders WHERE date(created_at) = ?").get(today) as { c: number }).c;
    const monthOrders = (await db.prepare("SELECT COUNT(*) as c FROM orders WHERE date(created_at) >= ?").get(monthStart) as { c: number }).c;
    const pendingOrders = (await db.prepare("SELECT COUNT(*) as c FROM orders WHERE fulfillment_status = 'pending'").get() as { c: number }).c;
    const totalRevenue = (await db.prepare("SELECT COALESCE(SUM(total), 0) as r FROM orders WHERE payment_status = 'paid'").get() as { r: number }).r;
    const monthRevenue = (await db.prepare("SELECT COALESCE(SUM(total), 0) as r FROM orders WHERE payment_status = 'paid' AND date(created_at) >= ?").get(monthStart) as { r: number }).r;
    const totalProducts = (await db.prepare('SELECT COUNT(*) as c FROM products').get() as { c: number }).c;
    const activeProducts = (await db.prepare("SELECT COUNT(*) as c FROM products WHERE status = 'active'").get() as { c: number }).c;

    // Low stock alerts
    const lowStock = await db.prepare(
      "SELECT id, name, stock, low_stock_threshold FROM products WHERE status = 'active' AND stock <= low_stock_threshold ORDER BY stock ASC LIMIT 10"
    ).all();

    // Recent orders
    const recentOrders = await db.prepare(
      'SELECT * FROM orders ORDER BY created_at DESC LIMIT 5'
    ).all() as Record<string, unknown>[];

    const recentParsed = recentOrders.map(o => ({
      ...o,
      items: JSON.parse((o.items as string) || '[]'),
      shipping_address: JSON.parse((o.shipping_address as string) || '{}'),
    }));

    return NextResponse.json({
      stats: {
        totalOrders,
        todayOrders,
        monthOrders,
        pendingOrders,
        totalRevenue,
        monthRevenue,
        totalProducts,
        activeProducts,
      },
      lowStock,
      recentOrders: recentParsed,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

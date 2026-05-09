import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const url = new URL(request.url);
    const status = url.searchParams.get('fulfillment_status');
    const payment = url.searchParams.get('payment_status');

    let where = 'WHERE 1=1';
    const params: string[] = [];

    if (status) {
      where += ' AND fulfillment_status = ?';
      params.push(status);
    }
    if (payment) {
      where += ' AND payment_status = ?';
      params.push(payment);
    }

    const orders = db.prepare(`SELECT * FROM orders ${where} ORDER BY created_at DESC`).all(...params);
    
    const parsed = (orders as Record<string, unknown>[]).map(o => ({
      ...o,
      shipping_address: JSON.parse((o.shipping_address as string) || '{}'),
      items: JSON.parse((o.items as string) || '[]'),
    }));

    return NextResponse.json({ orders: parsed });
  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    const { v4: uuid } = require('uuid');
    const id = uuid();
    
    // Generate order number
    const year = new Date().getFullYear();
    const count = (db.prepare('SELECT COUNT(*) as c FROM orders').get() as { c: number }).c;
    const orderNumber = `US-${year}-${String(count + 1).padStart(4, '0')}`;

    // Get delivery charge settings
    const freeAbove = db.prepare("SELECT value FROM settings WHERE key = 'delivery_free_above'").get() as { value: string } | undefined;
    const deliveryCharge = db.prepare("SELECT value FROM settings WHERE key = 'delivery_charge'").get() as { value: string } | undefined;
    
    const freeThreshold = parseFloat(freeAbove?.value || '999');
    const charge = parseFloat(deliveryCharge?.value || '79');
    const actualCharge = body.subtotal >= freeThreshold ? 0 : charge;

    db.prepare(`
      INSERT INTO orders (id, order_number, customer_name, customer_email, customer_phone, shipping_address, items, subtotal, delivery_charge, discount, total, promo_code, payment_method, payment_status, fulfillment_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, orderNumber, body.customer_name, body.customer_email, body.customer_phone,
      JSON.stringify(body.shipping_address), JSON.stringify(body.items),
      body.subtotal, actualCharge, body.discount || 0,
      body.subtotal + actualCharge - (body.discount || 0),
      body.promo_code || null, body.payment_method || 'razorpay',
      body.payment_method === 'whatsapp_cod' ? 'pending' : 'pending', 'pending'
    );

    // Update product stock
    for (const item of body.items) {
      db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(item.quantity, item.product_id);
    }

    // Update promo code usage
    if (body.promo_code) {
      db.prepare('UPDATE promo_codes SET usage_count = usage_count + 1 WHERE code = ?').run(body.promo_code);
    }

    return NextResponse.json({ id, order_number: orderNumber, total: body.subtotal + actualCharge - (body.discount || 0) }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

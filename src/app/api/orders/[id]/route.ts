import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;

    const order = db.prepare('SELECT * FROM orders WHERE id = ? OR order_number = ?').get(id, id) as Record<string, unknown> | undefined;
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      order: {
        ...order,
        shipping_address: JSON.parse((order.shipping_address as string) || '{}'),
        items: JSON.parse((order.items as string) || '[]'),
      }
    });
  } catch (error) {
    console.error('Order detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;
    const body = await request.json();

    if (body.fulfillment_status) {
      db.prepare("UPDATE orders SET fulfillment_status = ?, updated_at = datetime('now') WHERE id = ?").run(body.fulfillment_status, id);
    }
    if (body.payment_status) {
      db.prepare("UPDATE orders SET payment_status = ?, updated_at = datetime('now') WHERE id = ?").run(body.payment_status, id);
    }
    if (body.admin_notes !== undefined) {
      db.prepare("UPDATE orders SET admin_notes = ?, updated_at = datetime('now') WHERE id = ?").run(body.admin_notes, id);
    }
    if (body.razorpay_payment_id) {
      db.prepare("UPDATE orders SET razorpay_payment_id = ?, updated_at = datetime('now') WHERE id = ?").run(body.razorpay_payment_id, id);
    }

    return NextResponse.json({ message: 'Order updated successfully' });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

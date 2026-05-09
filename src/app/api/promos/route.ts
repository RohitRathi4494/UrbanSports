import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const promos = await db.prepare('SELECT * FROM promo_codes ORDER BY created_at DESC').all();
    return NextResponse.json({ promos });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    const { v4: uuid } = require('uuid');
    const id = uuid();

    await db.prepare(`
      INSERT INTO promo_codes (id, code, discount_type, discount_value, min_order_value, expiry_date, usage_limit, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, body.code.toUpperCase(), body.discount_type, body.discount_value, body.min_order_value || 0, body.expiry_date, body.usage_limit || 0, body.is_active !== false ? 1 : 0);

    return NextResponse.json({ id, message: 'Promo code created' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create promo code' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const { code, subtotal } = await request.json();

    const promo = db.prepare('SELECT * FROM promo_codes WHERE code = ? AND is_active = 1').get(code.toUpperCase()) as Record<string, unknown> | undefined;

    if (!promo) {
      return NextResponse.json({ error: 'Invalid promo code' }, { status: 400 });
    }

    // Check expiry
    if (promo.expiry_date && new Date(promo.expiry_date as string) < new Date()) {
      return NextResponse.json({ error: 'Promo code has expired' }, { status: 400 });
    }

    // Check usage limit
    if ((promo.usage_limit as number) > 0 && (promo.usage_count as number) >= (promo.usage_limit as number)) {
      return NextResponse.json({ error: 'Promo code usage limit reached' }, { status: 400 });
    }

    // Check minimum order value
    if (subtotal < (promo.min_order_value as number)) {
      return NextResponse.json({ 
        error: `Minimum order value of ₹${(promo.min_order_value as number).toLocaleString('en-IN')} required` 
      }, { status: 400 });
    }

    // Calculate discount
    let discount = 0;
    if (promo.discount_type === 'percentage') {
      discount = Math.round((subtotal * (promo.discount_value as number)) / 100);
    } else {
      discount = promo.discount_value as number;
    }

    return NextResponse.json({
      valid: true,
      discount,
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
      message: `Promo code applied! You save ₹${discount.toLocaleString('en-IN')}`,
    });
  } catch (error) {
    console.error('Validate promo error:', error);
    return NextResponse.json({ error: 'Failed to validate promo code' }, { status: 500 });
  }
}

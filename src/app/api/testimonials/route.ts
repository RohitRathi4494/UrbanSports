import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const testimonials = await db.prepare(
      'SELECT * FROM testimonials WHERE is_active = 1 ORDER BY display_order ASC'
    ).all();
    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error('Testimonials API error:', error);
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
      INSERT INTO testimonials (id, customer_name, city, rating, review, photo_url, is_active, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, body.customer_name, body.city, body.rating, body.review, body.photo_url || null, body.is_active !== false ? 1 : 0, body.display_order || 0);

    return NextResponse.json({ id, message: 'Testimonial created' }, { status: 201 });
  } catch (error) {
    console.error('Create testimonial error:', error);
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
  }
}

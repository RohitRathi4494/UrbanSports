import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;
    const body = await request.json();

    await db.prepare(`
      UPDATE testimonials SET customer_name = ?, city = ?, rating = ?, review = ?, display_order = ?
      WHERE id = ?
    `).run(body.customer_name, body.city, body.rating, body.review, body.display_order || 0, id);

    return NextResponse.json({ message: 'Testimonial updated' });
  } catch (error) {
    console.error('Update testimonial error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;
    await db.prepare('DELETE FROM testimonials WHERE id = ?').run(id);
    return NextResponse.json({ message: 'Testimonial deleted' });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

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
      UPDATE categories SET name = ?, slug = ?, description = ?, display_order = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(body.name, body.slug, body.description || '', body.display_order || 0, id);

    return NextResponse.json({ message: 'Category updated' });
  } catch (error) {
    console.error('Update category error:', error);
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
    await db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    return NextResponse.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

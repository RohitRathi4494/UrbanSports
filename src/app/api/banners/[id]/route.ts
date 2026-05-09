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
      UPDATE banners SET headline = ?, subtext = ?, cta_label = ?, cta_link = ?, bg_color = ?, display_order = ?
      WHERE id = ?
    `).run(body.headline, body.subtext, body.cta_label, body.cta_link, body.bg_color || '#C8F53A', body.display_order || 0, id);

    return NextResponse.json({ message: 'Banner updated' });
  } catch (error) {
    console.error('Update banner error:', error);
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
    await db.prepare('DELETE FROM banners WHERE id = ?').run(id);
    return NextResponse.json({ message: 'Banner deleted' });
  } catch (error) {
    console.error('Delete banner error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

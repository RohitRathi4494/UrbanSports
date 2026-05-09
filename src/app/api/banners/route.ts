import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const banners = await db.prepare('SELECT * FROM banners WHERE is_active = 1 ORDER BY display_order ASC').all();
    return NextResponse.json({ banners });
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
      INSERT INTO banners (id, headline, subtext, cta_label, cta_link, bg_image_url, bg_color, is_active, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, body.headline, body.subtext, body.cta_label, body.cta_link, body.bg_image_url || null, body.bg_color || '#C8F53A', body.is_active !== false ? 1 : 0, body.display_order || 0);

    return NextResponse.json({ id, message: 'Banner created' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
  }
}

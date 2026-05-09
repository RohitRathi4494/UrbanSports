import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const categories = await db.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.status = 'active') as product_count
      FROM categories c
      WHERE c.is_active = 1
      ORDER BY c.display_order ASC
    `).all();

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Categories API error:', error);
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
      INSERT INTO categories (id, name, slug, description, image_url, display_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, body.name, body.slug, body.description || '', body.image_url || '', body.display_order || 0, body.is_active !== false ? 1 : 0);

    return NextResponse.json({ id, message: 'Category created' }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const db = getDb();
    const { slug } = await params;

    const product = await db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ?
    `).get(slug) as Record<string, unknown> | undefined;

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const parsed = {
      ...product,
      features: JSON.parse((product.features as string) || '[]'),
      specifications: JSON.parse((product.specifications as string) || '{}'),
      images: JSON.parse((product.images as string) || '[]'),
      tags: JSON.parse((product.tags as string) || '[]'),
      variants: JSON.parse((product.variants as string) || '[]'),
      is_featured: !!(product.is_featured as number),
      is_new_arrival: !!(product.is_new_arrival as number),
    };

    // Get related products (same category, different product)
    const related = await db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ? AND p.id != ? AND p.status = 'active'
      LIMIT 4
    `).all(product.category_id, product.id) as Record<string, unknown>[];

    const relatedParsed = related.map((p) => ({
      ...p,
      features: JSON.parse((p.features as string) || '[]'),
      specifications: JSON.parse((p.specifications as string) || '{}'),
      images: JSON.parse((p.images as string) || '[]'),
      tags: JSON.parse((p.tags as string) || '[]'),
      variants: JSON.parse((p.variants as string) || '[]'),
      is_featured: !!(p.is_featured as number),
      is_new_arrival: !!(p.is_new_arrival as number),
    }));

    return NextResponse.json({ product: parsed, related: relatedParsed });
  } catch (error) {
    console.error('Product detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const db = getDb();
    const { slug } = await params;
    const body = await request.json();

    // Find product by slug or id
    const existing = await db.prepare('SELECT id FROM products WHERE slug = ? OR id = ?').get(slug, slug) as { id: string } | undefined;
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await db.prepare(`
      UPDATE products SET
        name = ?, slug = ?, category_id = ?, brand = ?, sku = ?,
        description = ?, features = ?, specifications = ?,
        price = ?, mrp = ?, images = ?, variants = ?,
        stock = ?, low_stock_threshold = ?, status = ?,
        is_featured = ?, is_new_arrival = ?, tags = ?,
        meta_title = ?, meta_description = ?, display_order = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      body.name, body.slug, body.category_id, body.brand, body.sku,
      body.description, JSON.stringify(body.features || []),
      JSON.stringify(body.specifications || {}), body.price, body.mrp,
      JSON.stringify(body.images || []), JSON.stringify(body.variants || []),
      body.stock || 0, body.low_stock_threshold || 5, body.status || 'active',
      body.is_featured ? 1 : 0, body.is_new_arrival ? 1 : 0,
      JSON.stringify(body.tags || []), body.meta_title || '', body.meta_description || '',
      body.display_order || 0, existing.id
    );

    return NextResponse.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const db = getDb();
    const { slug } = await params;

    await db.prepare('DELETE FROM products WHERE slug = ? OR id = ?').run(slug, slug);
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

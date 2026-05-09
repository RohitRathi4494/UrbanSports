import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const url = new URL(request.url);
    
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');
    const sort = url.searchParams.get('sort') || 'newest';
    const featured = url.searchParams.get('featured');
    const newArrivals = url.searchParams.get('new_arrivals');
    const brand = url.searchParams.get('brand');
    const minPrice = url.searchParams.get('min_price');
    const maxPrice = url.searchParams.get('max_price');
    const inStock = url.searchParams.get('in_stock');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let where = "WHERE p.status = 'active'";
    const params: (string | number)[] = [];

    if (category) {
      where += ' AND c.slug = ?';
      params.push(category);
    }

    if (search) {
      where += ' AND (p.name LIKE ? OR p.brand LIKE ? OR p.tags LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (featured === '1') {
      where += ' AND p.is_featured = 1';
    }

    if (newArrivals === '1') {
      where += ' AND p.is_new_arrival = 1';
    }

    if (brand) {
      where += ' AND p.brand = ?';
      params.push(brand);
    }

    if (minPrice) {
      where += ' AND p.price >= ?';
      params.push(parseInt(minPrice));
    }

    if (maxPrice) {
      where += ' AND p.price <= ?';
      params.push(parseInt(maxPrice));
    }

    if (inStock === '1') {
      where += ' AND p.stock > 0';
    }

    let orderBy = 'ORDER BY p.created_at DESC';
    if (sort === 'price_asc') orderBy = 'ORDER BY p.price ASC';
    else if (sort === 'price_desc') orderBy = 'ORDER BY p.price DESC';
    else if (sort === 'name') orderBy = 'ORDER BY p.name ASC';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id ${where}`;
    const countResult = await db.prepare(countQuery).get(...params) as { total: number };

    // Get products
    const query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      ${where} ${orderBy} 
      LIMIT ? OFFSET ?
    `;
    const products = await db.prepare(query).all(...params, limit, offset) as Record<string, unknown>[];

    // Parse JSON fields
    const parsed = products.map((p) => ({
      ...p,
      features: JSON.parse((p.features as string) || '[]'),
      specifications: JSON.parse((p.specifications as string) || '{}'),
      images: JSON.parse((p.images as string) || '[]'),
      tags: JSON.parse((p.tags as string) || '[]'),
      variants: JSON.parse((p.variants as string) || '[]'),
      is_featured: !!(p.is_featured as number),
      is_new_arrival: !!(p.is_new_arrival as number),
    }));

    // Get brands for filtering
    const brands = await db.prepare("SELECT DISTINCT brand FROM products WHERE status = 'active' AND brand IS NOT NULL ORDER BY brand").all() as { brand: string }[];

    return NextResponse.json({
      products: parsed,
      total: countResult.total,
      page,
      limit,
      totalPages: Math.ceil(countResult.total / limit),
      brands: brands.map(b => b.brand),
    });
  } catch (error) {
    console.error('Products API error:', error);
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
      INSERT INTO products (id, name, slug, category_id, brand, sku, description, features, specifications, price, mrp, images, variants, stock, low_stock_threshold, status, is_featured, is_new_arrival, tags, meta_title, meta_description, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, body.name, body.slug, body.category_id, body.brand, body.sku,
      body.description, JSON.stringify(body.features || []),
      JSON.stringify(body.specifications || {}), body.price, body.mrp,
      JSON.stringify(body.images || []), JSON.stringify(body.variants || []),
      body.stock || 0, body.low_stock_threshold || 5, body.status || 'active',
      body.is_featured ? 1 : 0, body.is_new_arrival ? 1 : 0,
      JSON.stringify(body.tags || []), body.meta_title || '', body.meta_description || '',
      body.display_order || 0
    );

    return NextResponse.json({ id, message: 'Product created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

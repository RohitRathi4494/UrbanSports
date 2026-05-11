const { createClient } = require('@libsql/client');
const crypto = require('crypto');
const fs = require('fs');
const uuid = () => crypto.randomUUID();

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const cleanLine = line.replace(/\r/g, '');
  const [key, ...val] = cleanLine.split('=');
  if (key && val.length) env[key.trim()] = val.join('=').trim().replace(/['"]/g, '');
});

const client = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN
});

async function run() {
  console.log("Connecting to Turso: " + env.TURSO_DATABASE_URL);

  const categories = [
    { name: 'Cricket Bats', slug: 'cricket-bats', description: 'Premium English Willow, Kashmir Willow, and Tennis cricket bats from top brands.', display_order: 1 },
    { name: 'Batting Pads', slug: 'batting-pads', description: 'Professional batting pads designed for maximum protection and comfort.', display_order: 2 },
    { name: 'Batting Gloves', slug: 'batting-gloves', description: 'Premium batting gloves for superior grip and protection.', display_order: 3 },
    { name: 'Helmets', slug: 'helmets', description: 'Cricket helmets for complete safety on the field.', display_order: 4 },
    { name: 'Kit Bags', slug: 'kit-bags', description: 'Duffle bags, wheelie bags, and backpacks to carry your gear in style.', display_order: 5 },
    { name: 'Cricket Balls', slug: 'cricket-balls', description: 'Match-quality leather balls, tennis balls, and training balls.', display_order: 6 },
    { name: 'Other Accessories', slug: 'other-accessories', description: 'Cricket shoes, stumps, bails, grips, and training accessories.', display_order: 7 },
    { name: 'Team Jerseys', slug: 'team-jerseys', description: 'Cricket whites, colored jerseys, track pants, and practice wear.', display_order: 8 },
  ];

  const categoryMap = {
    'cricket-bats': 'cricket-bats',
    'cricket-balls': 'cricket-balls',
    'batting-pads-gloves': 'batting-pads',
    'helmets-protective-gear': 'helmets',
    'cricket-shoes-spikes': 'other-accessories',
    'bags-kit-bags': 'kit-bags',
    'stumps-accessories': 'other-accessories',
    'clothing-apparel': 'team-jerseys',
  };

  const productsResult = await client.execute("SELECT id, category_id FROM products");
  const categoriesResult = await client.execute("SELECT id, slug FROM categories");
  
  const oldCategorySlugById = {};
  categoriesResult.rows.forEach(r => { oldCategorySlugById[r.id] = r.slug; });

  const newCategoryIds = {};
  for (const cat of categories) {
    const existing = categoriesResult.rows.find(r => r.slug === cat.slug);
    const id = existing ? existing.id : uuid();
    newCategoryIds[cat.slug] = id;
    
    if (existing) {
      await client.execute({
        sql: 'UPDATE categories SET name=?, description=?, display_order=? WHERE id=?',
        args: [cat.name, cat.description, cat.display_order, id]
      });
    } else {
      await client.execute({
        sql: 'INSERT INTO categories (id, name, slug, description, display_order) VALUES (?, ?, ?, ?, ?)',
        args: [id, cat.name, cat.slug, cat.description, cat.display_order]
      });
    }
  }

  for (const p of productsResult.rows) {
    const oldSlug = oldCategorySlugById[p.category_id];
    let newSlug = categoryMap[oldSlug] || 'other-accessories';
    const newCatId = newCategoryIds[newSlug];
    
    if (newCatId && newCatId !== p.category_id) {
      await client.execute({
        sql: 'UPDATE products SET category_id = ? WHERE id = ?',
        args: [newCatId, p.id]
      });
    }
  }

  // Delete old categories that are no longer used
  const activeIds = Object.values(newCategoryIds);
  const placeholders = activeIds.map(() => '?').join(',');
  await client.execute({
    sql: `DELETE FROM categories WHERE id NOT IN (${placeholders})`,
    args: activeIds
  });

  console.log("Categories updated successfully!");
}

run().catch(console.error);

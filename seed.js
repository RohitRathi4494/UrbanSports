
const { createClient } = require('@libsql/client');
const crypto = require('crypto');
const uuid = () => crypto.randomUUID();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function seed() {
  console.log("Connecting to Turso: " + process.env.TURSO_DATABASE_URL);
  
  console.log("Creating tables...");
  const schema = `
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image_url TEXT,
      display_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category_id TEXT,
      brand TEXT,
      sku TEXT,
      description TEXT,
      features TEXT,
      specifications TEXT,
      price REAL NOT NULL,
      mrp REAL NOT NULL,
      images TEXT,
      variants TEXT,
      stock INTEGER DEFAULT 0,
      low_stock_threshold INTEGER DEFAULT 5,
      status TEXT DEFAULT 'active' CHECK(status IN ('active','inactive','out_of_stock')),
      is_featured INTEGER DEFAULT 0,
      is_new_arrival INTEGER DEFAULT 0,
      tags TEXT,
      meta_title TEXT,
      meta_description TEXT,
      display_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT,
      customer_phone TEXT NOT NULL,
      shipping_address TEXT,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      delivery_charge REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      total REAL NOT NULL,
      promo_code TEXT,
      payment_method TEXT DEFAULT 'razorpay' CHECK(payment_method IN ('razorpay','whatsapp_cod')),
      payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending','paid','failed')),
      razorpay_order_id TEXT,
      razorpay_payment_id TEXT,
      fulfillment_status TEXT DEFAULT 'pending' CHECK(fulfillment_status IN ('pending','confirmed','packed','shipped','delivered','cancelled')),
      admin_notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      city TEXT,
      rating INTEGER DEFAULT 5 CHECK(rating >= 1 AND rating <= 5),
      review TEXT NOT NULL,
      photo_url TEXT,
      is_active INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS banners (
      id TEXT PRIMARY KEY,
      headline TEXT NOT NULL,
      subtext TEXT,
      cta_label TEXT,
      cta_link TEXT,
      bg_image_url TEXT,
      bg_color TEXT,
      is_active INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS promo_codes (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT DEFAULT 'percentage' CHECK(discount_type IN ('percentage','flat')),
      discount_value REAL NOT NULL,
      min_order_value REAL DEFAULT 0,
      expiry_date TEXT,
      usage_limit INTEGER DEFAULT 0,
      usage_count INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `;
  await client.executeMultiple(schema);
  console.log("Tables created!");

  // Check if categories exist to prevent duplicate seed
  const catCount = await client.execute("SELECT COUNT(*) as count FROM categories");
  if (catCount.rows[0].count > 0) {
    console.log("Database is already seeded!");
    return;
  }

  console.log("Seeding categories...");
  const categories = [
    { name: 'Cricket Bats', slug: 'cricket-bats', description: 'Premium English Willow, Kashmir Willow, and Tennis cricket bats from top brands. Find your perfect bat for every format of the game.', display_order: 1 },
    { name: 'Cricket Balls', slug: 'cricket-balls', description: 'Match-quality leather balls, tennis balls, rubber balls, and training balls for all levels of play.', display_order: 2 },
    { name: 'Batting Pads & Gloves', slug: 'batting-pads-gloves', description: 'Professional batting pads, gloves, and inner gloves designed for maximum protection and comfort.', display_order: 3 },
    { name: 'Helmets & Protective Gear', slug: 'helmets-protective-gear', description: 'Cricket helmets, thigh guards, arm guards, chest guards, and abdominal guards for complete safety.', display_order: 4 },
    { name: 'Cricket Shoes & Spikes', slug: 'cricket-shoes-spikes', description: 'High-performance cricket shoes with rubber studs and metal spikes for superior grip and support.', display_order: 5 },
    { name: 'Bags & Kit Bags', slug: 'bags-kit-bags', description: 'Duffle bags, wheelie bags, backpacks, and individual bat covers to carry your gear in style.', display_order: 6 },
    { name: 'Stumps & Accessories', slug: 'stumps-accessories', description: 'Wooden and spring stumps, bails, bat grips, bat tape, cone sets, and other training accessories.', display_order: 7 },
    { name: 'Clothing & Apparel', slug: 'clothing-apparel', description: 'Cricket whites, colored jerseys, track pants, training tees, and caps for match day and practice.', display_order: 8 },
  ];

  const categoryIds = {};
  for (const cat of categories) {
    const id = uuid();
    categoryIds[cat.slug] = id;
    await client.execute({
      sql: 'INSERT INTO categories (id, name, slug, description, display_order) VALUES (?, ?, ?, ?, ?)',
      args: [id, cat.name, cat.slug, cat.description, cat.display_order]
    });
  }

  console.log("Seeding products...");
  const products = [
    {
      name: 'SG Sierra 350 English Willow Cricket Bat',
      slug: 'sg-sierra-350-english-willow-bat',
      category_slug: 'cricket-bats',
      brand: 'SG',
      sku: 'SG-SIR-350-EW',
      description: '<h3>SG Sierra 350 — Premium English Willow</h3><p>The SG Sierra 350 is crafted from Grade 1 English Willow, offering exceptional power and balance. Ideal for aggressive stroke-makers, this bat features a mid-to-low sweet spot perfect for driving and pulling.</p><p>Hand-selected willow clefts ensure consistent performance. The bat comes with a premium Sarawak cane handle wrapped in three layers of cork for maximum shock absorption.</p>',
      features: JSON.stringify(['Grade 1 English Willow', 'Mid-to-low sweet spot', 'Sarawak cane handle', 'Triple cork layer', 'Full profile edges', 'Ready to play with minimal knocking']),
      specifications: JSON.stringify({ Material: 'English Willow', Weight: '1.15 - 1.25 kg', 'Handle Type': 'Sarawak Cane', 'Sweet Spot': 'Mid-Low', 'Bat Size': 'Short Handle (SH)', Brand: 'SG' }),
      price: 8999,
      mrp: 12999,
      images: JSON.stringify(['/images/products/sg-bat-1.jpg', '/images/products/sg-bat-2.jpg']),
      stock: 15,
      is_featured: 1,
      is_new_arrival: 1,
      tags: JSON.stringify(['english willow', 'sg', 'premium', 'bat']),
      meta_title: 'SG Sierra 350 English Willow Cricket Bat | Urban Sports',
      meta_description: 'Buy SG Sierra 350 English Willow Cricket Bat online at best price. Grade 1 willow with mid-low sweet spot. Free delivery above ₹999.',
    },
    {
      name: 'Kookaburra Kahuna Pro 1000 Cricket Bat',
      slug: 'kookaburra-kahuna-pro-1000-bat',
      category_slug: 'cricket-bats',
      brand: 'Kookaburra',
      sku: 'KB-KHP-1000',
      description: '<h3>Kookaburra Kahuna Pro 1000</h3><p>The iconic Kahuna Pro 1000 from Kookaburra features premium Grade 1+ English Willow with a massive profile and extended edges. Used by international cricketers worldwide.</p><p>Features Kookaburra\'s signature rounded face profile for greater middle area and power. Comes with a premium handle with memory foam grip.</p>',
      features: JSON.stringify(['Grade 1+ English Willow', 'Massive profile edges', 'Rounded face profile', 'Premium memory foam grip', 'Lightweight pickup', 'International quality']),
      specifications: JSON.stringify({ Material: 'English Willow', Weight: '1.18 - 1.28 kg', 'Handle Type': 'Premium Cane', 'Sweet Spot': 'Mid', 'Bat Size': 'Short Handle (SH)', Brand: 'Kookaburra' }),
      price: 14999,
      mrp: 21999,
      images: JSON.stringify(['/images/products/kb-bat-1.jpg']),
      stock: 8,
      is_featured: 1,
      is_new_arrival: 0,
      tags: JSON.stringify(['english willow', 'kookaburra', 'premium', 'professional']),
      meta_title: 'Kookaburra Kahuna Pro 1000 Cricket Bat | Urban Sports',
      meta_description: 'Buy Kookaburra Kahuna Pro 1000 English Willow Cricket Bat. International quality with massive edges and premium grip.',
    },
    {
      name: 'SS Ton Slasher Kashmir Willow Cricket Bat',
      slug: 'ss-ton-slasher-kashmir-willow-bat',
      category_slug: 'cricket-bats',
      brand: 'SS',
      sku: 'SS-TON-SL-KW',
      description: '<h3>SS Ton Slasher — Great Value Kashmir Willow</h3><p>Perfect for intermediate players and club cricket, the SS Ton Slasher offers excellent value without compromising on performance. Made from selected Kashmir Willow with a traditional shape.</p>',
      features: JSON.stringify(['Selected Kashmir Willow', 'Traditional shape', 'Short handle', 'Good ping and balance', 'Oil-finished blade', 'Budget-friendly']),
      specifications: JSON.stringify({ Material: 'Kashmir Willow', Weight: '1.1 - 1.2 kg', 'Handle Type': 'Cane', 'Sweet Spot': 'Mid', 'Bat Size': 'Short Handle (SH)', Brand: 'SS' }),
      price: 2499,
      mrp: 3999,
      images: JSON.stringify(['/images/products/ss-bat-1.jpg']),
      stock: 25,
      is_featured: 0,
      is_new_arrival: 1,
      tags: JSON.stringify(['kashmir willow', 'ss', 'budget', 'club']),
      meta_title: 'SS Ton Slasher Kashmir Willow Bat | Urban Sports',
      meta_description: 'Buy SS Ton Slasher Kashmir Willow Cricket Bat at best price. Great value for club cricket. Free delivery above ₹999.',
    },
    {
      name: 'SG Club Leather Cricket Ball (Red)',
      slug: 'sg-club-leather-cricket-ball-red',
      category_slug: 'cricket-balls',
      brand: 'SG',
      sku: 'SG-CLB-RED',
      description: '<h3>SG Club — Premium Match Ball</h3><p>The SG Club is a hand-stitched 4-piece leather cricket ball designed for competitive club cricket. Excellent seam position and consistent bounce make it the choice of leagues across India.</p>',
      features: JSON.stringify(['Hand-stitched 4-piece construction', 'Premium alum-tanned leather', 'Cork and rubber core', 'Consistent bounce', 'Pronounced seam', 'BCCI approved weight']),
      specifications: JSON.stringify({ Material: 'Leather', Color: 'Red', Weight: '156g', Construction: '4-piece hand-stitched', Brand: 'SG', 'Suitable For': 'Club / League matches' }),
      price: 699,
      mrp: 999,
      images: JSON.stringify(['/images/products/sg-ball-1.jpg']),
      stock: 50,
      is_featured: 1,
      is_new_arrival: 0,
      tags: JSON.stringify(['leather ball', 'sg', 'match ball', 'red']),
      meta_title: 'SG Club Leather Cricket Ball Red | Urban Sports',
      meta_description: 'Buy SG Club Leather Cricket Ball. Hand-stitched 4-piece construction for competitive club cricket.',
    },
    {
      name: 'GM 808 Batting Pads — Men\'s',
      slug: 'gm-808-batting-pads-mens',
      category_slug: 'batting-pads-gloves',
      brand: 'GM',
      sku: 'GM-808-PAD-M',
      description: '<h3>Gunn & Moore 808 Batting Pads</h3><p>Premium lightweight batting pads with high-density foam protection. Traditional buckle strapping system with Velcro for secure fit. Ideal for league and competitive cricket.</p>',
      features: JSON.stringify(['High-density foam construction', 'Lightweight at 680g per pad', 'Traditional buckle + Velcro', 'Reinforced knee roll', 'Pre-curved shape', 'Sweat-absorbent lining']),
      specifications: JSON.stringify({ Material: 'PU + HD Foam', Weight: '680g per pad', Size: "Men's", Strapping: 'Buckle + Velcro', Brand: 'GM', 'Suitable For': 'Right Hand / Left Hand' }),
      price: 2799,
      mrp: 3999,
      images: JSON.stringify(['/images/products/gm-pads-1.jpg']),
      stock: 18,
      is_featured: 1,
      is_new_arrival: 1,
      tags: JSON.stringify(['batting pads', 'gm', 'protection', 'pads']),
      meta_title: 'GM 808 Batting Pads Men\'s | Urban Sports',
      meta_description: 'Buy GM 808 Batting Pads. Lightweight, high-density foam protection for competitive cricket.',
    },
    {
      name: 'Shrey Masterclass Air 2.0 Titanium Helmet',
      slug: 'shrey-masterclass-air-2-titanium-helmet',
      category_slug: 'helmets-protective-gear',
      brand: 'Shrey',
      sku: 'SHR-MC-AIR2-TI',
      description: '<h3>Shrey Masterclass Air 2.0 — Titanium Grille</h3><p>The Masterclass Air 2.0 is a top-of-the-line cricket helmet featuring a titanium visor for maximum protection with minimal weight. Used by international and IPL players. Meets the latest ICC safety standards.</p>',
      features: JSON.stringify(['Titanium visor grille', 'ABS outer shell', 'Meets ICC safety standards', 'Superior ventilation system', 'Adjustable rear dial', 'Removable & washable lining']),
      specifications: JSON.stringify({ Material: 'ABS Shell + Titanium Grille', Weight: '750g', Certification: 'ICC/BSI Compliant', Ventilation: 'Air Flow Technology', Brand: 'Shrey', Sizes: 'S / M / L / XL' }),
      price: 5999,
      mrp: 8499,
      images: JSON.stringify(['/images/products/shrey-helmet-1.jpg']),
      stock: 12,
      is_featured: 1,
      is_new_arrival: 1,
      tags: JSON.stringify(['helmet', 'shrey', 'titanium', 'safety', 'ipl']),
      meta_title: 'Shrey Masterclass Air 2.0 Titanium Helmet | Urban Sports',
      meta_description: 'Buy Shrey Masterclass Air 2.0 Cricket Helmet with Titanium Grille. ICC compliant, used by international players.',
    },
    {
      name: 'Puma 22 FH Rubber Stud Cricket Shoes',
      slug: 'puma-22-fh-rubber-cricket-shoes',
      category_slug: 'cricket-shoes-spikes',
      brand: 'Puma',
      sku: 'PM-22FH-RBR',
      description: '<h3>Puma 22 FH — All-Surface Cricket Shoes</h3><p>Versatile rubber stud cricket shoes suitable for both turf and artificial surfaces. Features Puma\'s responsive cushioning and a reinforced toe area for bowling protection.</p>',
      features: JSON.stringify(['Rubber studs for all surfaces', 'Responsive EVA midsole', 'Reinforced toe cap', 'Breathable mesh upper', 'Padded ankle collar', 'Non-marking outsole']),
      specifications: JSON.stringify({ Material: 'Synthetic + Mesh', Sole: 'Rubber Studs', Cushioning: 'EVA Midsole', Brand: 'Puma', Sizes: 'UK 6 - UK 12', Color: 'White/Green' }),
      price: 3499,
      mrp: 4999,
      images: JSON.stringify(['/images/products/puma-shoes-1.jpg']),
      stock: 20,
      is_featured: 0,
      is_new_arrival: 1,
      tags: JSON.stringify(['shoes', 'puma', 'rubber studs', 'all surface']),
      meta_title: 'Puma 22 FH Rubber Stud Cricket Shoes | Urban Sports',
      meta_description: 'Buy Puma 22 FH Rubber Stud Cricket Shoes. All-surface grip with responsive cushioning and reinforced toe.',
    },
    {
      name: 'SS Gladiator Cricket Kit Bag',
      slug: 'ss-gladiator-cricket-kit-bag',
      category_slug: 'bags-kit-bags',
      brand: 'SS',
      sku: 'SS-GLAD-BAG',
      description: '<h3>SS Gladiator — Premium Kit Bag</h3><p>Extra-large cricket kit bag with wheels and telescopic handle for easy transport. Features multiple compartments for organized gear storage. Durable 1680D polyester construction.</p>',
      features: JSON.stringify(['1680D polyester construction', 'Wheels + telescopic handle', 'Multiple compartments', 'Separate bat pocket', 'Ventilated shoe compartment', 'Padded shoulder straps']),
      specifications: JSON.stringify({ Material: '1680D Polyester', Dimensions: '86 x 35 x 35 cm', Weight: '3.2 kg', Wheels: 'Yes', Brand: 'SS', Color: 'Black/Blue' }),
      price: 3299,
      mrp: 4999,
      images: JSON.stringify(['/images/products/ss-bag-1.jpg']),
      stock: 14,
      is_featured: 0,
      is_new_arrival: 0,
      tags: JSON.stringify(['kit bag', 'ss', 'wheelie', 'large']),
      meta_title: 'SS Gladiator Cricket Kit Bag with Wheels | Urban Sports',
      meta_description: 'Buy SS Gladiator Cricket Kit Bag. Extra-large with wheels, multiple compartments. Free delivery above ₹999.',
    },
  ];

  for (const p of products) {
    await client.execute({
      sql: `INSERT INTO products (id, name, slug, category_id, brand, sku, description, features, specifications, price, mrp, images, stock, is_featured, is_new_arrival, tags, meta_title, meta_description, variants)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        uuid(), p.name, p.slug, categoryIds[p.category_slug], p.brand, p.sku,
        p.description, p.features, p.specifications, p.price, p.mrp, p.images,
        p.stock, p.is_featured, p.is_new_arrival, p.tags, p.meta_title, p.meta_description, "[]"
      ]
    });
  }

  console.log("Seeding testimonials...");
  const testimonials = [
    { customer_name: 'Arjun Mehta', city: 'Delhi', rating: 5, review: 'Absolutely top-notch quality! Ordered the SG Sierra 350 and it arrived in perfect condition. The bat has an amazing ping and is well-balanced. Urban Sports is my go-to store now. Highly recommended!', display_order: 1 },
    { customer_name: 'Priya Sharma', city: 'Mumbai', rating: 5, review: 'Bought cricket gear for my son\'s school team. The prices are very competitive and the quality is authentic. Customer support on WhatsApp was super helpful. Delivery was quick to Mumbai!', display_order: 2 },
    { customer_name: 'Vikram Rathore', city: 'Jaipur', rating: 4, review: 'Great collection of cricket equipment. I ordered shoes and batting gloves. Everything is genuine and well-packed. Only giving 4 stars because delivery took an extra day, but otherwise excellent!', display_order: 3 },
    { customer_name: 'Ananya Iyer', city: 'Bangalore', rating: 5, review: 'As a coach, I regularly order in bulk from Urban Sports. They always deliver genuine products at great prices. The promo codes are a nice bonus. Will continue to recommend them!', display_order: 4 },
    { customer_name: 'Rohit Kapoor', city: 'Gurugram', rating: 5, review: 'Walked into their store in Gurugram and the collection is insane. Staff really knows their cricket. Picked up a Kookaburra bat and Shrey helmet — both are excellent quality. 10/10!', display_order: 5 },
  ];

  for (const t of testimonials) {
    await client.execute({
      sql: 'INSERT INTO testimonials (id, customer_name, city, rating, review, display_order) VALUES (?, ?, ?, ?, ?, ?)',
      args: [uuid(), t.customer_name, t.city, t.rating, t.review, t.display_order]
    });
  }

  console.log("Seeding banners and promos...");
  await client.execute({
    sql: 'INSERT INTO banners (id, headline, subtext, cta_label, cta_link, bg_color, is_active, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    args: [uuid(), 'SEASON SALE: Up to 40% OFF', 'On all English Willow bats — Limited time offer!', 'Shop Bats Now', '/category/cricket-bats', '#C8F53A', 1, 1]
  });
  await client.execute({
    sql: 'INSERT INTO banners (id, headline, subtext, cta_label, cta_link, bg_color, is_active, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    args: [uuid(), 'FREE DELIVERY ABOVE ₹999', 'Shop your favorite cricket gear with free shipping across India', 'Shop Now', '/products', '#0A0A0A', 1, 2]
  });

  await client.execute({ sql: "INSERT INTO promo_codes (id, code, discount_type, discount_value, min_order_value, expiry_date, usage_limit, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", args: [uuid(), 'WELCOME5', 'percentage', 5, 500, '2027-12-31', 1000, 1]});
  await client.execute({ sql: "INSERT INTO promo_codes (id, code, discount_type, discount_value, min_order_value, expiry_date, usage_limit, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", args: [uuid(), 'URBAN10', 'percentage', 10, 2000, '2027-06-30', 500, 1]});
  await client.execute({ sql: "INSERT INTO promo_codes (id, code, discount_type, discount_value, min_order_value, expiry_date, usage_limit, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", args: [uuid(), 'FLAT200', 'flat', 200, 3000, '2027-03-31', 200, 1]});

  console.log("Seeding settings...");
  const settings = [
    ['store_name', 'Urban Sports'],
    ['whatsapp_number', '919999999999'],
    ['store_email', 'admin@urbansports.in'],
    ['delivery_free_above', '999'],
    ['delivery_charge', '79'],
    ['gst_number', 'XXXXXXXXXXXXXXX'],
    ['instagram_url', 'https://instagram.com/urbansports'],
    ['youtube_url', 'https://youtube.com/@urbansports'],
    ['facebook_url', 'https://facebook.com/urbansports'],
    ['footer_text', '© 2026 Urban Sports. All rights reserved. Play Bold. Live Urban.']
  ];

  for (const [key, val] of settings) {
    await client.execute({ sql: 'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', args: [key, val] });
  }

  console.log("SUCCESS! Turso database seeded.");
}

seed().catch(console.error);

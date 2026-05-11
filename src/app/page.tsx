'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Shield, Truck, RotateCcw, MessageCircle, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/shop/ProductCard';
import { Product, Testimonial, Banner, Category, formatPrice } from '@/lib/utils';

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const [prodRes, featRes, catRes, testRes, banRes] = await Promise.all([
          fetch('/api/products?new_arrivals=1&limit=8'),
          fetch('/api/products?featured=1&limit=6'),
          fetch('/api/categories'),
          fetch('/api/testimonials'),
          fetch('/api/banners'),
        ]);

        const prodData = await prodRes.json();
        const featData = await featRes.json();
        const catData = await catRes.json();
        const testData = await testRes.json();
        const banData = await banRes.json();

        setProducts(prodData.products || []);
        setFeatured(featData.products || []);
        setCategories(catData.categories || []);
        setTestimonials(testData.testimonials || []);
        setBanners(banData.banners || []);
      } catch (error) {
        console.error('Failed to load homepage data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const categoryImages: Record<string, string> = {
    'cricket-bats': '/cricket bats.png',
    'batting-pads': '/cricket pads.png',
    'batting-gloves': '/cricket gloves.jpg',
    'helmets': '/cricket helmet.png',
    'kit-bags': '/cricket kit bag.webp',
    'cricket-balls': '/cricket ball.webp',
    'other-accessories': '/wicket keeping gloves.webp',
    'team-jerseys': '/cricket jersey.png',
  };

  return (
    <div className="min-h-screen">
      {/* ========== HERO SECTION ========== */}
      <section className="relative min-h-[80vh] lg:min-h-[85vh] flex items-center overflow-hidden pt-10 border-b border-white/5 dark:border-border">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-surface to-bg-primary" />
        <div className="absolute inset-0">
          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        {/* Hero Image - Absolutely positioned to bottom right */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute bottom-0 right-0 lg:right-0 xl:right-10 h-[60%] sm:h-[70%] lg:h-[98%] xl:h-[100%] hidden md:block pointer-events-none z-10"
        >
          {/* Image backdrop effect */}
          <div className="absolute inset-10 bg-accent/20 rounded-full blur-3xl transform -rotate-6 scale-105 pointer-events-none" />
          <img 
            src="/hero-section.png" 
            alt="Premium Cricket Equipment" 
            className="relative z-10 h-full w-auto object-contain object-bottom drop-shadow-2xl pointer-events-auto"
          />
        </motion.div>

        <div className="relative z-20 w-full mx-auto px-4 md:px-8">
          <div className="max-w-2xl py-2">
            
            {/* Left Column - Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="text-accent text-sm font-medium">Premium Cricket Equipment Store</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-none mb-3"
            >
              <span className="text-text-primary">PLAY BOLD.</span>
              <br />
              <span className="text-accent">LIVE URBAN.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-text-secondary text-base sm:text-lg max-w-md mb-5 leading-relaxed"
            >
              India&apos;s premium cricket equipment destination. Authentic gear from top brands, 
              delivered to your doorstep with love and precision.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-start gap-3"
            >
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 bg-accent text-[#0A0A0A] px-6 py-3 rounded-xl font-semibold text-base sm:text-lg hover:bg-accent-hover transition-all hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-0.5 w-full sm:w-auto"
              >
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 border border-border text-text-primary px-6 py-3 rounded-xl font-semibold text-base sm:text-lg hover:bg-black/5 dark:hover:bg-white/5 hover:border-black/20 dark:hover:border-white/20 transition-all w-full sm:w-auto"
              >
                Explore Products
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex items-center gap-5 sm:gap-8 mt-5"
            >
              {[
                { value: '500+', label: 'Products' },
                { value: '10K+', label: 'Happy Customers' },
                { value: '50+', label: 'Brands' },
              ].map((stat) => (
                <div key={stat.label} className="text-left">
                  <div className="font-display text-xl sm:text-2xl text-accent">{stat.value}</div>
                  <div className="text-text-secondary text-xs mt-0.5">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== MARQUEE TICKER ========== */}
      <div className="bg-accent text-bg-primary py-3 overflow-hidden">
        <div className="animate-marquee flex items-center gap-8 whitespace-nowrap">
          {Array(2).fill(null).map((_, i) => (
            <div key={i} className="flex items-center gap-8 font-semibold text-sm tracking-wide">
              <span>FREE DELIVERY ABOVE ₹999</span>
              <span className="text-bg-primary/50">•</span>
              <span>EASY RETURNS</span>
              <span className="text-bg-primary/50">•</span>
              <span>WHATSAPP SUPPORT</span>
              <span className="text-bg-primary/50">•</span>
              <span>AUTHENTIC PRODUCTS</span>
              <span className="text-bg-primary/50">•</span>
              <span>FAST DISPATCH</span>
              <span className="text-bg-primary/50">•</span>
              <span>COD AVAILABLE</span>
              <span className="text-bg-primary/50">•</span>
              <span>SECURE PAYMENTS</span>
              <span className="text-bg-primary/50 mr-8">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* ========== FEATURED CATEGORIES ========== */}
      <AnimatedSection className="py-20 lg:py-24">
        <div className="w-full mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl sm:text-5xl text-text-primary mb-3">SHOP BY CATEGORY</h2>
            <p className="text-text-secondary">Find everything you need for the game</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {(loading ? Array(8).fill(null) : categories).map((cat, i) => (
              loading ? (
                <div key={i} className="skeleton aspect-square rounded-2xl" />
              ) : (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="group relative aspect-square bg-bg-surface rounded-2xl border border-border overflow-hidden hover:border-accent/30 transition-all duration-300"
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/90 via-transparent to-transparent z-10" />
                  
                  {/* Image background */}
                  <div className="absolute inset-0 bg-bg-surface overflow-hidden">
                    <img 
                      src={categoryImages[cat.slug] || '/hero-section.png'}
                      alt={cat.name}
                      className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-110 transition-all duration-500"
                    />
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                    <h3 className="font-display text-xl text-text-primary group-hover:text-accent transition-colors tracking-wider">
                      {cat.name.toUpperCase()}
                    </h3>
                    {cat.product_count !== undefined && (
                      <p className="text-text-secondary text-sm mt-1">{cat.product_count} Products</p>
                    )}
                  </div>

                  {/* Hover accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left z-20" />
                </Link>
              )
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ========== NEW ARRIVALS ========== */}
      {products.length > 0 && (
        <AnimatedSection className="py-20 lg:py-24 bg-bg-surface/50">
          <div className="w-full mx-auto px-4 md:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-accent text-sm font-semibold uppercase tracking-wider">Just Dropped</span>
                <h2 className="font-display text-4xl sm:text-5xl text-text-primary mt-1">NEW ARRIVALS</h2>
              </div>
              <Link
                href="/products?sort=newest"
                className="hidden sm:flex items-center gap-1 text-accent hover:text-accent-hover text-sm font-medium transition-colors"
              >
                View All <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.slice(0, 8).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>

            <div className="text-center mt-8 sm:hidden">
              <Link href="/products?sort=newest" className="text-accent text-sm font-medium">
                View All Products →
              </Link>
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* ========== OFFER BANNER ========== */}
      {banners.length > 0 && (
        <AnimatedSection className="py-12 lg:py-16">
          <div className="w-full mx-auto px-4 md:px-8">
            <Link
              href={banners[0].cta_link || '/products'}
              className="block relative overflow-hidden rounded-3xl bg-gradient-to-r from-accent/20 via-accent/10 to-accent/5 border border-accent/20 p-8 sm:p-12 group hover:border-accent/40 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <div className="relative z-10">
                <h3 className="font-display text-3xl sm:text-5xl text-accent mb-2">{banners[0].headline}</h3>
                <p className="text-text-secondary text-lg mb-6">{banners[0].subtext}</p>
                <span className="inline-flex items-center gap-2 bg-accent text-bg-primary px-6 py-3 rounded-xl font-semibold group-hover:bg-accent-hover transition-colors">
                  {banners[0].cta_label || 'Shop Now'} <ArrowRight size={18} />
                </span>
              </div>
            </Link>
          </div>
        </AnimatedSection>
      )}

      {/* ========== BEST SELLERS ========== */}
      {featured.length > 0 && (
        <AnimatedSection className="py-20 lg:py-24">
          <div className="w-full mx-auto px-4 md:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-accent text-sm font-semibold uppercase tracking-wider">Fan Favorites</span>
                <h2 className="font-display text-4xl sm:text-5xl text-text-primary mt-1">BEST SELLERS</h2>
              </div>
              <Link
                href="/products?featured=1"
                className="hidden sm:flex items-center gap-1 text-accent hover:text-accent-hover text-sm font-medium transition-colors"
              >
                View All <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {featured.slice(0, 6).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* ========== WHY CHOOSE US ========== */}
      <AnimatedSection className="py-20 lg:py-24 bg-bg-surface/50">
        <div className="w-full mx-auto px-4 md:px-8">
          <h2 className="font-display text-4xl sm:text-5xl text-text-primary text-center mb-12">WHY CHOOSE US</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Shield className="w-8 h-8" />, title: 'Authentic Products', desc: '100% genuine products from authorized dealers' },
              { icon: <Truck className="w-8 h-8" />, title: 'Fast Delivery', desc: 'Free delivery above ₹999 across India' },
              { icon: <RotateCcw className="w-8 h-8" />, title: 'Easy Returns', desc: 'Hassle-free returns within 7 days' },
              { icon: <MessageCircle className="w-8 h-8" />, title: 'WhatsApp Support', desc: 'Quick support on WhatsApp anytime' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-bg-surface rounded-2xl border border-border hover:border-accent/20 transition-all group"
              >
                <div className="w-16 h-16 mx-auto bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-4 group-hover:bg-accent/20 transition-colors">
                  {item.icon}
                </div>
                <h3 className="font-display text-xl text-text-primary mb-2 tracking-wide">{item.title.toUpperCase()}</h3>
                <p className="text-text-secondary text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ========== TESTIMONIALS ========== */}
      {testimonials.length > 0 && (
        <AnimatedSection className="py-20 lg:py-24">
          <div className="w-full mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <span className="text-accent text-sm font-semibold uppercase tracking-wider">What Our Customers Say</span>
              <h2 className="font-display text-4xl sm:text-5xl text-text-primary mt-2">TESTIMONIALS</h2>
            </div>

            <div className="max-w-3xl mx-auto relative">
              <div className="bg-bg-surface/80 backdrop-blur-sm rounded-3xl border border-border px-10 py-12 sm:px-14 sm:py-16 shadow-xl">
                <div className="flex gap-1.5 mb-6">
                  {Array(5).fill(null).map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < (testimonials[currentTestimonial]?.rating || 5) ? 'text-accent fill-accent' : 'text-white/20'}
                    />
                  ))}
                </div>
                <p className="text-text-primary text-lg sm:text-xl leading-relaxed mb-6 min-h-[80px]">
                  &quot;{testimonials[currentTestimonial]?.review}&quot;
                </p>
                <div>
                  <p className="font-semibold text-text-primary">{testimonials[currentTestimonial]?.customer_name}</p>
                  <p className="text-text-secondary text-sm">{testimonials[currentTestimonial]?.city}</p>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={() => setCurrentTestimonial((p) => (p - 1 + testimonials.length) % testimonials.length)}
                  className="w-10 h-10 rounded-full bg-bg-surface border border-border flex items-center justify-center text-white/60 hover:text-accent hover:border-accent/30 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-2">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentTestimonial(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === currentTestimonial ? 'bg-accent w-6' : 'bg-white/20'}`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setCurrentTestimonial((p) => (p + 1) % testimonials.length)}
                  className="w-10 h-10 rounded-full bg-bg-surface border border-border flex items-center justify-center text-white/60 hover:text-accent hover:border-accent/30 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* ========== CTA SECTION ========== */}
      <AnimatedSection className="py-24 lg:py-32 bg-bg-surface/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl text-text-primary mb-4">
            READY TO <span className="text-accent">GEAR UP?</span>
          </h2>
          <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">
            Browse our complete collection of premium cricket equipment and get it delivered to your doorstep.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-accent text-bg-primary px-8 py-4 rounded-xl font-semibold text-lg hover:bg-accent-hover transition-all hover:shadow-lg hover:shadow-accent/20"
          >
            Shop All Products <ArrowRight size={20} />
          </Link>
        </div>
      </AnimatedSection>
    </div>
  );
}

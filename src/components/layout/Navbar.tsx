'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, Search, ChevronDown, Sun, Moon } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';

const categories = [
  { name: 'Cricket Bats', slug: 'cricket-bats' },
  { name: 'Batting Pads', slug: 'batting-pads' },
  { name: 'Batting Gloves', slug: 'batting-gloves' },
  { name: 'Helmets', slug: 'helmets' },
  { name: 'Kit Bags', slug: 'kit-bags' },
  { name: 'Cricket Balls', slug: 'cricket-balls' },
  { name: 'Other Accessories', slug: 'other-accessories' },
  { name: 'Team Jerseys', slug: 'team-jerseys' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const cartCount = useCartStore((s) => s.getItemCount());
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setCatOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-bg-primary/98 backdrop-blur-xl shadow-lg border-b border-border'
            : 'bg-bg-primary/85 backdrop-blur-md border-b border-border'
        }`}
      >
        <div className="w-full mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              {/* Cricket bat SVG icon */}
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="transition-transform group-hover:rotate-[-10deg]">
                <rect x="6" y="2" width="6" height="20" rx="2" fill="#C8F53A" transform="rotate(15 9 12)"/>
                <rect x="8" y="20" width="4" height="10" rx="1" fill="#999" transform="rotate(15 10 25)"/>
                <circle cx="24" cy="24" r="5" stroke="#C8F53A" strokeWidth="2" fill="none"/>
              </svg>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-2xl lg:text-3xl tracking-wider text-text-primary">URBAN SPORTS</span>
                <span className="font-display text-2xl lg:text-3xl tracking-wider text-accent">STUDIO</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              <Link
                href="/"
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                  isActive('/') ? 'text-accent' : 'text-text-primary/80 hover:text-text-primary hover:bg-text-primary/5'
                }`}
              >
                Home
              </Link>
              
              {/* Categories dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setCatOpen(true)}
                onMouseLeave={() => setCatOpen(false)}
              >
                <button
                  className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg flex items-center gap-1 ${
                    pathname.startsWith('/category') ? 'text-accent' : 'text-text-primary/80 hover:text-text-primary hover:bg-text-primary/5'
                  }`}
                >
                  Categories <ChevronDown size={14} className={`transition-transform ${catOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {catOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1 w-64 bg-bg-surface border border-border rounded-xl overflow-hidden shadow-2xl shadow-black/50"
                    >
                      {categories.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/category/${cat.slug}`}
                          className="block px-4 py-3 text-sm text-text-primary/80 hover:text-accent hover:bg-text-primary/5 transition-colors border-b border-text-primary/5 last:border-0"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/products"
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                  isActive('/products') ? 'text-accent' : 'text-text-primary/80 hover:text-text-primary hover:bg-text-primary/5'
                }`}
              >
                All Products
              </Link>
              <Link
                href="/about"
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                  isActive('/about') ? 'text-accent' : 'text-text-primary/80 hover:text-text-primary hover:bg-text-primary/5'
                }`}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                  isActive('/contact') ? 'text-accent' : 'text-text-primary/80 hover:text-text-primary hover:bg-text-primary/5'
                }`}
              >
                Contact
              </Link>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-text-primary/70 hover:text-text-primary transition-colors rounded-lg hover:bg-text-primary/5"
                aria-label="Toggle Theme"
              >
                {mounted ? (
                  theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />
                ) : (
                  <div className="w-5 h-5" />
                )}
              </button>

              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-text-primary/70 hover:text-text-primary transition-colors rounded-lg hover:bg-text-primary/5"
              >
                <Search size={20} />
              </button>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 text-text-primary/70 hover:text-text-primary transition-colors rounded-lg hover:bg-text-primary/5"
              >
                <ShoppingCart size={20} />
                {mounted && cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent text-bg-primary text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-text-primary/70 hover:text-text-primary transition-colors rounded-lg hover:bg-text-primary/5"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-text-primary/5 overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
                    }
                  }}
                  className="relative"
                >
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for cricket bats, balls, gear..."
                    className="w-full bg-bg-surface border border-border rounded-xl pl-12 pr-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent/50 transition-colors"
                    autoFocus
                  />
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-bg-surface z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-xl text-text-primary">URBAN</span>
                    <span className="font-display text-xl text-accent">SPORTS</span>
                  </div>
                  <button onClick={() => setMobileOpen(false)} className="p-2 text-text-primary/70">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-1">
                  <Link href="/" className="block px-4 py-3 rounded-lg text-text-primary hover:bg-text-primary/5 transition-colors font-medium">
                    Home
                  </Link>
                  <Link href="/products" className="block px-4 py-3 rounded-lg text-text-primary hover:bg-text-primary/5 transition-colors font-medium">
                    All Products
                  </Link>
                  
                  <div className="px-4 py-2 text-xs text-text-secondary uppercase tracking-wider mt-4">Categories</div>
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/category/${cat.slug}`}
                      className="block px-4 py-2.5 rounded-lg text-text-primary/70 hover:text-accent hover:bg-text-primary/5 transition-colors text-sm"
                    >
                      {cat.name}
                    </Link>
                  ))}

                  <div className="border-t border-text-primary/5 mt-4 pt-4">
                    <Link href="/about" className="block px-4 py-3 rounded-lg text-text-primary hover:bg-text-primary/5 transition-colors font-medium">
                      About Us
                    </Link>
                    <Link href="/contact" className="block px-4 py-3 rounded-lg text-text-primary hover:bg-text-primary/5 transition-colors font-medium">
                      Contact
                    </Link>
                    <Link href="/testimonials" className="block px-4 py-3 rounded-lg text-text-primary hover:bg-text-primary/5 transition-colors font-medium">
                      Testimonials
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

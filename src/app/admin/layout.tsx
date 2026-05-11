'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, Package, FolderOpen, ShoppingCart, Tag, MessageSquare, 
  Image, Settings, LogOut, Menu, X, ChevronRight 
} from 'lucide-react';

const sidebarLinks = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/products', icon: Package, label: 'Products' },
  { href: '/admin/categories', icon: FolderOpen, label: 'Categories' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/admin/promos', icon: Tag, label: 'Promo Codes' },
  { href: '/admin/testimonials', icon: MessageSquare, label: 'Testimonials' },
  { href: '/admin/banners', icon: Image, label: 'Banners' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setAuthenticated(true);
    }
    setChecking(false);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('admin_token', data.token);
        setAuthenticated(true);
      } else {
        setLoginError(data.error || 'Invalid credentials');
      }
    } catch {
      setLoginError('Login failed. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setAuthenticated(false);
    router.push('/admin');
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="skeleton w-20 h-20 rounded-full" />
      </div>
    );
  }

  // Login screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="font-display text-3xl text-text-primary">URBAN</span>
              <span className="font-display text-3xl text-accent">SPORTS</span>
            </div>
            <p className="text-text-secondary">Admin Dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="bg-bg-surface rounded-2xl border border-border p-8 space-y-5">
            <h2 className="font-display text-xl text-text-primary tracking-wider text-center">ADMIN LOGIN</h2>
            {loginError && (
              <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3">
                {loginError}
              </div>
            )}
            <div>
              <label className="text-sm text-text-secondary mb-1 block">Email</label>
              <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required
                className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent/50"
                placeholder="admin@urbansports.in" />
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1 block">Password</label>
              <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required
                className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent/50"
                placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full bg-accent text-bg-primary py-3.5 rounded-xl font-semibold hover:bg-accent-hover transition-colors">
              Sign In
            </button>
            <p className="text-xs text-text-secondary text-center">
              Default: admin@urbansports.in / urban2026
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-bg-surface border-r border-border fixed top-0 bottom-0 left-0 z-30">
        <div className="p-6 border-b border-border">
          <Link href="/admin" className="flex items-baseline gap-1">
            <span className="font-display text-xl text-text-primary">URBAN</span>
            <span className="font-display text-xl text-accent">SPORTS</span>
          </Link>
          <p className="text-xs text-text-secondary mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
              >
                <link.icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors mb-1">
            <ChevronRight size={18} /> View Store
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-text-secondary hover:text-danger hover:bg-danger/5 transition-colors w-full">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-bg-surface border-b border-border z-30 flex items-center justify-between px-4">
        <button onClick={() => setSidebarOpen(true)} className="p-2 text-white/70">
          <Menu size={22} />
        </button>
        <div className="flex items-baseline gap-1">
          <span className="font-display text-lg text-text-primary">URBAN</span>
          <span className="font-display text-lg text-accent">SPORTS</span>
        </div>
        <button onClick={handleLogout} className="p-2 text-white/70"><LogOut size={18} /></button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed top-0 left-0 bottom-0 w-64 bg-bg-surface z-50 lg:hidden p-4">
            <div className="flex items-center justify-between mb-6 px-2">
              <div className="flex items-baseline gap-1">
                <span className="font-display text-lg text-text-primary">URBAN</span>
                <span className="font-display text-lg text-accent">SPORTS</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 text-white/70"><X size={18} /></button>
            </div>
            <nav className="space-y-1">
              {sidebarLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link key={link.href} href={link.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                    }`}>
                    <link.icon size={18} /> {link.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

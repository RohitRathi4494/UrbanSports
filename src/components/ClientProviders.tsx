'use client';

import { usePathname } from 'next/navigation';
import { ThemeProvider } from 'next-themes';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import BackToTop from '@/components/ui/BackToTop';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        {children}
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <Navbar />
      <main className="flex-1 pt-16 lg:pt-20">{children}</main>
      <Footer />
      <WhatsAppButton />
      <BackToTop />
    </ThemeProvider>
  );
}

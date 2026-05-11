import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import ClientProviders from "@/components/ClientProviders";

export const metadata: Metadata = {
  title: {
    default: "Urban Sports Studio — Premium Cricket Equipment Store | Play Bold. Live Urban.",
    template: "%s | Urban Sports Studio",
  },
  description: "India's premium online cricket equipment store. Authentic products from top brands like SG, SS, Kookaburra, and GM. Fast delivery across India.",
  keywords: [
    "cricket equipment",
    "buy cricket bat online",
    "english willow bats",
    "cricket helmets",
    "cricket gear india",
    "urban sports studio",
    "premium cricket store"
  ],
  openGraph: {
    title: "Urban Sports Studio — Premium Cricket Equipment Store",
    description: "India's premium online cricket equipment store. Authentic products, fast delivery, WhatsApp support.",
    url: "https://urbansports.in",
    siteName: "Urban Sports Studio",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary font-body" suppressHydrationWarning>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1A1A1A',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '14px',
            },
          }}
        />
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

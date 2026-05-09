import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import ClientProviders from "@/components/ClientProviders";

export const metadata: Metadata = {
  title: {
    default: "Urban Sports — Premium Cricket Equipment Store | Play Bold. Live Urban.",
    template: "%s | Urban Sports",
  },
  description:
    "India's premium online cricket equipment store. Shop authentic cricket bats, balls, protective gear, shoes & accessories from top brands. Free delivery above ₹999. WhatsApp support.",
  keywords: [
    "cricket equipment",
    "cricket bats",
    "cricket balls",
    "batting pads",
    "cricket helmets",
    "cricket shoes",
    "online cricket store india",
    "urban sports",
  ],
  openGraph: {
    title: "Urban Sports — Premium Cricket Equipment Store",
    description:
      "India's premium online cricket equipment store. Authentic products, fast delivery, WhatsApp support.",
    type: "website",
    locale: "en_IN",
    siteName: "Urban Sports",
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

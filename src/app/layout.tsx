import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { ConsentBanner } from "@/components/public/ConsentBanner";
import { ToastProvider } from "@/components/ui/Toast";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: {
    default: "DiyaVerse | This Diwali, Let's Light India Together",
    template: "%s | DiyaVerse",
  },
  description:
    "Light a virtual diya in under ten seconds, attach your heartfelt wish, and join a real, truthful, nationwide wall of lights for Diwali.",
  keywords: [
    "Diwali",
    "Diya",
    "DiyaVerse",
    "Light a Diya",
    "Diwali Wishes",
    "Deepavali",
    "Virtual Diya",
    "India",
  ],
  authors: [{ name: "DiyaVerse" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "DiyaVerse | This Diwali, Let's Light India Together",
    description:
      "Light a virtual diya, attach a wish, and join our nationwide wall of lights this Diwali.",
    siteName: "DiyaVerse",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: "DiyaVerse Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DiyaVerse | This Diwali, Let's Light India Together",
    description: "Light a virtual diya and share your Diwali wish.",
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#140206",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="scroll-smooth"
    >
      <body className="text-ivory-50 flex flex-col min-h-screen selection:bg-flame-500 selection:text-night-950">
        <ToastProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-flame-400 text-night-950 font-bold rounded-lg shadow-lg"
          >
            Skip to main content
          </a>
          <Header />
          <main id="main-content" className="flex-1 flex flex-col">
            {children}
          </main>
          <Footer />
          <ConsentBanner />
          <Analytics />
        </ToastProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { ConsentBanner } from "@/components/public/ConsentBanner";
import { ToastProvider } from "@/components/ui/Toast";
import { Analytics } from "@vercel/analytics/next";
import { SiteAtmosphere } from "@/components/public/SiteAtmosphere";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-devanagari",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://diyaverse.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DiyaVerse | Light a Virtual Diya This Diwali",
    template: "%s | DiyaVerse",
  },
  description:
    "Light a virtual diya online this Diwali 2026. Attach your heartfelt Diwali wishes, explore the sacred Diya Wall, and illuminate India together on DiyaVerse.",
  keywords: [
    "virtual diya",
    "Diwali wishes",
    "light a diya online",
    "Diwali 2026",
    "DiyaVerse",
    "Diwali",
    "Deepavali",
    "Ramayana quiz online",
    "Diya Wall",
    "दीया जलाएं",
    "दिवाली शुभकामनाएं",
    "दीपावली",
  ],
  authors: [{ name: "DiyaVerse" }],
  creator: "DiyaVerse",
  publisher: "DiyaVerse",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
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
    title: "DiyaVerse | Light a Virtual Diya This Diwali",
    description:
      "Light a virtual diya online this Diwali 2026. Attach your heartfelt Diwali wishes, explore the sacred Diya Wall, and illuminate India together on DiyaVerse.",
    siteName: "DiyaVerse",
    locale: "en_IN",
    type: "website",
    url: siteUrl,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "DiyaVerse - This Diwali, Let's Light India Together",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DiyaVerse | Light a Virtual Diya This Diwali",
    description:
      "Light a virtual diya online this Diwali 2026. Attach your heartfelt Diwali wishes and illuminate India together on DiyaVerse.",
    images: ["/opengraph-image"],
  },
};

export const viewport: Viewport = {
  themeColor: "#140206",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`scroll-smooth ${inter.variable} ${playfair.variable} ${notoDevanagari.variable}`}
    >
      <body className="text-ivory-50 flex flex-col min-h-screen selection:bg-flame-500 selection:text-night-950">
        <ToastProvider>
          {/* Dense cinematic smoke & festive jukebox audio player across entire site */}
          <SiteAtmosphere />

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

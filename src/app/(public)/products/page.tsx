import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import Script from "next/script";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://diyaverse.vercel.app";

export const metadata: Metadata = {
  title: "Products by ZenithDistrict | Independent Venture House Portfolio",
  description:
    "Explore digital products engineered and operated by ZenithDistrict (zenithdistrict.com) — including DiyaVerse, I Hate Love PDF, Product.forum, and GitFC.",
  keywords: [
    "ZenithDistrict",
    "ZenithDistrict products",
    "ZenithDistrict ventures",
    "DiyaVerse",
    "I Hate Love PDF",
    "Product.forum",
    "GitFC",
    "Independent software products",
  ],
  alternates: {
    canonical: "/products",
  },
  openGraph: {
    title: "Products by ZenithDistrict | Venture House Portfolio",
    description:
      "Explore independent software products and utilities engineered by ZenithDistrict ventures house.",
    url: `${siteUrl}/products`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Products by ZenithDistrict | DiyaVerse",
    description: "Explore live products engineered by ZenithDistrict venture house.",
  },
};

interface ProductItem {
  id: string;
  name: string;
  category: string;
  sector: string;
  tagline: string;
  description: string;
  url: string;
  isInternal?: boolean;
  status: "LIVE" | "BUILDING";
  tags: string[];
  features: string[];
}

const PRODUCTS: ProductItem[] = [
  {
    id: "diyaverse",
    name: "DiyaVerse",
    category: "Festive Culture & Web Experience",
    sector: "Z-03 // PRODUCTS",
    tagline: "India's sacred nationwide digital Deepotsav.",
    description:
      "A truthful, nationwide digital sanctuary where users light virtual diyas in under ten seconds, attach personal blessings, and illuminate an interactive collective wall of lights for Diwali.",
    url: "/",
    isInternal: true,
    status: "LIVE",
    tags: ["Next.js 15", "Web Audio API", "Interactive Canvas", "Zero Signup"],
    features: [
      "Real-time synchronized nationwide Diya Wall",
      "Interactive matchstick ignition with haptics & audio",
      "Sharable custom festive greeting cards",
      "Interactive 10-question Ramayana Gyan Quiz",
    ],
  },
  {
    id: "i-hate-love-pdf",
    name: "I Hate Love PDF",
    category: "Productivity & PDF Tools",
    sector: "Z-03 // PRODUCTS",
    tagline: "Private, in-browser PDF manipulation without predatory barriers.",
    description:
      "A free, privacy-first PDF utility designed to make everyday document tasks simpler, faster, and ad-free. Runs all operations locally in the browser sandbox without uploading private files to remote servers.",
    url: "https://ihatelovepdf.com/",
    status: "LIVE",
    tags: ["WebAssembly", "PDF-lib", "Client-Side", "Privacy First"],
    features: [
      "Merge, split, rotate, and reorder PDF pages",
      "Zero server uploads — 100% in-browser processing",
      "No arbitrary file size paywalls or spam ads",
      "GDPR and enterprise privacy friendly",
    ],
  },
  {
    id: "product-forum",
    name: "Product.forum",
    category: "Product Discovery & Launchpad",
    sector: "Z-03 // PRODUCTS",
    tagline: "A dedicated launchpad for digital products and creator tools.",
    description:
      "A platform built for discovering, showcasing, and providing genuine feedback on new indie software products, developer utilities, and digital projects created by makers.",
    url: "https://product.forum",
    status: "LIVE",
    tags: ["Community", "Product Hunt Alternative", "Creator Economy"],
    features: [
      "Curated daily product launches",
      "Direct maker-to-community feedback loops",
      "High-signal discovery without pay-to-win ranking",
      "Developer & indie founder community",
    ],
  },
  {
    id: "gitfc",
    name: "GitFC",
    category: "Developer Tools & Gamification",
    sector: "Z-03 // PRODUCTS",
    tagline: "A gamified GitHub contributions experience for developers.",
    description:
      "Transforms your everyday GitHub commit history, streak momentum, and code metrics into dynamic, visual, and collectible cards to showcase developer activity.",
    url: "https://gitfc.vercel.app/",
    status: "LIVE",
    tags: ["GitHub API", "Developer Experience", "Gamification", "Stats Cards"],
    features: [
      "Dynamic contribution streak visualizations",
      "Customizable developer profile brag cards",
      "Instant SVG and PNG exports for GitHub READMEs",
      "Lightweight, fast zero-auth generation",
    ],
  },
];

export default function ProductsPage() {
  const breadcrumbsSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products by ZenithDistrict",
        item: `${siteUrl}/products`,
      },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Products by ZenithDistrict",
    description: "Independent digital products and utilities by ZenithDistrict venture house.",
    itemListElement: PRODUCTS.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      description: item.description,
      url: item.isInternal ? siteUrl : item.url,
    })),
  };

  return (
    <>
      <Script
        id="products-breadcrumbs-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />
      <Script
        id="products-itemlist-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <div className="min-h-screen py-12 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-16 animate-fade-in">
        {/* Header Section with ZenithDistrict Parent Brand Callout */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-flame-400/10 border border-flame-400/30 text-xs font-mono tracking-wider text-flame-300 uppercase">
            <span className="w-2 h-2 rounded-full bg-flame-400 animate-pulse" />
            <span>ZenithDistrict Ventures // Z-03 Products</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-ivory-50 tracking-tight leading-tight">
            Products by <span className="text-flame-400">ZenithDistrict</span>
          </h1>

          <p className="text-base sm:text-lg text-ivory-300/90 leading-relaxed font-sans">
            Independent software tools and web systems engineered to solve real friction. Built and
            operated by{" "}
            <a
              href="https://zenithdistrict.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-flame-400 font-semibold hover:underline"
            >
              ZenithDistrict
            </a>
            , an autonomous venture house taking ideas from first sketch to standalone release.
          </p>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PRODUCTS.map((prod) => (
            <article
              key={prod.id}
              className="relative rounded-3xl bg-night-900/60 border border-night-800 hover:border-flame-400/40 p-7 sm:p-9 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,159,28,0.12)] group overflow-hidden"
            >
              {/* Subtle accent glow */}
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-flame-400/10 rounded-full blur-2xl pointer-events-none group-hover:bg-flame-400/20 transition-all" />

              <div className="space-y-5">
                {/* Sector & Live Badge */}
                <div className="flex items-center justify-between gap-2 border-b border-night-800/80 pb-4">
                  <span className="text-xs font-mono text-flame-300/80 tracking-wider">
                    {prod.sector}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>{prod.status}</span>
                  </span>
                </div>

                {/* Name & Tagline */}
                <div>
                  <span className="text-xs font-mono uppercase text-ivory-300/60 block mb-1">
                    {prod.category}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ivory-50 group-hover:text-flame-300 transition-colors">
                    {prod.name}
                  </h2>
                  <p className="text-sm font-medium text-flame-400/90 mt-1 italic font-serif">
                    &ldquo;{prod.tagline}&rdquo;
                  </p>
                </div>

                {/* Description */}
                <p className="text-sm text-ivory-300/80 leading-relaxed font-sans">
                  {prod.description}
                </p>

                {/* Key Features Bullet List */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-mono text-ivory-300/60 uppercase tracking-wider block">
                    Core Capabilities:
                  </span>
                  <ul className="space-y-1 text-xs text-ivory-200">
                    {prod.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-flame-400 mt-0.5">✦</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {prod.tags.map((t, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-night-950/70 border border-night-800 text-ivory-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-6 border-t border-night-800/80 flex items-center justify-between">
                {prod.isInternal ? (
                  <Link
                    href={prod.url}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-night-950 bg-flame-400 hover:bg-flame-300 transition-all shadow-md shadow-flame-500/20"
                  >
                    <span>Open {prod.name}</span>
                    <span>→</span>
                  </Link>
                ) : (
                  <a
                    href={prod.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-night-950 bg-flame-400 hover:bg-flame-300 transition-all shadow-md shadow-flame-500/20"
                  >
                    <span>Launch {prod.name}</span>
                    <span className="text-sm">↗</span>
                  </a>
                )}

                <span className="text-xs font-mono text-ivory-300/60 hover:text-flame-300 transition-colors">
                  {prod.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* Company Overview & Inquiries Callout */}
        <section className="bg-gradient-to-r from-night-900/90 via-[#20040D]/90 to-night-900/90 border border-flame-500/30 rounded-3xl p-8 sm:p-12 shadow-[0_0_50px_rgba(255,159,28,0.15)] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left max-w-2xl">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-mono text-flame-300">
              <span>PARENT VENTURE HOUSE</span>
              <span>•</span>
              <span>EST. 2026</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ivory-50">
              About ZenithDistrict
            </h2>
            <p className="text-sm text-ivory-300 leading-relaxed">
              ZenithDistrict operates four core disciplines: <strong>Studio (Z-01)</strong> for high-craft client
              engineering, <strong>Brands (Z-02)</strong> for consumer ventures, <strong>Products (Z-03)</strong> for
              independent software utilities, and <strong>Labs (Z-04)</strong> for technical experiments.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-mono text-ivory-300/80 pt-1">
              <span>Official: <a href="https://zenithdistrict.com/" target="_blank" rel="noopener noreferrer" className="text-flame-400 underline">zenithdistrict.com</a></span>
              <span>•</span>
              <span>Inquiries: <a href="mailto:zenithdistrict14@gmail.com" className="text-flame-400 underline">zenithdistrict14@gmail.com</a></span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full sm:w-auto">
            <a
              href="mailto:zenithdistrict14@gmail.com?subject=Project%20Inquiry%20via%20DiyaVerse"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-xs text-night-950 bg-flame-400 hover:bg-flame-300 transition-all shadow-[0_0_20px_rgba(255,159,28,0.3)] text-center min-w-[200px]"
            >
              ✉ Contact Company
            </a>
            <a
              href="https://zenithdistrict.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium text-xs text-ivory-100 border border-flame-400/40 hover:bg-night-800 transition-all text-center"
            >
              Visit zenithdistrict.com ↗
            </a>
          </div>
        </section>
      </div>
    </>
  );
}

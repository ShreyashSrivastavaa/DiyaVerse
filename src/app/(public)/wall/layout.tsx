import { Metadata } from "next";
import Script from "next/script";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://diyaverse.vercel.app";

export const metadata: Metadata = {
  title: "Live Diya Wall | Nationwide Wall of Lights",
  description:
    "Explore thousands of virtual diyas lit across India. Read heartfelt Diwali wishes and prayers on our live interactive constellation of lights.",
  keywords: [
    "Diya Wall",
    "live diyas",
    "Diwali wishes wall",
    "virtual deepotsav",
    "India lights wall",
    "दीपावली वॉल",
  ],
  alternates: {
    canonical: "/wall",
  },
  openGraph: {
    title: "Live Diya Wall | Nationwide Wall of Lights",
    description:
      "Explore thousands of virtual diyas lit across India. Read heartfelt Diwali wishes on our interactive Diya Wall.",
    url: `${siteUrl}/wall`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Diya Wall | DiyaVerse",
    description: "Explore the nationwide wall of lights and read live Diwali wishes from across India.",
  },
};

export default function WallLayout({ children }: { children: React.ReactNode }) {
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
        name: "Diya Wall",
        item: `${siteUrl}/wall`,
      },
    ],
  };

  return (
    <>
      <Script
        id="wall-breadcrumbs-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />
      {children}
    </>
  );
}

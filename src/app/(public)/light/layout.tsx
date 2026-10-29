import { Metadata } from "next";
import Script from "next/script";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://diyaverse.vercel.app";

export const metadata: Metadata = {
  title: "Light a Virtual Diya Online | Diwali Wishes 2026",
  description:
    "Kindle your sacred virtual diya in under ten seconds. Choose from terracotta, brass, lotus, marigold, or rangoli styles, attach heartfelt Diwali wishes, and illuminate India together.",
  keywords: [
    "light a diya online",
    "virtual diya",
    "Diwali wishes 2026",
    "kindle a diya",
    "online deepotsav",
    "दीया जलाएं",
  ],
  alternates: {
    canonical: "/light",
  },
  openGraph: {
    title: "Light a Virtual Diya Online | Diwali Wishes 2026",
    description:
      "Kindle your sacred virtual diya in seconds. Choose your festive diya style, attach your wish, and share light with the nation.",
    url: `${siteUrl}/light`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Light a Virtual Diya Online | DiyaVerse",
    description: "Kindle a virtual diya with your personal Diwali wish and illuminate India.",
  },
};

export default function LightLayout({ children }: { children: React.ReactNode }) {
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Light a Virtual Diya - DiyaVerse",
    url: `${siteUrl}/light`,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "All",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    description:
      "Kindle a sacred virtual diya in under ten seconds, attach heartfelt wishes, and share blessing cards with family and friends.",
    potentialAction: {
      "@type": "CreateAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/light`,
      },
      result: {
        "@type": "Thing",
        name: "Virtual Diya",
      },
    },
  };

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
        name: "Light a Diya",
        item: `${siteUrl}/light`,
      },
    ],
  };

  return (
    <>
      <Script
        id="light-webapp-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <Script
        id="light-breadcrumbs-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />
      {children}
    </>
  );
}

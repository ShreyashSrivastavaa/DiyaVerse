import { Metadata } from "next";
import Script from "next/script";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://diyaverse.vercel.app";

export const metadata: Metadata = {
  title: "Contact Us | DiyaVerse Support & Feedback",
  description:
    "Get in touch with the DiyaVerse team. Share your feedback, report an issue, or ask questions about our nationwide digital Diwali celebration.",
  keywords: ["Contact DiyaVerse", "DiyaVerse support", "Diwali wishes feedback"],
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us | DiyaVerse Support & Feedback",
    description: "Get in touch with the DiyaVerse team. We would love to hear from you this Diwali.",
    url: `${siteUrl}/contact`,
    type: "website",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
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
        name: "Contact Us",
        item: `${siteUrl}/contact`,
      },
    ],
  };

  return (
    <>
      <Script
        id="contact-breadcrumbs-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />
      {children}
    </>
  );
}

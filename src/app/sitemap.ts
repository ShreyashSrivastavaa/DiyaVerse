import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export const revalidate = 3600; // Cache for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://diyaverse.vercel.app";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/light`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/wall`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/quiz`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  let diyaRoutes: MetadataRoute.Sitemap = [];
  try {
    const recentDiyas = await prisma.diya.findMany({
      where: {
        status: "PUBLISHED",
        wishVisible: true,
      },
      select: {
        publicId: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 500,
    });

    diyaRoutes = recentDiyas.map((d) => ({
      url: `${siteUrl}/d/${d.publicId}`,
      lastModified: d.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (err) {
    // If DB is offline during build, continue gracefully with static routes
    console.warn("Sitemap dynamic diya generation fallback:", err);
  }

  return [...staticRoutes, ...diyaRoutes];
}

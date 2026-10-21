import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://diyaverse.in";
  const now = new Date();

  const routes = ["", "/light", "/wall", "/about", "/privacy", "/terms", "/contact"];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" || route === "/wall" ? "hourly" : "daily",
    priority: route === "" ? 1.0 : route === "/light" || route === "/wall" ? 0.9 : 0.5,
  }));
}

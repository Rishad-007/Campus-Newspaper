import { NextResponse } from "next/server";
import { getPublicCategoryMap } from "@/lib/news-service";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dailybrur.com";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await getPublicCategoryMap();
  const now = new Date().toISOString();

  let urls = "";
  for (const category of categories) {
    urls += `
  <url>
    <loc>${SITE_URL}/category/${category.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=3600",
    },
  });
}
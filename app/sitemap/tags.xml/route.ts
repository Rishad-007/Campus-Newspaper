import { NextResponse } from "next/server";
import { getPublicTagList } from "@/lib/news-service";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dailybrur.com";

export const dynamic = "force-dynamic";

export async function GET() {
  const tags = await getPublicTagList();
  const now = new Date().toISOString();

  let urls = "";
  for (const tag of tags) {
    urls += `
  <url>
    <loc>${SITE_URL}/tag/${tag}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
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
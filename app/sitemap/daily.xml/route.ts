import { NextResponse } from "next/server";
import { getPublicStories } from "@/lib/news-service";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dailybrur.com";

function getChangeFrequency(placement: string): string {
  switch (placement) {
    case "lead":
      return "hourly";
    case "brief":
      return "daily";
    case "latest":
      return "daily";
    default:
      return "weekly";
  }
}

function getPriority(placement: string): number {
  switch (placement) {
    case "lead":
      return 0.9;
    case "brief":
      return 0.75;
    case "latest":
      return 0.6;
    default:
      return 0.5;
  }
}

export const dynamic = "force-dynamic";

export async function GET() {
  const stories = await getPublicStories();

  let urls = "";
  for (const story of stories) {
    const pageUrl = `${SITE_URL}/news/${story.slug}`;
    const imageUrl = story.heroImage.startsWith("http")
      ? story.heroImage
      : `${SITE_URL}${story.heroImage}`;
    const lastModified = new Date(story.publishedAt).toISOString();
    const excerpt = story.excerpt
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .slice(0, 200);

    urls += `
  <url>
    <loc>${pageUrl}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>${getChangeFrequency(story.placement)}</changefreq>
    <priority>${getPriority(story.placement)}</priority>
    <image:image xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
      <image:loc>${imageUrl}</image:loc>
      <image:title><![CDATA[${story.title}]]></image:title>
      <image:caption><![CDATA[${excerpt}]]></image:caption>
    </image:image>
  </url>`;
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
       xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urls}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=1800",
    },
  });
}
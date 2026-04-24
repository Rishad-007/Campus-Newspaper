import { MetadataRoute } from "next";
import { getPublicStories, getPublicCategoryMap, getPublicTagList } from "@/lib/news-service";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dailybrur.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stories = await getPublicStories();
  const categories = await getPublicCategoryMap();
  const tags = await getPublicTagList();

  const now = new Date();

  const storyUrls: MetadataRoute.Sitemap = stories.map((story) => ({
    url: `${SITE_URL}/news/${story.slug}`,
    lastModified: new Date(story.publishedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categoryUrls: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}/category/${category.slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  const tagUrls: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${SITE_URL}/tag/${tag}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${SITE_URL}/news`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
  ];

  return [...staticUrls, ...storyUrls, ...categoryUrls, ...tagUrls];
}
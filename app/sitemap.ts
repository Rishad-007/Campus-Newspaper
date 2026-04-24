import { MetadataRoute } from "next";
import { getPublicStories, getPublicCategoryMap, getPublicTagList } from "@/lib/news-service";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dailybrur.com";

function getChangeFrequency(placement: string): "hourly" | "daily" | "weekly" {
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

function getPriority(placement: string, index: number): number {
  if (placement === "lead") return 0.9;
  if (placement === "brief") return 0.75;
  if (placement === "latest") return 0.6;
  return 0.5;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stories = await getPublicStories();
  const categories = await getPublicCategoryMap();
  const tags = await getPublicTagList();

  const now = new Date();

  const storyUrls: MetadataRoute.Sitemap = stories.map((story, index) => {
    const pageUrl = `${SITE_URL}/news/${story.slug}`;
    const lastModified = new Date(story.publishedAt);

    return {
      url: pageUrl,
      lastModified,
      changeFrequency: getChangeFrequency(story.placement),
      priority: getPriority(story.placement, index),
      alternates: {
        languages: {
          en: pageUrl,
          bn: pageUrl,
        },
      },
    };
  });

  const categoryUrls: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}/category/${category.slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.7,
    alternates: {
      languages: {
        en: `${SITE_URL}/category/${category.slug}`,
        bn: `${SITE_URL}/category/${category.slug}`,
      },
    },
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
      changeFrequency: "hourly" as const,
      priority: 1,
      alternates: {
        languages: {
          en: SITE_URL,
          bn: SITE_URL,
        },
      },
    },
    {
      url: `${SITE_URL}/news`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.9,
      alternates: {
        languages: {
          en: `${SITE_URL}/news`,
          bn: `${SITE_URL}/news`,
        },
      },
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/auth`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
  ];

  return [...staticUrls, ...storyUrls, ...categoryUrls, ...tagUrls];
}
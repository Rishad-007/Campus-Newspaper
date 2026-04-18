import {
  getPublishedArticles as getMockPublishedArticles,
  getTagList as getMockTagList,
} from "@/lib/mock-news";
import { createClient } from "@/lib/supabase/server";

type PublicStory = {
  id: string;
  locale: "en" | "bn";
  title: string;
  slug: string;
  excerpt: string;
  body: string[];
  category: string;
  categoryLabel: string;
  tags: string[];
  author: string;
  publishedAt: string;
  readTime: number;
  heroImage: string;
};

export async function getPublicStories() {
  const fallbackStories = getMockPublishedArticles();

  try {
    const supabase = await createClient();

    const { data: articleRows, error } = await supabase
      .from("articles")
      .select(
        "id, title, slug, excerpt, body, category, tags, author_id, published_at, created_at, placement, status",
      )
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false });

    if (error || !articleRows || articleRows.length === 0) {
      return fallbackStories;
    }

    const authorIds = Array.from(
      new Set(articleRows.map((row) => row.author_id)),
    );

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", authorIds);

    const authorMap = new Map<string, string>(
      (profiles ?? []).map((profile) => [profile.id, profile.full_name]),
    );

    const stories: PublicStory[] = articleRows.map((row) => {
      const category = String(row.category || "city").toLowerCase();
      const categoryLabel =
        category.charAt(0).toUpperCase() + category.slice(1);
      const publishedAt =
        row.published_at ?? row.created_at ?? new Date().toISOString();

      return {
        id: row.id,
        locale: "en",
        title: row.title,
        slug: row.slug,
        excerpt: row.excerpt,
        body: String(row.body || "")
          .split("\n\n")
          .filter(Boolean),
        category,
        categoryLabel,
        tags: Array.isArray(row.tags) ? row.tags : [],
        author: authorMap.get(row.author_id) ?? "Staff Reporter",
        publishedAt,
        readTime: Math.max(
          2,
          Math.ceil(String(row.body || "").split(/\s+/).length / 220),
        ),
        heroImage: "/newsroom.jpg",
      };
    });

    return stories;
  } catch {
    return fallbackStories;
  }
}

export async function getPublicTagList() {
  try {
    const stories = await getPublicStories();
    const tagSet = new Set<string>();

    stories.forEach((story) => {
      story.tags.forEach((tag) => tagSet.add(tag));
    });

    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  } catch {
    return getMockTagList();
  }
}

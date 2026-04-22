import { createClient } from "@/lib/supabase/server";

export type PublicStory = {
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
  authorId: string;
  publishedAt: string;
  status: "draft" | "submitted" | "published";
  readTime: number;
  heroImage: string;
  placement: "none" | "lead" | "brief" | "latest";
};

type ArticleRow = {
  id: string;
  locale: "en" | "bn" | null;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  hero_image_url: string | null;
  author_id: string;
  category_id: string;
  published_at: string | null;
  created_at: string;
  placement: "none" | "lead" | "brief" | "latest";
  status: "draft" | "submitted" | "published";
  categories:
    | {
        slug: string;
        name_en: string;
        name_bn: string;
      }
    | {
        slug: string;
        name_en: string;
        name_bn: string;
      }[]
    | null;
  profiles:
    | {
        full_name: string;
        hide_byline?: boolean | null;
      }
    | {
        full_name: string;
        hide_byline?: boolean | null;
      }[]
    | null;
};

type ArticleTagRow = {
  article_id: string;
  tags:
    | {
        slug: string;
        name: string;
      }
    | {
        slug: string;
        name: string;
      }[]
    | null;
};

function firstJoined<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function storyFromRow(row: ArticleRow, tags: string[]): PublicStory {
  const locale = row.locale === "bn" ? "bn" : "en";
  const category = firstJoined(row.categories);
  const profile = firstJoined(row.profiles);

  const categoryLabel =
    locale === "bn"
      ? (category?.name_bn ?? category?.name_en ?? "General")
      : (category?.name_en ?? "General");

  const publishedAt = row.published_at ?? row.created_at;
  const shouldHideByline = Boolean(profile?.hide_byline);
  const authorName = profile?.full_name?.trim();

  return {
    id: row.id,
    locale,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    body: row.body
      .split("\n\n")
      .map((paragraph) => paragraph.trim())
      .filter(Boolean),
    category: category?.slug ?? "general",
    categoryLabel,
    tags,
    author: shouldHideByline
      ? "Staff Reporter"
      : authorName || "Staff Reporter",
    authorId: row.author_id,
    publishedAt,
    status: row.status,
    readTime: Math.max(2, Math.ceil(row.body.split(/\s+/).length / 220)),
    heroImage: row.hero_image_url ?? "/newsroom.jpg",
    placement: row.placement,
  };
}

async function fetchPublishedArticles(filters?: {
  slug?: string;
  categorySlug?: string;
  articleIds?: string[];
}) {
  const supabase = await createClient();
  let categoryId: string | null = null;

  if (filters?.categorySlug) {
    const { data: categoryRow, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.categorySlug)
      .maybeSingle();

    if (categoryError || !categoryRow) {
      return [] as PublicStory[];
    }

    categoryId = categoryRow.id;
  }

  let query = supabase
    .from("articles")
    .select(
      "id, locale, title, slug, excerpt, body, hero_image_url, author_id, category_id, published_at, created_at, placement, status, categories:category_id(slug, name_en, name_bn), profiles:author_id(full_name, hide_byline)",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (filters?.slug) {
    query = query.eq("slug", filters.slug);
  }

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  if (filters?.articleIds) {
    if (filters.articleIds.length === 0) {
      return [] as PublicStory[];
    }
    query = query.in("id", filters.articleIds);
  }

  let { data: articleRows, error } = await query;

  // Backward-compatible fallback for environments where hide_byline is not added yet.
  if (error?.message?.includes("hide_byline")) {
    let fallbackQuery = supabase
      .from("articles")
      .select(
        "id, locale, title, slug, excerpt, body, hero_image_url, author_id, category_id, published_at, created_at, placement, status, categories:category_id(slug, name_en, name_bn), profiles:author_id(full_name)",
      )
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (filters?.slug) {
      fallbackQuery = fallbackQuery.eq("slug", filters.slug);
    }

    if (categoryId) {
      fallbackQuery = fallbackQuery.eq("category_id", categoryId);
    }

    if (filters?.articleIds) {
      if (filters.articleIds.length === 0) {
        return [] as PublicStory[];
      }
      fallbackQuery = fallbackQuery.in("id", filters.articleIds);
    }

    const fallbackResult = await fallbackQuery;
    articleRows = fallbackResult.data as typeof articleRows;
    error = fallbackResult.error;
  }

  if (error || !articleRows || articleRows.length === 0) {
    return [] as PublicStory[];
  }

  const articleIds = articleRows.map((row) => row.id);
  const { data: articleTagRows } = await supabase
    .from("article_tags")
    .select("article_id, tags:tag_id(slug, name)")
    .in("article_id", articleIds);

  const tagMap = new Map<string, string[]>();
  (articleTagRows as ArticleTagRow[] | null)?.forEach((row) => {
    const tag = firstJoined(row.tags);
    if (!tag) return;
    const current = tagMap.get(row.article_id) ?? [];
    current.push(tag.slug);
    tagMap.set(row.article_id, current);
  });

  const typedRows = articleRows as ArticleRow[];
  const mapped = typedRows.map((row) =>
    storyFromRow(row, tagMap.get(row.id) ?? []),
  );

  const placementPriority: Record<PublicStory["id"], number> = {};
  typedRows.forEach((row) => {
    if (row.placement === "lead") {
      placementPriority[row.id] = 0;
      return;
    }
    if (row.placement === "brief") {
      placementPriority[row.id] = 1;
      return;
    }
    if (row.placement === "latest") {
      placementPriority[row.id] = 2;
      return;
    }
    placementPriority[row.id] = 3;
  });

  return mapped.sort((a, b) => {
    const byPlacement = placementPriority[a.id] - placementPriority[b.id];
    if (byPlacement !== 0) return byPlacement;
    return (
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  });
}

export async function getPublicStories() {
  try {
    return await fetchPublishedArticles();
  } catch {
    return [];
  }
}

export async function getPublicStoryBySlug(slug: string) {
  try {
    const stories = await fetchPublishedArticles({ slug });
    return stories[0] ?? null;
  } catch {
    return null;
  }
}

export async function getPublicStoriesByCategorySlug(categorySlug: string) {
  try {
    return await fetchPublishedArticles({ categorySlug });
  } catch {
    return [];
  }
}

export async function getPublicStoriesByTagSlug(tagSlug: string) {
  try {
    const supabase = await createClient();

    const { data: tagRow, error: tagError } = await supabase
      .from("tags")
      .select("id")
      .eq("slug", tagSlug)
      .maybeSingle();

    if (tagError || !tagRow) {
      return [];
    }

    const { data: rows } = await supabase
      .from("article_tags")
      .select("article_id")
      .eq("tag_id", tagRow.id);

    const articleIds = (rows ?? []).map((row) => row.article_id);
    return await fetchPublishedArticles({ articleIds });
  } catch {
    return [];
  }
}

export async function getPublicCategoryMap() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("categories")
      .select("slug, name_en, name_bn")
      .order("name_en", { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map((item) => ({
      slug: item.slug,
      label: item.name_bn || item.name_en,
      labelEn: item.name_en,
    }));
  } catch {
    return [];
  }
}

export async function getPublicTagList() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tags")
      .select("slug")
      .order("slug", { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map((item) => item.slug);
  } catch {
    return [];
  }
}

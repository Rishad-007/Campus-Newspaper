"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FaDownload } from "react-icons/fa6";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createPhotocardFileName,
  generatePhotocardBlob,
  PHOTOCARD_HEIGHT,
  PHOTOCARD_WIDTH,
} from "@/components/create-photocard-action";
import { savePendingPhotocardCrop } from "@/lib/photocard-crop-session";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import type {
  ArticleRow,
  CategoryRow,
  ProfileRow,
  RequestedRole,
  StoryStatus,
  StoryPlacement,
  UserRole,
} from "@/lib/types/admin";

type TabKey =
  | "overview"
  | "users"
  | "journalists"
  | "pending"
  | "placement"
  | "my-stories";

type AdminStory = {
  id: string;
  locale: "en" | "bn";
  title: string;
  slug: string;
  excerpt: string;
  heroImageUrl: string;
  categoryId: string;
  categorySlug: string;
  categoryLabel: string;
  tags: string[];
  body: string;
  authorId: string;
  authorName: string;
  status: StoryStatus;
  rejectionReason: string | null;
  placement: StoryPlacement;
  publishedAt: string;
  updatedAt: string;
};

type ArticleTagLinkRow = {
  article_id: string;
  tag_id: string;
  tags: {
    slug: string;
    name: string;
  } | null;
};

type ManagedTag = {
  id: string;
  slug: string;
  name: string;
  usageCount: number;
};

const ROLE_OPTIONS: Array<{ label: string; value: UserRole }> = [
  { label: "Owner", value: "owner" },
  { label: "Editor", value: "editor" },
  { label: "Sub Editor", value: "sub-editor" },
  { label: "Writer / Journalist", value: "writer" },
];

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "users", label: "Users" },
  { key: "journalists", label: "Journalists" },
  { key: "pending", label: "Pending Queue" },
  { key: "placement", label: "Front Page Placement" },
  { key: "my-stories", label: "My Stories" },
];

const MAX_SOURCE_IMAGE_BYTES = 6 * 1024 * 1024;
const MAX_STORED_IMAGE_BYTES = 350 * 1024;
const ARTICLE_IMAGE_BUCKET = "article-images";

function titleCaseRole(role: UserRole) {
  if (role === "sub-editor") return "Sub Editor";
  if (role === "writer") return "Writer / Journalist";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function getBylineLabel(profile: ProfileRow | null) {
  if (!profile) return "Staff Reporter";
  return profile.hide_byline ? "Staff Reporter" : profile.full_name;
}

function formatDate(dateISO: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateISO));
}

function slugFromTitle(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function slugFromText(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function isAcceptedImageType(type: string) {
  return ["image/jpeg", "image/png", "image/webp"].includes(type);
}

async function loadImageElement(file: File) {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to read image file"));
      img.src = objectUrl;
    });

    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function canvasToWebpBlob(canvas: HTMLCanvasElement, quality: number) {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((value) => resolve(value), "image/webp", quality);
  });

  if (!blob) {
    throw new Error("Failed to compress image");
  }

  return blob;
}

export default function AdminPage() {
  const isConfigured = hasSupabasePublicConfig();

  const router = useRouter();
  const supabaseClient = useMemo(() => {
    if (!isConfigured) {
      return null;
    }

    try {
      return getSupabaseBrowserClient();
    } catch {
      return null;
    }
  }, [isConfigured]) as SupabaseClient;

  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<ProfileRow | null>(null);
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [stories, setStories] = useState<AdminStory[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRoleForUser, setSelectedRoleForUser] =
    useState<UserRole>("writer");
  const [passwordDraft, setPasswordDraft] = useState<string>("");

  const [journalistName, setJournalistName] = useState("");
  const [journalistEmail, setJournalistEmail] = useState("");
  const [journalistPassword, setJournalistPassword] = useState("");
  const [openedJournalistId, setOpenedJournalistId] = useState<string>("");
  const [removalChoiceForJournalistId, setRemovalChoiceForJournalistId] =
    useState<string | null>(null);

  const [rejectReasonByStory, setRejectReasonByStory] = useState<
    Record<string, string>
  >({});
  const [expandedPendingStoryById, setExpandedPendingStoryById] = useState<
    Record<string, boolean>
  >({});

  const [writerTitle, setWriterTitle] = useState("");
  const [writerExcerpt, setWriterExcerpt] = useState("");
  const [writerCategoryId, setWriterCategoryId] = useState("");
  const [writerTags, setWriterTags] = useState("");
  const [writerBody, setWriterBody] = useState("");
  const [writerImageFile, setWriterImageFile] = useState<File | null>(null);
  const [writerImagePreview, setWriterImagePreview] = useState<string>("");
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
  const [managedTags, setManagedTags] = useState<ManagedTag[]>([]);
  const [tagSearchTerm, setTagSearchTerm] = useState("");
  const [photocardStoryId, setPhotocardStoryId] = useState<string | null>(null);
  const [photocardErrorByStoryId, setPhotocardErrorByStoryId] = useState<
    Record<string, string>
  >({});

  const journalists = useMemo(
    () => users.filter((user) => user.role === "writer"),
    [users],
  );

  const myStories = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "owner") return stories;
    return stories.filter((story) => story.authorId === currentUser.id);
  }, [currentUser, stories]);

  const pendingStories = useMemo(
    () => stories.filter((story) => story.status === "submitted"),
    [stories],
  );

  const pendingAccessRequests = useMemo(
    () =>
      users.filter(
        (user) =>
          user.access_request_status === "pending" &&
          ["writer", "editor"].includes(user.requested_role ?? ""),
      ),
    [users],
  );

  const activeJournalistId = openedJournalistId || journalists[0]?.id || "";

  const openedJournalistStories = useMemo(
    () => stories.filter((story) => story.authorId === activeJournalistId),
    [activeJournalistId, stories],
  );

  const canManageUsers = currentUser?.role === "owner";
  const canApproveAccessRequests =
    currentUser?.role === "owner" || currentUser?.role === "editor";
  const canManageJournalists =
    currentUser?.role === "owner" ||
    currentUser?.role === "editor" ||
    currentUser?.role === "sub-editor";
  const canModerate = canManageJournalists;
  const canManagePlacement = canManageJournalists;
  const canManageTags = canManageJournalists;
  const canWrite =
    currentUser?.role === "writer" || currentUser?.role === "owner";

  const availableTabs = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "owner") return TABS;
    if (currentUser.role === "writer") {
      return TABS.filter((tab) => ["overview", "my-stories"].includes(tab.key));
    }
    if (currentUser.role === "editor") {
      return TABS.filter((tab) =>
        ["overview", "users", "journalists", "pending", "placement"].includes(
          tab.key,
        ),
      );
    }
    return TABS.filter((tab) =>
      ["overview", "journalists", "pending", "placement"].includes(tab.key),
    );
  }, [currentUser]);

  const effectiveActiveTab = availableTabs.some((tab) => tab.key === activeTab)
    ? activeTab
    : "overview";
  const effectiveSelectedUserId = selectedUserId || users[0]?.id || "";
  const effectiveWriterCategoryId = writerCategoryId || categories[0]?.id || "";

  const filteredManagedTags = useMemo(() => {
    const normalizedQuery = tagSearchTerm.trim().toLowerCase();

    if (!normalizedQuery) {
      return managedTags;
    }

    return managedTags.filter(
      (tag) =>
        tag.slug.toLowerCase().includes(normalizedQuery) ||
        tag.name.toLowerCase().includes(normalizedQuery),
    );
  }, [managedTags, tagSearchTerm]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      setAuthUserId(null);
      setCurrentUser(null);
      setUsers([]);
      setStories([]);
      setLoading(false);
      return;
    }

    setAuthUserId(user.id);

    let profiles: unknown[] | null = null;
    let profilesError: { message: string } | null = null;

    const profilesResult = await supabaseClient
      .from("profiles")
      .select(
        "id, full_name, email, role, hide_byline, requested_role, access_request_status, access_request_updated_at",
      )
      .order("created_at", { ascending: true });

    if (profilesResult.error) {
      const fallbackProfilesResult = await supabaseClient
        .from("profiles")
        .select("id, full_name, email, role")
        .order("created_at", { ascending: true });

      profiles = (fallbackProfilesResult.data ?? []).map(
        (profile: Pick<ProfileRow, "id" | "full_name" | "email" | "role">) => ({
          ...profile,
          hide_byline: false,
          requested_role: null,
          access_request_status: "none",
          access_request_updated_at: null,
        }),
      );
      profilesError = fallbackProfilesResult.error;
    } else {
      profiles = profilesResult.data;
      profilesError = null;
    }

    if (profilesError) {
      setError(profilesError.message);
      setLoading(false);
      return;
    }

    const mappedUsers = (profiles ?? []) as ProfileRow[];
    setUsers(mappedUsers);

    const me = mappedUsers.find((item) => item.id === user.id) ?? null;
    setCurrentUser(me);

    if (!me) {
      setError(
        "No profile found for current user. Sign out and sign in again.",
      );
      setLoading(false);
      return;
    }

    const { data: categoryRows, error: categoriesError } = await supabaseClient
      .from("categories")
      .select("id, slug, name_en, name_bn")
      .order("name_en", { ascending: true });

    if (categoriesError) {
      setError(categoriesError.message);
      setLoading(false);
      return;
    }

    const mappedCategories = (categoryRows ?? []) as CategoryRow[];
    setCategories(mappedCategories);

    const { data: articleRows, error: articlesError } = await supabaseClient
      .from("articles")
      .select(
        "id, locale, title, slug, excerpt, body, hero_image_url, category_id, author_id, status, rejection_reason, placement, created_at, updated_at, published_at, categories:category_id(id, slug, name_en, name_bn)",
      )
      .order("updated_at", { ascending: false });

    if (articlesError) {
      setError(articlesError.message);
      setLoading(false);
      return;
    }

    const userNameMap = new Map<string, string>(
      mappedUsers.map((profile) => [profile.id, profile.full_name]),
    );

    const typedRows = (articleRows ?? []) as ArticleRow[];
    const articleIds = typedRows.map((story) => story.id);

    const articleTagRows =
      articleIds.length === 0
        ? null
        : (
            await supabaseClient
              .from("article_tags")
              .select("article_id, tag_id, tags:tag_id(slug, name)")
              .in("article_id", articleIds)
          ).data;

    const { data: tagRows, error: tagsError } = await supabaseClient
      .from("tags")
      .select("id, slug, name")
      .order("slug", { ascending: true });

    if (tagsError) {
      setError(tagsError.message);
      setLoading(false);
      return;
    }

    const tagMap = new Map<string, string[]>();
    const tagUsageCount = new Map<string, number>();
    (articleTagRows as ArticleTagLinkRow[] | null)?.forEach((row) => {
      if (!row.tags) return;
      const current = tagMap.get(row.article_id) ?? [];
      current.push(row.tags.slug);
      tagMap.set(row.article_id, current);

      const usageCount = tagUsageCount.get(row.tag_id) ?? 0;
      tagUsageCount.set(row.tag_id, usageCount + 1);
    });

    setManagedTags(
      (
        (tagRows ?? []) as Array<{ id: string; slug: string; name: string }>
      ).map((tag) => ({
        id: tag.id,
        slug: tag.slug,
        name: tag.name,
        usageCount: tagUsageCount.get(tag.id) ?? 0,
      })),
    );

    const mappedStories = typedRows.map((story) => {
      const category = Array.isArray(story.categories)
        ? story.categories[0]
        : story.categories;

      return {
        id: story.id,
        locale: story.locale,
        title: story.title,
        slug: story.slug,
        excerpt: story.excerpt,
        heroImageUrl: story.hero_image_url ?? "/newsroom.jpg",
        categoryId: story.category_id,
        categorySlug: category?.slug ?? "general",
        categoryLabel: category?.name_en ?? "General",
        tags: tagMap.get(story.id) ?? [],
        body: story.body,
        authorId: story.author_id,
        authorName: userNameMap.get(story.author_id) ?? "Unknown Journalist",
        status: story.status,
        rejectionReason: story.rejection_reason,
        placement: story.placement,
        publishedAt: story.published_at ?? story.updated_at,
        updatedAt: story.updated_at,
      };
    });

    setStories(mappedStories);

    setLoading(false);
  }, [supabaseClient]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadData]);

  if (!isConfigured) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="paper-surface rounded-2xl p-6 sm:p-8">
          <p className="text-xs font-semibold tracking-[0.12em] text-stone-600 uppercase">
            Admin Desk
          </p>
          <h1 className="font-display mt-2 text-4xl text-stone-900">
            Supabase is not configured
          </h1>
          <p className="mt-3 text-sm leading-7 text-stone-700">
            Add the public Supabase environment variables to use the role
            management and story workflow screens.
          </p>
        </section>
      </main>
    );
  }

  async function ensureTagIds(tagSlugs: string[]) {
    if (tagSlugs.length === 0) {
      return [] as string[];
    }

    const normalized = Array.from(
      new Set(tagSlugs.map((item) => slugFromText(item)).filter(Boolean)),
    );

    if (normalized.length === 0) {
      return [] as string[];
    }

    const payload = normalized.map((slug) => ({
      slug,
      name: slug,
    }));

    const { error: upsertError } = await supabaseClient
      .from("tags")
      .upsert(payload, { onConflict: "slug" });

    if (upsertError) {
      throw new Error(upsertError.message);
    }

    const { data, error } = await supabaseClient
      .from("tags")
      .select("id, slug")
      .in("slug", normalized);

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((row: { id: string }) => row.id);
  }

  async function replaceArticleTags(articleId: string, tagSlugs: string[]) {
    const tagIds = await ensureTagIds(tagSlugs);

    const { error: deleteError } = await supabaseClient
      .from("article_tags")
      .delete()
      .eq("article_id", articleId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    if (tagIds.length === 0) {
      return;
    }

    const inserts = tagIds.map((tagId: string) => ({
      article_id: articleId,
      tag_id: tagId,
    }));

    const { error: insertError } = await supabaseClient
      .from("article_tags")
      .insert(inserts);

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  async function processWriterImage(file: File) {
    if (!isAcceptedImageType(file.type)) {
      throw new Error("Use JPG, PNG, or WEBP image format.");
    }

    if (file.size > MAX_SOURCE_IMAGE_BYTES) {
      throw new Error("Image is too large. Select an image up to 6 MB.");
    }

    const image = await loadImageElement(file);

    const targetWidth = Math.min(image.naturalWidth, 1600);
    const targetHeight = Math.round(
      (targetWidth * image.naturalHeight) / image.naturalWidth,
    );

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Failed to prepare image for upload");
    }

    context.drawImage(image, 0, 0, targetWidth, targetHeight);

    let quality = 0.82;
    let compressed = await canvasToWebpBlob(canvas, quality);

    while (compressed.size > MAX_STORED_IMAGE_BYTES && quality > 0.5) {
      quality -= 0.08;
      compressed = await canvasToWebpBlob(canvas, quality);
    }

    if (compressed.size > MAX_STORED_IMAGE_BYTES) {
      throw new Error(
        "Image is still too heavy after compression. Pick a simpler image.",
      );
    }

    return compressed;
  }

  async function uploadWriterImage(file: File) {
    if (!currentUser) {
      throw new Error("Not authenticated for image upload");
    }

    const compressed = await processWriterImage(file);
    const safeTitle = slugFromTitle(writerTitle || "story-image");
    const filePath = `${currentUser.id}/${Date.now()}-${safeTitle}.webp`;

    const { error: uploadError } = await supabaseClient.storage
      .from(ARTICLE_IMAGE_BUCKET)
      .upload(filePath, compressed, {
        contentType: "image/webp",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(
        `${uploadError.message}. Ensure bucket '${ARTICLE_IMAGE_BUCKET}' exists and allows authenticated uploads.`,
      );
    }

    const { data } = supabaseClient.storage
      .from(ARTICLE_IMAGE_BUCKET)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  function onWriterImageSelected(file: File | null) {
    setWriterImageFile(file);

    if (!file) {
      if (!editingStoryId) {
        setWriterImagePreview("");
      }
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setWriterImagePreview(previewUrl);
  }

  async function assignRoleToUser() {
    if (!canManageUsers || !effectiveSelectedUserId) return;
    if (selectedUser?.role === "owner") {
      setError("Owner role is protected and cannot be changed.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");

    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({ role: selectedRoleForUser })
      .eq("id", effectiveSelectedUserId);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setNotice("Role updated successfully.");
    await loadData();
  }

  async function removeUserRole() {
    if (!canManageUsers || !effectiveSelectedUserId) return;
    if (selectedUser?.role === "owner") {
      setError("Owner role is protected and cannot be removed.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");

    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({ role: "writer" })
      .eq("id", effectiveSelectedUserId);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setNotice("Role removed. User is now writer.");
    await loadData();
  }

  async function resolveAccessRequest(
    userId: string,
    requestedRole: RequestedRole,
    action: "approve" | "reject",
  ) {
    if (!canApproveAccessRequests) return;

    setSaving(true);
    setError("");
    setNotice("");

    const response = await fetch("/api/admin/access-requests", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        requestedRole,
        action,
      }),
    });

    setSaving(false);

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error ?? "Failed to resolve access request");
      return;
    }

    setNotice(
      action === "approve"
        ? "Access request approved."
        : "Access request rejected.",
    );
    await loadData();
  }

  async function changePasswordForUser() {
    if (
      !canManageUsers ||
      !effectiveSelectedUserId ||
      passwordDraft.trim().length < 8
    ) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    const response = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: effectiveSelectedUserId,
        newPassword: passwordDraft,
      }),
    });

    setSaving(false);

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error ?? "Failed to change password");
      return;
    }

    setPasswordDraft("");
    setNotice("Password changed successfully.");
  }

  async function setMyBylineVisibility(hideByline: boolean) {
    if (!currentUser) return;

    setSaving(true);
    setError("");
    setNotice("");

    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({ hide_byline: hideByline })
      .eq("id", currentUser.id);

    setSaving(false);

    if (updateError) {
      setError(
        updateError.message.includes("hide_byline")
          ? "Your database is missing the hide_byline column. Run supabase/migrations/20260422_add_hide_byline.sql in Supabase SQL Editor, then try again."
          : updateError.message,
      );
      return;
    }

    setNotice(
      hideByline
        ? "Byline hidden. Public stories now show Staff Reporter."
        : "Byline visible. Public stories now show your name.",
    );
    await loadData();
  }

  async function setSelectedUserBylineVisibility(hideByline: boolean) {
    if (!canManageUsers || !selectedUser || selectedUser.role !== "writer") {
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({ hide_byline: hideByline })
      .eq("id", selectedUser.id);

    setSaving(false);

    if (updateError) {
      setError(
        updateError.message.includes("hide_byline")
          ? "Your database is missing the hide_byline column. Run supabase/migrations/20260422_add_hide_byline.sql in Supabase SQL Editor, then try again."
          : updateError.message,
      );
      return;
    }

    setNotice(
      hideByline
        ? "Selected writer now displays as Staff Reporter."
        : "Selected writer byline is now visible.",
    );
    await loadData();
  }

  async function addJournalist(event: FormEvent) {
    event.preventDefault();
    if (!canManageJournalists) return;

    if (
      !journalistName.trim() ||
      !journalistEmail.trim() ||
      journalistPassword.length < 8
    ) {
      setError("Name, email, and password (min 8 chars) are required.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    const response = await fetch("/api/admin/journalists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: journalistName,
        email: journalistEmail,
        password: journalistPassword,
      }),
    });

    setSaving(false);

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error ?? "Failed to add journalist");
      return;
    }

    setJournalistName("");
    setJournalistEmail("");
    setJournalistPassword("");
    setNotice("Journalist account created.");
    await loadData();
  }

  async function removeJournalist(
    journalistId: string,
    deleteStories: boolean,
  ) {
    if (!canManageJournalists) return;

    setSaving(true);
    setError("");
    setNotice("");

    const response = await fetch(
      `/api/admin/journalists?userId=${journalistId}&deleteStories=${deleteStories ? "1" : "0"}`,
      {
        method: "DELETE",
      },
    );

    setSaving(false);

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error ?? "Failed to remove journalist");
      return;
    }

    setRemovalChoiceForJournalistId(null);

    setNotice(
      deleteStories
        ? "Journalist removed with all stories deleted."
        : "Journalist removed and stories kept under your account.",
    );
    await loadData();
  }

  async function approveStory(storyId: string) {
    if (!canModerate) return;

    setSaving(true);
    setError("");
    setNotice("");

    const { error: updateError } = await supabaseClient
      .from("articles")
      .update({
        status: "published",
        rejection_reason: null,
        published_at: new Date().toISOString(),
      })
      .eq("id", storyId);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setNotice("Story published.");
    await loadData();
  }

  async function rejectStory(storyId: string) {
    if (!canModerate) return;
    const reason = rejectReasonByStory[storyId]?.trim();
    if (!reason) {
      setError("Rejection reason is required.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    const { error: updateError } = await supabaseClient
      .from("articles")
      .update({ status: "draft", rejection_reason: reason })
      .eq("id", storyId);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setRejectReasonByStory((prev) => ({ ...prev, [storyId]: "" }));
    setNotice("Story moved to draft with rejection reason.");
    await loadData();
  }

  async function deleteStory(storyId: string) {
    setSaving(true);
    setError("");
    setNotice("");

    const { error: deleteError } = await supabaseClient
      .from("articles")
      .delete()
      .eq("id", storyId);

    setSaving(false);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setNotice("Story deleted.");
    await loadData();
  }

  async function hideTagFromStories(tag: ManagedTag) {
    if (!canManageTags) return;

    setSaving(true);
    setError("");
    setNotice("");

    const { error: deleteError } = await supabaseClient
      .from("article_tags")
      .delete()
      .eq("tag_id", tag.id);

    setSaving(false);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setNotice(`Tag #${tag.slug} hidden from all stories.`);
    await loadData();
  }

  async function removeTagPermanently(tag: ManagedTag) {
    if (!canManageTags) return;

    const confirmed = window.confirm(
      `Remove tag #${tag.slug} permanently? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    const { error: deleteError } = await supabaseClient
      .from("tags")
      .delete()
      .eq("id", tag.id);

    setSaving(false);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setNotice(`Tag #${tag.slug} removed permanently.`);
    await loadData();
  }

  async function setPlacement(
    storyId: string,
    placement: "none" | "lead" | "brief" | "latest",
  ) {
    if (!canManagePlacement) return;

    setSaving(true);
    setError("");
    setNotice("");

    if (placement === "lead") {
      await supabaseClient
        .from("articles")
        .update({ placement: "none" })
        .eq("placement", "lead");
    }

    const { error: updateError } = await supabaseClient
      .from("articles")
      .update({ placement })
      .eq("id", storyId);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setNotice("Front page placement updated.");
    await loadData();
  }

  async function saveOrUpdateWriterStory() {
    if (!canWrite || !currentUser) return;
    if (!writerTitle.trim() || !writerExcerpt.trim() || !writerBody.trim()) {
      setError("Headline, excerpt, and body are required.");
      return;
    }
    if (!effectiveWriterCategoryId) {
      setError("Please select a category.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    const normalizedTags = Array.from(
      new Set(
        writerTags
          .split(",")
          .map((item) => slugFromText(item))
          .filter(Boolean),
      ),
    );

    const payload = {
      title: writerTitle.trim(),
      slug: `${slugFromTitle(writerTitle)}-${Date.now().toString().slice(-5)}`,
      excerpt: writerExcerpt.trim(),
      category_id: effectiveWriterCategoryId,
      body: writerBody.trim(),
      author_id: currentUser.id,
      rejection_reason: null,
    };

    const editingStory = editingStoryId
      ? stories.find((item) => item.id === editingStoryId)
      : null;

    let heroImageUrl = editingStory?.heroImageUrl ?? "/newsroom.jpg";

    if (writerImageFile) {
      try {
        heroImageUrl = await uploadWriterImage(writerImageFile);
      } catch (imageError) {
        setSaving(false);
        setError(
          imageError instanceof Error
            ? imageError.message
            : "Image upload failed",
        );
        return;
      }
    }

    if (editingStoryId) {
      const { error: updateError } = await supabaseClient
        .from("articles")
        .update({
          title: payload.title,
          excerpt: payload.excerpt,
          category_id: payload.category_id,
          body: payload.body,
          hero_image_url: heroImageUrl,
          rejection_reason: null,
        })
        .eq("id", editingStoryId);

      if (updateError) {
        setSaving(false);
        setError(updateError.message);
        return;
      }

      try {
        await replaceArticleTags(editingStoryId, normalizedTags);
      } catch (tagError) {
        setSaving(false);
        setError(
          tagError instanceof Error
            ? tagError.message
            : "Failed to update tags",
        );
        return;
      }

      setEditingStoryId(null);
      setNotice("Story updated.");
    } else {
      const { data: insertData, error: insertError } = await supabaseClient
        .from("articles")
        .insert({
          ...payload,
          locale: "en",
          hero_image_url: heroImageUrl,
          status: "draft",
          placement: "none",
        })
        .select("id")
        .single();

      if (insertError) {
        setSaving(false);
        setError(insertError.message);
        return;
      }

      if (insertData?.id) {
        try {
          await replaceArticleTags(insertData.id, normalizedTags);
        } catch (tagError) {
          setSaving(false);
          setError(
            tagError instanceof Error
              ? tagError.message
              : "Failed to save tags",
          );
          return;
        }
      }

      setNotice("Draft saved.");
    }

    setSaving(false);

    setWriterTitle("");
    setWriterExcerpt("");
    setWriterCategoryId(categories[0]?.id ?? "");
    setWriterTags("");
    setWriterBody("");
    setWriterImageFile(null);
    setWriterImagePreview("");
    await loadData();
  }

  function editStory(storyId: string) {
    const story = stories.find((item) => item.id === storyId);
    if (!story) return;
    setEditingStoryId(story.id);
    setWriterTitle(story.title);
    setWriterExcerpt(story.excerpt);
    setWriterCategoryId(story.categoryId);
    setWriterTags(story.tags.join(", "));
    setWriterBody(story.body);
    setWriterImageFile(null);
    setWriterImagePreview(story.heroImageUrl);
  }

  async function submitForReview(storyId: string) {
    setSaving(true);
    setError("");
    setNotice("");

    const { error: updateError } = await supabaseClient
      .from("articles")
      .update({ status: "submitted", rejection_reason: null })
      .eq("id", storyId);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setNotice("Story submitted for review.");
    await loadData();
  }

  async function signOut() {
    await supabaseClient.auth.signOut();
    router.push("/auth");
    router.refresh();
  }

  async function createPhotocardFromStory(story: AdminStory) {
    if (story.status !== "published") {
      return;
    }

    setPhotocardStoryId(story.id);
    setPhotocardErrorByStoryId((previous) => ({
      ...previous,
      [story.id]: "",
    }));

    try {
      const photocardInput = {
        id: story.id,
        slug: story.slug,
        locale: story.locale,
        title: story.title,
        excerpt: story.excerpt,
        heroImage: story.heroImageUrl,
        publishedAt: story.publishedAt,
        categoryLabel: story.categoryLabel,
        authorId: story.authorId,
        status: story.status,
      };

      const blob = await generatePhotocardBlob(photocardInput);
      await savePendingPhotocardCrop({
        blob,
        fileName: createPhotocardFileName(photocardInput),
        targetWidth: PHOTOCARD_WIDTH,
        targetHeight: PHOTOCARD_HEIGHT,
      });
      router.push("/photocard-crop");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create photocard";
      setPhotocardErrorByStoryId((previous) => ({
        ...previous,
        [story.id]: message,
      }));
    } finally {
      setPhotocardStoryId(null);
    }
  }

  const selectedUser = users.find(
    (user) => user.id === effectiveSelectedUserId,
  );
  const isSelectedUserOwner = selectedUser?.role === "owner";
  const selectedJournalist = journalists.find(
    (journalist) => journalist.id === activeJournalistId,
  );

  const leadStory = stories.find((story) => story.placement === "lead") ?? null;
  const briefs = stories.filter((story) => story.placement === "brief");
  const latest = stories.filter((story) => story.placement === "latest");

  if (loading) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-4 py-4 sm:gap-6 sm:px-6 sm:py-5 lg:px-8">
        <section className="paper-surface rounded-2xl p-6">
          <h1 className="font-display text-3xl text-stone-900">Admin Desk</h1>
          <p className="mt-2 text-sm text-stone-700">Loading workspace...</p>
        </section>
      </main>
    );
  }

  if (!authUserId || !currentUser) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-5 px-4 py-4 sm:gap-6 sm:px-6 sm:py-5 lg:px-8">
        <section className="paper-surface rounded-2xl p-6">
          <h1 className="font-display text-3xl text-stone-900">
            Admin Access Required
          </h1>
          <p className="mt-2 text-sm text-stone-700">
            Please sign in with a newsroom account to access role-based admin
            features.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/auth"
              className="inline-flex min-h-11 items-center rounded-full bg-(--accent) px-4 py-2 text-sm font-semibold text-white sm:min-h-10"
            >
              Go to Sign In
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center rounded-full border border-stone-400 px-4 py-2 text-sm font-semibold text-stone-700 sm:min-h-10"
            >
              Back to site
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-4 py-4 sm:gap-6 sm:px-6 sm:py-5 lg:px-8">
      <header className="paper-surface rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-stone-600 uppercase">
              Live Role Workspace
            </p>
            <h1 className="font-display mt-2 text-3xl text-stone-900 sm:text-5xl">
              Admin Newsroom Desk
            </h1>
            <p className="mt-2 text-sm text-stone-700">
              Signed in as {currentUser.full_name} (
              {titleCaseRole(currentUser.role)})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void loadData()}
              className="rounded-full border border-stone-400 px-4 py-2 text-sm font-semibold text-stone-700 min-h-11 sm:min-h-10"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-full border border-stone-400 px-4 py-2 text-sm font-semibold text-stone-700 min-h-11 sm:min-h-10"
            >
              Sign Out
            </button>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center rounded-full border border-stone-400 px-4 py-2 text-sm font-semibold text-stone-700 sm:min-h-10"
            >
              Back to site
            </Link>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {availableTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                tab.key === effectiveActiveTab
                  ? "bg-(--accent) text-white"
                  : "border border-stone-400 text-stone-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {notice && (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {notice}
          </p>
        )}
      </header>

      {effectiveActiveTab === "overview" && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="paper-surface rounded-2xl p-5">
            <p className="text-xs font-semibold tracking-[0.12em] text-stone-600 uppercase">
              Journalists
            </p>
            <p className="font-display mt-2 text-3xl text-stone-900">
              {journalists.length}
            </p>
          </article>
          <article className="paper-surface rounded-2xl p-5">
            <p className="text-xs font-semibold tracking-[0.12em] text-stone-600 uppercase">
              Pending News
            </p>
            <p className="font-display mt-2 text-3xl text-stone-900">
              {pendingStories.length}
            </p>
          </article>
          <article className="paper-surface rounded-2xl p-5">
            <p className="text-xs font-semibold tracking-[0.12em] text-stone-600 uppercase">
              Published
            </p>
            <p className="font-display mt-2 text-3xl text-stone-900">
              {stories.filter((story) => story.status === "published").length}
            </p>
          </article>
          <article className="paper-surface rounded-2xl p-5">
            <p className="text-xs font-semibold tracking-[0.12em] text-stone-600 uppercase">
              Drafts
            </p>
            <p className="font-display mt-2 text-3xl text-stone-900">
              {stories.filter((story) => story.status === "draft").length}
            </p>
          </article>
          <article className="paper-surface rounded-2xl p-5">
            <p className="text-xs font-semibold tracking-[0.12em] text-stone-600 uppercase">
              Pending Access
            </p>
            <p className="font-display mt-2 text-3xl text-stone-900">
              {pendingAccessRequests.length}
            </p>
          </article>
        </section>
      )}

      {effectiveActiveTab === "users" &&
        (canManageUsers || canApproveAccessRequests) && (
          <section className="paper-surface rounded-2xl p-5 sm:p-6">
            <h2 className="font-display text-2xl text-stone-900">
              User Access Queue
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              Owner and Editor can review pending Journalist and Editor role
              requests.
            </p>

            <div className="mt-5 grid gap-4">
              {pendingAccessRequests.length === 0 && (
                <p className="text-sm text-stone-700">
                  No pending access requests right now.
                </p>
              )}

              {pendingAccessRequests.map((requestUser) => (
                <article
                  key={requestUser.id}
                  className="rounded-xl border border-stone-300 bg-white p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-stone-900">
                        {requestUser.full_name}
                      </p>
                      <p className="text-xs text-stone-600">
                        {requestUser.email}
                      </p>
                    </div>
                    <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                      Pending{" "}
                      {requestUser.requested_role === "writer"
                        ? "Journalist"
                        : "Editor"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-stone-500">
                    Requested at:{" "}
                    {requestUser.access_request_updated_at
                      ? formatDate(requestUser.access_request_updated_at)
                      : "-"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={saving || !requestUser.requested_role}
                      onClick={() =>
                        requestUser.requested_role &&
                        void resolveAccessRequest(
                          requestUser.id,
                          requestUser.requested_role,
                          "approve",
                        )
                      }
                      className="rounded-full bg-(--accent) px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      disabled={saving || !requestUser.requested_role}
                      onClick={() =>
                        requestUser.requested_role &&
                        void resolveAccessRequest(
                          requestUser.id,
                          requestUser.requested_role,
                          "reject",
                        )
                      }
                      className="rounded-full border border-stone-400 px-4 py-2 text-sm font-semibold text-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {canManageUsers && (
              <>
                <h3 className="font-display mt-8 text-xl text-stone-900">
                  Owner User Controls
                </h3>
                <p className="mt-2 text-sm text-stone-600">
                  Owner can directly assign roles and change passwords for
                  newsroom users.
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-stone-700">
                      Select user
                    </span>
                    <select
                      value={effectiveSelectedUserId}
                      onChange={(event) =>
                        setSelectedUserId(event.target.value)
                      }
                      className="rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none ring-(--accent) focus:ring"
                    >
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.full_name} ({titleCaseRole(user.role)})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-stone-700">
                      Select role
                    </span>
                    <select
                      value={selectedRoleForUser}
                      onChange={(event) =>
                        setSelectedRoleForUser(event.target.value as UserRole)
                      }
                      disabled={isSelectedUserOwner}
                      className="rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none ring-(--accent) focus:ring"
                    >
                      {ROLE_OPTIONS.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-stone-700">
                      New password
                    </span>
                    <input
                      type="password"
                      value={passwordDraft}
                      onChange={(event) => setPasswordDraft(event.target.value)}
                      placeholder="Minimum 8 characters"
                      className="rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none ring-(--accent) focus:ring"
                    />
                  </label>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={saving || isSelectedUserOwner}
                    onClick={() => void assignRoleToUser()}
                    className="rounded-full bg-(--accent) px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Assign Role
                  </button>
                  <button
                    type="button"
                    disabled={saving || isSelectedUserOwner}
                    onClick={() => void removeUserRole()}
                    className="rounded-full border border-stone-400 px-4 py-2 text-sm font-semibold text-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Remove Role (Set Writer)
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void changePasswordForUser()}
                    className="rounded-full border border-stone-400 px-4 py-2 text-sm font-semibold text-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Change Password
                  </button>
                </div>

                {selectedUser && (
                  <p className="mt-4 text-sm text-stone-700">
                    Selected: {selectedUser.full_name} ({selectedUser.email})
                  </p>
                )}

                {selectedUser?.role === "writer" && (
                  <div className="mt-4 rounded-lg border border-dashed border-stone-400 bg-stone-50 p-3">
                    <p className="text-xs font-semibold tracking-[0.12em] text-stone-600 uppercase">
                      Writer Byline Visibility
                    </p>
                    <p className="mt-2 text-sm text-stone-700">
                      Public display name: {getBylineLabel(selectedUser)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={saving || selectedUser.hide_byline}
                        onClick={() =>
                          void setSelectedUserBylineVisibility(true)
                        }
                        className="rounded-full border border-stone-400 px-3 py-1 text-xs font-semibold text-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Hide Name (Staff Reporter)
                      </button>
                      <button
                        type="button"
                        disabled={saving || !selectedUser.hide_byline}
                        onClick={() =>
                          void setSelectedUserBylineVisibility(false)
                        }
                        className="rounded-full border border-stone-400 px-3 py-1 text-xs font-semibold text-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Show Real Name
                      </button>
                    </div>
                  </div>
                )}

                {isSelectedUserOwner && (
                  <p className="mt-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    Owner account is protected. Role change is disabled.
                  </p>
                )}
              </>
            )}
          </section>
        )}

      {effectiveActiveTab === "journalists" && canManageJournalists && (
        <section className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
          <article className="paper-surface rounded-2xl p-5 sm:p-6">
            <h2 className="font-display text-2xl text-stone-900">
              Journalist List
            </h2>

            <div className="mt-4 grid gap-3">
              {journalists.map((journalist) => (
                <div
                  key={journalist.id}
                  className="rounded-xl border border-stone-300 bg-white p-3"
                >
                  {/** Inline choice keeps removal action explicit and avoids blocking browser dialogs. */}
                  {(() => {
                    const isRemovalChoiceOpen =
                      removalChoiceForJournalistId === journalist.id;

                    return (
                      <>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-semibold text-stone-900">
                              {journalist.full_name}
                            </p>
                            <p className="text-xs text-stone-600">
                              {journalist.email}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenedJournalistId(journalist.id)
                              }
                              className="rounded-full border border-stone-400 px-3 py-1 text-xs font-semibold text-stone-700"
                            >
                              Open Profile
                            </button>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() =>
                                setRemovalChoiceForJournalistId((previous) =>
                                  previous === journalist.id
                                    ? null
                                    : journalist.id,
                                )
                              }
                              className="rounded-full border border-red-400 px-3 py-1 text-xs font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isRemovalChoiceOpen ? "Close" : "Remove"}
                            </button>
                          </div>
                        </div>
                        {isRemovalChoiceOpen && (
                          <div className="mt-3 rounded-lg border border-dashed border-red-300 bg-red-50/40 p-3">
                            <p className="text-xs font-semibold tracking-[0.12em] text-red-800 uppercase">
                              Remove Journalist Account
                            </p>
                            <p className="mt-2 text-xs leading-5 text-stone-700">
                              Choose whether to keep this journalist&#39;s
                              stories under your account or delete them
                              permanently.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                type="button"
                                disabled={saving}
                                onClick={() =>
                                  void removeJournalist(journalist.id, false)
                                }
                                className="rounded-full border border-stone-400 bg-white px-3 py-1 text-xs font-semibold text-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Keep Stories
                              </button>
                              <button
                                type="button"
                                disabled={saving}
                                onClick={() =>
                                  void removeJournalist(journalist.id, true)
                                }
                                className="rounded-full border border-red-500 bg-red-600 px-3 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Delete Stories
                              </button>
                              <button
                                type="button"
                                disabled={saving}
                                onClick={() =>
                                  setRemovalChoiceForJournalistId(null)
                                }
                                className="rounded-full border border-stone-400 px-3 py-1 text-xs font-semibold text-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              ))}
            </div>

            <form
              className="mt-5 grid gap-3 border-t border-dashed border-stone-400 pt-4"
              onSubmit={(event) => void addJournalist(event)}
            >
              <h3 className="font-display text-xl text-stone-900">
                Add Journalist
              </h3>
              <input
                value={journalistName}
                onChange={(event) => setJournalistName(event.target.value)}
                placeholder="Full name"
                className="rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none ring-(--accent) focus:ring"
              />
              <input
                value={journalistEmail}
                onChange={(event) => setJournalistEmail(event.target.value)}
                placeholder="Email"
                className="rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none ring-(--accent) focus:ring"
              />
              <input
                type="password"
                value={journalistPassword}
                onChange={(event) => setJournalistPassword(event.target.value)}
                placeholder="Temporary password (min 8 chars)"
                className="rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none ring-(--accent) focus:ring"
              />
              <button
                type="submit"
                disabled={saving}
                className="w-fit rounded-full bg-(--accent) px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Add Journalist
              </button>
            </form>
          </article>

          <article className="paper-surface rounded-2xl p-5 sm:p-6">
            <h2 className="font-display text-2xl text-stone-900">
              {selectedJournalist
                ? `${selectedJournalist.full_name} Profile`
                : "Journalist Profile"}
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              View all articles written by this journalist and remove any story.
            </p>

            <div className="mt-4 grid gap-3">
              {openedJournalistStories.length === 0 && (
                <p className="text-sm text-stone-700">
                  No stories found for this journalist.
                </p>
              )}

              {openedJournalistStories.map((story) => (
                <article
                  key={story.id}
                  className="rounded-xl border border-stone-300 bg-white p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-stone-900">
                      {story.title}
                    </p>
                    <span className="rounded-full border border-stone-300 px-2 py-1 text-xs font-semibold text-stone-700">
                      {story.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-stone-700">{story.excerpt}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void deleteStory(story.id)}
                      className="rounded-full border border-red-400 px-3 py-1 text-xs font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Delete News
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </article>
        </section>
      )}

      {effectiveActiveTab === "pending" && canModerate && (
        <section className="paper-surface rounded-2xl p-5 sm:p-6">
          <h2 className="font-display text-2xl text-stone-900">
            Pending News Requests
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            Accept to publish immediately, or reject back to draft with reason.
          </p>

          <div className="mt-5 grid gap-4">
            {pendingStories.length === 0 && (
              <p className="text-sm text-stone-700">
                No pending requests right now.
              </p>
            )}

            {pendingStories.map((story) => (
              <article
                key={story.id}
                className="rounded-xl border border-stone-300 bg-white p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-stone-900">
                      {story.title}
                    </p>
                    <p className="text-xs text-stone-600">
                      By {story.authorName} • {story.categoryLabel}
                    </p>
                  </div>
                  <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                    Submitted
                  </span>
                </div>

                <p className="mt-2 text-sm text-stone-700">{story.excerpt}</p>

                <div className="mt-3 overflow-hidden rounded-lg border border-stone-300 bg-stone-100">
                  <Image
                    src={story.heroImageUrl}
                    alt={story.title}
                    width={1200}
                    height={675}
                    className="h-48 w-full object-cover"
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setExpandedPendingStoryById((previous) => ({
                      ...previous,
                      [story.id]: !previous[story.id],
                    }))
                  }
                  className="mt-3 rounded-full border border-stone-400 px-3 py-1 text-xs font-semibold text-stone-700"
                >
                  {expandedPendingStoryById[story.id]
                    ? "Hide Full Article"
                    : "Read Full Article"}
                </button>

                {expandedPendingStoryById[story.id] && (
                  <div className="mt-3 rounded-xl border border-dashed border-stone-400 bg-stone-50 p-4">
                    <p className="text-xs font-semibold tracking-[0.12em] text-stone-600 uppercase">
                      Full Article Content
                    </p>
                    <div className="mt-3 overflow-hidden rounded-lg border border-stone-300 bg-stone-100">
                      <Image
                        src={story.heroImageUrl}
                        alt={story.title}
                        width={1200}
                        height={675}
                        className="h-56 w-full object-cover"
                      />
                    </div>
                    <p className="mt-2 whitespace-pre-line text-sm leading-7 text-stone-800">
                      {story.body}
                    </p>
                  </div>
                )}

                <label className="mt-3 grid gap-2">
                  <span className="text-xs font-semibold tracking-widest text-stone-600 uppercase">
                    Rejection reason
                  </span>
                  <input
                    value={rejectReasonByStory[story.id] ?? ""}
                    onChange={(event) =>
                      setRejectReasonByStory((prev) => ({
                        ...prev,
                        [story.id]: event.target.value,
                      }))
                    }
                    placeholder="Reason required for rejection"
                    className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none ring-(--accent) focus:ring"
                  />
                </label>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void approveStory(story.id)}
                    className="rounded-full bg-(--accent) px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Accept and Publish
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void rejectStory(story.id)}
                    className="rounded-full border border-stone-400 px-4 py-2 text-sm font-semibold text-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Reject to Draft
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {effectiveActiveTab === "placement" && canManagePlacement && (
        <section className="paper-surface rounded-2xl p-5 sm:p-6">
          <h2 className="font-display text-2xl text-stone-900">
            Front Page Placement
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            Choose which published stories go into Lead Story, Frontline Briefs,
            and Latest.
          </p>

          <div className="mt-4 rounded-xl border border-dashed border-stone-400 p-4 text-sm text-stone-700">
            <p>Lead Story: {leadStory?.id ?? "Not selected"}</p>
            <p className="mt-1">
              Frontline Briefs:{" "}
              {briefs.map((story) => story.id).join(", ") || "None"}
            </p>
            <p className="mt-1">
              Latest: {latest.map((story) => story.id).join(", ") || "None"}
            </p>
          </div>

          <div className="mt-5 grid gap-4">
            {stories
              .filter((story) => story.status === "published")
              .map((story) => (
                <article
                  key={story.id}
                  className="rounded-xl border border-stone-300 bg-white p-4"
                >
                  <p className="font-semibold text-stone-900">{story.title}</p>
                  <p className="mt-1 text-xs text-stone-600">
                    {story.authorName}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() =>
                        void setPlacement(
                          story.id,
                          story.placement === "lead" ? "none" : "lead",
                        )
                      }
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        story.placement === "lead"
                          ? "bg-(--accent) text-white"
                          : "border border-stone-400 text-stone-700"
                      }`}
                    >
                      Lead Story
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() =>
                        void setPlacement(
                          story.id,
                          story.placement === "brief" ? "none" : "brief",
                        )
                      }
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        story.placement === "brief"
                          ? "bg-(--accent) text-white"
                          : "border border-stone-400 text-stone-700"
                      }`}
                    >
                      Frontline Briefs
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() =>
                        void setPlacement(
                          story.id,
                          story.placement === "latest" ? "none" : "latest",
                        )
                      }
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        story.placement === "latest"
                          ? "bg-(--accent) text-white"
                          : "border border-stone-400 text-stone-700"
                      }`}
                    >
                      Latest
                    </button>
                  </div>
                </article>
              ))}
          </div>

          <div className="mt-8 border-t border-dashed border-stone-400 pt-6">
            <h3 className="font-display text-2xl text-stone-900">
              Tag Management
            </h3>
            <p className="mt-2 text-sm text-stone-600">
              Hide removes a tag from all stories. Remove deletes the tag
              permanently.
            </p>

            <div className="mt-4 max-w-sm">
              <input
                value={tagSearchTerm}
                onChange={(event) => setTagSearchTerm(event.target.value)}
                placeholder="Search tags"
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none ring-(--accent) focus:ring"
              />
            </div>

            <div className="mt-4 grid gap-3">
              {filteredManagedTags.length === 0 && (
                <p className="text-sm text-stone-700">No tags found.</p>
              )}

              {filteredManagedTags.map((tag) => (
                <article
                  key={tag.id}
                  className="rounded-xl border border-stone-300 bg-white p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-stone-900">
                        #{tag.slug}
                      </p>
                      <p className="text-xs text-stone-600">
                        {tag.usageCount} linked stor
                        {tag.usageCount === 1 ? "y" : "ies"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => void hideTagFromStories(tag)}
                        className="rounded-full border border-stone-400 px-3 py-1 text-xs font-semibold text-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Hide Tag
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => void removeTagPermanently(tag)}
                        className="rounded-full border border-red-500 px-3 py-1 text-xs font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Remove Tag
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {effectiveActiveTab === "my-stories" && canWrite && (
        <section className="grid gap-6 lg:grid-cols-[1.2fr_1.4fr]">
          <article className="paper-surface rounded-2xl p-5 sm:p-6">
            <h2 className="font-display text-2xl text-stone-900">
              {editingStoryId ? "Edit Story" : "Create Story"}
            </h2>

            <div className="mt-4 rounded-xl border border-dashed border-stone-400 bg-stone-50 p-4">
              <p className="text-xs font-semibold tracking-[0.12em] text-stone-600 uppercase">
                Byline Visibility
              </p>
              <p className="mt-2 text-sm text-stone-700">
                Public display name: {getBylineLabel(currentUser)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={saving || currentUser.hide_byline}
                  onClick={() => void setMyBylineVisibility(true)}
                  className="rounded-full border border-stone-400 px-3 py-1 text-xs font-semibold text-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Hide Name (Staff Reporter)
                </button>
                <button
                  type="button"
                  disabled={saving || !currentUser.hide_byline}
                  onClick={() => void setMyBylineVisibility(false)}
                  className="rounded-full border border-stone-400 px-3 py-1 text-xs font-semibold text-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Show Real Name
                </button>
              </div>
            </div>

            <form
              className="mt-4 grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                void saveOrUpdateWriterStory();
              }}
            >
              <input
                value={writerTitle}
                onChange={(event) => setWriterTitle(event.target.value)}
                placeholder="Headline"
                className="rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none ring-(--accent) focus:ring"
              />
              <textarea
                value={writerExcerpt}
                onChange={(event) => setWriterExcerpt(event.target.value)}
                rows={3}
                placeholder="Write excerpt from the middle part of your story"
                className="rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none ring-(--accent) focus:ring"
              />
              <p className="text-xs text-stone-600">
                Excerpt tip: pick 1-2 lines from the middle of the story. It
                will be highlighted inside the article body.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  value={effectiveWriterCategoryId}
                  onChange={(event) => setWriterCategoryId(event.target.value)}
                  className="rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none ring-(--accent) focus:ring"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name_bn || category.name_en}
                    </option>
                  ))}
                </select>
                <input
                  value={writerTags}
                  onChange={(event) => setWriterTags(event.target.value)}
                  placeholder="tags,comma,separated"
                  className="rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none ring-(--accent) focus:ring"
                />
              </div>
              <textarea
                value={writerBody}
                onChange={(event) => setWriterBody(event.target.value)}
                rows={7}
                placeholder="Write full news"
                className="rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none ring-(--accent) focus:ring"
              />

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-stone-700">
                  Story Image (Optional)
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) =>
                    onWriterImageSelected(event.target.files?.[0] ?? null)
                  }
                  className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none ring-(--accent) focus:ring"
                />
                <p className="text-xs text-stone-600">
                  For free-tier storage safety, image is compressed to WEBP and
                  must stay within 350 KB.
                </p>
              </label>

              {writerImagePreview && (
                <div className="overflow-hidden rounded-lg border border-stone-300">
                  <Image
                    src={writerImagePreview}
                    alt="Selected story preview"
                    width={1200}
                    height={675}
                    className="h-auto w-full object-cover"
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-(--accent) px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {editingStoryId ? "Update Story" : "Save Draft"}
                </button>
                {editingStoryId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingStoryId(null);
                      setWriterTitle("");
                      setWriterExcerpt("");
                      setWriterCategoryId(categories[0]?.id ?? "");
                      setWriterTags("");
                      setWriterBody("");
                      setWriterImageFile(null);
                      setWriterImagePreview("");
                    }}
                    className="rounded-full border border-stone-400 px-4 py-2 text-sm font-semibold text-stone-700"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </article>

          <article className="paper-surface rounded-2xl p-5 sm:p-6">
            <h2 className="font-display text-2xl text-stone-900">My News</h2>
            <p className="mt-2 text-sm text-stone-600">
              Submit a draft to move it into editor pending queue.
            </p>

            <div className="mt-4 grid gap-3">
              {myStories.length === 0 && (
                <p className="text-sm text-stone-700">No stories available.</p>
              )}

              {myStories.map((story) => (
                <article
                  key={story.id}
                  className="rounded-xl border border-stone-300 bg-white p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-stone-900">
                      {story.title}
                    </p>
                    <span className="rounded-full border border-stone-300 px-2 py-1 text-xs font-semibold text-stone-700">
                      {story.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-stone-700">{story.excerpt}</p>
                  {story.rejectionReason && (
                    <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                      Rejected reason: {story.rejectionReason}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-stone-500">
                    Updated: {formatDate(story.updatedAt)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => editStory(story.id)}
                      className="rounded-full border border-stone-400 px-3 py-1 text-xs font-semibold text-stone-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void deleteStory(story.id)}
                      className="rounded-full border border-red-400 px-3 py-1 text-xs font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Delete
                    </button>
                    {story.status === "published" && (
                      <button
                        type="button"
                        disabled={photocardStoryId === story.id}
                        onClick={() => void createPhotocardFromStory(story)}
                        className="inline-flex items-center gap-1 rounded-full border border-stone-400 px-3 py-1 text-xs font-semibold text-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <FaDownload className="text-[10px]" />
                        {photocardStoryId === story.id
                          ? "Creating..."
                          : "Create Photocard"}
                      </button>
                    )}
                    {story.status === "draft" && (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => void submitForReview(story.id)}
                        className="rounded-full bg-(--accent) px-3 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Submit for Review
                      </button>
                    )}
                  </div>
                  {photocardErrorByStoryId[story.id] ? (
                    <p className="mt-2 text-xs font-semibold text-red-700">
                      {photocardErrorByStoryId[story.id]}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </article>
        </section>
      )}
    </main>
  );
}

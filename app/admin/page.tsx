"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import type { ArticleRow, ProfileRow, StoryStatus, UserRole } from "@/lib/types/admin";

type TabKey =
  | "overview"
  | "users"
  | "journalists"
  | "pending"
  | "placement"
  | "my-stories";

type AdminStory = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  body: string;
  authorId: string;
  authorName: string;
  status: StoryStatus;
  rejectionReason: string | null;
  placement: "none" | "lead" | "brief" | "latest";
  updatedAt: string;
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

function titleCaseRole(role: UserRole) {
  if (role === "sub-editor") return "Sub Editor";
  if (role === "writer") return "Writer / Journalist";
  return role.charAt(0).toUpperCase() + role.slice(1);
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

export default function AdminPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<ProfileRow | null>(null);
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [stories, setStories] = useState<AdminStory[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRoleForUser, setSelectedRoleForUser] = useState<UserRole>("writer");
  const [passwordDraft, setPasswordDraft] = useState<string>("");

  const [journalistName, setJournalistName] = useState("");
  const [journalistEmail, setJournalistEmail] = useState("");
  const [journalistPassword, setJournalistPassword] = useState("");
  const [openedJournalistId, setOpenedJournalistId] = useState<string>("");

  const [rejectReasonByStory, setRejectReasonByStory] = useState<Record<string, string>>({});

  const [writerTitle, setWriterTitle] = useState("");
  const [writerExcerpt, setWriterExcerpt] = useState("");
  const [writerCategory, setWriterCategory] = useState("City");
  const [writerTags, setWriterTags] = useState("");
  const [writerBody, setWriterBody] = useState("");
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);

  const journalists = useMemo(
    () => users.filter((user) => user.role === "writer"),
    [users],
  );

  useEffect(() => {
    if (!openedJournalistId && journalists.length > 0) {
      setOpenedJournalistId(journalists[0].id);
    }
  }, [journalists, openedJournalistId]);

  const myStories = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "owner") return stories;
    return stories.filter((story) => story.authorId === currentUser.id);
  }, [currentUser, stories]);

  const pendingStories = useMemo(
    () => stories.filter((story) => story.status === "submitted"),
    [stories],
  );

  const openedJournalistStories = useMemo(
    () => stories.filter((story) => story.authorId === openedJournalistId),
    [openedJournalistId, stories],
  );

  const canManageUsers = currentUser?.role === "owner";
  const canManageJournalists =
    currentUser?.role === "owner" ||
    currentUser?.role === "editor" ||
    currentUser?.role === "sub-editor";
  const canModerate = canManageJournalists;
  const canManagePlacement = canManageJournalists;
  const canWrite = currentUser?.role === "writer" || currentUser?.role === "owner";

  const availableTabs = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "owner") return TABS;
    if (currentUser.role === "writer") {
      return TABS.filter((tab) => ["overview", "my-stories"].includes(tab.key));
    }
    return TABS.filter((tab) =>
      ["overview", "journalists", "pending", "placement"].includes(tab.key),
    );
  }, [currentUser]);

  async function loadData() {
    setLoading(true);
    setError("");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setAuthUserId(null);
      setCurrentUser(null);
      setUsers([]);
      setStories([]);
      setLoading(false);
      return;
    }

    setAuthUserId(user.id);

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .order("created_at", { ascending: true });

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
      setError("No profile found for current user. Sign out and sign in again.");
      setLoading(false);
      return;
    }

    const { data: articleRows, error: articlesError } = await supabase
      .from("articles")
      .select(
        "id, title, slug, excerpt, body, category, tags, author_id, status, rejection_reason, placement, created_at, updated_at, published_at",
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

    const mappedStories = ((articleRows ?? []) as ArticleRow[]).map((story) => ({
      id: story.id,
      title: story.title,
      excerpt: story.excerpt,
      category: story.category,
      tags: story.tags ?? [],
      body: story.body,
      authorId: story.author_id,
      authorName: userNameMap.get(story.author_id) ?? "Unknown Journalist",
      status: story.status,
      rejectionReason: story.rejection_reason,
      placement: story.placement,
      updatedAt: story.updated_at,
    }));

    setStories(mappedStories);

    if (!availableTabs.some((tab) => tab.key === activeTab)) {
      setActiveTab("overview");
    }

    if (!selectedUserId && mappedUsers.length > 0) {
      setSelectedUserId(mappedUsers[0].id);
    }

    setLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function assignRoleToUser() {
    if (!canManageUsers || !selectedUserId) return;
    setSaving(true);
    setError("");
    setNotice("");

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: selectedRoleForUser })
      .eq("id", selectedUserId);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setNotice("Role updated successfully.");
    await loadData();
  }

  async function removeUserRole() {
    if (!canManageUsers || !selectedUserId) return;
    setSaving(true);
    setError("");
    setNotice("");

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: "writer" })
      .eq("id", selectedUserId);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setNotice("Role removed. User is now writer.");
    await loadData();
  }

  async function changePasswordForUser() {
    if (!canManageUsers || !selectedUserId || passwordDraft.trim().length < 8) {
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
        userId: selectedUserId,
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

  async function addJournalist(event: FormEvent) {
    event.preventDefault();
    if (!canManageJournalists) return;

    if (!journalistName.trim() || !journalistEmail.trim() || journalistPassword.length < 8) {
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

  async function removeJournalist(journalistId: string) {
    if (!canManageJournalists) return;

    setSaving(true);
    setError("");
    setNotice("");

    const response = await fetch(`/api/admin/journalists?userId=${journalistId}`, {
      method: "DELETE",
    });

    setSaving(false);

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error ?? "Failed to remove journalist");
      return;
    }

    setNotice("Journalist removed.");
    await loadData();
  }

  async function approveStory(storyId: string) {
    if (!canModerate) return;

    setSaving(true);
    setError("");
    setNotice("");

    const { error: updateError } = await supabase
      .from("articles")
      .update({ status: "published", rejection_reason: null, published_at: new Date().toISOString() })
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

    const { error: updateError } = await supabase
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

    const { error: deleteError } = await supabase.from("articles").delete().eq("id", storyId);

    setSaving(false);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setNotice("Story deleted.");
    await loadData();
  }

  async function setPlacement(storyId: string, placement: "none" | "lead" | "brief" | "latest") {
    if (!canManagePlacement) return;

    setSaving(true);
    setError("");
    setNotice("");

    if (placement === "lead") {
      await supabase.from("articles").update({ placement: "none" }).eq("placement", "lead");
    }

    const { error: updateError } = await supabase
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

    setSaving(true);
    setError("");
    setNotice("");

    const payload = {
      title: writerTitle.trim(),
      slug: `${slugFromTitle(writerTitle)}-${Date.now().toString().slice(-5)}`,
      excerpt: writerExcerpt.trim(),
      category: writerCategory,
      tags: writerTags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      body: writerBody.trim(),
      author_id: currentUser.id,
      rejection_reason: null,
    };

    if (editingStoryId) {
      const { error: updateError } = await supabase
        .from("articles")
        .update({
          title: payload.title,
          excerpt: payload.excerpt,
          category: payload.category,
          tags: payload.tags,
          body: payload.body,
          rejection_reason: null,
        })
        .eq("id", editingStoryId);

      setSaving(false);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setEditingStoryId(null);
      setNotice("Story updated.");
    } else {
      const { error: insertError } = await supabase
        .from("articles")
        .insert({
          ...payload,
          status: "draft",
          placement: "none",
        });

      setSaving(false);

      if (insertError) {
        setError(insertError.message);
        return;
      }

      setNotice("Draft saved.");
    }

    setWriterTitle("");
    setWriterExcerpt("");
    setWriterCategory("City");
    setWriterTags("");
    setWriterBody("");
    await loadData();
  }

  function editStory(storyId: string) {
    const story = stories.find((item) => item.id === storyId);
    if (!story) return;
    setEditingStoryId(story.id);
    setWriterTitle(story.title);
    setWriterExcerpt(story.excerpt);
    setWriterCategory(story.category);
    setWriterTags(story.tags.join(", "));
    setWriterBody(story.body);
  }

  async function submitForReview(storyId: string) {
    setSaving(true);
    setError("");
    setNotice("");

    const { error: updateError } = await supabase
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
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  }

  const selectedUser = users.find((user) => user.id === selectedUserId);
  const selectedJournalist = journalists.find((journalist) => journalist.id === openedJournalistId);

  const leadStory = stories.find((story) => story.placement === "lead") ?? null;
  const briefs = stories.filter((story) => story.placement === "brief");
  const latest = stories.filter((story) => story.placement === "latest");

  if (loading) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <section className="paper-surface rounded-2xl p-6">
          <h1 className="font-display text-3xl text-stone-900">Admin Desk</h1>
          <p className="mt-2 text-sm text-stone-700">Loading workspace...</p>
        </section>
      </main>
    );
  }

  if (!authUserId || !currentUser) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <section className="paper-surface rounded-2xl p-6">
          <h1 className="font-display text-3xl text-stone-900">Admin Access Required</h1>
          <p className="mt-2 text-sm text-stone-700">
            Please sign in with a newsroom account to access role-based admin features.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/auth"
              className="rounded-full bg-(--accent) px-4 py-2 text-sm font-semibold text-white"
            >
              Go to Sign In
            </Link>
            <Link
              href="/"
              className="rounded-full border border-stone-400 px-4 py-2 text-sm font-semibold text-stone-700"
            >
              Back to site
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
      <header className="paper-surface rounded-2xl p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-stone-600 uppercase">
              Live Role Workspace
            </p>
            <h1 className="font-display mt-2 text-3xl text-stone-900 sm:text-5xl">
              Admin Newsroom Desk
            </h1>
            <p className="mt-2 text-sm text-stone-700">
              Signed in as {currentUser.full_name} ({titleCaseRole(currentUser.role)})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void loadData()}
              className="rounded-full border border-stone-400 px-4 py-2 text-sm font-semibold text-stone-700"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-full border border-stone-400 px-4 py-2 text-sm font-semibold text-stone-700"
            >
              Sign Out
            </button>
            <Link
              href="/"
              className="rounded-full border border-stone-400 px-4 py-2 text-sm font-semibold text-stone-700"
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
                tab.key === activeTab
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

      {activeTab === "overview" && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="paper-surface rounded-2xl p-5">
            <p className="text-xs font-semibold tracking-[0.12em] text-stone-600 uppercase">Journalists</p>
            <p className="font-display mt-2 text-3xl text-stone-900">{journalists.length}</p>
          </article>
          <article className="paper-surface rounded-2xl p-5">
            <p className="text-xs font-semibold tracking-[0.12em] text-stone-600 uppercase">Pending News</p>
            <p className="font-display mt-2 text-3xl text-stone-900">{pendingStories.length}</p>
          </article>
          <article className="paper-surface rounded-2xl p-5">
            <p className="text-xs font-semibold tracking-[0.12em] text-stone-600 uppercase">Published</p>
            <p className="font-display mt-2 text-3xl text-stone-900">
              {stories.filter((story) => story.status === "published").length}
            </p>
          </article>
          <article className="paper-surface rounded-2xl p-5">
            <p className="text-xs font-semibold tracking-[0.12em] text-stone-600 uppercase">Drafts</p>
            <p className="font-display mt-2 text-3xl text-stone-900">
              {stories.filter((story) => story.status === "draft").length}
            </p>
          </article>
        </section>
      )}

      {activeTab === "users" && canManageUsers && (
        <section className="paper-surface rounded-2xl p-5 sm:p-6">
          <h2 className="font-display text-2xl text-stone-900">Owner User Controls</h2>
          <p className="mt-2 text-sm text-stone-600">
            Owner can assign roles and change passwords for newsroom users.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-stone-700">Select user</span>
              <select
                value={selectedUserId}
                onChange={(event) => setSelectedUserId(event.target.value)}
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
              <span className="text-sm font-semibold text-stone-700">Select role</span>
              <select
                value={selectedRoleForUser}
                onChange={(event) => setSelectedRoleForUser(event.target.value as UserRole)}
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
              <span className="text-sm font-semibold text-stone-700">New password</span>
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
              disabled={saving}
              onClick={() => void assignRoleToUser()}
              className="rounded-full bg-(--accent) px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Assign Role
            </button>
            <button
              type="button"
              disabled={saving}
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
        </section>
      )}

      {activeTab === "journalists" && canManageJournalists && (
        <section className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
          <article className="paper-surface rounded-2xl p-5 sm:p-6">
            <h2 className="font-display text-2xl text-stone-900">Journalist List</h2>

            <div className="mt-4 grid gap-3">
              {journalists.map((journalist) => (
                <div key={journalist.id} className="rounded-xl border border-stone-300 bg-white p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-stone-900">{journalist.full_name}</p>
                      <p className="text-xs text-stone-600">{journalist.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setOpenedJournalistId(journalist.id)}
                        className="rounded-full border border-stone-400 px-3 py-1 text-xs font-semibold text-stone-700"
                      >
                        Open Profile
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => void removeJournalist(journalist.id)}
                        className="rounded-full border border-red-400 px-3 py-1 text-xs font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form className="mt-5 grid gap-3 border-t border-dashed border-stone-400 pt-4" onSubmit={(event) => void addJournalist(event)}>
              <h3 className="font-display text-xl text-stone-900">Add Journalist</h3>
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
              {selectedJournalist ? `${selectedJournalist.full_name} Profile` : "Journalist Profile"}
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              View all articles written by this journalist and remove any story.
            </p>

            <div className="mt-4 grid gap-3">
              {openedJournalistStories.length === 0 && (
                <p className="text-sm text-stone-700">No stories found for this journalist.</p>
              )}

              {openedJournalistStories.map((story) => (
                <article key={story.id} className="rounded-xl border border-stone-300 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-stone-900">{story.title}</p>
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

      {activeTab === "pending" && canModerate && (
        <section className="paper-surface rounded-2xl p-5 sm:p-6">
          <h2 className="font-display text-2xl text-stone-900">Pending News Requests</h2>
          <p className="mt-2 text-sm text-stone-600">
            Accept to publish immediately, or reject back to draft with reason.
          </p>

          <div className="mt-5 grid gap-4">
            {pendingStories.length === 0 && (
              <p className="text-sm text-stone-700">No pending requests right now.</p>
            )}

            {pendingStories.map((story) => (
              <article key={story.id} className="rounded-xl border border-stone-300 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-stone-900">{story.title}</p>
                    <p className="text-xs text-stone-600">
                      By {story.authorName} • {story.category}
                    </p>
                  </div>
                  <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                    Submitted
                  </span>
                </div>

                <p className="mt-2 text-sm text-stone-700">{story.excerpt}</p>

                <label className="mt-3 grid gap-2">
                  <span className="text-xs font-semibold tracking-widest text-stone-600 uppercase">Rejection reason</span>
                  <input
                    value={rejectReasonByStory[story.id] ?? ""}
                    onChange={(event) =>
                      setRejectReasonByStory((prev) => ({ ...prev, [story.id]: event.target.value }))
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

      {activeTab === "placement" && canManagePlacement && (
        <section className="paper-surface rounded-2xl p-5 sm:p-6">
          <h2 className="font-display text-2xl text-stone-900">Front Page Placement</h2>
          <p className="mt-2 text-sm text-stone-600">
            Choose which published stories go into Lead Story, Frontline Briefs, and Latest.
          </p>

          <div className="mt-4 rounded-xl border border-dashed border-stone-400 p-4 text-sm text-stone-700">
            <p>Lead Story: {leadStory?.id ?? "Not selected"}</p>
            <p className="mt-1">Frontline Briefs: {briefs.map((story) => story.id).join(", ") || "None"}</p>
            <p className="mt-1">Latest: {latest.map((story) => story.id).join(", ") || "None"}</p>
          </div>

          <div className="mt-5 grid gap-4">
            {stories
              .filter((story) => story.status === "published")
              .map((story) => (
                <article key={story.id} className="rounded-xl border border-stone-300 bg-white p-4">
                  <p className="font-semibold text-stone-900">{story.title}</p>
                  <p className="mt-1 text-xs text-stone-600">{story.authorName}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void setPlacement(story.id, story.placement === "lead" ? "none" : "lead")}
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
                      onClick={() => void setPlacement(story.id, story.placement === "brief" ? "none" : "brief")}
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
                      onClick={() => void setPlacement(story.id, story.placement === "latest" ? "none" : "latest")}
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
        </section>
      )}

      {activeTab === "my-stories" && canWrite && (
        <section className="grid gap-6 lg:grid-cols-[1.2fr_1.4fr]">
          <article className="paper-surface rounded-2xl p-5 sm:p-6">
            <h2 className="font-display text-2xl text-stone-900">{editingStoryId ? "Edit Story" : "Create Story"}</h2>

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
                placeholder="Excerpt"
                className="rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none ring-(--accent) focus:ring"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  value={writerCategory}
                  onChange={(event) => setWriterCategory(event.target.value)}
                  className="rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none ring-(--accent) focus:ring"
                >
                  <option>City</option>
                  <option>Sports</option>
                  <option>Health</option>
                  <option>Education</option>
                  <option>Economy</option>
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
                      setWriterCategory("City");
                      setWriterTags("");
                      setWriterBody("");
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
              {myStories.length === 0 && <p className="text-sm text-stone-700">No stories available.</p>}

              {myStories.map((story) => (
                <article key={story.id} className="rounded-xl border border-stone-300 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-stone-900">{story.title}</p>
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
                  <p className="mt-2 text-xs text-stone-500">Updated: {formatDate(story.updatedAt)}</p>
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
                </article>
              ))}
            </div>
          </article>
        </section>
      )}
    </main>
  );
}

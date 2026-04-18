"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { AuthDemoPage } from "./AuthDemoPage";
import type { RequestedRole } from "@/lib/types/admin";

type EmailPasswordDemoProps = {
  user: User | null;
};

type Mode = "signup" | "signin";

export default function EmailPasswordDemo({ user }: EmailPasswordDemoProps) {
  const [mode, setMode] = useState<Mode>("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const supabase = getSupabaseBrowserClient();
  const [currentUser, setCurrentUser] = useState<User | null>(user);
  const [requestStatus, setRequestStatus] = useState<
    "none" | "pending" | "rejected"
  >("none");
  const [requestedRole, setRequestedRole] = useState<RequestedRole | null>(null);

  async function loadRequestState(userId: string | null) {
    if (!userId) {
      setRequestStatus("none");
      setRequestedRole(null);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("access_request_status, requested_role")
      .eq("id", userId)
      .single();

    if (error) {
      return;
    }

    setRequestStatus(data.access_request_status ?? "none");
    setRequestedRole(data.requested_role ?? null);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setStatus("Signed out successfully");
  }

  useEffect(() => {
    void loadRequestState(user?.id ?? null);

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setCurrentUser(session?.user ?? null);
        void loadRequestState(session?.user?.id ?? null);
      },
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [supabase]);

  async function requestAccess(role: RequestedRole) {
    if (!currentUser) return;

    setStatus("");
    const { error } = await supabase
      .from("profiles")
      .update({
        requested_role: role,
        access_request_status: "pending",
        access_request_updated_at: new Date().toISOString(),
      })
      .eq("id", currentUser.id);

    if (error) {
      setStatus(error.message);
      return;
    }

    setRequestStatus("pending");
    setRequestedRole(role);
    setStatus(
      `Access request submitted for ${role === "writer" ? "Journalist" : "Editor"}.`,
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: {
            full_name: fullName.trim() || email.split("@")[0],
          },
        },
      });
      if (error) {
        setStatus(error.message);
      } else {
        setStatus("Check your inbox to confirm the new account.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setStatus(error.message);
      } else {
        setStatus("Signed in successfully. Open Admin Desk from header.");
      }
    }
  }

  return (
    <AuthDemoPage
      title="Email + Password"
      intro="Classic credentials with Supabase auth. Session panel updates via getUser and onAuthStateChange."
      steps={[
        "Toggle between sign up and sign in.",
        "Submit to watch the session card refresh instantly.",
        "Sign out to reset the listener.",
      ]}
    >
      {!currentUser && (
        <form
          className="paper-surface rounded-2xl border border-stone-300 p-6 text-stone-900 shadow-sm sm:p-7"
          onSubmit={handleSubmit}
        >
          <div className="flex items-center justify-between text-[11px] font-semibold tracking-[0.18em] text-stone-600 uppercase">
            <span>Primary Flow</span>
            <span>Daily Darpan</span>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.2em] text-stone-600 uppercase">
                Credentials
              </p>
              <h3 className="font-display text-2xl text-stone-900">
                {mode === "signup" ? "Create an account" : "Welcome back"}
              </h3>
            </div>
            <div className="flex rounded-full border border-stone-300 bg-white/70 p-1 text-xs font-semibold text-stone-600">
              {(["signup", "signin"] as Mode[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={mode === option}
                  onClick={() => setMode(option)}
                  className={`rounded-full px-4 py-1 transition ${
                    mode === option
                      ? "bg-(--accent) text-white"
                      : "text-stone-600"
                  }`}
                >
                  {option === "signup" ? "Sign up" : "Sign in"}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {mode === "signup" && (
              <label className="block text-sm font-medium text-stone-800">
                Full name
                <input
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-base text-stone-900 placeholder:text-stone-500 focus:border-stone-500 focus:outline-none"
                  placeholder="Your full name"
                />
              </label>
            )}
            <label className="block text-sm font-medium text-stone-800">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-base text-stone-900 placeholder:text-stone-500 focus:border-stone-500 focus:outline-none"
                placeholder="you@email.com"
              />
            </label>
            <label className="block text-sm font-medium text-stone-800">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-base text-stone-900 placeholder:text-stone-500 focus:border-stone-500 focus:outline-none"
                placeholder="At least 8 characters"
              />
            </label>
          </div>
          <button
            type="submit"
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-(--accent) px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {mode === "signup" ? "Create account" : "Sign in"}
          </button>
          {status && (
            <p className="mt-4 text-sm text-stone-700" role="status" aria-live="polite">
              {status}
            </p>
          )}
        </form>
      )}
      <section className="paper-surface rounded-2xl border border-stone-300 p-6 text-stone-800 shadow-sm sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl text-stone-900">Session</h3>
            <p className="mt-1 text-sm text-stone-600">
              {currentUser
                ? "Hydrated by getUser + onAuthStateChange."
                : "Sign in to hydrate this panel instantly."}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              currentUser
                ? "border border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border border-stone-300 bg-white text-stone-600"
            }`}
          >
            {currentUser ? "Active" : "Idle"}
          </span>
        </div>
        {currentUser ? (
          <>
            <dl className="mt-5 space-y-3 text-sm text-stone-800">
              <div className="flex items-center justify-between gap-6">
                <dt className="text-stone-600">User ID</dt>
                <dd className="font-mono text-xs">{currentUser.id}</dd>
              </div>
              <div className="flex items-center justify-between gap-6">
                <dt className="text-stone-600">Email</dt>
                <dd>{currentUser.email}</dd>
              </div>
              <div className="flex items-center justify-between gap-6">
                <dt className="text-stone-600">Last sign in</dt>
                <dd>
                  {currentUser.last_sign_in_at
                    ? new Date(currentUser.last_sign_in_at).toLocaleString()
                    : "-"}
                </dd>
              </div>
            </dl>

            <div className="mt-6 rounded-xl border border-dashed border-stone-400 bg-white/70 p-4">
              <p className="text-xs font-semibold tracking-[0.14em] text-stone-600 uppercase">
                Access Requests
              </p>
              <p className="mt-2 text-sm text-stone-700">
                {requestStatus === "pending" && requestedRole
                  ? `Pending ${requestedRole === "writer" ? "Journalist" : "Editor"} request.`
                  : requestStatus === "rejected"
                    ? "Your last request was rejected. You can submit again."
                    : "Request Journalist or Editor access for newsroom features."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void requestAccess("writer")}
                  className="rounded-full border border-stone-400 px-3 py-1 text-xs font-semibold text-stone-700"
                >
                  Request Journalist
                </button>
                <button
                  type="button"
                  onClick={() => void requestAccess("editor")}
                  className="rounded-full border border-stone-400 px-3 py-1 text-xs font-semibold text-stone-700"
                >
                  Request Editor
                </button>
              </div>
            </div>

            <button
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-stone-900 px-4 py-2.5 text-sm font-semibold text-stone-100 transition hover:bg-stone-700"
              onClick={() => void handleSignOut()}
            >
              Sign out
            </button>
            <Link
              href="/admin"
              className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-stone-400 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
            >
              Go to Admin Desk
            </Link>
          </>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-stone-400 bg-white/70 p-5 text-sm text-stone-700">
            Session metadata will show up here after a successful sign in.
          </div>
        )}
      </section>
    </AuthDemoPage>
  );
}

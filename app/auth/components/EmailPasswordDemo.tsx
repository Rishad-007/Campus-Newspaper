"use client";

import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { AuthDemoPage } from "./AuthDemoPage";
import type { RequestedRole } from "@/lib/types/admin";

type EmailPasswordDemoProps = {
  user: User | null;
};

type Mode = "signup" | "signin";

export default function EmailPasswordDemo({ user }: EmailPasswordDemoProps) {
  const searchParams = useSearchParams();
  const mode: Mode =
    searchParams.get("mode") === "signup" ? "signup" : "signin";
  const authStatus = searchParams.get("auth");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const supabase = getSupabaseBrowserClient();
  const [currentUser, setCurrentUser] = useState<User | null>(user);
  const [requestStatus, setRequestStatus] = useState<
    "none" | "pending" | "rejected"
  >("none");
  const [requestedRole, setRequestedRole] = useState<RequestedRole | null>(
    null,
  );

  const loadRequestState = useCallback(
    async (userId: string | null) => {
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
    },
    [supabase],
  );

  async function handleSignOut() {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setStatus("Signed out successfully");
  }

  useEffect(() => {
    const initialLoadId = window.setTimeout(() => {
      void loadRequestState(user?.id ?? null);
    }, 0);

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setCurrentUser(session?.user ?? null);
        void loadRequestState(session?.user?.id ?? null);
      },
    );

    return () => {
      window.clearTimeout(initialLoadId);
      listener?.subscription.unsubscribe();
    };
  }, [loadRequestState, user?.id, supabase]);

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

  const authStatusMessage =
    authStatus === "signup_ok"
      ? "Check your inbox to confirm the new account."
      : authStatus === "signin_ok"
        ? "Signed in successfully. Open Admin Desk from header."
        : authStatus === "email_not_confirmed"
          ? "Email is not confirmed yet. Open your inbox and confirm first."
          : authStatus === "rate_limited"
            ? "Too many attempts. Please wait a minute and try again."
            : authStatus === "invalid_credentials"
              ? "Invalid email or password."
              : authStatus === "signup_failed"
                ? "Sign up failed. Please try again."
                : authStatus === "signin_failed"
                  ? "Sign in failed. Please try again."
                  : "";

  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (mode === "signup" && password !== confirmPassword) {
      event.preventDefault();
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordError("");
  }

  return (
    <AuthDemoPage
      title={mode === "signup" ? "Sign Up" : "Sign In"}
      intro={mode === "signup"
        ? "Create an account to access newsroom tools"
        : "Welcome back! Sign in to continue"}
    >
      {!currentUser ? (
        <form
          className="paper-surface rounded-2xl border border-stone-300 p-5 text-stone-900 shadow-sm sm:p-7"
          method="post"
          action={mode === "signup" ? "/api/auth/signup" : "/api/auth/signin"}
          onSubmit={handleSubmit}
        >
          <div className="mb-5 flex rounded-xl border border-stone-300 bg-stone-100 p-1">
            <Link
              href="/auth?mode=signin"
              className={`flex-1 rounded-lg py-2.5 text-center text-sm font-semibold transition ${
                mode === "signin"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              Log In
            </Link>
            <Link
              href="/auth?mode=signup"
              className={`flex-1 rounded-lg py-2.5 text-center text-sm font-semibold transition ${
                mode === "signup"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              Sign Up
            </Link>
          </div>

          {mode === "signup" && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-stone-800">
                Full Name
                <input
                  type="text"
                  name="full_name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-500 focus:border-stone-500 focus:outline-none sm:text-base"
                  placeholder="Your full name"
                />
              </label>
            </div>
          )}
          <div className={`space-y-4 ${mode === "signup" ? "mt-4" : ""}`}>
            <label className="block text-sm font-medium text-stone-800">
              Email
              <input
                type="email"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-500 focus:border-stone-500 focus:outline-none sm:text-base"
                placeholder="you@email.com"
              />
            </label>
            <label className="block text-sm font-medium text-stone-800">
              Password
              <input
                type="password"
                name="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-500 focus:border-stone-500 focus:outline-none sm:text-base"
                placeholder="At least 8 characters"
              />
            </label>
            {mode === "signup" && (
              <label className="block text-sm font-medium text-stone-800">
                Confirm Password
                <input
                  type="password"
                  name="confirm_password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setPasswordError("");
                  }}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-500 focus:border-stone-500 focus:outline-none sm:text-base"
                  placeholder="Re-enter password"
                />
              </label>
            )}
          </div>
          {passwordError && (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {passwordError}
            </p>
          )}
          <button
            type="submit"
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-(--accent) px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 sm:min-h-10"
          >
            {mode === "signup" ? "Create Account" : "Sign In"}
          </button>
          {authStatusMessage ? (
            <p
              className="mt-4 text-sm text-stone-700"
              role="status"
              aria-live="polite"
            >
              {authStatusMessage}
            </p>
          ) : null}
          {status && (
            <p
              className="mt-4 text-sm text-stone-700"
              role="status"
              aria-live="polite"
            >
              {status}
            </p>
          )}
          {mode === "signin" && (
            <p className="mt-4 text-center text-sm text-stone-600">
              Need a new account?{" "}
              <Link
                href="/auth?mode=signup"
                className="font-semibold text-(--accent) underline underline-offset-2"
              >
                Sign up
              </Link>
            </p>
          )}
        </form>
      ) : (
        <section className="paper-surface rounded-2xl border border-stone-300 p-6 text-stone-800 shadow-sm sm:p-7">
          <p className="text-center text-lg font-semibold text-stone-600">
            Signed In
          </p>
          <h3 className="font-display mt-2 text-center text-2xl text-stone-900">
            {currentUser.email}
          </h3>
          <p className="mt-4 text-center text-sm text-stone-700">
            Request your newsroom role below, then continue to the admin desk.
          </p>

          <div className="mt-5 rounded-xl border border-dashed border-stone-400 bg-white/70 p-4">
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
                className="inline-flex min-h-10 flex-1 items-center justify-center rounded-full border border-stone-400 px-3 py-2 text-xs font-semibold text-stone-700"
              >
                Request Journalist
              </button>
              <button
                type="button"
                onClick={() => void requestAccess("editor")}
                className="inline-flex min-h-10 flex-1 items-center justify-center rounded-full border border-stone-400 px-3 py-2 text-xs font-semibold text-stone-700"
              >
                Request Editor
              </button>
            </div>
          </div>

          {status && (
            <p
              className="mt-4 text-sm text-stone-700"
              role="status"
              aria-live="polite"
            >
              {status}
            </p>
          )}

          <button
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-stone-900 px-4 py-2.5 text-sm font-semibold text-stone-100 transition hover:bg-stone-700 sm:min-h-10"
            onClick={() => void handleSignOut()}
          >
            Sign Out
          </button>
          <Link
            href="/admin"
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-stone-400 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-100 sm:min-h-10"
          >
            Go to Admin Desk
          </Link>
        </section>
      )}
    </AuthDemoPage>
  );
}

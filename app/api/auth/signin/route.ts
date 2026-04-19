import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getRequestOrigin } from "@/lib/supabase/request-origin";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const origin = getRequestOrigin(request);

  if (!email || !password) {
    return NextResponse.redirect(
      `${origin}/auth?mode=signin&auth=invalid_credentials`,
      303,
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const message = error.message.toLowerCase();
    const authStatus = message.includes("email not confirmed")
      ? "email_not_confirmed"
      : message.includes("rate limit") || message.includes("too many")
        ? "rate_limited"
        : message.includes("invalid login credentials")
          ? "invalid_credentials"
          : "signin_failed";

    return NextResponse.redirect(
      `${origin}/auth?mode=signin&auth=${authStatus}`,
      303,
    );
  }

  return NextResponse.redirect(`${origin}/admin?auth=signin_ok`, 303);
}

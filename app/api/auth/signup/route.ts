import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function POST(request: Request) {
  const formData = await request.formData();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const origin = new URL(request.url).origin;

  if (!email || !password) {
    return NextResponse.redirect(
      `${origin}/auth?mode=signup&auth=signup_failed`,
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth?mode=signin`,
      data: {
        full_name: fullName || email.split("@")[0],
      },
    },
  });

  if (error) {
    return NextResponse.redirect(
      `${origin}/auth?mode=signup&auth=signup_failed`,
    );
  }

  return NextResponse.redirect(`${origin}/auth?mode=signin&auth=signup_ok`);
}

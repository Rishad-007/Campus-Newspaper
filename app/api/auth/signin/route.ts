import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const origin = new URL(request.url).origin;

  if (!email || !password) {
    return NextResponse.redirect(
      `${origin}/auth?mode=signin&auth=invalid_credentials`,
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.redirect(
      `${origin}/auth?mode=signin&auth=invalid_credentials`,
    );
  }

  return NextResponse.redirect(`${origin}/admin?auth=signin_ok`);
}

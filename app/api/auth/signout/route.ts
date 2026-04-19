import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

function redirectToHome(origin: string) {
  return NextResponse.redirect(`${origin}/?auth=signout_ok`);
}

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return redirectToHome(origin);
}

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return redirectToHome(origin);
}

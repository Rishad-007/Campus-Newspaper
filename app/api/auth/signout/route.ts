import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getRequestOrigin } from "@/lib/supabase/request-origin";

function redirectToHome(origin: string) {
  return NextResponse.redirect(`${origin}/?auth=signout_ok`);
}

function redirectToHomeAfterPost(origin: string) {
  return NextResponse.redirect(`${origin}/?auth=signout_ok`, 303);
}

export async function POST(request: Request) {
  const origin = getRequestOrigin(request);
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return redirectToHomeAfterPost(origin);
}

export async function GET(request: Request) {
  const origin = getRequestOrigin(request);
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return redirectToHome(origin);
}

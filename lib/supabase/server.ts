import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function createClient() {
  return createSupabaseServerClient();
}

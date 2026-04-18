import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export function createClient() {
  return getSupabaseBrowserClient();
}

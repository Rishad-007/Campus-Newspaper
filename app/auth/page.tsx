import EmailPasswordDemo from "./components/EmailPasswordDemo";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import { AuthDemoPage } from "./components/AuthDemoPage";

export default async function AuthPage() {
  if (!hasSupabasePublicConfig()) {
    return (
      <AuthDemoPage
        title="Authentication unavailable"
        intro="Set the public Supabase environment variables to enable sign in, sign up, and the admin session panel."
        steps={[
          "Copy .env.example to .env.local.",
          "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
          "Restart the dev server so the browser client can initialize.",
        ]}
      >
        <div className="lg:col-span-2 rounded-3xl border border-stone-300 bg-white p-6 text-sm text-stone-700 shadow-sm">
          <p className="font-semibold text-stone-900">
            Supabase is not configured
          </p>
          <p className="mt-2 leading-7">
            The authentication demo depends on Supabase Auth. Once the public
            URL and anon key are available, reload this page to use the full
            sign in flow.
          </p>
        </div>
      </AuthDemoPage>
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <EmailPasswordDemo user={user} />;
}

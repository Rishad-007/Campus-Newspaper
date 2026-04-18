import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type AddJournalistBody = {
  fullName?: string;
  email?: string;
  password?: string;
};

async function getRequesterProfile() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized", status: 401 as const };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return { error: "Profile not found", status: 403 as const };
  }

  return { userId: user.id, role: profile.role as string };
}

async function getRequesterWithRole(requiredRoles: string[]) {
  const requester = await getRequesterProfile();
  if ("error" in requester) {
    return requester;
  }

  if (!requiredRoles.includes(requester.role)) {
    return { error: "Forbidden", status: 403 as const };
  }

  return requester;
}

export async function POST(request: Request) {
  const requester = await getRequesterWithRole(["owner"]);
  if ("error" in requester) {
    return NextResponse.json(
      { error: requester.error },
      { status: requester.status },
    );
  }

  const body = (await request.json()) as AddJournalistBody;
  const fullName = body.fullName?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password?.trim();

  if (!fullName || !email || !password || password.length < 8) {
    return NextResponse.json(
      { error: "fullName, email, and password (>=8 chars) are required" },
      { status: 400 },
    );
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Force role to writer for journalist accounts.
  const { error: roleError } = await adminClient
    .from("profiles")
    .update({ role: "writer" })
    .eq("id", data.user.id);

  if (roleError) {
    return NextResponse.json({ error: roleError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, userId: data.user.id });
}

export async function DELETE(request: Request) {
  const requester = await getRequesterWithRole([
    "owner",
    "editor",
    "sub-editor",
  ]);
  if ("error" in requester) {
    return NextResponse.json(
      { error: requester.error },
      { status: requester.status },
    );
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId")?.trim();
  const deleteStories = searchParams.get("deleteStories") === "1";

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const adminClient = createAdminClient();

  const { data: targetProfile, error: targetError } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (targetError || !targetProfile) {
    return NextResponse.json(
      { error: "Target user not found" },
      { status: 404 },
    );
  }

  if (targetProfile.role !== "writer") {
    return NextResponse.json(
      { error: "Only journalist (writer) accounts can be removed here" },
      { status: 400 },
    );
  }

  if (userId === requester.userId) {
    return NextResponse.json(
      { error: "You cannot remove your own account from this action" },
      { status: 400 },
    );
  }

  if (deleteStories) {
    const { error: deleteArticlesError } = await adminClient
      .from("articles")
      .delete()
      .eq("author_id", userId);

    if (deleteArticlesError) {
      return NextResponse.json(
        { error: deleteArticlesError.message },
        { status: 400 },
      );
    }
  } else {
    const { error: reassignArticlesError } = await adminClient
      .from("articles")
      .update({ author_id: requester.userId })
      .eq("author_id", userId);

    if (reassignArticlesError) {
      return NextResponse.json(
        { error: reassignArticlesError.message },
        { status: 400 },
      );
    }
  }

  const { error } = await adminClient.auth.admin.deleteUser(userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

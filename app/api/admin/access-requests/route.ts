import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { RequestedRole } from "@/lib/types/admin";

type ResolveAccessBody = {
  userId?: string;
  action?: "approve" | "reject";
  requestedRole?: RequestedRole;
};

async function getRequesterRole() {
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

  if (!["owner", "editor"].includes(profile.role)) {
    return { error: "Forbidden", status: 403 as const };
  }

  return { userId: user.id, role: profile.role as string };
}

export async function PATCH(request: Request) {
  const requester = await getRequesterRole();
  if ("error" in requester) {
    return NextResponse.json(
      { error: requester.error },
      { status: requester.status },
    );
  }

  const body = (await request.json()) as ResolveAccessBody;
  const userId = body.userId?.trim();
  const action = body.action;
  const requestedRole = body.requestedRole;

  if (!userId || !action || !requestedRole) {
    return NextResponse.json(
      { error: "userId, action, and requestedRole are required" },
      { status: 400 },
    );
  }

  const adminClient = createAdminClient();

  const { data: targetProfile, error: targetError } = await adminClient
    .from("profiles")
    .select("access_request_status, requested_role")
    .eq("id", userId)
    .single();

  if (targetError || !targetProfile) {
    return NextResponse.json(
      { error: "Target user not found" },
      { status: 404 },
    );
  }

  if (
    targetProfile.access_request_status !== "pending" ||
    targetProfile.requested_role !== requestedRole
  ) {
    return NextResponse.json(
      { error: "No matching pending request found for this user" },
      { status: 400 },
    );
  }

  if (action === "approve") {
    const { error: approveError } = await adminClient
      .from("profiles")
      .update({
        role: requestedRole,
        access_request_status: "none",
        requested_role: null,
        access_request_updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (approveError) {
      return NextResponse.json(
        { error: approveError.message },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true, status: "approved" });
  }

  const { error: rejectError } = await adminClient
    .from("profiles")
    .update({
      access_request_status: "rejected",
      requested_role: null,
      access_request_updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (rejectError) {
    return NextResponse.json({ error: rejectError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, status: "rejected" });
}

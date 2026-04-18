export type UserRole = "owner" | "editor" | "sub-editor" | "writer";
export type RequestedRole = "editor" | "writer";
export type AccessRequestStatus = "none" | "pending" | "rejected";
export type StoryStatus = "draft" | "submitted" | "published";

export type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  requested_role: RequestedRole | null;
  access_request_status: AccessRequestStatus;
  access_request_updated_at: string | null;
};

export type ArticleRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: string;
  tags: string[];
  author_id: string;
  status: StoryStatus;
  rejection_reason: string | null;
  placement: "none" | "lead" | "brief" | "latest";
  created_at: string;
  updated_at: string;
  published_at: string | null;
  profiles?: {
    full_name: string;
  } | null;
};

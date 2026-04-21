export type UserRole = "owner" | "editor" | "sub-editor" | "writer";
export type RequestedRole = "editor" | "writer";
export type AccessRequestStatus = "none" | "pending" | "rejected";
export type StoryStatus = "draft" | "submitted" | "published";

export type StoryPlacement = "none" | "lead" | "brief" | "latest";

export type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  hide_byline: boolean;
  requested_role: RequestedRole | null;
  access_request_status: AccessRequestStatus;
  access_request_updated_at: string | null;
};

export type ArticleRow = {
  id: string;
  locale: "en" | "bn";
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  hero_image_url: string | null;
  category_id: string;
  author_id: string;
  status: StoryStatus;
  rejection_reason: string | null;
  placement: StoryPlacement;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  categories?:
    | {
        id: string;
        slug: string;
        name_en: string;
        name_bn: string;
      }
    | {
        id: string;
        slug: string;
        name_en: string;
        name_bn: string;
      }[]
    | null;
  profiles?: {
    full_name: string;
    hide_byline?: boolean | null;
  } | null;
};

export type CategoryRow = {
  id: string;
  slug: string;
  name_en: string;
  name_bn: string;
};

export type TagRow = {
  id: string;
  slug: string;
  name: string;
};

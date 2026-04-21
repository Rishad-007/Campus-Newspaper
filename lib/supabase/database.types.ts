export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type TableRow<T> = T;
type TableInsert<T> = Partial<T>;
type TableUpdate<T> = Partial<T>;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: TableRow<{
          id: string;
          full_name: string;
          email: string;
          role: "owner" | "editor" | "sub-editor" | "writer";
          hide_byline: boolean;
          requested_role: "editor" | "writer" | null;
          access_request_status: "none" | "pending" | "rejected";
          access_request_updated_at: string | null;
          created_at: string;
          updated_at: string;
        }>;
        Insert: TableInsert<{
          id: string;
          full_name: string;
          email: string;
          role: "owner" | "editor" | "sub-editor" | "writer";
          hide_byline: boolean;
          requested_role: "editor" | "writer" | null;
          access_request_status: "none" | "pending" | "rejected";
          access_request_updated_at: string | null;
          created_at: string;
          updated_at: string;
        }>;
        Update: TableUpdate<{
          id: string;
          full_name: string;
          email: string;
          role: "owner" | "editor" | "sub-editor" | "writer";
          hide_byline: boolean;
          requested_role: "editor" | "writer" | null;
          access_request_status: "none" | "pending" | "rejected";
          access_request_updated_at: string | null;
          created_at: string;
          updated_at: string;
        }>;
        Relationships: [];
      };
      categories: {
        Row: TableRow<{
          id: string;
          slug: string;
          name_en: string;
          name_bn: string;
          created_at: string;
        }>;
        Insert: TableInsert<{
          id: string;
          slug: string;
          name_en: string;
          name_bn: string;
          created_at: string;
        }>;
        Update: TableUpdate<{
          id: string;
          slug: string;
          name_en: string;
          name_bn: string;
          created_at: string;
        }>;
        Relationships: [];
      };
      tags: {
        Row: TableRow<{
          id: string;
          slug: string;
          name: string;
          created_at: string;
        }>;
        Insert: TableInsert<{
          id: string;
          slug: string;
          name: string;
          created_at: string;
        }>;
        Update: TableUpdate<{
          id: string;
          slug: string;
          name: string;
          created_at: string;
        }>;
        Relationships: [];
      };
      articles: {
        Row: TableRow<{
          id: string;
          locale: "en" | "bn";
          title: string;
          slug: string;
          excerpt: string;
          body: string;
          hero_image_url: string | null;
          category_id: string;
          author_id: string;
          status: "draft" | "submitted" | "published";
          rejection_reason: string | null;
          placement: "none" | "lead" | "brief" | "latest";
          created_at: string;
          updated_at: string;
          published_at: string | null;
        }>;
        Insert: TableInsert<{
          id: string;
          locale: "en" | "bn";
          title: string;
          slug: string;
          excerpt: string;
          body: string;
          hero_image_url: string | null;
          category_id: string;
          author_id: string;
          status: "draft" | "submitted" | "published";
          rejection_reason: string | null;
          placement: "none" | "lead" | "brief" | "latest";
          created_at: string;
          updated_at: string;
          published_at: string | null;
        }>;
        Update: TableUpdate<{
          id: string;
          locale: "en" | "bn";
          title: string;
          slug: string;
          excerpt: string;
          body: string;
          hero_image_url: string | null;
          category_id: string;
          author_id: string;
          status: "draft" | "submitted" | "published";
          rejection_reason: string | null;
          placement: "none" | "lead" | "brief" | "latest";
          created_at: string;
          updated_at: string;
          published_at: string | null;
        }>;
        Relationships: [];
      };
      article_tags: {
        Row: TableRow<{
          article_id: string;
          tag_id: string;
          created_at: string;
        }>;
        Insert: TableInsert<{
          article_id: string;
          tag_id: string;
          created_at: string;
        }>;
        Update: TableUpdate<{
          article_id: string;
          tag_id: string;
          created_at: string;
        }>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

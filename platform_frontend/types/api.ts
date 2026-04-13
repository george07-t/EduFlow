export interface User {
  id: number;
  username: string;
  email: string;
  role: "admin" | "viewer" | "creator";
}

export interface CategoryTree {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  depth: number;
  order: number;
  article_count: number;
  children: CategoryTree[];
}

export interface CategoryDetail {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  depth: number;
  breadcrumb: { id: number; name: string; slug: string }[];
  children: CategoryTree[];
  articles: ArticleRead[];
}

export interface ArticleRead {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  status: string;
  featured: boolean;
  read_time?: number;
  category?: { id: number; name: string; slug: string };
  created_at?: string;
  updated_at?: string;
}

export interface SidePanelSection {
  id: number;
  article_id: number;
  label: string;
  content_html: string;
  order: number;
  is_expanded_default: boolean;
}

export interface MediaMapEntry {
  id: number;
  type: "text" | "image" | "audio" | "local_video" | "youtube";
  title: string;
  url?: string;
  alt_text?: string;
  content?: string;
}

export interface ArticleDetail {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  body_html: string;
  status: string;
  featured: boolean;
  read_time?: number;
  category?: { id: number; name: string; slug: string };
  breadcrumb: { id: number; name: string; slug: string }[];
  side_panel_sections: SidePanelSection[];
  multimedia_contents: ArticleMultimediaContent[];
  media_map: Record<string, MediaMapEntry>;
  author?: { username: string };
  created_at?: string;
  updated_at?: string;
}

export interface ArticleMultimediaContent {
  id: number;
  article_id: number;
  media_asset_id: number;
  order: number;
  media: MediaMapEntry;
  created_at?: string;
}

export interface PaginatedArticles {
  items: ArticleRead[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface MediaAsset {
  id: number;
  title: string;
  type: "text" | "image" | "audio" | "local_video" | "youtube";
  url?: string;
  mime_type?: string;
  file_size?: number;
  alt_text?: string;
  content?: string;
  created_at?: string;
}

export interface PaginatedMedia {
  items: MediaAsset[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export type ModalPayload = MediaMapEntry | null;

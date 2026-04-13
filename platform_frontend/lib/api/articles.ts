import client from "./client";
import { ArticleDetail, PaginatedArticles } from "@/types/api";

export const articlesApi = {
  list: (params?: {
    category_slug?: string;
    search?: string;
    featured?: boolean;
    page?: number;
    per_page?: number;
  }) => client.get<PaginatedArticles>("/articles", { params }),

  get: (slug: string) => client.get<ArticleDetail>(`/articles/${slug}`),

  getById: (id: number) => client.get<ArticleDetail>(`/articles/id/${id}`),

  create: (data: {
    title: string;
    category_id?: number;
    summary?: string;
    body_html: string;
    status?: string;
    featured?: boolean;
    side_panel_sections?: Array<{
      label: string;
      content_html: string;
      order: number;
      is_expanded_default: boolean;
    }>;
    multimedia_contents?: Array<{
      media_asset_id: number;
      order: number;
    }>;
  }) => client.post<ArticleDetail>("/articles", data),

  update: (
    id: number,
    data: {
      title?: string;
      category_id?: number;
      summary?: string;
      body_html?: string;
      status?: string;
      featured?: boolean;
      side_panel_sections?: Array<{
        label: string;
        content_html: string;
        order: number;
        is_expanded_default: boolean;
      }>;
      multimedia_contents?: Array<{
        media_asset_id: number;
        order: number;
      }>;
    }
  ) => client.put<ArticleDetail>(`/articles/${id}`, data),

  updateStatus: (id: number, status: string) =>
    client.patch(`/articles/${id}/status`, { status }),

  delete: (id: number) => client.delete(`/articles/${id}`),
};

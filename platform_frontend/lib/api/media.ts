import client from "./client";
import { PaginatedMedia, MediaAsset } from "@/types/api";

export const mediaApi = {
  list: (params?: { type?: string; search?: string; page?: number; per_page?: number }) =>
    client.get<PaginatedMedia>("/media", { params }),

  get: (id: number) => client.get<MediaAsset>(`/media/${id}`),

  upload: (formData: FormData) =>
    client.post<MediaAsset>("/media", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id: number, data: { title?: string; alt_text?: string; transcript?: string; content?: string }) =>
    client.put<MediaAsset>(`/media/${id}`, data),

  delete: (id: number) => client.delete(`/media/${id}`),
};

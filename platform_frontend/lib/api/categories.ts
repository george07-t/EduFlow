import client from "./client";
import { CategoryTree, CategoryDetail } from "@/types/api";

export const categoriesApi = {
  tree: () => client.get<{ tree: CategoryTree[] }>("/categories"),

  get: (slug: string) => client.get<CategoryDetail>(`/categories/${slug}`),

  create: (data: { name: string; parent_id?: number; description?: string; order?: number }) =>
    client.post("/categories", data),

  update: (id: number, data: Partial<{ name: string; parent_id: number; description: string; order: number }>) =>
    client.put(`/categories/${id}`, data),

  delete: (id: number) => client.delete(`/categories/${id}`),
};

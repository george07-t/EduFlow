"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { articlesApi } from "@/lib/api/articles";
import { ArticleRead } from "@/types/api";
import Button from "@/components/ui/Button";
import Badge, { statusVariant } from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import { toast } from "react-toastify";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<ArticleRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await articlesApi.list({ page, per_page: 15 });
      setArticles(res.data.items);
      setTotalPages(res.data.pages);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await articlesApi.delete(id);
      toast.success("Article deleted");
      load();
    } catch { toast.error("Failed to delete"); }
  };

  const handleStatusToggle = async (id: number, currentStatus: string) => {
    const next = currentStatus === "published" ? "draft" : "published";
    try {
      await articlesApi.updateStatus(id, next);
      toast.success(`Article ${next}`);
      load();
    } catch { toast.error("Failed to update status"); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
        <Link href="/admin/articles/new">
          <Button>+ New Article</Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Category</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="px-4 py-3"><Skeleton height={16} /></td>
                  <td className="px-4 py-3 hidden sm:table-cell"><Skeleton height={16} width={80} /></td>
                  <td className="px-4 py-3"><Skeleton height={16} width={60} /></td>
                  <td className="px-4 py-3"><Skeleton height={16} width={100} /></td>
                </tr>
              ))
            ) : articles.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-gray-400">
                  No articles yet. <Link href="/admin/articles/new" className="text-blue-600 hover:underline">Create the first one</Link>
                </td>
              </tr>
            ) : articles.map((article) => (
              <tr key={article.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900 truncate max-w-xs">{article.title}</p>
                    {article.summary && <p className="text-xs text-gray-400 truncate max-w-xs mt-0.5">{article.summary}</p>}
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-gray-500">
                  {article.category?.name || <span className="text-gray-300">None</span>}
                </td>
                <td className="px-4 py-3">
                  <Badge label={article.status} variant={statusVariant(article.status)} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <Link href={`/article/${article.slug}`} target="_blank">
                      <Button size="sm" variant="ghost">View</Button>
                    </Link>
                    <Link href={`/admin/articles/${article.id}/edit`}>
                      <Button size="sm" variant="secondary">Edit</Button>
                    </Link>
                    <Button
                      size="sm"
                      variant={article.status === "published" ? "secondary" : "primary"}
                      onClick={() => handleStatusToggle(article.id, article.status)}
                    >
                      {article.status === "published" ? "Unpublish" : "Publish"}
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(article.id, article.title)}>
                      Del
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 p-4 border-t border-gray-200">
            <Button size="sm" variant="secondary" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Previous</Button>
            <span className="text-sm text-gray-600">{page} / {totalPages}</span>
            <Button size="sm" variant="secondary" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Next</Button>
          </div>
        )}
      </div>
    </div>
  );
}

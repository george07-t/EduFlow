"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { articlesApi } from "@/lib/api/articles";
import { categoriesApi } from "@/lib/api/categories";
import { CategoryTree, ArticleDetail } from "@/types/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import SidePanelSectionEditor, { SectionFormData } from "@/components/admin/ArticleEditor/SidePanelSectionEditor";
import Skeleton from "@/components/ui/Skeleton";
import { toast } from "react-toastify";

const TipTapEditor = dynamic(() => import("@/components/admin/ArticleEditor/TipTapEditor"), { ssr: false });

function flattenTree(tree: CategoryTree[]): CategoryTree[] {
  const result: CategoryTree[] = [];
  const traverse = (nodes: CategoryTree[]) => nodes.forEach(n => { result.push(n); traverse(n.children); });
  traverse(tree);
  return result;
}

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [articleId, setArticleId] = useState<number | null>(null);
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("draft");
  const [featured, setFeatured] = useState(false);
  const [sections, setSections] = useState<SectionFormData[]>([]);
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    params.then(p => setArticleId(parseInt(p.id)));
  }, [params]);

  useEffect(() => {
    if (!articleId) return;
    setLoading(true);
    Promise.all([
      categoriesApi.tree(),
      // Fetch article by id via list endpoint first to get slug
      articlesApi.list({ per_page: 100 }),
    ]).then(async ([catRes, listRes]) => {
      setCategories(flattenTree(catRes.data.tree));
      const found = listRes.data.items.find(a => a.id === articleId);
      if (found) {
        const detailRes = await articlesApi.get(found.slug);
        const a = detailRes.data;
        setArticle(a);
        setTitle(a.title);
        setSummary(a.summary || "");
        setBodyHtml(a.body_html);
        setCategoryId(a.category?.id?.toString() || "");
        setStatus(a.status);
        setFeatured(a.featured);
        setSections(a.side_panel_sections.map(s => ({
          label: s.label,
          content_html: s.content_html,
          order: s.order,
          is_expanded_default: s.is_expanded_default,
        })));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [articleId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleId) return;
    setSaving(true);
    try {
      await articlesApi.update(articleId, {
        title,
        summary: summary || undefined,
        body_html: bodyHtml,
        category_id: categoryId ? parseInt(categoryId) : undefined,
        status,
        featured,
        side_panel_sections: sections.map((s, i) => ({ ...s, order: i })),
      });
      toast.success("Article saved!");
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to save");
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton height={32} width="40%" />
        <Skeleton height={200} />
        <Skeleton height={400} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Article</h1>
        <div className="flex gap-2">
          {article && (
            <Button variant="ghost" onClick={() => window.open(`/article/${article.slug}`, "_blank")}>
              Preview ↗
            </Button>
          )}
          <Button variant="secondary" onClick={() => router.back()}>← Back</Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Article Details</h2>
          <Input label="Title *" value={title} onChange={e => setTitle(e.target.value)} required />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Summary</label>
            <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">— No category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{"  ".repeat(c.depth)}{c.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer self-end pb-2">
              <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="rounded" />
              Featured
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Body Content</h2>
          <TipTapEditor content={bodyHtml} onChange={setBodyHtml} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SidePanelSectionEditor sections={sections} onChange={setSections} />
        </div>

        <div className="flex gap-3 pb-8">
          <Button type="submit" loading={saving}>Save Changes</Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

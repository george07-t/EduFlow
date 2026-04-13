"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { articlesApi } from "@/lib/api/articles";
import { categoriesApi } from "@/lib/api/categories";
import { CategoryTree } from "@/types/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import SidePanelSectionEditor, { SectionFormData } from "@/components/admin/ArticleEditor/SidePanelSectionEditor";
import { toast } from "react-toastify";

const TipTapEditor = dynamic(() => import("@/components/admin/ArticleEditor/TipTapEditor"), { ssr: false });

function flattenTree(tree: CategoryTree[]): CategoryTree[] {
  const result: CategoryTree[] = [];
  const traverse = (nodes: CategoryTree[]) => nodes.forEach(n => { result.push(n); traverse(n.children); });
  traverse(tree);
  return result;
}

export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("draft");
  const [featured, setFeatured] = useState(false);
  const [sections, setSections] = useState<SectionFormData[]>([]);
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    categoriesApi.tree().then(res => setCategories(flattenTree(res.data.tree))).catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const article = await articlesApi.create({
        title,
        summary: summary || undefined,
        body_html: bodyHtml,
        category_id: categoryId ? parseInt(categoryId) : undefined,
        status,
        featured,
        side_panel_sections: sections.map((s, i) => ({ ...s, order: i })),
      });
      toast.success("Article created!");
      router.push(`/admin/articles/${article.data.id}/edit`);
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to create");
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Article</h1>
        <Button variant="secondary" onClick={() => router.back()}>Back</Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Article Details</h2>
          <Input label="Title *" value={title} onChange={e => setTitle(e.target.value)} placeholder="Article title" required />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Summary</label>
            <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={2} placeholder="Brief description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">No category</option>
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
              Featured article
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Body Content
            <span className="ml-2 text-xs font-normal text-gray-400">Use &quot;Insert Media&quot; to embed [[media:N]] triggers</span>
          </h2>
          <TipTapEditor content={bodyHtml} onChange={setBodyHtml} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SidePanelSectionEditor sections={sections} onChange={setSections} />
        </div>

        <div className="flex gap-3 pb-8">
          <Button type="submit" loading={saving}>Create Article</Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

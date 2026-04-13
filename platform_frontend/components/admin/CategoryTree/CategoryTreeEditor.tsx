"use client";

import { useEffect, useMemo, useState } from "react";
import { Tree } from "react-arborist";
import { categoriesApi } from "@/lib/api/categories";
import { CategoryTree } from "@/types/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Skeleton from "@/components/ui/Skeleton";
import { toast } from "react-toastify";

interface TreeNodeData extends CategoryTree {}

function flattenTree(tree: CategoryTree[]): CategoryTree[] {
  const result: CategoryTree[] = [];
  const walk = (nodes: CategoryTree[]) => {
    nodes.forEach((node) => {
      result.push(node);
      walk(node.children);
    });
  };
  walk(tree);
  return result;
}

function collectDescendantIds(node: CategoryTree): number[] {
  const ids: number[] = [];
  const walk = (current: CategoryTree) => {
    current.children.forEach((child) => {
      ids.push(child.id);
      walk(child);
    });
  };
  walk(node);
  return ids;
}

export default function CategoryTreeEditor() {
  const [tree, setTree] = useState<CategoryTree[]>([]);
  const [flat, setFlat] = useState<CategoryTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNode, setEditingNode] = useState<CategoryTree | null>(null);
  const [formName, setFormName] = useState("");
  const [formParentId, setFormParentId] = useState<string>("");
  const [formDesc, setFormDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await categoriesApi.tree();
      setTree(res.data.tree);
      setFlat(flattenTree(res.data.tree));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const editBlockedIds = useMemo(() => {
    if (!editingNode) return [];
    return [editingNode.id, ...collectDescendantIds(editingNode)];
  }, [editingNode]);

  const startCreate = () => {
    setEditingNode(null);
    setFormName("");
    setFormParentId("");
    setFormDesc("");
    setShowForm(true);
  };

  const startChildCreate = (parent: CategoryTree) => {
    setEditingNode(null);
    setFormName("");
    setFormParentId(parent.id.toString());
    setFormDesc("");
    setShowForm(true);
  };

  const startEdit = (node: CategoryTree) => {
    setEditingNode(node);
    setFormName(node.name);
    setFormParentId(node.parent_id?.toString() || "");
    setFormDesc(node.description || "");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formName) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    try {
      if (editingNode) {
        await categoriesApi.update(editingNode.id, {
          name: formName,
          parent_id: formParentId ? parseInt(formParentId, 10) : undefined,
          description: formDesc,
        });
        toast.success("Category updated");
      } else {
        await categoriesApi.create({
          name: formName,
          parent_id: formParentId ? parseInt(formParentId, 10) : undefined,
          description: formDesc,
        });
        toast.success("Category created");
      }
      setShowForm(false);
      await load();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this category? Its articles will become uncategorized.")) return;
    try {
      await categoriesApi.delete(id);
      toast.success("Category deleted");
      await load();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Category Tree</h2>
            <p className="text-sm text-gray-500">Hierarchical categories with article counts on every node.</p>
          </div>
          <Button size="sm" onClick={startCreate}>+ New Category</Button>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="space-y-2">
              <Skeleton count={6} height={36} />
            </div>
          ) : tree.length === 0 ? (
            <p className="text-sm text-gray-400 py-10 text-center">No categories yet. Create the first one.</p>
          ) : (
            <div className="rounded-xl border border-gray-100 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
              <Tree
                data={tree as TreeNodeData[]}
                width="100%"
                height={620}
                indent={20}
                rowHeight={44}
                openByDefault
              >
                {({ node, style }: any) => {
                  const data = node.data as CategoryTree;
                  const hasChildren = data.children.length > 0;

                  return (
                    <div style={style} className="px-3">
                      <div className="group flex items-center gap-2 rounded-lg border border-transparent px-3 py-2 hover:border-blue-200 hover:bg-blue-50/70 transition-colors">
                        {hasChildren ? (
                          <button
                            type="button"
                            onClick={() => node.toggle()}
                            className="h-6 w-6 shrink-0 rounded-md text-gray-400 hover:text-gray-700 hover:bg-white flex items-center justify-center"
                            aria-label={node.isOpen ? "Collapse category" : "Expand category"}
                          >
                            <svg
                              className={`h-3.5 w-3.5 transition-transform ${node.isOpen ? "rotate-90" : ""}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        ) : (
                          <span className="h-6 w-6 shrink-0" />
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="truncate text-sm font-medium text-gray-900">{data.name}</span>
                            <span className="shrink-0 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-gray-500">
                              {data.article_count}
                            </span>
                          </div>
                          <div className="mt-0.5 text-xs text-gray-400 truncate">/category/{data.slug}</div>
                        </div>

                        <div className="hidden sm:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => startChildCreate(data)}
                            className="text-xs font-medium text-gray-600 hover:text-blue-700"
                          >
                            Add child
                          </button>
                          <button
                            type="button"
                            onClick={() => startEdit(data)}
                            className="text-xs font-medium text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(data.id)}
                            className="text-xs font-medium text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                }}
              </Tree>
            </div>
          )}
        </div>
      </div>

      <div className="xl:sticky xl:top-24 space-y-4">
        {showForm ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">{editingNode ? "Edit Category" : "New Category"}</h3>
              <p className="text-sm text-gray-500 mt-1">Use the tree to organize categories by level.</p>
            </div>

            <Input label="Name" value={formName} onChange={(e) => setFormName(e.target.value)} />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Parent Category</label>
              <select
                value={formParentId}
                onChange={(e) => setFormParentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Root (no parent)</option>
                {flat
                  .filter((category) => !editBlockedIds.includes(category.id))
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {"  ".repeat(category.depth)}{category.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                rows={4}
                placeholder="Optional description"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex gap-2">
              <Button size="sm" loading={saving} onClick={handleSave}>Save</Button>
              <Button size="sm" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-5 text-sm text-gray-500 shadow-sm">
            Select a category to edit it, or create a new root / child category.
          </div>
        )}
      </div>
    </div>
  );
}

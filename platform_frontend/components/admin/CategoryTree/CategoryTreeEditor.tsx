"use client";
import { useState, useEffect } from "react";
import { categoriesApi } from "@/lib/api/categories";
import { CategoryTree } from "@/types/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Skeleton from "@/components/ui/Skeleton";
import { toast } from "react-toastify";

interface NodeProps {
  node: CategoryTree;
  allCategories: CategoryTree[];
  onDelete: (id: number) => void;
  onEdit: (node: CategoryTree) => void;
}

function flattenTree(tree: CategoryTree[]): CategoryTree[] {
  const result: CategoryTree[] = [];
  const traverse = (nodes: CategoryTree[]) => {
    nodes.forEach(n => { result.push(n); traverse(n.children); });
  };
  traverse(tree);
  return result;
}

function CategoryNode({ node, allCategories, onDelete, onEdit }: NodeProps) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="pl-4 border-l border-gray-200">
      <div className="flex items-center gap-2 py-1.5 group">
        {node.children.length > 0 && (
          <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-gray-600 w-4">
            {expanded ? "▾" : "▸"}
          </button>
        )}
        {node.children.length === 0 && <span className="w-4" />}
        <span className="text-sm text-gray-800 font-medium flex-1">{node.name}</span>
        <span className="text-xs text-gray-400 font-mono">/category/{node.slug}</span>
        <div className="opacity-0 group-hover:opacity-100 flex gap-1">
          <button onClick={() => onEdit(node)} className="text-xs text-blue-500 hover:text-blue-700">Edit</button>
          <button onClick={() => onDelete(node.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
        </div>
      </div>
      {expanded && node.children.length > 0 && (
        <div>
          {node.children.map(child => (
            <CategoryNode key={child.id} node={child} allCategories={allCategories} onDelete={onDelete} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
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
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const startCreate = () => {
    setEditingNode(null);
    setFormName(""); setFormParentId(""); setFormDesc("");
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
    if (!formName) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      if (editingNode) {
        await categoriesApi.update(editingNode.id, {
          name: formName,
          parent_id: formParentId ? parseInt(formParentId) : undefined,
          description: formDesc,
        });
        toast.success("Category updated");
      } else {
        await categoriesApi.create({
          name: formName,
          parent_id: formParentId ? parseInt(formParentId) : undefined,
          description: formDesc,
        });
        toast.success("Category created");
      }
      setShowForm(false);
      load();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to save");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this category? Its articles will become uncategorized.")) return;
    try {
      await categoriesApi.delete(id);
      toast.success("Category deleted");
      load();
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Category Tree</h2>
        <Button size="sm" onClick={startCreate}>+ New Category</Button>
      </div>

      {showForm && (
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
          <h3 className="font-medium text-gray-800">{editingNode ? "Edit Category" : "New Category"}</h3>
          <Input label="Name" value={formName} onChange={e => setFormName(e.target.value)} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Parent Category</label>
            <select
              value={formParentId}
              onChange={e => setFormParentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Root (no parent)</option>
              {flat.filter(c => c.id !== editingNode?.id).map(c => (
                <option key={c.id} value={c.id}>{"  ".repeat(c.depth)}{c.name}</option>
              ))}
            </select>
          </div>
          <Input label="Description" value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Optional" />
          <div className="flex gap-2">
            <Button size="sm" loading={saving} onClick={handleSave}>Save</Button>
            <Button size="sm" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2"><Skeleton count={4} height={32} /></div>
      ) : tree.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">No categories yet. Create the first one!</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          {tree.map(node => (
            <CategoryNode key={node.id} node={node} allCategories={flat} onDelete={handleDelete} onEdit={startEdit} />
          ))}
        </div>
      )}
    </div>
  );
}

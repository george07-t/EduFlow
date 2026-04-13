"use client";
import Link from "next/link";
import { useState } from "react";
import { CategoryTree } from "@/types/api";

interface NodeProps {
  node: CategoryTree;
  level?: number;
}

function CategoryNode({ node, level = 0 }: NodeProps) {
  const [open, setOpen] = useState(level === 0);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-1 group`}
        style={{ paddingLeft: `${level * 12}px` }}
      >
        {hasChildren && (
          <button
            onClick={() => setOpen(!open)}
            className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <svg
              className={`w-3 h-3 transition-transform ${open ? "rotate-90" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        {!hasChildren && <span className="w-4 flex-shrink-0" />}
        <Link
          href={`/category/${node.slug}`}
          className="flex-1 py-1 px-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors truncate"
        >
          {node.name}
        </Link>
      </div>
      {hasChildren && open && (
        <div>
          {node.children.map((child) => (
            <CategoryNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryTreeNav({ tree }: { tree: CategoryTree[] }) {
  if (!tree.length) return <p className="text-sm text-gray-400 px-2">No categories yet.</p>;
  return (
    <nav className="space-y-0.5">
      {tree.map((node) => (
        <CategoryNode key={node.id} node={node} level={0} />
      ))}
    </nav>
  );
}

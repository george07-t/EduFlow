"use client";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export interface SectionFormData {
  label: string;
  content_html: string;
  order: number;
  is_expanded_default: boolean;
}

interface Props {
  sections: SectionFormData[];
  onChange: (sections: SectionFormData[]) => void;
}

export default function SidePanelSectionEditor({ sections, onChange }: Props) {
  const addSection = () => {
    onChange([
      ...sections,
      { label: "", content_html: "", order: sections.length, is_expanded_default: false },
    ]);
  };

  const removeSection = (idx: number) => {
    onChange(sections.filter((_, i) => i !== idx));
  };

  const updateSection = (idx: number, field: keyof SectionFormData, value: string | boolean | number) => {
    const updated = [...sections];
    (updated[idx] as Record<string, unknown>)[field] = value;
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Sidebar Sections</h3>
        <Button type="button" size="sm" variant="secondary" onClick={addSection}>
          + Add Section
        </Button>
      </div>

      {sections.length === 0 && (
        <p className="text-sm text-gray-400 border border-dashed border-gray-300 rounded-lg p-4 text-center">
          No sidebar sections yet. Add one above.
        </p>
      )}

      {sections.map((section, idx) => (
        <div key={idx} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-gray-500 bg-gray-200 rounded-full px-2 py-0.5">
              Section {idx + 1}
            </span>
            <button
              type="button"
              onClick={() => removeSection(idx)}
              className="text-red-400 hover:text-red-600 text-sm"
            >
              Remove
            </button>
          </div>

          <Input
            label="Label"
            value={section.label}
            onChange={(e) => updateSection(idx, "label", e.target.value)}
            placeholder="e.g. Introduction"
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Content</label>
            <textarea
              value={section.content_html}
              onChange={(e) => updateSection(idx, "content_html", e.target.value)}
              rows={4}
              placeholder="HTML content for this section. You can use [[media:N]] tags."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono"
            />
            <p className="text-xs text-gray-400">Use [[media:N]] to embed interactive media triggers</p>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={section.is_expanded_default}
              onChange={(e) => updateSection(idx, "is_expanded_default", e.target.checked)}
              className="rounded"
            />
            Expanded by default
          </label>
        </div>
      ))}
    </div>
  );
}

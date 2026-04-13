"use client";
import { SidePanelSection, MediaMapEntry } from "@/types/api";
import AccordionSection from "./AccordionSection";

interface AccordionSidebarProps {
  sections: SidePanelSection[];
  mediaMap: Record<string, MediaMapEntry>;
}

export default function AccordionSidebar({ sections, mediaMap }: AccordionSidebarProps) {
  if (!sections.length) return null;

  return (
    <aside className="w-full">
      <h2 className="text-base font-bold text-gray-900 mb-3 px-1">Quick Reference</h2>
      <div className="space-y-2">
        {sections.map((section) => (
          <AccordionSection key={section.id} section={section} mediaMap={mediaMap} />
        ))}
      </div>
    </aside>
  );
}

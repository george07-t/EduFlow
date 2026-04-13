"use client";
import { useState, useRef } from "react";
import { SidePanelSection, MediaMapEntry } from "@/types/api";
import { resolveMediaTriggers } from "@/lib/utils/triggerParser";
import { useModalStore } from "@/lib/store/modalStore";
import { useEffect } from "react";

interface AccordionSectionProps {
  section: SidePanelSection;
  mediaMap: Record<string, MediaMapEntry>;
}

export default function AccordionSection({ section, mediaMap }: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(section.is_expanded_default);
  const contentRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const openModal = useModalStore((s) => s.openModal);

  const resolvedHtml = resolveMediaTriggers(section.content_html, mediaMap);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const handler = (e: MouseEvent) => {
      const trigger = (e.target as HTMLElement).closest(".interactive-trigger");
      if (!trigger) return;
      const mediaId = (trigger as HTMLElement).dataset.mediaId;
      if (mediaId && mediaMap[mediaId]) openModal(mediaMap[mediaId]);
    };
    body.addEventListener("click", handler);
    return () => body.removeEventListener("click", handler);
  }, [mediaMap, openModal]);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-gray-800 text-sm">{section.label}</span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? "1000px" : "0" }}
      >
        <div
          ref={bodyRef}
          className="p-4 bg-gray-50 border-t border-gray-200 prose prose-sm max-w-none prose-p:text-gray-600"
          dangerouslySetInnerHTML={{ __html: resolvedHtml }}
        />
      </div>
    </div>
  );
}

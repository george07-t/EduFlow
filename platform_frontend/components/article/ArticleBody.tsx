"use client";
import { useEffect, useRef } from "react";
import { MediaMapEntry } from "@/types/api";
import { resolveMediaTriggers } from "@/lib/utils/triggerParser";
import { useModalStore } from "@/lib/store/modalStore";

interface ArticleBodyProps {
  html: string;
  mediaMap: Record<string, MediaMapEntry>;
}

export default function ArticleBody({ html, mediaMap }: ArticleBodyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const openModal = useModalStore((s) => s.openModal);

  const resolvedHtml = resolveMediaTriggers(html, mediaMap);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const clickHandler = (e: MouseEvent) => {
      const trigger = (e.target as HTMLElement).closest(".interactive-trigger");
      if (!trigger) return;
      const mediaId = (trigger as HTMLElement).dataset.mediaId;
      if (mediaId && mediaMap[mediaId]) {
        openModal(mediaMap[mediaId]);
      }
    };

    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        const trigger = (e.target as HTMLElement).closest(".interactive-trigger");
        if (!trigger) return;
        const mediaId = (trigger as HTMLElement).dataset.mediaId;
        if (mediaId && mediaMap[mediaId]) {
          e.preventDefault();
          openModal(mediaMap[mediaId]);
        }
      }
    };

    container.addEventListener("click", clickHandler);
    container.addEventListener("keydown", keyHandler);
    return () => {
      container.removeEventListener("click", clickHandler);
      container.removeEventListener("keydown", keyHandler);
    };
  }, [mediaMap, openModal]);

  return (
    <div
      ref={containerRef}
      className="article-body prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600"
      dangerouslySetInnerHTML={{ __html: resolvedHtml }}
    />
  );
}

"use client";

import { ArticleMultimediaContent } from "@/types/api";
import { useMemo } from "react";
import { useModalStore } from "@/lib/store/modalStore";

interface MultimediaContentsSectionProps {
  contents: ArticleMultimediaContent[];
}

const DISPLAY_ORDER = ["text", "image", "audio", "local_video", "youtube"] as const;

const LABELS: Record<string, string> = {
  text: "Text",
  image: "Image",
  audio: "Audio",
  local_video: "Video",
  youtube: "YouTube",
};

const STYLES: Record<string, string> = {
  text: "bg-slate-100 text-slate-800 border-slate-300",
  image: "bg-emerald-100 text-emerald-800 border-emerald-300",
  audio: "bg-amber-100 text-amber-800 border-amber-300",
  local_video: "bg-rose-100 text-rose-800 border-rose-300",
  youtube: "bg-red-100 text-red-800 border-red-300",
};

export default function MultimediaContentsSection({ contents }: MultimediaContentsSectionProps) {
  const openModal = useModalStore((s) => s.openModal);

  const grouped = useMemo(() => {
    const source = [...contents].sort((a, b) => a.order - b.order);
    return DISPLAY_ORDER
      .map((type) => ({
        type,
        items: source.filter((item) => item.media.type === type),
      }))
      .filter((group) => group.items.length > 0);
  }, [contents]);

  if (!grouped.length) return null;

  return (
    <section className="mt-6 rounded-2xl border border-gray-200 bg-gradient-to-br from-slate-50 to-white p-4 sm:p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Multimedia Contents</h2>
          <p className="text-sm text-gray-500">Open an item to view it in the modal.</p>
        </div>
        <span className="text-xs text-gray-400">{grouped.length} types</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {grouped.map((group) => (
          <div key={group.type} className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="font-medium text-gray-800 text-sm sm:text-base">{LABELS[group.type]}</h3>
              <span className={`text-[11px] px-2 py-0.5 rounded-full border ${STYLES[group.type]}`}>
                {group.items.length}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openModal(item.media)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-left bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${group.type === "text" ? "bg-slate-400" : group.type === "image" ? "bg-emerald-400" : group.type === "audio" ? "bg-amber-400" : group.type === "local_video" ? "bg-rose-400" : "bg-red-400"}`} />
                  {item.media.title}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

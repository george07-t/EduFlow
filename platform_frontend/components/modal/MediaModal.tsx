"use client";
import { useEffect, useRef } from "react";
import FocusTrap from "focus-trap-react";
import { useModalStore } from "@/lib/store/modalStore";
import { MediaMapEntry } from "@/types/api";
import YoutubeRenderer from "./renderers/YoutubeRenderer";
import AudioRenderer from "./renderers/AudioRenderer";
import ImageRenderer from "./renderers/ImageRenderer";
import VideoRenderer from "./renderers/VideoRenderer";
import TextRenderer from "./renderers/TextRenderer";

function renderMedia(payload: MediaMapEntry) {
  switch (payload.type) {
    case "youtube":
      return <YoutubeRenderer url={payload.url || ""} />;
    case "audio":
      return <AudioRenderer url={payload.url || ""} title={payload.title} />;
    case "image":
      return <ImageRenderer url={payload.url || ""} alt={payload.alt_text} title={payload.title} />;
    case "local_video":
      return <VideoRenderer url={payload.url || ""} />;
    case "text":
      return <TextRenderer content={payload.content || "<p>No content available.</p>"} />;
    default:
      return <p className="text-gray-500">Unsupported media type: {payload.type}</p>;
  }
}

export default function MediaModal() {
  const { isOpen, payload, closeModal } = useModalStore();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, closeModal]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen || !payload) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-live="polite">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />

      <FocusTrap
        focusTrapOptions={{
          clickOutsideDeactivates: true,
          onDeactivate: closeModal,
        }}
      >
        <div
          ref={dialogRef}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-modal-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <h2 id="modal-title" className="text-lg font-semibold text-gray-900 truncate pr-4">
              {payload.title}
            </h2>
            <button
              onClick={closeModal}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {renderMedia(payload)}
          </div>
        </div>
      </FocusTrap>
    </div>
  );
}

"use client";
import { useState } from "react";

export default function ImageRenderer({ url, alt, title }: { url: string; alt?: string; title: string }) {
  const [zoomed, setZoomed] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div
        className={`relative overflow-hidden rounded-lg cursor-zoom-in transition-transform ${zoomed ? "cursor-zoom-out" : ""}`}
        onClick={() => setZoomed(!zoomed)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={alt || title}
          className={`w-full h-auto rounded-lg transition-transform duration-300 ${zoomed ? "scale-150" : "scale-100"}`}
          style={{ maxHeight: "70vh", objectFit: "contain" }}
        />
      </div>
      {alt && <p className="text-sm text-gray-500 text-center italic">{alt}</p>}
    </div>
  );
}

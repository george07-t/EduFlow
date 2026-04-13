"use client";
import { extractYouTubeId } from "@/lib/utils/triggerParser";

export default function YoutubeRenderer({ url }: { url: string }) {
  const videoId = extractYouTubeId(url);
  if (!videoId) return <p className="text-gray-500">Invalid YouTube URL</p>;

  return (
    <div className="aspect-video w-full">
      <iframe
        className="w-full h-full rounded-lg"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

"use client";
import { useRef, useEffect } from "react";

export default function VideoRenderer({ url }: { url: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => {
      if (videoRef.current) videoRef.current.pause();
    };
  }, []);

  return (
    <div className="aspect-video w-full">
      <video
        ref={videoRef}
        controls
        src={url}
        className="w-full h-full rounded-lg"
        preload="metadata"
      >
        Your browser does not support the video element.
      </video>
    </div>
  );
}

"use client";
import { useRef, useEffect } from "react";

export default function AudioRenderer({ url, title }: { url: string; title: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
        <span className="text-4xl">🎵</span>
      </div>
      <p className="text-gray-700 font-medium">{title}</p>
      <audio
        ref={audioRef}
        controls
        src={url}
        className="w-full"
        style={{ maxWidth: "400px" }}
      >
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}

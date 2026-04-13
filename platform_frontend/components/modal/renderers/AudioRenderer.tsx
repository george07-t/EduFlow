"use client";
import { useRef, useEffect } from "react";

export default function AudioRenderer({ url, title }: { url: string; title: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const currentAudio = audioRef.current;
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 py-6">
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

"use client";
import { useState, useEffect } from "react";
import { mediaApi } from "@/lib/api/media";
import { MediaAsset } from "@/types/api";
import Skeleton from "@/components/ui/Skeleton";
import Input from "@/components/ui/Input";

interface MediaPickerProps {
  onSelect: (asset: MediaAsset) => void;
  onClose: () => void;
}

const TYPE_ICONS: Record<string, string> = {
  image: "🖼️", audio: "🎵", local_video: "🎬", youtube: "▶️", text: "📄",
};

export default function MediaPicker({ onSelect, onClose }: MediaPickerProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchMedia = async (q?: string) => {
    setLoading(true);
    try {
      const res = await mediaApi.list({ search: q, per_page: 50 });
      setAssets(res.data.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMedia(); }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchMedia(search || undefined), 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-900">Select Media Asset</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="p-4 border-b">
          <Input
            placeholder="Search media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} height={80} />
              ))}
            </div>
          ) : assets.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No media assets found</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => onSelect(asset)}
                  className="flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                >
                  <span className="text-3xl">{TYPE_ICONS[asset.type] || "📎"}</span>
                  <span className="text-xs text-gray-700 font-medium text-center line-clamp-2">{asset.title}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{asset.type}</span>
                  <span className="text-xs text-gray-400">ID: {asset.id}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

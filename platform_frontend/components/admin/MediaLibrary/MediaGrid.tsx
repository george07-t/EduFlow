"use client";
import { useState, useEffect, useCallback } from "react";
import { mediaApi } from "@/lib/api/media";
import { MediaAsset } from "@/types/api";
import Skeleton from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { toast } from "react-toastify";

const TYPES = ["all", "image", "audio", "local_video", "youtube", "text"];

interface MediaGridProps {
  refreshKey: number;
}

export default function MediaGrid({ refreshKey }: MediaGridProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await mediaApi.list({
        type: typeFilter === "all" ? undefined : typeFilter,
        search: search || undefined,
        page,
        per_page: 12,
      });
      setAssets(res.data.items);
      setTotalPages(res.data.pages);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, search, page]);

  useEffect(() => { fetch(); }, [fetch, refreshKey]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this media asset?")) return;
    try {
      await mediaApi.delete(id);
      toast.success("Media deleted");
      fetch();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <div className="flex gap-1 flex-wrap">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => { setTypeFilter(t); setPage(1); }}
              className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors
                ${typeFilter === t ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {t === "all" ? "All" : t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} height={120} />)}
        </div>
      ) : assets.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No media assets found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {assets.map((asset) => (
            <div key={asset.id} className="border border-gray-200 rounded-xl p-3 bg-white hover:shadow-sm transition-shadow group">
              {asset.type === "image" && asset.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={asset.url} alt={asset.alt_text || asset.title} className="w-full h-24 object-cover rounded-lg mb-2" />
              ) : (
                <div className="w-full h-24 bg-gray-50 rounded-lg flex items-center justify-center mb-2 text-xs text-gray-600 font-medium uppercase tracking-wide">
                  {asset.type.replace("_", " ")}
                </div>
              )}
              <p className="text-xs font-medium text-gray-800 truncate" title={asset.title}>{asset.title}</p>
              <p className="text-xs text-gray-400">ID: {asset.id} | {asset.type}</p>
              <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDelete(asset.id)}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center gap-2 justify-center pt-2">
          <Button size="sm" variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm text-gray-600">{page} / {totalPages}</span>
          <Button size="sm" variant="secondary" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { mediaApi } from "@/lib/api/media";
import { MediaAsset } from "@/types/api";

export interface MultimediaContentFormData {
  media_asset_id: number;
  order: number;
}

interface MultimediaContentsEditorProps {
  value: MultimediaContentFormData[];
  onChange: (value: MultimediaContentFormData[]) => void;
}

const TYPE_ORDER = ["text", "image", "audio", "local_video", "youtube"] as const;

const TYPE_LABELS: Record<string, string> = {
  text: "Text",
  image: "Image",
  audio: "Audio",
  local_video: "Video",
  youtube: "YouTube",
};

export default function MultimediaContentsEditor({ value, onChange }: MultimediaContentsEditorProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const selectedByType = useMemo(() => {
    const lookup: Record<string, number | ""> = {
      text: "",
      image: "",
      audio: "",
      local_video: "",
      youtube: "",
    };

    for (const item of value) {
      const asset = assets.find((a) => a.id === item.media_asset_id);
      if (asset && lookup[asset.type] === "") {
        lookup[asset.type] = asset.id;
      }
    }

    return lookup;
  }, [assets, value]);

  useEffect(() => {
    const loadAssets = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const firstPage = await mediaApi.list({ page: 1, per_page: 100 });
        const allAssets = [...firstPage.data.items];
        const totalPages = firstPage.data.pages ?? 1;

        for (let page = 2; page <= totalPages; page += 1) {
          const nextPage = await mediaApi.list({ page, per_page: 100 });
          allAssets.push(...nextPage.data.items);
        }

        setAssets(allAssets);
      } catch {
        setLoadError("Could not load media assets. Please refresh or open Media Library and try again.");
        setAssets([]);
      } finally {
        setLoading(false);
      }
    };

    loadAssets();
  }, []);

  const updateTypeSelection = (type: string, mediaIdRaw: string) => {
    const mediaId = mediaIdRaw ? parseInt(mediaIdRaw, 10) : null;
    const nextMap = { ...selectedByType, [type]: mediaId || "" };
    const nextValue: MultimediaContentFormData[] = [];

    TYPE_ORDER.forEach((t, idx) => {
      const selected = nextMap[t];
      if (selected && Number.isInteger(selected)) {
        nextValue.push({ media_asset_id: selected as number, order: idx });
      }
    });

    onChange(nextValue);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">Multimedia Contents</h2>
          <p className="text-sm text-gray-600 mt-1">
            Choose one existing asset for each media type. If you need to add a new one, open Media Library first.
          </p>
          <p className="mt-2 text-xs text-gray-600">
            Steps: 1) Open Media Library 2) Upload/create media 3) Return here and select from the dropdown.
          </p>
        </div>
        <Link
          href="/admin/media"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Open Media Library
        </Link>
      </div>

      {loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      ) : null}

      {TYPE_ORDER.map((type) => {
        const options = assets.filter((asset) => asset.type === type);
        return (
          <div key={type} className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium text-gray-700">{TYPE_LABELS[type]}</label>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                {options.length} available
              </span>
            </div>

            <div>
              <select
                disabled={loading}
                value={selectedByType[type]}
                onChange={(e) => updateTypeSelection(type, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">None</option>
                {options.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.title}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <p className="text-xs text-gray-400">Loading assets...</p>
            ) : options.length === 0 ? (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                No {TYPE_LABELS[type].toLowerCase()} assets yet. Add one in Media Library, then select it here.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {options.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => updateTypeSelection(type, asset.id.toString())}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      selectedByType[type] === asset.id
                        ? "border-blue-300 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-white hover:border-gray-300"
                    }`}
                  >
                    {asset.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

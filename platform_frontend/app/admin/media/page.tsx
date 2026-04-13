"use client";
import { useState } from "react";
import Button from "@/components/ui/Button";
import MediaGrid from "@/components/admin/MediaLibrary/MediaGrid";
import MediaUploadForm from "@/components/admin/MediaLibrary/MediaUploadForm";

export default function MediaPage() {
  const [showUpload, setShowUpload] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
        <Button onClick={() => setShowUpload(!showUpload)}>
          {showUpload ? "Cancel" : "Upload Media"}
        </Button>
      </div>

      {showUpload && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Upload New Media</h2>
          <MediaUploadForm
            onSuccess={() => { setShowUpload(false); setRefreshKey(k => k + 1); }}
            onCancel={() => setShowUpload(false)}
          />
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <MediaGrid refreshKey={refreshKey} />
      </div>
    </div>
  );
}

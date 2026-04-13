"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { mediaApi } from "@/lib/api/media";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { toast } from "react-toastify";

interface MediaUploadFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const MEDIA_TYPES = [
  { value: "image", label: "Image" },
  { value: "audio", label: "Audio" },
  { value: "local_video", label: "Local Video" },
  { value: "youtube", label: "YouTube" },
  { value: "text", label: "Text" },
];

export default function MediaUploadForm({ onSuccess, onCancel }: MediaUploadFormProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("image");
  const [url, setUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept:
      type === "image" ? { "image/*": [] }
      : type === "audio" ? { "audio/*": [] }
      : type === "local_video" ? { "video/*": [] }
      : {},
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) { toast.error("Title is required"); return; }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("type", type);
    if (altText) formData.append("alt_text", altText);

    if (type === "youtube") {
      if (!url) { toast.error("YouTube URL is required"); return; }
      formData.append("url", url);
    } else if (type === "text") {
      if (!content) { toast.error("Content is required"); return; }
      formData.append("content", content);
    } else {
      if (!file) { toast.error("Please select a file"); return; }
      formData.append("file", file);
    }

    setLoading(true);
    try {
      await mediaApi.upload(formData);
      toast.success("Media uploaded successfully");
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Upload failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Title *" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Asset title" required />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Type *</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {MEDIA_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {type === "youtube" && (
        <Input label="YouTube URL *" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
      )}

      {type === "text" && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Content *</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            placeholder="Enter HTML content..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        </div>
      )}

      {!["youtube", "text"].includes(type) && (
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">File *</label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
              ${isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}
          >
            <input {...getInputProps()} />
            {file ? (
              <p className="text-sm text-green-600 font-medium">Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
            ) : (
              <p className="text-sm text-gray-500">
                {isDragActive ? "Drop it here..." : "Drag & drop or click to select file"}
              </p>
            )}
          </div>
        </div>
      )}

      <Input label="Alt Text / Description" value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="Accessibility description" />

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading}>Upload</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

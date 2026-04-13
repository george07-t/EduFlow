import { MediaMapEntry } from "@/types/api";

const TRIGGER_REGEX = /\[\[media:(\d+)\]\]/g;

export function getMediaIcon(type: string): string {
  switch (type) {
    case "image": return "🖼️";
    case "audio": return "🎵";
    case "local_video": return "🎬";
    case "youtube": return "▶️";
    case "text": return "📄";
    default: return "📎";
  }
}

export function resolveMediaTriggers(
  html: string,
  mediaMap: Record<string, MediaMapEntry>
): string {
  if (!html) return "";
  return html.replace(TRIGGER_REGEX, (match, id) => {
    const asset = mediaMap[id];
    if (!asset) return match;
    const icon = getMediaIcon(asset.type);
    return `<span
      class="interactive-trigger"
      data-media-id="${id}"
      data-media-type="${asset.type}"
      role="button"
      tabindex="0"
      aria-label="Open ${asset.title}"
      title="${asset.title}"
    >${icon} <span class="trigger-label">${asset.title}</span></span>`;
  });
}

export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

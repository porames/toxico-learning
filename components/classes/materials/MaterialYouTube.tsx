import type { ReactNode } from "react";
import MaterialBadge from "./MaterialBadge";
import { materialTypeLabel } from "./utils";

interface MaterialYouTubeProps {
  icon: ReactNode;
  title: string;
  type: string;
  bg: string;
  text: string;
  url: string;
}

function parseYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/
  );
  return match ? match[1] : null;
}

export default function MaterialYouTube({
  icon,
  title,
  type,
  bg,
  text: textColor,
  url,
}: MaterialYouTubeProps) {
  const videoId = parseYouTubeId(url);
  const embedSrc = videoId
    ? `https://www.youtube.com/embed/${videoId}`
    : url;

  return (
    <div className="overflow-hidden rounded-lg border border-ink-900/8 bg-white shadow">
      <div className="flex items-center gap-2 border-b border-ink-900/8 px-3 py-2">
        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${bg} ${textColor}`}>
          {icon}
        </div>
        <p className="truncate text-sm font-medium text-ink-900">{title}</p>
        <MaterialBadge label={materialTypeLabel(type)} bg={bg} text={textColor} />
      </div>
      <div className="aspect-video">
        <iframe
          src={embedSrc}
          className="h-full w-full"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

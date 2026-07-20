import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import MaterialBadge from "./MaterialBadge";
import { materialTypeLabel, getFileNameFromUrl } from "./utils";

interface MaterialLinkProps {
  icon: ReactNode;
  title: string;
  type: string;
  bg: string;
  text: string;
  url: string;
}

export default function MaterialLink({
  icon,
  title,
  type,
  bg,
  text: textColor,
  url,
}: MaterialLinkProps) {
  const subtitle =
    type === "link" || type === "pdf"
      ? url
      : getFileNameFromUrl(url);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-md border border-ink-900/8 bg-white shadow px-3 py-2.5 transition-colors hover:bg-ink-900/5"
    >
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${bg} ${textColor}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-ink-900">{title}</p>
          <MaterialBadge label={materialTypeLabel(type)} bg={bg} text={textColor} />
        </div>
        <p className="truncate text-xs text-ink-900/40">{subtitle}</p>
      </div>
      <ExternalLink
        size={14}
        className="shrink-0 text-ink-900/30 opacity-0 transition-opacity group-hover:opacity-100"
      />
    </a>
  );
}

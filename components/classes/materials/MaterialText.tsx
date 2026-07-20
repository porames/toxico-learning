import type { ReactNode } from "react";
import MaterialBadge from "./MaterialBadge";
import { materialTypeLabel } from "./utils";

interface MaterialTextProps {
  icon: ReactNode;
  title: string;
  type: string;
  bg: string;
  text: string;
  value?: string;
}

export default function MaterialText({
  icon,
  title,
  type,
  bg,
  text: textColor,
  value,
}: MaterialTextProps) {
  return (
    <div className="group flex items-start gap-3 rounded-md border border-ink-900/8 bg-white shadow px-3 py-2.5">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${bg} ${textColor}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-ink-900">{title}</p>
          <MaterialBadge label={materialTypeLabel(type)} bg={bg} text={textColor} />
        </div>
        <p className="mt-1 whitespace-pre-wrap text-xs text-ink-900/70">
          {value || "No content"}
        </p>
      </div>
    </div>
  );
}

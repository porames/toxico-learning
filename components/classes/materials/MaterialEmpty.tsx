import type { ReactNode } from "react";
import MaterialBadge from "./MaterialBadge";
import { materialTypeLabel } from "./utils";

interface MaterialEmptyProps {
  icon: ReactNode;
  title: string;
  type: string;
  bg: string;
  text: string;
}

export default function MaterialEmpty({
  icon,
  title,
  type,
  bg,
  text: textColor,
}: MaterialEmptyProps) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-ink-900/8 bg-white shadow px-3 py-2.5">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${bg} ${textColor}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-ink-900">{title}</p>
          <MaterialBadge label={materialTypeLabel(type)} bg={bg} text={textColor} />
        </div>
      </div>
    </div>
  );
}

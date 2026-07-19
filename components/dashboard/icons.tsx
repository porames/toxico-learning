import type { MaterialType } from "./types";

type IconProps = { className?: string };

export function ChevronIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PersonIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  );
}

export function FolderIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 6a2 2 0 0 1 2-2h4.5l2 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z" />
    </svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlayIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
    </svg>
  );
}

export function PdfIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
      <path d="M14 3v4h4" strokeLinejoin="round" />
    </svg>
  );
}

export function LinkIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M9.5 14.5 14.5 9.5M8 17H6a4 4 0 0 1 0-8h2m8 0h2a4 4 0 0 1 0 8h-2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function QuizIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M9.5 12.5 12 15l4-4" />
    </svg>
  );
}

export function TextIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 6h14M5 12h14M5 18h9" strokeLinecap="round" />
    </svg>
  );
}

export const MATERIAL_ICON: Record<MaterialType, (p: IconProps) => JSX.Element> = {
  youtube: PlayIcon,
  pdf: PdfIcon,
  link: LinkIcon,
  text: TextIcon,
  file: PdfIcon,
  video: PlayIcon,
  quiz: QuizIcon
};

export const MATERIAL_COLOR: Record<MaterialType, { text: string; bg: string; ring: string }> = {
  youtube: { text: "text-mesh-pink", bg: "bg-mesh-pink/10", ring: "ring-mesh-pink/25" },
  pdf: { text: "text-mesh-amber", bg: "bg-mesh-amber/10", ring: "ring-mesh-amber/25" },
  link: { text: "text-mesh-blue", bg: "bg-mesh-blue/10", ring: "ring-mesh-blue/25" },
  text: { text: "text-mesh-teal", bg: "bg-mesh-teal/10", ring: "ring-mesh-teal/25" },
  file: { text: "text-mesh-sky", bg: "bg-mesh-sky/10", ring: "ring-mesh-sky/25" },
  video: { text: "text-rose-500", bg: "bg-rose-500/10", ring: "ring-rose-500/25" },
  quiz: { text: "text-iris-600", bg: "bg-iris-500/10", ring: "ring-iris-500/25" },
};

interface MaterialBadgeProps {
  label: string;
  bg: string;
  text: string;
}

export default function MaterialBadge({ label, bg, text }: MaterialBadgeProps) {
  return (
    <span
      className={`shrink-0 rounded-full ${bg} ${text} px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide`}
    >
      {label}
    </span>
  );
}

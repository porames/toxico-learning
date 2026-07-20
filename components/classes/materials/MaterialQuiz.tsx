import { type ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import MaterialBadge from "./MaterialBadge";
import { materialTypeLabel } from "./utils";
import moment from "moment";

interface MaterialQuizProps {
  icon: ReactNode;
  title: string;
  type: string;
  bg: string;
  text: string;
  quizId: string;
  requiredPostTest?: boolean;
  attempt?: { passed: boolean; completedAt: Date | null };
  onStartQuiz: (quizId: string) => void;
}

export default function MaterialQuiz({
  icon,
  title,
  type,
  bg,
  text: textColor,
  quizId,
  requiredPostTest,
  attempt,
  onStartQuiz,
}: MaterialQuizProps) {
  return (
    <button
      onClick={() => onStartQuiz(quizId)}
      className={`group flex w-full items-center gap-3 rounded-md border bg-white shadow px-3 py-2.5 transition-colors hover:bg-ink-900/5 text-left ${
        attempt
          ? attempt.passed
            ? "border-emerald-300"
            : "border-red-300"
          : "border-ink-900/8"
      }`}
    >
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${bg} ${textColor}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-ink-900">{title}</p>
          <MaterialBadge label={materialTypeLabel(type)} bg={bg} text={textColor} />
          {requiredPostTest && (
            <span className="shrink-0 rounded-full bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-600 uppercase tracking-wide">
              Required
            </span>
          )}
          {attempt?.passed && (
            <span className="shrink-0 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 uppercase tracking-wide">
              Passed
            </span>
          )}
          {attempt && !attempt.passed && (
            <span className="shrink-0 rounded-full bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-600 uppercase tracking-wide">
              Failed
            </span>
          )}
        </div>
        <p className={`text-xs ${
          attempt
            ? attempt.passed
              ? "text-emerald-600"
              : "text-red-500"
            : "text-ink-900/40"
        }`}>
          {attempt
            ? attempt.passed
              ? `✓ Passed${attempt.completedAt ? ` ${moment(attempt.completedAt).format("MMM D, YYYY")}` : ""}`
              : `Failed · ${attempt.completedAt ? moment(attempt.completedAt).format("MMM D, YYYY") : ""}`
            : "Click to take quiz"}
        </p>
      </div>
      <ExternalLink
        size={14}
        className="shrink-0 text-ink-900/30 opacity-0 transition-opacity group-hover:opacity-100"
      />
    </button>
  );
}

"use client"

import type { CaseData } from "./types";

export function HistoryPanel({ data }: { data: CaseData }) {
    return (
        <div>
            <p className="text-xs text-ink-400 mb-3">Patient history and background:</p>
            <div className="space-y-3">
                <div className="rounded-lg border border-ink-900/8 bg-white p-3.5 space-y-2">
                    <div className="flex items-center gap-3 text-xs">
                        <span className="font-mono font-semibold text-ink-400 w-16 shrink-0">Age</span>
                        <span className="text-ink-900">{data.age || "—"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                        <span className="font-mono font-semibold text-ink-400 w-16 shrink-0">Sex</span>
                        <span className="text-ink-900">{data.sex || "—"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                        <span className="font-mono font-semibold text-ink-400 w-16 shrink-0">Complaint</span>
                        <span className="text-ink-900">{data.chiefComplaint || "—"}</span>
                    </div>
                </div>

                <div className="rounded-lg border border-ink-900/8 bg-white p-3.5">
                    <h4 className="text-[11px] font-mono font-semibold tracking-wider text-ink-500 uppercase mb-1.5">
                        Background
                    </h4>
                    <p className="text-xs text-ink-700 leading-relaxed whitespace-pre-wrap">
                        {data.background || "No background information available."}
                    </p>
                </div>
            </div>
        </div>
    );
}

"use client"

import { useMemo, useState } from "react";
import type { ExamFinding } from "./types";

const EXAM_SYSTEMS_SHORT = ["GA", "HEENT", "CVS", "RS", "Abdominal", "CNS", "Skin"] as const;

const EXAM_LABELS: Record<string, string> = {
    GA: "General Appearance",
    HEENT: "HEENT",
    CVS: "Cardiovascular",
    RS: "Respiratory",
    Abdominal: "Abdominal",
    CNS: "Neurological",
    Skin: "Extremities / Skin",
};

const EXAM_DB_MAP: Record<string, string> = {
    GA: "General appearance",
    HEENT: "HEENT",
    CVS: "Cardiovascular",
    RS: "Respiratory",
    Abdominal: "Abdominal",
    CNS: "Neurological",
    Skin: "Extremities / Skin",
};

const DEFAULT_EXAM_FINDINGS: Record<string, ExamFinding> = {
    GA: { id: "default-ga", system: "General appearance", finding: "Well-appearing, no acute distress", abnormal: false },
    HEENT: { id: "default-heent", system: "HEENT", finding: "Normocephalic, mucous membranes moist", abnormal: false },
    CVS: { id: "default-cvs", system: "Cardiovascular", finding: "Regular rate and rhythm, no murmurs", abnormal: false },
    RS: { id: "default-rs", system: "Respiratory", finding: "Clear to auscultation bilaterally", abnormal: false },
    Abdominal: { id: "default-abdominal", system: "Abdominal", finding: "Soft, non-tender, non-distended", abnormal: false },
    CNS: { id: "default-cns", system: "Neurological", finding: "Alert and oriented x3, grossly intact", abnormal: false },
    Skin: { id: "default-skin", system: "Extremities / Skin", finding: "Warm and dry, no rash or edema", abnormal: false },
};

export function ExamPanel({
    findings,
    onRequest,
    requestedSystems,
}: {
    findings: ExamFinding[];
    onRequest: (sys: string) => void;
    requestedSystems: Set<string>;
}) {
    const [expandedSystems, setExpandedSystems] = useState<Set<string>>(new Set());

    const toggleExpand = (sys: string) => {
        setExpandedSystems((prev) => {
            const next = new Set(prev);
            if (next.has(sys)) next.delete(sys);
            else next.add(sys);
            return next;
        });
    };

    const findingsBySystem = useMemo(() => {
        const map = new Map<string, ExamFinding[]>();
        for (const f of findings) {
            const arr = map.get(f.system) || [];
            arr.push(f);
            map.set(f.system, arr);
        }
        return map;
    }, [findings]);

    return (
        <div style={{ minWidth: 400 }}>
            <p className="text-xs text-ink-400 mb-3">Select a system to examine:</p>
            <div className="flex flex-col gap-2">
                {EXAM_SYSTEMS_SHORT.map((sys) => {
                    const examined = requestedSystems.has(sys);
                    const expanded = expandedSystems.has(sys);
                    const sysFindings = findingsBySystem.get(EXAM_DB_MAP[sys]) || [];
                    return (
                        <div key={sys} className="rounded-lg border border-ink-900/8 bg-white overflow-hidden">
                            <button
                                onClick={() => {
                                    if (!examined) onRequest(sys);
                                    toggleExpand(sys);
                                }}
                                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${expanded
                                    ? "bg-iris-50 text-iris-700"
                                    : "bg-white text-ink-700 hover:bg-iris-50"
                                    }`}
                            >
                                <span>
                                    {sys}
                                    {examined && <span className="ml-1.5 text-[10px] text-emerald-600">✓</span>}
                                </span>
                                {examined && (
                                    <span className="text-[10px] text-ink-400 font-mono">{expanded ? "▲" : "▼"}</span>
                                )}
                            </button>
                            {expanded && examined && (
                                <div className="px-3.5 pb-3 pt-1 space-y-1.5">
                                    {(() => {
                                        const findings = sysFindings.length > 0
                                            ? sysFindings
                                            : [DEFAULT_EXAM_FINDINGS[sys]];
                                        return findings.map((f) => (
                                            <div key={f.id} className="flex items-center gap-2.5 text-sm">
                                                <span className="text-ink-700">{f.finding}</span>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

"use client"

import { useMemo } from "react";
import { IMAGING_LIBRARY, IMAGING_COSTS } from "./database";
import type { Investigation } from "./types";

function formatCost(sec: number): string {
    if (sec >= 60) return `${Math.floor(sec / 60)}m`;
    return `${sec}s`;
}

export function ImagingPanel({
    caseInvestigations,
    requestedTests,
    onRequestBundle,
    onViewResult,
}: {
    caseInvestigations: Investigation[];
    requestedTests: Set<string>;
    onRequestBundle: (testNames: string[], cost: number, bundleName?: string) => void;
    onViewResult: (inv: Investigation) => void;
}) {
    const caseImagingByName = useMemo(
        () => new Map(caseInvestigations.filter((i) => i.kind === "imaging").map((i) => [i.name, i])),
        [caseInvestigations],
    );

    return (
        <div>
            <p className="text-xs text-ink-400 mb-3">Order an imaging study:</p>
            <div className="flex flex-col gap-2">
                {IMAGING_LIBRARY.map((name) => {
                    const requested = requestedTests.has(name);
                    const inv = caseImagingByName.get(name);
                    const cost = IMAGING_COSTS[name] ?? 60;

                    return (
                        <div key={name}>
                            {!requested ? (
                                <button
                                    onClick={() => onRequestBundle([name], cost)}
                                    className="w-full flex items-center justify-between rounded-lg border border-ink-900/8 bg-white px-3.5 py-2.5 text-xs font-semibold text-ink-700 hover:border-iris-300 hover:bg-iris-50 transition-colors cursor-pointer"
                                >
                                    <span>{name}</span>
                                    <span className="font-mono text-[10px] text-ink-400">−{formatCost(cost)}</span>
                                </button>
                            ) : (
                                <div className="rounded-lg border border-iris-300 bg-iris-50 overflow-hidden">
                                    <div className="flex items-center justify-between px-3.5 py-2.5">
                                        <span className="text-xs font-semibold text-iris-700">{name}</span>
                                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">✓ done</span>
                                    </div>
                                    <div className="border-t border-iris-200/50 px-3.5 py-2">
                                        <button
                                            onClick={() => onViewResult(inv ?? {
                                                id: name, kind: "imaging", category: "Imaging", name,
                                                unit: "", normalRange: "", value: "", abnormal: false, report: "Normal study",
                                            })}
                                            className="w-full flex items-center justify-center gap-1.5 rounded-md bg-white border border-iris-300 px-3 py-1.5 text-xs font-semibold text-iris-700 hover:bg-iris-100 transition-colors cursor-pointer"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                            View result
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

"use client"

import { useMemo } from "react";
import { IMAGING_LIBRARY, IMAGING_COSTS } from "./database";
import type { Investigation } from "./types";

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
            <p className="text-xs text-ink-400 mb-3 w-lg">Order an imaging study:</p>
            <div className="flex flex-wrap gap-2 flex-col">
                {IMAGING_LIBRARY.map((name) => {
                    const requested = requestedTests.has(name);
                    const inv = caseImagingByName.get(name);
                    return (
                        <div key={name} className="flex flex-col">
                            <button
                                onClick={() => !requested && onRequestBundle([name], IMAGING_COSTS[name] ?? 60)}
                                disabled={requested}
                                className={`flex justify-between rounded-lg border px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${requested
                                    ? "border-iris-300 bg-iris-50 text-iris-700"
                                    : "border-ink-900/8 bg-white text-ink-700 hover:border-iris-300 hover:bg-iris-50"
                                    }`}
                            >
                                <span>{name} </span>
                                <span>+{(IMAGING_COSTS[name] ?? 60) >= 60 ? `${Math.floor((IMAGING_COSTS[name] ?? 60) / 60)}m` : `${IMAGING_COSTS[name] ?? 60}s`}</span>
                            </button>
                            {requested && (
                                <button
                                    onClick={() => onViewResult(inv ?? { id: name, kind: "imaging", category: "Imaging", name, unit: "", normalRange: "", value: "", abnormal: false, report: "Normal study" })}
                                    className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold cursor-pointer ${inv && inv.abnormal ? "border-rose-200 bg-rose-50 text-rose-700" : "border-ink-900/8 bg-white text-ink-700 hover:bg-gray-100"
                                        }`}
                                >
                                    View result
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

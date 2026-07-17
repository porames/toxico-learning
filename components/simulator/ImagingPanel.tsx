"use client"

import { useMemo } from "react";
import { IMAGING_LIBRARY } from "./database";
import type { Investigation } from "./types";

export function ImagingPanel({
    caseInvestigations,
    requestedTests,
    onRequestBundle,
}: {
    caseInvestigations: Investigation[];
    requestedTests: Set<string>;
    onRequestBundle: (testNames: string[], cost: number) => void;
}) {
    const caseImagingByName = useMemo(
        () => new Map(caseInvestigations.filter((i) => i.kind === "imaging").map((i) => [i.name, i])),
        [caseInvestigations],
    );

    return (
        <div>
            <p className="text-xs text-ink-400 mb-3">Order an imaging study:</p>
            <div className="flex flex-wrap gap-2">
                {IMAGING_LIBRARY.map((name) => {
                    const requested = requestedTests.has(name);
                    const inv = caseImagingByName.get(name);
                    return (
                        <div key={name} className="flex flex-col">
                            <button
                                onClick={() => !requested && onRequestBundle([name], 60)}
                                disabled={requested}
                                className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${requested
                                    ? "border-iris-300 bg-iris-50 text-iris-700"
                                    : "border-ink-900/8 bg-white text-ink-700 hover:border-iris-300 hover:bg-iris-50"
                                    }`}
                            >
                                {name}
                            </button>
                            {requested && (
                                <div className={`mt-1 rounded-md border px-2.5 py-1.5 ${inv && inv.abnormal ? "border-rose-200 bg-rose-50" : "border-ink-900/8 bg-white"
                                    }`}>
                                    {inv ? (
                                        <>
                                            <p className="text-xs text-ink-700">{inv.report || "No report entered."}</p>
                                            {inv.imageUrl && (
                                                <img src={inv.imageUrl} alt={name} className="mt-1.5 max-w-40 max-h-28 rounded border border-ink-900/8" />
                                            )}
                                        </>
                                    ) : (
                                        <span className="font-mono text-sm font-semibold text-iris-700">Normal study</span>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

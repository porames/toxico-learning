"use client"

import { useRef, useMemo, useState } from "react";
import { LAB_LIBRARY, LAB_COSTS, OTHER_LAB_COSTS } from "./database";
import type { Investigation } from "./types";

function randRange(range: string): string {
    const t = range.trim();
    if (/^[a-z]/i.test(t) && !/^</.test(t)) return t;
    if (t.startsWith("<")) {
        const m = parseFloat(t.slice(1));
        return !isNaN(m) ? (Math.random() * m * 0.8).toFixed(1) : t;
    }
    const parts = t.split(/[–-]/);
    if (parts.length === 2) {
        const lo = parseFloat(parts[0]), hi = parseFloat(parts[1]);
        if (!isNaN(lo) && !isNaN(hi)) {
            const d = Math.max(
                parts[0].includes(".") ? parts[0].split(".")[1].length : 0,
                parts[1].includes(".") ? parts[1].split(".")[1].length : 0,
            );
            return (lo + Math.random() * (hi - lo)).toFixed(d);
        }
    }
    return t;
}

function formatCost(sec: number): string {
    if (sec >= 60) return `${Math.floor(sec / 60)}m`;
    return `${sec}s`;
}

export function InvestigationsPanel({
    caseInvestigations,
    requestedTests,
    onRequestBundle,
}: {
    caseInvestigations: Investigation[];
    requestedTests: Set<string>;
    onRequestBundle: (testNames: string[], cost: number) => void;
}) {
    const [showOther, setShowOther] = useState<boolean>(false);
    const normalCache = useRef<Map<string, string>>(new Map()).current;

    const caseLabByName = useMemo(
        () => new Map(caseInvestigations.filter((i) => i.kind === "lab").map((i) => [i.name, i])),
        [caseInvestigations],
    );

    const labCategories = Object.keys(LAB_LIBRARY);

    return (
        <div>
            <p className="text-xs text-ink-400 mb-3">Order a lab bundle to run all tests in that category:</p>
            <div className="flex flex-col gap-2 mb-4">
                {labCategories.map((cat) => {
                    const tests = LAB_LIBRARY[cat];
                    const cost = LAB_COSTS[cat] ?? 60;
                    const allRequested = tests.every((t) => requestedTests.has(t.name));
                    if (cat === "Other Labs") {
                        return (
                            <div key={cat} className="rounded-lg border border-ink-900/8 bg-white overflow-hidden">
                                <button
                                    onClick={() => setShowOther(!showOther)}
                                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold transition-colors cursor-pointer bg-white hover:bg-iris-50`}>
                                    <span>{cat}</span>
                                    <span className="text-[10px] text-ink-400 font-mono">{showOther ? "▲" : "▼"}</span>
                                </button>
                                {showOther && (
                                    <div className="flex flex-col gap-1.5 px-3.5 pb-3 pt-1">
                                        {tests.map((t) => {
                                            const req = requestedTests.has(t.name);
                                            const inv = caseLabByName.get(t.name);
                                            const displayValue = inv?.value
                                                || (normalCache.has(t.name)
                                                    ? normalCache.get(t.name)!
                                                    : (normalCache.set(t.name, randRange(t.normal)), normalCache.get(t.name)!));
                                            const cost = OTHER_LAB_COSTS[t.name] ?? 60;
                                            return (
                                                <div key={t.name}>
                                                    <button
                                                        onClick={() => !req && onRequestBundle([t.name], cost)}
                                                        disabled={req}
                                                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${req
                                                            ? "bg-iris-50 text-iris-700 border-iris-300"
                                                            : "bg-white text-ink-700 border-ink-900/8 hover:bg-iris-50"
                                                            }`}
                                                    >
                                                        <span>{t.name}</span>
                                                        <span className={`font-mono text-[10px] ${req ? "text-iris-500" : "text-ink-400"}`}>
                                                            {req ? "✓ done" : `−${formatCost(cost)}`}
                                                        </span>
                                                    </button>
                                                    {req && (
                                                        <div className="flex items-center justify-between px-3 py-1.5 text-xs">
                                                            <span className="text-ink-500">{t.name}</span>
                                                            <span className={`font-mono font-semibold ${inv && inv.abnormal ? "text-rose-600" : "text-ink-900"}`}>
                                                                {displayValue} <span className="text-[10px] text-ink-400 font-normal">{inv?.unit || t.unit}</span>
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    }
                    return (
                        <div key={cat} className="rounded-lg border border-ink-900/8 bg-white overflow-hidden">
                            <button
                                onClick={() => !allRequested && onRequestBundle(tests.map((t) => t.name), cost)}
                                disabled={allRequested}
                                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${allRequested
                                    ? "bg-iris-50 text-iris-700"
                                    : "bg-white text-ink-700 hover:bg-iris-50"
                                    }`}
                            >
                                <span>{cat}</span>
                                <span className={`font-mono text-[10px] ${allRequested ? "text-iris-500" : "text-ink-400"}`}>
                                    {allRequested ? "✓ done" : `−${formatCost(cost)}`}
                                </span>
                            </button>
                            {allRequested && (
                                <div className="px-3.5 pb-2.5 space-y-1">
                                    {tests.map((t) => {
                                        const inv = caseLabByName.get(t.name);
                                        const displayValue = inv?.value
                                            || (normalCache.has(t.name)
                                                ? normalCache.get(t.name)!
                                                : (normalCache.set(t.name, randRange(t.normal)), normalCache.get(t.name)!));
                                        return (
                                            <div key={t.name} className="flex items-center justify-between text-xs">
                                                <span className="text-ink-500">{t.name}</span>
                                                <span className={`font-mono font-semibold ${inv && inv.abnormal ? "text-rose-600" : "text-ink-900"}`}>
                                                    {displayValue} <span className="text-[10px] text-ink-400 font-normal">{inv?.unit || t.unit}</span>
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

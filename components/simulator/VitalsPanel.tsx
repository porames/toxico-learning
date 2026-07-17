"use client"

import { Activity } from "lucide-react";
import { VITAL_DEFS } from "./database";
import type { VitalSign } from "./types";

export function VitalsPanel({
    vitals,
    requested,
    onRequest,
}: {
    vitals: Record<string, VitalSign>;
    requested: boolean;
    onRequest: () => void;
}) {
    const abnormalCount = VITAL_DEFS.filter((v) => vitals[v.key]?.abnormal).length;
    if (!requested) {
        return (
            <div className="text-center py-8">
                <Activity size={32} className="text-ink-400 mx-auto mb-3" />
                <p className="text-sm text-ink-500 mb-4">Vital signs are not yet monitored.</p>
                <button
                    onClick={onRequest}
                    className="rounded-lg bg-iris-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-iris-700 transition-colors cursor-pointer"
                >
                    Request Vital Signs
                </button>
            </div>
        );
    }
    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <h3 className="text-sm font-semibold text-ink-900">Vital Signs</h3>
                {abnormalCount > 0 && (
                    <span className="text-[10px] font-mono font-semibold text-rose-500 bg-rose-100 px-1.5 py-0.5 rounded">
                        {abnormalCount} abnormal
                    </span>
                )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {VITAL_DEFS.map((v) => {
                    const val = vitals[v.key] || { value: "", abnormal: false };
                    return (
                        <div
                            key={v.key}
                            className={`rounded-lg border p-3 ${val.abnormal ? "border-rose-300 bg-rose-50" : "border-ink-900/8 bg-white"}`}
                        >
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <span className="text-[11px] font-mono font-semibold tracking-wider text-ink-500 uppercase">
                                    {v.label}
                                </span>

                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-xl font-mono font-semibold ${val.abnormal ? "text-rose-600" : "text-ink-900"}`}>
                                    {val.value || "—"}
                                </span>
                                <span className="text-[11px] font-mono text-ink-400">{v.unit}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

"use client"

import { useState } from "react";
import { Syringe, Lock } from "lucide-react";
import { MANAGEMENT_LIBRARY, MEDICATION_DOSES } from "./database";

import type { CaseData } from "./types";

export function ManagementPanel({
    caseData,
    selectedInterventions,
    unlockedDispositions,
    onSelectIntervention,
}: {
    caseData: CaseData;
    selectedInterventions: Set<string>;
    unlockedDispositions: string[];
    onSelectIntervention: (name: string, dose?: string) => void;
}) {
    const [category, setCategory] = useState<string>(Object.keys(MANAGEMENT_LIBRARY)[0]);
    const [doseModalItem, setDoseModalItem] = useState<string | null>(null);
    const [selectedDose, setSelectedDose] = useState<string>("");

    const doses = doseModalItem ? MEDICATION_DOSES[doseModalItem] : null;
    const isDispositionLocked = category === "Disposition" && unlockedDispositions.length === 0;

    return (
        <div>
            <p className="text-xs text-ink-400 mb-3">Choose a category then select an intervention to apply:</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
                {Object.keys(MANAGEMENT_LIBRARY).map((cat) => {
                    const locked = cat === "Disposition" && unlockedDispositions.length === 0;
                    return (
                        <button
                            key={cat}
                            onClick={() => !locked && setCategory(cat)}
                            className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${locked
                                ? "border-ink-900/8 bg-gray-100 text-ink-300 cursor-not-allowed"
                                : category === cat
                                    ? "border-iris-400 bg-iris-50 text-iris-700"
                                    : "border-ink-900/8 bg-white text-ink-500"
                                }`}
                        >
                            {cat}
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-col flex-wrap gap-2">
                {isDispositionLocked ? (
                    <div className="flex items-center gap-2 text-xs text-ink-300 italic py-4">
                        <Lock size={14} />
                        <span>Disposition options appear after appropriate management.</span>
                    </div>
                ) : (
                    MANAGEMENT_LIBRARY[category]
                        ?.filter((item) => category !== "Disposition" || unlockedDispositions.includes(item))
                        .map((item) => {
                            const hasDoses = !!MEDICATION_DOSES[item];
                            return (
                                <button
                                    key={item}
                                    onClick={() => {
                                        if (hasDoses) {
                                            setSelectedDose("");
                                            setDoseModalItem(item);
                                        } else {
                                            onSelectIntervention(item);
                                        }
                                    }}
                                    className={`rounded-lg border px-3.5 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${"border-ink-900/8 bg-white text-ink-700 hover:bg-gray-100"}`}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <Syringe size={14} />
                                        <span>{item}</span>
                                    </div>
                                </button>
                            );
                        })
                )}
            </div>

            {doseModalItem && (
                <div className="fixed inset-0 z-50 flex flex-col bg-white">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-ink-900/8">
                        <button
                            onClick={() => setDoseModalItem(null)}
                            className="text-sm text-ink-500 hover:text-ink-700 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <h2 className="text-sm font-semibold text-ink-700">Select dose</h2>
                        <button
                            onClick={() => {
                                if (doseModalItem && selectedDose) {
                                    onSelectIntervention(doseModalItem, selectedDose);
                                    setDoseModalItem(null);
                                }
                            }}
                            disabled={!selectedDose}
                            className="text-sm font-semibold text-iris-400 hover:text-iris-600 cursor-pointer disabled:opacity-30 disabled:cursor-default"
                        >
                            Done
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-5">
                        <p className="text-xs mb-5 text-ink-400">{doseModalItem}</p>
                        <div className="space-y-2">
                            {doses?.map((d) => (
                                <button
                                    key={d.label}
                                    onClick={() => setSelectedDose(d.label)}
                                    className={`w-full text-left rounded-lg border px-4 py-3 text-sm font-semibold transition-colors cursor-pointer ${selectedDose === d.label
                                        ? "border-iris-400 bg-iris-50 text-iris-700"
                                        : "border-ink-900/8 bg-white text-ink-700 hover:bg-gray-100"
                                        }`}
                                >
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

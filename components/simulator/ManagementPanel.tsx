"use client"

import { useState } from "react";
import { Syringe } from "lucide-react";
import { MANAGEMENT_LIBRARY } from "./database";
import type { CaseData } from "./types";

export function ManagementPanel({
    caseData,
    selectedInterventions,
    onSelectIntervention,
}: {
    caseData: CaseData;
    selectedInterventions: Set<string>;
    onSelectIntervention: (name: string) => void;
}) {
    const [category, setCategory] = useState<string>(Object.keys(MANAGEMENT_LIBRARY)[0]);
    return (
        <div>
            <p className="text-xs text-ink-400 mb-3">Choose a category then select an intervention to apply:</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
                {Object.keys(MANAGEMENT_LIBRARY).map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${category === cat
                            ? "border-iris-400 bg-iris-50 text-iris-700"
                            : "border-ink-900/8 bg-white text-ink-500"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="flex flex-col flex-wrap gap-2">
                {MANAGEMENT_LIBRARY[category]?.map((item) => {
                    const applied = selectedInterventions.has(item);
                    return (
                        <button
                            key={item}
                            onClick={() => !applied && onSelectIntervention(item)}
                            disabled={applied}
                            className={`rounded-lg border px-3.5 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${applied
                                ? "border-gray-300 bg-gray-200 text-gray-500"
                                : "border-ink-900/8 bg-white text-ink-700 hover:bg-gray-100"
                                }`}
                        >
                            <div className="flex items-center gap-1.5">
                                <Syringe size={14} />
                                <span>{item}</span>
                                {applied && <span className="ml-1 text-[10px]">✓</span>}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

"use client"

import { useMemo } from "react";
import { FileText, ChevronRight } from "lucide-react";
import type { HistoryGraph } from "./types";
import { HISTORY_CATEGORIES, C } from "./database";

export function HistoryPanel({
    historyGraph,
    askedQuestions,
    onAskQuestion,
}: {
    historyGraph: HistoryGraph;
    askedQuestions: Set<string>;
    onAskQuestion: (questionId: string) => void;
}) {
    const MAX_QUESTIONS = 5;
    const nodes = historyGraph?.nodes ?? [];
    const edges = historyGraph?.edges ?? [];
    const askedCount = askedQuestions.size;
    const remaining = MAX_QUESTIONS - askedCount;

    const visibleNodes = useMemo(() => {
        const entryIds = new Set(nodes.map((n) => n.id));
        for (const e of edges) {
            entryIds.delete(e.target);
        }
        const visible = new Set(entryIds);
        let changed = true;
        while (changed) {
            changed = false;
            for (const e of edges) {
                if (askedQuestions.has(e.source) && !visible.has(e.target)) {
                    visible.add(e.target);
                    changed = true;
                }
            }
        }
        return nodes.filter((n) => visible.has(n.id));
    }, [nodes, edges, askedQuestions]);

    if (nodes.length === 0) {
        return (
            <div>
            <p className="text-xs text-ink-400 mb-3 flex items-center justify-between">
                <span>Ask the patient questions:</span>
                <span className="font-semibold ml-2" style={{ color: remaining > 0 ? C.accent : C.critical }}>
                    {askedCount}/{MAX_QUESTIONS} asked
                </span>
            </p>
                <div className="rounded-lg border border-ink-900/8 bg-white p-4 text-center">
                    <FileText size={24} className="text-ink-300 mx-auto mb-2" />
                    <p className="text-xs text-ink-400 italic">No questions available.</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <p className="text-xs text-ink-400 mb-3 flex items-center justify-between">
                <span>Ask the patient questions:</span>
                <span className="font-semibold ml-2" style={{ color: remaining > 0 ? C.accent : C.critical }}>
                    {askedCount}/{MAX_QUESTIONS} asked
                </span>
            </p>
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {visibleNodes.length === 0 && askedCount === 0 && (
                    <div className="rounded-lg border border-ink-900/8 bg-white p-4 text-center">
                        <p className="text-xs text-ink-400 italic">Ask the first questions to begin.</p>
                    </div>
                )}
                {remaining <= 0 && (
                    <div className="rounded-lg border border-ink-900/8 bg-white p-4 text-center">
                        <p className="text-xs text-ink-400 italic">No questions remaining.</p>
                    </div>
                )}
                {visibleNodes.map((node) => {
                    const cat = HISTORY_CATEGORIES.find((c) => c.key === node.data.category);
                    const asked = askedQuestions.has(node.id);
                    return (
                        <div key={node.id} className="rounded-lg border border-ink-900/8 bg-white overflow-hidden">
                            {asked ? (
                                <div className="p-3.5">
                                    <div className="text-xs font-semibold text-ink-700 mb-1 flex items-center gap-1.5">
                                        <ChevronRight size={12} className="text-ink-300 shrink-0" />
                                        {node.data.question}
                                        {cat && (
                                            <span
                                                className="text-[10px] font-medium px-1.5 py-0.5 rounded ml-auto"
                                                style={{ background: cat.soft, color: cat.color }}
                                            >
                                                {cat.label}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-ink-500 leading-relaxed pl-5 border-l-2 border-ink-200 ml-0.5 mt-1">
                                        {node.data.answer || <span className="italic text-ink-300">No answer recorded.</span>}
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => onAskQuestion(node.id)}
                                    disabled={remaining <= 0}
                                    className="w-full text-left p-3.5 transition-colors cursor-pointer"
                                    style={remaining <= 0 ? { opacity: 0.4, cursor: "default" } : {}}
                                    onMouseOver={(e) => { if (remaining > 0) e.currentTarget.style.background = "#f8f8fa"; }}
                                    onMouseOut={(e) => e.currentTarget.style.background = ""}
                                >
                                    <div className="flex items-start gap-2">
                                        {cat && <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: cat.color }} />}
                                        <div>
                                            <div className="text-xs font-medium text-ink-700">
                                                {node.data.question || <span className="italic text-ink-300">No question set</span>}
                                            </div>
                                            {cat && (
                                                <div className="text-[10px] text-ink-300 mt-0.5">{cat.label}</div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

"use client"

import { useMemo } from "react";
import { FileText, ChevronRight } from "lucide-react";
import type { HistoryGraph } from "./types";
import { HISTORY_CATEGORIES } from "./database";

export function HistoryPanel({
    historyGraph,
    askedQuestions,
    onAskQuestion,
}: {
    historyGraph: HistoryGraph;
    askedQuestions: Set<string>;
    onAskQuestion: (questionId: string) => void;
}) {
    const nodes = historyGraph?.nodes ?? [];
    const edges = historyGraph?.edges ?? [];

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
                <p className="text-xs text-ink-400 mb-3">Ask the patient questions to learn about their history:</p>
                <div className="rounded-lg border border-ink-900/8 bg-white p-4 text-center">
                    <FileText size={24} className="text-ink-300 mx-auto mb-2" />
                    <p className="text-xs text-ink-400 italic">No questions available.</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <p className="text-xs text-ink-400 mb-3">Ask the patient questions to learn about their history:</p>
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {visibleNodes.length === 0 && (
                    <div className="rounded-lg border border-ink-900/8 bg-white p-4 text-center">
                        <p className="text-xs text-ink-400 italic">Ask the first questions to begin.</p>
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
                                    className="w-full text-left p-3.5 hover:bg-ink-50 transition-colors cursor-pointer"
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

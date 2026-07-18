"use client"

import { useState, useMemo } from "react";
import { FileText, ChevronRight } from "lucide-react";
import type { HistoryGraph, HistoryCategoryType } from "./types";
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
    const [activeCat, setActiveCat] = useState<HistoryCategoryType>(HISTORY_CATEGORIES[0].key);

    const nodes = historyGraph?.nodes ?? [];
    const edges = historyGraph?.edges ?? [];

    const catNodes = useMemo(() => nodes.filter((n) => n.data.category === activeCat), [nodes, activeCat]);
    const catEdgeTargets = useMemo(() => {
        const targets = new Set<string>();
        for (const e of edges) {
            const src = nodes.find((n) => n.id === e.source);
            const tgt = nodes.find((n) => n.id === e.target);
            if (src && tgt && src.data.category === activeCat && tgt.data.category === activeCat) {
                targets.add(e.target);
            }
        }
        return targets;
    }, [edges, nodes, activeCat]);

    const entryNodeIds = useMemo(() => {
        const ids = new Set(catNodes.map((n) => n.id));
        catEdgeTargets.forEach((t) => ids.delete(t));
        return ids;
    }, [catNodes, catEdgeTargets]);

    const visibleNodes = useMemo(() => {
        const visible = new Set(entryNodeIds);
        let changed = true;
        while (changed) {
            changed = false;
            for (const e of edges) {
                const src = nodes.find((n) => n.id === e.source);
                const tgt = nodes.find((n) => n.id === e.target);
                if (!src || !tgt || src.data.category !== activeCat || tgt.data.category !== activeCat) continue;
                if (askedQuestions.has(e.source) && !visible.has(e.target)) {
                    visible.add(e.target);
                    changed = true;
                }
            }
        }
        return catNodes.filter((n) => visible.has(n.id));
    }, [edges, nodes, activeCat, entryNodeIds, askedQuestions]);

    const noQuestions = catNodes.length === 0;

    const cat = HISTORY_CATEGORIES.find((c) => c.key === activeCat) ?? HISTORY_CATEGORIES[0];

    return (
        <div>
            <p className="text-xs text-ink-400 mb-3">Select a category, then choose questions to ask the patient:</p>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-1.5 mb-4">
                {HISTORY_CATEGORIES.map((c) => {
                    const active = activeCat === c.key;
                    const count = nodes.filter((n) => n.data.category === c.key).length;
                    return (
                        <button
                            key={c.key}
                            onClick={() => setActiveCat(c.key)}
                            className="rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer"
                            style={{
                                borderColor: active ? c.color : "rgba(26,21,35,0.08)",
                                background: active ? c.soft : "white",
                                color: active ? c.color : "#6b6480",
                            }}
                        >
                            {c.label}
                            {count > 0 && (
                                <span className="ml-1 text-[10px] opacity-60">({count})</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {noQuestions ? (
                <div className="rounded-lg border border-ink-900/8 bg-white p-4 text-center">
                    <FileText size={24} className="text-ink-300 mx-auto mb-2" />
                    <p className="text-xs text-ink-400 italic">No questions available for this category.</p>
                </div>
            ) : visibleNodes.length === 0 ? (
                <div className="rounded-lg border border-ink-900/8 bg-white p-4 text-center">
                    <p className="text-xs text-ink-400 italic">No questions available yet. Ask the entry questions first.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {visibleNodes.map((node) => {
                        const asked = askedQuestions.has(node.id);
                        const followUpCount = edges.filter((e) => e.source === node.id).length;
                        const hasFollowUps = followUpCount > 0;
                        return (
                            <div key={node.id} className="rounded-lg border border-ink-900/8 bg-white overflow-hidden">
                                {asked ? (
                                    <div className="p-3.5">
                                        <div className="text-xs font-semibold text-ink-700 mb-1 flex items-center gap-1.5">
                                            <ChevronRight size={12} className="text-ink-300 shrink-0" />
                                            {node.data.question}
                                        </div>
                                        <div className="text-xs text-ink-500 leading-relaxed pl-5 border-l-2 border-ink-200 ml-0.5 mt-1">
                                            {node.data.answer || <span className="italic text-ink-300">No answer recorded.</span>}
                                        </div>
                                        {hasFollowUps && (
                                            <div className="mt-2 text-[10px] text-ink-300 italic pl-5">
                                                Follow-up questions available below
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => onAskQuestion(node.id)}
                                        className="w-full text-left p-3.5 hover:bg-ink-50 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-start gap-2">
                                            <div
                                                className="w-2 h-2 rounded-full mt-1 shrink-0"
                                                style={{ background: cat.color }}
                                            />
                                            <div>
                                                <div className="text-xs font-medium text-ink-700">
                                                    {node.data.question || <span className="italic text-ink-300">No question set</span>}
                                                </div>
                                                {hasFollowUps && (
                                                    <div className="text-[10px] text-ink-300 mt-0.5">
                                                        {followUpCount} follow-up{followUpCount > 1 ? "s" : ""} available
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

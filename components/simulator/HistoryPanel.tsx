"use client"

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { FileText, ChevronRight } from "lucide-react";
import type { HistoryGraph, HistoryNode } from "./types";
import { C } from "./database";

const QUESTION_TIME_LIMIT = 10;

export function HistoryPanel({
    historyGraph,
    askedQuestions,
    onAskQuestion,
    onTimeout,
    onClose,
}: {
    historyGraph: HistoryGraph;
    askedQuestions: Set<string>;
    onAskQuestion: (questionId: string) => void;
    onTimeout: () => void;
    onClose: () => void;
}) {
    const nodes = historyGraph?.nodes ?? [];
    const edges = historyGraph?.edges ?? [];
    const askedCount = askedQuestions.size;

    const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
    const [selectedQuestion, setSelectedQuestion] = useState<HistoryNode | null>(null);

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

    const hasChoices = visibleNodes.some((n) => !askedQuestions.has(n.id));

    // Countdown — ticks only while a choice is available and no answer is being viewed
    useEffect(() => {
        if (!hasChoices || selectedQuestion) return;
        const id = setInterval(() => {
            setTimeLeft((t) => Math.max(0, +(t - 0.1).toFixed(2)));
        }, 100);
        return () => clearInterval(id);
    }, [hasChoices, selectedQuestion]);

    // Time ran out → penalty, then restart the clock
    useEffect(() => {
        if (timeLeft <= 0 && hasChoices && !selectedQuestion) {
            onTimeout();
            setTimeLeft(QUESTION_TIME_LIMIT);
        }
    }, [timeLeft, hasChoices, onTimeout, selectedQuestion]);

    // Successful question → fresh 10 seconds
    const prevAskedRef = useRef(askedQuestions.size);
    useEffect(() => {
        if (askedQuestions.size !== prevAskedRef.current) {
            prevAskedRef.current = askedQuestions.size;
            setTimeLeft(QUESTION_TIME_LIMIT);
        }
    }, [askedQuestions.size]);

    // Escape closes the interview
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    // Floating cloud — shuffled order + random drift, regenerated after every ask
    const cloud = useMemo(() => {
        const unasked = visibleNodes.filter((n) => !askedQuestions.has(n.id));
        const shuffled = [...unasked].sort(() => Math.random() - 0.5);
        return shuffled.map((node) => ({
            node,
            fx: Math.round((Math.random() * 2 - 1) * 14),
            fy: Math.round((Math.random() * 2 - 1) * 8),
            fr: +((Math.random() * 2 - 1) * 2.5).toFixed(1),
            fd: +(3.5 + Math.random() * 2.5).toFixed(2),
            fdel: +(Math.random() * 2).toFixed(2),
        }));
    }, [visibleNodes, askedQuestions]);

    // Asked questions in chronological order (Set preserves insertion)
    const askedNodes = useMemo(
        () =>
            Array.from(askedQuestions)
                .map((id) => nodes.find((n) => n.id === id))
                .filter((n): n is HistoryNode => !!n),
        [askedQuestions, nodes]
    );

    const barColor = timeLeft <= 3 ? C.critical : timeLeft <= 5 ? C.orange : C.accent;
    const urgent = timeLeft <= 3;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-md">
            <style>{`
                @keyframes historyFloat {
                    0%, 100% { transform: translate(var(--fx, 0px), var(--fy, 0px)) rotate(var(--fr, 0deg)); }
                    50% { transform: translate(var(--fx, 0px), calc(var(--fy, 0px) - 8px)) rotate(var(--fr, 0deg)); }
                }
                .history-cloud-btn:hover { animation-play-state: paused; }
            `}</style>

            <button
                onClick={onClose}
                className="absolute top-5 right-6 text-white/60 hover:text-white text-3xl leading-none cursor-pointer z-10"
                aria-label="Close interview"
            >
                &times;
            </button>

            <div className="w-full max-w-3xl px-6">
                {/* Header */}
                <div className="flex items-end justify-between mb-2">
                    <div>
                        <p className="font-mono text-[11px] font-semibold uppercase" style={{ color: C.accent, letterSpacing: 2 }}>
                            Patient Interview
                        </p>
                        <p className="text-white/50 text-xs mt-1">
                            Decide what to ask — hesitation worsens the patient.
                        </p>
                    </div>
                    <span
                        className="text-xs font-mono font-semibold"
                        style={{ color: "rgba(255,255,255,0.7)" }}
                    >
                        {askedCount} asked
                    </span>
                </div>

                {/* Timer bar */}
                {hasChoices && !selectedQuestion && (
                    <div className="flex items-center gap-3 mb-2">
                        <span
                            className={`font-mono text-lg font-semibold tabular-nums w-8 text-right ${urgent ? "animate-pulse" : ""}`}
                            style={{ color: barColor }}
                        >
                            {Math.ceil(timeLeft)}
                        </span>
                        <div className="flex-1 h-[3px] rounded-full bg-white/15 overflow-hidden">
                            <div
                                className={`h-full rounded-full ${urgent ? "animate-pulse" : ""}`}
                                style={{
                                    width: `${(timeLeft / QUESTION_TIME_LIMIT) * 100}%`,
                                    background: barColor,
                                    transition: "width 100ms linear, background 300ms",
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Answer view / Cloud of unasked questions */}
                {selectedQuestion ? (
                    <div className="flex flex-col items-center justify-center py-6 min-h-[160px]">
                        <div className="rounded-xl border border-white/15 bg-white/5 p-8 max-w-[600px] w-full">
                            <span className="inline-block text-[10px] font-mono font-semibold uppercase tracking-wider mb-4 px-2 py-1 rounded" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
                                {selectedQuestion.data.category.replace(/_/g, " ")}
                            </span>
                            <p className="text-lg font-semibold text-white/90 mb-4 leading-relaxed">
                                {selectedQuestion.data.question}
                            </p>
                            <div className="border-t border-white/10 my-4" />
                            <p className="text-sm text-white/65 leading-relaxed">
                                {selectedQuestion.data.answer || <span className="italic text-white/30">No answer recorded.</span>}
                            </p>
                            <button
                                onClick={() => setSelectedQuestion(null)}
                                className="mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer hover:opacity-90"
                                style={{ background: C.accent }}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                ) : nodes.length === 0 ? (
                    <div className="rounded-lg border border-white/15 bg-white/5 p-6 text-center">
                        <FileText size={24} className="text-white/30 mx-auto mb-2" />
                        <p className="text-xs text-white/50 italic">No questions available.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-wrap items-center justify-center gap-3 py-6 min-h-[160px]">
                            {cloud.length === 0 ? (
                                <p className="text-xs text-white/50 italic">No questions remaining.</p>
                            ) : (
                                cloud.map(({ node, fx, fy, fr, fd, fdel }) => (
                                    <button
                                        key={node.id}
                                        onClick={() => {
                                            onAskQuestion(node.id);
                                            setSelectedQuestion(node);
                                        }}
                                        className="history-cloud-btn text-left rounded-lg border border-white/15 bg-white/8 px-4 py-3 max-w-[300px] cursor-pointer transition-[background-color,border-color,box-shadow,opacity] duration-150 hover:border-[#7c5cfc] hover:bg-white/15 hover:shadow-[0_0_24px_rgba(124,92,252,0.35)] disabled:opacity-40 disabled:cursor-default"
                                        style={{
                                            "--fx": `${fx}px`,
                                            "--fy": `${fy}px`,
                                            "--fr": `${fr}deg`,
                                            animation: `historyFloat ${fd}s ease-in-out ${fdel}s infinite`,
                                        } as CSSProperties}
                                    >
                                        <span className="text-sm font-semibold text-white uppercase tracking-wider">
                                            {node.data.question || <span className="italic text-white/30 normal-case">No question set</span>}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>

                        {/* Asked questions — bottom strip */}
                        <div className="border-t border-white/10 pt-3">
                            <p className="font-mono text-[10px] font-semibold uppercase text-white/40 mb-2" style={{ letterSpacing: 2 }}>
                                Asked — {askedCount}
                            </p>
                            <div className="space-y-2 max-h-[26vh] overflow-y-auto pr-1">
                                {askedNodes.length === 0 ? (
                                    <p className="text-xs text-white/30 italic">No answers yet — pick a question from the cloud.</p>
                                ) : (
                                    askedNodes.map((node) => (
                                        <div key={node.id} className="rounded-lg border border-white/15 bg-white/5 p-3.5">
                                            <div className="text-xs font-semibold text-white/85 mb-1 flex items-center gap-1.5 uppercase tracking-wide">
                                                <ChevronRight size={12} className="text-white/40 shrink-0" />
                                                {node.data.question}
                                            </div>
                                            <div className="text-xs text-white/55 leading-relaxed pl-5 border-l-2 border-white/20 ml-0.5 mt-1">
                                                {node.data.answer || <span className="italic text-white/30">No answer recorded.</span>}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

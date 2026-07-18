"use client"

import React, { useState, useRef } from "react";
import type {
    CaseData, HistoryNode, HistoryEdge, HistoryGraph,
    HistoryCategoryType, StepProps,
} from "./types";
import {
    C, HISTORY_CATEGORIES,
} from "./database";
import {
    inputStyle, TextInput, TextArea, Field, PrimaryButton, GhostButton, Card, SectionHeading,
} from "./ui";

const uid = () => Math.random().toString(36).slice(2, 10);
const NODE_W = 240;
const NODE_H = 100;

function edgePath(x1: number, y1: number, x2: number, y2: number) {
    const dx = Math.max(60, Math.abs(x2 - x1) * 0.5);
    return `M ${x1},${y1} C ${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
}

function catDef(cat: string) {
    return HISTORY_CATEGORIES.find((c) => c.key === cat) ?? HISTORY_CATEGORIES[0];
}

export default function StepHistory({ data, update }: StepProps) {
    const graph = data.historyGraph ?? { nodes: [], edges: [] };
    const canvasRef = useRef<HTMLDivElement>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [connectLine, setConnectLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
    const [scale, setScale] = useState(1);
    const [activeCat, setActiveCat] = useState<HistoryCategoryType>("signs_symptoms");

    const setGraph = (patch: Partial<HistoryGraph>) => update({ historyGraph: { ...graph, ...patch } });

    const canvasPoint = (clientX: number, clientY: number): { x: number; y: number } => {
        const el = canvasRef.current!;
        const rect = el.getBoundingClientRect();
        return { x: (clientX - rect.left + el.scrollLeft) / scale, y: (clientY - rect.top + el.scrollTop) / scale };
    };

    const addNode = () => {
        const id = uid();
        const n: HistoryNode = {
            id,
            x: 60 + Math.random() * 100,
            y: 40 + Math.random() * 200,
            data: { category: activeCat, question: "", answer: "" },
        };
        setGraph({ nodes: [...graph.nodes, n] });
        setSelectedId(id);
    };

    const updateNodeData = (id: string, patch: Partial<HistoryNode["data"]>) => {
        setGraph({ nodes: graph.nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)) });
    };

    const deleteNode = (id: string) => {
        setGraph({
            nodes: graph.nodes.filter((n) => n.id !== id),
            edges: graph.edges.filter((e) => e.source !== id && e.target !== id),
        });
        setSelectedId(null);
    };

    const addEdge = (source: string, target: string) => {
        if (source === target) return;
        if (graph.edges.some((e) => e.source === source && e.target === target)) return;
        const src = graph.nodes.find((n) => n.id === source);
        const tgt = graph.nodes.find((n) => n.id === target);
        if (!src || !tgt) return;
        if (src.data.category !== tgt.data.category) return;
        const id = uid();
        setGraph({ edges: [...graph.edges, { id, source, target }] });
    };

    const deleteEdge = (id: string) => {
        setGraph({ edges: graph.edges.filter((e) => e.id !== id) });
        setSelectedId(null);
    };

    const onMouseDownHeader = (e: React.MouseEvent<HTMLDivElement>, node: HistoryNode) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedId(node.id);
        const start = canvasPoint(e.clientX, e.clientY);
        const offset = { x: start.x - node.x, y: start.y - node.y };
        const onMove = (ev: MouseEvent) => {
            const p = canvasPoint(ev.clientX, ev.clientY);
            setGraph({
                nodes: graph.nodes.map((n) => (n.id === node.id ? { ...n, x: Math.max(0, p.x - offset.x), y: Math.max(0, p.y - offset.y) } : n)),
            });
        };
        const onUp = () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
    };

    const onStartConnect = (e: React.MouseEvent<HTMLDivElement>, sourceId: string) => {
        e.preventDefault();
        e.stopPropagation();
        const source = graph.nodes.find((n) => n.id === sourceId);
        if (!source) return;
        const x1 = source.x + NODE_W, y1 = source.y + NODE_H / 2;
        const onMove = (ev: MouseEvent) => {
            const p = canvasPoint(ev.clientX, ev.clientY);
            setConnectLine({ x1, y1, x2: p.x, y2: p.y });
        };
        const onUp = (ev: MouseEvent) => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
            const el = document.elementFromPoint(ev.clientX, ev.clientY);
            const targetId = el && el.getAttribute && el.getAttribute("data-port-in");
            if (targetId) addEdge(sourceId, targetId);
            setConnectLine(null);
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
    };

    const selectedNode = selectedId ? graph.nodes.find((n) => n.id === selectedId) ?? null : null;
    const selectedEdge = selectedId && !selectedNode ? graph.edges.find((e) => e.id === selectedId) ?? null : null;

    const catNodes = graph.nodes.filter((n) => n.data.category === activeCat);
    const catEdges = graph.edges.filter((e) => {
        const src = graph.nodes.find((n) => n.id === e.source);
        const tgt = graph.nodes.find((n) => n.id === e.target);
        return src && tgt && src.data.category === activeCat && tgt.data.category === activeCat;
    });
    const showGraph = graph.nodes.length > 0;

    return (
        <div>
            <SectionHeading
                eyebrow="02 · Elicit"
                title="History taking"
                desc="Build a graph of questions for each history category. Connect nodes of the same category. Players navigate the graph to discover the patient's history."
            />

            {/* Category tabs + Add node */}
            <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
                {HISTORY_CATEGORIES.map((cat) => (
                    <button
                        key={cat.key}
                        onClick={() => { setActiveCat(cat.key); setSelectedId(null); }}
                        style={{
                            border: `2px solid ${activeCat === cat.key ? cat.color : C.line}`,
                            background: activeCat === cat.key ? cat.soft : C.surface,
                            color: activeCat === cat.key ? cat.color : C.inkSoft,
                            borderRadius: 7,
                            padding: "7px 14px",
                            fontFamily: "'IBM Plex Sans'",
                            fontWeight: 600,
                            fontSize: 12.5,
                            cursor: "pointer",
                            transition: "all 0.1s",
                        }}
                    >
                        {cat.label}
                    </button>
                ))}
                <div style={{ flex: 1 }} />
                <span className="text-[11px] font-mono" style={{ color: C.inkFaint }}>{Math.round(scale * 100)}%</span>
                <GhostButton onClick={() => setScale((s) => Math.max(0.25, s - 0.1))}>−</GhostButton>
                <GhostButton onClick={() => setScale((s) => Math.min(3, s + 0.1))}>+</GhostButton>
                <GhostButton onClick={() => setScale(1)}>Reset</GhostButton>
                <PrimaryButton onClick={addNode} style={{ height: 37, marginLeft: 8 }}>
                    + Add question
                </PrimaryButton>
            </div>

            {!showGraph && (
                <Card style={{ padding: 32, textAlign: "center" }}>
                    <div style={{ color: C.inkFaint, fontFamily: "'IBM Plex Sans'", fontSize: 14, marginBottom: 12 }}>
                        No history questions yet. Click <strong>"+ Add question"</strong> to start building your history graph.
                    </div>
                    <PrimaryButton onClick={addNode}>+ Add question</PrimaryButton>
                </Card>
            )}

            {showGraph && (
                <div style={{ display: "flex", gap: 20 }}>
                    {/* Canvas */}
                    <div
                        ref={canvasRef}
                        style={{
                            flex: 1,
                            position: "relative",
                            maxHeight: 480,
                            background: C.paperDeep,
                            border: `1px solid ${C.line}`,
                            borderRadius: 10,
                            overflow: "auto",
                        }}
                    >
                        <div style={{ width: 2000 * scale, height: 2000 * scale, position: "relative" }}>
                            <div style={{ width: 2000, height: 2000, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
                                <svg width="2000" height="2000" viewBox="0 0 2000 2000" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}>
                                    {catEdges.map((e) => {
                                        const src = graph.nodes.find((n) => n.id === e.source);
                                        const tgt = graph.nodes.find((n) => n.id === e.target);
                                        if (!src || !tgt) return null;
                                        const x1 = src.x + NODE_W, y1 = src.y + NODE_H / 2;
                                        const x2 = tgt.x, y2 = tgt.y + NODE_H / 2;
                                        return (
                                            <g key={e.id}>
                                                <path d={edgePath(x1, y1, x2, y2)} fill="none" stroke={C.lineStrong} strokeWidth={2} />
                                                <path
                                                    d={edgePath(x1, y1, x2, y2)}
                                                    fill="none"
                                                    stroke="transparent"
                                                    strokeWidth={16}
                                                    style={{ cursor: "pointer", pointerEvents: "all" }}
                                                    onClick={() => { setSelectedId(e.id); }}
                                                />
                                            </g>
                                        );
                                    })}
                                    {connectLine && (
                                        <path
                                            d={edgePath(connectLine.x1, connectLine.y1, connectLine.x2, connectLine.y2)}
                                            fill="none"
                                            stroke={C.accent}
                                            strokeWidth={2}
                                            strokeDasharray="6 3"
                                        />
                                    )}
                                </svg>

                                <div style={{ position: "relative", zIndex: 2, pointerEvents: "none" }}>
                                    {catNodes.map((node) => {
                                        const cat = catDef(node.data.category);
                                        const sel = selectedId === node.id;
                                        return (
                                            <div
                                                key={node.id}
                                                onMouseDown={(e) => onMouseDownHeader(e, node)}
                                                style={{
                                                    position: "absolute",
                                                    left: node.x,
                                                    top: node.y,
                                                    width: NODE_W,
                                                    minHeight: NODE_H,
                                                    background: C.surface,
                                                    border: `2px solid ${sel ? C.ink : cat.color}`,
                                                    borderRadius: 9,
                                                    boxShadow: sel ? "0 3px 10px rgba(27,36,48,0.18)" : "0 1px 4px rgba(27,36,48,0.08)",
                                                    cursor: "grab",
                                                    pointerEvents: "auto",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        padding: "5px 10px",
                                                        background: cat.soft,
                                                        borderRadius: "7px 7px 0 0",
                                                        fontSize: 10.5,
                                                        fontFamily: "'IBM Plex Mono'",
                                                        fontWeight: 700,
                                                        color: cat.color,
                                                        letterSpacing: 0.5,
                                                        textTransform: "uppercase",
                                                    }}
                                                >
                                                    {cat.label}
                                                </div>
                                                <div style={{ padding: "8px 10px" }}>
                                                    {node.data.question ? (
                                                        <div style={{ fontSize: 13, fontFamily: "'IBM Plex Sans'", color: C.ink, fontWeight: 500, lineHeight: 1.3 }}>
                                                            {node.data.question.length > 60 ? node.data.question.slice(0, 60) + "…" : node.data.question}
                                                        </div>
                                                    ) : (
                                                        <div style={{ fontSize: 12, fontFamily: "'IBM Plex Sans'", color: C.inkFaint, fontStyle: "italic" }}>
                                                            No question set
                                                        </div>
                                                    )}
                                                    {node.data.answer && (
                                                        <div style={{ fontSize: 11.5, fontFamily: "'IBM Plex Sans'", color: C.inkSoft, marginTop: 4, lineHeight: 1.3 }}>
                                                            {node.data.answer.length > 80 ? node.data.answer.slice(0, 80) + "…" : node.data.answer}
                                                        </div>
                                                    )}
                                                </div>
                                                <div
                                                    data-port-in={node.id}
                                                    style={{
                                                        position: "absolute",
                                                        left: -8,
                                                        top: NODE_H / 2 - 7,
                                                        width: 14,
                                                        height: 14,
                                                        background: C.surface,
                                                        border: `2px solid ${cat.color}`,
                                                        borderRadius: "50%",
                                                        pointerEvents: "auto",
                                                    }}
                                                />
                                                <div
                                                    onMouseDown={(e) => onStartConnect(e, node.id)}
                                                    style={{
                                                        position: "absolute",
                                                        right: -8,
                                                        top: NODE_H / 2 - 7,
                                                        width: 14,
                                                        height: 14,
                                                        background: cat.color,
                                                        border: `2px solid ${C.surface}`,
                                                        borderRadius: "50%",
                                                        cursor: "crosshair",
                                                        pointerEvents: "auto",
                                                    }}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Edit panel */}
                    <div style={{ width: 320, flexShrink: 0 }}>
                        {selectedNode && (
                            <Card>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                                    <span style={{ fontFamily: "'IBM Plex Sans'", fontWeight: 600, fontSize: 13.5, color: C.ink }}>Edit question</span>
                                    <GhostButton danger onClick={() => deleteNode(selectedNode.id)}>Delete</GhostButton>
                                </div>
                                <Field label="Category">
                                    <select
                                        value={selectedNode.data.category}
                                        onChange={(e) => updateNodeData(selectedNode.id, { category: e.target.value as HistoryCategoryType })}
                                        style={inputStyle}
                                    >
                                        {HISTORY_CATEGORIES.map((cat) => (
                                            <option key={cat.key} value={cat.key}>{cat.label}</option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Question">
                                    <TextInput
                                        value={selectedNode.data.question}
                                        onChange={(e) => updateNodeData(selectedNode.id, { question: e.target.value })}
                                        placeholder="e.g. Do you have any chronic medical conditions?"
                                    />
                                </Field>
                                <Field label="Answer">
                                    <TextArea
                                        value={selectedNode.data.answer}
                                        onChange={(e) => updateNodeData(selectedNode.id, { answer: e.target.value })}
                                        placeholder="e.g. Yes, I have hypertension and type 2 diabetes."
                                        style={{ minHeight: 80 }}
                                    />
                                </Field>
                            </Card>
                        )}
                        {selectedEdge && (
                            <Card>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                                    <span style={{ fontFamily: "'IBM Plex Sans'", fontWeight: 600, fontSize: 13.5, color: C.ink }}>Edge</span>
                                    <GhostButton danger onClick={() => deleteEdge(selectedEdge.id)}>Remove</GhostButton>
                                </div>
                                <div style={{ fontSize: 12.5, color: C.inkSoft, fontFamily: "'IBM Plex Sans'" }}>
                                    <div style={{ marginBottom: 6 }}>
                                        From: <strong>{graph.nodes.find((n) => n.id === selectedEdge.source)?.data.question || "?"}</strong>
                                    </div>
                                    <div>
                                        To: <strong>{graph.nodes.find((n) => n.id === selectedEdge.target)?.data.question || "?"}</strong>
                                    </div>
                                </div>
                            </Card>
                        )}
                        {!selectedNode && !selectedEdge && (
                            <Card>
                                <div style={{ fontSize: 13, color: C.inkFaint, fontFamily: "'IBM Plex Sans'", fontStyle: "italic" }}>
                                    Click a node or edge to edit it.
                                </div>
                                <div style={{ fontSize: 12, color: C.inkFaint, fontFamily: "'IBM Plex Sans'", marginTop: 12, lineHeight: 1.6 }}>
                                    <strong>Tips:</strong>
                                    <ul style={{ margin: "6px 0 0 16px", padding: 0 }}>
                                        <li>Drag the right circle to connect nodes</li>
                                        <li>Only same-category nodes can be connected</li>
                                        <li>Click a connection line to edit or remove it</li>
                                    </ul>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

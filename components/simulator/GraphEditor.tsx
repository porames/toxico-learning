"use client"

import React, { useState, useRef } from "react";
import type {
    CaseData, ManagementNode, ManagementEdge, ManagementGraph,
    SelectionKind, ConnectLine, GraphNodeProps,
    StepProps,
} from "./types";
import {
    C, MANAGEMENT_LIBRARY, OUTCOME_TYPES, VITAL_DEFS, NODE_SIZE, NODE_META,
} from "./database";
import {
    inputStyle, TextInput, TextArea, Field, GhostButton, Chip, Card, SectionHeading,
} from "./ui";

const uid = () => Math.random().toString(36).slice(2, 10);

function defaultNodeData(type: string) {
    if (type === "timer") return { minutes: 10, note: "no critical action taken" };
    if (type === "intervention") {
        const cat = Object.keys(MANAGEMENT_LIBRARY)[0];
        return { category: cat, name: MANAGEMENT_LIBRARY[cat]![0], custom: "" };
    }
    if (type === "required-intervention") {
        const cat = Object.keys(MANAGEMENT_LIBRARY)[0];
        return { required: [{ category: cat, name: MANAGEMENT_LIBRARY[cat]![0] }] };
    }
    if (type === "outcome")
        return {
            outcomeType: "improved",
            narrative: "",
            newSymptoms: "",
            vitalChanges: VITAL_DEFS.reduce((acc, v) => ({ ...acc, [v.key]: "" }), {}),
            unlockedDispositions: [],
        };
    if (type === "end") return { outcome: "win", narrative: "" };
    return {};
}

function edgePath(x1: number, y1: number, x2: number, y2: number) {
    const dx = Math.max(60, Math.abs(x2 - x1) * 0.5);
    return `M ${x1},${y1} C ${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
}

function GraphNode({ node, selected, onMouseDownHeader, onStartConnect }: GraphNodeProps) {
    const size = NODE_SIZE[node.type];
    const isOutcome = node.type === "outcome";
    const outcomeDef = isOutcome ? OUTCOME_TYPES.find((o) => o.key === node.data.outcomeType) : null;
    const meta = isOutcome && outcomeDef ? { label: outcomeDef.label, color: outcomeDef.color, soft: outcomeDef.soft } : NODE_META[node.type];

    return (
        <div
            onMouseDown={(e) => onMouseDownHeader(e, node)}
            className="absolute select-none"
            style={{
                left: node.x,
                top: node.y,
                width: size.w,
                minHeight: size.h,
                background: C.surface,
                border: `2px solid ${selected ? C.ink : meta.color}`,
                borderRadius: 9,
                boxShadow: selected ? "0 3px 10px rgba(27,36,48,0.18)" : "0 1px 4px rgba(27,36,48,0.08)",
                cursor: "grab",
            }}
        >
            <div
                className="flex items-center justify-between px-2.5 py-1.5 rounded-t-[7px]"
                style={{ background: meta.soft }}
            >
                <span className="text-[10.5px] font-mono font-bold tracking-wide uppercase" style={{ color: meta.color }}>
                    {node.type === "outcome" ? "Outcome" : meta.label}
                </span>
            </div>
            <div className="px-2.5 py-2">
                {node.type === "start" && <span className="text-sm font-sans" style={{ color: C.inkSoft }}>Case begins</span>}
                {node.type === "timer" && (
                    <>
                        <div className="text-xl font-mono font-bold" style={{ color: C.blue }}>{node.data.minutes || 0}<span className="text-xs"> min</span></div>
                        <div className="text-[11.5px] font-sans mt-0.5" style={{ color: C.inkSoft }}>{node.data.note || "—"}</div>
                    </>
                )}
                {node.type === "intervention" && (
                    <>
                        <div className="text-[14.5px] font-sans font-semibold" style={{ color: C.ink }}>{node.data.custom || node.data.name}</div>
                        <div className="text-[10.5px] font-mono mt-0.5" style={{ color: C.inkFaint }}>{node.data.category}</div>
                    </>
                )}
                {node.type === "required-intervention" && (
                    <>
                        <div className="text-[11px] font-mono font-semibold" style={{ color: meta.color }}>Required:</div>
                        <div className="text-[12px] font-sans mt-0.5 leading-snug" style={{ color: C.ink }}>
                            {node.data.required.map((r) => r.name).join(", ") || "—"}
                        </div>
                    </>
                )}
                {node.type === "outcome" && outcomeDef && outcomeDef.key === "unlock-event" && (
                    <>
                        <Chip color={outcomeDef.color} soft={outcomeDef.soft}>{outcomeDef.label}</Chip>
                        {node.data.unlockedDispositions.length > 0 ? (
                            <div className="text-[11.5px] font-sans mt-1 leading-snug" style={{ color: C.inkSoft }}>
                                Unlocks: {node.data.unlockedDispositions.join(", ")}
                            </div>
                        ) : (
                            <div className="text-[11.5px] font-sans mt-1 italic" style={{ color: C.inkFaint }}>
                                No dispositions selected
                            </div>
                        )}
                    </>
                )}
                {node.type === "outcome" && outcomeDef && outcomeDef.key !== "unlock-event" && (
                    <>
                        <Chip color={outcomeDef.color} soft={outcomeDef.soft}>{outcomeDef.label}</Chip>
                        <div className="text-[11.5px] font-sans mt-1.5 leading-snug" style={{ color: C.inkSoft }}>
                            {node.data.narrative ? (node.data.narrative.length > 70 ? node.data.narrative.slice(0, 70) + "…" : node.data.narrative) : "No narrative yet"}
                        </div>
                    </>
                )}
                {node.type === "end" && (
                    <>
                        <Chip color={node.data.outcome === "win" ? C.normal : C.critical} soft={node.data.outcome === "win" ? C.normalSoft : C.criticalSoft}>
                            {node.data.outcome === "win" ? "WIN" : "LOSE"}
                        </Chip>
                        <div className="text-[13px] font-sans font-medium mt-1" style={{ color: C.ink }}>
                            {node.data.narrative || "End simulation"}
                        </div>
                    </>
                )}
            </div>

            {node.type !== "start" && (
                <div
                    data-port-in={node.id}
                    title="Input"
                    className="absolute rounded-full"
                    style={{
                        left: -8,
                        top: size.h / 2 - 7,
                        width: 14,
                        height: 14,
                        background: C.surface,
                        border: `2px solid ${meta.color}`,
                    }}
                />
            )}
            {node.type !== "end" && (
                <div
                    onMouseDown={(e) => onStartConnect(e, node.id)}
                    title="Drag to connect"
                    className="absolute rounded-full"
                    style={{
                        right: -8,
                        top: size.h / 2 - 7,
                        width: 14,
                        height: 14,
                        background: meta.color,
                        border: `2px solid ${C.surface}`,
                        cursor: "crosshair",
                    }}
                />
            )}
        </div>
    );
}

export default function StepManagement({ data, update }: StepProps) {
    const graph = data.managementGraph;
    const canvasRef = useRef<HTMLDivElement>(null);
    const [selected, setSelected] = useState<SelectionKind>(null);
    const [connectLine, setConnectLine] = useState<ConnectLine | null>(null);
    const [scale, setScale] = useState(1);

    const setGraph = (patch: Partial<ManagementGraph>) => update({ managementGraph: { ...graph, ...patch } });

    const canvasPoint = (clientX: number, clientY: number): { x: number; y: number } => {
        const el = canvasRef.current!;
        const rect = el.getBoundingClientRect();
        return { x: (clientX - rect.left + el.scrollLeft) / scale, y: (clientY - rect.top + el.scrollTop) / scale };
    };

    const addNode = (type: "timer" | "intervention" | "required-intervention" | "outcome" | "end") => {
        const id = uid();
        const n = { id, type, x: 340 + Math.random() * 60, y: 80 + Math.random() * 360, data: defaultNodeData(type) } as ManagementNode;
        setGraph({ nodes: [...graph.nodes, n] });
        setSelected({ kind: "node", id });
        console.log(graph)
    };

    const updateNodeData = (id: string, patch: Record<string, unknown>) =>
        setGraph({ nodes: graph.nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)) as ManagementNode[] });

    const setOutcomeType = (id: string, outcomeType: string) => {
        if (outcomeType === "critical") {
            const endId = uid();
            const endNode: ManagementNode = {
                id: endId, type: "end",
                x: 340 + Math.random() * 60, y: 80 + Math.random() * 360,
                data: { outcome: "lose", narrative: "" },
            };
            setGraph({
                nodes: [
                    ...graph.nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, outcomeType } } as ManagementNode : n)),
                    endNode,
                ],
                edges: [...graph.edges, { id: uid(), source: id, target: endId, label: "" }],
            });
        } else {
            updateNodeData(id, { outcomeType });
        }
    };

    const deleteNode = (id: string) => {
        setGraph({ nodes: graph.nodes.filter((n) => n.id !== id), edges: graph.edges.filter((e) => e.source !== id && e.target !== id) });
        setSelected(null);
    };

    const addEdge = (source: string, target: string) => {
        if (source === target) return;
        if (graph.edges.some((e) => e.source === source && e.target === target)) return;
        const id = uid();
        setGraph({ edges: [...graph.edges, { id, source, target, label: "" }] });
        setSelected({ kind: "edge", id });
    };
    const updateEdge = (id: string, patch: Partial<ManagementEdge>) => setGraph({ edges: graph.edges.map((e) => (e.id === id ? { ...e, ...patch } : e)) });
    const deleteEdge = (id: string) => {
        setGraph({ edges: graph.edges.filter((e) => e.id !== id) });
        setSelected(null);
    };

    const onMouseDownHeader = (e: React.MouseEvent<HTMLDivElement>, node: ManagementNode) => {
        e.preventDefault();
        e.stopPropagation();
        setSelected({ kind: "node", id: node.id });
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
        const size = NODE_SIZE[source.type];
        const x1 = source.x + size.w,
            y1 = source.y + size.h / 2;
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

    const selectedNode = selected && selected.kind === "node" ? graph.nodes.find((n) => n.id === selected.id) : null;
    const selectedEdge = selected && selected.kind === "edge" ? graph.edges.find((e) => e.id === selected.id) : null;

    return (
        <div>
            <SectionHeading
                eyebrow="05 · Decision graph"
                title="Management & outcomes"
                desc="Build the case logic like a node graph: drag from the dot on a node's right edge to another node's left edge to connect. Outcomes can depend on which intervention was chosen and how much time passed first."
            />

            <div className="flex gap-2 mb-3.5 items-center flex-wrap">
                <GhostButton onClick={() => addNode("timer")}>+ Timer node</GhostButton>
                <GhostButton onClick={() => addNode("intervention")}>+ Intervention node</GhostButton>
                <GhostButton onClick={() => addNode("required-intervention")}>+ Required node</GhostButton>
                <GhostButton onClick={() => addNode("outcome")}>+ Outcome node</GhostButton>
                <GhostButton onClick={() => addNode("end")}>+ End node</GhostButton>
                <div className="flex-1" />
                <span className="text-[11px] font-mono" style={{ color: C.inkFaint }}>{Math.round(scale * 100)}%</span>
                <GhostButton onClick={() => setScale((s) => Math.max(0.25, s - 0.1))}>−</GhostButton>
                <GhostButton onClick={() => setScale((s) => Math.min(3, s + 0.1))}>+</GhostButton>
                <GhostButton onClick={() => setScale(1)}>Reset</GhostButton>
            </div>

            <div className="relative w-full">
                <div
                    ref={canvasRef}
                    onMouseDown={(e) => { e.preventDefault(); setSelected(null); }}
                    className="relative w-full overflow-auto select-none rounded-lg"
                    style={{
                        height: 560,
                        border: `1px solid ${C.lineStrong}`,
                        background:
                            `radial-gradient(${C.lineStrong} 1px, transparent 1px) 0 0/18px 18px, #f5f0e6`,
                    }}
                >
                    <div style={{ width: 1500 * scale, height: 900 * scale, position: "relative" }}>
                        <div style={{ width: 1500, height: 900, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
                            <svg viewBox="0 0 1500 900" className="block absolute left-0 top-0 pointer-events-none" preserveAspectRatio="xMidYMid meet">
                                <defs>
                                    <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                                        <path d="M0,0 L8,4 L0,8 Z" fill={C.inkSoft} />
                                    </marker>
                                </defs>
                                {graph.edges.map((e) => {
                                    const s = graph.nodes.find((n) => n.id === e.source);
                                    const t = graph.nodes.find((n) => n.id === e.target);
                                    if (!s || !t) return null;
                                    const sSize = NODE_SIZE[s.type],
                                        tSize = NODE_SIZE[t.type];
                                    const x1 = s.x + sSize.w,
                                        y1 = s.y + sSize.h / 2;
                                    const x2 = t.x,
                                        y2 = t.y + tSize.h / 2;
                                    const isSel = selectedEdge && selectedEdge.id === e.id;
                                    const midX = (x1 + x2) / 2,
                                        midY = (y1 + y2) / 2;
                                    return (
                                        <g key={e.id}>
                                            <path
                                                d={edgePath(x1, y1, x2, y2)}
                                                fill="none"
                                                stroke={isSel ? C.ink : C.inkSoft}
                                                strokeWidth={isSel ? 2.5 : 1.6}
                                                markerEnd="url(#arrow)"
                                                style={{ pointerEvents: "stroke", cursor: "pointer" }}
                                                onMouseDown={(ev) => {
                                                    ev.stopPropagation();
                                                    setSelected({ kind: "edge", id: e.id });
                                                }}
                                            />
                                            {e.label && (
                                                <text x={midX} y={midY - 6} textAnchor="middle" fontFamily="'IBM Plex Mono'" fontSize="10.5" fill={C.inkSoft} style={{ pointerEvents: "none" }}>
                                                    {e.label}
                                                </text>
                                            )}
                                        </g>
                                    );
                                })}
                                {connectLine && (
                                    <path d={edgePath(connectLine.x1, connectLine.y1, connectLine.x2, connectLine.y2)} fill="none" stroke={C.accent} strokeWidth={2} strokeDasharray="5,4" />
                                )}
                            </svg>

                            {graph.nodes.map((n) => (
                                <GraphNode key={n.id} node={n} selected={selected?.id === n.id} onMouseDownHeader={onMouseDownHeader} onStartConnect={onStartConnect} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="fixed bottom-6 right-6" style={{ width: 300 }}>
                    <Card>
                        {!selectedNode && !selectedEdge && (
                            <div className="text-[13.5px] font-sans" style={{ color: C.inkFaint }}>
                                Select a node or connection to edit its properties. Add nodes with the buttons above, then wire them together on the canvas.
                            </div>
                        )}

                        {selectedNode && selectedNode.type === "start" && (
                            <div className="text-[13.5px] font-sans" style={{ color: C.inkSoft }}>
                                The entry point of the case. Connect it to your first timer or intervention node.
                            </div>
                        )}

                        {selectedNode && selectedNode.type === "timer" && (
                            <>
                                <div className="text-[11px] font-mono font-bold mb-2.5 uppercase" style={{ color: C.abnormal }}>Timer node</div>
                                <Field label="Minutes elapsed">
                                    <TextInput type="number" value={selectedNode.data.minutes} onChange={(e) => updateNodeData(selectedNode.id, { minutes: e.target.value })} />
                                </Field>
                                <Field label="Condition note" hint="e.g. 'no antibiotics given yet'">
                                    <TextInput value={selectedNode.data.note} onChange={(e) => updateNodeData(selectedNode.id, { note: e.target.value })} />
                                </Field>
                                <GhostButton danger onClick={() => deleteNode(selectedNode.id)} style={{ marginTop: 6 }}>Delete node</GhostButton>
                            </>
                        )}

                        {selectedNode && selectedNode.type === "intervention" && (
                            <>
                                <div className="text-[11px] font-mono font-bold mb-2.5 uppercase" style={{ color: C.accent }}>Intervention node</div>
                                <Field label="Category">
                                    <select
                                        value={selectedNode.data.category}
                                        onChange={(e) => updateNodeData(selectedNode.id, { category: e.target.value, name: MANAGEMENT_LIBRARY[e.target.value][0] })}
                                        style={inputStyle}
                                    >
                                        {Object.keys(MANAGEMENT_LIBRARY).map((c) => (
                                            <option key={c}>{c}</option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Action">
                                    <select value={selectedNode.data.name} onChange={(e) => updateNodeData(selectedNode.id, { name: e.target.value })} style={inputStyle}>
                                        {MANAGEMENT_LIBRARY[selectedNode.data.category].map((a) => (
                                            <option key={a}>{a}</option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Or custom action">
                                    <TextInput value={selectedNode.data.custom} onChange={(e) => updateNodeData(selectedNode.id, { custom: e.target.value })} placeholder="Overrides the dropdown if filled" />
                                </Field>
                                <GhostButton danger onClick={() => deleteNode(selectedNode.id)} style={{ marginTop: 6 }}>Delete node</GhostButton>
                            </>
                        )}

                        {selectedNode && selectedNode.type === "required-intervention" && (
                            <>
                                <div className="text-[11px] font-mono font-bold mb-2.5 uppercase" style={{ color: "#d97706" }}>Required Intervention node</div>
                                <div className="space-y-2 mb-2">
                                    {selectedNode.data.required.map((r, i) => (
                                        <div key={i} className="rounded border p-2" style={{ borderColor: C.line }}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-[10px] font-mono font-semibold" style={{ color: C.inkFaint }}>#{i + 1}</span>
                                                <GhostButton danger onClick={() => {
                                                    const next = selectedNode.data.required.filter((_, j) => j !== i);
                                                    updateNodeData(selectedNode.id, { required: next });
                                                }}>×</GhostButton>
                                            </div>
                                            <Field label="Category">
                                                <select
                                                    value={r.category}
                                                    onChange={(e) => {
                                                        const next = [...selectedNode.data.required];
                                                        next[i] = { category: e.target.value, name: MANAGEMENT_LIBRARY[e.target.value][0] };
                                                        updateNodeData(selectedNode.id, { required: next });
                                                    }}
                                                    style={inputStyle}
                                                >
                                                    {Object.keys(MANAGEMENT_LIBRARY).map((c) => (
                                                        <option key={c}>{c}</option>
                                                    ))}
                                                </select>
                                            </Field>
                                            <Field label="Action">
                                                <select
                                                    value={r.name}
                                                    onChange={(e) => {
                                                        const next = [...selectedNode.data.required];
                                                        next[i] = { ...next[i], name: e.target.value };
                                                        updateNodeData(selectedNode.id, { required: next });
                                                    }}
                                                    style={inputStyle}
                                                >
                                                    {MANAGEMENT_LIBRARY[r.category].map((a) => (
                                                        <option key={a}>{a}</option>
                                                    ))}
                                                </select>
                                            </Field>
                                        </div>
                                    ))}
                                </div>
                                <GhostButton onClick={() => {
                                    const cat = Object.keys(MANAGEMENT_LIBRARY)[0];
                                    updateNodeData(selectedNode.id, { required: [...selectedNode.data.required, { category: cat, name: MANAGEMENT_LIBRARY[cat][0] }] });
                                }} style={{ marginBottom: 6 }}>+ Add required action</GhostButton>
                                <GhostButton danger onClick={() => deleteNode(selectedNode.id)} style={{ marginTop: 2 }}>Delete node</GhostButton>
                            </>
                        )}

                        {selectedNode && selectedNode.type === "outcome" && (
                            <>
                                <div className="text-[11px] font-mono font-bold mb-2.5 uppercase" style={{ color: C.inkSoft }}>Outcome node</div>
                                <Field label="Classification">
                                    <select value={selectedNode.data.outcomeType} onChange={(e) => setOutcomeType(selectedNode.id, e.target.value)} style={inputStyle}>
                                        {OUTCOME_TYPES.map((o) => (
                                            <option key={o.key} value={o.key}>{o.label}</option>
                                        ))}
                                    </select>
                                </Field>
                                {selectedNode.data.outcomeType === "unlock-event" ? (
                                    <div className="space-y-1.5 mb-2">
                                        <div className="text-[11px] font-mono font-semibold" style={{ color: C.inkFaint }}>Unlocked dispositions</div>
                                        {MANAGEMENT_LIBRARY["Disposition"].map((d) => {
                                            const checked = selectedNode.data.unlockedDispositions.includes(d);
                                            return (
                                                <label key={d} className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: C.ink }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => {
                                                            const next = checked
                                                                ? selectedNode.data.unlockedDispositions.filter((x: string) => x !== d)
                                                                : [...selectedNode.data.unlockedDispositions, d];
                                                            updateNodeData(selectedNode.id, { unlockedDispositions: next });
                                                        }}
                                                        style={{ accentColor: C.accent }}
                                                    />
                                                    {d}
                                                </label>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <>
                                        <Field label="Narrative shown to student">
                                            <TextArea value={selectedNode.data.narrative} onChange={(e) => updateNodeData(selectedNode.id, { narrative: e.target.value })} className="min-h-[60px]" />
                                        </Field>
                                        <Field label="New symptoms" hint="Comma-separated">
                                            <TextArea value={selectedNode.data.newSymptoms} onChange={(e) => updateNodeData(selectedNode.id, { newSymptoms: e.target.value })} className="min-h-[46px]" />
                                        </Field>
                                        <div className="text-[11.5px] font-sans font-semibold uppercase my-2" style={{ color: C.inkSoft }}>Resulting vitals</div>
                                        <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                                            {VITAL_DEFS.map((v) => (
                                                <div key={v.key}>
                                                    <div className="text-[10px] font-mono" style={{ color: C.inkFaint }}>{v.label}</div>
                                                    <input
                                                        value={selectedNode.data.vitalChanges[v.key]}
                                                        onChange={(e) => updateNodeData(selectedNode.id, { vitalChanges: { ...selectedNode.data.vitalChanges, [v.key]: e.target.value } })}
                                                        placeholder="—"
                                                        className="w-full box-border rounded px-1.5 py-1 font-mono text-xs"
                                                        style={{ border: `1px solid ${C.line}` }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                                <GhostButton danger onClick={() => deleteNode(selectedNode.id)}>Delete node</GhostButton>
                            </>
                        )}

                        {selectedNode && selectedNode.type === "end" && (
                            <>
                                <div className="text-[11px] font-mono font-bold mb-2.5 uppercase" style={{ color: "#8b2020" }}>End node</div>
                                <Field label="Outcome">
                                    <select value={selectedNode.data.outcome} onChange={(e) => updateNodeData(selectedNode.id, { outcome: e.target.value })} style={inputStyle}>
                                        <option value="win">Win</option>
                                        <option value="lose">Lose</option>
                                    </select>
                                </Field>
                                <Field label="End message" hint="Shown when simulation ends via this path">
                                    <TextInput value={selectedNode.data.narrative} onChange={(e) => updateNodeData(selectedNode.id, { narrative: e.target.value })} placeholder="e.g. Patient discharged" />
                                </Field>
                                <GhostButton danger onClick={() => deleteNode(selectedNode.id)} style={{ marginTop: 6 }}>Delete node</GhostButton>
                            </>
                        )}

                        {selectedEdge && (
                            <>
                                <div className="text-[11px] font-mono font-bold mb-2.5 uppercase" style={{ color: C.ink }}>Connection</div>
                                <Field label="Condition label" hint="e.g. 'within 10 min', 'wrong drug', 'always'">
                                    <TextInput value={selectedEdge.label} onChange={(e) => updateEdge(selectedEdge.id, { label: e.target.value })} placeholder="always" />
                                </Field>
                                <GhostButton danger onClick={() => deleteEdge(selectedEdge.id)}>Delete connection</GhostButton>
                            </>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}

"use client"

import React, { useState, useCallback, useEffect, memo } from "react";
import {
    ReactFlow,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    BaseEdge,
    getBezierPath,
    EdgeLabelRenderer,
    EdgeToolbar,
    addEdge as rfAddEdge,
    MarkerType,
    useReactFlow,
    type Node,
    type Edge,
    type Connection,
    type OnNodesChange,
    type OnEdgesChange,
    type OnConnect,
    type EdgeProps,
    type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type {
    CaseData, ManagementNode, ManagementEdge, ManagementGraph,
    StepProps,
} from "./types";
import {
    C, MANAGEMENT_LIBRARY, MEDICATION_DOSES, OUTCOME_TYPES, VITAL_DEFS, NODE_SIZE,
} from "./database";
import {
    inputStyle, TextInput, TextArea, Field, GhostButton, Chip, Card, SectionHeading,
} from "./ui";
import { Trash2 } from "lucide-react";
import ManagementNodeComponent from "./ManagementNode";

const uid = () => Math.random().toString(36).slice(2, 10);

function defaultNodeData(type: string) {
    if (type === "timer") return { minutes: 10, note: "no critical action taken" };
    if (type === "intervention") return { actions: [] };
    if (type === "required") {
        const first = MANAGEMENT_LIBRARY[Object.keys(MANAGEMENT_LIBRARY)[0]][0];
        return { actions: [{ or: [first] }] };
    }
    if (type === "outcome")
        return {
            outcomeType: "improved",
            narrative: "",
            newSymptoms: "",
            vitalChanges: VITAL_DEFS.reduce((acc, v) => ({ ...acc, [v.key]: "" }), {}),
        };
    if (type === "end") return { outcome: "win", narrative: "" };
    return {};
}

const nodeTypes = {
    managementNode: ManagementNodeComponent,
};

function ManagementEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    selected,
    data,
    markerEnd,
    style,
}: EdgeProps) {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });
    const label = (data as Record<string, unknown>)?.label as string | undefined;

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                style={{
                    ...(style as React.CSSProperties),
                    stroke: selected ? C.ink : C.inkSoft,
                    strokeWidth: selected ? 2.5 : 1.6,
                    cursor: "pointer",
                }}
                markerEnd={markerEnd}
            />
            {label && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: "absolute",
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY - 6}px)`,
                            fontSize: 10.5,
                            fontFamily: "'IBM Plex Mono'",
                            color: C.inkSoft,
                            pointerEvents: "none",
                            lineHeight: 1,
                        }}
                    >
                        {label}
                    </div>
                </EdgeLabelRenderer>
            )}
            {selected && (
                <EdgeToolbar edgeId={id} x={labelX} y={labelY} isVisible>
                    <button
                        onClick={() => (data as any).onDelete(id)}
                        style={{
                            border: "none",
                            background: C.surface,
                            cursor: "pointer",
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                            color: C.critical,
                        }}
                    >
                        <Trash2 size={12} />
                    </button>
                </EdgeToolbar>
            )}
        </>
    );
}

const edgeTypes = {
    managementEdge: memo(ManagementEdge),
};

export default function StepManagement({ data, update }: StepProps) {
    const graph = data.managementGraph;
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
    const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);

    const toggleCat = (cat: string) => setExpandedCats((prev) => ({ ...prev, [cat]: !prev[cat] }));

    const setGraph = (patch: Partial<ManagementGraph>) => update({ managementGraph: { ...graph, ...patch } });

    const [rfNodes, setRfNodes, onNodesChangeBase] = useNodesState<Node>([]);
    const [rfEdges, setRfEdges, onEdgesChangeBase] = useEdgesState<Edge>([]);

    useEffect(() => {
        setRfNodes(
            graph.nodes.map((n) => ({
                id: n.id,
                type: "managementNode",
                position: { x: n.x, y: n.y },
                data: { node: n },
                selected: n.id === selectedId,
            }))
        );
        setRfEdges(
            graph.edges.map((e) => ({
                id: e.id,
                source: e.source,
                target: e.target,
                type: "managementEdge",
                data: { label: e.label, onDelete: deleteEdge },
                markerEnd: { type: MarkerType.ArrowClosed, color: C.inkSoft },
                style: { stroke: C.inkSoft, strokeWidth: 1.6 },
                selected: e.id === selectedId,
            }))
        );
    }, [graph.nodes, graph.edges, selectedId, setRfNodes, setRfEdges]);

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => {
            onNodesChangeBase(changes);
            for (const ch of changes) {
                if (ch.type === "position" && !ch.dragging && ch.position) {
                    setGraph({
                        nodes: graph.nodes.map((n) =>
                            n.id === ch.id
                                ? { ...n, x: Math.max(0, ch.position!.x), y: Math.max(0, ch.position!.y) }
                                : n
                        ),
                    });
                }
                if (ch.type === "select") {
                    setSelectedId(ch.selected ? ch.id : null);
                }
            }
        },
        [graph.nodes, setGraph, onNodesChangeBase]
    );

    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => {
            onEdgesChangeBase(changes);
            for (const ch of changes) {
                if (ch.type === "remove") {
                    setGraph({
                        edges: graph.edges.filter((e) => e.id !== ch.id),
                    });
                    setSelectedId((prev) => (prev === ch.id ? null : prev));
                }
                if (ch.type === "select") {
                    setSelectedId(ch.selected ? ch.id : null);
                }
            }
        },
        [graph.edges, setGraph, onEdgesChangeBase]
    );

    const onConnect: OnConnect = useCallback(
        (connection) => {
            if (!connection.source || !connection.target) return;
            if (connection.source === connection.target) return;
            if (graph.edges.some((e) => e.source === connection.source && e.target === connection.target)) return;
            const id = uid();
            const newEdge: ManagementEdge = { id, source: connection.source, target: connection.target, label: "" };
            setGraph({ edges: [...graph.edges, newEdge] });
            setRfEdges((eds) =>
                rfAddEdge(
                    {
                        id,
                        source: connection.source,
                        target: connection.target,
                        type: "managementEdge",
                        data: { label: "", onDelete: deleteEdge },
                        markerEnd: { type: MarkerType.ArrowClosed, color: C.inkSoft },
                        style: { stroke: C.inkSoft, strokeWidth: 1.6 },
                    },
                    eds
                )
            );
            setSelectedId(id);
        },
        [graph.edges, setGraph, setRfEdges]
    );

    const isValidConnection = useCallback(
        (connection: Edge | Connection): boolean => {
            if (!connection.source || !connection.target) return false;
            if (connection.source === connection.target) return false;
            if (graph.edges.some((e) => e.source === connection.source && e.target === connection.target)) return false;
            return true;
        },
        [graph.edges]
    );

    const addNode = (type: "timer" | "intervention" | "required" | "outcome" | "end") => {
        const id = uid();
        const n = { id, type, x: 340 + Math.random() * 60, y: 80 + Math.random() * 360, data: defaultNodeData(type) } as ManagementNode;
        setGraph({ nodes: [...graph.nodes, n] });
        setRfNodes((nds) => [
            ...nds,
            {
                id: n.id,
                type: "managementNode",
                position: { x: n.x, y: n.y },
                data: { node: n },
                selected: true,
            },
        ]);
        setSelectedId(id);
    };

    const updateNodeData = (id: string, patch: Record<string, unknown>) => {
        const clean = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
        const nextNodes = graph.nodes.map((n) =>
            n.id === id ? { ...n, data: { ...n.data, ...clean } } : n
        ) as ManagementNode[];
        setGraph({ nodes: nextNodes });
        setRfNodes((nds) =>
            nds.map((n) =>
                n.id === id
                    ? { ...n, data: { ...n.data, node: { ...(n.data as any).node, data: { ...(n.data as any).node.data, ...clean } } } }
                    : n
            )
        );
    };

    const resetOutcomeData = (outcomeType: string) => {
        if (outcomeType === "unlockEvent") return { outcomeType, unlockedDispositions: [] as string[] };
        return {
            outcomeType,
            narrative: "",
            newSymptoms: "",
            vitalChanges: VITAL_DEFS.reduce((acc, v) => ({ ...acc, [v.key]: "" }), {} as Record<string, string>),
        };
    };

    const setOutcomeType = (id: string, outcomeType: string) => {
        if (outcomeType === "critical") {
            const endId = uid();
            const endNode: ManagementNode = {
                id: endId, type: "end",
                x: 340 + Math.random() * 60, y: 80 + Math.random() * 360,
                data: { outcome: "lose", narrative: "" },
            };
            const nextNodes = [
                ...graph.nodes.map((n) => (n.id === id ? { ...n, data: resetOutcomeData(outcomeType) } as ManagementNode : n)),
                endNode,
            ];
            const nextEdges = [...graph.edges, { id: uid(), source: id, target: endId, label: "" }];
            setGraph({ nodes: nextNodes, edges: nextEdges });
            setRfNodes((nds) => [
                ...nds.map((n) =>
                    n.id === id
                        ? { ...n, data: { ...n.data, node: { ...(n.data as any).node, data: resetOutcomeData(outcomeType) } } }
                        : n
                ),
                {
                    id: endNode.id,
                    type: "managementNode",
                    position: { x: endNode.x, y: endNode.y },
                    data: { node: endNode },
                    selected: false,
                },
            ]);
            setRfEdges((eds) =>
                rfAddEdge(
                    {
                        id: uid(),
                        source: id,
                        target: endId,
                        type: "managementEdge",
                        data: { label: "", onDelete: deleteEdge },
                        markerEnd: { type: MarkerType.ArrowClosed, color: C.inkSoft },
                        style: { stroke: C.inkSoft, strokeWidth: 1.6 },
                    },
                    eds
                )
            );
        } else {
            const nextNodes = graph.nodes.map((n) => (n.id === id ? { ...n, data: resetOutcomeData(outcomeType) } as ManagementNode : n));
            setGraph({ nodes: nextNodes });
            setRfNodes((nds) =>
                nds.map((n) =>
                    n.id === id
                        ? { ...n, data: { ...n.data, node: { ...(n.data as any).node, data: resetOutcomeData(outcomeType) } } }
                        : n
                )
            );
        }
    };

    const deleteNode = (id: string) => {
        setGraph({
            nodes: graph.nodes.filter((n) => n.id !== id),
            edges: graph.edges.filter((e) => e.source !== id && e.target !== id),
        });
        setRfNodes((nds) => nds.filter((n) => n.id !== id));
        setRfEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
        setSelectedId(null);
    };

    const updateEdge = (id: string, patch: Partial<ManagementEdge>) => {
        setGraph({ edges: graph.edges.map((e) => (e.id === id ? { ...e, ...patch } : e)) });
        setRfEdges((eds) =>
            eds.map((e) =>
                e.id === id
                    ? { ...e, data: { ...e.data, label: patch.label ?? (e.data as any).label } }
                    : e
            )
        );
    };

    const deleteEdge = (id: string) => {
        setGraph({ edges: graph.edges.filter((e) => e.id !== id) });
        setRfEdges((eds) => eds.filter((e) => e.id !== id));
        setSelectedId(null);
    };

    const selectedNode = selectedId ? graph.nodes.find((n) => n.id === selectedId) ?? null : null;
    const selectedEdge = selectedId && !selectedNode ? graph.edges.find((e) => e.id === selectedId) ?? null : null;

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
                <GhostButton onClick={() => addNode("required")}>+ Required node</GhostButton>
                <GhostButton onClick={() => addNode("outcome")}>+ Outcome node</GhostButton>
                <GhostButton onClick={() => addNode("end")}>+ End node</GhostButton>
                <div className="flex-1" />
                <span className="text-[11px] font-mono" style={{ color: C.inkFaint }}>{Math.round(zoomLevel * 100)}%</span>
                <GhostButton onClick={() => rfInstance?.zoomOut()}>−</GhostButton>
                <GhostButton onClick={() => rfInstance?.zoomIn()}>+</GhostButton>
                <GhostButton onClick={() => rfInstance?.fitView({ padding: 0.2 })}>Reset</GhostButton>
            </div>

            <div className="relative w-full">
                <div
                    className="relative w-full rounded-lg"
                    style={{
                        height: 560,
                        border: `1px solid ${C.lineStrong}`,
                        background:
                            `radial-gradient(${C.lineStrong} 1px, transparent 1px) 0 0/18px 18px, #f5f0e6`,
                    }}
                >
                    <ReactFlow
                        nodes={rfNodes}
                        edges={rfEdges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        isValidConnection={isValidConnection}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        onInit={setRfInstance}
                        onViewportChange={(vp) => setZoomLevel(vp.zoom)}
                        onPaneClick={() => setSelectedId(null)}
                        deleteKeyCode={["Backspace", "Delete"]}
                        snapToGrid
                        snapGrid={[10, 10]}
                        minZoom={0.25}
                        maxZoom={3}
                        fitView={false}
                        style={{ width: "100%", height: "100%" }}
                    >
                        <Background gap={20} size={1} color={C.line} />
                        <Controls showInteractive={false} />
                    </ReactFlow>
                </div>

                <div className="fixed bottom-24 right-0" style={{ width: 300, maxHeight: "calc(100vh - 160px)", overflowY: "auto" }}>
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
                                <div className="space-y-1">
                                    {Object.entries(MANAGEMENT_LIBRARY).map(([cat, actions]) => {
                                        const catSelected = actions.filter((a) => selectedNode.data.actions.includes(a)).length;
                                        const isOpen = expandedCats[cat] ?? catSelected > 0;
                                        return (
                                            <div key={cat} className="rounded" style={{ border: `1px solid ${C.line}`, overflow: "hidden" }}>
                                                <button
                                                    onClick={() => toggleCat(cat)}
                                                    style={{
                                                        display: "flex", alignItems: "center", justifyContent: "space-between",
                                                        width: "100%", border: "none", background: C.paperDeep,
                                                        padding: "6px 10px", cursor: "pointer",
                                                    }}
                                                >
                                                    <span className="text-[10.5px] font-mono font-semibold" style={{ color: C.inkSoft }}>
                                                        {cat} {catSelected > 0 && <span style={{ color: C.accent }}>({catSelected})</span>}
                                                    </span>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.inkFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                                        style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }}
                                                    >
                                                        <polyline points="6 9 12 15 18 9" />
                                                    </svg>
                                                </button>
                                                {isOpen && (
                                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: "8px 10px" }}>
                                                        {actions.map((a) => {
                                                            const selected = selectedNode.data.actions.includes(a);
                                                            const doses = MEDICATION_DOSES[a];
                                                            const currentDose = selectedNode.data.doseMap?.[a];
                                                            return (
                                                                <div key={a} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                                                    <button
                                                                        onClick={() => {
                                                                            if (selected) {
                                                                                const next = selectedNode.data.actions.filter((o: string) => o !== a);
                                                                                const nextDoseMap = { ...(selectedNode.data.doseMap ?? {}) };
                                                                                delete nextDoseMap[a];
                                                                                updateNodeData(selectedNode.id, { actions: next, doseMap: nextDoseMap });
                                                                            } else {
                                                                                const defaultDose = doses?.find((d) => d.isDefault);
                                                                                const doseMap = defaultDose
                                                                                    ? { ...(selectedNode.data.doseMap ?? {}), [a]: defaultDose.label }
                                                                                    : selectedNode.data.doseMap;
                                                                                updateNodeData(selectedNode.id, { actions: [...selectedNode.data.actions, a], doseMap });
                                                                            }
                                                                        }}
                                                                        style={{
                                                                            border: `1px solid ${selected ? C.accent : C.line}`,
                                                                            background: selected ? C.accent : C.paper,
                                                                            color: selected ? "#fff" : C.inkSoft,
                                                                            fontFamily: "'IBM Plex Sans'", fontWeight: 500, fontSize: 10.5,
                                                                            borderRadius: 5, padding: "4px 9px", cursor: "pointer",
                                                                        }}
                                                                    >
                                                                        {a}
                                                                    </button>
                                                                    {selected && doses && (
                                                                        <select
                                                                            value={currentDose ?? ""}
                                                                            onChange={(e) => {
                                                                                const dose = e.target.value;
                                                                                const current = selectedNode.data.doseMap ?? {};
                                                                                if (dose) {
                                                                                    updateNodeData(selectedNode.id, { doseMap: { ...current, [a]: dose } });
                                                                                } else {
                                                                                    const next = { ...current };
                                                                                    delete next[a];
                                                                                    updateNodeData(selectedNode.id, { doseMap: next });
                                                                                }
                                                                            }}
                                                                            style={{
                                                                                fontSize: 9.5,
                                                                                fontFamily: "'IBM Plex Mono'",
                                                                                padding: "1px 3px",
                                                                                borderRadius: 3,
                                                                                border: `1px solid ${C.line}`,
                                                                                background: C.paper,
                                                                                color: C.ink,
                                                                                cursor: "pointer",
                                                                            }}
                                                                        >
                                                                            <option value="">Any dose</option>
                                                                            {doses.map((d) => (
                                                                                <option key={d.label} value={d.label}>
                                                                                    {d.label}{d.isDefault ? " (default)" : ""}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <GhostButton danger onClick={() => deleteNode(selectedNode.id)} style={{ marginTop: 10 }}>Delete node</GhostButton>
                            </>
                        )}

                        {selectedNode && selectedNode.type === "required" && !Array.isArray(selectedNode.data.actions) && (
                            <div className="text-[13.5px] font-sans" style={{ color: C.inkFaint }}>
                                This node has outdated data. Save the case and reload to migrate it.
                            </div>
                        )}
                        {selectedNode && selectedNode.type === "required" && Array.isArray(selectedNode.data.actions) && (
                            <>
                                <div className="text-[11px] font-mono font-bold mb-2.5 uppercase" style={{ color: "#d97706" }}>Required node</div>
                                <div className="text-[10px] font-sans mb-2" style={{ color: C.inkFaint }}>
                                    Groups combine with <strong>AND</strong>. Alternatives within a group combine with <strong>OR</strong>.
                                </div>
                                <div className="space-y-2 mb-2">
                                    {selectedNode.data.actions.map((group: any, gi: number) => {
                                        const groupOpen = expandedCats[`grp-${gi}`] ?? true;
                                        const groupSummary = (group.or ?? []).length > 0
                                            ? `${(group.or ?? []).length} intervention${(group.or ?? []).length > 1 ? "s" : ""}`
                                            : "empty";
                                        return (
                                            <div key={gi} className="rounded border" style={{ borderColor: C.line, overflow: "hidden" }}>
                                                <div className="flex items-center justify-between px-2.5 py-1.5" style={{ background: C.paperDeep }}>
                                                    <button
                                                        onClick={() => toggleCat(`grp-${gi}`)}
                                                        className="flex items-center gap-1.5"
                                                        style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0 }}
                                                    >
                                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.inkFaint} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                                            style={{ transform: groupOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s" }}
                                                        >
                                                            <polyline points="6 9 12 15 18 9" />
                                                        </svg>
                                                        <span className="text-[10px] font-mono font-semibold" style={{ color: C.inkFaint }}>
                                                            {gi > 0 && <span style={{ color: "#d97706" }}>AND </span>}Group {gi + 1}
                                                            <span style={{ color: C.inkFaint }}> ({groupSummary})</span>
                                                        </span>
                                                    </button>
                                                    <GhostButton danger onClick={() => {
                                                        const next = selectedNode.data.actions.filter((_: any, j: number) => j !== gi);
                                                        updateNodeData(selectedNode.id, { actions: next });
                                                    }}>×</GhostButton>
                                                </div>
                                                {groupOpen && (
                                                    <div className="p-2 space-y-1">
                                                        {Object.entries(MANAGEMENT_LIBRARY).map(([cat, catActions]) => {
                                                            const catSelected = catActions.filter((a: string) => (group.or ?? []).includes(a));
                                                            const isOpen = expandedCats[`req-${gi}-${cat}`] ?? catSelected.length > 0;
                                                            return (
                                                                <div key={cat} className="rounded" style={{ border: `1px solid ${C.line}`, overflow: "hidden" }}>
                                                                    <button
                                                                        onClick={() => toggleCat(`req-${gi}-${cat}`)}
                                                                        style={{
                                                                            display: "flex", alignItems: "center", justifyContent: "space-between",
                                                                            width: "100%", border: "none", background: catSelected.length > 0 ? "#d97706" : C.paperDeep,
                                                                            padding: "4px 8px", cursor: "pointer",
                                                                        }}
                                                                    >
                                                                        <span className="text-[10px] font-mono font-semibold" style={{ color: catSelected.length > 0 ? "#fff" : C.inkSoft }}>
                                                                            {cat} {catSelected.length > 0 && <span>({catSelected.length})</span>}
                                                                        </span>
                                                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={catSelected.length > 0 ? "#fff" : C.inkFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                                                            style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }}
                                                                        >
                                                                            <polyline points="6 9 12 15 18 9" />
                                                                        </svg>
                                                                    </button>
                                                                    {isOpen && (
                                                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 3, padding: "6px 8px" }}>
                                                                            {catActions.map((a: string) => {
                                                                                const selected = (group.or ?? []).includes(a);
                                                                                const doses = MEDICATION_DOSES[a];
                                                                                const currentDose = selectedNode.data.doseMap?.[a];
                                                                                return (
                                                                                    <div key={a} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                const next = [...selectedNode.data.actions];
                                                                                                if (selected) {
                                                                                                    next[gi] = { or: (group.or ?? []).filter((o: string) => o !== a) };
                                                                                                    const nextDoseMap = { ...(selectedNode.data.doseMap ?? {}) };
                                                                                                    delete nextDoseMap[a];
                                                                                                    updateNodeData(selectedNode.id, { actions: next, doseMap: nextDoseMap });
                                                                                                } else {
                                                                                                    next[gi] = { or: [...(group.or ?? []), a] };
                                                                                                    const defaultDose = doses?.find((d) => d.isDefault);
                                                                                                    const doseMap = defaultDose
                                                                                                        ? { ...(selectedNode.data.doseMap ?? {}), [a]: defaultDose.label }
                                                                                                        : selectedNode.data.doseMap;
                                                                                                    updateNodeData(selectedNode.id, { actions: next, doseMap });
                                                                                                }
                                                                                            }}
                                                                                            style={{
                                                                                                border: `1px solid ${selected ? "#d97706" : C.line}`,
                                                                                                background: selected ? "#d97706" : C.paper,
                                                                                                color: selected ? "#fff" : C.inkSoft,
                                                                                                fontFamily: "'IBM Plex Sans'", fontWeight: 500, fontSize: 10,
                                                                                                borderRadius: 4, padding: "3px 7px", cursor: "pointer",
                                                                                            }}
                                                                                        >
                                                                                            {a}
                                                                                        </button>
                                                                                        {selected && doses && (
                                                                                            <select
                                                                                                value={currentDose ?? ""}
                                                                                                onChange={(e) => {
                                                                                                    const dose = e.target.value;
                                                                                                    const current = selectedNode.data.doseMap ?? {};
                                                                                                    if (dose) {
                                                                                                        updateNodeData(selectedNode.id, { doseMap: { ...current, [a]: dose } });
                                                                                                    } else {
                                                                                                        const next = { ...current };
                                                                                                        delete next[a];
                                                                                                        updateNodeData(selectedNode.id, { doseMap: next });
                                                                                                    }
                                                                                                }}
                                                                                                style={{
                                                                                                    fontSize: 9,
                                                                                                    fontFamily: "'IBM Plex Mono'",
                                                                                                    padding: "1px 3px",
                                                                                                    borderRadius: 3,
                                                                                                    border: `1px solid ${C.line}`,
                                                                                                    background: C.paper,
                                                                                                    color: C.ink,
                                                                                                    cursor: "pointer",
                                                                                                }}
                                                                                            >
                                                                                                <option value="">Any dose</option>
                                                                                                {doses.map((d) => (
                                                                                                    <option key={d.label} value={d.label}>
                                                                                                        {d.label}{d.isDefault ? " (default)" : ""}
                                                                                                    </option>
                                                                                                ))}
                                                                                            </select>
                                                                                        )}
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <GhostButton onClick={() => {
                                    updateNodeData(selectedNode.id, { actions: [...selectedNode.data.actions, { or: [] }] });
                                }} style={{ marginBottom: 6 }}>+ Add required group (AND)</GhostButton>
                                <GhostButton danger onClick={() => deleteNode(selectedNode.id)} style={{ marginTop: 2 }}>Delete node</GhostButton>
                            </>
                        )}

                        {selectedNode && selectedNode.type === "outcome" && (() => {
                            const nd = selectedNode.data;
                            return (
                                <>
                                    <div className="text-[11px] font-mono font-bold mb-2.5 uppercase" style={{ color: C.inkSoft }}>Outcome node</div>
                                    <Field label="Classification">
                                        <select value={nd.outcomeType} onChange={(e) => setOutcomeType(selectedNode.id, e.target.value)} style={inputStyle}>
                                            {OUTCOME_TYPES.map((o) => (
                                                <option key={o.key} value={o.key}>{o.label}</option>
                                            ))}
                                        </select>
                                    </Field>
                                    {nd.outcomeType === "unlockEvent" ? (
                                        <div className="space-y-1.5 mb-2">
                                            <div className="text-[11px] font-mono font-semibold" style={{ color: C.inkFaint }}>Unlocked dispositions</div>
                                            {MANAGEMENT_LIBRARY["Disposition"].map((d) => {
                                                const checked = nd.unlockedDispositions.includes(d);
                                                return (
                                                    <label key={d} className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: C.ink }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() => {
                                                                const next = checked
                                                                    ? nd.unlockedDispositions.filter((x: string) => x !== d)
                                                                    : [...nd.unlockedDispositions, d];
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
                                                <TextArea value={nd.narrative} onChange={(e) => updateNodeData(selectedNode.id, { narrative: e.target.value })} className="min-h-[60px]" />
                                            </Field>
                                            <Field label="New symptoms" hint="Comma-separated">
                                                <TextArea value={nd.newSymptoms} onChange={(e) => updateNodeData(selectedNode.id, { newSymptoms: e.target.value })} className="min-h-[46px]" />
                                            </Field>
                                            <div className="text-[11.5px] font-sans font-semibold uppercase my-2" style={{ color: C.inkSoft }}>Resulting vitals</div>
                                            <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                                                {VITAL_DEFS.map((v) => (
                                                    <div key={v.key}>
                                                        <div className="text-[10px] font-mono" style={{ color: C.inkFaint }}>{v.label}</div>
                                                        <input
                                                            value={nd.vitalChanges[v.key]}
                                                            onChange={(e) => updateNodeData(selectedNode.id, { vitalChanges: { ...nd.vitalChanges, [v.key]: e.target.value } })}
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
                            );
                        })()}

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

"use client"

import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
    ReactFlow,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    addEdge as rfAddEdge,
    MarkerType,
    type Node,
    type Edge,
    type Connection,
    type OnNodesChange,
    type OnEdgesChange,
    type OnConnect,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
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
import { Trash2 } from "lucide-react";
import HistoryGraphNodeComponent from "./HistoryGraphNode";
import HistoryGraphEdgeComponent from "./HistoryGraphEdge";

const uid = () => Math.random().toString(36).slice(2, 10);

const nodeTypes = {
    historyNode: HistoryGraphNodeComponent,
};
const edgeTypes = {
    historyEdge: HistoryGraphEdgeComponent,
};

export default function StepHistory({ data, update }: StepProps) {
    const graph = data.historyGraph ?? { nodes: [], edges: [] };
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [activeCat, setActiveCat] = useState<HistoryCategoryType>("signs_symptoms");

    const setGraph = (patch: Partial<HistoryGraph>) => update({ historyGraph: { ...graph, ...patch } });

    // Filtered nodes/edges for the active category
    const catNodes = useMemo(
        () => graph.nodes.filter((n) => n.data.category === activeCat),
        [graph.nodes, activeCat]
    );
    const catEdges = useMemo(
        () => graph.edges.filter((e) => {
            const src = graph.nodes.find((n) => n.id === e.source);
            const tgt = graph.nodes.find((n) => n.id === e.target);
            return src && tgt && src.data.category === activeCat && tgt.data.category === activeCat;
        }),
        [graph.nodes, graph.edges, activeCat]
    );

    // React Flow state
    const [rfNodes, setRfNodes, onNodesChangeBase] = useNodesState<Node>([]);
    const [rfEdges, setRfEdges, onEdgesChangeBase] = useEdgesState<Edge>([]);

    // Sync from graph to RF when category/structure/selection changes
    useEffect(() => {
        setRfNodes(
            catNodes.map((n) => ({
                id: n.id,
                type: "historyNode",
                position: { x: n.x, y: n.y },
                data: { ...n.data },
                selected: n.id === selectedId,
            }))
        );
        setRfEdges(
            catEdges.map((e) => ({
                id: e.id,
                source: e.source,
                target: e.target,
                type: "historyEdge",
                data: { onDelete: deleteEdge },
                markerEnd: { type: MarkerType.ArrowClosed, color: C.lineStrong },
                style: { stroke: C.lineStrong, strokeWidth: 2 },
                selected: e.id === selectedId,
            }))
        );
    }, [activeCat, catNodes, catEdges, selectedId, setRfNodes, setRfEdges]);

    // Node changes — sync final positions to parent on drag end
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

    // Edge changes — handle selection & deletions
    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => {
            onEdgesChangeBase(changes);
            for (const ch of changes) {
                if (ch.type === "remove") {
                    setGraph({
                        edges: graph.edges.filter((e) => e.id !== ch.id),
                    });
                }
                if (ch.type === "select") {
                    setSelectedId(ch.selected ? ch.id : null);
                }
            }
        },
        [graph.edges, setGraph, onEdgesChangeBase]
    );

    // Connection — add new edge
    const onConnect: OnConnect = useCallback(
        (connection) => {
            if (!connection.source || !connection.target) return;
            const src = graph.nodes.find((n) => n.id === connection.source);
            const tgt = graph.nodes.find((n) => n.id === connection.target);
            if (!src || !tgt) return;
            if (src.data.category !== tgt.data.category) return;
            if (graph.edges.some((e) => e.source === connection.source && e.target === connection.target)) return;

            const id = uid();
            const newEdge = { id, source: connection.source, target: connection.target };
            setGraph({ edges: [...graph.edges, newEdge] });
            setRfEdges((eds) =>
                rfAddEdge(
                    {
                        id,
                        source: connection.source,
                        target: connection.target,
                        type: "historyEdge",
                        data: { onDelete: deleteEdge },
                        markerEnd: { type: MarkerType.ArrowClosed, color: C.lineStrong },
                        style: { stroke: C.lineStrong, strokeWidth: 2 },
                    },
                    eds
                )
            );
            setSelectedId(id);
        },
        [graph.nodes, graph.edges, setGraph, setRfEdges]
    );

    // Connection validation
    const isValidConnection = useCallback(
        (connection: Edge | Connection): boolean => {
            if (!connection.source || !connection.target) return false;
            if (connection.source === connection.target) return false;
            const src = graph.nodes.find((n) => n.id === connection.source);
            const tgt = graph.nodes.find((n) => n.id === connection.target);
            if (!src || !tgt) return false;
            if (src.data.category !== tgt.data.category) return false;
            if (graph.edges.some((e) => e.source === connection.source && e.target === connection.target)) return false;
            return true;
        },
        [graph.nodes, graph.edges]
    );

    const addNode = () => {
        const id = uid();
        const n: HistoryNode = {
            id,
            x: 60 + Math.random() * 100,
            y: 40 + Math.random() * 200,
            data: { category: activeCat, question: "", answer: "" },
        };
        setGraph({ nodes: [...graph.nodes, n] });
        setRfNodes((nds) => [
            ...nds,
            {
                id: n.id,
                type: "historyNode",
                position: { x: n.x, y: n.y },
                data: { ...n.data },
                selected: true,
            },
        ]);
        setSelectedId(id);
    };

    const updateNodeData = (id: string, patch: Partial<HistoryNode["data"]>) => {
        setGraph({ nodes: graph.nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)) });
        setRfNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)));
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

    const deleteEdge = (id: string) => {
        setGraph({ edges: graph.edges.filter((e) => e.id !== id) });
        setRfEdges((eds) => eds.filter((e) => e.id !== id));
        setSelectedId(null);
    };

    const selectedNode = selectedId ? graph.nodes.find((n) => n.id === selectedId) ?? null : null;
    const selectedEdge = selectedId && !selectedNode ? graph.edges.find((e) => e.id === selectedId) ?? null : null;
    const showGraph = graph.nodes.length > 0;

    return (
        <div>
            <SectionHeading
                eyebrow="02 \u00b7 Elicit"
                title="History taking"
                desc="Build a graph of questions for each history category. Connect nodes of the same category. Players navigate the graph to discover the patient\u2019s history."
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
                <PrimaryButton onClick={addNode} style={{ height: 37 }}>
                    + Add question
                </PrimaryButton>
            </div>

            {!showGraph && (
                <Card style={{ padding: 32, textAlign: "center" }}>
                    <div style={{ color: C.inkFaint, fontFamily: "'IBM Plex Sans'", fontSize: 14, marginBottom: 12 }}>
                        No history questions yet. Click <strong>&quot;+ Add question&quot;</strong> to start building your history graph.
                    </div>
                    <PrimaryButton onClick={addNode}>+ Add question</PrimaryButton>
                </Card>
            )}

            {showGraph && (
                <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
                    <div style={{ flex: 1, height: "calc(100vh - 280px)", border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden" }}>
                        <ReactFlow
                            nodes={rfNodes}
                            edges={rfEdges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            isValidConnection={isValidConnection}
                            nodeTypes={nodeTypes}
                            edgeTypes={edgeTypes}
                            fitView
                            minZoom={0.3}
                            maxZoom={3}
                            onPaneClick={() => setSelectedId(null)}
                            deleteKeyCode={["Backspace", "Delete"]}
                            snapToGrid
                            snapGrid={[10, 10]}
                        >
                            <Background gap={20} size={1} color={C.line} />
                            <Controls showInteractive={false} />
                        </ReactFlow>
                    </div>
                </div>
            )}

            {/* Inspector panel — fixed right side */}
            {(selectedNode || selectedEdge) && (
                <div style={{
                    position: "fixed",
                    right: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 100,
                    width: 320,
                    maxHeight: "calc(100vh - 60px)",
                    overflowY: "auto",
                    background: C.surface,
                    border: `1px solid ${C.line}`,
                    borderRadius: 10,
                    //boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                    padding: 16,
                }}>
                    <div style={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 8 }}>
                        {selectedNode && (
                            <button
                                onClick={() => deleteNode(selectedNode.id)}
                                style={{
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                    padding: 2,
                                    color: C.critical,
                                    display: "flex",
                                }}
                                aria-label="Delete question"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                        {selectedEdge && (
                            <button
                                onClick={() => deleteEdge(selectedEdge.id)}
                                style={{
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                    padding: 2,
                                    color: C.critical,
                                    display: "flex",
                                }}
                                aria-label="Remove edge"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>

                    {selectedNode && (
                        <div>
                            <div style={{ marginBottom: 16, paddingRight: 40 }}>
                                <span style={{ fontFamily: "'IBM Plex Sans'", fontWeight: 600, fontSize: 12, color: C.ink }}>Edit question</span>
                            </div>

                            <Field label="Question">
                                <TextInput
                                    value={selectedNode.data.question}
                                    onChange={(e) => updateNodeData(selectedNode.id, { question: e.target.value })}
                                    placeholder="e.g. Do you have any chronic medical conditions?"
                                    style={{ fontSize: 12.5, padding: "6px 10px" }}
                                />
                            </Field>
                            <Field label="Answer">
                                <TextArea
                                    value={selectedNode.data.answer}
                                    onChange={(e) => updateNodeData(selectedNode.id, { answer: e.target.value })}
                                    placeholder="e.g. Yes, I have hypertension and type 2 diabetes."
                                    style={{ fontSize: 12.5, padding: "6px 10px", minHeight: 60 }}
                                />
                            </Field>
                        </div>
                    )}
                    {selectedEdge && (
                        <div>
                            <div style={{ marginBottom: 16, paddingRight: 40 }}>
                                <span style={{ fontFamily: "'IBM Plex Sans'", fontWeight: 600, fontSize: 12, color: C.ink }}>Edge</span>
                            </div>
                            <div style={{ fontSize: 11.5, color: C.inkSoft, fontFamily: "'IBM Plex Sans'" }}>
                                <div style={{ marginBottom: 8 }}>
                                    From: <strong>{graph.nodes.find((n) => n.id === selectedEdge.source)?.data.question || "?"}</strong>
                                </div>
                                <div>
                                    To: <strong>{graph.nodes.find((n) => n.id === selectedEdge.target)?.data.question || "?"}</strong>
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: 16 }}>
                        <button
                            onClick={() => setSelectedId(null)}
                            style={{
                                width: "100%",
                                border: "none",
                                borderRadius: 6,
                                padding: "8px 16px",
                                background: C.accent,
                                color: "#fff",
                                fontFamily: "'IBM Plex Sans'",
                                fontWeight: 600,
                                fontSize: 12.5,
                                cursor: "pointer",
                            }}
                        >
                            Save
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

"use client"

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
    C, MANAGEMENT_LIBRARY, MEDICATION_DOSES, OUTCOME_TYPES, VITAL_DEFS, NODE_SIZE, NODE_META,
} from "./database";
import { Chip } from "./ui";

function ManagementNode({ data, selected }: NodeProps) {
    const node = data.node as {
        id: string;
        type: string;
        x: number;
        y: number;
        data: Record<string, unknown>;
    };
    const size = NODE_SIZE[node.type];
    const isOutcome = node.type === "outcome";
    const outcomeDef = isOutcome ? OUTCOME_TYPES.find((o) => o.key === (node.data as any).outcomeType) : null;
    const meta = isOutcome && outcomeDef ? { label: outcomeDef.label, color: outcomeDef.color, soft: outcomeDef.soft } : (NODE_META[node.type] ?? { label: "?", color: "#888", soft: "#eee" });

    return (
        <div
            style={{
                width: size.w,
                minHeight: size.h,
                background: C.surface,
                border: `2px solid ${selected ? C.ink : meta.color}`,
                borderRadius: 9,
                boxShadow: selected ? "0 3px 10px rgba(27,36,48,0.18)" : "0 1px 4px rgba(27,36,48,0.08)",
                cursor: "grab",
                overflow: "hidden",
                boxSizing: "border-box",
            }}
        >
            {node.type !== "start" && (
                <Handle
                    type="target"
                    position={Position.Left}
                    style={{
                        width: 14,
                        height: 14,
                        background: C.surface,
                        border: `2px solid ${meta.color}`,
                        borderRadius: "50%",
                        left: -8,
                    }}
                />
            )}
            <div
                style={{
                    padding: "5px 10px",
                    background: meta.soft,
                    fontSize: 10.5,
                    fontFamily: "'IBM Plex Mono'",
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    color: meta.color,
                }}
            >
                {node.type === "outcome" ? "Outcome" : meta.label}
            </div>
            <div style={{ padding: "8px 10px" }}>
                {node.type === "start" && <span style={{ fontSize: 13, fontFamily: "'IBM Plex Sans'", color: C.inkSoft }}>Case begins</span>}
                {node.type === "timer" && (
                    <>
                        <div style={{ fontSize: 20, fontFamily: "'IBM Plex Mono'", fontWeight: 700, color: C.blue }}>
                            {(node.data as any).minutes || 0}<span style={{ fontSize: 12 }}> min</span>
                        </div>
                        <div style={{ fontSize: 11.5, fontFamily: "'IBM Plex Sans'", marginTop: 2, color: C.inkSoft }}>
                            {(node.data as any).note || "—"}
                        </div>
                    </>
                )}
                {node.type === "intervention" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {((node.data as any).actions ?? []).map((a: string) => {
                            const dose = (node.data as any).doseMap?.[a];
                            return (
                                <div key={a} style={{ fontSize: 13, fontFamily: "'IBM Plex Sans'", color: C.ink }}>
                                    · {a}{dose ? <span style={{ color: C.accent }}> — {dose}</span> : ""}
                                </div>
                            );
                        })}
                    </div>
                )}
                {node.type === "required" && (
                    <>
                        <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono'", fontWeight: 600, color: meta.color }}>Required:</div>
                        <div style={{ fontSize: 12, fontFamily: "'IBM Plex Sans'", marginTop: 2, lineHeight: 1.3, color: C.ink }}>
                            {((node.data as any).actions ?? []).map((group: any, gi: number) => (
                                <span key={gi}>
                                    {gi > 0 && <span style={{ fontSize: 10, fontFamily: "'IBM Plex Mono'", margin: "0 2px", color: C.inkFaint }}>AND</span>}
                                    <span>({(group.or ?? []).map((a: string) => {
                                        const dose = (node.data as any).doseMap?.[a];
                                        return dose ? `${a} → ${dose}` : a;
                                    }).join(" OR ")})</span>
                                </span>
                            )) || "—"}
                        </div>
                    </>
                )}
                {node.type === "outcome" && outcomeDef && outcomeDef.key === "unlockEvent" && (node.data as any).outcomeType === "unlockEvent" && (
                    <>
                        <Chip color={outcomeDef.color} soft={outcomeDef.soft}>{outcomeDef.label}</Chip>
                        {(node.data as any).unlockedDispositions?.length > 0 ? (
                            <div style={{ fontSize: 11.5, fontFamily: "'IBM Plex Sans'", marginTop: 4, lineHeight: 1.3, color: C.inkSoft }}>
                                Unlocks: {(node.data as any).unlockedDispositions.join(", ")}
                            </div>
                        ) : (
                            <div style={{ fontSize: 11.5, fontFamily: "'IBM Plex Sans'", marginTop: 4, fontStyle: "italic", color: C.inkFaint }}>
                                No dispositions selected
                            </div>
                        )}
                    </>
                )}
                {node.type === "outcome" && outcomeDef && outcomeDef.key !== "unlockEvent" && (node.data as any).outcomeType !== "unlockEvent" && (
                    <>
                        <Chip color={outcomeDef.color} soft={outcomeDef.soft}>{outcomeDef.label}</Chip>
                        <div style={{ fontSize: 11.5, fontFamily: "'IBM Plex Sans'", marginTop: 6, lineHeight: 1.3, color: C.inkSoft }}>
                            {(node.data as any).narrative ? ((node.data as any).narrative.length > 70 ? (node.data as any).narrative.slice(0, 70) + "…" : (node.data as any).narrative) : "No narrative yet"}
                        </div>
                    </>
                )}
                {node.type === "end" && (
                    <>
                        <Chip color={(node.data as any).outcome === "win" ? C.normal : C.critical} soft={(node.data as any).outcome === "win" ? C.normalSoft : C.criticalSoft}>
                            {(node.data as any).outcome === "win" ? "WIN" : "LOSE"}
                        </Chip>
                        <div style={{ fontSize: 13, fontFamily: "'IBM Plex Sans'", fontWeight: 500, marginTop: 4, color: C.ink }}>
                            {(node.data as any).narrative || "End simulation"}
                        </div>
                    </>
                )}
            </div>
            {node.type !== "end" && (
                <Handle
                    type="source"
                    position={Position.Right}
                    style={{
                        width: 14,
                        height: 14,
                        background: meta.color,
                        border: `2px solid ${C.surface}`,
                        borderRadius: "50%",
                        right: -8,
                        cursor: "crosshair",
                    }}
                />
            )}
        </div>
    );
}

export default memo(ManagementNode);

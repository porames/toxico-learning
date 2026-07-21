"use client"

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { HISTORY_CATEGORIES, C } from "./database";

const NODE_W = 240;
const NODE_H = 100;

function catDef(cat: string) {
    return HISTORY_CATEGORIES.find((c) => c.key === cat) ?? HISTORY_CATEGORIES[0];
}

function HistoryGraphNode({ data, selected }: NodeProps) {
    const cat = catDef(data.category as string);
    const question = data.question as string | undefined;
    const answer = data.answer as string | undefined;
    return (
        <div
            style={{
                width: NODE_W,
                minHeight: NODE_H,
                background: C.surface,
                border: `2px solid ${selected ? C.ink : cat.color}`,
                borderRadius: 9,
                boxShadow: selected ? "0 3px 10px rgba(27,36,48,0.18)" : "0 1px 4px rgba(27,36,48,0.08)",
                cursor: "grab",
                overflow: "hidden",
            }}
        >
            <Handle
                type="target"
                position={Position.Left}
                style={{
                    width: 14,
                    height: 14,
                    background: C.surface,
                    border: `2px solid ${cat.color}`,
                    borderRadius: "50%",
                    left: -8,
                }}
            />
            <div
                style={{
                    padding: "5px 10px",
                    background: cat.soft,
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
                {question ? (
                    <div style={{ fontSize: 13, fontFamily: "'IBM Plex Sans'", color: C.ink, fontWeight: 500, lineHeight: 1.3 }}>
                        {question.length > 60 ? question.slice(0, 60) + "\u2026" : question}
                    </div>
                ) : (
                    <div style={{ fontSize: 12, fontFamily: "'IBM Plex Sans'", color: C.inkFaint, fontStyle: "italic" }}>
                        No question set
                    </div>
                )}
                {answer && (
                    <div style={{ fontSize: 11.5, fontFamily: "'IBM Plex Sans'", color: C.inkSoft, marginTop: 4, lineHeight: 1.3 }}>
                        {answer.length > 80 ? answer.slice(0, 80) + "\u2026" : answer}
                    </div>
                )}
            </div>
            <Handle
                type="source"
                position={Position.Right}
                style={{
                    width: 14,
                    height: 14,
                    background: cat.color,
                    border: `2px solid ${C.surface}`,
                    borderRadius: "50%",
                    right: -8,
                    cursor: "crosshair",
                }}
            />
        </div>
    );
}

export default memo(HistoryGraphNode);

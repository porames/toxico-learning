"use client"

import { BaseEdge, EdgeToolbar, getBezierPath, type EdgeProps } from "@xyflow/react";
import { Trash2 } from "lucide-react";
import { C } from "./database";

export default function HistoryGraphEdge(props: EdgeProps) {
    const {
        id,
        sourceX, sourceY,
        targetX, targetY,
        sourcePosition, targetPosition,
        selected,
        data,
        style,
        markerEnd,
    } = props;

    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX, sourceY, sourcePosition,
        targetX, targetY, targetPosition,
    });

    return (
        <>
            <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />
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

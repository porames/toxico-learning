import type { ManagementGraph } from "./types";

export function getOutgoingNodes(graph: ManagementGraph, nodeId: string) {
    return graph.edges
        .filter(e => e.source === nodeId)
        .map(e => graph.nodes.find(n => n.id === e.target)!)
        .filter(Boolean);
}

export function getNeighbors(graph: ManagementGraph, nodeId: string) {
    const outgoing = graph.edges.filter(e => e.source === nodeId).map(e => e.target);
    const incoming = graph.edges.filter(e => e.target === nodeId).map(e => e.source);
    return { outgoing, incoming };
}

import type { ManagementGraph, RequiredInterventionNodeData } from "./types";

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

export function isInterventionRequired(
    requiredData: RequiredInterventionNodeData,
    name: string,
    dose?: string
): boolean {
    // Check if the action name exists in any OR group
    const nameFound = requiredData.actions.some((group) =>
        group.or.includes(name)
    );

    if (!nameFound) return false;

    // If a doseMap exists for this action, verify the dose matches
    const requiredDose = requiredData.doseMap?.[name];
    if (requiredDose) {
        return dose === requiredDose;
    }

    // No dose requirement → name match is enough
    return true;
}
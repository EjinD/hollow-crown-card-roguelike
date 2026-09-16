import type { MapNode } from "../types/game";
import { getFloorIndex } from "../data/map";

export interface MapPosition {
    left: string;
    top: string;
}

export interface MapCoordinates {
    x: number;
    y: number;
}

export function getLayerIndex(nodeId: string): number {
    return getFloorIndex(nodeId);
}

export function getNodesByLayer(
    nodes: MapNode[],
    layerIndex: number,
): MapNode[] {
    return nodes.filter(
        (node) => getLayerIndex(node.id) === layerIndex,
    );
}

function getLayerX(nodeIndex: number, layerSize: number): number {
    if (layerSize <= 1) {
        return 50;
    }

    if (layerSize === 2) {
        return nodeIndex === 0 ? 30 : 70;
    }

    const slots = [18, 50, 82];
    return slots[Math.min(nodeIndex, slots.length - 1)];
}

export function getMapCoordinates(
    node: MapNode,
    nodes: MapNode[],
): MapCoordinates {
    const floor = getLayerIndex(node.id);
    const floors = nodes.map((item) => getLayerIndex(item.id));
    const floorCount = Math.max(...floors, 1);
    const layerNodes = getNodesByLayer(nodes, floor);
    const nodeIndex = layerNodes.findIndex(
        (item) => item.id === node.id,
    );

    // Floor 1 is the top of the descent. The boss is physically lower.
    const progress =
        floorCount <= 1
            ? 0
            : (floor - 1) / (floorCount - 1);

    const x = getLayerX(
        Math.max(nodeIndex, 0),
        layerNodes.length,
    );

    const y = 4 + progress * 92;

    return { x, y };
}

export function getMapPosition(
    node: MapNode,
    nodes: MapNode[],
): MapPosition {
    const { x, y } = getMapCoordinates(node, nodes);

    return {
        left: `${x}%`,
        top: `${y}%`,
    };
}

export function getMapCanvasHeight(floorCount: number): number {
    return Math.max(2200, floorCount * 175 + 140);
}

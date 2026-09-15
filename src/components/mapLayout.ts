import type { MapNode } from "../types/game";

export interface MapPosition {
    left: string;
    top: string;
}

export interface MapCoordinates {
    x: number;
    y: number;
}

const LAYER_X_POSITIONS: Record<number, number> = {
    1: 10,
    2: 30,
    3: 50,
    4: 70,
    5: 90,
};

export function getLayerIndex(
    nodeId: string,
): number {
    const match = nodeId.match(
        /^layer-(\d+)-/,
    );

    return match
        ? Number(match[1])
        : 0;
}

export function getNodesByLayer(
    nodes: MapNode[],
    layerIndex: number,
): MapNode[] {
    return nodes.filter(
        (node) =>
            getLayerIndex(node.id) ===
            layerIndex,
    );
}

export function getMapCoordinates(
    node: MapNode,
    nodes: MapNode[],
): MapCoordinates {
    const layerIndex =
        getLayerIndex(node.id);

    const layerNodes =
        getNodesByLayer(
            nodes,
            layerIndex,
        );

    const nodeIndex =
        layerNodes.findIndex(
            (layerNode) =>
                layerNode.id === node.id,
        );

    const x =
        LAYER_X_POSITIONS[
            layerIndex
        ] ?? 50;

    const y =
        layerNodes.length <= 1
            ? 50
            : 20 +
              (nodeIndex /
                  (layerNodes.length - 1)) *
                  60;

    return {
        x,
        y,
    };
}

export function getMapPosition(
    node: MapNode,
    nodes: MapNode[],
): MapPosition {
    const {
        x,
        y,
    } = getMapCoordinates(
        node,
        nodes,
    );

    return {
        left: `${x}%`,
        top: `${y}%`,
    };
}
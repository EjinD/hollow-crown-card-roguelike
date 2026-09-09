import type { MapNode } from "../types/game";

interface MapConnectionsProps {
    nodes: MapNode[];
    currentNodeId: string;
}

function getLayerIndex(nodeId: string): number {
    const match = nodeId.match(/^layer-(\d+)-/);

    return match ? Number(match[1]) : 0;
}

function getNodePosition(
    node: MapNode,
    nodes: MapNode[],
): { x: number; y: number } {
    const layerIndex = getLayerIndex(node.id);

    const layerNodes = nodes.filter(
        (candidate) =>
            getLayerIndex(candidate.id) === layerIndex,
    );

    const nodeIndex = layerNodes.findIndex(
        (candidate) => candidate.id === node.id,
    );

    const xPositions: Record<number, number> = {
        1: 10,
        2: 30,
        3: 50,
        4: 70,
        5: 90,
    };

    const x =
        xPositions[layerIndex] ??
        50;

    const y =
        layerNodes.length === 1
            ? 50
            : 20 +
              (nodeIndex /
                  (layerNodes.length - 1)) *
                  60;

    return { x, y };
}

export default function MapConnections({
    nodes,
    currentNodeId,
}: MapConnectionsProps) {
    return (
        <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
        >
            {nodes.flatMap((node) =>
                node.nextNodeIds.map(
                    (nextNodeId) => {
                        const nextNode =
                            nodes.find(
                                (candidate) =>
                                    candidate.id ===
                                    nextNodeId,
                            );

                        if (!nextNode) {
                            return null;
                        }

                        const start =
                            getNodePosition(
                                node,
                                nodes,
                            );

                        const end =
                            getNodePosition(
                                nextNode,
                                nodes,
                            );

                        const isCurrentPath =
                            node.id ===
                            currentNodeId;

                        const isCompletedPath =
                            node.completed;

                        const isActive =
                            isCurrentPath ||
                            isCompletedPath;

                        return (
                            <line
                                key={`${node.id}-${nextNode.id}`}
                                x1={start.x}
                                y1={start.y}
                                x2={end.x}
                                y2={end.y}
                                stroke={
                                    isActive
                                        ? "#c24124"
                                        : "#46352d"
                                }
                                strokeWidth={
                                    isActive
                                        ? 0.8
                                        : 0.45
                                }
                                strokeLinecap="round"
                                opacity={
                                    isActive
                                        ? 0.9
                                        : 0.55
                                }
                            />
                        );
                    },
                ),
            )}
        </svg>
    );
}
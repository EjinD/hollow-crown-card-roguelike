import type { MapNode } from "../types/game";
import {
    getMapCoordinates,
} from "./mapLayout";

interface MapConnectionsProps {
    nodes: MapNode[];
    currentNodeId: string;
    availableNodeIds: Set<string>;
}

export default function MapConnections({
    nodes,
    currentNodeId,
    availableNodeIds,
}: MapConnectionsProps) {
    return (
        <svg
            className="pointer-events-none absolute inset-0 z-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
        >
            {nodes.flatMap(
                (node) =>
                    node.nextNodeIds.map(
                        (nextNodeId) => {
                            const nextNode =
                                nodes.find(
                                    (
                                        candidate,
                                    ) =>
                                        candidate.id ===
                                        nextNodeId,
                                );

                            if (!nextNode) {
                                return null;
                            }

                            const start =
                                getMapCoordinates(
                                    node,
                                    nodes,
                                );

                            const end =
                                getMapCoordinates(
                                    nextNode,
                                    nodes,
                                );

                            const isFromCurrent =
                                node.id ===
                                currentNodeId;

                            const isCompletedPath =
                                node.completed;

                            const isAvailablePath =
                                availableNodeIds.has(
                                    nextNode.id,
                                );

                            const isActive =
                                isFromCurrent ||
                                isCompletedPath;

                            const isHighlighted =
                                isActive ||
                                isAvailablePath;

                            return (
                                <line
                                    key={`${node.id}-${nextNode.id}`}
                                    x1={
                                        start.x
                                    }
                                    y1={
                                        start.y
                                    }
                                    x2={
                                        end.x
                                    }
                                    y2={
                                        end.y
                                    }
                                    stroke={
                                        isActive
                                            ? "#c24124"
                                            : isHighlighted
                                              ? "#8b4934"
                                              : "#46352d"
                                    }
                                    strokeWidth={
                                        isActive
                                            ? 0.8
                                            : isHighlighted
                                              ? 0.6
                                              : 0.4
                                    }
                                    strokeLinecap="round"
                                    opacity={
                                        isActive
                                            ? 0.9
                                            : isHighlighted
                                              ? 0.75
                                              : 0.4
                                    }
                                />
                            );
                        },
                    ),
            )}
        </svg>
    );
}
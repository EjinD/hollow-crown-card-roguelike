import type { MapNode } from "../types/game";
import { getMapCoordinates } from "./mapLayout";

interface MapConnectionsProps {
    nodes: MapNode[];
    currentNodeId: string;
    availableNodeIds: Set<string>;
}

function buildCurve(
    start: { x: number; y: number },
    end: { x: number; y: number },
): string {
    const controlY = (start.y + end.y) / 2;
    const bend = Math.max(2.5, Math.abs(end.x - start.x) * 0.04);
    const controlX1 = start.x + (end.x - start.x) * 0.18;
    const controlX2 = end.x - (end.x - start.x) * 0.18;

    return `M ${start.x} ${start.y} C ${controlX1 + bend} ${controlY - bend}, ${controlX2 - bend} ${controlY + bend}, ${end.x} ${end.y}`;
}

export default function MapConnections({
    nodes,
    currentNodeId,
    availableNodeIds,
}: MapConnectionsProps) {
    return (
        <svg
            className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
        >
            <defs>
                <filter id="route-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="0.65" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {nodes.flatMap((node) =>
                node.nextNodeIds.map((nextNodeId) => {
                    const nextNode = nodes.find(
                        (candidate) => candidate.id === nextNodeId,
                    );

                    if (!nextNode) {
                        return null;
                    }

                    const start = getMapCoordinates(node, nodes);
                    const end = getMapCoordinates(nextNode, nodes);
                    const isCurrentRoute = node.id === currentNodeId;
                    const isCompletedRoute = node.completed;
                    const isAvailableRoute = availableNodeIds.has(nextNode.id);
                    const isHighlighted =
                        isCurrentRoute ||
                        isCompletedRoute ||
                        isAvailableRoute;

                    const path = buildCurve(start, end);

                    return (
                        <g key={`${node.id}-${nextNode.id}`}>
                            {isHighlighted && (
                                <path
                                    d={path}
                                    fill="none"
                                    stroke="#d65a32"
                                    strokeWidth="1.7"
                                    strokeLinecap="round"
                                    opacity={isCurrentRoute || isCompletedRoute ? 0.22 : 0.12}
                                    filter="url(#route-glow)"
                                />
                            )}

                            <path
                                d={path}
                                fill="none"
                                stroke={
                                    isCurrentRoute || isCompletedRoute
                                        ? "#cb542f"
                                        : isAvailableRoute
                                          ? "#8d503a"
                                          : "#4a403b"
                                }
                                strokeWidth={
                                    isCurrentRoute || isCompletedRoute
                                        ? 0.9
                                        : isAvailableRoute
                                          ? 0.72
                                          : 0.48
                                }
                                strokeDasharray={
                                    isHighlighted ? undefined : "1.4 1.6"
                                }
                                strokeLinecap="round"
                                opacity={
                                    isCurrentRoute || isCompletedRoute
                                        ? 0.95
                                        : isAvailableRoute
                                          ? 0.75
                                          : 0.32
                                }
                            />

                            {isHighlighted && (
                                <circle
                                    cx={start.x}
                                    cy={start.y}
                                    r="0.65"
                                    fill="#e98752"
                                    opacity="0.55"
                                />
                            )}
                        </g>
                    );
                }),
            )}
        </svg>
    );
}

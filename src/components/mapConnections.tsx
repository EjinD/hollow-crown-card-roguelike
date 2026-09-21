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
    const dx = end.x - start.x;
    const bend = Math.max(1.8, Math.abs(dx) * 0.035);
    const controlX1 = start.x + dx * 0.2;
    const controlX2 = end.x - dx * 0.2;

    return `M ${start.x} ${start.y} C ${controlX1 + bend} ${controlY - bend}, ${controlX2 - bend} ${controlY + bend}, ${end.x} ${end.y}`;
}

export default function MapConnections({
    nodes,
    currentNodeId,
    availableNodeIds,
}: MapConnectionsProps) {
    return (
        <svg
            className="hc-map-connections"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            <defs>
                <filter id="hc-map-route-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="0.55" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <linearGradient id="hc-route-active" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e9b36b" />
                    <stop offset="100%" stopColor="#a94420" />
                </linearGradient>
            </defs>

            {nodes.flatMap((node) =>
                node.nextNodeIds.map((nextNodeId) => {
                    const nextNode = nodes.find((candidate) => candidate.id === nextNodeId);

                    if (!nextNode) {
                        return null;
                    }

                    const start = getMapCoordinates(node, nodes);
                    const end = getMapCoordinates(nextNode, nodes);
                    const isActive = node.id === currentNodeId;
                    const isCompleted = node.completed;
                    const isAvailable = availableNodeIds.has(nextNode.id);
                    const isUnlocked = isActive || isCompleted || isAvailable;
                    const path = buildCurve(start, end);

                    return (
                        <g key={`${node.id}-${nextNode.id}`} className={isUnlocked ? "is-unlocked" : "is-locked"}>
                            {isUnlocked && (
                                <path
                                    d={path}
                                    fill="none"
                                    stroke="url(#hc-route-active)"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    opacity={isActive || isCompleted ? 0.2 : 0.1}
                                    filter="url(#hc-map-route-glow)"
                                />
                            )}
                            <path
                                d={path}
                                fill="none"
                                stroke={isActive || isCompleted ? "url(#hc-route-active)" : isAvailable ? "#b87345" : "#3b3029"}
                                strokeWidth={isActive || isCompleted ? 0.82 : isAvailable ? 0.62 : 0.42}
                                strokeLinecap="round"
                                strokeDasharray={isUnlocked ? undefined : "1.2 1.8"}
                                opacity={isActive || isCompleted ? 0.92 : isAvailable ? 0.78 : 0.3}
                            />
                            {isAvailable && (
                                <circle
                                    className="hc-map-route__spark"
                                    cx={start.x}
                                    cy={start.y}
                                    r="0.45"
                                    fill="#f1b36b"
                                />
                            )}
                        </g>
                    );
                }),
            )}
        </svg>
    );
}

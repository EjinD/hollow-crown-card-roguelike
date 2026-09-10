import type { RunState } from "../types/game";

import {
    getAvailableNextNodes,
} from "../state/run";

import MapNode from "./MapNode";
import MapConnections from "./mapConnections";
interface MapScreenProps {
    run: RunState;
    onSelectNode: (nodeId: string) => void;
    onEnterCurrentNode: () => void;
}

export default function MapScreen({
    run,
    onSelectNode,
    onEnterCurrentNode
}: MapScreenProps) {
        const availableNodes =
        getAvailableNextNodes(run);

        const availableNodeIds = new Set(
        availableNodes.map(
            (node) => node.id,
        ),
    );
        const layers = new Map<number, typeof run.map.nodes>();

        for (const node of run.map.nodes) {
            const match = node.id.match(/^layer-(\d+)-/);

            if (!match) {
                continue;
            }

            const layerIndex = Number(match[1]);

            const layer = layers.get(layerIndex) ?? [];

            layer.push(node);

            layers.set(layerIndex, layer);
        }

        function handleNodeSelect(
    nodeId: string,
) {
    if (nodeId === run.map.currentNodeId) {
        onEnterCurrentNode();
        return;
    }

    onSelectNode(nodeId);
}
    function getNodePosition(
    nodeId: string,
    nodes: typeof run.map.nodes,
): { left: string; top: string } {
    const match = nodeId.match(
        /^layer-(\d+)-/,
    );

    if (!match) {
        return {
            left: "50%",
            top: "50%",
        };
    }

    const layerIndex =
        Number(match[1]);

    const layerNodes =
        nodes.filter((node) => {
            const nodeMatch =
                node.id.match(
                    /^layer-(\d+)-/,
                );

            return (
                nodeMatch &&
                Number(nodeMatch[1]) ===
                    layerIndex
            );
        });

    const nodeIndex =
        layerNodes.findIndex(
            (node) =>
                node.id === nodeId,
        );

    const xPositions: Record<
        number,
        number
    > = {
        1: 10,
        2: 30,
        3: 50,
        4: 70,
        5: 90,
    };

    const left =
        xPositions[layerIndex] ?? 50;

    const top =
        layerNodes.length === 1
            ? 50
            : 20 +
              (nodeIndex /
                  (layerNodes.length - 1)) *
                  60;

    return {
        left: `${left}%`,
        top: `${top}%`,
    };
}

return (
    <section className="mt-6 min-h-[650px] rounded-2xl border border-stone-800 bg-black/30 p-8">
    <div className="relative min-h-[580px] w-full overflow-hidden rounded-xl">
        <MapConnections
            nodes={run.map.nodes}
            currentNodeId={
                run.map.currentNodeId
            }
        />

        {run.map.nodes.map((node) => {
            const position =
                getNodePosition(
                    node.id,
                    run.map.nodes,
                );

            return (
                <div
                    key={node.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{
                        left: position.left,
                        top: position.top,
                    }}
                >
                    <MapNode
                        node={node}
                        isCurrent={
                            node.id ===
                            run.map.currentNodeId
                        }
                        isAvailable={availableNodeIds.has(
                            node.id,
                        )}
                        onClick={
                            handleNodeSelect
                        }
                    />
                </div>
            );
        })}
    </div>
</section>
);
}
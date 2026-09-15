import type {
    RunState,
} from "../types/game";

import {
    getAvailableNextNodes,
} from "../state/run";

import MapNode from "./MapNode";
import MapConnections from "./mapConnections";
import MapBackground from "./mapBackground";

import {
    getMapPosition,
    getLayerIndex,
} from "./mapLayout";

interface MapScreenProps {
    run: RunState;
    onSelectNode: (
        nodeId: string,
    ) => void;
    onEnterCurrentNode: () => void;
}

function getLayerLabel(
    layerIndex: number,
): string {
    switch (layerIndex) {
        case 1:
            return "The Beginning";

        case 2:
            return "Deep Forest";

        case 3:
            return "The Ruins";

        case 4:
            return "Goblin Territory";

        case 5:
            return "Throne Room";

        default:
            return `Layer ${layerIndex}`;
    }
}

export default function MapScreen({
    run,
    onSelectNode,
    onEnterCurrentNode,
}: MapScreenProps) {
    const availableNodes =
        getAvailableNextNodes(run);

    const availableNodeIds =
        new Set(
            availableNodes.map(
                (node) =>
                    node.id,
            ),
        );

    const currentNode =
        run.map.nodes.find(
            (node) =>
                node.id ===
                run.map.currentNodeId,
        );

    const layers = new Map<
        number,
        typeof run.map.nodes
    >();

    for (const node of run.map
        .nodes) {
        const layerIndex =
            getLayerIndex(
                node.id,
            );

        if (!layerIndex) {
            continue;
        }

        const layer =
            layers.get(
                layerIndex,
            ) ?? [];

        layer.push(node);

        layers.set(
            layerIndex,
            layer,
        );
    }

    function handleNodeSelect(
        nodeId: string,
    ) {
        if (
            nodeId ===
            run.map.currentNodeId
        ) {
            onEnterCurrentNode();
            return;
        }

        onSelectNode(nodeId);
    }

    return (
        <MapBackground>
            <main className="mx-auto min-h-screen max-w-7xl px-8 py-8">
                {/* Header */}
                <header className="flex items-start justify-between border-b border-stone-900 pb-6">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.45em] text-stone-600">
                            Adventure
                        </p>

                        <h1 className="mt-2 font-serif text-4xl font-bold uppercase tracking-[0.18em]">
                            The Burning Path
                        </h1>

                        <p className="mt-2 text-sm text-stone-600">
                            Choose your path
                        </p>
                    </div>

                    <div className="flex items-center gap-8 text-right">
                        <div>
                            <p className="text-[9px] uppercase tracking-[0.3em] text-stone-600">
                                HP
                            </p>

                            <p className="mt-1 text-xl font-semibold">
                                <span className="text-red-400">
                                    {run.hp}
                                </span>

                                <span className="text-stone-700">
                                    {" / "}
                                    {run.maxHp}
                                </span>
                            </p>
                        </div>

                        <div>
                            <p className="text-[9px] uppercase tracking-[0.3em] text-stone-600">
                                Deck
                            </p>

                            <p className="mt-1 text-xl font-semibold text-stone-300">
                                {run.deck.length}
                            </p>
                        </div>

                        <div>
                            <p className="text-[9px] uppercase tracking-[0.3em] text-stone-600">
                                Gold
                            </p>

                            <p className="mt-1 text-xl font-semibold text-amber-400">
                                {run.gold}
                            </p>
                        </div>
                    </div>
                </header>

                {/* Current node */}
                <div className="mt-6 flex items-center justify-between">
                    <div>
                        <p className="text-[9px] uppercase tracking-[0.35em] text-stone-600">
                            Current Location
                        </p>

                        <p className="mt-1 text-sm uppercase tracking-[0.18em] text-stone-400">
                            {currentNode
                                ? getLayerLabel(
                                      getLayerIndex(
                                          currentNode.id,
                                      ),
                                  )
                                : "Unknown"}
                        </p>
                    </div>

                    <p className="text-[9px] uppercase tracking-[0.25em] text-stone-700">
                        Choose an available node
                    </p>
                </div>

                {/* Map */}
                <section className="relative mt-6 min-h-[650px] overflow-hidden rounded-2xl border border-stone-800 bg-black/30 p-8 shadow-2xl">
                    {/* Layer labels */}
                    <div className="pointer-events-none absolute inset-x-8 top-4 z-10 flex justify-between">
                        {Array.from(
                            layers.keys(),
                        )
                            .sort(
                                (
                                    a,
                                    b,
                                ) =>
                                    a - b,
                            )
                            .map(
                                (
                                    layerIndex,
                                ) => (
                                    <div
                                        key={
                                            layerIndex
                                        }
                                        className="w-20 text-center"
                                    >
                                        <span className="text-[7px] uppercase tracking-[0.18em] text-stone-700">
                                            {getLayerLabel(
                                                layerIndex,
                                            )}
                                        </span>
                                    </div>
                                ),
                            )}
                    </div>

                    <div className="relative min-h-[580px] w-full overflow-hidden rounded-xl">
                        <MapConnections
                            nodes={
                                run.map
                                    .nodes
                            }
                            currentNodeId={
                                run.map
                                    .currentNodeId
                            }
                            availableNodeIds={
                                availableNodeIds
                            }
                        />

                        {run.map.nodes.map(
                            (
                                node,
                            ) => {
                                const position =
                                    getMapPosition(
                                        node,
                                        run
                                            .map
                                            .nodes,
                                    );

                                return (
                                    <div
                                        key={
                                            node.id
                                        }
                                        className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                                        style={{
                                            left:
                                                position.left,
                                            top:
                                                position.top,
                                        }}
                                    >
                                        <MapNode
                                            node={
                                                node
                                            }
                                            isCurrent={
                                                node.id ===
                                                run
                                                    .map
                                                    .currentNodeId
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
                            },
                        )}
                    </div>
                </section>

                {/* Legend */}
                <footer className="mt-6 flex items-center justify-between border-t border-stone-900 pt-5">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.6)]" />

                            <span className="text-[9px] uppercase tracking-[0.2em] text-stone-600">
                                Current
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-stone-500" />

                            <span className="text-[9px] uppercase tracking-[0.2em] text-stone-600">
                                Available
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-stone-800" />

                            <span className="text-[9px] uppercase tracking-[0.2em] text-stone-600">
                                Locked
                            </span>
                        </div>
                    </div>

                    <p className="text-[9px] uppercase tracking-[0.25em] text-stone-700">
                        Path {getLayerIndex(
                            run.map.currentNodeId,
                        )} / 5
                    </p>
                </footer>
            </main>
        </MapBackground>
    );
}
import { useEffect, useRef } from "react";
import type { RunState } from "../types/game";
import { getAvailableNextNodes } from "../state/run";
import { getDungeonById } from "../data/dungeons";
import MapNode from "./MapNode";
import MapConnections from "./mapConnections";
import MapBackground from "./mapBackground";
import {
    getLayerIndex,
    getMapCanvasHeight,
    getMapPosition,
} from "./mapLayout";

interface MapScreenProps {
    run: RunState;
    onSelectNode: (nodeId: string) => void;
    onEnterCurrentNode: () => void;
}

function getLayerLabel(floor: number, floorCount: number): string {
    if (floor === 1) {
        return "Entry";
    }

    if (floor === floorCount) {
        return "Boss";
    }

    return `Floor ${floor}`;
}

function getNodeDescription(
    type: RunState["map"]["nodes"][number]["type"],
): string {
    switch (type) {
        case "battle":
            return "Face a standard enemy and continue your descent.";
        case "elite":
            return "A stronger enemy awaits. Greater risk, greater reward.";
        case "event":
            return "An unknown encounter with a choice and a consequence.";
        case "shop":
            return "Spend Run Gold on cards, relics, healing or removal.";
        case "rest":
            return "Recover, purge a card or trade health for Gold.";
        case "boss":
            return "The deepest chamber. Defeat the guardian to clear the dungeon.";
    }
}

function getNodeAccent(type: RunState["map"]["nodes"][number]["type"]): string {
    switch (type) {
        case "battle":
            return "text-stone-200";
        case "elite":
            return "text-red-300";
        case "event":
            return "text-violet-300";
        case "shop":
            return "text-amber-300";
        case "rest":
            return "text-orange-300";
        case "boss":
            return "text-red-200";
    }
}

export default function MapScreen({
    run,
    onSelectNode,
    onEnterCurrentNode,
}: MapScreenProps) {
    const availableNodes = getAvailableNextNodes(run);
    const availableNodeIds = new Set(
        availableNodes.map((node) => node.id),
    );

    const currentNode = run.map.nodes.find(
        (node) => node.id === run.map.currentNodeId,
    );

    const dungeon = getDungeonById(run.dungeonId);
    const floorCount = dungeon?.floorCount ?? 1;
    const mapScrollRef = useRef<HTMLDivElement>(null);
    const canvasHeight = getMapCanvasHeight(floorCount);

    useEffect(() => {
        const scrollContainer = mapScrollRef.current;
        if (!scrollContainer || !currentNode) {
            return;
        }

        const target = scrollContainer.querySelector<HTMLElement>(
            `[data-map-node-wrap="${currentNode.id}"]`,
        );

        if (!target) {
            return;
        }

        const targetCenter =
            target.offsetTop + target.offsetHeight / 2;
        const desiredTop =
            targetCenter - scrollContainer.clientHeight / 2;
        const maxScroll =
            scrollContainer.scrollHeight - scrollContainer.clientHeight;

        scrollContainer.scrollTo({
            top: Math.min(
                Math.max(desiredTop, 0),
                Math.max(maxScroll, 0),
            ),
            behavior: "smooth",
        });
    }, [currentNode?.id, floorCount]);

    function handleNodeSelect(nodeId: string) {
        if (nodeId === run.map.currentNodeId) {
            if (!currentNode || currentNode.completed) {
                return;
            }

            onEnterCurrentNode();
            return;
        }

        onSelectNode(nodeId);
    }

    const currentFloor = currentNode
        ? getLayerIndex(currentNode.id)
        : 1;

    return (
        <MapBackground dungeonId={run.dungeonId}>
            <main className="mx-auto min-h-screen max-w-[1700px] px-4 py-4 lg:px-6">
                <header className="flex flex-col gap-4 border-b border-stone-900/80 pb-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-[9px] uppercase tracking-[0.48em] text-orange-500/70">
                            The Descent
                        </p>
                        <h1 className="mt-2 font-serif text-3xl font-bold uppercase tracking-[0.16em] text-stone-100 md:text-4xl">
                            {dungeon?.name ?? "The Burning Path"}
                        </h1>
                        <p className="mt-1 max-w-xl text-xs uppercase tracking-[0.22em] text-stone-600">
                            {dungeon?.subtitle ?? "Choose your path"}
                        </p>
                    </div>

                    <div className="flex items-center gap-7 text-right">
                        <div>
                            <p className="text-[8px] uppercase tracking-[0.25em] text-stone-600">
                                Descent
                            </p>
                            <p className="mt-1 text-lg font-bold text-stone-200">
                                {currentFloor}
                                <span className="text-stone-700">
                                    {` / ${floorCount}`}
                                </span>
                            </p>
                        </div>
                        <div>
                            <p className="text-[8px] uppercase tracking-[0.25em] text-stone-600">
                                HP
                            </p>
                            <p className="mt-1 text-lg font-bold text-red-400">
                                {run.hp}
                                <span className="text-stone-700">
                                    {` / ${run.maxHp}`}
                                </span>
                            </p>
                        </div>
                        <div>
                            <p className="text-[8px] uppercase tracking-[0.25em] text-stone-600">
                                Gold
                            </p>
                            <p className="mt-1 text-lg font-bold text-amber-400">
                                {run.gold}
                            </p>
                        </div>
                    </div>
                </header>

                <div className="mt-4 grid gap-4 lg:grid-cols-[250px_minmax(0,1fr)_280px]">
                    <aside className="hidden space-y-4 lg:block">
                        <section className="rounded-2xl border border-stone-900 bg-black/30 p-5">
                            <p className="text-[8px] uppercase tracking-[0.36em] text-stone-600">
                                Dungeon
                            </p>
                            <h2 className="mt-2 font-serif text-xl uppercase tracking-[0.16em] text-stone-100">
                                {dungeon?.themeLabel ?? "Ashen Descent"}
                            </h2>
                            {dungeon?.id === "ashen-depths" && (
                                <p className="mt-2 text-[8px] uppercase tracking-[0.28em] text-orange-500/70">
                                    The deeper you descend, the hotter the ash becomes.
                                </p>
                            )}
                            <p className="mt-4 text-sm leading-6 text-stone-500">
                                {dungeon?.description ??
                                    "Descend through the ruins and choose how deep you dare to go."}
                            </p>
                        </section>

                        <section className="rounded-2xl border border-stone-900 bg-black/25 p-5">
                            <p className="text-[8px] uppercase tracking-[0.3em] text-stone-600">
                                Map Legend
                            </p>
                            <div className="mt-4 space-y-3 text-[9px] uppercase tracking-[0.2em] text-stone-500">
                                <Legend label="Current" color="bg-orange-400" />
                                <Legend label="Available" color="bg-stone-300" />
                                <Legend label="Completed" color="bg-stone-600" />
                                <Legend label="Locked" color="bg-stone-900" />
                            </div>
                        </section>

                        <section className="rounded-2xl border border-stone-900 bg-black/20 p-5">
                            <p className="text-[8px] uppercase tracking-[0.3em] text-stone-600">
                                Descent Rules
                            </p>
                            <p className="mt-3 text-xs leading-5 text-stone-600">
                                Floor 1 is the entrance. Every floor takes you deeper. Paths can split, merge and reconnect.
                            </p>
                        </section>
                    </aside>

                    <section className="relative overflow-hidden rounded-3xl border border-stone-900 bg-[#0a0908]/90 shadow-2xl">
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_6%,rgba(124,45,18,0.18),transparent_25%),radial-gradient(circle_at_50%_82%,rgba(127,29,29,0.16),transparent_35%)]" />
                        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-16 bg-gradient-to-b from-[#0a0908] to-transparent" />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-16 bg-gradient-to-t from-[#0a0908] to-transparent" />

                        <div
                            ref={mapScrollRef}
                            className="relative h-[calc(100vh-235px)] min-h-[680px] max-h-[980px] overflow-y-auto overscroll-contain px-4 py-8 [scrollbar-color:#6b3729_transparent] [scrollbar-width:thin] md:px-8"
                        >
                            <div
                                className="relative mx-auto w-full max-w-[920px]"
                                style={{ minHeight: `${canvasHeight}px` }}
                            >
                                <div className="pointer-events-none absolute inset-y-3 left-0 flex w-20 flex-col justify-between py-2 md:w-24">
                                    {Array.from({ length: floorCount }, (_, index) => {
                                        const floor = index + 1;
                                        return (
                                            <span
                                                key={floor}
                                                className="text-[8px] uppercase tracking-[0.18em] text-stone-700"
                                            >
                                                {getLayerLabel(floor, floorCount)}
                                            </span>
                                        );
                                    })}
                                </div>

                                <div
                                    className="relative ml-10 min-h-full md:ml-16"
                                    style={{ minHeight: `${canvasHeight}px` }}
                                >
                                    <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-stone-700/0 via-orange-800/10 to-red-950/40" />

                                    <MapConnections
                                        nodes={run.map.nodes}
                                        currentNodeId={run.map.currentNodeId}
                                        availableNodeIds={availableNodeIds}
                                    />

                                    {run.map.nodes.map((node) => {
                                        const position = getMapPosition(
                                            node,
                                            run.map.nodes,
                                        );

                                        return (
                                            <div
                                                key={node.id}
                                                data-map-node-wrap={node.id}
                                                className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                                                style={{
                                                    left: position.left,
                                                    top: position.top,
                                                }}
                                            >
                                                <MapNode
                                                    node={node}
                                                    isCurrent={
                                                        node.id === run.map.currentNodeId
                                                    }
                                                    isAvailable={
                                                        availableNodeIds.has(node.id)
                                                    }
                                                    onClick={handleNodeSelect}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full border border-stone-800 bg-black/70 px-4 py-2 text-[8px] uppercase tracking-[0.28em] text-stone-500 backdrop-blur-sm">
                            Scroll to descend
                        </div>
                    </section>

                    <aside className="space-y-4">
                        <section className="rounded-2xl border border-stone-900 bg-black/30 p-5">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-[8px] uppercase tracking-[0.3em] text-stone-600">
                                        Current Position
                                    </p>
                                    <h2
                                        className={`mt-2 font-serif text-2xl uppercase tracking-[0.08em] ${
                                            currentNode
                                                ? getNodeAccent(currentNode.type)
                                                : "text-stone-100"
                                        }`}
                                    >
                                        {currentNode
                                            ? getLayerLabel(
                                                  currentFloor,
                                                  floorCount,
                                              )
                                            : "Unknown"}
                                    </h2>
                                </div>
                                <div className="rounded-xl border border-stone-800 bg-[#11100e] px-3 py-2 text-right">
                                    <p className="text-[7px] uppercase tracking-[0.25em] text-stone-700">
                                        Depth
                                    </p>
                                    <p className="mt-1 text-sm font-bold text-stone-200">
                                        {currentFloor}
                                    </p>
                                </div>
                            </div>

                            {currentNode && (
                                <>
                                    <p className="mt-5 text-sm leading-6 text-stone-500">
                                        {getNodeDescription(currentNode.type)}
                                    </p>

                                    {!currentNode.completed && (
                                        <button
                                            type="button"
                                            onClick={onEnterCurrentNode}
                                            className="mt-5 w-full rounded-xl border border-orange-700/70 bg-orange-950/30 px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.28em] text-orange-300 transition hover:border-orange-500 hover:bg-orange-900/30"
                                        >
                                            Enter Node
                                        </button>
                                    )}
                                </>
                            )}
                        </section>

                        <section className="rounded-2xl border border-stone-900 bg-black/25 p-5">
                            <p className="text-[8px] uppercase tracking-[0.3em] text-stone-600">
                                Connected Paths
                            </p>
                            <div className="mt-4 space-y-2">
                                {availableNodes.length ? (
                                    availableNodes.map((node) => (
                                        <button
                                            type="button"
                                            key={node.id}
                                            onClick={() => handleNodeSelect(node.id)}
                                            className="flex w-full items-center justify-between rounded-xl border border-stone-900 bg-[#100e0c] px-3 py-3 text-left transition hover:border-orange-800/60 hover:bg-[#17110e]"
                                        >
                                            <span>
                                                <span className="block text-[8px] uppercase tracking-[0.2em] text-stone-600">
                                                    Floor {getLayerIndex(node.id)}
                                                </span>
                                                <span className="mt-1 block text-xs uppercase tracking-[0.16em] text-stone-300">
                                                    {node.type}
                                                </span>
                                            </span>
                                            <span className="text-orange-400">→</span>
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-xs leading-5 text-stone-700">
                                        No connected paths are available from this node.
                                    </p>
                                )}
                            </div>
                        </section>

                        <section className="rounded-2xl border border-stone-900 bg-black/20 p-5">
                            <p className="text-[8px] uppercase tracking-[0.3em] text-stone-600">
                                Descent
                            </p>
                            <div className="mt-4 h-2 overflow-hidden rounded-full bg-stone-900">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-orange-700 to-red-600"
                                    style={{
                                        width: `${Math.max(
                                            2,
                                            ((currentFloor - 1) /
                                                Math.max(floorCount - 1, 1)) *
                                                100,
                                        )}%`,
                                    }}
                                />
                            </div>
                            <div className="mt-2 flex items-center justify-between text-[7px] uppercase tracking-[0.2em] text-stone-700">
                                <span>Entry</span>
                                <span>Boss</span>
                            </div>
                        </section>
                    </aside>
                </div>

                <footer className="mt-4 flex items-center justify-between border-t border-stone-900/80 pt-4 text-[8px] uppercase tracking-[0.24em] text-stone-700">
                    <span>Descend · Explore · Survive</span>
                    <span>Some things should stay buried.</span>
                </footer>
            </main>
        </MapBackground>
    );
}

function Legend({
    label,
    color,
}: {
    label: string;
    color: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
            <span>{label}</span>
        </div>
    );
}

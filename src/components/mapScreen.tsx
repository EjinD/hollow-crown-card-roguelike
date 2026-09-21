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
    if (floor === 1) return "Entry";
    if (floor === floorCount) return "Boss";
    return `Floor ${floor}`;
}

function getNodeDescription(type: RunState["map"]["nodes"][number]["type"]): string {
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
        case "battle": return "#ddd0bc";
        case "elite": return "#d87a63";
        case "event": return "#b8a7d0";
        case "shop": return "#d4ae6c";
        case "rest": return "#db8952";
        case "boss": return "#e27862";
    }
}

function getNodeTitle(type: RunState["map"]["nodes"][number]["type"]): string {
    switch (type) {
        case "battle": return "Battle Site";
        case "elite": return "Elite Sanctum";
        case "event": return "Unknown Encounter";
        case "shop": return "Ashen Trader";
        case "rest": return "Rest Site";
        case "boss": return "The Warden's Chamber";
    }
}

export default function MapScreen({
    run,
    onSelectNode,
    onEnterCurrentNode,
}: MapScreenProps) {
    const availableNodes = getAvailableNextNodes(run);
    const availableNodeIds = new Set(availableNodes.map((node) => node.id));

    const currentNode = run.map.nodes.find(
        (node) => node.id === run.map.currentNodeId,
    );

    const dungeon = getDungeonById(run.dungeonId);
    const floorCount = dungeon?.floorCount ?? 1;
    const mapScrollRef = useRef<HTMLDivElement>(null);
    const canvasHeight = getMapCanvasHeight(floorCount);

    useEffect(() => {
        const scrollContainer = mapScrollRef.current;
        if (!scrollContainer || !currentNode) return;

        const target = scrollContainer.querySelector<HTMLElement>(
            `[data-map-node-wrap="${currentNode.id}"]`,
        );

        if (!target) return;

        const targetCenter = target.offsetTop + target.offsetHeight / 2;
        const desiredTop = targetCenter - scrollContainer.clientHeight / 2;
        const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;

        scrollContainer.scrollTo({
            top: Math.min(Math.max(desiredTop, 0), Math.max(maxScroll, 0)),
            behavior: "smooth",
        });
    }, [currentNode?.id, floorCount]);

    function handleNodeSelect(nodeId: string) {
        if (nodeId === run.map.currentNodeId) {
            if (!currentNode || currentNode.completed) return;
            onEnterCurrentNode();
            return;
        }

        onSelectNode(nodeId);
    }

    const currentFloor = currentNode ? getLayerIndex(currentNode.id) : 1;
    const progress = floorCount <= 1
        ? 0
        : Math.min(100, Math.max(0, ((currentFloor - 1) / Math.max(floorCount - 1, 1)) * 100));

    return (
        <MapBackground dungeonId={run.dungeonId}>
            <main className="hc-map-layout">
                <header className="hc-map-header">
                    <div>
                        <p className="hc-map-header__eyebrow">The Descent · Ashen Depths</p>
                        <h1 className="hc-map-header__title">{dungeon?.name ?? "The Burning Path"}</h1>
                        <p className="hc-map-header__subtitle">
                            {dungeon?.subtitle ?? "Every branch leads deeper."}
                        </p>
                    </div>

                    <div className="hc-map-header__stats">
                        <div className="hc-map-stat">
                            <span className="hc-map-stat__label">Depth</span>
                            <span className="hc-map-stat__value">
                                {currentFloor}<small> / {floorCount}</small>
                            </span>
                        </div>
                        <div className="hc-map-stat">
                            <span className="hc-map-stat__label">HP</span>
                            <span className="hc-map-stat__value hc-map-stat__value--hp">
                                {run.hp}<small> / {run.maxHp}</small>
                            </span>
                        </div>
                        <div className="hc-map-stat">
                            <span className="hc-map-stat__label">Gold</span>
                            <span className="hc-map-stat__value hc-map-stat__value--gold">{run.gold}</span>
                        </div>
                    </div>
                </header>

                <div className="hc-map-main">
                    <aside className="hc-map-side">
                        <section className="hc-map-panel">
                            <p className="hc-map-panel__eyebrow">Current descent</p>
                            <h2 className="hc-map-panel__title">{dungeon?.themeLabel ?? "Ashen Descent"}</h2>
                            <p className="hc-map-panel__accent">
                                {dungeon?.id === "ashen-depths"
                                    ? "The deeper you descend, the hotter the ash becomes."
                                    : "Every floor takes you deeper."}
                            </p>
                            <p className="hc-map-panel__copy">
                                {dungeon?.description ?? "Descend through the ruins and choose how deep you dare to go."}
                            </p>
                        </section>

                        <section className="hc-map-panel">
                            <p className="hc-map-legend__eyebrow">Map states</p>
                            <div className="hc-map-legend">
                                <span className="hc-map-legend__item"><i className="hc-map-legend__dot hc-map-legend__dot--current" />Current</span>
                                <span className="hc-map-legend__item"><i className="hc-map-legend__dot hc-map-legend__dot--available" />Available</span>
                                <span className="hc-map-legend__item"><i className="hc-map-legend__dot hc-map-legend__dot--completed" />Cleared</span>
                                <span className="hc-map-legend__item"><i className="hc-map-legend__dot hc-map-legend__dot--locked" />Locked</span>
                            </div>
                        </section>

                        <section className="hc-map-panel">
                            <p className="hc-map-panel__eyebrow">Descent progress</p>
                            <div className="hc-map-progress">
                                <div className="hc-map-progress__bar">
                                    <div className="hc-map-progress__fill" style={{ width: `${Math.max(2, progress)}%` }} />
                                </div>
                                <div className="hc-map-progress__labels">
                                    <span>Entry</span>
                                    <span>Boss</span>
                                </div>
                            </div>
                        </section>
                    </aside>

                    <section className="hc-map-stage">
                        {currentNode && (
                            <div className="hc-map-current" style={{ borderLeftColor: getNodeAccent(currentNode.type) }}>
                                <div className="hc-map-current__copy">
                                    <p className="hc-map-header__eyebrow">Current node</p>
                                    <h2 className="hc-map-current__title">{getNodeTitle(currentNode.type)}</h2>
                                    <p className="hc-map-current__description">{getNodeDescription(currentNode.type)}</p>
                                </div>
                                {!currentNode.completed && (
                                    <button
                                        type="button"
                                        onClick={onEnterCurrentNode}
                                        className="hc-map-current__button"
                                    >
                                        Enter Node
                                    </button>
                                )}
                            </div>
                        )}

                        <div ref={mapScrollRef} className="hc-map-scroll">
                            <div
                                className="hc-map-scroll__canvas"
                                style={{ minHeight: `${canvasHeight}px` }}
                            >
                                <div className="hc-map-floor-labels" aria-hidden="true">
                                    {Array.from({ length: floorCount }, (_, index) => {
                                        const floor = index + 1;
                                        const top = floorCount <= 1
                                            ? 0
                                            : ((floor - 1) / (floorCount - 1)) * 100;

                                        return (
                                            <span
                                                key={floor}
                                                className="hc-map-floor-label"
                                                style={{ top: `${top}%` }}
                                            >
                                                {getLayerLabel(floor, floorCount)}
                                            </span>
                                        );
                                    })}
                                </div>

                                <div className="hc-map-path-axis" aria-hidden="true" />

                                <MapConnections
                                    nodes={run.map.nodes}
                                    currentNodeId={run.map.currentNodeId}
                                    availableNodeIds={availableNodeIds}
                                />

                                {run.map.nodes.map((node) => {
                                    const position = getMapPosition(node, run.map.nodes);

                                    return (
                                        <div
                                            key={node.id}
                                            data-map-node-wrap={node.id}
                                            className="hc-map-node-wrap"
                                            style={{ left: position.left, top: position.top }}
                                        >
                                            <MapNode
                                                node={node}
                                                isCurrent={node.id === run.map.currentNodeId}
                                                isAvailable={availableNodeIds.has(node.id)}
                                                onClick={handleNodeSelect}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    <aside className="hc-map-side">
                        <section className="hc-map-panel">
                            <p className="hc-map-panel__eyebrow">Connected paths</p>
                            <div className="hc-map-paths">
                                {availableNodes.length ? (
                                    availableNodes.map((node) => (
                                        <button
                                            type="button"
                                            key={node.id}
                                            onClick={() => handleNodeSelect(node.id)}
                                            className="hc-map-path-button"
                                        >
                                            <span>
                                                <span className="hc-map-path-button__label">Floor {getLayerIndex(node.id)}</span>
                                                <span className="hc-map-path-button__type">{node.type}</span>
                                            </span>
                                            <span className="hc-map-path-button__arrow">›</span>
                                        </button>
                                    ))
                                ) : (
                                    <p className="hc-map-panel__copy">No connected paths are available from this node.</p>
                                )}
                            </div>
                        </section>

                        <section className="hc-map-panel">
                            <p className="hc-map-panel__eyebrow">Route rule</p>
                            <p className="hc-map-panel__copy">
                                Choose carefully. Paths can split, merge and reconnect before the final chamber.
                            </p>
                        </section>
                    </aside>
                </div>

                <footer className="hc-map-footer">
                    <span>Descend · Explore · Survive</span>
                    <span className="hc-map-footer__accent">Some things should stay buried.</span>
                </footer>
            </main>
        </MapBackground>
    );
}

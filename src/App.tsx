import { useState } from "react";

import type {
    CombatState,
    RunState,
} from "./types/game";
import { startCurrentCombat } from "./state/run";
import {
    startRun,
    selectNextNode,
} from "./state/run";
import MapScreen from "./components/mapScreen";
import CombatScreen from "./components/CombatScreen";

export default function App() {
    const [run, setRun] = useState<RunState>(
        () => startRun(),
    );

    const [combat, setCombat] =
        useState<CombatState | null>(null);

        const [screen, setScreen] = useState<
    "map" | "combat"
>("map");

    function handleEnterCurrentNode() {
    const currentNode = run.map.nodes.find(
        (node) =>
            node.id === run.map.currentNodeId,
    );

    if (!currentNode) {
        return;
    }

    if (
        currentNode.type === "battle" ||
        currentNode.type === "elite" ||
        currentNode.type === "boss"
    ) {
        const newCombat =
            startCurrentCombat(run);

        setCombat(newCombat);
        setScreen("combat");
    }
}

    function handleSelectNode(
    nodeId: string,
) {
    const nextRun = selectNextNode(
        run,
        nodeId,
    );

    if (
        nextRun.map.currentNodeId ===
        run.map.currentNodeId
    ) {
        return;
    }

    setRun(nextRun);

    const node =
        nextRun.map.nodes.find(
            (item) => item.id === nodeId,
        );

    if (!node) {
        return;
    }

    if (
        node.type === "battle" ||
        node.type === "elite" ||
        node.type === "boss"
    ) {
        const newCombat =
            startCurrentCombat(nextRun);

        setCombat(newCombat);
        setScreen("combat");
    }
}

    void combat;
    void setCombat;

     return (
    <>
        {screen === "map" && (
            <MapScreen
            run={run}
            onSelectNode={handleSelectNode}
            onEnterCurrentNode={
            handleEnterCurrentNode
    }
/>
        )}

        {screen === "combat" && combat && (
            <CombatScreen combat={combat} />
        )}
    </>
); 
}
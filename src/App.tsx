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

export default function App() {
    const [run, setRun] = useState<RunState>(
        () => startRun(),
    );

    const [combat, setCombat] =
        useState<CombatState | null>(null);

        const [screen, setScreen] = useState<
    "map" | "combat"
>("map");


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

     /*return (
    <>
        {screen === "map" && (
            <MapScreen
                run={run}
                onSelectNode={handleSelectNode}
            />
        )}

        {screen === "combat" && combat && (
            <div className="min-h-screen bg-black text-white">
                <h1 className="p-10 text-4xl">
                    Combat
                </h1>

                <p className="px-10">
                    Enemy: {combat.enemy.name}
                </p>
            </div>
        )}
    </>
); */
}
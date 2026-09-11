import { useState } from "react";

import type {
    CombatState,
    RunState,
} from "./types/game";
import {
    advanceCombat,
    endPlayerTurn,
    playCard,
} from "./engine/combat";
import { 
    claimCardReward,
    startCurrentCombat,
    completeCombat,
    skipReward,
    startRun,
    selectNextNode,
} from "./state/run";
import MapScreen from "./components/mapScreen";
import CombatScreen from "./components/CombatScreen";
import RewardScreen from "./components/RewardScreen";
type GameScreen =
    | "map"
    | "combat"
    | "reward"
    | "game-over";


export default function App() {
    const [run, setRun] = useState<RunState>(
        () => startRun(),
    );

    const [combat, setCombat] =
        useState<CombatState | null>(null);



const [screen, setScreen] =
    useState<GameScreen>("map");

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
function finishCombat(
    combatState: CombatState,
) {
    const nextRun = completeCombat(
        run,
        combatState,
    );

    setRun(nextRun);
    setCombat(combatState);

    if (combatState.phase === "defeat") {
        setScreen("game-over");
        return;
    }

    if (
        nextRun.status === "completed" &&
        nextRun.result === "victory"
    ) {
        setScreen("game-over");
        return;
    }

    setScreen("reward");
}
function handlePlayCard(cardId: string) {
    if (!combat) {
        return;
    }

    const nextCombat = playCard(
        combat,
        cardId,
    );

    if (
        nextCombat.phase === "victory" ||
        nextCombat.phase === "defeat"
    ) {
        finishCombat(nextCombat);
        return;
    }

    setCombat(nextCombat);
}

function handleClaimReward(cardId: string) {
    const nextRun = claimCardReward(
        run,
        cardId,
    );

    setRun(nextRun);

    if (nextRun.pendingReward === null) {
        setScreen("map");
    }
}
function handleEndTurn() {
    if (!combat) {
        return;
    }

    const afterEndPlayerTurn =
        endPlayerTurn(combat);

    const nextCombat =
        advanceCombat(
            afterEndPlayerTurn,
        );

    if (
        nextCombat.phase === "victory" ||
        nextCombat.phase === "defeat"
    ) {
        finishCombat(nextCombat);
        return;
    }

    setCombat(nextCombat);
}

function handleSkipReward() {
    const nextRun = skipReward(run);

    setRun(nextRun);
    setScreen("map");
}


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
            <CombatScreen
                combat={combat}
                gold={run.gold}
                onPlayCard={handlePlayCard}
                onEndTurn={handleEndTurn}
        />
        
        )}
        
        {screen === "reward" && run.pendingReward && (
            <RewardScreen
                reward={run.pendingReward}
                onClaim={handleClaimReward}
                onSkip={handleSkipReward}
    />
)}
        </>
    
); 
}
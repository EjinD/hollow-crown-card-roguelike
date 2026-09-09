import { useState } from "react";

import type { CombatState, RunState } from "./types/game";

import { startRun, selectNextNode, startCurrentCombat, claimCardReward, skipReward, replaceCardInDeck } from "./state/run";

export default function App() {
    const [run, setRun] = useState<RunState>(() => startRun());
    const [combat, setCombat] = useState<CombatState | null>(null);

    return (
        <div>
            <h1>Board</h1>
        </div>
    )
}
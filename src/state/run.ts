import { BASE_ACTIONS } from "../consts/game";
import { cloneDeck, starterDeck } from "../data/deck";
import type { CombatState, RunState } from "../types/game";

export function startRun(): RunState {
    return {
        hp: 10,
        maxHp: 10,
        gold: 0,
        deck: cloneDeck(starterDeck),
        baseActions: BASE_ACTIONS,
        relics: [],
        upgrades: [],
    };
}

export function syncRunAfterCombat(
    run: RunState,
    combat: CombatState,
): RunState {
    if (combat.phase !== "victory" && combat.phase !== "defeat") {
        return run;
    }

    return {
        ...run,
        hp: combat.player.hp,
        maxHp: combat.player.maxHp,
        baseActions: combat.player.baseActions,
    };
}

import { BASE_ACTIONS } from "../consts/game";
import { cloneDeck, starterDeck, addCardToDeck } from "../data/deck";
import { enemies } from "../data/enemies";
import { startCombat } from "../engine/combat";
import type { CombatState, RunState, } from "../types/game";
import { initialMap } from "../data/map";
export function startRun(): RunState {
    return {
        hp: 10,
        maxHp: 10,
        gold: 0,
        deck: cloneDeck(starterDeck),
        baseActions: BASE_ACTIONS,
        relics: [],
        upgrades: [],
        pendingReward: null,
        map: {currentNodeId: initialMap.currentNodeId,
            nodes: initialMap.nodes.map((node) => ({
            ...node,
            nextNodeIds: [...node.nextNodeIds],
    })),}
    };
}

export function syncRunAfterCombat(
    run: RunState,
    combat: CombatState,
): RunState {
    if (combat.phase !== "victory" && combat.phase !== "defeat") {
        return run;
    }

    const enemy = enemies.find((enemy) => enemy.id === combat.enemy.definitionId);
    if (!enemy) {
        return run
    }
    return {
        ...run,
        hp: combat.player.hp,
        maxHp: combat.player.maxHp,
        baseActions: combat.player.baseActions,
        gold: run.gold + enemy.reward.gold,
        pendingReward: enemy.reward
    };
}
export function claimCardReward(
    run: RunState,
    cardId: string,
): RunState {
    if (!run.pendingReward) {
        return run;
    }

    if (!run.pendingReward.cardChoices.includes(cardId)) {
        return run;
    }

    const updatedDeck = addCardToDeck(
        run.deck,
        cardId,
    );

    return {
        ...run,
        deck: updatedDeck,
        pendingReward: null,
    };
}
export function skipReward(
    run: RunState,
): RunState {
    if (!run.pendingReward) {
        return run
    }
    return {
        ...run,
        pendingReward: null
    };
}

export function startNextCombat(
    run: RunState
): CombatState {
    const currentNode = run.map.nodes.find((node) => node.id === run.map.currentNodeId);

    if(!currentNode || !currentNode.enemyId) {
        throw new Error("Current map doesnt contain an enemy.")
    }

    return startCombat(
        run,
        currentNode.enemyId
    )
}

export function advanceMap(
    run: RunState,
): RunState {
    const currentNode = run.map.nodes.find((node) => node.id === run.map.currentNodeId);
    if (!currentNode) {
        return run
    }
    const nextNodeId = currentNode.nextNodeIds[0];
    if (!nextNodeId) {
        return run
    }
    return {
        ...run,
        map: {
            ...run.map,
            currentNodeId: nextNodeId
        }
    }
}

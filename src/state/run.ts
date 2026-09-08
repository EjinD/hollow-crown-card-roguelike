import { BASE_ACTIONS, MAX_DECK_SIZE} from "../consts/game";
import { cloneDeck, starterDeck, addCardToDeck } from "../data/deck";
import { enemies } from "../data/enemies";
import { startCombat } from "../engine/combat";
import type { CombatState, RunState, MapNode } from "../types/game";
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
    })),},
        status: "active",
        result: null,
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

export function claimCardReward(
    run: RunState,
    cardId: string,
): RunState {
    if (run.status === "completed") {
        return run;
    }

    if (!run.pendingReward) {
        return run;
    }

    if (!run.pendingReward.cardChoices.includes(cardId)) {
        return run;
    }

    if (isDeckFull(run)) {
        return run;
    }

    return {
        ...run,
        deck: addCardToDeck(run.deck, cardId),
        pendingReward: null,
    };
}

export function skipReward(
    run: RunState,
): RunState {
    if (run.status === "completed" && run.pendingReward === null) {
        return run;
    }

    if (!run.pendingReward) {
        return run;
    }

    return {
        ...run,
        pendingReward: null,
    };
}

export function startNextCombat(
    run: RunState
): CombatState {
    const currentNode = getCurrentMapNode(run);

    if (
        !currentNode ||
        !currentNode.enemyId ||
        (
            currentNode.type !== "battle" &&
            currentNode.type !== "elite" &&
            currentNode.type !== "boss"
        )
    ) {
        throw new Error(
            "Current map node cannot start a combat.",
        );
    }

    return startCombat(
        run,
        currentNode.enemyId,
    );
}

export function completeCombat(
    run: RunState,
    combat: CombatState,
): RunState {
    if (combat.phase === "defeat") {
    return {
        ...run,
        hp: combat.player.hp,
        maxHp: combat.player.maxHp,
        baseActions: combat.player.baseActions,
        status: "completed",
        result: "defeat",
        pendingReward: null,
    };
}

    const enemy = enemies.find(
        (enemy) => enemy.id === combat.enemy.definitionId,
    );

    if (!enemy) {
        return run;
    }


    return {
    ...run,
    hp: combat.player.hp,
    maxHp: combat.player.maxHp,
    baseActions: combat.player.baseActions,
    gold: run.gold + enemy.reward.gold,
    pendingReward: enemy.reward,
    status: enemy.lastFight ? "completed" : "active",
    result: enemy.lastFight ? "victory" : null,
    };
}

export function replaceCardInDeck(
    run: RunState,
    oldCardId: string,
    newCardId: string,
): RunState {
    if (run.status === "completed") {
        return run;
    }

    if (!run.pendingReward) {
        return run;
    }

    if (!run.pendingReward.cardChoices.includes(newCardId)) {
        return run;
    }

    const cardIndex = run.deck.findIndex(
        (card) => card.cardId === oldCardId,
    );

    if (cardIndex === -1) {
        return run;
    }

    const updatedDeck = run.deck.map(
        (card, index) =>
            index === cardIndex
                ? {
                    cardId: newCardId,
                    cooldownRemaining: 0,
                }
                : card,
    );

    return {
        ...run,
        deck: updatedDeck,
        pendingReward: null,
    };
}

export function isDeckFull(
    run: RunState,
): boolean {
    return run.deck.length >= MAX_DECK_SIZE;
}

export function getCurrentMapNode(
    run: RunState,
): MapNode | undefined {
    return run.map.nodes.find(
        (node) => node.id === run.map.currentNodeId,
    );
}

export function selectNextNode(
    run: RunState,
    nodeId: string,
): RunState {
    if (run.pendingReward !== null) {
        return run;
    }

    const availableNodes = getAvailableNextNodes(run);

    const isAvailable = availableNodes.some(
        (node) => node.id === nodeId,
    );

    if (!isAvailable) {
        return run;
    }

    return {
        ...run,
        map: {
            ...run.map,
            currentNodeId: nodeId,
        },
    };
}

export function getAvailableNextNodes(
    run: RunState,
): MapNode[] {
    const currentNode = getCurrentMapNode(run);

    if (!currentNode) {
        return [];
    }

    return currentNode.nextNodeIds
        .map((nodeId) =>
            run.map.nodes.find((node) => node.id === nodeId),
        )
        .filter(
            (node): node is MapNode =>
                node !== undefined,
        );
}

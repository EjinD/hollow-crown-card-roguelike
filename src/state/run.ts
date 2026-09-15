import {
    BASE_ACTIONS,
    MAX_DECK_SIZE,
    MIN_DECK_SIZE,
} from "../consts/game";

import {
    cloneDeck,
    starterDeck,
    addCardToDeck,
} from "../data/deck";

import { enemies } from "../data/enemies";
import { startCombat } from "../engine/combat";

import type {
    CombatState,
    MapNode,
    RunState,
} from "../types/game";

import { generateMap } from "../data/map";

export function startRun(): RunState {
    const map = generateMap();

    return {
        hp: 10,
        maxHp: 10,
        gold: 0,
        deck: cloneDeck(starterDeck),
        baseActions: BASE_ACTIONS,
        relics: [],
        upgrades: [],
        pendingReward: null,
        map,
        status: "active",
        result: null,
    };
}

export function syncRunAfterCombat(
    run: RunState,
    combat: CombatState,
): RunState {
    if (
        combat.phase !== "victory" &&
        combat.phase !== "defeat"
    ) {
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
    if (!run.pendingReward) {
        return run;
    }

    if (
        !run.pendingReward.cardChoices.includes(
            cardId,
        )
    ) {
        return run;
    }

    if (isDeckFull(run)) {
        return run;
    }

    return {
        ...run,
        deck: addCardToDeck(
            run.deck,
            cardId,
        ),
        pendingReward: null,
    };
}

export function skipReward(
    run: RunState,
): RunState {
    if (!run.pendingReward) {
        return run;
    }

    return {
        ...run,
        pendingReward: null,
    };
}

export function startCurrentCombat(
    run: RunState,
): CombatState {
    const currentNode = getCurrentMapNode(run);

    if (
        !currentNode ||
        !currentNode.enemyId ||
        !isCombatNode(currentNode)
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

export function buyShopCard(
    run: RunState,
    cardId: string,
): RunState {
    const currentNode =
        getCurrentMapNode(run);

    if (
        !currentNode ||
        currentNode.type !== "shop" ||
        currentNode.completed ||
        !currentNode.shopOffers
    ) {
        return run;
    }

    const offerIndex =
        currentNode.shopOffers.findIndex(
            (offer) =>
                offer.cardId === cardId &&
                !offer.purchased,
        );

    if (offerIndex === -1) {
        return run;
    }

    const offer =
        currentNode.shopOffers[offerIndex];

    if (run.gold < offer.price) {
        return run;
    }

    if (isDeckFull(run)) {
        return run;
    }

    const updatedDeck =
        addCardToDeck(
            run.deck,
            cardId,
        );

    if (
        updatedDeck.length ===
        run.deck.length
    ) {
        return run;
    }

    const updatedOffers =
        currentNode.shopOffers.map(
            (currentOffer, index) =>
                index === offerIndex
                    ? {
                        ...currentOffer,
                        purchased: true,
                    }
                    : currentOffer,
        );

    return {
        ...run,
        gold:
            run.gold - offer.price,
        deck: updatedDeck,
        map: {
            ...run.map,
            nodes: run.map.nodes.map(
                (node) =>
                    node.id ===
                    currentNode.id
                        ? {
                            ...node,
                            shopOffers:
                                updatedOffers,
                        }
                        : node,
            ),
        },
    };
}

export function healAtShop(
    run: RunState,
): RunState {
    const currentNode =
        getCurrentMapNode(run);

    if (
        !currentNode ||
        currentNode.type !== "shop" ||
        currentNode.completed ||
        currentNode.shopHealPurchased ||
        currentNode.shopHealPrice ===
            undefined
    ) {
        return run;
    }

    const price =
        currentNode.shopHealPrice;

    if (run.gold < price) {
        return run;
    }

    if (run.hp >= run.maxHp) {
        return run;
    }

    return {
        ...run,
        gold: run.gold - price,
        hp: Math.min(
            run.hp + 3,
            run.maxHp,
        ),
        map: {
            ...run.map,
            nodes: run.map.nodes.map(
                (node) =>
                    node.id ===
                    currentNode.id
                        ? {
                            ...node,
                            shopHealPurchased:
                                true,
                        }
                        : node,
            ),
        },
    };
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
            baseActions:
                combat.player.baseActions,
            status: "completed",
            result: "defeat",
            pendingReward: null,
        };
    }

    const enemy = enemies.find(
        (enemy) =>
            enemy.id ===
            combat.enemy.definitionId,
    );

    if (!enemy) {
        return run;
    }

    const updatedRun: RunState = {
        ...run,
        hp: combat.player.hp,
        maxHp: combat.player.maxHp,
        baseActions:
            combat.player.baseActions,
        gold:
            run.gold + enemy.reward.gold,
        pendingReward:
            enemy.reward,
        status: enemy.lastFight
            ? "completed"
            : "active",
        result: enemy.lastFight
            ? "victory"
            : null,
    };

    return completeCurrentMapNode(
        updatedRun,
    );
}

export function replaceCardInDeck(
    run: RunState,
    oldCardId: string,
    newCardId: string,
): RunState {
    if (!run.pendingReward) {
        return run;
    }

    if (
        !run.pendingReward.cardChoices.includes(
            newCardId,
        )
    ) {
        return run;
    }

    const cardIndex =
        run.deck.findIndex(
            (card) =>
                card.cardId === oldCardId,
        );

    if (cardIndex === -1) {
        return run;
    }

    const updatedDeck =
        run.deck.map(
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
    return (
        run.deck.length >= MAX_DECK_SIZE
    );
}

export function getCurrentMapNode(
    run: RunState,
): MapNode | undefined {
    return run.map.nodes.find(
        (node) =>
            node.id ===
            run.map.currentNodeId,
    );
}

export function selectNextNode(
    run: RunState,
    nodeId: string,
): RunState {
    if (run.pendingReward !== null) {
        return run;
    }

    const currentNode =
        getCurrentMapNode(run);

    if (!currentNode) {
        return run;
    }

    if (!currentNode.completed) {
        return run;
    }

    const availableNodes =
        getAvailableNextNodes(run);

    const isAvailable =
        availableNodes.some(
            (node) =>
                node.id === nodeId,
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
    const currentNode =
        getCurrentMapNode(run);

    if (!currentNode) {
        return [];
    }

    return currentNode.nextNodeIds
        .map((nodeId) =>
            run.map.nodes.find(
                (node) =>
                    node.id === nodeId,
            ),
        )
        .filter(
            (
                node,
            ): node is MapNode =>
                node !== undefined,
        );
}

export function isCombatNode(
    node: MapNode,
): boolean {
    return (
        node.type === "battle" ||
        node.type === "elite" ||
        node.type === "boss"
    );
}

export function triggerCurrentEvent(
    run: RunState,
): RunState {
    const currentNode =
        getCurrentMapNode(run);

    if (
        !currentNode ||
        currentNode.type !== "event" ||
        !currentNode.eventId ||
        currentNode.completed
    ) {
        return run;
    }

    const updatedRun =
        removeRandomCardFromDeck(run);

    return {
        ...updatedRun,
        map: {
            ...updatedRun.map,
            nodes:
                updatedRun.map.nodes.map(
                    (node) =>
                        node.id ===
                        currentNode.id
                            ? {
                                ...node,
                                completed:
                                    true,
                            }
                            : node,
                ),
        },
    };
}

export function removeRandomCardFromDeck(
    run: RunState,
): RunState {
    if (
        run.deck.length <=
        MIN_DECK_SIZE
    ) {
        return run;
    }

    const randomIndex =
        Math.floor(
            Math.random() *
                run.deck.length,
        );

    return {
        ...run,
        deck: run.deck.filter(
            (_, index) =>
                index !== randomIndex,
        ),
    };
}

export function completeCurrentMapNode(
    run: RunState,
): RunState {
    return {
        ...run,
        map: {
            ...run.map,
            nodes:
                run.map.nodes.map(
                    (node) =>
                        node.id ===
                        run.map.currentNodeId
                            ? {
                                ...node,
                                completed:
                                    true,
                            }
                            : node,
                ),
        },
    };
}

export function completeCurrentShop(
    run: RunState,
): RunState {
    const currentNode =
        getCurrentMapNode(run);

    if (
        !currentNode ||
        currentNode.type !== "shop" ||
        currentNode.completed
    ) {
        return run;
    }

    return completeCurrentMapNode(
        run,
    );
}
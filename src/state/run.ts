import {
    BASE_ACTIONS,
    MAX_DECK_SIZE,
    MIN_DECK_SIZE,
} from "../consts/game";

import {
    cloneDeck,
    starterDeck,
    addCardToDeck,
    removeCardFromDeck as removeCardFromDeckState,
    createDeckFromIds,
} from "../data/deck";

import { enemies } from "../data/enemies";
import { cards } from "../data/cards";
import { events } from "../data/events";
import { startCombat } from "../engine/combat";
import { createCombatReward } from "../engine/rewards";

import type {
    CombatState,
    MapNode,
    RunState,
} from "../types/game";

import type { EventChoice, EventEffect, EventRequirement } from "../types/events";

import type { HubUpgradeState } from "../types/meta";

import { generateMap } from "../data/map";
import { getDungeonById } from "../data/dungeons";
import {
    getShopHealAmount,
    SHOP_HEAL_PRICE,
    SHOP_REMOVE_CARD_PRICE,
} from "../data/shop";

export function startRun(
    availableRelicIds: string[] = [
        "molten-heart",
    ],
    hubUpgrades: HubUpgradeState[] = [],
    savedDeckIds?: string[],
    dungeonId = "tutorial",
): RunState {
    const maxHpUpgradeLevel =
        hubUpgrades.find(
            (upgrade) => upgrade.id === "max-hp",
        )?.level ?? 0;

    const baseActionsUpgradeLevel =
        hubUpgrades.find(
            (upgrade) => upgrade.id === "base-actions",
        )?.level ?? 0;

    const maxHp =
        10 + Math.max(0, maxHpUpgradeLevel) * 2;

    const baseActions =
        BASE_ACTIONS + Math.min(1, Math.max(0, baseActionsUpgradeLevel));

    const customDeck = savedDeckIds
        ? createDeckFromIds(savedDeckIds)
        : [];

    const deck =
        customDeck.length >= MIN_DECK_SIZE &&
        customDeck.length <= MAX_DECK_SIZE
            ? customDeck
            : cloneDeck(starterDeck);

    const dungeon =
        getDungeonById(dungeonId) ??
        getDungeonById("tutorial");

    if (!dungeon) {
        throw new Error("Tutorial dungeon is missing.");
    }

    const map = generateMap(
        deck,
        availableRelicIds,
        dungeon,
    );

    return {
        dungeonId: dungeon.id,
        hp: maxHp,
        maxHp,
        gold: 0,
        deck,
        baseActions,
        relics: [],
        availableRelicIds: [
            ...availableRelicIds,
        ],
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
        baseActions:
            combat.player.baseActions,
    };
}

export function claimRelicReward(
    run: RunState,
): RunState {
    const relicId =
        run.pendingReward?.relicId;

    if (!relicId) {
        return {
            ...run,
            pendingReward: null,
        };
    }

    if (run.relics.includes(relicId)) {
        return {
            ...run,
            pendingReward: null,
        };
    }

    return {
        ...run,
        relics: [
            ...run.relics,
            relicId,
        ],
        pendingReward: null,
    };
}

export function startCurrentCombat(
    run: RunState,
): CombatState {
    const currentNode =
        getCurrentMapNode(run);

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
    const currentNode = getCurrentMapNode(run);

    if (
        !currentNode ||
        currentNode.type !== "shop" ||
        currentNode.completed ||
        !currentNode.shopCardOffers
    ) {
        return run;
    }

    const offerIndex = currentNode.shopCardOffers.findIndex(
        (offer) => offer.cardId === cardId && !offer.purchased,
    );

    if (offerIndex === -1) {
        return run;
    }

    if (run.deck.some((card) => card.cardId === cardId)) {
        return run;
    }

    if (isDeckFull(run)) {
        return run;
    }

    const offer = currentNode.shopCardOffers[offerIndex];

    if (run.gold < offer.price) {
        return run;
    }

    const updatedDeck = addCardToDeck(run.deck, cardId);

    if (updatedDeck.length === run.deck.length) {
        return run;
    }

    const updatedOffers = currentNode.shopCardOffers.map(
        (currentOffer, index) =>
            index === offerIndex
                ? { ...currentOffer, purchased: true }
                : currentOffer,
    );

    return {
        ...run,
        gold: run.gold - offer.price,
        deck: updatedDeck,
        map: {
            ...run.map,
            nodes: run.map.nodes.map((node) =>
                node.id === currentNode.id
                    ? {
                          ...node,
                          shopCardOffers: updatedOffers,
                      }
                    : node,
            ),
        },
    };
}

export function buyShopRelic(
    run: RunState,
    relicId: string,
): RunState {
    const currentNode = getCurrentMapNode(run);

    if (
        !currentNode ||
        currentNode.type !== "shop" ||
        currentNode.completed ||
        !currentNode.shopRelicOffers ||
        run.relics.includes(relicId)
    ) {
        return run;
    }

    const offerIndex = currentNode.shopRelicOffers.findIndex(
        (offer) => offer.relicId === relicId && !offer.purchased,
    );

    if (offerIndex === -1) {
        return run;
    }

    const offer = currentNode.shopRelicOffers[offerIndex];

    if (run.gold < offer.price) {
        return run;
    }

    const updatedOffers = currentNode.shopRelicOffers.map(
        (currentOffer, index) =>
            index === offerIndex
                ? { ...currentOffer, purchased: true }
                : currentOffer,
    );

    return {
        ...run,
        gold: run.gold - offer.price,
        relics: [...run.relics, relicId],
        map: {
            ...run.map,
            nodes: run.map.nodes.map((node) =>
                node.id === currentNode.id
                    ? {
                          ...node,
                          shopRelicOffers: updatedOffers,
                      }
                    : node,
            ),
        },
    };
}

export function healAtShop(
    run: RunState,
): RunState {
    const currentNode = getCurrentMapNode(run);

    if (
        !currentNode ||
        currentNode.type !== "shop" ||
        currentNode.completed ||
        currentNode.shopHealPurchased
    ) {
        return run;
    }

    const price = currentNode.shopHealPrice ?? SHOP_HEAL_PRICE;
    const healAmount = getShopHealAmount(run.maxHp);

    if (
        run.gold < price ||
        run.hp >= run.maxHp
    ) {
        return run;
    }

    return {
        ...run,
        gold: run.gold - price,
        hp: Math.min(run.maxHp, run.hp + healAmount),
        map: {
            ...run.map,
            nodes: run.map.nodes.map((node) =>
                node.id === currentNode.id
                    ? {
                          ...node,
                          shopHealPurchased: true,
                      }
                    : node,
            ),
        },
    };
}

export function removeCardAtShop(
    run: RunState,
    cardId: string,
): RunState {
    const currentNode = getCurrentMapNode(run);

    if (
        !currentNode ||
        currentNode.type !== "shop" ||
        currentNode.completed ||
        currentNode.shopRemoveCardPurchased ||
        run.deck.length <= MIN_DECK_SIZE
    ) {
        return run;
    }

    const price =
        currentNode.shopRemoveCardPrice ??
        SHOP_REMOVE_CARD_PRICE;

    if (run.gold < price) {
        return run;
    }

    const updatedDeck = removeCardFromDeckState(
        run.deck,
        cardId,
    );

    if (updatedDeck.length === run.deck.length) {
        return run;
    }

    return {
        ...run,
        gold: run.gold - price,
        deck: updatedDeck,
        map: {
            ...run.map,
            nodes: run.map.nodes.map((node) =>
                node.id === currentNode.id
                    ? {
                          ...node,
                          shopRemoveCardPurchased: true,
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

    const currentNode = getCurrentMapNode(run);
    const isFinalBoss = currentNode?.type === "boss";
    const rewardConfig = isFinalBoss
        ? { ...enemy.reward, tier: "boss" as const }
        : enemy.reward;

    const reward =
        createCombatReward(
            rewardConfig,
            run.availableRelicIds,
            run.relics,
        );

    const updatedRun: RunState = {
        ...run,
        hp: combat.player.hp,
        maxHp: combat.player.maxHp,
        baseActions:
            combat.player.baseActions,
        gold:
            run.gold + reward.gold,
        pendingReward: reward,
        status: isFinalBoss
            ? "completed"
            : "active",
        result: isFinalBoss
            ? "victory"
            : null,
    };

    return completeCurrentMapNode(
        updatedRun,
    );
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

export type RestAction = "recover" | "purge" | "sacrifice";

export function resolveRest(
    run: RunState,
    action: RestAction,
    cardId?: string,
): RunState {
    const currentNode = getCurrentMapNode(run);

    if (
        !currentNode ||
        currentNode.type !== "rest" ||
        currentNode.completed
    ) {
        return run;
    }

    if (action === "recover") {
        if (run.hp >= run.maxHp) {
            return run;
        }

        const healAmount = Math.max(
            1,
            Math.ceil(run.maxHp * 0.3),
        );

        return completeCurrentMapNode({
            ...run,
            hp: Math.min(
                run.maxHp,
                run.hp + healAmount,
            ),
        });
    }

    if (action === "purge") {
        if (
            run.deck.length <= MIN_DECK_SIZE ||
            !cardId
        ) {
            return run;
        }

        const updatedDeck = removeCardFromDeckState(
            run.deck,
            cardId,
        );

        if (updatedDeck.length === run.deck.length) {
            return run;
        }

        return completeCurrentMapNode({
            ...run,
            deck: updatedDeck,
        });
    }

    if (run.hp <= 1) {
        return run;
    }

    const hpLoss = Math.max(
        1,
        Math.ceil(run.maxHp * 0.1),
    );

    return completeCurrentMapNode({
        ...run,
        hp: Math.max(
            1,
            run.hp - hpLoss,
        ),
        gold: run.gold + 30,
    });
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
    choiceId?: string,
): RunState {
    const currentNode = getCurrentMapNode(run);

    if (
        !currentNode ||
        currentNode.type !== "event" ||
        !currentNode.eventId ||
        currentNode.completed
    ) {
        return run;
    }

    if (currentNode.eventId === "remove-random-card" && !choiceId) {
        const updatedRun = removeRandomCardFromDeck(run);

        return {
            ...updatedRun,
            map: {
                ...updatedRun.map,
                nodes: updatedRun.map.nodes.map((node) =>
                    node.id === currentNode.id
                        ? { ...node, completed: true }
                        : node,
                ),
            },
        };
    }

    const event = events.find(
        (definition) => definition.id === currentNode.eventId,
    );

    if (!event || !choiceId) {
        return run;
    }

    const choice = event.choices.find(
        (currentChoice) => currentChoice.id === choiceId,
    );

    if (!choice || !canUseEventChoice(run, choice)) {
        return run;
    }

    const updatedRun = applyEventEffects(run, choice.effects);

    return {
        ...updatedRun,
        map: {
            ...updatedRun.map,
            nodes: updatedRun.map.nodes.map((node) =>
                node.id === currentNode.id
                    ? {
                          ...node,
                          completed: true,
                      }
                    : node,
            ),
        },
    };
}

export function canUseEventChoice(
    run: RunState,
    choice: EventChoice,
): boolean {
    const requirement = choice.requirement;

    if (!requirement) {
        return true;
    }

    return meetsEventRequirement(run, requirement);
}

function meetsEventRequirement(
    run: RunState,
    requirement: EventRequirement,
): boolean {
    switch (requirement.type) {
        case "gold":
            return run.gold >= requirement.amount;

        case "hp":
            return run.hp >= requirement.amount;

        case "deck-size":
            return run.deck.length >= requirement.min;
    }
}

function applyEventEffects(
    run: RunState,
    effects: EventEffect[],
): RunState {
    let nextRun = { ...run };

    for (const effect of effects) {
        switch (effect.type) {
            case "gain-gold":
                nextRun = {
                    ...nextRun,
                    gold: nextRun.gold + Math.max(0, effect.amount),
                };
                break;

            case "lose-gold":
                nextRun = {
                    ...nextRun,
                    gold: Math.max(0, nextRun.gold - effect.amount),
                };
                break;

            case "heal":
                nextRun = {
                    ...nextRun,
                    hp: Math.min(
                        nextRun.maxHp,
                        nextRun.hp + Math.max(0, effect.amount),
                    ),
                };
                break;

            case "lose-hp":
                nextRun = {
                    ...nextRun,
                    hp: Math.max(1, nextRun.hp - Math.max(0, effect.amount)),
                };
                break;

            case "add-card":
                nextRun = addEventCard(nextRun, effect.cardId);
                break;

            case "add-random-card":
                nextRun = addRandomEventCard(nextRun);
                break;

            case "remove-card":
                nextRun = removeCardFromDeck(nextRun, effect.cardId);
                break;

            case "remove-random-card":
                nextRun = removeRandomCardFromDeck(nextRun);
                break;

            case "random-relic":
                nextRun = addRandomEventRelic(nextRun);
                break;
        }
    }

    return nextRun;
}

function addEventCard(
    run: RunState,
    cardId: string,
): RunState {
    if (
        run.deck.length >= MAX_DECK_SIZE ||
        run.deck.some((card) => card.cardId === cardId) ||
        !cards.some((card) => card.id === cardId)
    ) {
        return run;
    }

    return {
        ...run,
        deck: [
            ...run.deck,
            {
                cardId,
                cooldownRemaining: 0,
            },
        ],
    };
}

function addRandomEventCard(
    run: RunState,
): RunState {
    const availableCards = cards.filter(
        (card) => !run.deck.some((deckCard) => deckCard.cardId === card.id),
    );

    if (availableCards.length === 0 || run.deck.length >= MAX_DECK_SIZE) {
        return {
            ...run,
            gold: run.gold + 10,
        };
    }

    const randomCard =
        availableCards[Math.floor(Math.random() * availableCards.length)];

    return addEventCard(run, randomCard.id);
}

function addRandomEventRelic(
    run: RunState,
): RunState {
    const availableRelics = run.availableRelicIds.filter(
        (relicId) => !run.relics.includes(relicId),
    );

    if (availableRelics.length === 0) {
        return {
            ...run,
            gold: run.gold + 20,
        };
    }

    const relicId =
        availableRelics[Math.floor(Math.random() * availableRelics.length)];

    return {
        ...run,
        relics: [...run.relics, relicId],
    };
}

export function removeRandomCardFromDeck(
    run: RunState,
): RunState {
    if (run.deck.length <= MIN_DECK_SIZE) {
        return run;
    }

    const randomIndex = Math.floor(
        Math.random() * run.deck.length,
    );

    return {
        ...run,
        deck: run.deck.filter((_, index) => index !== randomIndex),
    };
}

function removeCardFromDeck(
    run: RunState,
    cardId: string,
): RunState {
    if (run.deck.length <= MIN_DECK_SIZE) {
        return run;
    }

    const index = run.deck.findIndex(
        (card) => card.cardId === cardId,
    );

    if (index === -1) {
        return run;
    }

    return {
        ...run,
        deck: [
            ...run.deck.slice(0, index),
            ...run.deck.slice(index + 1),
        ],
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

export function enterCurrentShop(
    run: RunState,
): RunState {
    return completeCurrentShop(run);
}

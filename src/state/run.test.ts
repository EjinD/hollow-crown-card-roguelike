import { describe, expect, it } from "vitest";

import {
    startRun,
    getCurrentMapNode,
    getAvailableNextNodes,
    selectNextNode,
    triggerCurrentEvent,
    enterCurrentShop,
    completeCurrentMapNode,
} from "./run";

import {
    isValidMap,
    canReachBoss,
} from "../data/map";


import {
    MIN_DECK_SIZE,
} from "../consts/game";

describe("Run", () => {
    it("should start a new run with valid map", () => {
        const run = startRun();

        expect(run.status).toBe("active");
        expect(run.result).toBeNull();

        expect(run.hp).toBe(10);
        expect(run.maxHp).toBe(10);
        expect(run.gold).toBe(0);

        expect(run.deck).toHaveLength(MIN_DECK_SIZE);

        expect(isValidMap(run.map)).toBe(true);
        expect(canReachBoss(run.map)).toBe(true);
    });
});

it("should return the current map node", () => {
    const run = startRun();

    const node = getCurrentMapNode(run);

    expect(node).toBeDefined();
    expect(node?.id).toBe(run.map.currentNodeId);
});

it("should return available next nodes", () => {
    const run = startRun();

    const currentNode = getCurrentMapNode(run);

    expect(currentNode).toBeDefined();

    const nextNodes = getAvailableNextNodes(run);

    expect(nextNodes).toHaveLength(
        currentNode!.nextNodeIds.length,
    );

    for (const node of nextNodes) {
        expect(
            currentNode!.nextNodeIds,
        ).toContain(node.id);
    }
});

it("should not allow selecting next node before current node is completed", () => {
    const run = startRun();

    const nextNode = getAvailableNextNodes(run)[0];

    const result = selectNextNode(
        run,
        nextNode.id,
    );

    expect(result).toEqual(run);
});

it("should select an available next node after completing current node", () => {
    const run = startRun();

    const completedRun = completeCurrentMapNode(run);

    const nextNode =
        getAvailableNextNodes(completedRun)[0];

    const result = selectNextNode(
        completedRun,
        nextNode.id,
    );

    expect(
        result.map.currentNodeId,
    ).toBe(nextNode.id);
});

it("should remove one random card from event", () => {
    const run = startRun();

    const eventRun = {
        ...run,
        deck: [
            ...run.deck,
            {
                cardId: "fireball",
                cooldownRemaining: 0,
            },
        ],
        map: {
            ...run.map,
            currentNodeId:
                run.map.nodes.find(
                    (node) => node.type === "event",
                )?.id ?? run.map.currentNodeId,
        },
    };

    const beforeLength =
        eventRun.deck.length;

    const result =
        triggerCurrentEvent(eventRun);

    expect(result.deck).toHaveLength(
        beforeLength - 1,
    );

    expect(
        getCurrentMapNode(result)?.completed,
    ).toBe(true);
});

it("should not remove a card when deck has minimum size", () => {
    const run = startRun();

    const eventRun = {
        ...run,
        deck: run.deck.slice(0, MIN_DECK_SIZE),
        map: {
            ...run.map,
            currentNodeId: "event-test",
            nodes: [
                ...run.map.nodes,
                {
                    id: "event-test",
                    type: "event" as const,
                    eventId: "remove-random-card" as const,
                    nextNodeIds: [],
                    completed: false,
                },
            ],
        },
    };

    const result =
        triggerCurrentEvent(eventRun);

    expect(result.deck).toHaveLength(
        MIN_DECK_SIZE,
    );

    expect(
        getCurrentMapNode(result)?.completed,
    ).toBe(true);
});

it("should not trigger the same event twice", () => {
    const run = startRun();

    const eventRun = {
        ...run,
        deck: [
            ...run.deck,
            {
                cardId: "fireball",
                cooldownRemaining: 0,
            },
        ],
        map: {
            ...run.map,
            currentNodeId: "event-test",
            nodes: [
                ...run.map.nodes,
                {
                    id: "event-test",
                    type: "event" as const,
                    eventId: "remove-random-card" as const,
                    nextNodeIds: [],
                    completed: false,
                },
            ],
        },
    };

    const firstResult =
        triggerCurrentEvent(eventRun);

    const secondResult =
        triggerCurrentEvent(firstResult);

    expect(secondResult.deck).toHaveLength(
        firstResult.deck.length,
    );
});

it("should complete shop without changing run data", () => {
    const run = startRun();

    const shopRun = {
        ...run,
        map: {
            ...run.map,
            currentNodeId: "shop-test",
            nodes: [
                ...run.map.nodes,
                {
                    id: "shop-test",
                    type: "shop" as const,
                    nextNodeIds: [],
                    completed: false,
                },
            ],
        },
    };

    const result =
        enterCurrentShop(shopRun);

    expect(result.gold).toBe(shopRun.gold);
    expect(result.deck).toEqual(shopRun.deck);

    expect(
        getCurrentMapNode(result)?.completed,
    ).toBe(true);
});
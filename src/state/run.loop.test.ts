import { describe, expect, it, vi } from "vitest";

import {
    buyShopCard,
    buyShopRelic,
    claimRelicReward,
    completeCombat,
    completeCurrentMapNode,
    completeCurrentShop,
    enterCurrentShop,
    getAvailableNextNodes,
    getCurrentMapNode,
    healAtShop,
    removeCardAtShop,
    resolveRest,
    selectNextNode,
    startCurrentCombat,
    startRun,
    triggerCurrentEvent,
} from "./run";
import { MIN_DECK_SIZE } from "../consts/game";
import type { CombatState, MapNode } from "../types/game";

function forceVictoryCombat(run: ReturnType<typeof startRun>): CombatState {
    const combat = startCurrentCombat(run);
    return {
        ...combat,
        phase: "victory",
    };
}

function attachCurrentNode(
    run: ReturnType<typeof startRun>,
    node: MapNode,
) {
    return {
        ...run,
        map: {
            ...run.map,
            currentNodeId: node.id,
            nodes: [...run.map.nodes, node],
        },
    };
}

describe("Run Loop QA", () => {
    it("creates the configured dungeon length and starts at floor 1", () => {
        const tutorial = startRun([], [], undefined, "tutorial");
        const ashenDepths = startRun([], [], undefined, "ashen-depths");

        expect(tutorial.map.nodes.some((node) => node.type === "boss")).toBe(true);
        expect(tutorial.map.nodes.filter((node) => node.id.startsWith("floor-")).length).toBe(6);
        expect(getCurrentMapNode(tutorial)?.id).toBe("floor-1-node-0");

        const ashenBoss = ashenDepths.map.nodes.find((node) => node.type === "boss");
        expect(ashenBoss?.id).toBe("floor-16-node-0");
        expect(ashenDepths.map.nodes.filter((node) => node.id.startsWith("floor-")).some((node) => node.id.startsWith("floor-15-"))).toBe(true);
    });

    it("blocks route selection until the current node is completed", () => {
        const run = startRun();
        const next = getAvailableNextNodes(run)[0];
        expect(next).toBeDefined();
        expect(selectNextNode(run, next.id)).toBe(run);
    });

    it("moves only to a directly connected node after completion", () => {
        const run = startRun();
        const next = getAvailableNextNodes(run)[0];
        const completed = completeCurrentMapNode(run);

        expect(selectNextNode(completed, next.id).map.currentNodeId).toBe(next.id);
        expect(selectNextNode(completed, "not-connected")).toBe(completed);
    });

    it("completes a normal combat, awards gold, and locks route progression behind reward claim", () => {
        vi.spyOn(Math, "random").mockReturnValue(0.99);

        const run = startRun(["molten-heart"]);
        const combat = forceVictoryCombat(run);
        const completed = completeCombat(run, combat);
        const current = getCurrentMapNode(completed);

        expect(current?.completed).toBe(true);
        expect(completed.gold).toBeGreaterThan(run.gold);
        expect(completed.pendingReward).not.toBeNull();
        expect(getAvailableNextNodes(completed).length).toBeGreaterThan(0);

        const next = getAvailableNextNodes(completed)[0];
        expect(selectNextNode(completed, next.id)).toBe(completed);

        const claimed = claimRelicReward(completed);
        expect(claimed.pendingReward).toBeNull();
        expect(selectNextNode(claimed, next.id).map.currentNodeId).toBe(next.id);

        vi.restoreAllMocks();
    });

    it("defeat completes the run without creating a pending reward", () => {
        const run = startRun();
        const combat = startCurrentCombat(run);
        const defeated: CombatState = { ...combat, phase: "defeat", player: { ...combat.player, hp: 0 } };
        const result = completeCombat(run, defeated);

        expect(result.status).toBe("completed");
        expect(result.result).toBe("defeat");
        expect(result.pendingReward).toBeNull();
    });

    it("boss victory completes the run and creates a final reward", () => {
        const run = startRun([], [], undefined, "tutorial");
        const bossNode = run.map.nodes.find((node) => node.type === "boss");
        expect(bossNode).toBeDefined();

        const bossRun = {
            ...run,
            map: { ...run.map, currentNodeId: bossNode!.id },
        };
        const combat = forceVictoryCombat(bossRun);
        const result = completeCombat(bossRun, combat);

        expect(result.status).toBe("completed");
        expect(result.result).toBe("victory");
        expect(result.pendingReward).not.toBeNull();
        expect(getCurrentMapNode(result)?.completed).toBe(true);
    });

    it("walks a generated branched map to the boss through valid route selections", () => {
        let run = startRun([], [], undefined, "ashen-depths");
        let guard = 0;

        while (getCurrentMapNode(run)?.type !== "boss" && guard < 30) {
            run = completeCurrentMapNode(run);
            const next = getAvailableNextNodes(run)[0];
            expect(next).toBeDefined();
            run = selectNextNode(run, next.id);
            guard += 1;
        }

        expect(getCurrentMapNode(run)?.type).toBe("boss");
        expect(guard).toBeLessThan(30);
    });

    it("completes an event only after a valid choice", () => {
        const run = attachCurrentNode(startRun(), {
            id: "event-qa",
            type: "event",
            eventId: "three-chests",
            nextNodeIds: [],
            completed: false,
        });

        const invalid = triggerCurrentEvent(run, "missing-choice");
        expect(invalid).toBe(run);
        expect(getCurrentMapNode(invalid)?.completed).toBe(false);

        const resolved = triggerCurrentEvent(run, "gold");
        expect(resolved.gold).toBe(35);
        expect(getCurrentMapNode(resolved)?.completed).toBe(true);

        const second = triggerCurrentEvent(resolved, "gold");
        expect(second.gold).toBe(resolved.gold);
    });

    it("prevents event choice requirements from being bypassed", () => {
        const run = attachCurrentNode(startRun(), {
            id: "event-qa",
            type: "event",
            eventId: "masked-merchant",
            nextNodeIds: [],
            completed: false,
        });

        const blocked = triggerCurrentEvent(run, "buy-card");
        expect(blocked).toBe(run);
    });

    it("allows shop purchases, prevents duplicate purchases, and completes on exit", () => {
        vi.spyOn(Math, "random").mockReturnValue(0.01);

        const base = startRun(["molten-heart"]);
        const shopNode: MapNode = {
            id: "shop-qa",
            type: "shop",
            nextNodeIds: [],
            completed: false,
        };
        const run = attachCurrentNode(base, {
            ...shopNode,
            shopCardOffers: [{ cardId: "wildfire", price: 40, purchased: false }],
            shopRelicOffers: [{ relicId: "molten-heart", price: 70, purchased: false }],
            shopHealPrice: 20,
            shopHealPurchased: false,
            shopRemoveCardPrice: 60,
            shopRemoveCardPurchased: false,
        });
        const funded = { ...run, gold: 100, hp: 5 };

        const cardBought = buyShopCard(funded, "wildfire");
        expect(cardBought.gold).toBe(60);
        expect(cardBought.deck.some((card) => card.cardId === "wildfire")).toBe(true);

        const duplicate = buyShopCard(cardBought, "wildfire");
        expect(duplicate).toBe(cardBought);

        const relicBought = buyShopRelic(cardBought, "molten-heart");
        expect(relicBought).toBe(cardBought);

        vi.restoreAllMocks();
    });

    it("does not let shop state spend beyond available gold", () => {
        const base = startRun(["molten-heart"]);
        const run = attachCurrentNode(base, {
            id: "shop-qa",
            type: "shop",
            nextNodeIds: [],
            completed: false,
            shopCardOffers: [{ cardId: "wildfire", price: 40, purchased: false }],
            shopRelicOffers: [],
            shopHealPrice: 20,
            shopHealPurchased: false,
            shopRemoveCardPrice: 60,
            shopRemoveCardPurchased: false,
        });

        expect(buyShopCard(run, "wildfire")).toBe(run);
        expect(buyShopRelic(run, "molten-heart")).toBe(run);
    });

    it("heals and removes a card at shop within their one-time limits", () => {
        const base = startRun(["molten-heart"]);
        const run = attachCurrentNode({ ...base, hp: 5, gold: 100, deck: [...base.deck, { cardId: "wildfire", cooldownRemaining: 0 }] }, {
            id: "shop-qa",
            type: "shop",
            nextNodeIds: [],
            completed: false,
            shopCardOffers: [],
            shopRelicOffers: [],
            shopHealPrice: 20,
            shopHealPurchased: false,
            shopRemoveCardPrice: 60,
            shopRemoveCardPurchased: false,
        });

        const healed = healAtShop(run);
        expect(healed.hp).toBeGreaterThan(run.hp);
        expect(healed.gold).toBe(80);
        expect(healAtShop(healed)).toBe(healed);

        const purged = removeCardAtShop(healed, "wildfire");
        expect(purged.deck).toHaveLength(healed.deck.length - 1);
        expect(purged.gold).toBe(20);
        expect(removeCardAtShop(purged, "fireball")).toBe(purged);
    });

    it("leaving a shop marks it completed exactly once", () => {
        const run = attachCurrentNode(startRun(), {
            id: "shop-qa",
            type: "shop",
            nextNodeIds: [],
            completed: false,
            shopCardOffers: [],
            shopRelicOffers: [],
        });

        const entered = enterCurrentShop(run);
        const completed = completeCurrentShop(run);
        expect(getCurrentMapNode(entered)?.completed).toBe(true);
        expect(getCurrentMapNode(completed)?.completed).toBe(true);
        expect(completeCurrentShop(completed)).toBe(completed);
    });

    it("resolves rest actions and keeps their minimum invariants", () => {
        const base = startRun([], [], undefined, "tutorial");
        const restRun = attachCurrentNode(
            { ...base, hp: 4, deck: [...base.deck, { cardId: "wildfire", cooldownRemaining: 0 }] },
            { id: "rest-qa", type: "rest", nextNodeIds: [], completed: false },
        );

        const recovered = resolveRest(restRun, "recover");
        expect(recovered.hp).toBeGreaterThan(restRun.hp);
        expect(getCurrentMapNode(recovered)?.completed).toBe(true);

        const purged = resolveRest(restRun, "purge", "wildfire");
        expect(purged.deck).toHaveLength(restRun.deck.length - 1);
        expect(getCurrentMapNode(purged)?.completed).toBe(true);

        const sacrificed = resolveRest(restRun, "sacrifice");
        expect(sacrificed.hp).toBeGreaterThanOrEqual(1);
        expect(sacrificed.gold).toBe(30);
        expect(getCurrentMapNode(sacrificed)?.completed).toBe(true);

        const minDeckRest = attachCurrentNode(
            { ...base, hp: 8 },
            { id: "rest-min", type: "rest", nextNodeIds: [], completed: false },
        );
        expect(resolveRest(minDeckRest, "purge", "fireball")).toBe(minDeckRest);
        expect(minDeckRest.deck).toHaveLength(MIN_DECK_SIZE);
    });
});

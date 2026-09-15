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
    replaceCardInDeck,
    startCurrentCombat,
    completeCombat,
    skipReward,
    startRun,
    selectNextNode,
    triggerCurrentEvent,
    buyShopCard,
    healAtShop,
    completeCurrentShop,
} from "./state/run";

import { events } from "./data/events";
import { MAX_DECK_SIZE } from "./consts/game";

import MapScreen from "./components/mapScreen";
import CombatScreen from "./components/CombatScreen";
import RewardScreen from "./components/RewardScreen";
import EventScreen from "./components/EventScreen";
import ShopScreen from "./components/ShopScreen";
import GameOverScreen from "./components/GameOverScreen";

type GameScreen =
    | "map"
    | "combat"
    | "reward"
    | "event"
    | "shop"
    | "game-over";

export default function App() {
    const [run, setRun] = useState<RunState>(
        () => startRun(),
    );

    const [combat, setCombat] =
        useState<CombatState | null>(null);

    const [screen, setScreen] =
        useState<GameScreen>("map");

    const [
        isEnemyTurnAnimating,
        setIsEnemyTurnAnimating,
    ] = useState(false);

    const [
        isEnemyAttacking,
        setIsEnemyAttacking,
    ] = useState(false);

    function handleEnterCurrentNode() {
        const currentNode =
            run.map.nodes.find(
                (node) =>
                    node.id ===
                    run.map.currentNodeId,
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

            return;
        }

        if (currentNode.type === "event") {
            setScreen("event");
            return;
        }

        if (currentNode.type === "shop") {
            setScreen("shop");
        }
    }

    function handleRestart() {
        setRun(startRun());
        setCombat(null);
        setIsEnemyTurnAnimating(false);
        setIsEnemyAttacking(false);
        setScreen("map");
    }

    function handleSelectNode(
        nodeId: string,
    ) {
        const nextRun =
            selectNextNode(
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
                (item) =>
                    item.id === nodeId,
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
                startCurrentCombat(
                    nextRun,
                );

            setCombat(newCombat);
            setScreen("combat");

            return;
        }

        if (node.type === "event") {
            setScreen("event");
            return;
        }

        if (node.type === "shop") {
            setScreen("shop");
        }
    }

    function handleAcceptEvent() {
        const nextRun =
            triggerCurrentEvent(run);

        setRun(nextRun);
        setScreen("map");
    }

    function finishCombat(
        combatState: CombatState,
    ) {
        const nextRun =
            completeCombat(
                run,
                combatState,
            );

        setRun(nextRun);
        setCombat(combatState);

        if (
            combatState.phase ===
            "defeat"
        ) {
            setScreen("game-over");
            return;
        }

        if (
            nextRun.status ===
                "completed" &&
            nextRun.result ===
                "victory"
        ) {
            setScreen("game-over");
            return;
        }

        setScreen("reward");
    }

    function handlePlayCard(
        cardId: string,
    ) {
        if (
            !combat ||
            isEnemyTurnAnimating ||
            isEnemyAttacking
        ) {
            return;
        }

        const nextCombat =
            playCard(
                combat,
                cardId,
            );

        if (
            nextCombat.phase ===
                "victory" ||
            nextCombat.phase ===
                "defeat"
        ) {
            finishCombat(
                nextCombat,
            );
            return;
        }

        setCombat(nextCombat);
    }

    function handleEndTurn() {
        if (
            !combat ||
            combat.phase !==
                "player-turn" ||
            isEnemyTurnAnimating ||
            isEnemyAttacking
        ) {
            return;
        }

        const afterEndPlayerTurn =
            endPlayerTurn(combat);

        setCombat(
            afterEndPlayerTurn,
        );

        /*
         * Phase 1:
         * Intent is displayed.
         */
        setIsEnemyTurnAnimating(
            true,
        );

        window.setTimeout(() => {
            /*
             * Phase 2:
             * Enemy starts executing
             * its current intent.
             */
            setIsEnemyTurnAnimating(
                false,
            );

            setIsEnemyAttacking(true);

            window.setTimeout(() => {
                /*
                 * Phase 3:
                 * Apply actual enemy action.
                 */
                setIsEnemyAttacking(
                    false,
                );

                const nextCombat =
                    advanceCombat(
                        afterEndPlayerTurn,
                    );

                if (
                    nextCombat.phase ===
                        "victory" ||
                    nextCombat.phase ===
                        "defeat"
                ) {
                    finishCombat(
                        nextCombat,
                    );
                    return;
                }

                setCombat(
                    nextCombat,
                );
            }, 520);
        }, 650);
    }

    function handleClaimReward(
        cardId: string,
    ) {
        const nextRun =
            claimCardReward(
                run,
                cardId,
            );

        setRun(nextRun);

        if (
            nextRun.pendingReward ===
            null
        ) {
            setScreen("map");
        }
    }

    function handleReplaceCard(
        oldCardId: string,
        newCardId: string,
    ) {
        const nextRun =
            replaceCardInDeck(
                run,
                oldCardId,
                newCardId,
            );

        setRun(nextRun);

        if (
            nextRun.pendingReward ===
            null
        ) {
            setScreen("map");
        }
    }

    function handleSkipReward() {
        const nextRun =
            skipReward(run);

        setRun(nextRun);
        setScreen("map");
    }

    function handleBuyShopCard(
        cardId: string,
    ) {
        const nextRun =
            buyShopCard(
                run,
                cardId,
            );

        setRun(nextRun);
    }

    function handleHeal() {
        const nextRun =
            healAtShop(run);

        setRun(nextRun);
    }

    function handleLeaveShop() {
        const nextRun =
            completeCurrentShop(
                run,
            );

        setRun(nextRun);
        setScreen("map");
    }

    function getCurrentEvent() {
        const currentNode =
            run.map.nodes.find(
                (node) =>
                    node.id ===
                    run.map.currentNodeId,
            );

        if (
            !currentNode ||
            currentNode.type !==
                "event"
        ) {
            return null;
        }

        return events.find(
            (event) =>
                event.id ===
                currentNode.eventId,
        );
    }

    function getCurrentShop() {
        const currentNode =
            run.map.nodes.find(
                (node) =>
                    node.id ===
                    run.map.currentNodeId,
            );

        if (
            !currentNode ||
            currentNode.type !==
                "shop"
        ) {
            return null;
        }

        return currentNode;
    }

    const currentEvent =
        getCurrentEvent();

    const currentShop =
        getCurrentShop();

    return (
        <>
            {screen === "map" && (
                <MapScreen
                    run={run}
                    onSelectNode={
                        handleSelectNode
                    }
                    onEnterCurrentNode={
                        handleEnterCurrentNode
                    }
                />
            )}

            {screen === "combat" &&
                combat && (
                    <CombatScreen
                        combat={combat}
                        gold={run.gold}
                        isEnemyTurnAnimating={
                            isEnemyTurnAnimating
                        }
                        isEnemyAttacking={
                            isEnemyAttacking
                        }
                        onPlayCard={
                            handlePlayCard
                        }
                        onEndTurn={
                            handleEndTurn
                        }
                    />
                )}

            {screen === "event" &&
                currentEvent && (
                    <EventScreen
                        title={
                            currentEvent.name
                        }
                        description="The flames demand a sacrifice. One card from your deck will be consumed."
                        onAccept={
                            handleAcceptEvent
                        }
                    />
                )}

            {screen === "shop" &&
                currentShop && (
                    <ShopScreen
                        gold={run.gold}
                        hp={run.hp}
                        maxHp={run.maxHp}
                        deckSize={
                            run.deck.length
                        }
                        maxDeckSize={
                            MAX_DECK_SIZE
                        }
                        offers={
                            currentShop.shopOffers ??
                            []
                        }
                        healPrice={
                            currentShop.shopHealPrice ??
                            10
                        }
                        healPurchased={
                            currentShop.shopHealPurchased ??
                            false
                        }
                        onBuyCard={
                            handleBuyShopCard
                        }
                        onHeal={
                            handleHeal
                        }
                        onLeave={
                            handleLeaveShop
                        }
                    />
                )}

            {screen === "reward" &&
                run.pendingReward && (
                    <RewardScreen
                        reward={
                            run.pendingReward
                        }
                        deck={run.deck}
                        onClaim={
                            handleClaimReward
                        }
                        onReplace={
                            handleReplaceCard
                        }
                        onSkip={
                            handleSkipReward
                        }
                    />
                )}

            {screen === "game-over" && (
                <GameOverScreen
                    result={
                        run.result ??
                        "defeat"
                    }
                    gold={run.gold}
                    deckSize={
                        run.deck.length
                    }
                    onRestart={
                        handleRestart
                    }
                />
            )}
        </>
    );
}
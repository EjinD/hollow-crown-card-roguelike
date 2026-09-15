import {
    useEffect,
    useRef,
    useState,
} from "react";

import type {
    CombatState,
    RunState,
} from "./types/game";

import type { MetaProgressState } from "./types/meta";

import {
    advanceCombat,
    endPlayerTurn,
    playCard,
} from "./engine/combat";

import {
    claimRelicReward,
    startCurrentCombat,
    completeCombat,
    startRun,
    selectNextNode,
    triggerCurrentEvent,
    buyShopCard,
    healAtShop,
    completeCurrentShop,
} from "./state/run";

import {
    completeRunInMetaProgress,
    getHubProgressionLevel,
    getUnlockedRelicIds,
    loadMetaProgress,
    openCardPack,
    purchaseHubUpgrade,
} from "./state/meta-state";

import { events } from "./data/events";
import { MAX_DECK_SIZE } from "./consts/game";

import StarterScreen from "./components/StarterScreen";
import LandingScreen from "./components/LandingScreen";
import HubScreen from "./components/HubScreen";
import CardVaultScreen from "./components/CardVaultScreen";
import ArmoryScreen from "./components/ArmoryScreen";
import MapScreen from "./components/mapScreen";
import CombatScreen from "./components/CombatScreen";
import RewardScreen from "./components/RewardScreen";
import EventScreen from "./components/EventScreen";
import ShopScreen from "./components/ShopScreen";
import GameOverScreen from "./components/GameOverScreen";

type GameScreen =
    | "landing"
    | "hub"
    | "card-vault"
    | "armory"
    | "map"
    | "combat"
    | "reward"
    | "event"
    | "shop"
    | "game-over";

type EnemyAction =
    | "attack"
    | "block"
    | "heal"
    | "buff"
    | "debuff"
    | null;

type EnemyActionType = Exclude<
    EnemyAction,
    null
>;

interface EnemyActionTiming {
    duration: number;
    impact: number;
}

const ENEMY_ACTION_TIMING: Record<
    EnemyActionType,
    EnemyActionTiming
> = {
    attack: {
        duration: 520,
        impact: 285,
    },

    block: {
        duration: 520,
        impact: 285,
    },

    heal: {
        duration: 650,
        impact: 225,
    },

    buff: {
        duration: 650,
        impact: 225,
    },

    debuff: {
        duration: 650,
        impact: 355,
    },
};

function getEnemyActionTiming(
    action: EnemyActionType,
): EnemyActionTiming {
    return ENEMY_ACTION_TIMING[action];
}

export default function App() {
    const [run, setRun] = useState<RunState>(
        () => startRun(),
    );

    const [meta, setMeta] =
        useState<MetaProgressState>(
            () => loadMetaProgress(),
        );

    const [combat, setCombat] =
        useState<CombatState | null>(null);

    const [screen, setScreen] =
        useState<GameScreen>("landing");

    const [isBooting, setIsBooting] =
        useState(true);

    const [
        isEnemyTurnAnimating,
        setIsEnemyTurnAnimating,
    ] = useState(false);

    const [
        isEnemyAttacking,
        setIsEnemyAttacking,
    ] = useState(false);

    const [
        enemyAction,
        setEnemyAction,
    ] = useState<EnemyAction>(null);

    const intentTimerRef =
        useRef<number | null>(null);

    const impactTimerRef =
        useRef<number | null>(null);

    const animationEndTimerRef =
        useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (intentTimerRef.current !== null) {
                window.clearTimeout(
                    intentTimerRef.current,
                );
            }

            if (impactTimerRef.current !== null) {
                window.clearTimeout(
                    impactTimerRef.current,
                );
            }

            if (
                animationEndTimerRef.current !==
                null
            ) {
                window.clearTimeout(
                    animationEndTimerRef.current,
                );
            }
        };
    }, []);

    function clearEnemyAnimation() {
        setIsEnemyTurnAnimating(false);
        setIsEnemyAttacking(false);
        setEnemyAction(null);
    }

    function handleLandingEnter() {
        setScreen("hub");
    }

    function handleOpenArmory() {
        setScreen("armory");
    }

    function handleUpgradeHub(upgradeId: string) {
        const nextState = purchaseHubUpgrade(
            meta,
            upgradeId,
        );

        if (!nextState) {
            return;
        }

        setMeta(nextState);
    }

    function handleStartRun() {
        setScreen("map");
        setRun(
            startRun(
                getUnlockedRelicIds(meta),
                meta.upgrades,
            ),
        );
        setCombat(null);
        clearEnemyAnimation();
    }

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
        if (intentTimerRef.current !== null) {
            window.clearTimeout(
                intentTimerRef.current,
            );
        }

        if (impactTimerRef.current !== null) {
            window.clearTimeout(
                impactTimerRef.current,
            );
        }

        if (
            animationEndTimerRef.current !==
            null
        ) {
            window.clearTimeout(
                animationEndTimerRef.current,
            );
        }

        setRun(
            startRun(
                getUnlockedRelicIds(meta),
                meta.upgrades,
            ),
        );
        setCombat(null);
        clearEnemyAnimation();
        setScreen("hub");
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

        const node = nextRun.map.nodes.find(
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

    function handleChooseEvent(choiceId: string) {
        const nextRun = triggerCurrentEvent(run, choiceId);

        if (nextRun === run) {
            return;
        }

        setRun(nextRun);
        setScreen("map");
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
        clearEnemyAnimation();

        if (combatState.phase === "defeat") {
            const syncedMeta =
                completeRunInMetaProgress(
                    meta,
                    "defeat",
                    nextRun.gold,
                );

            setMeta(syncedMeta);
            setScreen("game-over");
            return;
        }

        if (
            nextRun.status === "completed" &&
            nextRun.result === "victory"
        ) {
            const syncedMeta =
                completeRunInMetaProgress(
                    meta,
                    "victory",
                    nextRun.gold,
                    combatState.enemy.definitionId,
                );

            setMeta(syncedMeta);
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

    function handleEndTurn() {
        if (
            !combat ||
            combat.phase !== "player-turn" ||
            isEnemyTurnAnimating ||
            isEnemyAttacking
        ) {
            return;
        }

        if (
            intentTimerRef.current !== null ||
            impactTimerRef.current !== null ||
            animationEndTimerRef.current !== null
        ) {
            return;
        }

        const afterEndPlayerTurn =
            endPlayerTurn(combat);

        const currentEnemyAction =
            afterEndPlayerTurn.enemy.intent
                .type;

        const actionTiming =
            getEnemyActionTiming(
                currentEnemyAction,
            );

        setCombat(afterEndPlayerTurn);
        setEnemyAction(currentEnemyAction);
        setIsEnemyTurnAnimating(true);

        intentTimerRef.current = window.setTimeout(
            () => {
                intentTimerRef.current = null;
                setIsEnemyTurnAnimating(false);
                setIsEnemyAttacking(true);

                impactTimerRef.current =
                    window.setTimeout(() => {
                        impactTimerRef.current = null;

                        const nextCombat =
                            advanceCombat(
                                afterEndPlayerTurn,
                            );

                        setCombat(nextCombat);

                        const remainingDuration =
                            Math.max(
                                0,
                                actionTiming.duration -
                                    actionTiming.impact,
                            );

                        animationEndTimerRef.current =
                            window.setTimeout(() => {
                                animationEndTimerRef.current =
                                    null;

                                setIsEnemyAttacking(
                                    false,
                                );

                                setEnemyAction(null);

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
                            }, remainingDuration);
                    }, actionTiming.impact);
            },
            650,
        );
    }

    function handleClaimRelicReward() {
        const nextRun = claimRelicReward(
            run,
        );

        setRun(nextRun);

        if (
            nextRun.status === "completed" &&
            nextRun.result === "victory"
        ) {
            setScreen("game-over");
            return;
        }

        setScreen("map");
    }

    function handleBuyShopCard(
        cardId: string,
    ) {
        const nextRun = buyShopCard(
            run,
            cardId,
        );

        setRun(nextRun);
    }

    function handleHeal() {
        const nextRun = healAtShop(run);

        setRun(nextRun);
    }

    function handleLeaveShop() {
        const nextRun = completeCurrentShop(
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
            currentNode.type !== "event"
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
            currentNode.type !== "shop"
        ) {
            return null;
        }

        return currentNode;
    }

    const currentEvent = getCurrentEvent();
    const currentShop = getCurrentShop();

    if (isBooting) {
        return (
            <StarterScreen
                onReady={() =>
                    setIsBooting(false)
                }
            />
        );
    }

    return (
        <>
            {screen === "landing" && (
                <LandingScreen
                    onEnter={
                        handleLandingEnter
                    }
                />
            )}

            {screen === "hub" && (
                <>
                    <HubScreen
                        meta={meta}
                        onStartRun={
                            handleStartRun
                        }
                        onOpenCardVault={() =>
                            setScreen("card-vault")
                        }
                        onOpenArmory={
                            handleOpenArmory
                        }
                    />

                </>
            )}

            {screen === "card-vault" && (
                <CardVaultScreen
                    meta={meta}
                    onBuyPack={() => {
                        const result = openCardPack(meta);

                        if (!result) {
                            return null;
                        }

                        setMeta(result.state);
                        return result.cardIds;
                    }}
                    onClose={() =>
                        setScreen("hub")
                    }
                />
            )}


            {screen === "armory" && (
                <ArmoryScreen
                    meta={meta}
                    onUpgrade={handleUpgradeHub}
                    onBack={() => setScreen("hub")}
                />
            )}

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
                        deck={run.deck}
                        relics={run.relics}
                        upgrades={run.upgrades}
                        maxDeckSize={
                            MAX_DECK_SIZE
                        }
                        isEnemyTurnAnimating={
                            isEnemyTurnAnimating
                        }
                        isEnemyAttacking={
                            isEnemyAttacking
                        }
                        enemyAction={enemyAction}
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
                        event={currentEvent}
                        hp={run.hp}
                        gold={run.gold}
                        deckSize={run.deck.length}
                        onChoose={
                            handleChooseEvent
                        }
                    />
                )}

            {screen === "shop" &&
                currentShop && (
                    <ShopScreen
                        gold={run.gold}
                        hp={run.hp}
                        maxHp={run.maxHp}
                        deckSize={run.deck.length}
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
                        onHeal={handleHeal}
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
                        onContinue={
                            handleClaimRelicReward
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

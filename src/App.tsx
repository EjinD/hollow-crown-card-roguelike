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
    buyShopRelic,
    healAtShop,
    removeCardAtShop,
    completeCurrentShop,
    resolveRest,
} from "./state/run";

import {
    completeRunInMetaProgress,
    getHubProgressionLevel,
    getUnlockedRelicIds,
    loadMetaProgress,
    openCardPack,
    craftCard,
    purchaseHubUpgrade,
    saveDeckToMeta,
} from "./state/meta-state";

import { events } from "./data/events";
import { getDungeonById, isDungeonUnlocked } from "./data/dungeons";
import { MAX_DECK_SIZE } from "./consts/game";

import StarterScreen from "./components/StarterScreen";
import LandingScreen from "./components/LandingScreen";
import HubScreen from "./components/HubScreen";
import CardPacksScreen from "./components/CardPacksScreen";
import CollectionScreen from "./components/CollectionScreen";
import ArmoryScreen from "./components/ArmoryScreen";
import MapScreen from "./components/mapScreen";
import CombatScreen from "./components/CombatScreen";
import RewardScreen from "./components/RewardScreen";
import EventScreen from "./components/EventScreen";
import ShopScreen from "./components/ShopScreen";
import RestScreen from "./components/RestScreen";
import GameOverScreen from "./components/GameOverScreen";
import DungeonGateScreen from "./components/DungeonGateScreen";

type GameScreen =
    | "landing"
    | "hub"
    | "dungeon-gate"
    | "packs"
    | "collection"
    | "armory"
    | "map"
    | "combat"
    | "reward"
    | "event"
    | "shop"
    | "rest"
    | "game-over";

type EnemyAction =
    | "attack"
    | "attack-debuff"
    | "attack-buff"
    | "drain"
    | "block"
    | "block-buff"
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
    attack: { duration: 520, impact: 285 },
    "attack-debuff": { duration: 680, impact: 360 },
    "attack-buff": { duration: 680, impact: 300 },
    drain: { duration: 680, impact: 310 },
    block: { duration: 520, impact: 285 },
    "block-buff": { duration: 680, impact: 320 },
    heal: { duration: 680, impact: 300 },
    buff: { duration: 680, impact: 300 },
    debuff: { duration: 680, impact: 340 },
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

    const enemyWindupTimerRef =
        useRef<number | null>(null);

    const impactTimerRef =
        useRef<number | null>(null);

    const animationEndTimerRef =
        useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (enemyWindupTimerRef.current !== null) {
                window.clearTimeout(
                    enemyWindupTimerRef.current,
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

    function handleOpenDungeonGate() {
        setScreen("dungeon-gate");
    }

    function handleSelectDungeon(dungeonId: string) {
        const dungeon = getDungeonById(dungeonId);

        if (!dungeon || !isDungeonUnlocked(dungeon, meta)) {
            return;
        }

        setRun(
            startRun(
                getUnlockedRelicIds(meta),
                meta.upgrades,
                meta.savedDeck,
                dungeon.id,
            ),
        );
        setCombat(null);
        clearEnemyAnimation();
        setScreen("map");
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
            return;
        }

        if (currentNode.type === "rest") {
            setScreen("rest");
        }
    }

    function handleReturnToHub() {
        if (enemyWindupTimerRef.current !== null) {
            window.clearTimeout(
                enemyWindupTimerRef.current,
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
            return;
        }

        if (node.type === "rest") {
            setScreen("rest");
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

        const completeAfterPresentation = () => {
            if (combatState.phase === "defeat") {
                const syncedMeta =
                    completeRunInMetaProgress(
                        meta,
                        "defeat",
                        nextRun.gold,
                        undefined,
                        nextRun.dungeonId,
                    );

                setMeta(syncedMeta);
                setScreen("game-over");
                return;
            }

            setScreen("reward");
        };

        /*
         * Keep the combat scene alive long enough for the defeated actor
         * to play its death pose before switching to the next screen.
         */
        animationEndTimerRef.current =
            window.setTimeout(() => {
                animationEndTimerRef.current = null;
                completeAfterPresentation();
            }, 720);
    }

    function handlePlayCard(
        cardId: string,
    ) {
        if (
            !combat ||
            combat.player.actions <= 0 ||
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
            enemyWindupTimerRef.current !== null ||
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

        enemyWindupTimerRef.current = window.setTimeout(
            () => {
                enemyWindupTimerRef.current = null;
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
            260,
        );
    }

    function handleClaimRelicReward() {
        const nextRun = claimRelicReward(run);

        setRun(nextRun);

        if (
            nextRun.status === "completed" &&
            nextRun.result === "victory"
        ) {
            const syncedMeta =
                completeRunInMetaProgress(
                    meta,
                    "victory",
                    nextRun.gold,
                    combat?.enemy.definitionId,
                    nextRun.dungeonId,
                );

            setMeta(syncedMeta);
            setCombat(null);
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

    function handleBuyShopRelic(relicId: string) {
        const nextRun = buyShopRelic(run, relicId);
        setRun(nextRun);
    }

    function handleRemoveCardAtShop(cardId: string) {
        const nextRun = removeCardAtShop(run, cardId);
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

    function handleRestRecover() {
        const nextRun = resolveRest(run, "recover");
        if (nextRun === run) {
            return;
        }
        setRun(nextRun);
        setScreen("map");
    }

    function handleRestPurge(cardId: string) {
        const nextRun = resolveRest(run, "purge", cardId);
        if (nextRun === run) {
            return;
        }
        setRun(nextRun);
        setScreen("map");
    }

    function handleRestSacrifice() {
        const nextRun = resolveRest(run, "sacrifice");
        if (nextRun === run) {
            return;
        }
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

    const currentMapNode =
        run.map.nodes.find(
            (node) =>
                node.id === run.map.currentNodeId,
        );

    const currentFloor = (() => {
        const match = currentMapNode?.id.match(
            /floor-(\d+)/,
        );

        return match
            ? Number(match[1])
            : 1;
    })();

    const currentDungeon = getDungeonById(
        run.dungeonId,
    );

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
                            handleOpenDungeonGate
                        }
                        onOpenCardPacks={() =>
                            setScreen("packs")
                        }
                        onOpenCollection={() =>
                            setScreen("collection")
                        }
                        onOpenArmory={
                            handleOpenArmory
                        }
                        onOpenShop={() => setScreen("shop")}
                    />

                </>
            )}

            {screen === "dungeon-gate" && (
                <DungeonGateScreen
                    meta={meta}
                    savedDeckSize={meta.savedDeck.length}
                    onBack={() => setScreen("hub")}
                    onSelectDungeon={handleSelectDungeon}
                />
            )}

            {screen === "packs" && (
                <CardPacksScreen
                    meta={meta}
                    onOpenPack={() => {
                        const result = openCardPack(meta);

                        if (!result) {
                            return null;
                        }

                        setMeta(result.state);
                        return result;
                    }}
                    onClose={() => setScreen("hub")}
                />
            )}

            {screen === "collection" && (
                <CollectionScreen
                    meta={meta}
                    onSaveDeck={(cardIds) => {
                        const result = saveDeckToMeta(
                            meta,
                            cardIds,
                        );

                        if (!result) {
                            return false;
                        }

                        setMeta(result);
                        return true;
                    }}
                    onCraftCard={(cardId) => {
                        const result = craftCard(
                            meta,
                            cardId,
                        );

                        if (!result) {
                            return false;
                        }

                        setMeta(result);
                        return true;
                    }}
                    onClose={() => setScreen("hub")}
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
                        cardOffers={
                            currentShop.shopCardOffers ??
                            []
                        }
                        relicOffers={
                            currentShop.shopRelicOffers ??
                            []
                        }
                        healPrice={
                            currentShop.shopHealPrice ??
                            20
                        }
                        healPurchased={
                            currentShop.shopHealPurchased ??
                            false
                        }
                        removeCardPrice={
                            currentShop.shopRemoveCardPrice ??
                            60
                        }
                        removeCardPurchased={
                            currentShop.shopRemoveCardPurchased ??
                            false
                        }
                        deck={run.deck}
                        relicsOwned={run.relics}
                        onBuyCard={
                            handleBuyShopCard
                        }
                        onBuyRelic={
                            handleBuyShopRelic
                        }
                        onHeal={handleHeal}
                        onRemoveCard={
                            handleRemoveCardAtShop
                        }
                        onLeave={
                            handleLeaveShop
                        }
                    />
                )}

            {screen === "rest" && (
                <RestScreen
                    run={run}
                    onRecover={handleRestRecover}
                    onPurge={handleRestPurge}
                    onSacrifice={handleRestSacrifice}
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
                    dungeonId={run.dungeonId}
                    gold={run.gold}
                    deckSize={run.deck.length}
                    currentFloor={currentFloor}
                    floorCount={
                        currentDungeon?.floorCount ??
                        currentFloor
                    }
                    relicIds={run.relics}
                    onReturnToHub={
                        handleReturnToHub
                    }
                />
            )}
        </>
    );
}

import {
    useEffect,
    useRef,
    useState,
} from "react";

import type {
    CardState,
    CombatState,
    StatusEffect,
} from "../types/game";

import { enemies } from "../data/enemies";
import { cards } from "../data/cards";
import { getPlayerArtwork, type PlayerAnimationState } from "../data/playerAssets";
import battlefieldImage from "../assets/backgrounds/battlefield.png";
import {
    getEnemyAnimationState,
    getEnemyArtwork,
} from "../data/enemyAssets";

import CombatCharacter, {
    type CharacterEffect,
    type EnemyActionEffect,
} from "./CombatCharacter";
import CombatHeader from "./CombatHeader";
import StatusEffects from "./StatusEffects";
import CombatTable from "./CombatTable";
import CombatHealthBar from "./CombatHealthBar";
import PlayedCardOverlay from "./PlayedCardOverlay";
import InventoryScreen from "./InventoryScreen";
import CombatFeedback, {
    type CombatFeedbackItem,
} from "./CombatFeedbackOverlay";

interface CombatScreenProps {
    combat: CombatState;
    gold: number;
    deck: CardState[];
    relics: string[];
    upgrades: string[];
    maxDeckSize: number;
    isEnemyTurnAnimating: boolean;
    isEnemyAttacking: boolean;
    enemyAction: EnemyActionEffect;
    onPlayCard: (cardId: string) => void;
    onEndTurn: () => void;
}

interface CharacterEffects {
    player: CharacterEffect;
    enemy: CharacterEffect;
}

interface PlayingCardState {
    card: CombatState["player"]["hand"][number];
    sourceRect: DOMRect;
    targetRect: DOMRect;
}

function getStatusCounts(
    effects: StatusEffect[],
) {
    return {
        burn: effects
            .filter(
                (effect) =>
                    effect.type ===
                    "burn",
            )
            .reduce(
                (total, effect) =>
                    total +
                    effect.amount,
                0,
            ),

        weak: effects
            .filter(
                (effect) =>
                    effect.type ===
                    "weak",
            )
            .reduce(
                (total, effect) =>
                    total +
                    effect.amount,
                0,
            ),
    };
}

function CombatStatBadge({
    icon,
    value,
    title,
    description,
    tone,
}: {
    icon: string;
    value: number;
    title: string;
    description: string;
    tone: string;
}) {
    return (
        <div className="group relative">
            <div className={`flex items-center gap-1.5 text-sm font-bold ${tone}`}>
                <span>{icon}</span>
                <span>{value}</span>
            </div>
            <div className="pointer-events-none absolute right-0 top-full z-[70] mt-2 w-52 translate-y-1 border border-stone-700 bg-[#100b09]/98 px-3 py-2.5 text-left opacity-0 shadow-[0_10px_30px_rgba(0,0,0,0.65)] transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-200">{title}</p>
                <p className="mt-1.5 text-[10px] leading-[1.35] text-stone-400">{description}</p>
            </div>
        </div>
    );
}

export default function CombatScreen({
    combat,
    gold,
    deck,
    relics,
    upgrades,
    maxDeckSize,
    isEnemyTurnAnimating,
    isEnemyAttacking,
    enemyAction,
    onPlayCard,
    onEndTurn,
}: CombatScreenProps) {
    const playerTargetRef =
        useRef<HTMLDivElement | null>(
            null,
        );

    const enemyTargetRef =
        useRef<HTMLDivElement | null>(
            null,
        );

    const previousCombat =
        useRef<CombatState | null>(
            null,
        );

    const feedbackId =
        useRef(0);

    const characterEffectTimer =
        useRef<number | null>(
            null,
        );

    const playerAttackTimer =
        useRef<number | null>(
            null,
        );

    const [
        feedback,
        setFeedback,
    ] = useState<
        CombatFeedbackItem[]
    >([]);

    const [
        characterEffects,
        setCharacterEffects,
    ] =
        useState<CharacterEffects>({
            player: null,
            enemy: null,
        });

    const [
        playingCard,
        setPlayingCard,
    ] =
        useState<PlayingCardState | null>(
            null,
        );

    const [
        isPlayerAttacking,
        setIsPlayerAttacking,
    ] = useState(false);

    const [
        showInventory,
        setShowInventory,
    ] = useState(false);

    const isPlayerTurn =
        combat.phase ===
            "player-turn" &&
        !isEnemyTurnAnimating &&
        !isEnemyAttacking;

    const enemyDefinition =
        enemies.find(
            (enemy) =>
                enemy.id ===
                combat.enemy
                    .definitionId,
        );

    const enemyMaxHp =
        enemyDefinition?.maxHp ??
        combat.enemy.hp;

    const visualBossPhase =
        enemyDefinition?.phases
            ? enemyDefinition.phases.reduce(
                  (activeIndex, phase, index) =>
                      combat.enemy.hp /
                          enemyDefinition.maxHp <=
                      phase.threshold
                          ? index
                          : activeIndex,
                  0,
              )
            : combat.enemy.bossPhase;

    const enemyPresentationState =
        getEnemyAnimationState(
            combat.enemy,
            enemyAction,
            isEnemyAttacking,
            combat.phase === "victory",
            characterEffects.enemy === "hit",
        );

    const enemyImage =
        getEnemyArtwork(
            combat.enemy.definitionId,
            enemyPresentationState,
            visualBossPhase,
        );

    const playerCardDefinition =
        playingCard
            ? cards.find(
                  (card) =>
                      card.id ===
                      playingCard.card.cardId,
              )
            : null;

    const playerIsPlayingLegendaryCard =
        Boolean(
            playerCardDefinition?.rarity === "legendary",
        );

    const playerPresentationState: PlayerAnimationState =
        combat.phase === "defeat"
            ? "death"
            : characterEffects.player === "hit"
              ? "hit"
              : isPlayerAttacking
                ? playerIsPlayingLegendaryCard
                    ? "signature"
                    : "attack"
                : "idle";

    const playerImage =
        getPlayerArtwork(
            playerPresentationState,
        );

    /*
     * ============================
     * COMBAT STATE FEEDBACK
     * ============================
     */

    useEffect(() => {
        if (
            previousCombat.current ===
            null
        ) {
            previousCombat.current =
                combat;

            return;
        }

        const previous =
            previousCombat.current;

        const nextFeedback: CombatFeedbackItem[] =
            [];

        let playerEffect: CharacterEffect =
            null;

        let enemyEffect: CharacterEffect =
            null;

        const addFeedback = (
            target:
                | "player"
                | "enemy",
            text: string,
            tone:
                | "damage"
                | "heal"
                | "block"
                | "status",
        ) => {
            feedbackId.current += 1;

            nextFeedback.push({
                id: feedbackId.current,
                target,
                text,
                tone,
            });
        };

        /*
         * HP
         */

        if (
            combat.enemy.hp <
            previous.enemy.hp
        ) {
            enemyEffect = "hit";

            addFeedback(
                "enemy",
                `-${previous.enemy.hp - combat.enemy.hp}`,
                "damage",
            );
        }

        if (
            combat.enemy.hp >
            previous.enemy.hp
        ) {
            enemyEffect = "heal";

            addFeedback(
                "enemy",
                `+${combat.enemy.hp - previous.enemy.hp} HP`,
                "heal",
            );
        }

        if (
            combat.player.hp <
            previous.player.hp
        ) {
            playerEffect = "hit";

            addFeedback(
                "player",
                `-${previous.player.hp - combat.player.hp}`,
                "damage",
            );
        }

        if (
            combat.player.hp >
            previous.player.hp
        ) {
            playerEffect = "heal";

            addFeedback(
                "player",
                `+${combat.player.hp - previous.player.hp} HP`,
                "heal",
            );
        }

        if (
            combat.enemy.strength <
            previous.enemy.strength
        ) {
            addFeedback(
                "enemy",
                `-${previous.enemy.strength - combat.enemy.strength} Strength`,
                "status",
            );
        }

        /*
         * BLOCK
         */

        if (
            playerEffect === null &&
            combat.player.block >
                previous.player.block
        ) {
            playerEffect = "block";

            addFeedback(
                "player",
                `+${combat.player.block - previous.player.block} Block`,
                "block",
            );
        }

        if (
            enemyEffect === null &&
            combat.enemy.block >
                previous.enemy.block
        ) {
            enemyEffect = "block";

            addFeedback(
                "enemy",
                `+${combat.enemy.block - previous.enemy.block} Block`,
                "block",
            );
        }

        /*
         * STATUS EFFECTS
         */

        const previousEnemyStatuses =
            getStatusCounts(
                previous.enemy
                    .statusEffects,
            );

        const currentEnemyStatuses =
            getStatusCounts(
                combat.enemy
                    .statusEffects,
            );

        const previousPlayerStatuses =
            getStatusCounts(
                previous.player
                    .statusEffects,
            );

        const currentPlayerStatuses =
            getStatusCounts(
                combat.player
                    .statusEffects,
            );

        if (
            currentEnemyStatuses.burn >
            previousEnemyStatuses.burn
        ) {
            addFeedback(
                "enemy",
                "BURN",
                "status",
            );
        }

        if (
            currentEnemyStatuses.weak >
            previousEnemyStatuses.weak
        ) {
            addFeedback(
                "enemy",
                "WEAK",
                "status",
            );
        }

        if (
            currentPlayerStatuses.weak >
            previousPlayerStatuses.weak
        ) {
            addFeedback(
                "player",
                "WEAK",
                "status",
            );
        }

        if (
            currentPlayerStatuses.burn >
            previousPlayerStatuses.burn
        ) {
            addFeedback(
                "player",
                "BURN",
                "status",
            );
        }

        if (
            nextFeedback.length > 0
        ) {
            setFeedback(
                nextFeedback,
            );
        }

        /*
         * CHARACTER EFFECT
         */

        if (
            characterEffectTimer.current !==
            null
        ) {
            window.clearTimeout(
                characterEffectTimer.current,
            );
        }

        if (
            playerEffect !== null ||
            enemyEffect !== null
        ) {
            setCharacterEffects({
                player:
                    playerEffect,
                enemy:
                    enemyEffect,
            });

            characterEffectTimer.current =
                window.setTimeout(() => {
                    setCharacterEffects({
                        player: null,
                        enemy: null,
                    });

                    characterEffectTimer.current =
                        null;
                }, 450);
        } else {
            setCharacterEffects({
                player: null,
                enemy: null,
            });
        }

        previousCombat.current =
            combat;

        return () => {
            if (
                characterEffectTimer.current !==
                null
            ) {
                window.clearTimeout(
                    characterEffectTimer.current,
                );
            }
        };
    }, [combat]);

    useEffect(() => {
        return () => {
            if (
                characterEffectTimer.current !==
                null
            ) {
                window.clearTimeout(
                    characterEffectTimer.current,
                );
            }
        };
    }, []);

    useEffect(() => {
        return () => {
            if (
                playerAttackTimer.current !==
                null
            ) {
                window.clearTimeout(
                    playerAttackTimer.current,
                );
            }
        };
    }, []);

    /*
     * ============================
     * CARD TARGET
     * ============================
     */

    function getCardTarget(
        cardId: string,
    ): "player" | "enemy" {
        const definition =
            cards.find(
                (card) =>
                    card.id === cardId,
            );

        if (!definition) {
            return "enemy";
        }

        const targetsEnemy =
            definition.effects.some(
                (effect) =>
                    effect.type === "damage" ||
                    effect.type === "piercing-damage" ||
                    effect.type === "shatter" ||
                    effect.type === "burn" ||
                    effect.type === "reduce-strength" ||
                    effect.type === "damage-if-burn",
            );

        return targetsEnemy
            ? "enemy"
            : "player";
    }

    /*
     * ============================
     * CARD PLAY
     * ============================
     */

    function handlePlayCard(
        cardId: string,
        sourceRect: DOMRect,
    ) {
        if (
            !isPlayerTurn ||
            combat.player.actions <= 0 ||
            playingCard
        ) {
            return;
        }

        const target =
            getCardTarget(cardId);

        const targetElement =
            target === "enemy"
                ? enemyTargetRef.current
                : playerTargetRef.current;

        if (!targetElement) {
            onPlayCard(cardId);
            return;
        }

        const targetRect =
            targetElement.getBoundingClientRect();

        const card =
            combat.player.hand.find(
                (item) =>
                    item.cardId ===
                    cardId,
            );

        if (!card) {
            return;
        }

        if (
            playerAttackTimer.current !==
            null
        ) {
            window.clearTimeout(
                playerAttackTimer.current,
            );
        }

        const isLegendaryCard =
            playerCardDefinition?.rarity === "legendary";

        const playerAnimationDuration =
            isLegendaryCard ? 680 : 520;

        setIsPlayerAttacking(true);
        playerAttackTimer.current =
            window.setTimeout(() => {
                playerAttackTimer.current =
                    null;
                setIsPlayerAttacking(false);
            }, playerAnimationDuration);

        setPlayingCard({
            card,
            sourceRect,
            targetRect,
        });
    }

    function handlePlayedCardComplete() {
        if (!playingCard) {
            return;
        }

        const cardId =
            playingCard.card.cardId;

        setPlayingCard(null);

        onPlayCard(cardId);
    }

    return (
        <main className="h-screen overflow-hidden bg-[#070504] text-stone-200">
            <div className="relative h-screen w-full overflow-hidden bg-[#070504]">
                <CombatHeader
                    gold={gold}
                    onOpenInventory={() =>
                        setShowInventory(
                            true,
                        )
                    }
                />

                {/* BACKGROUND */}
                <div className="absolute inset-0">
                    <img
                        src={
                            battlefieldImage
                        }
                        alt=""
                        draggable={false}
                        className="h-full w-full select-none object-cover"
                    />

                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,3,2,0.35),rgba(7,4,3,0.18)_42%,rgba(7,4,3,0.55))]" />
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(185,77,20,0.11),transparent_35%)]" />
                </div>

                {/* TOP HUD */}
                <div className="relative z-20 flex items-start justify-between px-7 pt-4">
                    {/* PLAYER */}
                    <div className="w-[320px]">
                        <div className="relative overflow-hidden border border-amber-900/55 bg-[linear-gradient(180deg,rgba(24,13,9,0.96),rgba(10,7,5,0.92))] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,229,184,0.06),0_10px_30px_rgba(0,0,0,0.44)]">
                            <div className="pointer-events-none absolute inset-[3px] border border-white/[0.035]" />
                            <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/20 to-transparent" />
                            <div className="flex items-center justify-between">
                                <span className="text-[8px] font-semibold uppercase tracking-[0.3em] text-amber-800/90">
                                    Player
                                </span>

                                <div className="flex items-center gap-3">
                                    {combat.player.block > 0 && (
                                        <CombatStatBadge
                                            icon="🛡"
                                            value={combat.player.block}
                                            title="Block"
                                            description="Absorbs incoming damage before HP is lost. Player Block resets at the start of the next player turn."
                                            tone="text-sky-300"
                                        />
                                    )}

                                    <span className="font-serif text-2xl font-bold text-stone-100 drop-shadow-[0_0_8px_rgba(255,235,200,0.08)]">
                                        {combat.player.hp}
                                        <span className="text-stone-500">
                                            /{combat.player.maxHp}
                                        </span>
                                    </span>
                                </div>
                            </div>

                            <div className="mt-3">
                                <CombatHealthBar
                                    current={
                                        combat
                                            .player
                                            .hp
                                    }
                                    max={
                                        combat
                                            .player
                                            .maxHp
                                    }
                                    variant="player"
                                />
                            </div>
                        </div>

                        <StatusEffects
                            effects={combat.player.statusEffects}
                            side="player"
                        />
                    </div>

                    {/* ENEMY */}
                    <div className="w-[320px]">
                        <div className="relative overflow-hidden border border-amber-900/55 bg-[linear-gradient(180deg,rgba(24,13,9,0.96),rgba(10,7,5,0.92))] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,229,184,0.06),0_10px_30px_rgba(0,0,0,0.44)]">
                            <div className="pointer-events-none absolute inset-[3px] border border-white/[0.035]" />
                            <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/20 to-transparent" />
                            <div className="flex items-center justify-between">
                                <div className="min-w-0">
                                    <span className="max-w-[220px] truncate font-serif text-sm font-bold uppercase tracking-[0.12em] text-stone-100" title={enemyDefinition?.name ?? "Enemy"}>
                                        {enemyDefinition?.name ?? "Enemy"}
                                    </span>
                                    {enemyDefinition?.phases && visualBossPhase != null && (
                                        <div className="mt-1 text-[8px] font-semibold uppercase tracking-[0.18em] text-amber-600/90">
                                            {enemyDefinition.phases[visualBossPhase]?.name ?? `Phase ${visualBossPhase + 1}`}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    {combat.enemy.block > 0 && (
                                        <CombatStatBadge
                                            icon="🛡"
                                            value={combat.enemy.block}
                                            title="Block"
                                            description="Absorbs incoming damage before HP is lost. Enemy Block persists until it is consumed."
                                            tone="text-sky-300"
                                        />
                                    )}

                                    {combat.enemy.strength > 0 && (
                                        <CombatStatBadge
                                            icon="⚔"
                                            value={combat.enemy.strength}
                                            title="Strength"
                                            description="Adds this amount to the damage of the enemy's attacks."
                                            tone="text-amber-300"
                                        />
                                    )}

                                    <span className="font-serif text-2xl font-bold text-stone-100 drop-shadow-[0_0_8px_rgba(255,235,200,0.08)]">
                                        {
                                            combat
                                                .enemy
                                                .hp
                                        }

                                        <span className="text-stone-500">
                                            /
                                            {
                                                enemyMaxHp
                                            }
                                        </span>
                                    </span>
                                </div>
                            </div>

                            <div className="mt-3">
                                <CombatHealthBar
                                    current={
                                        combat
                                            .enemy
                                            .hp
                                    }
                                    max={
                                        enemyMaxHp
                                    }
                                    variant="enemy"
                                />
                            </div>
                        </div>

                        <StatusEffects
                            effects={combat.enemy.statusEffects}
                            side="enemy"
                        />
                    </div>
                </div>

                {/* BATTLEFIELD */}
                <section className="combat-stage absolute inset-x-0 top-[92px] bottom-[370px] flex items-center justify-center">
                    <div className="combat-stage__backdrop" aria-hidden="true" />
                    <div className="combat-stage__ground" aria-hidden="true" />
                    <div className="combat-stage__dust combat-stage__dust--one" aria-hidden="true" />
                    <div className="combat-stage__dust combat-stage__dust--two" aria-hidden="true" />
                    <div className="combat-stage__dust combat-stage__dust--three" aria-hidden="true" />
                    <div className="relative h-full w-full">
                        {(isEnemyTurnAnimating ||
                            isEnemyAttacking) && (
                            <div
                                className={[
                                    "combat-turn-banner",
                                    isEnemyAttacking
                                        ? "combat-turn-banner--active"
                                        : "",
                                ].join(" ")}
                                aria-hidden="true"
                            >
                                <span>
                                    ENEMY TURN
                                </span>
                            </div>
                        )}

                        {combat.phase === "player-turn" &&
                            !playingCard &&
                            !isPlayerAttacking && (
                                <div
                                    className="combat-turn-banner combat-turn-banner--player"
                                    aria-hidden="true"
                                >
                                    <span>
                                        YOUR TURN
                                    </span>
                                </div>
                            )}

                        {/* PLAYED CARD */}
                        {playingCard && (
                            <PlayedCardOverlay
                                card={
                                    playingCard.card
                                }
                                sourceRect={
                                    playingCard.sourceRect
                                }
                                targetRect={
                                    playingCard.targetRect
                                }
                                duration={
                                    playerCardDefinition?.rarity ===
                                    "legendary"
                                        ? 640
                                        : 420
                                }
                                onComplete={
                                    handlePlayedCardComplete
                                }
                            />
                        )}

                        {/* FEEDBACK */}
                        <CombatFeedback
                            feedback={
                                feedback
                            }
                        />

                        {/* PLAYER */}
                        <div
                            ref={
                                playerTargetRef
                            }
                            className="combat-stage__actor combat-stage__actor--player absolute bottom-[6%] left-[14%] z-10"
                        >
                            {playerImage && (
                                <CombatCharacter
                                    image={
                                        playerImage
                                    }
                                    side="player"
                                    animationState={
                                        playerPresentationState
                                    }
                                    hit={
                                        characterEffects.player ===
                                        "hit"
                                    }
                                    heal={
                                        characterEffects.player ===
                                        "heal"
                                    }
                                    block={
                                        characterEffects.player ===
                                        "block"
                                    }
                                />
                            )}
                        </div>

                        {/* ENEMY */}
                        <div
                            ref={
                                enemyTargetRef
                            }
                            className="combat-stage__actor combat-stage__actor--enemy absolute bottom-[6%] right-[13%] z-10"
                        >
                            {enemyImage && (
                                <CombatCharacter
                                    image={
                                        enemyImage
                                    }
                                    side="enemy"
                                    animationState={
                                        enemyPresentationState
                                    }
                                    enemyAction={
                                        isEnemyAttacking
                                            ? enemyAction
                                            : null
                                    }
                                    hit={
                                        characterEffects.enemy ===
                                        "hit"
                                    }
                                    heal={
                                        characterEffects.enemy ===
                                        "heal"
                                    }
                                    block={
                                        characterEffects.enemy ===
                                        "block"
                                    }
                                />
                            )}
                        </div>

                    </div>
                </section>

                {/* GAMEPLAY TABLE */}
                <CombatTable
                    hand={
                        combat.player
                            .hand
                    }
                    drawPileCount={
                        combat.player
                            .drawPile
                            .length
                    }
                    discardPileCount={
                        combat.player
                            .discardPile
                            .length
                    }
                    exiledCount={
                        combat.player
                            .exiledCards
                            .length
                    }
                    actions={
                        combat.player
                            .actions
                    }
                    isPlayerTurn={
                        isPlayerTurn
                    }
                    onPlayCard={
                        handlePlayCard
                    }
                    onEndTurn={
                        onEndTurn
                    }
                />

                {showInventory && (
                    <InventoryScreen
                        deck={deck}
                        relics={relics}
                        upgrades={upgrades}
                        maxDeckSize={
                            maxDeckSize
                        }
                        onClose={() =>
                            setShowInventory(
                                false,
                            )
                        }
                    />
                )}
            </div>
        </main>
    );
}
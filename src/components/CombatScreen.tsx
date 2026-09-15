import {
    useEffect,
    useRef,
    useState,
} from "react";

import type {
    CombatState,
    StatusEffect,
} from "../types/game";

import { enemies } from "../data/enemies";
import { cards } from "../data/cards";

import goblinImage from "../assets/characters/goblin.png";
import shieldGoblinImage from "../assets/characters/shield-goblin.png";
import warGoblinImage from "../assets/characters/war-goblin.png";
import goblinKingImage from "../assets/characters/goblin-king.png";
import playerImage from "../assets/characters/player.png";
import battlefieldImage from "../assets/backgrounds/battlefield.png";

import CombatCharacter, {
    type CharacterEffect,
} from "./CombatCharacter";

import CombatHeader from "./CombatHeader";
import StatusEffects from "./StatusEffects";
import CombatTable from "./CombatTable";
import CombatHealthBar from "./CombatHealthBar";
import PlayedCardOverlay from "./PlayedCardOverlay";
import EnemyIntent from "./EnemyIntent";

import CombatFeedback, {
    type CombatFeedbackItem,
} from "./CombatFeedbackOverlay";

interface CombatScreenProps {
    combat: CombatState;
    gold: number;
    isEnemyTurnAnimating: boolean;
    isEnemyAttacking: boolean;
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

export default function CombatScreen({
    combat,
    gold,
    isEnemyTurnAnimating,
    isEnemyAttacking,
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

    const isPlayerTurn =
        combat.phase ===
            "player-turn" &&
        !isEnemyTurnAnimating &&
        !isEnemyAttacking;

    const enemyImages: Record<
        string,
        string
    > = {
        goblin: goblinImage,
        "shield-goblin":
            shieldGoblinImage,
        "war-goblin":
            warGoblinImage,
        "goblin-king":
            goblinKingImage,
    };

    const enemyImage =
        enemyImages[
            combat.enemy
                .definitionId
        ];

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

    const enemyAction =
        isEnemyAttacking
            ? combat.enemy.intent.type
            : null;

    /*
     * ============================
     * COMBAT FEEDBACK
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
         * CHARACTER FX
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
                    effect.type ===
                        "damage" ||
                    effect.type ===
                        "burn",
            );

        return targetsEnemy
            ? "enemy"
            : "player";
    }

    /*
     * ============================
     * PLAY CARD
     * ============================
     */

    function handlePlayCard(
        cardId: string,
        sourceRect: DOMRect,
    ) {
        if (
            !isPlayerTurn ||
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
        <main className="min-h-screen overflow-hidden bg-[#0b0907] text-stone-200">
            <div className="relative min-h-screen w-full overflow-hidden">
                <CombatHeader
                    gold={gold}
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

                    <div className="absolute inset-0 bg-black/25" />
                </div>

                {/* TOP HUD */}
                <div className="relative z-20 flex items-start justify-between px-8 pt-5">
                    {/* PLAYER HUD */}
                    <div className="w-[300px]">
                        <div className="border border-stone-700/80 bg-[#100c0a]/90 px-4 py-3 shadow-[0_6px_25px_rgba(0,0,0,0.45)]">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase tracking-[0.3em] text-stone-500">
                                    Player
                                </span>

                                <div className="flex items-center gap-3">
                                    <span className="text-xl font-bold text-stone-100">
                                        {
                                            combat
                                                .player
                                                .hp
                                        }

                                        <span className="text-stone-500">
                                            /
                                            {
                                                combat
                                                    .player
                                                    .maxHp
                                            }
                                        </span>
                                    </span>

                                    {combat
                                        .player
                                        .block >
                                        0 && (
                                        <span className="text-sm font-bold text-sky-300">
                                            🛡{" "}
                                            {
                                                combat
                                                    .player
                                                    .block
                                            }
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="mt-2">
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

                            <StatusEffects
                                effects={
                                    combat
                                        .player
                                        .statusEffects
                                }
                            />
                        </div>
                    </div>

                    {/* TURN */}
                    <div className="pt-1 text-center">
                        <span className="text-[10px] uppercase tracking-[0.35em] text-stone-500">
                            Turn
                        </span>

                        <p className="mt-1 font-serif text-3xl font-bold text-stone-200">
                            {
                                combat.turn
                            }
                        </p>
                    </div>

                    {/* ENEMY HUD */}
                    <div className="w-[300px]">
                        <div className="border border-stone-700/80 bg-[#100c0a]/90 px-4 py-3 shadow-[0_6px_25px_rgba(0,0,0,0.45)]">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-serif font-bold uppercase tracking-wider text-stone-200">
                                        {enemyDefinition?.name ??
                                            combat
                                                .enemy
                                                .definitionId}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    {combat
                                        .enemy
                                        .block >
                                        0 && (
                                        <span className="text-sm font-bold text-sky-300">
                                            🛡{" "}
                                            {
                                                combat
                                                    .enemy
                                                    .block
                                            }
                                        </span>
                                    )}

                                    <span className="text-xl font-bold text-stone-100">
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

                            <div className="mt-2">
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
                            effects={
                                combat
                                    .enemy
                                    .statusEffects
                            }
                        />
                    </div>
                </div>

                {/* BATTLEFIELD */}
                <section className="absolute inset-x-0 top-24 bottom-44 flex items-center justify-center">
                    <div className="relative h-full w-full">
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
                                onComplete={
                                    handlePlayedCardComplete
                                }
                            />
                        )}

                        {/* COMBAT FEEDBACK */}
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
                            className="absolute bottom-0 left-[15%] z-10"
                        >
                            <CombatCharacter
                                image={
                                    playerImage
                                }
                                side="player"
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
                        </div>

                        {/* ENEMY */}
                        <div
                            ref={
                                enemyTargetRef
                            }
                            className="absolute bottom-0 right-[13%] z-10"
                        >
                            {enemyImage && (
                                <CombatCharacter
                                    image={
                                        enemyImage
                                    }
                                    side="enemy"
                                    enemyAction={
                                        enemyAction
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

                        {/* ENEMY INTENT */}
                        <div className="absolute right-[3%] top-[32%] z-20">
                            <EnemyIntent
                                intent={
                                    combat.enemy
                                        .intent
                                }
                                isExecuting={
                                    isEnemyTurnAnimating ||
                                    isEnemyAttacking
                                }
                            />
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
            </div>
        </main>
    );
}
import type {
    CardEffect,
    CombatState,
    CardDefinition,
    PlayerState,
    RunState,
} from "../types/game";

import { cards } from "../data/cards";
import { enemies } from "../data/enemies";

import {
    cloneDeck,
    drawCards,
    drawCardsWithRecycle,
    shuffleDeck,
} from "../data/deck";

import { MAX_HAND_SIZE } from "../consts/game";

import {
    modifyBlock,
    modifyBurnDuration,
    modifyDamage,
} from "./relics";

export function startPlayerTurn(
    player: PlayerState,
): PlayerState {
    const playerAfterExile =
        processExiledCards(player);

    const cardsToDraw = Math.max(
        0,
        MAX_HAND_SIZE -
            playerAfterExile.hand.length,
    );

    const {
        hand: updatedHand,
        drawPile: updatedDrawPile,
        discardPile: updatedDiscardPile,
    } = drawCardsWithRecycle(
        playerAfterExile.hand,
        playerAfterExile.drawPile,
        playerAfterExile.discardPile,
        cardsToDraw,
    );

    return {
        ...playerAfterExile,
        actions:
            playerAfterExile.baseActions,
        block: 0,
        hand: updatedHand,
        drawPile: updatedDrawPile,
        discardPile:
            updatedDiscardPile,
    };
}

export function startCombat(
    run: RunState,
    enemyId: string,
): CombatState {
    const enemy =
        enemies.find(
            (candidate) =>
                candidate.id ===
                enemyId,
        ) ?? enemies[0];

    const initialDeck =
        shuffleDeck(cloneDeck(run.deck));

    const {
        drawnCards,
        remainingDeck,
    } = drawCards(
        initialDeck,
        MAX_HAND_SIZE,
    );

    return {
        phase: "player-turn",
        turn: 1,

        player: {
            hp: run.hp,
            maxHp: run.maxHp,
            baseActions:
                run.baseActions,
            actions:
                run.baseActions,
            statusEffects: [],
            block: 0,

            relics: [
                ...run.relics,
            ],

            hand: drawnCards,
            drawPile:
                remainingDeck,
            discardPile: [],
            exiledCards: [],
            exhaustedCards: [],
        },

        enemy: {
            definitionId:
                enemy.id,
            hp: enemy.maxHp,
            block: 0,
            strength: 0,
            intentIndex: 0,
            intent:
                enemy.phases?.[0]?.intents[0] ??
                enemy.intents[0],
            statusEffects: [],
            ...(enemy.phases
                ? { bossPhase: 0 }
                : {}),
        },
    };
}

function dealPiercingDamage(
    enemy: CombatState["enemy"],
    damage: number,
): CombatState["enemy"] {
    return {
        ...enemy,
        hp: Math.max(0, enemy.hp - damage),
    };
}

function hasEnemyBurn(
    enemy: CombatState["enemy"],
): boolean {
    return enemy.statusEffects.some(
        (effect) => effect.type === "burn" && effect.amount > 0,
    );
}

function cleansePlayerWeak(
    player: CombatState["player"],
): CombatState["player"] {
    return {
        ...player,
        statusEffects: player.statusEffects.filter(
            (effect) => effect.type !== "weak",
        ),
    };
}

function damageEnemy(
    enemy: CombatState["enemy"],
    damage: number,
): CombatState["enemy"] {
    const damageToBlock =
        Math.min(
            enemy.block,
            damage,
        );

    const remainingDamage =
        damage - damageToBlock;

    return {
        ...enemy,
        block:
            enemy.block -
            damageToBlock,
        hp: Math.max(
            0,
            enemy.hp -
                remainingDamage,
        ),
    };
}

function damagePlayer(
    player: CombatState["player"],
    damage: number,
): CombatState["player"] {
    const damageToBlock =
        Math.min(
            player.block,
            damage,
        );

    const remainingDamage =
        damage - damageToBlock;

    return {
        ...player,
        block:
            player.block -
            damageToBlock,
        hp: Math.max(
            0,
            player.hp -
                remainingDamage,
        ),
    };
}

function addEnemyBlock(
    enemy: CombatState["enemy"],
    amount: number,
): CombatState["enemy"] {
    return {
        ...enemy,
        block:
            enemy.block +
            amount,
    };
}

function healEnemy(
    enemy: CombatState["enemy"],
    amount: number,
    maxHp: number,
): CombatState["enemy"] {
    return {
        ...enemy,
        hp: Math.min(
            maxHp,
            enemy.hp +
                amount,
        ),
    };
}

function reduceStatusEffectDurations(
    statusEffects:
        CombatState["player"]["statusEffects"],
): CombatState["player"]["statusEffects"] {
    return statusEffects
        .map((effect) => ({
            ...effect,
            duration:
                effect.duration - 1,
        }))
        .filter(
            (effect) =>
                effect.duration > 0,
        );
}

export function applyCardEffects(
    state: CombatState,
    effects: CardEffect[],
): CombatState {
    let updatedState = state;

    for (const effect of effects) {
        if (
            effect.type ===
            "damage"
        ) {
            const weakness =
                updatedState
                    .player
                    .statusEffects
                    .filter(
                        (status) =>
                            status.type ===
                            "weak",
                    )
                    .reduce(
                        (
                            total,
                            status,
                        ) =>
                            total +
                            status.amount,
                        0,
                    );

            const damageAfterWeak =
                Math.floor(
                    effect.amount *
                        (1 -
                            Math.min(
                                100,
                                weakness,
                            ) /
                                100),
                );

            const damage =
                modifyDamage(
                    damageAfterWeak,
                    updatedState
                        .player
                        .relics,
                    {
                        source:
                            "card",
                        target:
                            "enemy",
                        damageType:
                            "fire",
                    },
                );

            updatedState = {
                ...updatedState,
                enemy:
                    damageEnemy(
                        updatedState
                            .enemy,
                        damage,
                    ),
            };
        }

        if (effect.type === "piercing-damage") {
            const damage = modifyDamage(
                effect.amount,
                updatedState.player.relics,
                {
                    source: "card",
                    target: "enemy",
                    damageType: "fire",
                },
            );

            updatedState = {
                ...updatedState,
                enemy: dealPiercingDamage(updatedState.enemy, damage),
            };
        }

        if (effect.type === "shatter") {
            const damage = modifyDamage(
                effect.amount,
                updatedState.player.relics,
                {
                    source: "card",
                    target: "enemy",
                    damageType: "fire",
                },
            );

            updatedState = {
                ...updatedState,
                enemy: {
                    ...dealPiercingDamage(updatedState.enemy, damage),
                    block: 0,
                },
            };
        }

        if (effect.type === "damage-if-burn") {
            const amount = hasEnemyBurn(updatedState.enemy)
                ? effect.amount + effect.bonusDamage
                : effect.amount;

            const damage = modifyDamage(
                amount,
                updatedState.player.relics,
                {
                    source: "card",
                    target: "enemy",
                    damageType: "fire",
                },
            );

            updatedState = {
                ...updatedState,
                enemy: damageEnemy(updatedState.enemy, damage),
            };
        }

        if (effect.type === "damage-if-player-weak") {
            const playerIsWeak = updatedState.player.statusEffects.some(
                (status) => status.type === "weak" && status.amount > 0,
            );
            const amount = playerIsWeak
                ? effect.amount + effect.bonusDamage
                : effect.amount;

            const damage = modifyDamage(
                amount,
                updatedState.player.relics,
                {
                    source: "card",
                    target: "enemy",
                    damageType: "fire",
                },
            );

            updatedState = {
                ...updatedState,
                enemy: damageEnemy(updatedState.enemy, damage),
            };
        }

        if (
            effect.type ===
            "burn"
        ) {
            const duration =
                modifyBurnDuration(
                    effect.duration,
                    updatedState
                        .player
                        .relics,
                    {
                        source:
                            "card",
                        target:
                            "enemy",
                    },
                );

            updatedState = {
                ...updatedState,
                enemy: {
                    ...updatedState
                        .enemy,
                    statusEffects: [
                        ...updatedState
                            .enemy
                            .statusEffects,
                        {
                            type:
                                "burn",
                            amount:
                                effect.amount,
                            duration,
                        },
                    ],
                },
            };
        }

        if (
            effect.type ===
            "block"
        ) {
            const block =
                modifyBlock(
                    effect.amount,
                    updatedState
                        .player
                        .relics,
                    {
                        source:
                            "card",
                        target:
                            "player",
                    },
                );

            updatedState = {
                ...updatedState,
                player: {
                    ...updatedState
                        .player,
                    block:
                        updatedState
                            .player
                            .block +
                        block,
                },
            };
        }

        if (effect.type === "reduce-strength") {
            const actualReduction = Math.min(
                effect.amount,
                updatedState.enemy.strength,
            );

            updatedState = {
                ...updatedState,
                enemy: {
                    ...updatedState.enemy,
                    strength:
                        updatedState.enemy.strength -
                        actualReduction,
                    statusEffects:
                        actualReduction > 0
                            ? [
                                  ...updatedState.enemy.statusEffects,
                                  {
                                      type: "strength-down",
                                      amount: actualReduction,
                                      duration: 1,
                                  },
                              ]
                            : updatedState.enemy.statusEffects,
                },
            };
        }

        if (effect.type === "cleanse-weak") {
            updatedState = {
                ...updatedState,
                player: cleansePlayerWeak(updatedState.player),
            };
        }

        if (
            effect.type ===
            "gain-action"
        ) {
            updatedState = {
                ...updatedState,
                player: {
                    ...updatedState
                        .player,
                    actions:
                        updatedState
                            .player
                            .actions +
                        effect.amount,
                },
            };
        }

        if (
            effect.type ===
            "draw"
        ) {
            const cardsToDraw =
                Math.min(
                    effect.amount,
                    Math.max(
                        0,
                        MAX_HAND_SIZE -
                            updatedState
                                .player
                                .hand
                                .length,
                    ),
                );

            const {
                hand,
                drawPile,
                discardPile,
            } =
                drawCardsWithRecycle(
                    updatedState
                        .player
                        .hand,
                    updatedState
                        .player
                        .drawPile,
                    updatedState
                        .player
                        .discardPile,
                    cardsToDraw,
                );

            updatedState = {
                ...updatedState,
                player: {
                    ...updatedState
                        .player,
                    hand,
                    drawPile,
                    discardPile,
                },
            };
        }

        if (effect.type === "recover-exiled") {
            updatedState = {
                ...updatedState,
                player: recoverExiledCards(
                    updatedState.player,
                    effect.amount,
                ),
            };
        }

        if (effect.type === "recover-all-exiled") {
            updatedState = {
                ...updatedState,
                player: recoverExiledCards(
                    updatedState.player,
                    updatedState.player.exiledCards.length,
                ),
            };
        }

        if (
            effect.type ===
            "heal"
        ) {
            updatedState = {
                ...updatedState,
                player: {
                    ...updatedState
                        .player,
                    hp: Math.min(
                        updatedState
                            .player
                            .maxHp,
                        updatedState
                            .player
                            .hp +
                            effect.amount,
                    ),
                },
            };
        }
    }

    return updatedState;
}

export function processExiledCards(
    player: PlayerState,
): PlayerState {
    const updatedExiledCards = player.exiledCards.map(
        (cardState) => ({
            ...cardState,
            cooldownRemaining: Math.max(
                0,
                cardState.cooldownRemaining - 1,
            ),
        }),
    );

    const returningCards = updatedExiledCards.filter(
        (cardState) => cardState.cooldownRemaining === 0,
    );

    const remainingExiledCards = updatedExiledCards.filter(
        (cardState) => cardState.cooldownRemaining > 0,
    );

    // A cooldown card re-enters the draw cycle, not the hand.
    // This prevents cooldowns from inflating the hand and avoids
    // permanently losing a card just because the hand is full.
    const recoveredCards = returningCards.map((cardState) => ({
        ...cardState,
        cooldownRemaining: 0,
    }));

    return {
        ...player,
        drawPile: [
            ...player.drawPile,
            ...recoveredCards,
        ],
        exiledCards: remainingExiledCards,
    };
}

function recoverExiledCards(
    player: PlayerState,
    amount: number,
): PlayerState {
    if (amount <= 0 || player.exiledCards.length === 0) {
        return player;
    }

    const recoveredCards = player.exiledCards
        .slice(0, amount)
        .map((cardState) => ({
            ...cardState,
            cooldownRemaining: 0,
        }));


    const remainingExiledCards = player.exiledCards.filter(
        (_, index) => index >= recoveredCards.length,
    );

    return {
        ...player,
        drawPile: [
            ...player.drawPile,
            ...recoveredCards,
        ],
        exiledCards: remainingExiledCards,
    };
}

function getCard(
    cardId: string,
): CardDefinition | undefined {
    return cards.find(
        (card) =>
            card.id === cardId,
    );
}

export function moveCardAfterPlay(
    player: PlayerState,
    cardId: string,
    cooldown: number,
): PlayerState {
    const card =
        player.hand.find(
            (currentCard) =>
                currentCard.cardId ===
                cardId,
        );

    if (!card) {
        return player;
    }

    const remainingHand =
        player.hand.filter(
            (currentCard) =>
                currentCard.cardId !==
                cardId,
        );

    const definition = getCard(cardId);

    if (definition?.exhaust) {
        return {
            ...player,
            hand: remainingHand,
            exhaustedCards: [
                ...player.exhaustedCards,
                {
                    cardId,
                    cooldownRemaining: 0,
                },
            ],
        };
    }

    if (cooldown > 0) {
        return {
            ...player,
            hand: remainingHand,
            exiledCards: [
                ...player.exiledCards,
                {
                    cardId,
                    cooldownRemaining: cooldown,
                },
            ],
        };
    }

    return {
        ...player,
        hand: remainingHand,
        discardPile: [
            ...player.discardPile,
            {
                cardId,
                cooldownRemaining: 0,
            },
        ],
    };
}

export function playCard(
    state: CombatState,
    cardId: string,
): CombatState {
    if (
        state.phase !==
        "player-turn"
    ) {
        return state;
    }

    if (
        state.player.actions <= 0
    ) {
        return state;
    }

    const card = getCard(cardId);

    if (!card) {
        return state;
    }

    const cardState =
        state.player.hand.find(
            (currentCard) =>
                currentCard.cardId ===
                cardId,
        );

    if (!cardState) {
        return state;
    }

    if (
        cardState.cooldownRemaining >
        0
    ) {
        return state;
    }

    const updatedPlayer =
        moveCardAfterPlay(
            state.player,
            cardId,
            card.cooldown,
        );

    const stateWithEffects =
        applyCardEffects(
            {
                ...state,
                player:
                    updatedPlayer,
            },
            card.effects,
        );

    const playerAfterAction = {
        ...stateWithEffects.player,
        actions:
            stateWithEffects
                .player
                .actions - 1,
    };

    if (
        stateWithEffects
            .enemy.hp === 0
    ) {
        return {
            ...state,
            player:
                playerAfterAction,
            enemy: {
                ...stateWithEffects
                    .enemy,
            },
            phase: "victory",
        };
    }

    return {
        ...state,
        player:
            playerAfterAction,
        enemy: {
            ...stateWithEffects
                .enemy,
        },
        phase:
            "player-turn",
    };
}

export function endPlayerTurn(
    state: CombatState,
): CombatState {
    if (
        state.phase !==
        "player-turn"
    ) {
        return state;
    }

    return {
        ...state,
        phase:
            "enemy-turn",
    };
}

export function executeEnemyIntent(
    state: CombatState,
): CombatState {
    if (
        state.phase !==
        "enemy-turn"
    ) {
        return state;
    }

    const enemyDefinition =
        enemies.find(
            (enemy) =>
                enemy.id ===
                state.enemy
                    .definitionId,
        );

    if (!enemyDefinition) {
        return state;
    }

    const bossPhaseIndex =
        enemyDefinition.phases
            ? enemyDefinition.phases.reduce(
                  (activeIndex, phase, index) => {
                      const hpRatio =
                          state.enemy.hp /
                          enemyDefinition.maxHp;

                      return hpRatio <= phase.threshold
                          ? index
                          : activeIndex;
                  },
                  0,
              )
            : state.enemy.bossPhase ?? null;

    const activePhase =
        enemyDefinition.phases?.[
            bossPhaseIndex ?? 0
        ];

    const phaseChanged =
        activePhase &&
        bossPhaseIndex !==
            (state.enemy.bossPhase ?? 0);

    const phaseIntents =
        activePhase?.intents ??
        enemyDefinition.intents;

    const effectiveIntentIndex =
        phaseChanged
            ? 0
            : Math.min(
                  state.enemy.intentIndex,
                  Math.max(0, phaseIntents.length - 1),
              );

    const intent =
        phaseIntents[effectiveIntentIndex] ??
        phaseIntents[0];

    // Burn resolves before the enemy performs its intent.
    const burnDamage = state.enemy.statusEffects
        .filter((effect) => effect.type === "burn")
        .reduce((total, effect) => total + effect.amount, 0);

    const enemyHpAfterBurn = Math.max(
        0,
        state.enemy.hp - burnDamage,
    );

    const enemyStatusAfterBurn = state.enemy.statusEffects
        .map((effect) =>
            effect.type === "burn"
                ? { ...effect, duration: effect.duration - 1 }
                : effect,
        )
        .filter((effect) => effect.duration > 0);

    if (enemyHpAfterBurn === 0) {
        return {
            ...state,
            enemy: {
                ...state.enemy,
                hp: 0,
                statusEffects: enemyStatusAfterBurn,
            },
            phase: "victory",
        };
    }

    const enemyAfterBurn = {
        ...state.enemy,
        hp: enemyHpAfterBurn,
        statusEffects: enemyStatusAfterBurn,
    };

    const nextIntentIndex =
        (effectiveIntentIndex + 1) %
        phaseIntents.length;

    const nextIntent =
        phaseIntents[nextIntentIndex];

    const normalizedEnemy = {
        ...enemyAfterBurn,
        bossPhase:
            bossPhaseIndex ??
            enemyAfterBurn.bossPhase,
        intentIndex: effectiveIntentIndex,
        intent,
    };

    const playerAfterStatusTick = {
        ...state.player,
        statusEffects:
            reduceStatusEffectDurations(
                state.player
                    .statusEffects,
            ),
    };

    if (intent.type === "attack-debuff") {
        const updatedPlayer = damagePlayer(
            playerAfterStatusTick,
            intent.damage + enemyAfterBurn.strength,
        );

        if (updatedPlayer.hp === 0) {
            return {
                ...state,
                player: updatedPlayer,
                enemy: {
                    ...normalizedEnemy,
                    intentIndex: nextIntentIndex,
                    intent: nextIntent,
                },
                phase: "defeat",
            };
        }

        return {
            ...state,
            player: {
                ...updatedPlayer,
                statusEffects: [
                    ...updatedPlayer.statusEffects,
                    {
                        type: "weak",
                        amount: intent.amount,
                        duration: intent.duration,
                    },
                ],
            },
            enemy: {
                ...normalizedEnemy,
                intentIndex: nextIntentIndex,
                intent: nextIntent,
            },
            phase: "end-turn",
        };
    }

    if (intent.type === "attack-buff") {
        const updatedPlayer = damagePlayer(
            playerAfterStatusTick,
            intent.damage + enemyAfterBurn.strength,
        );

        if (updatedPlayer.hp === 0) {
            return {
                ...state,
                player: updatedPlayer,
                enemy: {
                    ...normalizedEnemy,
                    intentIndex: nextIntentIndex,
                    intent: nextIntent,
                },
                phase: "defeat",
            };
        }

        return {
            ...state,
            player: updatedPlayer,
            enemy: {
                ...normalizedEnemy,
                strength: enemyAfterBurn.strength + intent.amount,
                intentIndex: nextIntentIndex,
                intent: nextIntent,
            },
            phase: "end-turn",
        };
    }

    if (intent.type === "drain") {
        const updatedPlayer = damagePlayer(
            playerAfterStatusTick,
            intent.damage + enemyAfterBurn.strength,
        );

        if (updatedPlayer.hp === 0) {
            return {
                ...state,
                player: updatedPlayer,
                enemy: {
                    ...normalizedEnemy,
                    intentIndex: nextIntentIndex,
                    intent: nextIntent,
                },
                phase: "defeat",
            };
        }

        return {
            ...state,
            player: updatedPlayer,
            enemy: {
                ...normalizedEnemy,
                hp: Math.min(
                    enemyDefinition.maxHp,
                    enemyAfterBurn.hp + intent.heal,
                ),
                intentIndex: nextIntentIndex,
                intent: nextIntent,
            },
            phase: "end-turn",
        };
    }

    if (intent.type === "block-buff") {
        return {
            ...state,
            player: playerAfterStatusTick,
            enemy: {
                ...normalizedEnemy,
                block: enemyAfterBurn.block + intent.block,
                strength: enemyAfterBurn.strength + intent.strength,
                intentIndex: nextIntentIndex,
                intent: nextIntent,
            },
            phase: "end-turn",
        };
    }

    if (
        intent.type ===
        "attack"
    ) {
        const updatedPlayer =
            damagePlayer(
                playerAfterStatusTick,
                intent.damage +
                    state.enemy
                        .strength,
            );

        if (
            updatedPlayer.hp ===
            0
        ) {
            return {
                ...state,
                player:
                    updatedPlayer,
                enemy: {
                    ...normalizedEnemy,
                    intentIndex:
                        nextIntentIndex,
                    intent:
                        nextIntent,
                },
                phase:
                    "defeat",
            };
        }

        return {
            ...state,
            player:
                updatedPlayer,
            enemy: {
                ...normalizedEnemy,
                intentIndex:
                    nextIntentIndex,
                intent:
                    nextIntent,
            },
            phase:
                "end-turn",
        };
    }

    if (
        intent.type ===
        "block"
    ) {
        const updatedEnemy =
            addEnemyBlock(
                normalizedEnemy,
                intent.amount,
            );

        return {
            ...state,
            player:
                playerAfterStatusTick,
            enemy: {
                ...updatedEnemy,
                intentIndex:
                    nextIntentIndex,
                intent:
                    nextIntent,
            },
            phase:
                "end-turn",
        };
    }

    if (
        intent.type ===
        "heal"
    ) {
        const updatedEnemy =
            healEnemy(
                normalizedEnemy,
                intent.amount,
                enemyDefinition
                    .maxHp,
            );

        return {
            ...state,
            player:
                playerAfterStatusTick,
            enemy: {
                ...updatedEnemy,
                intentIndex:
                    nextIntentIndex,
                intent:
                    nextIntent,
            },
            phase:
                "end-turn",
        };
    }

    if (
        intent.type ===
        "buff"
    ) {
        return {
            ...state,
            player:
                playerAfterStatusTick,
            enemy: {
                ...normalizedEnemy,
                strength:
                    enemyAfterBurn
                        .strength +
                    intent.amount,
                intentIndex:
                    nextIntentIndex,
                intent:
                    nextIntent,
            },
            phase:
                "end-turn",
        };
    }

    if (
        intent.type ===
        "debuff"
    ) {
        return {
            ...state,
            player: {
                ...playerAfterStatusTick,
                statusEffects: [
                    ...playerAfterStatusTick
                        .statusEffects,
                    {
                        type:
                            "weak",
                        amount:
                            intent.amount,
                        duration:
                            intent.duration,
                    },
                ],
            },
            enemy: {
                ...normalizedEnemy,
                intentIndex:
                    nextIntentIndex,
                intent:
                    nextIntent,
            },
            phase:
                "end-turn",
        };
    }

    return state;
}

export function processEndTurn(
    state: CombatState,
): CombatState {
    if (
        state.phase !==
        "end-turn"
    ) {
        return state;
    }

    const updatedEnemyStatusEffects =
        state.enemy.statusEffects
            .map((effect) =>
                effect.type === "burn"
                    ? effect
                    : {
                          ...effect,
                          duration: effect.duration - 1,
                      },
            )
            .filter(
                (effect) => effect.duration > 0,
            );

    return {
        ...state,
        turn: state.turn + 1,
        player: startPlayerTurn(state.player),
        enemy: {
            ...state.enemy,
            statusEffects: updatedEnemyStatusEffects,
        },
        phase: "player-turn",
    };
}

export function advanceCombat(
    state: CombatState,
): CombatState {
    let updatedState = state;

    while (
        updatedState.phase ===
            "enemy-turn" ||
        updatedState.phase ===
            "end-turn"
    ) {
        const nextState =
            updatedState.phase ===
                "enemy-turn"
                ? executeEnemyIntent(
                      updatedState,
                  )
                : processEndTurn(
                      updatedState,
                  );

        if (
            nextState ===
            updatedState
        ) {
            break;
        }

        updatedState =
            nextState;
    }

    return updatedState;
}
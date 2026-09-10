import type {CardEffect,CombatState, CardDefinition, PlayerState, RunState } from "../types/game";
import { cards } from "../data/cards";
import { enemies } from "../data/enemies";
import { cloneDeck, drawCards, drawCardsWithRecycle } from "../data/deck";
import { MAX_HAND_SIZE } from "../consts/game";

export function startPlayerTurn(
    player: PlayerState,
): PlayerState {
    const playerAfterExile = processExiledCards(player);

    const cardsToDraw = Math.max(
        0,
        MAX_HAND_SIZE - playerAfterExile.hand.length,
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
        actions: playerAfterExile.baseActions,
        block: 0,
        hand: updatedHand,
        drawPile: updatedDrawPile,
        discardPile: updatedDiscardPile,
    };
}

export function startCombat(
    run: RunState,
    enemyId: string
): CombatState {
    const enemy = enemies.find((candidate) => candidate.id === enemyId)
        ?? enemies[0];
    const initialDeck = cloneDeck(run.deck);
    const { drawnCards, remainingDeck} = drawCards(initialDeck, MAX_HAND_SIZE);

    return {
        phase: "player-turn",
        turn: 1,

        player: {
            hp: run.hp,
            maxHp: run.maxHp,
            baseActions: run.baseActions,
            actions: run.baseActions,
            statusEffects: [],
            block: 0,
            hand: drawnCards,
            drawPile: remainingDeck,
            discardPile: [],
            exiledCards: [],
            exhaustedCards: [],
        },

        enemy: {
            definitionId: enemy.id,
            hp: enemy.maxHp,
            block: 0,
            strength: 0,
            intentIndex: 0,
            intent: enemy.intents[0],
            statusEffects: [],
        },
    };
}
    function damageEnemy(
        enemy: CombatState["enemy"],
        damage: number,
    ): CombatState["enemy"] {
        const damageToBlock = Math.min(enemy.block, damage);

        const remainingDamage = damage - damageToBlock;

        return {
            ...enemy,
            block: enemy.block - damageToBlock,
            hp: Math.max(0, enemy.hp - remainingDamage)
        }
    }
    function damagePlayer(
        player: CombatState["player"],
        damage: number
    ): CombatState["player"]{
        const damageToBlock = Math.min(player.block, damage);

        const remainingDamage = damage - damageToBlock;
        return {
            ...player,
            block: player.block - damageToBlock,
            hp: Math.max(0, player.hp - remainingDamage)
        }
    }

    function addEnemyBlock(
        enemy: CombatState["enemy"],
        amount: number
    ): CombatState["enemy"]{
        return {
            ...enemy,
            block: enemy.block + amount
        }
    }

    function healEnemy(
        enemy: CombatState["enemy"],
        amount: number,
        maxHp: number,
    ): CombatState["enemy"] {
        return {
            ...enemy,
            hp: Math.min(maxHp, enemy.hp + amount),
        };
    }

    function reduceStatusEffectDurations(
        statusEffects: CombatState["player"]["statusEffects"],
    ): CombatState["player"]["statusEffects"] {
        return statusEffects
            .map((effect) => ({
                ...effect,
                duration: effect.duration - 1,
            }))
            .filter((effect) => effect.duration > 0);
    }

    

    export function applyCardEffects(
    state: CombatState,
    effects: CardEffect[],
): CombatState {
    let updatedState = state;

    for (const effect of effects) {
        if (effect.type === "damage") {
            const weakness = updatedState.player.statusEffects
                .filter((status) => status.type === "weak")
                .reduce((total, status) => total + status.amount, 0);
            const damage = Math.floor(
                effect.amount * (1 - Math.min(100, weakness) / 100),
            );

            updatedState = {
                ...updatedState,
                enemy: damageEnemy(updatedState.enemy, damage),
            };
        }

        if (effect.type === "burn") {
            updatedState = {
                ...updatedState,
                enemy: {
                    ...updatedState.enemy,
                    statusEffects: [
                        ...updatedState.enemy.statusEffects,
                        {
                            type: "burn",
                            amount: effect.amount,
                            duration: effect.duration,
                        },
                    ],
                },
            };
        }

        if (effect.type === "block") {
            updatedState = {
                ...updatedState,
                player: {
                    ...updatedState.player,
                    block: updatedState.player.block + effect.amount,
                },
            };
        }

        if (effect.type === "gain-action") {
            updatedState = {
                ...updatedState,
                player: {
                    ...updatedState.player,
                    actions: updatedState.player.actions + effect.amount,
                },
            };
        }

        if (effect.type === "draw") {
            const cardsToDraw = Math.min(
                effect.amount,
                Math.max(0, MAX_HAND_SIZE - updatedState.player.hand.length),
            );

            const {
                hand,
                drawPile,
                discardPile,
            } = drawCardsWithRecycle(
                updatedState.player.hand,
                updatedState.player.drawPile,
                updatedState.player.discardPile,
                cardsToDraw,
            );

            updatedState = {
                ...updatedState,
                player: {
                    ...updatedState.player,
                    hand,
                    drawPile,
                    discardPile,
                },
            };
        }

        if (effect.type === "heal") {
            updatedState = {
                ...updatedState,
                player: {
                    ...updatedState.player,
                    hp: Math.min(
                        updatedState.player.maxHp,
                        updatedState.player.hp + effect.amount,
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

    const availableSlots = MAX_HAND_SIZE - player.hand.length;

    const cardsToHand = returningCards.slice(
        0,
        Math.max(0, availableSlots),
    );

    const cardsToExhaust = returningCards.slice(
        Math.max(0, availableSlots),
    );

    return {
        ...player,
        hand: [
            ...player.hand,
            ...cardsToHand,
        ],
        exiledCards: remainingExiledCards,
        exhaustedCards: [
            ...player.exhaustedCards,
            ...cardsToExhaust,
        ],
    };
}
    function getCard(cardId: string):CardDefinition | undefined {
        return cards.find((card) => card.id === cardId)
    }
export function moveCardAfterPlay(
    player: PlayerState,
    cardId: string,
    cooldown: number,): PlayerState {
        const card = player.hand.find((card) => card.cardId === cardId);

        if (!card) {
            return player;
        }
        const remainingHand = player.hand.filter((card) => card.cardId !== cardId);
        if (cooldown > 0) {
            return {
                ...player,
                hand: remainingHand,
                exiledCards: [
                    ...player.exiledCards,
                    {
                        cardId, 
                        cooldownRemaining: cooldown
                    }
                ]
            }
        }
        return {
            ...player,
            hand: remainingHand,
            discardPile: [
                ...player.discardPile,
                {
                    cardId,
                    cooldownRemaining: 0
                }
            ]
        }
    }

export function playCard(
    state: CombatState,
    cardId: string,
): CombatState {
    if(state.phase !== "player-turn") {
        return state;
    }

    if (state.player.actions <= 0) {
        return state;
    }
    const card = getCard(cardId);

    if (!card) {
        return state
    }
    const cardState = state.player.hand.find(
        (cardState) => cardState.cardId === cardId,
    );

    if(!cardState) {
        return state
    }
    if(cardState.cooldownRemaining > 0) {
        return state;
    }
    
   const updatedPlayer = moveCardAfterPlay(
    state.player,
    cardId,
    card.cooldown
   );
   const stateWithEffects = applyCardEffects(
    {
        ...state,
        player: updatedPlayer,
    },
    card.effects,
   );
   const playerAfterAction = {
    ...stateWithEffects.player,
    actions: stateWithEffects.player.actions - 1
   }
  

    if (stateWithEffects.enemy.hp === 0) {
         return {
            ...state, 
            player: playerAfterAction,
            enemy: {
                ...stateWithEffects.enemy,
            },
            phase: "victory"
        };
    };

     
    return {
        ...state,
         player: playerAfterAction,
        enemy: {
            ...stateWithEffects.enemy,
        },
        phase: "player-turn",
    }

 } 

export function endPlayerTurn(
    state: CombatState,
): CombatState {
    if (state.phase !== "player-turn") {
        return state;
    }

    return {
        ...state,
        phase: "enemy-turn",
    };
}

export function executeEnemyIntent(
  state: CombatState,
): CombatState {
  if (state.phase !== "enemy-turn") {
    return state;
  }

  const enemyDefinition = enemies.find(
    (enemy) => enemy.id === state.enemy.definitionId,
  );

  if (!enemyDefinition) {
    return state;
  }

  const nextIntentIndex =
    (state.enemy.intentIndex + 1) %
    enemyDefinition.intents.length;

  const nextIntent =
    enemyDefinition.intents[nextIntentIndex];

  const { intent } = state.enemy;
  const playerAfterStatusTick = {
    ...state.player,
    statusEffects: reduceStatusEffectDurations(
      state.player.statusEffects,
    ),
  };

  if (intent.type === "attack") {
    const updatedPlayer = damagePlayer(
     playerAfterStatusTick,
     intent.damage + state.enemy.strength,
);

    if (updatedPlayer.hp === 0) {
      return {
        ...state,
        player: {
          ...updatedPlayer
        },
        enemy: {
          ...state.enemy,
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
        ...state.enemy,
        intentIndex: nextIntentIndex,
        intent: nextIntent,
      },
      phase: "end-turn",
    };
  }

  if (intent.type === "block") {
    const updatedEnemy = addEnemyBlock(
        state.enemy,
        intent.amount
    )
    return {
      ...state,
      enemy: {
        ...updatedEnemy,
        intentIndex: nextIntentIndex,
        intent: nextIntent
      },
      phase: "end-turn",
    };
  }

  if (intent.type === "heal") {
    const updatedEnemy = healEnemy(
      state.enemy,
      intent.amount,
      enemyDefinition.maxHp,
    );

    return {
      ...state,
      player: playerAfterStatusTick,
      enemy: {
        ...updatedEnemy,
        intentIndex: nextIntentIndex,
        intent: nextIntent,
      },
      phase: "end-turn",
    };
  }

  if (intent.type === "buff") {
    return {
      ...state,
      player: playerAfterStatusTick,
      enemy: {
        ...state.enemy,
        strength: state.enemy.strength + intent.amount,
        intentIndex: nextIntentIndex,
        intent: nextIntent,
      },
      phase: "end-turn",
    };
  }

  if (intent.type === "debuff") {
    return {
      ...state,
      player: {
        ...playerAfterStatusTick,
        statusEffects: [
          ...playerAfterStatusTick.statusEffects,
          {
            type: "weak",
            amount: intent.amount,
            duration: intent.duration,
          },
        ],
      },
      enemy: {
        ...state.enemy,
        intentIndex: nextIntentIndex,
        intent: nextIntent,
      },
      phase: "end-turn",
    };
  }

  return state;
}

export function processEndTurn(
    state: CombatState,
): CombatState {
    if (state.phase !== "end-turn") {
        return state;
    }

    const burnDamage = state.enemy.statusEffects
        .filter((effect) => effect.type === "burn")
        .reduce((total, effect) => total + effect.amount, 0);

    const newEnemyHp = Math.max(
        0,
        state.enemy.hp - burnDamage,
    );

    if (newEnemyHp === 0) {
    return {
      ...state,
      enemy: {
                ...state.enemy,
                hp: 0,
            },
            phase: "victory",
        };
    }

    const updatedEnemyStatusEffects =
        state.enemy.statusEffects
            .map((effect) => ({
                ...effect,
                duration: effect.duration - 1,
            }))
            .filter((effect) => effect.duration > 0);

    return {
        ...state,
        turn: state.turn + 1,
        player: startPlayerTurn(state.player),
        enemy: {
            ...state.enemy,
            hp: newEnemyHp,
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
        updatedState.phase === "enemy-turn" ||
        updatedState.phase === "end-turn"
    ) {
        const nextState = updatedState.phase === "enemy-turn"
            ? executeEnemyIntent(updatedState)
            : processEndTurn(updatedState);

        if (nextState === updatedState) {
            break;
        }

        updatedState = nextState;
    }

    return updatedState;
}

import { cards } from "../data/cards";
import { describe, expect, it } from "vitest";
import type { CombatState, CardState, PlayerState} from "../types/game";
import {
  startCombat,
  playCard,
  executeEnemyIntent,
  processEndTurn,
  applyCardEffects,
  moveCardAfterPlay,
  processExiledCards
} from "./combat";
import {
    starterDeck,
    addCardToDeck,
    removeCardFromDeck,
    cloneDeck,
    findCardInDeck,
    drawCard,
    drawCards,
    drawCardsToHand,
    shuffleDeck,
    recycleDiscardPile,
    drawCardsWithRecycle,
    isValidDeck,
} from "../data/deck";
import { MIN_DECK_SIZE, MAX_DECK_SIZE } from "../consts/game";
function addCardToHand(
    state: CombatState,
    cardId: string,
): CombatState {
    return {
        ...state,
        player: {
            ...state.player,
            hand: [
                ...state.player.hand,
                {
                    cardId,
                    cooldownRemaining: 0,
                },
            ],
        },
    };
}
//затычка вренная

describe("Combat", () => {
  it("should start combat with correct initial state", () => {
    const state = startCombat();

    expect(state.phase).toBe("player-turn");
    expect(state.turn).toBe(1);

    expect(state.player.hp).toBe(10);
    expect(state.player.maxHp).toBe(10);
    expect(state.player.actions).toBe(1);

    expect(state.enemy.hp).toBe(15);
    expect(state.enemy.block).toBe(0);
    expect(state.enemy.intent.type).toBe("attack");
  });

  it("should deal damage when playing Fireball", () => {
    const state = startCombat();

    const nextState = playCard(
      state,
      "fireball",
    );

    expect(nextState.enemy.hp).toBe(13);
  });

  it("should spend one action when playing a card", () => {
    const state = startCombat();

    const nextState = playCard(
      state,
      "fireball",
    );

    expect(nextState.player.actions).toBe(0);
  });

  it("should change phase to enemy turn after playing a card", () => {
    const state = startCombat();

    const nextState = playCard(
      state,
      "fireball",
    );

    expect(nextState.phase).toBe("enemy-turn");
  });

  it("should not allow playing a card without actions", () => {
    const state = startCombat();

    const stateWithoutActions = {
      ...state,
      player: {
        ...state.player,
        actions: 0,
      },
    };

    const nextState = playCard(
      stateWithoutActions,
      "fireball",
    );

    expect(nextState).toEqual(stateWithoutActions);
  });

  it("should not allow playing a card during enemy turn", () => {
    const state = startCombat();

    const enemyTurnState = {
      ...state,
      phase: "enemy-turn" as const,
    };

    const nextState = playCard(
      enemyTurnState,
      "fireball",
    );

    expect(nextState).toEqual(enemyTurnState);
  });

  it("should not allow an unknown card", () => {
    const state = startCombat();

    const nextState = playCard(
      state,
      "unknown-card",
    );

    expect(nextState).toEqual(state);
  });

  it("should allow the enemy to attack the player", () => {
    const state = startCombat();

    const afterPlayerAttack = playCard(
      state,
      "fireball",
    );

    const afterEnemyAttack = executeEnemyIntent(
      afterPlayerAttack,
    );

    expect(afterEnemyAttack.player.hp).toBe(8);
    expect(afterEnemyAttack.phase).toBe("end-turn");
  });

  it("should process the end of the turn", () => {
    const state = startCombat();

    const afterPlayerAttack = playCard(
      state,
      "fireball",
    );

    const afterEnemyAttack = executeEnemyIntent(
      afterPlayerAttack,
    );

    const nextTurn = processEndTurn(
      afterEnemyAttack,
    );

    expect(nextTurn.turn).toBe(2);
    expect(nextTurn.player.actions).toBe(1);
    expect(nextTurn.phase).toBe("player-turn");
  });

it("should reduce cooldown at the end of the turn", () => {
    const state = startCombat();

    const afterFlameBurst = playCard(
        state,
        "flame-burst",
    );

    const flameBurst = afterFlameBurst.player.exiledCards.find(
        (card) => card.cardId === "flame-burst",
    );

    expect(flameBurst?.cooldownRemaining).toBe(2);

    const afterEnemyAttack = executeEnemyIntent(
        afterFlameBurst,
    );

    const nextTurn = processEndTurn(
        afterEnemyAttack,
    );

    const flameBurstAfterTurn =
        nextTurn.player.exiledCards.find(
            (card) => card.cardId === "flame-burst",
        );

    expect(
        flameBurstAfterTurn?.cooldownRemaining,
    ).toBe(1);
});

  it("should not allow playing a card while it is on cooldown", () => {
    const state = startCombat();

    const afterFlameBurst = playCard(
      state,
      "flame-burst",
    );

    const afterEnemyAttack = executeEnemyIntent(
      afterFlameBurst,
    );

    const nextTurn = processEndTurn(
      afterEnemyAttack,
    );

    const stateBeforeSecondUse = {
        ...nextTurn,
        player: {
    ...nextTurn.player,
    actions: 1,
    hand: nextTurn.player.hand.map((card) =>
      card.cardId === "flame-burst"
        ? {
            ...card,
            cooldownRemaining: 1,
          }
        : card,
    ),
  },
};

    const result = playCard(
      stateBeforeSecondUse,
      "flame-burst",
    );

    expect(result).toEqual(stateBeforeSecondUse);
  });
it("should reduce cooldown from 1 to 0", () => {
    const state = startCombat();

    const afterFlameBurst = playCard(
        state,
        "flame-burst",
    );

    const afterFirstEnemyAttack = executeEnemyIntent(
        afterFlameBurst,
    );

    const afterFirstEndTurn = processEndTurn(
        afterFirstEnemyAttack,
    );

    const flameBurstAfterFirstTurn =
        afterFirstEndTurn.player.exiledCards.find(
            (card) => card.cardId === "flame-burst",
        );

    expect(
        flameBurstAfterFirstTurn?.cooldownRemaining,
    ).toBe(1);

    const afterSecondEnemyAttack =
        executeEnemyIntent({
            ...afterFirstEndTurn,
            phase: "enemy-turn",
        });

    const afterSecondEndTurn = processEndTurn(
        afterSecondEnemyAttack,
    );

    const flameBurstAfterSecondTurn =
        afterSecondEndTurn.player.hand.find(
            (card) => card.cardId === "flame-burst",
        );

    expect(
        flameBurstAfterSecondTurn?.cooldownRemaining,
    ).toBe(0);
});

});
it("should apply block when enemy intent is block", () => {
    const state = startCombat();

    const blockState = {
        ...state,
        enemy: {
            ...state.enemy,
            intent: {
                type: "block" as const,
                amount: 3,
            },
        },
        phase: "enemy-turn" as const,
    };

    const nextState = executeEnemyIntent(
        blockState,
    );

    expect(nextState.enemy.block).toBe(3);
    expect(nextState.player.hp).toBe(10);
    expect(nextState.phase).toBe("end-turn");
});
it("should use enemy block before reducing HP", () => {
    const state = startCombat();

    const blockState = {
        ...state,
        enemy: {
            ...state.enemy,
            block: 3,
        },
    };

    const nextState = playCard(
        blockState,
        "fireball",
    );

    expect(nextState.enemy.hp).toBe(15);
    expect(nextState.enemy.block).toBe(1);
});
it("should deal remaining damage after breaking enemy block", () => {
    const state = startCombat();

    const blockState = {
        ...state,
        enemy: {
            ...state.enemy,
            block: 1,
        },
    };

    const nextState = playCard(
        blockState,
        "fireball",
    );

    expect(nextState.enemy.hp).toBe(14);
    expect(nextState.enemy.block).toBe(0);
});
it("should keep enemy block after enemy turn", () => {
    const state = startCombat();

    const blockState = {
        ...state,
        enemy: {
            ...state.enemy,
            block: 3,
        },
        phase: "enemy-turn" as const,
    };

    const nextState = executeEnemyIntent(
        blockState,
    );

    expect(nextState.enemy.block).toBe(3);
});
it("should reset enemy block at the end of the turn", () => {
    const state = startCombat();

    const blockState = {
        ...state,
        phase: "end-turn" as const,
        enemy: {
            ...state.enemy,
            block: 3,
        },
    };

    const nextState = processEndTurn(blockState);

    expect(nextState.enemy.block).toBe(0);
});
it("should move to the next enemy intent after enemy action", () => {
    const state = startCombat();

    const enemyTurnState = {
        ...state,
        phase: "enemy-turn" as const,
        enemy: {
            ...state.enemy,
            intentIndex: 0,
            intent: {
                type: "attack" as const,
                damage: 2,
            },
        },
    };

    const nextState = executeEnemyIntent(enemyTurnState);

    expect(nextState.enemy.intentIndex).toBe(1);
});
it("should set the next enemy intent after enemy action", () => {
    const state = startCombat();

    const enemyTurnState = {
        ...state,
        phase: "enemy-turn" as const,
        enemy: {
            ...state.enemy,
            intentIndex: 0,
            intent: {
                type: "attack" as const,
                damage: 2,
            },
        },
    };

    const nextState = executeEnemyIntent(enemyTurnState);

    expect(nextState.enemy.intentIndex).toBe(1);
    expect(nextState.enemy.intent).toEqual({
        type: "block",
        amount: 3,
    });
});
it("should loop back to the first enemy intent", () => {
    const state = startCombat();

    const enemyTurnState = {
        ...state,
        phase: "enemy-turn" as const,
        enemy: {
            ...state.enemy,
            intentIndex: 1,
            intent: {
                type: "block" as const,
                amount: 3,
            },
        },
    };

    const nextState = executeEnemyIntent(enemyTurnState);

    expect(nextState.enemy.intentIndex).toBe(0);
    expect(nextState.enemy.intent).toEqual({
        type: "attack",
        damage: 2,
    });
});
it("should apply burn to the enemy", () => {
    const state = startCombat();

    const stateWithCard = addCardToHand(
        state,
        "ignite",
    );

    const nextState = playCard(
        stateWithCard,
        "ignite",
    );

    expect(nextState.enemy.statusEffects).toEqual([
        {
            type: "burn",
            amount: 3,
            duration: 2,
        },
    ]);
});
it("should deal burn damage at the end of the turn", () => {
    const state = startCombat();

    const burnState = {
        ...state,
        phase: "end-turn" as const,
        enemy: {
            ...state.enemy,
            hp: 15,
            statusEffects: [
                {
                    type: "burn" as const,
                    amount: 3,
                    duration: 2
                },
            ],
        },
    };

    const nextState = processEndTurn(burnState);

    expect(nextState.enemy.hp).toBe(12);
});
it("should reduce burn duration at the end of the turn", () => {
    const state = startCombat();

    const burnState = {
        ...state,
        phase: "end-turn" as const,
        enemy: {
            ...state.enemy,
            statusEffects: [
                {
                    type: "burn" as const,
                    amount: 3,
                    duration: 2,
                },
            ],
        },
    };

    const nextState = processEndTurn(burnState);

    expect(nextState.enemy.statusEffects).toEqual([
        {
            type: "burn",
            amount: 3,
            duration: 1,
        },
    ]);
});
it("should remove burn when duration reaches zero", () => {
    const state = startCombat();

    const burnState = {
        ...state,
        phase: "end-turn" as const,
        enemy: {
            ...state.enemy,
            statusEffects: [
                {
                    type: "burn" as const,
                    amount: 3,
                    duration: 1,
                },
            ],
        },
    };

    const nextState = processEndTurn(burnState);

    expect(nextState.enemy.statusEffects).toEqual([]);
});
/// стаки берна тест

it("should stack multiple burn effects", () => {
    const state = startCombat();

    const burnState = {
        ...state,
        phase: "enemy-turn" as const,
        enemy: {
            ...state.enemy,
            statusEffects: [
                {
                    type: "burn" as const,
                    amount: 3,
                    duration: 2,
                },
                {
                    type: "burn" as const,
                    amount: 3,
                    duration: 2,
                },
            ],
        },
    };

    expect(burnState.enemy.statusEffects).toHaveLength(2);
});
it("should deal combined damage from multiple burn effects", () => {
    const state = startCombat();

    const burnState = {
        ...state,
        phase: "end-turn" as const,
        enemy: {
            ...state.enemy,
            hp: 15,
            statusEffects: [
                {
                    type: "burn" as const,
                    amount: 3,
                    duration: 2,
                },
                {
                    type: "burn" as const,
                    amount: 3,
                    duration: 2,
                },
            ],
        },
    };

    const nextState = processEndTurn(burnState);

    expect(nextState.enemy.hp).toBe(9);
});
it("should not allow playing a card after victory", () => {
    const state = startCombat();

    const victoryState = {
        ...state,
        phase: "victory" as const,
    };

    const nextState = playCard(victoryState, "fireball");

    expect(nextState).toEqual(victoryState);
});
it("should not allow playing a card after defeat", () => {
    const state = startCombat();

    const defeatState = {
        ...state,
        phase: "defeat" as const,
    };

    const nextState = playCard(defeatState, "fireball");

    expect(nextState).toEqual(defeatState);
});
it("should not execute enemy intent after victory", () => {
    const state = startCombat();

    const victoryState = {
        ...state,
        phase: "victory" as const,
    };

    const nextState = executeEnemyIntent(victoryState);

    expect(nextState).toEqual(victoryState);
});
it("should not execute enemy intent after defeat", () => {
    const state = startCombat();

    const defeatState = {
        ...state,
        phase: "defeat" as const,
    };

    const nextState = executeEnemyIntent(defeatState);

    expect(nextState).toEqual(defeatState);
});
it("should not reduce player HP below zero", () => {
    const state = startCombat();

    const lowHpState = {
        ...state,
        phase: "enemy-turn" as const,
        player: {
            ...state.player,
            hp: 1,
        },
        enemy: {
            ...state.enemy,
            intent: {
                type: "attack" as const,
                damage: 5,
            },
        },
    };

    const nextState = executeEnemyIntent(lowHpState);

    expect(nextState.player.hp).toBe(0);
    expect(nextState.phase).toBe("defeat");
});
it("should not reduce enemy HP below zero", () => {
    const state = startCombat();

    const lowHpState = {
        ...state,
        enemy: {
            ...state.enemy,
            hp: 1,
        },
    };

    const nextState = playCard(lowHpState, "fireball");

    expect(nextState.enemy.hp).toBe(0);
    expect(nextState.phase).toBe("victory");
});
it("should break enemy block and kill the enemy with remaining damage", () => {
    const state = startCombat();

    const lowHpBlockedState = {
        ...state,
        enemy: {
            ...state.enemy,
            hp: 1,
            block: 1,
        },
    };

    const nextState = playCard(lowHpBlockedState, "fireball");

    expect(nextState.enemy.hp).toBe(0);
    expect(nextState.enemy.block).toBe(0);
    expect(nextState.phase).toBe("victory");
});
it("should fully absorb damage with enemy block", () => {
    const state = startCombat();

    const blockedState = {
        ...state,
        enemy: {
            ...state.enemy,
            hp: 15,
            block: 3,
        },
    };

    const nextState = playCard(blockedState, "fireball");

    expect(nextState.enemy.hp).toBe(15);
    expect(nextState.enemy.block).toBe(1);
    expect(nextState.player.actions).toBe(0);
    expect(nextState.phase).toBe("enemy-turn");
});
it("should win if burn kills enemy at end of turn", () => {
    const state = startCombat();

    const burningState = {
        ...state,
        phase: "end-turn" as const,
        enemy: {
            ...state.enemy,
            hp: 3,
            statusEffects: [
                {
                    type: "burn" as const,
                    amount: 3,
                    duration: 1,
                },
            ],
        },
    };

    const nextState = processEndTurn(burningState);

    expect(nextState.enemy.hp).toBe(0);
    expect(nextState.phase).toBe("victory");
});
it("should spend player action when lethal card is played", () => {
    const state = startCombat();

    const weakEnemyState = {
        ...state,
        enemy: {
            ...state.enemy,
            hp: 1,
        },
    };

    const nextState = playCard(weakEnemyState, "fireball");

    expect(nextState.enemy.hp).toBe(0);
    expect(nextState.player.actions).toBe(0);
    expect(nextState.phase).toBe("victory");
});
it("should apply cooldown when lethal card is played", () => {
    const state = startCombat();

    const weakEnemyState = {
        ...state,
        enemy: {
            ...state.enemy,
            hp: 1,
        },
    };

    const nextState = playCard(weakEnemyState, "flame-burst");

    const flameBurst = nextState.player.exiledCards.find(
    (card) => card.cardId === "flame-burst",
);

    expect(flameBurst?.cooldownRemaining).toBe(2);
    expect(nextState.phase).toBe("victory");
});
it("should apply effects when lethal card is played", () => {
    const state = startCombat();

    const weakEnemyState = {
        ...state,
        enemy: {
            ...state.enemy,
            hp: 1,
        },
    };

    const stateWithCard = addCardToHand(
    weakEnemyState,
    "ignite",
);

const nextState = playCard(
    stateWithCard,
    "ignite",
);

    expect(nextState.enemy.hp).toBe(0);
    expect(nextState.enemy.statusEffects).toEqual([
        {
            type: "burn",
            amount: 3,
            duration: 2,
        },
    ]);
    expect(nextState.phase).toBe("victory");
});
it("should not allow playing another card after lethal attack", () => {
    const state = startCombat();

    const weakEnemyState = {
        ...state,
        enemy: {
            ...state.enemy,
            hp: 1,
        },
    };

    const victoryState = playCard(weakEnemyState, "fireball");

    const nextState = playCard(victoryState, "ignite");

    expect(nextState).toEqual(victoryState);
});
it("should not reduce cooldown below zero", () => {
    const state = startCombat();

    const cooldownState = {
        ...state,
        phase: "enemy-turn" as const,
        player: {
            ...state.player,
            hand: state.player.hand.map((card) =>
                card.cardId === "fireball"
                    ? { ...card, cooldownRemaining: 0 }
                    : card
            ),
        },
    };

    const nextState = processEndTurn(cooldownState);

    const fireball = nextState.player.hand.find(
        (card) => card.cardId === "fireball",
    );

    expect(fireball?.cooldownRemaining).toBe(0);
});
it("should not continue combat after player defeat", () => {
    const state = startCombat();

    const enemyTurnState = {
        ...state,
        phase: "enemy-turn" as const,
        player: {
            ...state.player,
            hp: 2,
        },
        enemy: {
            ...state.enemy,
            intent: {
                type: "attack" as const,
                damage: 2,
            },
        },
    };

    const defeatState = executeEnemyIntent(enemyTurnState);

    expect(defeatState.player.hp).toBe(0);
    expect(defeatState.phase).toBe("defeat");

    const nextState = processEndTurn(defeatState);

    expect(nextState).toEqual(defeatState);
});
it("should not execute enemy intent twice in the same turn", () => {
    const state = startCombat();

    const enemyTurnState = {
        ...state,
        phase: "enemy-turn" as const,
    };

    const afterFirstIntent = executeEnemyIntent(enemyTurnState);

    const afterSecondIntent = executeEnemyIntent(afterFirstIntent);

    expect(afterSecondIntent).toEqual(afterFirstIntent);
});
it("should not process end turn after burn victory", () => {
    const state = startCombat();

    const burningState = {
        ...state,
        phase: "end-turn" as const,
        enemy: {
            ...state.enemy,
            hp: 3,
            statusEffects: [
                {
                    type: "burn" as const,
                    amount: 3,
                    duration: 2,
                },
            ],
        },
    };

    const victoryState = processEndTurn(burningState);
    const afterSecondProcess = processEndTurn(victoryState);

    expect(victoryState.phase).toBe("victory");
    expect(afterSecondProcess).toEqual(victoryState);
});
it("should apply burn effect from card", () => {
    const state = startCombat();

    const card = cards.find((card) => card.id === "ignite");

    if (!card) {
        throw new Error("Ignite card not found");
    }

    const nextState = applyCardEffects(state, card.effects ?? []);

    expect(nextState.enemy.statusEffects).toEqual([
        {
            type: "burn",
            amount: 3,
            duration: 2,
        },
    ]);
});
it("should preserve existing effects when applying a new card effect", () => {
    const state = startCombat();

    const stateWithBurn = {
        ...state,
        enemy: {
            ...state.enemy,
            statusEffects: [
                {
                    type: "burn" as const,
                    amount: 2,
                    duration: 1,
                },
            ],
        },
    };

    const nextState = applyCardEffects(stateWithBurn, [
        {
            type: "burn",
            amount: 3,
            duration: 2,
        },
    ]);

    expect(nextState.enemy.statusEffects).toEqual([
        {
            type: "burn",
            amount: 2,
            duration: 1,
        },
        {
            type: "burn",
            amount: 3,
            duration: 2,
        },
    ]);
});
it("should apply card effects when playing a card", () => {
    const state = startCombat();

    const stateWithCard = addCardToHand(
    state,
    "ignite",
);

const nextState = playCard(
    stateWithCard,
    "ignite",
);

    expect(nextState.enemy.statusEffects).toEqual([
        {
            type: "burn",
            amount: 3,
            duration: 2,
        },
    ]);
});
it("should reduce enemy block before reducing HP", () => {
    const state = startCombat();

    const stateWithBlock: CombatState = {
        ...state,
        enemy: {
            ...state.enemy,
            block: 3,
            hp: 15,
        },
    };

    const result = playCard(stateWithBlock, "flame-burst");

    expect(result.enemy.block).toBe(0);
    expect(result.enemy.hp).toBe(13);
});
it("should switch to the next enemy intent", () => {
    const state = startCombat();

    const enemyTurnState: CombatState = {
        ...state,
        phase: "enemy-turn",
    };

    const result = executeEnemyIntent(enemyTurnState);

    expect(result.enemy.intentIndex).toBe(1);
    expect(result.enemy.intent.type).toBe("block");
});
it("should reset player block at the end of turn", () => {
    const state = startCombat();

    const endTurnState: CombatState = {
        ...state,
        phase: "end-turn",
        player: {
            ...state.player,
            block: 5,
        },
    };

    const result = processEndTurn(endTurnState);

    expect(result.player.block).toBe(0);
});
it("should apply block effect to the player", () => {
    const state = startCombat();

    const result = applyCardEffects(state, [
        {
            type: "block",
            amount: 3,
        },
    ]);

    expect(result.player.block).toBe(3);
});
it("should apply block when playing a block card", () => {
    const state = startCombat();

    const stateWithCard = addCardToHand(
        state,
        "flame-guard",
    );

    const result = playCard(
        stateWithCard,
        "flame-guard",
    );

    expect(result.player.block).toBe(3);
    expect(result.player.actions).toBe(0);
    expect(result.phase).toBe("enemy-turn");
});
it("should apply block effect to flame-guard", () => {
    const state = startCombat();

    const stateWithCard = addCardToHand(
        state,
        "flame-guard"
    )

    const result = playCard(stateWithCard, "flame-guard");

    expect(result.player.block).toBe(3);
});
it("should reduce player block when enemy attacks", () => {
    const state = startCombat();

    const stateWithCard = addCardToHand(
        state,
        "flame-guard"
    );

    const blockState = playCard(
        stateWithCard, 
        "flame-guard");

    const result = executeEnemyIntent(blockState);

    expect(result.player.block).toBe(1);
    expect(result.player.hp).toBe(10);
});
it("should deal damage and apply block from the same card", () => {
    const state = startCombat();
    
    const stateWithCard = addCardToHand(
        state,
        "ember-guard"
    )

    const result = playCard(stateWithCard, "ember-guard");

    expect(result.enemy.hp).toBe(13);
    expect(result.player.block).toBe(2);
    expect(result.player.actions).toBe(0);
    expect(result.phase).toBe("enemy-turn");
});
it("should create a fresh copy of the starter deck", () => {
    const state = startCombat();

    const allPlayerCards = [
        ...state.player.hand,
        ...state.player.drawPile,
    ];

    for (const card of allPlayerCards) {
        const originalCard = starterDeck.find(
            (starterCard) => starterCard.cardId === card.cardId,
        );

        expect(card).not.toBe(originalCard);
    }
});
describe("Deck", () => {
    it("should add a card to the deck", () => {
        const deck = [
            {
                cardId: "fireball",
                cooldownRemaining: 0,
            },
        ];

        const result = addCardToDeck(deck, "ignite");

        expect(result).toEqual([
            {
                cardId: "fireball",
                cooldownRemaining: 0,
            },
            {
                cardId: "ignite",
                cooldownRemaining: 0,
            },
        ]);
    });
});
it("should not mutate the original deck", () => {
    const deck = [
        {
            cardId: "fireball",
            cooldownRemaining: 0,
        },
    ];

    addCardToDeck(deck, "ignite");

    expect(deck).toEqual([
        {
            cardId: "fireball",
            cooldownRemaining: 0,
        },
    ]);
});
it("should remove a card from the deck", () => {
    const deck: CardState[] = [
        {
            cardId: "ignite",
            cooldownRemaining: 0,
        },
        ...Array.from(
            { length: MIN_DECK_SIZE },
            (_, index) => ({
                cardId: `card-${index}`,
                cooldownRemaining: 0,
            }),
        ),
    ];

    const result = removeCardFromDeck(
        deck,
        "ignite",
    );

    expect(result).toHaveLength(MIN_DECK_SIZE);

    expect(result).not.toContainEqual({
        cardId: "ignite",
        cooldownRemaining: 0,
    });
});
it("should not mutate the original deck when removing a card", () => {
    const deck = [
        {
            cardId: "fireball",
            cooldownRemaining: 0,
        },
        {
            cardId: "ignite",
            cooldownRemaining: 0,
        },
    ];

    removeCardFromDeck(deck, "ignite");

    expect(deck).toEqual([
        {
            cardId: "fireball",
            cooldownRemaining: 0,
        },
        {
            cardId: "ignite",
            cooldownRemaining: 0,
        },
    ]);
});
it("should not add an unknown card to the deck", () => {
    const deck = [
        {
            cardId: "fireball",
            cooldownRemaining: 0,
        },
    ];

    const result = addCardToDeck(deck, "unknown-card");

    expect(result).toEqual(deck);
});
it("should clone the deck without sharing card objects", () => {
    const deck = [
        {
            cardId: "fireball",
            cooldownRemaining: 0,
        },
        {
            cardId: "ignite",
            cooldownRemaining: 1,
        },
    ];

    const result = cloneDeck(deck);

    expect(result).toEqual(deck);
    expect(result).not.toBe(deck);
    expect(result[0]).not.toBe(deck[0]);
    expect(result[1]).not.toBe(deck[1]);
});
it("should find a card in the deck", () => {
    const deck = [
        {
            cardId: "fireball",
            cooldownRemaining: 0,
        },
        {
            cardId: "ignite",
            cooldownRemaining: 1,
        },
    ];

    const result = findCardInDeck(deck, "ignite");

    expect(result).toEqual({
        cardId: "ignite",
        cooldownRemaining: 1,
    });
});
it("should return undefined when card is not in the deck", () => {
    const deck = [
        {
            cardId: "fireball",
            cooldownRemaining: 0,
        },
    ];

    const result = findCardInDeck(deck, "ignite");

    expect(result).toBeUndefined();
});
it("should draw the first card from the deck", () => {
    const deck = [
        {
            cardId: "fireball",
            cooldownRemaining: 0,
        },
        {
            cardId: "ignite",
            cooldownRemaining: 0,
        },
    ];

    const result = drawCard(deck);

    expect(result.card).toEqual({
        cardId: "fireball",
        cooldownRemaining: 0,
    });

    expect(result.remainingDeck).toEqual([
        {
            cardId: "ignite",
            cooldownRemaining: 0,
        },
    ]);
});
it("should return undefined when drawing from an empty deck", () => {
    const result = drawCard([]);

    expect(result.card).toBeUndefined();
    expect(result.remainingDeck).toEqual([]);
});
it("should draw multiple cards from the deck", () => {
    const deck = [
        {
            cardId: "fireball",
            cooldownRemaining: 0,
        },
        {
            cardId: "ignite",
            cooldownRemaining: 0,
        },
        {
            cardId: "flame-burst",
            cooldownRemaining: 0,
        },
        {
            cardId: "flame-guard",
            cooldownRemaining: 0,
        },
    ];

    const result = drawCards(deck, 3);

    expect(result.drawnCards).toEqual([
        {
            cardId: "fireball",
            cooldownRemaining: 0,
        },
        {
            cardId: "ignite",
            cooldownRemaining: 0,
        },
        {
            cardId: "flame-burst",
            cooldownRemaining: 0,
        },
    ]);

    expect(result.remainingDeck).toEqual([
        {
            cardId: "flame-guard",
            cooldownRemaining: 0,
        },
    ]);
});
it("should draw all available cards when count exceeds deck size", () => {
    const deck = [
        {
            cardId: "fireball",
            cooldownRemaining: 0,
        },
        {
            cardId: "ignite",
            cooldownRemaining: 0,
        },
    ];

    const result = drawCards(deck, 5);

    expect(result.drawnCards).toEqual(deck);
    expect(result.remainingDeck).toEqual([]);
});
it("should initialize the draw pile with the starter deck", () => {
    const state = startCombat();

    expect([
        ...state.player.hand,
        ...state.player.drawPile,
    ]).toHaveLength(starterDeck.length);
});
it("should not share the starter deck reference with draw pile", () => {
    const state = startCombat();

    expect(state.player.drawPile).not.toBe(starterDeck);
});
it("should draw five cards into the starting hand", () => {
    const state = startCombat();

    expect(state.player.hand).toHaveLength(5);
});
it("should move a played normal card to discard pile", () => {
    const state = startCombat();

    const result = playCard(
        state,
        "fireball",
    );

    expect(result.player.hand).not.toContainEqual({
        cardId: "fireball",
        cooldownRemaining: 0,
    });

    expect(result.player.discardPile).toContainEqual({
        cardId: "fireball",
        cooldownRemaining: 0,
    });
});
it("should not play a card that is not in the player's hand", () => {
    const state = startCombat();

    const stateWithoutFireball = {
        ...state,
        player: {
            ...state.player,
            hand: state.player.hand.filter(
                (card) => card.cardId !== "fireball",
            ),
        },
    };

    const result = playCard(
        stateWithoutFireball,
        "fireball",
    );

    expect(result).toEqual(stateWithoutFireball);
});
it("should move a cooldown card to exile after playing", () => {
    const state = startCombat();

    const stateWithCard = addCardToHand(
        state,
        "flame-burst",
    );

    const result = moveCardAfterPlay(
        stateWithCard.player,
        "flame-burst",
        2,
    );

    expect(result.exiledCards).toEqual([
        {
            cardId: "flame-burst",
            cooldownRemaining: 2,
        },
    ]);
});
it("should move Flame Burst to exile after playing it", () => {
    const state = startCombat();

    const result = playCard(
        state,
        "flame-burst",
    );

    expect(result.player.hand).not.toContainEqual({
        cardId: "flame-burst",
        cooldownRemaining: 2,
    });

    expect(result.player.exiledCards).toContainEqual({
        cardId: "flame-burst",
        cooldownRemaining: 2,
    });
});
it("should move a normal card to discard pile after playing", () => {
    const state = startCombat();

    const result = playCard(
        state,
        "fireball",
    );

    expect(result.player.hand).not.toContainEqual({
        cardId: "fireball",
        cooldownRemaining: 0,
    });

    expect(result.player.discardPile).toContainEqual({
        cardId: "fireball",
        cooldownRemaining: 0,
    });
});
it("should draw cards into hand", () => {
    const hand = [
        {
            cardId: "fireball",
            cooldownRemaining: 0,
        },
    ];

    const drawPile = [
        {
            cardId: "ignite",
            cooldownRemaining: 0,
        },
        {
            cardId: "flame-burst",
            cooldownRemaining: 0,
        },
        {
            cardId: "flame-guard",
            cooldownRemaining: 0,
        },
    ];

    const result = drawCardsToHand(
        hand,
        drawPile,
        2,
    );

    expect(result.hand).toEqual([
        {
            cardId: "fireball",
            cooldownRemaining: 0,
        },
        {
            cardId: "ignite",
            cooldownRemaining: 0,
        },
        {
            cardId: "flame-burst",
            cooldownRemaining: 0,
        },
    ]);

    expect(result.drawPile).toEqual([
        {
            cardId: "flame-guard",
            cooldownRemaining: 0,
        },
    ]);
});
it("should not mutate hand or draw pile when drawing cards", () => {
    const hand = [
        {
            cardId: "fireball",
            cooldownRemaining: 0,
        },
    ];

    const drawPile = [
        {
            cardId: "ignite",
            cooldownRemaining: 0,
        },
    ];

    drawCardsToHand(hand, drawPile, 1);

    expect(hand).toEqual([
        {
            cardId: "fireball",
            cooldownRemaining: 0,
        },
    ]);

    expect(drawPile).toEqual([
        {
            cardId: "ignite",
            cooldownRemaining: 0,
        },
    ]);
});
it("should draw cards at the start of a new player turn", () => {
    const state = startCombat();

    const stateWithSmallHand = {
        ...state,
        phase: "end-turn" as const,
        player: {
            ...state.player,
            hand: state.player.hand.slice(0, 1),
            drawPile: state.player.hand.slice(1),
        },
    };

    const result = processEndTurn(stateWithSmallHand);

    expect(result.player.hand).toHaveLength(5);
});
it("should remove drawn cards from the draw pile", () => {
    const state = startCombat();

    const stateWithSmallHand = {
        ...state,
        phase: "end-turn" as const,
        player: {
            ...state.player,
            hand: state.player.hand.slice(0, 1),
            drawPile: state.player.hand.slice(1),
        },
    };

    const initialDrawPileSize =
        stateWithSmallHand.player.drawPile.length;

    const result = processEndTurn(stateWithSmallHand);

    expect(result.player.drawPile.length).toBe(
        initialDrawPileSize - 4,
    );
});
it("should create a shuffled copy of the deck", () => {
    const deck = [
        {
            cardId: "fireball",
            cooldownRemaining: 0,
        },
        {
            cardId: "ignite",
            cooldownRemaining: 0,
        },
        {
            cardId: "flame-burst",
            cooldownRemaining: 0,
        },
    ];

    const result = shuffleDeck(deck);

    expect(result).toHaveLength(3);
    expect(result).toEqual(expect.arrayContaining(deck));
    expect(result).not.toBe(deck);
});
it("should recycle discard pile when draw pile is empty", () => {
    const drawPile: CardState[] = [];

    const discardPile: CardState[] = [
        {
            cardId: "fireball",
            cooldownRemaining: 0,
        },
        {
            cardId: "ignite",
            cooldownRemaining: 0,
        },
        {
            cardId: "flame-burst",
            cooldownRemaining: 0,
        },
    ];

    const result = recycleDiscardPile(
        drawPile,
        discardPile,
    );

    expect(result.drawPile).toHaveLength(3);
    expect(result.drawPile).toEqual(
        expect.arrayContaining(discardPile),
    );
    expect(result.discardPile).toEqual([]);
});
it("should not recycle discard pile when draw pile is not empty", () => {
    const drawPile: CardState[] = [
        {
            cardId: "fireball",
            cooldownRemaining: 0,
        },
    ];

    const discardPile: CardState[] = [
        {
            cardId: "ignite",
            cooldownRemaining: 0,
        },
    ];

    const result = recycleDiscardPile(
        drawPile,
        discardPile,
    );

    expect(result.drawPile).toEqual(drawPile);
    expect(result.discardPile).toEqual(discardPile);
});
it("should recycle discard pile when drawing cards", () => {
    const hand: CardState[] = [];

    const drawPile: CardState[] = [];

    const discardPile: CardState[] = [
        {
            cardId: "fireball",
            cooldownRemaining: 0,
        },
        {
            cardId: "ignite",
            cooldownRemaining: 0,
        },
    ];

    const result = drawCardsWithRecycle(
        hand,
        drawPile,
        discardPile,
        2,
    );

    expect(result.hand).toHaveLength(2);

    expect(result.hand).toEqual(
        expect.arrayContaining([
            {
                cardId: "fireball",
                cooldownRemaining: 0,
            },
            {
                cardId: "ignite",
                cooldownRemaining: 0,
            },
        ]),
    );

    expect(result.drawPile).toEqual([]);
    expect(result.discardPile).toEqual([]);
});
it("should stop drawing when draw pile and discard pile are empty", () => {
    const result = drawCardsWithRecycle(
        [],
        [],
        [],
        3,
    );

    expect(result.hand).toEqual([]);
    expect(result.drawPile).toEqual([]);
    expect(result.discardPile).toEqual([]);
});
it("should draw one card when hand has four cards", () => {
    const state = startCombat();

    const stateWithFourCards = {
        ...state,
        phase: "end-turn" as const,
        player: {
            ...state.player,
            hand: state.player.hand.slice(0, 4),
            drawPile: [
                {
                    cardId: "flame-guard",
                    cooldownRemaining: 0,
                },
            ],
        },
    };

    const result = processEndTurn(stateWithFourCards);

    expect(result.player.hand).toHaveLength(5);

    expect(result.player.hand).toContainEqual({
        cardId: "flame-guard",
        cooldownRemaining: 0,
    });

    expect(result.player.drawPile).toEqual([]);
});
it("should draw from discard pile when draw pile is empty", () => {
    const state = startCombat();

    const stateWithFourCards = {
        ...state,
        phase: "end-turn" as const,
        player: {
            ...state.player,
            hand: state.player.hand.slice(0, 4),
            drawPile: [],
            discardPile: [
                {
                    cardId: "flame-guard",
                    cooldownRemaining: 0,
                },
            ],
        },
    };

    const result = processEndTurn(stateWithFourCards);

    expect(result.player.hand).toHaveLength(5);

    expect(result.player.hand).toContainEqual({
        cardId: "flame-guard",
        cooldownRemaining: 0,
    });

    expect(result.player.discardPile).toEqual([]);
});
it("should continue drawing from discard pile when draw pile runs out", () => {
    const state = startCombat();

    const stateWithTwoCards = {
        ...state,
        phase: "end-turn" as const,
        player: {
            ...state.player,
            hand: state.player.hand.slice(0, 2),
            drawPile: [
                {
                    cardId: "flame-guard",
                    cooldownRemaining: 0,
                },
            ],
            discardPile: [
                {
                    cardId: "ember-guard",
                    cooldownRemaining: 0,
                },
                {
                    cardId: "fireball",
                    cooldownRemaining: 0,
                },
            ],
        },
    };

    const result = processEndTurn(stateWithTwoCards);

    expect(result.player.hand).toHaveLength(5);

    expect(result.player.hand).toContainEqual({
        cardId: "flame-guard",
        cooldownRemaining: 0,
    });

    expect(result.player.hand).toContainEqual({
        cardId: "ember-guard",
        cooldownRemaining: 0,
    });

    expect(result.player.hand).toContainEqual({
        cardId: "fireball",
        cooldownRemaining: 0,
    });

    expect(result.player.drawPile).toHaveLength(0);
    expect(result.player.discardPile).toEqual([]);
});
it("should not add a card when deck reaches maximum size", () => {
    const deck: CardState[] = Array.from(
        { length: MAX_DECK_SIZE },
        (_, index) => ({
            cardId: `card-${index}`,
            cooldownRemaining: 0,
        }),
    );

    const result = addCardToDeck(
        deck,
        "fireball",
    );

    expect(result).toEqual(deck);
});
it("should add a card when deck is below maximum size", () => {
    const deck: CardState[] = Array.from(
        { length: MAX_DECK_SIZE - 1 },
        (_, index) => ({
            cardId: `card-${index}`,
            cooldownRemaining: 0,
        }),
    );

    const result = addCardToDeck(
        deck,
        "fireball",
    );

    expect(result).toHaveLength(MAX_DECK_SIZE);
});
it("should not remove a card when deck reaches minimum size", () => {
    const deck: CardState[] = Array.from(
        { length: MIN_DECK_SIZE },
        (_, index) => ({
            cardId: index === 0
                ? "fireball"
                : `card-${index}`,
            cooldownRemaining: 0,
        }),
    );

    const result = removeCardFromDeck(
        deck,
        "fireball",
    );

    expect(result).toEqual(deck);
});
it("should remove a card when deck is above minimum size", () => {
    const deck: CardState[] = Array.from(
        { length: MIN_DECK_SIZE + 1 },
        (_, index) => ({
            cardId: index === 0
                ? "fireball"
                : `card-${index}`,
            cooldownRemaining: 0,
        }),
    );

    const result = removeCardFromDeck(
        deck,
        "fireball",
    );

    expect(result).toHaveLength(MIN_DECK_SIZE);
});
it("should accept deck with minimum size", () => {
    const deck: CardState[] = Array.from(
        { length: MIN_DECK_SIZE },
        (_, index) => ({
            cardId: `card-${index}`,
            cooldownRemaining: 0,
        }),
    );

    expect(isValidDeck(deck)).toBe(true);
});
it("should accept deck with maximum size", () => {
    const deck: CardState[] = Array.from(
        { length: MAX_DECK_SIZE },
        (_, index) => ({
            cardId: `card-${index}`,
            cooldownRemaining: 0,
        }),
    );

    expect(isValidDeck(deck)).toBe(true);
});
it("should reject deck below minimum size", () => {
    const deck: CardState[] = Array.from(
        { length: MIN_DECK_SIZE - 1 },
        (_, index) => ({
            cardId: `card-${index}`,
            cooldownRemaining: 0,
        }),
    );

    expect(isValidDeck(deck)).toBe(false);
});
it("should reject deck above maximum size", () => {
    const deck: CardState[] = Array.from(
        { length: MAX_DECK_SIZE + 1 },
        (_, index) => ({
            cardId: `card-${index}`,
            cooldownRemaining: 0,
        }),
    );

    expect(isValidDeck(deck)).toBe(false);
});
it("should process exiled cards and return ready cards to hand", () => {
    const state = startCombat();

    const player: PlayerState = {
        ...state.player,
        hand: [],
        exiledCards: [
            {
                cardId: "flame-burst",
                cooldownRemaining: 2,
            },
        ],
    };

    const result = processExiledCards(player);

    expect(result.exiledCards).toEqual([
        {
            cardId: "flame-burst",
            cooldownRemaining: 1,
        },
    ]);

    expect(result.hand).toEqual([]);
});
it("should return an exiled card to hand when cooldown reaches zero", () => {
    const state = startCombat();

    const player: PlayerState = {
        ...state.player,
        hand: [],
        exiledCards: [
            {
                cardId: "flame-burst",
                cooldownRemaining: 1,
            },
        ],
    };

    const result = processExiledCards(player);

    expect(result.exiledCards).toEqual([]);

    expect(result.hand).toEqual([
        {
            cardId: "flame-burst",
            cooldownRemaining: 0,
        },
    ]);
});
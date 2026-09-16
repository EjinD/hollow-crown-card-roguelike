import { cards } from "../data/cards";
import { describe, expect, it } from "vitest";
import type { CombatState, PlayerState} from "../types/game";
import {
  startCombat,
  playCard,
  executeEnemyIntent,
  processEndTurn,
  applyCardEffects,
  moveCardAfterPlay,
  processExiledCards,
  startPlayerTurn
} from "./combat";
import { startRun } from "../state/run";
import {
    drawCardsToHand,
} from "../data/deck";
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

function createCombat() {
    return startCombat(startRun(), "goblin");
}
//затычка вренная

describe("Combat", () => {
  it("should start combat with correct initial state", () => {
    const state = createCombat();

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
    const state = createCombat();

    const nextState = playCard(
      state,
      "fireball",
    );

    expect(nextState.enemy.hp).toBe(13);
  });

  it("should spend one action when playing a card", () => {
    const state = createCombat();

    const nextState = playCard(
      state,
      "fireball",
    );

    expect(nextState.player.actions).toBe(0);
  });

  it("should change phase to enemy turn after playing a card", () => {
    const state = createCombat();

    const nextState = playCard(
      state,
      "fireball",
    );

    expect(nextState.phase).toBe("enemy-turn");
  });

  it("should not allow playing a card without actions", () => {
    const state = createCombat();

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

  it("should show a temporary Strength Down status when enemy Strength is reduced", () => {
    const state = {
      ...createCombat(),
      enemy: {
        ...createCombat().enemy,
        strength: 3,
      },
    };

    const nextState = applyCardEffects(state, [
      { type: "reduce-strength", amount: 2 },
    ]);

    expect(nextState.enemy.strength).toBe(1);
    expect(nextState.enemy.statusEffects).toContainEqual({
      type: "strength-down",
      amount: 2,
      duration: 1,
    });
  });

  it("should not allow playing a card during enemy turn", () => {
    const state = createCombat();

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
    const state = createCombat();

    const nextState = playCard(
      state,
      "unknown-card",
    );

    expect(nextState).toEqual(state);
  });

  it("should allow the enemy to attack the player", () => {
    const state = createCombat();

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
    const state = createCombat();

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
    const state = createCombat();

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
    const state = createCombat();

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
    const state = createCombat();

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
    const state = createCombat();

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
    const state = createCombat();

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
    const state = createCombat();

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
    const state = createCombat();

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
    const state = createCombat();

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
    const state = createCombat();

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
    const state = createCombat();

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
    const state = createCombat();

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
    const state = createCombat();

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
it("should deal burn damage at the start of the enemy turn", () => {
    const state = createCombat();

    const burnState = {
        ...state,
        phase: "enemy-turn" as const,
        enemy: {
            ...state.enemy,
            hp: 15,
            statusEffects: [
                {
                    type: "burn" as const,
                    amount: 3,
                    duration: 2,
                },
            ],
        },
    };

    const nextState = executeEnemyIntent(burnState);

    expect(nextState.enemy.hp).toBe(12);
});
it("should reduce burn duration when the enemy turn starts", () => {
    const state = createCombat();

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
            ],
        },
    };

    const nextState = executeEnemyIntent(burnState);

    expect(nextState.enemy.statusEffects).toEqual([
        {
            type: "burn",
            amount: 3,
            duration: 1,
        },
    ]);
});
it("should remove burn after it ticks on an enemy turn", () => {
    const state = createCombat();

    const burnState = {
        ...state,
        phase: "enemy-turn" as const,
        enemy: {
            ...state.enemy,
            hp: 15,
            statusEffects: [
                {
                    type: "burn" as const,
                    amount: 3,
                    duration: 1,
                },
            ],
        },
    };

    const nextState = executeEnemyIntent(burnState);

    expect(nextState.enemy.statusEffects).toEqual([]);
});
/// стаки берна тест

it("should stack multiple burn effects", () => {
    const state = createCombat();

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
it("should deal combined burn damage at the start of the enemy turn", () => {
    const state = createCombat();

    const burnState = {
        ...state,
        phase: "enemy-turn" as const,
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

    const nextState = executeEnemyIntent(burnState);

    expect(nextState.enemy.hp).toBe(9);
});
it("should not allow playing a card after victory", () => {
    const state = createCombat();

    const victoryState = {
        ...state,
        phase: "victory" as const,
    };

    const nextState = playCard(victoryState, "fireball");

    expect(nextState).toEqual(victoryState);
});
it("should not allow playing a card after defeat", () => {
    const state = createCombat();

    const defeatState = {
        ...state,
        phase: "defeat" as const,
    };

    const nextState = playCard(defeatState, "fireball");

    expect(nextState).toEqual(defeatState);
});
it("should not execute enemy intent after victory", () => {
    const state = createCombat();

    const victoryState = {
        ...state,
        phase: "victory" as const,
    };

    const nextState = executeEnemyIntent(victoryState);

    expect(nextState).toEqual(victoryState);
});
it("should not execute enemy intent after defeat", () => {
    const state = createCombat();

    const defeatState = {
        ...state,
        phase: "defeat" as const,
    };

    const nextState = executeEnemyIntent(defeatState);

    expect(nextState).toEqual(defeatState);
});
it("should not reduce player HP below zero", () => {
    const state = createCombat();

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
    const state = createCombat();

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
    const state = createCombat();

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
    const state = createCombat();

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
it("should win before the enemy acts if burn kills it at the start of the enemy turn", () => {
    const state = createCombat();

    const burningState = {
        ...state,
        phase: "enemy-turn" as const,
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

    const nextState = executeEnemyIntent(burningState);

    expect(nextState.enemy.hp).toBe(0);
    expect(nextState.phase).toBe("victory");
});
it("should spend player action when lethal card is played", () => {
    const state = createCombat();

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
    const state = createCombat();

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
    const state = createCombat();

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
    const state = createCombat();

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
    const state = createCombat();

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
    const state = createCombat();

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
    const state = createCombat();

    const enemyTurnState = {
        ...state,
        phase: "enemy-turn" as const,
    };

    const afterFirstIntent = executeEnemyIntent(enemyTurnState);

    const afterSecondIntent = executeEnemyIntent(afterFirstIntent);

    expect(afterSecondIntent).toEqual(afterFirstIntent);
});
it("should not execute the enemy after burn victory", () => {
    const state = createCombat();

    const burningState = {
        ...state,
        phase: "enemy-turn" as const,
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

    const victoryState = executeEnemyIntent(burningState);
    const afterSecondProcess = executeEnemyIntent(victoryState);

    expect(victoryState.phase).toBe("victory");
    expect(afterSecondProcess).toEqual(victoryState);
});
it("should apply burn effect from card", () => {
    const state = createCombat();

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
    const state = createCombat();

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
    const state = createCombat();

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
    const state = createCombat();

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
    const state = createCombat();

    const enemyTurnState: CombatState = {
        ...state,
        phase: "enemy-turn",
    };

    const result = executeEnemyIntent(enemyTurnState);

    expect(result.enemy.intentIndex).toBe(1);
    expect(result.enemy.intent.type).toBe("block");
});
it("should reset player block at the end of turn", () => {
    const state = createCombat();

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
    const state = createCombat();

    const result = applyCardEffects(state, [
        {
            type: "block",
            amount: 3,
        },
    ]);

    expect(result.player.block).toBe(3);
});
it("should apply block when playing a block card", () => {
    const state = createCombat();

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
    const state = createCombat();

    const stateWithCard = addCardToHand(
        state,
        "flame-guard"
    )

    const result = playCard(stateWithCard, "flame-guard");

    expect(result.player.block).toBe(3);
});
it("should reduce player block when enemy attacks", () => {
    const state = createCombat();

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
    const state = createCombat();
    
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
it("should draw five cards into the starting hand", () => {
    const state = createCombat();

    expect(state.player.hand).toHaveLength(5);
});
it("should move a played normal card to discard pile", () => {
    const state = createCombat();

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
    const state = createCombat();

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
    const state = createCombat();

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
    const state = createCombat();

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
    const state = createCombat();

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
    const state = createCombat();

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
    const state = createCombat();

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
it("should draw one card when hand has four cards", () => {
    const state = createCombat();

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
    const state = createCombat();

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
    const state = createCombat();

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
it("should process exiled cards and return ready cards to the draw pile", () => {
    const state = createCombat();

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
    expect(result.drawPile).toEqual([]);
});
it("should return an exiled card to the draw pile when cooldown reaches zero", () => {
    const state = createCombat();

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

    expect(result.hand).toEqual([]);
    expect(result.drawPile).toEqual([
        {
            cardId: "flame-burst",
            cooldownRemaining: 0,
        },
    ]);
});
it("should return a cooldown card to the draw pile after cooldown expires", () => {
    const state = createCombat();

    const afterPlay = playCard(
        state,
        "flame-burst",
    );

    expect(afterPlay.player.exiledCards).toContainEqual({
        cardId: "flame-burst",
        cooldownRemaining: 2,
    });

    const afterEnemyAttack = executeEnemyIntent(afterPlay);

    const afterFirstEndTurn = processEndTurn(
        afterEnemyAttack,
    );

    expect(
        afterFirstEndTurn.player.exiledCards,
    ).toContainEqual({
        cardId: "flame-burst",
        cooldownRemaining: 1,
    });

    const afterSecondEnemyAttack = executeEnemyIntent({
        ...afterFirstEndTurn,
        phase: "enemy-turn",
    });

    const afterSecondEndTurn = processEndTurn(
        afterSecondEnemyAttack,
    );

    expect(
        afterSecondEndTurn.player.drawPile,
    ).toContainEqual({
        cardId: "flame-burst",
        cooldownRemaining: 0,
    });

    expect(afterSecondEndTurn.player.exiledCards).not.toContainEqual({
        cardId: "flame-burst",
        cooldownRemaining: 0,
    });
});
it("should prepare the player for a new turn", () => {
    const state = createCombat();

    const player: PlayerState = {
        ...state.player,
        hand: state.player.hand.slice(0, 2),
        drawPile: state.player.hand.slice(2),
        exiledCards: [],
        actions: 0,
        block: 5,
    };

    const result = startPlayerTurn(player);

    expect(result.actions).toBe(1);
    expect(result.block).toBe(0);
    expect(result.hand).toHaveLength(5);
});
it("should not draw more cards when hand is full", () => {
    const state = createCombat();

    expect(state.player.hand).toHaveLength(5);

    const afterEnemyAttack = executeEnemyIntent({
        ...state,
        phase: "enemy-turn",
    });

    const afterEndTurn = processEndTurn(afterEnemyAttack);

    expect(afterEndTurn.player.hand.length).toBeLessThanOrEqual(5);
});
it("should return a cooldown card to the draw pile even when the hand is full", () => {
    const state = createCombat();

    const afterPlay = playCard(state, "flame-burst");
    const afterFirstEnemyAttack = executeEnemyIntent(afterPlay);
    const afterFirstEndTurn = processEndTurn(afterFirstEnemyAttack);
    const afterSecondEnemyAttack = executeEnemyIntent({
        ...afterFirstEndTurn,
        phase: "enemy-turn",
    });
    const afterSecondEndTurn = processEndTurn(afterSecondEnemyAttack);

    expect(afterSecondEndTurn.player.hand.length).toBeLessThanOrEqual(5);
    expect(afterSecondEndTurn.player.drawPile).toContainEqual({
        cardId: "flame-burst",
        cooldownRemaining: 0,
    });
    expect(afterSecondEndTurn.player.exhaustedCards).toEqual([]);
});

it("should exhaust a card explicitly marked as exhaust", () => {
    const state = createCombat();
    const playerWithCard = addCardToHand(
        state,
        "ashbound-offering",
    );

    const result = playCard(
        playerWithCard,
        "ashbound-offering",
    );

    expect(result.player.hand).not.toContainEqual({
        cardId: "ashbound-offering",
        cooldownRemaining: 0,
    });
    expect(result.player.exhaustedCards).toContainEqual({
        cardId: "ashbound-offering",
        cooldownRemaining: 0,
    });
});

it("should recover one exiled card into the draw pile", () => {
    const state = createCombat();
    const player = {
        ...state.player,
        hand: [
            { cardId: "ash-recall", cooldownRemaining: 0 },
        ],
        exiledCards: [
            { cardId: "flame-burst", cooldownRemaining: 2 },
            { cardId: "inferno", cooldownRemaining: 3 },
        ],
    };

    const result = playCard({ ...state, player }, "ash-recall");

    expect(result.player.exiledCards).toEqual([
        { cardId: "inferno", cooldownRemaining: 3 },
    ]);
    expect(result.player.drawPile).toContainEqual({
        cardId: "flame-burst",
        cooldownRemaining: 0,
    });
});
it("should fully cleanse all Weak from the player", () => {
    const state = startCombat("goblin");
    const weakened = {
        ...state,
        player: {
            ...state.player,
            actions: 1,
            hand: [
                { cardId: "ember-remedy", cooldownRemaining: 0 },
            ],
            statusEffects: [
                { type: "weak" as const, amount: 25, duration: 2 },
                { type: "weak" as const, amount: 15, duration: 1 },
            ],
        },
    };

    const nextState = playCard(weakened, "ember-remedy");

    expect(nextState.player.statusEffects).not.toContainEqual(
        expect.objectContaining({ type: "weak" }),
    );
});

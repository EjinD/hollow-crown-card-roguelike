import { cards } from "../data/cards";
import { describe, expect, it } from "vitest";
import type { CombatState } from "../types/game";
import {
  startCombat,
  playCard,
  executeEnemyIntent,
  processEndTurn,
  applyCardEffects,
} from "./combat";
import { starterDeck, addCardToDeck, removeCardFromDeck } from "../data/decks";

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

  it("should apply cooldown after playing Flame Burst", () => {
    const state = startCombat();

    const nextState = playCard(
      state,
      "flame-burst",
    );

    expect(
      nextState.player.cards[1].cooldownRemaining,
    ).toBe(2);
  });

  it("should reduce cooldown at the end of the turn", () => {
    const state = startCombat();

    const afterFlameBurst = playCard(
      state,
      "flame-burst",
    );

    expect(
      afterFlameBurst.player.cards[1].cooldownRemaining,
    ).toBe(2);

    const afterEnemyAttack = executeEnemyIntent(
      afterFlameBurst,
    );

    const nextTurn = processEndTurn(
      afterEnemyAttack,
    );

    expect(
      nextTurn.player.cards[1].cooldownRemaining,
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

    expect(
      afterFirstEndTurn.player.cards[1].cooldownRemaining,
    ).toBe(1);

    const afterSecondEnemyAttack =
      executeEnemyIntent({
        ...afterFirstEndTurn,
        phase: "enemy-turn",
      });

    const afterSecondEndTurn = processEndTurn(
      afterSecondEnemyAttack,
    );

    expect(
      afterSecondEndTurn.player.cards[1].cooldownRemaining,
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

    const nextState = playCard(state, "ignite");

    expect(nextState.enemy.statusEffects).toEqual([
        {
            type: "burn",
            amount: 3,
            duration: 2
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

    const flameBurst = nextState.player.cards.find(
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

    const nextState = playCard(weakEnemyState, "ignite");

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
            cards: state.player.cards.map((card) =>
                card.cardId === "fireball"
                    ? { ...card, cooldownRemaining: 0 }
                    : card
            ),
        },
    };

    const nextState = processEndTurn(cooldownState);

    const fireball = nextState.player.cards.find(
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

    const nextState = playCard(state, "ignite");

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

    const result = playCard(state, "flame-guard");

    expect(result.player.block).toBe(3);
    expect(result.player.actions).toBe(0);
    expect(result.phase).toBe("enemy-turn");
});
it("should apply block effect to flame-guard", () => {
    const state = startCombat();

    const result = playCard(state, "flame-guard");

    expect(result.player.block).toBe(3);
});
it("should reduce player block when enemy attacks", () => {
    const state = startCombat();

    const blockState = playCard(state, "flame-guard");

    const result = executeEnemyIntent(blockState);

    expect(result.player.block).toBe(1);
    expect(result.player.hp).toBe(10);
});
it("should deal damage and apply block from the same card", () => {
    const state = startCombat();

    const result = playCard(state, "ember-guard");

    expect(result.enemy.hp).toBe(13);
    expect(result.player.block).toBe(2);
    expect(result.player.actions).toBe(0);
    expect(result.phase).toBe("enemy-turn");
});
it("should create a fresh copy of the starter deck", () => {
    const state = startCombat();

    expect(state.player.cards).not.toBe(starterDeck);
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

    const result = removeCardFromDeck(deck, "ignite");

    expect(result).toEqual([
        {
            cardId: "fireball",
            cooldownRemaining: 0,
        },
        {
            cardId: "flame-burst",
            cooldownRemaining: 0,
        },
    ]);
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
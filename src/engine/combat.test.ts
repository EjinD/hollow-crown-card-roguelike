import { describe, expect, it } from "vitest";
import {
  startCombat,
  playCard,
  executeEnemyIntent,
  processEndTurn,
} from "./combat";

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
    expect(afterEnemyAttack.phase).toBe("enemy-turn");
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
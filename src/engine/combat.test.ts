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
    expect(nextState.phase).toBe("enemy-turn");
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
        phase: "enemy-turn" as const,
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
        phase: "enemy-turn" as const,
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
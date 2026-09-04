import { describe, expect, it } from "vitest";
import { startCombat, playCard, executeEnemyIntent } from "./combat";

describe("Combat", () => {
  it("should allow the enemy to attack after the player plays a card", () => {
    const state = startCombat();

    const afterPlayerAttack = playCard(
      state,
      "fireball",
    );

    expect(afterPlayerAttack.enemy.hp).toBe(13);
    expect(afterPlayerAttack.player.actions).toBe(0);
    expect(afterPlayerAttack.phase).toBe("enemy-turn");

    const afterEnemyAttack = executeEnemyIntent(
      afterPlayerAttack,
    );

    expect(afterEnemyAttack.player.hp).toBe(8);
    expect(afterEnemyAttack.phase).toBe("player-turn");
  });
});
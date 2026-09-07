import type { EnemyDefinition } from "../types/game";

export const enemies: EnemyDefinition[] = [
  {
    id: "goblin",
    name: "Goblin",
    maxHp: 15,
    intents: [
      {
        type: "attack",
        damage: 2,
      },
      {
        type: "block",
        amount: 3,
      },
    ],
    reward: {
      gold: 10,
      cardChoices: ["flare", "kindle", "renewal-flame"],
    },
  },
  {
    id: "shield-goblin",
    name: "Shield goblin",
    maxHp: 15,
    intents: [
      {
        type: "block",
        amount: 3,
      },
      {
        type: "heal",
        amount: 2,
      },
    ],
    reward: {
      gold: 20,
      cardChoices: ["flare", "kindle", "renewal-flame"]
    }
  },
  {
    id: "war-goblin",
    name: "War Goblin",
    maxHp: 18,
    intents: [
      { type: "buff", amount: 1 },
      { type: "attack", damage: 3 },
      { type: "debuff", amount: 25, duration: 1 },
    ],
    reward: {
      gold: 25,
      cardChoices: ["flare", "kindle", "renewal-flame"]
    }
  },
];

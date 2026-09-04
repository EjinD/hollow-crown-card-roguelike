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
    ],
  },
];
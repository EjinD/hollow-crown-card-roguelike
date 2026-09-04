import type { EnemyDefinition } from "../types/game";
export const enemies: EnemyDefinition[] = [
    {
        id: "goblin",
        name: "Goblin",
        maxHp: 15,
        intents: [ 
            {
            type:"attack",
            damage: 2
        }
    ],
  },
];
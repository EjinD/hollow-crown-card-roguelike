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
      cardChoices: ["fireball",
        "ember-strike",
        "flame-guard",],
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
      gold: 15,
      cardChoices: [ "ember-wall",
        "ignite",
        "scorch",]
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
      gold: 20,
      cardChoices: ["flame-burst",
        "ember-guard",
        "fire-storm",]
    }
  },
  {
    id: "goblin-king",
    name: "Goblin King",
    maxHp: 30,
    lastFight: true,
    intents: [
        {
            type: "attack",
            damage: 4,
        },
        {
            type: "block",
            amount: 5,
        },
        {
            type: "buff",
            amount: 2,
        },
        {
            type: "attack",
            damage: 6,
        },
    ],
    reward: {
        gold: 50,
        cardChoices: [
                    "inferno",
                    "fire-storm",
                    "flame-burst",
        ],
    },
},
];

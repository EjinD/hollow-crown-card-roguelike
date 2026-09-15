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
            tier: "common",
        },
    },

    {
        id: "shield-goblin",
        name: "Shield Goblin",
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
            {
                type: "heal",
                amount: 2,
            },
        ],
        reward: {
            gold: 15,
            tier: "common",
        },
    },

    {
        id: "war-goblin",
        name: "War Goblin",
        maxHp: 18,
        intents: [
            {
                type: "buff",
                amount: 1,
            },
            {
                type: "attack",
                damage: 3,
            },
            {
                type: "debuff",
                amount: 25,
                duration: 1,
            },
        ],
        reward: {
            gold: 20,
            tier: "elite",
        },
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
            tier: "boss",
        },
    },
];

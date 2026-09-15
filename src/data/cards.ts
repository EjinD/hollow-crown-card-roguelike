import type { CardDefinition } from "../types/game";
export const cards: CardDefinition[] = [
    {
    id: "fireball",
    name: "Fireball",
    cooldown: 0,
    effects: [{ type: "damage", amount: 30 }],
},
{
    id: "flame-burst",
    name: "Flame Burst",
    cooldown: 2,
    effects: [{ type: "damage", amount: 5 }],
},
{
    id: "ember-strike",
    name: "Ember Strike",
    cooldown: 0,
    effects: [{ type: "damage", amount: 3 }],
},
{
    id: "inferno",
    name: "Inferno",
    cooldown: 3,
    effects: [{ type: "damage", amount: 7 }],
},
{
    id: "flame-guard",
    name: "Flame Guard",
    cooldown: 1,
    effects: [
        {
            type: "block",
            amount: 3,
        },
    ],
},
{
    id: "ember-wall",
    name: "Ember Wall",
    cooldown: 0,
    effects: [
        {
            type: "block",
            amount: 2,
        },
    ],
},
{
    id: "ember-guard",
    name: "Ember Guard",
    cooldown: 1,
    effects: [
        {
            type: "damage",
            amount: 2,
        },
        {
            type: "block",
            amount: 2,
        },
    ],
},
{
    id: "ignite",
    name: "Ignite",
    cooldown: 1,
    effects: [
        {
            type: "damage",
            amount: 1,
        },
        {
            type: "burn",
            amount: 3,
            duration: 2,
        },
    ],
},
{
    id: "scorch",
    name: "Scorch",
    cooldown: 0,
    effects: [
        {
            type: "damage",
            amount: 2,
        },
        {
            type: "burn",
            amount: 2,
            duration: 3,
        },
    ],
},
{
    id: "fire-storm",
    name: "Fire Storm",
    cooldown: 2,
    effects: [
        {
            type: "damage",
            amount: 4,
        },
        {
            type: "burn",
            amount: 3,
            duration: 2,
        },
    ],
},
]

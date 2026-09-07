import type { CardDefinition } from "../types/game";
export const cards: CardDefinition[] = [
    {
    id: "fireball",
    name: "Fireball",
    damage: 2,
    cooldown: 0,
},
{
    id: "flame-burst",
    name: "Flame Burst",
    damage: 5,
    cooldown: 2,
},
{
    id: "ember-strike",
    name: "Ember Strike",
    damage: 3,
    cooldown: 0,
},
{
    id: "inferno",
    name: "Inferno",
    damage: 7,
    cooldown: 3,
},
{
    id: "flame-guard",
    name: "Flame Guard",
    damage: 0,
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
    damage: 0,
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
    damage: 2,
    cooldown: 1,
    effects: [
        {
            type: "block",
            amount: 2,
        },
    ],
},
{
    id: "ignite",
    name: "Ignite",
    damage: 1,
    cooldown: 1,
    effects: [
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
    damage: 2,
    cooldown: 0,
    effects: [
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
    damage: 4,
    cooldown: 2,
    effects: [
        {
            type: "burn",
            amount: 3,
            duration: 2,
        },
    ],
},
]
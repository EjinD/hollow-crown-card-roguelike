import type { CardDefinition } from "../types/game";
export const cards: CardDefinition[] = [
    {
        id:"fireball",
        name: "Fireball",
        damage: 2,
        cooldown: 0,
    },
    {
        id: "flame-burst",
        name: "Flame burst",
        damage: 5,
        cooldown: 2,
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
                duration: 2
            }
        ]
    }, 
    {
        id: "flame-guard",
        name: "Flame guard",
        damage: 0,
        cooldown: 1,
        effects: [
            {
                type:"block",
                amount: 3,
            }
        ]
    }, {
        id: "ember-guard",
        name: "Ember guard",
        damage: 2,
        cooldown: 1,
        effects: [
            {
                type: "block",
                amount: 2,
            }
        ]
    }
]
import type { EventDefinition } from "../types/events";

export const events: EventDefinition[] = [
    {
        id: "corrupted-altar",
        name: "Corrupted Altar",
        subtitle: "The altar still remembers its god.",
        description:
            "Ash covers a black stone altar. Something beneath it whispers for a sacrifice.",
        choices: [
            {
                id: "sacrifice",
                label: "Offer Blood",
                description: "Lose 3 HP. Receive a random relic.",
                requirement: { type: "hp", amount: 4 },
                effects: [
                    { type: "lose-hp", amount: 3 },
                    { type: "random-relic" },
                ],
            },
            {
                id: "pray",
                label: "Kneel Before It",
                description: "Recover 4 HP, but surrender a random card.",
                effects: [
                    { type: "heal", amount: 4 },
                    { type: "remove-random-card" },
                ],
            },
            {
                id: "destroy",
                label: "Destroy the Altar",
                description: "Break the relic stone and take what is hidden beneath it.",
                effects: [{ type: "gain-gold", amount: 20 }],
            },
        ],
    },
    {
        id: "masked-merchant",
        name: "The Masked Merchant",
        subtitle: "A deal is still a deal.",
        description:
            "A silent merchant waits beside a dying lantern. Three paths to profit are offered, but none are free.",
        choices: [
            {
                id: "buy-card",
                label: "Buy a Card",
                description: "Pay 20 Gold and receive a random card.",
                requirement: { type: "gold", amount: 20 },
                effects: [
                    { type: "lose-gold", amount: 20 },
                    { type: "add-random-card" },
                ],
            },
            {
                id: "sell-card",
                label: "Sell a Card",
                description: "Lose a random card and receive 15 Gold.",
                requirement: { type: "deck-size", min: 11 },
                effects: [
                    { type: "remove-random-card" },
                    { type: "gain-gold", amount: 15 },
                ],
            },
            {
                id: "leave",
                label: "Walk Away",
                effects: [],
            },
        ],
    },
    {
        id: "whispering-fire",
        name: "Whispering Fire",
        subtitle: "The flame knows your name.",
        description:
            "A lone fire burns without fuel. Its voice promises warmth, wealth, or pain.",
        choices: [
            {
                id: "rest",
                label: "Rest by the Fire",
                description: "Recover 6 HP.",
                effects: [{ type: "heal", amount: 6 }],
            },
            {
                id: "feed",
                label: "Feed the Flame",
                description: "Lose 4 HP and gain 25 Gold.",
                requirement: { type: "hp", amount: 5 },
                effects: [
                    { type: "lose-hp", amount: 4 },
                    { type: "gain-gold", amount: 25 },
                ],
            },
            {
                id: "extinguish",
                label: "Extinguish It",
                description: "Take a random card from the dying flame.",
                effects: [{ type: "add-random-card" }],
            },
        ],
    },
    {
        id: "ash-mirror",
        name: "Mirror of Ash",
        subtitle: "The reflection is not yours.",
        description:
            "A cracked mirror shows another version of you, one that seems to know exactly what you fear.",
        choices: [
            {
                id: "break",
                label: "Break the Mirror",
                description: "Lose 2 HP and gain 20 Gold.",
                requirement: { type: "hp", amount: 3 },
                effects: [
                    { type: "lose-hp", amount: 2 },
                    { type: "gain-gold", amount: 20 },
                ],
            },
            {
                id: "touch",
                label: "Touch the Reflection",
                description: "Lose a random card and gain a random card.",
                requirement: { type: "deck-size", min: 11 },
                effects: [
                    { type: "remove-random-card" },
                    { type: "add-random-card" },
                ],
            },
            {
                id: "ignore",
                label: "Look Away",
                effects: [],
            },
        ],
    },
    {
        id: "captive-wanderer",
        name: "The Captive Wanderer",
        subtitle: "Not every prisoner is innocent.",
        description:
            "A wounded wanderer is chained beneath a ruined arch. He promises a reward if you set him free.",
        choices: [
            {
                id: "free",
                label: "Set Him Free",
                description: "Pay 10 Gold and receive a random card.",
                requirement: { type: "gold", amount: 10 },
                effects: [
                    { type: "lose-gold", amount: 10 },
                    { type: "add-random-card" },
                ],
            },
            {
                id: "rob",
                label: "Take His Possessions",
                description: "Gain 30 Gold and lose 3 HP.",
                requirement: { type: "hp", amount: 4 },
                effects: [
                    { type: "gain-gold", amount: 30 },
                    { type: "lose-hp", amount: 3 },
                ],
            },
            {
                id: "leave",
                label: "Leave Him",
                effects: [],
            },
        ],
    },
    {
        id: "three-chests",
        name: "Three Chests",
        subtitle: "Only one is waiting to be kind.",
        description:
            "Three chests stand in a silent chamber. Gold, power, and danger wait behind their locks.",
        choices: [
            {
                id: "gold",
                label: "Golden Chest",
                description: "Gain 35 Gold.",
                effects: [{ type: "gain-gold", amount: 35 }],
            },
            {
                id: "ember",
                label: "Ember Chest",
                description: "Receive a random card.",
                effects: [{ type: "add-random-card" }],
            },
            {
                id: "black",
                label: "Black Chest",
                description: "Lose 5 HP and receive a random relic.",
                requirement: { type: "hp", amount: 6 },
                effects: [
                    { type: "lose-hp", amount: 5 },
                    { type: "random-relic" },
                ],
            },
        ],
    },
    {
        id: "blood-fountain",
        name: "Blood Fountain",
        subtitle: "Thirst always has a price.",
        description:
            "A fountain runs with crimson water. The liquid smells of iron and old magic.",
        choices: [
            {
                id: "drink",
                label: "Drink",
                description: "Recover 8 HP.",
                effects: [{ type: "heal", amount: 8 }],
            },
            {
                id: "fill-vial",
                label: "Fill a Vial",
                description: "Gain 25 Gold.",
                effects: [{ type: "gain-gold", amount: 25 }],
            },
            {
                id: "smash",
                label: "Destroy the Fountain",
                description: "Gain 40 Gold, but lose 5 HP.",
                requirement: { type: "hp", amount: 6 },
                effects: [
                    { type: "gain-gold", amount: 40 },
                    { type: "lose-hp", amount: 5 },
                ],
            },
        ],
    },
    {
        id: "forgotten-forge",
        name: "Forgotten Forge",
        subtitle: "The anvil has been waiting.",
        description:
            "Ancient tools cover a dead smithy. A furnace still glows beneath the ash.",
        choices: [
            {
                id: "forge-card",
                label: "Forge a Card",
                description: "Receive a random card for 20 Gold.",
                requirement: { type: "gold", amount: 20 },
                effects: [
                    { type: "lose-gold", amount: 20 },
                    { type: "add-random-card" },
                ],
            },
            {
                id: "strip-card",
                label: "Break Down a Card",
                description: "Lose a random card and gain 30 Gold.",
                requirement: { type: "deck-size", min: 11 },
                effects: [
                    { type: "remove-random-card" },
                    { type: "gain-gold", amount: 30 },
                ],
            },
            {
                id: "rest",
                label: "Leave the Forge",
                effects: [],
            },
        ],
    },
    {
        id: "book-of-the-dead",
        name: "Book of the Dead",
        subtitle: "Some knowledge should remain buried.",
        description:
            "A chained tome lies open on a stone pedestal. Every page is written in a different hand.",
        choices: [
            {
                id: "read",
                label: "Read the Tome",
                description: "Gain a random card and lose 4 HP.",
                requirement: { type: "hp", amount: 5 },
                effects: [
                    { type: "add-random-card" },
                    { type: "lose-hp", amount: 4 },
                ],
            },
            {
                id: "burn",
                label: "Burn It",
                description: "Gain 25 Gold.",
                effects: [{ type: "gain-gold", amount: 25 }],
            },
            {
                id: "close",
                label: "Close the Book",
                effects: [],
            },
        ],
    },
    {
        id: "rift-of-ash",
        name: "Rift of Ash",
        subtitle: "Beyond it, something is breathing.",
        description:
            "A tear in the air reveals a place that does not belong to this world. The rift is unstable.",
        choices: [
            {
                id: "enter",
                label: "Reach Through",
                description: "Receive a random relic, but lose 6 HP.",
                requirement: { type: "hp", amount: 7 },
                effects: [
                    { type: "random-relic" },
                    { type: "lose-hp", amount: 6 },
                ],
            },
            {
                id: "seal",
                label: "Seal the Rift",
                description: "Gain 30 Gold.",
                effects: [{ type: "gain-gold", amount: 30 }],
            },
            {
                id: "observe",
                label: "Study It",
                description: "Gain a random card.",
                effects: [{ type: "add-random-card" }],
            },
        ],
    },
];

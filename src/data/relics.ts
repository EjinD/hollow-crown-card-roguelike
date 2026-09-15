import type {
    RelicDefinition,
} from "../types/relics";

export const relics: RelicDefinition[] = [
    {
        id: "molten-heart",
        name: "Molten Heart",
        description:
            "All Fire damage dealt by your spells is increased by 1.",
        rarity: "common",
        unlockLevel: 1,
        hooks: [
            "modify-damage",
        ],
    },

    {
        id: "warriors-ember",
        name: "Warrior's Ember",
        description:
            "Block gained from your spells is increased by 1.",
        rarity: "common",
        unlockLevel: 2,
        hooks: [
            "modify-block",
        ],
    },

    {
        id: "ashen-soul",
        name: "Ashen Soul",
        description:
            "Burn applied by your spells lasts 1 additional turn.",
        rarity: "uncommon",
        unlockLevel: 3,
        hooks: [
            "modify-burn-duration",
        ],
    },
];

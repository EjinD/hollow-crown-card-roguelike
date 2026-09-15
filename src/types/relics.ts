export type RelicRarity =
    | "common"
    | "uncommon"
    | "rare"
    | "legendary";

export type RelicHook =
    | "modify-damage"
    | "modify-burn-duration"
    | "modify-block";

export type RelicTarget =
    | "player"
    | "enemy";

export interface RelicDamageContext {
    source:
        | "card"
        | "status"
        | "relic";
    target: RelicTarget;
    damageType:
        | "fire"
        | "physical"
        | "other";
}

export interface RelicBurnContext {
    source:
        | "card"
        | "status";
    target: RelicTarget;
}

export interface RelicBlockContext {
    source:
        | "card"
        | "relic";
    target: RelicTarget;
}

export interface RelicDefinition {
    id: string;
    name: string;
    description: string;
    rarity: RelicRarity;
    unlockLevel: number;
    hooks: RelicHook[];
}

export interface RelicState {
    relicId: string;
}

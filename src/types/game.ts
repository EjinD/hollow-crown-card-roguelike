export type CombatPhase =
    | "player-turn"
    | "enemy-turn"
    | "end-turn"
    | "victory"
    | "defeat";

export type CardRarity =
    | "common"
    | "uncommon"
    | "rare"
    | "legendary";

export type CardEffect =
    | {
        type: "damage";
        amount: number;
    }
    | {
        type: "piercing-damage";
        amount: number;
    }
    | {
        type: "shatter";
        amount: number;
    }
    | {
        type: "burn";
        amount: number;
        duration: number;
    }
    | {
        type: "block";
        amount: number;
    }
    | {
        type: "gain-action";
        amount: number;
    }
    | {
        type: "draw";
        amount: number;
    }
    | {
        type: "heal";
        amount: number;
    }
    | {
        type: "reduce-strength";
        amount: number;
    }
    | {
        type: "cleanse-weak";
    }
    | {
        type: "damage-if-burn";
        amount: number;
        bonusDamage: number;
    }
    | {
        type: "damage-if-player-weak";
        amount: number;
        bonusDamage: number;
    }
    | {
        type: "recover-exiled";
        amount: number;
    }
    | {
        type: "recover-all-exiled";
    };

export type CardCategory =
    | "attack"
    | "skill"
    | "power";

export interface CardDefinition {
    id: string;
    name: string;
    rarity: CardRarity;
    category: CardCategory;
    cooldown: number;
    exhaust?: boolean;
    effects: CardEffect[];
}

export interface CardState {
    cardId: string;
    cooldownRemaining: number;
}

export interface StatusEffect {
    type:
        | "burn"
        | "weak"
        | "strength-down";
    amount: number;
    duration: number;
}

export interface PlayerState {
    hp: number;
    maxHp: number;
    baseActions: number;
    actions: number;
    statusEffects: StatusEffect[];
    block: number;

    relics: string[];

    drawPile: CardState[];
    hand: CardState[];
    exiledCards: CardState[];
    discardPile: CardState[];
    exhaustedCards: CardState[];
}

export type EnemyIntent =
    | {
        type: "attack";
        damage: number;
    }
    | {
        type: "attack-debuff";
        damage: number;
        amount: number;
        duration: number;
    }
    | {
        type: "attack-buff";
        damage: number;
        amount: number;
    }
    | {
        type: "drain";
        damage: number;
        heal: number;
    }
    | {
        type: "block";
        amount: number;
    }
    | {
        type: "block-buff";
        block: number;
        strength: number;
    }
    | {
        type: "heal";
        amount: number;
    }
    | {
        type: "buff";
        amount: number;
    }
    | {
        type: "debuff";
        amount: number;
        duration: number;
    };

export type RewardTier =
    | "common"
    | "elite"
    | "boss";

export interface EnemyRewardConfig {
    gold: number;
    tier: RewardTier;
}

export type EnemyArchetype =
    | "aggressive"
    | "defensive"
    | "caster"
    | "control"
    | "bruiser"
    | "boss";

export interface EnemyPhaseDefinition {
    name: string;
    threshold: number;
    intents: EnemyIntent[];
}

export interface EnemyDefinition {
    id: string;
    archetype: EnemyArchetype;
    name: string;
    maxHp: number;
    intents: EnemyIntent[];
    reward: EnemyRewardConfig;
    lastFight?: boolean;
    phases?: EnemyPhaseDefinition[];
}

export interface EnemyState {
    definitionId: string;
    hp: number;
    block: number;
    strength: number;
    intentIndex: number;
    intent: EnemyIntent;
    statusEffects: StatusEffect[];
    bossPhase?: number;
}

export interface CombatState {
    phase: CombatPhase;
    turn: number;
    player: PlayerState;
    enemy: EnemyState;
}

export interface CombatReward {
    gold: number;
    relicId?: string;
}

export interface ShopCardOffer {
    cardId: string;
    price: number;
    purchased: boolean;
}

export interface ShopRelicOffer {
    relicId: string;
    price: number;
    purchased: boolean;
}

export interface RunState {
    dungeonId: string;
    hp: number;
    maxHp: number;
    gold: number;
    deck: CardState[];
    baseActions: number;
    relics: string[];
    availableRelicIds: string[];
    upgrades: string[];
    pendingReward: CombatReward | null;
    map: MapState;
    status: RunStatus;
    result: RunResult | null;
}

export type MapNodeType =
    | "battle"
    | "elite"
    | "event"
    | "shop"
    | "rest"
    | "boss";

export interface MapNode {
    id: string;
    type: MapNodeType;
    enemyId?: string;
    eventId?: string;

    shopCardOffers?: ShopCardOffer[];
    shopRelicOffers?: ShopRelicOffer[];
    shopHealPrice?: number;
    shopHealPurchased?: boolean;
    shopRemoveCardPrice?: number;
    shopRemoveCardPurchased?: boolean;

    nextNodeIds: string[];
    completed: boolean;
}

export interface MapState {
    nodes: MapNode[];
    currentNodeId: string;
}

export type RunStatus =
    | "active"
    | "completed";

export type RunResult =
    | "victory"
    | "defeat";

export type EventId =
    | "corrupted-altar"
    | "masked-merchant"
    | "whispering-fire"
    | "ash-mirror"
    | "captive-wanderer"
    | "three-chests"
    | "blood-fountain"
    | "forgotten-forge"
    | "book-of-the-dead"
    | "rift-of-ash"
    | "ashen-toll"
    | "cinder-pilgrims"
    | "wardens-chains"
    | "smoldering-reliquary"
    | "remove-random-card";
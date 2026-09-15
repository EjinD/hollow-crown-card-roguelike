export type CombatPhase =
    | "player-turn"
    | "enemy-turn"
    | "end-turn"
    | "victory"
    | "defeat";

export type CardEffect =
    | {
        type: "damage";
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
    };

export interface CardDefinition {
    id: string;
    name: string;
    cooldown: number;
    effects: CardEffect[];
}

export interface CardState {
    cardId: string;
    cooldownRemaining: number;
}

export interface StatusEffect {
    type: "burn" | "weak";
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
        type: "block";
        amount: number;
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

export interface EnemyDefinition {
    id: string;
    name: string;
    maxHp: number;
    intents: EnemyIntent[];
    reward: CombatReward;
    lastFight?: boolean;
}

export interface EnemyState {
    definitionId: string;
    hp: number;
    block: number;
    strength: number;
    intentIndex: number;
    intent: EnemyIntent;
    statusEffects: StatusEffect[];
}

export interface CombatState {
    phase: CombatPhase;
    turn: number;
    player: PlayerState;
    enemy: EnemyState;
}

export interface CombatReward {
    gold: number;
    cardChoices: string[];
}

export interface ShopOffer {
    cardId: string;
    price: number;
    purchased: boolean;
}

export interface RunState {
    hp: number;
    maxHp: number;
    gold: number;
    deck: CardState[];
    baseActions: number;
    relics: string[];
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
    | "boss";

export interface MapNode {
    id: string;
    type: MapNodeType;
    enemyId?: string;
    eventId?: string;

    shopOffers?: ShopOffer[];
    shopHealPrice?: number;
    shopHealPurchased?: boolean;

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
    | "remove-random-card";
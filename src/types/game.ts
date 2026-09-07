export type CombatPhase = | "player-turn" | "enemy-turn" | "end-turn" | "victory" | "defeat";

export type CardEffect =
  | {
      type: "burn";
      amount: number;
      duration: number
    } | {
        type: "block",
        amount: number
    }

export interface CardDefinition {
    id: string;
    name: string;
    damage: number;
    cooldown: number;
    effects?: CardEffect[];
}
export interface CardState {
    cardId: string;
    cooldownRemaining: number;
}
export interface StatusEffect {
    type: "burn";
    amount: number;
    duration: number;
}
export interface PlayerState {
    hp: number;
    maxHp: number;
    actions: number;
    statusEffects: StatusEffect[];
    block: number;
    drawPile: CardState[];
    hand: CardState[];
    exiledCards: CardState[];
    discardPile: CardState[];
    exhaustedCards: CardState[];
}
export type EnemyIntent = | {
    type: "attack";
    damage: number;
} | {
    type: "block";
    amount: number;
}
export interface EnemyDefinition {
    id: string;
    name: string;
    maxHp: number;
    intents: EnemyIntent[]
}
export interface EnemyState {
  definitionId: string;
  hp: number;
  block: number;
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

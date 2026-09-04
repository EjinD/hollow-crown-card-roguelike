export type CombatPhase = | "player-turn" | "enemy-turn" | "victory" | "defeat";
export interface CardDefinition {
    id: string;
    name: string;
    damage: number;
    cooldown: number;
}
export interface CardState {
    cardId: string;
    cooldownRemaining: number;
}
export interface PlayerState {
    hp: number;
    maxHp: number;
    actions: number;
    cards: CardState[];
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
}
export interface CombatState {
  phase: CombatPhase;
  turn: number;
  player: PlayerState;
  enemy: EnemyState;
}
import type { CombatState } from "../types/game";
import { cards } from "../data/cards";

export function playCard(state: CombatState, cardId: string,):CombatState{
    if(state.phase !== "player-turn") {
        return state;
    }

    if (state.player.actions <= 0) {
        return state;
    }
    const card = cards.find((card) => card.id === cardId);

    if (!card) {
        return state
    }
    const newEnemyHp = Math.max(0, state.enemy.hp - card.damage);
    if (newEnemyHp === 0) {
        return {
            ...state, enemy: {
                ...state.enemy,
                hp: 0,
            }, phase: "victory"
        };
    }
    return {
        ...state, player: {
            ...state.player,
            actions: state.player.actions - 1,
        }, enemy: {
            ...state.enemy,
            hp: newEnemyHp,
        },
        phase: "enemy-turn"
    }

 } 
 
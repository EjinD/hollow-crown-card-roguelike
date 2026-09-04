import type { CombatState } from "../types/game";
import { cards } from "../data/cards";
import { enemies } from "../data/enemies";

export function startCombat(): CombatState {
    const enemy = enemies[0];
    const startingCard = cards[0];

    return {
        phase: "player-turn",
        turn: 1,

        player: {
            hp: 10,
            maxHp: 10,
            actions: 1,
            cards: [
                {
                    cardId: "fireball",
                    cooldownRemaining: 0,
                },
                {
                    cardId: "flame-burst",
                    cooldownRemaining: 0,
                },
            ],
        },

        enemy: {
            definitionId: enemy.id,
            hp: enemy.maxHp,
            block: 0,
            intentIndex: 0,
            intent: enemy.intents[0],
        },
    };
}

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
    const cardState = state.player.cards.find(
        (cardState) => cardState.cardId === cardId,
    );

    if(!cardState) {
        return state
    }
    if(cardState.cooldownRemaining > 0) {
        return state;
    }

    const newEnemyHp = Math.max(0, state.enemy.hp - card.damage);
    if (newEnemyHp === 0) {
        return {
            ...state, enemy: {
                ...state.enemy,
                hp: 0,
            }, phase: "victory"
        };
    };

    const updatedCards = state.player.cards.map((cardState) => {
        if (cardState.cardId !== cardId) {
            return cardState;
        }
        return {
            ...cardState, cooldownRemaining: card.cooldown,
        };
    }
);

    return {
        ...state,
         player: {
            ...state.player,
            actions: state.player.actions - 1,
            cards: updatedCards
        }, enemy: {
            ...state.enemy,
            hp: newEnemyHp,
        },
        phase: "enemy-turn"
    }

 } 
export function executeEnemyIntent(
  state: CombatState,
): CombatState {
  if (state.phase !== "enemy-turn") {
    return state;
  }

  const { intent } = state.enemy;

  if (intent.type === "attack") {
    const newPlayerHp = Math.max(
      0,
      state.player.hp - intent.damage,
    );

    if (newPlayerHp === 0) {
      return {
        ...state,
        player: {
          ...state.player,
          hp: 0,
        },
        phase: "defeat",
      };
    }

    return {
      ...state,
      player: {
        ...state.player,
        hp: newPlayerHp,
      },
      phase: "enemy-turn",
    };
  }

  if (intent.type === "block") {
    return {
      ...state,
      enemy: {
        ...state.enemy,
        block: state.enemy.block + intent.amount,
      },
      phase: "enemy-turn",
    };
  }

  return state;
};

export function processEndTurn(
    state: CombatState,
): CombatState {
    if (state.phase !== "enemy-turn") {
        return state;
    }

    const updatedCards = state.player.cards.map(
        (cardState) => ({
            ...cardState,
            cooldownRemaining: Math.max(
                0,
                cardState.cooldownRemaining - 1,
            ),
        }),
    );

    return {
        ...state,
        turn: state.turn + 1,
        player: {
            ...state.player,
            actions: 1,
            cards: updatedCards,
        },
        phase: "player-turn",
    };
}
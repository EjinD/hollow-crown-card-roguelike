import type { CardState } from "../types/game";
import { cards } from "./cards";

export const starterDeck: CardState[] = [
    {
        cardId: "fireball",
        cooldownRemaining: 0,
    },
    {
        cardId: "flame-burst",
        cooldownRemaining: 0,
    },
    {
        cardId: "ignite",
        cooldownRemaining: 0,
    },
    {
        cardId: "flame-guard",
        cooldownRemaining: 0,
    },
    {
        cardId: "ember-guard",
        cooldownRemaining: 0,
    },
];
export function addCardToDeck(
    deck: CardState[],
    cardId: string,
): CardState[] {
    const cardsExists = cards.some(
        (card) => card.id === cardId
    );
    if (!cardsExists) {
        return deck
    }

    return [
        ...deck,{cardId, cooldownRemaining: 0},
    ]
};

export function removeCardFromDeck(
    deck: CardState[],
    cardId: string
): CardState[] {
    const index = deck.findIndex(
        (card) => card.cardId === cardId
    );
    if (index === -1) {
        return deck;
    };
    return [
        ...deck.slice(0, index),
        ...deck.slice(index + 1)
    ]
}
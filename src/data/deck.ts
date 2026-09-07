import { MAX_DECK_SIZE, MIN_DECK_SIZE } from "../consts/game";
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
        cardId: "ember-strike",
        cooldownRemaining: 0,
    },
    {
        cardId: "inferno",
        cooldownRemaining: 0,
    },
    {
        cardId: "flame-guard",
        cooldownRemaining: 0,
    },
    {
        cardId: "ember-wall",
        cooldownRemaining: 0,
    },
    {
        cardId: "ember-guard",
        cooldownRemaining: 0,
    },
    {
        cardId: "ignite",
        cooldownRemaining: 0,
    },
    {
        cardId: "scorch",
        cooldownRemaining: 0,
    },
    {
        cardId: "fire-storm",
        cooldownRemaining: 0,
    },
];
export function addCardToDeck(
    deck: CardState[],
    cardId: string,
): CardState[] {
    if (deck.length >= MAX_DECK_SIZE) {
        return [...deck];
    }

    if (!cards.some((card) => card.id === cardId)) {
        return [...deck];
    }

    return [
        ...deck,
        {
            cardId,
            cooldownRemaining: 0,
        },
    ];
}

export function removeCardFromDeck(
    deck: CardState[],
    cardId: string,
): CardState[] {
    if (deck.length <= MIN_DECK_SIZE) {
        return [...deck];
    }

    const index = deck.findIndex(
        (card) => card.cardId === cardId,
    );

    if (index === -1) {
        return [...deck];
    }

    return [
        ...deck.slice(0, index),
        ...deck.slice(index + 1),
    ];
}

export function cloneDeck(deck: CardState[]): CardState[] {
    return deck.map((card) => ({...card}))
}
export function findCardInDeck(
    deck: CardState[],
    cardId: string
): CardState | undefined {
    return deck.find((card) => card.cardId === cardId)
}
export function drawCard(
    deck: CardState[],
): {
    card: CardState | undefined;
    remainingDeck: CardState[];
} {
    if(deck.length === 0) {
        return {
            card: undefined,
            remainingDeck: []
        }
    }
    const [card, ...remainingDeck] = deck;
    return {
        card,
        remainingDeck
    }
}
export function drawCards(
    deck: CardState[],
    count: number
) : {
        drawnCards: CardState[];
        remainingDeck: CardState[];
    } {
        const drawnCards = deck.slice(0, count);
        const remainingDeck = deck.slice(count);
        
        return {
            drawnCards,
            remainingDeck
        }
    }
    export function drawCardsToHand(
        hand: CardState[],
        drawPile: CardState[],
        count: number,
    ): {
        hand: CardState[];
        drawPile: CardState[];
    } {
        const { drawnCards, remainingDeck} = drawCards(
            drawPile,
            count,
        );
        return {
            hand: [
                ...hand,
                ...drawnCards,
            ],
            drawPile: remainingDeck
            
        }
    }
    export function shuffleDeck(
        deck: CardState[],
    ): CardState[] {
        const shuffled = [...deck];

        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            [shuffled[i], shuffled[j]] = [
                shuffled[j],
                shuffled[i],
            ];
        }
        return shuffled
    }
    export function recycleDiscardPile(
        drawPile: CardState[],
        discardPile: CardState[],
    ): {
        drawPile: CardState[];
        discardPile: CardState[];
    } {
        if (drawPile.length > 0) {
            return {
                drawPile,
                discardPile
            };
        }
            return {
                drawPile: shuffleDeck(discardPile),
                discardPile: []
            }
    }
    export function drawCardsWithRecycle(
        hand: CardState[],
        drawPile: CardState[],
        discardPile: CardState[],
        count: number
    ): {
        hand: CardState[];
        drawPile: CardState[],
        discardPile: CardState[]
    } {
        let currentDrawPile = [...drawPile];
        let currentDiscardPile = [...discardPile];
        let currentHand = [...hand];

         while (
        currentHand.length < hand.length + count
    ) {
        if (currentDrawPile.length === 0) {
            if (currentDiscardPile.length === 0) {
                break;
            }

            currentDrawPile = shuffleDeck(
                currentDiscardPile,
            );

            currentDiscardPile = [];
        }

        const card = currentDrawPile.shift();

        if (!card) {
            break;
        }

        currentHand.push(card);
    }

    return {
        hand: currentHand,
        drawPile: currentDrawPile,
        discardPile: currentDiscardPile,
    };
    }
 export function isValidDeck(
    deck: CardState[]
 ): boolean {
    return (deck.length >= MIN_DECK_SIZE && deck.length <= MAX_DECK_SIZE)
 }
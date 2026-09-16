import { cards } from "./cards";
import { relics } from "./relics";
import type { CardRarity, ShopCardOffer, ShopRelicOffer } from "../types/game";
import type { RelicRarity } from "../types/relics";
import type { CardState } from "../types/game";

const CARD_RARITY_WEIGHTS: Array<{ rarity: CardRarity; weight: number }> = [
    { rarity: "common", weight: 58 },
    { rarity: "uncommon", weight: 28 },
    { rarity: "rare", weight: 12 },
    { rarity: "legendary", weight: 2 },
];

export const SHOP_CARD_PRICE_BY_RARITY: Record<CardRarity, number> = {
    common: 40,
    uncommon: 55,
    rare: 80,
    legendary: 120,
};

export const SHOP_RELIC_PRICE_BY_RARITY: Record<RelicRarity, number> = {
    common: 70,
    uncommon: 100,
    rare: 130,
    legendary: 180,
};

export const SHOP_REMOVE_CARD_PRICE = 60;
export const SHOP_HEAL_PRICE = 20;

export function getShopHealAmount(maxHp: number): number {
    return Math.max(3, Math.ceil(maxHp * 0.25));
}

function weightedRandomRarity(): CardRarity {
    const totalWeight = CARD_RARITY_WEIGHTS.reduce(
        (sum, entry) => sum + entry.weight,
        0,
    );

    let roll = Math.random() * totalWeight;

    for (const entry of CARD_RARITY_WEIGHTS) {
        roll -= entry.weight;
        if (roll <= 0) {
            return entry.rarity;
        }
    }

    return "common";
}

function pickUnique<T>(items: T[], count: number): T[] {
    const pool = [...items];
    const result: T[] = [];

    while (pool.length > 0 && result.length < count) {
        const index = Math.floor(Math.random() * pool.length);
        const [item] = pool.splice(index, 1);
        if (item !== undefined) {
            result.push(item);
        }
    }

    return result;
}

export function createShopCardOffers(
    deck: CardState[],
): ShopCardOffer[] {
    const deckIds = new Set(
        deck.map((card) => card.cardId),
    );

    const available = cards.filter(
        (card) => !deckIds.has(card.id),
    );

    const picked: typeof cards[number][] = [];
    const remaining = [...available];

    for (let index = 0; index < 3; index += 1) {
        if (remaining.length === 0) {
            break;
        }

        const preferredRarity = weightedRandomRarity();
        const candidates = remaining.filter(
            (card) => card.rarity === preferredRarity,
        );

        const source =
            candidates.length > 0 ? candidates : remaining;
        const selected =
            source[Math.floor(Math.random() * source.length)];

        if (!selected) {
            break;
        }

        picked.push(selected);
        const removeIndex = remaining.findIndex(
            (card) => card.id === selected.id,
        );
        if (removeIndex >= 0) {
            remaining.splice(removeIndex, 1);
        }
    }

    return picked.map((card) => ({
        cardId: card.id,
        price: SHOP_CARD_PRICE_BY_RARITY[card.rarity],
        purchased: false,
    }));
}

export function createShopRelicOffers(
    availableRelicIds: string[],
): ShopRelicOffer[] {
    const availableRelics = availableRelicIds
        .map((id) => relics.find((relic) => relic.id === id))
        .filter(
            (relic): relic is typeof relics[number] => Boolean(relic),
        );

    const picked = pickUnique(availableRelics, 2);

    return picked.map((relic) => ({
        relicId: relic.id,
        price: SHOP_RELIC_PRICE_BY_RARITY[relic.rarity],
        purchased: false,
    }));
}

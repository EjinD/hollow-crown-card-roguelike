import { achievements } from "../data/achievements";
import { starterDeck } from "../data/deck";
import { cards } from "../data/cards";
import { relics } from "../data/relics";
import type { CardRarity, RunResult } from "../types/game";
import { MAX_DECK_SIZE, MIN_DECK_SIZE } from "../consts/game";
import type {
    AchievementState,
    CardPackOpenResult,
    HubUpgradeState,
    MetaProgressState,
} from "../types/meta";

const META_STORAGE_KEY =
    "the-hollow-crown-meta";

export const CARD_PACK_COST = 50;
export const CARD_PACK_SIZE = 5;

export const MAX_CARD_COPIES = 2;

export const CARD_DUST_BY_RARITY: Record<CardRarity, number> = {
    common: 10,
    uncommon: 25,
    rare: 75,
    legendary: 200,
};

export const CARD_CRAFT_COST_BY_RARITY: Record<CardRarity, number> = {
    common: 40,
    uncommon: 100,
    rare: 300,
    legendary: 800,
};

export const CARD_PACK_RARITY_WEIGHTS: Array<{
    rarity: CardRarity;
    weight: number;
}> = [
    { rarity: "common", weight: 68 },
    { rarity: "uncommon", weight: 25 },
    { rarity: "rare", weight: 6.5 },
    { rarity: "legendary", weight: 0.5 },
];

export const MAX_HP_UPGRADE_ID = "max-hp";
export const BASE_ACTIONS_UPGRADE_ID = "base-actions";

export const MAX_HP_UPGRADE_MAX_LEVEL = 5;
export const BASE_ACTIONS_UPGRADE_MAX_LEVEL = 1;

export const MAX_HP_PER_UPGRADE = 2;
export const MAX_HP_UPGRADE_BASE_COST = 75;
export const MAX_HP_UPGRADE_COST_STEP = 50;
export const BASE_ACTIONS_UPGRADE_COST = 300;

function createInitialAchievements(): AchievementState[] {
    return achievements.map((achievement) => ({
        id: achievement.id,
        unlocked: false,
        unlockedAt: null,
    }));
}

function createInitialUpgrades(): HubUpgradeState[] {
    return [
        { id: "max-hp", level: 0 },
        { id: "base-actions", level: 0 },
    ];
}

function createInitialCollection(): Record<string, number> {
    const collection: Record<string, number> = {};

    for (const cardState of starterDeck) {
        collection[cardState.cardId] =
            (collection[cardState.cardId] ?? 0) + 1;
    }

    return collection;
}

function getStarterDeckIds(): string[] {
    return starterDeck.map((card) => card.cardId);
}

function sanitizeSavedDeck(
    savedDeck: unknown,
    collection: Record<string, number>,
): string[] {
    if (!Array.isArray(savedDeck)) {
        return getStarterDeckIds();
    }

    const uniqueIds: string[] = [];

    for (const value of savedDeck) {
        if (typeof value !== "string") {
            continue;
        }

        if (uniqueIds.includes(value)) {
            continue;
        }

        if (!cards.some((card) => card.id === value)) {
            continue;
        }

        if ((collection[value] ?? 0) <= 0) {
            continue;
        }

        uniqueIds.push(value);
    }

    if (
        uniqueIds.length < MIN_DECK_SIZE ||
        uniqueIds.length > MAX_DECK_SIZE
    ) {
        return getStarterDeckIds();
    }

    return uniqueIds;
}

function getUpgradeProgressLevel(
    upgrades: HubUpgradeState[],
): number {
    const totalUpgradeLevels = upgrades.reduce(
        (total, upgrade) =>
            total + Math.max(0, upgrade.level),
        0,
    );

    return 1 + totalUpgradeLevels;
}

export function getHubProgressionLevel(
    state: MetaProgressState,
): number {
    return getUpgradeProgressLevel(
        state.upgrades,
    );
}

function getRelicIdsUnlockedAtLevel(
    level: number,
): string[] {
    return relics
        .filter(
            (relic) =>
                relic.unlockLevel <= level,
        )
        .map((relic) => relic.id);
}

export function getUnlockedRelicIds(
    state: MetaProgressState,
): string[] {
    const hubLevel =
        getHubProgressionLevel(state);

    return getRelicIdsUnlockedAtLevel(
        hubLevel,
    );
}

export function syncUnlockedRelics(
    state: MetaProgressState,
): MetaProgressState {
    const unlockedIds =
        getUnlockedRelicIds(state);

    const hasChanged =
        unlockedIds.length !==
            state.unlockedRelicIds.length ||
        unlockedIds.some(
            (id, index) =>
                state.unlockedRelicIds[index] !== id,
        );

    if (!hasChanged) {
        return state;
    }

    return {
        ...state,
        unlockedRelicIds: unlockedIds,
    };
}

export function createDefaultMetaProgress(): MetaProgressState {
    return {
        hubGold: 0,
        totalRuns: 0,
        victories: 0,
        defeats: 0,
        achievements:
            createInitialAchievements(),
        upgrades: createInitialUpgrades(),
        unlockedRelicIds: ["molten-heart"],
        cardCollection:
            createInitialCollection(),
        dust: 0,
        savedDeck: getStarterDeckIds(),
        completedDungeonIds: [],
    };
}

export function loadMetaProgress(): MetaProgressState {
    const fallback =
        createDefaultMetaProgress();

    try {
        const raw =
            localStorage.getItem(
                META_STORAGE_KEY,
            );

        if (!raw) {
            return fallback;
        }

        const parsed = JSON.parse(
            raw,
        ) as Partial<MetaProgressState>;

        const merged: MetaProgressState = {
            ...fallback,
            ...parsed,
            achievements:
                Array.isArray(
                    parsed.achievements,
                )
                    ? parsed.achievements
                    : fallback.achievements,
            upgrades:
                Array.isArray(
                    parsed.upgrades,
                )
                    ? parsed.upgrades
                    : fallback.upgrades,
            unlockedRelicIds:
                Array.isArray(
                    parsed.unlockedRelicIds,
                )
                    ? parsed.unlockedRelicIds
                    : fallback.unlockedRelicIds,
            cardCollection:
                parsed.cardCollection &&
                typeof parsed.cardCollection ===
                    "object"
                    ? parsed.cardCollection
                    : fallback.cardCollection,
            dust:
                typeof parsed.dust === "number"
                    ? Math.max(0, parsed.dust)
                    : fallback.dust,
            savedDeck: sanitizeSavedDeck(
                parsed.savedDeck,
                parsed.cardCollection &&
                typeof parsed.cardCollection === "object"
                    ? parsed.cardCollection
                    : fallback.cardCollection,
            ),
            completedDungeonIds:
                Array.isArray(parsed.completedDungeonIds)
                    ? parsed.completedDungeonIds.filter(
                          (id): id is string =>
                              typeof id === "string",
                      )
                    : fallback.completedDungeonIds,
        };

        const synced =
            syncUnlockedRelics(
                merged,
            );

        saveMetaProgress(synced);

        return synced;
    } catch {
        return fallback;
    }
}

export function saveMetaProgress(
    state: MetaProgressState,
): void {
    try {
        localStorage.setItem(
            META_STORAGE_KEY,
            JSON.stringify(state),
        );
    } catch {
        // Temporary localStorage persistence.
    }
}

function unlockAchievement(
    state: MetaProgressState,
    achievementId: string,
): MetaProgressState {
    const existing =
        state.achievements.find(
            (achievement) =>
                achievement.id ===
                achievementId,
        );

    if (!existing || existing.unlocked) {
        return state;
    }

    return {
        ...state,
        achievements:
            state.achievements.map(
                (achievement) =>
                    achievement.id ===
                    achievementId
                        ? {
                              ...achievement,
                              unlocked: true,
                              unlockedAt:
                                  Date.now(),
                          }
                        : achievement,
            ),
    };
}

export function getHubUpgradeLevel(
    state: MetaProgressState,
    upgradeId: string,
): number {
    return (
        state.upgrades.find(
            (upgrade) => upgrade.id === upgradeId,
        )?.level ?? 0
    );
}

export function getMaxHpUpgradeCost(
    level: number,
): number | null {
    if (level >= MAX_HP_UPGRADE_MAX_LEVEL) {
        return null;
    }

    return (
        MAX_HP_UPGRADE_BASE_COST +
        level * MAX_HP_UPGRADE_COST_STEP
    );
}

export function getHubUpgradeCost(
    upgradeId: string,
    level: number,
): number | null {
    if (upgradeId === MAX_HP_UPGRADE_ID) {
        return getMaxHpUpgradeCost(level);
    }

    if (upgradeId === BASE_ACTIONS_UPGRADE_ID) {
        return level >= BASE_ACTIONS_UPGRADE_MAX_LEVEL
            ? null
            : BASE_ACTIONS_UPGRADE_COST;
    }

    return null;
}

export function purchaseHubUpgrade(
    state: MetaProgressState,
    upgradeId: string,
): MetaProgressState | null {
    const currentLevel = getHubUpgradeLevel(
        state,
        upgradeId,
    );

    const cost = getHubUpgradeCost(
        upgradeId,
        currentLevel,
    );

    if (cost === null || state.hubGold < cost) {
        return null;
    }

    const found = state.upgrades.some(
        (upgrade) => upgrade.id === upgradeId,
    );

    const upgrades = found
        ? state.upgrades.map((upgrade) =>
              upgrade.id === upgradeId
                  ? {
                        ...upgrade,
                        level: upgrade.level + 1,
                    }
                  : upgrade,
          )
        : [
              ...state.upgrades,
              { id: upgradeId, level: 1 },
          ];

    const nextState = syncUnlockedRelics({
        ...state,
        hubGold: state.hubGold - cost,
        upgrades,
    });

    saveMetaProgress(nextState);
    return nextState;
}

export function completeRunInMetaProgress(
    state: MetaProgressState,
    result: RunResult,
    runGold: number,
    bossEnemyId?: string,
    dungeonId?: string,
): MetaProgressState {
    let nextState: MetaProgressState = {
        ...state,
        hubGold:
            state.hubGold +
            Math.max(0, runGold),
        totalRuns:
            state.totalRuns + 1,
        victories:
            result === "victory"
                ? state.victories + 1
                : state.victories,
        defeats:
            result === "defeat"
                ? state.defeats + 1
                : state.defeats,
    };

    if (result === "victory") {
        nextState = unlockAchievement(
            nextState,
            "first-descent",
        );
    }

    if (result === "victory" && dungeonId) {
        const completedDungeonIds = nextState.completedDungeonIds.includes(
            dungeonId,
        )
            ? nextState.completedDungeonIds
            : [
                  ...nextState.completedDungeonIds,
                  dungeonId,
              ];

        nextState = {
            ...nextState,
            completedDungeonIds,
        };
    }

    if (bossEnemyId) {
        const bossAchievement =
            achievements.find(
                (achievement) =>
                    achievement.type ===
                        "boss-defeat" &&
                    achievement.enemyId ===
                        bossEnemyId,
            );

        if (bossAchievement) {
            nextState = unlockAchievement(
                nextState,
                bossAchievement.id,
            );
        }
    }

    nextState = syncUnlockedRelics(
        nextState,
    );

    saveMetaProgress(nextState);
    return nextState;
}

export function spendHubGold(
    state: MetaProgressState,
    amount: number,
): MetaProgressState | null {
    if (
        amount <= 0 ||
        state.hubGold < amount
    ) {
        return null;
    }

    const nextState = {
        ...state,
        hubGold:
            state.hubGold - amount,
    };

    saveMetaProgress(nextState);
    return nextState;
}

function pickWeightedCardRarity(): CardRarity {
    const totalWeight = CARD_PACK_RARITY_WEIGHTS.reduce(
        (total, entry) => total + entry.weight,
        0,
    );

    let roll = Math.random() * totalWeight;

    for (const entry of CARD_PACK_RARITY_WEIGHTS) {
        roll -= entry.weight;
        if (roll < 0) {
            return entry.rarity;
        }
    }

    return "common";
}

function drawRandomCardByRarity(rarity: CardRarity) {
    const pool = cards.filter(
        (card) => card.rarity === rarity,
    );

    const fallbackPool = pool.length > 0
        ? pool
        : cards.filter((card) => card.rarity === "common");

    return fallbackPool[
        Math.floor(Math.random() * fallbackPool.length)
    ];
}

export function openCardPack(
    state: MetaProgressState,
): CardPackOpenResult | null {
    const paidState = spendHubGold(
        state,
        CARD_PACK_COST,
    );

    if (!paidState) {
        return null;
    }

    const openedCards: CardPackOpenResult["cards"] = [];
    const collection = {
        ...paidState.cardCollection,
    };
    let dustGained = 0;

    for (
        let index = 0;
        index < CARD_PACK_SIZE;
        index += 1
    ) {
        const rarity = pickWeightedCardRarity();
        const card = drawRandomCardByRarity(rarity);

        if (!card) {
            continue;
        }

        const currentCopies = collection[card.id] ?? 0;
        const isDuplicate = currentCopies >= MAX_CARD_COPIES;
        const cardDust = isDuplicate
            ? CARD_DUST_BY_RARITY[card.rarity]
            : 0;

        if (isDuplicate) {
            dustGained += cardDust;
        } else {
            collection[card.id] = currentCopies + 1;
        }

        openedCards.push({
            cardId: card.id,
            rarity: card.rarity,
            isDuplicate,
            dustGained: cardDust,
        });
    }

    const nextState: MetaProgressState = {
        ...paidState,
        cardCollection: collection,
        dust: paidState.dust + dustGained,
    };

    saveMetaProgress(nextState);

    return {
        state: nextState,
        cards: openedCards,
        dustGained,
    };
}

export function saveDeckToMeta(
    state: MetaProgressState,
    cardIds: string[],
): MetaProgressState | null {
    const uniqueIds = [...new Set(cardIds)];

    if (
        uniqueIds.length < MIN_DECK_SIZE ||
        uniqueIds.length > MAX_DECK_SIZE
    ) {
        return null;
    }

    const valid = uniqueIds.every((cardId) =>
        cards.some((card) => card.id === cardId) &&
        (state.cardCollection[cardId] ?? 0) > 0,
    );

    if (!valid) {
        return null;
    }

    const nextState: MetaProgressState = {
        ...state,
        savedDeck: uniqueIds,
    };

    saveMetaProgress(nextState);
    return nextState;
}

export function getCardCraftCost(cardId: string): number | null {
    const card = cards.find(
        (definition) => definition.id === cardId,
    );

    return card
        ? CARD_CRAFT_COST_BY_RARITY[card.rarity]
        : null;
}

export function craftCard(
    state: MetaProgressState,
    cardId: string,
): MetaProgressState | null {
    const card = cards.find(
        (definition) => definition.id === cardId,
    );

    if (!card) {
        return null;
    }

    const currentCopies =
        state.cardCollection[cardId] ?? 0;
    const cost =
        CARD_CRAFT_COST_BY_RARITY[card.rarity];

    if (
        currentCopies >= MAX_CARD_COPIES ||
        state.dust < cost
    ) {
        return null;
    }

    const nextState: MetaProgressState = {
        ...state,
        dust: state.dust - cost,
        cardCollection: {
            ...state.cardCollection,
            [cardId]: currentCopies + 1,
        },
    };

    saveMetaProgress(nextState);

    return nextState;
}

export function unlockRelic(
    state: MetaProgressState,
    relicId: string,
): MetaProgressState {
    if (
        !relics.some(
            (relic) =>
                relic.id === relicId,
        )
    ) {
        return state;
    }

    if (
        state.unlockedRelicIds.includes(
            relicId,
        )
    ) {
        return state;
    }

    const nextState = {
        ...state,
        unlockedRelicIds: [
            ...state.unlockedRelicIds,
            relicId,
        ],
    };

    saveMetaProgress(nextState);
    return nextState;
}

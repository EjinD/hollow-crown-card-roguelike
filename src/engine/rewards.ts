import { relics } from "../data/relics";
import type {
    CombatReward,
    EnemyRewardConfig,
} from "../types/game";

const RELIC_DROP_CHANCE = {
    common: 0.15,
    elite: 0.65,
    boss: 0,
} as const;

const RELIC_RARITY_WEIGHT = {
    common: 0.25,
    uncommon: 0.75,
    rare: 1,
    legendary: 1,
} as const;

function getUnlockedRelics(
    availableRelicIds: string[],
) {
    return relics.filter((relic) =>
        availableRelicIds.includes(
            relic.id,
        ),
    );
}

function rollRelic(
    reward: EnemyRewardConfig,
    availableRelicIds: string[],
): string | undefined {
    if (reward.tier === "boss") {
        return undefined;
    }

    if (
        Math.random() >=
        RELIC_DROP_CHANCE[
            reward.tier
        ]
    ) {
        return undefined;
    }

    const unlockedRelics =
        getUnlockedRelics(
            availableRelicIds,
        );

    if (unlockedRelics.length === 0) {
        return undefined;
    }

    const eligibleRelics =
        unlockedRelics.filter(
            (relic) =>
                reward.tier === "common"
                    ? relic.rarity ===
                      "common"
                    : relic.rarity ===
                          "common" ||
                      relic.rarity ===
                          "uncommon",
        );

    if (eligibleRelics.length === 0) {
        return undefined;
    }

    const weightedRelics =
        eligibleRelics.map(
            (relic) => ({
                relic,
                weight:
                    RELIC_RARITY_WEIGHT[
                        relic.rarity
                    ],
            }),
        );

    const totalWeight =
        weightedRelics.reduce(
            (sum, item) =>
                sum + item.weight,
            0,
        );

    let roll =
        Math.random() *
        totalWeight;

    for (const item of weightedRelics) {
        roll -= item.weight;

        if (roll <= 0) {
            return item.relic.id;
        }
    }

    return weightedRelics.at(-1)
        ?.relic.id;
}

export function createCombatReward(
    reward: EnemyRewardConfig,
    availableRelicIds: string[],
): CombatReward {
    return {
        gold: reward.gold,
        relicId: rollRelic(
            reward,
            availableRelicIds,
        ),
    };
}

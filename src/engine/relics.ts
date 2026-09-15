import type {
    RelicBlockContext,
    RelicBurnContext,
    RelicDamageContext,
} from "../types/relics";

import { relics } from "../data/relics";

function getPlayerRelics(
    relicIds: string[],
) {
    return relicIds
        .map((relicId) =>
            relics.find(
                (relic) =>
                    relic.id === relicId,
            ),
        )
        .filter(
            (
                relic,
            ): relic is (typeof relics)[number] =>
                relic !== undefined,
        );
}

export function modifyDamage(
    damage: number,
    relicIds: string[],
    context: RelicDamageContext,
): number {
    if (damage <= 0) {
        return damage;
    }

    let modifiedDamage = damage;

    const playerRelics =
        getPlayerRelics(relicIds);

    for (const relic of playerRelics) {
        if (
            relic.id ===
                "molten-heart" &&
            relic.hooks.includes(
                "modify-damage",
            ) &&
            context.source ===
                "card" &&
            context.target ===
                "enemy" &&
            context.damageType ===
                "fire"
        ) {
            modifiedDamage += 1;
        }
    }

    return modifiedDamage;
}

export function modifyBurnDuration(
    duration: number,
    relicIds: string[],
    context: RelicBurnContext,
): number {
    if (duration <= 0) {
        return duration;
    }

    let modifiedDuration =
        duration;

    const playerRelics =
        getPlayerRelics(relicIds);

    for (const relic of playerRelics) {
        if (
            relic.id ===
                "ashen-soul" &&
            relic.hooks.includes(
                "modify-burn-duration",
            ) &&
            context.source ===
                "card" &&
            context.target ===
                "enemy"
        ) {
            modifiedDuration += 1;
        }
    }

    return modifiedDuration;
}

export function modifyBlock(
    block: number,
    relicIds: string[],
    context: RelicBlockContext,
): number {
    if (block <= 0) {
        return block;
    }

    let modifiedBlock = block;

    const playerRelics =
        getPlayerRelics(relicIds);

    for (const relic of playerRelics) {
        if (
            relic.id ===
                "warriors-ember" &&
            relic.hooks.includes(
                "modify-block",
            ) &&
            context.source ===
                "card" &&
            context.target ===
                "player"
        ) {
            modifiedBlock += 1;
        }
    }

    return modifiedBlock;
}
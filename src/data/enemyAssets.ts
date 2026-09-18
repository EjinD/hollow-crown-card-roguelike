import type { EnemyState } from "../types/game";

export type EnemyAnimationState =
    | "idle"
    | "attack"
    | "hit"
    | "death"
    | "signature";

const enemyAssetModules = import.meta.glob(
    "../assets/characters/*/*.png",
    {
        eager: true,
        import: "default",
        query: "?url",
    },
) as Record<string, string>;

const enemyAssetsByKey: Record<string, string> = Object.fromEntries(
    Object.entries(enemyAssetModules).map(([path, url]) => {
        const parts = path.split("/");
        const folder = parts.at(-2) ?? "";
        const file = parts.at(-1) ?? "";
        const fileId = file.replace(/\.png$/i, "");

        return [`${folder}/${fileId}`, url];
    }),
);

/*
 * Gameplay IDs are intentionally kept stable because map/save data already
 * references them. A few legacy IDs use a different art folder name.
 * Direct ID matching wins, so this mapping can disappear naturally after
 * the folders are normalized later.
 */
const enemyAssetFolderAliases: Record<string, string> = {
    wolf: "ash-wolf",
};

function getFolder(enemyId: string): string {
    return enemyAssetFolderAliases[enemyId] ?? enemyId;
}

function getAsset(
    enemyId: string,
    suffix: string,
): string | undefined {
    const folder = getFolder(enemyId);

    return (
        enemyAssetsByKey[`${folder}/${folder}-${suffix}`] ??
        enemyAssetsByKey[`${folder}/${enemyId}-${suffix}`]
    );
}

export function getEnemyArtwork(
    enemyId: string,
    state: EnemyAnimationState,
    bossPhase?: number,
): string | undefined {
    const folder = getFolder(enemyId);

    if (
        enemyId === "ash-warden" &&
        state === "idle"
    ) {
        if (bossPhase === 2) {
            return (
                enemyAssetsByKey[
                    `${folder}/${folder}-phase3-idle`
                ] ??
                enemyAssetsByKey[
                    `${folder}/${folder}-idle`
                ]
            );
        }

        if (bossPhase === 1) {
            return (
                enemyAssetsByKey[
                    `${folder}/${folder}-phase2-idle`
                ] ??
                enemyAssetsByKey[
                    `${folder}/${folder}-idle`
                ]
            );
        }
    }

    if (state === "signature") {
        return (
            getAsset(enemyId, "signature") ??
            getAsset(enemyId, "attack")
        );
    }

    return (
        getAsset(enemyId, state) ??
        getAsset(enemyId, "idle")
    );
}

export function enemyHasSignature(
    enemyId: string,
): boolean {
    return Boolean(
        getAsset(enemyId, "signature"),
    );
}

export function getEnemyAnimationState(
    enemy: EnemyState,
    enemyAction: string | null,
    isEnemyAttacking: boolean,
    isDefeated: boolean,
    wasHit: boolean,
): EnemyAnimationState {
    if (isDefeated) {
        return "death";
    }

    if (wasHit) {
        return "hit";
    }

    if (!isEnemyAttacking || !enemyAction) {
        return "idle";
    }

    switch (enemyAction) {
        case "attack":
            return "attack";

        case "attack-debuff":
        case "attack-buff":
        case "drain":
        case "block":
        case "block-buff":
        case "heal":
        case "buff":
        case "debuff":
            return enemyHasSignature(
                enemy.definitionId,
            )
                ? "signature"
                : "attack";

        default:
            return "idle";
    }
}

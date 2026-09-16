import type { MetaProgressState } from "../types/meta";
import type { MapNodeType } from "../types/game";

export type DungeonLayout = "linear" | "branched";

export type DungeonUnlock =
    | { type: "always" }
    | { type: "dungeon-completed"; dungeonId: string }
    | { type: "hub-level"; level: number };

export interface DungeonFloorConfig {
    floor: number;
    nodeTypes: MapNodeType[];
}

export interface DungeonDefinition {
    id: string;
    name: string;
    subtitle: string;
    description: string;
    floorCount: number;
    layout: DungeonLayout;
    unlock: DungeonUnlock;
    bossEnemyId: string;
    themeLabel: string;
    floorConfigs?: DungeonFloorConfig[];
    eventPool?: string[];
    battlePools?: Array<{
        throughFloor: number;
        enemyIds: string[];
    }>;
    eliteEnemyIds?: string[];
}

export const dungeons: DungeonDefinition[] = [
    {
        id: "tutorial",
        name: "Tutorial Dungeon",
        subtitle: "Ruined Outpost",
        description:
            "Learn the foundations of combat, pathing, events, shops and rest sites.",
        floorCount: 6,
        layout: "linear",
        unlock: { type: "always" },
        bossEnemyId: "goblin-king",
        themeLabel: "ASHEN OUTPOST",
    },
    {
        id: "ashen-depths",
        name: "Ashen Depths",
        subtitle: "Forgotten Keep",
        description:
            "A deeper descent where the paths begin to branch and every choice costs something.",
        floorCount: 16,
        layout: "branched",
        unlock: {
            type: "dungeon-completed",
            dungeonId: "tutorial",
        },
        bossEnemyId: "ash-warden",
        themeLabel: "ASHEN DEPTHS",
        eventPool: [
            "ashen-toll",
            "cinder-pilgrims",
            "wardens-chains",
            "smoldering-reliquary",
            "corrupted-altar",
            "whispering-fire",
            "ash-mirror",
            "forgotten-forge",
            "rift-of-ash",
        ],
        floorConfigs: [
            { floor: 2, nodeTypes: ["battle", "event", "battle"] },
            { floor: 3, nodeTypes: ["battle", "battle", "event"] },
            { floor: 4, nodeTypes: ["battle", "shop", "event"] },
            { floor: 5, nodeTypes: ["elite", "battle", "event"] },
            { floor: 6, nodeTypes: ["battle", "event", "battle"] },
            { floor: 7, nodeTypes: ["rest", "battle", "event"] },
            { floor: 8, nodeTypes: ["shop", "battle", "event"] },
            { floor: 9, nodeTypes: ["elite", "battle", "battle"] },
            { floor: 10, nodeTypes: ["battle", "event", "rest"] },
            { floor: 11, nodeTypes: ["shop", "battle", "event"] },
            { floor: 12, nodeTypes: ["battle", "event", "battle"] },
            { floor: 13, nodeTypes: ["elite", "shop", "battle"] },
            { floor: 14, nodeTypes: ["rest", "event", "battle"] },
            { floor: 15, nodeTypes: ["shop", "elite", "battle"] },
        ],
        battlePools: [
            { throughFloor: 2, enemyIds: ["goblin", "shield-goblin", "wolf"] },
            { throughFloor: 5, enemyIds: ["shield-goblin", "wolf", "spider", "cultist"] },
            { throughFloor: 9, enemyIds: ["wolf", "spider", "cultist", "knight"] },
            { throughFloor: 12, enemyIds: ["spider", "cultist", "knight", "mage"] },
            { throughFloor: 15, enemyIds: ["cultist", "knight", "mage", "spider", "wolf"] },
        ],
        eliteEnemyIds: ["war-goblin", "dark-knight", "ember-witch", "demon"],
    },
    {
        id: "crown-of-bone",
        name: "Crown of Bone",
        subtitle: "Undead Catacombs",
        description:
            "A suffocating labyrinth where the dead guard paths that were never meant to be found.",
        floorCount: 16,
        layout: "branched",
        unlock: {
            type: "hub-level",
            level: 5,
        },
        bossEnemyId: "goblin-king",
        themeLabel: "CROWN OF BONE",
    },
    {
        id: "black-spire",
        name: "The Black Spire",
        subtitle: "Abyssal Realm",
        description:
            "The deepest known descent. Light fades here, and the routes become deliberately hostile.",
        floorCount: 16,
        layout: "branched",
        unlock: {
            type: "hub-level",
            level: 10,
        },
        bossEnemyId: "goblin-king",
        themeLabel: "THE BLACK SPIRE",
    },
];

export function getDungeonById(
    dungeonId: string,
): DungeonDefinition | undefined {
    return dungeons.find(
        (dungeon) => dungeon.id === dungeonId,
    );
}

export function isDungeonUnlocked(
    dungeon: DungeonDefinition,
    meta: MetaProgressState,
): boolean {
    switch (dungeon.unlock.type) {
        case "always":
            return true;

        case "dungeon-completed":
            return meta.completedDungeonIds.includes(
                dungeon.unlock.dungeonId,
            );

        case "hub-level":
            return getMetaLevel(meta) >= dungeon.unlock.level;
    }
}

export function getUnlockedDungeonIds(
    meta: MetaProgressState,
): string[] {
    return dungeons
        .filter((dungeon) =>
            isDungeonUnlocked(dungeon, meta),
        )
        .map((dungeon) => dungeon.id);
}

function getMetaLevel(
    meta: MetaProgressState,
): number {
    return (
        1 +
        meta.upgrades.reduce(
            (total, upgrade) =>
                total + Math.max(0, upgrade.level),
            0,
        )
    );
}

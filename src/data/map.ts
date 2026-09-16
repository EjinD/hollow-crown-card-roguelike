import type {
    CardState,
    MapNode,
    MapNodeType,
    MapState,
} from "../types/game";
import {
    createShopCardOffers,
    createShopRelicOffers,
    SHOP_HEAL_PRICE,
    SHOP_REMOVE_CARD_PRICE,
} from "./shop";
import type { DungeonDefinition } from "./dungeons";

const EVENT_POOL = [
    "corrupted-altar",
    "masked-merchant",
    "whispering-fire",
    "ash-mirror",
    "captive-wanderer",
    "three-chests",
    "blood-fountain",
    "forgotten-forge",
    "book-of-the-dead",
    "rift-of-ash",
] as const;

const ELITE_ENEMY_POOL = [
    "war-goblin",
    "demon",
    "dark-knight",
    "ember-witch",
] as const;

const BATTLE_ENEMY_POOLS: Record<number, string[]> = {
    1: ["goblin"],
    2: ["goblin", "shield-goblin", "wolf"],
    3: ["shield-goblin", "wolf", "spider", "cultist"],
    4: ["spider", "cultist", "knight", "mage"],
    5: ["wolf", "spider", "cultist", "knight", "mage"],
};

function getRandomEnemyId(enemyIds: string[]): string {
    return enemyIds[
        Math.floor(Math.random() * enemyIds.length)
    ];
}

function shuffle<T>(items: T[]): T[] {
    const result = [...items];

    for (let index = result.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(
            Math.random() * (index + 1),
        );

        [result[index], result[randomIndex]] = [
            result[randomIndex],
            result[index],
        ];
    }

    return result;
}

function createLayer(
    floor: number,
    types: MapNodeType[],
): MapNode[] {
    return types.map((type, index) => ({
        id: `floor-${floor}-node-${index}`,
        type,
        nextNodeIds: [],
        completed: false,
    }));
}

function connectLayers(
    currentLayer: MapNode[],
    nextLayer: MapNode[],
): void {
    if (!currentLayer.length || !nextLayer.length) {
        return;
    }

    // First guarantee that every node on the current floor has a way forward.
    // This is especially important when the next floor has a single node
    // (for example the final Boss): every possible route must be able to reach it.
    currentLayer.forEach((node, index) => {
        const nextIndex =
            Math.floor(
                (index * nextLayer.length) / currentLayer.length,
            );
        const nextNode =
            nextLayer[Math.min(nextIndex, nextLayer.length - 1)];

        if (!node.nextNodeIds.includes(nextNode.id)) {
            node.nextNodeIds.push(nextNode.id);
        }
    });

    // Then guarantee that every node on the next floor has an incoming path.
    nextLayer.forEach((nextNode, index) => {
        const sourceIndex =
            Math.floor(
                (index * currentLayer.length) / nextLayer.length,
            );
        const source =
            currentLayer[Math.min(sourceIndex, currentLayer.length - 1)];

        if (!source.nextNodeIds.includes(nextNode.id)) {
            source.nextNodeIds.push(nextNode.id);
        }
    });

    // Add a few optional cross-links so the map feels branched instead of
    // looking like a rigid grid, while keeping the guaranteed routes above.
    currentLayer.forEach((node) => {
        if (nextLayer.length <= 1) {
            return;
        }

        const candidates = nextLayer.filter(
            (candidate) => !node.nextNodeIds.includes(candidate.id),
        );

        if (!candidates.length || Math.random() > 0.45) {
            return;
        }

        const candidate =
            candidates[Math.floor(Math.random() * candidates.length)];

        node.nextNodeIds.push(candidate.id);
    });
}

function getBattlePoolForFloor(
    floor: number,
    dungeon: DungeonDefinition,
): string[] {
    const configuredPool = dungeon.battlePools?.find(
        (entry) => floor <= entry.throughFloor,
    );

    if (configuredPool) {
        return configuredPool.enemyIds;
    }

    if (floor <= 2) {
        return BATTLE_ENEMY_POOLS[1];
    }

    if (floor <= 4) {
        return BATTLE_ENEMY_POOLS[2];
    }

    if (floor <= 6) {
        return BATTLE_ENEMY_POOLS[3];
    }

    if (floor <= 10) {
        return BATTLE_ENEMY_POOLS[4];
    }

    return BATTLE_ENEMY_POOLS[5];
}

function getStandardFloorTypes(floor: number): MapNodeType[] {
    switch (floor) {
        case 2:
            return ["battle", "battle", "event"];
        case 3:
            return ["battle", "event", "shop"];
        case 4:
            return ["battle", "event", "rest"];
        case 5:
            return ["elite", "battle", "event"];
        case 6:
            return ["battle", "battle", "event"];
        case 7:
            return ["battle", "shop", "event"];
        case 8:
            return ["battle", "rest", "event"];
        case 9:
            return ["battle", "battle", "shop"];
        case 10:
            return ["elite", "battle", "event"];
        case 11:
            return ["battle", "rest", "event"];
        case 12:
            return ["battle", "event", "shop"];
        case 13:
            return ["battle", "battle", "rest"];
        case 14:
            return ["elite", "battle", "event"];
        case 15:
            return ["rest", "battle", "shop"];
        default:
            return ["battle", "battle", "event"];
    }
}

function assignBattleEnemies(
    nodes: MapNode[],
    floor: number,
    dungeon: DungeonDefinition,
): void {
    const pool = getBattlePoolForFloor(floor, dungeon);

    for (const node of nodes) {
        if (node.type === "battle") {
            node.enemyId = getRandomEnemyId(pool);
        }
    }
}

function assignNodeContent(
    nodes: MapNode[],
    deck: CardState[],
    availableRelicIds: string[],
    dungeon: DungeonDefinition,
): void {
    const eventIds = shuffle([...(dungeon.eventPool?.length ? dungeon.eventPool : EVENT_POOL)]);
    let eventIndex = 0;

    for (const node of nodes) {
        const floor = getFloorIndex(node.id);

        if (node.type === "battle") {
            assignBattleEnemies([node], floor, dungeon);
        }

        if (node.type === "elite") {
            const elitePool = dungeon.eliteEnemyIds?.length
                ? dungeon.eliteEnemyIds
                : ELITE_ENEMY_POOL;

            node.enemyId =
                elitePool[
                    Math.floor(Math.random() * elitePool.length)
                ];
        }

        if (node.type === "boss") {
            node.enemyId = dungeon.bossEnemyId;
        }

        if (node.type === "event") {
            node.eventId = eventIds[eventIndex % eventIds.length];
            eventIndex += 1;
        }

        if (node.type === "shop") {
            node.shopCardOffers = createShopCardOffers(deck);
            node.shopRelicOffers = createShopRelicOffers(availableRelicIds);
            node.shopHealPrice = SHOP_HEAL_PRICE;
            node.shopHealPurchased = false;
            node.shopRemoveCardPrice = SHOP_REMOVE_CARD_PRICE;
            node.shopRemoveCardPurchased = false;
        }
    }
}

export function getFloorIndex(nodeId: string): number {
    const match = nodeId.match(/^floor-(\d+)-/);
    return match ? Number(match[1]) : 0;
}

export function generateMap(
    deck: CardState[] = [],
    availableRelicIds: string[] = [],
    dungeon: DungeonDefinition,
): MapState {
    if (dungeon.layout === "linear") {
        const floorTypes: MapNodeType[][] = [
            ["battle"],
            ["battle"],
            ["event"],
            ["rest"],
            ["elite"],
            ["boss"],
        ];

        const layers = floorTypes.map((types, index) =>
            createLayer(index + 1, types),
        );

        for (let index = 0; index < layers.length - 1; index += 1) {
            connectLayers(layers[index], layers[index + 1]);
        }

        const nodes = layers.flat();
        assignNodeContent(nodes, deck, availableRelicIds, dungeon);

        return {
            currentNodeId: nodes[0].id,
            nodes,
        };
    }

    const layers: MapNode[][] = [];

    layers.push(createLayer(1, ["battle"]));

    for (let floor = 2; floor < dungeon.floorCount; floor += 1) {
        const configuredTypes = dungeon.floorConfigs?.find(
            (config) => config.floor === floor,
        )?.nodeTypes;

        const types = shuffle(
            configuredTypes ?? getStandardFloorTypes(floor),
        );

        layers.push(createLayer(floor, types));
    }

    layers.push(createLayer(dungeon.floorCount, ["boss"]));

    for (let index = 0; index < layers.length - 1; index += 1) {
        connectLayers(layers[index], layers[index + 1]);
    }

    const nodes = layers.flat();
    assignNodeContent(nodes, deck, availableRelicIds, dungeon);

    return {
        currentNodeId: layers[0][0].id,
        nodes,
    };
}

export function isValidMap(map: MapState): boolean {
    if (!map.nodes.length) {
        return false;
    }

    const nodeIds = new Set(map.nodes.map((node) => node.id));

    if (!nodeIds.has(map.currentNodeId)) {
        return false;
    }

    for (const node of map.nodes) {
        for (const nextNodeId of node.nextNodeIds) {
            if (!nodeIds.has(nextNodeId)) {
                return false;
            }
        }
    }

    return canReachBoss(map);
}

export function canReachBoss(map: MapState): boolean {
    const visited = new Set<string>();
    const queue = [map.currentNodeId];

    while (queue.length) {
        const currentNodeId = queue.shift();

        if (!currentNodeId || visited.has(currentNodeId)) {
            continue;
        }

        visited.add(currentNodeId);

        const currentNode = map.nodes.find(
            (node) => node.id === currentNodeId,
        );

        if (!currentNode) {
            continue;
        }

        if (currentNode.type === "boss") {
            return true;
        }

        queue.push(...currentNode.nextNodeIds);
    }

    return false;
}

import type {
    MapNode,
    MapNodeType,
    MapState,
} from "../types/game";

const BATTLE_ENEMY_POOLS: Record<number, string[]> = {
    1: ["goblin"],
    2: ["goblin", "shield-goblin"],
    3: ["shield-goblin", "war-goblin"],
    4: ["shield-goblin", "war-goblin"],
};

function randomInt(
    min: number,
    max: number,
): number {
    return Math.floor(
        Math.random() * (max - min + 1),
    ) + min;
}

function getRandomEnemyId(
    enemyIds: string[],
): string {
    const randomIndex = Math.floor(
        Math.random() * enemyIds.length,
    );

    return enemyIds[randomIndex];
}

function assignBattleEnemies(
    layer: MapNode[],
    enemyIds: string[],
): void {
    for (const node of layer) {
        if (node.type !== "battle") {
            continue;
        }

        node.enemyId = getRandomEnemyId(enemyIds);
    }
}


function createLayer(
    layerIndex: number,
    types: MapNodeType[],
): MapNode[] {
    return types.map((type, index) => ({
        id: `layer-${layerIndex}-node-${index}`,
        type,
        nextNodeIds: [],
        completed: false,
    }));
}

function connectLayers(
    currentLayer: MapNode[],
    nextLayer: MapNode[],
): void {
    if (
        currentLayer.length === 0 ||
        nextLayer.length === 0
    ) {
        return;
    }

    currentLayer.forEach(
        (node, index) => {
            const nextNode =
                nextLayer[index % nextLayer.length];

            node.nextNodeIds = [nextNode.id];
        },
    );

    for (const node of currentLayer) {
        if (nextLayer.length <= 1) {
            continue;
        }

        const additionalIndex = Math.floor(
            Math.random() * nextLayer.length,
        );

        const additionalNode =
            nextLayer[additionalIndex];

        if (
            !node.nextNodeIds.includes(
                additionalNode.id,
            )
        ) {
            node.nextNodeIds.push(
                additionalNode.id,
            );
        }
    }
}

function shuffleNodeTypes(
    types: MapNodeType[],
): MapNodeType[] {
    const shuffled = [...types];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(
            Math.random() * (i + 1),
        );

        [shuffled[i], shuffled[j]] = [
            shuffled[j],
            shuffled[i],
        ];
    }

    return shuffled;
}

export function generateMap(): MapState {
    const layer1 = createLayer(1, ["battle"]);
    const layer2Count = randomInt(2, 3);
    const layer3Count = randomInt(2, 3);
    const layer4Count = randomInt(2, 3);

     const layer2Types: MapNodeType[] = [
        "battle",
        "event",
        "shop",
    ];

    const layer3Types: MapNodeType[] = [
        "battle",
        "event",
        "elite",
    ];

    const layer4Types: MapNodeType[] = [
        "battle",
        "elite",
    ];

    const layer2 = createLayer(
    2,
    shuffleNodeTypes(layer2Types).slice(
        0,
        layer2Count,
    ),
    );

    const layer3 = createLayer(
    3,
    shuffleNodeTypes(layer3Types).slice(
        0,
        layer3Count,
    ),
    );

    const layer4 = createLayer(
    4,
    shuffleNodeTypes(layer4Types).slice(
        0,
        layer4Count,
    ),
);

    const layer5 = createLayer(5, [
        "boss",
    ]);

    assignBattleEnemies(
        layer1,
        BATTLE_ENEMY_POOLS[1],
    );

    assignBattleEnemies(
        layer2,
        BATTLE_ENEMY_POOLS[2],
    );

    assignBattleEnemies(
        layer3,
        BATTLE_ENEMY_POOLS[3],
    );

    assignBattleEnemies(
        layer4,
        BATTLE_ENEMY_POOLS[4],
    );

    connectLayers(layer1, layer2);
    connectLayers(layer2, layer3);
    connectLayers(layer3, layer4);
    connectLayers(layer4, layer5);

    const allNodes = [
        ...layer1,
        ...layer2,
        ...layer3,
        ...layer4,
        ...layer5,
    ];

    assignNodeContent(allNodes);

    return {
        currentNodeId: layer1[0].id,
        nodes: allNodes,
    };
}

function assignNodeContent(
    nodes: MapNode[],
): void {
    for (const node of nodes) {
        if (node.type === "elite") {
            node.enemyId = "war-goblin";
        }

        if (node.type === "boss") {
            node.enemyId = "goblin-king";
        }

        if (node.type === "event") {
            node.eventId = "remove-random-card";
        }
    }
}

export function isValidMap(
    map: MapState,
): boolean {
    if (map.nodes.length === 0) {
        return false;
    }

    const nodeIds = new Set(
        map.nodes.map((node) => node.id),
    );

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

export function canReachBoss(
    map: MapState,
): boolean {
    const startNode = map.nodes.find(
        (node) => node.id === map.currentNodeId,
    );

    if (!startNode) {
        return false;
    }

    const visited = new Set<string>();
    const queue = [startNode.id];

    while (queue.length > 0) {
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


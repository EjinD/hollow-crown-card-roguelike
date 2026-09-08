import type {
    MapNode,
    MapNodeType,
    MapState,
} from "../types/game";

const BATTLE_ENEMY_IDS = [
    "goblin",
    "shield-goblin",
];

export const initialMap: MapState = {
    currentNodeId: "node-1",

    nodes: [
        {
            id: "node-1",
            type: "battle",
            enemyId: "goblin",
            nextNodeIds: ["node-2", "node-3"],
        },
        {
            id: "node-2",
            type: "event",
            eventId: "remove-random-card",
            nextNodeIds: ["node-4"],
        },
        {
            id: "node-3",
            type: "shop",
            nextNodeIds: ["node-4"],
        },
        {
            id: "node-4",
            type: "elite",
            enemyId: "war-goblin",
            nextNodeIds: [],
        },
    ],
};

function getRandomBattleEnemyId(): string {
    const randomIndex = Math.floor(
        Math.random() * BATTLE_ENEMY_IDS.length,
    );

    return BATTLE_ENEMY_IDS[randomIndex];
}

function createNode(
    id: string,
    type: MapNodeType,
    nextNodeIds: string[],
    enemyId?: string,
    eventId?: string,
): MapNode {
    return {
        id,
        type,
        nextNodeIds,
        ...(enemyId && { enemyId }),
        ...(eventId && { eventId }),
    };
}

function createLayer(
    layerIndex: number,
    types: MapNodeType[],
): MapNode[] {
    return types.map((type, index) => ({
        id: `layer-${layerIndex}-node-${index}`,
        type,
        nextNodeIds: [],
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

export function generateMap(): MapState {
    const layer1 = createLayer(1, ["battle"]);

    const layer2 = createLayer(2, [
        "battle",
        "event",
        "shop",
    ]);

    const layer3 = createLayer(3, [
        "battle",
        "event",
        "elite",
    ]);

    const layer4 = createLayer(4, [
        "battle",
        "elite",
    ]);

    const layer5 = createLayer(5, [
        "boss",
    ]);

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
        if (node.type === "boss") {
            node.enemyId = "goblin-king";
        }

        if (node.type === "battle") {
            node.enemyId = getRandomBattleEnemyId();
        }

        if (node.type === "elite") {
            node.enemyId = "war-goblin";
        }

        if (node.type === "event") {
            node.eventId = "remove-random-card";
        }
    }
}
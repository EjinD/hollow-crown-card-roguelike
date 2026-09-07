import type { MapState } from "../types/game";

export const initialMap: MapState = {
    currentNodeId: "node-1",

    nodes: [
        {
            id: "node-1",
            type: "battle",
            enemyId: "goblin",
            nextNodeIds: ["node-2"],
        },
        {
            id: "node-2",
            type: "battle",
            enemyId: "shield-goblin",
            nextNodeIds: ["node-3"],
        },
        {
            id: "node-3",
            type: "elite",
            enemyId: "war-goblin",
            nextNodeIds: [],
        },
    ],
};
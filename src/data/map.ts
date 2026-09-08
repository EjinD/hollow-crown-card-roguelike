import type { MapState } from "../types/game";
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

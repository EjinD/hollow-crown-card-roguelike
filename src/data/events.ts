import type { EventId } from "../types/game";

export interface EventDefinition {
    id: EventId;
    name: string;
}

export const events: EventDefinition[] = [
    {
        id: "remove-random-card",
        name: "Burning Offering",
    },
];
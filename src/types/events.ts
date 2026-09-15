import type { EventId } from "./game";

export type EventRequirement =
    | {
          type: "gold";
          amount: number;
      }
    | {
          type: "hp";
          amount: number;
      }
    | {
          type: "deck-size";
          min: number;
      };

export type EventEffect =
    | {
          type: "gain-gold";
          amount: number;
      }
    | {
          type: "lose-gold";
          amount: number;
      }
    | {
          type: "heal";
          amount: number;
      }
    | {
          type: "lose-hp";
          amount: number;
      }
    | {
          type: "add-random-card";
      }
    | {
          type: "add-card";
          cardId: string;
      }
    | {
          type: "remove-random-card";
      }
    | {
          type: "remove-card";
          cardId: string;
      }
    | {
          type: "random-relic";
      };

export interface EventChoice {
    id: string;
    label: string;
    description?: string;
    requirement?: EventRequirement;
    effects: EventEffect[];
}

export interface EventDefinition {
    id: EventId;
    name: string;
    subtitle: string;
    description: string;
    choices: EventChoice[];
}

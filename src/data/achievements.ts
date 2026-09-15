export interface AchievementDefinition {
    id: string;
    name: string;
    description: string;
    type: "boss-defeat" | "run";
    enemyId?: string;
}

export const achievements: AchievementDefinition[] = [
    {
        id: "defeat-goblin-king",
        name: "The Goblin King Falls",
        description: "Defeat the Goblin King.",
        type: "boss-defeat",
        enemyId: "goblin-king",
    },
    {
        id: "first-descent",
        name: "First Descent",
        description: "Complete your first run.",
        type: "run",
    },
];

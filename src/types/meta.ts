export interface AchievementState {
    id: string;
    unlocked: boolean;
    unlockedAt: number | null;
}

export interface HubUpgradeState {
    id: string;
    level: number;
}

export interface MetaProgressState {
    hubGold: number;
    totalRuns: number;
    victories: number;
    defeats: number;
    achievements: AchievementState[];
    upgrades: HubUpgradeState[];
    unlockedRelicIds: string[];
    cardCollection: Record<string, number>;
}

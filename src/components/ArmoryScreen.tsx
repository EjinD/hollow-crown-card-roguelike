import type { MetaProgressState } from "../types/meta";
import {
    BASE_ACTIONS_UPGRADE_ID,
    BASE_ACTIONS_UPGRADE_MAX_LEVEL,
    getHubProgressionLevel,
    getHubUpgradeCost,
    getHubUpgradeLevel,
    MAX_HP_PER_UPGRADE,
    MAX_HP_UPGRADE_ID,
    MAX_HP_UPGRADE_MAX_LEVEL,
} from "../state/meta-state";

interface ArmoryScreenProps {
    meta: MetaProgressState;
    onUpgrade: (upgradeId: string) => void;
    onBack: () => void;
}

interface UpgradeCardProps {
    title: string;
    label: string;
    description: string;
    level: number;
    maxLevel: number;
    cost: number | null;
    canAfford: boolean;
    onUpgrade: () => void;
}

function UpgradeCard({
    title,
    label,
    description,
    level,
    maxLevel,
    cost,
    canAfford,
    onUpgrade,
}: UpgradeCardProps) {
    const isMaxed = cost === null;

    return (
        <article className="border border-stone-800 bg-[#0e0a08]/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
            <div className="flex items-start justify-between gap-6">
                <div>
                    <p className="text-[9px] uppercase tracking-[0.35em] text-orange-700">
                        {label}
                    </p>

                    <h2 className="mt-2 font-serif text-2xl font-bold uppercase tracking-[0.12em] text-stone-100">
                        {title}
                    </h2>

                    <p className="mt-4 max-w-xl text-sm leading-6 text-stone-500">
                        {description}
                    </p>
                </div>

                <div className="text-right">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-stone-600">
                        Level
                    </p>

                    <p className="mt-1 text-2xl font-bold text-stone-200">
                        {level}/{maxLevel}
                    </p>
                </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-6 border-t border-stone-900 pt-5">
                <div>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-stone-600">
                        Effect
                    </p>

                    <p className="mt-1 text-sm font-semibold text-orange-200">
                        {title === "Vitality" ? `+${MAX_HP_PER_UPGRADE} Max HP per level` : "+1 base action at level 1"}
                    </p>
                </div>

                <button
                    type="button"
                    disabled={isMaxed || !canAfford}
                    onClick={onUpgrade}
                    className="min-w-44 border border-orange-800 bg-[#24120d] px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] text-orange-200 transition hover:border-orange-600 hover:bg-[#351711] disabled:cursor-not-allowed disabled:border-stone-800 disabled:bg-stone-950 disabled:text-stone-700"
                >
                    {isMaxed
                        ? "Fully Upgraded"
                        : `Upgrade · ◆ ${cost}`}
                </button>
            </div>
        </article>
    );
}

export default function ArmoryScreen({
    meta,
    onUpgrade,
    onBack,
}: ArmoryScreenProps) {
    const maxHpLevel = getHubUpgradeLevel(
        meta,
        MAX_HP_UPGRADE_ID,
    );

    const baseActionsLevel = getHubUpgradeLevel(
        meta,
        BASE_ACTIONS_UPGRADE_ID,
    );

    const maxHpCost = getHubUpgradeCost(
        MAX_HP_UPGRADE_ID,
        maxHpLevel,
    );

    const baseActionsCost = getHubUpgradeCost(
        BASE_ACTIONS_UPGRADE_ID,
        baseActionsLevel,
    );

    const progressionLevel = getHubProgressionLevel(
        meta,
    );

    return (
        <main className="min-h-screen bg-[#070605] text-stone-200">
            <div className="mx-auto min-h-screen max-w-6xl px-8 py-10">
                <header className="flex items-end justify-between gap-8 border-b border-stone-900 pb-6">
                    <div>
                        <p className="text-[9px] uppercase tracking-[0.45em] text-stone-600">
                            The Ashen Bastion · Character
                        </p>

                        <h1 className="mt-2 font-serif text-4xl font-bold uppercase tracking-[0.16em] text-stone-100">
                            Armory
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">
                            Permanent improvements purchased with Hub Gold. Upgrades remain between expeditions and also advance your Bastion progression.
                        </p>
                    </div>

                    <div className="flex items-center gap-8 text-right">
                        <div>
                            <p className="text-[9px] uppercase tracking-[0.3em] text-stone-600">
                                Bastion Level
                            </p>

                            <p className="mt-1 text-2xl font-bold text-stone-200">
                                {progressionLevel}
                            </p>
                        </div>

                        <div>
                            <p className="text-[9px] uppercase tracking-[0.3em] text-stone-600">
                                Hub Gold
                            </p>

                            <p className="mt-1 text-2xl font-bold text-amber-400">
                                ◆ {meta.hubGold}
                            </p>
                        </div>
                    </div>
                </header>

                <section className="mt-10 grid gap-6">
                    <UpgradeCard
                        label="Body"
                        title="Vitality"
                        description="Increase the maximum health carried into every new descent. The bonus becomes part of your permanent starting stats."
                        level={maxHpLevel}
                        maxLevel={MAX_HP_UPGRADE_MAX_LEVEL}
                        cost={maxHpCost}
                        canAfford={
                            maxHpCost !== null &&
                            meta.hubGold >= maxHpCost
                        }
                        onUpgrade={() =>
                            onUpgrade(MAX_HP_UPGRADE_ID)
                        }
                    />

                    <UpgradeCard
                        label="Combat"
                        title="Momentum"
                        description="Unlock a second base action for every turn. This is intentionally limited to one permanent upgrade because it changes the combat economy dramatically."
                        level={baseActionsLevel}
                        maxLevel={BASE_ACTIONS_UPGRADE_MAX_LEVEL}
                        cost={baseActionsCost}
                        canAfford={
                            baseActionsCost !== null &&
                            meta.hubGold >= baseActionsCost
                        }
                        onUpgrade={() =>
                            onUpgrade(
                                BASE_ACTIONS_UPGRADE_ID,
                            )
                        }
                    />
                </section>

                <footer className="mt-10 flex items-center justify-between border-t border-stone-900 pt-6">
                    <p className="text-xs text-stone-600">
                        Upgrades are applied when the next expedition begins.
                    </p>

                    <button
                        type="button"
                        onClick={onBack}
                        className="border border-stone-800 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-stone-400 transition hover:border-stone-600 hover:text-stone-200"
                    >
                        Return to Bastion
                    </button>
                </footer>
            </div>
        </main>
    );
}

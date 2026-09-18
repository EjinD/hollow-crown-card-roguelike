import type { MetaProgressState } from "../types/meta";
import {
    dungeons,
    isDungeonUnlocked,
} from "../data/dungeons";

interface DungeonGateScreenProps {
    meta: MetaProgressState;
    savedDeckSize: number;
    onBack: () => void;
    onSelectDungeon: (dungeonId: string) => void;
}

function getUnlockLabel(
    dungeonId: string,
    meta: MetaProgressState,
): string {
    const dungeon = dungeons.find((entry) => entry.id === dungeonId);

    if (!dungeon) {
        return "Locked";
    }

    if (isDungeonUnlocked(dungeon, meta)) {
        return "Available";
    }

    if (dungeon.unlock.type === "dungeon-completed") {
        const requiredDungeonId = dungeon.unlock.dungeonId;
        const required = dungeons.find(
            (entry) => entry.id === requiredDungeonId,
        );

        return required
            ? `Complete ${required.name}`
            : "Complete the previous dungeon";
    }

    if (dungeon.unlock.type === "hub-level") {
        return `Reach Bastion Level ${dungeon.unlock.level}`;
    }

    return "Locked";
}

export default function DungeonGateScreen({
    meta,
    savedDeckSize,
    onBack,
    onSelectDungeon,
}: DungeonGateScreenProps) {
    const progressionLevel =
        1 +
        meta.upgrades.reduce(
            (total, upgrade) =>
                total + Math.max(0, upgrade.level),
            0,
        );

    return (
        <main className="min-h-screen overflow-hidden bg-[#070605] text-stone-100">
            <div className="relative min-h-screen">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_30%,rgba(116,48,19,0.26),transparent_35%),radial-gradient(circle_at_75%_65%,rgba(65,17,17,0.22),transparent_36%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.1),rgba(0,0,0,0.7))]" />

                <header className="relative z-10 flex items-center justify-between border-b border-stone-900/80 bg-[#080706]/90 px-8 py-5">
                    <button
                        type="button"
                        onClick={onBack}
                        className="hc-button hc-button--secondary min-h-[42px] px-5 text-[9px]"
                    >
                        ← Back to Bastion
                    </button>

                    <div className="flex items-center gap-8 text-right">
                        <div>
                            <p className="text-[9px] uppercase tracking-[0.28em] text-stone-600">
                                Bastion Level
                            </p>
                            <p className="mt-1 text-lg font-bold text-stone-100">
                                {progressionLevel}
                            </p>
                        </div>
                        <div>
                            <p className="text-[9px] uppercase tracking-[0.28em] text-stone-600">
                                Prepared Deck
                            </p>
                            <p className="mt-1 text-lg font-bold text-amber-400">
                                {savedDeckSize} / 20
                            </p>
                        </div>
                    </div>
                </header>

                <section className="relative z-10 mx-auto max-w-7xl px-8 py-10">
                    <div className="max-w-3xl">
                        <p className="text-[10px] uppercase tracking-[0.46em] text-orange-500/70">
                            The Dungeon Gate
                        </p>
                        <h1 className="mt-3 font-serif text-5xl font-bold uppercase tracking-[0.15em] text-stone-100">
                            Descend into the Unknown
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-500">
                            Each descent has its own routes, pressures and final challenge. Choose a dungeon and prepare your deck before stepping through the gate.
                        </p>
                    </div>

                    <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                        {dungeons.map((dungeon) => {
                            const unlocked = isDungeonUnlocked(
                                dungeon,
                                meta,
                            );
                            const completed = meta.completedDungeonIds.includes(
                                dungeon.id,
                            );

                            return (
                                <article
                                    key={dungeon.id}
                                    className={`group relative flex min-h-[430px] flex-col overflow-hidden border bg-[#100c09]/95 p-6 transition ${
                                        unlocked
                                            ? "border-stone-700 hover:-translate-y-1 hover:border-orange-700"
                                            : "border-stone-900 opacity-70"
                                    }`}
                                >
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(145,63,24,0.2),transparent_48%)] opacity-80" />
                                    <div className="relative z-10 flex h-full flex-col">
                                        <div className="flex items-start justify-between gap-4">
                                            <p className="text-[9px] uppercase tracking-[0.35em] text-stone-600">
                                                {dungeon.themeLabel}
                                            </p>
                                            {completed && (
                                                <span className="border border-emerald-900/70 bg-emerald-950/20 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                                                    Cleared
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-20">
                                            <h2 className="font-serif text-2xl font-bold uppercase tracking-[0.1em] text-stone-100">
                                                {dungeon.name}
                                            </h2>
                                            <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-orange-500/70">
                                                {dungeon.subtitle}
                                            </p>
                                            <p className="mt-5 text-sm leading-6 text-stone-500">
                                                {dungeon.description}
                                            </p>
                                        </div>

                                        <div className="mt-auto pt-8">
                                            <div className="mb-5 flex items-center justify-between border-t border-stone-800 pt-4 text-[9px] uppercase tracking-[0.2em] text-stone-600">
                                                <span>
                                                    {dungeon.floorCount} floors
                                                </span>
                                                <span>
                                                    {dungeon.layout === "linear"
                                                        ? "Linear"
                                                        : "Branched"}
                                                </span>
                                            </div>

                                            {!unlocked ? (
                                                <div className="border border-stone-800 bg-black/20 px-4 py-3 text-center text-[9px] font-bold uppercase tracking-[0.18em] text-stone-600">
                                                    {getUnlockLabel(
                                                        dungeon.id,
                                                        meta,
                                                    )}
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onSelectDungeon(
                                                            dungeon.id,
                                                        )
                                                    }
                                                    className="hc-button hc-button--primary w-full min-h-[50px] px-5 text-[10px]"
                                                >
                                                    {completed
                                                        ? "Descend Again"
                                                        : "Enter Dungeon"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>
            </div>
        </main>
    );
}

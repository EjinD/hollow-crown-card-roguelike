import type { CombatReward } from "../types/game";
import { relics } from "../data/relics";

interface RewardScreenProps {
    reward: CombatReward;
    onContinue: () => void;
}

const RARITY_STYLES = {
    common: {
        border: "border-stone-700",
        text: "text-stone-200",
        glow: "shadow-[0_0_35px_rgba(120,120,120,0.08)]",
    },
    uncommon: {
        border: "border-sky-700/70",
        text: "text-sky-200",
        glow: "shadow-[0_0_35px_rgba(50,120,180,0.12)]",
    },
    rare: {
        border: "border-violet-700/70",
        text: "text-violet-200",
        glow: "shadow-[0_0_35px_rgba(130,80,200,0.14)]",
    },
    legendary: {
        border: "border-amber-600/80",
        text: "text-amber-200",
        glow: "shadow-[0_0_35px_rgba(220,150,40,0.18)]",
    },
} as const;

export default function RewardScreen({
    reward,
    onContinue,
}: RewardScreenProps) {
    const relic = reward.relicId
        ? relics.find(
              (candidate) =>
                  candidate.id ===
                  reward.relicId,
          )
        : undefined;

    const rarityStyle = relic
        ? RARITY_STYLES[relic.rarity]
        : RARITY_STYLES.common;

    return (
        <main className="min-h-screen bg-[#0a0807] text-stone-200">
            <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-8 py-12 text-center">
                <p className="text-xs uppercase tracking-[0.42em] text-stone-500">
                    Expedition Reward
                </p>

                <h1 className="mt-4 font-serif text-5xl font-bold uppercase tracking-[0.16em] text-stone-100">
                    Treasure Found
                </h1>

                <div className="mt-10 flex items-center gap-4 border-y border-stone-900 py-5">
                    <span className="text-amber-400">
                        ◆
                    </span>

                    <span className="text-sm uppercase tracking-[0.25em] text-stone-500">
                        Run Gold
                    </span>

                    <span className="text-3xl font-bold text-amber-300">
                        +{reward.gold}
                    </span>
                </div>

                {relic ? (
                    <section className="mt-12 w-full max-w-xl">
                        <p className="text-[10px] uppercase tracking-[0.35em] text-stone-600">
                            Relic Acquired
                        </p>

                        <div
                            className={`mt-5 border bg-[#100c0a] px-10 py-10 ${rarityStyle.border} ${rarityStyle.glow}`}
                        >
                            <div className="mx-auto flex h-20 w-20 items-center justify-center border border-stone-700 bg-[#17100c] text-3xl text-amber-400">
                                ◈
                            </div>

                            <p className="mt-6 text-[10px] uppercase tracking-[0.32em] text-stone-600">
                                {relic.rarity}
                            </p>

                            <h2
                                className={`mt-2 font-serif text-3xl font-bold uppercase tracking-[0.1em] ${rarityStyle.text}`}
                            >
                                {relic.name}
                            </h2>

                            <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-stone-500">
                                {relic.description}
                            </p>
                        </div>
                    </section>
                ) : (
                    <div className="mt-14 border border-dashed border-stone-800 bg-black/20 px-12 py-10">
                        <p className="text-sm uppercase tracking-[0.25em] text-stone-500">
                            No relic this time
                        </p>

                        <p className="mt-3 max-w-md text-xs leading-6 text-stone-700">
                            Stronger rewards become more likely as you descend deeper and face more dangerous enemies.
                        </p>
                    </div>
                )}

                <button
                    type="button"
                    onClick={onContinue}
                    className="mt-12 border border-orange-800 bg-[#24120d] px-12 py-4 text-sm font-bold uppercase tracking-[0.25em] text-orange-200 transition hover:border-orange-600 hover:bg-[#351711] hover:text-orange-100"
                >
                    {relic
                        ? "Claim Relic"
                        : "Continue"}
                </button>
            </div>
        </main>
    );
}

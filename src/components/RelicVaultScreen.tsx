import { relics } from "../data/relics";

interface RelicVaultScreenProps {
    relicIds: string[];
    progressionLevel: number;
    onBack: () => void;
}

const rarityStyles = {
    common: {
        border: "border-stone-700",
        text: "text-stone-200",
        label: "Common",
    },
    uncommon: {
        border: "border-emerald-900/80",
        text: "text-emerald-300",
        label: "Uncommon",
    },
    rare: {
        border: "border-sky-900/80",
        text: "text-sky-300",
        label: "Rare",
    },
    legendary: {
        border: "border-amber-800/80",
        text: "text-amber-300",
        label: "Legendary",
    },
} as const;

export default function RelicVaultScreen({
    relicIds,
    progressionLevel,
    onBack,
}: RelicVaultScreenProps) {
    return (
        <main className="min-h-screen overflow-auto bg-[#080706] px-8 py-8 text-stone-200">
            <div className="mx-auto max-w-6xl">
                <header className="flex items-end justify-between border-b border-stone-800 pb-6">
                    <div>
                        <p className="text-[9px] uppercase tracking-[0.4em] text-stone-600">
                            Ashen Bastion
                        </p>

                        <h1 className="mt-2 font-serif text-3xl font-bold uppercase tracking-[0.14em] text-stone-100">
                            Relic Vault
                        </h1>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-stone-500">
                            Your character's progression determines which relics can appear during future expeditions.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onBack}
                        className="border border-stone-700 bg-[#15100d] px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-stone-300 transition hover:border-stone-500 hover:text-stone-100"
                    >
                        Back
                    </button>
                </header>

                <section className="mt-8 border border-stone-800 bg-[#0e0a08] px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[9px] uppercase tracking-[0.3em] text-stone-600">
                                Character progression
                            </p>

                            <h2 className="mt-1 font-serif text-xl font-bold uppercase tracking-[0.12em] text-stone-200">
                                Relic Pool
                            </h2>
                        </div>

                        <div className="text-right">
                            <p className="text-[9px] uppercase tracking-[0.3em] text-stone-600">
                                Progression level
                            </p>

                            <p className="mt-1 text-2xl font-bold text-amber-400">
                                {progressionLevel}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {relics.map((relic) => {
                        const unlocked = relicIds.includes(
                            relic.id,
                        );
                        const rarity =
                            rarityStyles[relic.rarity];

                        return (
                            <article
                                key={relic.id}
                                className={`relative min-h-[220px] border bg-[#0f0b09] p-6 ${
                                    unlocked
                                        ? rarity.border
                                        : "border-stone-900"
                                } ${
                                    unlocked
                                        ? ""
                                        : "opacity-65"
                                }`}
                            >
                                {!unlocked && (
                                    <div className="absolute right-5 top-5 rounded-full border border-stone-800 bg-black/40 px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-stone-600">
                                        Locked
                                    </div>
                                )}

                                <p
                                    className={`text-[9px] uppercase tracking-[0.3em] ${
                                        unlocked
                                            ? rarity.text
                                            : "text-stone-700"
                                    }`}
                                >
                                    {unlocked
                                        ? rarity.label
                                        : `Unlocks at level ${relic.unlockLevel}`}
                                </p>

                                <h3 className="mt-4 font-serif text-xl font-bold uppercase tracking-[0.1em] text-stone-200">
                                    {unlocked
                                        ? relic.name
                                        : "Unknown Relic"}
                                </h3>

                                <p className="mt-4 text-sm leading-6 text-stone-500">
                                    {unlocked
                                        ? relic.description
                                        : "This relic has not yet been discovered by your character."}
                                </p>

                                {unlocked && (
                                    <div className="mt-6 border-t border-stone-900 pt-4 text-[9px] uppercase tracking-[0.25em] text-stone-700">
                                        Available in future runs
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </section>
            </div>
        </main>
    );
}

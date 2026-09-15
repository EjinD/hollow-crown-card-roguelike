import { relics } from "../data/relics";
import type { RelicRarity } from "../types/relics";

interface EncyclopediaScreenProps {
    discoveredRelicIds: string[];
    onBack: () => void;
}

const rarityStyles: Record<
    RelicRarity,
    { label: string; text: string; border: string }
> = {
    common: {
        label: "Common",
        text: "text-stone-300",
        border: "border-stone-700",
    },
    uncommon: {
        label: "Uncommon",
        text: "text-emerald-300",
        border: "border-emerald-800/70",
    },
    rare: {
        label: "Rare",
        text: "text-sky-300",
        border: "border-sky-800/70",
    },
    legendary: {
        label: "Legendary",
        text: "text-amber-300",
        border: "border-amber-800/80",
    },
};

export default function EncyclopediaScreen({
    discoveredRelicIds,
    onBack,
}: EncyclopediaScreenProps) {
    return (
        <main className="min-h-screen overflow-y-auto bg-[#080706] px-8 py-8 text-stone-200">
            <div className="mx-auto max-w-6xl">
                <header className="flex items-end justify-between border-b border-stone-800 pb-6">
                    <div>
                        <p className="text-[9px] uppercase tracking-[0.4em] text-stone-600">
                            Ashen Bastion · Knowledge
                        </p>
                        <h1 className="mt-2 font-serif text-4xl font-bold uppercase tracking-[0.14em] text-stone-100">
                            Encyclopedia
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
                            Relics are not owned in the Bastion. They are discovered in the depths and recorded here permanently.
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

                <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {relics.map((relic) => {
                        const discovered =
                            discoveredRelicIds.includes(relic.id);
                        const rarity = rarityStyles[relic.rarity];

                        return (
                            <article
                                key={relic.id}
                                className={`relative min-h-[220px] border bg-[#0f0b09] p-6 ${
                                    discovered
                                        ? rarity.border
                                        : "border-stone-900"
                                } ${discovered ? "" : "opacity-60"}`}
                            >
                                <p
                                    className={`text-[9px] uppercase tracking-[0.3em] ${
                                        discovered
                                            ? rarity.text
                                            : "text-stone-700"
                                    }`}
                                >
                                    {discovered
                                        ? rarity.label
                                        : "Undiscovered"}
                                </p>

                                <h2 className="mt-4 font-serif text-xl font-bold uppercase tracking-[0.1em] text-stone-200">
                                    {discovered
                                        ? relic.name
                                        : "Unknown Relic"}
                                </h2>

                                <p className="mt-4 text-sm leading-6 text-stone-500">
                                    {discovered
                                        ? relic.description
                                        : "Find this relic during an expedition to reveal its entry."}
                                </p>

                                {discovered && (
                                    <div className="mt-6 border-t border-stone-900 pt-4 text-[9px] uppercase tracking-[0.25em] text-stone-700">
                                        Discovered in the depths
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

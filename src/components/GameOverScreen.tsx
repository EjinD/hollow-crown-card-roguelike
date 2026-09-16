import { getDungeonById } from "../data/dungeons";
import { relics } from "../data/relics";

interface GameOverScreenProps {
    result: "victory" | "defeat";
    dungeonId: string;
    gold: number;
    deckSize: number;
    currentFloor: number;
    floorCount: number;
    relicIds: string[];
    onReturnToHub: () => void;
}

export default function GameOverScreen({
    result,
    dungeonId,
    gold,
    deckSize,
    currentFloor,
    floorCount,
    relicIds,
    onReturnToHub,
}: GameOverScreenProps) {
    const victory = result === "victory";
    const dungeon = getDungeonById(dungeonId);
    const foundRelics = relicIds
        .map((relicId) =>
            relics.find((relic) => relic.id === relicId),
        )
        .filter((relic): relic is (typeof relics)[number] => relic !== undefined);

    return (
        <main className="min-h-screen bg-[#0c0a08] text-stone-200">
            <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-8 py-12">
                <div className="text-center">
                    <p
                        className={`text-xs uppercase tracking-[0.4em] ${
                            victory ? "text-amber-400" : "text-red-400"
                        }`}
                    >
                        {victory ? "Descent Complete" : "The Descent Ends"}
                    </p>

                    <h1 className="mt-4 font-serif text-6xl font-bold uppercase tracking-[0.12em] text-stone-100">
                        {victory ? "Victory" : "Defeat"}
                    </h1>

                    <p className="mt-5 text-sm uppercase tracking-[0.28em] text-stone-600">
                        {dungeon?.name ?? dungeonId}
                    </p>

                    <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-stone-500">
                        {victory
                            ? "The path through the dungeon has been conquered. Your spoils return with you to the Bastion."
                            : "Your descent has ended here. The knowledge, cards and permanent progression you earned remain with you."}
                    </p>
                </div>

                <div className="mt-12 grid gap-4 md:grid-cols-4">
                    <Stat label="Floors" value={`${currentFloor} / ${floorCount}`} />
                    <Stat label="Run Gold" value={`${gold}`} accent />
                    <Stat label="Run Deck" value={`${deckSize} cards`} />
                    <Stat label="Relics Found" value={`${foundRelics.length}`} />
                </div>

                {foundRelics.length > 0 && (
                    <section className="mt-10 border border-stone-900 bg-[#100d0a]/90 p-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-[9px] uppercase tracking-[0.3em] text-stone-600">
                                    This Descent
                                </p>
                                <h2 className="mt-2 font-serif text-2xl uppercase tracking-[0.08em] text-stone-100">
                                    Relics Carried Out
                                </h2>
                            </div>
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
                                {foundRelics.length}
                            </span>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {foundRelics.map((relic) => (
                                <div
                                    key={relic.id}
                                    className="border border-stone-800 bg-[#0d0b09] px-4 py-4"
                                >
                                    <p className="text-[8px] uppercase tracking-[0.25em] text-stone-600">
                                        {relic.rarity}
                                    </p>
                                    <p className="mt-2 font-serif text-lg text-stone-200">
                                        {relic.name}
                                    </p>
                                    <p className="mt-2 text-xs leading-5 text-stone-600">
                                        {relic.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <div className="mt-auto flex justify-center pt-12">
                    <button
                        type="button"
                        onClick={onReturnToHub}
                        className="border border-orange-800 bg-[#24120d] px-12 py-4 text-sm font-bold uppercase tracking-[0.25em] text-orange-200 transition hover:border-orange-500 hover:bg-[#351711]"
                    >
                        Return to Bastion
                    </button>
                </div>
            </div>
        </main>
    );
}

function Stat({
    label,
    value,
    accent = false,
}: {
    label: string;
    value: string;
    accent?: boolean;
}) {
    return (
        <div className="border border-stone-900 bg-[#100d0a]/80 px-5 py-5 text-center">
            <p className="text-[8px] uppercase tracking-[0.28em] text-stone-600">
                {label}
            </p>
            <p
                className={`mt-2 text-2xl font-bold ${
                    accent ? "text-amber-400" : "text-stone-200"
                }`}
            >
                {value}
            </p>
        </div>
    );
}

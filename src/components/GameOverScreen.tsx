interface GameOverScreenProps {
    result: "victory" | "defeat";
    gold: number;
    deckSize: number;
    onRestart: () => void;
}

export default function GameOverScreen({
    result,
    gold,
    deckSize,
    onRestart,
}: GameOverScreenProps) {
    const victory = result === "victory";

    return (
        <main className="min-h-screen bg-[#0c0a08] text-stone-200">
            <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-8 py-12">
                <p
                    className={`text-xs uppercase tracking-[0.4em] ${
                        victory
                            ? "text-amber-400"
                            : "text-red-400"
                    }`}
                >
                    {victory
                        ? "Run Complete"
                        : "Run Over"}
                </p>

                <h1 className="mt-4 text-center font-serif text-6xl font-bold uppercase tracking-widest">
                    {victory
                        ? "Victory"
                        : "Defeat"}
                </h1>

                <p className="mt-6 max-w-xl text-center text-lg leading-relaxed text-stone-500">
                    {victory
                        ? "You defeated the Goblin King and completed the run."
                        : "Your journey has come to an end."}
                </p>

                <div className="mt-12 flex items-center gap-12 border-y border-stone-900 py-8">
                    <div className="text-center">
                        <p className="text-xs uppercase tracking-[0.3em] text-stone-600">
                            Gold
                        </p>

                        <p className="mt-2 text-3xl font-bold text-amber-400">
                            {gold}
                        </p>
                    </div>

                    <div className="h-12 w-px bg-stone-900" />

                    <div className="text-center">
                        <p className="text-xs uppercase tracking-[0.3em] text-stone-600">
                            Deck
                        </p>

                        <p className="mt-2 text-3xl font-bold">
                            {deckSize}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onRestart}
                    className="mt-14 border border-stone-700 bg-[#14110e] px-10 py-4 text-sm uppercase tracking-[0.25em] text-stone-300 transition hover:border-amber-700 hover:text-amber-400"
                >
                    {victory
                        ? "Start New Run"
                        : "Try Again"}
                </button>
            </div>
        </main>
    );
}
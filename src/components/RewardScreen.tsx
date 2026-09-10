import type { CombatReward } from "../types/game";

interface RewardScreenProps {
    reward: CombatReward;
    onClaim: (cardId: string) => void;
    onSkip: () => void;
}

export default function RewardScreen({
    reward,
    onClaim,
    onSkip,
}: RewardScreenProps) {
    return (
        <main className="min-h-screen bg-[#0c0a08] text-stone-200">
            <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-8 py-12">

                <p className="text-xs uppercase tracking-[0.4em] text-stone-500">
                    Victory
                </p>

                <h1 className="mt-3 font-serif text-5xl font-bold uppercase tracking-widest">
                    Choose your reward
                </h1>

                <p className="mt-5 text-amber-400">
                    +{reward.gold} Gold
                </p>

                <div className="mt-12 flex items-start justify-center gap-6">
                    {reward.cardChoices.map(
                        (cardId) => (
                            <button
                                key={cardId}
                                type="button"
                                onClick={() =>
                                    onClaim(cardId)
                                }
                                className="flex h-56 w-40 flex-col items-center justify-center rounded-xl border-2 border-stone-700 bg-[#18120f] p-5 transition-all duration-200 hover:-translate-y-2 hover:border-orange-500 hover:shadow-[0_0_25px_rgba(234,88,12,0.35)]"
                            >
                                <span className="text-xs uppercase tracking-widest text-stone-500">
                                    Card
                                </span>

                                <span className="mt-4 text-center font-serif text-xl font-bold uppercase">
                                    {cardId}
                                </span>

                                <span className="mt-4 text-xs uppercase tracking-widest text-orange-400">
                                    Choose
                                </span>
                            </button>
                        ),
                    )}
                </div>

                <button
                    type="button"
                    onClick={onSkip}
                    className="mt-12 border border-stone-800 px-8 py-3 text-sm uppercase tracking-[0.2em] text-stone-400 transition hover:border-stone-600 hover:text-stone-200"
                >
                    Skip Reward
                </button>

            </div>
        </main>
    );
}
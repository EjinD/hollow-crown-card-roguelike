import { useState } from "react";
import type { CardState, CombatReward } from "../types/game";
import { MAX_DECK_SIZE } from "../consts/game";
import Card from "./Card";

interface RewardScreenProps {
    reward: CombatReward;
    deck: CardState[];
    onClaim: (cardId: string) => void;
    onReplace: (oldCardId: string, newCardId: string) => void;
    onSkip: () => void;
}

export default function RewardScreen({
    reward,
    deck,
    onClaim,
    onReplace,
    onSkip,
}: RewardScreenProps) {
    const [selectedReward, setSelectedReward] = useState<string | null>(null);

    const isDeckFull = deck.length >= MAX_DECK_SIZE;

    const handleRewardClick = (cardId: string) => {
        if (!isDeckFull) {
            onClaim(cardId);
            return;
        }

        setSelectedReward(cardId);
    };

    const handleReplace = (oldCardId: string) => {
        if (!selectedReward) {
            return;
        }

        onReplace(oldCardId, selectedReward);
        setSelectedReward(null);
    };

    const handleCancelReplace = () => {
        setSelectedReward(null);
    };

    return (
        <main className="min-h-screen bg-[#0c0a08] text-stone-200">
            <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center px-8 py-12">
                <p className="text-xs uppercase tracking-[0.4em] text-stone-500">
                    Victory
                </p>

                <h1 className="mt-3 text-center font-serif text-5xl font-bold uppercase tracking-widest">
                    {selectedReward
                        ? "Choose a card to replace"
                        : "Choose your reward"}
                </h1>

                <p className="mt-5 text-amber-400">
                    +{reward.gold} Gold
                </p>

                {!selectedReward && (
                    <div className="mt-12 flex items-start justify-center gap-8">
                        {reward.cardChoices.map((cardId) => (
                            <Card
                                key={cardId}
                                card={{
                                    cardId,
                                    cooldownRemaining: 0,
                                }}
                                onClick={handleRewardClick}
                            />
                        ))}
                    </div>
                )}

                {selectedReward && (
                    <div className="mt-12 flex w-full flex-col items-center">
                        <div className="flex flex-col items-center">
                            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-stone-500">
                                New Card
                            </p>

                            <Card
                                card={{
                                    cardId: selectedReward,
                                    cooldownRemaining: 0,
                                }}
                                onClick={() => {}}
                            />
                        </div>

                        <div className="mt-12 w-full">
                            <p className="mb-6 text-center text-xs uppercase tracking-[0.3em] text-stone-500">
                                Choose a card from your deck to replace
                            </p>

                            <div className="flex flex-wrap justify-center gap-4">
                                {deck.map((card) => (
                                    <Card
                                        key={card.cardId}
                                        card={card}
                                        onClick={() =>
                                            handleReplace(card.cardId)
                                        }
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {!selectedReward ? (
                    <button
                        type="button"
                        onClick={onSkip}
                        className="mt-12 border border-stone-800 px-8 py-3 text-sm uppercase tracking-[0.2em] text-stone-400 transition hover:border-stone-600 hover:text-stone-200"
                    >
                        Skip Reward
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleCancelReplace}
                        className="mt-12 border border-stone-800 px-8 py-3 text-sm uppercase tracking-[0.2em] text-stone-400 transition hover:border-stone-600 hover:text-stone-200"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </main>
    );
}
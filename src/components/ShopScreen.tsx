import Card from "./Card";
import type { ShopOffer } from "../types/game";

interface ShopScreenProps {
    gold: number;
    hp: number;
    maxHp: number;
    deckSize: number;
    maxDeckSize: number;

    offers: ShopOffer[];

    healPrice: number;
    healPurchased: boolean;

    onBuyCard: (cardId: string) => void;
    onHeal: () => void;
    onLeave: () => void;
}

export default function ShopScreen({
    gold,
    hp,
    maxHp,
    deckSize,
    maxDeckSize,
    offers,
    healPrice,
    healPurchased,
    onBuyCard,
    onHeal,
    onLeave,
}: ShopScreenProps) {
    const deckIsFull =
        deckSize >= maxDeckSize;

    const hpIsFull =
        hp >= maxHp;

    return (
        <main className="min-h-screen bg-[#0c0a08] text-stone-200">
            <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-8 py-12">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-stone-500">
                            Merchant
                        </p>

                        <h1 className="mt-3 font-serif text-5xl font-bold uppercase tracking-widest">
                            Shop
                        </h1>
                    </div>

                    <div className="flex items-center gap-10 text-right">
                        {/* HP */}
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                                HP
                            </p>

                            <p className="mt-1 text-2xl font-bold">
                                <span className="text-red-400">
                                    {hp}
                                </span>

                                <span className="text-stone-600">
                                    {" / "}
                                    {maxHp}
                                </span>
                            </p>
                        </div>

                        {/* Deck */}
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                                Deck
                            </p>

                            <p className="mt-1 text-2xl font-bold">
                                <span className="text-stone-200">
                                    {deckSize}
                                </span>

                                <span className="text-stone-600">
                                    {" / "}
                                    {maxDeckSize}
                                </span>
                            </p>
                        </div>

                        {/* Gold */}
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                                Gold
                            </p>

                            <p className="mt-1 text-2xl font-bold text-amber-400">
                                {gold}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Cards */}
                <section className="mt-16">
                    <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                            Cards
                        </p>

                        <p className="text-xs uppercase tracking-[0.2em] text-stone-600">
                            {deckIsFull
                                ? "Deck Full"
                                : `${maxDeckSize - deckSize} Slots Available`}
                        </p>
                    </div>

                    <div className="mt-8 flex flex-wrap items-start justify-center gap-10">
                        {offers.map(
                            (offer) => {
                                const canAfford =
                                    gold >=
                                    offer.price;

                                const canBuy =
                                    canAfford &&
                                    !deckIsFull &&
                                    !offer.purchased;

                                return (
                                    <div
                                        key={
                                            offer.cardId
                                        }
                                        className="flex flex-col items-center"
                                    >
                                        <div
                                            className={
                                                canBuy
                                                    ? ""
                                                    : "opacity-40"
                                            }
                                        >
                                            <Card
                                                card={{
                                                    cardId:
                                                        offer.cardId,
                                                    cooldownRemaining:
                                                        0,
                                                }}
                                                disabled={
                                                    !canBuy
                                                }
                                                onClick={() =>
                                                    onBuyCard(
                                                        offer.cardId,
                                                    )
                                                }
                                            />
                                        </div>

                                        <p className="mt-5 text-lg font-semibold text-amber-400">
                                            {
                                                offer.price
                                            }{" "}
                                            Gold
                                        </p>

                                        <button
                                            type="button"
                                            disabled={
                                                !canBuy
                                            }
                                            onClick={() =>
                                                onBuyCard(
                                                    offer.cardId,
                                                )
                                            }
                                            className="mt-3 border border-stone-800 px-6 py-2 text-xs uppercase tracking-[0.2em] text-stone-300 transition hover:border-amber-700 hover:text-amber-400 disabled:cursor-not-allowed disabled:opacity-30"
                                        >
                                            {offer.purchased
                                                ? "Sold"
                                                : deckIsFull
                                                  ? "Deck Full"
                                                  : !canAfford
                                                    ? "Not Enough Gold"
                                                    : "Buy"}
                                        </button>
                                    </div>
                                );
                            },
                        )}
                    </div>
                </section>

                {/* Services */}
                <section className="mt-20 border-t border-stone-900 pt-10">
                    <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                            Services
                        </p>

                        <p className="text-xs uppercase tracking-[0.2em] text-stone-600">
                            {hpIsFull
                                ? "HP Full"
                                : `Missing ${maxHp - hp} HP`}
                        </p>
                    </div>

                    <div className="mt-8">
                        <button
                            type="button"
                            onClick={onHeal}
                            disabled={
                                gold <
                                    healPrice ||
                                hpIsFull ||
                                healPurchased
                            }
                            className="border border-stone-800 bg-[#14110e] px-8 py-5 text-left transition hover:border-amber-700 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            <p className="font-serif text-xl">
                                Heal
                            </p>

                            <p className="mt-2 text-sm text-stone-500">
                                Restore 3 HP
                            </p>

                            <p className="mt-4 text-amber-400">
                                {healPrice}{" "}
                                Gold
                            </p>

                            <p className="mt-2 text-xs uppercase tracking-[0.15em] text-stone-600">
                                {healPurchased
                                    ? "Already Used"
                                    : hpIsFull
                                      ? "Already at full HP"
                                      : gold <
                                          healPrice
                                        ? "Not enough gold"
                                        : "Available"}
                            </p>
                        </button>
                    </div>
                </section>

                {/* Leave */}
                <div className="mt-auto flex justify-end pt-16">
                    <button
                        type="button"
                        onClick={onLeave}
                        className="border border-stone-800 px-8 py-3 text-sm uppercase tracking-[0.2em] text-stone-400 transition hover:border-stone-600 hover:text-stone-200"
                    >
                        Leave Shop
                    </button>
                </div>
            </div>
        </main>
    );
}
import { useState } from "react";

import Card from "./Card";
import type {
    CardState,
    ShopCardOffer,
    ShopRelicOffer,
} from "../types/game";
import { cards } from "../data/cards";
import { relics } from "../data/relics";
import { getShopHealAmount } from "../data/shop";

interface ShopScreenProps {
    gold: number;
    hp: number;
    maxHp: number;
    deck: CardState[];
    relicsOwned: string[];

    cardOffers: ShopCardOffer[];
    relicOffers: ShopRelicOffer[];

    healPrice: number;
    healPurchased: boolean;
    removeCardPrice: number;
    removeCardPurchased: boolean;

    onBuyCard: (cardId: string) => void;
    onBuyRelic: (relicId: string) => void;
    onHeal: () => void;
    onRemoveCard: (cardId: string) => void;
    onLeave: () => void;
}

function raritySymbol(rarity: string) {
    switch (rarity) {
        case "common":
            return "◇";
        case "uncommon":
            return "◆";
        case "rare":
            return "✦";
        case "legendary":
            return "♛";
        default:
            return "◇";
    }
}

function rarityClass(rarity: string) {
    switch (rarity) {
        case "uncommon":
            return "text-emerald-300";
        case "rare":
            return "text-sky-300";
        case "legendary":
            return "text-amber-300";
        default:
            return "text-stone-300";
    }
}

export default function ShopScreen({
    gold,
    hp,
    maxHp,
    deck,
    relicsOwned,
    cardOffers,
    relicOffers,
    healPrice,
    healPurchased,
    removeCardPrice,
    removeCardPurchased,
    onBuyCard,
    onBuyRelic,
    onHeal,
    onRemoveCard,
    onLeave,
}: ShopScreenProps) {
    const [isRemovingCard, setIsRemovingCard] =
        useState(false);

    const hpIsFull = hp >= maxHp;
    const healAmount = getShopHealAmount(maxHp);
    const canRemoveCard =
        !removeCardPurchased &&
        deck.length > 10 &&
        gold >= removeCardPrice;

    return (
        <main className="min-h-screen bg-[#0a0705] text-stone-100">
            <div className="mx-auto flex min-h-screen max-w-[1500px] flex-col px-6 py-7 lg:px-10">
                <header className="flex items-center justify-between border-b border-stone-800/80 pb-6">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.42em] text-amber-500/70">
                            The Ashen Bastion — Traveling Merchant
                        </p>
                        <h1 className="mt-2 font-serif text-4xl font-bold uppercase tracking-[0.16em] text-stone-100">
                            The Black Market
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm text-stone-500">
                            Choose carefully. Every purchase leaves less gold for the rest of the descent.
                        </p>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-stone-600">
                                HP
                            </p>
                            <p className="mt-1 text-xl font-bold">
                                <span className="text-red-400">{hp}</span>
                                <span className="text-stone-700"> / {maxHp}</span>
                            </p>
                        </div>

                        <div className="border border-amber-800/50 bg-[#16100c] px-5 py-3 text-right shadow-inner">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-stone-600">
                                Run Gold
                            </p>
                            <p className="mt-1 text-2xl font-bold text-amber-300">
                                {gold}
                            </p>
                        </div>
                    </div>
                </header>

                <div className="flex-1 py-8">
                    <section>
                        <div className="mb-5 flex items-end justify-between border-b border-stone-800 pb-3">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.34em] text-stone-600">
                                    The Merchant's Wares
                                </p>
                                <h2 className="mt-1 font-serif text-2xl font-bold uppercase tracking-[0.12em]">
                                    Cards
                                </h2>
                            </div>
                            <p className="text-xs uppercase tracking-[0.2em] text-stone-600">
                                One copy per run deck
                            </p>
                        </div>

                        <div className="grid gap-5 md:grid-cols-3">
                            {cardOffers.map((offer) => {
                                const definition = cards.find(
                                    (card) => card.id === offer.cardId,
                                );

                                if (!definition) {
                                    return null;
                                }

                                const alreadyInDeck = deck.some(
                                    (card) => card.cardId === offer.cardId,
                                );
                                const canBuy =
                                    !offer.purchased &&
                                    !alreadyInDeck &&
                                    deck.length < 20 &&
                                    gold >= offer.price;

                                return (
                                    <article
                                        key={offer.cardId}
                                        className="group border border-stone-800 bg-[linear-gradient(180deg,#17100c,#0f0a08)] p-5 shadow-[0_15px_45px_rgba(0,0,0,0.35)] transition hover:border-stone-700"
                                    >
                                        <div className="flex min-h-[330px] flex-col items-center">
                                            <div className="origin-top scale-[0.92]">
                                                <Card
                                                    card={{
                                                        cardId: offer.cardId,
                                                        cooldownRemaining: 0,
                                                    }}
                                                    disabled={!canBuy}
                                                    onClick={() => onBuyCard(offer.cardId)}
                                                />
                                            </div>

                                            <div className="mt-2 flex w-full items-center justify-between border-t border-stone-800 pt-4">
                                                <div>
                                                    <p className={`text-sm font-bold ${rarityClass(definition.rarity)}`}>
                                                        {raritySymbol(definition.rarity)} {definition.rarity}
                                                    </p>
                                                    {offer.purchased && (
                                                        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-emerald-400">
                                                            Sold
                                                        </p>
                                                    )}
                                                    {alreadyInDeck && !offer.purchased && (
                                                        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-stone-600">
                                                            Already in deck
                                                        </p>
                                                    )}
                                                </div>

                                                <button
                                                    type="button"
                                                    disabled={!canBuy}
                                                    onClick={() => onBuyCard(offer.cardId)}
                                                    className="border border-amber-800/70 bg-amber-950/30 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-amber-300 transition hover:border-amber-500 hover:bg-amber-900/30 disabled:cursor-not-allowed disabled:opacity-30"
                                                >
                                                    {offer.purchased
                                                        ? "Sold"
                                                        : `${offer.price} Gold`}
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </section>

                    <section className="mt-10">
                        <div className="mb-5 flex items-end justify-between border-b border-stone-800 pb-3">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.34em] text-stone-600">
                                    Relics of the Descent
                                </p>
                                <h2 className="mt-1 font-serif text-2xl font-bold uppercase tracking-[0.12em]">
                                    Relics
                                </h2>
                            </div>
                            <p className="text-xs uppercase tracking-[0.2em] text-stone-600">
                                Obtained only during a run
                            </p>
                        </div>

                        {relicOffers.length === 0 ? (
                            <div className="border border-dashed border-stone-800 bg-[#100b08] px-8 py-10 text-center">
                                <p className="font-serif text-xl text-stone-300">
                                    Nothing worth selling.
                                </p>
                                <p className="mt-2 text-sm text-stone-600">
                                    The merchant has no relics available for this descent.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-5 md:grid-cols-2">
                                {relicOffers.map((offer) => {
                                    const relic = relics.find(
                                        (item) => item.id === offer.relicId,
                                    );

                                    if (!relic) {
                                        return null;
                                    }

                                    const owned = relicsOwned.includes(offer.relicId);
                                    const canBuy =
                                        !offer.purchased &&
                                        !owned &&
                                        gold >= offer.price;

                                    return (
                                        <article
                                            key={offer.relicId}
                                            className="relative overflow-hidden border border-stone-800 bg-[radial-gradient(circle_at_top,#24150d,transparent_55%),#100b08] p-6"
                                        >
                                            <div className="flex items-start justify-between gap-5">
                                                <div>
                                                    <p className={`text-[10px] font-bold uppercase tracking-[0.24em] ${rarityClass(relic.rarity)}`}>
                                                        {raritySymbol(relic.rarity)} {relic.rarity} relic
                                                    </p>
                                                    <h3 className="mt-2 font-serif text-2xl font-bold text-stone-100">
                                                        {relic.name}
                                                    </h3>
                                                    <p className="mt-3 max-w-xl text-sm leading-6 text-stone-500">
                                                        {relic.description}
                                                    </p>
                                                </div>

                                                <div className="shrink-0 text-right">
                                                    <p className="text-xl font-bold text-amber-300">
                                                        {offer.price}
                                                    </p>
                                                    <p className="text-[9px] uppercase tracking-[0.2em] text-stone-600">
                                                        Gold
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                disabled={!canBuy}
                                                onClick={() => onBuyRelic(offer.relicId)}
                                                className="mt-6 w-full border border-amber-800/70 bg-amber-950/20 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-amber-300 transition hover:border-amber-500 hover:bg-amber-900/30 disabled:cursor-not-allowed disabled:opacity-30"
                                            >
                                                {offer.purchased ? "Sold" : "Purchase Relic"}
                                            </button>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    <section className="mt-10 grid gap-5 lg:grid-cols-2">
                        <article className="border border-stone-800 bg-[#110c09] p-6">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-stone-600">
                                Service
                            </p>
                            <div className="mt-2 flex items-start justify-between gap-8">
                                <div>
                                    <h3 className="font-serif text-2xl font-bold text-stone-100">
                                        Blood for Blood
                                    </h3>
                                    <p className="mt-2 max-w-xl text-sm leading-6 text-stone-500">
                                        Restore {healAmount} HP. This service can only be used once at this shop.
                                    </p>
                                </div>
                                <p className="text-xl font-bold text-amber-300">
                                    {healPrice}
                                </p>
                            </div>
                            <button
                                type="button"
                                disabled={healPurchased || hpIsFull || gold < healPrice}
                                onClick={onHeal}
                                className="mt-5 w-full border border-stone-700 bg-black/20 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-stone-300 transition hover:border-stone-500 hover:text-stone-100 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                                {healPurchased
                                    ? "Purchased"
                                    : hpIsFull
                                      ? "HP Full"
                                      : "Restore HP"}
                            </button>
                        </article>

                        <article className="border border-stone-800 bg-[#110c09] p-6">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-stone-600">
                                Service
                            </p>
                            <div className="mt-2 flex items-start justify-between gap-8">
                                <div>
                                    <h3 className="font-serif text-2xl font-bold text-stone-100">
                                        Cull the Weak
                                    </h3>
                                    <p className="mt-2 max-w-xl text-sm leading-6 text-stone-500">
                                        Remove one card from your current run deck. Minimum deck size is 10.
                                    </p>
                                </div>
                                <p className="text-xl font-bold text-amber-300">
                                    {removeCardPrice}
                                </p>
                            </div>
                            <button
                                type="button"
                                disabled={!canRemoveCard}
                                onClick={() => setIsRemovingCard(true)}
                                className="mt-5 w-full border border-stone-700 bg-black/20 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-stone-300 transition hover:border-stone-500 hover:text-stone-100 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                                {removeCardPurchased
                                    ? "Purchased"
                                    : deck.length <= 10
                                      ? "Deck at minimum"
                                      : "Choose a Card"}
                            </button>
                        </article>
                    </section>
                </div>

                <footer className="flex items-center justify-between border-t border-stone-800 pt-6">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-stone-700">
                        Deck: {deck.length} / 20
                    </p>
                    <button
                        type="button"
                        onClick={onLeave}
                        className="border border-red-900/70 bg-red-950/20 px-8 py-4 text-xs font-bold uppercase tracking-[0.24em] text-red-300 transition hover:border-red-600 hover:bg-red-900/20"
                    >
                        Leave Shop
                    </button>
                </footer>
            </div>

            {isRemovingCard && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
                    <section className="max-h-[85vh] w-full max-w-5xl overflow-y-auto border border-stone-700 bg-[#0f0a08] p-7 shadow-[0_30px_120px_rgba(0,0,0,0.8)]">
                        <div className="flex items-center justify-between border-b border-stone-800 pb-5">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.35em] text-stone-600">
                                    Cull the Weak
                                </p>
                                <h2 className="mt-1 font-serif text-3xl font-bold uppercase tracking-[0.12em]">
                                    Choose a card to remove
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsRemovingCard(false)}
                                className="border border-stone-700 px-5 py-3 text-xs uppercase tracking-[0.2em] text-stone-400 hover:text-stone-100"
                            >
                                Cancel
                            </button>
                        </div>

                        <div className="mt-7 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
                            {deck.map((card) => (
                                <button
                                    key={card.cardId}
                                    type="button"
                                    onClick={() => {
                                        onRemoveCard(card.cardId);
                                        setIsRemovingCard(false);
                                    }}
                                    className="group rounded-xl text-left transition hover:-translate-y-1"
                                >
                                    <Card
                                        card={card}
                                        disabled
                                        onClick={() => {}}
                                    />
                                    <p className="mt-2 text-center text-[10px] uppercase tracking-[0.16em] text-stone-600 transition group-hover:text-red-300">
                                        Remove
                                    </p>
                                </button>
                            ))}
                        </div>
                    </section>
                </div>
            )}
        </main>
    );
}

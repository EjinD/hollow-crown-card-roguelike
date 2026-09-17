import { useMemo, useState } from "react";
import { cards } from "../data/cards";
import { MAX_DECK_SIZE, MIN_DECK_SIZE } from "../consts/game";
import {
    CRAFT_COST_BY_RARITY,
    MAX_CARD_COPIES,
} from "../state/meta-state";
import type { CardRarity } from "../types/game";
import type { MetaProgressState } from "../types/meta";
import type { CardDefinition } from "../types/game";
import CardArtwork from "./CardArtwork";

interface DeckBuilderScreenProps {
    meta: MetaProgressState;
    onSave: (deck: string[]) => boolean;
    onCraft: (cardId: string) => boolean;
    onBack: () => void;
}

const RARITY_STYLES: Record<
    CardRarity,
    { label: string; border: string; text: string }
> = {
    common: {
        label: "Common",
        border: "border-stone-700",
        text: "text-stone-300",
    },
    uncommon: {
        label: "Uncommon",
        border: "border-emerald-700/70",
        text: "text-emerald-300",
    },
    rare: {
        label: "Rare",
        border: "border-sky-700/70",
        text: "text-sky-300",
    },
    legendary: {
        label: "Legendary",
        border: "border-amber-700/80",
        text: "text-amber-300",
    },
};

function CardTile({
    card,
    count,
    selected,
    dust,
    onToggle,
    onCraft,
}: {
    card: CardDefinition;
    count: number;
    selected: boolean;
    dust: number;
    onToggle: () => void;
    onCraft: () => void;
}) {
    const rarity = RARITY_STYLES[card.rarity];
    const craftCost = CRAFT_COST_BY_RARITY[card.rarity];

    return (
        <article
            className={`border bg-[#100c09] p-4 ${rarity.border} ${
                selected ? "ring-1 ring-orange-500/70" : ""
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p
                        className={`text-[9px] uppercase tracking-[0.25em] ${rarity.text}`}
                    >
                        {rarity.label}
                    </p>
                    <h3 className="mt-2 font-serif text-base font-bold uppercase tracking-[0.08em] text-stone-100">
                        {card.name}
                    </h3>
                </div>

                <span className="text-xs font-bold text-stone-400">
                    {count}/{MAX_CARD_COPIES}
                </span>
            </div>

            <CardArtwork
                cardId={card.id}
                alt={card.name}
                className="mt-4 h-36 border border-stone-800"
                imageClassName="p-1"
            />

            <div className="mt-4 flex flex-wrap gap-1.5">
                {card.effects.map((effect, index) => (
                    <span
                        key={`${effect.type}-${index}`}
                        className="border border-stone-800 bg-black/20 px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-stone-500"
                    >
                        {effect.type === "damage" && `Damage ${effect.amount}`}
                        {effect.type === "burn" &&
                            `Burn ${effect.amount}/${effect.duration}`}
                        {effect.type === "block" && `Block ${effect.amount}`}
                        {effect.type === "gain-action" &&
                            `+${effect.amount} Action`}
                        {effect.type === "draw" && `Draw ${effect.amount}`}
                        {effect.type === "heal" && `Heal ${effect.amount}`}
                    </span>
                ))}
            </div>

            <div className="mt-5 flex gap-2">
                <button
                    type="button"
                    onClick={onToggle}
                    disabled={count === 0 && !selected}
                    className={`flex-1 border px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em] transition ${
                        selected
                            ? "border-orange-700 bg-orange-950/30 text-orange-200 hover:border-orange-500"
                            : "border-stone-700 bg-[#17110d] text-stone-300 hover:border-stone-500"
                    } disabled:cursor-not-allowed disabled:opacity-30`}
                >
                    {selected ? "Remove from deck" : "Add to deck"}
                </button>

                <button
                    type="button"
                    onClick={onCraft}
                    disabled={
                        count >= MAX_CARD_COPIES ||
                        dust < craftCost
                    }
                    className="border border-stone-700 bg-[#17110d] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-stone-300 transition hover:border-stone-500 disabled:cursor-not-allowed disabled:opacity-30"
                >
                    Craft {craftCost}
                </button>
            </div>
        </article>
    );
}

export default function DeckBuilderScreen({
    meta,
    onSave,
    onCraft,
    onBack,
}: DeckBuilderScreenProps) {
    const [deck, setDeck] = useState<string[]>(
        () => [...meta.deck],
    );
    const [message, setMessage] = useState("");

    const sortedCards = useMemo(
        () =>
            [...cards].sort((a, b) => {
                const rarityOrder: Record<CardRarity, number> = {
                    common: 0,
                    uncommon: 1,
                    rare: 2,
                    legendary: 3,
                };

                return (
                    rarityOrder[a.rarity] -
                        rarityOrder[b.rarity] ||
                    a.name.localeCompare(b.name)
                );
            }),
        [],
    );

    function toggleCard(cardId: string) {
        setMessage("");

        if (deck.includes(cardId)) {
            setDeck((current) =>
                current.filter((id) => id !== cardId),
            );
            return;
        }

        if (deck.length >= MAX_DECK_SIZE) {
            setMessage(
                `The deck cannot contain more than ${MAX_DECK_SIZE} cards.`,
            );
            return;
        }

        if ((meta.cardCollection[cardId] ?? 0) <= 0) {
            setMessage(
                "You do not own this card yet.",
            );
            return;
        }

        setDeck((current) => [...current, cardId]);
    }

    function handleSave() {
        if (deck.length < MIN_DECK_SIZE) {
            setMessage(
                `The deck needs at least ${MIN_DECK_SIZE} cards.`,
            );
            return;
        }

        if (onSave(deck)) {
            setMessage("Deck prepared for the next descent.");
        } else {
            setMessage("Unable to save this deck.");
        }
    }

    return (
        <main className="min-h-screen overflow-y-auto bg-[#080706] px-8 py-8 text-stone-200">
            <div className="mx-auto max-w-7xl">
                <header className="flex flex-col gap-6 border-b border-stone-800 pb-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-[9px] uppercase tracking-[0.4em] text-stone-600">
                            Ashen Bastion · Loadout
                        </p>
                        <h1 className="mt-2 font-serif text-4xl font-bold uppercase tracking-[0.14em] text-stone-100">
                            Deck Builder
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
                            Build a deck of unique cards for the next expedition. A card can appear only once in the deck.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="border border-stone-800 bg-[#100c09] px-5 py-3 text-right">
                            <p className="text-[9px] uppercase tracking-[0.25em] text-stone-600">
                                Deck
                            </p>
                            <p className="mt-1 text-lg font-bold text-stone-100">
                                {deck.length}/{MAX_DECK_SIZE}
                            </p>
                        </div>

                        <div className="border border-stone-800 bg-[#100c09] px-5 py-3 text-right">
                            <p className="text-[9px] uppercase tracking-[0.25em] text-stone-600">
                                Dust
                            </p>
                            <p className="mt-1 text-lg font-bold text-amber-300">
                                ✦ {meta.dust}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onBack}
                            className="border border-stone-700 bg-[#17110d] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-stone-300 hover:border-stone-500"
                        >
                            Back
                        </button>
                    </div>
                </header>

                {message && (
                    <div className="mt-6 border border-orange-900/60 bg-orange-950/10 px-5 py-4 text-sm text-orange-200">
                        {message}
                    </div>
                )}

                <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {sortedCards.map((card) => (
                        <CardTile
                            key={card.id}
                            card={card}
                            count={meta.cardCollection[card.id] ?? 0}
                            selected={deck.includes(card.id)}
                            dust={meta.dust}
                            onToggle={() => toggleCard(card.id)}
                            onCraft={() => {
                                if (onCraft(card.id)) {
                                    setMessage(
                                        `${card.name} crafted.`,
                                    );
                                } else {
                                    setMessage(
                                        "Not enough Dust or the collection already contains two copies.",
                                    );
                                }
                            }}
                        />
                    ))}
                </section>

                <footer className="mt-8 flex flex-col gap-4 border-t border-stone-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs leading-5 text-stone-600">
                        Collection holds at most two copies. The deck itself allows one copy per card.
                        Surplus copies from packs become Dust.
                    </p>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={deck.length < MIN_DECK_SIZE}
                        className="border border-orange-800 bg-[#24120d] px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-orange-200 transition hover:border-orange-600 hover:bg-[#351711] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        Save Deck
                    </button>
                </footer>
            </div>
        </main>
    );
}

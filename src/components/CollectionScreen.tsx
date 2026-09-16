import { useMemo, useState } from "react";

import { cards } from "../data/cards";
import { MAX_DECK_SIZE, MIN_DECK_SIZE } from "../consts/game";
import type { CardCategory, CardRarity } from "../types/game";
import type { MetaProgressState } from "../types/meta";
import {
    CARD_CRAFT_COST_BY_RARITY,
    MAX_CARD_COPIES,
} from "../state/meta-state";

interface CollectionScreenProps {
    meta: MetaProgressState;
    onSaveDeck: (cardIds: string[]) => boolean;
    onCraftCard: (cardId: string) => boolean;
    onClose: () => void;
}

type OwnershipFilter = "all" | "owned" | "missing" | "in-deck";
type SortMode = "name" | "rarity" | "count";

const rarityMeta: Record<CardRarity, { label: string; className: string; dot: string }> = {
    common: { label: "Common", className: "border-stone-700 text-stone-300", dot: "bg-stone-300" },
    uncommon: { label: "Uncommon", className: "border-emerald-700/80 text-emerald-300", dot: "bg-emerald-300" },
    rare: { label: "Rare", className: "border-blue-700/80 text-blue-300", dot: "bg-blue-300" },
    legendary: { label: "Legendary", className: "border-amber-600/90 text-amber-300", dot: "bg-amber-300" },
};

const categoryLabel: Record<CardCategory, string> = {
    attack: "Attack",
    skill: "Skill",
    power: "Power",
};

function rarityOrder(rarity: CardRarity): number {
    return { common: 0, uncommon: 1, rare: 2, legendary: 3 }[rarity];
}

function cardEffectText(effect: (typeof cards)[number]["effects"][number]): string {
    switch (effect.type) {
        case "damage": return `Deal ${effect.amount} damage.`;
        case "piercing-damage": return `Deal ${effect.amount} Piercing damage.`;
        case "shatter": return `Deal ${effect.amount} damage and remove enemy Block.`;
        case "burn": return `Apply ${effect.amount} Burn for ${effect.duration} turns.`;
        case "block": return `Gain ${effect.amount} Block.`;
        case "gain-action": return `Gain ${effect.amount} additional Action.`;
        case "draw": return `Draw ${effect.amount} card${effect.amount === 1 ? "" : "s"}.`;
        case "heal": return `Restore ${effect.amount} HP.`;
        case "reduce-strength": return `Reduce enemy Strength by ${effect.amount}.`;
        case "cleanse-weak": return `Remove all Weak.`;
        case "damage-if-burn": return `Deal ${effect.amount} damage, +${effect.bonusDamage} if Burning.`;
        case "damage-if-player-weak": return `Deal ${effect.amount} damage, +${effect.bonusDamage} while Weak.`;
    }
}

function CardTile({
    card,
    copies,
    inDeck,
    selected,
    onSelect,
}: {
    card: (typeof cards)[number];
    copies: number;
    inDeck: boolean;
    selected: boolean;
    onSelect: () => void;
}) {
    const rarity = rarityMeta[card.rarity];

    return (
        <button
            type="button"
            onClick={onSelect}
            className={[
                "group relative overflow-hidden border bg-[#0c0907] p-3 text-left transition duration-300",
                selected ? "-translate-y-1 border-orange-700 shadow-[0_0_35px_rgba(194,65,12,0.14)]" : "border-stone-800 hover:-translate-y-1 hover:border-stone-700",
            ].join(" ")}
        >
            <div className="flex items-start justify-between gap-2">
                <span className={`border px-1.5 py-1 text-[7px] font-bold uppercase tracking-[0.18em] ${rarity.className}`}>{rarity.label}</span>
                <span className="flex items-center gap-1 text-[8px] uppercase tracking-[0.14em] text-stone-600">{card.cooldown ? `CD ${card.cooldown}` : "No CD"}</span>
            </div>

            <div className="mt-4 flex h-28 items-center justify-center border border-stone-800 bg-[radial-gradient(circle,_rgba(126,46,17,0.16),_rgba(0,0,0,0.2)_68%)]">
                <span className="text-4xl text-orange-400/55 transition duration-300 group-hover:scale-110 group-hover:text-orange-300">✦</span>
            </div>

            <h3 className="mt-4 truncate font-serif text-base font-bold uppercase tracking-[0.05em] text-stone-100">{card.name}</h3>
            <p className="mt-1 text-[8px] uppercase tracking-[0.22em] text-stone-600">{categoryLabel[card.category]}</p>

            <div className="mt-4 flex items-center justify-between border-t border-stone-800 pt-3">
                <span className="text-[9px] font-bold text-stone-400">{copies} / {MAX_CARD_COPIES}</span>
                <span className={[
                    "text-[8px] font-bold uppercase tracking-[0.18em]",
                    inDeck ? "text-orange-300" : "text-stone-600",
                ].join(" ")}>{inDeck ? "In Deck" : "Collection"}</span>
            </div>
        </button>
    );
}

export default function CollectionScreen({
    meta,
    onSaveDeck,
    onCraftCard,
    onClose,
}: CollectionScreenProps) {
    const [deck, setDeck] = useState<string[]>(meta.savedDeck);
    const [category, setCategory] = useState<CardCategory | "all">("all");
    const [rarity, setRarity] = useState<CardRarity | "all">("all");
    const [ownership, setOwnership] = useState<OwnershipFilter>("owned");
    const [sort, setSort] = useState<SortMode>("name");
    const [search, setSearch] = useState("");
    const [selectedCardId, setSelectedCardId] = useState(meta.savedDeck[0] ?? cards[0]?.id ?? "");
    const [message, setMessage] = useState<string | null>(null);

    const selectedCard = cards.find((card) => card.id === selectedCardId);

    const filteredCards = useMemo(() => {
        const query = search.trim().toLowerCase();

        return [...cards]
            .filter((card) => {
                const copies = meta.cardCollection[card.id] ?? 0;
                const inDeck = deck.includes(card.id);

                if (category !== "all" && card.category !== category) return false;
                if (rarity !== "all" && card.rarity !== rarity) return false;
                if (query && !card.name.toLowerCase().includes(query)) return false;
                if (ownership === "owned" && copies <= 0) return false;
                if (ownership === "missing" && copies > 0) return false;
                if (ownership === "in-deck" && !inDeck) return false;

                return true;
            })
            .sort((a, b) => {
                if (sort === "rarity") return rarityOrder(a.rarity) - rarityOrder(b.rarity) || a.name.localeCompare(b.name);
                if (sort === "count") return (meta.cardCollection[b.id] ?? 0) - (meta.cardCollection[a.id] ?? 0) || a.name.localeCompare(b.name);
                return a.name.localeCompare(b.name);
            });
    }, [category, rarity, ownership, sort, search, meta.cardCollection, deck]);

    const discoveredCount = cards.filter((card) => (meta.cardCollection[card.id] ?? 0) > 0).length;
    const collectionCopies = Object.values(meta.cardCollection).reduce((sum, count) => sum + count, 0);

    const selectedCopies = selectedCard ? meta.cardCollection[selectedCard.id] ?? 0 : 0;
    const selectedInDeck = selectedCard ? deck.includes(selectedCard.id) : false;
    const selectedCraftCost = selectedCard ? CARD_CRAFT_COST_BY_RARITY[selectedCard.rarity] : 0;

    function addToDeck(cardId: string) {
        const copies = meta.cardCollection[cardId] ?? 0;
        if (copies <= 0 || deck.includes(cardId) || deck.length >= MAX_DECK_SIZE) return;
        setDeck((current) => [...current, cardId]);
        setMessage(null);
    }

    function removeFromDeck(cardId: string) {
        if (deck.length <= MIN_DECK_SIZE) {
            setMessage(`A deck needs at least ${MIN_DECK_SIZE} cards.`);
            return;
        }
        setDeck((current) => current.filter((id) => id !== cardId));
        setMessage(null);
    }

    function handleSave() {
        if (deck.length < MIN_DECK_SIZE || deck.length > MAX_DECK_SIZE) {
            setMessage(`Deck must contain ${MIN_DECK_SIZE}–${MAX_DECK_SIZE} cards.`);
            return;
        }
        if (!onSaveDeck(deck)) {
            setMessage("Deck could not be saved. Check your collection.");
            return;
        }
        setMessage("Deck saved. It will be used in your next descent.");
    }

    function handleCraft() {
        if (!selectedCard) return;
        if (selectedCopies >= MAX_CARD_COPIES) {
            setMessage("This card is already at the collection cap.");
            return;
        }
        if (meta.dust < selectedCraftCost) {
            setMessage("Not enough Dust to craft this card.");
            return;
        }
        const crafted = onCraftCard(selectedCard.id);
        setMessage(crafted ? `${selectedCard.name} crafted.` : "Craft failed.");
    }

    const deckValid = deck.length >= MIN_DECK_SIZE && deck.length <= MAX_DECK_SIZE;

    return (
        <main className="min-h-screen bg-[#070605] text-stone-200">
            <div className="min-h-screen bg-[radial-gradient(circle_at_40%_20%,_rgba(112,38,15,0.12),_transparent_50%)]">
                <header className="sticky top-0 z-30 border-b border-stone-900 bg-[#080706]/92 px-7 py-5 backdrop-blur-md">
                    <div className="flex flex-wrap items-end justify-between gap-5">
                        <div>
                            <p className="text-[9px] uppercase tracking-[0.42em] text-stone-600">Ashen Bastion · Archive</p>
                            <h1 className="mt-2 font-serif text-3xl font-bold uppercase tracking-[0.16em] text-stone-100">Collection & Deck</h1>
                            <p className="mt-2 text-xs text-stone-600">{discoveredCount} / {cards.length} cards discovered · {collectionCopies} copies · Deck {deck.length}/{MAX_DECK_SIZE}</p>
                        </div>
                        <div className="flex items-center gap-5">
                            <div className="text-right"><p className="text-[8px] uppercase tracking-[0.24em] text-stone-600">Hub Gold</p><p className="mt-1 font-bold text-amber-300">◆ {meta.hubGold}</p></div>
                            <div className="text-right"><p className="text-[8px] uppercase tracking-[0.24em] text-stone-600">Dust</p><p className="mt-1 font-bold text-violet-300">◆ {meta.dust}</p></div>
                            <button type="button" onClick={onClose} className="border border-stone-800 px-4 py-3 text-[9px] font-bold uppercase tracking-[0.18em] text-stone-400 transition hover:border-stone-600 hover:text-stone-200">Back</button>
                        </div>
                    </div>
                </header>

                <div className="mx-auto grid max-w-[1500px] grid-cols-[minmax(0,1fr)_360px] gap-5 p-5">
                    <section className="min-w-0 border border-stone-800 bg-[#0b0907]/95">
                        <div className="sticky top-[91px] z-20 border-b border-stone-800 bg-[#0b0907]/96 p-4 backdrop-blur-md">
                            <div className="flex flex-wrap gap-2">
                                {(["all", "attack", "skill", "power"] as const).map((value) => (
                                    <button key={value} type="button" onClick={() => setCategory(value)} className={`border px-3 py-2 text-[8px] font-bold uppercase tracking-[0.18em] transition ${category === value ? "border-orange-700 bg-[#25120c] text-orange-200" : "border-stone-800 text-stone-600 hover:border-stone-600 hover:text-stone-300"}`}>{value === "all" ? "All Types" : categoryLabel[value]}</button>
                                ))}
                                <span className="mx-1 w-px bg-stone-800" />
                                {(["all", "common", "uncommon", "rare", "legendary"] as const).map((value) => (
                                    <button key={value} type="button" onClick={() => setRarity(value)} className={`border px-3 py-2 text-[8px] font-bold uppercase tracking-[0.18em] transition ${rarity === value ? "border-orange-700 bg-[#25120c] text-orange-200" : "border-stone-800 text-stone-600 hover:border-stone-600 hover:text-stone-300"}`}>{value === "all" ? "All Rarities" : rarityMeta[value].label}</button>
                                ))}
                            </div>
                            <div className="mt-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_170px_170px]">
                                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search cards..." className="border border-stone-800 bg-[#070605] px-4 py-3 text-xs text-stone-200 outline-none placeholder:text-stone-700 focus:border-orange-800" />
                                <select value={ownership} onChange={(event) => setOwnership(event.target.value as OwnershipFilter)} className="border border-stone-800 bg-[#070605] px-3 py-3 text-[9px] uppercase tracking-[0.14em] text-stone-400 outline-none focus:border-orange-800">
                                    <option value="owned">Owned</option><option value="all">All Cards</option><option value="missing">Missing</option><option value="in-deck">In Deck</option>
                                </select>
                                <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)} className="border border-stone-800 bg-[#070605] px-3 py-3 text-[9px] uppercase tracking-[0.14em] text-stone-400 outline-none focus:border-orange-800">
                                    <option value="name">Sort: Name</option><option value="rarity">Sort: Rarity</option><option value="count">Sort: Copies</option>
                                </select>
                            </div>
                        </div>

                        <div className="p-5">
                            {filteredCards.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3 xl:grid-cols-3 2xl:grid-cols-4">
                                    {filteredCards.map((card) => (
                                        <CardTile key={card.id} card={card} copies={meta.cardCollection[card.id] ?? 0} inDeck={deck.includes(card.id)} selected={selectedCardId === card.id} onSelect={() => setSelectedCardId(card.id)} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex min-h-[420px] items-center justify-center border border-dashed border-stone-800 text-center">
                                    <div><p className="text-[10px] uppercase tracking-[0.3em] text-stone-600">Nothing found</p><p className="mt-2 text-sm text-stone-500">Change the filters or search term.</p></div>
                                </div>
                            )}
                        </div>
                    </section>

                    <aside className="sticky top-[112px] flex h-[calc(100vh-132px)] flex-col gap-4">
                        <section className="flex min-h-0 flex-1 flex-col border border-stone-800 bg-[#0b0907]/95">
                            <div className="border-b border-stone-800 p-5">
                                <div className="flex items-center justify-between"><div><p className="text-[8px] uppercase tracking-[0.3em] text-orange-700">Saved Run Deck</p><h2 className="mt-1 font-serif text-2xl font-bold uppercase tracking-[0.09em] text-stone-100">My Deck</h2></div><span className={deckValid ? "text-orange-200" : "text-red-300"}>{deck.length}/{MAX_DECK_SIZE}</span></div>
                                <div className="mt-4 h-1 bg-stone-900"><div className="h-full bg-orange-700 transition-all" style={{ width: `${Math.min(100, (deck.length / MAX_DECK_SIZE) * 100)}%` }} /></div>
                            </div>
                            <div className="min-h-0 flex-1 overflow-y-auto p-3">
                                <div className="space-y-1.5">
                                    {deck.map((cardId, index) => {
                                        const card = cards.find((item) => item.id === cardId);
                                        if (!card) return null;
                                        return (
                                            <div key={card.id} className="group flex items-center gap-3 border border-stone-800 bg-[#0f0c09] px-3 py-2 transition hover:border-stone-700">
                                                <span className="w-5 text-[9px] text-stone-700">{index + 1}</span>
                                                <button type="button" onClick={() => setSelectedCardId(card.id)} className="min-w-0 flex-1 text-left"><p className="truncate text-xs font-semibold text-stone-200">{card.name}</p><p className={`mt-0.5 text-[7px] uppercase tracking-[0.17em] ${rarityMeta[card.rarity].className.split(" ").pop()}`}>{rarityMeta[card.rarity].label}</p></button>
                                                <button type="button" onClick={() => removeFromDeck(card.id)} className="text-stone-700 opacity-0 transition hover:text-red-300 group-hover:opacity-100" aria-label={`Remove ${card.name}`}>×</button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="border-t border-stone-800 p-4">
                                <button type="button" onClick={handleSave} disabled={!deckValid} className="w-full border border-orange-700 bg-[#25120c] px-4 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-orange-100 transition hover:border-orange-500 disabled:cursor-not-allowed disabled:border-stone-900 disabled:bg-[#100d0a] disabled:text-stone-700">Save Deck</button>
                                {message && <p className="mt-3 text-center text-[10px] leading-4 text-stone-500">{message}</p>}
                            </div>
                        </section>

                        <section className="border border-stone-800 bg-[#0b0907]/95 p-5">
                            {selectedCard ? (
                                <>
                                    <div className="flex items-start justify-between gap-3">
                                        <div><span className={`border px-2 py-1 text-[7px] font-bold uppercase tracking-[0.18em] ${rarityMeta[selectedCard.rarity].className}`}>{rarityMeta[selectedCard.rarity].label}</span><h3 className="mt-3 font-serif text-2xl font-bold uppercase text-stone-100">{selectedCard.name}</h3><p className="mt-1 text-[8px] uppercase tracking-[0.22em] text-stone-600">{categoryLabel[selectedCard.category]} · {selectedCard.cooldown ? `Cooldown ${selectedCard.cooldown}` : "No Cooldown"}</p></div>
                                        <div className="text-right"><p className="text-[7px] uppercase tracking-[0.18em] text-stone-600">Owned</p><p className="mt-1 font-bold text-amber-300">{selectedCopies}/{MAX_CARD_COPIES}</p></div>
                                    </div>
                                    <div className="mt-4 space-y-2 text-[10px] leading-4 text-stone-400">{selectedCard.effects.map((effect, index) => <p key={`${effect.type}-${index}`}>• {cardEffectText(effect)}</p>)}</div>
                                    <div className="mt-5 grid grid-cols-2 gap-2">
                                        <button type="button" onClick={() => addToDeck(selectedCard.id)} disabled={selectedCopies <= 0 || selectedInDeck || deck.length >= MAX_DECK_SIZE} className="border border-orange-800 bg-[#24120d] px-3 py-3 text-[8px] font-bold uppercase tracking-[0.18em] text-orange-200 transition hover:border-orange-600 disabled:cursor-not-allowed disabled:border-stone-900 disabled:bg-[#100d0a] disabled:text-stone-700">{selectedInDeck ? "In Deck" : "Add to Deck"}</button>
                                        <button type="button" onClick={handleCraft} disabled={selectedCopies >= MAX_CARD_COPIES || meta.dust < selectedCraftCost} className="border border-violet-900/70 bg-violet-950/20 px-3 py-3 text-[8px] font-bold uppercase tracking-[0.18em] text-violet-200 transition hover:border-violet-700 disabled:cursor-not-allowed disabled:border-stone-900 disabled:text-stone-700">Craft · {selectedCraftCost}</button>
                                    </div>
                                </>
                            ) : <p className="text-xs text-stone-600">Select a card to inspect it.</p>}
                        </section>
                    </aside>
                </div>
            </div>
        </main>
    );
}

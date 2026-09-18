import {
    useEffect,
    useMemo,
    useState,
    type DragEvent,
} from "react";

import battlefieldBackground from "../assets/combat/battlefield.png";
import { cards } from "../data/cards";
import { MAX_DECK_SIZE, MIN_DECK_SIZE } from "../consts/game";
import type {
    CardCategory,
    CardDefinition,
    CardEffect,
    CardRarity,
} from "../types/game";
import type { MetaProgressState } from "../types/meta";
import {
    CARD_CRAFT_COST_BY_RARITY,
    MAX_CARD_COPIES,
} from "../state/meta-state";
import CardArtwork from "./CardArtwork";

interface CollectionScreenProps {
    meta: MetaProgressState;
    onSaveDeck: (cardIds: string[]) => boolean;
    onCraftCard: (cardId: string) => boolean;
    onClose: () => void;
}

type OwnershipFilter = "all" | "owned" | "missing" | "in-deck";
type SortMode = "name" | "rarity" | "count";

const PAGE_SIZE = 8;

type RarityMeta = {
    label: string;
    crystal: string;
};

const rarityMeta: Record<CardRarity, RarityMeta> = {
    common: { label: "Common", crystal: "collection-rarity-crystal--common" },
    uncommon: { label: "Uncommon", crystal: "collection-rarity-crystal--uncommon" },
    rare: { label: "Rare", crystal: "collection-rarity-crystal--rare" },
    legendary: { label: "Legendary", crystal: "collection-rarity-crystal--legendary" },
};

const categoryLabel: Record<CardCategory, string> = {
    attack: "Attack",
    skill: "Skill",
    power: "Power",
};

function rarityOrder(rarity: CardRarity): number {
    return { common: 0, uncommon: 1, rare: 2, legendary: 3 }[rarity];
}

function effectIcon(effect: CardEffect): string {
    switch (effect.type) {
        case "damage":
        case "piercing-damage":
        case "shatter":
        case "damage-if-burn":
        case "damage-if-player-weak":
            return "✦";
        case "burn":
            return "♨";
        case "block":
            return "⬢";
        case "gain-action":
            return "⚡";
        case "draw":
            return "⌁";
        case "heal":
            return "✚";
        case "reduce-strength":
            return "↓";
        case "cleanse-weak":
            return "✧";
        case "recover-exiled":
        case "recover-all-exiled":
            return "↶";
    }
}

function effectIconTone(effect: CardEffect): string {
    switch (effect.type) {
        case "damage":
        case "piercing-damage":
        case "shatter":
        case "damage-if-burn":
        case "damage-if-player-weak":
        case "burn":
            return "collection-effect-icon--fire";
        case "block":
            return "collection-effect-icon--guard";
        case "gain-action":
            return "collection-effect-icon--action";
        case "draw":
            return "collection-effect-icon--draw";
        case "heal":
            return "collection-effect-icon--heal";
        case "reduce-strength":
        case "cleanse-weak":
            return "collection-effect-icon--arcane";
        case "recover-exiled":
        case "recover-all-exiled":
            return "collection-effect-icon--void";
    }
}

function effectDescription(effect: CardEffect): string {
    switch (effect.type) {
        case "damage":
            return `Deal ${effect.amount} damage.`;
        case "piercing-damage":
            return `Deal ${effect.amount} Piercing damage.`;
        case "shatter":
            return `Deal ${effect.amount} damage and remove enemy Block.`;
        case "burn":
            return `Apply ${effect.amount} Burn for ${effect.duration} turns.`;
        case "block":
            return `Gain ${effect.amount} Block.`;
        case "gain-action":
            return `Gain ${effect.amount} additional Action.`;
        case "draw":
            return `Draw ${effect.amount} card${effect.amount === 1 ? "" : "s"}.`;
        case "heal":
            return `Restore ${effect.amount} HP.`;
        case "reduce-strength":
            return `Reduce enemy Strength by ${effect.amount}.`;
        case "cleanse-weak":
            return "Remove all Weak.";
        case "damage-if-burn":
            return `Deal ${effect.amount} damage, +${effect.bonusDamage} if Burning.`;
        case "damage-if-player-weak":
            return `Deal ${effect.amount} damage, +${effect.bonusDamage} while Weak.`;
        case "recover-exiled":
            return `Return ${effect.amount} Exiled card${effect.amount === 1 ? "" : "s"}.`;
        case "recover-all-exiled":
            return "Return all Exiled cards to the Draw Pile.";
    }
}

function randomize<T>(items: T[]): T[] {
    const copy = [...items];

    for (let index = copy.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }

    return copy;
}

function RarityBadge({ rarity }: { rarity: CardRarity }) {
    const meta = rarityMeta[rarity];

    return (
        <div className="collection-rarity" aria-label={`Rarity: ${meta.label}`}>
            <span className={`collection-rarity-crystal ${meta.crystal}`} aria-hidden="true" />
            <span>{meta.label}</span>
        </div>
    );
}

function CardFace({
    card,
    copies,
    inDeck,
    selected = false,
    onClick,
    onDoubleClick,
    onDragStart,
    compact = false,
}: {
    card: CardDefinition;
    copies: number;
    inDeck: boolean;
    selected?: boolean;
    onClick?: () => void;
    onDoubleClick?: () => void;
    onDragStart?: (event: DragEvent<HTMLButtonElement>) => void;
    compact?: boolean;
}) {
    const content = (
        <div className={`collection-card-face ${compact ? "collection-card-face--compact" : ""} ${selected ? "is-selected" : ""}`}>
            <div className="collection-card-face__inner">
                <div className="collection-card-face__art">
                    <CardArtwork
                        cardId={card.id}
                        alt={card.name}
                        className="absolute inset-0"
                        imageClassName="h-full w-full object-contain p-1"
                    />
                    <div className="collection-card-face__art-glow" />
                </div>

                <div className="collection-card-face__name">{card.name}</div>
                <RarityBadge rarity={card.rarity} />

                <div className="collection-card-face__type">
                    {categoryLabel[card.category]}
                </div>

                {!compact && (
                    <div className="collection-card-face__description">
                        {card.effects.map((effect, index) => (
                            <div className="collection-card-face__effect" key={`${effect.type}-${index}`}>
                                <span className={`collection-effect-icon ${effectIconTone(effect)}`} aria-hidden="true">
                                    {effectIcon(effect)}
                                </span>
                                <span>{effectDescription(effect)}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="collection-card-face__footer">
                    <span>{copies}/{MAX_CARD_COPIES} owned</span>
                    <span className={inDeck ? "is-active" : ""}>
                        {inDeck ? "In Deck" : "Collection"}
                    </span>
                </div>
            </div>
        </div>
    );

    if (!onClick && !onDoubleClick && !onDragStart) {
        return content;
    }

    return (
        <button
            type="button"
            className="collection-card-button"
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            draggable={Boolean(onDragStart)}
            onDragStart={onDragStart}
            aria-label={`${card.name}. Click to inspect. Double-click to ${inDeck ? "remove from" : "add to"} deck.`}
        >
            {content}
        </button>
    );
}

function DeckValidationModal({
    deckLength,
    onFill,
    onContinue,
}: {
    deckLength: number;
    onFill: () => void;
    onContinue: () => void;
}) {
    return (
        <div className="collection-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="deck-validation-title">
            <div className="collection-validation-modal">
                <div className="collection-modal-kicker">THE HOLLOW CROWN · DECK CHECK</div>
                <h2 id="deck-validation-title">Deck Incomplete</h2>
                <p>
                    A descent requires at least {MIN_DECK_SIZE} cards. Your current deck contains {deckLength}.
                </p>
                <div className="collection-validation-count">
                    <span>{deckLength}</span>
                    <span>/</span>
                    <span>{MIN_DECK_SIZE}</span>
                    <small>required</small>
                </div>
                <div className="collection-validation-actions">
                    <button type="button" onClick={onFill} className="collection-action-button collection-action-button--primary">
                        Fill to {MIN_DECK_SIZE}
                    </button>
                    <button type="button" onClick={onContinue} className="collection-action-button">
                        Continue Editing
                    </button>
                </div>
            </div>
        </div>
    );
}

function CardInspectModal({
    card,
    copies,
    inDeck,
    dust,
    craftCost,
    onClose,
    onToggleDeck,
    onCraft,
}: {
    card: CardDefinition;
    copies: number;
    inDeck: boolean;
    dust: number;
    craftCost: number;
    onClose: () => void;
    onToggleDeck: () => void;
    onCraft: () => void;
}) {
    const canCraft = copies < MAX_CARD_COPIES && dust >= craftCost;

    return (
        <div
            className="collection-modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-labelledby="card-inspect-title"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="collection-inspect-modal">
                <button type="button" className="collection-inspect-close" onClick={onClose} aria-label="Close card inspection">
                    ×
                </button>

                <div className="collection-inspect-layout">
                    <div className="collection-inspect-card-wrap">
                        <CardFace
                            card={card}
                            copies={copies}
                            inDeck={inDeck}
                        />
                    </div>

                    <section className="collection-inspect-details">
                        <div className="collection-modal-kicker">CARD INSPECTION</div>
                        <h2 id="card-inspect-title">{card.name}</h2>
                        <RarityBadge rarity={card.rarity} />
                        <div className="collection-inspect-category">{categoryLabel[card.category]}</div>

                        <div className="collection-inspect-divider" />

                        <div className="collection-inspect-effects">
                            {card.effects.map((effect, index) => (
                                <p key={`${effect.type}-${index}`}>{effectDescription(effect)}</p>
                            ))}
                        </div>

                        <div className="collection-inspect-stats">
                            <div>
                                <span>Owned</span>
                                <strong>{copies}/{MAX_CARD_COPIES}</strong>
                            </div>
                            <div>
                                <span>Dust</span>
                                <strong>{dust}</strong>
                            </div>
                            <div>
                                <span>Create</span>
                                <strong>{craftCost}</strong>
                            </div>
                        </div>

                        <div className="collection-inspect-actions">
                            <button type="button" onClick={onToggleDeck} className="collection-action-button collection-action-button--primary">
                                {inDeck ? "Remove from Deck" : "Add to Deck"}
                            </button>
                            <button
                                type="button"
                                onClick={onCraft}
                                disabled={!canCraft}
                                className="collection-action-button collection-action-button--craft"
                            >
                                {copies >= MAX_CARD_COPIES ? "Collection Full" : `Create · ${craftCost} Dust`}
                            </button>
                        </div>

                        <p className="collection-inspect-hint">
                            Double-click a card to add or remove it from the deck. Drag cards into My Deck for direct placement.
                        </p>
                    </section>
                </div>
            </div>
        </div>
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
    const [page, setPage] = useState(1);
    const [selectedCardId, setSelectedCardId] = useState(meta.savedDeck[0] ?? cards[0]?.id ?? "");
    const [inspectCardId, setInspectCardId] = useState<string | null>(null);
    const [showValidation, setShowValidation] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const inspectCard = cards.find((card) => card.id === inspectCardId);

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
                if (sort === "rarity") {
                    return rarityOrder(a.rarity) - rarityOrder(b.rarity) || a.name.localeCompare(b.name);
                }

                if (sort === "count") {
                    return (meta.cardCollection[b.id] ?? 0) - (meta.cardCollection[a.id] ?? 0) || a.name.localeCompare(b.name);
                }

                return a.name.localeCompare(b.name);
            });
    }, [category, rarity, ownership, sort, search, meta.cardCollection, deck]);

    const totalPages = Math.max(1, Math.ceil(filteredCards.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const visibleCards = filteredCards.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    useEffect(() => {
        setPage(1);
    }, [category, rarity, ownership, sort, search]);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                if (showValidation) {
                    setShowValidation(false);
                    return;
                }

                if (inspectCardId) {
                    setInspectCardId(null);
                    return;
                }

                handleBack();
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    });

    const discoveredCount = cards.filter((card) => (meta.cardCollection[card.id] ?? 0) > 0).length;
    const collectionCopies = Object.values(meta.cardCollection).reduce((sum, count) => sum + count, 0);
    const deckValid = deck.length >= MIN_DECK_SIZE && deck.length <= MAX_DECK_SIZE;
    const inspectCopies = inspectCard ? meta.cardCollection[inspectCard.id] ?? 0 : 0;
    const inspectInDeck = inspectCard ? deck.includes(inspectCard.id) : false;
    const inspectCraftCost = inspectCard ? CARD_CRAFT_COST_BY_RARITY[inspectCard.rarity] : 0;

    function addToDeck(cardId: string) {
        const copies = meta.cardCollection[cardId] ?? 0;

        if (copies <= 0 || deck.includes(cardId) || deck.length >= MAX_DECK_SIZE) {
            return false;
        }

        setDeck((current) => [...current, cardId]);
        setMessage(null);
        return true;
    }

    function removeFromDeck(cardId: string) {
        setDeck((current) => current.filter((id) => id !== cardId));
        setMessage(null);
    }

    function toggleDeckCard(cardId: string) {
        if (deck.includes(cardId)) {
            removeFromDeck(cardId);
            return;
        }

        if (!addToDeck(cardId)) {
            setMessage("You must own the card and the deck cannot exceed 20 cards.");
        }
    }

    function fillToTen() {
        if (deck.length >= MIN_DECK_SIZE) {
            setMessage(`Deck already contains ${deck.length} cards.`);
            return;
        }

        const available = cards.filter((card) => {
            const copies = meta.cardCollection[card.id] ?? 0;
            return copies > 0 && !deck.includes(card.id);
        });

        const needed = MIN_DECK_SIZE - deck.length;
        const additions = randomize(available).slice(0, needed).map((card) => card.id);

        setDeck((current) => [...current, ...additions]);
        setMessage(
            additions.length === needed
                ? `Deck filled to ${MIN_DECK_SIZE}.`
                : `Only ${additions.length} available cards could be added.`,
        );
        setShowValidation(false);
    }

    function clearDeck() {
        setDeck([]);
        setMessage("Deck cleared. Build a new deck and save it when ready.");
    }

    function handleSave() {
        if (!deckValid) {
            setShowValidation(true);
            return;
        }

        if (!onSaveDeck(deck)) {
            setMessage("Deck could not be saved. Check your collection.");
            return;
        }

        setMessage("Deck saved. It will be used in your next descent.");
    }

    function handleBack() {
        if (!deckValid) {
            setShowValidation(true);
            return;
        }

        onClose();
    }

    function handleCraft(cardId: string) {
        const card = cards.find((item) => item.id === cardId);
        if (!card) return;

        const copies = meta.cardCollection[card.id] ?? 0;
        const cost = CARD_CRAFT_COST_BY_RARITY[card.rarity];

        if (copies >= MAX_CARD_COPIES) {
            setMessage("This card is already at the collection cap.");
            return;
        }

        if (meta.dust < cost) {
            setMessage("Not enough Dust to craft this card.");
            return;
        }

        const crafted = onCraftCard(card.id);
        setMessage(crafted ? `${card.name} crafted.` : "Craft failed.");
    }

    function handleDrop(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();
        const cardId = event.dataTransfer.getData("text/plain");

        if (!cardId) return;
        addToDeck(cardId);
    }

    function handleCardDragStart(event: DragEvent<HTMLButtonElement>, cardId: string) {
        event.dataTransfer.setData("text/plain", cardId);
        event.dataTransfer.effectAllowed = "copy";
    }

    const paginationItems = Array.from({ length: totalPages }, (_, index) => index + 1);

    return (
        <main className="collection-shell text-stone-200">
            <div className="collection-atmosphere" />

            <header
                className="collection-navbar"
                style={{
                    backgroundImage: `linear-gradient(90deg, rgba(8,6,5,0.98) 0%, rgba(8,6,5,0.72) 48%, rgba(8,6,5,0.92) 100%), url(${battlefieldBackground})`,
                }}
            >
                <div className="collection-navbar__brand">
                    <div className="collection-navbar__sigil" aria-hidden="true">♜</div>
                    <div>
                        <div className="collection-navbar__title">The Hollow Crown</div>
                        <div className="collection-navbar__subtitle">Ashen Bastion</div>
                    </div>
                </div>
            </header>

            <div className="collection-page">
                <header className="collection-page-header">
                    <div>
                        <p className="collection-page-header__kicker">Ashen Bastion · Archive</p>
                        <h1>Collection &amp; Deck</h1>
                        <p>{discoveredCount} / {cards.length} discovered · {collectionCopies} copies · Deck {deck.length}/{MAX_DECK_SIZE}</p>
                    </div>

                    <div className="collection-resource-bar">
                        <div>
                            <span>Hub Gold</span>
                            <strong>◆ {meta.hubGold}</strong>
                        </div>
                        <div>
                            <span>Dust</span>
                            <strong>◆ {meta.dust}</strong>
                        </div>
                        <button type="button" onClick={handleBack} className="collection-back-button">Back</button>
                    </div>
                </header>

                <div className="collection-workspace">
                    <section className="collection-panel collection-panel--library">
                        <div className="collection-library-toolbar">
                            <div className="collection-filter-row">
                                {(["all", "attack", "skill", "power"] as const).map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setCategory(value)}
                                        className={category === value ? "is-active" : ""}
                                    >
                                        {value === "all" ? "All" : categoryLabel[value]}
                                    </button>
                                ))}
                                <span className="collection-toolbar-divider" />
                                {(["all", "common", "uncommon", "rare", "legendary"] as const).map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setRarity(value)}
                                        className={rarity === value ? "is-active" : ""}
                                    >
                                        {value === "all" ? "All Rarities" : rarityMeta[value].label}
                                    </button>
                                ))}
                            </div>

                            <div className="collection-search-row">
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search cards..."
                                    aria-label="Search cards"
                                />
                                <select value={ownership} onChange={(event) => setOwnership(event.target.value as OwnershipFilter)}>
                                    <option value="owned">Owned</option>
                                    <option value="all">All Cards</option>
                                    <option value="missing">Missing</option>
                                    <option value="in-deck">In Deck</option>
                                </select>
                                <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}>
                                    <option value="name">Sort: Name</option>
                                    <option value="rarity">Sort: Rarity</option>
                                    <option value="count">Sort: Copies</option>
                                </select>
                            </div>

                            <div className="collection-library-meta">
                                <span>{filteredCards.length} cards shown</span>
                                <span>{safePage} / {totalPages}</span>
                            </div>
                        </div>

                        <div className="collection-card-grid">
                            {visibleCards.map((card) => {
                                const copies = meta.cardCollection[card.id] ?? 0;
                                const inDeck = deck.includes(card.id);

                                return (
                                    <CardFace
                                        key={card.id}
                                        card={card}
                                        copies={copies}
                                        inDeck={inDeck}
                                        selected={selectedCardId === card.id}
                                        onClick={() => {
                                            setSelectedCardId(card.id);
                                            setInspectCardId(card.id);
                                        }}
                                        onDoubleClick={() => {
                                            setSelectedCardId(card.id);
                                            toggleDeckCard(card.id);
                                        }}
                                        onDragStart={(event) => handleCardDragStart(event, card.id)}
                                    />
                                );
                            })}

                            {Array.from({ length: Math.max(0, PAGE_SIZE - visibleCards.length) }).map((_, index) => (
                                <div key={`empty-${index}`} className="collection-card-placeholder" aria-hidden="true" />
                            ))}
                        </div>

                        <div className="collection-pagination" aria-label="Collection pages">
                            <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={safePage === 1}>‹</button>
                            {paginationItems.map((value) => (
                                <button key={value} type="button" onClick={() => setPage(value)} className={value === safePage ? "is-active" : ""}>{value}</button>
                            ))}
                            <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={safePage === totalPages}>›</button>
                        </div>
                    </section>

                    <aside className="collection-sidebar">
                        <section
                            className="collection-panel collection-panel--deck"
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={handleDrop}
                        >
                            <div className="collection-deck-header">
                                <div>
                                    <p>Saved Run Deck</p>
                                    <h2>My Deck</h2>
                                </div>
                                <strong className={deckValid ? "is-valid" : "is-invalid"}>{deck.length}/{MAX_DECK_SIZE}</strong>
                            </div>

                            <div className="collection-deck-progress">
                                <span style={{ width: `${Math.min(100, (deck.length / MAX_DECK_SIZE) * 100)}%` }} />
                            </div>

                            <div className="collection-deck-list">
                                {deck.length === 0 ? (
                                    <div className="collection-deck-empty">
                                        <span>Drop cards here</span>
                                        <small>or double-click a card in the collection</small>
                                    </div>
                                ) : (
                                    deck.map((cardId, index) => {
                                        const card = cards.find((item) => item.id === cardId);
                                        if (!card) return null;

                                        return (
                                            <div key={card.id} className="collection-deck-item" draggable onDragStart={(event) => {
                                                event.dataTransfer.setData("text/plain", card.id);
                                                event.dataTransfer.effectAllowed = "move";
                                            }}>
                                                <span className="collection-deck-item__index">{index + 1}</span>
                                                <CardArtwork
                                                    cardId={card.id}
                                                    alt={card.name}
                                                    className="collection-deck-item__art"
                                                    imageClassName="h-full w-full object-contain"
                                                />
                                                <button type="button" className="collection-deck-item__name" onClick={() => setInspectCardId(card.id)}>
                                                    <strong>{card.name}</strong>
                                                    <span>{rarityMeta[card.rarity].label}</span>
                                                </button>
                                                <button type="button" className="collection-deck-item__remove" onClick={() => removeFromDeck(card.id)} aria-label={`Remove ${card.name}`}>
                                                    ×
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="collection-deck-actions">
                                <button type="button" onClick={clearDeck}>Clear Deck</button>
                                <button type="button" onClick={fillToTen} disabled={deck.length >= MIN_DECK_SIZE}>Fill to {MIN_DECK_SIZE}</button>
                                <button type="button" onClick={handleSave} className="collection-deck-save">Save Deck</button>
                            </div>

                            {message && <p className="collection-message">{message}</p>}
                        </section>
                    </aside>
                </div>
            </div>

            {inspectCard && (
                <CardInspectModal
                    card={inspectCard}
                    copies={inspectCopies}
                    inDeck={inspectInDeck}
                    dust={meta.dust}
                    craftCost={inspectCraftCost}
                    onClose={() => setInspectCardId(null)}
                    onToggleDeck={() => toggleDeckCard(inspectCard.id)}
                    onCraft={() => handleCraft(inspectCard.id)}
                />
            )}

            {showValidation && (
                <DeckValidationModal
                    deckLength={deck.length}
                    onFill={fillToTen}
                    onContinue={() => setShowValidation(false)}
                />
            )}
        </main>
    );
}

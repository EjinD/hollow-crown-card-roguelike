import type {
    CardState,
} from "../types/game";

import { cards } from "../data/cards";
import Card from "./Card";

interface InventoryScreenProps {
    deck: CardState[];
    relics: string[];
    upgrades: string[];
    maxDeckSize: number;
    onClose: () => void;
}

export default function InventoryScreen({
    deck,
    relics,
    upgrades,
    maxDeckSize,
    onClose,
}: InventoryScreenProps) {
    return (
        <div
            className="absolute inset-0 z-[100] flex items-center justify-center bg-black/75 p-8 backdrop-blur-[3px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inventory-title"
        >
            <button
                type="button"
                aria-label="Close inventory"
                onClick={onClose}
                className="absolute inset-0 cursor-default"
            />

            <section className="relative flex max-h-[90vh] w-full max-w-7xl flex-col overflow-hidden border border-stone-700 bg-[#0c0907] shadow-[0_20px_80px_rgba(0,0,0,0.75)]">
                <header className="flex shrink-0 items-center justify-between border-b border-stone-800 bg-[#110c09] px-8 py-5">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.35em] text-stone-500">
                            Character
                        </p>

                        <h2
                            id="inventory-title"
                            className="mt-1 font-serif text-3xl font-bold uppercase tracking-[0.12em] text-stone-100"
                        >
                            Inventory
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="relative z-10 border border-stone-700 bg-[#1a110d] px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-stone-300 transition hover:border-stone-500 hover:bg-[#241711] hover:text-stone-100"
                    >
                        Close
                    </button>
                </header>

                <div className="overflow-y-auto px-8 py-8">
                    <section>
                        <div className="mb-5 flex items-end justify-between border-b border-stone-800 pb-3">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">
                                    Collection
                                </p>

                                <h3 className="mt-1 font-serif text-xl font-bold uppercase tracking-[0.12em] text-stone-200">
                                    Deck
                                </h3>
                            </div>

                            <span className="text-sm font-bold text-stone-400">
                                {deck.length} / {maxDeckSize}
                            </span>
                        </div>

                        {deck.length === 0 ? (
                            <div className="border border-dashed border-stone-800 bg-black/20 px-6 py-12 text-center">
                                <p className="text-sm text-stone-500">
                                    Your deck is empty.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-wrap justify-center gap-6">
                                {deck.map(
                                    (
                                        cardState,
                                        index,
                                    ) => {
                                        const card =
                                            cards.find(
                                                (
                                                    definition,
                                                ) =>
                                                    definition.id ===
                                                    cardState.cardId,
                                            );

                                        if (!card) {
                                            return null;
                                        }

                                        return (
                                            <div
                                                key={`${cardState.cardId}-${index}`}
                                                className="relative"
                                            >
                                                <Card
                                                    card={cardState}
                                                    disabled
                                                    onClick={() => {}}
                                                />
                                            </div>
                                        );
                                    },
                                )}
                            </div>
                        )}
                    </section>

                    <section className="mt-12">
                        <div className="mb-5 border-b border-stone-800 pb-3">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">
                                Passive effects
                            </p>

                            <h3 className="mt-1 font-serif text-xl font-bold uppercase tracking-[0.12em] text-stone-200">
                                Relics
                            </h3>
                        </div>

                        {relics.length === 0 ? (
                            <div className="border border-dashed border-stone-800 bg-black/20 px-6 py-10 text-center">
                                <p className="text-sm text-stone-500">
                                    No relics collected.
                                </p>

                                <p className="mt-2 text-xs text-stone-700">
                                    Relics will provide permanent effects during the run.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                                {relics.map(
                                    (
                                        relic,
                                        index,
                                    ) => (
                                        <div
                                            key={`${relic}-${index}`}
                                            className="border border-stone-800 bg-[#120d0a] p-5"
                                        >
                                            <p className="text-xs font-bold uppercase tracking-[0.15em] text-amber-300">
                                                {relic}
                                            </p>
                                        </div>
                                    ),
                                )}
                            </div>
                        )}
                    </section>

                    <section className="mt-12">
                        <div className="mb-5 border-b border-stone-800 pb-3">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">
                                Permanent progression
                            </p>

                            <h3 className="mt-1 font-serif text-xl font-bold uppercase tracking-[0.12em] text-stone-200">
                                Upgrades
                            </h3>
                        </div>

                        {upgrades.length === 0 ? (
                            <div className="border border-dashed border-stone-800 bg-black/20 px-6 py-10 text-center">
                                <p className="text-sm text-stone-500">
                                    No upgrades acquired.
                                </p>

                                <p className="mt-2 text-xs text-stone-700">
                                    Upgrades will modify your character or deck.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                                {upgrades.map(
                                    (
                                        upgrade,
                                        index,
                                    ) => (
                                        <div
                                            key={`${upgrade}-${index}`}
                                            className="border border-stone-800 bg-[#120d0a] p-5"
                                        >
                                            <p className="text-xs font-bold uppercase tracking-[0.15em] text-orange-300">
                                                {upgrade}
                                            </p>
                                        </div>
                                    ),
                                )}
                            </div>
                        )}
                    </section>
                </div>
            </section>
        </div>
    );
}
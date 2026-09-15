import { useMemo, useState } from "react";

import { cards } from "../data/cards";
import type { MetaProgressState } from "../types/meta";
import { CARD_PACK_COST } from "../state/meta-state";

interface CardVaultScreenProps {
    meta: MetaProgressState;
    onBuyPack: () => string[] | null;
    onClose: () => void;
}

function shuffle<T>(items: T[]): T[] {
    const result = [...items];

    for (let index = result.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(
            Math.random() * (index + 1),
        );

        [result[index], result[randomIndex]] = [
            result[randomIndex],
            result[index],
        ];
    }

    return result;
}

export default function CardVaultScreen({
    meta,
    onBuyPack,
    onClose,
}: CardVaultScreenProps) {
    const [lastPack, setLastPack] = useState<string[]>([]);
    const [message, setMessage] = useState<string | null>(null);

    const discoveredCount = useMemo(
        () =>
            cards.filter(
                (card) =>
                    (meta.cardCollection[card.id] ?? 0) > 0,
            ).length,
        [meta.cardCollection],
    );

    function handleBuyPack() {
        const openedCards = onBuyPack();

        if (!openedCards) {
            setMessage("Not enough Hub Gold.");
            return;
        }

        setLastPack(openedCards);
        setMessage(null);
    }

    return (
        <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/80 p-8 backdrop-blur-[4px]">
            <button
                type="button"
                aria-label="Close card vault"
                onClick={onClose}
                className="absolute inset-0 cursor-default"
            />

            <section className="relative flex max-h-[90vh] w-full max-w-7xl flex-col overflow-hidden border border-stone-700 bg-[#0b0806] shadow-[0_24px_90px_rgba(0,0,0,0.85)]">
                <header className="flex shrink-0 items-center justify-between border-b border-stone-800 bg-[#110c09] px-8 py-6">
                    <div>
                        <p className="text-[9px] uppercase tracking-[0.4em] text-stone-600">
                            Ashen Bastion · Collection
                        </p>
                        <h2 className="mt-2 font-serif text-3xl font-bold uppercase tracking-[0.14em] text-stone-100">
                            Card Vault
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-[9px] uppercase tracking-[0.3em] text-stone-600">
                                Collection
                            </p>
                            <p className="mt-1 text-lg font-bold text-stone-200">
                                {discoveredCount} / {cards.length}
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="text-[9px] uppercase tracking-[0.3em] text-stone-600">
                                Hub Gold
                            </p>
                            <p className="mt-1 text-lg font-bold text-amber-400">
                                ◆ {meta.hubGold}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="border border-stone-700 bg-[#1a110d] px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-stone-300 transition hover:border-stone-500 hover:bg-[#241711] hover:text-stone-100"
                        >
                            Close
                        </button>
                    </div>
                </header>

                <div className="overflow-y-auto px-8 py-8">
                    <section className="border border-stone-800 bg-[#100c09] p-7">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="max-w-2xl">
                                <p className="text-[9px] uppercase tracking-[0.4em] text-orange-700">
                                    Card Pack
                                </p>
                                <h3 className="mt-2 font-serif text-2xl font-bold uppercase tracking-[0.12em] text-stone-100">
                                    Ashen Pack
                                </h3>
                                <p className="mt-3 text-sm leading-6 text-stone-500">
                                    Open a pack to receive three random cards from the current collection pool. Duplicate cards increase your permanent collection count.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleBuyPack}
                                disabled={meta.hubGold < CARD_PACK_COST}
                                className="shrink-0 border border-orange-800 bg-[#25130d] px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-orange-200 transition hover:border-orange-600 hover:bg-[#361812] disabled:cursor-not-allowed disabled:border-stone-900 disabled:bg-[#120d0a] disabled:text-stone-600"
                            >
                                Buy Pack · {CARD_PACK_COST} ◆
                            </button>
                        </div>

                        {message && (
                            <p className="mt-4 text-sm text-red-400">
                                {message}
                            </p>
                        )}
                    </section>

                    {lastPack.length > 0 && (
                        <section className="mt-8">
                            <div className="mb-5 flex items-end justify-between border-b border-stone-800 pb-3">
                                <div>
                                    <p className="text-[9px] uppercase tracking-[0.35em] text-stone-600">
                                        Latest opening
                                    </p>
                                    <h3 className="mt-1 font-serif text-xl font-bold uppercase tracking-[0.12em] text-stone-200">
                                        Pack Contents
                                    </h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                {lastPack.map((cardId) => {
                                    const card = cards.find(
                                        (definition) =>
                                            definition.id === cardId,
                                    );

                                    if (!card) {
                                        return null;
                                    }

                                    return (
                                        <div
                                            key={cardId}
                                            className="border border-orange-900/40 bg-[#120d0a] p-6"
                                        >
                                            <p className="text-[9px] uppercase tracking-[0.3em] text-orange-700">
                                                Acquired
                                            </p>
                                            <h4 className="mt-2 font-serif text-xl font-bold text-stone-100">
                                                {card.name}
                                            </h4>
                                            <p className="mt-2 text-xs text-stone-500">
                                                {card.effects
                                                    .map((effect) => {
                                                        if (effect.type === "damage") {
                                                            return `Damage ${effect.amount}`;
                                                        }
                                                        if (effect.type === "burn") {
                                                            return `Burn ${effect.amount} / ${effect.duration}`;
                                                        }
                                                        if (effect.type === "block") {
                                                            return `Block ${effect.amount}`;
                                                        }
                                                        if (effect.type === "gain-action") {
                                                            return `+${effect.amount} Action`;
                                                        }
                                                        if (effect.type === "draw") {
                                                            return `Draw ${effect.amount}`;
                                                        }
                                                        return `Heal ${effect.amount}`;
                                                    })
                                                    .join(" · ")}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    <section className="mt-10">
                        <div className="mb-5 flex items-end justify-between border-b border-stone-800 pb-3">
                            <div>
                                <p className="text-[9px] uppercase tracking-[0.35em] text-stone-600">
                                    Permanent Collection
                                </p>
                                <h3 className="mt-1 font-serif text-xl font-bold uppercase tracking-[0.12em] text-stone-200">
                                    Cards
                                </h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                            {shuffle(cards).map((card) => {
                                const count =
                                    meta.cardCollection[card.id] ?? 0;

                                return (
                                    <div
                                        key={card.id}
                                        className="border border-stone-800 bg-[#100c09] p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <h4 className="font-serif text-base font-bold text-stone-100">
                                                {card.name}
                                            </h4>

                                            <span
                                                className={[
                                                    "text-xs font-bold",
                                                    count > 0
                                                        ? "text-amber-400"
                                                        : "text-stone-700",
                                                ].join(" ")}
                                            >
                                                ×{count}
                                            </span>
                                        </div>

                                        <p className="mt-3 text-[10px] leading-5 text-stone-600">
                                            {card.effects
                                                .map((effect) => {
                                                    if (effect.type === "damage") {
                                                        return `Damage ${effect.amount}`;
                                                    }
                                                    if (effect.type === "burn") {
                                                        return `Burn ${effect.amount}`;
                                                    }
                                                    if (effect.type === "block") {
                                                        return `Block ${effect.amount}`;
                                                    }
                                                    if (effect.type === "gain-action") {
                                                        return `+Action`;
                                                    }
                                                    if (effect.type === "draw") {
                                                        return `Draw`;
                                                    }
                                                    return `Heal`;
                                                })
                                                .join(" · ")}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </section>
        </div>
    );
}

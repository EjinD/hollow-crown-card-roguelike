import { useState } from "react";

import type { CardState, RunState } from "../types/game";
import Card from "./Card";

interface RestScreenProps {
    run: RunState;
    onRecover: () => void;
    onPurge: (cardId: string) => void;
    onSacrifice: () => void;
}

export default function RestScreen({
    run,
    onRecover,
    onPurge,
    onSacrifice,
}: RestScreenProps) {
    const [mode, setMode] = useState<"choices" | "purge">("choices");
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

    const healAmount = Math.max(1, Math.ceil(run.maxHp * 0.3));
    const sacrificeHp = Math.max(1, Math.ceil(run.maxHp * 0.1));
    const canRecover = run.hp < run.maxHp;
    const canPurge = run.deck.length > 10;
    const canSacrifice = run.hp > 1;

    function handleConfirmPurge() {
        if (!selectedCardId || !canPurge) {
            return;
        }

        onPurge(selectedCardId);
    }

    if (mode === "purge") {
        return (
            <main className="min-h-screen bg-[#090705] text-stone-100">
                <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 lg:px-10">
                    <header className="border-b border-stone-800/80 pb-6">
                        <p className="text-[10px] uppercase tracking-[0.42em] text-orange-500/70">
                            Rest Site — Purge
                        </p>
                        <div className="mt-2 flex items-end justify-between gap-8">
                            <div>
                                <h1 className="font-serif text-4xl font-bold uppercase tracking-[0.14em]">
                                    The Ashen Pyre
                                </h1>
                                <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">
                                    Cast one card into the fire. Your current Run Deck must remain at 10 cards or more.
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] uppercase tracking-[0.25em] text-stone-600">
                                    Deck
                                </p>
                                <p className="mt-1 text-2xl font-bold text-stone-200">
                                    {run.deck.length} / 20
                                </p>
                            </div>
                        </div>
                    </header>

                    <div className="flex-1 py-8">
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {run.deck.map((card) => {
                                const selected = selectedCardId === card.cardId;

                                return (
                                    <div
                                        key={card.cardId}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => setSelectedCardId(card.cardId)}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter" || event.key === " ") {
                                                event.preventDefault();
                                                setSelectedCardId(card.cardId);
                                            }
                                        }}
                                        className={`rounded-2xl border p-3 text-left transition ${
                                            selected
                                                ? "border-orange-400 bg-orange-950/30 shadow-[0_0_30px_rgba(234,88,12,0.18)]"
                                                : "border-stone-800 bg-[#110c09] hover:border-stone-600"
                                        }`}
                                    >
                                        <Card
                                            card={{ ...card, cooldownRemaining: 0 }}
                                            disabled
                                            onClick={() => undefined}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <footer className="flex flex-col gap-3 border-t border-stone-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <button
                            type="button"
                            onClick={() => {
                                setMode("choices");
                                setSelectedCardId(null);
                            }}
                            className="border border-stone-800 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-stone-400 transition hover:border-stone-600 hover:text-stone-100"
                        >
                            Back
                        </button>
                        <button
                            type="button"
                            disabled={!selectedCardId}
                            onClick={handleConfirmPurge}
                            className="border border-red-900/70 bg-red-950/30 px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-red-300 transition hover:border-red-500 hover:bg-red-900/30 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            Burn Selected Card
                        </button>
                    </footer>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#090705] text-stone-100">
            <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 lg:px-10">
                <header className="border-b border-stone-800/80 pb-6">
                    <p className="text-[10px] uppercase tracking-[0.42em] text-orange-500/70">
                        Rest Site
                    </p>
                    <h1 className="mt-2 font-serif text-5xl font-bold uppercase tracking-[0.15em]">
                        The Ashen Pyre
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">
                        A quiet place between battles. Choose one action before the fire dies.
                    </p>
                </header>

                <section className="grid flex-1 gap-5 py-10 md:grid-cols-3 md:items-center">
                    <ActionCard
                        icon="🔥"
                        eyebrow="Recover"
                        title="Mend the Flame"
                        description={`Restore ${healAmount} HP (${Math.round((healAmount / run.maxHp) * 100)}% of Max HP).`}
                        footer={`${run.hp} / ${run.maxHp} HP`}
                        disabled={!canRecover}
                        onClick={onRecover}
                    />

                    <ActionCard
                        icon="⚔"
                        eyebrow="Purge"
                        title="Burn a Card"
                        description="Remove one card from your current Run Deck. Your deck cannot go below 10 cards."
                        footer={`${run.deck.length} cards in deck`}
                        disabled={!canPurge}
                        onClick={() => setMode("purge")}
                    />

                    <ActionCard
                        icon="💀"
                        eyebrow="Sacrifice"
                        title="Feed the Fire"
                        description={`Lose ${sacrificeHp} HP and gain 30 Run Gold.`}
                        footer={canSacrifice ? `${run.hp} → ${Math.max(1, run.hp - sacrificeHp)} HP` : "Cannot reduce HP further"}
                        disabled={!canSacrifice}
                        danger
                        onClick={onSacrifice}
                    />
                </section>
            </div>
        </main>
    );
}

function ActionCard({
    icon,
    eyebrow,
    title,
    description,
    footer,
    disabled,
    danger = false,
    onClick,
}: {
    icon: string;
    eyebrow: string;
    title: string;
    description: string;
    footer: string;
    disabled: boolean;
    danger?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={`group flex min-h-[360px] flex-col border bg-[#110c09] p-7 text-left transition ${
                danger
                    ? "border-red-950/70 hover:border-red-700"
                    : "border-stone-800 hover:border-orange-800/70"
            } disabled:cursor-not-allowed disabled:opacity-35`}
        >
            <span className="text-4xl transition-transform duration-300 group-hover:scale-110">
                {icon}
            </span>
            <p className="mt-10 text-[10px] uppercase tracking-[0.35em] text-stone-600">
                {eyebrow}
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold uppercase tracking-[0.1em] text-stone-100">
                {title}
            </h2>
            <p className="mt-4 text-sm leading-7 text-stone-500">
                {description}
            </p>
            <span className="mt-auto border-t border-stone-800 pt-5 text-xs uppercase tracking-[0.18em] text-stone-400">
                {footer}
            </span>
        </button>
    );
}

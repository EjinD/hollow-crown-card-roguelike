import { useMemo, useState } from "react";

import { cards } from "../data/cards";
import type { CardRarity } from "../types/game";
import type { CardPackOpenResult, MetaProgressState, PackCardResult } from "../types/meta";
import { CARD_PACK_COST, CARD_PACK_SIZE } from "../state/meta-state";

interface CardPacksScreenProps {
    meta: MetaProgressState;
    onOpenPack: () => CardPackOpenResult | null;
    onClose: () => void;
}

type PackPhase = "idle" | "revealing" | "complete";

const rarityMeta: Record<
    CardRarity,
    { label: string; className: string; glow: string; reveal: string }
> = {
    common: {
        label: "Common",
        className: "border-stone-600 text-stone-300",
        glow: "shadow-[0_0_30px_rgba(148,163,184,0.08)]",
        reveal: "bg-stone-300",
    },
    uncommon: {
        label: "Uncommon",
        className: "border-emerald-700/80 text-emerald-300",
        glow: "shadow-[0_0_42px_rgba(16,185,129,0.16)]",
        reveal: "bg-emerald-300",
    },
    rare: {
        label: "Rare",
        className: "border-blue-700/80 text-blue-300",
        glow: "shadow-[0_0_48px_rgba(59,130,246,0.18)]",
        reveal: "bg-blue-300",
    },
    legendary: {
        label: "Legendary",
        className: "border-amber-500/90 text-amber-300",
        glow: "shadow-[0_0_70px_rgba(245,158,11,0.32)]",
        reveal: "bg-amber-300",
    },
};

function getCard(cardId: string) {
    return cards.find((card) => card.id === cardId);
}

function effectText(effect: (typeof cards)[number]["effects"][number]) {
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
            return `Remove all Weak.`;
        case "damage-if-burn":
            return `Deal ${effect.amount} damage, +${effect.bonusDamage} if enemy is Burning.`;
        case "damage-if-player-weak":
            return `Deal ${effect.amount} damage, +${effect.bonusDamage} while you are Weak.`;
    }
}

function RevealCard({
    result,
    revealed,
    onReveal,
}: {
    result: PackCardResult;
    revealed: boolean;
    onReveal: () => void;
}) {
    const card = getCard(result.cardId);
    if (!card) return null;

    const meta = rarityMeta[result.rarity];

    return (
        <button
            type="button"
            onClick={onReveal}
            disabled={revealed}
            className={[
                "group relative h-[420px] w-[238px] overflow-hidden border text-left transition duration-500",
                "bg-[#0d0a08]",
                revealed ? meta.className : "border-stone-700 hover:border-orange-700/70",
                revealed ? meta.glow : "shadow-[0_18px_55px_rgba(0,0,0,0.48)]",
                revealed ? "cursor-default" : "cursor-pointer hover:-translate-y-2",
            ].join(" ")}
        >
            {!revealed ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,_rgba(120,42,18,0.34),_rgba(7,5,4,0.98)_68%)]">
                    <div className="absolute inset-4 border border-orange-900/40" />
                    <div className="relative flex flex-col items-center gap-5">
                        <div className="text-6xl text-orange-500/70 transition duration-500 group-hover:scale-110 group-hover:text-orange-300">♛</div>
                        <div className="text-center">
                            <p className="text-[10px] uppercase tracking-[0.35em] text-stone-600">The Hollow Crown</p>
                            <p className="mt-2 text-xs uppercase tracking-[0.28em] text-stone-300">Ashen Pack</p>
                            <p className="mt-6 text-[9px] uppercase tracking-[0.25em] text-orange-700">Click to reveal</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="animate-[cardRevealImpact_520ms_ease-out] p-5">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />
                    <div className="flex items-center justify-between gap-3">
                        <span className={`border px-2 py-1 text-[8px] font-bold uppercase tracking-[0.2em] ${meta.className}`}>
                            {meta.label}
                        </span>
                        <span className="text-[8px] uppercase tracking-[0.2em] text-stone-600">{card.category}</span>
                    </div>

                    <div className="mt-6 flex h-40 items-center justify-center border border-stone-800 bg-[radial-gradient(circle,_rgba(140,54,20,0.18),_rgba(0,0,0,0.2)_65%)]">
                        <div className={`flex h-24 w-24 items-center justify-center rounded-full border ${meta.className} bg-black/20 text-4xl`}>
                            ✦
                        </div>
                    </div>

                    <h3 className="mt-5 font-serif text-2xl font-bold uppercase tracking-[0.06em] text-stone-100">
                        {card.name}
                    </h3>
                    <p className="mt-1 text-[9px] uppercase tracking-[0.25em] text-stone-600">Cooldown · {card.cooldown || "None"}</p>

                    <div className="mt-5 space-y-2 border-t border-stone-800 pt-4 text-[10px] leading-4 text-stone-400">
                        {card.effects.map((effect, index) => (
                            <p key={`${effect.type}-${index}`}>• {effectText(effect)}</p>
                        ))}
                    </div>

                    <div className="mt-5 border-t border-stone-800 pt-4">
                        {result.isDuplicate ? (
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-violet-300">Duplicate</p>
                                    <p className="mt-1 text-xs text-stone-500">Converted immediately</p>
                                </div>
                                <span className="animate-[dustBurst_700ms_ease-out] text-xl font-bold text-violet-200">+{result.dustGained} ◆</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-emerald-300">New Card</p>
                                    <p className="mt-1 text-xs text-stone-500">Added to Collection</p>
                                </div>
                                <span className="text-xs font-bold text-emerald-200">+1</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </button>
    );
}

export default function CardPacksScreen({
    meta,
    onOpenPack,
    onClose,
}: CardPacksScreenProps) {
    const [phase, setPhase] = useState<PackPhase>("idle");
    const [result, setResult] = useState<CardPackOpenResult | null>(null);
    const [revealedCount, setRevealedCount] = useState(0);

    const canOpen = meta.hubGold >= CARD_PACK_COST;
    const remaining = result ? Math.max(0, result.cards.length - revealedCount) : 0;
    const allRevealed = Boolean(result && revealedCount >= result.cards.length);

    const totalDust = useMemo(
        () => result?.dustGained ?? 0,
        [result],
    );

    function handleOpenPack() {
        const next = onOpenPack();
        if (!next) return;

        setResult(next);
        setRevealedCount(0);
        setPhase("revealing");
    }

    function revealNext() {
        if (!result || revealedCount >= result.cards.length) return;
        setRevealedCount((count) => count + 1);
    }

    function revealAll() {
        if (!result) return;
        setRevealedCount(result.cards.length);
    }

    function reset() {
        setResult(null);
        setRevealedCount(0);
        setPhase("idle");
    }

    if (phase === "idle") {
        return (
            <main className="min-h-screen overflow-hidden bg-[#070605] text-stone-200">
                <div className="relative min-h-screen bg-[radial-gradient(circle_at_50%_35%,_rgba(122,42,16,0.24),_transparent_45%)]">
                    <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:5px_5px]" />
                    <header className="relative z-10 flex items-center justify-between border-b border-stone-900 bg-[#080706]/85 px-8 py-5 backdrop-blur-md">
                        <div>
                            <p className="text-[9px] uppercase tracking-[0.42em] text-stone-600">Ashen Bastion · Card Foundry</p>
                            <h1 className="mt-2 font-serif text-3xl font-bold uppercase tracking-[0.16em] text-stone-100">Card Packs</h1>
                        </div>
                        <div className="flex items-center gap-8 text-right">
                            <div>
                                <p className="text-[8px] uppercase tracking-[0.28em] text-stone-600">Hub Gold</p>
                                <p className="mt-1 text-lg font-bold text-amber-300">◆ {meta.hubGold}</p>
                            </div>
                            <div>
                                <p className="text-[8px] uppercase tracking-[0.28em] text-stone-600">Dust</p>
                                <p className="mt-1 text-lg font-bold text-violet-300">◆ {meta.dust}</p>
                            </div>
                        </div>
                    </header>

                    <section className="relative z-10 mx-auto grid min-h-[calc(100vh-93px)] max-w-6xl grid-cols-[1.1fr_0.9fr] gap-12 px-8 py-12">
                        <div className="flex flex-col justify-center">
                            <p className="text-[10px] uppercase tracking-[0.4em] text-orange-700">The collection grows in fire</p>
                            <h2 className="mt-4 max-w-xl font-serif text-6xl font-bold uppercase leading-[0.92] tracking-[0.04em] text-stone-100">Open what the Bastion has forged.</h2>
                            <p className="mt-7 max-w-xl text-sm leading-7 text-stone-500">
                                Each Ashen Pack contains {CARD_PACK_SIZE} cards. New cards enter the collection. Duplicates are immediately reduced to Dust.
                            </p>

                            <div className="mt-10 grid max-w-xl grid-cols-4 gap-2">
                                {(["common", "uncommon", "rare", "legendary"] as CardRarity[]).map((rarity) => (
                                    <div key={rarity} className={`border bg-[#0b0907]/90 px-3 py-4 ${rarityMeta[rarity].className}`}>
                                        <p className="text-[8px] uppercase tracking-[0.22em]">{rarityMeta[rarity].label}</p>
                                        <div className={`mt-3 h-1 w-10 ${rarityMeta[rarity].reveal}`} />
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={handleOpenPack}
                                    disabled={!canOpen}
                                    className="border border-orange-700 bg-[linear-gradient(180deg,#36150b,#1a0c08)] px-8 py-4 text-xs font-bold uppercase tracking-[0.22em] text-orange-100 shadow-[0_10px_40px_rgba(0,0,0,0.4)] transition hover:border-orange-500 hover:shadow-[0_0_35px_rgba(194,65,12,0.2)] disabled:cursor-not-allowed disabled:border-stone-900 disabled:bg-[#100d0a] disabled:text-stone-700"
                                >
                                    Open Ashen Pack · {CARD_PACK_COST} Gold
                                </button>
                                <button type="button" onClick={onClose} className="px-4 py-4 text-[9px] font-bold uppercase tracking-[0.22em] text-stone-600 transition hover:text-stone-300">Back to Hub</button>
                            </div>
                            {!canOpen && <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-red-400/80">Not enough Gold.</p>}
                        </div>

                        <div className="relative flex items-center justify-center">
                            <div className="absolute h-[540px] w-[380px] rotate-[-9deg] border border-orange-950/60 bg-[linear-gradient(135deg,#17110d,#080706_62%)] shadow-[0_30px_100px_rgba(0,0,0,0.85)]" />
                            <div className="absolute h-[540px] w-[380px] rotate-[7deg] border border-stone-800 bg-[#0f0c09] shadow-[0_30px_100px_rgba(0,0,0,0.72)]" />
                            <div className="relative flex h-[540px] w-[380px] rotate-[-2deg] flex-col items-center justify-center border border-orange-800/60 bg-[radial-gradient(circle_at_center,_rgba(129,43,14,0.34),_rgba(7,5,4,0.98)_68%)] shadow-[0_40px_120px_rgba(0,0,0,0.9)]">
                                <div className="absolute inset-5 border border-orange-900/50" />
                                <div className="text-7xl text-orange-500/70">♛</div>
                                <p className="mt-5 text-[11px] uppercase tracking-[0.42em] text-stone-300">Ashen Pack</p>
                                <p className="mt-3 text-[9px] uppercase tracking-[0.34em] text-stone-600">Five flames. One collection.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        );
    }

    if (!result) return null;

    return (
        <main className="min-h-screen overflow-hidden bg-[#050403] text-stone-200">
            <div className="relative min-h-screen bg-[radial-gradient(circle_at_50%_30%,_rgba(124,39,12,0.2),_transparent_48%)]">
                <header className="relative z-10 flex items-center justify-between border-b border-stone-900 bg-[#080706]/88 px-8 py-5 backdrop-blur-md">
                    <div>
                        <p className="text-[9px] uppercase tracking-[0.42em] text-stone-600">Ashen Bastion · Opening</p>
                        <h1 className="mt-2 font-serif text-3xl font-bold uppercase tracking-[0.16em] text-stone-100">Ashen Pack</h1>
                    </div>
                    <div className="text-right">
                        <p className="text-[8px] uppercase tracking-[0.28em] text-stone-600">Reveal Progress</p>
                        <p className="mt-1 text-lg font-bold text-orange-200">{revealedCount} / {result.cards.length}</p>
                    </div>
                </header>

                <section className="relative z-10 flex min-h-[calc(100vh-93px)] flex-col px-8 py-8">
                    <div className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center gap-4">
                        {result.cards.map((card, index) => (
                            <RevealCard
                                key={`${card.cardId}-${index}`}
                                result={card}
                                revealed={index < revealedCount}
                                onReveal={revealNext}
                            />
                        ))}
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-4">
                        {!allRevealed ? (
                            <>
                                <button type="button" onClick={revealNext} className="border border-orange-700 bg-[#24120d] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.24em] text-orange-100 transition hover:border-orange-500">Reveal Next</button>
                                <button type="button" onClick={revealAll} className="border border-stone-800 px-6 py-4 text-[10px] font-bold uppercase tracking-[0.22em] text-stone-400 transition hover:border-stone-600 hover:text-stone-200">Reveal All</button>
                            </>
                        ) : (
                            <div className="flex items-center gap-8">
                                <div className="text-center">
                                    <p className="text-[8px] uppercase tracking-[0.28em] text-stone-600">Dust gained</p>
                                    <p className="mt-1 text-xl font-bold text-violet-200">+{totalDust} ◆</p>
                                </div>
                                <button type="button" onClick={reset} className="border border-orange-700 bg-[#24120d] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.24em] text-orange-100 transition hover:border-orange-500">Open Another</button>
                                <button type="button" onClick={onClose} className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.24em] text-stone-500 transition hover:text-stone-200">Return to Hub</button>
                            </div>
                        )}
                    </div>

                    {remaining > 0 && <p className="mt-3 text-center text-[9px] uppercase tracking-[0.22em] text-stone-600">{remaining} card{remaining === 1 ? "" : "s"} still sealed</p>}
                </section>
            </div>
        </main>
    );
}

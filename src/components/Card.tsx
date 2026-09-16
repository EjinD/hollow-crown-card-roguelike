import type {
    CardDefinition,
    CardEffect,
    CardState,
} from "../types/game";

import { cards } from "../data/cards";

const cardAssetModules = import.meta.glob(
    "../assets/cards/*.webp",
    {
        eager: true,
        import: "default",
        query: "?url",
    },
) as Record<string, string>;

const cardArt: Record<string, string> = Object.fromEntries(
    Object.entries(cardAssetModules).map(([path, url]) => {
        const file = path.split("/").pop() ?? "";
        return [file.replace(/\.webp$/i, ""), url];
    }),
);

interface CardProps {
    card: CardState;
    disabled?: boolean;
    onClick: (cardId: string) => void;
    isHovered?: boolean;
    isPlaying?: boolean;
}

function getEffectLabel(
    effect: CardEffect,
): string {
    switch (effect.type) {
        case "damage":
            return `Damage ${effect.amount}`;

        case "piercing-damage":
            return `Piercing ${effect.amount}`;

        case "shatter":
            return `Shatter ${effect.amount}`;

        case "burn":
            return `Burn ${effect.amount} / ${effect.duration}`;

        case "block":
            return `Block ${effect.amount}`;

        case "gain-action":
            return `+${effect.amount} Action`;

        case "draw":
            return `Draw ${effect.amount}`;

        case "heal":
            return `Heal ${effect.amount}`;

        case "reduce-strength":
            return `-${effect.amount} Strength`;

        case "cleanse-weak":
            return `Cleanse Weak`;

        case "damage-if-burn":
            return `Damage ${effect.amount} (+${effect.bonusDamage} Burn)`;

        case "damage-if-player-weak":
            return `Damage ${effect.amount} (+${effect.bonusDamage} Weak)`;

        case "recover-exiled":
            return `Recover ${effect.amount} Exiled`;

        case "recover-all-exiled":
            return "Recover all Exiled";
    }
}

function getEffectDescription(
    effect: CardEffect,
): string | null {
    switch (effect.type) {
        case "damage":
            return `Deal ${effect.amount} damage to the enemy.`;

        case "piercing-damage":
            return `Deal ${effect.amount} fire damage that ignores Block.`;

        case "shatter":
            return `Deal ${effect.amount} damage and remove all enemy Block.`;

        case "burn":
            return `Apply ${effect.amount} Burn for ${effect.duration} turn${effect.duration === 1 ? "" : "s"}.`;

        case "block":
            return `Gain ${effect.amount} Block.`;

        case "gain-action":
            return `Gain ${effect.amount} additional action${effect.amount === 1 ? "" : "s"}.`;

        case "draw":
            return `Draw ${effect.amount} card${effect.amount === 1 ? "" : "s"}.`;

        case "heal":
            return `Restore ${effect.amount} HP.`;

        case "reduce-strength":
            return `Reduce the enemy's Strength by ${effect.amount}.`;

        case "cleanse-weak":
            return `Remove all Weak from yourself.`;

        case "damage-if-burn":
            return `Deal ${effect.amount} damage, or ${effect.amount + effect.bonusDamage} if the enemy is Burning.`;

        case "damage-if-player-weak":
            return `Deal ${effect.amount} damage, or ${effect.amount + effect.bonusDamage} while you are Weak.`;

        case "recover-exiled":
            return `Return ${effect.amount} Exiled card${effect.amount === 1 ? "" : "s"} to your Draw Pile.`;

        case "recover-all-exiled":
            return "Return all Exiled cards to your Draw Pile.";
    }
}

function getEffectIcon(
    effect: CardEffect,
): string {
    switch (effect.type) {
        case "damage":
            return "🔥";

        case "piercing-damage":
            return "◆";

        case "shatter":
            return "✦";

        case "burn":
            return "♨";

        case "block":
            return "🛡";

        case "gain-action":
            return "⚡";

        case "draw":
            return "🃏";

        case "heal":
            return "✚";

        case "reduce-strength":
            return "↓";

        case "cleanse-weak":
            return "✧";

        case "damage-if-burn":
        case "damage-if-player-weak":
            return "🔥";

        case "recover-exiled":
        case "recover-all-exiled":
            return "↶";
    }
}

function getEffectAccent(
    effect: CardEffect,
): string {
    switch (effect.type) {
        case "damage":
            return "text-orange-300";

        case "piercing-damage":
            return "text-amber-200";

        case "shatter":
            return "text-cyan-300";

        case "burn":
            return "text-red-300";

        case "block":
            return "text-sky-300";

        case "gain-action":
            return "text-yellow-300";

        case "draw":
            return "text-violet-300";

        case "heal":
            return "text-emerald-300";

        case "reduce-strength":
            return "text-cyan-300";

        case "cleanse-weak":
            return "text-violet-300";

        case "damage-if-burn":
        case "damage-if-player-weak":
            return "text-orange-300";

        case "recover-exiled":
        case "recover-all-exiled":
            return "text-purple-300";
    }
}

function getRaritySymbol(rarity: CardDefinition["rarity"]): string {
    switch (rarity) {
        case "common":
            return "◇";
        case "uncommon":
            return "◆";
        case "rare":
            return "✦";
        case "legendary":
            return "♛";
    }
}

function getRarityAccent(rarity: CardDefinition["rarity"]): string {
    switch (rarity) {
        case "common":
            return "text-stone-300";
        case "uncommon":
            return "text-emerald-300";
        case "rare":
            return "text-blue-300";
        case "legendary":
            return "text-amber-300";
    }
}

export default function Card({
    card,
    disabled = false,
    onClick,
    isHovered = false,
    isPlaying = false,
}: CardProps) {
    const definition = cards.find(
        (item) => item.id === card.cardId,
    );

    if (!definition) {
        return null;
    }

    const artwork = cardArt[card.cardId];

    const isOnCooldown =
        card.cooldownRemaining > 0;

    const hasMultipleEffects =
        definition.effects.length > 1;

    return (
        <button
            type="button"
            disabled={
                disabled ||
                isPlaying
            }
            onClick={() =>
                onClick(card.cardId)
            }
            aria-label={definition.name}
            className={[
                "group relative flex h-[252px] w-[164px] origin-bottom flex-col overflow-hidden rounded-[14px]",
                "border border-stone-700/90",
                "bg-[#120e0b]",
                "text-left text-stone-100",
                "shadow-[0_12px_28px_rgba(0,0,0,0.55)]",
                "transition-[transform,box-shadow,border-color,opacity] duration-200 ease-out",
                "focus:outline-none",
                "focus-visible:ring-2 focus-visible:ring-orange-400/70",

                isHovered && !isPlaying
                    ? [
                          "z-50",
                          "-translate-y-2",
                          "scale-[1.04]",
                          "border-orange-400",
                          "shadow-[0_18px_40px_rgba(0,0,0,0.65),0_0_30px_rgba(234,88,12,0.22)]",
                      ].join(" ")
                    : "",

                isPlaying
                    ? [
                          "z-[200]",
                          "pointer-events-none",
                          "border-orange-300",
                          "shadow-[0_0_45px_rgba(234,88,12,0.45)]",
                          "animate-[cardPlay_360ms_cubic-bezier(0.22,1,0.36,1)_forwards]",
                      ].join(" ")
                    : "",

                disabled && !isPlaying
                    ? [
                          "cursor-not-allowed",
                          "opacity-40",
                          "grayscale-[0.3]",
                      ].join(" ")
                    : !disabled &&
                        !isPlaying
                      ? [
                            "cursor-pointer",
                            "hover:-translate-y-1",
                            "hover:border-orange-500/80",
                            "hover:shadow-[0_16px_34px_rgba(0,0,0,0.6),0_0_24px_rgba(234,88,12,0.18)]",
                        ].join(" ")
                      : "",
            ].join(" ")}
        >
            {/* Outer frame */}
            <div className="pointer-events-none absolute inset-0 rounded-[14px] border border-white/[0.04]" />

            {/* Play glow */}
            {isPlaying && (
                <div className="pointer-events-none absolute inset-0 z-30 bg-orange-400/10" />
            )}

            {/* Top accent */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500/70 to-transparent" />

            {/* Artwork */}
            <div className="relative h-[118px] shrink-0 overflow-hidden border-b border-stone-800/90 bg-[#0a0807]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(188,63,18,0.28),transparent_72%)]" />

                {artwork ? (
                    <img
                        src={artwork}
                        alt={definition.name}
                        draggable={false}
                        className={[
                            "absolute inset-0 h-full w-full object-contain p-1",
                            "transition-transform duration-300",
                            isPlaying
                                ? "scale-[1.08]"
                                : isHovered
                                  ? "scale-[1.04]"
                                  : "scale-100",
                        ].join(" ")}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-[0.2em] text-stone-700">
                        No Art
                    </div>
                )}

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#120e0b]/70" />

                <div className="absolute left-3 top-2">
                    <span className="rounded-full border border-white/10 bg-black/45 px-2 py-1 text-[8px] uppercase tracking-[0.2em] text-stone-300 backdrop-blur-sm">
                        {definition.category}
                    </span>
                </div>

                {definition.exhaust && (
                    <div className="absolute right-3 top-2 rounded-full border border-purple-500/50 bg-black/75 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-purple-300 shadow-[0_0_14px_rgba(168,85,247,0.2)]">
                        Exhaust
                    </div>
                )}

                {isOnCooldown && (
                    <>
                        <div className="absolute inset-0 bg-black/35" />

                        <div className="absolute right-3 top-2">
                            <span className="flex h-7 min-w-7 items-center justify-center rounded-full border border-red-500/50 bg-black/75 px-2 text-xs font-bold text-red-300 shadow-[0_0_14px_rgba(220,38,38,0.25)]">
                                {card.cooldownRemaining}
                            </span>
                        </div>
                    </>
                )}
            </div>

            {/* Main content */}
            <div className="flex min-h-0 flex-1 flex-col px-3 pb-2.5">
                <div className="relative mt-2">
                    <h3 className="truncate text-center font-serif text-[13px] font-bold uppercase tracking-[0.06em] text-stone-100">
                        {definition.name}
                    </h3>

                    <div
                        className={[
                            "mt-1 flex items-center justify-center",
                            getRarityAccent(definition.rarity),
                        ].join(" ")}
                        title={definition.rarity}
                        aria-label={`Rarity: ${definition.rarity}`}
                    >
                        <span className="text-[13px] leading-none drop-shadow-[0_0_6px_currentColor]">
                            {getRaritySymbol(definition.rarity)}
                        </span>
                    </div>
                </div>

                <div className="mt-1.5 flex min-h-0 flex-1 overflow-hidden border-t border-stone-800/80 pt-2">
                    <div
                        className={[
                            "flex w-full flex-col justify-center",
                            hasMultipleEffects ? "gap-1.5" : "gap-1",
                        ].join(" ")}
                    >
                        {definition.effects.map((effect, index) => {
                            const description = getEffectDescription(effect);

                            return (
                                <div
                                    key={`${effect.type}-${index}`}
                                    className="flex items-start gap-1.5"
                                >
                                    <span
                                        className={[
                                            "mt-0.5 shrink-0 text-[10px]",
                                            getEffectAccent(effect),
                                        ].join(" ")}
                                    >
                                        {getEffectIcon(effect)}
                                    </span>

                                    <p className="text-[8.5px] leading-[1.28] text-stone-300">
                                        {description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {(definition.exhaust || isOnCooldown) && (
                    <div className="mt-1.5 border-t border-stone-800/80 pt-1.5">
                        {definition.exhaust ? (
                            <div className="flex items-center justify-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                                <span className="text-[8px] font-medium uppercase tracking-[0.18em] text-purple-400">
                                    Exhausts
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_7px_rgba(239,68,68,0.65)]" />
                                <span className="text-[8px] font-medium uppercase tracking-[0.18em] text-red-400">
                                    Cooldown {card.cooldownRemaining}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {!disabled &&
                !isPlaying && (
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
                        <div className="absolute inset-y-0 left-0 w-px bg-white/10" />
                    </div>
                )}
        </button>
    );
}
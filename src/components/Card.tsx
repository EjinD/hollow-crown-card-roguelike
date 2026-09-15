import fireballImage from "../assets/cards/fireball.webp";
import flameBurstImage from "../assets/cards/flame-burst.webp";
import emberStrikeImage from "../assets/cards/ember-strike.webp";
import infernoImage from "../assets/cards/inferno.webp";
import flameGuardImage from "../assets/cards/flame-guard.webp";
import emberWallImage from "../assets/cards/ember-wall.webp";
import emberGuardImage from "../assets/cards/ember-guard.webp";
import igniteImage from "../assets/cards/ignite.webp";
import scorchImage from "../assets/cards/scorch.webp";
import fireStormImage from "../assets/cards/fire-storm.webp";

import type {
    CardEffect,
    CardState,
} from "../types/game";

import { cards } from "../data/cards";

const cardArt: Record<string, string> = {
    fireball: fireballImage,
    "flame-burst": flameBurstImage,
    "ember-strike": emberStrikeImage,
    inferno: infernoImage,
    "flame-guard": flameGuardImage,
    "ember-wall": emberWallImage,
    "ember-guard": emberGuardImage,
    ignite: igniteImage,
    scorch: scorchImage,
    "fire-storm": fireStormImage,
};

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
    }
}

function getEffectDescription(
    effect: CardEffect,
): string | null {
    switch (effect.type) {
        case "damage":
            return `Deal ${effect.amount} damage to the enemy.`;

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
    }
}

function getEffectIcon(
    effect: CardEffect,
): string {
    switch (effect.type) {
        case "damage":
            return "🔥";

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
    }
}

function getEffectAccent(
    effect: CardEffect,
): string {
    switch (effect.type) {
        case "damage":
            return "text-orange-300";

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
                "group relative flex h-[240px] w-[164px] origin-bottom flex-col overflow-hidden rounded-[14px]",
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
            <div className="relative h-[122px] shrink-0 overflow-hidden border-b border-stone-800/90">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(188,63,18,0.28),transparent_72%)]" />

                {artwork ? (
                    <img
                        src={artwork}
                        alt={definition.name}
                        draggable={false}
                        className={[
                            "absolute inset-0 h-full w-full object-cover",
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
                        Spell
                    </span>
                </div>

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
            <div className="flex min-h-0 flex-1 flex-col px-3 pb-3">
                <div className="relative mt-2.5">
                    <h3 className="truncate text-center font-serif text-[13px] font-bold uppercase tracking-[0.08em] text-stone-100">
                        {definition.name}
                    </h3>

                    <div className="mx-auto mt-1 h-px w-8 bg-orange-500/40" />
                </div>

                <div className="mt-2.5 flex-1 overflow-hidden">
                    <div
                        className={[
                            "flex flex-col items-center",
                            hasMultipleEffects
                                ? "gap-1.5"
                                : "gap-1",
                        ].join(" ")}
                    >
                        {definition.effects.map(
                            (
                                effect,
                                index,
                            ) => (
                                <div
                                    key={`${effect.type}-${index}`}
                                    className="flex w-full items-center justify-center gap-1.5"
                                >
                                    <span
                                        className={[
                                            "text-[11px]",
                                            getEffectAccent(
                                                effect,
                                            ),
                                        ].join(" ")}
                                    >
                                        {getEffectIcon(
                                            effect,
                                        )}
                                    </span>

                                    <span className="text-[10px] font-medium tracking-wide text-stone-300">
                                        {getEffectLabel(
                                            effect,
                                        )}
                                    </span>
                                </div>
                            ),
                        )}
                    </div>

                    {isHovered &&
                        !isPlaying && (
                            <div className="mt-2.5 border-t border-stone-800/80 pt-2">
                                {definition.effects.map(
                                    (
                                        effect,
                                        index,
                                    ) => {
                                        const description =
                                            getEffectDescription(
                                                effect,
                                            );

                                        return (
                                            <p
                                                key={`description-${effect.type}-${index}`}
                                                className="mb-1 text-[8px] leading-[1.25] text-stone-500"
                                            >
                                                {
                                                    description
                                                }
                                            </p>
                                        );
                                    },
                                )}
                            </div>
                        )}
                </div>

                <div className="mt-2 border-t border-stone-800/80 pt-2">
                    {isOnCooldown ? (
                        <div className="flex items-center justify-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_7px_rgba(239,68,68,0.65)]" />

                            <span className="text-[8px] font-medium uppercase tracking-[0.18em] text-red-400">
                                Cooldown{" "}
                                {
                                    card.cooldownRemaining
                                }
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-orange-500/60" />

                            <span className="text-[8px] font-medium uppercase tracking-[0.18em] text-stone-600">
                                Ready
                            </span>
                        </div>
                    )}
                </div>
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
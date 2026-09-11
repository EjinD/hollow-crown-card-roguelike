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

import type { CardState, CardEffect } from "../types/game";
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
        case "burn":
            return "Deals damage at the start of each turn. Stacks.";

        case "block":
            return "Absorbs incoming damage before HP is reduced.";

        case "gain-action":
            return "Adds an additional action to this turn.";

        case "draw":
            return "Draws cards from your deck.";

        case "heal":
            return "Restores lost HP.";

        default:
            return null;
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

export default function Card({
    card,
    disabled = false,
    onClick,
    isHovered = false,
}: CardProps) {
    const definition = cards.find(
        (item) => item.id === card.cardId,
    );

    const artwork = cardArt[card.cardId];

    if (!definition) {
        return null;
    }

    const isOnCooldown =
        card.cooldownRemaining > 0;

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => onClick(card.cardId)}
            className={[
                "group relative flex h-52 w-36 origin-bottom flex-col overflow-hidden rounded-xl border-2 bg-[#17100d] text-left shadow-[0_8px_20px_rgba(0,0,0,0.45)] transition-all duration-200",
                isHovered
                    ? "border-orange-500 shadow-[0_0_28px_rgba(234,88,12,0.45)]"
                    : "border-stone-700",
                disabled
                    ? "cursor-not-allowed opacity-45"
                    : "cursor-pointer hover:border-orange-500",
            ].join(" ")}
        >
            {/* ART AREA */}
            <div className="relative h-24 shrink-0 overflow-hidden bg-[radial-gradient(circle_at_center,rgba(180,55,15,0.35),transparent_70%)]">
                <div className="absolute inset-0 flex items-center justify-center">
                    <img
                        src={artwork}
                        alt={definition.name}
                        draggable={false}
                        className="h-full w-full object-cover"
                    />
                </div>

                <div className="absolute left-3 top-2">
                    <span className="text-[9px] uppercase tracking-[0.22em] text-stone-500">
                        Spell
                    </span>
                </div>

                {isOnCooldown && (
                    <div className="absolute right-3 top-2">
                        <span className="rounded-full border border-red-900 bg-black/70 px-2 py-1 text-[10px] font-bold text-red-400">
                            {card.cooldownRemaining}
                        </span>
                    </div>
                )}
            </div>

            {/* CARD CONTENT */}
            <div className="flex min-h-0 flex-1 flex-col px-3 pb-3">

                <h3 className="mt-2 text-center font-serif text-sm font-bold uppercase tracking-wide text-stone-100">
                    {definition.name}
                </h3>

                <div className="mt-2 flex-1 overflow-hidden">
                    <div className="space-y-1 text-center">
                        {definition.effects.map(
                            (effect, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-center gap-1"
                                >
                                    <span className="text-xs">
                                        {getEffectIcon(
                                            effect,
                                        )}
                                    </span>

                                    <span className="text-[10px] text-stone-300">
                                        {getEffectLabel(
                                            effect,
                                        )}
                                    </span>
                                </div>
                            ),
                        )}
                    </div>

                    {isHovered && (
                        <div className="mt-3 border-t border-stone-800 pt-2">
                            {definition.effects.map(
                                (effect, index) => {
                                    const description =
                                        getEffectDescription(
                                            effect,
                                        );

                                    if (!description) {
                                        return null;
                                    }

                                    return (
                                        <p
                                            key={index}
                                            className="mb-1 text-[9px] leading-tight text-stone-500"
                                        >
                                            <span className="text-stone-300">
                                                {getEffectLabel(
                                                    effect,
                                                )}
                                            </span>
                                            {" — "}
                                            {description}
                                        </p>
                                    );
                                },
                            )}
                        </div>
                    )}
                </div>

                {/* COOLDOWN */}
                <div className="mt-2 border-t border-stone-800 pt-2 text-center">
                    {isOnCooldown ? (
                        <span className="text-[9px] uppercase tracking-[0.18em] text-red-400">
                            Cooldown {card.cooldownRemaining}
                        </span>
                    ) : (
                        <span className="text-[9px] uppercase tracking-[0.18em] text-stone-600">
                            Spell
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
}
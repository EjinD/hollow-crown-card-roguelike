import type { CardState, CardEffect } from "../types/game";
import { cards } from "../data/cards";

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

export default function Card({
    card,
    disabled = false,
    onClick,
    isHovered = false
}: CardProps) {
    const definition = cards.find(
    (item) => item.id === card.cardId,
    );

    function getEffectDescription(
    effect: CardEffect,
): string | null {
    switch (effect.type) {
        case "burn":
            return "Burn deals damage at the start of each turn. It stacks.";

        default:
            return null;
    }
}

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => onClick(card.cardId)}
            className={[
                "flex h-44 w-32 flex-col rounded-xl border-2 bg-[#18120f] p-3 text-left transition-all duration-200",
                disabled
                    ? "cursor-not-allowed border-stone-800 opacity-50"
                    : "cursor-pointer border-stone-700 hover:-translate-y-2 hover:border-orange-500 hover:shadow-[0_0_20px_rgba(234,88,12,0.35)]",
            ].join(" ")}
        >
<div className="flex flex-1 flex-col items-center justify-center text-center">
    <span className="font-serif text-lg font-bold uppercase text-stone-200">
        {definition?.name ?? card.cardId}
    </span>

    {isHovered && definition && (
        <div className="mt-3 space-y-2">
            {definition.effects.map(
                (effect, index) => (
                    <div key={index}>
                        <p className="text-xs text-stone-300">
                            {getEffectLabel(effect)}
                        </p>

                        {getEffectDescription(
                            effect,
                        ) && (
                            <p className="mt-1 max-w-28 text-[10px] leading-tight text-stone-500">
                                {getEffectDescription(
                                    effect,
                                )}
                            </p>
                        )}
                    </div>
                ),
            )}
        </div>
    )}
</div>
        </button>
    );
}
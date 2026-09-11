import type { StatusEffect } from "../types/game";

interface StatusEffectsProps {
    effects: StatusEffect[];
}

function getEffectIcon(
    effect: StatusEffect,
): string {
    switch (effect.type) {
        case "burn":
            return "🔥";

        case "weak":
            return "⬇";

        default:
            return "?";
    }
}

function getEffectLabel(
    effect: StatusEffect,
): string {
    switch (effect.type) {
        case "burn":
            return "Burn";

        case "weak":
            return "Weak";

        default:
            return effect.type;
    }
}

function getEffectValue(
    effect: StatusEffect,
): string {
    switch (effect.type) {
        case "burn":
            return `${effect.amount}/${effect.duration}`;

        case "weak":
            return `${effect.amount}%/${effect.duration}`;

        default:
            return "";
    }
}

export default function StatusEffects({
    effects,
}: StatusEffectsProps) {
    if (effects.length === 0) {
        return null;
    }

    return (
        <div className="mt-2 flex items-center gap-2">
            {effects.map((effect, index) => (
                <div
                    key={`${effect.type}-${index}`}
                    title={`${getEffectLabel(effect)}: ${getEffectValue(effect)}`}
                    className="flex h-9 min-w-9 items-center justify-center gap-1 border border-stone-700 bg-black/50 px-2 text-sm shadow-[0_2px_10px_rgba(0,0,0,0.35)]"
                >
                    <span>
                        {getEffectIcon(effect)}
                    </span>

                    <span className="text-[10px] font-bold text-stone-300">
                        {effect.duration}
                    </span>
                </div>
            ))}
        </div>
    );
}
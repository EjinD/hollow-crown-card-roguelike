import type { StatusEffect } from "../types/game";

interface StatusEffectsProps {
    effects: StatusEffect[];
    side?: "player" | "enemy";
}

function getEffectIcon(effect: StatusEffect): string {
    switch (effect.type) {
        case "burn":
            return "🔥";
        case "weak":
            return "⬇";
        case "strength-down":
            return "⚔↓";
        default:
            return "?";
    }
}

function getEffectLabel(effect: StatusEffect): string {
    switch (effect.type) {
        case "burn":
            return "Burn";
        case "weak":
            return "Weak";
        case "strength-down":
            return "Strength Down";
        default:
            return effect.type;
    }
}

function getEffectValue(effect: StatusEffect): string {
    switch (effect.type) {
        case "burn":
            return `${effect.amount}/${effect.duration}`;
        case "weak":
            return `${effect.amount}%/${effect.duration}`;
        case "strength-down":
            return `-${effect.amount}/${effect.duration}`;
        default:
            return "";
    }
}

function getEffectDescription(
    effect: StatusEffect,
    side: "player" | "enemy",
): string {
    switch (effect.type) {
        case "burn":
            return `At the start of the enemy turn, ${side === "enemy" ? "this enemy" : "you"} takes ${effect.amount} damage. Duration: ${effect.duration} turn${effect.duration === 1 ? "" : "s"}.`;
        case "weak":
            return `${effect.amount}% less damage dealt by ${side === "enemy" ? "this enemy" : "you"}. Duration: ${effect.duration} turn${effect.duration === 1 ? "" : "s"}.`;
        case "strength-down":
            return `Enemy Strength was reduced by ${effect.amount}. This marker lasts until the end of the current turn.`;
        default:
            return effect.type;
    }
}

function getTone(effect: StatusEffect): string {
    switch (effect.type) {
        case "burn":
            return "border-red-800/80 text-red-200";
        case "weak":
            return "border-violet-800/80 text-violet-200";
        case "strength-down":
            return "border-cyan-800/80 text-cyan-200";
        default:
            return "border-stone-700 text-stone-200";
    }
}

export default function StatusEffects({
    effects,
    side = "enemy",
}: StatusEffectsProps) {
    if (effects.length === 0) {
        return null;
    }

    return (
        <div className="mt-2 flex flex-wrap items-center gap-2">
            {effects.map((effect, index) => (
                <div
                    key={`${effect.type}-${index}`}
                    className="group relative"
                >
                    <div
                        className={`flex h-9 min-w-9 items-center justify-center gap-1 border bg-black/55 px-2 text-sm shadow-[0_2px_10px_rgba(0,0,0,0.35)] transition hover:bg-black/80 ${getTone(effect)}`}
                        aria-label={`${getEffectLabel(effect)}: ${getEffectValue(effect)}`}
                    >
                        <span>{getEffectIcon(effect)}</span>
                        <span className="text-[10px] font-bold text-stone-200">
                            {effect.amount}
                        </span>
                        <span className="text-[9px] text-stone-500">
                            {effect.duration}
                        </span>
                    </div>

                    <div className="pointer-events-none absolute bottom-full left-1/2 z-[80] mb-2 w-56 -translate-x-1/2 translate-y-1 opacity-0 transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100">
                        <div className="border border-stone-700 bg-[#100b09]/98 px-3 py-2.5 text-left shadow-[0_10px_30px_rgba(0,0,0,0.65)] backdrop-blur-sm">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-200">
                                    {getEffectLabel(effect)}
                                </span>
                                <span className="text-[9px] font-bold text-stone-400">
                                    {getEffectValue(effect)}
                                </span>
                            </div>
                            <p className="mt-1.5 text-[10px] leading-[1.35] text-stone-400">
                                {getEffectDescription(effect, side)}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

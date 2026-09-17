import type { EnemyIntent as EnemyIntentType } from "../types/game";

interface EnemyIntentProps {
    intent: EnemyIntentType;
    isExecuting?: boolean;
}

function IntentGlyph({ type, color }: { type: EnemyIntentType["type"]; color: string }) {
    const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

    if (["attack", "attack-debuff", "attack-buff", "drain"].includes(type)) {
        return <svg viewBox="0 0 24 24" className={`h-7 w-7 ${color}`} aria-hidden="true"><path {...common} d="M5 19 19 5M14 5h5v5M9 19H5v-4" /></svg>;
    }
    if (["block", "block-buff"].includes(type)) {
        return <svg viewBox="0 0 24 24" className={`h-7 w-7 ${color}`} aria-hidden="true"><path {...common} d="M12 3 19 6v5c0 5-3.2 8-7 10-3.8-2-7-5-7-10V6l7-3Z"/><path {...common} d="m9 12 2 2 4-5" /></svg>;
    }
    if (type === "heal") {
        return <svg viewBox="0 0 24 24" className={`h-7 w-7 ${color}`} aria-hidden="true"><path {...common} d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.4A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z"/><path {...common} d="M12 9v6M9 12h6"/></svg>;
    }
    if (type === "buff") {
        return <svg viewBox="0 0 24 24" className={`h-7 w-7 ${color}`} aria-hidden="true"><path {...common} d="M12 19V5M7 10l5-5 5 5"/></svg>;
    }
    return <svg viewBox="0 0 24 24" className={`h-7 w-7 ${color}`} aria-hidden="true"><path {...common} d="M12 5v14M7 14l5 5 5-5"/></svg>;
}

function getIntentColor(intent: EnemyIntentType): string {
    switch (intent.type) {
        case "attack": case "attack-debuff": case "attack-buff": case "drain": return "text-red-300";
        case "block": case "block-buff": return "text-sky-300";
        case "heal": return "text-emerald-300";
        case "buff": return "text-amber-300";
        case "debuff": return "text-violet-300";
    }
}

function getIntentLabel(intent: EnemyIntentType): string {
    switch (intent.type) {
        case "attack": return "Attack";
        case "attack-debuff": return "Venom Strike";
        case "attack-buff": return "Ravaging Strike";
        case "drain": return "Drain";
        case "block": return "Block";
        case "block-buff": return "Fortify";
        case "heal": return "Heal";
        case "buff": return "Strength";
        case "debuff": return "Weak";
    }
}

function getIntentAmount(intent: EnemyIntentType): string {
    switch (intent.type) {
        case "attack": return `${intent.damage} Damage`;
        case "attack-debuff": return `${intent.damage} Damage + ${intent.amount}% Weak`;
        case "attack-buff": return `${intent.damage} Damage +${intent.amount} Strength`;
        case "drain": return `${intent.damage} Damage / +${intent.heal} HP`;
        case "block": return `${intent.amount} Block`;
        case "block-buff": return `${intent.block} Block +${intent.strength} Strength`;
        case "heal": return `${intent.amount} HP`;
        case "buff": return `+${intent.amount} Strength`;
        case "debuff": return `${intent.amount}% Weak`;
    }
}

function getTone(type: EnemyIntentType["type"]): { border: string; glow: string; accent: string } {
    if (["attack", "attack-debuff", "attack-buff", "drain"].includes(type)) return { border: "border-red-800/80", glow: "shadow-[0_0_30px_rgba(220,38,38,0.18)]", accent: "text-red-300" };
    if (["block", "block-buff"].includes(type)) return { border: "border-sky-800/70", glow: "shadow-[0_0_30px_rgba(56,189,248,0.15)]", accent: "text-sky-300" };
    if (type === "heal") return { border: "border-emerald-800/70", glow: "shadow-[0_0_30px_rgba(16,185,129,0.15)]", accent: "text-emerald-300" };
    if (type === "buff") return { border: "border-amber-800/70", glow: "shadow-[0_0_30px_rgba(245,158,11,0.15)]", accent: "text-amber-300" };
    return { border: "border-violet-800/70", glow: "shadow-[0_0_30px_rgba(139,92,246,0.15)]", accent: "text-violet-300" };
}

export default function EnemyIntent({ intent, isExecuting = false }: EnemyIntentProps) {
    const tone = getTone(intent.type);
    const iconColor = getIntentColor(intent);

    return (
        <div className={[
            "relative w-48 overflow-hidden border bg-[linear-gradient(180deg,#1b110d,#0b0807)] px-4 py-4 text-center",
            tone.border,
            tone.glow,
            isExecuting ? "scale-105 shadow-[0_0_36px_rgba(234,88,12,0.26)]" : "",
            "transition-all duration-200",
        ].join(" ")}>
            <div className="pointer-events-none absolute inset-[3px] border border-white/[0.035]" />
            <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/20 to-transparent" />

            <div className="relative mx-auto flex h-12 w-12 items-center justify-center border border-amber-900/50 bg-black/35 shadow-[inset_0_0_20px_rgba(0,0,0,0.45)]">
                <IntentGlyph type={intent.type} color={iconColor} />
            </div>

            <p className="mt-2 text-[8px] uppercase tracking-[0.3em] text-stone-600">Intent</p>
            <p className={`mt-1 font-serif text-lg font-bold uppercase tracking-[0.05em] ${tone.accent}`}>{getIntentLabel(intent)}</p>
            <p className="mt-1 text-xs font-medium text-stone-300">{getIntentAmount(intent)}</p>

            {isExecuting && (
                <div className={`mt-3 border-t border-white/5 pt-2 text-[8px] font-semibold uppercase tracking-[0.24em] ${tone.accent} animate-pulse`}>
                    Resolving intent
                </div>
            )}
        </div>
    );
}

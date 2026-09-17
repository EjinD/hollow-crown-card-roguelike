import type { StatusEffect } from "../types/game";

interface StatusEffectsProps { effects: StatusEffect[]; side?: "player" | "enemy"; }

function EffectGlyph({ type, className = "" }: { type: StatusEffect["type"]; className?: string }) {
    const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
    if (type === "burn") return <svg viewBox="0 0 24 24" className={`h-4 w-4 ${className}`}><path {...common} d="M13 3c1 4-3 5-3 9 0 2 1 3 2 4 0-3 2-4 3-6 2 2 4 4 4 7a7 7 0 0 1-14 0c0-3 2-6 5-8-1 2 0 4 0 5 2-2 4-5 3-11Z"/></svg>;
    if (type === "weak") return <svg viewBox="0 0 24 24" className={`h-4 w-4 ${className}`}><path {...common} d="M12 4v14M7 13l5 5 5-5"/></svg>;
    return <svg viewBox="0 0 24 24" className={`h-4 w-4 ${className}`}><path {...common} d="M5 7h14M7 12h10M9 17h6"/><path {...common} d="M12 3v18"/></svg>;
}

function getEffectLabel(effect: StatusEffect): string {
    switch (effect.type) { case "burn": return "Burn"; case "weak": return "Weak"; case "strength-down": return "Strength Down"; default: return effect.type; }
}
function getEffectValue(effect: StatusEffect): string {
    switch (effect.type) { case "burn": return `${effect.amount} / ${effect.duration}`; case "weak": return `${effect.amount}% / ${effect.duration}`; case "strength-down": return `-${effect.amount} / ${effect.duration}`; default: return ""; }
}
function getDescription(effect: StatusEffect, side: "player" | "enemy"): string {
    switch (effect.type) {
        case "burn": return `At the start of the enemy turn, ${side === "enemy" ? "this enemy" : "you"} take ${effect.amount} damage. Duration: ${effect.duration} turn${effect.duration === 1 ? "" : "s"}.`;
        case "weak": return `${effect.amount}% less damage dealt by ${side === "enemy" ? "this enemy" : "you"}. Duration: ${effect.duration} turn${effect.duration === 1 ? "" : "s"}.`;
        case "strength-down": return `Enemy Strength reduced by ${effect.amount}. Duration: ${effect.duration} turn${effect.duration === 1 ? "" : "s"}.`;
        default: return effect.type;
    }
}
function tone(type: StatusEffect["type"]): { border: string; text: string; glow: string } {
    if (type === "burn") return { border: "border-red-700/80", text: "text-red-300", glow: "shadow-[0_0_16px_rgba(239,68,68,0.18)]" };
    if (type === "weak") return { border: "border-violet-700/80", text: "text-violet-300", glow: "shadow-[0_0_16px_rgba(139,92,246,0.16)]" };
    return { border: "border-cyan-700/80", text: "text-cyan-300", glow: "shadow-[0_0_16px_rgba(34,211,238,0.14)]" };
}

export default function StatusEffects({ effects, side = "enemy" }: StatusEffectsProps) {
    if (effects.length === 0) return null;
    return (
        <div className="mt-2 flex flex-wrap items-center gap-2">
            {effects.map((effect, index) => {
                const t = tone(effect.type);
                return (
                    <div key={`${effect.type}-${index}`} className="group relative">
                        <div className={[
                            "flex min-h-10 min-w-10 items-center gap-1.5 border bg-[linear-gradient(180deg,#1b100c,#0b0807)] px-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
                            t.border, t.glow,
                        ].join(" ")} aria-label={`${getEffectLabel(effect)}: ${getEffectValue(effect)}`}>
                            <EffectGlyph type={effect.type} className={t.text} />
                            <div className="leading-none">
                                <span className={`block text-sm font-bold ${t.text}`}>{effect.amount}</span>
                                <span className="block text-[7px] uppercase tracking-[0.15em] text-stone-600">{effect.duration}T</span>
                            </div>
                        </div>

                        <div className="pointer-events-none absolute bottom-full left-1/2 z-[80] mb-2 w-60 -translate-x-1/2 translate-y-1 border border-amber-900/60 bg-[#0d0907]/98 p-3 text-left opacity-0 shadow-[0_12px_30px_rgba(0,0,0,0.65)] transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100">
                            <div className="flex items-center justify-between gap-3">
                                <span className="font-serif text-sm font-bold uppercase text-stone-100">{getEffectLabel(effect)}</span>
                                <span className={`text-xs font-bold ${t.text}`}>{getEffectValue(effect)}</span>
                            </div>
                            <p className="mt-1.5 text-[10px] leading-[1.45] text-stone-400">{getDescription(effect, side)}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

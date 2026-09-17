import type { CardDefinition, CardEffect, CardState } from "../types/game";
import { cards } from "../data/cards";
import CardArtwork from "./CardArtwork";

interface CardProps {
    card: CardState;
    disabled?: boolean;
    onClick: (cardId: string) => void;
    isHovered?: boolean;
    isPlaying?: boolean;
}

function getEffectIcon(effect: CardEffect): string {
    switch (effect.type) {
        case "damage": return "✦";
        case "piercing-damage": return "◆";
        case "shatter": return "◈";
        case "burn": return "♨";
        case "block": return "◇";
        case "gain-action": return "ϟ";
        case "draw": return "⌘";
        case "heal": return "+";
        case "reduce-strength": return "↓";
        case "cleanse-weak": return "✧";
        case "damage-if-burn":
        case "damage-if-player-weak": return "✦";
        case "recover-exiled":
        case "recover-all-exiled": return "↶";
    }
}

function getEffectDescription(effect: CardEffect): string {
    switch (effect.type) {
        case "damage": return `Deal ${effect.amount} damage to the enemy.`;
        case "piercing-damage": return `Deal ${effect.amount} fire damage that ignores Block.`;
        case "shatter": return `Deal ${effect.amount} damage and remove all enemy Block.`;
        case "burn": return `Apply ${effect.amount} Burn for ${effect.duration} turn${effect.duration === 1 ? "" : "s"}.`;
        case "block": return `Gain ${effect.amount} Block.`;
        case "gain-action": return `Gain ${effect.amount} additional action${effect.amount === 1 ? "" : "s"}.`;
        case "draw": return `Draw ${effect.amount} card${effect.amount === 1 ? "" : "s"}.`;
        case "heal": return `Restore ${effect.amount} HP.`;
        case "reduce-strength": return `Reduce the enemy's Strength by ${effect.amount}.`;
        case "cleanse-weak": return `Remove all Weak from yourself.`;
        case "damage-if-burn": return `Deal ${effect.amount} damage, or ${effect.amount + effect.bonusDamage} if the enemy is Burning.`;
        case "damage-if-player-weak": return `Deal ${effect.amount} damage, or ${effect.amount + effect.bonusDamage} while you are Weak.`;
        case "recover-exiled": return `Return ${effect.amount} Exiled card${effect.amount === 1 ? "" : "s"} to your Draw Pile.`;
        case "recover-all-exiled": return "Return all Exiled cards to your Draw Pile.";
    }
}

function getEffectAccent(effect: CardEffect): string {
    switch (effect.type) {
        case "damage":
        case "piercing-damage":
        case "damage-if-burn":
        case "damage-if-player-weak": return "text-orange-200";
        case "shatter": return "text-cyan-200";
        case "burn": return "text-red-300";
        case "block": return "text-sky-200";
        case "gain-action": return "text-amber-200";
        case "draw": return "text-violet-200";
        case "heal": return "text-emerald-200";
        case "reduce-strength": return "text-cyan-200";
        case "cleanse-weak": return "text-violet-200";
        case "recover-exiled":
        case "recover-all-exiled": return "text-purple-200";
    }
}

function rarityMeta(rarity: CardDefinition["rarity"]) {
    switch (rarity) {
        case "common": return { symbol: "◇", color: "text-stone-300", glow: "rgba(203,213,225,0.22)" };
        case "uncommon": return { symbol: "◆", color: "text-emerald-300", glow: "rgba(52,211,153,0.22)" };
        case "rare": return { symbol: "✦", color: "text-sky-300", glow: "rgba(56,189,248,0.24)" };
        case "legendary": return { symbol: "♛", color: "text-amber-300", glow: "rgba(245,158,11,0.32)" };
    }
}

function CornerOrnament({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
    const className = {
        tl: "left-1 top-1 border-l border-t",
        tr: "right-1 top-1 border-r border-t",
        bl: "bottom-1 left-1 border-b border-l",
        br: "bottom-1 right-1 border-b border-r",
    }[position];

    return <span className={`pointer-events-none absolute z-30 h-4 w-4 border-amber-300/55 ${className}`} />;
}

export default function Card({ card, disabled = false, onClick, isHovered = false, isPlaying = false }: CardProps) {
    const definition = cards.find((item) => item.id === card.cardId);
    if (!definition) return null;

    const rarity = rarityMeta(definition.rarity);
    const isOnCooldown = card.cooldownRemaining > 0;

    return (
        <button
            type="button"
            disabled={disabled || isPlaying}
            onClick={() => onClick(card.cardId)}
            aria-label={definition.name}
            className={[
                "group relative flex h-[284px] w-[188px] origin-bottom flex-col overflow-hidden rounded-[10px] text-left",
                "bg-[linear-gradient(145deg,#2a1a11_0%,#100a07_12%,#0c0806_100%)]",
                "text-stone-100 shadow-[0_18px_35px_rgba(0,0,0,0.62)]",
                "transition-[transform,box-shadow,filter] duration-200 ease-out focus:outline-none",
                disabled && !isPlaying ? "cursor-not-allowed opacity-45 grayscale-[0.25]" : "cursor-pointer",
                isHovered && !isPlaying ? "-translate-y-3 scale-[1.045] shadow-[0_24px_42px_rgba(0,0,0,0.72),0_0_32px_rgba(176,72,20,0.18)]" : "",
                isPlaying ? "z-[200] animate-[cardPlay_360ms_cubic-bezier(0.22,1,0.36,1)_forwards]" : "",
            ].join(" ")}
        >
            <span className="pointer-events-none absolute inset-0 rounded-[10px] border border-amber-900/70" />
            <span className="pointer-events-none absolute inset-[3px] rounded-[7px] border border-amber-300/10" />
            <span className="pointer-events-none absolute inset-[6px] rounded-[5px] border border-black/70" />
            <CornerOrnament position="tl" /><CornerOrnament position="tr" /><CornerOrnament position="bl" /><CornerOrnament position="br" />

            <div className="relative mx-[6px] mt-[6px] h-[138px] shrink-0 overflow-hidden rounded-[5px] border border-amber-900/65 bg-[#090705] shadow-[inset_0_0_0_1px_rgba(255,225,173,0.05),0_5px_16px_rgba(0,0,0,0.48)]">
                <CardArtwork cardId={card.cardId} alt={definition.name} className="absolute inset-0" imageClassName={["h-full w-full object-contain p-0.5 transition-transform duration-300", isHovered ? "scale-[1.05]" : "scale-100"].join(" ")} />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-[#0c0806]/55" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-7 bg-gradient-to-b from-black/40 to-transparent" />
                <span className="absolute left-2 top-2 border border-amber-900/60 bg-black/55 px-2 py-1 text-[7px] font-semibold uppercase tracking-[0.2em] text-stone-300 backdrop-blur-[2px]">{definition.category}</span>
                {definition.exhaust && <span className="absolute right-2 top-2 border border-violet-700/70 bg-black/65 px-2 py-1 text-[7px] font-semibold uppercase tracking-[0.15em] text-violet-200">Exhaust</span>}
                {isOnCooldown && <span className="absolute right-2 top-2 flex h-7 min-w-7 items-center justify-center rounded-full border border-red-700/80 bg-black/75 px-2 text-xs font-bold text-red-200">{card.cooldownRemaining}</span>}
            </div>

            <div className="mx-[7px] -mt-px border border-amber-800/60 bg-[linear-gradient(180deg,#5a351c,#2a160d)] px-3 py-1.5 text-center shadow-[inset_0_1px_0_rgba(255,235,190,0.16),0_3px_8px_rgba(0,0,0,0.4)]">
                <h3 className="truncate font-serif text-[14px] font-bold uppercase tracking-[0.045em] text-amber-50">{definition.name}</h3>
            </div>

            <div className="flex items-center justify-center gap-1.5 py-1">
                <span className={`text-[15px] leading-none drop-shadow-[0_0_6px_currentColor] ${rarity.color}`}>{rarity.symbol}</span>
                <span className={`text-[8px] font-semibold uppercase tracking-[0.24em] ${rarity.color}`}>{definition.rarity}</span>
            </div>

            <div className="mx-3 border-t border-amber-900/45 pt-2 pb-2.5">
                <div className="space-y-1.5">
                    {definition.effects.map((effect, index) => (
                        <div key={`${effect.type}-${index}`} className="flex items-start gap-2">
                            <span className={`mt-0.5 w-4 shrink-0 text-center text-[12px] ${getEffectAccent(effect)}`}>{getEffectIcon(effect)}</span>
                            <p className="text-[9.5px] leading-[1.35] text-stone-300">{getEffectDescription(effect)}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-amber-950/55 px-3 py-2 text-[7px] uppercase tracking-[0.18em] text-stone-600">
                <span>{definition.category}</span>
                <span>{definition.exhaust ? "Exhaust" : isOnCooldown ? `Cooldown ${card.cooldownRemaining}` : "Ready"}</span>
            </div>

            {isPlaying && <div className="pointer-events-none absolute inset-0 z-40 bg-orange-300/8 shadow-[inset_0_0_28px_rgba(234,88,12,0.28)]" />}
        </button>
    );
}

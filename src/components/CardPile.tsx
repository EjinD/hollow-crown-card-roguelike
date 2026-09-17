interface CardPileProps { label: string; count: number; variant: "draw" | "discard" | "exiled"; }

function config(variant: CardPileProps["variant"]) {
    switch (variant) {
        case "draw": return { accent: "text-stone-200", border: "border-amber-900/60", glow: "shadow-[0_0_24px_rgba(171,92,28,0.16)]", symbol: "◆" };
        case "discard": return { accent: "text-stone-400", border: "border-stone-700/70", glow: "shadow-[0_0_20px_rgba(0,0,0,0.35)]", symbol: "◇" };
        case "exiled": return { accent: "text-violet-200", border: "border-violet-800/70", glow: "shadow-[0_0_24px_rgba(139,92,246,0.16)]", symbol: "✦" };
    }
}

export default function CardPile({ label, count, variant }: CardPileProps) {
    const c = config(variant);
    return (
        <div className="group relative h-[118px] w-[96px]">
            <div className={`absolute left-3 top-3 h-[92px] w-[68px] rotate-[-7deg] border bg-[#0a0705] ${c.border} opacity-30`} />
            <div className={`absolute left-1 top-1 h-[92px] w-[68px] rotate-[-3deg] border bg-[#120c09] ${c.border} opacity-55`} />
            <div className={`relative z-10 h-[92px] w-[68px] border bg-[linear-gradient(145deg,#27170e,#0b0806)] ${c.border} ${c.glow} transition-transform duration-200 group-hover:-translate-y-1`}>
                <div className="absolute inset-[4px] border border-amber-200/[0.06]" />
                <div className="flex h-full flex-col items-center justify-center">
                    <span className={`text-lg ${c.accent}`}>{c.symbol}</span>
                    <span className={`font-serif text-3xl font-bold ${c.accent}`}>{count}</span>
                    <span className="mt-1 border border-stone-800/70 bg-black/40 px-2 py-1 text-[6px] font-semibold uppercase tracking-[0.17em] text-stone-500">{label}</span>
                </div>
            </div>
            <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 border border-amber-900/60 bg-[#0d0907]/98 px-3 py-2 opacity-0 shadow-[0_10px_25px_rgba(0,0,0,0.65)] transition-opacity duration-150 group-hover:opacity-100">
                <p className="text-[8px] uppercase tracking-[0.18em] text-stone-500">{label}</p>
                <p className={`mt-1 text-sm font-bold ${c.accent}`}>{count}</p>
            </div>
        </div>
    );
}

interface CardPileProps {
    label: string;
    count: number;
    variant: "draw" | "discard" | "exiled";
}

function getVariantConfig(
    variant: CardPileProps["variant"],
) {
    switch (variant) {
        case "draw":
            return {
                border: "border-stone-700",
                text: "text-stone-300",
                accent: "bg-stone-500",
                badge: "bg-stone-900 text-stone-300",
                shadow:
                    "shadow-[0_8px_25px_rgba(0,0,0,0.5)]",
            };

        case "discard":
            return {
                border: "border-stone-800",
                text: "text-stone-400",
                accent: "bg-stone-700",
                badge: "bg-stone-950 text-stone-500",
                shadow:
                    "shadow-[0_8px_25px_rgba(0,0,0,0.42)]",
            };

        case "exiled":
            return {
                border: "border-purple-900/70",
                text: "text-purple-300",
                accent: "bg-purple-500",
                badge: "bg-purple-950/70 text-purple-300",
                shadow:
                    "shadow-[0_8px_25px_rgba(45,20,70,0.4)]",
            };
    }
}

function getPileSymbol(
    variant: CardPileProps["variant"],
): string {
    switch (variant) {
        case "draw":
            return "◆";

        case "discard":
            return "◇";

        case "exiled":
            return "✦";
    }
}

function getCountLabel(
    variant: CardPileProps["variant"],
): string {
    switch (variant) {
        case "draw":
            return "Cards remaining";

        case "discard":
            return "Cards discarded";

        case "exiled":
            return "Cards exiled";
    }
}

export default function CardPile({
    label,
    count,
    variant,
}: CardPileProps) {
    const config =
        getVariantConfig(variant);

    const hasCards = count > 0;

    return (
        <div className="group relative h-[104px] w-[88px]">
            {/* Back cards */}
            {hasCards && (
                <>
                    <div
                        className={[
                            "absolute left-1 top-1 h-20 w-16 rounded-md border bg-[#0b0907]",
                            config.border,
                            "opacity-30",
                            "rotate-[-6deg]",
                        ].join(" ")}
                    />

                    <div
                        className={[
                            "absolute left-2 top-0 h-20 w-16 rounded-md border bg-[#100c0a]",
                            config.border,
                            "opacity-55",
                            "rotate-[-3deg]",
                        ].join(" ")}
                    />
                </>
            )}

            {/* Main pile */}
            <div
                className={[
                    "relative z-10 flex h-20 w-16 flex-col items-center justify-center rounded-md border",
                    "bg-[linear-gradient(to_bottom,#1a120f,#0d0907)]",
                    "transition-all duration-200",
                    config.border,
                    config.shadow,
                    hasCards
                        ? "group-hover:-translate-y-1"
                        : "",
                ].join(" ")}
            >
                {/* Top ornament */}
                <div className="absolute left-0 right-0 top-0 h-px bg-white/10" />

                <span
                    className={[
                        "text-[11px]",
                        config.text,
                    ].join(" ")}
                >
                    {getPileSymbol(
                        variant,
                    )}
                </span>

                <span
                    className={[
                        "mt-0.5 font-serif text-2xl font-bold leading-none",
                        config.text,
                    ].join(" ")}
                >
                    {count}
                </span>

                <span
                    className={[
                        "mt-1 rounded px-1.5 py-0.5 text-[6px] uppercase tracking-[0.16em]",
                        config.badge,
                    ].join(" ")}
                >
                    {label}
                </span>
            </div>

            {/* Tooltip */}
            <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max -translate-x-1/2 rounded border border-stone-800 bg-[#0d0a08] px-3 py-2 opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100">
                <p className="text-[8px] uppercase tracking-[0.18em] text-stone-500">
                    {getCountLabel(
                        variant,
                    )}
                </p>

                <p
                    className={[
                        "mt-1 text-xs font-bold",
                        config.text,
                    ].join(" ")}
                >
                    {count}
                </p>
            </div>
        </div>
    );
}
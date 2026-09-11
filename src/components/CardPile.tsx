interface CardPileProps {
    label: string;
    count: number;
    variant: "draw" | "discard" | "exiled";
}

function getVariantClasses(
    variant: CardPileProps["variant"],
): string {
    switch (variant) {
        case "draw":
            return "border-stone-700 text-stone-300";

        case "discard":
            return "border-stone-800 text-stone-400";

        case "exiled":
            return "border-purple-900/70 text-purple-300";
    }
}

export default function CardPile({
    label,
    count,
    variant,
}: CardPileProps) {
    return (
        <div
            className={[
                "flex h-20 w-20 flex-col items-center justify-center rounded-lg border bg-[#100c0a]/90 shadow-[0_5px_20px_rgba(0,0,0,0.4)]",
                getVariantClasses(variant),
            ].join(" ")}
        >
            <span className="text-2xl font-bold">
                {count}
            </span>

            <span className="mt-1 text-[8px] uppercase tracking-[0.18em]">
                {label}
            </span>
        </div>
    );
}
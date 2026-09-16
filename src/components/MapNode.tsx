import type { MapNode as MapNodeType } from "../types/game";

interface MapNodeProps {
    node: MapNodeType;
    isCurrent: boolean;
    isAvailable: boolean;
    onClick: (nodeId: string) => void;
}

function getNodeIcon(type: MapNodeType["type"]): string {
    switch (type) {
        case "battle":
            return "⚔";
        case "elite":
            return "☠";
        case "event":
            return "?";
        case "shop":
            return "♜";
        case "rest":
            return "🔥";
        case "boss":
            return "♛";
    }
}

function getNodeLabel(type: MapNodeType["type"]): string {
    switch (type) {
        case "battle":
            return "Battle";
        case "elite":
            return "Elite";
        case "event":
            return "Event";
        case "shop":
            return "Shop";
        case "rest":
            return "Rest";
        case "boss":
            return "Boss";
    }
}

function getNodePalette(type: MapNodeType["type"]): {
    edge: string;
    icon: string;
    glow: string;
} {
    switch (type) {
        case "battle":
            return {
                edge: "border-stone-500/60",
                icon: "text-stone-200",
                glow: "rgba(148,163,184,0.22)",
            };
        case "elite":
            return {
                edge: "border-red-500/70",
                icon: "text-red-300",
                glow: "rgba(239,68,68,0.28)",
            };
        case "event":
            return {
                edge: "border-violet-500/60",
                icon: "text-violet-200",
                glow: "rgba(139,92,246,0.24)",
            };
        case "shop":
            return {
                edge: "border-amber-400/60",
                icon: "text-amber-200",
                glow: "rgba(245,158,11,0.24)",
            };
        case "rest":
            return {
                edge: "border-orange-400/60",
                icon: "text-orange-200",
                glow: "rgba(249,115,22,0.26)",
            };
        case "boss":
            return {
                edge: "border-red-400/80",
                icon: "text-red-200",
                glow: "rgba(248,113,113,0.42)",
            };
    }
}

export default function MapNode({
    node,
    isCurrent,
    isAvailable,
    onClick,
}: MapNodeProps) {
    const isCompleted = node.completed;
    const isInteractive = isCurrent || isAvailable;
    const palette = getNodePalette(node.type);
    const label = getNodeLabel(node.type);

    return (
        <button
            type="button"
            disabled={!isInteractive}
            onClick={() => onClick(node.id)}
            data-map-node-id={node.id}
            aria-label={label}
            aria-current={isCurrent ? "step" : undefined}
            className={[
                "group relative flex h-[92px] w-[112px] items-center justify-center",
                "select-none transition-all duration-300 ease-out",
                isInteractive ? "cursor-pointer" : "cursor-default",
                isCurrent ? "scale-[1.08]" : "",
                isAvailable && !isCurrent ? "hover:-translate-y-1 hover:scale-[1.04]" : "",
            ].join(" ")}
        >
            {isCurrent && (
                <span
                    className="absolute -inset-3 rounded-[32px] blur-[18px]"
                    style={{ background: palette.glow }}
                />
            )}

            {isAvailable && !isCurrent && (
                <span
                    className="absolute -inset-2 rounded-[28px] opacity-0 blur-[14px] transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: palette.glow }}
                />
            )}

            <span
                className={[
                    "absolute inset-0 border-2",
                    "[clip-path:polygon(15%_0%,85%_0%,100%_50%,85%_100%,15%_100%,0%_50%)]",
                    palette.edge,
                    isCurrent
                        ? "bg-[#32170f] shadow-[0_0_30px_rgba(234,88,12,0.55)]"
                        : isCompleted
                          ? "bg-[#12100f] opacity-55"
                          : isAvailable
                            ? "bg-[#1c1714] shadow-[0_0_20px_rgba(180,60,30,0.18)]"
                            : "bg-[#0e0d0c] opacity-35",
                ].join(" ")}
            />

            <span
                className="absolute inset-[5px] border border-white/5 bg-[linear-gradient(145deg,rgba(255,255,255,0.045),transparent_32%,rgba(0,0,0,0.35))] [clip-path:polygon(15%_0%,85%_0%,100%_50%,85%_100%,15%_100%,0%_50%)]"
            />

            <span
                className={[
                    "relative z-10 text-[30px] leading-none",
                    palette.icon,
                    isCompleted ? "text-stone-600" : "",
                    isAvailable && !isCurrent
                        ? "transition-transform duration-300 group-hover:scale-110"
                        : "",
                    node.type === "boss" ? "text-[38px]" : "",
                ].join(" ")}
            >
                {isCompleted ? "✓" : getNodeIcon(node.type)}
            </span>

            <span
                className={[
                    "absolute bottom-[-16px] z-20 rounded-full border px-2.5 py-1",
                    "bg-[#0b0908]/95 text-[7px] uppercase tracking-[0.24em]",
                    isCurrent
                        ? "border-orange-700/70 text-orange-300"
                        : isCompleted
                          ? "border-stone-800 text-stone-600"
                          : isAvailable
                            ? "border-stone-700 text-stone-300"
                            : "border-stone-900 text-stone-700",
                ].join(" ")}
            >
                {isCurrent ? "Current" : isCompleted ? "Cleared" : label}
            </span>
        </button>
    );
}

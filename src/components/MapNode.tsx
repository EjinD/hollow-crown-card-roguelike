import type { MapNode as MapNodeType } from "../types/game";

interface MapNodeProps {
    node: MapNodeType;
    isCurrent: boolean;
    isAvailable: boolean;
    onClick: (nodeId: string) => void;
}

function getNodeIcon(
    type: MapNodeType["type"],
): string {
    switch (type) {
        case "battle":
            return "⚔";

        case "elite":
            return "☠";

        case "event":
            return "?";

        case "shop":
            return "♜";

        case "boss":
            return "♛";
    }
}

function getNodeLabel(
    type: MapNodeType["type"],
): string {
    switch (type) {
        case "battle":
            return "Battle";

        case "elite":
            return "Elite";

        case "event":
            return "Event";

        case "shop":
            return "Shop";

        case "boss":
            return "Boss";
    }
}

function getNodeTypeClass(
    type: MapNodeType["type"],
): string {
    switch (type) {
        case "battle":
            return "border-stone-600";

        case "event":
            return "border-purple-900";

        case "shop":
            return "border-amber-900";

        case "elite":
            return "border-red-800";

        case "boss":
            return "border-red-600";
    }
}

export default function MapNode({
    node,
    isCurrent,
    isAvailable,
    onClick,
}: MapNodeProps) {
    const isLocked =
        !node.completed &&
        !isCurrent &&
        !isAvailable;

    const sizeClass =
        node.type === "boss"
            ? "h-24 w-24"
            : "h-20 w-20";

    const stateClass = node.completed
        ? "border-stone-700 bg-stone-950 text-stone-600 opacity-60"
        : isCurrent
            ? "border-orange-400 bg-[#24130e] text-orange-200 shadow-[0_0_30px_rgba(234,88,12,0.65)]"
            : isAvailable
                ? "cursor-pointer bg-[#17120f] text-stone-200 shadow-[0_0_18px_rgba(180,60,30,0.35)] hover:scale-110 hover:border-orange-400 hover:text-orange-200"
                : isLocked
                    ? "cursor-default border-stone-800 bg-[#0d0b0a] text-stone-700 opacity-50"
                    : "";

    return (
        <button
            type="button"
            disabled={!isAvailable && !isCurrent}
            onClick={() => onClick(node.id)}
            aria-label={getNodeLabel(node.type)}
            className={[
                "group relative flex flex-col items-center justify-center rounded-full border-2 transition-all duration-200",
                sizeClass,
                getNodeTypeClass(node.type),
                stateClass,
            ].join(" ")}
        >
            {isCurrent && (
                <span className="absolute inset-[-7px] rounded-full border border-orange-500/40" />
            )}

            {isAvailable && !isCurrent && (
                <span className="absolute inset-[-5px] rounded-full border border-orange-700/30 opacity-0 transition-opacity group-hover:opacity-100" />
            )}

            <span
                className={[
                    "text-2xl leading-none transition-transform",
                    node.type === "boss"
                        ? "text-3xl"
                        : "",
                    isAvailable
                        ? "group-hover:scale-110"
                        : "",
                ].join(" ")}
            >
                {getNodeIcon(node.type)}
            </span>

            <span className="mt-1 text-[8px] uppercase tracking-[0.18em]">
                {getNodeLabel(node.type)}
            </span>

            {node.completed && (
                <span className="absolute -bottom-2 rounded-full border border-stone-700 bg-[#0c0a08] px-2 py-0.5 text-[7px] uppercase tracking-widest text-stone-500">
                    Cleared
                </span>
            )}
        </button>
    );
}
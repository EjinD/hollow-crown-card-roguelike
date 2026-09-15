import type {
    MapNode as MapNodeType,
} from "../types/game";

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

        case "elite":
            return "border-red-800";

        case "event":
            return "border-purple-900";

        case "shop":
            return "border-amber-900";

        case "boss":
            return "border-red-500";
    }
}

function getIconClass(
    type: MapNodeType["type"],
): string {
    switch (type) {
        case "battle":
            return "text-stone-300";

        case "elite":
            return "text-red-400";

        case "event":
            return "text-purple-300";

        case "shop":
            return "text-amber-300";

        case "boss":
            return "text-red-300";
    }
}

export default function MapNode({
    node,
    isCurrent,
    isAvailable,
    onClick,
}: MapNodeProps) {
    const isCompleted =
        node.completed;

    const isLocked =
        !isCompleted &&
        !isCurrent &&
        !isAvailable;

    const isInteractive =
        isCurrent ||
        isAvailable;

    const sizeClass =
        node.type === "boss"
            ? "h-24 w-24"
            : "h-20 w-20";

    const stateClass =
        isCompleted
            ? [
                "border-stone-700",
                "bg-[#11100f]",
                "text-stone-600",
                "opacity-65",
            ].join(" ")
            : isCurrent
              ? [
                    "border-orange-400",
                    "bg-[#24130e]",
                    "text-orange-100",
                    "shadow-[0_0_35px_rgba(234,88,12,0.65)]",
                    "scale-105",
                ].join(" ")
              : isAvailable
                ? [
                      "cursor-pointer",
                      "bg-[#17120f]",
                      "text-stone-200",
                      "shadow-[0_0_18px_rgba(180,60,30,0.35)]",
                      "hover:scale-110",
                      "hover:border-orange-400",
                      "hover:text-orange-100",
                  ].join(" ")
                : isLocked
                  ? [
                        "cursor-default",
                        "border-stone-800",
                        "bg-[#0d0b0a]",
                        "text-stone-700",
                        "opacity-45",
                    ].join(" ")
                  : "";

    return (
        <button
            type="button"
            disabled={!isInteractive}
            onClick={() =>
                onClick(node.id)
            }
            aria-label={getNodeLabel(
                node.type,
            )}
            aria-current={
                isCurrent
                    ? "step"
                    : undefined
            }
            className={[
                "group relative flex flex-col items-center justify-center rounded-full border-2",
                "transition-all duration-200 ease-out",
                "select-none",
                sizeClass,
                getNodeTypeClass(
                    node.type,
                ),
                stateClass,
            ].join(" ")}
        >
            {isCurrent && (
                <>
                    <span className="absolute inset-[-7px] rounded-full border border-orange-500/40" />

                    <span className="absolute inset-[-14px] rounded-full border border-orange-500/10" />
                </>
            )}

            {isAvailable && !isCurrent && (
                <span className="absolute inset-[-6px] rounded-full border border-orange-700/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            )}

            {isCompleted && (
                <span className="absolute inset-0 rounded-full bg-stone-950/30" />
            )}

            <span
                className={[
                    "relative z-10 text-2xl leading-none",
                    "transition-transform duration-200",
                    node.type ===
                    "boss"
                        ? "text-3xl"
                        : "",
                    getIconClass(
                        node.type,
                    ),
                    isAvailable &&
                    !isCurrent
                        ? "group-hover:scale-110"
                        : "",
                ].join(" ")}
            >
                {isCompleted
                    ? "✓"
                    : getNodeIcon(
                          node.type,
                      )}
            </span>

            <span
                className={[
                    "relative z-10 mt-1 text-[8px] uppercase tracking-[0.18em]",
                    isCompleted
                        ? "text-stone-600"
                        : "",
                ].join(" ")}
            >
                {getNodeLabel(
                    node.type,
                )}
            </span>

            {isCompleted && (
                <span className="absolute -bottom-2 rounded-full border border-stone-700 bg-[#0c0a08] px-2 py-0.5 text-[7px] uppercase tracking-[0.18em] text-stone-500">
                    Cleared
                </span>
            )}

            {isCurrent && (
                <span className="absolute -bottom-2 rounded-full border border-orange-800/70 bg-[#140b07] px-2 py-0.5 text-[7px] uppercase tracking-[0.18em] text-orange-400">
                    Current
                </span>
            )}
        </button>
    );
}
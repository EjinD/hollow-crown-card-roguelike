import type {
    EnemyIntent as EnemyIntentType,
} from "../types/game";

interface EnemyIntentProps {
    intent: EnemyIntentType;
    isExecuting?: boolean;
}

function getIntentIcon(
    intent: EnemyIntentType,
): string {
    switch (intent.type) {
        case "attack":
            return "⚔";

        case "block":
            return "🛡";

        case "heal":
            return "✚";

        case "buff":
            return "↑";

        case "debuff":
            return "↓";
    }
}

function getIntentLabel(
    intent: EnemyIntentType,
): string {
    switch (intent.type) {
        case "attack":
            return "Attack";

        case "block":
            return "Block";

        case "heal":
            return "Heal";

        case "buff":
            return "Strength";

        case "debuff":
            return "Weak";
    }
}

function getIntentColor(
    intent: EnemyIntentType,
): string {
    switch (intent.type) {
        case "attack":
            return "text-red-300";

        case "block":
            return "text-sky-300";

        case "heal":
            return "text-emerald-300";

        case "buff":
            return "text-amber-300";

        case "debuff":
            return "text-purple-300";
    }
}

function getIntentBorderColor(
    intent: EnemyIntentType,
): string {
    switch (intent.type) {
        case "attack":
            return "border-red-900/70";

        case "block":
            return "border-sky-900/70";

        case "heal":
            return "border-emerald-900/70";

        case "buff":
            return "border-amber-900/70";

        case "debuff":
            return "border-purple-900/70";
    }
}

function getExecutingBorderColor(
    intent: EnemyIntentType,
): string {
    switch (intent.type) {
        case "attack":
            return "border-red-500/80";

        case "block":
            return "border-sky-400/80";

        case "heal":
            return "border-emerald-400/80";

        case "buff":
            return "border-amber-400/80";

        case "debuff":
            return "border-purple-400/80";
    }
}

function getExecutingShadow(
    intent: EnemyIntentType,
): string {
    switch (intent.type) {
        case "attack":
            return "shadow-[0_0_30px_rgba(220,38,38,0.25)]";

        case "block":
            return "shadow-[0_0_30px_rgba(56,189,248,0.2)]";

        case "heal":
            return "shadow-[0_0_30px_rgba(52,211,153,0.2)]";

        case "buff":
            return "shadow-[0_0_30px_rgba(251,191,36,0.2)]";

        case "debuff":
            return "shadow-[0_0_30px_rgba(168,85,247,0.2)]";
    }
}

function getExecutingLabel(
    intent: EnemyIntentType,
): string {
    switch (intent.type) {
        case "attack":
            return "Attacking";

        case "block":
            return "Defending";

        case "heal":
            return "Recovering";

        case "buff":
            return "Empowering";

        case "debuff":
            return "Casting";
    }
}

function getIntentAmount(
    intent: EnemyIntentType,
): string {
    switch (intent.type) {
        case "attack":
            return `${intent.damage} Damage`;

        case "block":
            return `${intent.amount} Block`;

        case "heal":
            return `${intent.amount} HP`;

        case "buff":
            return `+${intent.amount} Strength`;

        case "debuff":
            return `${intent.amount}% Weak`;
    }
}

export default function EnemyIntent({
    intent,
    isExecuting = false,
}: EnemyIntentProps) {
    const color =
        getIntentColor(intent);

    return (
        <div
            className={[
                "w-44 rounded-xl border px-5 py-4 text-center",
                "bg-[#100908]/90",
                "transition-all duration-300",

                isExecuting
                    ? [
                          getExecutingBorderColor(
                              intent,
                          ),
                          getExecutingShadow(
                              intent,
                          ),
                          "scale-105",
                      ].join(" ")
                    : getIntentBorderColor(
                          intent,
                      ),

                "shadow-[0_8px_30px_rgba(0,0,0,0.5)]",
            ].join(" ")}
        >
            <div className="flex items-center justify-center gap-2">
                <span
                    className={[
                        "text-xl",
                        color,
                        isExecuting
                            ? "animate-pulse"
                            : "",
                    ].join(" ")}
                >
                    {getIntentIcon(
                        intent,
                    )}
                </span>

                <span className="text-[10px] uppercase tracking-[0.3em] text-stone-500">
                    Intent
                </span>
            </div>

            <p
                className={[
                    "mt-2 text-lg font-bold uppercase tracking-wide",
                    color,
                ].join(" ")}
            >
                {getIntentLabel(
                    intent,
                )}
            </p>

            <p className="mt-1 text-sm text-stone-400">
                {getIntentAmount(
                    intent,
                )}
            </p>

            {isExecuting && (
                <p
                    className={[
                        "mt-3 text-[8px] uppercase tracking-[0.25em]",
                        color,
                        "animate-pulse",
                    ].join(" ")}
                >
                    {getExecutingLabel(
                        intent,
                    )}
                </p>
            )}
        </div>
    );
}
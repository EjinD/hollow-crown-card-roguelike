import CombatImpact from "./CombatImpact";

export type CharacterEffect =
    | "hit"
    | "heal"
    | "block"
    | null;

export type EnemyActionEffect =
    | "attack"
    | "block"
    | "heal"
    | "buff"
    | "debuff"
    | null;

interface CombatCharacterProps {
    image: string;
    side: "player" | "enemy";
    hit?: boolean;
    heal?: boolean;
    block?: boolean;
    enemyAction?: EnemyActionEffect;
}

export default function CombatCharacter({
    image,
    side,
    hit = false,
    heal = false,
    block = false,
    enemyAction = null,
}: CombatCharacterProps) {
    const characterEffect =
        hit
            ? "animate-[characterHit_280ms_ease-out]"
            : heal
              ? "animate-[characterHeal_420ms_ease-out]"
              : block
                ? "animate-[characterBlock_420ms_ease-out]"
                : "";

    const enemyActionClass =
        side === "enemy" &&
        enemyAction
            ? getEnemyActionAnimation(
                  enemyAction,
              )
            : "";

    const impactEffect =
        hit
            ? "hit"
            : heal
              ? "heal"
              : block
                ? "block"
                : null;

    return (
        <div
            className={[
                "relative flex h-[min(30vw,460px)] w-[min(30vw,460px)] min-h-[300px] min-w-[300px] items-end justify-center",
                characterEffect,
                enemyActionClass,
            ].join(" ")}
        >
            {impactEffect && (
                <CombatImpact
                    effect={
                        impactEffect
                    }
                />
            )}

            {/* BLOCK ACTION */}
            {enemyAction ===
                "block" && (
                <div className="pointer-events-none absolute inset-[-20%] z-20 rounded-full border-2 border-sky-300/30 animate-[enemyBlockAura_520ms_ease-out_forwards]" />
            )}

            {/* HEAL ACTION */}
            {enemyAction ===
                "heal" && (
                <div className="pointer-events-none absolute inset-[-20%] z-20 rounded-full bg-emerald-400/10 blur-3xl animate-[enemyHealAura_650ms_ease-out_forwards]" />
            )}

            {/* BUFF ACTION */}
            {enemyAction ===
                "buff" && (
                <div className="pointer-events-none absolute inset-[-20%] z-20 rounded-full bg-amber-400/10 blur-3xl animate-[enemyBuffAura_650ms_ease-out_forwards]" />
            )}

            {/* DEBUFF ACTION */}
            {enemyAction ===
                "debuff" && (
                <div className="pointer-events-none absolute inset-[-20%] z-20 rounded-full bg-purple-500/10 blur-3xl animate-[enemyDebuffAura_650ms_ease-out_forwards]" />
            )}

            {/* DAMAGE FLASH */}
            {hit && (
                <div className="pointer-events-none absolute inset-0 z-20 rounded-full bg-red-500/25 blur-2xl" />
            )}

            {/* HEAL FLASH */}
            {heal && (
                <div className="pointer-events-none absolute inset-0 z-20 rounded-full bg-emerald-400/20 blur-2xl" />
            )}

            {/* BLOCK FLASH */}
            {block && (
                <div className="pointer-events-none absolute inset-0 z-20 rounded-full bg-sky-400/20 blur-2xl" />
            )}

            <img
                src={image}
                alt={
                    side === "player"
                        ? "Player"
                        : "Enemy"
                }
                draggable={false}
                className="relative z-10 block h-full w-full select-none object-contain"
            />
        </div>
    );
}

function getEnemyActionAnimation(
    action: EnemyActionEffect,
): string {
    switch (action) {
        case "attack":
            return "animate-[enemyAttack_520ms_cubic-bezier(0.22,1,0.36,1)]";

        case "block":
            return "animate-[enemyBlock_520ms_ease-out]";

        case "heal":
            return "animate-[enemyHeal_650ms_ease-out]";

        case "buff":
            return "animate-[enemyBuff_650ms_ease-out]";

        case "debuff":
            return "animate-[enemyDebuff_650ms_ease-out]";

        default:
            return "";
    }
}
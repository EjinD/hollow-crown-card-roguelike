import CombatImpact from "./CombatImpact";

export type CharacterEffect =
    | "hit"
    | "heal"
    | "block"
    | null;

export type EnemyActionEffect =
    | "attack"
    | "attack-debuff"
    | "attack-buff"
    | "drain"
    | "block"
    | "block-buff"
    | "heal"
    | "buff"
    | "debuff"
    | null;

export type CombatCharacterAnimation =
    | "idle"
    | "attack"
    | "hit"
    | "death"
    | "signature";

interface CombatCharacterProps {
    image: string;
    side: "player" | "enemy";
    animationState?: CombatCharacterAnimation;
    hit?: boolean;
    heal?: boolean;
    block?: boolean;
    enemyAction?: EnemyActionEffect;
}

function getAnimationClass(
    side: CombatCharacterProps["side"],
    state: CombatCharacterAnimation,
): string {
    if (state === "idle") {
        return "combat-actor--idle";
    }

    if (state === "attack") {
        return side === "player"
            ? "combat-actor--player-attack"
            : "combat-actor--enemy-attack";
    }

    if (state === "signature") {
        return side === "player"
            ? "combat-actor--player-signature"
            : "combat-actor--enemy-signature";
    }

    if (state === "hit") {
        return side === "player"
            ? "combat-actor--player-hit"
            : "combat-actor--enemy-hit";
    }

    return "combat-actor--death";
}

function isSignatureAction(
    action: EnemyActionEffect,
): boolean {
    return (
        action === "attack-debuff" ||
        action === "attack-buff" ||
        action === "drain" ||
        action === "block" ||
        action === "block-buff" ||
        action === "block-buff" ||
        action === "heal" ||
        action === "buff" ||
        action === "debuff"
    );
}

export default function CombatCharacter({
    image,
    side,
    animationState = "idle",
    hit = false,
    heal = false,
    block = false,
    enemyAction = null,
}: CombatCharacterProps) {
    const effectClass = hit
        ? "combat-actor__image--hit"
        : heal
          ? "combat-actor__image--heal"
          : block
            ? "combat-actor__image--block"
            : "";

    const signatureActive =
        side === "enemy" &&
        animationState === "signature" &&
        isSignatureAction(enemyAction);

    const impactEffect = hit
        ? "hit"
        : heal
          ? "heal"
          : block
            ? "block"
            : null;

    return (
        <div
            className={[
                "combat-actor",
                getAnimationClass(
                    side,
                    animationState,
                ),
            ].join(" ")}
            data-side={side}
            data-state={animationState}
        >
            {impactEffect && (
                <CombatImpact
                    effect={impactEffect}
                />
            )}

            {signatureActive && (
                <div className="combat-actor__signature-aura" />
            )}

            {animationState === "attack" && (
                <div className="combat-actor__motion-trails" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                </div>
            )}

            {animationState === "signature" && (
                <div className="combat-actor__signature-energy" aria-hidden="true">
                    <span />
                    <span />
                </div>
            )}

            {hit && (
                <div
                    className="combat-actor__hit-flash"
                    aria-hidden="true"
                />
            )}

            {animationState === "death" && (
                <div
                    className="combat-actor__death-ash"
                    aria-hidden="true"
                >
                    <span />
                    <span />
                    <span />
                    <span />
                </div>
            )}

            <div className="combat-actor__ground-shadow" />

            <img
                src={image}
                alt={side === "player" ? "Player" : "Enemy"}
                draggable={false}
                className={[
                    "combat-actor__image",
                    effectClass,
                ].join(" ")}
            />
        </div>
    );
}

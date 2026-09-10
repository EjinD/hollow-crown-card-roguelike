import type { CSSProperties } from "react";

interface CombatCharacterProps {
    image: string;
    side: "player" | "enemy";
}

export default function CombatCharacter({
    image,
    side,
}: CombatCharacterProps) {
    const style: CSSProperties =
        side === "player"
            ? {
                  width: "420px",
                  maxWidth: "32vw",
              }
            : {
                  width: "460px",
                  maxWidth: "35vw",
              };

    return (
        <img
            src={image}
            alt=""
            draggable={false}
            style={style}
            className="pointer-events-none select-none object-contain"
        />
    );
}
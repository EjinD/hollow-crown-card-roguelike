import { useState } from "react";

import type { CardState } from "../types/game";

import Card from "./Card";

interface HandProps {
    cards: CardState[];
    disabled?: boolean;
    onPlayCard: (cardId: string) => void;
}

export default function Hand({
    cards,
    disabled = false,
    onPlayCard,
}: HandProps) {
    const [hoveredCardId, setHoveredCardId] =
        useState<string | null>(null);

    const getRotation = (index: number) => {
        const total = cards.length;

        if (total <= 1) {
            return 0;
        }

        const middle = (total - 1) / 2;

        return (index - middle) * 5;
    };

    const getOffset = (index: number) => {
        const total = cards.length;

        if (total <= 1) {
            return 0;
        }

        const middle = (total - 1) / 2;
        const distance = Math.abs(index - middle);

        return distance * 4;
    };

    return (
        <div
            className="relative flex h-60 w-full items-end justify-center"
            onMouseLeave={() =>
                setHoveredCardId(null)
            }
        >
            {cards.map((card, index) => {
                const isHovered =
                    hoveredCardId === card.cardId;

                const rotation =
                    getRotation(index);

                const offset =
                    getOffset(index);

                return (
                    <div
                        key={`${card.cardId}-${index}`}
                        className="relative transition-all duration-200 ease-out"
                        style={{
                            marginLeft:
                                index === 0
                                    ? 0
                                    : "-32px",
                            zIndex: isHovered
                                ? 100
                                : index,
                            transform: isHovered
                                ? "translateY(-35px) rotate(0deg)"
                                : `translateY(${offset}px) rotate(${rotation}deg)`,
                        }}
                        onMouseEnter={() =>
                            setHoveredCardId(
                                card.cardId,
                            )
                        }
                    >
                        <Card
                            card={card}
                            disabled={
                                disabled ||
                                card.cooldownRemaining >
                                    0
                            }
                            onClick={onPlayCard}
                            isHovered={isHovered}
                        />
                    </div>
                );
            })}
        </div>
    );
}
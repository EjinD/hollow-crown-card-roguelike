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
    const [hoveredIndex, setHoveredIndex] =
        useState<number | null>(null);

    const getRotation = (index: number) => {
        const total = cards.length;

        if (total <= 1) {
            return 0;
        }

        const middle = (total - 1) / 2;

        return (index - middle) * 5;
    };

    const getVerticalOffset = (
        index: number,
    ) => {
        const total = cards.length;

        if (total <= 1) {
            return 0;
        }

        const middle = (total - 1) / 2;
        const distance = Math.abs(index - middle);

        return distance * 5;
    };

    return (
        <div
            className="relative flex h-64 w-full items-end justify-center"
            onMouseLeave={() =>
                setHoveredIndex(null)
            }
        >
            {cards.map((card, index) => {
                const isHovered =
                    hoveredIndex === index;

                const rotation =
                    getRotation(index);

                const verticalOffset =
                    getVerticalOffset(index);

                return (
                    <div
                        key={`${card.cardId}-${index}`}
                        className="relative origin-bottom transition-all duration-200 ease-out"
                        style={{
                            marginLeft:
                                index === 0
                                    ? 0
                                    : "-30px",

                            zIndex: isHovered
                                ? 100
                                : index,

                            transform: isHovered
                                ? "translateY(-45px) rotate(0deg) scale(1.04)"
                                : `translateY(${verticalOffset}px) rotate(${rotation}deg)`,
                        }}
                        onMouseEnter={() =>
                            setHoveredIndex(index)
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
import {
    useEffect,
    useRef,
    useState,
} from "react";

import type { CardState } from "../types/game";

import Card from "./Card";

interface HandProps {
    cards: CardState[];
    disabled?: boolean;
    onPlayCard: (
        cardId: string,
        sourceRect: DOMRect,
    ) => void;
}

export default function Hand({
    cards,
    disabled = false,
    onPlayCard,
}: HandProps) {
    const [
        hoveredIndex,
        setHoveredIndex,
    ] = useState<number | null>(null);

    const [
        playingIndex,
        setPlayingIndex,
    ] = useState<number | null>(null);

    const cardRefs =
        useRef<
            Record<
                number,
                HTMLDivElement | null
            >
        >({});

    useEffect(() => {
        setPlayingIndex(null);
    }, [cards]);

    const getRotation = (
        index: number,
    ) => {
        const total = cards.length;

        if (total <= 1) {
            return 0;
        }

        const middle =
            (total - 1) / 2;

        const maxRotation =
            total >= 5 ? 10 : 8;

        return (
            ((index - middle) /
                middle) *
            maxRotation
        );
    };

    const getVerticalOffset = (
        index: number,
    ) => {
        const total = cards.length;

        if (total <= 1) {
            return 0;
        }

        const middle =
            (total - 1) / 2;

        const distance = Math.abs(
            index - middle,
        );

        return Math.min(
            distance * 7,
            18,
        );
    };

    const getZIndex = (
        index: number,
        isHovered: boolean,
        isPlaying: boolean,
    ) => {
        if (isPlaying) {
            return 200;
        }

        if (isHovered) {
            return 100;
        }

        return index + 10;
    };

    const handleCardClick = (
        cardId: string,
        index: number,
    ) => {
        if (
            disabled ||
            playingIndex !== null
        ) {
            return;
        }

        const card =
            cards[index];

        if (!card) {
            return;
        }

        if (
            card.cooldownRemaining >
            0
        ) {
            return;
        }

        const element =
            cardRefs.current[
                index
            ];

        if (!element) {
            return;
        }

        const sourceRect =
            element.getBoundingClientRect();

        setHoveredIndex(null);
        setPlayingIndex(index);

        onPlayCard(
            cardId,
            sourceRect,
        );
    };

    return (
        <div
            className="relative flex h-[270px] w-full items-end justify-center"
            onMouseLeave={() =>
                setHoveredIndex(null)
            }
        >
            {cards.map(
                (
                    card,
                    index,
                ) => {
                    const isHovered =
                        hoveredIndex ===
                        index;

                    const isPlaying =
                        playingIndex ===
                        index;

                    const rotation =
                        getRotation(
                            index,
                        );

                    const verticalOffset =
                        getVerticalOffset(
                            index,
                        );

                    return (
                        <div
                            key={`${card.cardId}-${index}`}
                            ref={(element) => {
                                cardRefs.current[
                                    index
                                ] =
                                    element;
                            }}
                            className="relative origin-bottom"
                            style={{
                                marginLeft:
                                    index ===
                                    0
                                        ? 0
                                        : "-42px",

                                zIndex:
                                    getZIndex(
                                        index,
                                        isHovered,
                                        isPlaying,
                                    ),

                                transform:
                                    isPlaying
                                        ? "translateY(0) rotate(0deg) scale(1)"
                                        : isHovered
                                          ? "translateY(-42px) rotate(0deg) scale(1.045)"
                                          : `translateY(${verticalOffset}px) rotate(${rotation}deg)`,
                            }}
                            onMouseEnter={() => {
                                if (
                                    playingIndex ===
                                    null
                                ) {
                                    setHoveredIndex(
                                        index,
                                    );
                                }
                            }}
                        >
                            <Card
                                card={
                                    card
                                }
                                disabled={
                                    disabled ||
                                    playingIndex !==
                                        null
                                }
                                onClick={() =>
                                    handleCardClick(
                                        card.cardId,
                                        index,
                                    )
                                }
                                isHovered={
                                    isHovered &&
                                    !isPlaying
                                }
                                isPlaying={
                                    isPlaying
                                }
                            />
                        </div>
                    );
                },
            )}
        </div>
    );
}
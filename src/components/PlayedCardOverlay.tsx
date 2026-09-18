import type { CSSProperties } from "react";

import Card from "./Card";
import type { CardState } from "../types/game";

interface PlayedCardOverlayProps {
    card: CardState;
    sourceRect: DOMRect;
    targetRect: DOMRect;
    duration?: number;
    onComplete: () => void;
}

export default function PlayedCardOverlay({
    card,
    sourceRect,
    targetRect,
    duration = 420,
    onComplete,
}: PlayedCardOverlayProps) {
    const sourceCenterX =
        sourceRect.left +
        sourceRect.width / 2;

    const sourceCenterY =
        sourceRect.top +
        sourceRect.height / 2;

    const targetCenterX =
        targetRect.left +
        targetRect.width / 2;

    const targetCenterY =
        targetRect.top +
        targetRect.height / 2;

    const deltaX =
        targetCenterX -
        sourceCenterX;

    const deltaY =
        targetCenterY -
        sourceCenterY;

    const animationStyle: CSSProperties =
        {
            "--card-x": `${deltaX}px`,
            "--card-y": `${deltaY}px`,
        } as CSSProperties;

    return (
        <div
            className="pointer-events-none fixed z-[500]"
            style={{
                left:
                    sourceRect.left,
                top:
                    sourceRect.top,
                width:
                    sourceRect.width,
                height:
                    sourceRect.height,
                ...animationStyle,
            }}
            onAnimationEnd={
                onComplete
            }
        >
            <div
                style={{
                    animation: `cardTravel ${duration}ms cubic-bezier(0.22,1,0.36,1) forwards`,
                }}
            >
                <Card
                    card={card}
                    disabled
                    onClick={() => {}}
                />
            </div>
        </div>
    );
}
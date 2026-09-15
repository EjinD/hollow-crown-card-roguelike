import type { CardState } from "../types/game";

import CardPile from "./CardPile";
import Hand from "./Hands";

interface CombatTableProps {
    hand: CardState[];
    drawPileCount: number;
    discardPileCount: number;
    exiledCount: number;
    actions: number;
    isPlayerTurn: boolean;
    onPlayCard: (
        cardId: string,
        sourceRect: DOMRect,
    ) => void;
    onEndTurn: () => void;
}

export default function CombatTable({
    hand,
    drawPileCount,
    discardPileCount,
    exiledCount,
    actions,
    isPlayerTurn,
    onPlayCard,
    onEndTurn,
}: CombatTableProps) {
    return (
        <section className="absolute inset-x-0 bottom-0 z-30 h-[360px] overflow-visible">
            <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 1000 360"
                preserveAspectRatio="none"
                aria-hidden="true"
            >
                <polygon
                    points="
                        0,0
                        155,0
                        180,62
                        765,62
                        810,0
                        1000,0
                        1000,360
                        0,360
                    "
                    fill="#100b08"
                    stroke="#4a3327"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                />

                <polygon
                    points="
                        3,5
                        152,5
                        177,67
                        768,67
                        813,5
                        997,5
                        997,357
                        3,357
                    "
                    fill="url(#tableSurface)"
                    stroke="#241913"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                />

                <polyline
                    points="
                        0,11
                        148,11
                        173,72
                        772,72
                        817,11
                        1000,11
                    "
                    fill="none"
                    stroke="#694636"
                    strokeWidth="1.5"
                    opacity="0.7"
                    vectorEffect="non-scaling-stroke"
                />

                <polyline
                    points="
                        177,67
                        205,82
                        795,82
                        823,67
                    "
                    fill="none"
                    stroke="#070504"
                    strokeWidth="2"
                    opacity="0.9"
                    vectorEffect="non-scaling-stroke"
                />

                <defs>
                    <linearGradient
                        id="tableSurface"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop
                            offset="0%"
                            stopColor="#1a100c"
                        />

                        <stop
                            offset="45%"
                            stopColor="#120c09"
                        />

                        <stop
                            offset="100%"
                            stopColor="#0b0806"
                        />
                    </linearGradient>
                </defs>
            </svg>

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(120,55,20,0.13),transparent_58%)]" />

            <div className="absolute bottom-6 left-8 z-40">
                <CardPile
                    label="Draw"
                    count={
                        drawPileCount
                    }
                    variant="draw"
                />
            </div>

            <div className="absolute left-[17%] top-[30px] z-40 flex h-24 w-24 items-center justify-center rounded-full border-2 border-orange-900 bg-[#100905]/95 shadow-[0_0_25px_rgba(110,40,10,0.25)]">
                <div className="text-center">
                    <span className="block font-serif text-3xl font-bold text-orange-300">
                        {actions}
                    </span>

                    <span className="text-[9px] uppercase tracking-[0.2em] text-stone-500">
                        Actions
                    </span>
                </div>
            </div>

            <button
                type="button"
                disabled={!isPlayerTurn}
                onClick={onEndTurn}
                className="absolute right-[7%] top-[38px] z-40 border border-orange-900 bg-[linear-gradient(to_bottom,#4a1710,#2a0d09)] px-10 py-4 font-serif text-lg font-bold uppercase tracking-[0.15em] text-orange-100 shadow-[0_5px_20px_rgba(0,0,0,0.55)] transition-all duration-200 hover:border-orange-700 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
                End Turn
            </button>

            <div className="absolute bottom-[48px] left-1/2 z-40 w-[820px] -translate-x-1/2">
                <Hand
                    cards={hand}
                    disabled={
                        !isPlayerTurn
                    }
                    onPlayCard={
                        onPlayCard
                    }
                />
            </div>

            <div className="absolute bottom-6 right-[13%] z-40">
                <CardPile
                    label="Discard"
                    count={
                        discardPileCount
                    }
                    variant="discard"
                />
            </div>

            <div className="absolute bottom-6 right-8 z-40">
                <CardPile
                    label="Exiled"
                    count={
                        exiledCount
                    }
                    variant="exiled"
                />
            </div>

            <div className="absolute bottom-2 left-1/2 z-50 -translate-x-1/2">
                <span className="text-[10px] uppercase tracking-[0.25em] text-stone-500">
                    Hand {hand.length}
                </span>
            </div>
        </section>
    );
}
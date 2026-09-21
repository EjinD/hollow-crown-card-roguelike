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
    onPlayCard: (cardId: string, sourceRect: DOMRect) => void;
    onEndTurn: () => void;
}

export default function CombatTable({ hand, drawPileCount, discardPileCount, exiledCount, actions, isPlayerTurn, onPlayCard, onEndTurn }: CombatTableProps) {
    return (
        <section className="combat-table absolute inset-x-0 bottom-0 z-30 h-[385px] overflow-visible">
            <div className="combat-table__surface absolute inset-x-0 bottom-0 h-full border-t border-amber-900/55 bg-[linear-gradient(180deg,rgba(25,13,9,0.9),rgba(9,6,5,0.98))] shadow-[0_-16px_40px_rgba(0,0,0,0.5)]">
                <div className="absolute inset-x-0 top-0 h-16 bg-[radial-gradient(ellipse_at_50%_0%,rgba(183,82,25,0.18),transparent_65%)]" />
                <div className="pointer-events-none absolute inset-[6px] border border-amber-900/20" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/20 to-transparent" />
            </div>

            <div className="absolute bottom-8 left-8 z-40"><CardPile label="Draw" count={drawPileCount} variant="draw" /></div>
            <div className="absolute bottom-8 right-[13%] z-40"><CardPile label="Discard" count={discardPileCount} variant="discard" /></div>
            <div className="absolute bottom-8 right-8 z-40"><CardPile label="Exiled" count={exiledCount} variant="exiled" /></div>

            <div className="absolute left-[16%] top-[18px] z-40 flex h-24 w-24 flex-col items-center justify-center border border-amber-800/70 bg-[radial-gradient(circle,#3c2111,#120a07_70%)] shadow-[inset_0_0_20px_rgba(0,0,0,0.55),0_0_28px_rgba(167,73,18,0.16)]">
                <span className="font-serif text-3xl font-bold text-amber-200 drop-shadow-[0_0_10px_rgba(245,158,11,0.25)]">{actions}</span>
                <span className="mt-1 text-[8px] font-semibold uppercase tracking-[0.22em] text-amber-800/90">Actions</span>
                <span className="absolute inset-[4px] border border-amber-300/10" />
            </div>

            <button
                type="button"
                disabled={!isPlayerTurn}
                onClick={onEndTurn}
                className="combat-table__end-turn hc-button hc-button--primary z-40 min-h-[54px] min-w-[190px] px-10 py-4 text-lg"
            >
                End Turn
            </button>

            <div className="absolute bottom-[42px] left-1/2 z-40 h-[310px] w-[900px] -translate-x-1/2">
                <Hand cards={hand} disabled={!isPlayerTurn || actions <= 0} onPlayCard={onPlayCard} />
            </div>

            <div className="pointer-events-none absolute bottom-2 left-1/2 z-50 -translate-x-1/2 border border-amber-950/40 bg-black/25 px-3 py-1">
                <span className="text-[8px] font-semibold uppercase tracking-[0.25em] text-stone-600">Hand {hand.length}</span>
            </div>
        </section>
    );
}

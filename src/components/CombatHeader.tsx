import type { ReactNode } from "react";

interface CombatHeaderProps {
    gold: number;
    onOpenInventory: () => void;
}

function CrownMark() {
    return (
        <div className="relative flex h-10 w-10 items-center justify-center border border-amber-700/60 bg-[linear-gradient(145deg,#2b1a0e,#0e0906)] shadow-[inset_0_0_0_1px_rgba(255,214,145,0.08),0_6px_20px_rgba(0,0,0,0.45)]">
            <span className="font-serif text-lg text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">♛</span>
            <span className="absolute inset-[3px] border border-amber-900/40" />
        </div>
    );
}

function GameButton({
    children,
    onClick,
    disabled = false,
}: {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={[
                "group relative overflow-hidden border border-amber-900/70 bg-[linear-gradient(180deg,#3a1d10_0%,#1e0f09_48%,#120806_100%)] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-100 shadow-[inset_0_1px_0_rgba(255,222,160,0.16),inset_0_-2px_0_rgba(0,0,0,0.35),0_5px_18px_rgba(0,0,0,0.45)] transition-all duration-150",
                "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-amber-200/30",
                disabled
                    ? "cursor-not-allowed opacity-40"
                    : "hover:-translate-y-0.5 hover:border-amber-500/80 hover:brightness-110 hover:shadow-[inset_0_1px_0_rgba(255,222,160,0.2),0_7px_24px_rgba(145,66,15,0.25)] active:translate-y-px",
            ].join(" ")}
        >
            {children}
        </button>
    );
}

export default function CombatHeader({ gold, onOpenInventory }: CombatHeaderProps) {
    return (
        <header className="relative z-30 h-[72px] border-b border-amber-900/50 bg-[linear-gradient(180deg,rgba(10,7,5,0.97),rgba(10,7,5,0.86))] px-6 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-700/60 to-transparent" />
            <div className="mx-auto flex h-full max-w-[1800px] items-center gap-4">
                <CrownMark />

                <div className="min-w-0">
                    <h1 className="font-serif text-xl font-bold uppercase tracking-[0.18em] text-stone-100">
                        The Hollow Crown
                    </h1>
                    <p className="mt-0.5 text-[8px] uppercase tracking-[0.32em] text-amber-700/80">
                        Ashen Depths · Combat
                    </p>
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <div className="border border-amber-900/50 bg-black/25 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                        <p className="text-[7px] uppercase tracking-[0.22em] text-stone-600">Gold</p>
                        <p className="mt-0.5 text-sm font-semibold text-amber-200">◆ {gold}</p>
                    </div>

                    <GameButton onClick={onOpenInventory}>Inventory</GameButton>
                    <GameButton disabled aria-disabled="true">Journal</GameButton>
                </div>
            </div>
        </header>
    );
}

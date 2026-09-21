import type { ReactNode } from "react";

interface CombatHeaderProps {
    gold: number;
    onOpenInventory: () => void;
    onOpenSettings: () => void;
}

function CrownMark() {
    return (
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center border border-amber-700/60 bg-[linear-gradient(145deg,#2b1a0e,#0e0906)] shadow-[inset_0_0_0_1px_rgba(255,214,145,0.08),0_6px_20px_rgba(0,0,0,0.45)]">
            <span className="font-serif text-base text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">♛</span>
            <span className="absolute inset-[3px] border border-amber-900/40" />
        </div>
    );
}

function GameButton({
    children,
    onClick,
}: {
    children: ReactNode;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="relative min-h-9 border border-amber-900/55 bg-[linear-gradient(180deg,rgba(42,24,14,0.94),rgba(15,9,6,0.97))] px-4 text-[8px] font-bold uppercase tracking-[0.18em] text-stone-300 shadow-[inset_0_1px_0_rgba(255,235,207,0.07),0_4px_14px_rgba(0,0,0,0.26)] transition hover:-translate-y-px hover:border-amber-600/80 hover:text-amber-100 hover:brightness-110 active:translate-y-px"
        >
            <span className="pointer-events-none absolute inset-[2px] border border-white/[0.025]" />
            {children}
        </button>
    );
}

export default function CombatHeader({
    gold,
    onOpenInventory,
    onOpenSettings,
}: CombatHeaderProps) {
    return (
        <header className="relative z-[60] h-16 shrink-0 border-b border-amber-900/55 bg-[linear-gradient(180deg,rgba(10,7,5,0.985),rgba(10,7,5,0.9))] px-5 shadow-[0_8px_30px_rgba(0,0,0,0.52)]">
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-700/65 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/[0.08] to-transparent" />

            <div className="mx-auto flex h-full max-w-[1880px] items-center gap-3">
                <CrownMark />

                <div className="min-w-0">
                    <h1 className="font-serif text-base font-bold uppercase tracking-[0.2em] text-stone-100">
                        The Hollow Crown
                    </h1>
                    <p className="mt-0.5 text-[7px] uppercase tracking-[0.3em] text-amber-700/85">
                        Ashen Depths · Combat
                    </p>
                </div>

                <div className="ml-6 hidden h-7 w-px bg-amber-900/40 md:block" />

                <div className="hidden items-center gap-2 md:flex">
                    <span className="text-[7px] uppercase tracking-[0.28em] text-stone-600">
                        The Descent
                    </span>
                    <span className="h-1 w-1 rotate-45 bg-amber-700/70" />
                    <span className="text-[7px] uppercase tracking-[0.22em] text-stone-500">
                        Ashen Depths
                    </span>
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <div className="hidden border-r border-amber-900/35 pr-3 sm:block">
                        <p className="text-right text-[6px] uppercase tracking-[0.22em] text-stone-600">
                            Gold
                        </p>
                        <p className="mt-0.5 text-xs font-semibold text-amber-200">
                            ◆ {gold}
                        </p>
                    </div>

                    <GameButton onClick={onOpenInventory}>Inventory</GameButton>
                    <GameButton onClick={onOpenSettings}>Settings</GameButton>
                </div>
            </div>
        </header>
    );
}

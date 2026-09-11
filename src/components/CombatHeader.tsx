interface CombatHeaderProps {
    gold: number;
}

export default function CombatHeader({
    gold,
}: CombatHeaderProps) {
    return (
        <header className="relative z-30 flex h-20 items-center border-b border-stone-900/80 bg-[#090706]/90 px-6 shadow-[0_4px_25px_rgba(0,0,0,0.45)]">
            <div className="flex min-w-0 items-center">
                <div>
                    <h1 className="font-serif text-2xl font-bold uppercase tracking-[0.18em] text-stone-200">
                        Chaos Flame
                    </h1>

                    <p className="text-[9px] uppercase tracking-[0.3em] text-stone-500">
                        Roguelike card game
                    </p>
                </div>
            </div>

            <nav className="ml-12 flex items-center gap-2">
                <button
                    type="button"
                    className="border border-stone-800 bg-[#120d0a]/80 px-5 py-3 text-xs uppercase tracking-[0.2em] text-stone-300 transition hover:border-stone-600 hover:text-stone-100"
                >
                    Journal
                </button>

                <button
                    type="button"
                    className="border border-stone-800 bg-[#120d0a]/80 px-5 py-3 text-xs uppercase tracking-[0.2em] text-stone-300 transition hover:border-stone-600 hover:text-stone-100"
                >
                    Inventory
                </button>
            </nav>

            <div className="ml-auto flex items-center gap-4">
                <div className="flex items-center gap-2 border border-stone-800 bg-[#120d0a]/80 px-5 py-3">
                    <span className="text-sm text-amber-400">
                        ◆
                    </span>

                    <span className="text-sm font-bold text-stone-200">
                        {gold}
                    </span>
                </div>

                <button
                    type="button"
                    aria-label="Settings"
                    className="flex h-11 w-11 items-center justify-center border border-stone-800 bg-[#120d0a]/80 text-lg text-stone-400 transition hover:border-stone-600 hover:text-stone-100"
                >
                    ⚙
                </button>
            </div>
        </header>
    );
}
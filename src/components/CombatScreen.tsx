import type { CombatState } from "../types/game";

interface CombatScreenProps {
    combat: CombatState;
}

export default function CombatScreen({
    combat,
}: CombatScreenProps) {
    return (
        <main className="min-h-screen bg-[#0c0a08] text-stone-200">
            <div className="mx-auto flex min-h-screen max-w-7xl flex-col p-8">

                <header className="flex items-center justify-between border-b border-stone-800 pb-6">
                    <h1 className="font-serif text-4xl font-bold uppercase tracking-[0.15em]">
                        Combat
                    </h1>

                    <div className="text-right">
                        <p className="text-xs uppercase tracking-widest text-stone-500">
                            Turn
                        </p>

                        <p className="text-2xl font-bold">
                            {combat.turn}
                        </p>
                    </div>
                </header>

                <section className="flex flex-1 flex-col items-center justify-center">

                    <div className="mb-10 text-center">
                        <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                            Enemy
                        </p>

                        <h2 className="mt-2 font-serif text-5xl font-bold">
                            {combat.enemy.definitionId}
                        </h2>

                        <p className="mt-4 text-lg">
                            HP{" "}
                            <span className="font-bold text-red-400">
                                {combat.enemy.hp}
                            </span>
                        </p>
                    </div>

                    <div className="rounded-xl border border-stone-800 bg-black/30 px-8 py-6">
                        <p className="text-center text-sm uppercase tracking-widest text-stone-500">
                            Enemy intent
                        </p>

                        <p className="mt-3 text-center text-2xl font-bold">
                            {combat.enemy.intent.type}
                        </p>
                    </div>

                    <div className="mt-16 text-center">
                        <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                            Player
                        </p>

                        <p className="mt-2 text-2xl font-bold">
                            HP{" "}
                            <span className="text-red-400">
                                {combat.player.hp}
                            </span>
                            /
                            {combat.player.maxHp}
                        </p>

                        <p className="mt-2 text-sm text-stone-400">
                            Actions:{" "}
                            <span className="font-bold text-stone-200">
                                {combat.player.actions}
                            </span>
                        </p>
                    </div>

                </section>

                <footer className="border-t border-stone-800 pt-6">
                    <p className="text-center text-sm text-stone-500">
                        Combat UI placeholder
                    </p>
                </footer>

            </div>
        </main>
    );
}
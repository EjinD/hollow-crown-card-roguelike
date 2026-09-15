import { useEffect, useMemo, useState } from "react";

import { preloadGameAssets } from "../data/assets";

interface StarterScreenProps {
    onReady: () => void;
}

export default function StarterScreen({
    onReady,
}: StarterScreenProps) {
    const [loaded, setLoaded] = useState(0);
    const [total, setTotal] = useState(0);
    const [failed, setFailed] = useState(0);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let cancelled = false;

        preloadGameAssets((nextLoaded, nextTotal, nextFailed) => {
            if (cancelled) {
                return;
            }

            setLoaded(nextLoaded);
            setTotal(nextTotal);
            setFailed(nextFailed);
        }).then((result) => {
            if (cancelled) {
                return;
            }

            setLoaded(result.loaded);
            setTotal(result.total);
            setFailed(result.failed);
            setReady(true);
        });

        document.fonts?.ready?.catch(() => undefined);

        return () => {
            cancelled = true;
        };
    }, []);

    const progress = useMemo(() => {
        if (total === 0) {
            return 100;
        }

        return Math.min(
            100,
            Math.round((loaded / total) * 100),
        );
    }, [loaded, total]);

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#050403] text-stone-100">
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(161,52,17,0.22),_transparent_48%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(0,0,0,0.15),_rgba(0,0,0,0.8))]" />
            </div>

            <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10">
                <section className="w-full max-w-3xl border border-stone-800 bg-[#090706]/85 px-8 py-10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] backdrop-blur-sm md:px-14 md:py-14">
                    <div className="text-center">
                        <p className="text-[10px] uppercase tracking-[0.5em] text-stone-600">
                            Preparing the descent
                        </p>

                        <h1 className="mt-4 font-serif text-4xl font-bold uppercase tracking-[0.16em] text-stone-100 md:text-6xl">
                            The Hollow Crown
                        </h1>

                        <p className="mt-3 text-xs uppercase tracking-[0.35em] text-stone-600">
                            A dark fantasy roguelike card game
                        </p>
                    </div>

                    <div className="mx-auto mt-12 max-w-xl">
                        <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-stone-500">
                            <span>
                                {ready
                                    ? failed > 0
                                        ? "Asset loading failed"
                                        : "All assets ready"
                                    : "Loading assets"}
                            </span>

                            <span>
                                {progress}%
                            </span>
                        </div>

                        <div className="h-3 overflow-hidden border border-stone-800 bg-black/80 p-[2px]">
                            <div
                                className="h-full bg-gradient-to-r from-orange-950 via-orange-700 to-amber-400 transition-[width] duration-200"
                                style={{
                                    width: `${progress}%`,
                                }}
                            />
                        </div>

                        <div className="mt-4 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-stone-700">
                            <span>
                                {loaded} / {total} assets
                            </span>

                            <span>
                                {failed > 0
                                    ? `${failed} failed`
                                    : "Graphics verified"}
                            </span>
                        </div>
                    </div>

                    <div className="mx-auto mt-10 grid max-w-xl grid-cols-2 gap-3 text-[10px] uppercase tracking-[0.2em] text-stone-500 md:grid-cols-3">
                        {[
                            "Characters",
                            "Enemies",
                            "Cards",
                            "Battlefields",
                            "Relics",
                            "UI Assets",
                        ].map((item) => (
                            <div
                                key={item}
                                className="border border-stone-900 bg-black/20 px-4 py-3"
                            >
                                <span className="mr-2 text-orange-800">
                                    ◆
                                </span>
                                {item}
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 text-center">
                        {ready && failed === 0 ? (
                            <button
                                type="button"
                                onClick={onReady}
                                className="min-w-56 border border-orange-800 bg-[#24120d] px-10 py-4 text-xs font-bold uppercase tracking-[0.28em] text-orange-200 transition hover:border-orange-600 hover:bg-[#351811]"
                            >
                                Enter
                            </button>
                        ) : failed > 0 ? (
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="min-w-56 border border-red-900 bg-[#1a0a08] px-10 py-4 text-xs font-bold uppercase tracking-[0.28em] text-red-200 transition hover:border-red-700 hover:bg-[#2a0d0a]"
                            >
                                Retry Loading
                            </button>
                        ) : (
                            <button
                                type="button"
                                disabled
                                className="min-w-56 cursor-not-allowed border border-stone-800 bg-black/30 px-10 py-4 text-xs font-bold uppercase tracking-[0.28em] text-stone-700"
                            >
                                Preparing...
                            </button>
                        )}
                    </div>

                    <p className="mt-8 text-center text-[9px] uppercase tracking-[0.35em] text-stone-700">
                        Every descent begins with a single step.
                    </p>
                </section>
            </div>
        </main>
    );
}

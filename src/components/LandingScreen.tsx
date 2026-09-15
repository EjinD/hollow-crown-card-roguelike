import battlefieldImage from "../assets/backgrounds/battlefield.png";
import playerImage from "../assets/characters/player.png";

interface LandingScreenProps {
    onEnter: () => void;
}

export default function LandingScreen({
    onEnter,
}: LandingScreenProps) {
    return (
        <main className="relative min-h-screen overflow-hidden bg-[#050403] text-stone-100">
            <div className="absolute inset-0">
                <img
                    src={battlefieldImage}
                    alt=""
                    draggable={false}
                    className="h-full w-full select-none object-cover"
                />

                <div className="absolute inset-0 bg-black/55" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_20%,_rgba(0,0,0,0.72)_100%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(0,0,0,0.75),_rgba(0,0,0,0.2)_50%,_rgba(0,0,0,0.72))]" />
            </div>

            <div className="pointer-events-none absolute bottom-[-12%] right-[8%] z-10 h-[82vh] w-[46vw] max-w-[720px] opacity-95">
                <img
                    src={playerImage}
                    alt=""
                    draggable={false}
                    className="h-full w-full select-none object-contain drop-shadow-[0_25px_55px_rgba(0,0,0,0.75)]"
                />
            </div>

            <div className="relative z-20 flex min-h-screen items-center px-8 py-12 md:px-16 lg:px-24">
                <section className="max-w-2xl">
                    <p className="text-[10px] uppercase tracking-[0.5em] text-stone-500">
                        A dark fantasy roguelike
                    </p>

                    <h1 className="mt-5 font-serif text-5xl font-bold uppercase leading-none tracking-[0.12em] text-stone-100 drop-shadow-[0_8px_30px_rgba(0,0,0,0.75)] md:text-7xl xl:text-8xl">
                        The Hollow
                        <br />
                        Crown
                    </h1>

                    <div className="mt-7 h-px w-40 bg-gradient-to-r from-orange-800 to-transparent" />

                    <p className="mt-7 max-w-lg text-sm leading-7 text-stone-400 md:text-base">
                        Descend through forgotten kingdoms, master a deadly deck, and uncover what waits beneath the throne.
                    </p>

                    <div className="mt-10 flex flex-wrap items-center gap-4">
                        <button
                            type="button"
                            onClick={onEnter}
                            className="border border-orange-700 bg-[#24120d]/95 px-10 py-4 text-xs font-bold uppercase tracking-[0.28em] text-orange-100 shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition hover:border-orange-500 hover:bg-[#351711]"
                        >
                            Enter the Bastion
                        </button>

                        <button
                            type="button"
                            disabled
                            className="cursor-not-allowed border border-stone-800 bg-black/25 px-8 py-4 text-xs uppercase tracking-[0.24em] text-stone-600"
                        >
                            Settings
                        </button>
                    </div>

                    <div className="mt-12 grid max-w-md grid-cols-3 gap-3 text-[9px] uppercase tracking-[0.2em] text-stone-600">
                        <span>Deckbuilding</span>
                        <span>Dark Fantasy</span>
                        <span>Roguelike</span>
                    </div>
                </section>
            </div>

        </main>
    );
}

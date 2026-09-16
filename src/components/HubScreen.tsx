import playerImage from "../assets/characters/player.png";
import type { MetaProgressState } from "../types/meta";

interface HubScreenProps {
    meta: MetaProgressState;
    onStartRun: () => void;
    onOpenCardPacks: () => void;
    onOpenCollection: () => void;
    onOpenArmory: () => void;
}

interface HubStationProps {
    label: string;
    title: string;
    description: string;
    value?: string;
    onClick?: () => void;
    disabled?: boolean;
}

function HubStation({
    label,
    title,
    description,
    value,
    onClick,
    disabled = false,
}: HubStationProps) {
    const content = (
        <div
            className={[
                "w-full border bg-[#100c09]/90 p-5 text-left transition",
                disabled
                    ? "border-stone-900/80 opacity-60"
                    : "border-stone-800 hover:border-orange-800/80 hover:bg-[#16100c]",
            ].join(" ")}
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[9px] uppercase tracking-[0.32em] text-stone-600">
                        {label}
                    </p>

                    <h3 className="mt-2 font-serif text-lg font-bold uppercase tracking-[0.12em] text-stone-200">
                        {title}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-stone-500">
                        {description}
                    </p>
                </div>

                {value && (
                    <span className="shrink-0 text-sm font-bold text-amber-400">
                        {value}
                    </span>
                )}
            </div>
        </div>
    );

    if (!onClick || disabled) {
        return <div>{content}</div>;
    }

    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full text-left"
        >
            {content}
        </button>
    );
}

export default function HubScreen({
    meta,
    onStartRun,
    onOpenCardPacks,
    onOpenCollection,
    onOpenArmory,
}: HubScreenProps) {
    const unlockedAchievements =
        meta.achievements.filter(
            (achievement) => achievement.unlocked,
        ).length;

    const discoveredCards = Object.values(
        meta.cardCollection,
    ).filter((count) => count > 0).length;

    const maxHpLevel =
        meta.upgrades.find(
            (upgrade) => upgrade.id === "max-hp",
        )?.level ?? 0;


    return (
        <main className="min-h-screen overflow-hidden bg-[#070605] text-stone-200">
            <div className="relative min-h-screen">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(110,43,17,0.2),_transparent_48%)]" />
                <div className="absolute inset-x-0 bottom-0 h-[55%] bg-[linear-gradient(to_top,_rgba(0,0,0,0.98),_transparent)]" />

                <header className="relative z-20 flex items-center justify-between border-b border-stone-900/80 bg-[#080706]/80 px-8 py-6">
                    <div>
                        <p className="text-[9px] uppercase tracking-[0.45em] text-stone-600">
                            Sanctuary
                        </p>

                        <h1 className="mt-2 font-serif text-3xl font-bold uppercase tracking-[0.18em] text-stone-100">
                            The Ashen Bastion
                        </h1>

                        <p className="mt-1 text-xs uppercase tracking-[0.24em] text-stone-600">
                            Rest · Prepare · Descend
                        </p>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="text-right">
                            <p className="text-[9px] uppercase tracking-[0.3em] text-stone-600">
                                Hub Gold
                            </p>

                            <p className="mt-1 text-xl font-bold text-amber-400">
                                ◆ {meta.hubGold}
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="text-[9px] uppercase tracking-[0.3em] text-stone-600">
                                Expeditions
                            </p>

                            <p className="mt-1 text-xl font-bold text-stone-200">
                                {meta.totalRuns}
                            </p>
                        </div>
                    </div>
                </header>

                <section className="relative z-10 mx-auto grid min-h-[calc(100vh-103px)] max-w-7xl grid-cols-12 gap-8 px-8 py-8">
                    <div className="col-span-3 flex flex-col justify-center gap-4">
                        <HubStation
                            label="Character"
                            title="Armory"
                            description="Permanent upgrades that shape your hero between expeditions."
                            value={`HP LV ${maxHpLevel}`}
                            onClick={onOpenArmory}
                        />

                        <HubStation
                            label="Collection"
                            title="Card Packs"
                            description="Open Ashen Packs and reveal new cards. Duplicates become Dust immediately."
                            value={`${meta.hubGold} ◆`}
                            onClick={onOpenCardPacks}
                        />

                        <HubStation
                            label="Collection"
                            title="Collection"
                            description="Browse the permanent card collection, craft missing cards, and build the deck for your next descent."
                            value={`${discoveredCards} found`}
                            onClick={onOpenCollection}
                        />

                    </div>

                    <div className="col-span-6 flex flex-col items-center justify-center">
                        <div className="relative flex h-[500px] w-full items-end justify-center">
                            <div className="absolute bottom-[8%] h-52 w-96 rounded-full bg-orange-500/10 blur-3xl" />

                            <img
                                src={playerImage}
                                alt="Player"
                                draggable={false}
                                className="relative z-10 h-[480px] w-[480px] select-none object-contain"
                            />
                        </div>

                        <div className="relative z-20 -mt-2 flex flex-col items-center text-center">
                            <p className="text-[9px] uppercase tracking-[0.45em] text-stone-600">
                                The road below awaits
                            </p>

                            <h2 className="mt-2 font-serif text-2xl font-bold uppercase tracking-[0.16em] text-stone-100">
                                The Dungeon Gate
                            </h2>

                            <button
                                type="button"
                                onClick={onStartRun}
                                className="mt-6 border border-orange-800 bg-[#24120d] px-12 py-4 text-sm font-bold uppercase tracking-[0.25em] text-orange-200 shadow-[0_0_32px_rgba(180,70,20,0.1)] transition hover:border-orange-600 hover:bg-[#351711] hover:text-orange-100"
                            >
                                Open Dungeon Gate
                            </button>
                        </div>
                    </div>

                    <div className="col-span-3 flex flex-col justify-center gap-4">
                        <HubStation
                            label="Legacy"
                            title="Achievements"
                            description="Record boss kills and the milestones of your expeditions."
                            value={`${unlockedAchievements}/${meta.achievements.length}`}
                        />

                        <HubStation
                            label="Knowledge"
                            title="Encyclopedia"
                            description="Record relics, enemies, bosses and discoveries made during your expeditions."
                            disabled
                        />

                    </div>
                </section>
            </div>
        </main>
    );
}

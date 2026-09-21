import { useState, type KeyboardEvent } from "react";
import dungeonGateBackground from "../assets/backgrounds/dungeons/ashen-depths/dungeon-gate-background.png";
import tutorialArt from "../assets/backgrounds/dungeons/tutorial/tutorial-art.png";
import ashenDepthsArt from "../assets/backgrounds/dungeons/ashen-depths/ashen-depths-art.png";
import crownOfBoneArt from "../assets/backgrounds/dungeons/crown-of-bone/crown-of-bone-art.png";
import hollowSpireArt from "../assets/backgrounds/dungeons/hollow-spire/hollow-spire-art.png";
import forgottenRealmArt from "../assets/backgrounds/dungeons/forgotten-realm/forgotten-realm-art.png";
import type { MetaProgressState } from "../types/meta";
import { dungeons, isDungeonUnlocked } from "../data/dungeons";

interface DungeonGateScreenProps {
    meta: MetaProgressState;
    savedDeckSize: number;
    onBack: () => void;
    onSelectDungeon: (dungeonId: string) => void;
}

const dungeonArtwork: Record<string, string> = {
    tutorial: tutorialArt,
    "ashen-depths": ashenDepthsArt,
    "crown-of-bone": crownOfBoneArt,
    "black-spire": hollowSpireArt,
    "forgotten-realm": forgottenRealmArt,
};

function getUnlockLabel(
    dungeonId: string,
    meta: MetaProgressState,
): string {
    const dungeon = dungeons.find((entry) => entry.id === dungeonId);

    if (!dungeon) return "Locked";

    if (isDungeonUnlocked(dungeon, meta)) {
        return "Available";
    }

    if (dungeon.unlock.type === "dungeon-completed") {
        const requiredDungeon = dungeons.find(
            (entry) => entry.id === dungeon.unlock.dungeonId,
        );

        return requiredDungeon
            ? `Complete ${requiredDungeon.name}`
            : "Complete previous dungeon";
    }

    if (dungeon.unlock.type === "hub-level") {
        return `Reach Bastion Level ${dungeon.unlock.level}`;
    }

    return "Locked";
}

export default function DungeonGateScreen({
    meta,
    savedDeckSize,
    onBack,
    onSelectDungeon,
}: DungeonGateScreenProps) {
    const progressionLevel =
        1 +
        meta.upgrades.reduce(
            (total, upgrade) => total + Math.max(0, upgrade.level),
            0,
        );

    const tutorialCompleted = meta.completedDungeonIds.includes("tutorial");
    const firstUnlockedDungeon =
        dungeons.find(
            (dungeon) =>
                isDungeonUnlocked(dungeon, meta) &&
                (!tutorialCompleted || dungeon.id !== "tutorial"),
        ) ?? dungeons[0];
    const [selectedDungeonId, setSelectedDungeonId] = useState(
        firstUnlockedDungeon?.id ?? "",
    );

    const selectedDungeon =
        dungeons.find((dungeon) => dungeon.id === selectedDungeonId) ??
        firstUnlockedDungeon;

    const selectedUnlocked =
        selectedDungeon !== undefined &&
        isDungeonUnlocked(selectedDungeon, meta);

    const handleSelect = (dungeonId: string) => {
        const dungeon = dungeons.find((entry) => entry.id === dungeonId);
        if (!dungeon || !isDungeonUnlocked(dungeon, meta)) return;
        setSelectedDungeonId(dungeonId);
    };

    const handleCardKeyDown = (
        event: KeyboardEvent<HTMLElement>,
        dungeonId: string,
    ) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        handleSelect(dungeonId);
    };

    return (
        <main className="hc-dungeon-gate-screen">
            <div
                className="hc-dungeon-gate-screen__background"
                style={{ backgroundImage: `url(${dungeonGateBackground})` }}
                aria-hidden="true"
            />
            <div className="hc-dungeon-gate-screen__shade" aria-hidden="true" />
            <div className="hc-dungeon-gate-screen__ember-haze" aria-hidden="true" />

            <header className="hc-dungeon-gate-header">
                <button
                    type="button"
                    onClick={onBack}
                    className="hc-dungeon-gate-header__back"
                >
                    <span className="hc-dungeon-gate-header__back-arrow" aria-hidden="true">
                        ←
                    </span>
                    <span>Back to Bastion</span>
                </button>

                <div className="hc-dungeon-gate-header__stats" aria-label="Run preparation status">
                    <div className="hc-dungeon-gate-header__stat">
                        <span>Bastion Level</span>
                        <strong>{progressionLevel}</strong>
                    </div>
                    <div className="hc-dungeon-gate-header__divider" aria-hidden="true" />
                    <div className="hc-dungeon-gate-header__stat">
                        <span>Prepared Deck</span>
                        <strong className="hc-dungeon-gate-header__stat--gold">
                            {savedDeckSize} / 20
                        </strong>
                    </div>
                </div>
            </header>

            <section className="hc-dungeon-gate-content">
                <div className="hc-dungeon-gate-intro">
                    <span className="hc-eyebrow">THE DUNGEON GATE</span>
                    <h1>
                        Choose Your
                        <br />
                        Descent
                    </h1>
                    <p>
                        Pass beneath the Bastion and choose which depth will
                        claim the next chapter of the run.
                    </p>
                </div>

                <div className="hc-dungeon-gate-divider" aria-hidden="true">
                    <span />
                    <i>◆</i>
                    <span />
                </div>

                <div className="hc-dungeon-gate-grid">
                    {dungeons.map((dungeon) => {
                        const unlocked = isDungeonUnlocked(dungeon, meta);
                        const completed = meta.completedDungeonIds.includes(
                            dungeon.id,
                        );
                        const selected = selectedDungeonId === dungeon.id;
                        const artwork = dungeonArtwork[dungeon.id] ?? ashenDepthsArt;

                        return (
                            <article
                                key={dungeon.id}
                                className={[
                                    "hc-dungeon-card",
                                    unlocked
                                        ? "hc-dungeon-card--available"
                                        : "hc-dungeon-card--locked",
                                    completed
                                        ? "hc-dungeon-card--completed"
                                        : "",
                                    selected ? "hc-dungeon-card--selected" : "",
                                ]
                                    .filter(Boolean)
                                    .join(" ")}
                                role={unlocked ? "button" : undefined}
                                tabIndex={unlocked ? 0 : undefined}
                                aria-pressed={unlocked ? selected : undefined}
                                onClick={() => handleSelect(dungeon.id)}
                                onKeyDown={(event) =>
                                    handleCardKeyDown(event, dungeon.id)
                                }
                            >
                                <div className="hc-dungeon-card__frame" aria-hidden="true" />

                                <div className="hc-dungeon-card__art">
                                    <img
                                        src={artwork}
                                        alt=""
                                        draggable={false}
                                    />
                                    <span className="hc-dungeon-card__art-fade" aria-hidden="true" />
                                    {!unlocked && (
                                        <span className="hc-dungeon-card__lock-mark" aria-hidden="true">
                                            ♜
                                        </span>
                                    )}
                                </div>

                                <div className="hc-dungeon-card__content">
                                    <div className="hc-dungeon-card__top">
                                        <span>{dungeon.themeLabel}</span>
                                        {completed && <em>Cleared</em>}
                                    </div>

                                    <div className="hc-dungeon-card__title-block">
                                        <h2>{dungeon.name}</h2>
                                        <p className="hc-dungeon-card__subtitle">
                                            {dungeon.subtitle}
                                        </p>
                                    </div>

                                    <p className="hc-dungeon-card__description">
                                        {dungeon.description}
                                    </p>

                                    <div className="hc-dungeon-card__meta">
                                        <span>{dungeon.floorCount} Floors</span>
                                        <span>
                                            {dungeon.layout === "linear"
                                                ? "Linear Descent"
                                                : "Branched Descent"}
                                        </span>
                                    </div>

                                    <div className="hc-dungeon-card__boss-row">
                                        <span>Boss</span>
                                        <strong>{dungeon.bossEnemyId.replaceAll("-", " ")}</strong>
                                    </div>

                                    <div className="hc-dungeon-card__action">
                                        {unlocked ? (
                                            <button
                                                type="button"
                                                className="hc-dungeon-card__enter"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    setSelectedDungeonId(dungeon.id);
                                                    onSelectDungeon(dungeon.id);
                                                }}
                                            >
                                                <span>{
                                                    completed
                                                        ? "Descend Again"
                                                        : "Enter"
                                                }</span>
                                            </button>
                                        ) : (
                                            <div className="hc-dungeon-card__locked-copy">
                                                <span>Locked</span>
                                                <small>{getUnlockLabel(dungeon.id, meta)}</small>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>

                {selectedDungeon && (
                    <div className="hc-dungeon-gate-selection" aria-live="polite">
                        <div>
                            <span className="hc-dungeon-gate-selection__eyebrow">
                                Selected Descent
                            </span>
                            <strong>{selectedDungeon.name}</strong>
                        </div>
                        {selectedUnlocked && (
                            <button
                                type="button"
                                className="hc-dungeon-gate-selection__confirm"
                                onClick={() => onSelectDungeon(selectedDungeon.id)}
                            >
                                Begin Descent
                            </button>
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}

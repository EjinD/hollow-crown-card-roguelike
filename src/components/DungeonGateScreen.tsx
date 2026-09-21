import dungeonGateBackground from "../assets/backgrounds/dungeons/ashen-depths/dungeon-gate-background.png";
import type { MetaProgressState } from "../types/meta";
import {
    dungeons,
    isDungeonUnlocked,
} from "../data/dungeons";

interface DungeonGateScreenProps {
    meta: MetaProgressState;
    savedDeckSize: number;
    onBack: () => void;
    onSelectDungeon: (dungeonId: string) => void;
}

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
                    className="hc-button hc-button--secondary hc-dungeon-gate-header__back"
                >
                    <span aria-hidden="true">‹</span>
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
                    <h1>Choose Your Descent</h1>
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
                                ]
                                    .filter(Boolean)
                                    .join(" ")}
                            >
                                <div className="hc-dungeon-card__inner">
                                    <div className="hc-dungeon-card__top">
                                        <span>{dungeon.themeLabel}</span>
                                        {completed && (
                                            <em>Cleared</em>
                                        )}
                                    </div>

                                    <div className="hc-dungeon-card__ornament" aria-hidden="true">
                                        <span />
                                        <b>◆</b>
                                        <span />
                                    </div>

                                    <div className="hc-dungeon-card__body">
                                        <h2>{dungeon.name}</h2>
                                        <p className="hc-dungeon-card__subtitle">
                                            {dungeon.subtitle}
                                        </p>
                                        <p className="hc-dungeon-card__description">
                                            {dungeon.description}
                                        </p>
                                    </div>

                                    <div className="hc-dungeon-card__meta">
                                        <span>{dungeon.floorCount} Floors</span>
                                        <span>
                                            {dungeon.layout === "linear"
                                                ? "Linear"
                                                : "Branched"}
                                        </span>
                                    </div>

                                    <div className="hc-dungeon-card__action">
                                        {!unlocked ? (
                                            <div className="hc-dungeon-card__locked">
                                                <span>Locked</span>
                                                <small>
                                                    {getUnlockLabel(
                                                        dungeon.id,
                                                        meta,
                                                    )}
                                                </small>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                className="hc-button hc-button--primary hc-button--wide"
                                                onClick={() =>
                                                    onSelectDungeon(dungeon.id)
                                                }
                                            >
                                                {completed
                                                    ? "Descend Again"
                                                    : "Enter Dungeon"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>
        </main>
    );
}

import bastionBackground from "../assets/backgrounds/hub/bastion-background.png";
import type { MetaProgressState } from "../types/meta";

type HubStationKind =
    | "packs"
    | "collection"
    | "armory"
    | "achievements"
    | "encyclopedia"
    | "shop";

interface HubScreenProps {
    meta: MetaProgressState;
    onStartRun: () => void;
    onOpenCardPacks: () => void;
    onOpenCollection: () => void;
    onOpenArmory: () => void;
    onOpenShop: () => void;
}

interface HubStationProps {
    kind: HubStationKind;
    title: string;
    subtitle?: string;
    onClick?: () => void;
    disabled?: boolean;
}

function HubIcon({ kind }: { kind: HubStationKind }) {
    const common = {
        width: 48,
        height: 48,
        viewBox: "0 0 48 48",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
        "aria-hidden": true as const,
    };

    switch (kind) {
        case "packs":
            return (
                <svg {...common}>
                    <path d="M10 15.5 27 10l11 7-17 5.5-11-7Z" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M13 18v14l17 5.5V23.5L13 18Z" stroke="currentColor" strokeWidth="1.6" />
                    <path d="m30 23.5 8-6.5v14L30 37.5" stroke="currentColor" strokeWidth="1.6" />
                    <path d="m21 22.5 6-4.5 7 4.5-7 4.5-6-4.5Z" stroke="currentColor" strokeWidth="1.4" />
                </svg>
            );
        case "collection":
            return (
                <svg {...common}>
                    <path d="M13 9h20v29H13c-2.2 0-4-1.8-4-4V13c0-2.2 1.8-4 4-4Z" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M13 9v29M18 15h10M18 21h10M18 27h7" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M33 14h3c1.1 0 2 .9 2 2v22H21" stroke="currentColor" strokeWidth="1.3" />
                </svg>
            );
        case "armory":
            return (
                <svg {...common}>
                    <path d="M9 34h30v4H9v-4Z" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M12 34 18 19h12l6 15" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M15 19h18M18 15h12l-2-5H20l-2 5Z" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M20 25h8M19 30h10" stroke="currentColor" strokeWidth="1.4" />
                </svg>
            );
        case "achievements":
            return (
                <svg {...common}>
                    <path d="M17 11h14v8c0 6-4.1 10-7 10s-7-4-7-10v-8Z" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M17 15H11v2c0 4 2.6 7 6 7M31 15h6v2c0 4-2.6 7-6 7M24 29v7M19 38h10" stroke="currentColor" strokeWidth="1.6" />
                    <path d="m24 14 1.5 3.1 3.4.5-2.5 2.4.6 3.4-3-1.6-3 1.6.6-3.4-2.5-2.4 3.4-.5L24 14Z" stroke="currentColor" strokeWidth="1.1" />
                </svg>
            );
        case "encyclopedia":
            return (
                <svg {...common}>
                    <path d="M9 12c4-2 8-2 15 2v25c-7-4-11-4-15-2V12Z" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M39 12c-4-2-8-2-15 2v25c7-4 11-4 15-2V12Z" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M24 14v25M13 18h7M28 18h7M13 24h7M28 24h7" stroke="currentColor" strokeWidth="1.35" />
                </svg>
            );
        case "shop":
            return (
                <svg {...common}>
                    <path d="M11 20h26l-2 18H13l-2-18Z" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M15 20v-4c0-4 3.2-7 9-7s9 3 9 7v4" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M17 25h14M17 30h10" stroke="currentColor" strokeWidth="1.35" />
                </svg>
            );
    }
}

function HubStation({
    kind,
    title,
    subtitle,
    onClick,
    disabled = false,
}: HubStationProps) {
    const content = (
        <span
            className={[
                "hc-hub-v2-station",
                disabled ? "hc-hub-v2-station--disabled" : "",
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <span className="hc-hub-v2-station__icon-shell">
                <span className="hc-hub-v2-station__icon-glow" aria-hidden="true" />
                <span className="hc-hub-v2-station__icon">
                    <HubIcon kind={kind} />
                </span>
            </span>
            <span className="hc-hub-v2-station__title">{title}</span>
            {subtitle && (
                <span className="hc-hub-v2-station__subtitle">{subtitle}</span>
            )}
            {!disabled && <span className="hc-hub-v2-station__mark" aria-hidden="true">◆</span>}
        </span>
    );

    if (disabled || !onClick) {
        return (
            <div className="hc-hub-v2-station-button" aria-disabled="true">
                {content}
            </div>
        );
    }

    return (
        <button
            type="button"
            className="hc-hub-v2-station-button"
            onClick={onClick}
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
    onOpenShop,
}: HubScreenProps) {
    const unlockedAchievements = meta.achievements.filter(
        (achievement) => achievement.unlocked,
    ).length;

    const discoveredCards = Object.values(meta.cardCollection).filter(
        (count) => count > 0,
    ).length;

    const maxHpLevel = meta.upgrades.find(
        (upgrade) => upgrade.id === "max-hp",
    )?.level ?? 0;

    return (
        <main className="hc-stage hc-hub-screen-v2">
            <div
                className="hc-stage__background hc-hub-v2-background"
                style={{ backgroundImage: `url(${bastionBackground})` }}
                aria-hidden="true"
            />
            <div className="hc-stage__vignette" aria-hidden="true" />
            <div className="hc-hub-v2-atmosphere" aria-hidden="true" />

            <section className="hc-hub-v2-layout">
                <header className="hc-hub-v2-heading">
                    <div className="hc-hub-v2-ornament" aria-hidden="true">
                        <span />
                        <i />
                        <span />
                    </div>
                    <h1>ASHEN BASTION</h1>
                </header>

                <div className="hc-hub-v2-stage">
                    <div className="hc-hub-v2-flank hc-hub-v2-flank--left">
                        <HubStation
                            kind="packs"
                            title="PACKS"
                            subtitle={`${meta.hubGold} GOLD`}
                            onClick={onOpenCardPacks}
                        />
                        <HubStation
                            kind="collection"
                            title="COLLECTION"
                            subtitle={`${discoveredCards} DISCOVERED`}
                            onClick={onOpenCollection}
                        />
                        <HubStation
                            kind="achievements"
                            title="ACHIEVEMENTS"
                            subtitle={`${unlockedAchievements}/${meta.achievements.length}`}
                            disabled
                        />
                    </div>

                    <div className="hc-hub-v2-center">
                        <div className="hc-hub-v2-gate-aura" aria-hidden="true" />
                        <button
                            type="button"
                            className="hc-world-action hc-world-action--gate"
                            onClick={onStartRun}
                        >
                            <span>DUNGEON GATE</span>
                        </button>
                    </div>

                    <div className="hc-hub-v2-flank hc-hub-v2-flank--right">
                        <HubStation
                            kind="armory"
                            title="ARMORY"
                            subtitle={`HP LV ${maxHpLevel}`}
                            onClick={onOpenArmory}
                        />
                        <HubStation
                            kind="encyclopedia"
                            title="ENCYCLOPEDIA"
                            subtitle="ARCHIVE"
                            disabled
                        />
                        <HubStation
                            kind="shop"
                            title="SHOP"
                            subtitle="SUPPLIES"
                            onClick={onOpenShop}
                        />
                    </div>
                </div>

                <footer className="hc-hub-v2-footer">
                </footer>
            </section>
        </main>
    );
}

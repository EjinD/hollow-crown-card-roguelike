import bastionBackground from "../assets/backgrounds/hub/bastion-background.png";
import type { MetaProgressState } from "../types/meta";
import packs from "../assets/icons/hub/packs.svg"
import collection from "../assets/icons/hub/collection.svg"
import armoryIcon from "../assets/icons/hub/armory.svg";
import encyclopediaIcon from "../assets/icons/hub/encyclopedia.svg";
import achievementsIcon from "../assets/icons/hub/achievements.svg";

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
                <img
                    src={packs}
                    alt=""
                    width={50}
                    height={50}
                    draggable={false}
                    className="hc-hub-v2-station__external-icon"
                />
            );
        case "collection":
            return (
                <img
                    src={collection}
                    alt=""
                    width={50}
                    height={50}
                    draggable={false}
                    className="hc-hub-v2-station__external-icon"
                />
            );
        case "armory":
            return (
                <img
                    src={armoryIcon}
                    alt=""
                    width={50}
                    height={50}
                    draggable={false}
                    className="hc-hub-v2-station__external-icon"
                />
            );
        case "achievements":
            return (
                <img
                    src={achievementsIcon}
                    alt=""
                    width={51}
                    height={51}
                    draggable={false}
                    className="hc-hub-v2-station__external-icon"
                />
            );
        case "encyclopedia":
            return (
                <img
                    src={encyclopediaIcon}
                    alt=""
                    width={50}
                    height={50}
                    draggable={false}
                    className="hc-hub-v2-station__external-icon"
                />
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
}: HubScreenProps) {
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
                            subtitle="COMING SOON"
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
                      { /* SHOP OR ELSE IDK WHAT SHOULD DO HERE RIGHT NOW*/}
                        <HubStation
                            kind="encyclopedia"
                            title="ENCYCLOPEDIA"
                            subtitle="COMING SOON"
                            disabled
                        />
                        <HubStation
                            kind="shop"
                            title="FEATURE_NAME"
                            subtitle="COMING SOON"
                            disabled
                        />
                    </div>
                </div>

                <footer className="hc-hub-v2-footer">
                </footer>
            </section>
        </main>
    );
}

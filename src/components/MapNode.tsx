import type { MapNode as MapNodeType } from "../types/game";

import battleIcon from "../assets/icons/map/battle.svg";
import bossIcon from "../assets/icons/map/boss.svg";
import completedIcon from "../assets/icons/map/completed.svg";
import currentIcon from "../assets/icons/map/current.svg";
import eliteIcon from "../assets/icons/map/elite.svg";
import eventIcon from "../assets/icons/map/event.svg";
import lockedIcon from "../assets/icons/map/locked.svg";
import restIcon from "../assets/icons/map/rest.svg";
import shopIcon from "../assets/icons/map/shop.svg";

type NodeVisual = {
    label: string;
    className: string;
    icon: string;
};

const nodeIcons: Record<MapNodeType["type"], string> = {
    battle: battleIcon,
    elite: eliteIcon,
    event: eventIcon,
    shop: shopIcon,
    rest: restIcon,
    boss: bossIcon,
};

function getNodeVisual(type: MapNodeType["type"]): NodeVisual {
    switch (type) {
        case "battle":
            return { label: "Battle", className: "is-battle", icon: nodeIcons.battle };
        case "elite":
            return { label: "Elite", className: "is-elite", icon: nodeIcons.elite };
        case "event":
            return { label: "Event", className: "is-event", icon: nodeIcons.event };
        case "shop":
            return { label: "Shop", className: "is-shop", icon: nodeIcons.shop };
        case "rest":
            return { label: "Rest", className: "is-rest", icon: nodeIcons.rest };
        case "boss":
            return { label: "Boss", className: "is-boss", icon: nodeIcons.boss };
    }
}

function getStateIcon({
    isCurrent,
    isCompleted,
    isAvailable,
    typeIcon,
}: {
    isCurrent: boolean;
    isCompleted: boolean;
    isAvailable: boolean;
    typeIcon: string;
}): string {
    if (isCurrent) return currentIcon;
    if (isCompleted) return completedIcon;
    if (!isAvailable) return lockedIcon;
    return typeIcon;
}

export default function MapNode({
    node,
    isCurrent,
    isAvailable,
    onClick,
}: {
    node: MapNodeType;
    isCurrent: boolean;
    isAvailable: boolean;
    onClick: (nodeId: string) => void;
}) {
    const isCompleted = node.completed;
    const isInteractive = isCurrent || isAvailable;
    const visual = getNodeVisual(node.type);
    const stateClass = isCurrent
        ? "is-current"
        : isCompleted
            ? "is-completed"
            : isAvailable
                ? "is-available"
                : "is-locked";

    const icon = getStateIcon({
        isCurrent,
        isCompleted,
        isAvailable,
        typeIcon: visual.icon,
    });

    return (
        <button
            type="button"
            disabled={!isInteractive}
            onClick={() => onClick(node.id)}
            data-map-node-id={node.id}
            aria-label={visual.label}
            aria-current={isCurrent ? "step" : undefined}
            className={`hc-map-node ${visual.className} ${stateClass}`}
        >
            <span className="hc-map-node__outer" aria-hidden="true" />
            <span className="hc-map-node__inner" aria-hidden="true" />
            <span className="hc-map-node__rune" aria-hidden="true" />

            <span className="hc-map-node__icon" aria-hidden="true">
                <img className="hc-map-node__icon-image" src={icon} alt="" draggable={false} />
            </span>

            <span className="hc-map-node__label">{visual.label}</span>
        </button>
    );
}

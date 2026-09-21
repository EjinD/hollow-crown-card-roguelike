import type { ReactNode } from "react";
import mapBackgroundImage from "../assets/backgrounds/dungeons/ashen-depths/map-background.png";

interface MapBackgroundProps {
    children: ReactNode;
    dungeonId?: string;
}

export default function MapBackground({
    children,
    dungeonId,
}: MapBackgroundProps) {
    const isAshenDepths = dungeonId === "ashen-depths";

    return (
        <div className={`hc-map-screen${isAshenDepths ? " hc-map-screen--ashen-depths" : ""}`}>
            <div
                className="hc-map-screen__background"
                style={{ backgroundImage: `url(${mapBackgroundImage})` }}
                aria-hidden="true"
            />
            <div className="hc-map-screen__atmosphere" aria-hidden="true" />
            <div className="hc-map-screen__vignette" aria-hidden="true" />
            <div className="hc-map-screen__grain" aria-hidden="true" />

            <div className="hc-map-screen__content">{children}</div>
        </div>
    );
}

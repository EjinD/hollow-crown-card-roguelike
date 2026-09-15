import { useEffect, useState } from "react";

interface CombatHealthBarProps {
    current: number;
    max: number;
    variant?: "player" | "enemy";
}

export default function CombatHealthBar({
    current,
    max,
    variant = "enemy",
}: CombatHealthBarProps) {
    const percent = Math.max(
        0,
        Math.min(
            100,
            (current / max) * 100,
        ),
    );

    const [displayedPercent, setDisplayedPercent] =
        useState(percent);

    const [previousPercent, setPreviousPercent] =
        useState(percent);

    const [recentlyDamaged, setRecentlyDamaged] =
        useState(false);

    const [recentlyHealed, setRecentlyHealed] =
        useState(false);

    useEffect(() => {
        if (percent < previousPercent) {
            setRecentlyDamaged(true);
            setRecentlyHealed(false);

            const timeout = window.setTimeout(() => {
                setRecentlyDamaged(false);
            }, 350);

            return () => {
                window.clearTimeout(timeout);
            };
        }

        if (percent > previousPercent) {
            setRecentlyHealed(true);
            setRecentlyDamaged(false);

            const timeout = window.setTimeout(() => {
                setRecentlyHealed(false);
            }, 400);

            return () => {
                window.clearTimeout(timeout);
            };
        }

        return undefined;
    }, [percent, previousPercent]);

    useEffect(() => {
        setPreviousPercent(percent);

        const frame = window.requestAnimationFrame(() => {
            setDisplayedPercent(percent);
        });

        return () => {
            window.cancelAnimationFrame(frame);
        };
    }, [percent]);

    const barClass =
        variant === "player"
            ? "from-red-700 via-red-600 to-red-500"
            : "from-red-800 via-red-700 to-red-600";

    return (
        <div
            className={[
                "relative h-3 overflow-hidden border border-stone-800 bg-black/70",
                recentlyDamaged
                    ? "animate-[hpBarHit_350ms_ease-out]"
                    : "",
                recentlyHealed
                    ? "animate-[hpBarHeal_400ms_ease-out]"
                    : "",
            ].join(" ")}
        >
            {/* Delayed damage / heal trail */}
            <div
                className={[
                    "absolute inset-y-0 left-0 transition-[width] duration-500 ease-out",
                    percent < previousPercent
                        ? "bg-red-300/40"
                        : "bg-transparent",
                ].join(" ")}
                style={{
                    width: `${previousPercent}%`,
                }}
            />

            {/* Main HP */}
            <div
                className={[
                    "absolute inset-y-0 left-0 bg-gradient-to-r transition-[width] duration-300 ease-out",
                    barClass,
                ].join(" ")}
                style={{
                    width: `${displayedPercent}%`,
                }}
            />

            {/* Heal flash */}
            {recentlyHealed && (
                <div className="pointer-events-none absolute inset-0 bg-emerald-300/30" />
            )}

            {/* Damage flash */}
            {recentlyDamaged && (
                <div className="pointer-events-none absolute inset-0 bg-red-400/25" />
            )}
        </div>
    );
}
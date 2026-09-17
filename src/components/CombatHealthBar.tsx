import { useEffect, useState } from "react";

interface CombatHealthBarProps {
    current: number;
    max: number;
    variant: "player" | "enemy";
}

export default function CombatHealthBar({ current, max, variant }: CombatHealthBarProps) {
    const percent = max <= 0 ? 0 : Math.max(0, Math.min(100, (current / max) * 100));
    const [displayedPercent, setDisplayedPercent] = useState(percent);
    const [previousPercent, setPreviousPercent] = useState(percent);
    const [flash, setFlash] = useState<"damage" | "heal" | null>(null);

    useEffect(() => {
        if (percent < previousPercent) {
            setFlash("damage");
            const id = window.setTimeout(() => setFlash(null), 350);
            return () => window.clearTimeout(id);
        }
        if (percent > previousPercent) {
            setFlash("heal");
            const id = window.setTimeout(() => setFlash(null), 400);
            return () => window.clearTimeout(id);
        }
        return undefined;
    }, [percent, previousPercent]);

    useEffect(() => {
        setPreviousPercent(percent);
        const frame = window.requestAnimationFrame(() => setDisplayedPercent(percent));
        return () => window.cancelAnimationFrame(frame);
    }, [percent]);

    const bar = variant === "player"
        ? "from-red-900 via-red-700 to-red-500"
        : "from-red-950 via-red-800 to-red-600";

    return (
        <div className="relative h-4 overflow-hidden border border-amber-950/70 bg-[#090705] shadow-[inset_0_2px_5px_rgba(0,0,0,0.7),0_2px_8px_rgba(0,0,0,0.4)]">
            <div className="absolute inset-[2px] border border-white/[0.035]" />
            <div className="absolute inset-y-0 left-0 bg-red-300/10 transition-[width] duration-500 ease-out" style={{ width: `${previousPercent}%` }} />
            <div className={`absolute inset-y-0 left-0 bg-gradient-to-r ${bar} transition-[width] duration-300 ease-out`} style={{ width: `${displayedPercent}%` }} />
            <div className="absolute inset-x-0 top-0 h-px bg-white/15" />
            {flash === "damage" && <div className="pointer-events-none absolute inset-0 bg-red-300/30 animate-[hpBarHit_350ms_ease-out]" />}
            {flash === "heal" && <div className="pointer-events-none absolute inset-0 bg-emerald-300/30 animate-[hpBarHeal_400ms_ease-out]" />}
        </div>
    );
}

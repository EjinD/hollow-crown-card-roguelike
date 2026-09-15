interface CombatImpactProps {
    effect: "hit" | "heal" | "block";
}

function getImpactConfig(
    effect: CombatImpactProps["effect"],
) {
    switch (effect) {
        case "hit":
            return {
                ring:
                    "border-orange-300/80",
                glow:
                    "bg-orange-500/25",
                core:
                    "bg-red-400/20",
                icon: "✦",
                iconColor:
                    "text-orange-200",
            };

        case "heal":
            return {
                ring:
                    "border-emerald-300/70",
                glow:
                    "bg-emerald-400/20",
                core:
                    "bg-emerald-300/15",
                icon: "+",
                iconColor:
                    "text-emerald-200",
            };

        case "block":
            return {
                ring:
                    "border-sky-300/70",
                glow:
                    "bg-sky-400/20",
                core:
                    "bg-sky-300/15",
                icon: "✦",
                iconColor:
                    "text-sky-200",
            };
    }
}

export default function CombatImpact({
    effect,
}: CombatImpactProps) {
    const config =
        getImpactConfig(effect);

    return (
        <div className="pointer-events-none absolute inset-[-35%] z-30 flex items-center justify-center">
            <div
                className={[
                    "absolute h-28 w-28 rounded-full border-2",
                    "animate-[impactRing_450ms_ease-out_forwards]",
                    config.ring,
                ].join(" ")}
            />

            <div
                className={[
                    "absolute h-24 w-24 rounded-full blur-2xl",
                    "animate-[impactGlow_450ms_ease-out_forwards]",
                    config.glow,
                ].join(" ")}
            />

            <div
                className={[
                    "absolute h-14 w-14 rounded-full blur-xl",
                    "animate-[impactCore_300ms_ease-out_forwards]",
                    config.core,
                ].join(" ")}
            />

            <span
                className={[
                    "relative z-10 font-serif text-4xl font-bold",
                    "animate-[impactIcon_500ms_ease-out_forwards]",
                    config.iconColor,
                ].join(" ")}
            >
                {config.icon}
            </span>

            {effect === "hit" && (
                <>
                    <span className="absolute h-1.5 w-14 rotate-45 rounded-full bg-orange-300/80 animate-[impactSpark_420ms_ease-out_forwards]" />

                    <span className="absolute h-1.5 w-12 -rotate-45 rounded-full bg-red-300/70 animate-[impactSpark_450ms_ease-out_forwards]" />

                    <span className="absolute h-1 w-9 rotate-[70deg] rounded-full bg-yellow-200/70 animate-[impactSpark_480ms_ease-out_forwards]" />

                    <span className="absolute h-1 w-8 -rotate-[65deg] rounded-full bg-orange-200/60 animate-[impactSpark_520ms_ease-out_forwards]" />
                </>
            )}

            {effect === "block" && (
                <>
                    <div className="absolute h-32 w-24 rounded-[35%] border-2 border-sky-300/50 animate-[impactShield_450ms_ease-out_forwards]" />

                    <div className="absolute h-24 w-16 rounded-[40%] border border-sky-200/30 animate-[impactShieldInner_500ms_ease-out_forwards]" />
                </>
            )}

            {effect === "heal" && (
                <>
                    <span className="absolute h-1 w-12 rotate-[-35deg] rounded-full bg-emerald-300/70 animate-[impactHeal_500ms_ease-out_forwards]" />

                    <span className="absolute h-1 w-10 rotate-[35deg] rounded-full bg-emerald-200/60 animate-[impactHeal_520ms_ease-out_forwards]" />

                    <span className="absolute h-1 w-8 rotate-90 rounded-full bg-emerald-300/50 animate-[impactHeal_540ms_ease-out_forwards]" />
                </>
            )}
        </div>
    );
}
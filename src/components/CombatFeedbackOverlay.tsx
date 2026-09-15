import {
    useEffect,
    useState,
} from "react";

export type CombatFeedbackTarget =
    | "player"
    | "enemy";

export type CombatFeedbackTone =
    | "damage"
    | "heal"
    | "block"
    | "status";

export interface CombatFeedbackItem {
    id: number;
    target: CombatFeedbackTarget;
    text: string;
    tone: CombatFeedbackTone;
}

interface CombatFeedbackProps {
    feedback: CombatFeedbackItem[];
}

function getToneClass(
    tone: CombatFeedbackTone,
): string {
    switch (tone) {
        case "damage":
            return "text-red-400";

        case "heal":
            return "text-emerald-400";

        case "block":
            return "text-sky-300";

        case "status":
            return "text-amber-300";
    }
}

export default function CombatFeedback({
    feedback,
}: CombatFeedbackProps) {
    const [visibleIds, setVisibleIds] =
        useState<number[]>([]);

    useEffect(() => {
        if (feedback.length === 0) {
            return;
        }

        const ids = feedback.map(
            (item) => item.id,
        );

        setVisibleIds(ids);

        const timeout = window.setTimeout(
            () => {
                setVisibleIds((current) =>
                    current.filter(
                        (id) =>
                            !ids.includes(id),
                    ),
                );
            },
            1000,
        );

        return () => {
            window.clearTimeout(timeout);
        };
    }, [feedback]);

    return (
        <>
            {feedback
                .filter((item) =>
                    visibleIds.includes(
                        item.id,
                    ),
                )
                .map((item) => (
                    <div
                        key={item.id}
                        className={[
                            "pointer-events-none absolute z-50",
                            "animate-[combatFloat_1s_ease-out_forwards]",
                            "font-serif text-3xl font-bold",
                            "drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]",
                            item.target ===
                            "player"
                                ? "left-[20%] top-[26%]"
                                : "right-[23%] top-[26%]",
                            getToneClass(
                                item.tone,
                            ),
                        ].join(" ")}
                    >
                        {item.text}
                    </div>
                ))}
        </>
    );
}
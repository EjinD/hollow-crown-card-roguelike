import type { EventDefinition, EventChoice, EventRequirement } from "../types/events";

interface EventScreenProps {
    event: EventDefinition;
    gold: number;
    hp: number;
    deckSize: number;
    onChoose: (choiceId: string) => void;
}

function getRequirementText(
    requirement?: EventRequirement,
): string | null {
    if (!requirement) {
        return null;
    }

    switch (requirement.type) {
        case "gold":
            return `Requires ${requirement.amount} Gold`;
        case "hp":
            return `Requires ${requirement.amount} HP`;
        case "deck-size":
            return `Requires ${requirement.min} cards`;
    }
}

function canChoose(
    choice: EventChoice,
    gold: number,
    hp: number,
    deckSize: number,
): boolean {
    const requirement = choice.requirement;

    if (!requirement) {
        return true;
    }

    switch (requirement.type) {
        case "gold":
            return gold >= requirement.amount;
        case "hp":
            return hp >= requirement.amount;
        case "deck-size":
            return deckSize >= requirement.min;
    }
}

export default function EventScreen({
    event,
    gold,
    hp,
    deckSize,
    onChoose,
}: EventScreenProps) {
    return (
        <main className="min-h-screen bg-[#0c0a08] text-stone-200">
            <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-12 lg:px-10">
                <header className="border-b border-stone-900 pb-8 text-center">
                    <p className="text-[10px] uppercase tracking-[0.45em] text-orange-700">
                        Event
                    </p>

                    <h1 className="mt-4 font-serif text-4xl font-bold uppercase tracking-[0.16em] text-stone-100 md:text-5xl">
                        {event.name}
                    </h1>

                    <p className="mt-4 text-xs uppercase tracking-[0.32em] text-stone-600">
                        {event.subtitle}
                    </p>

                    <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-stone-400 md:text-lg">
                        {event.description}
                    </p>
                </header>

                <div className="mt-10 grid gap-4 md:grid-cols-3">
                    {event.choices.map((choice, index) => {
                        const available = canChoose(
                            choice,
                            gold,
                            hp,
                            deckSize,
                        );

                        const requirementText = getRequirementText(
                            choice.requirement,
                        );

                        return (
                            <button
                                key={choice.id}
                                type="button"
                                disabled={!available}
                                onClick={() => onChoose(choice.id)}
                                className={[
                                    "group flex min-h-[220px] flex-col border p-6 text-left transition",
                                    available
                                        ? "border-stone-800 bg-[#120e0b] hover:-translate-y-1 hover:border-orange-800 hover:bg-[#18100c]"
                                        : "cursor-not-allowed border-stone-900 bg-[#0e0b09] opacity-45",
                                ].join(" ")}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] uppercase tracking-[0.3em] text-stone-700">
                                        Choice {index + 1}
                                    </span>

                                    <span className="text-[9px] uppercase tracking-[0.2em] text-orange-800">
                                        {available ? "Available" : "Locked"}
                                    </span>
                                </div>

                                <h2 className="mt-6 font-serif text-xl font-bold uppercase tracking-[0.1em] text-stone-100 group-hover:text-orange-100">
                                    {choice.label}
                                </h2>

                                {choice.description && (
                                    <p className="mt-4 text-sm leading-6 text-stone-500">
                                        {choice.description}
                                    </p>
                                )}

                                <div className="mt-auto pt-8">
                                    {requirementText && (
                                        <p className="text-[9px] uppercase tracking-[0.2em] text-stone-600">
                                            {requirementText}
                                        </p>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <footer className="mt-10 flex flex-wrap justify-center gap-8 border-t border-stone-900 pt-6 text-center">
                    <div>
                        <p className="text-[9px] uppercase tracking-[0.28em] text-stone-600">
                            HP
                        </p>
                        <p className="mt-1 text-lg font-bold text-red-400">
                            {hp}
                        </p>
                    </div>

                    <div>
                        <p className="text-[9px] uppercase tracking-[0.28em] text-stone-600">
                            Gold
                        </p>
                        <p className="mt-1 text-lg font-bold text-amber-400">
                            {gold}
                        </p>
                    </div>

                    <div>
                        <p className="text-[9px] uppercase tracking-[0.28em] text-stone-600">
                            Deck
                        </p>
                        <p className="mt-1 text-lg font-bold text-stone-300">
                            {deckSize}
                        </p>
                    </div>
                </footer>
            </div>
        </main>
    );
}

interface EventScreenProps {
    title: string;
    description: string;
    onAccept: () => void;
}

export default function EventScreen({
    title,
    description,
    onAccept,
}: EventScreenProps) {
    return (
        <main className="min-h-screen bg-[#0c0a08] text-stone-200">
            <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-8 py-12">
                <p className="text-xs uppercase tracking-[0.4em] text-purple-400">
                    Event
                </p>

                <h1 className="mt-4 text-center font-serif text-5xl font-bold uppercase tracking-widest">
                    {title}
                </h1>

                <div className="mt-8 max-w-xl text-center">
                    <p className="text-lg leading-relaxed text-stone-400">
                        {description}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onAccept}
                    className="mt-12 border border-purple-900 bg-[#171018] px-10 py-4 text-sm uppercase tracking-[0.25em] text-purple-300 transition hover:border-purple-500 hover:bg-[#211522] hover:text-purple-200"
                >
                    Accept
                </button>
            </div>
        </main>
    );
}
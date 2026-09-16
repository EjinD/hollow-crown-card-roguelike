interface MapBackgroundProps {
    children: React.ReactNode;
    dungeonId?: string;
}

export default function MapBackground({
    children,
    dungeonId,
}: MapBackgroundProps) {
    const isAshenDepths = dungeonId === "ashen-depths";

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#080706] text-stone-200">
            <div className="pointer-events-none absolute inset-0">
                <div className={isAshenDepths
                    ? "absolute left-[8%] top-[12%] h-80 w-80 rounded-full bg-orange-800/12 blur-3xl"
                    : "absolute left-[8%] top-[15%] h-72 w-72 rounded-full bg-orange-900/10 blur-3xl"} />
                <div className={isAshenDepths
                    ? "absolute right-[5%] top-[30%] h-[30rem] w-[30rem] rounded-full bg-red-950/14 blur-3xl"
                    : "absolute right-[5%] top-[35%] h-96 w-96 rounded-full bg-red-950/10 blur-3xl"} />
                <div className={isAshenDepths
                    ? "absolute bottom-[0%] left-[28%] h-[28rem] w-[28rem] rounded-full bg-orange-950/12 blur-3xl"
                    : "absolute bottom-[5%] left-[35%] h-80 w-80 rounded-full bg-amber-950/10 blur-3xl"} />

                {isAshenDepths && (
                    <>
                        <div className="absolute inset-x-0 bottom-0 h-[45%] bg-[linear-gradient(to_top,rgba(72,24,10,0.2),transparent)]" />
                        <div className="absolute left-[12%] top-[34%] h-1 w-1 rounded-full bg-orange-300/60 shadow-[60px_-100px_rgba(251,146,60,0.55),150px_-30px_rgba(251,146,60,0.45),-30px_130px_rgba(248,113,113,0.35),260px_90px_rgba(249,115,22,0.5)] animate-pulse" />
                    </>
                )}
            </div>

            <div
                className="pointer-events-none absolute inset-0 opacity-[0.035]"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                    backgroundSize: "42px 42px",
                }}
            />

            {isAshenDepths && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] opacity-30 [background-image:linear-gradient(135deg,transparent_0_42%,rgba(92,50,35,.22)_42%_43%,transparent_43%_100%),linear-gradient(45deg,transparent_0_65%,rgba(92,50,35,.16)_65%_66%,transparent_66%_100%)] [background-size:180px_180px,240px_240px]" />
            )}

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(0,0,0,0.74)_100%)]" />

            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}

interface MapBackgroundProps {
    children: React.ReactNode;
}

export default function MapBackground({
    children,
}: MapBackgroundProps) {
    return (
        <div className="relative min-h-screen overflow-hidden bg-[#090807] text-stone-200">
            {/* Background glow */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-[8%] top-[15%] h-72 w-72 rounded-full bg-orange-900/10 blur-3xl" />

                <div className="absolute right-[5%] top-[35%] h-96 w-96 rounded-full bg-red-950/10 blur-3xl" />

                <div className="absolute bottom-[5%] left-[35%] h-80 w-80 rounded-full bg-amber-950/10 blur-3xl" />
            </div>

            {/* Subtle grid */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.035]"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                    backgroundSize:
                        "42px 42px",
                }}
            />

            {/* Vignette */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(0,0,0,0.72)_100%)]" />

            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
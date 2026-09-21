import { useEffect, useState } from "react";

interface CombatSettingsOverlayProps {
    onClose: () => void;
}

function getInitialReducedMotion(): boolean {
    try {
        return localStorage.getItem("hc-reduced-motion") === "true";
    } catch {
        return false;
    }
}

function applyReducedMotion(enabled: boolean) {
    document.documentElement.dataset.hcReducedMotion = enabled ? "true" : "false";
    try {
        localStorage.setItem("hc-reduced-motion", String(enabled));
    } catch {
        // Ignore storage failures; the setting still applies for this session.
    }
}

export default function CombatSettingsOverlay({
    onClose,
}: CombatSettingsOverlayProps) {
    const [reducedMotion, setReducedMotion] = useState(getInitialReducedMotion);
    const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));

    useEffect(() => {
        applyReducedMotion(reducedMotion);

        const handleFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose, reducedMotion]);

    async function toggleFullscreen() {
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            } else {
                await document.documentElement.requestFullscreen();
            }
        } catch {
            // Fullscreen can be unavailable in some embedded/browser contexts.
        }
    }

    function toggleReducedMotion() {
        setReducedMotion((current) => !current);
    }

    return (
        <div
            className="absolute inset-0 z-[130] flex items-center justify-center bg-black/72 p-6 backdrop-blur-[4px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="combat-settings-title"
        >
            <button
                type="button"
                aria-label="Close settings"
                onClick={onClose}
                className="absolute inset-0 cursor-default"
            />

            <section className="relative w-full max-w-xl overflow-hidden border border-amber-900/65 bg-[linear-gradient(180deg,#140c08,#0a0705)] shadow-[0_24px_90px_rgba(0,0,0,0.82),inset_0_1px_0_rgba(255,235,207,0.05)]">
                <div className="pointer-events-none absolute inset-[4px] border border-white/[0.025]" />
                <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/20 to-transparent" />

                <header className="flex items-end justify-between border-b border-amber-900/35 px-7 py-5">
                    <div>
                        <p className="text-[8px] font-semibold uppercase tracking-[0.32em] text-amber-700/85">
                            Combat Interface
                        </p>
                        <h2
                            id="combat-settings-title"
                            className="mt-1 font-serif text-2xl font-bold uppercase tracking-[0.12em] text-stone-100"
                        >
                            Settings
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="relative z-10 border border-amber-900/55 bg-[#1a100c] px-4 py-2 text-[8px] font-bold uppercase tracking-[0.18em] text-stone-400 transition hover:border-amber-700/75 hover:text-stone-100"
                    >
                        Close
                    </button>
                </header>

                <div className="space-y-3 px-7 py-6">
                    <button
                        type="button"
                        onClick={toggleFullscreen}
                        className="group flex w-full items-center justify-between border border-stone-800 bg-black/20 px-4 py-4 text-left transition hover:border-amber-900/70 hover:bg-amber-950/10"
                    >
                        <span>
                            <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-stone-200">
                                Fullscreen
                            </span>
                            <span className="mt-1 block text-[10px] text-stone-600">
                                Expand the game to the browser's fullscreen mode.
                            </span>
                        </span>
                        <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-amber-300 group-hover:text-amber-100">
                            {isFullscreen ? "On" : "Off"}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={toggleReducedMotion}
                        className="group flex w-full items-center justify-between border border-stone-800 bg-black/20 px-4 py-4 text-left transition hover:border-amber-900/70 hover:bg-amber-950/10"
                    >
                        <span>
                            <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-stone-200">
                                Reduced motion
                            </span>
                            <span className="mt-1 block text-[10px] text-stone-600">
                                Reduce combat animation intensity.
                            </span>
                        </span>
                        <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-amber-300 group-hover:text-amber-100">
                            {reducedMotion ? "On" : "Off"}
                        </span>
                    </button>

                    <div className="border border-dashed border-stone-900 bg-black/15 px-4 py-4">
                        <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-stone-500">
                            Audio
                        </span>
                        <span className="mt-1 block text-[10px] text-stone-700">
                            Music and sound controls will be added with the audio pass.
                        </span>
                    </div>
                </div>
            </section>
        </div>
    );
}

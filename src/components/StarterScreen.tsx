import { useEffect, useMemo, useState } from "react";

import loadingBackground from "../assets/backgrounds/loading/loading-background.png";
import gameLogo from "../assets/ui/logo/the-hollow-crown-logo.png";
import { preloadGameAssets } from "../data/assets";

interface StarterScreenProps {
    onReady: () => void;
}

export default function StarterScreen({
    onReady,
}: StarterScreenProps) {
    const [loaded, setLoaded] = useState(0);
    const [total, setTotal] = useState(0);
    const [failed, setFailed] = useState(0);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let cancelled = false;

        preloadGameAssets((nextLoaded, nextTotal, nextFailed) => {
            if (cancelled) return;
            setLoaded(nextLoaded);
            setTotal(nextTotal);
            setFailed(nextFailed);
        }).then((result) => {
            if (cancelled) return;
            setLoaded(result.loaded);
            setTotal(result.total);
            setFailed(result.failed);
            setReady(true);
        });

        document.fonts?.ready?.catch(() => undefined);

        return () => {
            cancelled = true;
        };
    }, []);

    const progress = useMemo(() => {
        if (total === 0) return 100;
        return Math.min(100, Math.round((loaded / total) * 100));
    }, [loaded, total]);

    const status = ready
        ? failed > 0
            ? "Some assets could not be prepared"
            : "All core assets are ready"
        : "Preparing the descent";

    return (
        <main className="hc-stage hc-loading-screen">
            <div
                className="hc-stage__background"
                style={{ backgroundImage: `url(${loadingBackground})` }}
                aria-hidden="true"
            />

            <div className="hc-stage__vignette" aria-hidden="true" />
            <div className="hc-stage__embers" aria-hidden="true" />

            <section className="hc-loading-stage" aria-label="Game loading">
                <img
                    src={gameLogo}
                    alt="The Hollow Crown"
                    draggable={false}
                    className="hc-loading-stage__logo"
                />

                <div className="hc-loading-stage__ornament" aria-hidden="true">
                    <span />
                    <i />
                    <span />
                </div>

                <p className="hc-loading-stage__status">{status}</p>

                <div className="hc-progress hc-loading-stage__progress" aria-label={`${progress}% loaded`}>
                    <div className="hc-progress__header">
                        <span>Awakening the Bastion</span>
                        <strong>{progress}%</strong>
                    </div>

                    <div className="hc-progress__track">
                        <div
                            className="hc-progress__fill"
                            style={{ width: `${progress}%` }}
                        />
                        <div className="hc-progress__shine" />
                    </div>

                    <div className="hc-progress__meta">
                        <span>{loaded} / {total} assets</span>
                        <span>
                            {failed > 0
                                ? `${failed} failed`
                                : "Graphics verified"}
                        </span>
                    </div>
                </div>

                <div className="hc-loading-stage__footer">
                    {ready && failed === 0 ? (
                        <button
                            type="button"
                            className="hc-button hc-button--primary hc-button--wide"
                            onClick={onReady}
                        >
                            Enter the Bastion
                        </button>
                    ) : failed > 0 ? (
                        <button
                            type="button"
                            className="hc-button hc-button--danger hc-button--wide"
                            onClick={() => window.location.reload()}
                        >
                            Retry Loading
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="hc-button hc-button--disabled hc-button--wide"
                            disabled
                        >
                            Preparing…
                        </button>
                    )}

                    <p className="hc-loading-stage__hint">
                        Core assets load before the world is revealed.
                    </p>
                </div>
            </section>
        </main>
    );
}

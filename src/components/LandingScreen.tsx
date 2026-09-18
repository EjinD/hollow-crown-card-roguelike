import landingBackground from "../assets/backgrounds/landing/landing-background.png";
import gameLogo from "../assets/ui/logo/the-hollow-crown-logo.png";

interface LandingScreenProps {
    onEnter: () => void;
}

export default function LandingScreen({
    onEnter,
}: LandingScreenProps) {
    return (
        <main className="hc-stage hc-landing-screen">
            <div
                className="hc-stage__background"
                style={{ backgroundImage: `url(${landingBackground})` }}
                aria-hidden="true"
            />
            <div className="hc-stage__vignette" aria-hidden="true" />
            <div className="hc-stage__shade hc-stage__shade--left" aria-hidden="true" />


            <section className="hc-landing-content">
                <div className="hc-landing-content__inner">
                    <p className="hc-eyebrow">A dark fantasy roguelike deckbuilder</p>

                    <img
                        src={gameLogo}
                        alt="The Hollow Crown"
                        draggable={false}
                        className="hc-landing-logo"
                    />

                    <div className="hc-ornament hc-ornament--left" aria-hidden="true">
                        <span />
                        <i />
                        <span />
                    </div>

                    <p className="hc-landing-copy">
                        Descend through forgotten kingdoms, master a deadly deck,
                        and uncover what waits beneath the throne.
                    </p>

                    <div className="hc-landing-actions">
                        <button
                            type="button"
                            className="hc-button hc-button--primary hc-button--hero"
                            onClick={onEnter}
                        >
                            Enter the Bastion
                        </button>

                        <button
                            type="button"
                            className="hc-button hc-button--secondary"
                            disabled
                        >
                            Settings
                        </button>
                    </div>

                    <div className="hc-landing-tags" aria-hidden="true">
                        <span>Deckbuilding</span>
                        <b>·</b>
                        <span>Dark Fantasy</span>
                        <b>·</b>
                        <span>Roguelike</span>
                    </div>
                </div>
            </section>

            <div className="hc-landing-quote">
                <span>From ash, we build again.</span>
            </div>
        </main>
    );
}

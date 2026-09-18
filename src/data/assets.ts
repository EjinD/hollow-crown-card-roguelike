import loadingBackground from "../assets/backgrounds/loading/loading-background.png";
import landingBackground from "../assets/backgrounds/landing/landing-background.png";
import bastionBackground from "../assets/backgrounds/hub/bastion-background.png";
import globalBackground from "../assets/backgrounds/global/ashen-world-background.png";
import gameLogo from "../assets/ui/logo/the-hollow-crown-logo.png";
import crownSigil from "../assets/ui/logo/crown-sigil.png";

const assetModules = import.meta.glob(
    "../assets/**/*.{png,webp,jpg,jpeg,svg}",
    {
        eager: true,
        import: "default",
        query: "?url",
    },
) as Record<string, string>;

export const gameAssetUrls = Object.values(assetModules);

const cardAssetModules = import.meta.glob(
    "../assets/cards/*.{png,webp,jpg,jpeg}",
    {
        eager: true,
        import: "default",
        query: "?url",
    },
) as Record<string, string>;

const cardArtworkById: Record<string, string> = Object.fromEntries(
    Object.entries(cardAssetModules).map(([path, url]) => {
        const file = path.split("/").pop() ?? "";
        return [file.replace(/\.(png|webp|jpg|jpeg)$/i, ""), url];
    }),
);

const cardArtworkAliases: Record<string, string> = {
    "molten-barrier": "molted-barrier",
    "crowns-judgment": "crowns-judgement",
};

export function getCardArtwork(cardId: string): string | undefined {
    return (
        cardArtworkById[cardId] ??
        cardArtworkById[cardArtworkAliases[cardId] ?? ""]
    );
}

export function resolveCardArtwork(cardId: string): string | undefined {
    return getCardArtwork(cardId);
}

/** Stage 1 boot-critical assets only. Decorative/feature assets load lazily. */
export const coreAssetUrls = [
    loadingBackground,
    landingBackground,
    bastionBackground,
    globalBackground,
    gameLogo,
    crownSigil,
];

let preloadPromise: Promise<{
    loaded: number;
    total: number;
    failed: number;
}> | null = null;

export function preloadGameAssets(
    onProgress?: (loaded: number, total: number, failed: number) => void,
): Promise<{
    loaded: number;
    total: number;
    failed: number;
}> {
    if (preloadPromise) {
        return preloadPromise;
    }

    const preloadTargets = coreAssetUrls;
    const total = preloadTargets.length;

    if (total === 0) {
        preloadPromise = Promise.resolve({ loaded: 0, total: 0, failed: 0 });
        return preloadPromise;
    }

    preloadPromise = new Promise((resolve) => {
        let loaded = 0;
        let failed = 0;

        const complete = () => {
            loaded += 1;
            onProgress?.(loaded, total, failed);

            if (loaded >= total) {
                resolve({ loaded, total, failed });
            }
        };

        for (const url of preloadTargets) {
            const image = new Image();
            image.onload = complete;
            image.onerror = () => {
                failed += 1;
                complete();
            };
            image.src = url;
        }
    });

    return preloadPromise;
}

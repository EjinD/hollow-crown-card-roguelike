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

// These aliases keep the resolver tolerant of the two historical filename
// spellings while the source assets are being normalized.
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

    const total = gameAssetUrls.length;

    if (total === 0) {
        preloadPromise = Promise.resolve({
            loaded: 0,
            total: 0,
            failed: 0,
        });

        return preloadPromise;
    }

    preloadPromise = new Promise((resolve) => {
        let loaded = 0;
        let failed = 0;

        const complete = () => {
            loaded += 1;
            onProgress?.(loaded, total, failed);

            if (loaded >= total) {
                resolve({
                    loaded,
                    total,
                    failed,
                });
            }
        };

        for (const url of gameAssetUrls) {
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

const assetModules = import.meta.glob(
    "../assets/**/*.{png,webp,jpg,jpeg,svg}",
    {
        eager: true,
        import: "default",
        query: "?url",
    },
);

export const gameAssetUrls = Object.values(
    assetModules,
) as string[];

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

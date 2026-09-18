export type PlayerAnimationState =
    | "idle"
    | "attack"
    | "hit"
    | "death"
    | "signature";

const playerAssetModules = import.meta.glob(
    "../assets/characters/player/*.png",
    {
        eager: true,
        import: "default",
        query: "?url",
    },
) as Record<string, string>;

const playerAssetsByState: Partial<
    Record<PlayerAnimationState, string>
> = Object.fromEntries(
    Object.entries(playerAssetModules).map(([path, url]) => {
        const file = path.split("/").pop() ?? "";
        const state = file
            .replace(/^player-/i, "")
            .replace(/\.png$/i, "") as PlayerAnimationState;

        return [state, url];
    }),
);

export function getPlayerArtwork(
    state: PlayerAnimationState = "idle",
): string | undefined {
    return (
        playerAssetsByState[state] ??
        playerAssetsByState.idle
    );
}

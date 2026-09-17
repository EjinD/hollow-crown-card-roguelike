import { resolveCardArtwork } from "../data/assets";

interface CardArtworkProps {
    cardId: string;
    alt: string;
    className?: string;
    imageClassName?: string;
}

export default function CardArtwork({
    cardId,
    alt,
    className = "",
    imageClassName = "",
}: CardArtworkProps) {
    const artwork = resolveCardArtwork(cardId);

    return (
        <div className={className}>
            {artwork ? (
                <img
                    src={artwork}
                    alt={alt}
                    draggable={false}
                    className={imageClassName || "h-full w-full object-contain"}
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center text-[9px] uppercase tracking-[0.2em] text-stone-700">
                    Artwork unavailable
                </div>
            )}
        </div>
    );
}

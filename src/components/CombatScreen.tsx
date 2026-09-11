import type { CombatState } from "../types/game";
import { enemies } from "../data/enemies";
import goblinImage from "../assets/characters/goblin.png";
import shieldGoblinImage from "../assets/characters/shield-goblin.png";
import warGoblinImage from "../assets/characters/war-goblin.png";
import goblinKingImage from "../assets/characters/goblin-king.png";
import playerImage from "../assets/characters/player.png";
import battlefieldImage from "../assets/backgrounds/battlefield.png";

import CombatCharacter from "./CombatCharacter";
import Hand from "./Hands";
import CombatHeader from "./CombatHeader";
import StatusEffects from "./StatusEffects";
import CardPile from "./CardPile";
interface CombatScreenProps {
    combat: CombatState;
    gold: number;
    onPlayCard: (cardId: string) => void;
    onEndTurn: () => void;
}
export default function CombatScreen({
    combat,
    gold,
    onPlayCard,
    onEndTurn,
}: CombatScreenProps) {
    const isPlayerTurn =
        combat.phase === "player-turn";
    const enemyImages: Record<string, string> = {
    goblin: goblinImage,
    "shield-goblin": shieldGoblinImage,
    "war-goblin": warGoblinImage,
    "goblin-king": goblinKingImage,
};

const enemyImage =
    enemyImages[combat.enemy.definitionId];
    const enemyDefinition = enemies.find(
        (enemy) =>
            enemy.id === combat.enemy.definitionId,
    );

    const enemyMaxHp =
        enemyDefinition?.maxHp ?? combat.enemy.hp;

    const playerHpPercent =
        Math.max(
            0,
            Math.min(
                100,
                (combat.player.hp /
                    combat.player.maxHp) *
                    100,
            ),
        );

    const enemyHpPercent =
        Math.max(
            0,
            Math.min(
                100,
                (combat.enemy.hp /
                    enemyMaxHp) *
                    100,
            ),
        );
    return (
        <main className="min-h-screen overflow-hidden bg-[#0b0907] text-stone-200">
            <div className="relative min-h-screen w-full overflow-hidden">
                <CombatHeader gold={gold} />
                {/* BACKGROUND */}
                
                <div className="absolute inset-0">
                    <img
                        src={battlefieldImage}
                        alt=""
                        draggable={false}
                        className="h-full w-full select-none object-cover"
                    />

                    <div className="absolute inset-0 bg-black/25" />
                </div>

                {/* TOP HUD */}
                <div className="relative z-20 flex items-start justify-between px-8 pt-5">

                    {/* PLAYER HUD */}
                    <div className="w-[300px]">
                        <div className="border border-stone-700/80 bg-[#100c0a]/90 px-4 py-3 shadow-[0_6px_25px_rgba(0,0,0,0.45)]">

                            <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase tracking-[0.3em] text-stone-500">
                                    Player
                                </span>

                                <div className="flex items-center gap-3">
                                    <span className="text-xl font-bold text-stone-100">
                                        {combat.player.hp}
                                        <span className="text-stone-500">
                                            /{combat.player.maxHp}
                                        </span>
                                    </span>

                                    {combat.player.block > 0 && (
                                        <span className="text-sm font-bold text-sky-300">
                                            🛡 {combat.player.block}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="mt-2 h-3 overflow-hidden border border-stone-800 bg-black/70">
                                <div
                                    className="h-full bg-red-800 transition-all duration-300"
                                    style={{
                                        width: `${playerHpPercent}%`,
                                    }}
                                />
                            </div>

                            <StatusEffects
                                effects={combat.player.statusEffects}
                            />

                        </div>
                    </div>

                    {/* TURN */}
                    <div className="pt-1 text-center">
                        <span className="text-[10px] uppercase tracking-[0.35em] text-stone-500">
                            Turn
                        </span>

                        <p className="mt-1 font-serif text-3xl font-bold text-stone-200">
                            {combat.turn}
                        </p>
                    </div>

                    {/* ENEMY HUD */}
                    <div className="w-[300px]">
                        <div className="border border-stone-700/80 bg-[#100c0a]/90 px-4 py-3 shadow-[0_6px_25px_rgba(0,0,0,0.45)]">

                            <div className="flex items-center justify-between">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-serif font-bold uppercase tracking-wider text-stone-200">
                                        {enemyDefinition?.name ??
                                            combat.enemy.definitionId}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    {combat.enemy.block > 0 && (
                                        <span className="text-sm font-bold text-sky-300">
                                            🛡 {combat.enemy.block}
                                        </span>
                                    )}

                                    <span className="text-xl font-bold text-stone-100">
                                        {combat.enemy.hp}
                                        <span className="text-stone-500">
                                            /{enemyMaxHp}
                                        </span>
                                    </span>
                                </div>
                            </div>

                            <div className="mt-2 h-3 overflow-hidden border border-stone-800 bg-black/70">
                                <div
                                    className="h-full bg-red-800 transition-all duration-300"
                                    style={{
                                        width: `${enemyHpPercent}%`,
                                    }}
                                />
                            </div>
                            
                        </div>
                            <StatusEffects
                               effects={combat.enemy.statusEffects} 
                            />
                    </div>
                </div>

                {/* BATTLEFIELD */}
                <section className="absolute inset-x-0 top-24 bottom-44 flex items-center justify-center">

                    <div className="relative h-full w-full">
                            {/* PLAYER */}
                        <div className="absolute bottom-0 left-[15%] z-10">
                            <CombatCharacter
                                image={playerImage}
                                side="player"
                            />
                        </div>
                            {/* ENEMY */}
                        <div className="absolute bottom-0 right-[13%] z-10">
                            {enemyImage && (
                                <CombatCharacter
                                    image={enemyImage}
                                    side="enemy"
                                />
                            )}
                        </div>

                        {/* ENEMY INTENT */}
                        <div className="absolute right-[35%] top-24">
                            <div className="rounded-xl border border-red-900/70 bg-black/50 px-6 py-4 text-center shadow-xl">
                                <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                                    Intent
                                </p>

                                <p className="mt-2 text-xl font-bold text-red-300">
                                    {combat.enemy.intent.type}
                                </p>

                                {"damage" in combat.enemy.intent && (
                                    <p className="mt-1 text-sm text-red-400">
                                        Damage{" "}
                                        {
                                            combat.enemy.intent
                                                .damage
                                        }
                                    </p>
                                )}

                                {"amount" in combat.enemy.intent && (
                                    <p className="mt-1 text-sm text-stone-400">
                                        Amount{" "}
                                        {
                                            combat.enemy.intent
                                                .amount
                                        }
                                    </p>
                                )}
                            </div>
                        </div>

                    </div>
                </section>

                {/* BOTTOM GAMEPLAY AREA */}
                <section className="absolute inset-x-0 bottom-0 z-20 px-8 pb-6">

                    <div className="flex items-end gap-4">

                        {/* DRAW PILE */}
                        <CardPile
                            label="Draw"
                            count={combat.player.drawPile.length}
                            variant="draw"
                        />
                        {/* END TURN */}
                        <button
                            type="button"
                            disabled={!isPlayerTurn}
                            onClick={onEndTurn}
                            className="mb-4 shrink-0 border border-orange-800 bg-[#24120d] px-8 py-4 font-serif text-sm font-bold uppercase tracking-[0.18em] text-orange-200 shadow-lg transition hover:bg-[#351912] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            End Turn
                        </button>

                        {/* HAND */}
                        <Hand
                            cards={combat.player.hand}
                            disabled={!isPlayerTurn}
                            onPlayCard={onPlayCard}
                        />
                        {/* DISCARD */}
                        <CardPile
                            label="Discard"
                            count={combat.player.discardPile.length}
                            variant="discard"
                        />
                        { /* EXILED */}
                        <CardPile
                            label="Exiled"
                            count={combat.player.exiledCards.length}
                            variant="exiled"
                        />

                        {/* ACTIONS */}
                        <div className="mb-4 flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full border border-stone-700 bg-[#15100d]">
                            <span className="text-2xl font-bold text-orange-300">
                                {combat.player.actions}
                            </span>

                            <span className="text-[9px] uppercase tracking-widest text-stone-500">
                                Actions
                            </span>
                        </div>

                    </div>
                </section>

            </div>
        </main>
    );
}
import Image from "next/image";

export interface GameIconProps {
  type:
    | "sanity"
    | "corruption"
    | "strength"
    | "agility"
    | "intelligence"
    | "artifact"
    | "flag"
    | "hollow"
    | "heretic"
    | "witness";
  size?: number;
  className?: string;
  noBlend?: boolean;
}

const DISPLAY_SCALE = 1.45;

const BLEND_SCREEN_TYPES = new Set([
  "strength",
  "agility",
  "intelligence",
  "artifact",
  "sanity",
  "corruption",
  "flag",
  "hollow",
  "heretic",
  "witness",
]);

const ICON_MAP: Record<GameIconProps["type"], string> = {
  sanity: "/ui/gothic-sanity-eye.png",
  corruption: "/ui/gothic-corruption-blood.png",
  strength: "/ui/gothic-strength.png",
  agility: "/ui/gothic-agility.png",
  intelligence: "/ui/gothic-intelligence.png",
  artifact: "/ui/gothic-cursed-rosary.png",
  flag: "/ui/gothic-skull-sigil.png",
  hollow: "/ui/gothic-ashen-mask.png",
  heretic: "/ui/gothic-corruption-cross.png",
  witness: "/ui/gothic-sanity-eye.png",
};

const GLOW_MAP: Record<GameIconProps["type"], string> = {
  sanity: "drop-shadow(0 0 8px rgba(216,208,200,0.6))",
  corruption: "drop-shadow(0 0 10px rgba(212,96,96,0.7))",
  strength: "drop-shadow(0 0 14px rgba(212,96,96,0.9))",
  agility: "drop-shadow(0 0 14px rgba(180,194,125,0.85))",
  intelligence: "drop-shadow(0 0 16px rgba(146,166,221,0.9))",
  artifact: "drop-shadow(0 0 14px rgba(212,160,80,0.8))",
  flag: "drop-shadow(0 0 8px rgba(125,168,125,0.5))",
  hollow: "drop-shadow(0 0 8px rgba(150,130,120,0.5))",
  heretic: "drop-shadow(0 0 10px rgba(212,96,96,0.6))",
  witness: "drop-shadow(0 0 10px rgba(216,208,200,0.5))",
};

export function GameIcon({
  type,
  size = 20,
  className,
  noBlend = false,
}: GameIconProps) {
  const displaySize = Math.round(size * DISPLAY_SCALE);

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${className ?? ""}`}
      style={{ width: displaySize, height: displaySize }}
    >
      <Image
        src={ICON_MAP[type]}
        alt=""
        fill
        sizes={`${displaySize}px`}
        draggable={false}
        className="h-full w-full object-contain"
        style={{
          filter: GLOW_MAP[type],
          mixBlendMode:
            !noBlend && BLEND_SCREEN_TYPES.has(type) ? "screen" : "normal",
        }}
      />
    </span>
  );
}

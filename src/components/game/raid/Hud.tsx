"use client";

import type { WorldStatus } from "@/components/game/raid/constants";
import { ControlsGuide } from "@/components/game/ui/ControlsGuide";
import { InteractionPrompt } from "@/components/game/ui/InteractionPrompt";

interface HudProps {
  characterName: string;
  status: WorldStatus;
  controlsHintVisible: boolean;
  onDismissControlsHint: () => void;
  onControlsHintExitStart: () => void;
}

export function Hud({
  characterName,
  status,
  controlsHintVisible,
  onDismissControlsHint,
  onControlsHintExitStart,
}: HudProps) {
  return (
    <>
      {status.loading && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 z-20 grid place-items-center bg-[#100d0e]"
        >
          <p className="font-cinzel text-base uppercase tracking-[0.18em] text-[#cbb8a9]">
            Загрузка странника…
          </p>
        </div>
      )}
      <header className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 px-5 py-5 sm:px-9 sm:py-7">
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-[#c16b58] sm:text-base">
            Тестовая зона · Рейд 01
          </div>
          <h1 className="font-cinzel mt-1 text-2xl uppercase tracking-[0.1em] text-[#eee2d8] sm:text-3xl">
            Пепельный тракт
          </h1>
          <p className="mt-1 text-base text-[#a99b91]">{characterName}</p>
        </div>
        <div className="border border-white/10 bg-black/35 px-4 py-3 text-right backdrop-blur-sm sm:px-5">
          <div className="text-sm uppercase tracking-[0.16em] text-[#a99b91] sm:text-base">
            Координаты
          </div>
          <div className="font-cinzel mt-1 tabular-nums text-base text-[#d3c4b8] sm:text-lg">
            {status.position}
          </div>
        </div>
      </header>

      <div className="absolute bottom-[8%] left-1/2 flex -translate-x-1/2 flex-col items-center">
        {status.error ? (
          <p
            role="alert"
            className="max-w-sm border border-[#8e3932]/60 bg-black/80 px-4 py-3 text-center text-base text-[#e2a59a]"
          >
            {status.error}
          </p>
        ) : (
          controlsHintVisible && (
            <ControlsGuide
              onContinue={onDismissControlsHint}
              onExitStart={onControlsHintExitStart}
            />
          )
        )}
      </div>
      {!controlsHintVisible && !status.error && (
        <>
          {status.nearbyInteractable && (
            <div className="pointer-events-none absolute bottom-[8%] left-1/2 -translate-x-1/2">
              <InteractionPrompt interactable={status.nearbyInteractable} />
            </div>
          )}
          <div className="pointer-events-none absolute bottom-5 left-5 text-sm uppercase tracking-[0.1em] text-[#a99b91] sm:bottom-7 sm:left-9 sm:text-base">
            WASD / стрелки — движение
            <span className="mx-2 text-white/20">·</span>
            Tab — инвентарь <span className="mx-2 text-white/20">·</span> Esc —
            пауза
          </div>
        </>
      )}
    </>
  );
}

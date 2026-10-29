"use client";

import type { ReactNode } from "react";

import { useHoldToContinue } from "@/components/game/ui/useHoldToContinue";

interface HoldToContinuePanelProps {
  children: ReactNode;
  onContinue: () => void;
  onExitStart?: () => void;
  continueLabel?: string;
  holdInstruction?: string;
}

export function HoldToContinuePanel({
  children,
  onContinue,
  onExitStart,
  continueLabel = "Дальше",
  holdInstruction = "Удерживайте, чтобы продолжить",
}: HoldToContinuePanelProps) {
  const { progress, exiting, handleTransitionEnd } = useHoldToContinue({
    onContinue,
    onExitStart,
  });

  return (
    <section
      role="region"
      aria-label="Игровая подсказка"
      aria-keyshortcuts="E"
      aria-hidden={exiting}
      onTransitionEnd={handleTransitionEnd}
      className={`relative w-[min(48rem,calc(100%_-_2rem))] overflow-hidden border-l-2 border-[#a84339]/80 bg-gradient-to-r from-[#0b090a]/75 via-[#0b090a]/55 to-[#0b090a]/20 px-5 py-5 text-left shadow-[0_12px_52px_rgba(0,0,0,0.28)] backdrop-blur-sm transition-[opacity,transform,filter] duration-[420ms] ease-in-out motion-reduce:duration-0 sm:px-8 sm:py-6 ${
        exiting
          ? "pointer-events-none translate-y-3 opacity-0 blur-[2px]"
          : "translate-y-0 opacity-100 blur-0"
      }`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-[#a84339]/90 transition-transform duration-75"
        style={{ transform: `scaleX(${progress})` }}
      />
      {children}
      <div className="relative mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
        <span className="text-sm uppercase tracking-[0.12em] text-[#c0b1a6] sm:text-base">
          {holdInstruction}
        </span>
        <span className="flex shrink-0 items-center gap-2 text-sm uppercase tracking-[0.12em] text-[#e2d5cb] sm:text-base">
          <kbd className="font-cinzel rounded-sm border border-white/35 px-3 py-1 text-base text-[#f3e8df] sm:text-lg">
            E
          </kbd>
          {continueLabel}
        </span>
      </div>
    </section>
  );
}

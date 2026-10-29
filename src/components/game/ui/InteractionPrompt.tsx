import type { InteractableDetails } from "@/components/game/raid/interactables";

interface InteractionPromptProps {
  interactable: InteractableDetails;
}

export function InteractionPrompt({
  interactable,
}: InteractionPromptProps) {
  return (
    <div
      role="status"
      className="flex w-[min(42rem,calc(100%_-_2rem))] flex-col items-start gap-4 border-l-2 border-[#a84339]/80 bg-gradient-to-r from-[#0b090a]/75 via-[#0b090a]/55 to-[#0b090a]/20 px-5 py-5 text-left text-[#eee2d8] shadow-[0_12px_52px_rgba(0,0,0,0.28)] backdrop-blur-sm sm:flex-row sm:items-center sm:px-8 sm:py-6"
    >
      <div className="w-full flex-1 sm:w-auto">
        <div className="font-cinzel break-words text-xl uppercase leading-snug tracking-[0.08em] text-[#f3e8df] sm:text-2xl">
          {interactable.title}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3 border-t border-white/10 pt-3 text-base uppercase tracking-[0.12em] text-[#e2d5cb] sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
        <kbd className="font-cinzel rounded-sm border border-white/35 px-3 py-1 text-lg text-[#f3e8df]">
          E
        </kbd>
        <span className="text-[#d17b6a]">{interactable.actionLabel}</span>
      </div>
    </div>
  );
}

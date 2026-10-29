import type { InteractableDetails } from "@/components/game/raid/interactables";

interface InteractionDetailsPanelProps {
  interactable: InteractableDetails;
}

export function InteractionDetailsPanel({
  interactable,
}: InteractionDetailsPanelProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/35 px-4 py-8 backdrop-blur-[2px]">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="interaction-title"
        className="w-full max-w-2xl border-l-2 border-[#a84339] bg-[#0b090a]/90 px-6 py-7 shadow-[0_12px_52px_rgba(0,0,0,0.4)] sm:px-9 sm:py-8"
      >
        <div className="text-sm uppercase tracking-[0.2em] text-[#d17b6a]">
          {interactable.actionLabel}
        </div>
        <h2
          id="interaction-title"
          className="font-cinzel mt-2 text-3xl uppercase tracking-[0.08em] text-[#f3e8df] sm:text-4xl"
        >
          {interactable.title}
        </h2>
        <p className="mt-5 text-base leading-relaxed text-[#d1c4ba] sm:text-lg">
          {interactable.description}
        </p>
        <p className="mt-7 border-t border-white/10 pt-4 text-sm uppercase tracking-[0.12em] text-[#c0b1a6] sm:text-base">
          Нажмите E, чтобы вернуться
        </p>
      </section>
    </div>
  );
}

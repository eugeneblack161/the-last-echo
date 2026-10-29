import { HoldToContinuePanel } from "@/components/game/ui/HoldToContinuePanel";

interface ControlsGuideProps {
  onContinue: () => void;
  onExitStart: () => void;
}

export function ControlsGuide({ onContinue, onExitStart }: ControlsGuideProps) {
  return (
    <HoldToContinuePanel onContinue={onContinue} onExitStart={onExitStart}>
      <div className="relative">
        <div className="text-sm uppercase tracking-[0.2em] text-[#d17b6a] sm:text-base">
          Управление странником
        </div>
        <h2 className="font-cinzel mt-1 text-3xl uppercase tracking-[0.08em] text-[#f3e8df] sm:text-4xl">
          Осмотритесь вокруг
        </h2>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="flex min-h-16 items-center gap-4 border-y border-white/10 bg-white/[0.03] px-4 py-3">
            <span className="font-cinzel min-w-24 text-center text-xl tracking-[0.06em] text-[#f3e8df] sm:text-2xl">
              WASD
              <span className="mt-1 block text-sm tracking-normal text-[#c0b1a6]">
                или стрелки
              </span>
            </span>
            <span className="h-10 w-px bg-white/10" />
            <span className="text-base uppercase tracking-[0.1em] text-[#f0e5dc] sm:text-lg">
              Движение
            </span>
          </div>

          <div className="flex min-h-16 items-center gap-4 border-y border-white/10 bg-white/[0.03] px-4 py-3">
            <span className="font-cinzel min-w-24 text-center text-xl tracking-[0.06em] text-[#f3e8df] sm:text-2xl">
              SHIFT
            </span>
            <span className="h-10 w-px bg-white/10" />
            <span className="text-base uppercase tracking-[0.1em] text-[#f0e5dc] sm:text-lg">
              Бег
            </span>
          </div>
        </div>
      </div>
    </HoldToContinuePanel>
  );
}

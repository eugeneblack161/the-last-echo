"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { GothicScreen } from "@/components/ui/GothicScreen";
import { locations } from "@/lib/data";
import { t } from "@/lib/i18n";
import { useGameStore, useGameStoreHydration } from "@/store/gameStore";

function ChoiceChevron() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="mt-1 h-5 w-5 shrink-0 text-[#75685f] transition-transform group-hover:translate-x-0.5 group-hover:text-[#d46060]"
    >
      <path
        d="M7 4l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export default function GamePage() {
  const router = useRouter();
  const activeSlotId = useGameStore((state) => state.activeSlotId);
  const save = useGameStore((state) =>
    state.activeSlotId === null ? null : state.saves[state.activeSlotId],
  );
  const setCurrentLocationId = useGameStore(
    (state) => state.setCurrentLocationId,
  );
  const hydrationStatus = useGameStoreHydration((state) => state.status);
  const locationId = save?.currentLocationId;
  const location = locationId ? locations[locationId] : null;

  useEffect(() => {
    if (
      hydrationStatus === "ready" &&
      (activeSlotId === null || !save)
    ) {
      router.replace("/");
    }
  }, [activeSlotId, hydrationStatus, router, save]);

  if (hydrationStatus === "loading") {
    return (
      <GothicScreen>
        <div
          aria-busy="true"
          className="flex h-full items-center justify-center text-[#9d8d82]"
        >
          Загрузка сохранения...
        </div>
      </GothicScreen>
    );
  }

  if (!save || !location) return null;

  const origin = t.origins.find((item) => item.value === save.origin);

  return (
    <GothicScreen image={location.image} imageClassName="opacity-35">
      <div className="flex h-full flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto chronicle-scrollbar px-5 pt-10 sm:px-10">
          <div className="mx-auto max-w-3xl border-2 border-[#2b2320] bg-[#0d0909]/95 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
            <div className="border-b-2 border-[#241919] bg-[#120d0d] px-6 py-4">
              <div className="text-[12px] uppercase tracking-[0.35em] text-[#75685f]">
                {save.characterName} · {origin?.title}
              </div>
              <h1 className="font-cinzel mt-1 text-2xl uppercase tracking-[0.08em] text-[#ece2d9] sm:text-[1.65rem]">
                {location.name}
              </h1>
            </div>
            <p className="px-6 py-5 text-[18px] leading-relaxed text-[#cfc2b8]">
              {location.description}
            </p>
          </div>
        </div>

        <div className="max-h-[min(48vh,440px)] shrink-0 overflow-y-auto chronicle-scrollbar border-t border-[#241919]/90 bg-gradient-to-t from-black/90 via-black/70 to-transparent px-5 py-4 sm:px-10">
          <div className="mx-auto max-w-3xl space-y-2">
            {location.actions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() =>
                  action.targetLocationId &&
                  setCurrentLocationId(action.targetLocationId)
                }
                className="group relative w-full border border-[#2b2320] bg-[#0c0909]/95 text-left transition-all duration-300 hover:border-[#8e1f1f]/70 hover:bg-[#140d0d] hover:shadow-[0_0_24px_rgba(92,31,31,0.12)]"
              >
                <div className="absolute inset-y-0 left-0 w-[2px] bg-[#8e1f1f] opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative flex items-start gap-3 px-4 py-3.5 sm:px-5 sm:py-4">
                  <div className="font-cinzel min-w-0 flex-1 text-[15px] uppercase leading-snug tracking-[0.08em] text-[#e7ded7] sm:text-[17px]">
                    {action.label}
                  </div>
                  <ChoiceChevron />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </GothicScreen>
  );
}

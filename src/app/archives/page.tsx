"use client";

import { useRouter } from "next/navigation";

import { locations } from "@/lib/data";
import { GothicScreen } from "@/components/ui/GothicScreen";
import { t } from "@/lib/i18n";
import {
  SAVE_SLOT_IDS,
  useGameStore,
  useGameStoreHydration,
} from "@/store/gameStore";

export default function ArchivesPage() {
  const { archives: a } = t.ui;
  const router = useRouter();
  const saves = useGameStore((state) => state.saves);
  const loadGame = useGameStore((state) => state.loadGame);
  const setPendingSlotId = useGameStore((state) => state.setPendingSlotId);
  const hydrationStatus = useGameStoreHydration((state) => state.status);

  return (
    <GothicScreen>
      <div className="flex h-full flex-col overflow-y-auto px-5 py-8 sm:px-8 sm:py-10">
        <header className="mx-auto w-full max-w-3xl">
          <div className="text-[12px] uppercase tracking-[0.15em] text-[#85776a]">
            {a.eyebrow}
          </div>
          <h1 className="font-cinzel mt-1 text-4xl uppercase tracking-[0.1em] text-[#efe5dc] sm:text-5xl">
            {a.title}
          </h1>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-[#9d8d82]">
            {a.description}
          </p>
          {hydrationStatus === "loading" && (
            <p aria-live="polite" className="mt-2 text-[12px] text-[#75685f]">
              Загрузка сохранений...
            </p>
          )}
        </header>

        <div className="mx-auto mt-8 w-full max-w-3xl space-y-3">
          {SAVE_SLOT_IDS.map((slotId) => {
            const save = saves[slotId];
            const origin = save
              ? t.origins.find((item) => item.value === save.origin)
              : null;

            return (
              <article
                key={slotId}
                className="border border-[#2b2320] bg-[#0d0909]/88 backdrop-blur-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-5">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.15em] text-[#75685f]">
                      {a.slot} {slotId + 1}
                    </div>
                    <h2 className="font-cinzel mt-1 text-2xl uppercase tracking-[0.08em] text-[#efe5dc]">
                      {save?.characterName ?? a.emptyVessel}
                    </h2>
                    <p className="mt-2 text-[13px] text-[#85776a]">
                      {save
                        ? `${origin?.title ?? a.unnamedVessel} · ${locations[save.currentLocationId].name}`
                        : a.noDescent}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {save && (
                      <button
                        type="button"
                        disabled={hydrationStatus !== "ready"}
                        onClick={() => {
                          loadGame(slotId);
                          router.push("/raid");
                        }}
                        className="border border-[#5c1f1f] bg-[#160909] px-5 py-2 text-[11px] uppercase tracking-[0.18em] text-[#d46060] transition hover:bg-[#220d0d] disabled:opacity-40"
                      >
                        {a.continueDescent}
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={hydrationStatus !== "ready"}
                      onClick={() => {
                        if (save && !window.confirm(a.overwriteConfirm)) return;
                        setPendingSlotId(slotId);
                        router.push("/editor");
                      }}
                      className="border border-[#2b2320] px-5 py-2 text-[11px] uppercase tracking-[0.18em] text-[#9d8d82] transition hover:border-[#5c1f1f] hover:text-[#d46060] disabled:opacity-40"
                    >
                      {save ? a.overwriteDescent : a.newDescent}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mx-auto mt-8 w-full max-w-3xl text-center">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="border border-[#2b2320] px-5 py-2 text-[11px] uppercase tracking-[0.18em] text-[#75685f] transition hover:border-[#5c1f1f] hover:text-[#d46060]"
          >
            {a.return}
          </button>
        </div>
      </div>
    </GothicScreen>
  );
}

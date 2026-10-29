"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { GameIcon } from "@/components/game/ui/GameIcon";
import { GothicScreen } from "@/components/ui/GothicScreen";
import { locations } from "@/lib/data";
import { t } from "@/lib/i18n";
import {
  SAVE_SLOT_IDS,
  useGameStore,
  useGameStoreHydration,
} from "@/store/gameStore";
import type { GameSave, SaveSlotId } from "@/types/game";

export default function HomePage() {
  const { home } = t.ui;
  const router = useRouter();
  const saves = useGameStore((state) => state.saves);
  const loadGame = useGameStore((state) => state.loadGame);
  const setPendingSlotId = useGameStore((state) => state.setPendingSlotId);
  const hydrationStatus = useGameStoreHydration((state) => state.status);
  const latestSave = SAVE_SLOT_IDS.reduce<{
    slotId: SaveSlotId;
    save: GameSave;
  } | null>((latest, slotId) => {
    const save = saves[slotId];
    if (!save) return latest;
    if (!latest || save.updatedAt > latest.save.updatedAt) {
      return { slotId, save };
    }
    return latest;
  }, null);
  const latestOrigin = latestSave
    ? t.origins.find((origin) => origin.value === latestSave.save.origin)
    : null;

  return (
    <GothicScreen imageClassName="opacity-55">
      <div className="flex h-full flex-col">
        <header className="px-6 pt-10 sm:px-10 sm:pt-14">
          <div className="text-[12px] uppercase tracking-[0.2em] text-[#85776a]">
            {home.footer1}
          </div>
          <h1 className="font-cinzel mt-2 text-5xl uppercase tracking-[0.12em] text-[#efe5dc] sm:text-7xl">
            {home.titleLine1}
          </h1>
          <h1 className="font-cinzel text-6xl uppercase tracking-[0.1em] text-[#8e1f1f] sm:text-8xl">
            {home.titleLine2}
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-8 text-[#9d8d82]">
            {home.tagline1} {home.tagline1b}
            <br />
            {home.tagline2} {home.tagline2b}
          </p>
        </header>

        <div className="mt-auto px-6 pb-10 sm:px-10 sm:pb-14">
          <div className="mx-auto grid max-w-4xl gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-3">
              <Link
                href="/editor"
                aria-disabled={hydrationStatus !== "ready"}
                onClick={(event) => {
                  if (hydrationStatus !== "ready") {
                    event.preventDefault();
                    return;
                  }
                  setPendingSlotId(null);
                }}
                className="group flex items-center gap-4 border border-[#3b2a2a] bg-[#0d0909]/88 px-5 py-5 no-underline transition hover:border-[#8e1f1f] hover:bg-[#160909]"
              >
                <GameIcon type="corruption" size={40} />
                <div>
                  <div className="font-cinzel text-2xl uppercase tracking-[0.12em] text-[#d46060] group-hover:text-[#ff7b7b]">
                    {home.begin}
                  </div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[#75685f]">
                    {home.beginSubNew}
                  </div>
                </div>
              </Link>

              <Link
                href="/archives"
                className="group flex items-center gap-4 border border-[#2b2320] bg-[#0d0909]/70 px-5 py-4 no-underline transition hover:border-[#5c1f1f] hover:bg-[#120909]"
              >
                <GameIcon type="flag" size={36} />
                <div>
                  <div className="font-cinzel text-xl uppercase tracking-[0.12em] text-[#d8c9be]">
                    {home.archives}
                  </div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.15em] text-[#75685f]">
                    {home.archivesSub}
                  </div>
                </div>
              </Link>
            </div>

            <div className="border border-[#3b2a2a]/80 bg-[#0d0909]/85 p-5 backdrop-blur-sm">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[#75685f]">
                {home.slotPreview}
              </div>
              {latestSave ? (
                <>
                  <p className="mt-4 font-cinzel text-xl text-[#d8c9be]">
                    {latestSave.save.characterName}
                  </p>
                  <p className="mt-1 text-[13px] text-[#85776a]">
                    {latestOrigin?.title} ·{" "}
                    {locations[latestSave.save.currentLocationId].name}
                  </p>
                  <button
                    type="button"
                    disabled={hydrationStatus !== "ready"}
                    onClick={() => {
                      loadGame(latestSave.slotId);
                      router.push("/raid");
                    }}
                    className="mt-4 border border-[#5c1f1f] bg-[#160909] px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-[#d46060] transition hover:bg-[#220d0d] disabled:opacity-40"
                  >
                    {home.continueSlot}
                  </button>
                </>
              ) : (
                <p className="mt-4 text-[14px] leading-relaxed text-[#85776a]">
                  {home.slotEmpty}
                </p>
              )}
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-4xl text-center">
            <p className="text-[13px] text-[#6f6259]">
              {home.footer1} {home.footer2}
            </p>
            <div className="mt-3 text-[10px] uppercase tracking-[0.35em] text-[#4c433d]">
              {home.version}
            </div>
          </div>
        </div>
      </div>
    </GothicScreen>
  );
}

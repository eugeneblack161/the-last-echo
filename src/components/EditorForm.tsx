"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { GameIcon } from "@/components/game/ui/GameIcon";
import { GothicScreen } from "@/components/ui/GothicScreen";
import { t } from "@/lib/i18n";
import {
  getFirstAvailableSlot,
  useGameStore,
  useGameStoreHydration,
} from "@/store/gameStore";
import type { Origin } from "@/types/game";

const ORIGIN_ICON: Record<Origin, "hollow" | "heretic" | "witness"> = {
  hollow: "hollow",
  heretic: "heretic",
  witness: "witness",
};

const ROOM_IMAGE: Record<Origin, string> = {
  heretic: "/rooms/heretic-chamber.png",
  hollow: "/rooms/hollow-chamber.png",
  witness: "/rooms/witness-chamber.png",
};

export function EditorForm() {
  const { editor: e } = t.ui;
  const origins = t.origins;
  const router = useRouter();
  const saves = useGameStore((state) => state.saves);
  const pendingSlotId = useGameStore((state) => state.pendingSlotId);
  const setPendingSlotId = useGameStore((state) => state.setPendingSlotId);
  const startNewGame = useGameStore((state) => state.startNewGame);
  const hydrationStatus = useGameStoreHydration((state) => state.status);
  const [name, setName] = useState("");
  const [index, setIndex] = useState(0);

  const selected = origins[index];
  const slotId = pendingSlotId ?? getFirstAvailableSlot(saves);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !selected || slotId === null) return;
    startNewGame(name.trim(), selected.value, slotId);
    router.push("/raid");
  };

  if (!selected) return null;

  return (
    <GothicScreen image={ROOM_IMAGE[selected.value]} imageClassName="opacity-70">
      <header className="absolute inset-x-0 top-0 z-30 bg-gradient-to-b from-black/90 to-transparent px-5 pb-10 pt-6 sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[12px] uppercase tracking-[0.15em] text-[#85776a]">
              {e.chooseOrigin}
            </div>
            <h1 className="font-cinzel mt-1 text-2xl uppercase tracking-[0.1em] text-[#efe5dc] sm:text-4xl">
              {e.title}
            </h1>
            <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-[#9d8d82] sm:text-[14px]">
              {e.hotspotHint}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setPendingSlotId(null);
              router.push("/");
            }}
            className="shrink-0 border border-[#2b2320] px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-[#75685f] transition hover:border-[#5c1f1f] hover:text-[#d46060] sm:px-4 sm:text-[11px]"
          >
            {e.back}
          </button>
        </div>
      </header>

      <div className="flex h-full flex-col justify-end overflow-y-auto pb-64 pt-28 sm:pb-72">
        <div className="mx-auto w-full max-w-2xl px-5 sm:px-8">
          <div className="border border-[#3b2a2a]/90 bg-[#0d0909]/88 shadow-[0_0_40px_rgba(0,0,0,0.55)] backdrop-blur-sm">
            <div className="flex items-start gap-4 border-b border-[#241919] bg-[#120d0d]/95 px-5 py-4">
              <GameIcon type={ORIGIN_ICON[selected.value]} size={44} />
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-[0.2em] text-[#75685f]">
                  {e.origin}
                </div>
                <h2 className="font-cinzel mt-1 text-2xl uppercase tracking-[0.1em] text-[#efe5dc] sm:text-3xl">
                  {selected.title}
                </h2>
                <p className="mt-1 text-[14px] text-[#b8a99e]">{selected.subtitle}</p>
              </div>
            </div>

            <div className="space-y-5 px-5 py-5">
              <p className="text-[15px] leading-relaxed text-[#cfc2b8]">
                {selected.description}
              </p>

              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    label: e.stats.str,
                    value: selected.stats.strength,
                    icon: "strength" as const,
                  },
                  {
                    label: e.stats.agi,
                    value: selected.stats.agility,
                    icon: "agility" as const,
                  },
                  {
                    label: e.stats.int,
                    value: selected.stats.intelligence,
                    icon: "intelligence" as const,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex flex-col items-center border border-[#2b2320] bg-black/35 px-2 py-3 text-center"
                  >
                    <GameIcon type={stat.icon} size={32} />
                    <div className="mt-2 text-[10px] uppercase tracking-[0.15em] text-[#75685f]">
                      {stat.label}
                    </div>
                    <div className="font-cinzel mt-1 text-xl text-[#d8c9be]">
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-40 border-t border-[#2b2320]/90 bg-gradient-to-t from-black via-black/95 to-black/70 px-3 py-3 sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-4xl flex-col gap-3">
          <div
            role="group"
            aria-label={e.chooseOrigin}
            className="flex items-stretch justify-center gap-2 sm:gap-3"
          >
            {origins.map((origin, i) => {
              const active = i === index;

              return (
                <button
                  key={origin.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setIndex(i)}
                  className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1.5 border px-2 py-2.5 transition sm:gap-2 sm:px-3 sm:py-3 ${
                    active
                      ? "border-[#8e1f1f] bg-[#160909] text-[#d46060]"
                      : "border-[#2b2320] bg-[#0d0909]/80 text-[#9d8d82] hover:border-[#5c1f1f] hover:text-[#d8c9be]"
                  }`}
                >
                  <GameIcon type={ORIGIN_ICON[origin.value]} size={36} />
                  <span className="text-[10px] uppercase tracking-[0.1em] sm:text-[11px]">
                    {origin.title}
                  </span>
                </button>
              );
            })}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 border border-[#2b2320] bg-[#0d0909]/90 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4"
          >
            <div className="min-w-0 flex-1">
              <label
                htmlFor="character-name"
                className="block text-[10px] uppercase tracking-[0.15em] text-[#75685f]"
              >
                {e.vesselName}
              </label>
              <input
                id="character-name"
                name="characterName"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={e.namePlaceholder}
                maxLength={24}
                autoComplete="nickname"
                className="font-cinzel mt-1 w-full border-0 border-b border-[#3b2a2a] bg-transparent py-2 text-xl uppercase tracking-[0.1em] text-[#efe5dc] placeholder:text-[#5e544c] focus:border-[#8e1f1f]"
              />
            </div>

            <button
              type="submit"
              disabled={
                !name.trim() ||
                slotId === null ||
                hydrationStatus !== "ready"
              }
              className="font-cinzel shrink-0 border-2 border-[#5c1f1f] bg-[#160909] px-8 py-3 text-sm uppercase tracking-[0.15em] text-[#d46060] transition hover:bg-[#220d0d] disabled:opacity-40"
            >
              {e.beginDescent}
            </button>
            {slotId === null && (
              <button
                type="button"
                onClick={() => router.push("/archives")}
                className="border border-[#5c1f1f] px-4 py-2 text-[10px] uppercase tracking-[0.12em] text-[#d46060]"
              >
                {e.openArchives}
              </button>
            )}
          </form>
        </div>
      </div>
    </GothicScreen>
  );
}

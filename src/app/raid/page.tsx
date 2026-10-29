"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useGameStore, useGameStoreHydration } from "@/store/gameStore";

const RaidWorld = dynamic(
  () =>
    import("@/components/game/RaidWorld").then((module) => module.RaidWorld),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-[#100d0e] text-sm uppercase tracking-[0.2em] text-[#9d8d82]">
        Подготовка рейда...
      </div>
    ),
  },
);

export default function RaidPage() {
  const router = useRouter();
  const activeSlotId = useGameStore((state) => state.activeSlotId);
  const save = useGameStore((state) =>
    state.activeSlotId === null ? null : state.saves[state.activeSlotId],
  );
  const hydrationStatus = useGameStoreHydration((state) => state.status);

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
      <main className="flex h-screen items-center justify-center bg-[#100d0e] text-sm uppercase tracking-[0.2em] text-[#9d8d82]">
        Загрузка сохранения...
      </main>
    );
  }

  if (hydrationStatus === "error") {
    return (
      <main className="flex h-screen flex-col items-center justify-center gap-5 bg-[#100d0e] px-5 text-center">
        <p role="alert" className="text-[#e2a59a]">
          Не удалось загрузить сохранение. Проверьте данные в браузере и
          попробуйте снова.
        </p>
        <button
          type="button"
          onClick={() => router.replace("/")}
          className="border border-[#5c1f1f] px-4 py-2 text-xs uppercase tracking-[0.16em] text-[#d46060] hover:bg-[#220d0d]"
        >
          Вернуться в меню
        </button>
      </main>
    );
  }

  if (!save) return null;

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#100d0e]">
      <RaidWorld
        characterName={save.characterName}
        inventory={save.inventory}
        onExitToMenu={() => router.replace("/")}
      />
    </main>
  );
}

"use client";

import { useEffect, type ReactNode } from "react";

import {
  useGameStore,
  useGameStoreHydration,
} from "@/store/gameStore";

interface GameStoreHydrationProps {
  children: ReactNode;
}

export function GameStoreHydration({
  children,
}: GameStoreHydrationProps) {
  const status = useGameStoreHydration((state) => state.status);
  const setStatus = useGameStoreHydration((state) => state.setStatus);

  useEffect(() => {
    void useGameStore.persist.rehydrate();
  }, []);

  if (status === "error") {
    return (
      <>
        {children}
        <div
          role="alert"
          className="fixed inset-x-0 top-0 z-50 flex flex-wrap items-center justify-center gap-3 border-b border-[#5c1f1f] bg-black/95 px-4 py-3 text-center text-sm text-[#cfc2b8]"
        >
          <p>Не удалось загрузить сохранения. Проверьте доступ к локальному хранилищу.</p>
          <button
            type="button"
            onClick={() => {
              setStatus("loading");
              void useGameStore.persist.rehydrate();
            }}
            className="border border-[#5c1f1f] px-4 py-1 text-[#d46060]"
          >
            Повторить
          </button>
        </div>
      </>
    );
  }

  return children;
}

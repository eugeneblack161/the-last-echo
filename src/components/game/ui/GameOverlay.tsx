"use client";

import { useEffect, useRef } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";

import type { Artifact } from "@/types/game";

export type GameOverlayView = "inventory" | "pause" | "settings" | null;

interface GameOverlayProps {
  view: GameOverlayView;
  inventory: Artifact[];
  characterName: string;
  onClose: () => void;
  onOpenSettings: () => void;
  onBackToPause: () => void;
  onExitToMenu: () => void;
}

export function GameOverlay({
  view,
  inventory,
  characterName,
  onClose,
  onOpenSettings,
  onBackToPause,
  onExitToMenu,
}: GameOverlayProps) {
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (view) {
      dialogRef.current
        ?.querySelector<HTMLButtonElement>("[data-game-menu-item]")
        ?.focus();
    }
  }, [view]);

  if (!view) return null;

  const title =
    view === "inventory"
      ? "Инвентарь"
      : view === "settings"
        ? "Настройки"
        : "Пауза";

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        "[data-game-menu-item]",
      ),
    );
    if (items.length === 0) return;

    if (event.key === "Tab" && view !== "inventory") {
      event.preventDefault();
      const currentIndex = items.findIndex(
        (item) => item === document.activeElement,
      );
      const direction = event.shiftKey ? -1 : 1;
      const nextIndex =
        currentIndex < 0
          ? 0
          : (currentIndex + direction + items.length) % items.length;
      items[nextIndex]?.focus();
      return;
    }

    if (
      event.key === "ArrowDown" ||
      event.key === "ArrowUp" ||
      event.code === "KeyS" ||
      event.code === "KeyW"
    ) {
      event.preventDefault();
      const currentIndex = items.findIndex(
        (item) => item === document.activeElement,
      );
      const direction =
        event.key === "ArrowDown" || event.code === "KeyS" ? 1 : -1;
      const nextIndex =
        currentIndex < 0
          ? 0
          : (currentIndex + direction + items.length) % items.length;
      items[nextIndex]?.focus();
    }
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const runFromKeyboard = (
    event: ReactMouseEvent<HTMLButtonElement>,
    action: () => void,
  ) => {
    event.stopPropagation();
    if (event.detail === 0) action();
  };

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center bg-black/65 px-4 py-8 backdrop-blur-sm"
      onPointerDown={handlePointerDown}
      onClick={(event) => event.stopPropagation()}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-overlay-title"
        onKeyDown={handleKeyDown}
        className="max-h-[calc(100%_-_2rem)] w-full max-w-2xl overflow-y-auto border border-[#4a3430] bg-[#0d0909]/95 p-6 shadow-[0_0_80px_rgba(0,0,0,0.65)] sm:p-9"
      >
        <div className="text-sm uppercase tracking-[0.24em] text-[#c16b58]">
          {characterName}
        </div>
        <h2
          id="game-overlay-title"
          className="font-cinzel mt-2 text-4xl uppercase tracking-[0.1em] text-[#eee2d8]"
        >
          {title}
        </h2>

        {view === "inventory" && (
          <div className="mt-6">
            {inventory.length === 0 ? (
              <p className="border-y border-white/10 py-6 text-base leading-relaxed text-[#a99b91]">
                Инвентарь пока пуст.
              </p>
            ) : (
              <ul className="max-h-[45vh] space-y-2 overflow-y-auto">
                {inventory.map((artifact) => (
                  <li
                    key={artifact.id}
                    className="border-y border-white/10 bg-white/[0.03] px-4 py-3"
                  >
                    <h3 className="text-base uppercase tracking-[0.1em] text-[#eee2d8]">
                      {artifact.name}
                    </h3>
                    <p className="mt-1 text-base leading-relaxed text-[#a99b91]">
                      {artifact.description}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <OverlayButton
              onClick={(event) => runFromKeyboard(event, onClose)}
            >
              Закрыть инвентарь
            </OverlayButton>
            <KeyboardHint>Tab или Esc — закрыть</KeyboardHint>
          </div>
        )}

        {view === "pause" && (
          <div className="mt-6 flex flex-col gap-2">
            <OverlayButton
              onClick={(event) => runFromKeyboard(event, onClose)}
            >
              Продолжить
            </OverlayButton>
            <OverlayButton
              onClick={(event) => runFromKeyboard(event, onOpenSettings)}
            >
              Настройки
            </OverlayButton>
            <OverlayButton
              onClick={(event) => runFromKeyboard(event, onExitToMenu)}
            >
              Выйти в главное меню
            </OverlayButton>
            <KeyboardHint>Esc — продолжить · W/S или ↑/↓ — выбор · Enter — открыть</KeyboardHint>
          </div>
        )}

        {view === "settings" && (
          <div className="mt-6">
            <h3 className="text-sm uppercase tracking-[0.18em] text-[#c16b58]">
              Управление
            </h3>
            <dl className="mt-3 divide-y divide-white/10 border-y border-white/10">
              <SettingRow keys="WASD / ↑ ↓ ← →" action="Движение" />
              <SettingRow keys="Shift" action="Бег" />
              <SettingRow keys="Tab" action="Инвентарь" />
              <SettingRow keys="Esc" action="Пауза / назад" />
            </dl>
            <p className="mt-4 text-sm leading-relaxed text-[#a99b91]">
              Настройка клавиш и звука появится позже.
            </p>
            <OverlayButton
              onClick={(event) => runFromKeyboard(event, onBackToPause)}
            >
              Назад
            </OverlayButton>
            <KeyboardHint>Esc — назад · W/S или ↑/↓ — выбор</KeyboardHint>
          </div>
        )}
      </section>
    </div>
  );
}

interface OverlayButtonProps {
  children: string;
  onClick: (event: ReactMouseEvent<HTMLButtonElement>) => void;
}

function OverlayButton({ children, onClick }: OverlayButtonProps) {
  return (
    <button
      type="button"
      data-game-menu-item
      onClick={onClick}
      className="w-full border border-[#3b2a2a] bg-[#120d0d] px-4 py-4 text-left text-base uppercase tracking-[0.1em] text-[#d8c9be] transition focus-visible:border-[#a84339] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#a84339] hover:border-[#5c1f1f]"
    >
      {children}
    </button>
  );
}

function KeyboardHint({ children }: { children: string }) {
  return (
    <p className="mt-4 text-center text-sm uppercase tracking-[0.1em] text-[#a99b91]">
      {children}
    </p>
  );
}

function SettingRow({ keys, action }: { keys: string; action: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 text-base">
      <dt className="text-[#a99b91]">{action}</dt>
      <dd className="font-cinzel text-right text-[#eee2d8]">{keys}</dd>
    </div>
  );
}

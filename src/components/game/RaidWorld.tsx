"use client";

import { useEffect, useRef, useState } from "react";

import { Hud } from "@/components/game/raid/Hud";
import {
  GameOverlay,
  type GameOverlayView,
} from "@/components/game/ui/GameOverlay";
import { InteractionDetailsPanel } from "@/components/game/ui/InteractionDetailsPanel";
import { useRuntime } from "@/components/game/raid/useRuntime";
import type { InteractableDetails } from "@/components/game/raid/interactables";
import type { Artifact } from "@/types/game";

const GAME_UI_SCALE = 1.4;

interface RaidWorldProps {
  characterName: string;
  inventory: Artifact[];
  onExitToMenu: () => void;
}

export function RaidWorld({
  characterName,
  inventory,
  onExitToMenu,
}: RaidWorldProps) {
  const [controlsHintVisible, setControlsHintVisible] = useState(true);
  const [controlsInputLocked, setControlsInputLocked] = useState(true);
  const [overlayView, setOverlayView] = useState<GameOverlayView>(null);
  const [activeInteractable, setActiveInteractable] =
    useState<InteractableDetails | null>(null);
  const lockOnEscapeKeyUpRef = useRef(false);
  const { hostRef, status, requestLookLock, releaseLookLock } = useRuntime(
    !controlsInputLocked && overlayView === null && activeInteractable === null,
    controlsInputLocked || overlayView !== null || activeInteractable !== null,
  );

  const exitToMenu = () => {
    releaseLookLock();
    setOverlayView(null);
    onExitToMenu();
  };

  const resumeGame = () => {
    setOverlayView(null);
    requestLookLock();
  };

  useEffect(() => {
    if (overlayView !== null || activeInteractable !== null) {
      releaseLookLock();
    }
  }, [activeInteractable, overlayView, releaseLookLock]);

  useEffect(() => {
    const handleMenuKey = (event: KeyboardEvent) => {
      if (status.error || event.repeat) return;

      if (activeInteractable) {
        if (event.code === "KeyE" || event.code === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          setActiveInteractable(null);
          if (event.code === "Escape") lockOnEscapeKeyUpRef.current = true;
          else requestLookLock();
        }
        return;
      }

      if (controlsHintVisible) return;

      if (event.code === "KeyE" && overlayView === null) {
        if (!status.nearbyInteractable) return;
        event.preventDefault();
        event.stopPropagation();
        setActiveInteractable(status.nearbyInteractable);
        releaseLookLock();
        return;
      }

      if (event.code === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        if (overlayView === "settings") {
          setOverlayView("pause");
          return;
        }
        if (overlayView === null) {
          lockOnEscapeKeyUpRef.current = false;
          setOverlayView("pause");
          releaseLookLock();
          return;
        }
        lockOnEscapeKeyUpRef.current = true;
        setOverlayView(null);
        return;
      }

      if (
        event.code === "Tab" &&
        (overlayView === null || overlayView === "inventory")
      ) {
        event.preventDefault();
        if (overlayView === "inventory") {
          setOverlayView(null);
          requestLookLock();
          return;
        }
        setOverlayView("inventory");
        releaseLookLock();
      }
    };

    const handleMenuKeyUp = (event: KeyboardEvent) => {
      if (event.code !== "Escape" || !lockOnEscapeKeyUpRef.current) return;
      lockOnEscapeKeyUpRef.current = false;
      requestLookLock();
    };

    window.addEventListener("keydown", handleMenuKey);
    window.addEventListener("keyup", handleMenuKeyUp);
    return () => {
      window.removeEventListener("keydown", handleMenuKey);
      window.removeEventListener("keyup", handleMenuKeyUp);
    };
  }, [
    activeInteractable,
    controlsHintVisible,
    overlayView,
    releaseLookLock,
    requestLookLock,
    status.error,
    status.nearbyInteractable,
  ]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#100d0e]">
      <div ref={hostRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(8,6,7,0.24),transparent_28%,transparent_72%,rgba(8,6,7,0.2))]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(8,6,7,0.24),transparent_22%,transparent_78%,rgba(8,6,7,0.18))]" />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_90px_rgba(0,0,0,0.24)]" />
      <div
        className="pointer-events-none absolute left-0 top-0 z-10"
        style={{
          width: `${100 / GAME_UI_SCALE}%`,
          height: `${100 / GAME_UI_SCALE}%`,
          transform: `scale(${GAME_UI_SCALE})`,
          transformOrigin: "top left",
        }}
      >
        <Hud
          characterName={characterName}
          status={status}
          controlsHintVisible={controlsHintVisible}
          onDismissControlsHint={() => setControlsHintVisible(false)}
          onControlsHintExitStart={() => setControlsInputLocked(false)}
          onPointerLock={requestLookLock}
          onPointerUnlock={releaseLookLock}
        />
        <GameOverlay
          view={overlayView}
          inventory={inventory}
          characterName={characterName}
          onClose={resumeGame}
          onOpenSettings={() => setOverlayView("settings")}
          onBackToPause={() => setOverlayView("pause")}
          onExitToMenu={exitToMenu}
        />
        {activeInteractable && (
          <InteractionDetailsPanel interactable={activeInteractable} />
        )}
      </div>
    </div>
  );
}

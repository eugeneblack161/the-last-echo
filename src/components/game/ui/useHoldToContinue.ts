"use client";

import { useEffect, useRef, useState } from "react";

interface UseHoldToContinueOptions {
  onContinue: () => void;
  onExitStart?: () => void;
  onPointerLock?: () => void;
  onPointerUnlock?: () => void;
  holdDurationMs?: number;
  exitDurationMs?: number;
}

export function useHoldToContinue({
  onContinue,
  onExitStart,
  onPointerLock,
  onPointerUnlock,
  holdDurationMs = 650,
  exitDurationMs = 420,
}: UseHoldToContinueOptions) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const onContinueRef = useRef(onContinue);
  const onExitStartRef = useRef(onExitStart);
  const onPointerLockRef = useRef(onPointerLock);
  const onPointerUnlockRef = useRef(onPointerUnlock);
  const exitingRef = useRef(false);
  const holdStartedAtRef = useRef<number | null>(null);
  const holdIntervalRef = useRef<number | null>(null);
  const exitTimeoutRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    onContinueRef.current = onContinue;
  }, [onContinue]);

  useEffect(() => {
    onExitStartRef.current = onExitStart;
  }, [onExitStart]);

  useEffect(() => {
    onPointerLockRef.current = onPointerLock;
  }, [onPointerLock]);

  useEffect(() => {
    onPointerUnlockRef.current = onPointerUnlock;
  }, [onPointerUnlock]);

  useEffect(() => {
    const clearHold = () => {
      holdStartedAtRef.current = null;
      if (holdIntervalRef.current !== null) {
        window.clearInterval(holdIntervalRef.current);
        holdIntervalRef.current = null;
      }
      if (!exitingRef.current) setProgress(0);
    };

    const completeExit = () => {
      if (exitTimeoutRef.current !== null) {
        window.clearTimeout(exitTimeoutRef.current);
        exitTimeoutRef.current = null;
      }
      if (completedRef.current) return;

      completedRef.current = true;
      onContinueRef.current();
    };

    const beginExit = () => {
      if (exitingRef.current) return;

      clearHold();
      exitingRef.current = true;
      setProgress(1);
      setExiting(true);
      onExitStartRef.current?.();
      exitTimeoutRef.current = window.setTimeout(
        completeExit,
        exitDurationMs + 100,
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "KeyE" || event.repeat || exitingRef.current) return;

      event.preventDefault();
      onPointerLockRef.current?.();
      holdStartedAtRef.current = performance.now();
      holdIntervalRef.current = window.setInterval(() => {
        if (holdStartedAtRef.current === null) return;

        const heldFor = performance.now() - holdStartedAtRef.current;
        const nextProgress = Math.min(heldFor / holdDurationMs, 1);
        setProgress(nextProgress);
        if (nextProgress === 1) beginExit();
      }, 30);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code !== "KeyE") return;
      const keepLock = exitingRef.current;
      clearHold();
      if (keepLock) onPointerLockRef.current?.();
      else onPointerUnlockRef.current?.();
    };

    const handleBlur = () => {
      const keepLock = exitingRef.current;
      clearHold();
      if (!keepLock) onPointerUnlockRef.current?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      holdStartedAtRef.current = null;
      if (holdIntervalRef.current !== null) {
        window.clearInterval(holdIntervalRef.current);
        holdIntervalRef.current = null;
      }
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      if (exitTimeoutRef.current !== null) {
        window.clearTimeout(exitTimeoutRef.current);
      }
    };
  }, [exitDurationMs, holdDurationMs]);

  const handleTransitionEnd = (
    event: React.TransitionEvent<HTMLElement>,
  ) => {
    if (
      exitingRef.current &&
      event.target === event.currentTarget &&
      event.propertyName === "opacity"
    ) {
      if (exitTimeoutRef.current !== null) {
        window.clearTimeout(exitTimeoutRef.current);
        exitTimeoutRef.current = null;
      }
      if (completedRef.current) return;

      completedRef.current = true;
      onContinueRef.current();
    }
  };

  return { progress, exiting, handleTransitionEnd };
}

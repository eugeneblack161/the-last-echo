import type { InteractableDetails } from "@/components/game/raid/interactables";

export const WALK_SPEED = 4.2;
export const RUN_SPEED = 7;
export interface CorridorSegment {
  start: number;
  end: number;
  halfWidth: number;
  ceilingHeight: number;
}

export function getWallHeight(segment: CorridorSegment) {
  return segment.ceilingHeight * 0.72;
}

export const CORRIDOR_SEGMENTS: readonly CorridorSegment[] = [
  { start: -140, end: -96, halfWidth: 34, ceilingHeight: 18 },
  { start: -96, end: -76, halfWidth: 26, ceilingHeight: 14 },
  { start: -76, end: -12, halfWidth: 62, ceilingHeight: 34 },
  { start: -12, end: 18, halfWidth: 38, ceilingHeight: 21 },
  { start: 18, end: 92, halfWidth: 78, ceilingHeight: 42 },
  { start: 92, end: 122, halfWidth: 42, ceilingHeight: 23 },
  { start: 122, end: 180, halfWidth: 68, ceilingHeight: 38 },
];
export const WORLD_X_BOUNDS = {
  min: CORRIDOR_SEGMENTS[0].start + 1.5,
  max: CORRIDOR_SEGMENTS[CORRIDOR_SEGMENTS.length - 1].end - 1.5,
};
export const PLAYER_WALL_MARGIN = 1.5;

export function getCorridorSegment(x: number) {
  return (
    CORRIDOR_SEGMENTS.find((segment) => x >= segment.start && x < segment.end) ??
    CORRIDOR_SEGMENTS[CORRIDOR_SEGMENTS.length - 1]
  );
}

export interface WorldStatus {
  loading: boolean;
  error: string | null;
  position: string;
  nearbyInteractable: InteractableDetails | null;
}

export const INITIAL_WORLD_STATUS: WorldStatus = {
  loading: true,
  error: null,
  position: "X +0.0 · Z +0.0",
  nearbyInteractable: null,
};

export function formatPosition(value: number) {
  return value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1);
}

import * as THREE from "three";

import {
  PLAYER_WALL_MARGIN,
  RUN_SPEED,
  WALK_SPEED,
  WORLD_X_BOUNDS,
  getCorridorSegment,
} from "@/components/game/raid/constants";

export function movePlayer(
  player: THREE.Group,
  pressedKeys: Set<string>,
  cameraAzimuth: number,
  elapsed: number,
  delta: number,
) {
  const horizontal =
    Number(pressedKeys.has("KeyD") || pressedKeys.has("ArrowRight")) -
    Number(pressedKeys.has("KeyA") || pressedKeys.has("ArrowLeft"));
  const depth =
    Number(pressedKeys.has("KeyS") || pressedKeys.has("ArrowDown")) -
    Number(pressedKeys.has("KeyW") || pressedKeys.has("ArrowUp"));
  const direction = new THREE.Vector3(horizontal, 0, depth);
  if (direction.lengthSq() > 1) direction.normalize();
  direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraAzimuth);

  const moving = direction.lengthSq() > 0;
  const speed =
    (pressedKeys.has("ShiftLeft") || pressedKeys.has("ShiftRight")) && moving
      ? RUN_SPEED
      : WALK_SPEED;
  let nextX = THREE.MathUtils.clamp(
    player.position.x + direction.x * speed * delta,
    WORLD_X_BOUNDS.min,
    WORLD_X_BOUNDS.max,
  );
  const nextZ = player.position.z + direction.z * speed * delta;
  const nextSegment = getCorridorSegment(nextX);
  const nextZLimit = nextSegment.halfWidth - PLAYER_WALL_MARGIN;

  if (nextX !== player.position.x && Math.abs(player.position.z) > nextZLimit) {
    nextX = player.position.x;
  }

  const currentSegment = getCorridorSegment(nextX);
  const currentZLimit = currentSegment.halfWidth - PLAYER_WALL_MARGIN;
  player.position.x = nextX;
  player.position.z = THREE.MathUtils.clamp(
    nextZ,
    -currentZLimit,
    currentZLimit,
  );
  if (moving) player.rotation.y = Math.atan2(direction.x, direction.z);
  player.position.y = moving
    ? Math.abs(Math.sin(elapsed * (speed > WALK_SPEED ? 12 : 8))) * 0.055
    : 0;
  return { moving, running: speed > WALK_SPEED };
}

export function followPlayer(
  camera: THREE.PerspectiveCamera,
  controls: { target: THREE.Vector3 },
  playerPosition: THREE.Vector3,
  delta: number,
) {
  const followAmount = 1 - Math.exp(-4.5 * delta);
  const targetX = playerPosition.x - controls.target.x;
  const targetY = 1.1 - controls.target.y;
  const targetZ = playerPosition.z - controls.target.z;
  const offsetX = targetX * followAmount;
  const offsetY = targetY * followAmount;
  const offsetZ = targetZ * followAmount;

  controls.target.x += offsetX;
  controls.target.y += offsetY;
  controls.target.z += offsetZ;
  camera.position.x += offsetX;
  camera.position.y += offsetY;
  camera.position.z += offsetZ;
}

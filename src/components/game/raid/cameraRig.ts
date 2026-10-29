import * as THREE from "three";

const CAMERA_FOLLOW_SPEED = 8;
const LOOK_SENSITIVITY = 0.0025;
const MIN_CAMERA_ELEVATION = 0.05;
const MAX_CAMERA_ELEVATION = 1.05;
const SHOULDER_OFFSET = 0.8;
const CAMERA_COLLISION_PADDING = 0.45;
const MIN_CAMERA_DISTANCE = 1.15;
const CAMERA_PUSH_OUT_SPEED = 6;

const raycaster = new THREE.Raycaster();
const rayOrigin = new THREE.Vector3();
const desiredCamera = new THREE.Vector3();
const rayDirection = new THREE.Vector3();

export interface CameraRig {
  azimuth: number;
  elevation: number;
  distance: number;
  armFraction: number;
  target: THREE.Vector3;
}

export function createCameraRig(camera: THREE.PerspectiveCamera): CameraRig {
  const target = new THREE.Vector3(0, 1, 0);
  const offset = camera.position.clone().sub(target);
  const spherical = new THREE.Spherical().setFromVector3(offset);

  return {
    azimuth: spherical.theta,
    elevation: Math.PI / 2 - spherical.phi,
    distance: spherical.radius,
    armFraction: 1,
    target,
  };
}

export function rotateCameraRig(
  rig: CameraRig,
  deltaX: number,
  deltaY: number,
) {
  rig.azimuth -= deltaX * LOOK_SENSITIVITY;
  rig.elevation = THREE.MathUtils.clamp(
    rig.elevation - deltaY * LOOK_SENSITIVITY,
    MIN_CAMERA_ELEVATION,
    MAX_CAMERA_ELEVATION,
  );
}

export function collectCameraOccluders(
  scene: THREE.Scene,
  ignoredRoot: THREE.Object3D,
) {
  const occluders: THREE.Mesh[] = [];
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    let parent: THREE.Object3D | null = object;
    while (parent) {
      if (parent === ignoredRoot) return;
      parent = parent.parent;
    }
    occluders.push(object);
  });
  return occluders;
}

export function updateCameraRig(
  camera: THREE.PerspectiveCamera,
  rig: CameraRig,
  playerPosition: THREE.Vector3,
  delta: number,
  occluders: THREE.Object3D[] = [],
) {
  rig.target.x = THREE.MathUtils.damp(
    rig.target.x,
    playerPosition.x,
    CAMERA_FOLLOW_SPEED,
    delta,
  );
  rig.target.y = THREE.MathUtils.damp(
    rig.target.y,
    1.1 + playerPosition.y,
    CAMERA_FOLLOW_SPEED,
    delta,
  );
  rig.target.z = THREE.MathUtils.damp(
    rig.target.z,
    playerPosition.z,
    CAMERA_FOLLOW_SPEED,
    delta,
  );

  const rightX = Math.cos(rig.azimuth);
  const rightZ = -Math.sin(rig.azimuth);
  const lookX = rig.target.x + rightX * SHOULDER_OFFSET;
  const lookZ = rig.target.z + rightZ * SHOULDER_OFFSET;
  const horizontalDistance = Math.cos(rig.elevation) * rig.distance;
  desiredCamera.set(
    lookX + Math.sin(rig.azimuth) * horizontalDistance,
    rig.target.y + Math.sin(rig.elevation) * rig.distance,
    lookZ + Math.cos(rig.azimuth) * horizontalDistance,
  );
  rayOrigin.copy(rig.target);

  const span = rayOrigin.distanceTo(desiredCamera);
  let clearFraction = 1;
  if (span > MIN_CAMERA_DISTANCE && occluders.length > 0) {
    rayDirection.copy(desiredCamera).sub(rayOrigin).multiplyScalar(1 / span);
    for (const occluder of occluders) occluder.updateWorldMatrix(true, false);
    raycaster.set(rayOrigin, rayDirection);
    raycaster.near = 0;
    raycaster.far = span;
    const hit = raycaster.intersectObjects(occluders, false)[0];
    if (hit) {
      const clearDistance = Math.min(
        span,
        Math.max(
          hit.distance - CAMERA_COLLISION_PADDING,
          Math.min(MIN_CAMERA_DISTANCE, hit.distance * 0.8),
        ),
      );
      clearFraction = clearDistance / span;
    }
  }

  rig.armFraction =
    clearFraction < rig.armFraction
      ? clearFraction
      : THREE.MathUtils.damp(
          rig.armFraction,
          clearFraction,
          CAMERA_PUSH_OUT_SPEED,
          delta,
        );

  camera.position.lerpVectors(rayOrigin, desiredCamera, rig.armFraction);
  camera.lookAt(
    rig.target.x + rightX * SHOULDER_OFFSET * rig.armFraction,
    rig.target.y,
    rig.target.z + rightZ * SHOULDER_OFFSET * rig.armFraction,
  );
}

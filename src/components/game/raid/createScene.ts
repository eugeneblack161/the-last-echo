import * as THREE from "three";

import { createEnvironment } from "@/components/game/raid/createEnvironment";
import { createStoneMaterial } from "@/components/game/raid/createStoneMaterial";
import {
  createInteractables,
  type InteractableObject,
} from "@/components/game/raid/interactables";

export interface GameScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  interactables: InteractableObject[];
}

export function createScene(aspect: number): GameScene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111014);
  scene.fog = new THREE.FogExp2(0x111014, 0.0028);

  const groundMaterial = createStoneMaterial(1, 1, 0x8c8585, 0.055);
  const wallMaterial = createStoneMaterial(3, 2, 0x777174, 0.035);
  const ceilingMaterial = wallMaterial.clone();
  ceilingMaterial.color.set(0x59565d);
  ceilingMaterial.side = THREE.DoubleSide;

  createEnvironment(scene, groundMaterial, wallMaterial, ceilingMaterial);
  const interactables = createInteractables(scene, wallMaterial);

  const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 420);
  camera.position.set(0, 2.8, 8);
  camera.lookAt(0, 1, 0);

  return { scene, camera, interactables };
}

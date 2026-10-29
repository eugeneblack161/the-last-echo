import * as THREE from "three";

import {
  CORRIDOR_SEGMENTS,
  getWallHeight,
  type CorridorSegment,
} from "@/components/game/raid/constants";

export function createLighting(scene: THREE.Scene) {
  scene.add(new THREE.HemisphereLight(0x89899a, 0x312a2b, 1.15));

  const coldKeyLight = new THREE.DirectionalLight(0xaaa9b5, 1.6);
  coldKeyLight.position.set(-12, 24, 18);
  scene.add(coldKeyLight);

  CORRIDOR_SEGMENTS.forEach((segment, index) => {
    const x = (segment.start + segment.end) / 2;
    const side = index % 2 === 0 ? 1 : -1;
    const color = index === 4 ? 0x9b7856 : 0xb2916c;
    addWallLight(scene, x, side, segment, color);
  });
}

function addWallLight(
  scene: THREE.Scene,
  x: number,
  side: -1 | 1,
  segment: CorridorSegment,
  color: THREE.ColorRepresentation,
) {
  const wallHeight = getWallHeight(segment);
  const y = wallHeight * 0.72;
  const bracket = new THREE.Mesh(
    new THREE.BoxGeometry(1.05, 1.3, 0.65),
    new THREE.MeshStandardMaterial({ color: 0x29272b, roughness: 0.9 }),
  );
  bracket.position.set(x, y, side * (segment.halfWidth - 0.25));
  scene.add(bracket);

  const lamp = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.72, 0.16),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 1.35,
      roughness: 0.55,
      toneMapped: false,
    }),
  );
  lamp.position.set(x, y, side * (segment.halfWidth - 0.68));
  scene.add(lamp);

  const light = new THREE.PointLight(color, 34, 42, 2);
  light.position.set(x, y - 0.35, side * (segment.halfWidth - 1.8));
  scene.add(light);
}

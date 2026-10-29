import * as THREE from "three";

export interface InteractableDetails {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
}

export interface InteractableObject extends InteractableDetails {
  position: THREE.Vector3;
}

const INTERACTION_RANGE = 2.4;

export function createInteractables(
  scene: THREE.Scene,
  stoneMaterial: THREE.MeshStandardMaterial,
): InteractableObject[] {
  const object = new THREE.Group();
  object.position.set(4.5, 0, 0);

  const stone = stoneMaterial.clone();
  stone.color.set(0xc0c0c0);
  const darkStone = stoneMaterial.clone();
  darkStone.color.set(0x999999);
  const echo = new THREE.MeshStandardMaterial({
    color: 0x7d3029,
    emissive: 0x58120d,
    emissiveIntensity: 1.4,
    roughness: 0.6,
  });

  const base = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.38, 0.85), stone);
  base.position.y = 0.19;
  object.add(base);

  const marker = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 1.55, 0.42),
    darkStone,
  );
  marker.position.set(0, 1.15, 0);
  object.add(marker);

  const crack = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.62, 0.025), echo);
  crack.position.set(0.04, 1.22, 0.225);
  object.add(crack);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.9, 0.035, 8, 32),
    new THREE.MeshBasicMaterial({
      color: 0xc98a65,
      transparent: true,
      opacity: 0.72,
    }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.035;
  object.add(ring);

  scene.add(object);

  return [
    {
      id: "ash-road-marker",
      title: "Знак на пепельном тракте",
      description:
        "Камень расколот изнутри. В трещине мерцает тусклый красный свет, будто эхо чьего-то давно забытого сигнала.",
      actionLabel: "Осмотреть",
      position: object.position,
    },
  ];
}

export function findNearbyInteractable(
  position: THREE.Vector3,
  interactables: InteractableObject[],
): InteractableDetails | null {
  let nearest: InteractableObject | null = null;
  let nearestDistance = INTERACTION_RANGE;

  for (const interactable of interactables) {
    const distance = Math.hypot(
      position.x - interactable.position.x,
      position.z - interactable.position.z,
    );
    if (distance < nearestDistance) {
      nearest = interactable;
      nearestDistance = distance;
    }
  }

  if (!nearest) return null;

  const { position: _position, ...details } = nearest;
  return details;
}

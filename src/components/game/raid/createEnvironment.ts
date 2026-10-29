import * as THREE from "three";

import {
  CORRIDOR_SEGMENTS,
  getWallHeight,
  PLAYER_WALL_MARGIN,
} from "@/components/game/raid/constants";
import { createLighting } from "@/components/game/raid/createLighting";

const FLOOR_TILE_SIZE = 3.6;

export function createEnvironment(
  scene: THREE.Scene,
  groundMaterial: THREE.MeshStandardMaterial,
  wallMaterial: THREE.MeshStandardMaterial,
  ceilingMaterial: THREE.MeshStandardMaterial,
) {
  createLighting(scene);
  addCorridorFloors(scene, groundMaterial);
  addSideWalls(scene, wallMaterial);
  addCorridorArches(scene, wallMaterial);
  addVaultedCeilings(scene, ceilingMaterial);
  addTransitionFrames(scene, wallMaterial);
  addEndWalls(scene, wallMaterial);
}

function addCorridorFloors(
  scene: THREE.Scene,
  groundMaterial: THREE.MeshStandardMaterial,
) {
  for (const segment of CORRIDOR_SEGMENTS) {
    const length = segment.end - segment.start + 0.04;
    const depth = segment.halfWidth * 2;
    const geometry = new THREE.PlaneGeometry(length, depth);
    const uv = geometry.getAttribute("uv");
    for (let index = 0; index < uv.count; index += 1) {
      uv.setXY(
        index,
        uv.getX(index) * (length / FLOOR_TILE_SIZE) +
          (segment.start - 0.02) / FLOOR_TILE_SIZE,
        uv.getY(index) * (depth / FLOOR_TILE_SIZE),
      );
    }
    uv.needsUpdate = true;

    const floor = new THREE.Mesh(geometry, groundMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set((segment.start + segment.end) / 2, -0.04, 0);
    scene.add(floor);
  }
}

function addSideWalls(
  scene: THREE.Scene,
  wallMaterial: THREE.MeshStandardMaterial,
) {
  const darkStone = wallMaterial.clone();
  darkStone.color.set(0x777777);

  for (const side of [-1, 1] as const) {
    for (const segment of CORRIDOR_SEGMENTS) {
      const length = segment.end - segment.start;
      const wallHeight = getWallHeight(segment);
      const wallPanel = new THREE.Mesh(
        new THREE.BoxGeometry(length, wallHeight, 1),
        darkStone,
      );
      wallPanel.position.set(
        (segment.start + segment.end) / 2,
        wallHeight / 2,
        side * (segment.halfWidth - 0.5),
      );
      scene.add(wallPanel);

      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(length, 0.7, 1.65),
        darkStone,
      );
      wall.position.set(
        (segment.start + segment.end) / 2,
        0.35,
        side * segment.halfWidth,
      );
      scene.add(wall);

      const sections = Math.ceil(length / 6);
      for (let index = 0; index < sections; index += 1) {
        const x = segment.start + ((index + 0.5) * length) / sections;
        const height = wallHeight - 0.7;
        const pier = new THREE.Mesh(
          new THREE.BoxGeometry(1.5, height, 2.4),
          darkStone,
        );
        pier.position.set(
          x,
          height / 2 + 0.35,
          side * (segment.halfWidth - 0.15),
        );
        scene.add(pier);
      }
    }
  }
}

function addCorridorArches(
  scene: THREE.Scene,
  stoneMaterial: THREE.MeshStandardMaterial,
) {
  const ribMaterial = stoneMaterial.clone();
  ribMaterial.color.set(0x777174);

  for (let index = 0; index < CORRIDOR_SEGMENTS.length; index += 1) {
    const segment = CORRIDOR_SEGMENTS[index];
    const archSpacing = segment.halfWidth > 50 ? 18 : 12;
    const archPositions = [segment.start + archSpacing / 2];
    for (let x = segment.start + archSpacing; x < segment.end; x += archSpacing) {
      archPositions.push(x);
    }

    for (const x of archPositions) {
      addArch(scene, x, segment, ribMaterial, 0.28);
    }
  }
}

function addVaultedCeilings(
  scene: THREE.Scene,
  material: THREE.MeshStandardMaterial,
) {
  for (const segment of CORRIDOR_SEGMENTS) {
    const length = segment.end - segment.start;
    const halfWidth = segment.halfWidth;
    const wallHeight = getWallHeight(segment);
    const rise = segment.ceilingHeight - wallHeight;
    const columns = 24;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let xIndex = 0; xIndex <= 1; xIndex += 1) {
      for (let zIndex = 0; zIndex <= columns; zIndex += 1) {
        const z = -halfWidth + (2 * halfWidth * zIndex) / columns;
        const normalizedZ = z / halfWidth;
        const y =
          wallHeight + rise * Math.sqrt(Math.max(0, 1 - normalizedZ ** 2));
        positions.push(xIndex * length, y, z);
        uvs.push(
          (xIndex * length) / FLOOR_TILE_SIZE,
          (z + halfWidth) / FLOOR_TILE_SIZE,
        );
      }
    }

    for (let index = 0; index < columns; index += 1) {
      const nextRow = columns + 1;
      const left = index;
      const right = index + 1;
      const farLeft = nextRow + index;
      const farRight = nextRow + index + 1;
      indices.push(left, farLeft, right, right, farLeft, farRight);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const vault = new THREE.Mesh(geometry, material);
    vault.position.x = segment.start;
    scene.add(vault);
  }
}

function addTransitionFrames(
  scene: THREE.Scene,
  material: THREE.MeshStandardMaterial,
) {
  for (let index = 1; index < CORRIDOR_SEGMENTS.length; index += 1) {
    const previous = CORRIDOR_SEGMENTS[index - 1];
    const current = CORRIDOR_SEGMENTS[index];
    const widthDifference = previous.halfWidth - current.halfWidth;
    const lowerHeight = Math.min(previous.ceilingHeight, current.ceilingHeight);

    if (Math.abs(widthDifference) > 2) {
      const outerHalfWidth = Math.max(previous.halfWidth, current.halfWidth);
      const innerHalfWidth = Math.min(previous.halfWidth, current.halfWidth);
      const panelWidth = outerHalfWidth - innerHalfWidth;
      for (const side of [-1, 1] as const) {
        const returnWall = new THREE.Mesh(
          new THREE.BoxGeometry(1.3, lowerHeight, panelWidth),
          material,
        );
        returnWall.position.set(
          current.start,
          lowerHeight / 2,
          side * (innerHalfWidth + panelWidth / 2),
        );
        scene.add(returnWall);
      }
    }

    addArch(
      scene,
      current.start,
      {
        ...current,
        halfWidth: Math.min(previous.halfWidth, current.halfWidth),
        ceilingHeight: lowerHeight,
      },
      material,
      0.46,
    );
  }
}

function addEndWalls(
  scene: THREE.Scene,
  material: THREE.MeshStandardMaterial,
) {
  const first = CORRIDOR_SEGMENTS[0];
  const last = CORRIDOR_SEGMENTS[CORRIDOR_SEGMENTS.length - 1];

  for (const { x, segment } of [
    { x: first.start - 0.65, segment: first },
    { x: last.end + 0.65, segment: last },
  ]) {
    const endWall = new THREE.Mesh(
      new THREE.BoxGeometry(
        1.3,
        segment.ceilingHeight,
        segment.halfWidth * 2 + 2,
      ),
      material,
    );
    endWall.position.set(x, segment.ceilingHeight / 2, 0);
    scene.add(endWall);
  }
}

function addArch(
  scene: THREE.Scene,
  x: number,
  segment: (typeof CORRIDOR_SEGMENTS)[number],
  material: THREE.Material,
  radius: number,
) {
  const halfWidth = segment.halfWidth - PLAYER_WALL_MARGIN;
  const baseHeight = getWallHeight(segment) - 0.35;
  const rise = segment.ceilingHeight - baseHeight;
  const points = Array.from({ length: 17 }, (_, index) => {
    const angle = -Math.PI / 2 + (Math.PI * index) / 16;
    return new THREE.Vector3(
      x,
      baseHeight + Math.cos(angle) * rise,
      Math.sin(angle) * halfWidth,
    );
  });
  const arch = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(points),
      32,
      radius,
      8,
      false,
    ),
    material,
  );
  scene.add(arch);

  for (const side of [-1, 1] as const) {
    const pier = new THREE.Mesh(
      new THREE.BoxGeometry(radius * 2.2, baseHeight, radius * 2.2),
      material,
    );
    pier.position.set(x, baseHeight / 2, side * halfWidth);
    scene.add(pier);
  }
}

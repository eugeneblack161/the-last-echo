import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { TGALoader } from "three/addons/loaders/TGALoader.js";

const PLAYER_MODEL_URL = "/game/models/vanguard/vanguard.fbx";
const IDLE_ANIMATION_URL = "/game/models/vanguard/zombie-idle.fbx";
const WALK_ANIMATION_URL = "/game/models/vanguard/standard-walk.fbx";
const PLAYER_HEIGHT = 2;

export interface PlayerAvatar {
  root: THREE.Group;
  mixer: THREE.AnimationMixer | null;
  idleAction: THREE.AnimationAction | null;
  walkAction: THREE.AnimationAction | null;
  activeAction: THREE.AnimationAction | null;
  isMoving: boolean;
  isRunning: boolean;
  disposed: boolean;
}

export function createPlayer(scene: THREE.Scene): PlayerAvatar {
  const root = new THREE.Group();
  scene.add(root);

  return {
    root,
    mixer: null,
    idleAction: null,
    walkAction: null,
    activeAction: null,
    isMoving: false,
    isRunning: false,
    disposed: false,
  };
}

export async function loadMixamoCharacter(player: PlayerAvatar) {
  const manager = new THREE.LoadingManager();
  manager.addHandler(/\.tga$/i, new TGALoader(manager));
  const loader = new FBXLoader(manager);
  const [modelResult, idleResult, walkResult] = await Promise.allSettled([
    loader.loadAsync(PLAYER_MODEL_URL),
    loader.loadAsync(IDLE_ANIMATION_URL),
    loader.loadAsync(WALK_ANIMATION_URL),
  ]);
  const loadedAssets = [modelResult, idleResult, walkResult]
    .filter(
      (result): result is PromiseFulfilledResult<THREE.Group> =>
        result.status === "fulfilled",
    )
    .map((result) => result.value);

  if (
    modelResult.status === "rejected" ||
    idleResult.status === "rejected" ||
    walkResult.status === "rejected"
  ) {
    loadedAssets.forEach(disposeObject);
    throw (
      [modelResult, idleResult, walkResult].find(
        (result): result is PromiseRejectedResult =>
          result.status === "rejected",
      )?.reason ?? new Error("Не удалось загрузить модель и анимации.")
    );
  }

  const model = modelResult.value;
  const idleAsset = idleResult.value;
  const walkAsset = walkResult.value;

  if (player.disposed) {
    loadedAssets.forEach(disposeObject);
    return;
  }

  const bounds = new THREE.Box3().setFromObject(model);
  const modelHeight = bounds.getSize(new THREE.Vector3()).y;
  if (!Number.isFinite(modelHeight) || modelHeight <= 0) {
    loadedAssets.forEach(disposeObject);
    throw new Error("FBX-модель персонажа имеет некорректный размер.");
  }

  const scale = PLAYER_HEIGHT / modelHeight;
  model.scale.setScalar(scale);
  model.position.y = -bounds.min.y * scale;

  const idleClip = idleAsset.animations[0];
  const walkSourceClip = walkAsset.animations[0];
  if (!idleClip || !walkSourceClip) {
    loadedAssets.forEach(disposeObject);
    throw new Error("В загруженных FBX отсутствуют клипы анимации.");
  }

  const walkClip = new THREE.AnimationClip(
    walkSourceClip.name,
    walkSourceClip.duration,
    walkSourceClip.tracks.filter(
      (track) => track.name !== "mixamorigHips.position",
    ),
  );
  const mixer = new THREE.AnimationMixer(model);
  const idleAction = mixer.clipAction(idleClip);
  const walkAction = mixer.clipAction(walkClip);

  const initialAction = player.isMoving ? walkAction : idleAction;
  initialAction.play();
  mixer.update(0);

  player.root.add(model);
  player.mixer = mixer;
  player.idleAction = idleAction;
  player.walkAction = walkAction;
  player.activeAction = initialAction;
  if (player.isMoving) {
    walkAction.timeScale = player.isRunning ? 1.65 : 1;
  }
}

export function setPlayerMovement(
  player: PlayerAvatar,
  isMoving: boolean,
  isRunning: boolean,
) {
  player.isMoving = isMoving;
  player.isRunning = isRunning;

  const nextAction = isMoving ? player.walkAction : player.idleAction;
  if (!nextAction || nextAction === player.activeAction) {
    if (isMoving && player.walkAction) {
      player.walkAction.timeScale = isRunning ? 1.65 : 1;
    }
    return;
  }

  nextAction.reset().fadeIn(0.18).play();
  player.activeAction?.fadeOut(0.18);
  player.activeAction = nextAction;
  if (isMoving && player.walkAction) {
    player.walkAction.timeScale = isRunning ? 1.65 : 1;
  }
}

export function updatePlayerAnimation(player: PlayerAvatar, delta: number) {
  player.mixer?.update(delta);
}

export function disposePlayerAnimation(player: PlayerAvatar) {
  player.disposed = true;
  player.mixer?.stopAllAction();
  player.mixer?.uncacheRoot(player.mixer.getRoot());
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.geometry.dispose();
    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];
    materials.forEach((material) => {
      Object.values(material).forEach((value) => {
        if (value instanceof THREE.Texture) value.dispose();
      });
      material.dispose();
    });
  });
}

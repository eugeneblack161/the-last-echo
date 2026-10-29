"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import {
  createPlayer,
  disposePlayerAnimation,
  loadMixamoCharacter,
  setPlayerMovement,
  updatePlayerAnimation,
} from "@/components/game/raid/createPlayer";
import {
  createRenderer,
  observeHostSize,
} from "@/components/game/raid/createRenderer";
import { createScene } from "@/components/game/raid/createScene";
import {
  INITIAL_WORLD_STATUS,
  formatPosition,
  type WorldStatus,
} from "@/components/game/raid/constants";
import { findNearbyInteractable } from "@/components/game/raid/interactables";
import { followPlayer, movePlayer } from "@/components/game/raid/updatePlayer";

export function useRuntime(
  inputEnabled: boolean,
  simulationPaused: boolean,
) {
  const hostRef = useRef<HTMLDivElement>(null);
  const inputEnabledRef = useRef(inputEnabled);
  const simulationPausedRef = useRef(simulationPaused);
  const pressedKeysRef = useRef(new Set<string>());
  const [status, setStatus] = useState<WorldStatus>(INITIAL_WORLD_STATUS);

  useEffect(() => {
    inputEnabledRef.current = inputEnabled;
    if (!inputEnabled) pressedKeysRef.current.clear();
  }, [inputEnabled]);

  useEffect(() => {
    simulationPausedRef.current = simulationPaused;
    if (simulationPaused) pressedKeysRef.current.clear();
  }, [simulationPaused]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = createRenderer(host);
    } catch (error) {
      console.error("Не удалось запустить 3D-сцену рейда.", error);
      const errorFrame = window.requestAnimationFrame(() => {
        setStatus({
          ...INITIAL_WORLD_STATUS,
          loading: false,
          error:
            "Не удалось запустить 3D-сцену. Проверьте поддержку WebGL в браузере.",
        });
      });
      return () => window.cancelAnimationFrame(errorFrame);
    }

    const aspect =
      host.clientWidth / host.clientHeight ||
      window.innerWidth / window.innerHeight;
    const { scene, camera, interactables } = createScene(aspect);
    const cameraControls = new OrbitControls(camera, renderer.domElement);
    cameraControls.target.set(0, 1, 0);
    cameraControls.enableDamping = true;
    cameraControls.enablePan = false;
    cameraControls.minDistance = 4;
    cameraControls.maxDistance = 12;
    cameraControls.maxPolarAngle = Math.PI / 2 - 0.05;
    cameraControls.update();
    const player = createPlayer(scene);
    void loadMixamoCharacter(player).then(
      () => {
        if (!player.disposed) {
          setStatus((current) => ({ ...current, loading: false }));
        }
      },
      (error: unknown) => {
        if (!player.disposed) {
          console.error(
            "Не удалось загрузить модель и анимации персонажа.",
            error,
          );
          setStatus((current) => ({
            ...current,
            loading: false,
            error:
              "Не удалось загрузить персонажа. Проверьте подключение и перезагрузите рейд.",
          }));
        }
      },
    );
    const pressedKeys = pressedKeysRef.current;
    const timer = new THREE.Timer();
    timer.connect(document);

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.code;
      if (!inputEnabledRef.current || player.mixer === null) return;
      if (
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "Space",
        ].includes(key)
      ) {
        event.preventDefault();
      }
      pressedKeys.add(key);
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      pressedKeys.delete(event.code);
    };
    const clearKeys = () => pressedKeys.clear();

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", clearKeys);

    const resizeObserver = observeHostSize(host, camera, renderer);
    let frameId = 0;
    let statusElapsed = 0;
    const animate = (timestamp: number) => {
      frameId = window.requestAnimationFrame(animate);
      timer.setTimescale(simulationPausedRef.current ? 0 : 1);
      timer.update(timestamp);
      const delta = Math.min(timer.getDelta(), 0.05);
      statusElapsed += delta;
      cameraControls.update();

      let movement = { moving: false, running: false };
      if (inputEnabledRef.current) {
        movement = movePlayer(
          player.root,
          pressedKeys,
          cameraControls.getAzimuthalAngle(),
          timer.getElapsed(),
          delta,
        );
      }
      setPlayerMovement(player, movement.moving, movement.running);
      updatePlayerAnimation(player, delta);
      followPlayer(camera, cameraControls, player.root.position, delta);
      renderer.render(scene, camera);

      if (statusElapsed >= 0.12) {
        statusElapsed = 0;
        setStatus((current) => ({
          ...current,
          position: `X ${formatPosition(player.root.position.x)} · Z ${formatPosition(player.root.position.z)}`,
          nearbyInteractable: findNearbyInteractable(
            player.root.position,
            interactables,
          ),
        }));
      }
    };
    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", clearKeys);
      cameraControls.dispose();
      timer.dispose();
      disposePlayerAnimation(player);
      disposeScene(scene);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return { hostRef, status };
}

function disposeScene(scene: THREE.Scene) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();

  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    geometries.add(object.geometry);
    const meshMaterials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    meshMaterials.forEach((material) => {
      materials.add(material);
      Object.values(material).forEach((value) => {
        if (value instanceof THREE.Texture) textures.add(value);
      });
    });
  });

  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
  textures.forEach((texture) => texture.dispose());
}

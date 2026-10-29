import * as THREE from "three";

const TEXTURE_ATLAS_SIZE = 4;
const MAX_TEXTURE_TILE_SIZE = 512;
const STONE_BASE_COLOR_URL = "/game/textures/stone-tiles-basecolor.webp";
const STONE_HEIGHT_URL = "/game/textures/stone-tiles-height.webp";

const TILE_TRANSFORMS = [
  { rotation: 0, flipX: false, flipY: false },
  { rotation: 1, flipX: true, flipY: false },
  { rotation: 2, flipX: false, flipY: true },
  { rotation: 3, flipX: true, flipY: true },
  { rotation: 1, flipX: false, flipY: true },
  { rotation: 3, flipX: true, flipY: false },
  { rotation: 0, flipX: true, flipY: true },
  { rotation: 2, flipX: true, flipY: false },
] as const;

export function createStoneMaterial(
  repeatX: number,
  repeatY: number,
  color: THREE.ColorRepresentation,
  bumpScale: number,
) {
  const textureLoader = new THREE.TextureLoader();
  const colorMap = textureLoader.load(
    STONE_BASE_COLOR_URL,
    createTextureAtlas,
    undefined,
    (error) => console.error("Не удалось загрузить текстуру камня.", error),
  );
  const heightMap = textureLoader.load(
    STONE_HEIGHT_URL,
    createTextureAtlas,
    undefined,
    (error) => console.error("Не удалось загрузить рельеф камня.", error),
  );

  for (const texture of [colorMap, heightMap]) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(
      repeatX / TEXTURE_ATLAS_SIZE,
      repeatY / TEXTURE_ATLAS_SIZE,
    );
  }
  colorMap.colorSpace = THREE.SRGBColorSpace;

  return new THREE.MeshStandardMaterial({
    color,
    map: colorMap,
    bumpMap: heightMap,
    bumpScale,
    roughness: 0.96,
  });
}

function createTextureAtlas(texture: THREE.Texture) {
  const image = texture.image as HTMLImageElement;
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const scale = Math.min(1, MAX_TEXTURE_TILE_SIZE / Math.max(width, height));
  const tileWidth = Math.round(width * scale);
  const tileHeight = Math.round(height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = tileWidth * TEXTURE_ATLAS_SIZE;
  canvas.height = tileHeight * TEXTURE_ATLAS_SIZE;

  const context = canvas.getContext("2d");
  if (!context) {
    console.error("Не удалось подготовить текстуру камня.");
    return;
  }

  for (let row = 0; row < TEXTURE_ATLAS_SIZE; row += 1) {
    for (let column = 0; column < TEXTURE_ATLAS_SIZE; column += 1) {
      const transform =
        TILE_TRANSFORMS[
          (row * 5 + column * 3) % TILE_TRANSFORMS.length
        ];
      const centerX = (column + 0.5) * tileWidth;
      const centerY = (row + 0.5) * tileHeight;
      const rotation =
        tileWidth === tileHeight ? transform.rotation * (Math.PI / 2) : 0;

      context.save();
      context.translate(centerX, centerY);
      context.rotate(rotation);
      context.scale(transform.flipX ? -1 : 1, transform.flipY ? -1 : 1);
      context.drawImage(
        image,
        -tileWidth / 2,
        -tileHeight / 2,
        tileWidth,
        tileHeight,
      );
      context.restore();
    }
  }

  texture.image = canvas;
  texture.needsUpdate = true;
}

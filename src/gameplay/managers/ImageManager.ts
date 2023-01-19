import playerEngineSpritesheet from "../../assets/sprites/ship/engine-spritesheet.png";
import playerShipHealth4 from "../../assets/sprites/ship/ship-health-4.png";
import playerShipHealth3 from "../../assets/sprites/ship/ship-health-3.png";
import playerShipHealth2 from "../../assets/sprites/ship/ship-health-2.png";
import playerShipHealth1 from "../../assets/sprites/ship/ship-health-1.png";
import enemyShip from "../../assets/sprites/enemies/ship-spritesheet.png";
import explosion from "../../assets/sprites/explosion-round-spritesheet.png";
import heart from "../../assets/sprites/heart.png";

const images = {
  playerEngineSpritesheet,
  playerShipHealth4,
  playerShipHealth3,
  playerShipHealth2,
  playerShipHealth1,
  enemyShip,
  explosion,
  heart,
} as const;

export type LoadedImage = keyof typeof images;

const imageManager = createImageManager(images);

export default imageManager;

function createImageManager<T extends Record<string, any>>(images: T) {
  const cache: Map<string, HTMLImageElement> = new Map();

  Object.entries(images).forEach(([key, value]) => {
    const image = new Image();
    image.src = value;
    cache.set(key, image);
  });

  return {
    get: (path: keyof T): HTMLImageElement => {
      let p = path as string;
      let image = cache.get(p);
      if (!image) {
        image = new Image();
        image.src = path as string;
        cache.set(p, image);
      }
      return image;
    },
  };
}

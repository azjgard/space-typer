import { Game } from "./game";
import { drawImage } from "./lib";

import heartImage from "../assets/sprites/heart.png";
import ImageManager from "./ImageManager";

const HEART_SIZE = 40;

export const createHealthManager = (game: Game) => {
  let numberOfHearts = 4;

  let offset = HEART_SIZE;

  return {
    draw: () => {
      const image = ImageManager.getSync(heartImage);
      if (!image) {
        return;
      }

      for (let i = 0; i < numberOfHearts; i++) {
        const x = 0 + i * 20 + offset * (i + 1);
        const y = 20;
        drawImage({
          image,
          x,
          y,
          width: HEART_SIZE,
          height: HEART_SIZE,
          deg: 0,
          flip: false,
          flop: false,
          center: false,
          context: game.context,
          sheet: {
            sx: 0,
            sy: 0,
            sWidth: 16,
            sHeight: 16,
          },
        });
      }
    },
    damage: (amount: number = 1) => {
      numberOfHearts -= amount;
      return numberOfHearts > 0;
    },
  };
};

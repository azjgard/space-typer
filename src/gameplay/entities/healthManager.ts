import Entity from "./entity";
import ImageManager from "../ImageManager";

import heartImage from "../../assets/sprites/heart.png";
import { drawImage } from "../lib";

const HEART_SIZE = 40;

export default class HealthManager extends Entity {
  public static MAX_HEALTH = 4;

  health = HealthManager.MAX_HEALTH;
  offset = HEART_SIZE;

  draw() {
    super.draw();
    if (!this.active) return;

    const image = ImageManager.getSync(heartImage);
    if (!image) {
      return;
    }

    for (let i = 0; i < this.health; i++) {
      const x = 0 + i * 20 + this.offset * (i + 1);
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
        context: this.game.context,
        sheet: {
          sx: 0,
          sy: 0,
          sWidth: 16,
          sHeight: 16,
        },
      });
    }
  }

  damage() {
    this.health -= 1;
    return this.health > 0;
  }
}

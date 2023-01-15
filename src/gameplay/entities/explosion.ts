import Entity, { IEntityOptions } from "./entity";

import { Howl } from "howler";

import explosionSpritesheet from "../../assets/sprites/explosion-round-spritesheet.png";
import explosionFrames from "../../assets/sprites/explosion-round-spritesheet.json";
import explosionSound from "../../assets/sounds/explosion.wav";

import ImageManager from "../ImageManager";
import { drawImage } from "../lib";

const FRAME_SIZE = 100;

interface IExplosionOptions extends IEntityOptions {
  loop?: boolean;
  onEnd: (explosion: Explosion) => void;
}

/**
 * - sheet
 * - frames
 * - frame size
 * - frame delay (defaults 0)
 * - loop (defaults true, if not, then destroy at end)
 * ... other entity args
 */
export default class Explosion extends Entity {
  static SIZE = 100;
  frame = 0;
  frameWait = 0;
  frameWaitSize = 0;

  loop = false;

  onEnd;

  constructor(options: IExplosionOptions) {
    super(options);
    this.loop = options.loop ?? false;
    this.onEnd = options.onEnd;
    new Howl({
      src: [explosionSound],
    }).play();
  }

  draw() {
    super.draw();
    const image = ImageManager.getSync(explosionSpritesheet);
    if (!image) return;

    drawImage({
      image,
      x: this.position.x,
      y: this.position.y,
      width: this.size.width,
      height: this.size.height,
      sheet: {
        sWidth: FRAME_SIZE,
        sHeight: FRAME_SIZE,
        sx: explosionFrames[this.frame].sx,
        sy: explosionFrames[this.frame].sy,
      },

      context: this.game.context,
    });

    this.frameWait++;
    if (this.frameWait < this.frameWaitSize) return;

    this.frameWait = 0;
    this.frame = this.frame < explosionFrames.length - 1 ? this.frame + 1 : 0;

    if (this.frame === 0 && !this.loop) {
      this.onEnd(this);
    }
  }
}

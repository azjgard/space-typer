import explosionFrames from "../../../assets/sprites/explosion-round-spritesheet.json";
import explosionSound from "../../../assets/sounds/explosion.wav";

import Animation, { IAnimationOptions } from "../animation";
import { playSound } from "../../utils";
import { IEntityOptions } from "../entity";

const FRAME_SIZE = 100;

type IExplosionOptions = IEntityOptions & Pick<IAnimationOptions, "onEnd">;

export default class Explosion extends Animation {
  static SIZE = 100;

  constructor(options: IExplosionOptions) {
    super({
      ...options,
      position: options.position,
      size: options.size,
      spritesheetPath: "explosion",
      spritesheetFrames: explosionFrames.map((f) => ({
        ...f,
        sWidth: FRAME_SIZE,
        sHeight: FRAME_SIZE,
      })),
      loop: false,
      onEnd: options.onEnd,
    });

    setTimeout(() => playSound(explosionSound), 100);
  }
}

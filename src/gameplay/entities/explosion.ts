import Entity, { IEntityOptions } from "./entity";

import explosionSpritesheet from "../../assets/sprites/explosion-round-spritesheet.png";
import explosionFrames from "../../assets/sprites/explosion-round-spritesheet.json";
import explosionSound from "../../assets/sounds/explosion.wav";

import Animation from "./animation";
import { playSound } from "../utils";

const FRAME_SIZE = 100;

interface IExplosionOptions extends IEntityOptions {
  loop?: boolean;
  onEnd: (explosion: Explosion) => void;
}

export default class Explosion extends Entity {
  static SIZE = 100;

  constructor(options: IExplosionOptions) {
    super(options);

    this.game.createEntity(Animation, {
      id: `enemy-explosion-${this.id}`,
      position: this.position,
      size: this.size,
      spritesheetPath: explosionSpritesheet,
      spritesheetFrames: explosionFrames.map((f) => ({
        ...f,
        sWidth: FRAME_SIZE,
        sHeight: FRAME_SIZE,
      })),
      loop: false,
      onEnd: (animation) => {
        this.game.removeEntity(animation);
        options.onEnd(this);
      },
    });

    playSound(explosionSound);
  }
}

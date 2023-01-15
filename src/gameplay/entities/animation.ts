import ImageManager from "../ImageManager";
import { drawImage } from "../lib";
import Entity, { IEntity, IEntityOptions } from "./entity";

/*
 * - sheet
 * - frames
 * - frame size
 * - frame delay (defaults 0)
 * - loop (defaults false - if false, then destroy at end)
 * ... other entity args
 */

interface IAnimationOptions extends IEntityOptions {
  spritesheetPath: string;
  spritesheetFrames: {
    sx: number;
    sy: number;
    sWidth: number;
    sHeight: number;
  }[];
  frameDelay?: number;
  loop?: boolean;
  onEnd?: (animation: Animation) => void;
}

interface IAnimation extends IEntity {
  spritesheetPath: string;
  spritesheetFrames: {
    sx: number;
    sy: number;
    sWidth: number;
    sHeight: number;
  }[];
  frameWaitSize: number;
  loop: boolean;
  onEnd: (animation: Animation) => void;
}

export default class Animation extends Entity implements IAnimation {
  frame = 0;
  frameWait = 0;
  frameWaitSize;

  spritesheetPath;
  spritesheetFrames;

  loop = false;
  finished = false;
  finishedErrorLogged = false;

  onEnd;

  constructor(options: IAnimationOptions) {
    super(options);
    this.spritesheetPath = options.spritesheetPath;
    this.spritesheetFrames = options.spritesheetFrames;
    this.frameWaitSize = options.frameDelay ?? 0;
    this.loop = options.loop ?? false;
    this.onEnd = options.onEnd ?? (() => null);
  }

  draw() {
    super.draw();

    // Don't play animations that should be finished
    if (this.finished) {
      if (!this.finishedErrorLogged) {
        console.error(
          `An animation finished but wasn't removed from the game: ${this.id}. This could lead to memory issues!`
        );
        this.finishedErrorLogged = true;
      }
      return;
    }

    const image = ImageManager.getSync(this.spritesheetPath);
    if (!image) return;

    drawImage({
      image,
      ...this.position,
      ...this.size,
      sheet: this.spritesheetFrames[this.frame],
      context: this.game.context,
    });

    this.frameWait++;
    if (this.frameWait < this.frameWaitSize) return;

    this.frameWait = 0;
    this.frame =
      this.frame < this.spritesheetFrames.length - 1 ? this.frame + 1 : 0;

    if (this.frame === 0 && !this.loop) {
      this.finished = true;
      this.onEnd(this);
    }
  }
}

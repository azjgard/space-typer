import Entity, { IEntityOptions } from "./entity";

import shipHealth4 from "../../assets/sprites/ship/ship-health-4.png";
import shipHealth3 from "../../assets/sprites/ship/ship-health-3.png";
import shipHealth2 from "../../assets/sprites/ship/ship-health-2.png";
import shipHealth1 from "../../assets/sprites/ship/ship-health-1.png";

import engineSpritesheet from "../../assets/sprites/ship/engine-spritesheet.png";

const healthMap = {
  "4": shipHealth4,
  "3": shipHealth3,
  "2": shipHealth2,
  "1": shipHealth1,
  "0": shipHealth1,
  default: shipHealth4,
};

const PLAYER_SCALE = 2.5;

// This should match the dimensions of the player ship's image
const SHIP_SPRITE_DEFAULT_SIZE = 48;
const SHIP_SPRITE_SIZE = SHIP_SPRITE_DEFAULT_SIZE * PLAYER_SCALE;

// This should match the dimensions of a single sprite in the engine spritesheet
const ENGINE_SPRITE_DEFAULT_SIZE = 48;
const ENGINE_SPRITE_SIZE = ENGINE_SPRITE_DEFAULT_SIZE * PLAYER_SCALE;
const ENGINE_SPRITE_FRAME_SIZE = 48;
const ENGINE_SPRITE_OFFSETS = {
  x: -26,
  y: -1,
};
const ENGINE_SPRITESHEET_FRAMES: {
  sx: number;
  sy: number;
}[] = [
  {
    sx: 0,
    sy: 0,
  },
  {
    sx: 0,
    sy: ENGINE_SPRITE_FRAME_SIZE,
  },
  {
    sx: 0,
    sy: ENGINE_SPRITE_FRAME_SIZE * 2,
  },
  {
    sx: 0,
    sy: ENGINE_SPRITE_FRAME_SIZE * 3,
  },
];

import { generateSinWave } from "../utils";
import { drawImage } from "../lib";
import ImageManager from "../ImageManager";

interface IPlayerOptions extends Omit<IEntityOptions, "type" | "id"> {}

export default class Player extends Entity {
  static PLAYER_SIZE = SHIP_SPRITE_SIZE;

  private health: number = 4;

  wave = generateSinWave();

  engineCurrentFrame = 0;
  engineCurrentFrameWait = 0;
  engineFrameWaitSize = 4;

  constructor(options: IPlayerOptions) {
    super({
      ...options,
      type: "player",
      id: "player",
      size: {
        width: Player.PLAYER_SIZE,
        height: Player.PLAYER_SIZE,
      },
      sprite: {
        path: shipHealth4,
      },
    });
  }

  update(...args: any[]) {
    this.velocity.y = (this.wave.next().value as number) * 1;
    super.update(args[0], args[1]);
  }

  draw() {
    super.draw();
    this.drawEngine();
  }

  drawEngine() {
    const image = ImageManager.getSync(engineSpritesheet);
    if (!image) return;

    drawImage({
      image,
      x: this.position.x + ENGINE_SPRITE_OFFSETS.x,
      y: this.position.y - ENGINE_SPRITE_OFFSETS.y,
      width: ENGINE_SPRITE_SIZE,
      height: ENGINE_SPRITE_SIZE,
      deg: 0,
      flip: false,
      flop: false,
      center: false,
      sheet: {
        sWidth: ENGINE_SPRITE_FRAME_SIZE,
        sHeight: ENGINE_SPRITE_FRAME_SIZE,
        sx: ENGINE_SPRITESHEET_FRAMES[this.engineCurrentFrame].sx,
        sy: ENGINE_SPRITESHEET_FRAMES[this.engineCurrentFrame].sy,
      },

      context: this.game.context,
    });

    this.engineCurrentFrameWait++;
    if (this.engineCurrentFrameWait < this.engineFrameWaitSize) return;

    this.engineCurrentFrameWait = 0;
    this.engineCurrentFrame =
      this.engineCurrentFrame < ENGINE_SPRITESHEET_FRAMES.length - 1
        ? this.engineCurrentFrame + 1
        : 0;
  }

  public setHealth(cb: (health: number) => number) {
    this.health = cb(this.health);

    // TODO: animate the transition between sprites

    const key = (String(this.health) ?? "default") as keyof typeof healthMap;
    this.setSprite({
      path: healthMap[key],
    });
  }
}

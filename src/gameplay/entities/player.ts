import Entity, { IEntityOptions } from "./entity";

import engineFrames from "../../assets/sprites/ship/engine-spritesheet.json";

const healthMap = {
  "4": "playerShipHealth4",
  "3": "playerShipHealth3",
  "2": "playerShipHealth2",
  "1": "playerShipHealth1",
  "0": "playerShipHealth1",
  default: "playerShipHealth4",
} as const;

const PLAYER_SCALE = 2.5;

// This should match the dimensions of the player ship's image
const SHIP_SPRITE_DEFAULT_SIZE = 48;
const SHIP_SPRITE_SIZE = SHIP_SPRITE_DEFAULT_SIZE * PLAYER_SCALE;

// This should match the dimensions of a single sprite in the engine spritesheet
const ENGINE_SPRITE_FRAME_SIZE = 48;
const ENGINE_SPRITE_OFFSETS = {
  x: -26,
  y: -1,
};

import { generateSinWave } from "../utils";
import { FRAME_SIZE_MS } from "..";
import Animation from "./animation";

interface IPlayerOptions extends Omit<IEntityOptions, "type" | "id"> {}

export default class Player extends Entity {
  static PLAYER_SIZE = SHIP_SPRITE_SIZE;

  private health: number = 4;

  wave = generateSinWave();

  engineAnimation;

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
        path: "playerShipHealth4",
      },
    });

    this.engineAnimation = this.game.createEntity(Animation, {
      id: "player-engine-animation",
      position: this.position,
      size: this.size,
      spritesheetPath: "playerEngineSpritesheet",
      spritesheetFrames: engineFrames.map((f) => ({
        ...f,
        sWidth: ENGINE_SPRITE_FRAME_SIZE,
        sHeight: ENGINE_SPRITE_FRAME_SIZE,
      })),
      frameDelay: 4,
      loop: true,
    });
  }

  update(delta: number) {
    this.velocity.y = (this.wave.next().value as number) * 50;

    super.update(delta);

    this.engineAnimation.position = {
      x: this.position.x + ENGINE_SPRITE_OFFSETS.x,
      y: this.position.y - ENGINE_SPRITE_OFFSETS.y,
    };
  }

  damage(amount = 1) {
    this.setHealth(Math.max(this.health - amount, 0));
  }

  private setHealth(health: number) {
    this.health = health;

    // TODO: animate the transition between sprites

    const key = (String(this.health) ?? "default") as keyof typeof healthMap;
    this.setSprite({
      path: healthMap[key],
    });
  }
}

import Entity, { IEntityOptions } from "./entity";
import enemySpritesheet from "../../assets/sprites/enemies/ship-spritesheet.png";

type IEnemyOptions = Omit<IEntityOptions, "type"> & {};

export default class Enemy1 extends Entity {
  public static width = 64;
  public static height = 64;
  public static startingVelocity = -1;

  constructor(options: IEnemyOptions) {
    super({
      ...options,
      type: "enemy-1",
      sprite: {
        path: enemySpritesheet,
        sheet: {
          sx: 0,
          sy: 0,
          sWidth: 32,
          sHeight: 32,
        },
      },
      size: { width: Enemy1.width, height: Enemy1.height },
      velocity: { x: Enemy1.startingVelocity, y: 0 },
    });
  }
}

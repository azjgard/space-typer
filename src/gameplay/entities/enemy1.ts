import Entity, { IEntityOptions } from "./entity";
import enemySpritesheet from "../../assets/sprites/enemies/ship-spritesheet.png";

type IEnemyOptions = Omit<IEntityOptions, "type"> & {};

export default class Enemy1 extends Entity {
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
      size: { width: 64, height: 64 },
      velocity: { x: -1, y: 0 },
    });
  }
}

import Entity, { IEntityOptions } from "./entity";

import shipHealth4 from "../../assets/sprites/ship/ship-health-4.png";
import shipHealth3 from "../../assets/sprites/ship/ship-health-3.png";
import shipHealth2 from "../../assets/sprites/ship/ship-health-2.png";
import shipHealth1 from "../../assets/sprites/ship/ship-health-1.png";

const healthMap = {
  "4": shipHealth4,
  "3": shipHealth3,
  "2": shipHealth2,
  "1": shipHealth1,
  "0": shipHealth1,
  default: shipHealth4,
};

import { generateSinWave } from "../utils";

interface IPlayerOptions extends Omit<IEntityOptions, "type" | "id"> {}

export default class Player extends Entity {
  static PLAYER_SIZE = 120;

  private health: number = 4;

  wave = generateSinWave();

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

  public setHealth(cb: (health: number) => number) {
    this.health = cb(this.health);

    // TODO: animate the transition between sprites

    const key = (String(this.health) ?? "default") as keyof typeof healthMap;
    this.setSprite({
      path: healthMap[key],
    });
  }
}

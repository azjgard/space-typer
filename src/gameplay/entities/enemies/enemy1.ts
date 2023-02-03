import {
  ENEMY_TEXT_COLOR_DEFAULT,
  ENEMY_TEXT_FONT_DEFAULT,
} from "../../../../config";
import { randomInRange } from "../../lib";
import { generateSinWave } from "../../utils";
import Enemy, { IEnemyOptions } from "../enemy";

interface IEnemy1Options extends IEnemyOptions {}

export default class Enemy1 extends Enemy {
  public static width = 64;
  public static height = 64;
  public static startingVelocity = [-50, -80] as const;

  initialPosition: { x: number; y: number } | null;

  wave = generateSinWave();

  constructor(options: IEnemy1Options) {
    const length = options.word.length;

    let sx: number, sy: number;
    switch (length) {
      case 0:
        (sx = 0), (sy = 0);
        break;
      case 1:
        (sx = 1), (sy = 0);
        break;
      case 2:
        (sx = 2), (sy = 0);
        break;
      case 3:
        (sx = 0), (sy = 1);
        break;
      case 4:
        (sx = 1), (sy = 1);
        break;
      case 5:
        (sx = 2), (sy = 1);
        break;
      case 6:
        (sx = 0), (sy = 2);
        break;
      case 7:
        (sx = 1), (sy = 2);
        break;
      case 8:
        (sx = 2), (sy = 2);
        break;
      default:
        throw new Error("words too long bruh");
    }

    super({
      ...options,
      type: "enemy-1",
      sprite: {
        path: "enemyShip",
        sheet: {
          sx: sx * 32,
          sy: sy * 32,
          sWidth: 32,
          sHeight: 32,
        },
      },
      text: {
        value: options.word,
        fillStyle: ENEMY_TEXT_COLOR_DEFAULT,
        font: ENEMY_TEXT_FONT_DEFAULT,
      },
      size: { width: Enemy1.width, height: Enemy1.height },
      velocity: {
        x: randomInRange(...Enemy1.startingVelocity),
        y: 0,
      },
    });

    this.initialPosition = options.position ?? null;
  }

  update(delta: number) {
    this.velocity.y = (this.wave.next().value as number) * 20;
    super.update(delta);
  }
}

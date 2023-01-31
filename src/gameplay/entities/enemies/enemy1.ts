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
  public static startingVelocity = [-30, -200] as const;

  initialPosition: { x: number; y: number } | null;

  wave = generateSinWave();

  constructor(options: IEnemy1Options) {
    super({
      ...options,
      type: "enemy-1",
      sprite: {
        path: "enemyShip",
        sheet: {
          sx: 32 * 2,
          sy: 32 * 2,
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

import {
  ENEMY_TEXT_COLOR_DEFAULT,
  ENEMY_TEXT_FONT_DEFAULT,
} from "../../../config";
import enemySpritesheet from "../../assets/sprites/enemies/ship-spritesheet.png";
import { generateSinWave } from "../utils";
import Enemy, { IEnemyOptions } from "./enemy";

interface IEnemy1Options extends IEnemyOptions {}

export default class Enemy1 extends Enemy {
  public static width = 64;
  public static height = 64;
  public static startingVelocity = -2;

  initialPosition: { x: number; y: number } | null;

  wave = generateSinWave();

  constructor(options: IEnemy1Options) {
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
      text: {
        value: options.word,
        fillStyle: ENEMY_TEXT_COLOR_DEFAULT,
        font: ENEMY_TEXT_FONT_DEFAULT,
      },
      size: { width: Enemy1.width, height: Enemy1.height },
      velocity: { x: Enemy1.startingVelocity, y: 0 },
    });

    this.initialPosition = options.position ?? null;
  }

  update(...args: any[]) {
    this.velocity.y = (this.wave.next().value as number) * 1;
    super.update(args[0], args[1]);
  }
}

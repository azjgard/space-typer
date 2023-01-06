import Entity, { IEntityOptions } from "./entity";
import enemySpritesheet from "../../assets/sprites/enemies/ship-spritesheet.png";

type IEnemyOptions = Omit<IEntityOptions, "type"> & {
  word: string;
};

export default class Enemy1 extends Entity {
  public static width = 64;
  public static height = 64;
  public static startingVelocity = -1;

  initialPosition: { x: number; y: number } | null;

  wave = generateSinWave();

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
      text: {
        value: options.word,
        getPosition: (e) => ({ x: e.position.x, y: e.position.y }),
        fillStyle: "black",
        font: "32px serif",
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

function* generateSinWave() {
  let x = Math.random();
  while (true) {
    x += 0.1;
    if (x > Math.PI * 2) {
      x = 0;
    }
    yield Math.sin(x);
  }
}

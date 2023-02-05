import Entity, { IEntityOptions } from "./entity";
import { ENEMY_TEXT_FONT_DEFAULT } from "../../../config";

type IFadeTextOptions = Omit<IEntityOptions, "text"> & {
  text: string;
  color: string;
  ttl: number;
};

export class FadeText extends Entity {
  timeCurrent = 0;
  timeToLive;

  r: string;
  g: string;
  b: string;

  constructor(options: IFadeTextOptions) {
    super({
      ...options,
      text: [
        {
          font: ENEMY_TEXT_FONT_DEFAULT,
          value: options.text,
          fillStyle: options.color,
        },
      ],
    });

    if (!/rgb/.test(options.color)) {
      throw new Error(`FadeText color must be in rgb format: ${options.color}`);
    }

    const [r, g, b] = options.color
      .split(",")
      .map((s) => s.match(/(\d|\.)+/)![0]);

    this.r = r;
    this.g = g;
    this.b = b;

    this.timeToLive = options.ttl;
  }

  update(delta: number) {
    super.update(delta);

    this.timeCurrent += delta * 1000;
    if (this.timeCurrent >= this.timeToLive) {
      this.game.removeEntity(this);
    }

    const alpha = 1 - this.timeCurrent / this.timeToLive;
    this.setText([
      {
        font: ENEMY_TEXT_FONT_DEFAULT,
        value: (this.text || [])[0].value,
        fillStyle: `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`,
      },
    ]);
  }
}

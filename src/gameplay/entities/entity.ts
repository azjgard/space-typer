import * as uuid from "uuid";
import { Game } from "../game";
import ImageManager from "../ImageManager";
import { drawImage, entitiesColliding } from "../lib";

export interface IGameObject {
  game: Game;
}

export type DrawEntityArgs = [CanvasRenderingContext2D];
export type UpdateEntityArgs = [{ [entityId: string]: Entity }, number];

interface IText {
  value: string;
  font: string;
  fillStyle: string;
  background?: string;
}

interface ISpriteOptions {
  path: string;
  sheet?: {
    sx: number;
    sy: number;
    sWidth: number;
    sHeight: number;
  };
}

export interface IEntityOptions extends IGameObject {
  id: string;
  active?: boolean;
  game: Game;
  type?: string;
  position?: {
    x: number;
    y: number;
  };
  size?: {
    width: number;
    height: number;
  };
  velocity?: { x: number; y: number };
  acceleration?: {
    x: number;
    y: number;
  };
  direction?: number;
  fillStyle?: string;
  strokeStyle?: string;

  sprite?: ISpriteOptions;

  text?: IText | IText[];
}

export interface IEntity {
  id: string;
  getIsActive: () => boolean;
  type: string;
  position: { x: number; y: number };
  direction: number;
  size: { width: number; height: number };
  acceleration: { x: number; y: number };
  velocity: { x: number; y: number };

  fillStyle?: string;
  strokeStyle?: string;

  sprite?: {
    path: string;
    loaded?: boolean;
    image?: HTMLImageElement;
    sheet?: {
      sx: number;
      sy: number;
      sWidth: number;
      sHeight: number;
    };
  };

  text?: IText[];
}

type IEntityWithGame = IEntity & { game: Game };

export default class Entity implements IEntityWithGame {
  id;
  type;
  position;
  direction;
  size;
  acceleration;
  velocity;

  protected active: boolean = true;

  fillStyle;
  strokeStyle;
  sprite: IEntity["sprite"];
  text;

  game;

  constructor(options: IEntityOptions) {
    if (!options.position) {
      console.error("Cannot initialize an entity without a position", options);
      throw new Error("Cannot initialize an entity without a position");
    }
    if (!options.size) {
      console.error("Cannot initialize an entity without a size", options);
      throw new Error("Cannot initialize an entity without a size");
    }

    this.id = options.id || uuid.v4();
    this.position = options.position;
    this.size = options.size;
    this.acceleration = options.acceleration || { x: 0, y: 0 };
    this.velocity = options.velocity || { x: 0, y: 0 };
    this.fillStyle = options.fillStyle || undefined;
    this.strokeStyle = options.strokeStyle || undefined;
    this.type = options.type || "UNKNOWN";
    this.direction = options.direction || 1;

    if (options.active !== undefined) {
      this.active = options.active;
    }

    this.text = Array.isArray(options.text)
      ? options.text
      : options.text
      ? [options.text]
      : undefined;

    if (options.sprite) {
      this.setSprite(options.sprite);
    }

    this.game = options.game;
  }

  setSprite(options: ISpriteOptions) {
    this.sprite = { ...options };
    ImageManager.getAsync(this.sprite.path).then((image) => {
      if (!this.sprite) return;
      this.sprite.image = image;
      this.sprite.loaded = true;
    });
  }

  draw() {
    if (!this.active) return;

    const { context } = this.game;

    if (this.strokeStyle) {
      context.strokeStyle = this.strokeStyle;
      context.beginPath();
      context.moveTo(this.position.x, this.position.y);
      context.lineTo(this.position.x + this.size.width, this.position.y);
      context.lineTo(
        this.position.x + this.size.width,
        this.position.y + this.size.height
      );
      context.lineTo(this.position.x, this.position.y + this.size.height);
      context.lineTo(this.position.x, this.position.y);
      context.stroke();
      (context as any).strokeStyle = undefined;
    }

    if (this.fillStyle) {
      context.fillStyle = this.fillStyle;
      context.fillRect(
        this.position.x,
        this.position.y,
        this.size.width,
        this.size.height
      );
      (context as any).fillStyle = undefined;
    }

    if (this.sprite?.image && this.sprite.loaded) {
      const flipped = this.direction === -1;
      this.drawImage({
        image: this.sprite.image,
        x: this.position.x,
        y: this.position.y,
        width: this.size.width,
        height: this.size.height,
        deg: 0,
        flip: flipped,
        flop: false,
        center: false,
      });
    }

    if (this.text) {
      const textWidth = this.computeTextWidth();
      this.drawText(this.position.x + textWidth / 2, this.position.y);
    }
  }

  activate() {
    this.active = true;
  }
  deactivate() {
    this.active = false;
  }
  getIsActive() {
    return this.active;
  }

  update(..._args: UpdateEntityArgs) {
    if (!this.active) return;
    this.position.y += this.velocity.y;
    this.position.x += this.velocity.x;
  }

  isCollidingWith(entity: Entity) {
    return entitiesColliding(this, entity);
  }

  private drawImage(args: DrawImageArgs) {
    if (!this.sprite) {
      return;
    }

    const { context } = this.game;
    drawImage({
      ...args,
      context,
      sheet: this.sprite.sheet,
    });
  }

  private drawText(x: number, y: number) {
    if (!this.text) {
      return;
    }

    const { context } = this.game;

    let defaultFillStyle = context.fillStyle;
    let defaultFont = context.font;

    this.text.forEach(({ value, fillStyle, font }) => {
      context.fillStyle = fillStyle || defaultFillStyle;
      context.font = font || defaultFont;
      context.fillText(value, x, y);
      x += context.measureText(value).width;
    });
  }

  private computeTextWidth() {
    if (!this.text) {
      return 0;
    }

    const { context } = this.game;

    let width = 0;
    this.text.forEach((t) => {
      context.fillStyle = t.fillStyle;
      context.font = t.font;
      width += this.game.context.measureText(t.value).width;
    });
    return width;
  }
}

interface DrawImageArgs {
  image: CanvasImageSource;
  x: number;
  y: number;
  width: number;
  height: number;
  deg: number;
  flip: boolean;
  flop: boolean;
  center: boolean;
}

import * as uuid from "uuid";
import { Game } from "../game";

export interface IGameObject {
  game: Game;
}

export type DrawEntityArgs = [CanvasRenderingContext2D];
export type UpdateEntityArgs = [{ [entityId: string]: Entity }, number];

export interface IEntityOptions extends IGameObject {
  id: string;
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

  sprite?: {
    path: string;
    sheet?: {
      sx: number;
      sy: number;
      sWidth: number;
      sHeight: number;
    };
  };

  text?: {
    value: string;
    font?: string;
    fontSize: string | number;
    background?: string;
    color?: string;
    getPosition: (e: Entity) => { x: number; y: number };
  };
}

export interface IEntity {
  id: string;
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

  text?: {
    value: string;
    font?: string;
    fontSize: string | number;
    background?: string;
    color?: string;
    getPosition: (e: Entity) => { x: number; y: number };
  };
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

    this.text = options.text;

    if (options.sprite) {
      this.sprite = { ...options.sprite };
      this.sprite.image = new Image();
      this.sprite.image.src = this.sprite.path;
      this.sprite.image.onload = () => {
        this.sprite!.loaded = true;
      };
    }

    this.game = options.game;
  }

  draw() {
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
      const fontSize = `${parseInt("" + this.text.fontSize)}px`;
      const font = this.text.font || "serif";
      context.font = `${fontSize} ${font}`;
      context.fillStyle = this.text.color || "black";
      const textSize = context.measureText(this.text.value);
      context.fillText(
        this.text.value,
        this.position.x + textSize.width / 2,
        this.position.y
      );
    }
  }

  update(..._args: UpdateEntityArgs) {
    this.position.y += this.velocity.y;
    this.position.x += this.velocity.x;
  }

  private drawImage(args: DrawImageArgs) {
    if (!this.sprite) {
      return;
    }

    const { context } = this.game;
    let { image, x, y, width, height, deg, flip, flop, center } = args;

    context.save();

    if (typeof width === "undefined") width = image.width as number;
    if (typeof height === "undefined") height = image.height as number;
    if (typeof center === "undefined") center = false;

    // Set rotation point to center of image, instead of top/left
    if (center) {
      x -= width / 2;
      y -= height / 2;
    }

    // Set the origin to the center of the image
    context.translate(x + width / 2, y + height / 2);

    // Rotate the canvas around the origin
    const rad = 2 * Math.PI - (deg * Math.PI) / 180;
    context.rotate(rad);

    // Flip/flop the canvas
    let flipScale;
    if (flip) flipScale = -1;
    else flipScale = 1;

    let flopScale;
    if (flop) flopScale = -1;
    else flopScale = 1;
    context.scale(flipScale, flopScale);

    // coordinates on the canvas to draw the image
    const dx = -width / 2;
    const dy = -height / 2;
    const dWidth = width;
    const dHeight = height;

    if (this.sprite.sheet) {
      context.drawImage(
        image,
        this.sprite.sheet.sx,
        this.sprite.sheet.sy,
        this.sprite.sheet.sWidth,
        this.sprite.sheet.sHeight,
        dx,
        dy,
        dWidth,
        dHeight
      );
    } else {
      context.drawImage(image, dx, dy, dWidth, dHeight);
    }

    context.restore();
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
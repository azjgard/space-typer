import * as uuid from "uuid";

export interface Game {
  removeEntity: (entity: Entity) => void;
}

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
  direction?: 0 | 1;
  fillStyle?: string;
  strokeStyle?: string;
  spritePath?: string;
}

export default class Entity {
  id: string;
  type: string;
  position: { x: number; y: number };
  direction: number;
  size: { width: number; height: number };
  acceleration: { x: number; y: number };
  velocity: { x: number; y: number };

  fillStyle?: string;
  strokeStyle?: string;
  _sprite?: HTMLImageElement | undefined;
  sprite?: HTMLImageElement;

  game: Game;

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

    if (options.spritePath) {
      this._sprite = new Image();
      this._sprite.src = options.spritePath;
      this._sprite.onload = () => {
        this.sprite = this._sprite;
      };
    }

    this.game = options.game;
  }

  draw(...args: DrawEntityArgs) {
    const [context] = args;

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

    if (this.sprite) {
      const flipped = this.direction === -1;
      drawImage(
        context,
        this.sprite,
        this.position.x,
        this.position.y,
        this.size.width,
        this.size.height,
        0,
        flipped,
        false,
        false
      );
    }
  }

  update(..._args: UpdateEntityArgs) {
    this.position.y += this.velocity.y;
    this.position.x += this.velocity.x;
  }
}

function drawImage(
  context: CanvasRenderingContext2D,
  img: CanvasImageSource,
  x: number,
  y: number,
  width: number,
  height: number,
  deg: number,
  flip: boolean,
  flop: boolean,
  center: boolean
) {
  context.save();

  if (typeof width === "undefined") width = img.width as number;
  if (typeof height === "undefined") height = img.height as number;
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

  // Draw the image
  context.drawImage(img, -width / 2, -height / 2, width, height);

  context.restore();
}

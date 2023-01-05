import Entity, {
  DrawEntityArgs,
  IEntityOptions,
  UpdateEntityArgs,
} from "./entity";

interface IHitBoxOptions extends IEntityOptions {
  passthroughEntityIds?: Set<string>;
  duration?: number;
  hitPower?: number;
  hitDirection?: number;
  hitLift?: number;
}

export default class Hitbox extends Entity {
  passThroughEntityIds: Set<string> = new Set();
  duration: number;
  durationElapsed: number;
  hitPower: number;
  hitDirection: number;
  hitLift: number;

  constructor(options: IHitBoxOptions) {
    super({
      ...options,
      type: "hitbox",
    });

    this.passThroughEntityIds = options.passthroughEntityIds || new Set();
    this.duration = options.duration || 10;
    this.durationElapsed = 0;

    this.hitPower = options.hitPower || 1;
    this.hitDirection = options.hitDirection || 1;
    this.hitLift = options.hitLift || 1;
  }

  draw(...args: DrawEntityArgs) {
    super.draw(...args);
  }

  update(...args: UpdateEntityArgs) {
    const [entities, delta] = args;

    super.update(entities, delta);

    if (this.durationElapsed >= this.duration) {
      this.game.removeEntity(this);
      return;
    }

    this.durationElapsed++;
  }

  canHit(entity: Entity) {
    return !this.passThroughEntityIds.has(entity.id);
  }

  getHitInfo() {
    return {
      power: this.hitPower,
      direction: this.hitDirection,
      lift: this.hitLift,
    };
  }
}

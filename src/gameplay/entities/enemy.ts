import Entity, { IEntityOptions, UpdateEntityArgs } from "./entity";

export type IEnemyOptions = IEntityOptions & {
  word: string;
  endEntity: Entity;
};

export default abstract class Enemy extends Entity {
  endEntity: Entity;

  constructor(options: IEnemyOptions) {
    super(options);
    this.endEntity = options.endEntity;
  }

  die() {}
}

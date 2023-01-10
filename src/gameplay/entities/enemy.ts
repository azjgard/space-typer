import Entity, { IEntityOptions } from "./entity";

export type IEnemyOptions = IEntityOptions & {
  word: string;
  endEntity: Entity;
};

export default abstract class Enemy extends Entity {
  endEntity: Entity;
  word: string;

  constructor(options: IEnemyOptions) {
    super(options);
    this.endEntity = options.endEntity;
    this.word = options.word;
  }

  die() {}
}

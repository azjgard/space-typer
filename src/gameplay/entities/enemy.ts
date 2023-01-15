import Entity, { IEntityOptions } from "./entity";
import Explosion from "./explosion";

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

  explode() {
    const size = Explosion.SIZE * 2;
    return this.game.createEntity(Explosion, {
      id: `explosion-${this.id}`,
      position: {
        x: this.position.x - size / 2 + this.size.width / 2,
        y: this.position.y - size / 2 + this.size.height / 2,
      },
      size: {
        width: size,
        height: size,
      },
      onEnd: (explosion) => {
        this.game.removeEntity(explosion);
      },
    });
  }

  destroy() {
    super.destroy();
    this.explode();
  }

  getPoints() {
    return this.word.length;
  }
}

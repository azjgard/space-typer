import Entity, { IEntityOptions } from "./entity";

const canvas = document.createElement("canvas");
canvas.width = 1300;
canvas.height = 800;

let entities: { [entityId: string]: Entity } = {};

function createEntity(
  EntityClass: new (options: IEntityOptions) => Entity,
  entityArgs?: Omit<IEntityOptions & { id: string }, "game">
) {
  const entityId = entityArgs?.id;
  if (!entityId) {
    throw new Error("Missing entityId");
  }

  const entity = new EntityClass({ ...entityArgs, game });
  if (entities[entity.id]) {
    throw new Error("All entities must have a unique id");
  }

  entities[entity.id] = entity;
  return entity;
}

export function removeEntity(entity: Entity) {
  if (!entity.id) {
    throw new Error("Cannot remove an entity without an id");
  }
  if (!entities[entity.id]) {
    console.warn("Cannot remove an entity that is not being tracked");
    return;
  }
  delete entities[entity.id];
}

export function clearEntities() {
  entities = {};
}

export const game = {
  createEntity,
  removeEntity,
  entities,
  canvas,
  context: canvas.getContext("2d")!,
};

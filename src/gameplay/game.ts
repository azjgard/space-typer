import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../../config";
import Entity from "./entities/entity";

const canvas = document.createElement("canvas");
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

let entities: { [entityId: string]: Entity } = {};

function createEntity<C extends { new (...args: any[]): Entity }>(
  EntityClass: C,
  entityArgs?: Omit<ConstructorParameters<C>[0] & { id: string }, "game">
) {
  const entityId = entityArgs?.id;
  if (!entityId) {
    throw new Error("Missing entityId");
  }

  const entity: Entity = new EntityClass({ ...entityArgs, game });
  if (entities[entity.id]) {
    throw new Error("All entities must have a unique id");
  }

  entities[entity.id] = entity;
  return entity;
}

export function removeEntity<E extends Entity>(entity: E) {
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

export type Game = typeof game;

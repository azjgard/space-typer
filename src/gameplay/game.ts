import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../../config";
import Enemy from "./entities/enemy";
import Entity from "./entities/entity";

// TODO: literally all of this needs to be moved inside of a function

type GameEvents = { "enemy-destroyed": { enemyId: string } };
type GameEventListeners = {
  [key in keyof GameEvents]: ((data: GameEvents[key]) => void)[];
};

export function createGame() {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const app = document.querySelector("#game")!;
  app.appendChild(canvas);

  let active = false;
  let paused = false;
  let entities: { [entityId: string]: Entity } = {};
  let enemies: { [enemyId: string]: Enemy } = {};

  // TODO: allow registering custom event types to avoid hardcoding
  // them - probably need to move all of this inside a class / function
  // to allow passing in a generic for event types and for custom entity
  // types.
  let eventListeners: GameEventListeners = {
    "enemy-destroyed": [],
  };

  function on<E extends keyof GameEvents>(
    e: E,
    callback: GameEventListeners[E][number]
  ) {
    eventListeners[e].push(callback);
  }

  function off<E extends keyof GameEvents>(
    e: E,
    callback: GameEventListeners[E][number]
  ) {
    eventListeners[e] = eventListeners[e].filter((c) => c !== callback);
  }

  function emit<E extends keyof GameEvents>(e: E, data: GameEvents[E]) {
    eventListeners[e].forEach((cb) => cb(data));
  }

  function createEntity<
    E extends Entity,
    C extends { new (...args: any[]): E }
  >(EntityClass: C, entityArgs: Omit<ConstructorParameters<C>[0], "game">) {
    const entity = new EntityClass({
      ...entityArgs,
      game,
    }) as InstanceType<C>;
    if (entities[entity.id]) {
      throw new Error("All entities must have a unique id");
    }

    // TODO: allow registering custom entity types with the engines
    // to be cached and managed - probably need to move all of this
    // inside a class / function to allow passing in a generic custom
    // entity types.
    if (entity instanceof Enemy) {
      enemies[entity.id] = entity;
    }

    entities[entity.id] = entity;
    return entity as InstanceType<C>;
  }

  function removeEntity<E extends Entity>(entity: E) {
    if (!entity.id) {
      throw new Error("Cannot remove an entity without an id");
    }
    if (!entities[entity.id]) {
      console.warn("Cannot remove an entity that is not being tracked");
      return;
    }

    entity.destroy();

    if (entity instanceof Enemy) {
      delete enemies[entity.id];
    }

    delete entities[entity.id];
  }

  function clearEntities() {
    entities = {};
    enemies = {};
  }

  function start() {
    active = true;
  }

  function end() {
    active = false;
    clearEntities();
    app.removeChild(canvas);
  }

  var game = {
    createEntity,
    removeEntity,
    clearEntities,
    entities,
    enemies,
    canvas,
    context: canvas.getContext("2d")!,
    on,
    off,
    emit,
    getIsActive: () => active,
    start,
    end,
    togglePaused: () => {
      paused = !paused;
    },
    getIsPaused: () => paused,
  };

  return game;
}

export type Game = ReturnType<typeof createGame>;

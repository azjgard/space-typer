import Enemy from "./entities/enemy";
import Entity from "./entities/entity";
import { createCanvas, createDeltaTracker, IDeltaTracker } from "./lib";

export function createGame() {
  const canvas = createCanvas({
    class: "world",
  });
  const context = canvas.getContext("2d")!;

  const app = document.querySelector(".canvas-container")!;
  app.appendChild(canvas);

  let active = false;
  let paused = false;
  let entities: { [entityId: string]: Entity } = {};
  let enemies: { [enemyId: string]: Enemy } = {};
  let keyDownListeners: ((e: KeyboardEvent) => void)[] = [];

  function createEntity<
    E extends Entity,
    C extends { new (...args: any[]): E }
  >(EntityClass: C, entityArgs: Omit<ConstructorParameters<C>[0], "game">) {
    const entity = new EntityClass({
      ...entityArgs,
      game,
    }) as InstanceType<C>;
    if (entities[entity.id]) {
      throw new Error(entity.id + " is not unique");
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
    console.log("entity", entity);
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

  let deltaTracker: IDeltaTracker | null = null;

  const defaultUpdate = (delta: number) => {
    Object.entries(entities).forEach(([, entity]) => {
      entity.update(delta);
    });
  };

  const defaultDraw = () => {
    Object.entries(entities).forEach(([, entity]) => {
      entity.draw();
    });
  };

  let update: (delta: number, defaultFn: typeof defaultUpdate) => void = (
    delta
  ) => defaultUpdate(delta);

  let draw: (defaultFn: typeof defaultDraw) => void = () => defaultDraw();

  const loop = (timeNow = 0) => {
    // no updating if the game is inactive or paused
    if (!(active && !paused)) return;

    // update the time since the last frame
    deltaTracker!.track(timeNow);

    // get the time since the last frame
    const delta = deltaTracker!.get();

    // call the user-defined update method
    update(delta, defaultUpdate);

    context.clearRect(0, 0, canvas.width, canvas.height);

    // call the user-defined draw method
    draw(defaultDraw);

    requestAnimationFrame(loop);
  };

  let onStart = () => {};
  const _onKeyDown = (e: KeyboardEvent) => {
    const { ctrlKey, metaKey } = e;
    if (!(ctrlKey || metaKey)) e.preventDefault();
    keyDownListeners.forEach((fn) => fn(e));
  };

  function start() {
    active = true;
    deltaTracker = createDeltaTracker();
    onStart();
    requestAnimationFrame(loop);
    document.addEventListener("keydown", _onKeyDown);
  }

  function end() {
    active = false;
    paused = false;
    entities = {};
    enemies = {};
    keyDownListeners = [];
    document.removeEventListener("keydown", _onKeyDown);
  }

  function onKeyDown(fn: (e: KeyboardEvent) => void) {
    keyDownListeners.push(fn);
  }

  var game = {
    createEntity,
    removeEntity,
    entities,
    enemies,
    canvas,
    context,
    onKeyDown,
    getIsActive: () => active,
    setUpdate: (updateFn: typeof update) => (update = updateFn),
    setDraw: (drawFn: typeof draw) => (draw = drawFn),
    setStart: (fn: () => void) => (onStart = fn),
    start,
    end,
    togglePaused: () => {
      // "pausing" could cause weird behavior if
      // allowed while the game is not active
      if (!active) return;

      paused = !paused;

      // Reset origin time to avoid the delta continuing
      // to accrue while the game is paused
      if (paused) deltaTracker?.resetOriginTime();

      if (active && !paused) requestAnimationFrame(loop);
    },
    getIsPaused: () => paused,
  };

  return game;
}

export type Game = ReturnType<typeof createGame>;

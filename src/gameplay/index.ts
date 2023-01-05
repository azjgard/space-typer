import Entity from "./entity";
import { game, removeEntity } from "./game";
import { createTypingEngine } from "./typingEngine";
import createDebugger from "../debug";
import { DEBUG_GAME } from "../../config";

const debug = createDebugger(DEBUG_GAME);

export const DEBUG = true;
export const UPDATE_INTERVAL_MS = 16.66; // 60 fps
const FRAME_SIZE_MS = 1000 / 60;

const { entities, canvas, context } = game;

export const GROUND_SIZE = { height: 75, width: canvas.width };

const app = document.querySelector("#game")!;
app.appendChild(canvas);

export function initGameplay() {
  // const _player = game.createEntity(Entity, {
  //   id: "player",
  //   position: {
  //     x: 0,
  //     y: 0,
  //   },
  //   size: {
  //     width: 50,
  //     height: 50,
  //   },
  //   fillStyle: "black",
  //   strokeStyle: "red",
  // });

  const enemyIdFromWordId = (wordId: string) => `enemy-${wordId}`;

  const typingEngine = createTypingEngine();

  typingEngine.on("initializeLevel", function initializeLevel(state) {
    // clear out any existing enemies
    Object.values(game.entities).forEach((entity) => {
      if (entity.type === "enemy") {
        game.removeEntity(entity);
      }
    });

    // create a new entity for each word
    state.activeWordObjects.forEach((wordObject, i) => {
      game.createEntity(Entity, {
        id: enemyIdFromWordId(wordObject.id),
        type: "enemy",
        position: { x: game.canvas.width, y: 20 + i * 50 },
        size: { width: 30, height: 30 },
        velocity: { x: -2, y: 0 },
        fillStyle: "white",
      });
      // TODO: attach a text entity to the enemy entity so that it renders beneath it
    });
  });

  typingEngine.on("typedFullWord", (state) => {
    const destroyedEnemy = entities[enemyIdFromWordId(state.typedFullWordId)];
    if (!destroyedEnemy) {
      throw new Error("Can't destroy enemy that doesn't exist");
    }

    game.removeEntity(destroyedEnemy);
  });

  typingEngine.on("updateCurrentlyTypedWord", function attackEnemy(state) {
    if (!state.currentTargetId) {
      throw new Error("Can't attack enemy without a currentTargetId");
    }

    const targetedEnemy = entities[enemyIdFromWordId(state.currentTargetId)];
    if (!targetedEnemy) {
      throw new Error("Can't attack enemy that doesn't exist");
    }

    // TODO: replace this with a better animation
    targetedEnemy.fillStyle = "red";
    setTimeout(() => {
      targetedEnemy.fillStyle = "white";
    }, (FRAME_SIZE_MS * 60) / 10);
  });

  typingEngine.start();

  let timeOld = 0;
  let delta = 0;
  const update = (delta: number) => {
    const state = typingEngine.getState();

    Object.entries(entities).forEach(([, entity]) => {
      entity.update(entities, delta);
    });
  };

  const render = (timeNow = 0) => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    requestAnimationFrame(render);

    delta = (timeNow - timeOld) / 1000;
    timeOld = timeNow;

    Object.entries(entities).forEach(([, entity]) => {
      entity.draw(context);
    });
  };

  setInterval(() => update(0), FRAME_SIZE_MS);
  render();
}

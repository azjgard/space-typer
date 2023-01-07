import { game } from "./game";
import { createTypingEngine } from "./typingEngine";
import createDebugger from "../debug";
import { DEBUG_GAME } from "../../config";

import Enemy1 from "./entities/enemy1";
import { createHealthManager } from "./healthManager";
import Player from "./entities/player";

const debug = createDebugger(DEBUG_GAME);

export const DEBUG = true;
export const UPDATE_INTERVAL_MS = 16.66; // 60 fps
const FRAME_SIZE_MS = 1000 / 60;

const { entities, canvas, context } = game;

export const GROUND_SIZE = { height: 75, width: canvas.width };

const app = document.querySelector("#game")!;
app.appendChild(canvas);

const enemyIdFromWordId = (wordId: string) => `enemy-${wordId}`;

export function initGameplay() {
  const typingEngine = createTypingEngine();

  typingEngine.on("initializeLevel", async function initializeLevel(state) {
    // clear out any existing enemies
    Object.values(game.entities).forEach((entity) => {
      if (/enemy/.test(entity.type)) {
        game.removeEntity(entity);
      }
    });

    let entityIds: string[] = [];
    for (let i = 0; i < state.activeWordObjects.length; i++) {
      const awo = state.activeWordObjects[i];
      const entityId = enemyIdFromWordId(awo.id);
      game.createEntity(Enemy1, {
        id: entityId,
        active: false,
        position: { x: game.canvas.width, y: 30 + i * (Enemy1.height + 30) },
        word: awo.word,
      });
      entityIds.push(entityId);
    }

    // Stagger activation of enemies in the wave
    for (let i = 0; i < entityIds.length; i++) {
      entities[entityIds[i]].activate();
      await new Promise((r) => setTimeout(r, Math.random() * 500 + 200));
    }
  });

  typingEngine.on("typedFullWord", function destroyEnemy(state) {
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
      targetedEnemy.fillStyle = undefined;
    }, (FRAME_SIZE_MS * 60) / 10);
  });

  typingEngine.start();

  const healthManager = createHealthManager(game);

  const player = game.createEntity(Player, {
    size: {
      width: 100,
      height: 100,
    },
    position: {
      x: 35,
      y: game.canvas.height / 2 - 50 / 2,
    },
  });

  let timeOld = 0;
  let delta = 0;
  const update = (delta: number) => {
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
      entity.draw();
    });

    healthManager.draw();
  };

  setInterval(() => update(0), FRAME_SIZE_MS);
  render();
}

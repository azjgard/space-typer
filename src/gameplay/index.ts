import { game } from "./game";
import { createTypingEngine } from "./typingEngine";
import createDebugger from "../debug";
import {
  DEBUG_GAME,
  ENEMY_TEXT_COLOR_DEFAULT,
  ENEMY_TEXT_COLOR_TYPED,
  ENEMY_TEXT_FONT_DEFAULT,
  ENEMY_TEXT_FONT_TYPED,
} from "../../config";

import Enemy1 from "./entities/enemy1";
import { createHealthManager } from "./healthManager";
import Player from "./entities/player";
import Enemy from "./entities/enemy";
import Entity from "./entities/entity";

const debug = createDebugger(DEBUG_GAME);

export const DEBUG = true;
export const UPDATE_INTERVAL_MS = 16.66; // 60 fps
const FRAME_SIZE_MS = 1000 / 60;

const { entities, enemies, canvas, context } = game;

export const GROUND_SIZE = { height: 75, width: canvas.width };

const app = document.querySelector("#game")!;
app.appendChild(canvas);

const enemyIdFromWordId = (wordId: string) => `enemy-${wordId}`;

export function initGameplay() {
  const endEntity = game.createEntity(Entity, {
    id: "endEntity",
    position: { x: 0, y: 0 },
    size: { width: 120, height: game.canvas.height },
  });

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
        endEntity,
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
      return;
    }

    game.removeEntity(destroyedEnemy);
  });

  typingEngine.on("updateCurrentlyTypedWord", function attackEnemy(state) {
    if (!state.currentTargetId) {
      // This is a valid scenario (apparently?) when an enemy who is in the middle
      // of being attacked ends up running into the end barrier
      return;
    }

    const targetedEnemy = enemies[enemyIdFromWordId(state.currentTargetId)];
    if (!targetedEnemy) {
      throw new Error("Can't attack enemy that doesn't exist");
    }

    const fullWord = targetedEnemy.word;
    const typedWord = state.currentTypedWord;

    targetedEnemy.setText([
      {
        font: ENEMY_TEXT_FONT_TYPED,
        value: typedWord,
        fillStyle: ENEMY_TEXT_COLOR_TYPED,
      },
      {
        font: ENEMY_TEXT_FONT_DEFAULT,
        value: fullWord.replace(typedWord, ""),
        fillStyle: ENEMY_TEXT_COLOR_DEFAULT,
      },
    ]);
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
    if (!game.getIsActive()) return;

    Object.entries(entities).forEach(([, entity]) => {
      entity.update(entities, delta);
      if (entity instanceof Enemy) {
        const reachedEnd = entity.isCollidingWith(endEntity);
        if (reachedEnd) {
          entity.die();
          player.damage();
          game.removeEntity(entity);
          typingEngine.removeWord(entity.id.replace("enemy-", ""));

          const hasHealthStill = healthManager.damage();
          if (!hasHealthStill) {
            gameOver();
          }
        }
      }
    });
  };

  const render = (timeNow = 0) => {
    if (!game.getIsActive()) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    requestAnimationFrame(render);

    delta = (timeNow - timeOld) / 1000;
    timeOld = timeNow;

    Object.entries(entities).forEach(([, entity]) => {
      entity.draw();
    });

    healthManager.draw();
  };

  game.start();

  const updateInterval = setInterval(() => update(delta), FRAME_SIZE_MS);
  render();

  function gameOver() {
    // TODO: real game over
    clearInterval(updateInterval);
    document.body.removeChild(app);
    setTimeout(() => {
      console.log("Game over!");
      initGameplay();
    }, 20);
  }
}

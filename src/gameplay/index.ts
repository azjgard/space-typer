import { createGame } from "./game";
import { createTypingEngine } from "./typingEngine";
// import createDebugger from "../debug";
import {
  // DEBUG_GAME,
  ENEMY_TEXT_COLOR_DEFAULT,
  ENEMY_TEXT_COLOR_TYPED,
  ENEMY_TEXT_FONT_DEFAULT,
  ENEMY_TEXT_FONT_TYPED,
} from "../../config";

import clickSound from "../assets/sounds/click.wav";

import Enemy1 from "./entities/enemies/enemy1";
import HealthManager from "./entities/healthManager";
import ScoreManager from "./entities/scoreManager";
import Player from "./entities/player";
import Enemy from "./entities/enemy";
import Entity from "./entities/entity";
import { playSound, traverseUnitCircle } from "./utils";
import { initializePauseMenu } from "./keyboard";
import { createBackground } from "./background";

// const _debug = createDebugger(DEBUG_GAME);

export const DEBUG = true;
export const UPDATE_INTERVAL_MS = 16.66; // 60 fps
export const FRAME_SIZE_MS = 1000 / 60;

const enemyIdFromWordId = (wordId: string) => `enemy-${wordId}`;

// TODO: this is a hack to avoid refactoring right now, move this inside of the game
export let updateInterval: number = 0;

export function initGameplay() {
  createBackground();
  const game = createGame();

  const { entities, enemies, canvas, context } = game;
  initializePauseMenu(game);

  const endEntity = game.createEntity(Entity, {
    id: "endEntity",
    position: { x: 0, y: 0 },
    size: { width: 120, height: game.canvas.height },
  });

  const healthManager = game.createEntity(HealthManager, {
    id: "health-manager",
  });

  const scoreManager = game.createEntity(ScoreManager, {
    id: "score-manager",
    position: {
      x: healthManager.position.x,
      y: game.canvas.height / 2,
    },
    text: ScoreManager.getText("0000"),
  });
  game.context.font = scoreManager.text![0].font!;
  scoreManager.position = {
    x:
      healthManager.position.x +
      game.context.measureText(scoreManager.text![0].value).width / 2 +
      HealthManager.OFFSET,
    y: 105,
  };

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

  const typingEngine = createTypingEngine();

  typingEngine.on("initializeLevel", async function initializeLevel(state) {
    // clear out any existing enemies
    Object.values(game.entities).forEach((entity) => {
      if (/enemy/.test(entity.type)) {
        game.removeEntity(entity);
      }
    });

    let entityIds: string[] = [];

    const coordinateCalculator = traverseUnitCircle(Math.PI, 100, 300, {
      transform: ({ x, y }) => ({
        x: x + game.canvas.width / 2,
        y: y + game.canvas.height / 2,
      }),
    });
    for (let i = 0; i < state.activeWordObjects.length; i++) {
      const awo = state.activeWordObjects[i];
      const entityId = enemyIdFromWordId(awo.id);

      // const y = 30 + i * (Enemy1.height + 30);
      game.createEntity(Enemy1, {
        id: entityId,
        active: false,
        position: { x: game.canvas.width, y: coordinateCalculator.next().y },
        word: awo.word,
        endEntity,
      });
      entityIds.push(entityId);
    }

    // Stagger activation of enemies in the wave
    for (let i = 0; i < entityIds.length; i++) {
      entities[entityIds[i]].activate();
      await new Promise((r) => setTimeout(r, Math.random() * 800 + 1200));
    }
  });

  typingEngine.on("typedFullWord", function destroyEnemy(state) {
    const destroyedEnemy = enemies[enemyIdFromWordId(state.typedFullWordId)];
    if (!destroyedEnemy) {
      return;
    }

    playSound(clickSound);

    scoreManager.addPoints(destroyedEnemy.getPoints());
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

    if (!targetedEnemy.getIsActive()) {
      typingEngine.resetWord();
      return;
    }

    playSound(clickSound);

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

  // TODO: update and render should be handled by the game

  let timeOld = 0;
  let delta = 0;
  const update = (delta: number) => {
    if (!game.getIsActive() || game.getIsPaused()) return;

    Object.entries(entities).forEach(([, entity]) => {
      entity.update(entities, delta);
      if (entity instanceof Enemy) {
        const reachedEnd = entity.isCollidingWith(endEntity);
        if (reachedEnd) {
          player.damage();
          game.removeEntity(entity);
          typingEngine.removeWord(entity.id.replace("enemy-", ""));

          const hasHealthStill = healthManager.damage();
          if (!hasHealthStill) {
            gameOver(scoreManager.getScore());
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

  updateInterval = setInterval(() => update(delta), FRAME_SIZE_MS);
  render();

  function gameOver(_score: number) {
    game.end();
    clearInterval(updateInterval);

    // alert(`Game over! Your score was ${score}!`);
    setTimeout(() => {
      console.log("Game over!");
      initGameplay();
    }, 20);
  }
}

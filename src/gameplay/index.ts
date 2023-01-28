import { createGame } from "./game";
import { createTypingEngine } from "./typingEngine";
import {
  ENEMY_TEXT_COLOR_DEFAULT,
  ENEMY_TEXT_COLOR_TYPED,
  ENEMY_TEXT_FONT_DEFAULT,
  ENEMY_TEXT_FONT_TYPED,
} from "../../config";

import HealthManager from "./managers/HealthManager";
import ScoreManager from "./managers/ScoreManager";
import Player from "./entities/player";
import Entity from "./entities/entity";
import Enemy from "./entities/enemy";
import Enemy1 from "./entities/enemies/enemy1";

import { traverseUnitCircle } from "./utils";

import { createBackgroundManager } from "./managers/BackgroundManager";
import soundManager from "./managers/SoundManager";
import { createMenuManager } from "./managers/MenuManager";

export const DEBUG = true;
export const UPDATE_INTERVAL_MS = 16.66; // 60 fps
export const FRAME_SIZE_MS = 1000 / 60;

const enemyIdFromWordId = (wordId: string) => `enemy-${wordId}`;

export function initGameplay() {
  const game = createGame();
  const typingEngine = createTypingEngine();
  const backgroundManager = createBackgroundManager();
  const menuManager = createMenuManager();

  const mainMenu = menuManager.create({
    name: "main",
    getClickHandlers: ({ getMenu }) => ({
      play: () => {
        getMenu("main")?.hide();
        typingEngine.start();
        game.start();
      },
      options: () => {
        console.log("Options");
      },
      "high-scores": () => {
        console.log("High Scores");
      },
    }),
  });

  const pauseMenu = menuManager.create({
    name: "pause",
    getClickHandlers: ({ getMenu }) => ({
      resume: () => {
        game.togglePaused();
        getMenu("pause")?.hide();
      },
      restart: () => {
        console.log("restart");
      },
      quit: () => {
        console.log("quit");
      },
    }),
  });

  const { entities, enemies } = game;

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

  const VERTICAL_PADDING = 50;

  game.createEntity(Entity, {
    id: "illustrator",
    position: {
      x: 0,
      y: 0,
    },
    size: {
      width: game.canvas.width,
      height: VERTICAL_PADDING,
    },
    fillStyle: "red",
  });
  game.createEntity(Entity, {
    id: "illustrator1",
    position: {
      x: 0,
      y: game.canvas.height,
    },
    size: {
      width: game.canvas.width,
      height: VERTICAL_PADDING * -1,
    },
    fillStyle: "red",
  });

  typingEngine.on("waveStarted", async function startWave(state) {
    const { wordObjects } = state;
    const spawnSpace = game.canvas.height - VERTICAL_PADDING * 2;
    const yMargin = Math.floor(spawnSpace / wordObjects.length);

    console.log({
      height: game.canvas.height,
      spawnSpace,
      yMargin,
    });

    let entityIds: string[] = [];

    for (let i = 0; i < state.wordObjects.length; i++) {
      const awo = state.wordObjects[i];
      const entityId = enemyIdFromWordId(awo.id);
      console.log(entityId);

      const position = {
        x: game.canvas.width,
        y: VERTICAL_PADDING + yMargin * i + Enemy1.height / 2,
      };

      // const y = 30 + i * (Enemy1.height + 30);
      const e = game.createEntity(Enemy1, {
        id: `enemy-${awo.id}`,
        active: false,
        position,
        word: awo.word,
        endEntity,
        fillStyle: "green",
      });
      e.activate();
      entityIds.push(entityId);
    }

    // Stagger activation of enemies in the wave
    // for (let i = 0; i < entityIds.length; i++) {
    //   entities[entityIds[i]].activate();
    //   await new Promise((r) => setTimeout(r, Math.random() * 800 + 1200));
    // }
  });

  typingEngine.on("initializeLevel", async function initializeLevel(state) {
    console.log("Level " + state.currentLevel);
  });

  typingEngine.on("typedFullWord", function destroyEnemy(state) {
    const destroyedEnemy = enemies[enemyIdFromWordId(state.typedFullWordId)];
    if (!destroyedEnemy) {
      return;
    }

    soundManager.play("click");

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

    soundManager.play("click");

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

  game.setUpdate((delta) => {
    backgroundManager.update(delta);
    Object.entries(entities).forEach(([, entity]) => {
      entity.update(delta);
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
  });

  game.setDraw((fn) => {
    fn();
    healthManager.draw();
  });

  function gameOver(_score: number) {
    game.end();
    console.log("Game over!");
  }
}

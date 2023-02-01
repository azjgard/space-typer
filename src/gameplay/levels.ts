import { randomInRange } from "./lib";

type Enemy = "enemy1";

type EnemyConfig = {
  type: Enemy;
  // number between 0 and 1 that the enemy should spawn
  chance?: number;
} | null;

type Trigger =
  // triggered immediately, 1st wave in the level
  | { type: "first" }
  // triggered a certain amount of time after the last wave
  | { type: "time"; time: number }
  // triggered as soon as the previous wave is fully cleared
  | { type: "prevWaveCleared" };

export type Wave = {
  trigger: Trigger;
  characterCount?: number | [number, number];
  enemies: [
    EnemyConfig | null,
    EnemyConfig | null,
    EnemyConfig | null,
    EnemyConfig | null,
    EnemyConfig | null,
    EnemyConfig | null
  ];
};

export type Level = {
  characterCount: number | [number, number];
  waves: Wave[];
};

// defualt enemy
const de: EnemyConfig = { type: "enemy1" };

interface LevelConfig {
  wordLength: number | [number, number];
  waveCount: number | [number, number];
  waveTime: number | [number, number];
  getEnemies: (currentWave: number, totalWaves: number) => EnemyConfig[];
}

const getTrigger = (
  currentWave: number,
  totalWaves: number,
  time: LevelConfig["waveTime"]
): Trigger => {
  if (currentWave === 0) return { type: "first" };

  const ratio = currentWave / totalWaves;
  if (ratio < 3 / 5) {
    return { type: "prevWaveCleared" };
  }

  const t = Array.isArray(time) ? Math.round(randomInRange(...time)) : time;
  return { type: "time", time: t };
};

const generateLevel = (config: LevelConfig): Level => {
  const waves: Level["waves"] = [];
  const waveCount = Array.isArray(config.waveCount)
    ? Math.round(randomInRange(...config.waveCount))
    : config.waveCount;
  for (let i = 0; i < waveCount; i++) {
    const enemies = config.getEnemies(i + 1, waveCount);
    while (enemies.length < 6) {
      enemies.push(null);
    }

    waves.push({
      enemies: enemies as Wave["enemies"],
      trigger: getTrigger(i + 1, waveCount, config.waveTime),
      characterCount: config.wordLength,
    });
  }

  return {
    characterCount: 0, // will always use the wave's
    waves,
  };
};

const generateLevels = () => {
  const levels: Level[] = [];

  for (let i = 0; i < 200; i++) {
    let waveCount = 5;

    let waveTime;
    if (i < 20) waveTime = 3000;
    else if (i < 30) waveTime = 2700;
    else if (i < 40) waveTime = 2500;
    else waveTime = 2100;

    let wordLength: number | [number, number];
    if (i < 3) wordLength = [1, 2];
    else if (i < 6) wordLength = [2, 3];
    else if (i < 12) wordLength = [3, 4];
    else if (i < 20) wordLength = [3, 5];
    else if (i < 30) wordLength = [4, 6];
    else if (i < 40) wordLength = [5, 7];
    else wordLength = 7;

    levels.push(
      generateLevel({
        wordLength,
        getEnemies: (currentWave, numWaves) => {
          if (i > 20) return Array(6).fill(de);
          const ratio = currentWave / numWaves;

          let ratioThreshold;
          if (i < 5) ratioThreshold = 3 / 5;
          else if (i < 15) ratioThreshold = 2 / 5;
          else if (i < 25) ratioThreshold = 1 / 5;
          else ratioThreshold = -1;

          if (ratio < ratioThreshold) {
            return Array(Math.round(randomInRange(2, 5))).fill(de);
          } else {
            return Array(Math.round(randomInRange(4, 6))).fill(de);
          }
        },
        waveCount,
        waveTime,
      })
    );
  }

  return levels;
};

export const levels = generateLevels();

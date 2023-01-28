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
  characterCount?: number;
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
  characterCount: number;
  characters: string[];
  waves: Wave[];
};

// defualt enemy
const de: EnemyConfig = { type: "enemy1" };

const HOME_ROW = ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"];

export const levels: Level[] = [
  // level 1
  {
    characterCount: 3,
    characters: HOME_ROW,
    waves: [
      {
        trigger: { type: "first" },
        enemies: [de, de, de, de, de, de],
      },
      {
        trigger: { type: "time", time: 3000 },
        enemies: [null, de, null, de, null, de],
      },
      {
        trigger: { type: "time", time: 3000 },
        enemies: [de, de, de, de, de, de],
      },
      {
        trigger: { type: "time", time: 3000 },
        enemies: [de, null, de, null, de, null],
      },
      {
        trigger: { type: "prevWaveCleared" },
        enemies: [null, de, null, de, null, de],
      },
      {
        trigger: { type: "prevWaveCleared" },
        enemies: [de, de, de, de, de, de],
      },
      {
        trigger: { type: "prevWaveCleared" },
        enemies: [de, de, de, de, de, de],
      },
      {
        trigger: { type: "prevWaveCleared" },
        enemies: [de, de, de, de, de, de],
      },
      {
        trigger: { type: "prevWaveCleared" },
        enemies: [de, de, de, de, de, de],
      },
      {
        trigger: { type: "prevWaveCleared" },
        enemies: [de, de, de, de, de, de],
      },
      {
        trigger: { type: "prevWaveCleared" },
        enemies: [de, de, de, de, de, de],
      },
      {
        trigger: { type: "prevWaveCleared" },
        enemies: [de, de, de, de, de, de],
      },
    ],
  },
  // level 2
  {
    characterCount: 3,
    characters: HOME_ROW,
    waves: [
      {
        trigger: { type: "first" },
        enemies: [de, null, de, null, de, null],
      },
      {
        trigger: { type: "prevWaveCleared" },
        enemies: [null, de, null, de, null, de],
      },
      {
        trigger: { type: "prevWaveCleared" },
        enemies: [de, de, de, de, de, de],
      },
      {
        trigger: { type: "prevWaveCleared" },
        enemies: [de, de, de, de, de, de],
      },
      {
        trigger: { type: "prevWaveCleared" },
        enemies: [de, de, de, de, de, de],
      },
      {
        trigger: { type: "prevWaveCleared" },
        enemies: [de, de, de, de, de, de],
      },
    ],
  },
];

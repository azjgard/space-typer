import { Level, levels, Wave } from "./levels";

import list1 from "../assets/words/1.json";
import list2 from "../assets/words/2.json";
import list3 from "../assets/words/3.json";
import list4 from "../assets/words/4.json";
import list5 from "../assets/words/5.json";
import list6 from "../assets/words/6.json";
import list7 from "../assets/words/7.json";
import { randomInRange } from "./lib";

const lists = [list1, list2, list3, list4, list5, list6, list7] as const;

const generateWaveWords = (level: Level, wave: Wave) => {
  const count = wave.characterCount ?? level.characterCount;

  // the words in a wave
  const words: string[] = [];
  const firstLettersUsed = new Set<string>();

  for (let i = 0; i < wave.enemies.length; i++) {
    if (!wave.enemies[i]) continue;

    const listNumber = Array.isArray(count)
      ? Math.round(randomInRange(...count))
      : count;
    const list = lists[listNumber - 1];

    let word;
    do {
      word = list[Math.floor(Math.random() * list.length)];
    } while (firstLettersUsed.has(word[0]));

    firstLettersUsed.add(word[0]);
    words.push(word);
  }

  return words;
};

const handleIncorrectKey = (_keyTyped: string) => {
  // console.info(`Incorrect key typed: ${keyTyped}`);
};

interface WordObject {
  id: string;
  word: string;
  wave: number;
}

export interface TypingEngineState {
  active: boolean;
  currentLevel: number;
  currentTargetId: string | undefined;
  currentTypedWord: string;
  nextExpectedCharacter: string | undefined;
  activeWordObjects: WordObject[];
}

export interface TypingEngineEvents {
  initializeLevel: TypingEngineState;
  waveStarted: {
    wordObjects: { id: string; word: string }[];
  } & TypingEngineState;
  waveEnded: TypingEngineState;
  resetWordState: TypingEngineState;
  updateCurrentlyTypedWord: TypingEngineState;
  typedFullWord: TypingEngineState & { typedFullWordId: string };
}

const DEFAULT_STATE: TypingEngineState = {
  active: false,
  currentLevel: 0,
  currentTargetId: undefined,
  currentTypedWord: "",
  nextExpectedCharacter: undefined,
  activeWordObjects: [],
};

export const createTypingEngine = (args: {
  setTimeout: (cb: () => void, timeout: number) => void;
}) => {
  let state = { ...DEFAULT_STATE };

  const registeredEvents: {
    [key in keyof TypingEngineEvents]: ((
      arg: TypingEngineEvents[key]
    ) => void)[];
  } = {
    resetWordState: [],
    initializeLevel: [],
    updateCurrentlyTypedWord: [],
    typedFullWord: [],
    waveStarted: [],
    waveEnded: [],
  };

  const resetWordState = () => {
    state.currentTargetId = undefined;
    state.currentTypedWord = "";
    state.nextExpectedCharacter = undefined;

    registeredEvents.resetWordState.forEach((cb) => cb(state));
  };

  const initializeLevel = async (level: number) => {
    if (!state.active) return;

    state.currentLevel = level;

    const currentLevel = levels[level - 1];
    if (!currentLevel) {
      throw new Error("BRO no levels left, make some more");
    }

    // notify listeners that the level was initialized
    // - take note that the level initialization event is always
    // fired BEFORE the wave initialization event
    registeredEvents.initializeLevel.forEach((cb) => cb({ ...state }));

    // process all waves in the level
    await processWaves();

    if (!state.activeWordObjects.length) {
      await initializeLevel(level + 1);
    } else if (state.active) {
      await new Promise<void>((resolve) => {
        const cb = (state: TypingEngineState) => {
          // there are still one or more waves left,
          // so we shouldn't initialize the next level yet
          if (state.activeWordObjects.length) {
            return;
          }

          registeredEvents.waveEnded = registeredEvents.waveEnded.filter(
            (_cb) => _cb !== cb
          );

          resolve();
        };
        registeredEvents.waveEnded.push(cb);
      });

      await initializeLevel(level + 1);
    }

    async function processWaves(waveIndex = 0) {
      if (!state.active) return;

      const currentWave = currentLevel.waves[waveIndex];

      const wordsForWave = generateWaveWords(currentLevel, currentWave);
      const wordObjectsForWave: WordObject[] = wordsForWave.map((word, id) => ({
        id: `${waveIndex}-${id}`,
        word,
        wave: waveIndex,
      }));

      wordObjectsForWave.forEach((wo) => state.activeWordObjects.push(wo));

      // notify listeners that the wave was initialized
      // - take note that the wave initialization event is always
      // fired AFTER the level initialization event
      registeredEvents.waveStarted.forEach((cb) =>
        cb({ ...state, wordObjects: wordObjectsForWave })
      );

      const nextWave = currentLevel.waves[waveIndex + 1];
      if (nextWave && state.active) {
        await new Promise<void>((resolve) => {
          if (nextWave.trigger.type === "first") {
            throw new Error(
              "'first' trigger shouldn't be used beyond the first wave of a level"
            );
          }

          if (nextWave.trigger.type === "prevWaveCleared") {
            const cb = () => {
              registeredEvents.waveEnded = registeredEvents.waveEnded.filter(
                (_cb) => _cb !== cb
              );

              resolve();
            };

            registeredEvents.waveEnded.push(cb);
            return;
          }

          if (nextWave.trigger.type === "time") {
            args.setTimeout(resolve, nextWave.trigger.time);
            return;
          }

          throw new Error(`Invalid wave trigger: ${nextWave.trigger}`);
        });

        await processWaves(waveIndex + 1);
      }
    }
  };

  const handleWordRemoval = (id: string) => {
    const { activeWordObjects } = state;

    // find the word object being removed
    const index = activeWordObjects.findIndex(({ id: cid }) => cid === id);
    if (index === -1) return;

    // remove the word object from the main array
    const [wo] = activeWordObjects.splice(index, 1);
    const wave = wo.wave;

    // notify callbacks that a full word was typed
    registeredEvents.typedFullWord.forEach((cb) =>
      cb({ ...state, typedFullWordId: id })
    );

    // emit a wave ended event if all of the word objects for this wave have been cleared
    const waveEnded = !activeWordObjects.some((awo) => awo.wave === wave);
    if (waveEnded) {
      registeredEvents.waveEnded.forEach((cb) => cb({ ...state }));
    }

    resetWordState();
  };

  const updateCurrentlyTypedWord = (
    wordObject: WordObject,
    typedWord: string
  ) => {
    const typedFullWord = typedWord.length === wordObject.word.length;
    if (typedFullWord) {
      handleWordRemoval(wordObject.id);
    }

    state.currentTypedWord = typedWord;
    state.nextExpectedCharacter =
      wordObject.word[state.currentTypedWord.length];

    registeredEvents.updateCurrentlyTypedWord.forEach((cb) => cb(state));
  };

  const ignoreKeys = new Set([
    "Backspace",
    "Tab",
    "Enter",
    "Escape",
    "Shift",
    "Control",
    "Alt",
  ]);

  const onKeyDown = (e: KeyboardEvent) => {
    const { key } = e;
    if (ignoreKeys.has(key)) return;

    if (state.currentTargetId === undefined) {
      const wo = state.activeWordObjects.find(({ word: [fl] }) => fl === key);
      const newTargetId = wo?.id;
      if (newTargetId) {
        const obj = state.activeWordObjects.find(
          ({ id }) => id === newTargetId
        );
        if (!obj) {
          throw new Error("Couldn't find active word");
        }

        state.currentTargetId = newTargetId;
        updateCurrentlyTypedWord(obj, key);
      } else {
        handleIncorrectKey(key);
      }
      return;
    }

    if (key === state.nextExpectedCharacter) {
      const obj = state.activeWordObjects.find(
        ({ id }) => id === state.currentTargetId
      );
      if (!obj) {
        console.error("Couldn't find active word");
        resetWordState();
        return;
      }
      updateCurrentlyTypedWord(obj, state.currentTypedWord + key);
    } else {
      handleIncorrectKey(key);
    }
  };

  return {
    onKeyDown,
    start: () => {
      state.active = true;
      initializeLevel(1);
    },
    end: () => {
      // there is internal logic that uses this method to listen
      // for the end of the wave, so we need to call it (if it exists)
      // to ensure that there are no hanging promises
      registeredEvents.waveEnded.forEach((fn) => fn(state));
      state = { ...DEFAULT_STATE };
    },
    on<E extends keyof TypingEngineEvents>(
      e: E,
      callback: (arg: TypingEngineEvents[E]) => void
    ) {
      registeredEvents[e].push(callback);
    },
    removeWord: (wordId: string) => {
      return handleWordRemoval(wordId);
    },
    resetWord: () => {
      resetWordState();
    },
  };
};

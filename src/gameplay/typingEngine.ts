import { Level, levels, Wave } from "./levels";

type GenerateWordsOptions = {
  count: number;
} & (
  | {
      length: number;
    }
  | {
      minLength: number;
      maxLength: number;
    }
);

const generateWords = (
  possibleKeys: string[],
  options: GenerateWordsOptions
) => {
  const words: string[] = [];
  const wordCount = Math.min(possibleKeys.length, options.count);
  if (wordCount !== options.count) {
    console.warn(
      `Only generating ${wordCount} words -- 
      can only generate as many words as there 
      are unique letters since each word needs 
      to start with a different letter`
    );
  }

  let availableFirstLetters = [...possibleKeys];
  for (let wordIndex = 0; wordIndex < wordCount; wordIndex++) {
    let word = "";
    const wordLength =
      "length" in options
        ? options.length
        : Math.floor(Math.random() * (options.maxLength - options.minLength)) +
          options.minLength;

    for (
      let characterIndex = 0;
      characterIndex < wordLength;
      characterIndex++
    ) {
      // we enforce that the first letter of each word is different so
      // that it's clear which word the user is targeting when they start
      // typing for the first time
      if (characterIndex === 0) {
        const randomFirstLetterIndex = Math.floor(
          Math.random() * availableFirstLetters.length
        );
        const randomFirstLetter = availableFirstLetters[randomFirstLetterIndex];
        availableFirstLetters.splice(randomFirstLetterIndex, 1);
        word += randomFirstLetter;
        continue;
      }

      const randomIndex = Math.floor(Math.random() * possibleKeys.length);
      word += possibleKeys[randomIndex];
    }

    words.push(word);
  }

  return words;
};

const generateWaveWords = (level: Level, wave: Wave) => {
  // TODO: use real words instead of generating random phrases
  const count = wave.characterCount ?? level.characterCount;

  // available characters to compose words from
  const characters = level.characters;

  // we need at least as many characters to choose from as there
  // are enemies being generated in the wave
  if (characters.length < count) {
    throw new Error(
      `Not enough characters (${characters.length}) for the count (${count})`
    );
  }

  // the words in a wave
  const words: string[] = [];

  let availableFirstLetters = [...characters];
  for (let e = 0; e < wave.enemies.length; e++) {
    const enemy = wave.enemies[e];
    if (!enemy) continue;

    let word = "";

    for (let c = 0; c < count; c++) {
      // we enforce that the first letter of each word is different so
      // that it's clear which word the user is targeting when they start
      // typing for the first time
      if (c === 0) {
        const randomFirstLetterIndex = Math.floor(
          Math.random() * availableFirstLetters.length
        );
        const randomFirstLetter = availableFirstLetters[randomFirstLetterIndex];
        availableFirstLetters.splice(randomFirstLetterIndex, 1);
        word += randomFirstLetter;
        continue;
      }

      const randomIndex = Math.floor(Math.random() * characters.length);
      word += characters[randomIndex];
    }

    words.push(word);
  }

  return words;
};

const getWordGenerationOptionsByLevel = (
  level: number
): GenerateWordsOptions => {
  // TODO: custom options per level
  return {
    count: level * 2,
    length: 4,
  };
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

export const createTypingEngine = () => {
  let state: TypingEngineState = {
    currentLevel: 0,
    currentTargetId: undefined,
    currentTypedWord: "",
    nextExpectedCharacter: undefined,
    activeWordObjects: [],
  };

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
    } else {
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
      if (nextWave) {
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
            setTimeout(resolve, nextWave.trigger.time);
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

  const initializeKeyboardListeners = () => {
    document.addEventListener("keydown", (e) => {
      const { key } = e;

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
    });
  };

  return {
    start: () => {
      initializeLevel(1);
      initializeKeyboardListeners();
    },
    getState: () => ({ ...state }),
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

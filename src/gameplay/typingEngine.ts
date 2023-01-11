import createDebugger from "../debug";
import util from "../util";

import { DEBUG_TYPING_ENGINE } from "../../config";
const debug = createDebugger(DEBUG_TYPING_ENGINE);

const debugContainer = document.getElementById("debug");

const KEYS_TO_PRACTICE = [
  "a",
  "s",
  "d",
  "u",
  "f",
  "g",
  "h",
  "j",
  "k",
  "l",
  ";",
  //
  "q",
  "w",
  "e",
  "r",
  "t",
  "y",
];

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

const getWordGenerationOptionsByLevel = (
  level: number
): GenerateWordsOptions => {
  // TODO: custom options per level
  return {
    count: level * 100,
    length: 4,
  };
};

const handleIncorrectKey = (keyTyped: string) => {
  // console.info(`Incorrect key typed: ${keyTyped}`);
};

interface WordObject {
  id: string;
  word: string;
}

export interface TypingEngineState {
  currentLevel: number;
  currentTargetId: string | undefined;
  currentTypedWord: string;
  nextExpectedCharacter: string | undefined;
  activeWordObjects: WordObject[];
  activeWordFirstLetterToIdMap: Map<string, string>;
}

export interface TypingEngineEvents {
  initializeLevel: TypingEngineState;
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
    activeWordFirstLetterToIdMap: new Map(),
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
  };

  const resetWordState = () => {
    state.currentTargetId = undefined;
    state.currentTypedWord = "";
    state.nextExpectedCharacter = undefined;

    registeredEvents.resetWordState.forEach((cb) => cb(state));
  };

  const initializeLevel = (level: number) => {
    state.currentLevel = level;

    const opts = getWordGenerationOptionsByLevel(level);
    const words = generateWords(KEYS_TO_PRACTICE, opts);

    words.forEach((word, id) => {
      const activeWordObject = {
        id: String(id),
        word,
      };
      state.activeWordObjects.push(activeWordObject);

      const firstLetter = word[0];
      state.activeWordFirstLetterToIdMap.set(firstLetter, activeWordObject.id);
    });

    registeredEvents.initializeLevel.forEach((cb) => cb(state));

    debug.log({
      message: "Initializing level",
      level,
      activeWordObjects: state.activeWordObjects.map(({ id }) => id),
    });

    debug.execute(() => {
      if (document.querySelector("#level")) {
        document.querySelector("#level")?.remove();
      }
      const levelH1 = document.createElement("h1");
      levelH1.id = "level";
      levelH1.innerHTML = `Level ${level}`;
      debugContainer?.appendChild(levelH1);

      const wordList = document.createElement("ul");
      state.activeWordObjects.forEach(({ id, word }) => {
        const wordItem = document.createElement("li");
        wordItem.id = util.idToDomId(id);
        wordItem.innerText = `${word}`;
        wordList.appendChild(wordItem);
      });
      debugContainer!.appendChild(wordList);
    });
  };

  const handleWordRemoval = (id: string) => {
    state.activeWordObjects = state.activeWordObjects.filter(
      (awo) => awo.id !== id
    );
    registeredEvents.typedFullWord.forEach((cb) =>
      cb({ ...state, typedFullWordId: id })
    );

    resetWordState();

    if (state.activeWordObjects.length === 0) {
      initializeLevel(state.currentLevel + 1);
    }

    // Remove the associated DOM element
    debug.execute(() => {
      const e = document.querySelector(`#${util.idToDomId(id)}`);
      if (!e) {
        throw new Error("Couldn't find element");
      }
      e.remove();
    });

    return;
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

    // Update the DOM element to highlight the correct characters
    debug.execute(() => {
      const e = document.querySelector(`#${util.idToDomId(wordObject.id)}`);
      if (!e) {
        throw new Error("Couldn't find element");
      }

      e.classList.add("activeWord");
      e.innerHTML = `
        <span class="typedWord">${typedWord}</span> 
        <span class="remainingWord">${wordObject.word.slice(
          typedWord.length
        )}</span>
      `;
    });
  };

  const initializeKeyboardListeners = () => {
    document.addEventListener("keydown", (e) => {
      const { key } = e;

      if (state.currentTargetId === undefined) {
        const newTargetId = state.activeWordFirstLetterToIdMap.get(key);
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

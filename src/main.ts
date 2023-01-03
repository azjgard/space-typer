import debug from "./debug";
import util from "./util";

import "./style.css";

const appContainer = document.getElementById("app");

const KEYS_TO_PRACTICE = ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"];

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
  for (let wordIndex = 0; wordIndex < options.count; wordIndex++) {
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
    count: level,
    length: 3,
  };
};

const handleIncorrectKey = (keyTyped: string) => {
  console.info(`Incorrect key typed: ${keyTyped}`);
};

interface WordObject {
  id: string;
  word: string;
  position: { x: number; y: number };
}

const init = async () => {
  let currentLevel = 0;
  let currentTargetId: string | undefined;
  let currentTypedWord: string = "";
  let nextExpectedCharacter: string | undefined;
  let activeWordObjects: WordObject[] = [];
  let activeWordFirstLetterToIdMap = new Map<string, string>();

  const resetWordState = () => {
    currentTargetId = undefined;
    currentTypedWord = "";
    nextExpectedCharacter = undefined;
  };

  const initializeLevel = (level: number) => {
    currentLevel = level;

    const opts = getWordGenerationOptionsByLevel(level);
    const words = generateWords(KEYS_TO_PRACTICE, opts);

    words.forEach((word, id) => {
      const activeWordObject = {
        id: String(id),
        word,
        position: { x: 0, y: 0 }, // TODO: real position on the right side of the screen probably
      };
      activeWordObjects.push(activeWordObject);

      const firstLetter = word[0];
      activeWordFirstLetterToIdMap.set(firstLetter, activeWordObject.id);
    });

    debug.log({
      message: "Initializing level",
      level,
      activeWordObjects,
    });

    debug.execute(() => {
      if (document.querySelector("#level")) {
        document.querySelector("#level")?.remove();
      }
      const levelH1 = document.createElement("h1");
      levelH1.id = "level";
      levelH1.innerHTML = `Level ${level}`;
      appContainer?.appendChild(levelH1);

      const wordList = document.createElement("ul");
      activeWordObjects.forEach(({ id, word }) => {
        const wordItem = document.createElement("li");
        wordItem.id = util.idToDomId(id);
        wordItem.innerText = `${word}`;
        wordList.appendChild(wordItem);
      });
      appContainer!.appendChild(wordList);
    });
  };

  const updateCurrentlyTypedWord = (
    wordObject: WordObject,
    typedWord: string
  ) => {
    const typedFullWord = typedWord.length === wordObject.word.length;
    if (typedFullWord) {
      const i = activeWordObjects.findIndex(
        (activeWordObject) => activeWordObject.id === wordObject.id
      );
      activeWordObjects.splice(i, 1);
      resetWordState();

      if (activeWordObjects.length === 0) {
        initializeLevel(currentLevel + 1);
      }

      // Remove the associated DOM element
      debug.execute(() => {
        const e = document.querySelector(`#${util.idToDomId(wordObject.id)}`);
        if (!e) {
          throw new Error("Couldn't find element");
        }
        e.remove();
      });

      return;
    }

    currentTypedWord = typedWord;
    nextExpectedCharacter = wordObject.word[currentTypedWord.length];

    // Update the DOM element to highlight the correct characters
    debug.execute(() => {
      debug.info(`Correct character!`);

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

      if (currentTargetId === undefined) {
        const newTargetId = activeWordFirstLetterToIdMap.get(key);
        if (newTargetId) {
          const obj = activeWordObjects.find(({ id }) => id === newTargetId);
          if (!obj) {
            throw new Error("Couldn't find active word");
          }

          currentTargetId = newTargetId;
          updateCurrentlyTypedWord(obj, key);
        } else {
          handleIncorrectKey(key);
        }
        return;
      }

      // TODO: check to see if the key matches the next letter in the current target word
      if (key === nextExpectedCharacter) {
        const obj = activeWordObjects.find(({ id }) => id === currentTargetId);
        if (!obj) {
          throw new Error("Couldn't find active word");
        }
        updateCurrentlyTypedWord(obj, currentTypedWord + key);
      } else {
        handleIncorrectKey(key);
      }
    });
  };

  // This will eventually handle reading state values to determine what to do next.
  const tick = setInterval(() => {}, 50);

  initializeLevel(1);
  initializeKeyboardListeners();
};

init();

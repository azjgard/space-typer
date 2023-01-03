import "./style.css";

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
  for (let wordIndex = 0; wordIndex < options.count; wordIndex++) {
    let word = "";
    const wordLength =
      "length" in options
        ? options.length
        : Math.floor(Math.random() * (options.maxLength - options.minLength)) +
          options.minLength;

    // TODO: enforce that the first letter of each word is different
    for (
      let characterIndex = 0;
      characterIndex < wordLength;
      characterIndex++
    ) {
      const randomIndex = Math.floor(Math.random() * possibleKeys.length);
      word += possibleKeys[randomIndex];
    }

    words.push(word);
  }

  return words;
};

for (let i = 0; i < 3; i++) {
  console.log(generateWords(KEYS_TO_PRACTICE, { count: 8, length: 5 }));
}

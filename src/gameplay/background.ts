import { createCanvas } from "./lib";

export function createBackground() {
  const canvas = createCanvas({
    class: "background",
  });
  console.log("canvas", canvas);
}

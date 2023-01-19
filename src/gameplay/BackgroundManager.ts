import { createNoise2D } from "simplex-noise";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../../config";
import { createCanvas, randomInRange } from "./lib";

export function createBackgroundManager() {
  const canvasSpeed = 150;
  const canvasLeftBound = CANVAS_WIDTH * -1;

  const canvas1 = { canvas: generateBackgroundCanvas(0), pos: 0 };
  const canvas2 = {
    canvas: generateBackgroundCanvas(CANVAS_WIDTH),
    pos: canvas1.canvas.width,
  };

  return {
    update: (delta: number) => {
      canvas1.pos -= canvasSpeed * delta;
      canvas2.pos -= canvasSpeed * delta;

      canvas1.canvas.style.transform = `translateX(${canvas1.pos}px)`;
      canvas2.canvas.style.transform = `translateX(${canvas2.pos}px)`;

      if (canvas1.pos <= canvasLeftBound) {
        canvas1.pos = canvas2.pos + canvas2.canvas.width;
      }
      if (canvas2.pos <= canvasLeftBound) {
        canvas2.pos = canvas1.pos + canvas1.canvas.width;
      }
    },
  };
}

const n = createNoise2D();

const starChance = 0.5; // chance that a star will be generated at each point
const starSizes = [1, 5]; // size of the generated stars
const starPosVariation = 1000; // maximum amount of variation in star position

const starRows = 15;
const starColumns = 30;
const itR = Math.floor(CANVAS_WIDTH / starRows);
const itC = Math.floor(CANVAS_HEIGHT / starColumns);

const freq = 30;

function generateBackgroundCanvas(pos: number) {
  const canvas = createCanvas({
    class: "background",
    style: {
      transform: `translateX(${pos}px)`,
    },
  });

  const ctx = canvas.getContext("2d")!;

  for (let x = 0; x < canvas.width; x += itR) {
    for (let y = 0; y < canvas.height; y += itC) {
      if (
        n((x * freq) / canvas.width, (y * freq) / canvas.height) < starChance
      ) {
        let xVariation =
          Math.floor(Math.random() * (starPosVariation * 2 + 1)) -
          starPosVariation;

        let yVariation =
          Math.floor(Math.random() * (starPosVariation * 2 + 1)) -
          starPosVariation;

        const starSize = randomInRange(starSizes[0], starSizes[1]);

        ctx.fillStyle = "white";
        ctx.fillRect(x + xVariation, y + yVariation, starSize, starSize);
      }
    }
  }

  return canvas;
}

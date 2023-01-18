import { createNoise2D } from "simplex-noise";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../../config";
import { createCanvas, createDeltaTracker, randomInRange } from "./lib";

export function createBackground() {
  const n = createNoise2D();

  let starChance = 0.5; // chance that a star will be generated at each point
  let starSizes = [1, 5]; // size of the generated stars
  let starPosVariation = 1000; // maximum amount of variation in star position

  let starRows = 15;
  let starColumns = 30;
  let itR = Math.floor(CANVAS_WIDTH / starRows);
  let itC = Math.floor(CANVAS_HEIGHT / starColumns);

  let freq = 30;

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

  let canvases: { canvas: HTMLCanvasElement; pos: number }[] = [];

  canvases.push({ canvas: generateBackgroundCanvas(0), pos: 0 });
  canvases.push({
    canvas: generateBackgroundCanvas(CANVAS_WIDTH),
    pos: CANVAS_WIDTH,
  });

  const deltaTracker = createDeltaTracker();

  const canvasSpeed = 150;
  function move(timeNow: number) {
    deltaTracker.track(timeNow);

    const newCanvases: any[] = [];

    canvases.forEach((canvasObj, i, arr) => {
      canvasObj.canvas.style.transform = `translateX(${canvasObj.pos}px)`;
      canvasObj.pos -= canvasSpeed * deltaTracker.get();

      if (i === 0) {
        console.log(canvasObj.pos);
      }

      // push a new canvas onto the end when we're `buffer` away from the
      // first canvas in the list being completely offscreen
      const buffer = 50;
      if (
        // first canvas
        i === 0 &&
        // almost fully offscreen
        canvasObj.pos < CANVAS_WIDTH * -1 + buffer &&
        // haven't buffered a 3rd canvas yet
        arr.length < 3
      ) {
        newCanvases.push({
          canvas: generateBackgroundCanvas(CANVAS_WIDTH),
          // CANVAS_WIDTH after the current position of the last canvas
          pos: arr[arr.length - 1].pos + CANVAS_WIDTH,
        });
      }

      // remove the first canvas when it's completely offscreen
      if (i === 0 && canvasObj.pos < CANVAS_WIDTH * -1) {
        // remove the now-offscreen canvas from the DOM
        document
          .querySelector(".canvas-container")
          ?.removeChild(canvasObj.canvas);

        // drop it from the array
        canvases.splice(0, 1);
      }

      canvases.push(...newCanvases);
    });

    requestAnimationFrame(move);
  }

  move(0);
}

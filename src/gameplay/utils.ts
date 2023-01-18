import { Howl } from "howler";

export function absoluteClamp(value: number, clamp: number) {
  const c = Math.abs(clamp);
  if (value < 0) {
    return Math.max(c * -1, value);
  } else {
    return Math.min(c, value);
  }
}

export function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export const IDENTITY_MATRIX = [1, 0, 0, 1, 0, 0];

interface TraverseUnitCircleOptions {
  transform: (arg: { x: number; y: number }) => { x: number; y: number };
}

export function traverseUnitCircle(
  startingAngle: number,
  angleInc: number,
  r: number,
  options?: TraverseUnitCircleOptions
) {
  let angle = startingAngle;

  return {
    next: () => {
      const value = {
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
      };

      angle += angleInc;
      if (angle > Math.PI * 2) {
        // precision to 2 decimal points
        angle = ((angle * 100) % (Math.PI * 2 * 100)) / 100;
      }

      if (options?.transform) {
        return options.transform(value);
      } else {
        return value;
      }
    },
  };
}

export function* generateSinWave() {
  let traverser = traverseUnitCircle(Math.random(), 0.1, 1);
  while (true) {
    yield traverser.next().y;
  }
}

import { Howl } from "howler";

import click from "../../assets/sounds/click.wav";
import explosion from "../../assets/sounds/explosion.wav";

const soundManager = createSoundManager({
  click,
  explosion,
});

export default soundManager;

function createSoundManager<T extends Record<string, any>>(sounds: T) {
  const cache: Map<string, Howl> = new Map();

  Object.entries(sounds).forEach(([key, value]) => {
    const howl = new Howl({ src: [value] });
    cache.set(key, howl);
  });

  return {
    play: (path: keyof T) => {
      let p = path as string;
      let sound = cache.get(p);
      if (!sound) {
        sound = new Howl({ src: [path as string] });
        cache.set(p, sound);
      }
      return sound.play();
    },
    get: (path: keyof T) => {
      let p = path as string;
      let sound = cache.get(p);
      if (!sound) {
        sound = new Howl({ src: [path as string] });
        cache.set(p, sound);
      }
      return sound;
    },
  };
}

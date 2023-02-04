import { Howl } from "howler";

import click from "../../assets/sounds/click.wav";
import explosion from "../../assets/sounds/explosion.wav";
import song1 from "../../assets/sounds/music/billys-sacrifice.mp3";
import song2 from "../../assets/sounds/music/crash-landing.mp3";
import song3 from "../../assets/sounds/music/race-to-mars.mp3";
import levelup from "../../assets/sounds/levelup.wav";

const soundManager = createSoundManager({
  click,
  explosion,
  song1,
  song2,
  song3,
  levelup,
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

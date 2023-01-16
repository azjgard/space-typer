import { initGameplay, updateInterval } from ".";
import { Game } from "./game";

const q = (selector: string) => document.querySelector(selector);

let startMenuInitialized = false;
export function initializeStartMenu() {
  if (startMenuInitialized) return;
  startMenuInitialized = true;

  q(".start-menu__play")?.addEventListener("click", () => {
    q(".start-menu")?.classList.remove("active");
    initGameplay();
  });
  q("start-menu__options")?.addEventListener("click", () => {
    alert("Not implemented yet :(");
  });
  q("start-menu__high-scores")?.addEventListener("click", () => {
    alert("Not implemented yet :(");
  });
}

export function initializePauseMenu(game: Game) {
  const r = q(".pause-menu__resume");
  const o = q(".pause-menu__options");
  const qu = q(".pause-menu__quit");

  const keyboardListener = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      game.togglePaused();
      q(".pause-menu")?.classList.toggle("active");
      return;
    }
  };
  document.addEventListener("keydown", keyboardListener);

  const resumeListener = (_e: Event) => {
    game.togglePaused();
    q(".pause-menu")?.classList.remove("active");
  };
  r?.addEventListener("click", resumeListener);

  const optionsListener = (_e: Event) => {
    alert("Not implemented yet :(");
  };
  o?.addEventListener("click", optionsListener);

  const quitListener = (_e: Event) => {
    game.end();
    clearInterval(updateInterval);

    q(".start-menu")?.classList.add("active");
    q(".pause-menu")?.classList.remove("active");

    r?.removeEventListener("click", resumeListener);
    o?.removeEventListener("click", optionsListener);
    qu?.removeEventListener("click", quitListener);

    document.removeEventListener("keydown", keyboardListener);
  };
  qu?.addEventListener("click", quitListener);
}

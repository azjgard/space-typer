import { Game } from "./game";

export default function initializeGlobalKeyboardEvents(game: Game) {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      game.togglePaused();
      return;
    }
  });
}

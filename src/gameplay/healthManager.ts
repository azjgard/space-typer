import { Game } from "./game";

const HEART_SIZE = 40;

export const createHealthManager = (game: Game) => {
  let numberOfHearts = 4;

  let offset = HEART_SIZE;

  return {
    draw: () => {
      for (let i = 0; i < numberOfHearts; i++) {
        game.context.fillStyle = "red";
        game.context.fillRect(
          0 + i * 20 + offset * (i + 1),
          20,
          HEART_SIZE,
          HEART_SIZE
        );
      }
    },
    damage: (amount: number = 1) => {
      numberOfHearts -= amount;
    },
  };
};

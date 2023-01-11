import Entity, { IText } from "./entity";

export default class ScoreManager extends Entity {
  static getText = (text: string | number): IText[] => {
    let num: number;
    try {
      num = parseInt("" + text);
    } catch (e) {
      num = 0;
    }

    let value = String(num);
    while (value.length < 4) {
      value = "0" + value;
    }

    return [
      {
        font: "40px VT323",
        fillStyle: "white",
        value,
      },
    ];
  };

  score = 0;

  // TODO: some sort of animation or effect when getting points
  addPoints(amount: number) {
    this.score += amount;
    this.text = ScoreManager.getText(this.score);
  }
}

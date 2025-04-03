import Phaser from "phaser";

export interface IPlayer extends Phaser.Physics.Arcade.Sprite {
  health: number;
  score: number;
  isHurt: boolean;
  hurt(): void;
  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys): void;
}

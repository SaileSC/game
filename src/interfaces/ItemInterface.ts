import Phaser from "phaser";

export type ItemType = "cherry" | "gem" | "certificate";

export interface IItem extends Phaser.Physics.Arcade.Sprite {
  itemType: ItemType;
  value: number;
  collect(): void;
}

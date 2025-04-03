import Phaser from "phaser";
import Item from "./Item";
import { ItemType } from "../interfaces/ItemInterface";

export default class ItemFactory {
  public static create(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: ItemType
  ): Item {
    x *= 16;
    y *= 16;

    switch (type) {
      case "cherry":
        return new Item(scene, x, y, type, "atlas", "cherry/cherry-1");

      case "gem":
        return new Item(scene, x, y, type, "atlas", "gem/gem-1");

      case "certificate":
        return new Item(scene, x, y, type, "certificate");

      default:
        throw new Error(`Unknown item type: ${type}`);
    }
  }
}

import Phaser from "phaser";
import Enemy from "./Enemy";
import { EnemyType } from "../interfaces/EnemyInterface";

export default class EnemyFactory {
  public static create(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: EnemyType
  ): Enemy {
    x *= 16;
    y *= 16;

    switch (type) {
      case "opossum":
        return new Enemy(scene, x, y, type, "atlas", "opossum/opossum-1");

      case "eagle":
        return new Enemy(scene, x, y, type, "atlas", "eagle/eagle-attack-1");

      case "frog":
        return new Enemy(scene, x, y, type, "atlas", "frog/idle/frog-idle-1");

      default:
        throw new Error(`Unknown enemy type: ${type}`);
    }
  }
}

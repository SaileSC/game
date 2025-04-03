import Phaser from "phaser";

export type EnemyType = "opossum" | "eagle" | "frog";

export interface IEnemy extends Phaser.Physics.Arcade.Sprite {
  enemyType: EnemyType;
  health: number;
  damage: number;
  speed: number;
  patrolRange?: number;
  isDead: boolean;
  die(): void;
  update(): void;
}

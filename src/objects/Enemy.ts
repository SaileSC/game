import Phaser from "phaser";
import { IEnemy, EnemyType } from "../interfaces/EnemyInterface";

export default class Enemy
  extends Phaser.Physics.Arcade.Sprite
  implements IEnemy
{
  public enemyType: EnemyType;
  public health: number = 100;
  public damage: number = 10;
  public speed: number = 60;
  public isDead: boolean = false;
  public patrolRange?: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: EnemyType,
    texture: string,
    frame?: string | number
  ) {
    super(scene, x, y, texture, frame);
    this.enemyType = type;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.initEnemy();
  }

  private initEnemy(): void {
    this.setOrigin(0.5, 0.5);
    this.setCollideWorldBounds(true);

    // Configurações específicas por tipo de inimigo
    switch (this.enemyType) {
      case "opossum":
        this.setBodySize(16, 13);
        this.setOffset(8, 15);
        this.speed = 60;
        break;

      case "eagle":
        this.setBodySize(16, 13);
        this.setOffset(8, 20);
        this.speed = 100;
        break;

      case "frog":
        this.setBodySize(16, 16);
        this.setOffset(8, 11);
        this.speed = 80;
        break;
    }
  }

  public die(): void {
    if (this.isDead) return;

    this.isDead = true;
    this.anims.stop();
    this.setVelocity(0, 0);
    if (this.body) this.body.enable = false;
    // Animação de morte
    this.play(`${this.enemyType}-death`, true).on("animationcomplete", () => {
      this.destroy();
    });

    this.scene.events.emit("enemy-death", this);
  }

  public update(): void {
    if (this.isDead) return;

    switch (this.enemyType) {
      case "opossum":
        this.updateOpossum();
        break;

      case "eagle":
        this.updateEagle();
        break;

      case "frog":
        this.updateFrog();
        break;
    }
  }

  private updateOpossum(): void {
    if (this.body?.blocked.right || this.body?.blocked.left) {
      this.speed *= -1;
    }
    this.setVelocityX(this.speed);
    if (this.body) this.setFlipX(this.body.velocity.x < 0);
  }

  private updateEagle(): void {
    // Movimento padrão (pode ser substituído por patrol ou perseguição)
    this.setVelocityX(this.speed);
    if (this.body) this.setFlipX(this.body.velocity.x < 0);
  }

  private updateFrog(): void {
    // Lógica específica para sapo (pular periodicamente)
    if (this.body?.blocked.down) {
      this.setVelocityY(-200);
      this.setVelocityX(this.flipX ? -this.speed : this.speed);
    }
  }
}

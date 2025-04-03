import Phaser from "phaser";
import { IPlayer } from "../interfaces/PlayerInterface";

export default class Player
  extends Phaser.Physics.Arcade.Sprite
  implements IPlayer
{
  public health: number = 100;
  public score: number = 0;
  public isHurt: boolean = false;
  private hurtTimer!: Phaser.Time.TimerEvent;
  private isLanding: boolean = false;
  private gender: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    gender: "Male" | "Female"
  ) {
    super(scene, x, y, "player", `${gender}/idle/player_idle_1`);
    this.gender = gender;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.initPlayer();
    this.createAnimations();
  }

  private initPlayer(): void {
    this.setOrigin(0.5, 0.5);
    this.setCollideWorldBounds(true);
    this.body?.setSize(20, 32);
    this.body?.setOffset(22, 16);

    this.hurtTimer = this.scene.time.addEvent({
      delay: 500,
      callback: () => {
        this.isHurt = false;
      },
      loop: false,
      paused: true,
    });
  }

  private createAnimations(): void {
    const anims = this.scene.anims;
    const animVel = 10;

    anims.create({
      key: `${this.gender}-idle`,
      frames: anims.generateFrameNames("player", {
        prefix: `${this.gender}/idle/player_idle_`,
        start: 1,
        end: 8,
        zeroPad: 0,
        suffix: ".png",
      }),
      frameRate: animVel,
      repeat: -1,
    });

    // Outras animações (run, jump, etc.) mantidas conforme original
  }

  public hurt(): void {
    if (this.isHurt) return;

    this.isHurt = true;
    this.health -= 10;
    this.hurtTimer.reset({
      delay: 500,
      callback: () => {
        this.isHurt = false;
      },
    });
    this.setVelocityY(-100);
    this.setVelocityX(this.flipX ? 100 : -100);
    this.play(`${this.gender}-hurt`, true);
  }

  public update(cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
    if (this.isHurt) {
      this.play(`${this.gender}-hurt`, true);
      return;
    }

    const vel = 150;
    if (cursors.left.isDown) {
      this.setVelocityX(-vel);
      this.play(`${this.gender}-run`, true);
      this.setFlipX(true);
    } else if (cursors.right.isDown) {
      this.setVelocityX(vel);
      this.play(`${this.gender}-run`, true);
      this.setFlipX(false);
    } else {
      this.setVelocityX(0);
      if (this.body?.blocked.down) {
        this.play(`${this.gender}-idle`, true);
      }
    }

    if (this.body?.blocked.down) {
      if (!this.isLanding) {
        this.play(`${this.gender}-land`, true);
        this.isLanding = true;
      }

      if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
        this.setVelocityY(-170);
        this.play(`${this.gender}-jump`, true);
        this.isLanding = false;
      }
    } else {
      if (this.body)
        if (this.body.velocity.y < 0) {
          this.play(`${this.gender}-jump`, true);
        } else if (this.body.velocity.y > 0) {
          this.play(`${this.gender}-fall`, true);
          this.isLanding = false;
        }
    }
  }
}

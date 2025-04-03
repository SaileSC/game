import Phaser from "phaser";
import { IItem, ItemType } from "../interfaces/ItemInterface";

export default class Item
  extends Phaser.Physics.Arcade.Sprite
  implements IItem
{
  public itemType: ItemType;
  public value: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: ItemType,
    texture: string,
    frame?: string | number
  ) {
    super(scene, x, y, texture, frame);
    this.itemType = type;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.initItem();
  }

  private initItem(): void {
    this.setOrigin(0.5, 0.5);

    // Configura valores baseados no tipo de item
    switch (this.itemType) {
      case "cherry":
        this.value = 10;
        this.setBodySize(8, 8);
        this.setOffset(4, 4);
        break;

      case "gem":
        this.value = 50;
        this.setBodySize(12, 12);
        this.setOffset(2, 2);
        break;

      case "certificate":
        this.value = 1000;
        this.setBodySize(16, 16);
        this.setScale(0.3);
        break;
    }

    this.createAnimations();
  }

  private createAnimations(): void {
    if (this.itemType === "cherry" || this.itemType === "gem") {
      this.anims.create({
        key: `${this.itemType}-spin`,
        frames: this.anims.generateFrameNames("atlas", {
          prefix: `${this.itemType}/${this.itemType}-`,
          start: 1,
          end: this.itemType === "cherry" ? 7 : 5,
          zeroPad: 0,
          suffix: "",
        }),
        frameRate: 12,
        repeat: -1,
      });
      this.play(`${this.itemType}-spin`);
    }
  }

  public collect(): void {
    // Animação de coleta
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 200,
      onComplete: () => {
        this.destroy();
      },
    });

    // Emitir evento de item coletado
    this.scene.events.emit("item-collected", {
      type: this.itemType,
      value: this.value,
    });
  }
}

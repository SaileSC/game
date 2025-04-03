import Phaser from "phaser";
import { GameData } from "../interfaces/GameData";

export default class TitleScene extends Phaser.Scene {
  private background!: Phaser.GameObjects.TileSprite;
  private middleground!: Phaser.GameObjects.TileSprite;
  private title!: Phaser.GameObjects.Image;
  private pressEnter!: Phaser.GameObjects.Image;
  private credits!: Phaser.GameObjects.Image;
  private enterKey!: Phaser.Input.Keyboard.Key;
  private gameData!: GameData;

  constructor() {
    super({ key: "TitleScene" });
  }

  init(data: GameData) {
    this.gameData = data;
  }

  create() {
    // Configura o cenário
    this.setupBackground();
    this.createTitleElements();
    this.setupInput();
    this.setupAnimations();
  }

  private setupBackground() {
    this.background = this.add.tileSprite(0, 0, 288, 192, "background");
    this.middleground = this.add.tileSprite(0, 80, 288, 192, "middleground");

    this.background.setOrigin(0);
    this.middleground.setOrigin(0);
  }

  private createTitleElements() {
    this.title = this.add.image(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 30,
      "title"
    );
    this.title.setOrigin(0.5);

    this.pressEnter = this.add.image(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 40,
      "enter"
    );
    this.pressEnter.setOrigin(0.5);

    this.credits = this.add.image(
      this.cameras.main.centerX,
      this.cameras.main.height - 10,
      "credits"
    );
    this.credits.setOrigin(0.5);
  }

  private setupInput() {
    if (this.input.keyboard)
      this.enterKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.ENTER
      );
    this.enterKey.on("down", () => {
      this.scene.start("LoginScene", this.gameData);
    });
  }

  private setupAnimations() {
    // Animação de piscar o texto "Press Enter"
    this.tweens.add({
      targets: this.pressEnter,
      alpha: 0,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });
  }

  update() {
    // Efeito de parallax
    this.background.tilePositionX -= 0.3;
    this.middleground.tilePositionX -= 0.6;
  }
}

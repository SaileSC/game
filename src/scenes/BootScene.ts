import Phaser from "phaser";
import { SceneConfig } from "../interfaces/GameConfig";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" } as SceneConfig);
  }

  preload() {
    this.load.image("loading", "assets/sprites/loading.png");
  }

  create() {
    this.scale.setGameSize(288, 192);
    this.scale.setZoom(2);
    this.scale.refresh();
    this.scale.scaleMode = Phaser.Scale.FIT;
    this.scene.start("PreloadScene");
  }
}

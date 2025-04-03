import Phaser from "phaser";
import BootScene from "./scenes/BootScene";
import PreloadScene from "./scenes/PreloadScene";
import TitleScene from "./scenes/TitleScene";
import LoginScene from "./scenes/LoginScene";
import PlayScene from "./scenes/PlayScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 288,
  height: 192,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 500, x: 0 }, // x
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, PreloadScene, TitleScene, LoginScene, PlayScene],
  pixelArt: true,
  roundPixels: true,
};

const game = new Phaser.Game(config);

import Phaser from "phaser";
import { GameData } from "../interfaces/GameData";

export default class PreloadScene extends Phaser.Scene {
  private loadingBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;
  private progressText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "PreloadScene" });
  }

  preload() {
    // Cria a barra de progresso visual
    this.createLoadingBar();

    // Carrega os assets
    this.loadAssets();
  }

  private createLoadingBar() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Caixa de fundo do progresso
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x222222, 0.8);
    this.progressBox.fillRect(width / 4, height / 2 - 30, width / 2, 50);

    // Barra de progresso
    this.loadingBar = this.add.graphics();

    // Texto de progresso
    this.progressText = this.add
      .text(width / 2, height / 2, "0%", {
        font: "18px monospace",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Atualiza a barra conforme o progresso
    this.load.on("progress", (value: number) => {
      this.loadingBar.clear();
      this.loadingBar.fillStyle(0xffffff, 1);
      this.loadingBar.fillRect(
        width / 4 + 5,
        height / 2 - 25,
        (width / 2 - 10) * value,
        40
      );
      this.progressText.setText(`${Math.round(value * 100)}%`);
    });

    // Limpa quando completo
    this.load.on("complete", () => {
      this.loadingBar.destroy();
      this.progressBox.destroy();
      this.progressText.destroy();
    });
  }

  private loadAssets() {
    // Sprites
    this.load.image("title", "assets/sprites/title-screen.png");
    this.load.image("enter", "assets/sprites/press-enter-text.png");
    this.load.image("credits", "assets/sprites/credits-text.png");
    this.load.image("instructions", "assets/sprites/instructions.png");
    this.load.image("background", "assets/environment/back.png");
    this.load.image("middleground", "assets/environment/middle.png");
    this.load.image("tileset", "assets/environment/tileset.png");
    this.load.image("certificate", "assets/atlas/certificado.png");

    // Tilemap
    this.load.tilemapTiledJSON("map", "assets/maps/map.json");

    // Atlas de sprites
    this.load.atlas(
      "atlas",
      "assets/atlas/atlas.png",
      "assets/atlas/atlas.json"
    );
    this.load.atlas(
      "atlas-props",
      "assets/atlas/atlas-props.png",
      "assets/atlas/atlas-props.json"
    );
    this.load.multiatlas("player", "assets/atlas/player.json", "assets/atlas");

    // Áudio
    this.load.audio("music", ["assets/sound/platformer_level03_loop.ogg"]);

    // Dados do jogo
    this.load.json("questions", "questions.json");
  }

  create() {
    // Transição para a próxima cena
    const questions = this.cache.json.get("questions");
    const gameData: GameData = {
      questions: questions.perguntas,
      player: {
        name: "",
        sector: "",
        region: "",
        gender: "Male",
      },
    };
    this.scene.start("TitleScene", gameData);
  }
}

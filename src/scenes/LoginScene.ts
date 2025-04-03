import Phaser from "phaser";
import { GameData } from "../interfaces/GameData";

export default class LoginScene extends Phaser.Scene {
  private background!: Phaser.GameObjects.TileSprite;
  private middleground!: Phaser.GameObjects.TileSprite;
  private modal!: Phaser.GameObjects.Container;
  private inputFields: Record<string, Phaser.GameObjects.Text> = {};
  private currentInput: Phaser.GameObjects.Text | null = null;
  private errorText: Phaser.GameObjects.Text | null = null;
  private gender: "Male" | "Female" = "Male";
  private gameData!: GameData;

  constructor() {
    super({ key: "LoginScene" });
  }

  init(data: GameData) {
    this.gameData = data;
  }

  create() {
    this.setupBackground();
    this.createModal();
    this.setupKeyboard();
  }

  private setupBackground() {
    this.background = this.add.tileSprite(0, 0, 288, 192, "background");
    this.middleground = this.add.tileSprite(0, 80, 288, 192, "middleground");

    this.background.setOrigin(0);
    this.middleground.setOrigin(0);
  }

  private createModal() {
    const modalWidth = 250;
    const modalHeight = 180;
    const modalX = (this.cameras.main.width - modalWidth) / 2;
    const modalY = (this.cameras.main.height - modalHeight) / 2;

    this.modal = this.add.container(modalX, modalY);

    // Fundo do modal
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.9);
    bg.lineStyle(2, 0xffffff, 1);
    bg.fillRect(0, 0, modalWidth, modalHeight);
    bg.strokeRect(0, 0, modalWidth, modalHeight);
    this.modal.add(bg);

    // Título
    const title = this.add.text(modalWidth / 2, 20, "LOGIN", {
      font: 'bold 13px "Press Start 2P"',
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 2,
    });
    title.setOrigin(0.5);
    this.modal.add(title);

    // Campos de entrada
    this.createInputField(bg, "Nome:", 40, true);
    this.createInputField(bg, "Setor:", 60, true);
    this.createInputField(bg, "Região:", 80, true);

    // Seleção de gênero
    this.createGenderSelection(bg);

    // Botão de início
    this.createStartButton(bg, modalWidth, modalHeight);
  }

  private createInputField(
    parent: Phaser.GameObjects.Graphics,
    label: string,
    y: number,
    isRequired: boolean
  ) {
    const labelText = this.add.text(
      20,
      y,
      `${label}${isRequired ? " *" : ""}`,
      {
        font: '10px "Press Start 2P"',
        color: "#ffffff",
      }
    );
    this.modal.add(labelText);

    const fieldWidth = 140;
    const fieldX = 90;

    const bg = this.add.graphics();
    bg.fillStyle(0x333333);
    bg.fillRect(fieldX - 5, y - 2, fieldWidth, 15);
    this.modal.add(bg);

    const inputText = this.add.text(fieldX, y, "", {
      font: '10px "Press Start 2P"',
      color: "#ffffff",
      backgroundColor: "#333333",
      fixedWidth: fieldWidth,
    });
    this.modal.add(inputText);

    // Mapeia os campos de entrada
    switch (label) {
      case "Nome:":
        this.inputFields.name = inputText;
        break;
      case "Setor:":
        this.inputFields.sector = inputText;
        break;
      case "Região:":
        this.inputFields.region = inputText;
        break;
    }

    // Configura interação
    bg.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, fieldWidth, 15),
      Phaser.Geom.Rectangle.Contains
    );
    bg.on("pointerdown", () => this.focusInput(inputText));
  }

  private createGenderSelection(parent: Phaser.GameObjects.Graphics) {
    const genderText = this.add.text(20, 100, "Personagem:", {
      font: '10px "Press Start 2P"',
      color: "#ffffff",
    });
    this.modal.add(genderText);

    const maleText = this.add.text(105, 100, "Masculino", {
      font: '10px "Press Start 2P"',
      color: "#FFD700",
    });
    maleText.setInteractive();
    maleText.on("pointerdown", () => this.setGender("Male"));
    this.modal.add(maleText);

    const femaleText = this.add.text(105, 120, "Feminino", {
      font: '10px "Press Start 2P"',
      color: "#ffffff",
    });
    femaleText.setInteractive();
    femaleText.on("pointerdown", () => this.setGender("Female"));
    this.modal.add(femaleText);
  }

  private createStartButton(
    parent: Phaser.GameObjects.Graphics,
    modalWidth: number,
    modalHeight: number
  ) {
    const startBtn = this.add.rectangle(
      modalWidth / 2,
      modalHeight - 10,
      100,
      30,
      0x000000,
      0
    );
    startBtn.setOrigin(0.5);
    startBtn.setInteractive();
    startBtn.on("pointerdown", () => this.startGame());
    this.modal.add(startBtn);

    const startText = this.add.text(startBtn.x, startBtn.y, "COMEÇAR", {
      font: 'bold 10px "Press Start 2P"',
      color: "#00FF00",
    });
    startText.setOrigin(0.5);
    this.modal.add(startText);
  }

  private setupKeyboard() {
    this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      if (!this.currentInput) return;

      if (event.key === "Backspace") {
        this.currentInput.text = this.currentInput.text.slice(0, -1);
      } else if (event.key === "Enter") {
        this.handleEnter();
      } else if (event.key.length === 1 && this.currentInput.text.length < 15) {
        this.currentInput.text += event.key;
      }
    });
  }

  private focusInput(input: Phaser.GameObjects.Text) {
    if (this.currentInput) {
      this.currentInput.setBackgroundColor("#333333");
    }
    this.currentInput = input;
    input.setBackgroundColor("#555555");
  }

  private handleEnter() {
    if (!this.currentInput) return;

    if (this.currentInput === this.inputFields.name) {
      this.focusInput(this.inputFields.sector);
    } else if (this.currentInput === this.inputFields.sector) {
      this.focusInput(this.inputFields.region);
    } else {
      this.startGame();
    }
  }

  private setGender(gender: "Male" | "Female") {
    this.gender = gender;
    const maleText = this.modal.list[6] as Phaser.GameObjects.Text;
    const femaleText = this.modal.list[7] as Phaser.GameObjects.Text;

    maleText.setColor(gender === "Male" ? "#FFD700" : "#FFFFFF");
    femaleText.setColor(gender === "Female" ? "#FFD700" : "#FFFFFF");
  }

  private startGame() {
    // Validação dos campos
    const requiredFields = [
      { field: "name", text: this.inputFields.name.text },
      { field: "sector", text: this.inputFields.sector.text },
      { field: "region", text: this.inputFields.region.text },
    ];

    const missingFields = requiredFields.filter((f) => !f.text.trim());

    if (missingFields.length > 0) {
      this.showError("Preencha todos os campos obrigatórios!");
      return;
    }

    // Atualiza os dados do jogador
    this.gameData.player = {
      name: this.inputFields.name.text,
      sector: this.inputFields.sector.text,
      region: this.inputFields.region.text,
      gender: this.gender,
    };

    // Inicia o jogo principal
    this.scene.start("PlayScene", this.gameData);
  }

  private showError(message: string) {
    if (this.errorText) {
      this.errorText.destroy();
    }

    this.errorText = this.add.text(
      this.modal.x + this.modal.width / 2,
      this.modal.y + this.modal.height - 10,
      message,
      {
        font: '8px "Press Start 2P"',
        color: "#FF0000",
        stroke: "#000000",
        strokeThickness: 1,
      }
    );
    this.errorText.setOrigin(0.5);

    this.tweens.add({
      targets: this.errorText,
      alpha: 0,
      duration: 500,
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

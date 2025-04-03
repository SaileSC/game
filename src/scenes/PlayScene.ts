import Phaser from "phaser";
import Player from "../objects/Player";
import EnemyFactory from "../objects/EnemyFactory";
import ItemFactory from "../objects/ItemFactory";
import { GameData, Question } from "../interfaces/GameData";
import { EVENTS } from "../interfaces/EventInterface";

export default class PlayScene extends Phaser.Scene {
  private gameData!: GameData;
  private player!: Player;

  private map?: Phaser.Tilemaps.Tilemap;
  private tileset?: Phaser.Tilemaps.Tileset;
  private layer?: Phaser.Tilemaps.TilemapLayer;
  private background!: Phaser.GameObjects.TileSprite;
  private middleground!: Phaser.GameObjects.TileSprite;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private enemies!: Phaser.Physics.Arcade.Group;
  private items!: Phaser.Physics.Arcade.Group;
  private questionModal!: Phaser.GameObjects.Container;
  private currentQuestionTile: number | null = null;
  private questionTiles: Record<number, boolean> = {};
  private isQuestionActive: boolean = false;
  private correctAnswers: number = 0;
  private music!: Phaser.Sound.BaseSound;

  constructor() {
    super({ key: "PlayScene" });
  }

  init(data: GameData) {
    this.gameData = data;
  }

  preload() {
    // Assets já carregados no PreloadScene
  }

  create() {
    this.createWorld();
    this.createPlayer();
    this.createInput();
    this.populateWorld();
    this.setupQuestionSystem();
    this.setupAudio();
    this.setupEvents();
  }

  private createWorld() {
    // Tilemap com verificação de tipo segura
    const map = this.make.tilemap({ key: "map" });
    if (!map) {
      throw new Error("Tilemap 'map' não pôde ser criado");
    }
    this.map = map;

    const tileset = this.map.addTilesetImage("tileset");
    if (!tileset) {
      throw new Error("Tileset 'tileset' não pôde ser carregado");
    }
    this.tileset = tileset;

    const layer = this.map.createLayer("Tile Layer 1", this.tileset, 0, 0);
    if (!layer) {
      throw new Error("Camada de tilemap não pôde ser criada");
    }
    this.layer = layer;
    this.layer.setCollisionByExclusion([-1]);

    // Background (não precisa de verificação)
    this.background = this.add.tileSprite(0, 0, 288, 192, "background");
    this.middleground = this.add.tileSprite(0, 80, 288, 192, "middleground");

    this.background.setOrigin(0);
    this.middleground.setOrigin(0);
    this.background.setScrollFactor(0.1);
    this.middleground.setScrollFactor(0.5);
  }

  private createPlayer() {
    this.player = new Player(
      this,
      7.5 * 16,
      8 * 16,
      this.gameData.player.gender
    );

    // Configura a câmera para seguir o jogador
    this.cameras.main.startFollow(this.player);

    if (this.map)
      this.cameras.main.setBounds(
        0,
        0,
        this.map.widthInPixels,
        this.map.heightInPixels
      );
  }

  private createInput() {
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();

      // Tecla Q para abrir questionário
      this.input.keyboard.on("keydown-Q", () => {
        if (!this.isQuestionActive && this.currentQuestionTile) {
          this.showQuestion();
        }
      });
    }
  }

  private populateWorld() {
    // Inimigos
    this.enemies = this.physics.add.group();
    this.enemies.add(EnemyFactory.create(this, 8, 2, "eagle"));
    this.enemies.add(EnemyFactory.create(this, 40, 1, "opossum"));

    // Itens
    this.items = this.physics.add.group();
    this.items.add(ItemFactory.create(this, 15, 4, "cherry"));
    this.items.add(ItemFactory.create(this, 18, 4, "cherry"));
    this.items.add(ItemFactory.create(this, 33, 8, "cherry"));
    this.items.add(ItemFactory.create(this, 41, 10, "gem"));

    // Certificado (inicialmente desativado)
    const cert = ItemFactory.create(this, 8.5, 27, "certificate");
    cert.setActive(false).setVisible(false);
    this.items.add(cert);
  }

  private setupQuestionSystem() {
    // Inicializa os tiles de perguntas
    for (let i = 1; i <= 12; i++) {
      this.questionTiles[i] = false;
      this.map?.setTileIndexCallback(
        i,
        () => {
          if (!this.isQuestionActive && !this.questionTiles[i]) {
            this.currentQuestionTile = i;
          }
        },
        this
      );
    }

    // Cria o modal de perguntas
    this.createQuestionModal();
  }

  private createQuestionModal() {
    const modalWidth = this.cameras.main.width * 0.85;
    const modalHeight = this.cameras.main.height * 0.8;
    const modalX = (this.cameras.main.width - modalWidth) / 2;
    const modalY = (this.cameras.main.height - modalHeight) / 2;

    this.questionModal = this.add.container(modalX, modalY);
    this.questionModal.setVisible(false);

    // Fundo do modal
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.9);
    bg.lineStyle(2, 0xffffff, 1);
    bg.fillRect(0, 0, modalWidth, modalHeight);
    bg.strokeRect(0, 0, modalWidth, modalHeight);
    this.questionModal.add(bg);

    // TODO: Implementar os elementos do questionário
    // (pergunta, opções de resposta, etc.)
  }

  private showQuestion() {
    if (
      !this.currentQuestionTile ||
      this.questionTiles[this.currentQuestionTile]
    )
      return;

    const questionIndex = this.currentQuestionTile - 1; // Tiles começam em 1
    const question = this.gameData.questions[questionIndex];

    // Configura o modal com a pergunta atual
    this.setupQuestionUI(question);

    // Pausa o jogo
    this.isQuestionActive = true;
    this.physics.pause();
    this.questionModal.setVisible(true);
  }

  private setupQuestionUI(question: Question) {
    // TODO: Implementar a UI da pergunta
    // Mostrar a pergunta e as opções de resposta
    // Configurar eventos para seleção de respostas
  }

  private setupAudio() {
    this.music = this.sound.add("music", { loop: true });
    this.music.play();
  }

  private setupEvents() {
    // Evento quando o jogador coleta um item
    this.events.on(
      EVENTS.ITEM_COLLECTED,
      (item: { type: string; value: number }) => {
        this.gameData.score = (this.gameData.score || 0) + item.value;
      }
    );

    // Evento quando todas as perguntas são respondidas
    this.events.on(EVENTS.QUESTION_ANSWERED, () => {
      this.correctAnswers++;

      if (this.correctAnswers === this.gameData.questions.length) {
        this.enableFinalReward();
      }
    });
  }

  private enableFinalReward() {
    // Ativa o certificado quando todas as perguntas são respondidas
    this.items.getChildren().forEach((item) => {
      // Fazemos uma verificação de tipo segura
      if (
        item instanceof Phaser.GameObjects.Sprite &&
        item.getData("type") === "certificate"
      ) {
        item.setActive(true).setVisible(true);

        // Adiciona animação de pulsação se necessário
        this.tweens.add({
          targets: item,
          scale: { from: 0.3, to: 0.35 },
          duration: 350,
          yoyo: true,
          repeat: -1,
        });
      }
    });
  }

  update() {
    if (this.isQuestionActive) return;

    // Atualiza o jogador
    this.player.update(this.cursors);

    // Efeito de parallax
    this.background.tilePositionX = this.cameras.main.scrollX * 0.1;
    this.middleground.tilePositionX = this.cameras.main.scrollX * 0.5;
  }
}

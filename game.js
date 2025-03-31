var gameData = {
  questions: [],
};
var game;
var background;
var middleground;
var gameWidth = 288;
var gameHeight = 192;
var hurtFlag = false;
var hurtTimer;
var frogTimer;
var frogJumpSide = "left";
var isLanding;

window.onload = function () {
  game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, "");
  game.state.add("LoginScreen", loginScreen);
  game.state.add("Boot", boot);
  game.state.add("Preload", preload);
  game.state.add("TitleScreen", titleScreen);
  game.state.add("PlayGame", playGame);
  game.state.start("Boot");
};

var boot = function (game) {};
boot.prototype = {
  preload: function () {
    this.game.load.image("loading", "assets/sprites/loading.png");
  },
  create: function () {
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.renderer.renderSession.roundPixels = true;
    this.game.state.start("Preload");
  },
};

var preload = function (game) {};
preload.prototype = {
  preload: function () {
    var loadingBar = this.add.sprite(
      game.width / 2,
      game.height / 2,
      "loading"
    );
    loadingBar.anchor.setTo(0.5);
    game.load.setPreloadSprite(loadingBar);

    game.load.image("title", "assets/sprites/title-screen.png");
    game.load.image("enter", "assets/sprites/press-enter-text.png");
    game.load.image("credits", "assets/sprites/credits-text.png");
    game.load.image("instructions", "assets/sprites/instructions.png");
    game.load.image("background", "assets/environment/back.png");
    game.load.image("middleground", "assets/environment/middle.png");
    game.load.image("tileset", "assets/environment/tileset.png");
    game.load.tilemap(
      "map",
      "assets/maps/map.json",
      null,
      Phaser.Tilemap.TILED_JSON
    );
    game.load.atlasJSONArray(
      "atlas",
      "assets/atlas/atlas.png",
      "assets/atlas/atlas.json"
    );
    game.load.atlasJSONArray(
      "atlas-props",
      "assets/atlas/atlas-props.png",
      "assets/atlas/atlas-props.json"
    );
    game.load.atlasJSONArray(
      "player",
      "assets/atlas/player-0.png",
      "assets/atlas/player.json"
    );
    game.load.audio("music", ["assets/sound/platformer_level03_loop.ogg"]);
    game.load.image("certificate", "assets/atlas/certificado.png");
    game.load.json("questions", "questions.json");
  },
  create: function () {
    gameData.questions = this.game.cache.getJSON("questions");
    this.game.state.start("TitleScreen");
  },
};

var titleScreen = function (game) {};
titleScreen.prototype = {
  create: function () {
    background = game.add.tileSprite(0, 0, gameWidth, gameHeight, "background");
    middleground = game.add.tileSprite(
      0,
      80,
      gameWidth,
      gameHeight,
      "middleground"
    );

    this.title = game.add.image(game.width / 2, game.height / 2 - 30, "title");
    this.title.anchor.setTo(0.5);

    this.pressEnter = game.add.image(
      game.width / 2,
      game.height / 2 + 40,
      "enter"
    );
    this.pressEnter.anchor.setTo(0.5);

    this.credits = game.add.image(game.width / 2, game.height - 10, "credits");
    this.credits.anchor.setTo(0.5);

    game.time.events.loop(700, this.blinkText, this);
    this.enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    this.enterKey.onDown.addOnce(this.startGame, this);
  },

  blinkText: function () {
    if (this.pressEnter.alpha) {
      this.pressEnter.alpha = 0;
    } else {
      this.pressEnter.alpha = 1;
    }
  },

  startGame: function () {
    this.game.state.start("LoginScreen");
  },

  update: function () {
    background.tilePosition.x -= 0.3;
    middleground.tilePosition.x -= 0.6;
  },
};
// Adicione esta nova state definition
var loginScreen = function (game) {
  this.errorText = null;
  this.requiredFields = []; // Armazenará os campos obrigatórios
};
loginScreen.prototype = {
  create: function () {
    //listenerBackspace
    var backKey = game.input.keyboard.addKey(Phaser.Keyboard.BACKSPACE);
    backKey.onDown.add(function () {
      if (this.currentInput) {
        this.currentInput.text = this.currentInput.text.slice(0, -1);
      }
    }, this);

    // Background
    this.background = game.add.tileSprite(
      0,
      0,
      gameWidth,
      gameHeight,
      "background"
    );
    this.middleground = game.add.tileSprite(
      0,
      80,
      gameWidth,
      gameHeight,
      "middleground"
    );

    // Modal container
    const modalWidth = 250;
    const modalHeight = 180;
    const modalX = (game.width - modalWidth) / 2;
    const modalY = (game.height - modalHeight) / 2;

    this.modal = game.add.group();

    // Modal background
    const bg = game.add.graphics(modalX, modalY);
    bg.beginFill(0x000000, 0.9);
    bg.lineStyle(2, 0xffffff, 1);
    bg.drawRect(0, 0, modalWidth, modalHeight);
    bg.endFill();
    this.modal.add(bg);

    // Title
    const title = game.add.text(modalWidth / 2, 20, "LOGIN", {
      font: "bold 13px 'Press Start 2P'",
      fill: "#FFFFFF",
      stroke: "#000000",
      strokeThickness: 2,
    });
    title.anchor.set(0.5);
    bg.addChild(title);

    // Input fields
    this.createInputField(bg, "Nome:", 40, true);
    this.createInputField(bg, "Setor:", 60, true);
    this.createInputField(bg, "Região:", 80, true);

    // Gender selection
    const genderText = game.add.text(20, 100, "Personagem:", {
      font: "10px 'Press Start 2P'",
      fill: "#FFFFFF",
    });
    bg.addChild(genderText);

    this.gender = "Male"; // Default
    this.maleText = game.add.text(105, 100, "Masculino", {
      font: "10px 'Press Start 2P'",
      fill: "#FFD700", // Masculino começa selecionado
    });
    this.maleText.inputEnabled = true;
    this.maleText.events.onInputDown.add(() => this.setGender("Male"), this);
    bg.addChild(this.maleText);

    this.femaleText = game.add.text(105, 120, "Feminino", {
      font: "10px 'Press Start 2P'",
      fill: "#FFFFFF", // Feminino começa não selecionado
    });
    this.femaleText.inputEnabled = true;
    this.femaleText.events.onInputDown.add(
      () => this.setGender("Female"),
      this
    );
    bg.addChild(this.femaleText);

    // Start button
    const startBtn = game.add.button(
      modalWidth / 2,
      modalHeight - 10,
      null,
      this.startGame,
      this
    );
    startBtn.anchor.set(0.5);
    const startText = game.add.text(15, -10, "COMEÇAR", {
      font: "bold 10px 'Press Start 2P'",
      fill: "#00FF00",
    });
    startText.anchor.set(0.5);
    startBtn.addChild(startText);

    // Store references to input fields
    this.inputFields = {
      name: this.nameInput,
      sector: this.sectorInput,
      region: this.regionInput,
    };

    // Enable keyboard input
    this.currentInput = null;
    game.input.keyboard.addCallbacks(this, null, null, this.handleKeyPress);

    // Focus first field
    this.focusInput(this.nameInput);
  },

  createInputField: function (parent, label, y, isRequired) {
    const labelText = game.add.text(20, y, label + (isRequired ? " *" : ""), {
      font: "10px 'Press Start 2P'",
      fill: "#FFFFFF",
    });
    parent.addChild(labelText);

    const fieldWidth = 140;
    const fieldX = 90;

    // Input background (agora armazenamos a referência)
    const bg = game.add.graphics(fieldX - 5, y - 2);
    bg.beginFill(0x333333);
    bg.drawRect(0, 0, fieldWidth, 15);
    bg.endFill();
    parent.addChild(bg);

    // Input text
    const inputText = game.add.text(fieldX, y, "", {
      font: "10px 'Press Start 2P'",
      fill: "#FFFFFF",
      width: fieldWidth,
    });
    parent.addChild(inputText);

    // Armazena campo obrigatório
    if (isRequired) {
      this.requiredFields.push({
        bg: bg,
        text: inputText,
        label: labelText,
      });
    }

    // Store reference based on label
    switch (label) {
      case "Nome:":
        this.nameInput = inputText;
        break;
      case "Setor:":
        this.sectorInput = inputText;
        break;
      case "Região:":
        this.regionInput = inputText;
        break;
    }

    // Make clickable
    bg.inputEnabled = true;
    bg.events.onInputDown.add(() => {
      this.focusInput(inputText);
      // Remove o destaque de erro quando clica no campo
      bg.tint = 0xffffff;
      labelText.fill = "#FFFFFF";
    }, this);
  },

  focusInput: function (input) {
    if (this.currentInput) {
      this.currentInput.tint = 0xffffff;
    }
    this.currentInput = input;
    input.tint = 0xffff00;
  },

  handleKeyPress: function (char) {
    if (!this.currentInput) return;

    // Verifica se é Backspace (código 8)
    if (char.charCodeAt(0) === 8) {
      // Remove o último caractere
      this.currentInput.text = this.currentInput.text.slice(0, -1);
    }
    // Verifica se é Enter (código 13)
    else if (char.charCodeAt(0) === 13) {
      this.handleEnter();
    }
    // Aceita apenas caracteres normais
    else if (this.currentInput.text.length < 15) {
      this.currentInput.text += char;
    }
  },

  handleEnter: function () {
    if (this.currentInput === this.nameInput) {
      this.focusInput(this.sectorInput);
    } else if (this.currentInput === this.sectorInput) {
      this.focusInput(this.regionInput);
    } else {
      this.startGame();
    }
  },

  setGender: function (gender) {
    this.gender = gender;
    // Update button colors
    this.maleText.fill = gender === "Male" ? "#FFD700" : "#FFFFFF";
    this.femaleText.fill = gender === "Female" ? "#FFD700" : "#FFFFFF";
  },

  startGame: function () {
    let hasError = false;

    // Valida todos os campos obrigatórios
    this.requiredFields.forEach((field) => {
      if (!field.text.text || field.text.text.trim() === "") {
        hasError = true;
        // Destaca o campo não preenchido
        field.bg.tint = 0xff9999; // Vermelho claro
        field.label.fill = "#FF0000"; // Vermelho
      }
    });

    if (hasError) {
      // Mostra mensagem de erro
      if (!this.errorText) {
        this.errorText = game.add.text(
          this.modal.width / 2,
          this.modal.height - 10,
          "Preencha todos os campos obrigatórios!",
          {
            font: "8px 'Press Start 2P'",
            fill: "#FF0000",
            stroke: "#000000",
            strokeThickness: 1,
          }
        );
        this.errorText.anchor.set(0.5);
        this.modal.add(this.errorText);

        // Efeito de piscar
        game.add
          .tween(this.errorText)
          .to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true, 0, -1, true);
      }
      return;
    }

    // Remove mensagem de erro se existir
    if (this.errorText) {
      this.errorText.destroy();
      this.errorText = null;
    }

    // Salva os dados do jogador
    gameData.player = {
      name: this.nameInput.text,
      sector: this.sectorInput.text,
      region: this.regionInput.text,
      gender: this.gender,
    };

    // Inicia o jogo
    this.game.state.start("PlayGame");
  },

  update: function () {
    this.background.tilePosition.x -= 0.3;
    this.middleground.tilePosition.x -= 0.6;
  },
};

var playGame = function (game) {
  this.questions = [];
  this.currentQuestion = 0;
  this.selectedAnswer = null;
  this.isQuestionActive = false;
  this.correctAnswers = 0;
};
playGame.prototype = {
  create: function () {
    this.createBackgrounds();
    this.questions = gameData.questions.perguntas;

    this.createWorld();
    this.decorWorld();
    this.createPlayer(7.5, 8);
    //this.createPlayerName();
    this.bindKeys();
    game.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER);

    this.populateWorld();

    this.music = game.add.audio("music");
    this.music.loop = true;
    this.music.play();

    this.createQuestionModal();

    // Timer for frog jumps
    frogTimer = game.time.create(false);
    frogTimer.loop(2000, this.switchFrogJump, this);
    frogTimer.start();

    hurtTimer = game.time.create(false);
    hurtTimer.loop(500, this.resetHurt, this);
  },

  switchFrogJump: function () {
    frogJumpSide = frogJumpSide == "left" ? "right" : "left";
  },

  resetHurt: function () {
    hurtFlag = false;
  },

  createQuestionModal: function () {
    const modalWidth = game.width * 0.85;
    const modalHeight = game.height * 0.8;
    const modalX = (game.width - modalWidth) / 2;
    const modalY = (game.height - modalHeight) / 2;

    this.modal = game.add.group();
    this.modal.fixedToCamera = true;

    const bg = game.add.graphics(modalX, modalY);
    bg.beginFill(0x000000, 0.9);
    bg.lineStyle(2, 0xffffff, 1);
    bg.drawRect(0, 0, modalWidth, modalHeight);
    bg.endFill();
    this.modal.add(bg);

    this.questionText = game.add.text(modalWidth / 2, 29, "", {
      font: "bold 12px 'Press Start 2P'",
      fill: "#FFFFFF",
      stroke: "#000000",
      strokeThickness: 2,
      wordWrap: true,
      wordWrapWidth: modalWidth - 20,
      align: "center",
    });
    this.questionText.anchor.set(0.5);
    bg.addChild(this.questionText);

    this.answers = [];
    const answerStyle = {
      font: "10px 'Press Start 2P'",
      fill: "#FFFFFF",
      stroke: "#000000",
      strokeThickness: 1,
    };

    for (let i = 0; i < 4; i++) {
      const answer = game.add.text(
        modalWidth / 2,
        60 + i * 25,
        "",
        answerStyle
      );
      answer.anchor.set(0.5);
      answer.inputEnabled = true;
      answer.events.onInputDown.add(this.selectAnswer, this, 0, i);
      answer.events.onInputOver.add(() =>
        answer.setStyle({ font: "10px", fill: "#FFD700" })
      );
      answer.events.onInputOut.add(() =>
        answer.setStyle({ font: "10px", fill: "#FFFFFF" })
      );
      bg.addChild(answer);
      this.answers.push(answer);
    }

    this.keys = [];
    for (let i = 0; i < 4; i++) {
      this.keys.push(game.input.keyboard.addKey(Phaser.Keyboard[i + 1]));
      this.keys[i].onDown.add(() => this.selectAnswer(null, null, i), this);
    }

    this.modal.visible = false;
    this.keyQ = game.input.keyboard.addKey(Phaser.Keyboard.Q);
    this.keyQ.onDown.add(this.toggleQuestionnaire, this);
  },

  toggleQuestionnaire: function () {
    // Se já completou todas as questões, não faz nada
    if (this.currentQuestion >= this.questions.length) {
      return;
    }

    if (!this.modal.visible) {
      const question = this.questions[this.currentQuestion];
      this.questionText.text = question.descricao;
      for (let i = 0; i < question.opcoes.length; i++) {
        this.answers[i].text = question.opcoes[i];
        this.answers[i].setStyle({ font: "10px", fill: "#FFFFFF" });
      }
    }

    this.modal.visible = !this.modal.visible;
    this.isQuestionActive = this.modal.visible;
    game.physics.arcade.isPaused = this.isQuestionActive;
    this.keys.forEach((key) => (key.enabled = !this.modal.visible));
  },

  selectAnswer: function (target, pointer, answerIndex) {
    // Limpa seleções anteriores
    this.answers.forEach((answer) =>
      answer.setStyle({ font: "10px", fill: "#FFFFFF" })
    );

    const perguntaAtual = this.questions[this.currentQuestion];
    const respostaCorreta = perguntaAtual.resposta_correta;

    if (target) target.setStyle({ font: "10px", fill: "#FFA500" });

    game.time.events.add(
      500,
      () => {
        if (answerIndex === respostaCorreta) {
          this.correctAnswers++;
          this.answers[answerIndex].setStyle({ font: "10px", fill: "#00FF00" });
        } else if (respostaCorreta == 10) {
          this.correctAnswers++;
          this.answers[answerIndex].setStyle({ font: "10px", fill: "#00FF00" });
        } else {
          this.answers[answerIndex].setStyle({ font: "10px", fill: "#FF0000" });
          this.answers[respostaCorreta].setStyle({
            font: "10px",
            fill: "#00FF00",
          });
        }

        game.time.events.add(
          1500,
          () => {
            this.currentQuestion++;

            // Fecha a questão atual antes de verificar se é a última
            this.closeQuestionModal();

            // Verifica se era a última questão
            if (this.currentQuestion >= this.questions.length) {
              this.showCompletionMessage();
            }

            if (this.correctAnswers === this.questions.length) {
              this.enableFinalReward();
            }
          },
          this
        );
      },
      this
    );
  },
  closeQuestionModal: function () {
    // Limpa todos os estilos e esconde o modal
    this.answers.forEach((answer) => {
      answer.setStyle({ font: "10px", fill: "#FFFFFF" });
    });
    this.modal.visible = false;
    this.isQuestionActive = false;
    game.physics.arcade.isPaused = false;
    this.keys.forEach((key) => (key.enabled = true));
  },

  enableFinalReward: function () {
    this.items.children.forEach((item) => {
      if (item.key === "certificate") {
        item.inputEnabled = true;
        item.events.onInputDown.add(this.collectCert, this);
      }
    });
  },

  showCompletionMessage: function () {
    // Cria um container para a mensagem
    this.completionContainer = game.add.group();
    this.completionContainer.fixedToCamera = true;

    // Fundo semi-transparente
    const bg = game.add.graphics(0, 0);
    bg.beginFill(0x000000, 0.7);
    bg.drawRect(0, 0, game.width, game.height);
    bg.endFill();
    this.completionContainer.add(bg);

    // Texto da mensagem
    const text = game.add.text(
      game.width / 2,
      game.height / 2,
      "PARABÉNS!\nTODAS PERGUNTAS RESPONDIDAS!",
      {
        font: "14px 'Press Start 2P'",
        fill: "#FFF",
        align: "center",
        stroke: "#000",
        strokeThickness: 4,
      }
    );
    text.anchor.set(0.5);
    this.completionContainer.add(text);

    // Remove após 2 segundos
    game.time.events.add(
      2000,
      () => {
        if (this.completionContainer) {
          this.completionContainer.destroy(true);
          this.completionContainer = null;
        }
      },
      this
    );
  },

  collectCert: function (cert) {
    cert.kill();
    this.showCompletionMessage();
  },

  createBackgrounds: function () {
    this.background = game.add.tileSprite(
      0,
      0,
      gameWidth,
      gameHeight,
      "background"
    );
    this.middleground = game.add.tileSprite(
      0,
      80,
      gameWidth,
      gameHeight,
      "middleground"
    );
    this.background.fixedToCamera = true;
    this.middleground.fixedToCamera = true;
  },

  createWorld: function () {
    this.map = game.add.tilemap("map");
    this.map.addTilesetImage("tileset");
    this.layer = this.map.createLayer("Tile Layer 1");
    this.layer.resizeWorld();

    this.map.setCollision([
      27, 29, 31, 33, 35, 37, 77, 81, 86, 87, 127, 129, 131, 133, 134, 135, 83,
      84, 502, 504, 505, 529, 530, 333, 335, 337, 339, 366, 368, 262, 191, 193,
      195, 241, 245, 291, 293, 295, 79, 81,
    ]);

    // Set one-way collision tiles
    [35, 36, 84, 86, 134, 135, 366, 367, 368, 370, 262, 470, 370].forEach(
      (tileIndex) => {
        this.setTopCollisionTiles(tileIndex);
      }
    );
  },

  setTopCollisionTiles: function (tileIndex) {
    for (let x = 0; x < this.map.width; x++) {
      for (let y = 1; y < this.map.height; y++) {
        const tile = this.map.getTile(x, y);
        if (tile !== null && tile.index == tileIndex) {
          tile.setCollision(false, false, true, false);
        }
      }
    }
  },

  decorWorld: function () {
    // Platform 1 decorations
    game.add.image(100, 51, "atlas-props", "tree");
    game.add.image(324, 116, "atlas-props", "bush");
    game.add.image(340, 51, "atlas-props", "tree");
    game.add.image(520, -13, "atlas-props", "tree");
    game.add.image(836, 3, "atlas-props", "tree");
    game.add.image(715, 65, "atlas-props", "rock");
    game.add.image(960, 116, "atlas-props", "bush");
    game.add.image(1300, 116, "atlas-props", "bush");
    game.add.image(1200, 129, "atlas-props", "rock");
    game.add.image(1099, 3, "atlas-props", "tree");
    game.add.image(1250, 51, "atlas-props", "tree");
    game.add.image(1450, 51, "atlas-props", "tree");

    // Platform 2 decorations
    game.add.image(480, 210, "atlas-props", "rock");
    game.add.image(764, 162, "atlas-props", "big-crate");
    game.add.image(750, 192, "atlas-props", "big-crate");
    game.add.image(780, 192, "atlas-props", "big-crate");

    // Platform 3 decorations
    game.add.image(420, 403, "atlas-props", "tree");
    game.add.image(491, 481, "atlas-props", "rock");
    game.add.image(1036, 388, "atlas-props", "house");
    game.add.image(1141, 480, "atlas-props", "crate");
    game.add.image(1125, 480, "atlas-props", "crate");
    game.add.image(1133, 464, "atlas-props", "crate");
    game.add.image(565, 468, "atlas-props", "bush");
    game.add.image(790, 371, "atlas-props", "tree");
    game.add.image(730, 404, "atlas-props", "bush");
    game.add.image(510, 403, "atlas-props", "tree");
    game.add.image(755, 417, "atlas-props", "rock");
    game.add.image(1200, 403, "atlas-props", "tree");
    game.add.image(950, 481, "atlas-props", "rock");
    game.add.image(1350, 468, "atlas-props", "bush");
    game.add.image(1330, 468, "atlas-props", "bush");
    game.add.image(1370, 468, "atlas-props", "bush");
    game.add.image(1450, 403, "atlas-props", "tree");
    game.add.image(590, 307, "atlas-props", "tree");
    game.add.image(125, 463, "atlas-props", "door");
  },
  createPlayerName: function () {
    // Cria o texto do nome como um objeto separado
    this.playerName = game.add.text(0, -50, gameData.player.name, {
      font: "8px 'Press Start 2P'",
      fill: "#FFFFFF",
      stroke: "#000000",
      strokeThickness: 2,
      align: "center",
    });

    // Centraliza o texto
    this.playerName.anchor.set(0.5);
  },

  createPlayer: function (x, y) {
    x *= 16;
    y *= 16;
    const gender = gameData.player.gender || "Male";
    this.player = game.add.sprite(
      x,
      y,
      "player",
      `${gender}/idle/player_idle_1.png`
    );
    this.player.anchor.setTo(0.5);
    game.physics.arcade.enable(this.player);
    this.player.body.gravity.y = 500;
    this.player.body.setSize(20, 32, 22, 16);

    const animVel = 10;
    const animations = [
      { name: "pick", frames: 10, path: "pickup-wall/player_pickup_wall_" },
      { name: "punch", frames: 8, path: "punch/player_punch_" },
      { name: "idle", frames: 8, path: "idle/player_idle_" },
      { name: "run", frames: 8, path: "run/player_run_" },
      { name: "jump", frames: 2, path: "jump/player_jump_" },
      { name: "fall", frames: 2, path: "fall/player_fall_" },
      { name: "land", frames: 3, path: "land/player_land_" },
    ];

    animations.forEach((anim) => {
      this.player.animations.add(
        anim.name,
        Phaser.Animation.generateFrameNames(
          `${gender}/${anim.path}`,
          0,
          anim.frames - 1,
          ".png",
          0
        ),
        animVel,
        anim.name === "land" ? false : true
      );
    });
  },

  populateWorld: function () {
    this.enemies = game.add.group();
    this.enemies.enableBody = false;

    this.items = game.add.group();
    this.items.enableBody = true;

    // Create items
    this.createCherry(15, 4);
    this.createCherry(18, 4);
    this.createCherry(33, 8);
    this.createCherry(33, 10);
    this.createCherry(33, 12);
    this.createGem(41, 10);
    this.createGem(39, 13);
    this.createGem(43, 13);
    this.createCherry(60, 4);
    this.createCherry(71, 3);
    this.createCherry(74, 3);
    this.createGem(88, 2);
    this.createCherry(97.5, 10);
    this.createCherry(97.5, 13);
    this.createCherry(97.5, 16);
    this.createCherry(97.5, 19);
    this.createCherry(97.5, 22);
    this.createCherry(97.5, 25);
    this.createCherry(89, 29);
    this.createCherry(83, 28);
    this.createCherry(54, 26);
    this.createCherry(42, 23);
    this.createGem(33, 21.5);
    this.createGem(46, 21.5);
    this.createCherry(34, 30);
    this.createCherry(32, 29);
    this.createGem(12, 30);
    this.createGem(15, 28);
    this.createGem(17, 28);
    this.createGem(19, 28);
    this.createCertUniq(8.5, 27);

    // Create enemies
    this.createEagle(10, 2, 200, 3.2);
    this.createEagle(77, 1, 130, 3);
    //this.createOpossum(20, 10);
    //this.createFrog(25, 8);
  },

  createEnemyDeath: function (x, y) {
    const enemyDeath = game.add.sprite(x, y, "atlas");
    enemyDeath.anchor.setTo(0.5);
    const animDeath = enemyDeath.animations.add(
      "dead",
      Phaser.Animation.generateFrameNames(
        "enemy-death/enemy-death-",
        1,
        6,
        "",
        0
      ),
      16,
      false
    );
    enemyDeath.animations.play("dead");
    animDeath.onComplete.add(() => enemyDeath.kill(), this);
  },

  createItemFeedback: function (x, y) {
    const itemFeedback = game.add.sprite(x, y, "atlas");
    itemFeedback.anchor.setTo(0.5);
    const animFeedback = itemFeedback.animations.add(
      "feedback",
      Phaser.Animation.generateFrameNames(
        "item-feedback/item-feedback-",
        1,
        4,
        "",
        0
      ),
      16,
      false
    );
    itemFeedback.animations.play("feedback");
    animFeedback.onComplete.add(() => itemFeedback.kill(), this);
  },

  createOpossum: function (x, y) {
    x *= 16;
    y *= 16;
    const opossum = game.add.sprite(x, y, "atlas", "opossum/opossum-1");
    opossum.anchor.setTo(0.5);
    game.physics.arcade.enable(opossum);
    opossum.body.gravity.y = 500;
    opossum.body.setSize(16, 13, 8, 15);
    opossum.animations.add(
      "run",
      Phaser.Animation.generateFrameNames("opossum/opossum-", 1, 6, "", 0),
      12,
      true
    );
    opossum.animations.play("run");
    opossum.body.velocity.x = 60 * game.rnd.pick([1, -1]);
    opossum.body.bounce.x = 1;
    opossum.enemyType = "opossum";
    this.enemies.add(opossum);
  },

  createEagle: function (x, y, d, t = 1) {
    x *= 16;
    y *= 16;
    const eagle = game.add.sprite(x, y, "atlas", "eagle/eagle-attack-1");
    eagle.anchor.setTo(0.5);
    game.physics.arcade.enable(eagle);
    eagle.body.setSize(16, 13, 8, 20);
    eagle.animations.add(
      "attack",
      Phaser.Animation.generateFrameNames("eagle/eagle-attack-", 1, 4, "", 0),
      12,
      true
    );
    eagle.animations.play("attack");
    eagle.prevX = x;

    const tween = game.add
      .tween(eagle)
      .to({ y: y, x: x + d }, 1000 * t, Phaser.Easing.Linear.None, true, 0, -1)
      .yoyo(true);

    tween.onUpdateCallback(() => {
      eagle.scale.x = eagle.x > eagle.prevX ? -1 : 1;
      eagle.prevX = eagle.x;
    }, this);

    eagle.enemyType = "eagle";
    this.enemies.add(eagle);
  },

  createFrog: function (x, y) {
    x *= 16;
    y *= 16;
    const frog = game.add.sprite(x, y, "atlas", "frog/idle/frog-idle-1");
    frog.anchor.setTo(0.5);
    game.physics.arcade.enable(frog);
    frog.body.gravity.y = 500;
    frog.body.setSize(16, 16, 8, 11);
    frog.animations.add(
      "idle",
      Phaser.Animation.generateFrameNames("frog/idle/frog-idle-", 1, 4, "", 0),
      6,
      true
    );
    frog.animations.add("jump", ["frog/jump/frog-jump-1"], 6, false);
    frog.animations.add("fall", ["frog/jump/frog-jump-2"], 6, false);
    frog.animations.play("idle");
    frog.enemyType = "frog";
    frog.side = "right";
    this.enemies.add(frog);
  },

  createCherry: function (x, y) {
    x *= 16;
    y *= 16;
    const cherry = game.add.sprite(x, y, "atlas", "cherry/cherry-1");
    cherry.anchor.setTo(0.5);
    game.physics.arcade.enable(cherry);
    cherry.animations.add(
      "idle",
      Phaser.Animation.generateFrameNames("cherry/cherry-", 1, 7, "", 0),
      12,
      true
    );
    cherry.animations.play("idle");
    this.items.add(cherry);
  },

  createGem: function (x, y) {
    x *= 16;
    y *= 16;
    const gem = game.add.sprite(x, y, "atlas", "gem/gem-1");
    gem.anchor.setTo(0.5);
    game.physics.arcade.enable(gem);
    gem.animations.add(
      "idle",
      Phaser.Animation.generateFrameNames("gem/gem-", 1, 5, "", 0),
      12,
      true
    );
    gem.animations.play("idle");
    this.items.add(gem);
  },

  createCertUniq: function (x, y) {
    x *= 16;
    y *= 16;
    const cert = game.add.sprite(x, y, "certificate");
    cert.anchor.setTo(0.5);
    cert.scale.setTo(0.3);
    game.physics.arcade.enable(cert);

    game.add
      .tween(cert.scale)
      .to({ x: 0.35, y: 0.35 }, 350)
      .to({ x: 0.25, y: 0.25 }, 350)
      .loop()
      .start();

    this.items.add(cert);
  },

  bindKeys: function () {
    this.wasd = {
      jump: game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR),
      left: game.input.keyboard.addKey(Phaser.Keyboard.LEFT),
      right: game.input.keyboard.addKey(Phaser.Keyboard.RIGHT),
      crouch: game.input.keyboard.addKey(Phaser.Keyboard.DOWN),
    };
    game.input.keyboard.addKeyCapture([
      Phaser.Keyboard.SPACEBAR,
      Phaser.Keyboard.LEFT,
      Phaser.Keyboard.RIGHT,
      Phaser.Keyboard.DOWN,
    ]);
  },

  update: function () {
    if (this.player && this.playerName) {
      this.playerName.x = this.player.x;
      this.playerName.y = this.player.y - 20; // 30 pixels acima do personagem
    }

    if (this.isQuestionActive) return;

    game.physics.arcade.collide(this.player, this.layer);
    game.physics.arcade.collide(this.enemies, this.layer);
    game.physics.arcade.overlap(
      this.player,
      this.enemies,
      this.checkAgainstEnemies,
      null,
      this
    );
    game.physics.arcade.overlap(
      this.player,
      this.items,
      this.pickItem,
      null,
      this
    );

    this.movePlayer();
    this.enemiesManager();
    this.parallaxBackground();
  },

  pickItem: function (player, item) {
    this.createItemFeedback(item.x, item.y);
    item.kill();
  },

  enemiesManager: function () {
    this.enemies.forEachAlive((enemy) => {
      if (enemy.enemyType == "opossum") {
        enemy.scale.x = enemy.body.velocity.x < 0 ? 1 : -1;
      } else if (enemy.enemyType == "eagle") {
        enemy.scale.x = enemy.x > this.player.x ? 1 : -1;
      } else if (enemy.enemyType == "frog") {
        if (enemy.side == "left" && frogJumpSide == "right") {
          enemy.scale.x = 1;
          enemy.side = "right";
          enemy.body.velocity.y = -200;
          enemy.body.velocity.x = -100;
        } else if (enemy.side == "right" && frogJumpSide == "left") {
          enemy.scale.x = -1;
          enemy.side = "left";
          enemy.body.velocity.y = -200;
          enemy.body.velocity.x = 100;
        } else if (enemy.body.onFloor()) {
          enemy.body.velocity.x = 0;
        }

        if (enemy.body.velocity.y < 0) {
          enemy.animations.play("jump");
        } else if (enemy.body.velocity.y > 0) {
          enemy.animations.play("fall");
        } else {
          enemy.animations.play("idle");
        }
      }
    }, this);
  },

  checkAgainstEnemies: function (player, enemy) {
    if (
      player.y + player.body.height * 0.5 < enemy.y &&
      player.body.velocity.y > 0
    ) {
      this.createEnemyDeath(enemy.x, enemy.y);
      enemy.kill();
      player.body.velocity.y = -200;
    } else {
      this.hurtPlayer();
    }
  },

  hurtPlayer: function () {
    if (hurtFlag) return;

    hurtFlag = true;
    hurtTimer.start();
    this.player.body.velocity.y = -100;
    this.player.body.velocity.x = this.player.scale.x == 1 ? -100 : 100;
    this.player.animations.play("hurt");
  },

  parallaxBackground: function () {
    this.background.tilePosition.x = this.layer.x * -0.1;
    this.middleground.tilePosition.x = this.layer.x * -0.5;
  },

  movePlayer: function () {
    if (hurtFlag) {
      this.player.animations.play("hurt");
      return;
    }

    const vel = 150;
    if (this.wasd.left.isDown) {
      this.player.body.velocity.x = -vel;
      this.player.animations.play("run");
      this.player.scale.x = -1;
    } else if (this.wasd.right.isDown) {
      this.player.body.velocity.x = vel;
      this.player.animations.play("run");
      this.player.scale.x = 1;
    } else {
      this.player.body.velocity.x = 0;
      if (this.player.body.onFloor()) {
        if (this.wasd.crouch.isDown) {
          this.player.animations.play("crouch");
        } else {
          this.player.animations.play("idle");
        }
      }
    }

    if (this.player.body.onFloor()) {
      if (!isLanding) {
        this.player.animations.play("land");
        isLanding = true;
      }

      if (this.wasd.jump.isDown) {
        this.player.body.velocity.y = -170;
        isLanding = false;
      }
    } else {
      if (this.player.body.velocity.y < 0) {
        this.player.animations.play("jump");
      } else if (this.player.body.velocity.y > 0) {
        this.player.animations.play("fall");
        isLanding = false;
      }
    }
  },

  shutdown: function () {
    if (hurtTimer) hurtTimer.destroy();
    if (frogTimer) frogTimer.destroy();
    this.keys.forEach((key) => key.destroy());
  },
};

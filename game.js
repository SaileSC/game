/*
 * SUNNY LAND Demo Code
 * @copyright    2017 Ansimuz
 * @license      {@link https://opensource.org/licenses/MIT | MIT License}
 * Get free assets and code at: www.pixelgameart.org
 * */

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
  game.state.add("Boot", boot);
  game.state.add("Preload", preload);
  game.state.add("TitleScreen", titleScreen);
  game.state.add("PlayGame", playGame);
  //
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
    game.renderer.renderSession.roundPixels = true; // no blurring
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
    // load title screen
    game.load.image("title", "assets/sprites/title-screen.png");
    game.load.image("enter", "assets/sprites/press-enter-text.png");
    game.load.image("credits", "assets/sprites/credits-text.png");
    game.load.image("instructions", "assets/sprites/instructions.png");
    // environment
    game.load.image("background", "assets/environment/back.png");
    game.load.image("middleground", "assets/environment/middle.png");
    //tileset
    game.load.image("tileset", "assets/environment/tileset.png");
    game.load.tilemap(
      "map",
      "assets/maps/map.json",
      null,
      Phaser.Tilemap.TILED_JSON
    );
    // atlas sprites
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
      //player
      "player",
      "assets/atlas/player-0.png",
      "assets/atlas/player.json"
    );
    //music
    game.load.audio("music", ["assets/sound/platformer_level03_loop.ogg"]);

    //cert
    game.load.image("certificate", "assets/atlas/certificado.png");

    //questoes json
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
    game.time.events.loop(700, this.blinkText, this);
    this.state = 1;
    this.game.state.start("PlayGame");
  },
  blinkText: function () {
    if (this.pressEnter.alpha) {
      this.pressEnter.alpha = 0;
    } else {
      this.pressEnter.alpha = 1;
    }
  },

  update: function () {
    background.tilePosition.x -= 0.3;
    middleground.tilePosition.x -= 0.6;
  },
  startGame: function () {
    this.game.state.start("PlayGame");
  },
};

var playGame = function (game) {
  // Variáveis do questionário
  //this.questions = questionsData.perguntas;
  this.questions = [];
  this.currentQuestion = 0;
  this.selectedAnswer = null;
  this.isQuestionActive = false;
};
playGame.prototype = {
  create: function () {
    this.createBackgrounds();
    this.questions = gameData.questions.perguntas;

    this.createWorld();
    this.decorWorld();
    this.createPlayer(54, 9);
    //this.createPlayer(450, 9);
    //this.createPlayer(520, 25);
    this.bindKeys();
    game.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER);

    this.populateWorld();

    // music
    this.music = game.add.audio("music");
    this.music.loop = true;
    this.music.play();

    //modal
    // Configurações do modal
    const modalWidth = game.width * 0.85;
    const modalHeight = game.height * 0.8;
    const modalX = (game.width - modalWidth) / 2;
    const modalY = (game.height - modalHeight) / 2;

    // Cria o modal
    this.modal = game.add.group();
    this.modal.fixedToCamera = true;

    // Fundo do modal
    const bg = game.add.graphics(modalX, modalY);
    bg.beginFill(0x000000, 0.9);
    bg.lineStyle(2, 0xffffff, 1);
    bg.drawRect(0, 0, modalWidth, modalHeight);
    bg.endFill();
    this.modal.add(bg);

    // Texto da pergunta
    this.questionText = game.add.text(modalWidth / 2, 29, "", {
      //font: "10px PixelifySans",
      font: "10px Arial",
      fill: "#FFFFFF", // Cor do texto
      align: "justify", // Alinhamento do texto
      wordWrap: true, // Ativa a quebra de linha automática
      wordWrapWidth: modalWidth - 10, // Define a largura máxima para quebra de linha
    });
    this.questionText.anchor.set(0.5);
    bg.addChild(this.questionText);

    // Texto de ajuda
    const helpText = game.add.text(
      modalWidth / 2,
      modalHeight - 5,
      "Pressione Q para fechar",
      { font: "1px Arial", fill: "#FFFFFF" }
    );
    helpText.anchor.set(0.5);
    //bg.addChild(helpText);

    // Respostas
    this.answers = [];
    const answerStyle = {
      font: "9px Arial",
      fill: "#FFFFFF",
      //backgroundColor: "#333333",
    };

    for (let i = 0; i < 4; i++) {
      const answer = game.add.text(
        modalWidth / 2,
        60 + i * 20,
        "",
        answerStyle
      );
      answer.anchor.set(0.5);
      answer.inputEnabled = true;
      answer.events.onInputDown.add(this.selectAnswer, this, 0, i);

      // Estilização hover
      answer.events.onInputOver.add(function () {
        answer.setStyle({ fill: "#FFD700", font: "9px Arial" });
      });
      answer.events.onInputOut.add(function () {
        answer.setStyle({ fill: "#FFFFFF", font: "9qpx Arial" });
      });

      bg.addChild(answer);
      this.answers.push(answer);
    }

    this.modal.visible = false;

    // Adiciona o teclado
    this.keyQ = game.input.keyboard.addKey(Phaser.Keyboard.Q);
    this.keyQ.onDown.add(this.toggleQuestionnaire, this);
  },
  toggleQuestionnaire: function () {
    if (!this.modal.visible) {
      // Atualiza para próxima pergunta
      const question = this.questions[this.currentQuestion];

      this.questionText.text = question.descricao;
      for (let i = 0; i < question.opcoes.length; i++) {
        this.answers[i].text = question.opcoes[i];
      }

      if (this.currentQuestion < this.questions.length) {
        this.currentQuestion = this.currentQuestion + 1;
      }

      this.selectedAnswer = null;
    }

    this.modal.visible = !this.modal.visible;
    this.isQuestionActive = this.modal.visible;
    game.physics.arcade.isPaused = this.isQuestionActive;
  },
  selectAnswer: function (target, pointer, answerIndex) {
    this.selectedAnswer = {
      questionIndex: this.currentQuestion - 1, // Ajusta índice pois já avançamos para próxima pergunta
      answerIndex: answerIndex,
    };

    console.log("Resposta armazenada:", this.selectedAnswer);

    const resposta = this.selectedAnswer.answerIndex;
    const pergunta = this.questions[this.selectedAnswer.questionIndex];
    const respostaCorreta = pergunta.correta;

    console.log(pergunta);
    console.log(pergunta.respostas[resposta]);

    if (resposta === respostaCorreta) {
      console.log("Correto");
      alert("Correto");
    } else {
      console.log("Errado");
      alert("Errado");
    }

    this.toggleQuestionnaire();
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

  decorWorld: function () {
    //plataform 1
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
    //plataform 1
    game.add.image(480, 210, "atlas-props", "rock");
    game.add.image(764, 162, "atlas-props", "big-crate");
    game.add.image(750, 192, "atlas-props", "big-crate");
    game.add.image(780, 192, "atlas-props", "big-crate");

    //plataform 2
    game.add.image(420, 323 + 80, "atlas-props", "tree");
    game.add.image(491, 401 + 80, "atlas-props", "rock");
    game.add.image(1036, 308 + 80, "atlas-props", "house");
    game.add.image(1141, 400 + 80, "atlas-props", "crate");
    game.add.image(1125, 400 + 80, "atlas-props", "crate");
    game.add.image(1133, 384 + 80, "atlas-props", "crate");
    game.add.image(565, 388 + 80, "atlas-props", "bush");
    game.add.image(790, 291 + 80, "atlas-props", "tree");
    game.add.image(730, 324 + 80, "atlas-props", "bush");
    game.add.image(510, 323 + 80, "atlas-props", "tree");
    game.add.image(755, 337 + 80, "atlas-props", "rock");
    game.add.image(1200, 323 + 80, "atlas-props", "tree");
    game.add.image(950, 401 + 80, "atlas-props", "rock");
    game.add.image(1350, 388 + 80, "atlas-props", "bush");
    game.add.image(1330, 388 + 80, "atlas-props", "bush");
    game.add.image(1370, 388 + 80, "atlas-props", "bush");
    game.add.image(1450, 323 + 80, "atlas-props", "tree");
    game.add.image(590, 307, "atlas-props", "tree");
    game.add.image(125, 463, "atlas-props", "door");
  },

  populateWorld: function () {
    // groups
    this.enemies = game.add.group();
    this.enemies.enableBody = false;
    // //
    this.items = game.add.group();
    this.items.enableBody = true;

    // //timer for frog jumps
    // frogTimer = game.time.create(false);
    // frogTimer.loop(2000, this.switchFrogJump, this);
    // frogTimer.start();

    // // create items
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
    // create enemies
    this.createEagle(10, 2, 200, 3.2);
    this.createEagle(77, 1, 130, 3);
  },

  switchFrogJump: function () {
    frogJumpSide = frogJumpSide == "left" ? "right" : "left";
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
    // tilemap
    this.map = game.add.tilemap("map");
    this.map.addTilesetImage("tileset");
    this.layer = this.map.createLayer("Tile Layer 1");
    this.layer.resizeWorld();
    // which tiles collide
    this.map.setCollision([
      27, 29, 31, 33, 35, 37, 77, 81, 86, 87, 127, 129, 131, 133, 134, 135, 83,
      84, 502, 504, 505, 529, 530, 333, 335, 337, 339, 366, 368, 262, 191, 193,
      195, 241, 245, 291, 293, 295, 79, 81,
    ]);

    // set some tiles one way collision
    this.setTopCollisionTiles(35);
    this.setTopCollisionTiles(36);
    this.setTopCollisionTiles(84);
    this.setTopCollisionTiles(86);
    this.setTopCollisionTiles(134);
    this.setTopCollisionTiles(135);
    this.setTopCollisionTiles(366);
    this.setTopCollisionTiles(367);
    this.setTopCollisionTiles(368);
    this.setTopCollisionTiles(370);
    this.setTopCollisionTiles(262);
    this.setTopCollisionTiles(470);
    this.setTopCollisionTiles(370);
  },

  setTopCollisionTiles: function (tileIndex) {
    var x, y, tile;
    for (x = 0; x < this.map.width; x++) {
      for (y = 1; y < this.map.height; y++) {
        tile = this.map.getTile(x, y);
        if (tile !== null) {
          if (tile.index == tileIndex) {
            tile.setCollision(false, false, true, false);
          }
        }
      }
    }
  },

  createPlayer: function (x, y) {
    x *= 3;
    y *= 15;
    var gender = "Male"; //Male or Female
    //var gender = "Female"; //Male or Female
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

    var animVel = 10;

    this.player.animations.add(
      "pick",
      Phaser.Animation.generateFrameNames(
        `${gender}/pickup-wall/player_pickup_wall_`,
        0,
        9,
        ".png",
        0
      ),
      animVel,
      true
    );

    this.player.animations.add(
      "punch",
      Phaser.Animation.generateFrameNames(
        `${gender}/punch/player_punch_`,
        0,
        7,
        ".png",
        0
      ),
      animVel,
      true
    );

    this.player.animations.add(
      "idle",
      Phaser.Animation.generateFrameNames(
        `${gender}/idle/player_idle_`,
        0,
        7,
        ".png",
        0
      ),
      animVel,
      true
    );

    this.player.animations.add(
      "run",
      Phaser.Animation.generateFrameNames(
        `${gender}/run/player_run_`,
        0,
        7,
        ".png",
        0
      ),
      animVel,
      true
    );

    this.player.animations.add(
      "jump",
      Phaser.Animation.generateFrameNames(
        `${gender}/jump/player_jump_`,
        0,
        1,
        ".png",
        0
      ),
      animVel,
      true
    );

    this.player.animations.add(
      "fall",
      Phaser.Animation.generateFrameNames(
        `${gender}/fall/player_fall_`,
        0,
        1,
        ".png",
        0
      ),
      animVel,
      true
    );

    this.player.animations.add(
      "land",
      Phaser.Animation.generateFrameNames(
        `${gender}/land/player_land_`,
        0,
        2,
        ".png",
        0
      ),
      2,
      true
    );
    hurtTimer = game.time.create(false);
    hurtTimer.loop(500, this.resetHurt, this);
  },
  createEnemyDeath: function (x, y) {
    this.enemyDeath = game.add.sprite(x, y, "atlas");
    this.enemyDeath.anchor.setTo(0.5);
    this.animDeath = this.enemyDeath.animations.add(
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
    this.enemyDeath.animations.play("dead");
    this.animDeath.onComplete.add(function () {
      this.enemyDeath.kill();
    }, this);
  },

  createItemFeedback: function (x, y) {
    var itemFeedback = game.add.sprite(x, y, "atlas");
    itemFeedback.anchor.setTo(0.5);
    var animFeedback = itemFeedback.animations.add(
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
    animFeedback.onComplete.add(function () {
      itemFeedback.kill();
    }, this);
  },

  resetHurt: function () {
    hurtFlag = false;
  },

  createOpossum: function (x, y) {
    x *= 16;
    y *= 16;
    var temp = game.add.sprite(x, y, "atlas", "opossum/opossum-1");
    temp.anchor.setTo(0.5);
    game.physics.arcade.enable(temp);
    temp.body.gravity.y = 500;
    temp.body.setSize(16, 13, 8, 15);
    //add animations
    temp.animations.add(
      "run",
      Phaser.Animation.generateFrameNames("opossum/opossum-", 1, 6, "", 0),
      12,
      true
    );
    temp.animations.play("run");
    temp.body.velocity.x = 60 * game.rnd.pick([1, -1]);
    temp.body.bounce.x = 1;
    temp.enemyType = "opossum";

    this.enemies.add(temp);
  },

  createEagle: function (x, y, d, t = 1) {
    x *= 16;
    y *= 16;
    var temp = game.add.sprite(x, y, "atlas", "eagle/eagle-attack-1");
    temp.anchor.setTo(0.5);
    game.physics.arcade.enable(temp);
    temp.body.setSize(16, 13, 8, 20);

    // Animação de ataque
    temp.animations.add(
      "attack",
      Phaser.Animation.generateFrameNames("eagle/eagle-attack-", 1, 4, "", 0),
      12,
      true
    );
    temp.animations.play("attack");

    // Variável para armazenar a posição anterior no eixo X
    temp.prevX = x;

    // Movimento com tween
    var VTween = game.add.tween(temp).to(
      {
        y: y,
        x: x + d,
      },
      1000 * t,
      Phaser.Easing.Linear.None,
      true,
      0,
      -1
    );

    VTween.yoyo(true);

    // Verificar direção a cada frame para ajustar a escala
    VTween.onUpdateCallback(function () {
      if (temp.x > temp.prevX) {
        temp.scale.x = -1;
      } else {
        temp.scale.x = 1;
      }

      // Atualiza a posição anterior
      temp.prevX = temp.x;
    }, this);

    temp.enemyType = "eagle";
    this.enemies.add(temp);
  },

  createFrog: function (x, y) {
    x *= 16;
    y *= 16;
    var temp = game.add.sprite(x, y, "atlas", "frog/idle/frog-idle-1");
    temp.anchor.setTo(0.5);
    game.physics.arcade.enable(temp);
    temp.body.gravity.y = 500;
    temp.body.setSize(16, 16, 8, 11);
    //add animations
    temp.animations.add(
      "idle",
      Phaser.Animation.generateFrameNames("frog/idle/frog-idle-", 1, 4, "", 0),
      6,
      true
    );
    temp.animations.add("jump", ["frog/jump/frog-jump-1"], 6, false);
    temp.animations.add("fall", ["frog/jump/frog-jump-2"], 6, false);
    temp.animations.play("idle");
    temp.enemyType = "frog";
    temp.side = "right";

    this.enemies.add(temp);
  },

  createCherry: function (x, y) {
    x *= 16;
    y *= 16;
    var temp = game.add.sprite(x, y, "atlas", "cherry/cherry-1");
    temp.anchor.setTo(0.5);
    game.physics.arcade.enable(temp);
    //add animations
    temp.animations.add(
      "idle",
      Phaser.Animation.generateFrameNames("cherry/cherry-", 1, 7, "", 0),
      12,
      true
    );
    temp.animations.play("idle");

    this.items.add(temp);
  },

  createGem: function (x, y) {
    x *= 16;
    y *= 16;
    var temp = game.add.sprite(x, y, "atlas", "gem/gem-1");
    temp.anchor.setTo(0.5);
    game.physics.arcade.enable(temp);
    //add animations
    temp.animations.add(
      "idle",
      Phaser.Animation.generateFrameNames("gem/gem-", 1, 5, "", 0),
      12,
      true
    );
    temp.animations.play("idle");

    this.items.add(temp);
  },
  createCertUniqr: function (x, y) {
    x *= 16;
    y *= 16;
    // Cria o sprite usando a imagem carregada diretamente
    var temp = game.add.sprite(x, y, "D");
    temp.anchor.setTo(0.5);
    game.physics.arcade.enable(temp);

    // Remove as linhas relacionadas à animação:
    // temp.animations.add(...)
    // temp.animations.play(...)

    this.items.add(temp);
  },
  createCertUniq: function (x, y) {
    x *= 16;
    y *= 16;

    var temp = game.add.sprite(x, y, "certificate");
    temp.anchor.setTo(0.5);
    temp.scale.setTo(0.3); // Diminui o tamanho inicial para 50%
    game.physics.arcade.enable(temp);

    // Animação de pulsação suave
    game.add
      .tween(temp.scale)
      .to(
        {
          x: 0.35, // Aumenta 20% a partir de 0.5 (fica 0.6)
          y: 0.35,
        },
        350,
        Phaser.Easing.Linear.None
      )
      .to(
        {
          x: 0.25,
          y: 0.25,
        },
        350,
        Phaser.Easing.Linear.None
      )
      .loop()
      .start();

    this.items.add(temp);
  },

  update: function () {
    if (this.isQuestionActive) return;
    //this.debugGame();
    game.physics.arcade.collide(this.player, this.layer);
    game.physics.arcade.collide(this.enemies, this.layer);
    game.physics.arcade.overlap(this.player, null, this);
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

    //posicao player
    // if (this.map) {
    //   let playerX = this.player.x;
    //   let playerY = this.player.y;

    //   let tileX = Math.floor(playerX / this.map.tileWidth);
    //   let tileY = Math.floor(playerY / this.map.tileHeight);

    //   console.log(`Player posição: x=${playerX}, y=${playerY}`);
    //   console.log(`Tile calculado: x=${tileX}, y=${tileY}`);
    //   console.log(`Mapa tamanho: ${this.map.width}x${this.map.height}`);

    //   let tile = this.map.getTile(tileX, tileY, this.layer);

    //   if (tile) {
    //     console.log(`Tile encontrado: ${tile ? `ID=${tile.index}` : "Nenhum"}`);
    //   }
    // }
  },

  pickItem: function (player, item) {
    this.createItemFeedback(item.x, item.y);
    item.kill();
  },

  enemiesManager: function () {
    for (var i = 0, len = this.enemies.children.length; i < len; i++) {
      var tempEnemy = this.enemies.children[i];

      // opossum
      if (tempEnemy.enemyType == "opossum") {
        if (tempEnemy.body.velocity.x < 0) {
          tempEnemy.scale.x = 1;
        } else {
          tempEnemy.scale.x = -1;
        }
      }

      // eagle
      if (tempEnemy.enemyType == "eagle") {
        if (tempEnemy.x > this.player.x) {
          tempEnemy.scale.x = 1;
        } else {
          tempEnemy.scale.x = -1;
        }
      }

      // frog
      if (tempEnemy.enemyType == "frog") {
        if (tempEnemy.side == "left" && frogJumpSide == "right") {
          tempEnemy.scale.x = 1;
          tempEnemy.side = "right";
          tempEnemy.body.velocity.y = -200;
          tempEnemy.body.velocity.x = -100;
        } else if (tempEnemy.side == "right" && frogJumpSide == "left") {
          tempEnemy.scale.x = -1;
          tempEnemy.side = "left";
          tempEnemy.body.velocity.y = -200;
          tempEnemy.body.velocity.x = 100;
        } else if (tempEnemy.body.onFloor()) {
          tempEnemy.body.velocity.x = 0;
        }
        // animations
        if (tempEnemy.body.velocity.y < 0) {
          tempEnemy.animations.play("jump");
        } else if (tempEnemy.body.velocity.y > 0) {
          tempEnemy.animations.play("fall");
        } else {
          tempEnemy.animations.play("idle");
        }
      }
    }
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
    if (hurtFlag) {
      return;
    }
    hurtFlag = true;
    hurtTimer.start();
    this.player.body.velocity.y = -100;

    this.player.body.velocity.x = this.player.scale.x == 1 ? -100 : 100;
  },
  parallaxBackground: function () {
    this.background.tilePosition.x = this.layer.x * -0.1;
    this.middleground.tilePosition.x = this.layer.x * -0.5;
  },
  debugGame: function () {
    //game.debug.spriteInfo(this.player, 30, 30);
    //game.debug.body(this.enemies);
    game.debug.body(this.player);

    this.enemies.forEachAlive(this.renderGroup, this);
    this.items.forEachAlive(this.renderGroup, this);
  },
  renderGroup: function (member) {
    game.debug.body(member);
  },

  movePlayer: function () {
    if (hurtFlag) {
      this.player.animations.play("hurt");

      return;
    }

    // Lógica de movimento horizontal

    var vel = 150;

    if (this.wasd.left.isDown) {
      this.player.body.velocity.x = -vel;

      this.player.animations.play("run");

      this.player.scale.x = -1; // Inverte o sprite para a esquerda
    } else if (this.wasd.right.isDown) {
      this.player.body.velocity.x = vel;

      this.player.animations.play("run");

      this.player.scale.x = 1; // Inverte o sprite para a direita
    } else {
      this.player.body.velocity.x = 0; // Para o movimento horizontal

      if (this.player.body.onFloor()) {
        if (this.wasd.crouch.isDown) {
          this.player.animations.play("crouch");
        } else {
          this.player.animations.play("idle");
        }
      }
    }

    // Verifica se o jogador está no chão

    if (this.player.body.onFloor()) {
      if (!isLanding) {
        // Se não estava aterrissando antes

        this.player.animations.play("land"); // Toca a animação de aterrissagem

        isLanding = true; // Marca que o jogador está aterrissando
      }

      // Se a tecla de pulo é pressionada

      if (this.wasd.jump.isDown) {
        this.player.body.velocity.y = -170; // Aplica a força de pulo

        isLanding = false; // Reseta a variável de aterrissagem
      }
    } else {
      // Se o jogador não está no chão, verifica a direção do movimento vertical

      if (this.player.body.velocity.y < 0) {
        this.player.animations.play("jump");
      } else if (this.player.body.velocity.y > 0) {
        this.player.animations.play("fall");

        isLanding = false; // Reseta a variável de aterrissagem
      }
    }
  },
};

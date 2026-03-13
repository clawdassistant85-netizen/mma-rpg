var GameScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function GameScene() {
    Phaser.Scene.call(this, { key: 'GameScene' });
    this.player = null;
    this.enemies = [];
    this.walls = null;
    this.doors = null;
    this.lastDir = { x: 0, y: 1 };
    this.gameOver = false;
    this.paused = false;
    this.currentRoomId = 'room1';
    this.currentZone = 1;
    this.roomTransitioning = false;
    this.runStartMs = 0;
    this.enemiesDefeated = 0;
  },

  create: function() {
    var self = this;
    this.runStartMs = Date.now();
    this.enemiesDefeated = 0;

    this._savedGameData = null;
    if (typeof loadGame === 'function') {
      var loaded = loadGame();
      if (loaded && loaded.currentRoomId) {
        this.currentRoomId = loaded.currentRoomId;
        this.currentZone = loaded.currentZone || 1;
        this._savedGameData = loaded;
      }
    }

    this.walls = this.physics.add.staticGroup();
    this.doors = this.physics.add.staticGroup();
    MMA.Zones.buildRoom(this, this.currentRoomId);

    MMA.Player.create(this);

    this.enemyGroup = this.physics.add.group();
    MMA.Enemies.spawnForRoom(this, this.currentRoomId);
    this.physics.add.collider(this.enemyGroup, this.walls);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({ up:'W', down:'S', left:'A', right:'D' });
    this.jabKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    this.crossKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
    this.takedownKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
    this.hookKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.U);
    this.lowKickKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N);
    this.uppercutKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O);
    this.bodyShotKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.specialKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.headKickKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
    this.guillotineKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);
    this.infoKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    this.scene.launch('HUDScene');
    this.registry.set('playerStats', Object.assign({}, this.player.stats));
    this.registry.set('unlockedMoves', this.player.unlockedMoves.slice());
    this.registry.set('gameMessage', '');

    this.time.addEvent({
      delay: 100,
      loop: true,
      callback: function() {
        if (self.gameOver) return;
        MMA.Player.regenStaminaTick(self);
      }
    });
  },

  resumeFromPause: function() {
    this.physics.resume();
    this.paused = false;
  },

  update: function(time, delta) {
    if (this.infoKey && Phaser.Input.Keyboard.JustDown(this.infoKey)) {
      if (!this.gameOver && !this.roomTransitioning) {
        if (this.paused) this.resumeFromPause();
        else {
          this.registry.set('unlockedMoves', this.player.unlockedMoves.slice());
          this.registry.set('playerStats', Object.assign({}, this.player.stats));
          this.physics.pause();
          this.paused = true;
          this.scene.launch('PauseScene');
        }
      }
      return;
    }

    if (this.paused || this.gameOver || this.roomTransitioning) return;

    MMA.Player.handleMovement(this, time, delta);
    MMA.Combat.handleInput(this, delta);

    if (Phaser.Input.Keyboard.JustDown(this.pauseKey) || Phaser.Input.Keyboard.JustDown(this.escapeKey)) {
      if (this.scene.isActive('PauseScene')) {
        this.scene.stop('PauseScene');
        this.scene.resume();
      } else {
        this.scene.launch('PauseScene');
        this.scene.pause();
      }
    }

    MMA.Enemies.updateEnemies(this, delta);
    MMA.Items.update(this, time, delta);

    this.playerHpGfx.clear();
    var DT = CONFIG.DISPLAY_TILE;
    var bw = DT - 4;
    var pct = Math.max(0, this.player.stats.hp / this.player.stats.maxHp);
    this.playerHpGfx.fillStyle(0x333333);
    this.playerHpGfx.fillRect(this.player.x - bw / 2, this.player.y - DT / 2 - 8, bw, 5);
    this.playerHpGfx.fillStyle(0x44bb44);
    this.playerHpGfx.fillRect(this.player.x - bw / 2, this.player.y - DT / 2 - 8, bw * pct, 5);

    MMA.UI.updateHUDRegistry(this);
  }
});
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
    this.groundState = { active: false, enemy: null, timer: 0, escapeTick: 0 };
    this.gameOverAt = 0;
  },

  create: function() {
    var self = this;
    this.runStartMs = Date.now();
    this.enemiesDefeated = 0;
    this.gameOverAt = 0;
    this.groundState = { active: false, enemy: null, timer: 0, escapeTick: 0 };

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
    this.outfitKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    this.scene.launch('HUDScene');
    MMA.UI.bindMobilePauseButton(this);
    MMA.UI.setPauseButtonVisible(true);
    MMA.UI.setActionButtonLabels(false);
    this.hideGameOverRestartUI();
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

  playTakedownLunge: function(enemy) {
    if (!enemy || !enemy.active) return;
    this.tweens.add({
      targets: this.player,
      x: Phaser.Math.Linear(this.player.x, enemy.x, 0.35),
      y: Phaser.Math.Linear(this.player.y, enemy.y, 0.35),
      duration: 120,
      yoyo: true
    });
  },
  enterGroundState: function(enemy) {
    if (!enemy || !enemy.active) return;
    this.groundState = { active: true, enemy: enemy, timer: 10000, escapeTick: 2000 };
    MMA.UI.setActionButtonLabels(true);
    MMA.UI.showGroundBanner('TAKEDOWN!');
    this.registry.set('gameMessage', 'GROUND GAME');
    var midX = (this.player.x + enemy.x) / 2;
    var midY = (this.player.y + enemy.y) / 2;
    this.player.setPosition(midX - 12, midY);
    enemy.setPosition(midX + 12, midY);
  },
  endGroundState: function(reason) {
    if (!this.groundState.active) return;
    var enemy = this.groundState.enemy;
    this.groundState.active = false;
    this.groundState.enemy = null;
    this.groundState.timer = 0;
    if (enemy && enemy.active) {
      enemy.x += 30;
      this.player.x -= 30;
    }
    MMA.UI.setActionButtonLabels(false);
    MMA.UI.showGroundBanner('STAND UP');
    this.registry.set('gameMessage', reason === 'submission' ? 'SUBMISSION WIN!' : 'STAND UP');
    this.time.delayedCall(800, function(){ this.registry.set('gameMessage', ''); }, [], this);
  },
  showGameOverRestartUI: function() {
    var btn = document.getElementById('dom-restart-btn');
    if (btn) {
      btn.style.display = 'inline-block';
      var self = this;
      btn.onclick = function() { self.scene.restart(); };
    }
  },
  hideGameOverRestartUI: function() {
    var btn = document.getElementById('dom-restart-btn');
    if (btn) btn.style.display = 'none';
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

    // Outfit selection (E key)
    if (this.outfitKey && Phaser.Input.Keyboard.JustDown(this.outfitKey)) {
      if (!this.gameOver && !this.roomTransitioning) {
        if (this.paused && this.scene.isActive('OutfitScene')) {
          this.resumeFromPause();
          this.scene.stop('OutfitScene');
        } else if (this.paused) {
          this.resumeFromPause();
        } else {
          this.physics.pause();
          this.paused = true;
          this.scene.launch('OutfitScene');
        }
      }
      return;
    }

    if (this.gameOver) {
      if (!this.gameOverAt) {
        this.gameOverAt = time;
        this.showGameOverRestartUI();
      }
      MMA.UI.setPauseButtonVisible(false);
      if (Phaser.Input.Keyboard.JustDown(this.restartKey) || time - this.gameOverAt > 3000) {
        this.scene.restart();
      }
      return;
    }
    MMA.UI.setPauseButtonVisible(!this.paused && !this.roomTransitioning && !this.gameOver);
    if (this.paused || this.roomTransitioning) return;

    if (this.groundState.active) {
      this.player.body.setVelocity(0, 0);
      if (this.groundState.enemy && this.groundState.enemy.active && this.groundState.enemy.state !== 'dead') {
        this.groundState.timer -= delta;
        this.groundState.escapeTick -= delta;
        var enemy = this.groundState.enemy;
        this.player.setPosition(enemy.x - 12, enemy.y);
        if (this.groundState.escapeTick <= 0) {
          this.groundState.escapeTick = 2000;
          if (Math.random() < (enemy.type.groundEscape || 0.2)) {
            MMA.UI.showDamageText(this, enemy.x, enemy.y - 42, 'ENEMY ESCAPED!', '#ffaa33');
            this.endGroundState('enemy-escaped');
          }
        }
        if (this.groundState.timer <= 0) this.endGroundState('timer');
      } else {
        this.endGroundState('enemy-dead');
      }
    } else {
      MMA.Player.handleMovement(this, time, delta);
    }
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

    if (!this.groundState.active) MMA.Enemies.updateEnemies(this, delta);
    else {
      this.enemies.forEach(function(e){ if (e && e.active) e.setVelocity(0, 0); });
    }
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
    MMA.UI.updateSpecialButton(this);
  }
});
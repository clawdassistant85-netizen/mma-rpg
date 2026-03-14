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
    this.rapidFireState = null;
  },

  create: function() {
    var self = this;
    this.runStartMs = Date.now();
    this.enemiesDefeated = 0;
    this.gameOverAt = 0;
    this.groundState = { active: false, enemy: null, timer: 0, escapeTick: 0 };
    this.rapidFireState = null;

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
    // Submission selection keys (1-4 for ground game)
    this.sub1Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.sub2Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.sub3Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
    this.sub4Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);
    this.infoKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    this.outfitKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    this.scene.launch('HUDScene');
    MMA.UI.bindMobilePauseButton(this);
    MMA.UI.setPauseButtonVisible(true);
    MMA.UI.showTouchControls(true);
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
    this.groundState = { 
      active: true, 
      enemy: enemy, 
      timer: 10000, 
      escapeTick: 2000, 
      waitingForSubmission: false, 
      showingSubmissionPicker: false, 
      submissionPickerShown: false,
      position: 'fullGuard',  // Start in full guard
      improveTick: 0
    };
    MMA.UI.setActionButtonLabels(true, this);
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
    this.groundState.waitingForSubmission = false;
    this.groundState.showingSubmissionPicker = false;
    this.groundState.submissionPickerShown = false;
    this.groundState.selectedSubmission = null;
    this.groundState.position = 'fullGuard';
    this.groundState.improveTick = 0;
    if (enemy && enemy.active) {
      enemy.x += 30;
      this.player.x -= 30;
    }
    MMA.UI.setActionButtonLabels(false, this);
    MMA.UI.updateGroundHUD(this); // Hide ground overlay
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

  startRapidFireMode: function() {
    var room = MMA.Zones.getRoom(this.currentRoomId);
    if (!room || !room.rapidFireMode) {
      this.rapidFireState = null;
      return;
    }
    this.rapidFireState = {
      active: true,
      completed: false,
      elapsedMs: 0,
      durationMs: (this.registry.get('rapidFireDurationSeconds') || room.rapidFireDurationSeconds || 15) * 1000,
      spawnIntervalMs: (this.registry.get('rapidFireSpawnIntervalSeconds') || room.rapidFireSpawnIntervalSeconds || 2) * 1000,
      spawnTimerMs: 0,
      scoreMultiplier: this.registry.get('rapidFireScoreMultiplier') || room.rapidFireScoreMultiplier || 2.0,
      kills: 0,
      bonusXp: 0,
      roomName: this.registry.get('rapidFireRoomName') || room.name || 'Rapid Fire Room'
    };
    this.registry.set('rapidFireKills', 0);
    this.registry.set('rapidFireBonusXp', 0);
    this.registry.set('rapidFireTimeLeftSeconds', Math.ceil(this.rapidFireState.durationMs / 1000));
  },

  updateRapidFireMode: function(delta) {
    var state = this.rapidFireState;
    if (!state || !state.active || state.completed) return;

    state.elapsedMs += delta;
    state.spawnTimerMs += delta;

    var timeLeftMs = Math.max(0, state.durationMs - state.elapsedMs);
    this.registry.set('rapidFireTimeLeftSeconds', Math.ceil(timeLeftMs / 1000));

    if (state.elapsedMs >= state.durationMs) {
      state.active = false;
      state.completed = true;
      this.registry.set('gameMessage', 'RAPID FIRE COMPLETE! KOs: ' + state.kills + ' | BONUS XP: ' + state.bonusXp);
      var self = this;
      this.time.delayedCall(2200, function() {
        if (self.registry.get('gameMessage') && self.registry.get('gameMessage').indexOf('RAPID FIRE COMPLETE!') === 0) {
          self.registry.set('gameMessage', '');
        }
      });
      return;
    }

    var alive = this.enemies.filter(function(e) { return e && e.active && e.state !== 'dead'; }).length;
    if (alive >= 4) return;

    while (state.spawnTimerMs >= state.spawnIntervalMs) {
      state.spawnTimerMs -= state.spawnIntervalMs;
      this.spawnRapidFireEnemy();
      alive += 1;
      if (alive >= 4) break;
    }
  },

  spawnRapidFireEnemy: function() {
    if (!this.rapidFireState || !this.rapidFireState.active) return null;
    var room = MMA.Zones.getRoom(this.currentRoomId);
    if (!room) return null;
    var pool = (room.enemyPool || []).slice();
    var positions = (room.spawnPositions || []).slice();
    if (!pool.length || !positions.length) return null;

    var spawn = positions[Math.floor(Math.random() * positions.length)];
    var DT = CONFIG.DISPLAY_TILE;
    var x = spawn.col * DT + DT / 2;
    var y = spawn.row * DT + DT / 2;
    var enemyKey = pool[Math.floor(Math.random() * pool.length)];

    if (this.player) {
      for (var i = 0; i < positions.length; i++) {
        var test = positions[i];
        var tx = test.col * DT + DT / 2;
        var ty = test.row * DT + DT / 2;
        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, tx, ty) > DT * 2) {
          x = tx;
          y = ty;
          break;
        }
      }
    }

    return MMA.Enemies.spawnEnemy(this, enemyKey, x, y);
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
      MMA.UI.updateGroundHUD(this); // Update ground overlay + timer each frame
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

    if (this.registry.get('rapidFireModeActive')) {
      if (!this.rapidFireState || this.rapidFireState.roomName !== (this.registry.get('rapidFireRoomName') || 'Rapid Fire Room')) {
        this.startRapidFireMode();
      }
      this.updateRapidFireMode(delta);
    } else if (this.rapidFireState) {
      this.rapidFireState = null;
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

    // Update Focus Meter UI
    var focusState = this.player.focusState || { meter: 0 };
    var focusMax = window.MMA.Combat ? window.MMA.Combat.FOCUS_MAX : 100;
    MMA.UI.updateFocusMeter(this, focusState.meter, focusMax);

    MMA.UI.updateHUDRegistry(this);
    MMA.UI.updateSpecialButton(this);
  }
});
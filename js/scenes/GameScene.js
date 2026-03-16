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
    this.player2 = null;
    this._netTick = 0;
    this.groundState = { active: false, enemy: null, timer: 0, escapeTick: 0 };
    this.gameOverAt = 0;
    this.rapidFireState = null;
    this.defeatSceneQueued = false;
    this._lastHudRegistryUpdate = 0;
    this._lastSpecialButtonUpdate = 0;
    this._lastPauseButtonVisible = null;
    this._networkUnsubs = [];
  },

  create: function() {
    var self = this;
    this.runStartMs = Date.now();
    this.enemiesDefeated = 0;
    this.player2 = null;
    this._netTick = 0;
    this.gameOverAt = 0;
    this.defeatSceneQueued = false;
    this.groundState = { active: false, enemy: null, timer: 0, escapeTick: 0 };
    this.rapidFireState = null;
    this._lastHudRegistryUpdate = 0;
    this._lastSpecialButtonUpdate = 0;
    this._lastPauseButtonVisible = null;
    this._networkUnsubs = [];

    this._savedGameData = null;
    var allowLocalSave = !(window.MMA && MMA.Network && typeof MMA.Network.isClient === 'function' && MMA.Network.isClient());
    if (allowLocalSave && typeof loadGame === 'function') {
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
    // Show creed selector on first play
    var me = this;
    this.time.delayedCall(1500, function() {
      if (!me.gameOver && window.MMA && MMA.UI) {
        if (typeof MMA.UI.getCreed === 'function' && !MMA.UI.getCreed()) {
          if (typeof MMA.UI.showCreedSelector === 'function') MMA.UI.showCreedSelector(me);
        }
      }
    });
    // Player indicator circle — helps player find themselves on mobile
    this.playerIndicator = this.add.graphics().setDepth(4);
    if (window.MMA && MMA.Network && typeof MMA.Network.isMultiplayer === 'function' && MMA.Network.isMultiplayer()) {
      MMA.Player.createP2(this);
      this._setupNetworkHandlers();
    }

    this.enemyGroup = this.physics.add.group();
    if (!(window.MMA && MMA.Network && typeof MMA.Network.isClient === 'function' && MMA.Network.isClient())) {
      MMA.Enemies.spawnForRoom(this, this.currentRoomId);
    }
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
    this.outfitKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    this.scene.launch('HUDScene');
    MMA.UI.bindMobilePauseButton(this);
    this.syncPauseButtonVisibility(true);
    if (typeof MMA.UI.showTouchControls === 'function') MMA.UI.showTouchControls(true);
    if (typeof MMA.UI.setActionButtonLabels === 'function') MMA.UI.setActionButtonLabels(false, this);
    // Initialize move input display based on settings
    if (MMA.UI.settings && MMA.UI.settings.showInputDisplay) {
      if (typeof MMA.UI.showMoveInputDisplay === 'function') MMA.UI.showMoveInputDisplay();
    } else {
      if (typeof MMA.UI.hideMoveInputDisplay === 'function') MMA.UI.hideMoveInputDisplay();
    }
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

    this.events.once('shutdown', this._teardownNetworkHandlers, this);
    this.events.once('destroy', this._teardownNetworkHandlers, this);

    if (window.MMA && MMA.Network && typeof MMA.Network.isHost === 'function' && MMA.Network.isHost()) {
      this.time.delayedCall(300, function() {
        MMA.Network.send('room_change', {
          roomId: self.currentRoomId,
          zone: self.currentZone,
          initialSync: true
        });
      });
    }

    // Init hype meter DOM
    if (window.MMA && MMA.UI && typeof MMA.UI.initHypeMeterDOM === 'function') {
      MMA.UI.initHypeMeterDOM();
    }
    this._totalDmgDealt = this._totalDmgDealt || 0;
    this._totalDmgTaken = this._totalDmgTaken || 0;
    this._lastObservedComboCount = (this.player && this.player.comboState && this.player.comboState.index) || 0;
    this._lastObservedEnemiesDefeated = this.enemiesDefeated || 0;
    this._installPlayerDamageVfxHook();
    this._installCombatSceneHooks();
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
    if (window.MMA && MMA.UI && typeof MMA.UI.showGroundBanner === 'function') {
      MMA.UI.showGroundBanner('FULL GUARD');
    }
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
      btn.textContent = 'CONTINUE (ENTER)';
      var self = this;
      btn.onclick = function() { self.startDefeatScene(); };
    }
  },
  hideGameOverRestartUI: function() {
    var btn = document.getElementById('dom-restart-btn');
    if (btn) {
      btn.style.display = 'none';
      btn.textContent = 'RESTART (ENTER)';
      btn.onclick = null;
    }
  },
  startDefeatScene: function() {
    if (this.defeatSceneQueued) return;

    this.defeatSceneQueued = true;
    this.hideGameOverRestartUI();
    this.registry.set('enemiesDefeated', this.enemiesDefeated || 0);
    this.registry.set('playerStats', Object.assign({}, this.player ? this.player.stats : {}));
    this.registry.set('xpGained', this._mmaRoomXpGained || 0);

    var elapsed = 0;
    if (this.runStartMs) elapsed = Math.max(0, Math.floor((Date.now() - this.runStartMs) / 1000));
    else elapsed = Math.max(0, Math.floor((((this.time && this.time.now) || 0)) / 1000));
    this.registry.set('playTime', elapsed);
    if (window.MMA && MMA.Network && typeof MMA.Network.isHost === 'function' && MMA.Network.isHost() && MMA.Network.isMultiplayer()) {
      MMA.Network.send('game_over');
    }

    this.scene.stop('HUDScene');
    this.scene.start('DefeatScene');
  },
  syncPauseButtonVisibility: function(show) {
    if (this._lastPauseButtonVisible === show) return;
    this._lastPauseButtonVisible = show;
    if (typeof MMA.UI.setPauseButtonVisible === 'function') MMA.UI.setPauseButtonVisible(show);
  },
  _setupNetworkHandlers: function() {
    var self = this;

    if (!window.MMA || !MMA.Network || typeof MMA.Network.on !== 'function') return;

    if (!Array.isArray(this._networkUnsubs)) this._networkUnsubs = [];
    if (this._networkUnsubs.length) {
      this._networkUnsubs.forEach(function(unsub) { if (typeof unsub === 'function') unsub(); });
      this._networkUnsubs = [];
    }

    this._networkUnsubs.push(MMA.Network.on('player_state', function(msg) {
      var p2 = self.player2;
      if (!p2 || !p2.active) return;
      p2.setPosition(msg.x, msg.y);
      p2.setFlipX(!!msg.flipX);
      p2.isAttacking = !!msg.isAttacking;
      p2.facing = msg.facing || p2.facing;
      if (p2.stats) {
        p2.stats.hp = msg.hp;
        p2.stats.maxHp = msg.maxHp;
      }
    }));

    this._networkUnsubs.push(MMA.Network.on('enemy_states', function(msg) {
      if (MMA.Network.isHost()) return;

      var stateMap = {};
      (msg.enemies || []).forEach(function(s) {
        if (!s || !s.id) return;
        stateMap[s.id] = s;

        var enemy = self.enemies.find(function(e) {
          return e && e._netId === s.id;
        });

        if (!enemy) {
          enemy = MMA.Enemies.spawnEnemy(self, s.typeKey || 'streetThug', s.x, s.y, !!s.isElite, {
            netId: s.id,
            silent: true,
            skipEliteRoll: true
          });
          self._applyEnemySpawnVfx(enemy);
        }

        if (!enemy || !enemy.active) return;
        if (enemy.body) enemy.body.enable = false;
        enemy.setPosition(s.x, s.y);
        enemy.setFlipX(!!s.flipX);
        enemy.state = s.state || enemy.state;
        if (enemy.stats) enemy.stats.hp = s.hp;

        if (enemy._hpBarBg && enemy._hpBarFill && enemy.stats && enemy.stats.maxHp) {
          enemy._hpBarBg.x = enemy.x;
          enemy._hpBarBg.y = enemy.y - enemy.displayHeight / 2 - 8;
          enemy._hpBarFill.x = enemy.x;
          enemy._hpBarFill.y = enemy.y - enemy.displayHeight / 2 - 8;
          enemy._hpBarFill.width = 36 * Math.max(0, enemy.stats.hp / enemy.stats.maxHp);
        }
      });

      self.enemies.slice().forEach(function(enemy) {
        if (!enemy || stateMap[enemy._netId]) return;
        if (enemy._hpBarBg) enemy._hpBarBg.destroy();
        if (enemy._hpBarFill) enemy._hpBarFill.destroy();
        if (enemy.active) enemy.destroy();
      });
      self.enemies = self.enemies.filter(function(enemy) {
        return enemy && enemy.active && stateMap[enemy._netId];
      });
    }));

    this._networkUnsubs.push(MMA.Network.on('room_change', function(msg) {
      if (MMA.Network.isHost()) return;
      if (msg.initialSync) {
        self.currentRoomId = msg.roomId || self.currentRoomId;
        self.currentZone = msg.zone || self.currentZone;
        self.enemies.forEach(function(enemy) {
          if (!enemy) return;
          if (enemy._hpBarBg) enemy._hpBarBg.destroy();
          if (enemy._hpBarFill) enemy._hpBarFill.destroy();
          if (enemy.active) enemy.destroy();
        });
        self.enemies = [];
        MMA.Zones.buildRoom(self, self.currentRoomId);
        return;
      }
      MMA.Zones.transitionToRoom(self, msg.roomId, msg.fromDirection);
    }));

    this._networkUnsubs.push(MMA.Network.on('game_over', function() {
      if (MMA.Network.isHost()) return;
      self.startDefeatScene();
    }));

    this._networkUnsubs.push(MMA.Network.on('peer_disconnected', function() {
      self.registry.set('gameMessage', 'CO-OP: Player 2 disconnected');
      if (self.player2) {
        self.player2.destroy();
        self.player2 = null;
      }
    }));
  },

  _teardownNetworkHandlers: function() {
    if (!Array.isArray(this._networkUnsubs) || !this._networkUnsubs.length) return;
    this._networkUnsubs.forEach(function(unsub) { if (typeof unsub === 'function') unsub(); });
    this._networkUnsubs = [];
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
    if (window.MMA && MMA.Network && typeof MMA.Network.isClient === 'function' && MMA.Network.isClient()) return;

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
    if (window.MMA && MMA.Network && typeof MMA.Network.isClient === 'function' && MMA.Network.isClient()) return null;
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

    var newEnemy = MMA.Enemies.spawnEnemy(this, enemyKey, x, y);
    this._applyEnemySpawnVfx(newEnemy);
    return newEnemy;
  },

  _installPlayerDamageVfxHook: function() {
    if (this._playerDamageVfxHookInstalled) return;
    this._playerDamageVfxHookInstalled = true;
    this._lastObservedPlayerHp = (this.player && this.player.stats && this.player.stats.hp) || 0;
  },

  _findNearestEnemyForPlayerAttack: function() {
    var DT = (typeof CONFIG !== 'undefined' && CONFIG.DISPLAY_TILE) ? CONFIG.DISPLAY_TILE : 32;
    var nearestEnemy = null;
    var nearestDist = Infinity;
    var enemies = (this.enemyGroup && typeof this.enemyGroup.getChildren === 'function') ? this.enemyGroup.getChildren() : this.enemies;
    for (var i = 0; i < (enemies ? enemies.length : 0); i++) {
      var enemy = enemies[i];
      if (!enemy || !enemy.active || enemy.state === 'dead') continue;
      var dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (dist <= DT * 1.8 && dist < nearestDist) {
        nearestDist = dist;
        nearestEnemy = enemy;
      }
    }
    return nearestEnemy;
  },

  _installCombatSceneHooks: function() {
    if (!(window.MMA && MMA.Combat) || MMA.Combat._mmaGameSceneCombatHookInstalled) return;
    var originalExecuteAttack = MMA.Combat.executeAttack;
    if (typeof originalExecuteAttack !== 'function') return;

    MMA.Combat._mmaGameSceneCombatHookInstalled = true;
    MMA.Combat.executeAttack = function(scene, moveKey) {
      var targetEnemy = scene && typeof scene._findNearestEnemyForPlayerAttack === 'function' ? scene._findNearestEnemyForPlayerAttack() : null;
      var beforeHp = (targetEnemy && targetEnemy.stats) ? targetEnemy.stats.hp : null;
      var wasGroundActive = !!(scene && scene.groundState && scene.groundState.active);
      var nearestEnemy = targetEnemy;
      var result = originalExecuteAttack.apply(this, arguments);

      var afterHp = (targetEnemy && targetEnemy.stats) ? targetEnemy.stats.hp : beforeHp;
      var dmgDealt = (typeof beforeHp === 'number' && typeof afterHp === 'number') ? Math.max(0, beforeHp - afterHp) : 0;
      if (dmgDealt > 0) {
        // Sweat shower on heavy hits
        if (dmgDealt >= 15 && window.MMA && MMA.VFX && typeof MMA.VFX.showSweatShower === 'function') {
          MMA.VFX.showSweatShower(scene, targetEnemy.x || 0, targetEnemy.y || 0, dmgDealt);
        }
      }

      if (moveKey === 'takedown' && scene && scene.groundState && scene.groundState.active && !wasGroundActive) {
        // Knockdown dust cloud
        if (window.MMA && MMA.VFX && typeof MMA.VFX.showKnockdownDust === 'function') {
          var tgt = scene._groundTarget || nearestEnemy;
          if (tgt) MMA.VFX.showKnockdownDust(scene, tgt.x, tgt.y);
        }
      }

      return result;
    };
  },

  _checkPlayerDamageVfx: function() {
    var scn = this;
    var hp = (scn.player && scn.player.stats && scn.player.stats.hp) || 0;
    var prevHp = (typeof scn._lastObservedPlayerHp === 'number') ? scn._lastObservedPlayerHp : hp;
    if (hp < prevHp) {
      // Check second wind
      if (window.MMA && MMA.Combat && typeof MMA.Combat.checkSecondWind === 'function') {
        MMA.Combat.checkSecondWind(scn);
      }
    }
    scn._lastObservedPlayerHp = hp;
  },

  _applyEnemySpawnVfx: function(newEnemy) {
    if (!newEnemy) return;

    // Apply nemesis tint if applicable
    if (window.MMA && MMA.Enemies && typeof MMA.Enemies.applyNemesisTint === 'function') {
      MMA.Enemies.applyNemesisTint(this, newEnemy);
    }

    // Boss chroma aura
    if (newEnemy && newEnemy.type && newEnemy.type.isBoss && window.MMA && MMA.Sprites && typeof MMA.Sprites.applyBossAura === 'function') {
      MMA.Sprites.applyBossAura(this, newEnemy);
    }
  },

  _handleEnemyKoVfx: function(killedEnemy) {
    if (!killedEnemy || killedEnemy._mmaKoHooksApplied) return;
    killedEnemy._mmaKoHooksApplied = true;

    // Impact replay slow-mo
    if (window.MMA && MMA.VFX && typeof MMA.VFX.showImpactReplay === 'function') {
      MMA.VFX.showImpactReplay(this, killedEnemy);
    }

    // Record finisher
    if (this._lastMoveKey && window.MMA && MMA.Player && typeof MMA.Player.recordFinisher === 'function') {
      MMA.Player.recordFinisher(this._lastMoveKey);
    }
    // Record boss defeated
    if (killedEnemy && killedEnemy.type && killedEnemy.type.isBoss && window.MMA && MMA.Player && typeof MMA.Player.recordBossDefeated === 'function') {
      MMA.Player.recordBossDefeated(this);
    }
  },

  _updateEnemySceneHooks: function() {
    var self = this;
    this.enemies.forEach(function(enemy) {
      if (!enemy || !enemy.active) return;

      if (!enemy._mmaSpawnHooksApplied) {
        enemy._mmaSpawnHooksApplied = true;
        self._applyEnemySpawnVfx(enemy);
      }

      // Boss chroma aura update
      if (enemy.type && enemy.type.isBoss && window.MMA && MMA.Sprites && typeof MMA.Sprites.updateBossAura === 'function') {
        MMA.Sprites.updateBossAura(enemy);
      }

      // Echo enemy update
      if (enemy.type && (enemy.type.key === 'echo' || enemy.type.behaviorType === 'echo') &&
          window.MMA && MMA.Enemies && typeof MMA.Enemies.updateEchoEnemy === 'function') {
        MMA.Enemies.updateEchoEnemy(self, enemy);
      }

      // Drunk Monk erratic update
      if (enemy.type && (enemy.type.key === 'drunkMonk' || enemy.type.behaviorType === 'erratic') &&
          window.MMA && MMA.Enemies && typeof MMA.Enemies.updateDrunkMonk === 'function') {
        MMA.Enemies.updateDrunkMonk(self, enemy);
      }

      if (enemy.stats && enemy.stats.hp <= 0) {
        self._handleEnemyKoVfx(enemy);
      }
    });
  },

  update: function(time, delta) {
    // Update player indicator position
    if (this.playerIndicator && this.player && this.player.active && !this.gameOver) {
      this.playerIndicator.clear();
      this.playerIndicator.lineStyle(2, 0x00ff88, 0.75);
      this.playerIndicator.strokeCircle(this.player.x, this.player.y + 16, 16);
    }

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
      this.syncPauseButtonVisibility(false);
      if (Phaser.Input.Keyboard.JustDown(this.restartKey) || time - this.gameOverAt > 3000) {
        this.startDefeatScene();
      }
      return;
    }

    if (!this.gameOver) {
      // Danger effect updates (throttled)
      if (!this._vfxPulseTick || this.time.now - this._vfxPulseTick > 500) {
        this._vfxPulseTick = this.time.now;
        if (window.MMA && MMA.VFX) {
          if (typeof MMA.VFX.updateLastChancePulse === 'function') MMA.VFX.updateLastChancePulse(this);
          if (typeof MMA.VFX.updateDesaturateEffect === 'function') MMA.VFX.updateDesaturateEffect(this);
        }
      }
      // Hype drain
      if (window.MMA && MMA.UI && typeof MMA.UI.updateHypeDrain === 'function') {
        MMA.UI.updateHypeDrain();
      }

      // Exertion and style aura updates
      if (!this._exertionTick || this.time.now - this._exertionTick > 400) {
        this._exertionTick = this.time.now;
        if (!this.gameOver && window.MMA && MMA.VFX) {
          if (typeof MMA.VFX.updateExertionEffect === 'function') MMA.VFX.updateExertionEffect(this);
        }
        if (!this.gameOver && window.MMA && MMA.Sprites && typeof MMA.Sprites.updatePlayerStyleAura === 'function') {
          MMA.Sprites.updatePlayerStyleAura(this);
        }
      }

      var comboCount = (this.player && this.player.comboState && this.player.comboState.index) || 0;
      if (comboCount > this._lastObservedComboCount) {
        // Combo letter reveal at milestones
        if ([5, 10, 15, 20].indexOf(comboCount) >= 0 && window.MMA && MMA.VFX && typeof MMA.VFX.showComboLetter === 'function') {
          MMA.VFX.showComboLetter(this, comboCount);
        }
        if (comboCount >= 10 && window.MMA && MMA.VFX && typeof MMA.VFX.showCrowdRipple === 'function') {
          MMA.VFX.showCrowdRipple(this, comboCount);
        }
        // Also add hype on combo hits
        if (comboCount >= 3 && window.MMA && MMA.UI && typeof MMA.UI.addHype === 'function') {
          MMA.UI.addHype(this, comboCount >= 10 ? 15 : 5);
        }
      }
      this._lastObservedComboCount = comboCount;
    }

    if (window.MMA && MMA.Network && typeof MMA.Network.isMultiplayer === 'function' && MMA.Network.isMultiplayer()) {
      this._netTick += delta;
      if (this._netTick >= 50) {
        this._netTick = 0;
        MMA.Network.sendPlayerState(this.player);
        if (MMA.Network.isHost()) MMA.Network.sendEnemyStates(this.enemies);
      }
    }
    this.syncPauseButtonVisibility(!this.paused && !this.roomTransitioning && !this.gameOver);
    if (this.paused || this.roomTransitioning) return;

    if (this.groundState.active) {
      MMA.UI.updateGroundHUD(this); // Update ground overlay + timer each frame
      this.player.body.setVelocity(0, 0);
      if (this.groundState.enemy && this.groundState.enemy.active && this.groundState.enemy.state !== 'dead') {
        this.groundState.timer -= delta;
        this.groundState.escapeTick -= delta;
        // Track ground time for unlock system (once per second to avoid spamming localStorage)
        if (!this._groundTimeTrackTs || this.time.now - this._groundTimeTrackTs > 1000) {
          this._groundTimeTrackTs = this.time.now;
          try {
            var _gt = JSON.parse(localStorage.getItem('mma_move_history') || '{}');
            _gt._meta = _gt._meta || {};
            _gt._meta.totalGroundTime = (_gt._meta.totalGroundTime || 0) + 1;
            localStorage.setItem('mma_move_history', JSON.stringify(_gt));
          } catch(e) {}
        }
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
    this._checkPlayerDamageVfx();

    if (this._grabbedByEnemyTs && !this._wasGrabbedByEnemyTs) {
      // Show grapple escape prompt
      if (window.MMA && MMA.Ground && typeof MMA.Ground.showGrappleEscapePrompt === 'function') {
        MMA.Ground.showGrappleEscapePrompt(this);
      }
    } else if (!this._grabbedByEnemyTs && this._wasGrabbedByEnemyTs) {
      // Hide grapple escape prompt
      if (window.MMA && MMA.Ground && typeof MMA.Ground.hideGrappleEscapePrompt === 'function') {
        MMA.Ground.hideGrappleEscapePrompt(this);
      }
    }
    this._wasGrabbedByEnemyTs = this._grabbedByEnemyTs;

    if (!this.gameOver) {
      // Focus breakout — spend 25 Focus to instantly break free
      if (this.player && this.player.stats && (this.player.stats.focus || 0) >= 25) {
        if (this._grabbedByEnemyTs && (this.time.now - this._grabbedByEnemyTs) > 500) {
          // Check if special button pressed while grabbed
          if (window.MMA_ACTION && MMA_ACTION.special) {
            this.player.stats.focus -= 25;
            this._grabbedByEnemyTs = null;
            // Hide grapple escape prompt
            if (window.MMA && MMA.Ground && typeof MMA.Ground.hideGrappleEscapePrompt === 'function') {
              MMA.Ground.hideGrappleEscapePrompt(this);
            }
            this._grappleBreakPresses = 0;
            if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
              MMA.UI.showDamageText(this, this.player.x, this.player.y - 20, 'FOCUS BREAK!', '#FFD700');
            }
          }
        }
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.escapeKey)) {
      if (this.scene.isActive('PauseScene')) {
        this.scene.stop('PauseScene');
        this.scene.resume();
      } else {
        this.scene.launch('PauseScene');
        this.scene.pause();
      }
    }

    if (!this.groundState.active) {
      if (!(window.MMA && MMA.Network && typeof MMA.Network.isMultiplayer === 'function' && MMA.Network.isMultiplayer() && MMA.Network.isClient())) {
        MMA.Enemies.updateEnemies(this, delta);
      } else {
        this.enemies.forEach(function(e){ if (e && e.active) e.setVelocity(0, 0); });
      }
    } else {
      this.enemies.forEach(function(e){ if (e && e.active) e.setVelocity(0, 0); });
    }
    this._updateEnemySceneHooks();

    if (!this.gameOver) {
      var observedEnemiesDefeated = this.enemiesDefeated || 0;
      if (observedEnemiesDefeated > this._lastObservedEnemiesDefeated) {
        // Technique mutation check
        if (this._lastMoveKey && window.MMA && MMA.UI && typeof MMA.UI.checkTechniqueMutation === 'function') {
          MMA.UI.checkTechniqueMutation(this, this._lastMoveKey);
        }
      }
      this._lastObservedEnemiesDefeated = observedEnemiesDefeated;
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
    if (typeof MMA.UI.updateFocusMeter === 'function') MMA.UI.updateFocusMeter(this, focusState.meter, focusMax);

    if (!this._lastHudRegistryUpdate || time - this._lastHudRegistryUpdate >= 100) {
      this._lastHudRegistryUpdate = time;
      MMA.UI.updateHUDRegistry(this);
    }
    if (!this._lastSpecialButtonUpdate || time - this._lastSpecialButtonUpdate >= 250) {
      this._lastSpecialButtonUpdate = time;
      MMA.UI.updateSpecialButton(this);
    }
  }
});
// === GAMESCENE HOOK REGISTRY ===
// Replaces stacked prototype monkey-patching with a clean hook array system.
// New features register callbacks instead of re-wrapping the prototype.
(function() {
  if (typeof Phaser === 'undefined') return;
  var _GS = window.GameScene;
  if (!_GS || _GS.prototype._hookRegistryInstalled) return;
  _GS.prototype._hookRegistryInstalled = true;

  // Hook arrays — push callbacks here instead of monkey-patching create/update/etc
  _GS.prototype._onCreateHooks   = _GS.prototype._onCreateHooks   || [];
  _GS.prototype._onUpdateHooks   = _GS.prototype._onUpdateHooks   || [];
  _GS.prototype._onZoneClearHooks = _GS.prototype._onZoneClearHooks || [];
  _GS.prototype._onGameOverHooks  = _GS.prototype._onGameOverHooks  || [];
  _GS.prototype._onKOHooks        = _GS.prototype._onKOHooks        || [];

  // Public API for feature modules to register hooks
  window.MMAGameHooks = window.MMAGameHooks || {};
  window.MMAGameHooks.onCreate    = function(fn) { _GS.prototype._onCreateHooks.push(fn); };
  window.MMAGameHooks.onUpdate    = function(fn) { _GS.prototype._onUpdateHooks.push(fn); };
  window.MMAGameHooks.onZoneClear = function(fn) { _GS.prototype._onZoneClearHooks.push(fn); };
  window.MMAGameHooks.onGameOver  = function(fn) { _GS.prototype._onGameOverHooks.push(fn); };
  window.MMAGameHooks.onKO        = function(fn) { _GS.prototype._onKOHooks.push(fn); };

  // Throttled update scheduler — avoids running every hook every frame
  window.MMAGameHooks._throttleMs = 100; // default throttle for non-critical hooks
  window.MMAGameHooks._lastThrottledRun = 0;

  // Wire the hook runner into the existing create/update via one-time monkey-patch
  // This is the ONLY monkey-patch — all future features use MMAGameHooks.on* instead
  if (!_GS.prototype._hookRunnerInstalled) {
    _GS.prototype._hookRunnerInstalled = true;

    var _baseCreate = _GS.prototype.create;
    if (typeof _baseCreate === 'function') {
      _GS.prototype.create = function() {
        _baseCreate.call(this);
        var scene = this;
        var hooks = scene._onCreateHooks || [];
        for (var i = 0; i < hooks.length; i++) {
          try { hooks[i].call(scene, scene); } catch(e) { console.warn('[Hook:onCreate]', e); }
        }
      };
    }

    var _baseUpdate = _GS.prototype.update;
    if (typeof _baseUpdate === 'function') {
      _GS.prototype.update = function(time, delta) {
        _baseUpdate.call(this, time, delta);
        var scene = this;
        if (scene.gameOver || scene.paused) return;
        var now = Date.now();
        var hooks = scene._onUpdateHooks || [];
        for (var i = 0; i < hooks.length; i++) {
          try { hooks[i].call(scene, scene, delta); } catch(e) { console.warn('[Hook:onUpdate]', e); }
        }
      };
    }

    // Wire zone clear hooks
    var _zcNames = ['onZoneClear', 'handleZoneClear'];
    for (var zi = 0; zi < _zcNames.length; zi++) {
      if (typeof _GS.prototype[_zcNames[zi]] === 'function' && !_GS.prototype['_hookZC_' + zi]) {
        _GS.prototype['_hookZC_' + zi] = true;
        (function(key) {
          var _orig = _GS.prototype[key];
          _GS.prototype[key] = function() {
            _orig.call(this);
            var scene = this;
            var hooks = scene._onZoneClearHooks || [];
            for (var i = 0; i < hooks.length; i++) {
              try { hooks[i].call(scene, scene); } catch(e) { console.warn('[Hook:onZoneClear]', e); }
            }
          };
        })(_zcNames[zi]);
        break;
      }
    }

    // Wire game over hooks
    var _goNames = ['triggerGameOver', 'onGameOver'];
    for (var gi = 0; gi < _goNames.length; gi++) {
      if (typeof _GS.prototype[_goNames[gi]] === 'function' && !_GS.prototype['_hookGO_' + gi]) {
        _GS.prototype['_hookGO_' + gi] = true;
        (function(key) {
          var _orig = _GS.prototype[key];
          _GS.prototype[key] = function() {
            _orig.call(this);
            var scene = this;
            var hooks = scene._onGameOverHooks || [];
            for (var i = 0; i < hooks.length; i++) {
              try { hooks[i].call(scene, scene); } catch(e) { console.warn('[Hook:onGameOver]', e); }
            }
          };
        })(_goNames[gi]);
        break;
      }
    }
  }
})();
// === BATCH 24 GAMESCENE WIRING ===
(function() {
  if (typeof Phaser === 'undefined') return;
  var _GameScene = window.GameScene;
  if (!_GameScene) return;

  // Wire entrance animation on scene create
  var _origCreate = _GameScene.prototype.create;
  if (typeof _origCreate === 'function' && !_GameScene.prototype._b24CreateHooked) {
    _GameScene.prototype._b24CreateHooked = true;
    _GameScene.prototype.create = function() {
      _origCreate.call(this);
      // Play entrance animation
      var scene = this;
      if (window.MMA && MMA.Sprites && typeof MMA.Sprites.playEntranceAnimation === 'function') {
        MMA.Sprites.playEntranceAnimation(scene, null);
      }
      // Init weather HUD
      if (window.MMA && MMA.UIMeter && typeof MMA.UIMeter.initWeatherHUD === 'function') {
        MMA.UIMeter.initWeatherHUD();
      }
      // Init judge meter
      if (window.MMA && MMA.UIMeter && typeof MMA.UIMeter.initJudgeMeter === 'function') {
        MMA.UIMeter.initJudgeMeter();
      }
      // Init gear durability bar
      if (window.MMA && MMA.UIMeter && typeof MMA.UIMeter.initGearDurabilityBar === 'function') {
        MMA.UIMeter.initGearDurabilityBar();
      }
      // Start wildlife ambience for current zone
      if (window.MMA && MMA.Zones && typeof MMA.Zones.startWildlifeAmbience === 'function') {
        MMA.Zones.startWildlifeAmbience(scene, scene.currentZone || 1);
      }
      // Play entrance theme
      var creed = (window.MMA && MMA.UI && typeof MMA.UI.getCreed === 'function') ? MMA.UI.getCreed() : 'balanced';
      if (window.MMA && MMA.Audio && typeof MMA.Audio.playEntranceTheme === 'function') {
        MMA.Audio.playEntranceTheme(scene, creed);
      }
    };
  }

  // Wire update loop additions
  var _origUpdate = _GameScene.prototype.update;
  if (typeof _origUpdate === 'function' && !_GameScene.prototype._b24UpdateHooked) {
    _GameScene.prototype._b24UpdateHooked = true;
    _GameScene.prototype.update = function(time, delta) {
      _origUpdate.call(this, time, delta);
      var scene = this;
      // Corner desperation VFX
      if (window.MMA && MMA.VFX && typeof MMA.VFX.updateCornerDesperation === 'function') {
        MMA.VFX.updateCornerDesperation(scene);
      }
      // Judge meter update
      if (window.MMA && MMA.UIMeter && typeof MMA.UIMeter.updateJudgeMeter === 'function') {
        MMA.UIMeter.updateJudgeMeter();
      }
      // Gear durability bar update
      if (window.MMA && MMA.UIMeter && typeof MMA.UIMeter.updateGearDurabilityBar === 'function') {
        MMA.UIMeter.updateGearDurabilityBar(scene);
      }
      // Enemy taunts + corner escape + pack hunter
      var enemies = scene.enemies || [];
      enemies.forEach(function(e) {
        if (!e || !e.active || e.hp <= 0) return;
        if (window.MMA && MMA.EnemiesCore && typeof MMA.EnemiesCore.tryEnemyTaunt === 'function') {
          MMA.EnemiesCore.tryEnemyTaunt(scene, e);
        }
        if (window.MMA && MMA.EnemiesAI && typeof MMA.EnemiesAI.checkCornerEscape === 'function') {
          MMA.EnemiesAI.checkCornerEscape(scene, e);
        }
      });
      // Pack hunter coordination
      if (window.MMA && MMA.EnemiesAI && typeof MMA.EnemiesAI.updatePackHunter === 'function') {
        MMA.EnemiesAI.updatePackHunter(scene, enemies);
      }
      // Combo DNA visual
      if (window.MMA && MMA.UI && typeof MMA.UI.updateComboDNA === 'function') {
        if (!scene._comboDNATick || time - scene._comboDNATick > 500) {
          scene._comboDNATick = time;
          MMA.UI.updateComboDNA(scene);
        }
      }
      // Gear degradation on player damage (hook via flag)
      if (scene._playerDamagedThisFrame && window.MMA && MMA.Player && typeof MMA.Player.degradeGear === 'function') {
        MMA.Player.degradeGear(scene, scene._playerDamagedThisFrame);
        scene._playerDamagedThisFrame = null;
      }
    };
  }

  // Wire KO hook for boss death sequence, KO bell, tournament check
  var _origHandleKO = _GameScene.prototype.handleEnemyKO || _GameScene.prototype.onEnemyKO;
  if (typeof _origHandleKO === 'function' && !_GameScene.prototype._b24KOHooked) {
    _GameScene.prototype._b24KOHooked = true;
    var _koName = _GameScene.prototype.handleEnemyKO ? 'handleEnemyKO' : 'onEnemyKO';
    _GameScene.prototype[_koName] = function(enemy) {
      _origHandleKO.call(this, enemy);
      var scene = this;
      // Boss death sequence
      if (enemy && enemy.isBoss && window.MMA && MMA.Sprites && typeof MMA.Sprites.playBossDeathSequence === 'function') {
        MMA.Sprites.playBossDeathSequence(scene, enemy, null);
      }
      // KO bell
      if (window.MMA && MMA.Audio && typeof MMA.Audio.playKOBell === 'function') {
        MMA.Audio.playKOBell();
      }
      // Tournament unlock check
      if (window.MMA && MMA.EnemiesCore && typeof MMA.EnemiesCore.checkTournamentUnlock === 'function') {
        MMA.EnemiesCore.checkTournamentUnlock(scene);
      }
      // Judge score on KO
      if (window.MMA && MMA.Combat && typeof MMA.Combat.addJudgeScore === 'function') {
        MMA.Combat.addJudgeScore(20);
      }
      // Fight club rep
      if (window.MMA && MMA.UI && typeof MMA.UI.addFightClubRep === 'function') {
        MMA.UI.addFightClubRep(scene, scene.currentZone || 1, 10);
      }
    };
  }
})();
// === BATCH 25 GAMESCENE WIRING ===
(function() {
  if (typeof Phaser === 'undefined') return;
  var _GS = window.GameScene;
  if (!_GS || _GS.prototype._b25Hooked) return;
  _GS.prototype._b25Hooked = true;

  var _origUpdate = _GS.prototype.update;
  if (typeof _origUpdate === 'function') {
    _GS.prototype.update = function(time, delta) {
      _origUpdate.call(this, time, delta);
      var scene = this;
      var p = scene.player;

      // Stamina recovery burst
      if (window.MMA && MMA.Combat && typeof MMA.Combat.updateStaminaRecovery === 'function') {
        MMA.Combat.updateStaminaRecovery(scene);
      }

      // Streak display
      if (window.MMA && MMA.UI && typeof MMA.UI.updateStreakDisplay === 'function') {
        if (!scene._streakTick || time - scene._streakTick > 200) {
          scene._streakTick = time;
          MMA.UI.updateStreakDisplay(scene);
        }
      }

      // Momentum trail when on fire
      if (p && window.MMA && MMA.Combat && MMA.Combat._playerMomentumUntil && Date.now() < MMA.Combat._playerMomentumUntil) {
        if (window.MMA && MMA.VFX && typeof MMA.VFX.showMomentumTrail === 'function') {
          if (!scene._momentumTrailTick || time - scene._momentumTrailTick > 80) {
            scene._momentumTrailTick = time;
            MMA.VFX.showMomentumTrail(scene, p);
          }
        }
      }

      // Berserker aura on enemies
      var enemies = scene.enemies || [];
      enemies.forEach(function(e) {
        if (!e || !e.active) return;
        // Check berserker
        if (window.MMA && MMA.EnemiesCombat && typeof MMA.EnemiesCombat.checkBerserkerRage === 'function') {
          MMA.EnemiesCombat.checkBerserkerRage(scene, e);
        }
        // Update berserker aura VFX
        if (window.MMA && MMA.VFX && typeof MMA.VFX.updateBerserkerAura === 'function') {
          MMA.VFX.updateBerserkerAura(scene, e);
        }
      });

      // Style evolution check (every 5s)
      if (!scene._styleEvolveTick || time - scene._styleEvolveTick > 5000) {
        scene._styleEvolveTick = time;
        if (window.MMA && MMA.Player && typeof MMA.Player.checkStyleEvolution === 'function') {
          MMA.Player.checkStyleEvolution(scene);
        }
      }
    };
  }

  // Wire zone clear
  var _origZoneClear = _GS.prototype.onZoneClear || _GS.prototype.handleZoneClear;
  var _zcName = _GS.prototype.onZoneClear ? 'onZoneClear' : 'handleZoneClear';
  if (typeof _origZoneClear === 'function' && !_GS.prototype._b25ZCHooked) {
    _GS.prototype._b25ZCHooked = true;
    _GS.prototype[_zcName] = function() {
      _origZoneClear.call(this);
      var scene = this;
      // Zone clear banner
      if (window.MMA && MMA.UI && typeof MMA.UI.showZoneClearBanner === 'function') {
        MMA.UI.showZoneClearBanner(scene, scene.currentZone || 1);
      }
      // Victory fireworks
      if (window.MMA && MMA.VFX && typeof MMA.VFX.showVictoryFireworks === 'function') {
        MMA.VFX.showVictoryFireworks(scene);
      }
      // Record win
      if (window.MMA && MMA.Player && typeof MMA.Player.recordWin === 'function') {
        MMA.Player.recordWin();
      }
      // Check clinic spawn
      if (window.MMA && MMA.Zones && typeof MMA.Zones.spawnClinicIfNeeded === 'function') {
        scene._nextRoomClinic = MMA.Zones.spawnClinicIfNeeded(scene);
      }
    };
  }

  // Wire game over (loss)
  var _origGameOver = _GS.prototype.triggerGameOver || _GS.prototype.onGameOver;
  var _goName = _GS.prototype.triggerGameOver ? 'triggerGameOver' : 'onGameOver';
  if (typeof _origGameOver === 'function' && !_GS.prototype._b25GOHooked) {
    _GS.prototype._b25GOHooked = true;
    _GS.prototype[_goName] = function() {
      _origGameOver.call(this);
      if (window.MMA && MMA.Player && typeof MMA.Player.recordLoss === 'function') {
        MMA.Player.recordLoss();
      }
      if (window.MMA && MMA.Audio && typeof MMA.Audio.playKOBell === 'function') {
        MMA.Audio.playKOBell();
      }
    };
  }
})();
// === BATCH 26 GAMESCENE WIRING ===
(function() {
  if (typeof Phaser === 'undefined') return;
  var _GS = window.GameScene;
  if (!_GS || _GS.prototype._b26Hooked) return;
  _GS.prototype._b26Hooked = true;

  // Wire update additions
  var _origUpdate = _GS.prototype.update;
  if (typeof _origUpdate === 'function') {
    _GS.prototype.update = function(time, delta) {
      _origUpdate.call(this, time, delta);
      var scene = this;

      // Corner domination HUD + VFX
      if (window.MMA && MMA.UIMeter && typeof MMA.UIMeter.updateCornerDomHUD === 'function') {
        MMA.UIMeter.updateCornerDomHUD(scene);
      }
      if (window.MMA && MMA.VFX && typeof MMA.VFX.updateCornerDomVFX === 'function') {
        MMA.VFX.updateCornerDomVFX(scene);
      }

      // Fatigue indicators on buttons (every 1s)
      if (!scene._fatigueTick || time - scene._fatigueTick > 1000) {
        scene._fatigueTick = time;
        if (window.MMA && MMA.UIMeter && typeof MMA.UIMeter.updateFatigueIndicators === 'function') {
          MMA.UIMeter.updateFatigueIndicators();
        }
      }

      // Tournament rival AI updates
      var enemies = scene.enemies || [];
      enemies.forEach(function(e) {
        if (!e || !e.active || e.hp <= 0) return;
        if (e.type === 'tournamentFighter' && window.MMA && MMA.EnemiesAI && typeof MMA.EnemiesAI.updateTournamentAI === 'function') {
          MMA.EnemiesAI.updateTournamentAI(scene, e);
        }
        if (e.type === 'rivalryFighter' && window.MMA && MMA.EnemiesAI && typeof MMA.EnemiesAI.updateRivalryAI === 'function') {
          MMA.EnemiesAI.updateRivalryAI(scene, e);
        }
        if (e.type === 'weatherGuard' && window.MMA && MMA.EnemiesAI && typeof MMA.EnemiesAI.updateWeatherAI === 'function') {
          MMA.EnemiesAI.updateWeatherAI(scene, e);
        }
      });
    };
  }

  // Wire combat hit to record move fatigue + conditioning label flash
  var _origCreate = _GS.prototype.create;
  if (typeof _origCreate === 'function') {
    _GS.prototype.create = function() {
      _origCreate.call(this);
      var scene = this;
      // Init corner dom HUD
      if (window.MMA && MMA.UIMeter && typeof MMA.UIMeter.initCornerDomHUD === 'function') {
        MMA.UIMeter.initCornerDomHUD();
      }
      // Reset move fatigue on new fight
      if (window.MMA && MMA.Combat && typeof MMA.Combat.resetMoveFatigue === 'function') {
        MMA.Combat.resetMoveFatigue();
      }
      // Show star rating at fight start (reset judge score)
      if (window.MMA && MMA.Combat && typeof MMA.Combat.resetJudgeScore === 'function') {
        MMA.Combat.resetJudgeScore();
      }
      // Show tournament entry flash if unlocked
      if (window.MMA && MMA.EnemiesCore && typeof MMA.EnemiesCore.isTournamentUnlocked === 'function') {
        if (MMA.EnemiesCore.isTournamentUnlocked() && window.MMA && MMA.VFX && typeof MMA.VFX.showTournamentEntry === 'function') {
          scene.time.delayedCall(1000, function() { MMA.VFX.showTournamentEntry(scene); });
        }
      }
    };
  }

  // Wire zone clear to show star rating
  var _origZC = _GS.prototype.onZoneClear || _GS.prototype.handleZoneClear;
  var _zcKey = _GS.prototype.onZoneClear ? 'onZoneClear' : 'handleZoneClear';
  if (typeof _origZC === 'function' && !_GS.prototype._b26ZCHooked) {
    _GS.prototype._b26ZCHooked = true;
    _GS.prototype[_zcKey] = function() {
      _origZC.call(this);
      var scene = this;
      // Show star rating
      if (window.MMA && MMA.UIMeter && typeof MMA.UIMeter.showFightStarRating === 'function') {
        scene.time.delayedCall(500, function() { MMA.UIMeter.showFightStarRating(scene); });
      }
      // Reset move fatigue
      if (window.MMA && MMA.Combat && typeof MMA.Combat.resetMoveFatigue === 'function') {
        MMA.Combat.resetMoveFatigue();
      }
    };
  }
})();
// === BATCH 27 GAMESCENE WIRING ===
(function() {
  if (typeof Phaser === 'undefined') return;
  var _GS = window.GameScene;
  if (!_GS || _GS.prototype._b27Hooked) return;
  _GS.prototype._b27Hooked = true;

  // create hook — weather room, betting, NG+ badge, home arena bonus
  var _origCreate = _GS.prototype.create;
  if (typeof _origCreate === 'function') {
    _GS.prototype.create = function() {
      _origCreate.call(this);
      var scene = this;

      // Show NG+ badge
      if (window.MMA && MMA.UI && typeof MMA.UI.showNGPlusBadge === 'function') {
        MMA.UI.showNGPlusBadge();
      }

      // Apply home arena bonus if unlocked
      if (window.MMA && MMA.Zones && typeof MMA.Zones.applyHomeArenaBonus === 'function') {
        MMA.Zones.applyHomeArenaBonus(scene);
      }

      // Roll and apply weather hazard for this room
      var zone = scene.currentZone || 1;
      if (window.MMA && MMA.Zones && typeof MMA.Zones.rollWeatherHazard === 'function') {
        var weather = MMA.Zones.rollWeatherHazard(zone);
        if (weather && typeof MMA.Zones.applyRoomWeather === 'function') {
          scene.time.delayedCall(800, function() { MMA.Zones.applyRoomWeather(scene, weather); });
        }
      }

      // Show betting panel before first enemy spawns (1.5s delay)
      scene.time.delayedCall(1500, function() {
        if (window.MMA && MMA.UI && typeof MMA.UI.showBettingPanel === 'function') {
          MMA.UI.showBettingPanel(scene, function(betAmount) {
            if (betAmount > 0 && window.MMA && MMA.Combat && typeof MMA.Combat.placeBet === 'function') {
              MMA.Combat.placeBet(scene, betAmount);
            }
          });
        }
      });

      // Show bracket label if tournament active
      var bracketLabel = (window.MMA && MMA.Player && typeof MMA.Player.getBracketLabel === 'function') ? MMA.Player.getBracketLabel() : null;
      if (bracketLabel && window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
        var cx = (typeof CONFIG !== 'undefined' && CONFIG.CANVAS_W) ? CONFIG.CANVAS_W / 2 : 250;
        scene.time.delayedCall(600, function() {
          MMA.UI.showDamageText(scene, cx, 90, '🏆 ' + bracketLabel, '#FFD700');
        });
      }
    };
  }

  // Zone clear hook — resolve bet, NG+ trigger on zone 4, clear weather
  var _origZC = _GS.prototype.onZoneClear || _GS.prototype.handleZoneClear;
  var _zcKey = _GS.prototype.onZoneClear ? 'onZoneClear' : 'handleZoneClear';
  if (typeof _origZC === 'function' && !_GS.prototype._b27ZCHooked) {
    _GS.prototype._b27ZCHooked = true;
    _GS.prototype[_zcKey] = function() {
      _origZC.call(this);
      var scene = this;
      // Resolve bet on win
      if (window.MMA && MMA.Combat && typeof MMA.Combat.resolveBet === 'function') {
        var hadBet = MMA.Combat._currentBet > 0;
        MMA.Combat.resolveBet(scene, true);
        if (hadBet && window.MMA && MMA.VFX && typeof MMA.VFX.showBetResult === 'function') {
          MMA.VFX.showBetResult(scene, true, MMA.Combat._currentBet);
        }
      }
      // Clear weather
      if (window.MMA && MMA.Zones && typeof MMA.Zones.clearRoomWeather === 'function') {
        MMA.Zones.clearRoomWeather(scene);
      }
      // NG+ trigger on zone 4 clear
      if ((scene.currentZone || 1) >= 4 && window.MMA && MMA.Combat && typeof MMA.Combat.triggerNGPlus === 'function') {
        scene.time.delayedCall(2000, function() { MMA.Combat.triggerNGPlus(scene); });
      }
      // Advance bracket
      if (window.MMA && MMA.Player && typeof MMA.Player.advanceBracket === 'function') {
        MMA.Player.advanceBracket(scene, true);
      }
      // Unlock home arena on zone 4 boss defeat (championship)
      if ((scene.currentZone || 1) >= 4 && window.MMA && MMA.Zones && typeof MMA.Zones.unlockHomeArena === 'function') {
        MMA.Zones.unlockHomeArena(scene);
      }
    };
  }

  // Game over hook — resolve bet as loss, clear weather
  var _origGO = _GS.prototype.triggerGameOver || _GS.prototype.onGameOver;
  var _goKey = _GS.prototype.triggerGameOver ? 'triggerGameOver' : 'onGameOver';
  if (typeof _origGO === 'function' && !_GS.prototype._b27GOHooked) {
    _GS.prototype._b27GOHooked = true;
    _GS.prototype[_goKey] = function() {
      _origGO.call(this);
      var scene = this;
      if (window.MMA && MMA.Combat && typeof MMA.Combat.resolveBet === 'function') {
        var hadBet = MMA.Combat._currentBet > 0;
        var betAmt = MMA.Combat._currentBet;
        MMA.Combat.resolveBet(scene, false);
        if (hadBet && window.MMA && MMA.VFX && typeof MMA.VFX.showBetResult === 'function') {
          MMA.VFX.showBetResult(scene, false, betAmt);
        }
      }
      if (window.MMA && MMA.Zones && typeof MMA.Zones.clearRoomWeather === 'function') {
        MMA.Zones.clearRoomWeather(scene);
      }
      if (window.MMA && MMA.Player && typeof MMA.Player.advanceBracket === 'function') {
        MMA.Player.advanceBracket(scene, false);
      }
    };
  }
})();
// === BATCH 28 GAMESCENE WIRING ===
(function() {
  if (typeof Phaser === 'undefined') return;
  if (!window.MMAGameHooks) return;
  if (window._b28Wired) return;
  window._b28Wired = true;

  // onCreate: show creed badge, show creed selector on first play, start enemy warmups
  MMAGameHooks.onCreate(function(scene) {
    // Creed badge
    if (window.MMA && MMA.VFX && typeof MMA.VFX.showCreedBadge === 'function') {
      scene.time.delayedCall(500, function() { MMA.VFX.showCreedBadge(); });
    }

    // First-time creed selector
    var creedKey = (window.MMA && MMA.Player && typeof MMA.Player.getCreedKey === 'function')
      ? MMA.Player.getCreedKey() : 'balanced';
    if (creedKey === 'balanced' && !localStorage.getItem('mma_creed_seen')) {
      localStorage.setItem('mma_creed_seen', '1');
      scene.time.delayedCall(200, function() {
        if (window.MMA && MMA.Player && typeof MMA.Player.showCreedSelector === 'function') {
          MMA.Player.showCreedSelector(function() {});
        }
      });
    }

    // Start warmup on all spawned enemies
    scene.time.delayedCall(300, function() {
      var enemies = scene.enemyGroup ? scene.enemyGroup.getChildren() : [];
      enemies.forEach(function(e) {
        if (e && e.active && window.MMA && MMA.Enemies && typeof MMA.Enemies.startWarmup === 'function') {
          MMA.Enemies.startWarmup(e);
        }
      });
    });

    // Show ring position hint on enter
    scene.time.delayedCall(1000, function() {
      if (window.MMA && MMA.VFX && typeof MMA.VFX.showRingPositionHint === 'function') {
        MMA.VFX.showRingPositionHint(scene);
      }
    });
  });

  // onUpdate: stamina signatures, ring position hint throttle, mutation tracking, crowd noise
  var _lastRingHintMs = 0;
  var _moveFightCount = {};
  MMAGameHooks.onUpdate(function(scene, delta) {
    var now = Date.now();

    // Stamina signature updates (every 500ms throttle)
    if (!scene._lastStamSigMs || now - scene._lastStamSigMs > 500) {
      scene._lastStamSigMs = now;
      var enemies = scene.enemyGroup ? scene.enemyGroup.getChildren() : [];
      enemies.forEach(function(e) {
        if (e && e.active && window.MMA && MMA.Enemies && typeof MMA.Enemies.updateEnemyStaminaSignature === 'function') {
          MMA.Enemies.updateEnemyStaminaSignature(e, scene, delta);
        }
      });
    }

    // Ring position hint (every 8s)
    if (now - _lastRingHintMs > 8000) {
      _lastRingHintMs = now;
      if (window.MMA && MMA.VFX && typeof MMA.VFX.showRingPositionHint === 'function') {
        MMA.VFX.showRingPositionHint(scene);
      }
    }
  });

  // onKO / zone clear: record faction kill, try technique inheritance, clear mutations
  MMAGameHooks.onZoneClear(function(scene) {
    if (window.MMA && MMA.Combat && typeof MMA.Combat.clearMutations === 'function') {
      MMA.Combat.clearMutations();
    }
  });

  MMAGameHooks.onGameOver(function(scene) {
    if (window.MMA && MMA.Combat && typeof MMA.Combat.clearMutations === 'function') {
      MMA.Combat.clearMutations();
    }
    var badge = document.getElementById('creed-badge');
    if (badge) badge.remove();
  });

  // Wire faction kill recording + technique inheritance into enemy death
  // Patch enemies-core killEnemy if available
  if (window.MMA && MMA.Enemies && typeof MMA.Enemies.killEnemy === 'function' && !MMA.Enemies._b28KillHooked) {
    MMA.Enemies._b28KillHooked = true;
    var _origKill = MMA.Enemies.killEnemy;
    MMA.Enemies.killEnemy = function(enemy, scene) {
      _origKill.call(this, enemy, scene);
      // Record faction kill
      if (typeof MMA.Enemies.recordFactionKill === 'function' && enemy && enemy.type) {
        MMA.Enemies.recordFactionKill(enemy.type.aiPattern || enemy.type.key);
      }
      // Try technique inheritance
      if (typeof MMA.Player !== 'undefined' && typeof MMA.Player.tryInheritTechnique === 'function' && enemy && enemy.type) {
        MMA.Player.tryInheritTechnique(scene, enemy.type);
      }
    };
  }
})();
// === BATCH 29 GAMESCENE WIRING ===
(function() {
  if (typeof Phaser === 'undefined') return;
  if (!window.MMAGameHooks) return;
  if (window._b29Wired) return;
  window._b29Wired = true;

  // onCreate: show arena rules banner, record arena fight, show wear label
  MMAGameHooks.onCreate(function(scene) {
    var zone = scene.currentZone || 1;

    // Arena rules banner
    scene.time.delayedCall(1200, function() {
      if (window.MMA && MMA.Zones && typeof MMA.Zones.showArenaRulesBanner === 'function') {
        MMA.Zones.showArenaRulesBanner(scene, zone);
      }
    });

    // Record fight in arena history
    if (window.MMA && MMA.Zones && typeof MMA.Zones.recordArenaFight === 'function') {
      MMA.Zones.recordArenaFight(zone);
    }

    // Show arena wear label
    scene.time.delayedCall(2000, function() {
      if (window.MMA && MMA.Zones && typeof MMA.Zones.getArenaWearLabel === 'function') {
        var label = MMA.Zones.getArenaWearLabel(zone);
        if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function' && scene.player) {
          MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 70, label, '#ffcc44');
        }
      }
    });

    // Apply arena speed multiplier (beach sand slowdown etc)
    scene.time.delayedCall(400, function() {
      if (!scene.player) return;
      var speedMult = (window.MMA && MMA.Zones && typeof MMA.Zones.getArenaSpeedMult === 'function')
        ? MMA.Zones.getArenaSpeedMult(zone) : 1;
      if (speedMult !== 1 && scene.player.stats) {
        scene.player._arenaSpeedMult = speedMult;
      }
    });
  });

  // onUpdate: sweat accumulation, ring glare, sweat visual
  var _lastSweatTick = 0;
  MMAGameHooks.onUpdate(function(scene, delta) {
    var now = Date.now();

    // Add sweat every 2s during combat
    if (now - _lastSweatTick > 2000) {
      _lastSweatTick = now;
      if (window.MMA && MMA.Sprites && typeof MMA.Sprites.addSweat === 'function') {
        var enemies = scene.enemyGroup ? scene.enemyGroup.getChildren() : [];
        var hasEnemy = enemies.some(function(e) { return e && e.active; });
        if (hasEnemy) MMA.Sprites.addSweat(3);
      }
    }

    // Sweat visual particles (throttled inside the function)
    if (window.MMA && MMA.Sprites && typeof MMA.Sprites.updateSweatVisual === 'function') {
      MMA.Sprites.updateSweatVisual(scene);
    }

    // Ring glare (zone 4 only)
    if ((scene.currentZone || 1) >= 4 && window.MMA && MMA.Sprites && typeof MMA.Sprites.triggerRingGlare === 'function') {
      MMA.Sprites.triggerRingGlare(scene);
    }
  });

  // onZoneClear: award trophy based on longest combo, reset sweat
  MMAGameHooks.onZoneClear(function(scene) {
    // Award trophy based on longest combo this zone
    var longestCombo = (scene._longestCombo || 0);
    if (longestCombo >= 5 && window.MMA && MMA.Items && typeof MMA.Items.earnTrophy === 'function') {
      MMA.Items.earnTrophy(scene, longestCombo);
    }
    // Reset sweat between zones
    if (window.MMA && MMA.Sprites && typeof MMA.Sprites.resetSweat === 'function') {
      MMA.Sprites.resetSweat();
    }
  });

  // onGameOver: reset sweat, remove glare
  MMAGameHooks.onGameOver(function(scene) {
    if (window.MMA && MMA.Sprites && typeof MMA.Sprites.resetSweat === 'function') {
      MMA.Sprites.resetSweat();
    }
    var glare = document.getElementById('ring-glare');
    if (glare) glare.remove();
    var rules = document.getElementById('arena-rules-banner');
    if (rules) rules.remove();
  });
})();
// === BATCH 30 GAMESCENE WIRING (FINAL) ===
(function() {
  if (typeof Phaser === 'undefined') return;
  if (!window.MMAGameHooks) return;
  if (window._b30Wired) return;
  window._b30Wired = true;

  // onCreate: play entrance composition, apply mutations to spawned enemies
  MMAGameHooks.onCreate(function(scene) {
    var creedKey = (window.MMA && MMA.Player && typeof MMA.Player.getCreedKey === 'function')
      ? MMA.Player.getCreedKey() : 'balanced';

    // Play entrance music composition
    scene.time.delayedCall(600, function() {
      if (window.MMA && MMA.Audio && typeof MMA.Audio.playEntranceComposition === 'function') {
        MMA.Audio.playEntranceComposition(scene, creedKey);
      }
    });

    // Apply mutations to spawned enemies after a short delay
    scene.time.delayedCall(500, function() {
      var enemies = scene.enemyGroup ? scene.enemyGroup.getChildren() : [];
      enemies.forEach(function(e) {
        if (e && e.active && window.MMA && MMA.Enemies && typeof MMA.Enemies.applyMutationToEnemy === 'function') {
          MMA.Enemies.applyMutationToEnemy(e, scene);
        }
      });
    });
  });

  // onUpdate: track move usage for faction counter-intelligence
  // Hook into combat move execution via move history recorder
  // We patch the MMA_ACTION handler to record move usage
  if (!window._b30MoveTrackingHooked && window.MMA && MMA.Combat) {
    window._b30MoveTrackingHooked = true;
    // Intercept executeAttack to record move history
    if (typeof MMA.Combat.executeAttack === 'function') {
      var _origExec = MMA.Combat.executeAttack;
      MMA.Combat.executeAttack = function(scene, moveKey) {
        if (moveKey && window.MMA && MMA.Enemies && typeof MMA.Enemies.recordPlayerMoveHistory === 'function') {
          MMA.Enemies.recordPlayerMoveHistory(moveKey);
        }
        return _origExec.call(this, scene, moveKey);
      };
    }
  }

  // onKO: record mutation candidate for killed enemy
  // Patch killEnemy if not already patched by b28
  if (window.MMA && MMA.Enemies && typeof MMA.Enemies.killEnemy === 'function' && !MMA.Enemies._b30KillHooked) {
    MMA.Enemies._b30KillHooked = true;
    var _origKill = MMA.Enemies.killEnemy;
    MMA.Enemies.killEnemy = function(enemy, scene) {
      _origKill.call(this, enemy, scene);
      // Record mutation candidate
      if (enemy && enemy.type && typeof MMA.Enemies.recordMutationCandidate === 'function') {
        MMA.Enemies.recordMutationCandidate(enemy.type.aiPattern || enemy.type.key);
      }
    };
  }

  // onZoneClear: compose entrance theme based on creed
  MMAGameHooks.onZoneClear(function(scene) {
    var creedKey = (window.MMA && MMA.Player && typeof MMA.Player.getCreedKey === 'function')
      ? MMA.Player.getCreedKey() : 'balanced';
    if (window.MMA && MMA.Audio && typeof MMA.Audio.composeEntranceTheme === 'function') {
      MMA.Audio.composeEntranceTheme(creedKey);
    }
  });
})();

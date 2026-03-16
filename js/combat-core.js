window.MMA = window.MMA || {};
window.MMA.Combat = window.MMA.Combat || {};
Object.assign(window.MMA.Combat, {
  CRIT_CHANCE: 0.15,
  COMBO_WINDOW_MS: 1400,
  COMBO_CHAIN: [
    "jab",
    "cross",
    "hook"
  ],
  COMBO_FINISHER_MULTIPLIER: 1.8,
  PRESSURE_PER_HIT: 25,
  PRESSURE_THRESHOLD: 100,
  PRESSURE_BREAK_MULTIPLIER: 2.5,
  MOMENTUM_MAX_STACKS: 5,
  MOMENTUM_DAMAGE_PER_STACK: 0.05,
  MOMENTUM_CRIT_PER_STACK: 0.02,
  MOMENTUM_SURGE_DAMAGE_MULTIPLIER: 1.5,
  STUN_CHAIN_HITS: 5,
  STUN_DURATION_MS: 1000,
  TAUNT_DEBUFF_MULTIPLIER: 1.15,
  TAUNT_DEBUFF_DURATION_MS: 3000,
  TAUNT_FOCUS_GAIN: 20,
  FOCUS_MAX: 100,
  INTUITION_BUILD_MS: 45000,
  INTUITION_DAMAGE_MULTIPLIER: 1.5,
  RAGE_MODE_TRIGGER_HP_PCT: 0.25,
  RAGE_MODE_DAMAGE_TAKEN_MULTIPLIER: 1.2,
  RAGE_MODE_ATTACK_SPEED_MULTIPLIER: 1.3,
  RAGE_MODE_DURATION_MS: 6000,
  SECOND_WIND_EARLY_WINDOW_MS: 10000,
  SECOND_WIND_CRITICAL_HP_PCT: 0.15,
  SECOND_WIND_EARLY_DURATION_BONUS: 0.5,
  SECOND_WIND_EARLY_HEAL: 25,
  FINISH_HIM_TRIGGER_HP_PCT: 0.1,
  FINISH_HIM_DAMAGE_MULTIPLIER: 2,
  FINISH_HIM_SCORE_BONUS: 250,
  MENTAL_PRESSURE_PER_HIT: 14,
  MENTAL_PRESSURE_TAUNT_BONUS: 24,
  MENTAL_PRESSURE_FINISH_BONUS: 35,
  MENTAL_PRESSURE_THRESHOLD: 100,
  MENTAL_PANIC_DURATION_MS: 2000,
  MENTAL_PANIC_DEFENSE_MULTIPLIER: 1.25,
  MENTAL_PANIC_MISS_CHANCE: 0.3,
  DEADLY_WINDOW_QUICK_MS: 200,
  DEADLY_WINDOW_SLOW_MS: 500,
  DEADLY_WINDOW_MULTIPLIER: 1.5,
  ADRENALINE_DURATION_MS: 5000,
  ADRENALINE_DAMAGE_MULTIPLIER: 1.3,
  ADRENALINE_DEFENSE_IGNORE: 0.5,
  BREAKING_POINT_HITS_REQUIRED: 6,
  BREAKING_POINT_TIMEOUT_MS: 2200,
  BREAKING_POINT_DURATION_MS: 3000,
  BREAKING_POINT_DAMAGE_MULTIPLIER: 1.25,
  BREAKING_POINT_STUN_BONUS_MS: 400,
  CHAIN_COUNTER_WINDOW_MS: 3000,
  CHAIN_COUNTER_MAX_STACKS: 5,
  CHAIN_COUNTER_DAMAGE_PER_STACK: 0.25,
  COUNTER_ATTACK_WINDOW_MS: 700,
  COUNTER_FLOW_MAX_STACKS: 3,
  COUNTER_FLOW_WINDOW_PENALTY_MS: 20,
  COUNTER_FLOW_COUNTER_BONUS_PER_STACK: 0.15,
  COUNTER_FLOW_AUTO_DURATION_MS: 3000,
  GUARD_CRUSH_BLOCKS_REQUIRED: 5,
  GUARD_CRUSH_WINDOW_MS: 2000,
  GUARD_CRUSH_RELEASE_MS: 1000,
  GUARD_CRUSH_CHIP_PER_SECOND: 4,
  BREAKTHROUGH_BLOCKS_REQUIRED: 5,
  BREAKTHROUGH_WINDOW_MS: 3000,
  BREAKTHROUGH_DURATION_MS: 3000,
  BREAKTHROUGH_DAMAGE_MULTIPLIER: 1.25,
  BREAKTHROUGH_MOVE_SPEED_MULTIPLIER: 1.1,
  BREAKTHROUGH_FOCUS_BONUS: 10,
  WHIFF_SHIFT_MISSES_REQUIRED: 2,
  WHIFF_SHIFT_DAMAGE_MULTIPLIER: 1.25,
  MOMENTUM_SHIFT_HITS_REQUIRED: 3,
  MOMENTUM_SHIFT_DURATION_MS: 5000,
  MOMENTUM_SHIFT_DAMAGE_MULTIPLIER: 1.2,
  RECOVERY_TECH_WINDOW_MS: 300,
  RECOVERY_TECH_DAMAGE_MULTIPLIER: 2,
  WEIGHT_ADVANTAGE_BONUS: 0.2,
  WEIGHT_ADVANTAGE_PENALTY: 0.15,
  COMBO_BREAKER_MIN_HITS: 10,
  COMBO_BREAKER_BASE_CHANCE: 0.15,
  COMBO_BREAKER_TIER_BONUS: 0.05,
  COMBO_BREAKER_PLAYER_STUN_MS: 300,
  STYLE_MASTERY_COUNTER_GAIN: 50,
  STYLE_MASTERY_THRESHOLD: 100,
  STYLE_MASTERY_DAMAGE_MULTIPLIER: 1.4,
  STYLE_MASTERY_DEFENSE_IGNORE: 0.25,
  TRANSITION_CANCEL_WINDOW_MS: 220,
  SHADOW_CLONE_MIRROR_MULTIPLIER: 0.5,
  SHADOW_CLONE_MIN_DAMAGE: 6,
  INJURY_MAX_STACKS: 4,
  INJURY_ARM_DAMAGE_BONUS_PER_STACK: 0.03,
  INJURY_LEG_DAMAGE_BONUS_PER_STACK: 0.04,
  INJURY_BODY_DAMAGE_BONUS_PER_STACK: 0.06,
  INJURY_TEXT_COLORS: {
    "arm": "#ffb703",
    "leg": "#8ecae6",
    "body": "#fb8500"
  },
  MOVE_ROSTER: {
    "jab": {
      "name": "Jab",
      "type": "strike",
      "damage": 8,
      "staminaCost": 5,
      "cooldown": 400,
      "unlockLevel": 1,
      "unlockType": "start"
    },
    "cross": {
      "name": "Cross",
      "type": "strike",
      "damage": 12,
      "staminaCost": 8,
      "cooldown": 600,
      "unlockLevel": 2,
      "unlockType": "level"
    },
    "hook": {
      "name": "Hook",
      "type": "strike",
      "damage": 15,
      "staminaCost": 10,
      "cooldown": 800,
      "unlockLevel": 2,
      "unlockType": "level"
    },
    "lowKick": {
      "name": "Low Kick",
      "type": "strike",
      "damage": 10,
      "staminaCost": 7,
      "cooldown": 600,
      "unlockLevel": 2,
      "unlockType": "level"
    },
    "uppercut": {
      "name": "Uppercut",
      "type": "strike",
      "damage": 18,
      "staminaCost": 12,
      "cooldown": 900,
      "unlockLevel": 3,
      "unlockType": "level"
    },
    "takedown": {
      "name": "Takedown",
      "type": "grapple",
      "damage": 5,
      "staminaCost": 20,
      "cooldown": 1200,
      "unlockLevel": 1,
      "unlockType": "start"
    },
    "bodyShot": {
      "name": "Body Shot",
      "type": "strike",
      "damage": 20,
      "staminaCost": 14,
      "cooldown": 850,
      "unlockLevel": 4,
      "unlockType": "level"
    },
    "guardPass": {
      "name": "Guard Pass",
      "type": "grapple",
      "damage": 10,
      "staminaCost": 12,
      "cooldown": 1000,
      "unlockLevel": 4,
      "unlockType": "level"
    },
    "headKick": {
      "name": "Head Kick",
      "type": "strike",
      "damage": 25,
      "staminaCost": 18,
      "cooldown": 1000,
      "unlockLevel": 5,
      "unlockType": "level"
    },
    "guillotine": {
      "name": "Guillotine",
      "type": "sub",
      "damage": 25,
      "staminaCost": 18,
      "cooldown": 1500,
      "unlockLevel": 5,
      "unlockType": "level"
    },
    "mountCtrl": {
      "name": "Mount Control",
      "type": "grapple",
      "damage": 0,
      "staminaCost": 8,
      "cooldown": 800,
      "unlockLevel": 5,
      "unlockType": "level"
    },
    "rnc": {
      "name": "Choke",
      "type": "sub",
      "damage": 35,
      "staminaCost": 25,
      "cooldown": 2000,
      "unlockLevel": 6,
      "unlockType": "level"
    },
    "kimura": {
      "name": "Kimura",
      "type": "sub",
      "damage": 27,
      "staminaCost": 20,
      "cooldown": 1800,
      "unlockLevel": 6,
      "unlockType": "level"
    },
    "spinningBackFist": {
      "name": "Spinning Back Fist",
      "type": "strike",
      "damage": 30,
      "staminaCost": 20,
      "cooldown": 1200,
      "unlockLevel": 7,
      "unlockType": "level"
    },
    "americana": {
      "name": "Americana",
      "type": "sub",
      "damage": 28,
      "staminaCost": 20,
      "cooldown": 1700,
      "unlockLevel": 5,
      "unlockType": "style"
    },
    "heelHook": {
      "name": "Heel Hook",
      "type": "sub",
      "damage": 32,
      "staminaCost": 24,
      "cooldown": 1900,
      "unlockLevel": 6,
      "unlockType": "style"
    },
    "kneebar": {
      "name": "Kneebar",
      "type": "sub",
      "damage": 30,
      "staminaCost": 22,
      "cooldown": 1800,
      "unlockLevel": 7,
      "unlockType": "style"
    },
    "elbowStrike": {
      "name": "Elbow Strike",
      "type": "strike",
      "damage": 22,
      "staminaCost": 15,
      "cooldown": 900,
      "unlockLevel": 99,
      "unlockType": "enemy",
      "fromEnemy": "muayThaiFighter"
    },
    "kneeStrike": {
      "name": "Knee Strike",
      "type": "strike",
      "damage": 20,
      "staminaCost": 14,
      "cooldown": 850,
      "unlockLevel": 99,
      "unlockType": "enemy",
      "fromEnemy": "muayThaiFighter"
    },
    "singleLeg": {
      "name": "Single Leg",
      "type": "grapple",
      "damage": 5,
      "staminaCost": 15,
      "cooldown": 1100,
      "unlockLevel": 99,
      "unlockType": "enemy",
      "fromEnemy": "wrestler"
    },
    "hipThrow": {
      "name": "Hip Throw",
      "type": "grapple",
      "damage": 18,
      "staminaCost": 18,
      "cooldown": 1000,
      "unlockLevel": 99,
      "unlockType": "enemy",
      "fromEnemy": "judoka"
    },
    "armbar": {
      "name": "Armbar",
      "type": "sub",
      "damage": 30,
      "staminaCost": 22,
      "cooldown": 1800,
      "unlockLevel": 99,
      "unlockType": "enemy",
      "fromEnemy": "bjjBlackBelt"
    },
    "triangleChoke": {
      "name": "Triangle Choke",
      "type": "sub",
      "damage": 28,
      "staminaCost": 20,
      "cooldown": 1700,
      "unlockLevel": 99,
      "unlockType": "enemy",
      "fromEnemy": "bjjBlackBelt"
    }
  },
  handleInput: function(scene, delta) {
      if (window.MMA && MMA.Network && typeof MMA.Network.isClient === 'function' && MMA.Network.isClient()) {
        // Client is non-authoritative for combat damage/KO/XP; host applies combat outcomes.
        // TODO: send explicit combat intent to host when input-intent channel is available.
        if (window.MMA_ACTION) {
          ['jab','heavy','grapple','special','cross','hook','lowKick','uppercut','headKick','bodyShot','takedown','guillotine','dodge'].forEach(function(k){ window.MMA_ACTION[k] = false; });
        }
        var clientCdMap = scene.player.cooldowns; Object.keys(clientCdMap).forEach(function(k){ if (clientCdMap[k] > 0) clientCdMap[k] = Math.max(0, clientCdMap[k] - delta); });
        return;
      }
  
      this.refreshChainCounterState(scene);
      this.refreshMomentumShiftState(scene);
      this.refreshCounterFlowState(scene);
      this.refreshBreakthroughState(scene);
      this.applyGuardCrushChip(scene, delta);
      this.tryTransitionFrameCancel(scene);
      if (scene.player.stunnedUntil && scene.time.now < scene.player.stunnedUntil) {
        var attemptedRecoveryTech =
          Phaser.Input.Keyboard.JustDown(scene.jabKey) ||
          Phaser.Input.Keyboard.JustDown(scene.crossKey) ||
          Phaser.Input.Keyboard.JustDown(scene.hookKey) ||
          Phaser.Input.Keyboard.JustDown(scene.uppercutKey) ||
          Phaser.Input.Keyboard.JustDown(scene.specialKey) ||
          Phaser.Input.Keyboard.JustDown(scene.takedownKey) ||
          window.MMA_ACTION && (window.MMA_ACTION.jab || window.MMA_ACTION.heavy || window.MMA_ACTION.grapple || window.MMA_ACTION.special);
  
        if (attemptedRecoveryTech && this.tryStaggerRecoveryTech(scene)) {
          if (window.MMA_ACTION) {
            ['jab','heavy','grapple','special','cross','hook','lowKick','uppercut','headKick','bodyShot','takedown','guillotine','dodge'].forEach(function(k){ window.MMA_ACTION[k] = false; });
          }
        } else {
          var cdMapStun = scene.player.cooldowns; Object.keys(cdMapStun).forEach(function(k){ if (cdMapStun[k] > 0) cdMapStun[k] = Math.max(0, cdMapStun[k] - delta); });
          return;
        }
      }
      
      // Handle ground game submission selection
      if (scene.groundState && scene.groundState.active && scene.groundState.waitingForSubmission) {
        var unlockedSubs = scene.player.unlockedSubmissions || ['rnc'];
        
        // Number keys 1-4 to select submission
        if (Phaser.Input.Keyboard.JustDown(scene.sub1Key)) {
          scene.groundState.selectedSubmission = unlockedSubs[0] || 'rnc';
          scene.groundState.waitingForSubmission = false;
          return;
        }
        if (Phaser.Input.Keyboard.JustDown(scene.sub2Key) && unlockedSubs.length > 1) {
          scene.groundState.selectedSubmission = unlockedSubs[1];
          scene.groundState.waitingForSubmission = false;
          return;
        }
        if (Phaser.Input.Keyboard.JustDown(scene.sub3Key) && unlockedSubs.length > 2) {
          scene.groundState.selectedSubmission = unlockedSubs[2];
          scene.groundState.waitingForSubmission = false;
          return;
        }
        if (Phaser.Input.Keyboard.JustDown(scene.sub4Key) && unlockedSubs.length > 3) {
          scene.groundState.selectedSubmission = unlockedSubs[3];
          scene.groundState.waitingForSubmission = false;
          return;
        }
        
        // L key attempts the first submission (RNC by default)
        if (Phaser.Input.Keyboard.JustDown(scene.takedownKey)) {
          scene.groundState.selectedSubmission = unlockedSubs[0] || 'rnc';
          scene.groundState.waitingForSubmission = false;
          return;
        }
        return;
      }
      
      if (Phaser.Input.Keyboard.JustDown(scene.jabKey)) this.executeAttack(scene, 'jab');
      if (Phaser.Input.Keyboard.JustDown(scene.crossKey)) this.executeAttack(scene, 'cross');
      if (Phaser.Input.Keyboard.JustDown(scene.takedownKey)) this.executeAttack(scene, 'takedown');
      if (Phaser.Input.Keyboard.JustDown(scene.hookKey)) this.executeAttack(scene, 'hook');
      if (Phaser.Input.Keyboard.JustDown(scene.lowKickKey)) this.executeAttack(scene, 'lowKick');
      if (Phaser.Input.Keyboard.JustDown(scene.uppercutKey)) this.executeAttack(scene, 'uppercut');
      if (Phaser.Input.Keyboard.JustDown(scene.bodyShotKey)) this.executeAttack(scene, 'bodyShot');
      if (Phaser.Input.Keyboard.JustDown(scene.headKickKey)) this.executeAttack(scene, 'headKick');
      if (Phaser.Input.Keyboard.JustDown(scene.guillotineKey)) this.executeAttack(scene, 'guillotine');
      if (Phaser.Input.Keyboard.JustDown(scene.specialKey)) this.executeSpecialMove(scene);
      if (window.MMA_ACTION) {
        var inGround = scene.groundState && scene.groundState.active;

        if (inGround) {
          // ── Ground state: remap all button presses to ground moves ──────────
          // Buttons relabelled by setActionButtonLabels(true): jab→G&P, cross→Elbow,
          // takedown→Choke, special→Improve. Other slots do G&P (strikes) or submission (grapple).
          var self2 = this;
          var strikeKeys   = ['jab','heavy','cross','hook','lowKick','uppercut','headKick','bodyShot'];
          var subKeys      = ['grapple','takedown','guillotine'];
          var improveKeys  = ['special'];
          var elbowKeys    = []; // cross already in strikeKeys; dedicated elbow remapping below

          var anyFired = false;
          strikeKeys.forEach(function(k){
            if (window.MMA_ACTION[k] && !anyFired) {
              window.MMA_ACTION[k] = false;
              anyFired = true;
              self2.executeGroundMove(scene, k === 'cross' ? 'elbow' : 'gnp');
            }
          });
          subKeys.forEach(function(k){
            if (window.MMA_ACTION[k] && !anyFired) {
              window.MMA_ACTION[k] = false;
              anyFired = true;
              self2.executeGroundMove(scene, 'submission');
            }
          });
          improveKeys.forEach(function(k){
            if (window.MMA_ACTION[k] && !anyFired) {
              window.MMA_ACTION[k] = false;
              anyFired = true;
              self2.executeGroundMove(scene, 'improve');
            }
          });

        } else {
          // ── Standing state: normal attack routing ────────────────────────────
          // Legacy 4-button names (kept for backward compat)
          if (window.MMA_ACTION.jab)     { window.MMA_ACTION.jab = false;     this.executeAttack(scene, 'jab'); }
          if (window.MMA_ACTION.heavy)   { window.MMA_ACTION.heavy = false;   this.executeAttack(scene, 'cross'); }
          if (window.MMA_ACTION.grapple) { window.MMA_ACTION.grapple = false; this.executeAttack(scene, 'takedown'); }
          if (window.MMA_ACTION.special) { window.MMA_ACTION.special = false; this.executeSpecialMove(scene); }
          // Extended 8-button names (new remappable slots)
          if (window.MMA_ACTION.cross)       { window.MMA_ACTION.cross = false;       this.executeAttack(scene, 'cross'); }
          if (window.MMA_ACTION.hook)        { window.MMA_ACTION.hook = false;        this.executeAttack(scene, 'hook'); }
          if (window.MMA_ACTION.lowKick)     { window.MMA_ACTION.lowKick = false;     this.executeAttack(scene, 'lowKick'); }
          if (window.MMA_ACTION.uppercut)    { window.MMA_ACTION.uppercut = false;    this.executeAttack(scene, 'uppercut'); }
          if (window.MMA_ACTION.headKick)    { window.MMA_ACTION.headKick = false;    this.executeAttack(scene, 'headKick'); }
          if (window.MMA_ACTION.bodyShot)    { window.MMA_ACTION.bodyShot = false;    this.executeAttack(scene, 'bodyShot'); }
          if (window.MMA_ACTION.takedown)    { window.MMA_ACTION.takedown = false;    this.executeAttack(scene, 'takedown'); }
          if (window.MMA_ACTION.guillotine)  { window.MMA_ACTION.guillotine = false;  this.executeGroundMove(scene, 'submission'); }
        }

        // Dodge: 300ms i-frames + dash in movement direction
        if (window.MMA_ACTION.dodge) {
          window.MMA_ACTION.dodge = false;
          if (scene.player.dodging === undefined) scene.player.dodging = false;
          if (!scene.player.dodging && !(scene.player.stunnedUntil && scene.time.now < scene.player.stunnedUntil)) {
            scene.player.dodging = true;
            scene.player.dodgeUntil = scene.time.now + 300;
            var dodgeSpeed = 280;
            var ddx = scene.lastDir ? scene.lastDir.x : -1;
            var ddy = scene.lastDir ? scene.lastDir.y : 0;
            if (ddx === 0 && ddy === 0) ddx = -1;
            if (scene.player.body) scene.player.body.setVelocity(ddx * dodgeSpeed * 3, ddy * dodgeSpeed * 3);
            scene.time.delayedCall(300, function() { scene.player.dodging = false; });
            MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 30, 'DODGE!', '#88ffff');
          }
        }

        // Stand up button works regardless of which block ran
        if (window.MMA_ACTION.standup) {
          window.MMA_ACTION.standup = false;
          if (scene.groundState && scene.groundState.active) {
            this.executeGroundMove(scene, 'standup');
            MMA.UI.recordMoveInput('standup', scene);
          }
        }
      }
      var cdMap = scene.player.cooldowns; Object.keys(cdMap).forEach(function(k){ if (cdMap[k] > 0) cdMap[k] = Math.max(0, cdMap[k] - delta); });
    },
  rollDamage: function(baseDamage, critChance, forceCrit) {
      var finalCritChance = typeof critChance === 'number' ? critChance : this.CRIT_CHANCE;
      var crit = !!forceCrit || Math.random() < finalCritChance;
      var damage = crit ? Math.round(baseDamage * 2) : baseDamage;
      return { damage: damage, crit: crit };
    },
  ensureComboState: function(scene) {
      scene.player.comboState = scene.player.comboState || { index: 0, lastHitAt: 0 };
      return scene.player.comboState;
    },
  applyComboBonus: function(scene, moveKey, damage, didHit) {
      var state = this.ensureComboState(scene);
      var now = scene.time.now;
      if (!didHit || now - state.lastHitAt > this.COMBO_WINDOW_MS) state.index = 0;
  
      var expectedMove = this.COMBO_CHAIN[state.index];
      if (didHit && moveKey === expectedMove) {
        state.index += 1;
        state.lastHitAt = now;
        if (state.index >= this.COMBO_CHAIN.length) {
          state.index = 0;
          var boosted = Math.round(damage * this.COMBO_FINISHER_MULTIPLIER);
          return {
            damage: boosted,
            comboFinished: true,
            comboLabel: 'JAB-CROSS-HOOK!'
          };
        }
        return { damage: damage, comboFinished: false };
      }
  
      if (didHit && moveKey === this.COMBO_CHAIN[0]) {
        state.index = 1;
        state.lastHitAt = now;
        return { damage: damage, comboFinished: false };
      }
  
      if (didHit) {
        state.index = 0;
        state.lastHitAt = now;
      }
      return { damage: damage, comboFinished: false };
    },
  ensurePressureState: function(scene) {
      scene.player.pressureState = scene.player.pressureState || { meter: 0, primed: false };
      return scene.player.pressureState;
    },
  ensureMomentumState: function(scene) {
      scene.player.momentumState = scene.player.momentumState || { stacks: 0, surgeReady: false };
      return scene.player.momentumState;
    },
  ensureMentalPressureState: function(scene) {
      scene.player.mentalPressureState = scene.player.mentalPressureState || { meter: 0 };
      return scene.player.mentalPressureState;
    },
  gainMentalPressure: function(scene, enemy, amount, sourceLabel) {
      var state = this.ensureMentalPressureState(scene);
      if (enemy && enemy.active && enemy.state !== 'dead') {
        this.onIntuitionEngage(scene, enemy);
      }
      var prev = state.meter;
      state.meter = Math.min(this.MENTAL_PRESSURE_THRESHOLD, state.meter + Math.max(0, amount || 0));
      var gained = state.meter - prev;
      if (gained > 0 && sourceLabel) {
        MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 108, 'MENTAL +' + gained + ' (' + sourceLabel + ')', '#f9a8ff');
      }
      if (state.meter >= this.MENTAL_PRESSURE_THRESHOLD) {
        this.triggerMentalPanic(scene, enemy);
      }
      return state;
    },
  triggerMentalPanic: function(scene, enemy) {
      var state = this.ensureMentalPressureState(scene);
      if (!enemy || !enemy.active || enemy.state === 'dead') return false;
      state.meter = 0;
      enemy.combatState = enemy.combatState || {};
      enemy.combatState.mentalPanicUntil = scene.time.now + this.MENTAL_PANIC_DURATION_MS;
      enemy.combatState.mentalPanicMissChance = this.MENTAL_PANIC_MISS_CHANCE;
      enemy.staggerTimer = Math.max(enemy.staggerTimer || 0, this.MENTAL_PANIC_DURATION_MS);
      enemy.state = 'staggered';
      MMA.UI.showDamageText(scene, enemy.x, enemy.y - 122, 'MENTAL BREAK!', '#ff66cc');
      return true;
    },
  applyMentalPanicIfActive: function(scene, enemy, damage) {
      if (!enemy || !enemy.combatState || scene.time.now >= (enemy.combatState.mentalPanicUntil || 0)) {
        return { damage: damage, panicActive: false };
      }
      return {
        damage: Math.round(damage * this.MENTAL_PANIC_DEFENSE_MULTIPLIER),
        panicActive: true
      };
    },
  getDeadlyWindowDurationForEnemy: function(enemy) {
      if (!enemy || !enemy.aiState) return 0;
      if (enemy.aiState === 'recovery') return this.DEADLY_WINDOW_SLOW_MS;
      if (enemy.aiState === 'retreat') return this.DEADLY_WINDOW_QUICK_MS;
      return 0;
    },
  isEnemyInDeadlyWindow: function(scene, enemy) {
      if (!enemy || !enemy.active || enemy.state === 'dead' || !enemy.aiState) return false;
      var duration = this.getDeadlyWindowDurationForEnemy(enemy);
      if (!duration) return false;
  
      enemy.combatState = enemy.combatState || {};
      var marker = enemy.combatState.deadlyWindowMarker;
      if (!marker || marker.aiState !== enemy.aiState) {
        marker = {
          aiState: enemy.aiState,
          openedAt: scene.time.now,
          announcedAt: 0
        };
        enemy.combatState.deadlyWindowMarker = marker;
      }
  
      return scene.time.now - marker.openedAt <= duration;
    },
  applyDeadlyWindowIfActive: function(scene, enemy, damage) {
      if (!this.isEnemyInDeadlyWindow(scene, enemy)) {
        return { damage: damage, deadlyWindow: false };
      }
  
      enemy.combatState = enemy.combatState || {};
      var marker = enemy.combatState.deadlyWindowMarker || { announcedAt: 0 };
      if (!marker.announcedAt || scene.time.now - marker.announcedAt > 350) {
        marker.announcedAt = scene.time.now;
        enemy.combatState.deadlyWindowMarker = marker;
        if (enemy.setTint) enemy.setTint(0xff5555);
        scene.time.delayedCall(90, function() {
          if (enemy && enemy.active && enemy.clearTint) enemy.clearTint();
        });
      }
  
      return {
        damage: Math.round(damage * this.DEADLY_WINDOW_MULTIPLIER),
        deadlyWindow: true
      };
    },
  ensureChainCounterState: function(scene) {
      scene.player.chainCounterState = scene.player.chainCounterState || {
        stacks: 0,
        lastCounterAt: 0,
        lastKnownHp: (scene.player && scene.player.stats && typeof scene.player.stats.hp === 'number') ? scene.player.stats.hp : 0
      };
      return scene.player.chainCounterState;
    },
  refreshChainCounterState: function(scene) {
      var state = this.ensureChainCounterState(scene);
      var now = scene.time.now;
      if (state.lastCounterAt && now - state.lastCounterAt > this.CHAIN_COUNTER_WINDOW_MS) {
        state.stacks = 0;
        state.lastCounterAt = 0;
      }
      var hp = (scene.player && scene.player.stats && typeof scene.player.stats.hp === 'number') ? scene.player.stats.hp : state.lastKnownHp;
      if (typeof hp === 'number' && hp < state.lastKnownHp) {
        state.stacks = 0;
        state.lastCounterAt = 0;
      }
      state.lastKnownHp = hp;
      return state;
    },
  applyChainCounterIfActive: function(scene, damage, didCounterHit) {
      var state = this.refreshChainCounterState(scene);
      if (!didCounterHit) return { damage: damage, active: false, stacks: state.stacks, multiplier: 1 };
  
      var now = scene.time.now;
      if (state.lastCounterAt && now - state.lastCounterAt <= this.CHAIN_COUNTER_WINDOW_MS) {
        state.stacks = Math.min(this.CHAIN_COUNTER_MAX_STACKS, state.stacks + 1);
      } else {
        state.stacks = 1;
      }
      state.lastCounterAt = now;
  
      var bonusStacks = Math.max(0, state.stacks - 1);
      var mult = 1 + (bonusStacks * this.CHAIN_COUNTER_DAMAGE_PER_STACK);
      return {
        damage: Math.round(damage * mult),
        active: state.stacks > 1,
        stacks: state.stacks,
        multiplier: mult
      };
    },
  ensureMomentumShiftState: function(scene) {
      scene.player.momentumShiftState = scene.player.momentumShiftState || {
        consecutiveHitsTaken: 0,
        activeUntil: 0,
        lastKnownHp: (scene.player && scene.player.stats && typeof scene.player.stats.hp === 'number') ? scene.player.stats.hp : 0
      };
      return scene.player.momentumShiftState;
    },
  refreshMomentumShiftState: function(scene) {
      var state = this.ensureMomentumShiftState(scene);
      var hp = (scene.player && scene.player.stats && typeof scene.player.stats.hp === 'number') ? scene.player.stats.hp : state.lastKnownHp;
      if (typeof hp === 'number' && hp < state.lastKnownHp) {
        state.consecutiveHitsTaken += 1;
        this.resetComboBreakerState(scene);
      }
      state.lastKnownHp = hp;
      return state;
    },
  resetMomentumShiftHits: function(scene) {
      var state = this.ensureMomentumShiftState(scene);
      state.consecutiveHitsTaken = 0;
      return state;
    },
  ensureComboBreakerState: function(scene) {
      scene.player.comboBreakerState = scene.player.comboBreakerState || { comboHits: 0 };
      return scene.player.comboBreakerState;
    },
  onComboBreakerHit: function(scene) {
      var state = this.ensureComboBreakerState(scene);
      state.comboHits += 1;
      return state;
    },
  resetComboBreakerState: function(scene) {
      var state = this.ensureComboBreakerState(scene);
      state.comboHits = 0;
      return state;
    },
  getEnemyComboBreakerTier: function(enemy) {
      if (!enemy || !enemy.type) return 0;
      var tier = enemy.type.tier;
      if (typeof tier !== 'number') tier = enemy.type.rank;
      if (typeof tier !== 'number') tier = enemy.type.difficulty;
      if (typeof tier !== 'number') tier = 0;
      return Math.max(0, Math.floor(tier));
    },
  maybeTriggerComboBreaker: function(scene, enemy) {
      var state = this.ensureComboBreakerState(scene);
      if (!enemy || !enemy.active || enemy.state === 'dead') return false;
      if (state.comboHits < this.COMBO_BREAKER_MIN_HITS) return false;
  
      var tier = this.getEnemyComboBreakerTier(enemy);
      var chance = Phaser.Math.Clamp(this.COMBO_BREAKER_BASE_CHANCE + (tier * this.COMBO_BREAKER_TIER_BONUS), 0, 0.75);
      if (Math.random() >= chance) return false;
  
      scene.player.stunnedUntil = Math.max(scene.player.stunnedUntil || 0, scene.time.now + this.COMBO_BREAKER_PLAYER_STUN_MS);
      this.resetComboBreakerState(scene);
      this.onMomentumMiss(scene);
      this.onPressureMiss(scene);
      this.onStunChainMiss(scene);
      this.onWhiffShiftMiss(scene);
      this.resetBreakingPointChain(scene);
      MMA.UI.resetCombo();
      if (enemy.setTint) enemy.setTint(0xffee58);
      scene.time.delayedCall(120, function() {
        if (enemy && enemy.active && enemy.clearTint) enemy.clearTint();
      });
      MMA.UI.showDamageText(scene, enemy.x, enemy.y - 114, 'COMBO BREAKER!', '#ffee58');
      MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 92, 'COMBO BROKEN', '#ff9e9e');
      return true;
    },
  maybeTriggerMomentumShift: function(scene, didCounterHit) {
      var state = this.ensureMomentumShiftState(scene);
      if (!didCounterHit || state.consecutiveHitsTaken < this.MOMENTUM_SHIFT_HITS_REQUIRED) return false;
      state.consecutiveHitsTaken = 0;
      state.activeUntil = scene.time.now + this.MOMENTUM_SHIFT_DURATION_MS;
      MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 120, 'MOMENTUM SHIFT!', '#66f2ff');
      return true;
    },
  applyMomentumShiftIfActive: function(scene, damage) {
      var state = this.ensureMomentumShiftState(scene);
      if (scene.time.now >= (state.activeUntil || 0)) return { damage: damage, active: false };
      return {
        damage: Math.round(damage * this.MOMENTUM_SHIFT_DAMAGE_MULTIPLIER),
        active: true
      };
    },
  ensureAdrenalineState: function(scene) {
      scene.player.adrenalineState = scene.player.adrenalineState || { readyUntil: 0, primed: false };
      return scene.player.adrenalineState;
    },
  triggerAdrenaline: function(scene) {
      var state = this.ensureAdrenalineState(scene);
      state.primed = true;
      state.readyUntil = scene.time.now + this.ADRENALINE_DURATION_MS;
      MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 108, 'ADRENALINE READY!', '#ff9f43');
      return state;
    },
  isAdrenalinePrimed: function(scene) {
      var state = this.ensureAdrenalineState(scene);
      if (!state.primed) return false;
      if (scene.time.now > state.readyUntil) {
        state.primed = false;
        return false;
      }
      return true;
    },
  consumeAdrenaline: function(scene) {
      var state = this.ensureAdrenalineState(scene);
      state.primed = false;
      state.readyUntil = 0;
      return state;
    },
  getLastDodgeTimestamp: function(scene) {
      if (!scene || !scene.player) return 0;
      var player = scene.player;
      var movement = scene.movementState || {};
      var candidates = [
        player.lastDodgeAt,
        player.lastEvadeAt,
        player.lastSuccessfulDodgeAt,
        player.dodgeState && player.dodgeState.lastDodgeAt,
        movement.lastDodgeAt,
        movement.lastEvadeAt,
        movement.lastSuccessfulDodgeAt,
        scene.lastPlayerDodgeAt
      ];
      var best = 0;
      for (var i = 0; i < candidates.length; i++) {
        var value = candidates[i];
        if (typeof value === 'number' && isFinite(value)) best = Math.max(best, value);
      }
      return best;
    },
  getLastBlockTimestamp: function(scene) {
      if (!scene || !scene.player) return 0;
      var player = scene.player;
      var movement = scene.movementState || {};
      var candidates = [
        player.lastBlockAt,
        player.lastGuardAt,
        player.lastParryAt,
        player.lastSuccessfulBlockAt,
        player.blockState && player.blockState.lastBlockAt,
        movement.lastBlockAt,
        movement.lastGuardAt,
        scene.lastPlayerBlockAt,
        scene.lastSuccessfulBlockAt
      ];
      var best = 0;
      for (var i = 0; i < candidates.length; i++) {
        var value = candidates[i];
        if (typeof value === 'number' && isFinite(value)) best = Math.max(best, value);
      }
      return best;
    },
  ensureCounterFlowState: function(scene) {
      scene.player.counterFlowState = scene.player.counterFlowState || {
        stacks: 0,
        lastSeenBlockAt: 0,
        autoCounterUntil: 0
      };
      return scene.player.counterFlowState;
    },
  refreshCounterFlowState: function(scene) {
      var state = this.ensureCounterFlowState(scene);
      var now = scene.time.now;
      var lastBlockAt = this.getLastBlockTimestamp(scene);
  
      if (lastBlockAt && lastBlockAt !== state.lastSeenBlockAt) {
        state.lastSeenBlockAt = lastBlockAt;
        if (now >= (state.autoCounterUntil || 0)) {
          state.stacks = Math.min(this.COUNTER_FLOW_MAX_STACKS, state.stacks + 1);
          MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 116, 'COUNTER FLOW x' + state.stacks, '#a5f3fc');
          if (state.stacks >= this.COUNTER_FLOW_MAX_STACKS) {
            MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 134, 'FLOW STATE PRIMED', '#67e8f9');
          }
        }
      }
  
      if (state.autoCounterUntil && now >= state.autoCounterUntil) {
        state.autoCounterUntil = 0;
        MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 134, 'FLOW STATE ENDED', '#9ca3af');
      }
  
      return state;
    },
  isCounterFlowAutoCounterActive: function(scene) {
      var state = this.ensureCounterFlowState(scene);
      return scene.time.now < (state.autoCounterUntil || 0);
    },
  getCounterAttackWindow: function(scene) {
      var state = this.ensureCounterFlowState(scene);
      if (scene.time.now < (state.autoCounterUntil || 0)) return this.COUNTER_ATTACK_WINDOW_MS;
      var reduction = (state.stacks || 0) * this.COUNTER_FLOW_WINDOW_PENALTY_MS;
      return Math.max(220, this.COUNTER_ATTACK_WINDOW_MS - reduction);
    },
  applyCounterFlowOnCounterHit: function(scene, damage, didCounterHit) {
      var state = this.ensureCounterFlowState(scene);
      if (!didCounterHit) return { damage: damage, active: false, stacks: state.stacks, flowState: false };
  
      var flowStateActive = scene.time.now < (state.autoCounterUntil || 0);
      var stacksForBonus = flowStateActive ? this.COUNTER_FLOW_MAX_STACKS : (state.stacks || 0);
      var mult = 1 + (stacksForBonus * this.COUNTER_FLOW_COUNTER_BONUS_PER_STACK);
      var boosted = Math.round(damage * mult);
  
      if (!flowStateActive && state.stacks >= this.COUNTER_FLOW_MAX_STACKS) {
        state.autoCounterUntil = scene.time.now + this.COUNTER_FLOW_AUTO_DURATION_MS;
        state.stacks = 0;
        MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 152, 'FLOW STATE ACTIVE!', '#22d3ee');
      }
  
      return {
        damage: boosted,
        active: stacksForBonus > 0,
        stacks: stacksForBonus,
        flowState: flowStateActive
      };
    },
  isBlocking: function(scene) {
      if (!scene || !scene.player) return false;
      if (this.isBreakthroughActive(scene)) return false;
      if (scene.blockKey && scene.blockKey.isDown) return true;
      if (scene.guardKey && scene.guardKey.isDown) return true;
      if (scene.player.isBlocking || scene.player.blocking) return true;
      if (scene.player.blockState && scene.player.blockState.active) return true;
      if (scene.movementState && scene.movementState.isBlocking) return true;
      return false;
    },
  ensureBreakthroughState: function(scene) {
      scene.player.breakthroughState = scene.player.breakthroughState || {
        activeUntil: 0,
        awardedFocusAt: 0
      };
      return scene.player.breakthroughState;
    },
  isBreakthroughActive: function(scene) {
      if (!scene || !scene.player) return false;
      var state = this.ensureBreakthroughState(scene);
      return scene.time.now < (state.activeUntil || 0);
    },
  triggerBreakthrough: function(scene) {
      if (!scene || !scene.player) return false;
      var state = this.ensureBreakthroughState(scene);
      state.activeUntil = scene.time.now + this.BREAKTHROUGH_DURATION_MS;
      state.awardedFocusAt = 0;
      scene.player.combatMoveSpeedMultiplier = this.BREAKTHROUGH_MOVE_SPEED_MULTIPLIER;
      MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 128, 'GUARD BROKEN!', '#ff7b7b');
      MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 146, 'BREAKTHROUGH x1.25 DMG', '#ffd6a5');
      return true;
    },
  refreshBreakthroughState: function(scene) {
      if (!scene || !scene.player) return null;
      var state = this.ensureBreakthroughState(scene);
      if (scene.time.now < (state.activeUntil || 0)) {
        scene.player.combatMoveSpeedMultiplier = this.BREAKTHROUGH_MOVE_SPEED_MULTIPLIER;
        return state;
      }
      if (state.activeUntil && !state.awardedFocusAt) {
        state.awardedFocusAt = scene.time.now;
        scene.player.combatMoveSpeedMultiplier = 1;
        this.gainFocus(scene, this.BREAKTHROUGH_FOCUS_BONUS);
        MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 128, 'BREAKTHROUGH END +10 FOCUS', '#9be7ff');
      } else if (!state.activeUntil) {
        scene.player.combatMoveSpeedMultiplier = 1;
      }
      return state;
    },
  applyBreakthroughDamageIfActive: function(scene, damage) {
      if (!this.isBreakthroughActive(scene)) return { damage: damage, active: false };
      return {
        damage: Math.round(damage * this.BREAKTHROUGH_DAMAGE_MULTIPLIER),
        active: true
      };
    },
  ensureGuardCrushState: function(scene) {
      scene.player.guardCrushState = scene.player.guardCrushState || {
        blocksInWindow: 0,
        firstBlockAt: 0,
        lastSeenBlockAt: 0,
        active: false,
        releaseStartedAt: 0,
        chipCarry: 0
      };
      return scene.player.guardCrushState;
    },
  refreshGuardCrushState: function(scene) {
      var state = this.ensureGuardCrushState(scene);
      var now = scene.time.now;
      var lastBlockAt = this.getLastBlockTimestamp(scene);
  
      if (lastBlockAt && lastBlockAt !== state.lastSeenBlockAt) {
        if (!state.firstBlockAt || now - state.firstBlockAt > this.GUARD_CRUSH_WINDOW_MS) {
          state.firstBlockAt = lastBlockAt;
          state.blocksInWindow = 1;
        } else {
          state.blocksInWindow += 1;
        }
        state.lastSeenBlockAt = lastBlockAt;
      }
  
      if (!state.active && state.blocksInWindow >= this.BREAKTHROUGH_BLOCKS_REQUIRED && now - state.firstBlockAt <= this.BREAKTHROUGH_WINDOW_MS) {
        this.triggerBreakthrough(scene);
        state.active = false;
        state.blocksInWindow = 0;
        state.firstBlockAt = 0;
        state.releaseStartedAt = 0;
        state.chipCarry = 0;
      }
  
      if (state.active) {
        if (this.isBlocking(scene)) {
          state.releaseStartedAt = 0;
        } else if (!state.releaseStartedAt) {
          state.releaseStartedAt = now;
        } else if (now - state.releaseStartedAt >= this.GUARD_CRUSH_RELEASE_MS) {
          state.active = false;
          state.blocksInWindow = 0;
          state.firstBlockAt = 0;
          state.releaseStartedAt = 0;
          state.chipCarry = 0;
          MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 122, 'GUARD RESET', '#9be7ff');
        }
      } else if (state.firstBlockAt && now - state.firstBlockAt > this.GUARD_CRUSH_WINDOW_MS) {
        state.blocksInWindow = 0;
        state.firstBlockAt = 0;
      }
  
      return state;
    },
  applyGuardCrushChip: function(scene, delta) {
      var state = this.refreshGuardCrushState(scene);
      if (this.isBreakthroughActive(scene)) return state;
      if (!state.active || !this.isBlocking(scene) || !scene.player || !scene.player.stats) return state;
  
      var chipPerMs = this.GUARD_CRUSH_CHIP_PER_SECOND / 1000;
      state.chipCarry += chipPerMs * Math.max(0, delta || 0);
      var chip = Math.floor(state.chipCarry);
      if (chip <= 0) return state;
  
      state.chipCarry -= chip;
      scene.player.stats.hp = Math.max(0, scene.player.stats.hp - chip);
      if (chip > 0 && scene.time.now % 250 < 30) {
        MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 104, 'CHIP -' + chip, '#ff9e9e');
      }
      if (scene.player.stats.hp <= 0) MMA.Player.damage(scene, 0);
      return state;
    },
  isCounterAttackWindow: function(scene, enemy) {
      if (!enemy || !enemy.active || enemy.state === 'dead') return false;
      if (this.isCounterFlowAutoCounterActive(scene)) return true;
      var lastBlockAt = this.getLastBlockTimestamp(scene);
      if (!lastBlockAt) return false;
      return (scene.time.now - lastBlockAt) <= this.getCounterAttackWindow(scene);
    },
  ensureWhiffShiftState: function(scene) {
      scene.player.whiffShiftState = scene.player.whiffShiftState || { misses: 0, primed: false };
      return scene.player.whiffShiftState;
    },
  onWhiffShiftMiss: function(scene) {
      var state = this.ensureWhiffShiftState(scene);
      if (state.primed) return state;
      state.misses += 1;
      if (state.misses >= this.WHIFF_SHIFT_MISSES_REQUIRED) {
        state.primed = true;
        MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 84, 'WHIFF SHIFT READY!', '#8be9fd');
      }
      return state;
    },
  applyWhiffShiftIfReady: function(scene, damage) {
      var state = this.ensureWhiffShiftState(scene);
      if (!state.primed) {
        if (state.misses > 0) state.misses = 0;
        return { damage: damage, active: false };
      }
      state.primed = false;
      state.misses = 0;
      return {
        damage: Math.round(damage * this.WHIFF_SHIFT_DAMAGE_MULTIPLIER),
        active: true
      };
    },
  getDefenseMultiplierWithAdrenaline: function(adaptiveDefenseMult, adrenalinePrimed) {
      if (!adrenalinePrimed || adaptiveDefenseMult <= 1) return adaptiveDefenseMult;
      return 1 + ((adaptiveDefenseMult - 1) * (1 - this.ADRENALINE_DEFENSE_IGNORE));
    },
  ensureBreakingPointState: function(enemy) {
      if (!enemy) return null;
      enemy.combatState = enemy.combatState || {};
      enemy.combatState.breakingPointState = enemy.combatState.breakingPointState || {
        hits: 0,
        lastHitAt: 0,
        activeUntil: 0,
        announcedAt: 0
      };
      return enemy.combatState.breakingPointState;
    },
  onBreakingPointHit: function(scene, enemy) {
      var state = this.ensureBreakingPointState(enemy);
      if (!state) return state;
      var now = scene.time.now;
      if (now - (state.lastHitAt || 0) > this.BREAKING_POINT_TIMEOUT_MS) state.hits = 0;
      state.hits += 1;
      state.lastHitAt = now;
      if (state.activeUntil > now) return state;
      if (state.hits >= this.BREAKING_POINT_HITS_REQUIRED) {
        state.hits = 0;
        state.activeUntil = now + this.BREAKING_POINT_DURATION_MS;
        state.announcedAt = 0;
        MMA.UI.showDamageText(scene, enemy.x, enemy.y - 118, 'BREAKING POINT!', '#ff8fab');
      }
      return state;
    },
  resetBreakingPointChain: function(scene) {
      if (!scene || !scene.enemyGroup) return;
      var enemies = scene.enemyGroup.getChildren();
      for (var i = 0; i < enemies.length; i++) {
        var enemy = enemies[i];
        if (!enemy || !enemy.combatState || !enemy.combatState.breakingPointState) continue;
        enemy.combatState.breakingPointState.hits = 0;
        enemy.combatState.breakingPointState.lastHitAt = 0;
      }
    },
  applyBreakingPointIfActive: function(scene, enemy, damage) {
      var state = this.ensureBreakingPointState(enemy);
      if (!state) return { damage: damage, active: false };
      var now = scene.time.now;
      if (now >= (state.activeUntil || 0)) return { damage: damage, active: false };
      if (!state.announcedAt || now - state.announcedAt > 450) {
        state.announcedAt = now;
        MMA.UI.showDamageText(scene, enemy.x, enemy.y - 100, 'CRACKED DEFENSE x1.25', '#ffb3c6');
      }
      return {
        damage: Math.round(damage * this.BREAKING_POINT_DAMAGE_MULTIPLIER),
        active: true
      };
    },
  ensureStunState: function(scene) {
      scene.player.stunChainState = scene.player.stunChainState || { hits: 0, lastHitAt: 0 };
      return scene.player.stunChainState;
    },
  onStunChainHit: function(scene, enemy) {
      var stun = this.ensureStunState(scene);
      var now = scene.time.now;
      if (now - stun.lastHitAt > this.COMBO_WINDOW_MS) stun.hits = 0;
      stun.hits += 1;
      stun.lastHitAt = now;
      if (stun.hits >= this.STUN_CHAIN_HITS && enemy && enemy.active && enemy.state !== 'dead') {
        enemy.staggerTimer = Math.max(enemy.staggerTimer || 0, this.STUN_DURATION_MS);
        enemy.state = 'staggered';
        stun.hits = 0;
        MMA.UI.showDamageText(scene, enemy.x, enemy.y - 146, 'STUN CHAIN!', '#b388ff');
        return true;
      }
      return false;
    },
  onStunChainMiss: function(scene) {
      var stun = this.ensureStunState(scene);
      stun.hits = 0;
    },
  getMomentumModifiers: function(scene, baseDamage) {
      var m = this.ensureMomentumState(scene);
      var damage = Math.round(baseDamage * (1 + m.stacks * this.MOMENTUM_DAMAGE_PER_STACK));
      var critChance = this.CRIT_CHANCE + m.stacks * this.MOMENTUM_CRIT_PER_STACK;
      return {
        damage: damage,
        critChance: Math.min(0.95, critChance),
        forceCrit: m.surgeReady,
        surgeReady: m.surgeReady,
        stacks: m.stacks
      };
    },
  onMomentumHit: function(scene) {
      var m = this.ensureMomentumState(scene);
      if (m.surgeReady) return m;
      m.stacks = Math.min(this.MOMENTUM_MAX_STACKS, m.stacks + 1);
      if (m.stacks >= this.MOMENTUM_MAX_STACKS) {
        m.surgeReady = true;
        MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 64, 'MOMENTUM SURGE READY!', '#7ce8ff');
      }
      return m;
    },
  onMomentumMiss: function(scene) {
      var m = this.ensureMomentumState(scene);
      m.stacks = 0;
      m.surgeReady = false;
      return m;
    },
  consumeMomentumSurge: function(scene) {
      var m = this.ensureMomentumState(scene);
      m.stacks = 0;
      m.surgeReady = false;
      return m;
    },
  onPressureHit: function(scene) {
      var p = this.ensurePressureState(scene);
      if (p.primed) return p;
      p.meter = Math.min(this.PRESSURE_THRESHOLD, p.meter + this.PRESSURE_PER_HIT);
      if (p.meter >= this.PRESSURE_THRESHOLD) {
        p.primed = true;
        MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 48, 'PRESSURE MAX!', '#ffb347');
      }
      return p;
    },
  onPressureMiss: function(scene) {
      var p = this.ensurePressureState(scene);
      p.meter = 0;
      p.primed = false;
    },
  applyPressureBreakIfReady: function(scene, damage, enemy) {
      var p = this.ensurePressureState(scene);
      if (!p.primed) return { damage: damage, pressureBreak: false };
      p.primed = false;
      p.meter = 0;
      if (enemy) {
        enemy.staggerTimer = Math.max(enemy.staggerTimer || 0, 900);
        enemy.state = 'staggered';
      }
      return {
        damage: Math.round(damage * this.PRESSURE_BREAK_MULTIPLIER),
        pressureBreak: true
      };
    },
  getMoveStyleGroup: function(moveKey) {
      var move = this.MOVE_ROSTER[moveKey];
      if (!move) return 'strike';
      if (move.type === 'grapple' || move.type === 'sub') return 'grapple';
      return 'strike';
    },
  getAttackWeightClass: function(moveKey) {
      var lightMoves = {
        jab: true,
        lowKick: true,
        bodyShot: true,
        singleLeg: true
      };
      var heavyMoves = {
        cross: true,
        hook: true,
        uppercut: true,
        headKick: true,
        spinningBackFist: true,
        takedown: true,
        hipThrow: true,
        armbar: true,
        triangleChoke: true,
        guillotine: true,
        rnc: true,
        heelHook: true,
        kneebar: true,
        kimura: true,
        americana: true
      };
      if (lightMoves[moveKey]) return 'light';
      if (heavyMoves[moveKey]) return 'heavy';
      return 'neutral';
    },
  getEnemyWeightClass: function(enemy) {
      if (!enemy || !enemy.type) return 'neutral';
      var raw = enemy.type.weightClass || enemy.type.weight || enemy.type.build || '';
      var normalized = String(raw).toLowerCase();
      if (normalized.indexOf('heavy') !== -1) return 'heavy';
      if (normalized.indexOf('light') !== -1 || normalized.indexOf('feather') !== -1) return 'light';
      return 'neutral';
    },
  applyWeightClassAdvantage: function(enemy, moveKey, damage) {
      var attackClass = this.getAttackWeightClass(moveKey);
      var enemyClass = this.getEnemyWeightClass(enemy);
      if (attackClass === 'neutral' || enemyClass === 'neutral') {
        return { damage: damage, active: false, bonus: 0 };
      }
  
      var bonus = 0;
      if (attackClass === 'light' && enemyClass === 'heavy') bonus = this.WEIGHT_ADVANTAGE_BONUS;
      if (attackClass === 'light' && enemyClass === 'light') bonus = -this.WEIGHT_ADVANTAGE_PENALTY;
      if (attackClass === 'heavy' && enemyClass === 'light') bonus = this.WEIGHT_ADVANTAGE_BONUS;
      if (attackClass === 'heavy' && enemyClass === 'heavy') bonus = -this.WEIGHT_ADVANTAGE_PENALTY;
  
      if (!bonus) return { damage: damage, active: false, bonus: 0 };
      return {
        damage: Math.round(damage * (1 + bonus)),
        active: true,
        bonus: bonus,
        attackClass: attackClass,
        enemyClass: enemyClass
      };
    },
  getDominantStyleGroup: function(scene) {
      var style = this.getPlayerGrappleStyle(scene);
      if (style === 'grappler') return 'grapple';
      if (style === 'striker') return 'strike';
      return this.getMoveStyleGroup('cross');
    },
  ensureStyleMasteryState: function(scene) {
      scene.player.styleMasteryState = scene.player.styleMasteryState || { meter: 0, primed: false };
      return scene.player.styleMasteryState;
    },
  onStyleShiftCounter: function(scene, moveKey, didCounterHit) {
      if (!didCounterHit) return this.ensureStyleMasteryState(scene);
      var dominant = this.getDominantStyleGroup(scene);
      var used = this.getMoveStyleGroup(moveKey);
      var state = this.ensureStyleMasteryState(scene);
      if (used === dominant) return state;
  
      var prev = state.meter;
      state.meter = Math.min(this.STYLE_MASTERY_THRESHOLD, state.meter + this.STYLE_MASTERY_COUNTER_GAIN);
      if (state.meter !== prev) {
        MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 96, 'STYLE MASTERY +' + (state.meter - prev), '#c8b6ff');
      }
      if (!state.primed && state.meter >= this.STYLE_MASTERY_THRESHOLD) {
        state.primed = true;
        MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 112, 'STYLE MASTERY READY!', '#bdb2ff');
      }
      return state;
    },
  applyStyleMasteryIfPrimed: function(scene, moveKey, damage, defenseMult) {
      var state = this.ensureStyleMasteryState(scene);
      if (!state.primed) return { damage: damage, defenseMult: defenseMult, consumed: false };
  
      var dominant = this.getDominantStyleGroup(scene);
      var used = this.getMoveStyleGroup(moveKey);
      if (used !== dominant) return { damage: damage, defenseMult: defenseMult, consumed: false };
  
      state.primed = false;
      state.meter = 0;
      var boostedDamage = Math.round(damage * this.STYLE_MASTERY_DAMAGE_MULTIPLIER);
      var boostedDefenseMult = 1 + ((defenseMult - 1) * (1 - this.STYLE_MASTERY_DEFENSE_IGNORE));
      return {
        damage: boostedDamage,
        defenseMult: boostedDefenseMult,
        consumed: true
      };
    },
  ensureTransitionCancelState: function(scene) {
      scene.player.transitionCancelState = scene.player.transitionCancelState || {
        lastAttackAt: 0,
        lastMoveKey: null,
        lastMoveStaminaCost: 0,
        lastProcessedDodgeAt: 0,
        consumedAttackAt: 0
      };
      return scene.player.transitionCancelState;
    },
  markAttackForTransitionCancel: function(scene, moveKey, staminaCost) {
      var state = this.ensureTransitionCancelState(scene);
      state.lastAttackAt = scene.time.now;
      state.lastMoveKey = moveKey || null;
      state.lastMoveStaminaCost = Math.max(0, staminaCost || 0);
      return state;
    },
  tryTransitionFrameCancel: function(scene) {
      if (!scene || !scene.player || !scene.player.stats || !scene.player.cooldowns) return false;
      var state = this.ensureTransitionCancelState(scene);
      var lastDodgeAt = this.getLastDodgeTimestamp(scene);
      if (!lastDodgeAt || lastDodgeAt <= state.lastProcessedDodgeAt) return false;
      state.lastProcessedDodgeAt = lastDodgeAt;
  
      if (!state.lastAttackAt || state.consumedAttackAt === state.lastAttackAt) return false;
      if (lastDodgeAt < state.lastAttackAt) return false;
  
      var elapsed = lastDodgeAt - state.lastAttackAt;
      if (elapsed > this.TRANSITION_CANCEL_WINDOW_MS) return false;
  
      var staminaPenalty = Math.max(1, Math.ceil((state.lastMoveStaminaCost || 0) * this.TRANSITION_CANCEL_STAMINA_PENALTY_PCT));
      if (scene.player.stats.stamina < staminaPenalty) {
        MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 90, 'NO STAMINA: FRAME CANCEL', '#ff8b8b');
        return false;
      }
  
      scene.player.stats.stamina -= staminaPenalty;
      state.consumedAttackAt = state.lastAttackAt;
  
      var cooldowns = scene.player.cooldowns;
      Object.keys(cooldowns).forEach(function(key) {
        var v = cooldowns[key] || 0;
        if (v <= 0) return;
        cooldowns[key] = Math.max(0, Math.floor(v * (1 - window.MMA.Combat.TRANSITION_CANCEL_COOLDOWN_REDUCTION_PCT)));
      });
  
      MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 108, 'FRAME CANCEL!', '#8ef9ff');
      MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 126, 'STAMINA -' + staminaPenalty, '#ffd6a5');
      return true;
    },
  tryStaggerRecoveryTech: function(scene) {
      if (!scene || !scene.player || !scene.player.stats) return false;
      if (!scene.player.stunnedUntil || scene.time.now >= scene.player.stunnedUntil) return false;
  
      var stunRemaining = scene.player.stunnedUntil - scene.time.now;
      if (stunRemaining > this.RECOVERY_TECH_WINDOW_MS) return false;
      if (scene.player.stats.stamina < this.RECOVERY_TECH_STAMINA_COST) {
        MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 58, 'NO STAMINA: RECOVERY TECH', '#ff8080');
        return false;
      }
  
      scene.player.stats.stamina -= this.RECOVERY_TECH_STAMINA_COST;
      scene.player.stunnedUntil = 0;
  
      var DT = CONFIG.DISPLAY_TILE;
      var enemies = scene.enemyGroup.getChildren();
      var best = null;
      var bestDist = Infinity;
      for (var i = 0; i < enemies.length; i++) {
        var enemy = enemies[i];
        if (!enemy || !enemy.active || enemy.state === 'dead') continue;
        var dist = Phaser.Math.Distance.Between(scene.player.x, scene.player.y, enemy.x, enemy.y);
        if (dist <= DT * 2 && dist < bestDist) {
          best = enemy;
          bestDist = dist;
        }
      }
  
      MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 76, 'RECOVERY TECH!', '#8ef9ff');
      if (!best) return true;
  
      var attackBonus = scene.player.attackBonus || 0;
      var baseCounterDamage = this.MOVE_ROSTER.cross.damage + attackBonus;
      var dmg = Math.round(baseCounterDamage * this.RECOVERY_TECH_DAMAGE_MULTIPLIER);
      best.stats.hp -= dmg;
  
      MMA.UI.recordHitDealt(dmg, false, 1);
      MMA.UI.recordMoveUsage('cross', scene);
      MMA.UI.showDamageText(scene, best.x, best.y - 34, 'TECH COUNTER! -' + dmg, '#66e6ff');
      MMA.VFX.flashEnemyHit(scene, best, 120);
      MMA.VFX.showImpactSpark(scene, best.x, best.y, true);
      best.staggerTimer = Math.max(best.staggerTimer || 0, 800);
      best.state = 'staggered';
  
      if (best.stats.hp <= 0) MMA.Enemies.killEnemy(scene, best);
      return true;
    }
});

// --- Compatibility/feature hooks: stamina break, pressure, and deadly windows ---
Object.assign(window.MMA.Combat, {
  _pressureLevel: 0,
  _pressureReady: false,

  // Stamina Break — enemy at 0 stamina staggers
  checkStaminaBreak: function(scene, enemy) {
    if (!enemy || !enemy.stats) return;
    if (enemy.stats.stamina > 0) return;
    if (enemy._staminaBreakUntil && scene.time.now < enemy._staminaBreakUntil) return;

    enemy._staminaBreakUntil = scene.time.now + 2000;
    enemy._staminaBroken = true;
    if (enemy.setTint) enemy.setTint(0x8888ff);

    scene.time.delayedCall(2000, function() {
      enemy._staminaBroken = false;
      if (enemy.active && enemy.clearTint) enemy.clearTint();
    });

    if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
      MMA.UI.showDamageText(scene, enemy.x, enemy.y - 30, 'STAMINA BREAK!', '#8888ff');
    }
  },

  addPressure: function(scene, amt) {
    window.MMA.Combat._pressureLevel = Math.min(100, (window.MMA.Combat._pressureLevel || 0) + (amt || 10));
    if (window.MMA.Combat._pressureLevel >= 100) {
      window.MMA.Combat._pressureReady = true;
      if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function' && scene && scene.player) {
        MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 40, 'PRESSURE!', '#ff4400');
      }
    }
  },

  consumePressure: function() {
    if (!window.MMA.Combat._pressureReady) return 1.0;
    window.MMA.Combat._pressureReady = false;
    window.MMA.Combat._pressureLevel = 0;
    return 2.5; // damage multiplier
  },

  resetPressure: function() {
    window.MMA.Combat._pressureLevel = 0;
    window.MMA.Combat._pressureReady = false;
  }
});

  // Timing Window Mastery
MMA.Combat._timingMastery = 0;
MMA.Combat._lastInputTs = 0;
MMA.Combat._timingReady = false;
MMA.Combat.recordTimingInput = function(scene) {
    var now = scene ? scene.time.now : Date.now();
    var gap = now - (MMA.Combat._lastInputTs || 0);
    MMA.Combat._lastInputTs = now;
    if (gap >= 100 && gap <= 300) {
      MMA.Combat._timingMastery = Math.min(100, (MMA.Combat._timingMastery || 0) + 15);
      if (MMA.Combat._timingMastery >= 100) {
        MMA.Combat._timingReady = true;
        if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
          var p = scene && scene.player;
          if (p) MMA.UI.showDamageText(scene, p.x, p.y - 35, '🎯 PERFECT TIMING!', '#00ffcc');
        }
      }
    } else if (gap > 600) {
      MMA.Combat._timingMastery = Math.max(0, (MMA.Combat._timingMastery || 0) - 10);
    }
  };
MMA.Combat.consumeTimingBonus = function() {
    if (!MMA.Combat._timingReady) return 1.0;
    MMA.Combat._timingReady = false;
    MMA.Combat._timingMastery = 0;
    return 1.25;
  };

  // Technique Harmony System
MMA.Combat.HARMONIES = {
    'jab|cross|hook': { name: "Boxer's Rhythm", bonus: 0.15, type: 'combo' },
    'jab|takedown': { name: "Grappling Flow", bonus: 0.10, type: 'grapple' },
    'lowKick|hook|uppercut': { name: "Low-High Chain", bonus: 0.12, type: 'combo' },
    'hook|clinchKnee': { name: "Clinch Dominator", bonus: 0.18, type: 'strike' },
    'headKick|cross': { name: "High-Low Striker", bonus: 0.13, type: 'combo' }
  };
MMA.Combat._moveSequence = [];
MMA.Combat._discoveredHarmonies = {};
MMA.Combat.trackHarmony = function(scene, moveKey) {
    var seq = MMA.Combat._moveSequence;
    seq.push(moveKey);
    if (seq.length > 3) seq.shift();
    var key2 = seq.slice(-2).join('|');
    var key3 = seq.slice(-3).join('|');
    [key2, key3].forEach(function(k) {
      var h = MMA.Combat.HARMONIES[k];
      if (!h) return;
      try {
        var counts = JSON.parse(localStorage.getItem('mma_harmony_counts') || '{}');
        counts[k] = (counts[k] || 0) + 1;
        localStorage.setItem('mma_harmony_counts', JSON.stringify(counts));
        if (counts[k] === 5 && !MMA.Combat._discoveredHarmonies[k]) {
          MMA.Combat._discoveredHarmonies[k] = true;
          if (window.MMA && MMA.UI && typeof MMA.UI.queueAchievementToast === 'function') {
            MMA.UI.queueAchievementToast(scene, 'HARMONY: ' + h.name, '⚡');
          }
        }
      } catch(e) {}
    });
  };
MMA.Combat.getHarmonyBonus = function() {
    try {
      var counts = JSON.parse(localStorage.getItem('mma_harmony_counts') || '{}');
      var bonus = 0;
      Object.keys(counts).forEach(function(k) {
        if (counts[k] >= 5) {
          var h = MMA.Combat.HARMONIES[k];
          if (h) bonus += h.bonus;
        }
      });
      return Math.min(1.5, 1.0 + bonus);
    } catch(e) { return 1.0; }
  };

  MMA.Combat.openDeadlyWindow = function(enemy, durationMs) {
    if (!enemy) return;
    enemy._deadlyWindowUntil = Date.now() + (durationMs || 300);
  };
  MMA.Combat.isInDeadlyWindow = function(enemy) {
    return !!(enemy && enemy._deadlyWindowUntil && Date.now() < enemy._deadlyWindowUntil);
  };

(function() {
  var Combat = window.MMA && window.MMA.Combat;
  if (!Combat) return;

  var _origHandleInput = Combat.handleInput;
  if (typeof _origHandleInput === 'function') {
    Combat.handleInput = function(scene, delta) {
      if (!Combat._hooksInstalled) {
        Combat._hooksInstalled = true;

        if (window.MMA && MMA.Player && typeof MMA.Player.damage === 'function' && !MMA.Player._combatPressureWrapped) {
          var _origPlayerDamage = MMA.Player.damage;
          MMA.Player.damage = function(sceneArg, dmg) {
            if (sceneArg && sceneArg._lastDamagingEnemy) {
              sceneArg._lastDamagingEnemy._deadlyWindowUntil = (sceneArg.time && sceneArg.time.now ? sceneArg.time.now : Date.now()) + 300;
            }
            Combat.resetPressure();
            return _origPlayerDamage.call(this, sceneArg, dmg);
          };
          MMA.Player._combatPressureWrapped = true;
        }

        if (window.MMA && MMA.Enemies && typeof MMA.Enemies.damagePlayer === 'function' && !MMA.Enemies._deadlyWindowWrapped) {
          var _origDamagePlayer = MMA.Enemies.damagePlayer;
          MMA.Enemies.damagePlayer = function(attackerEnemy, sceneArg, dmg) {
            if (sceneArg && attackerEnemy) {
              sceneArg._lastDamagingEnemy = attackerEnemy;
              attackerEnemy._deadlyWindowUntil = (sceneArg.time && sceneArg.time.now ? sceneArg.time.now : Date.now()) + 300;
            }
            return _origDamagePlayer.call(this, attackerEnemy, sceneArg, dmg);
          };
          MMA.Enemies._deadlyWindowWrapped = true;
        }
      }

      return _origHandleInput.call(this, scene, delta);
    };
  }

  var _origOnEnemyStaminaHit = Combat.onEnemyStaminaHit;
  if (typeof _origOnEnemyStaminaHit === 'function') {
    Combat.onEnemyStaminaHit = function(scene, enemy, move) {
      var result = _origOnEnemyStaminaHit.call(this, scene, enemy, move);
      if (enemy && enemy.stats) {
        if (typeof enemy.stats.stamina !== 'number') {
          enemy.stats.stamina = Math.max(0, (enemy.stats.maxStamina || 100));
        }
        var staminaDamage = Math.max(4, Math.round((move && move.staminaCost ? move.staminaCost : 8) * 1.1));
        enemy.stats.stamina = Math.max(0, enemy.stats.stamina - staminaDamage);
        this.checkStaminaBreak(scene, enemy);
      }
      return result;
    };
  }

  var _origApplyStaminaBreakIfActive = Combat.applyStaminaBreakIfActive;
  if (typeof _origApplyStaminaBreakIfActive === 'function') {
    Combat.applyStaminaBreakIfActive = function(scene, enemy, damage) {
      if (enemy && enemy._staminaBroken) {
        return {
          damage: Math.round(damage * 1.5),
          staminaBreakActive: true
        };
      }
      return _origApplyStaminaBreakIfActive.call(this, scene, enemy, damage);
    };
  }

  var _origApplyDeadlyWindowIfActive = Combat.applyDeadlyWindowIfActive;
  Combat.applyDeadlyWindowIfActive = function(scene, target, damage) {
    if (target && this.isInDeadlyWindow(target)) {
      if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
        MMA.UI.showDamageText(scene, target.x, target.y - 20, 'COUNTER! ×1.5', '#00ffcc');
      }
      return { damage: Math.round(damage * 1.5), deadlyWindow: true };
    }
    if (typeof _origApplyDeadlyWindowIfActive === 'function') {
      return _origApplyDeadlyWindowIfActive.call(this, scene, target, damage);
    }
    return { damage: damage, deadlyWindow: false };
  };

  Combat.applyPressureBreakIfReady = function(scene, damage, enemy) {
    var pressureMult = this.consumePressure();
    if (pressureMult > 1) {
      var boosted = Math.round(damage * pressureMult);
      if (enemy) enemy._guardBroken = true;
      if (scene && scene._groundTarget) scene._groundTarget._guardBroken = true;
      return { damage: boosted, pressureBreak: true };
    }
    return { damage: damage, pressureBreak: false };
  };

  Combat.onPressureHit = function(scene) {
    this.addPressure(scene, 10);
    return null;
  };

  Combat.onPressureMiss = function(scene) {
    this.resetPressure();
    return null;
  };
})();

MMA.Combat.triggerAdrenaline = function(scene) {
  var p = scene && scene.player;
  if (!p) return;
  p._adrenalineActive = true;
  p._adrenalineUntil = scene.time.now + 5000;
  if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
    MMA.UI.showDamageText(scene, p.x, p.y - 30, '⚡ ADRENALINE!', '#ff8800');
  }
};

MMA.Combat.consumeAdrenaline = function(scene) {
  var p = scene && scene.player;
  if (!p || !p._adrenalineActive) return false;
  if (scene.time.now > (p._adrenalineUntil || 0)) {
    p._adrenalineActive = false;
    return false;
  }
  p._adrenalineActive = false;
  return true;
};

MMA.Combat.getWeightClassMult = function(moveKey, enemy) {
  if (!enemy || !enemy.type) return 1.0;
  var wc = enemy.type.weightClass || 'medium';
  var lightMoves = ['jab','cross','lowKick','backKick','wingChun'];
  var heavyMoves = ['hook','uppercut','suplex','tigerKnee','spinningHeelKick','overhangRight','clinchKnee'];
  var isLight = lightMoves.indexOf(moveKey) >= 0;
  var isHeavy = heavyMoves.indexOf(moveKey) >= 0;
  if (isLight && wc === 'heavy') return 1.2;
  if (isLight && wc === 'light') return 0.85;
  if (isHeavy && wc === 'light') return 1.2;
  if (isHeavy && wc === 'heavy') return 0.85;
  return 1.0;
};

(function() {
  var Combat = MMA && MMA.Combat;
  if (!Combat) return;

  var _origRefreshCounterFlowState = Combat.refreshCounterFlowState;
  if (typeof _origRefreshCounterFlowState === 'function') {
    Combat.refreshCounterFlowState = function(scene) {
      var lastBlockAtBefore = Combat.getLastBlockTimestamp(scene);
      var result = _origRefreshCounterFlowState.call(this, scene);
      var lastBlockAtAfter = Combat.getLastBlockTimestamp(scene);
      if (
        lastBlockAtAfter &&
        lastBlockAtAfter !== lastBlockAtBefore &&
        scene && scene._lastEnemyAttackTs &&
        (lastBlockAtAfter - scene._lastEnemyAttackTs) >= 0 &&
        (lastBlockAtAfter - scene._lastEnemyAttackTs) <= 150
      ) {
        Combat.triggerAdrenaline(scene);
      }
      return result;
    };
  }

  if (window.MMA && MMA.Enemies && typeof MMA.Enemies.damagePlayer === 'function' && !MMA.Enemies._adrenalineEnemyAttackWrapped) {
    var _origDamagePlayer = MMA.Enemies.damagePlayer;
    MMA.Enemies.damagePlayer = function(attackerEnemy, sceneArg, dmg) {
      if (sceneArg && sceneArg.time) sceneArg._lastEnemyAttackTs = sceneArg.time.now;
      var result = _origDamagePlayer.call(this, attackerEnemy, sceneArg, dmg);
      if (sceneArg && window.MMA && MMA.Combat && typeof MMA.Combat.checkSecondWind === 'function') {
        MMA.Combat.checkSecondWind(sceneArg);
      }
      return result;
    };
    MMA.Enemies._adrenalineEnemyAttackWrapped = true;
  }

  if (window.MMA && MMA.Player && typeof MMA.Player.damage === 'function' && !MMA.Player._secondWindWrapped) {
    var _origPlayerDamage2 = MMA.Player.damage;
    MMA.Player.damage = function(sceneArg, dmg) {
      var result = _origPlayerDamage2.call(this, sceneArg, dmg);
      if (sceneArg && window.MMA && MMA.Combat && typeof MMA.Combat.checkSecondWind === 'function') {
        MMA.Combat.checkSecondWind(sceneArg);
      }
      return result;
    };
    MMA.Player._secondWindWrapped = true;
  }
})();

// === TIMING WINDOW MASTERY ===
MMA.Combat._timingMastery = MMA.Combat._timingMastery || 0;
MMA.Combat._lastInputTs = MMA.Combat._lastInputTs || 0;
MMA.Combat._timingReady = MMA.Combat._timingReady || false;
MMA.Combat.recordTimingInput = function(scene) {
  var now = scene ? scene.time.now : Date.now();
  var gap = now - (MMA.Combat._lastInputTs || 0);
  MMA.Combat._lastInputTs = now;
  if (gap >= 100 && gap <= 300) {
    MMA.Combat._timingMastery = Math.min(100, (MMA.Combat._timingMastery || 0) + 15);
    if (MMA.Combat._timingMastery >= 100 && !MMA.Combat._timingReady) {
      MMA.Combat._timingReady = true;
      var p = scene && scene.player;
      if (p && window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
        MMA.UI.showDamageText(scene, p.x, p.y - 35, '🎯 TIMING!', '#00ffcc');
      }
    }
  } else if (gap > 600) {
    MMA.Combat._timingMastery = Math.max(0, (MMA.Combat._timingMastery || 0) - 10);
  }
};
MMA.Combat.consumeTimingBonus = function() {
  if (!MMA.Combat._timingReady) return 1.0;
  MMA.Combat._timingReady = false;
  MMA.Combat._timingMastery = 0;
  return 1.25;
};

// === TECHNIQUE HARMONY SYSTEM ===
MMA.Combat.HARMONIES = MMA.Combat.HARMONIES || {
  'jab|cross|hook': { name: "Boxer's Rhythm", bonus: 0.15 },
  'jab|takedown': { name: "Grappling Flow", bonus: 0.10 },
  'lowKick|hook|uppercut': { name: "Low-High Chain", bonus: 0.12 },
  'hook|clinchKnee': { name: "Clinch Dominator", bonus: 0.18 },
  'headKick|cross': { name: "High-Low", bonus: 0.13 },
};
MMA.Combat._moveSequence = MMA.Combat._moveSequence || [];
MMA.Combat.trackHarmony = function(scene, moveKey) {
  if (!moveKey) return;
  var seq = MMA.Combat._moveSequence;
  seq.push(moveKey);
  if (seq.length > 3) seq.shift();
  var k2 = seq.slice(-2).join('|');
  var k3 = seq.slice(-3).join('|');
  [k2, k3].forEach(function(k) {
    var h = MMA.Combat.HARMONIES[k];
    if (!h) return;
    try {
      var counts = JSON.parse(localStorage.getItem('mma_harmony_counts') || '{}');
      counts[k] = (counts[k] || 0) + 1;
      localStorage.setItem('mma_harmony_counts', JSON.stringify(counts));
      if (counts[k] === 5 && window.MMA && MMA.UI && typeof MMA.UI.queueAchievementToast === 'function') {
        MMA.UI.queueAchievementToast(scene, 'HARMONY: ' + h.name, '⚡');
      }
    } catch(e) {}
  });
};
MMA.Combat.getHarmonyBonus = function() {
  try {
    var counts = JSON.parse(localStorage.getItem('mma_harmony_counts') || '{}');
    var bonus = 0;
    Object.keys(counts).forEach(function(k) {
      if (counts[k] >= 5 && MMA.Combat.HARMONIES[k]) bonus += MMA.Combat.HARMONIES[k].bonus;
    });
    return Math.min(1.5, 1.0 + bonus);
  } catch(e) { return 1.0; }
};

// === SHADOW CLONE MIRROR MATCH ===
MMA.Combat.triggerShadowClone = function(scene, enemy) {
  if (!scene || !enemy || !scene.player) return;
  if (Math.random() > 0.3) return;
  var dmg = Math.round(((enemy.stats && enemy.stats.attackDamage) || 8) * 0.5);
  if (scene.add) {
    var clone = scene.add.rectangle(enemy.x, enemy.y, 20, 36, 0xff2200, 0.35).setDepth(195).setScrollFactor(0);
    scene.tweens.add({ targets: clone, alpha: 0, x: scene.player.x, y: scene.player.y, duration: 400,
      onComplete: function() {
        if (clone.active) clone.destroy();
        if (scene.player && scene.player.stats && scene.player.stats.hp > 0) {
          scene.player.stats.hp = Math.max(0, scene.player.stats.hp - dmg);
          if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
            MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 20, 'ECHO -' + dmg, '#ff2200');
          }
        }
      }
    });
  }
};
// === WALL BOUNCE TECHNICAL ===
// Player bouncing off ring wall gets a brief invincibility + counter window
MMA.Combat.triggerWallBounce = MMA.Combat.triggerWallBounce || function(scene) {
  if (!scene || !scene.player) return;
  var p = scene.player;
  p._wallBounceUntil = Date.now() + 400;
  p._wallBounceCounterUntil = Date.now() + 600;
  if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
    MMA.UI.showDamageText(scene, p.x, p.y - 30, 'WALL BOUNCE!', '#ffaa00');
  }
};

MMA.Combat.isWallBounceActive = MMA.Combat.isWallBounceActive || function(scene) {
  var p = scene && scene.player;
  return !!(p && p._wallBounceUntil && Date.now() < p._wallBounceUntil);
};

MMA.Combat.isWallBounceCounter = MMA.Combat.isWallBounceCounter || function(scene) {
  var p = scene && scene.player;
  return !!(p && p._wallBounceCounterUntil && Date.now() < p._wallBounceCounterUntil);
};

// === DO-OR-DIE ROOM ===
// Special high-risk high-reward room: all enemies deal 2x damage but drop 3x gold/XP
MMA.Combat.DO_OR_DIE_MULT = { enemyDamage: 2.0, goldReward: 3.0, xpReward: 3.0 };

MMA.Combat.isDoOrDieRoom = MMA.Combat.isDoOrDieRoom || function(scene) {
  return !!(scene && scene._doOrDieRoom);
};

MMA.Combat.activateDoOrDie = MMA.Combat.activateDoOrDie || function(scene) {
  if (!scene) return;
  scene._doOrDieRoom = true;
  if (window.MMA && MMA.UI && typeof MMA.UI.queueAchievementToast === 'function') {
    MMA.UI.queueAchievementToast(scene, 'DO OR DIE ROOM', '☠️');
  }
};

MMA.Combat.getDoOrDieEnemyDamageMult = MMA.Combat.getDoOrDieEnemyDamageMult || function(scene) {
  return MMA.Combat.isDoOrDieRoom(scene) ? MMA.Combat.DO_OR_DIE_MULT.enemyDamage : 1.0;
};

MMA.Combat.getDoOrDieRewardMult = MMA.Combat.getDoOrDieRewardMult || function(scene) {
  if (!MMA.Combat.isDoOrDieRoom(scene)) return { gold: 1.0, xp: 1.0 };
  return { gold: MMA.Combat.DO_OR_DIE_MULT.goldReward, xp: MMA.Combat.DO_OR_DIE_MULT.xpReward };
};

// === CROWD JUDGE SCORING ===
// Judges track performance; score influences post-fight bonuses
MMA.Combat._judgeScore = 0;

MMA.Combat.addJudgeScore = MMA.Combat.addJudgeScore || function(points) {
  MMA.Combat._judgeScore = Math.min(100, (MMA.Combat._judgeScore || 0) + (points || 0));
};

MMA.Combat.resetJudgeScore = MMA.Combat.resetJudgeScore || function() {
  MMA.Combat._judgeScore = 0;
};

MMA.Combat.getJudgeVerdict = MMA.Combat.getJudgeVerdict || function() {
  var s = MMA.Combat._judgeScore || 0;
  if (s >= 90) return { label: 'DOMINANT', goldMult: 1.5, xpMult: 1.3 };
  if (s >= 70) return { label: 'DECISIVE', goldMult: 1.25, xpMult: 1.15 };
  if (s >= 50) return { label: 'SPLIT', goldMult: 1.1, xpMult: 1.0 };
  return { label: 'CLOSE', goldMult: 1.0, xpMult: 1.0 };
};
// === BATTLE MOMENTUM SHIFT ===
// When player takes 3 hits in a row, enemy gains momentum (speed/dmg buff)
// When player lands 3 in a row, player gains momentum
MMA.Combat._playerHitStreak = 0;
MMA.Combat._enemyHitStreak = 0;

MMA.Combat.recordPlayerHit = MMA.Combat.recordPlayerHit || function(scene) {
  MMA.Combat._playerHitStreak = 0;
  MMA.Combat._enemyHitStreak = (MMA.Combat._enemyHitStreak || 0) + 1;
  if (MMA.Combat._enemyHitStreak >= 3) {
    MMA.Combat._enemyHitStreak = 0;
    MMA.Combat._enemyMomentumUntil = Date.now() + 4000;
    if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function' && scene && scene.enemies) {
      var e = scene.enemies[0];
      if (e) MMA.UI.showDamageText(scene, e.x, e.y - 30, '⚡ MOMENTUM', '#ff4400');
    }
  }
};

MMA.Combat.recordPlayerLand = MMA.Combat.recordPlayerLand || function(scene) {
  MMA.Combat._enemyHitStreak = 0;
  MMA.Combat._playerHitStreak = (MMA.Combat._playerHitStreak || 0) + 1;
  if (MMA.Combat._playerHitStreak >= 3) {
    MMA.Combat._playerHitStreak = 0;
    MMA.Combat._playerMomentumUntil = Date.now() + 4000;
    if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function' && scene && scene.player) {
      var p = scene.player;
      MMA.UI.showDamageText(scene, p.x, p.y - 40, '🔥 ON FIRE!', '#FFD700');
    }
  }
};

MMA.Combat.getPlayerMomentumMult = MMA.Combat.getPlayerMomentumMult || function() {
  return (MMA.Combat._playerMomentumUntil && Date.now() < MMA.Combat._playerMomentumUntil) ? 1.2 : 1.0;
};

MMA.Combat.getEnemyMomentumMult = MMA.Combat.getEnemyMomentumMult || function() {
  return (MMA.Combat._enemyMomentumUntil && Date.now() < MMA.Combat._enemyMomentumUntil) ? 1.2 : 1.0;
};

// === GUARD BREAK SYSTEM ===
// Repeated attacks on same spot break enemy guard; next hit deals 2x
MMA.Combat._guardHits = {};

MMA.Combat.recordGuardHit = MMA.Combat.recordGuardHit || function(enemy, moveKey) {
  if (!enemy || !enemy._id) return;
  var key = enemy._id + ':' + moveKey;
  MMA.Combat._guardHits[key] = (MMA.Combat._guardHits[key] || 0) + 1;
  if (MMA.Combat._guardHits[key] >= 3) {
    MMA.Combat._guardHits[key] = 0;
    enemy._guardBroken = true;
    enemy._guardBrokenUntil = Date.now() + 2000;
  }
};

MMA.Combat.getGuardBreakMult = MMA.Combat.getGuardBreakMult || function(enemy) {
  if (enemy && enemy._guardBroken && enemy._guardBrokenUntil && Date.now() < enemy._guardBrokenUntil) {
    return 2.0;
  }
  if (enemy) enemy._guardBroken = false;
  return 1.0;
};

// === STAMINA RECOVERY BURST ===
// Standing still for 2s triggers a stamina recovery burst
MMA.Combat.updateStaminaRecovery = MMA.Combat.updateStaminaRecovery || function(scene) {
  var p = scene && scene.player;
  if (!p || !p.stats) return;
  var now = Date.now();
  var vx = p.body ? Math.abs(p.body.velocity.x) : 0;
  var vy = p.body ? Math.abs(p.body.velocity.y) : 0;
  var moving = vx > 5 || vy > 5;
  if (moving) {
    p._stillSince = null;
  } else {
    if (!p._stillSince) p._stillSince = now;
    var stillMs = now - p._stillSince;
    if (stillMs >= 2000 && p.stats.stamina < (p.stats.maxStamina || 100)) {
      var recover = Math.min(5, (p.stats.maxStamina || 100) - p.stats.stamina);
      p.stats.stamina += recover;
      if (recover > 0 && stillMs % 1000 < 100 && window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
        MMA.UI.showDamageText(scene, p.x, p.y - 25, '+STA', '#00aaff');
      }
    }
  }
};
// === TECHNIQUE CONDITIONING SYSTEM ===
// Each move fatigues when overused in a single fight; resets on zone clear
MMA.Combat._moveFatigue = {};

MMA.Combat.recordMoveUsedInFight = MMA.Combat.recordMoveUsedInFight || function(moveKey) {
  MMA.Combat._moveFatigue[moveKey] = (MMA.Combat._moveFatigue[moveKey] || 0) + 1;
};

MMA.Combat.getConditioningMult = MMA.Combat.getConditioningMult || function(moveKey) {
  var uses = MMA.Combat._moveFatigue[moveKey] || 0;
  if (uses <= 3) return 1.0;
  if (uses <= 6) return 0.90;
  if (uses <= 10) return 0.80;
  return 0.70; // severely fatigued
};

MMA.Combat.getConditioningLabel = MMA.Combat.getConditioningLabel || function(moveKey) {
  var uses = MMA.Combat._moveFatigue[moveKey] || 0;
  if (uses <= 3) return null;
  if (uses <= 6) return 'TIRED';
  if (uses <= 10) return 'FATIGUED';
  return 'EXHAUSTED';
};

MMA.Combat.resetMoveFatigue = MMA.Combat.resetMoveFatigue || function() {
  MMA.Combat._moveFatigue = {};
};

// === FIGHTING STYLE RIVALRY ===
// Using a "rival" style against certain enemies grants them bonuses (BJJ beats Wrestling, Muay Thai beats Boxing, etc.)
MMA.Combat.STYLE_RIVALRIES = {
  // attacker style -> defender style that gets bonus
  strike:  'grapple',   // grapplers counter strikers
  grapple: 'kick',      // kickers keep grapplers at bay
  kick:    'strike',    // strikers walk through kicks
  special: null
};

MMA.Combat.getRivalryPenalty = MMA.Combat.getRivalryPenalty || function(scene, moveType) {
  if (!scene) return 1.0;
  var enemies = scene.enemies || [];
  var alive = enemies.filter(function(e) { return e && e.active && e.hp > 0; });
  if (!alive.length) return 1.0;
  var enemy = alive[0];
  var enemyStyle = enemy.style || enemy.type;
  // Rough style mapping
  var styleMap = { boxer: 'strike', brawler: 'strike', kicker: 'kick', wrestler: 'grapple', feintMaster: 'special', drunkMonk: 'special' };
  var enemyStyleType = styleMap[enemyStyle] || 'strike';
  // Check if player's move type is the rival of enemy style
  var rivalOf = MMA.Combat.STYLE_RIVALRIES[moveType];
  if (rivalOf === enemyStyleType) {
    return 0.85; // Player in disadvantaged style vs this enemy
  }
  return 1.0;
};

// === CORNER DOMINATION SYSTEM ===
// Backing enemy into corner: +15% player damage, -10% enemy defense
MMA.Combat.getCornerDominationBonus = MMA.Combat.getCornerDominationBonus || function(scene, enemy) {
  if (!scene || !enemy) return { damageMult: 1.0, enemyDefMult: 1.0 };
  var CANVAS_W = (typeof CONFIG !== 'undefined' && CONFIG.CANVAS_W) ? CONFIG.CANVAS_W : 500;
  var CANVAS_H = (typeof CONFIG !== 'undefined' && CONFIG.CANVAS_H) ? CONFIG.CANVAS_H : 700;
  var MARGIN = 70;
  var cornered = (
    (enemy.x < MARGIN || enemy.x > CANVAS_W - MARGIN) &&
    (enemy.y < MARGIN + 80 || enemy.y > CANVAS_H - MARGIN)
  );
  if (!cornered) {
    enemy._cornerDominating = false;
    return { damageMult: 1.0, enemyDefMult: 1.0 };
  }
  enemy._cornerDominating = true;
  return { damageMult: 1.15, enemyDefMult: 0.90, label: '📐 CORNERED' };
};
// === TECHNIQUE BLOODLINE INHERITANCE ===
// After completing a full run (NG+), unlock permanent passive bonuses carried into next run
MMA.Combat.getBloodlineBonus = MMA.Combat.getBloodlineBonus || function(moveKey) {
  try {
    var ng = parseInt(localStorage.getItem('mma_ng_plus') || '0');
    if (ng <= 0) return 1.0;
    var inherited = JSON.parse(localStorage.getItem('mma_bloodline') || '{}');
    return inherited[moveKey] ? (1.0 + Math.min(ng * 0.05, 0.25)) : 1.0; // +5% per NG, max +25%
  } catch(e) { return 1.0; }
};

MMA.Combat.recordBloodlineMove = MMA.Combat.recordBloodlineMove || function(moveKey) {
  try {
    var inherited = JSON.parse(localStorage.getItem('mma_bloodline') || '{}');
    inherited[moveKey] = (inherited[moveKey] || 0) + 1;
    localStorage.setItem('mma_bloodline', JSON.stringify(inherited));
  } catch(e) {}
};

MMA.Combat.triggerNGPlus = MMA.Combat.triggerNGPlus || function(scene) {
  try {
    var ng = parseInt(localStorage.getItem('mma_ng_plus') || '0') + 1;
    localStorage.setItem('mma_ng_plus', ng);
    // Inherit top 3 most used moves as bloodline
    var rust = JSON.parse(localStorage.getItem('mma_technique_rust') || '{}');
    var sorted = Object.keys(rust).sort(function(a,b) { return (rust[b].uses||0)-(rust[a].uses||0); });
    var inherited = JSON.parse(localStorage.getItem('mma_bloodline') || '{}');
    sorted.slice(0,3).forEach(function(k) { inherited[k] = (inherited[k]||0) + 1; });
    localStorage.setItem('mma_bloodline', JSON.stringify(inherited));
    if (window.MMA && MMA.UI && typeof MMA.UI.queueAchievementToast === 'function') {
      MMA.UI.queueAchievementToast(scene, 'NG+ ' + ng + ' — BLOODLINE INHERITED', '🧬');
    }
  } catch(e) {}
};

// === PRE-FIGHT BETTING SYSTEM ===
// Player can wager gold before a fight; win pays 2x, lose forfeits wager
MMA.Combat._currentBet = 0;

MMA.Combat.placeBet = MMA.Combat.placeBet || function(scene, amount) {
  var p = scene && scene.player;
  if (!p || !p.stats) return false;
  var gold = p.stats.gold || 0;
  if (amount > gold) return false;
  p.stats.gold -= amount;
  MMA.Combat._currentBet = amount;
  if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
    MMA.UI.showDamageText(scene, p.x, p.y - 40, '🎰 BET: ' + amount + 'g', '#FFD700');
  }
  return true;
};

MMA.Combat.resolveBet = MMA.Combat.resolveBet || function(scene, won) {
  var p = scene && scene.player;
  if (!p || !p.stats || !MMA.Combat._currentBet) return;
  if (won) {
    var payout = MMA.Combat._currentBet * 2;
    p.stats.gold = (p.stats.gold || 0) + payout;
    if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
      MMA.UI.showDamageText(scene, p.x, p.y - 50, '💰 WON: +' + payout + 'g', '#00ff88');
    }
  } else {
    if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
      MMA.UI.showDamageText(scene, p.x, p.y - 50, '💸 LOST BET: -' + MMA.Combat._currentBet + 'g', '#ff4400');
    }
  }
  MMA.Combat._currentBet = 0;
};

// === WEATHER HAZARD ROOMS ===
// Rain/ice/heat affect movement and dodge
MMA.Combat.WEATHER_HAZARDS = {
  rain:  { dodgeMult: 0.80, label: '🌧️ Wet Floor', color: '#4488ff' },
  ice:   { dodgeMult: 0.65, speedMult: 0.85, label: '🧊 Icy Floor', color: '#aaddff' },
  heat:  { staminaDrain: 1.5, label: '🌡️ Extreme Heat', color: '#ff8800' },
  clear: { dodgeMult: 1.0, label: null }
};

MMA.Combat.getWeatherHazardDodgeMult = MMA.Combat.getWeatherHazardDodgeMult || function(scene) {
  var weather = scene && scene._roomWeather;
  if (!weather) return 1.0;
  var h = MMA.Combat.WEATHER_HAZARDS[weather];
  return (h && h.dodgeMult) ? h.dodgeMult : 1.0;
};

MMA.Combat.getWeatherHazardSpeedMult = MMA.Combat.getWeatherHazardSpeedMult || function(scene) {
  var weather = scene && scene._roomWeather;
  if (!weather) return 1.0;
  var h = MMA.Combat.WEATHER_HAZARDS[weather];
  return (h && h.speedMult) ? h.speedMult : 1.0;
};

MMA.Combat.applyWeatherHazard = MMA.Combat.applyWeatherHazard || function(scene, weatherType) {
  scene._roomWeather = weatherType;
  var h = MMA.Combat.WEATHER_HAZARDS[weatherType];
  if (h && h.label && window.MMA && MMA.UI && typeof MMA.UI.queueAchievementToast === 'function') {
    MMA.UI.queueAchievementToast(scene, h.label, '⚠️');
  }
};
// === OPPONENT FEAR MEMORY ===
// Enemies track which damage types hurt them most; after 3 hits develop flinch tell (+10% crit)
MMA.Combat.FEAR_MEMORY = MMA.Combat.FEAR_MEMORY || {};

MMA.Combat.recordFearHit = MMA.Combat.recordFearHit || function(enemy, moveKey) {
  if (!enemy || !enemy.id) return;
  var id = enemy.id || enemy.type && enemy.type.key || 'enemy';
  if (!MMA.Combat.FEAR_MEMORY[id]) MMA.Combat.FEAR_MEMORY[id] = {};
  MMA.Combat.FEAR_MEMORY[id][moveKey] = (MMA.Combat.FEAR_MEMORY[id][moveKey] || 0) + 1;
};

MMA.Combat.getFearCritBonus = MMA.Combat.getFearCritBonus || function(enemy, moveKey) {
  if (!enemy) return 1;
  var id = enemy.id || (enemy.type && enemy.type.key) || 'enemy';
  var mem = MMA.Combat.FEAR_MEMORY[id];
  if (!mem || (mem[moveKey] || 0) < 3) return 1;
  return 1.10; // +10% crit multiplier after 3+ hits of same type
};

MMA.Combat.hasFearTell = MMA.Combat.hasFearTell || function(enemy, moveKey) {
  if (!enemy) return false;
  var id = enemy.id || (enemy.type && enemy.type.key) || 'enemy';
  var mem = MMA.Combat.FEAR_MEMORY[id];
  return mem && (mem[moveKey] || 0) >= 3;
};

// === CROWD NOISE ACCURACY MODIFIER ===
// +50 hype = -8% enemy accuracy; silence = +5% enemy focus
MMA.Combat.getCrowdNoiseAccuracyMod = MMA.Combat.getCrowdNoiseAccuracyMod || function(scene) {
  var hype = 0;
  if (window.MMA && MMA.UI && typeof MMA.UI.getHype === 'function') {
    hype = MMA.UI.getHype(scene) || 0;
  } else if (scene && typeof scene._hype === 'number') {
    hype = scene._hype;
  }
  if (hype >= 50) return 0.92;  // -8% enemy accuracy
  if (hype <= 5)  return 1.05;  // +5% enemy focus (silence = lethal)
  return 1.0;
};

// === RING POSITION WARFARE ===
// Floor position bonuses: center=balanced, corner=+10% dmg, ropes=+15% grapple escape
MMA.Combat.RING_POSITIONS = {
  center: { label: 'CENTER', damageMult: 1.0,  grappleEscapeMult: 1.0,  desc: 'Balanced' },
  corner: { label: 'CORNER', damageMult: 1.10, grappleEscapeMult: 0.85, desc: '+10% DMG' },
  ropes:  { label: 'ROPES',  damageMult: 0.95, grappleEscapeMult: 1.15, desc: '+15% Escape' }
};

MMA.Combat.getRingPosition = MMA.Combat.getRingPosition || function(scene) {
  if (!scene || !scene.player) return 'center';
  var p = scene.player;
  var CANVAS_W = (typeof CONFIG !== 'undefined' && CONFIG.CANVAS_W) ? CONFIG.CANVAS_W : 500;
  var CANVAS_H = (typeof CONFIG !== 'undefined' && CONFIG.CANVAS_H) ? CONFIG.CANVAS_H : 700;
  var margin = 80;
  var inCorner = (p.x < margin || p.x > CANVAS_W - margin) && (p.y < margin || p.y > CANVAS_H - margin);
  var onRopes  = (p.x < margin || p.x > CANVAS_W - margin) || (p.y < margin || p.y > CANVAS_H - margin);
  if (inCorner) return 'corner';
  if (onRopes)  return 'ropes';
  return 'center';
};

MMA.Combat.getRingPositionDamageMult = MMA.Combat.getRingPositionDamageMult || function(scene) {
  var pos = MMA.Combat.getRingPosition(scene);
  return (MMA.Combat.RING_POSITIONS[pos] || MMA.Combat.RING_POSITIONS.center).damageMult;
};

MMA.Combat.getRingPositionGrappleMult = MMA.Combat.getRingPositionGrappleMult || function(scene) {
  var pos = MMA.Combat.getRingPosition(scene);
  return (MMA.Combat.RING_POSITIONS[pos] || MMA.Combat.RING_POSITIONS.center).grappleEscapeMult;
};

// === MUTATION SYSTEM ===
// 5% chance a repeated move mutates — altered dmg/stamina/koPower for current fight only
MMA.Combat.MUTATION_CHANCE = 0.05;
MMA.Combat._activeMutations = {};

MMA.Combat.tryMutateMove = MMA.Combat.tryMutateMove || function(scene, moveKey, useCount) {
  if (useCount < 3) return null; // Only after 3+ uses in same fight
  if (Math.random() > MMA.Combat.MUTATION_CHANCE) return null;
  if (MMA.Combat._activeMutations[moveKey]) return MMA.Combat._activeMutations[moveKey]; // already mutated

  var mutations = [
    { type: 'power',   damageMult: 1.30, staminaMult: 1.20, label: '💥 MUTATED: POWER', color: '#ff4400' },
    { type: 'swift',   damageMult: 0.85, staminaMult: 0.60, label: '⚡ MUTATED: SWIFT',  color: '#44aaff' },
    { type: 'drain',   damageMult: 1.10, staminaDrain: 15,  label: '🩸 MUTATED: DRAIN',  color: '#aa00ff' },
    { type: 'ko',      damageMult: 1.05, koPowerMult: 1.50, label: '💀 MUTATED: KO',     color: '#ff0000' }
  ];
  var mut = mutations[Math.floor(Math.random() * mutations.length)];
  MMA.Combat._activeMutations[moveKey] = mut;

  if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function' && scene && scene.player) {
    MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 55, mut.label, mut.color);
  }
  return mut;
};

MMA.Combat.getMutationDamageMult = MMA.Combat.getMutationDamageMult || function(moveKey) {
  var mut = MMA.Combat._activeMutations[moveKey];
  return (mut && mut.damageMult) ? mut.damageMult : 1;
};

MMA.Combat.clearMutations = MMA.Combat.clearMutations || function() {
  MMA.Combat._activeMutations = {};
};

// === HANDLE INPUT REFACTOR ===
// Splits the 151-line handleInput into focused sub-functions for maintainability.
// Does NOT change behavior — purely structural decomposition.

MMA.Combat._applyMovement = MMA.Combat._applyMovement || function(scene, keys, player) {
  if (!player || !player.setVelocity) return;
  var speed = (player.stats && player.stats.speed) || 120;
  // Apply arena speed mult if set
  if (player._arenaSpeedMult) speed *= player._arenaSpeedMult;
  // Apply trophy speed penalty if any
  if (window.MMA && MMA.Items && typeof MMA.Items.getTrophySpeedPenalty === 'function') {
    speed *= MMA.Items.getTrophySpeedPenalty();
  }
  var vx = 0, vy = 0;
  if (keys.left  && keys.left.isDown)  vx = -speed;
  if (keys.right && keys.right.isDown) vx =  speed;
  if (keys.up    && keys.up.isDown)    vy = -speed;
  if (keys.down  && keys.down.isDown)  vy =  speed;
  // Also check cursor keys if available
  if (scene.cursors) {
    if (scene.cursors.left.isDown)  vx = -speed;
    if (scene.cursors.right.isDown) vx =  speed;
    if (scene.cursors.up.isDown)    vy = -speed;
    if (scene.cursors.down.isDown)  vy =  speed;
  }
  player.setVelocity(vx, vy);
};

MMA.Combat._routeActionKey = MMA.Combat._routeActionKey || function(scene, actionName) {
  if (!actionName || scene.gameOver) return;
  var inGround = scene.groundState && scene.groundState.active;
  if (inGround) {
    // Ground state routing
    var groundMap = {
      jab: 'gnp', heavy: 'gnp', hook: 'gnp', uppercut: 'gnp',
      headKick: 'gnp', bodyShot: 'gnp', lowKick: 'gnp',
      cross: 'elbow', grapple: 'submission', takedown: 'submission',
      guillotine: 'submission', special: 'improve', standup: 'standup'
    };
    var groundAction = groundMap[actionName] || actionName;
    if (typeof MMA.Combat.executeGroundMove === 'function') {
      MMA.Combat.executeGroundMove(scene, groundAction);
    }
  } else {
    // Standing routing
    if (typeof MMA.Combat.executeAttack === 'function') {
      MMA.Combat.executeAttack(scene, actionName);
    }
  }
};

MMA.Combat._dispatchNetworkSync = MMA.Combat._dispatchNetworkSync || function(scene, actionName) {
  if (!scene || !scene.networkMode) return;
  if (window.MMA && MMA.Network && typeof MMA.Network.sendAction === 'function') {
    MMA.Network.sendAction(scene, actionName);
  }
};

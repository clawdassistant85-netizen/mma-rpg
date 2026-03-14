window.MMA = window.MMA || {};
window.MMA.Combat = {
  CRIT_CHANCE: 0.15,
  COMBO_WINDOW_MS: 1400,
  COMBO_CHAIN: ['jab', 'cross', 'hook'],
  COMBO_FINISHER_MULTIPLIER: 1.8,
  PRESSURE_PER_HIT: 25,
  PRESSURE_THRESHOLD: 100,
  PRESSURE_BREAK_MULTIPLIER: 2.5,
  MOMENTUM_MAX_STACKS: 5,
  MOMENTUM_DAMAGE_PER_STACK: 0.05,
  MOMENTUM_CRIT_PER_STACK: 0.02,
  MOMENTUM_SURGE_DAMAGE_MULTIPLIER: 1.5,
  STAMINA_BREAK_DAMAGE_MULTIPLIER: 1.5,
  STAMINA_BREAK_DURATION_MS: 2000,
  ENEMY_STAMINA_BASE_MULTIPLIER: 0.6,
  ENEMY_STAMINA_MIN: 30,
  STUN_CHAIN_HITS: 5,
  STUN_DURATION_MS: 1000,
  TAUNT_STAMINA_COST: 6,
  TAUNT_COOLDOWN_MS: 1200,
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
  EXPLOIT_RECOVERY_WINDOW_MS: 400,
  EXPLOIT_RECOVERY_DAMAGE_MULTIPLIER: 1.3,
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
  RECOVERY_TECH_STAMINA_COST: 15,
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
  TRANSITION_CANCEL_STAMINA_PENALTY_PCT: 0.2,
  TRANSITION_CANCEL_COOLDOWN_REDUCTION_PCT: 0.45,
  SHADOW_CLONE_MIRROR_MULTIPLIER: 0.5,
  SHADOW_CLONE_MIN_DAMAGE: 6,
  BREATHING_EXERTION_WINDOW_MS: 2600,
  BREATHING_EXERTION_THRESHOLD: 5,
  BREATHING_WINDED_DURATION_MS: 5000,
  BREATHING_REGEN_MULTIPLIER: 0.5,
  BREATHING_TECHNIQUE_HOLD_MS: 2000,
  INJURY_MAX_STACKS: 4,
  INJURY_ARM_DAMAGE_BONUS_PER_STACK: 0.03,
  INJURY_LEG_DAMAGE_BONUS_PER_STACK: 0.04,
  INJURY_BODY_DAMAGE_BONUS_PER_STACK: 0.06,
  INJURY_TEXT_COLORS: {
    arm: '#ffb703',
    leg: '#8ecae6',
    body: '#fb8500'
  },
  TAKEDOWN_BASE_CHANCE: {
    grappler: 0.8,
    balanced: 0.5,
    striker: 0.3
  },
  GROUND_MOVES: {
    jab: { name: 'Ground & Pound', damage: 22, staminaCost: 8, cooldown: 500 },
    cross: { name: 'Elbow', damage: 32, staminaCost: 18, cooldown: 900 },
    takedown: { name: 'Submission Attempt', staminaCost: 22, cooldown: 1200 },
    special: { name: 'Improve Position', staminaCost: 10, cooldown: 800 }
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
  getExploitRecoveryState: function(scene) {
    scene.player.exploitRecoveryState = scene.player.exploitRecoveryState || { consumedAtDodge: 0 };
    return scene.player.exploitRecoveryState;
  },
  applyExploitRecoveryIfActive: function(scene, damage) {
    var lastDodgeAt = this.getLastDodgeTimestamp(scene);
    if (!lastDodgeAt) return { damage: damage, active: false };
    var now = scene.time.now;
    if (now - lastDodgeAt > this.EXPLOIT_RECOVERY_WINDOW_MS) return { damage: damage, active: false };

    var state = this.getExploitRecoveryState(scene);
    if (state.consumedAtDodge === lastDodgeAt) return { damage: damage, active: false };

    state.consumedAtDodge = lastDodgeAt;
    return {
      damage: Math.round(damage * this.EXPLOIT_RECOVERY_DAMAGE_MULTIPLIER),
      active: true
    };
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
  ensureEnemyStaminaState: function(enemy) {
    enemy.combatState = enemy.combatState || {};
    if (!enemy.combatState.staminaState) {
      var hpSeed = enemy && enemy.stats && typeof enemy.stats.maxHp === 'number' ? enemy.stats.maxHp : (enemy && enemy.stats && typeof enemy.stats.hp === 'number' ? enemy.stats.hp : 60);
      var maxStamina = Math.max(this.ENEMY_STAMINA_MIN, Math.round(hpSeed * this.ENEMY_STAMINA_BASE_MULTIPLIER));
      enemy.combatState.staminaState = { stamina: maxStamina, maxStamina: maxStamina, breakUntil: 0 };
    }
    return enemy.combatState.staminaState;
  },
  onEnemyStaminaHit: function(scene, enemy, move) {
    if (!enemy) return { brokeNow: false, inBreak: false };
    var state = this.ensureEnemyStaminaState(enemy);
    var now = scene.time.now;
    var staminaDamage = Math.max(4, Math.round((move && move.staminaCost ? move.staminaCost : 8) * 1.1));
    state.stamina = Math.max(0, state.stamina - staminaDamage);
    if (state.stamina <= 0 && now >= state.breakUntil) {
      state.breakUntil = now + this.STAMINA_BREAK_DURATION_MS;
      state.stamina = state.maxStamina;
      enemy.staggerTimer = Math.max(enemy.staggerTimer || 0, this.STAMINA_BREAK_DURATION_MS);
      enemy.state = 'staggered';
      return { brokeNow: true, inBreak: true };
    }
    return { brokeNow: false, inBreak: now < state.breakUntil };
  },
  applyStaminaBreakIfActive: function(scene, enemy, damage) {
    if (!enemy) return { damage: damage, staminaBreakActive: false };
    var state = this.ensureEnemyStaminaState(enemy);
    if (scene.time.now >= state.breakUntil) return { damage: damage, staminaBreakActive: false };
    return {
      damage: Math.round(damage * this.STAMINA_BREAK_DAMAGE_MULTIPLIER),
      staminaBreakActive: true
    };
  },
  getPlayerGrappleStyle: function(scene) {
    var cardStyle = MMA.UI && MMA.UI.fighterCard ? MMA.UI.fighterCard.style : null;
    var style = (scene.player && scene.player.dominantStyle) || (scene.player && scene.player.stats && scene.player.stats.dominantStyle) || cardStyle || 'balanced';
    style = (style || '').toLowerCase();
    if (style !== 'grappler' && style !== 'striker') style = 'balanced';
    return style;
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
  resolveTakedownAttempt: function(scene, enemy) {
    var style = this.getPlayerGrappleStyle(scene);
    var baseChance = this.TAKEDOWN_BASE_CHANCE[style] || 0.5;
    var defense = enemy && enemy.type && typeof enemy.type.groundDefense === 'number' ? enemy.type.groundDefense : 0.2;
    var chance = Phaser.Math.Clamp(baseChance - (defense * 0.55), 0.1, 0.95);
    return Math.random() < chance;
  },
  // Get submissions available for a given ground position
  getSubmissionsForPosition: function(scene, position) {
    var unlockedSubs = [];
    if (scene && scene.player && scene.player.unlockedSubmissions) {
      unlockedSubs = scene.player.unlockedSubmissions;
    } else {
      unlockedSubs = ['rnc']; // default
    }
    
    // Position-based submission availability
    var positionSubs = {
      fullGuard: ['rnc', 'triangleChoke', 'armbar', 'guillotine'],
      halfGuard: ['kimura', 'americana'],
      sideControl: ['americana', 'kimura'],
      mount: ['armbar', 'americana', 'rnc'],
      backControl: ['rnc', 'kimura', 'americana']
    };
    
    var allowed = positionSubs[position] || positionSubs.fullGuard;
    
    // Return only unlocked submissions that are valid for this position
    return allowed.filter(function(sub) {
      return unlockedSubs.indexOf(sub) !== -1;
    });
  },
  // Try to improve ground position
  tryImprovePosition: function(scene, currentPosition) {
    var s = scene.player.stats;
    var skillLevel = s.grapplingLevel || 1;
    
    // Position improvement paths
    var improvePaths = {
      fullGuard: { halfGuard: 0.5, backControl: 0.25 },
      halfGuard: { sideControl: 0.4, fullGuard: 0.3 },
      sideControl: { mount: 0.35, halfGuard: 0.3 },
      mount: { backControl: 0.4 },
      backControl: { mount: 0.3 }
    };
    
    var paths = improvePaths[currentPosition] || {};
    var possiblePositions = Object.keys(paths);
    
    if (possiblePositions.length === 0) return false;
    
    // Higher skill = better chance
    var skillBonus = Math.min(0.3, (skillLevel - 1) * 0.05);
    
    // Try each possible position in order of preference
    for (var i = 0; i < possiblePositions.length; i++) {
      var newPos = possiblePositions[i];
      var chance = (paths[newPos] || 0.2) + skillBonus;
      
      if (Math.random() < chance) {
        scene.groundState.position = newPos;
        return true;
      }
    }
    
    // Failed to improve - small chance to at least transition to a worse position
    if (Math.random() < 0.15) {
      var fallback = { fullGuard: 'halfGuard', halfGuard: 'fullGuard', sideControl: 'halfGuard', mount: 'sideControl', backControl: 'mount' };
      if (fallback[currentPosition]) {
        scene.groundState.position = fallback[currentPosition];
        return true;
      }
    }
    
    return false;
  },
  // Show filtered submission picker based on position
  showSubmissionPickerFiltered: function(scene, validSubs) {
    if (scene.groundState.submissionPickerShown) return;
    scene.groundState.submissionPickerShown = true;
    
    var enemy = scene.groundState.enemy;
    
    // Show prompt
    MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 60, 'SELECT SUBMISSION', '#ff66ff');
    
    // Set up for next input to select submission
    scene.groundState.waitingForSubmission = true;
    scene.groundState.showingSubmissionPicker = true;
  },
  executeGroundMove: function(scene, moveKey) {
    if (!scene.groundState || !scene.groundState.active || scene.gameOver) return;
    var map = { heavy: 'cross', grapple: 'takedown' };
    moveKey = map[moveKey] || moveKey;
    
    // Handle stand up from the new standup button
    if (moveKey === 'standup') {
      var position = scene.groundState.position || 'fullGuard';
      // Can only stand up from full guard or half guard
      if (position === 'fullGuard' || position === 'halfGuard') {
        return scene.endGroundState('player-standup');
      }
      return;
    }
    
    // Handle position improvement (special button on ground)
    if (moveKey === 'special') {
      var pos = scene.groundState.position || 'fullGuard';
      var improveSuccess = this.tryImprovePosition(scene, pos);
      if (improveSuccess) {
        // Show position change
        var newPos = scene.groundState.position;
        var posNames = { fullGuard: 'HALF GUARD', halfGuard: 'SIDE CONTROL', sideControl: 'MOUNT', mount: 'MOUNT', backControl: 'BACK CONTROL' };
        MMA.UI.showGroundBanner(posNames[newPos] || 'POSITION UP!');
      }
      // Update UI to show new position
      MMA.UI.setActionButtonLabels(true, scene);
      MMA.UI.updateGroundHUD(scene);
      return;
    }
    
    // Handle submission selection - show submission picker if not already showing
    if (moveKey === 'takedown') {
      // Check if we have unlock submissions - show the submission picker
      var position = scene.groundState.position || 'fullGuard';
      var posSubs = this.getSubmissionsForPosition(scene, position);
      
      if (posSubs.length === 0) {
        // No submissions available for this position, try to improve position instead
        MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 60, 'NO SUBS! IMPROVE POSITION', '#ffaa33');
        return;
      }
      
      // Filter unlocked submissions to only those valid for current position
      var unlockedSubs = scene.player.unlockedSubmissions || ['rnc'];
      var validSubs = posSubs.filter(function(sub) { return unlockedSubs.indexOf(sub) !== -1; });
      
      if (validSubs.length === 0) {
        MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 60, 'NO SUBS FOR POS!', '#ffaa33');
        return;
      }
      
      if (!scene.groundState.showingSubmissionPicker) {
        this.showSubmissionPickerFiltered(scene, validSubs);
        return;
      }
      // If picker was shown and user selected, execute that submission
      var selectedSub = scene.groundState.selectedSubmission;
      if (selectedSub && validSubs.indexOf(selectedSub) !== -1) {
        var subMove = this.MOVE_ROSTER[selectedSub];
        if (subMove) {
          this.executeSubmission(scene, selectedSub, subMove);
        }
        scene.groundState.selectedSubmission = null;
        scene.groundState.showingSubmissionPicker = false;
        return;
      }
      return;
    }
    
    var gm = this.GROUND_MOVES[moveKey];
    if (!gm) return;
    var cdKey = 'ground_' + moveKey;
    var s = scene.player.stats;
    if (!scene.player.cooldowns[cdKey]) scene.player.cooldowns[cdKey] = 0;
    if (scene.player.cooldowns[cdKey] > 0 || s.stamina < gm.staminaCost) return;
    s.stamina -= gm.staminaCost;
    this.registerBreathingExertion(scene, 1);
    scene.player.cooldowns[cdKey] = gm.cooldown;
    var enemy = scene.groundState.enemy;
    if (!enemy || !enemy.active || enemy.state === 'dead') return scene.endGroundState('enemy-dead');

    var dmg = gm.damage + (scene.player.attackBonus || 0);
    enemy.stats.hp -= dmg;
    // Health Bar Damage Trail: record damage for visual effect
    if (MMA.Enemies.recordDamageTrail) MMA.Enemies.recordDamageTrail(enemy, dmg);
    MMA.UI.recordHitDealt(dmg, false, 1);
    MMA.UI.recordMoveUsage(moveKey, scene); // Track move for Style DNA
    MMA.Player.awardStyleXP(scene, moveKey); // Award style XP
    MMA.UI.showDamageText(scene, enemy.x, enemy.y - 20, '-' + dmg, '#ffd54f');
    MMA.VFX.flashEnemyHit(scene, enemy, 90);
    if (enemy.stats.hp <= 0) {
      MMA.Enemies.killEnemy(scene, enemy);
      scene.endGroundState('enemy-dead');
    }
  },
  // Show submission picker UI when on ground
  showSubmissionPicker: function(scene) {
    // Only show if not already showing
    if (scene.groundState.submissionPickerShown) return;
    scene.groundState.submissionPickerShown = true;
    
    var unlockedSubs = scene.player.unlockedSubmissions || ['rnc'];
    var roster = this.MOVE_ROSTER;
    var enemy = scene.groundState.enemy;
    
    // Calculate submission chance based on enemy defense and submission difficulty
    // Higher ground defense = harder to submit
    var enemyDefense = enemy && enemy.type ? (enemy.type.groundDefense || 0.2) : 0.2;
    
    // Show UI text for submissions available
    var W = scene.cameras.main.width;
    var H = scene.cameras.main.height;
    
    // Show prompt
    MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 60, 'SELECT SUBMISSION', '#ff66ff');
    
    // Set up for next input to select submission
    scene.groundState.waitingForSubmission = true;
    scene.groundState.showingSubmissionPicker = true;
  },
  getInjuryTargetForMove: function(moveKey) {
    var armMoves = {
      jab: true,
      cross: true,
      hook: true,
      uppercut: true,
      spinningBackFist: true,
      kimura: true,
      americana: true,
      armbar: true
    };
    var legMoves = {
      lowKick: true,
      headKick: true,
      heelHook: true,
      kneebar: true,
      singleLeg: true
    };
    var bodyMoves = {
      bodyShot: true,
      guillotine: true,
      triangleChoke: true,
      rnc: true,
      takedown: true
    };
    if (armMoves[moveKey]) return 'arm';
    if (legMoves[moveKey]) return 'leg';
    if (bodyMoves[moveKey]) return 'body';
    return null;
  },
  ensureInjuryState: function(enemy) {
    if (!enemy) return null;
    enemy.combatState = enemy.combatState || {};
    enemy.combatState.injuryState = enemy.combatState.injuryState || {
      arm: 0,
      leg: 0,
      body: 0,
      lastAppliedAt: 0
    };
    return enemy.combatState.injuryState;
  },
  applyLimbInjuryOnHit: function(scene, enemy, moveKey) {
    var target = this.getInjuryTargetForMove(moveKey);
    if (!target || !enemy || !enemy.active || enemy.state === 'dead') return null;

    var state = this.ensureInjuryState(enemy);
    if (!state) return null;

    state[target] = Math.min(this.INJURY_MAX_STACKS, (state[target] || 0) + 1);
    state.lastAppliedAt = scene.time.now;

    var label = target.toUpperCase() + ' INJURY x' + state[target];
    MMA.UI.showDamageText(scene, enemy.x, enemy.y - 146, label, this.INJURY_TEXT_COLORS[target] || '#ffffff');
    return state;
  },
  applyInjuryDamageBonus: function(enemy, damage) {
    var state = this.ensureInjuryState(enemy);
    if (!state) return { damage: damage, bonusPct: 0 };
    var bonusPct =
      (state.arm || 0) * this.INJURY_ARM_DAMAGE_BONUS_PER_STACK +
      (state.leg || 0) * this.INJURY_LEG_DAMAGE_BONUS_PER_STACK +
      (state.body || 0) * this.INJURY_BODY_DAMAGE_BONUS_PER_STACK;

    if (bonusPct <= 0) return { damage: damage, bonusPct: 0 };
    return {
      damage: Math.round(damage * (1 + bonusPct)),
      bonusPct: bonusPct
    };
  },
  // Execute a specific submission
  executeSubmission: function(scene, subKey, subMove) {
    var enemy = scene.groundState.enemy;
    if (!enemy || !enemy.active || enemy.state === 'dead') return scene.endGroundState('enemy-dead');
    
    var s = scene.player.stats;
    var staminaCost = subMove.staminaCost || 20;
    
    if (s.stamina < staminaCost) {
      MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 40, 'LOW STAMINA!', '#ff4444');
      return;
    }
    
    s.stamina -= staminaCost;
    this.registerBreathingExertion(scene, 1);
    
    // Calculate submission success chance based on:
    // - Enemy ground defense
    // - Submission difficulty (base chance varies by sub)
    // - Player's submission level
    var baseChances = {
      rnc: 0.45,
      guillotine: 0.40,
      armbar: 0.35,
      triangleChoke: 0.30,
      kimura: 0.35,
      americana: 0.30,
      heelHook: 0.25,
      kneebar: 0.28
    };
    
    var enemyDefense = enemy && enemy.type ? (enemy.type.groundDefense || 0.2) : 0.2;
    var subLevel = s.submissionLevel || 1;
    var baseChance = baseChances[subKey] || 0.3;
    
    // Bonus from submission level
    var levelBonus = (subLevel - 1) * 0.03;
    
    // Final chance
    var successChance = Phaser.Math.Clamp(baseChance + levelBonus - (enemyDefense * 0.4), 0.1, 0.75);
    
    if (Math.random() < successChance) {
      // Submission successful!
      var baseSubDamage = subMove.damage || 30;
      this.applyLimbInjuryOnHit(scene, enemy, subKey);
      var injuryAdjusted = this.applyInjuryDamageBonus(enemy, baseSubDamage);
      var dmg = injuryAdjusted.damage;
      enemy.stats.hp -= dmg;
      // Health Bar Damage Trail: record damage for visual effect
      if (MMA.Enemies.recordDamageTrail) MMA.Enemies.recordDamageTrail(enemy, dmg);
      // Track swarm damage for split detection
      if (MMA.Enemies.recordSwarmDamage) {
        MMA.Enemies.recordSwarmDamage(enemy, dmg);
      }
      MMA.UI.recordHitDealt(dmg, false, 1);
      MMA.Player.awardStyleXP(scene, subKey);
      MMA.UI.recordMoveUsage(subKey, scene);
      MMA.UI.showDamageText(scene, enemy.x, enemy.y - 36, subMove.name + '!', '#ff66ff');
      MMA.UI.showDamageText(scene, enemy.x, enemy.y - 54, 'SUBMISSION!', '#ff00ff');
      if (injuryAdjusted.bonusPct > 0) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 72, 'INJURY +' + Math.round(injuryAdjusted.bonusPct * 100) + '%', '#ffd166');
      MMA.VFX.flashEnemyHit(scene, enemy, 150);
      
      if (enemy.stats.hp <= 0) {
        MMA.Enemies.killEnemy(scene, enemy);
        scene.endGroundState('submission');
      }
    } else {
      // Failed - enemy escapes
      MMA.UI.showDamageText(scene, enemy.x, enemy.y - 24, 'ESCAPED!', '#ffaa66');
      // Small damage from failed attempt
      enemy.stats.hp -= 5;
      // Health Bar Damage Trail: record damage for visual effect
      if (MMA.Enemies.recordDamageTrail) MMA.Enemies.recordDamageTrail(enemy, 5);
      if (enemy.stats.hp <= 0) {
        MMA.Enemies.killEnemy(scene, enemy);
        scene.endGroundState('enemy-dead');
      }
    }
  },
  getEnemyMirrorSourceDamage: function(enemy) {
    if (!enemy) return this.SHADOW_CLONE_MIN_DAMAGE;
    var candidates = [
      enemy.lastAttackDamage,
      enemy.lastDamageDealt,
      enemy.combatState && enemy.combatState.lastAttackDamage,
      enemy.combatState && enemy.combatState.lastMoveDamage,
      enemy.type && enemy.type.attackDamage,
      enemy.type && enemy.type.damage
    ];
    for (var i = 0; i < candidates.length; i++) {
      var value = candidates[i];
      if (typeof value === 'number' && isFinite(value) && value > 0) return value;
    }
    return this.SHADOW_CLONE_MIN_DAMAGE;
  },
  applyShadowCloneMirror: function(scene, enemy, triggerActive) {
    if (!triggerActive || !enemy || !enemy.active || enemy.state === 'dead') {
      return { mirrorDamage: 0, triggered: false };
    }
    var sourceDamage = this.getEnemyMirrorSourceDamage(enemy);
    var mirrorDamage = Math.max(this.SHADOW_CLONE_MIN_DAMAGE, Math.round(sourceDamage * this.SHADOW_CLONE_MIRROR_MULTIPLIER));
    enemy.stats.hp -= mirrorDamage;
    MMA.UI.showDamageText(scene, enemy.x, enemy.y - 192, 'SHADOW CLONE!', '#ff4d6d');
    MMA.UI.showDamageText(scene, enemy.x, enemy.y - 210, 'MIRROR -' + mirrorDamage, '#ff8fa3');
    MMA.VFX.flashEnemyHit(scene, enemy, 120);
    return { mirrorDamage: mirrorDamage, triggered: true };
  },
  MOVE_ROSTER: {
    // Starting moves
    jab:{ name:'Jab', type:'strike', damage:8, staminaCost:5, cooldown:400, unlockLevel:1, unlockType:'start' },
    cross:{ name:'Cross', type:'strike', damage:12, staminaCost:8, cooldown:600, unlockLevel:1, unlockType:'start' },
    // Level 2 (Striking)
    hook:{ name:'Hook', type:'strike', damage:15, staminaCost:10, cooldown:800, unlockLevel:2, unlockType:'level' },
    lowKick:{ name:'Low Kick', type:'strike', damage:10, staminaCost:7, cooldown:600, unlockLevel:2, unlockType:'level' },
    // Level 3 (Striking + Grappling)
    uppercut:{ name:'Uppercut', type:'strike', damage:18, staminaCost:12, cooldown:900, unlockLevel:3, unlockType:'level' },
    takedown:{ name:'Takedown', type:'grapple', damage:5, staminaCost:20, cooldown:1200, unlockLevel:1, unlockType:'start' },
    // Level 4 (Striking + Grappling)
    bodyShot:{ name:'Body Shot', type:'strike', damage:20, staminaCost:14, cooldown:850, unlockLevel:4, unlockType:'level' },
    guardPass:{ name:'Guard Pass', type:'grapple', damage:10, staminaCost:12, cooldown:1000, unlockLevel:4, unlockType:'level' },
    // Level 5 (Striking + Grappling)
    headKick:{ name:'Head Kick', type:'strike', damage:25, staminaCost:18, cooldown:1000, unlockLevel:5, unlockType:'level' },
    guillotine:{ name:'Guillotine', type:'sub', damage:25, staminaCost:18, cooldown:1500, unlockLevel:5, unlockType:'level' },
    mountCtrl:{ name:'Mount Control', type:'grapple', damage:0, staminaCost:8, cooldown:800, unlockLevel:5, unlockType:'level' },
    // Level 6 (Submissions)
    rnc:{ name:'RNC', type:'sub', damage:35, staminaCost:25, cooldown:2000, unlockLevel:6, unlockType:'level' },
    kimura:{ name:'Kimura', type:'sub', damage:27, staminaCost:20, cooldown:1800, unlockLevel:6, unlockType:'level' },
    // Level 7 (Striking)
    spinningBackFist:{ name:'Spinning Back Fist', type:'strike', damage:30, staminaCost:20, cooldown:1200, unlockLevel:7, unlockType:'level' },
    // New submissions (unlocked via style-based leveling)
    americana:{ name:'Americana', type:'sub', damage:28, staminaCost:20, cooldown:1700, unlockLevel:5, unlockType:'style' },
    heelHook:{ name:'Heel Hook', type:'sub', damage:32, staminaCost:24, cooldown:1900, unlockLevel:6, unlockType:'style' },
    kneebar:{ name:'Kneebar', type:'sub', damage:30, staminaCost:22, cooldown:1800, unlockLevel:7, unlockType:'style' },
    // Enemy-only moves
    elbowStrike:{ name:'Elbow Strike', type:'strike', damage:22, staminaCost:15, cooldown:900, unlockLevel:99, unlockType:'enemy', fromEnemy:'muayThaiFighter' },
    kneeStrike:{ name:'Knee Strike', type:'strike', damage:20, staminaCost:14, cooldown:850, unlockLevel:99, unlockType:'enemy', fromEnemy:'muayThaiFighter' },
    singleLeg:{ name:'Single Leg', type:'grapple', damage:5, staminaCost:15, cooldown:1100, unlockLevel:99, unlockType:'enemy', fromEnemy:'wrestler' },
    hipThrow:{ name:'Hip Throw', type:'grapple', damage:18, staminaCost:18, cooldown:1000, unlockLevel:99, unlockType:'enemy', fromEnemy:'judoka' },
    armbar:{ name:'Armbar', type:'sub', damage:30, staminaCost:22, cooldown:1800, unlockLevel:99, unlockType:'enemy', fromEnemy:'bjjBlackBelt' },
    triangleChoke:{ name:'Triangle Choke', type:'sub', damage:28, staminaCost:20, cooldown:1700, unlockLevel:99, unlockType:'enemy', fromEnemy:'bjjBlackBelt' }
  },
  ensureFocusState: function(scene) {
    scene.player.focusState = scene.player.focusState || { meter: 0 };
    return scene.player.focusState;
  },
  gainFocus: function(scene, amount) {
    var focus = this.ensureFocusState(scene);
    var prev = focus.meter;
    focus.meter = Math.min(this.FOCUS_MAX, focus.meter + Math.max(0, amount || 0));
    if (focus.meter !== prev) {
      MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 72, 'FOCUS +' + (focus.meter - prev), '#66e6ff');
    }
    if (focus.meter >= this.FOCUS_MAX && prev < this.FOCUS_MAX) {
      MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 90, 'FOCUS MAX!', '#33ccff');
    }
    // Update Focus Meter UI
    MMA.UI.updateFocusMeter(scene, focus.meter, this.FOCUS_MAX);
    return focus;
  },
  ensureIntuitionState: function(scene) {
    scene.player.intuitionState = scene.player.intuitionState || { targetKey: null, engagedAt: 0, meter: 0, ready: false };
    return scene.player.intuitionState;
  },
  getEnemyIntuitionKey: function(enemy) {
    if (!enemy) return null;
    enemy.combatState = enemy.combatState || {};
    if (!enemy.combatState.intuitionKey) {
      window.MMA._intuitionEnemySeq = (window.MMA._intuitionEnemySeq || 0) + 1;
      enemy.combatState.intuitionKey = 'enemy-' + window.MMA._intuitionEnemySeq;
    }
    return enemy.combatState.intuitionKey;
  },
  onIntuitionEngage: function(scene, enemy) {
    var state = this.ensureIntuitionState(scene);
    var now = scene.time.now;
    var key = this.getEnemyIntuitionKey(enemy);
    if (!key) return state;
    if (state.targetKey !== key) {
      state.targetKey = key;
      state.engagedAt = now;
      state.meter = 0;
      state.ready = false;
      return state;
    }
    var elapsed = Math.max(0, now - state.engagedAt);
    state.meter = Math.min(100, Math.round((elapsed / this.INTUITION_BUILD_MS) * 100));
    if (!state.ready && elapsed >= this.INTUITION_BUILD_MS) {
      state.ready = true;
      MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 92, 'FLOW STATE READY!', '#9dff9d');
    }
    return state;
  },
  consumeIntuition: function(scene) {
    var state = this.ensureIntuitionState(scene);
    state.ready = false;
    state.meter = 0;
    state.engagedAt = scene.time.now;
    return state;
  },
  isIntuitionPerfectCounterReady: function(scene) {
    var state = this.ensureIntuitionState(scene);
    return !!state.ready;
  },
  applyTauntDebuffIfActive: function(scene, enemy, damage) {
    if (!enemy) return damage;
    enemy.combatState = enemy.combatState || {};
    if (scene.time.now < (enemy.combatState.tauntDebuffUntil || 0)) {
      return Math.round(damage * this.TAUNT_DEBUFF_MULTIPLIER);
    }
    return damage;
  },
  ensureRageState: function(enemy) {
    if (!enemy) return null;
    enemy.combatState = enemy.combatState || {};
    enemy.combatState.rageState = enemy.combatState.rageState || { active: false };
    return enemy.combatState.rageState;
  },
  maybeTriggerRageMode: function(scene, enemy) {
    if (!enemy || !enemy.active || enemy.state === 'dead' || !enemy.stats) return false;
    var rage = this.ensureRageState(enemy);
    this.refreshRageState(scene, enemy);
    if (rage.active) return false;

    enemy.combatState = enemy.combatState || {};
    if (!enemy.combatState.firstSeenAt) enemy.combatState.firstSeenAt = scene.time.now;

    var maxHp = enemy.stats.maxHp || enemy.stats.hp || 1;
    var threshold = Math.max(1, Math.round(maxHp * this.RAGE_MODE_TRIGGER_HP_PCT));
    if (enemy.stats.hp > threshold) return false;

    var elapsed = scene.time.now - enemy.combatState.firstSeenAt;
    var isEarlyWindow = elapsed <= this.SECOND_WIND_EARLY_WINDOW_MS;
    var isCritical = enemy.stats.hp <= Math.max(1, Math.round(maxHp * this.SECOND_WIND_CRITICAL_HP_PCT));
    var hasEarlyBonus = isEarlyWindow && isCritical;

    var duration = this.RAGE_MODE_DURATION_MS;
    if (hasEarlyBonus) {
      duration = Math.round(duration * (1 + this.SECOND_WIND_EARLY_DURATION_BONUS));
      enemy.stats.hp = Math.min(maxHp, enemy.stats.hp + this.SECOND_WIND_EARLY_HEAL);
      MMA.UI.showDamageText(scene, enemy.x, enemy.y - 144, 'EARLY WARNING!', '#ffd166');
      MMA.UI.showDamageText(scene, enemy.x, enemy.y - 162, '+' + this.SECOND_WIND_EARLY_HEAL + ' HP', '#7cffb2');
    }

    rage.active = true;
    rage.activeUntil = scene.time.now + duration;
    rage.durationMs = duration;
    rage.earlyBonus = hasEarlyBonus;
    enemy.combatState.attackSpeedMultiplier = this.RAGE_MODE_ATTACK_SPEED_MULTIPLIER;
    enemy.combatState.rageStartedAt = scene.time.now;
    MMA.UI.showDamageText(scene, enemy.x, enemy.y - 126, hasEarlyBonus ? 'SECOND WIND+' : 'RAGE MODE!', '#ff4d6d');
    return true;
  },
  applyRageDefenseModifierIfActive: function(scene, enemy, damage) {
    if (!enemy) return damage;
    this.refreshRageState(scene, enemy);
    var rage = this.ensureRageState(enemy);
    if (!rage || !rage.active) return damage;
    return Math.round(damage * this.RAGE_MODE_DAMAGE_TAKEN_MULTIPLIER);
  },
  ensureFinishHimState: function(enemy) {
    if (!enemy) return null;
    enemy.combatState = enemy.combatState || {};
    enemy.combatState.finishHimState = enemy.combatState.finishHimState || { armed: false, consumed: false };
    return enemy.combatState.finishHimState;
  },
  maybeArmFinishHim: function(scene, enemy) {
    if (!enemy || !enemy.active || enemy.state === 'dead' || !enemy.stats) return false;
    var state = this.ensureFinishHimState(enemy);
    if (!state || state.armed || state.consumed) return false;
    var maxHp = enemy.stats.maxHp || enemy.stats.hp || 1;
    var threshold = Math.max(1, Math.round(maxHp * this.FINISH_HIM_TRIGGER_HP_PCT));
    if (enemy.stats.hp > threshold) return false;
    state.armed = true;
    MMA.UI.showDamageText(scene, enemy.x, enemy.y - 140, 'FINISH HIM!', '#ff2e63');
    return true;
  },
  applyFinishHimIfArmed: function(scene, enemy, damage) {
    if (!enemy) return { damage: damage, finishHim: false };
    var state = this.ensureFinishHimState(enemy);
    if (!state || !state.armed || state.consumed) return { damage: damage, finishHim: false };
    state.armed = false;
    state.consumed = true;
    var boostedDamage = Math.max(Math.round(damage * this.FINISH_HIM_DAMAGE_MULTIPLIER), enemy.stats && typeof enemy.stats.hp === 'number' ? enemy.stats.hp : damage);
    scene.time.timeScale = 0.28;
    scene.time.delayedCall(220, function() { scene.time.timeScale = 1; });
    MMA.UI.showDamageText(scene, enemy.x, enemy.y - 158, 'FINISH!', '#ffe066');
    this.gainMentalPressure(scene, enemy, this.MENTAL_PRESSURE_FINISH_BONUS, 'FINISH');
    MMA.VFX.showImpactSpark(scene, enemy.x, enemy.y, true);
    var score = scene.registry.get('score') || 0;
    scene.registry.set('score', score + this.FINISH_HIM_SCORE_BONUS);
    return { damage: boostedDamage, finishHim: true };
  },
  ensureBreathingState: function(scene) {
    scene.player.breathingState = scene.player.breathingState || {
      exertionHits: 0,
      firstExertionAt: 0,
      windedUntil: 0,
      holdStartedAt: 0,
      patchedRegen: false
    };
    return scene.player.breathingState;
  },
  patchBreathingRegenHook: function(scene) {
    var state = this.ensureBreathingState(scene);
    if (state.patchedRegen) return;
    if (!MMA.Player || typeof MMA.Player.regenStaminaTick !== 'function') return;
    if (MMA.Player._breathingWrapped) {
      state.patchedRegen = true;
      return;
    }

    var original = MMA.Player.regenStaminaTick;
    MMA.Player.regenStaminaTick = function(sceneArg) {
      var before = sceneArg && sceneArg.player && sceneArg.player.stats ? sceneArg.player.stats.stamina : null;
      original(sceneArg);
      if (!sceneArg || !sceneArg.player || !sceneArg.player.stats || typeof before !== 'number') return;
      var breathing = sceneArg.player.breathingState;
      if (!breathing || !breathing.windedUntil) return;
      if (sceneArg.time.now >= breathing.windedUntil) return;
      var after = sceneArg.player.stats.stamina;
      var gained = Math.max(0, after - before);
      if (gained <= 0) return;
      var reduced = gained * window.MMA.Combat.BREATHING_REGEN_MULTIPLIER;
      sceneArg.player.stats.stamina = Math.min(sceneArg.player.stats.maxStamina, before + reduced);
    };
    MMA.Player._breathingWrapped = true;
    state.patchedRegen = true;
  },
  registerBreathingExertion: function(scene, amount) {
    var state = this.ensureBreathingState(scene);
    var now = scene.time.now;
    var add = Math.max(1, amount || 1);
    if (!state.firstExertionAt || now - state.firstExertionAt > this.BREATHING_EXERTION_WINDOW_MS) {
      state.firstExertionAt = now;
      state.exertionHits = 0;
    }
    state.exertionHits += add;

    if (state.exertionHits >= this.BREATHING_EXERTION_THRESHOLD) {
      var newlyWinded = now >= state.windedUntil;
      state.windedUntil = now + this.BREATHING_WINDED_DURATION_MS;
      state.exertionHits = 0;
      state.firstExertionAt = now;
      if (newlyWinded) MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 86, 'WINDED! REGEN -50%', '#ff9e9e');
    }

    return state;
  },
  updateBreathingTechnique: function(scene) {
    var state = this.ensureBreathingState(scene);
    var now = scene.time.now;
    var blocking = this.isBlocking(scene);

    if (!blocking) {
      state.holdStartedAt = 0;
      if (state.windedUntil && now >= state.windedUntil) state.windedUntil = 0;
      return state;
    }

    if (!state.holdStartedAt) state.holdStartedAt = now;
    if (state.windedUntil && now < state.windedUntil && now - state.holdStartedAt >= this.BREATHING_TECHNIQUE_HOLD_MS) {
      state.windedUntil = 0;
      state.exertionHits = 0;
      state.firstExertionAt = 0;
      state.holdStartedAt = 0;
      MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 104, 'BREATHING TECHNIQUE!', '#8be9fd');
    }

    return state;
  },
  executeTaunt: function(scene) {
    if (scene.groundState && scene.groundState.active) return;
    if (scene.gameOver || scene.paused || scene.roomTransitioning) return;
    var cd = scene.player.cooldowns;
    if (!cd.taunt) cd.taunt = 0;
    if (cd.taunt > 0 || scene.player.stats.stamina < this.TAUNT_STAMINA_COST) return;

    var enemies = scene.enemyGroup.getChildren();
    var best = null;
    var bestDist = Infinity;
    var maxDist = CONFIG.DISPLAY_TILE * 2.4;
    for (var i = 0; i < enemies.length; i++) {
      var enemy = enemies[i];
      if (!enemy.active || enemy.state === 'dead') continue;
      var dist = Phaser.Math.Distance.Between(scene.player.x, scene.player.y, enemy.x, enemy.y);
      if (dist <= maxDist && dist < bestDist) {
        best = enemy;
        bestDist = dist;
      }
    }

    scene.player.stats.stamina -= this.TAUNT_STAMINA_COST;
    this.registerBreathingExertion(scene, 1);
    cd.taunt = this.TAUNT_COOLDOWN_MS;

    if (!best) {
      MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 40, 'TAUNT WHIFFED', '#aaaaaa');
      return;
    }

    best.combatState = best.combatState || {};
    best.combatState.tauntDebuffUntil = scene.time.now + this.TAUNT_DEBUFF_DURATION_MS;
    this.gainFocus(scene, this.TAUNT_FOCUS_GAIN);
    this.gainMentalPressure(scene, best, this.MENTAL_PRESSURE_TAUNT_BONUS, 'TAUNT');
    MMA.UI.showDamageText(scene, best.x, best.y - 54, 'TAUNTED! DEF -15%', '#ff99cc');
  },
  executeAttack: function(scene, moveKey) {
    if (scene.groundState && scene.groundState.active) return this.executeGroundMove(scene, moveKey);
    if (scene.player.unlockedMoves.indexOf(moveKey) === -1) return MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 40, 'LOCKED', '#888888');
    var move = this.MOVE_ROSTER[moveKey]; if (!move) return;
    
    // Record move for Move Input Display
    MMA.UI.recordMoveInput(moveKey, scene);
    var s = scene.player.stats, cd = scene.player.cooldowns;
    var intuitionState = this.ensureIntuitionState(scene);
    var intuitionPrimed = !!intuitionState.ready;
    var adrenalinePrimed = this.isAdrenalinePrimed(scene);
    if (!cd[moveKey]) cd[moveKey] = 0;
    if (cd[moveKey] > 0 || (!intuitionPrimed && !adrenalinePrimed && s.stamina < move.staminaCost) || scene.gameOver) return;
    if (!intuitionPrimed && !adrenalinePrimed) {
      s.stamina -= move.staminaCost;
      this.registerBreathingExertion(scene, 1);
    }
    cd[moveKey] = move.cooldown;
    this.markAttackForTransitionCancel(scene, moveKey, move.staminaCost);
    if (window.sfx) { if (moveKey === 'jab' || moveKey === 'cross') window.sfx.punch(); else if (moveKey === 'lowKick' || moveKey === 'headKick') window.sfx.kick(); }
    var DT = CONFIG.DISPLAY_TILE, px = scene.player.x + scene.lastDir.x * DT * 0.5, py = scene.player.y + scene.lastDir.y * DT * 0.5;
    var hitbox = scene.add.image(px, py, 'hitbox').setDisplaySize(DT, DT).setAlpha(0.5);
    var enemies = scene.enemyGroup.getChildren(), hit = false;
    for (var i=0; i<enemies.length; i++) {
      var enemy = enemies[i]; if (hit || !enemy.active || enemy.state === 'dead') continue;
      var dist = Phaser.Math.Distance.Between(scene.player.x, scene.player.y, enemy.x, enemy.y);
      if (dist <= DT * 1.8) {
        hit = true;
        if (moveKey === 'takedown') {
          scene.playTakedownLunge(enemy);
          if (this.resolveTakedownAttempt(scene, enemy)) {
            MMA.UI.showDamageText(scene, enemy.x, enemy.y - 36, 'TAKEDOWN!', '#66ccff');
            scene.enterGroundState(enemy);
          } else {
            MMA.UI.showDamageText(scene, enemy.x, enemy.y - 36, 'SPRAWL!', '#ff6666');
            scene.player.stunnedUntil = scene.time.now + 500;
            MMA.Player.damage(scene, Math.round(enemy.type.attackDamage * 0.8));
          }
          continue;
        }
        this.onIntuitionEngage(scene, enemy);
        if (this.maybeTriggerComboBreaker(scene, enemy)) continue;
        var perfectIntuitionCounter = this.isIntuitionPerfectCounterReady(scene);
        var counterAttack = perfectIntuitionCounter || this.isCounterAttackWindow(scene, enemy);
        var attackBonus = scene.player.attackBonus || 0;
        var baseDamage = Math.round((move.damage + attackBonus) * 1.2);
        var intuitionDamage = intuitionPrimed ? Math.round(baseDamage * this.INTUITION_DAMAGE_MULTIPLIER) : baseDamage;
        var adrenalineDamage = adrenalinePrimed ? Math.round(intuitionDamage * this.ADRENALINE_DAMAGE_MULTIPLIER) : intuitionDamage;
        var breakthroughAdjusted = this.applyBreakthroughDamageIfActive(scene, adrenalineDamage);
        this.maybeTriggerMomentumShift(scene, counterAttack);
        var momentumShiftAdjusted = this.applyMomentumShiftIfActive(scene, breakthroughAdjusted.damage);
        var momentum = this.getMomentumModifiers(scene, momentumShiftAdjusted.damage);
        var momentumDamage = momentum.surgeReady ? Math.round(momentum.damage * this.MOMENTUM_SURGE_DAMAGE_MULTIPLIER) : momentum.damage;
        var exploitRecovery = this.applyExploitRecoveryIfActive(scene, momentumDamage);
        var whiffShift = this.applyWhiffShiftIfReady(scene, exploitRecovery.damage);
        var rolled = this.rollDamage(whiffShift.damage, momentum.critChance, momentum.forceCrit || intuitionPrimed);
        var comboResult = this.applyComboBonus(scene, moveKey, rolled.damage, true);
        var pressureResult = this.applyPressureBreakIfReady(scene, comboResult.damage, enemy);
        var staminaBreakDamage = this.applyStaminaBreakIfActive(scene, enemy, pressureResult.damage);
        var tauntDamage = this.applyTauntDebuffIfActive(scene, enemy, staminaBreakDamage.damage);
        var rageAdjustedDamage = this.applyRageDefenseModifierIfActive(scene, enemy, tauntDamage);
        var panicAdjusted = this.applyMentalPanicIfActive(scene, enemy, rageAdjustedDamage);
        var deadlyWindowAdjusted = this.applyDeadlyWindowIfActive(scene, enemy, panicAdjusted.damage);
        var chainCounterAdjusted = this.applyChainCounterIfActive(scene, deadlyWindowAdjusted.damage, counterAttack);
        var counterFlowAdjusted = this.applyCounterFlowOnCounterHit(scene, chainCounterAdjusted.damage, counterAttack);
        var breakingPointAdjusted = this.applyBreakingPointIfActive(scene, enemy, counterFlowAdjusted.damage);
        var finishHimAdjusted = this.applyFinishHimIfArmed(scene, enemy, breakingPointAdjusted.damage);
        this.applyLimbInjuryOnHit(scene, enemy, moveKey);
        var injuryAdjusted = this.applyInjuryDamageBonus(enemy, finishHimAdjusted.damage);
        var adaptiveDefenseMult = MMA.Enemies.onPlayerAttack(scene, enemy, moveKey);
        var effectiveDefenseMult = this.getDefenseMultiplierWithAdrenaline(adaptiveDefenseMult, adrenalinePrimed);
        var styleMasteryApplied = this.applyStyleMasteryIfPrimed(scene, moveKey, injuryAdjusted.damage, effectiveDefenseMult);
        var dmg = Math.round(styleMasteryApplied.damage / styleMasteryApplied.defenseMult);
        var weightAdjusted = this.applyWeightClassAdvantage(enemy, moveKey, dmg);
        dmg = weightAdjusted.damage;
        var crowdBonus = scene.registry.get('crowdDamageBonus') || 0;
        if (crowdBonus > 0) dmg = Math.round(dmg * (1 + crowdBonus));
        enemy.stats.hp -= dmg;
        var shadowClone = this.applyShadowCloneMirror(scene, enemy, rolled.crit || finishHimAdjusted.finishHim);
        dmg += shadowClone.mirrorDamage;
        // Health Bar Damage Trail: record damage for visual effect
        if (MMA.Enemies.recordDamageTrail) MMA.Enemies.recordDamageTrail(enemy, dmg);
        this.resetMomentumShiftHits(scene);
        this.onComboBreakerHit(scene);
        // Track swarm damage for split detection
        if (MMA.Enemies.recordSwarmDamage) {
          MMA.Enemies.recordSwarmDamage(enemy, dmg);
        }
        // Track fight stats
        var comboCount = scene.player.comboState ? scene.player.comboState.index : 1;
        MMA.UI.recordHitDealt(dmg, rolled.crit, comboCount);
        MMA.UI.recordMoveUsage(moveKey, scene); // Track move for Style DNA
        MMA.Player.awardStyleXP(scene, moveKey); // Award style XP
        MMA.UI.incrementCombo();
        if (window.sfx) window.sfx.hit();
        MMA.UI.showDamageText(scene, enemy.x, enemy.y - 20, '-' + dmg, rolled.crit ? '#ff6b6b' : undefined);
        if (rolled.crit) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 38, 'CRIT!', '#ff3333');
        if (intuitionPrimed) {
          MMA.UI.showDamageText(scene, enemy.x, enemy.y - 56, 'FLOW COUNTER!', '#9dff9d');
          scene.time.timeScale = 0.35;
          scene.time.delayedCall(150, function() { scene.time.timeScale = 1; });
          this.consumeIntuition(scene);
        }
        if (adrenalinePrimed) {
          MMA.UI.showDamageText(scene, enemy.x, enemy.y - 66, 'ADRENALINE RUSH!', '#ff9f43');
          this.consumeAdrenaline(scene);
          adrenalinePrimed = false;
        }
        if (comboResult.comboFinished) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 74, comboResult.comboLabel, '#66ff99');
        if (effectiveDefenseMult > 1) MMA.Enemies.showAdaptiveFeedback(scene, enemy);
        if (injuryAdjusted.bonusPct > 0) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 138, 'INJURY +' + Math.round(injuryAdjusted.bonusPct * 100) + '%', '#ffd166');
        if (pressureResult.pressureBreak) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 74, 'PRESSURE BREAK!', '#ffb347');
        if (panicAdjusted.panicActive) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 84, 'PANIC OPENING!', '#ff66cc');
        if (deadlyWindowAdjusted.deadlyWindow) {
          MMA.UI.showDamageText(scene, enemy.x, enemy.y - 102, 'DEADLY WINDOW x1.5', '#ff5c5c');
        }
        if (counterAttack) {
          MMA.UI.showDamageText(scene, enemy.x, enemy.y - 110, perfectIntuitionCounter ? 'PERFECT COUNTER!' : 'COUNTER!', '#8ef9ff');
          this.onStyleShiftCounter(scene, moveKey, true);
          this.triggerAdrenaline(scene);
          adrenalinePrimed = this.isAdrenalinePrimed(scene);
        }
        if (chainCounterAdjusted.active) {
          MMA.UI.showDamageText(scene, enemy.x, enemy.y - 116, 'CHAIN COUNTER x' + chainCounterAdjusted.stacks, '#a0f0ff');
        }
        if (counterFlowAdjusted.active) {
          MMA.UI.showDamageText(scene, enemy.x, enemy.y - 122, 'COUNTER FLOW x' + counterFlowAdjusted.stacks, '#67e8f9');
        }
        if (breakingPointAdjusted.active) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 120, 'BREAKING POINT OPEN!', '#ff8fab');
        if (exploitRecovery.active) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 112, 'EXPLOIT WINDOW x1.3', '#44d6ff');
        if (whiffShift.active) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 136, 'WHIFF SHIFT x1.25', '#8be9fd');
        if (breakthroughAdjusted.active) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 148, 'BREAKTHROUGH x1.25', '#ffd6a5');
        if (momentumShiftAdjusted.active) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 160, 'MOMENTUM SHIFT x1.2', '#66f2ff');
        if (styleMasteryApplied.consumed) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 168, 'STYLE MASTERY x1.4', '#c8b6ff');
        if (weightAdjusted.active) {
          var weightPct = Math.round(Math.abs(weightAdjusted.bonus) * 100);
          var weightLabel = weightAdjusted.bonus > 0 ? 'WEIGHT ADV +' + weightPct + '%' : 'WEIGHT MISMATCH -' + weightPct + '%';
          MMA.UI.showDamageText(scene, enemy.x, enemy.y - 176, weightLabel, weightAdjusted.bonus > 0 ? '#8cffc1' : '#ff9e9e');
        }
        if (staminaBreakDamage.staminaBreakActive) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 92, 'STAMINA BREAK x1.5', '#ffd166');
        var staminaState = this.onEnemyStaminaHit(scene, enemy, move);
        if (staminaState.brokeNow) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 110, 'STAMINA BROKEN!', '#ff9f1c');
        if (momentum.surgeReady) {
          MMA.UI.showDamageText(scene, enemy.x, enemy.y - 128, 'MOMENTUM SURGE!', '#7ce8ff');
          this.consumeMomentumSurge(scene);
        } else {
          var momentumState = this.onMomentumHit(scene);
          if (momentumState.stacks > 0) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 128, 'MOMENTUM x' + momentumState.stacks, '#7ce8ff');
        }
        this.onPressureHit(scene);
        this.gainMentalPressure(scene, enemy, this.MENTAL_PRESSURE_PER_HIT, 'CLEAN HIT');
        this.onBreakingPointHit(scene, enemy);
        if (exploitRecovery.active && enemy && enemy.active && enemy.state !== 'dead') {
          enemy.staggerTimer = Math.max(enemy.staggerTimer || 0, this.STUN_DURATION_MS);
          enemy.state = 'staggered';
          MMA.UI.showDamageText(scene, enemy.x, enemy.y - 138, 'EXPLOIT STUN!', '#70f0ff');
        } else {
          this.onStunChainHit(scene, enemy);
        }
        MMA.VFX.flashEnemyHit(scene, enemy, 100); MMA.VFX.showImpactSpark(scene, enemy.x, enemy.y, moveKey === 'cross');
        var breakingState = this.ensureBreakingPointState(enemy);
        var breakingStunBonus = (breakingState && scene.time.now < (breakingState.activeUntil || 0)) ? this.BREAKING_POINT_STUN_BONUS_MS : 0;
        enemy.staggerTimer = Math.max(enemy.staggerTimer || 0, 400 + breakingStunBonus); enemy.state = 'staggered';
        if (window.narrate) window.narrate('bigHit', { move: moveKey, damage: dmg }).then(function(msg){ if (msg) scene.registry.set('gameMessage', msg); scene.time.delayedCall(2500, function(){ scene.registry.set('gameMessage', ''); }); });
        this.maybeTriggerRageMode(scene, enemy);
        if (enemy.stats.hp > 0) this.maybeArmFinishHim(scene, enemy);
        if (enemy.stats.hp <= 0) MMA.Enemies.killEnemy(scene, enemy);
      }
    }
    if (!hit) {
      this.applyComboBonus(scene, moveKey, 0, false);
      this.onPressureMiss(scene);
      this.onMomentumMiss(scene);
      this.onStunChainMiss(scene);
      this.onWhiffShiftMiss(scene);
      this.resetComboBreakerState(scene);
      this.resetBreakingPointChain(scene);
      MMA.UI.resetCombo();
    }
    MMA.VFX.playAttackEffect(scene, moveKey, scene.player.x, scene.player.y - 3, px, py);
    scene.time.delayedCall(260, function(){ hitbox.destroy(); });
  },
  executeSpecialMove: function(scene) {
    if (scene.groundState && scene.groundState.active) return this.executeGroundMove(scene, 'special');
    if (scene.gameOver || scene.paused || scene.roomTransitioning) return;
    
    // Record move for Move Input Display
    MMA.UI.recordMoveInput('special', scene);
    
    var unlocked = scene.player.unlockedMoves, bestMoveKey = null, bestDamage = -1;
    if (unlocked.indexOf('spinningBackFist') !== -1) bestMoveKey = 'spinningBackFist';
    else for (var i=0;i<unlocked.length;i++){ var key = unlocked[i], m = this.MOVE_ROSTER[key]; if (m && m.damage > bestDamage) { bestDamage = m.damage; bestMoveKey = key; } }
    if (!bestMoveKey) return;
    var move = this.MOVE_ROSTER[bestMoveKey], cds = scene.player.cooldowns;
    var intuitionState = this.ensureIntuitionState(scene);
    var intuitionPrimed = !!intuitionState.ready;
    var adrenalinePrimed = this.isAdrenalinePrimed(scene);
    if (!cds[bestMoveKey]) cds[bestMoveKey] = 0;
    if (cds[bestMoveKey] > 0) return;
    var required = Math.ceil(move.staminaCost * 1.5);
    if (!intuitionPrimed && !adrenalinePrimed && scene.player.stats.stamina < required) return MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 40, 'NOT ENOUGH STAMINA', '#ff4444');
    if (!intuitionPrimed && !adrenalinePrimed) {
      scene.player.stats.stamina -= required;
      this.registerBreathingExertion(scene, 2);
    }
    cds[bestMoveKey] = move.cooldown;
    this.markAttackForTransitionCancel(scene, bestMoveKey, required);
    var DT = CONFIG.DISPLAY_TILE, px = scene.player.x + scene.lastDir.x * DT * 0.7, py = scene.player.y + scene.lastDir.y * DT * 0.7;
    var hitbox = scene.add.image(px, py, 'hitbox').setDisplaySize(DT * 1.7, DT * 1.7).setAlpha(0.6);
    var enemies = scene.enemyGroup.getChildren(), hit = false;
    for (var j=0; j<enemies.length; j++) {
      var enemy = enemies[j]; if (hit || !enemy.active || enemy.state === 'dead') continue;
      var dist = Phaser.Math.Distance.Between(scene.player.x, scene.player.y, enemy.x, enemy.y);
      if (dist <= DT * 2.5) {
        hit = true;
        this.onIntuitionEngage(scene, enemy);
        if (this.maybeTriggerComboBreaker(scene, enemy)) continue;
        var perfectIntuitionCounter = this.isIntuitionPerfectCounterReady(scene);
        var counterAttack = perfectIntuitionCounter || this.isCounterAttackWindow(scene, enemy);
        var attackBonus = scene.player.attackBonus || 0;
        var baseDamage = Math.round((move.damage + attackBonus) * 1.2);
        var intuitionDamage = intuitionPrimed ? Math.round(baseDamage * this.INTUITION_DAMAGE_MULTIPLIER) : baseDamage;
        var adrenalineDamage = adrenalinePrimed ? Math.round(intuitionDamage * this.ADRENALINE_DAMAGE_MULTIPLIER) : intuitionDamage;
        var breakthroughAdjusted = this.applyBreakthroughDamageIfActive(scene, adrenalineDamage);
        this.maybeTriggerMomentumShift(scene, counterAttack);
        var momentumShiftAdjusted = this.applyMomentumShiftIfActive(scene, breakthroughAdjusted.damage);
        var momentum = this.getMomentumModifiers(scene, momentumShiftAdjusted.damage);
        var momentumDamage = momentum.surgeReady ? Math.round(momentum.damage * this.MOMENTUM_SURGE_DAMAGE_MULTIPLIER) : momentum.damage;
        var exploitRecovery = this.applyExploitRecoveryIfActive(scene, momentumDamage);
        var whiffShift = this.applyWhiffShiftIfReady(scene, exploitRecovery.damage);
        var rolled = this.rollDamage(whiffShift.damage, momentum.critChance, momentum.forceCrit || intuitionPrimed);
        var pressureResult = this.applyPressureBreakIfReady(scene, rolled.damage, enemy);
        var staminaBreakDamage = this.applyStaminaBreakIfActive(scene, enemy, pressureResult.damage);
        var rageAdjustedDamage = this.applyRageDefenseModifierIfActive(scene, enemy, staminaBreakDamage.damage);
        var panicAdjusted = this.applyMentalPanicIfActive(scene, enemy, rageAdjustedDamage);
        var deadlyWindowAdjusted = this.applyDeadlyWindowIfActive(scene, enemy, panicAdjusted.damage);
        var chainCounterAdjusted = this.applyChainCounterIfActive(scene, deadlyWindowAdjusted.damage, counterAttack);
        var counterFlowAdjusted = this.applyCounterFlowOnCounterHit(scene, chainCounterAdjusted.damage, counterAttack);
        var breakingPointAdjusted = this.applyBreakingPointIfActive(scene, enemy, counterFlowAdjusted.damage);
        var finishHimAdjusted = this.applyFinishHimIfArmed(scene, enemy, breakingPointAdjusted.damage);
        this.applyLimbInjuryOnHit(scene, enemy, bestMoveKey);
        var injuryAdjusted = this.applyInjuryDamageBonus(enemy, finishHimAdjusted.damage);
        var adaptiveDefenseMult = MMA.Enemies.onPlayerAttack(scene, enemy, bestMoveKey);
        var effectiveDefenseMult = this.getDefenseMultiplierWithAdrenaline(adaptiveDefenseMult, adrenalinePrimed);
        var styleMasteryApplied = this.applyStyleMasteryIfPrimed(scene, bestMoveKey, injuryAdjusted.damage, effectiveDefenseMult);
        var dmg = Math.round(styleMasteryApplied.damage / styleMasteryApplied.defenseMult);
        var weightAdjusted = this.applyWeightClassAdvantage(enemy, bestMoveKey, dmg);
        dmg = weightAdjusted.damage;
        var crowdBonus = scene.registry.get('crowdDamageBonus') || 0;
        if (crowdBonus > 0) dmg = Math.round(dmg * (1 + crowdBonus));
        enemy.stats.hp -= dmg;
        var shadowClone = this.applyShadowCloneMirror(scene, enemy, rolled.crit || finishHimAdjusted.finishHim);
        dmg += shadowClone.mirrorDamage;
        // Health Bar Damage Trail: record damage for visual effect
        if (MMA.Enemies.recordDamageTrail) MMA.Enemies.recordDamageTrail(enemy, dmg);
        this.resetMomentumShiftHits(scene);
        this.onComboBreakerHit(scene);
        // Track swarm damage for split detection
        if (MMA.Enemies.recordSwarmDamage) {
          MMA.Enemies.recordSwarmDamage(enemy, dmg);
        }
        // Track fight stats
        MMA.UI.recordHitDealt(dmg, rolled.crit, 1);
        MMA.Player.awardStyleXP(scene, bestMoveKey); // Award style XP
        MMA.UI.incrementCombo();
        if (window.sfx) window.sfx.hit();
        MMA.UI.showDamageText(scene, enemy.x, enemy.y - 30, '-' + dmg, rolled.crit ? '#ff6b6b' : '#ffd54f');
        if (rolled.crit) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 48, 'CRIT!', '#ff3333');
        if (intuitionPrimed) {
          MMA.UI.showDamageText(scene, enemy.x, enemy.y - 66, 'FLOW COUNTER!', '#9dff9d');
          scene.time.timeScale = 0.35;
          scene.time.delayedCall(150, function() { scene.time.timeScale = 1; });
          this.consumeIntuition(scene);
        }
        if (adrenalinePrimed) {
          MMA.UI.showDamageText(scene, enemy.x, enemy.y - 76, 'ADRENALINE RUSH!', '#ff9f43');
          this.consumeAdrenaline(scene);
          adrenalinePrimed = false;
        }
        if (effectiveDefenseMult > 1) MMA.Enemies.showAdaptiveFeedback(scene, enemy);
        if (injuryAdjusted.bonusPct > 0) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 130, 'INJURY +' + Math.round(injuryAdjusted.bonusPct * 100) + '%', '#ffd166');
        if (pressureResult.pressureBreak) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 84, 'PRESSURE BREAK!', '#ffb347');
        if (panicAdjusted.panicActive) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 94, 'PANIC OPENING!', '#ff66cc');
        if (deadlyWindowAdjusted.deadlyWindow) {
          MMA.UI.showDamageText(scene, enemy.x, enemy.y - 104, 'DEADLY WINDOW x1.5', '#ff5c5c');
        }
        if (counterAttack) {
          MMA.UI.showDamageText(scene, enemy.x, enemy.y - 112, perfectIntuitionCounter ? 'PERFECT COUNTER!' : 'COUNTER!', '#8ef9ff');
          this.onStyleShiftCounter(scene, bestMoveKey, true);
          this.triggerAdrenaline(scene);
          adrenalinePrimed = this.isAdrenalinePrimed(scene);
        }
        if (chainCounterAdjusted.active) {
          MMA.UI.showDamageText(scene, enemy.x, enemy.y - 118, 'CHAIN COUNTER x' + chainCounterAdjusted.stacks, '#a0f0ff');
        }
        if (counterFlowAdjusted.active) {
          MMA.UI.showDamageText(scene, enemy.x, enemy.y - 124, 'COUNTER FLOW x' + counterFlowAdjusted.stacks, '#67e8f9');
        }
        if (breakingPointAdjusted.active) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 122, 'BREAKING POINT OPEN!', '#ff8fab');
        if (exploitRecovery.active) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 114, 'EXPLOIT WINDOW x1.3', '#44d6ff');
        if (whiffShift.active) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 132, 'WHIFF SHIFT x1.25', '#8be9fd');
        if (breakthroughAdjusted.active) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 144, 'BREAKTHROUGH x1.25', '#ffd6a5');
        if (momentumShiftAdjusted.active) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 156, 'MOMENTUM SHIFT x1.2', '#66f2ff');
        if (styleMasteryApplied.consumed) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 164, 'STYLE MASTERY x1.4', '#c8b6ff');
        if (weightAdjusted.active) {
          var weightPct = Math.round(Math.abs(weightAdjusted.bonus) * 100);
          var weightLabel = weightAdjusted.bonus > 0 ? 'WEIGHT ADV +' + weightPct + '%' : 'WEIGHT MISMATCH -' + weightPct + '%';
          MMA.UI.showDamageText(scene, enemy.x, enemy.y - 172, weightLabel, weightAdjusted.bonus > 0 ? '#8cffc1' : '#ff9e9e');
        }
        if (staminaBreakDamage.staminaBreakActive) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 84, 'STAMINA BREAK x1.5', '#ffd166');
        var staminaState = this.onEnemyStaminaHit(scene, enemy, move);
        if (staminaState.brokeNow) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 102, 'STAMINA BROKEN!', '#ff9f1c');
        if (momentum.surgeReady) {
          MMA.UI.showDamageText(scene, enemy.x, enemy.y - 120, 'MOMENTUM SURGE!', '#7ce8ff');
          this.consumeMomentumSurge(scene);
        } else {
          var momentumState = this.onMomentumHit(scene);
          if (momentumState.stacks > 0) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 120, 'MOMENTUM x' + momentumState.stacks, '#7ce8ff');
        }
        this.onPressureHit(scene);
        this.gainMentalPressure(scene, enemy, this.MENTAL_PRESSURE_PER_HIT, 'CLEAN HIT');
        this.onBreakingPointHit(scene, enemy);
        if (exploitRecovery.active && enemy && enemy.active && enemy.state !== 'dead') {
          enemy.staggerTimer = Math.max(enemy.staggerTimer || 0, this.STUN_DURATION_MS);
          enemy.state = 'staggered';
          MMA.UI.showDamageText(scene, enemy.x, enemy.y - 132, 'EXPLOIT STUN!', '#70f0ff');
        } else {
          this.onStunChainHit(scene, enemy);
        }
        MMA.VFX.flashEnemyHit(scene, enemy, 100); MMA.VFX.showImpactSpark(scene, enemy.x, enemy.y, true);
        var breakingState = this.ensureBreakingPointState(enemy);
        var breakingStunBonus = (breakingState && scene.time.now < (breakingState.activeUntil || 0)) ? this.BREAKING_POINT_STUN_BONUS_MS : 0;
        enemy.staggerTimer = Math.max(enemy.staggerTimer || 0, 600 + breakingStunBonus); enemy.state = 'staggered';
        if (window.narrate) window.narrate('bigHit', { move: bestMoveKey, damage: dmg }).then(function(msg){ if (msg) scene.registry.set('gameMessage', msg); scene.time.delayedCall(2500, function(){ scene.registry.set('gameMessage', ''); }); });
        this.maybeTriggerRageMode(scene, enemy);
        if (enemy.stats.hp > 0) this.maybeArmFinishHim(scene, enemy);
        if (enemy.stats.hp <= 0) MMA.Enemies.killEnemy(scene, enemy);
      }
    }
    if (!hit) {
      this.onPressureMiss(scene);
      this.onMomentumMiss(scene);
      this.onStunChainMiss(scene);
      this.onWhiffShiftMiss(scene);
      this.resetComboBreakerState(scene);
      this.resetBreakingPointChain(scene);
    }
    MMA.VFX.playAttackEffect(scene, 'cross', scene.player.x, scene.player.y - 4, px, py);
    scene.time.delayedCall(380, function(){ hitbox.destroy(); });
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
    this.registerBreathingExertion(scene, 1);
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
  },
  handleInput: function(scene, delta) {
    this.patchBreathingRegenHook(scene);
    this.updateBreathingTechnique(scene);
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
          window.MMA_ACTION.jab = false;
          window.MMA_ACTION.heavy = false;
          window.MMA_ACTION.grapple = false;
          window.MMA_ACTION.special = false;
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
      if (window.MMA_ACTION.jab) { window.MMA_ACTION.jab = false; this.executeAttack(scene, 'jab'); }
      if (window.MMA_ACTION.heavy) { window.MMA_ACTION.heavy = false; this.executeAttack(scene, 'cross'); }
      if (window.MMA_ACTION.grapple) { window.MMA_ACTION.grapple = false; this.executeAttack(scene, 'takedown'); }
      if (window.MMA_ACTION.special) { window.MMA_ACTION.special = false; this.executeSpecialMove(scene); }
      // Handle stand up button (separate utility button)
      if (window.MMA_ACTION.standup) { 
        window.MMA_ACTION.standup = false; 
        if (scene.groundState && scene.groundState.active) {
          this.executeGroundMove(scene, 'standup');
          // Record move for Move Input Display
          MMA.UI.recordMoveInput('standup', scene);
        }
      }
    }
    var cdMap = scene.player.cooldowns; Object.keys(cdMap).forEach(function(k){ if (cdMap[k] > 0) cdMap[k] = Math.max(0, cdMap[k] - delta); });
  }
};
window.MOVE_ROSTER = window.MOVE_ROSTER || window.MMA.Combat.MOVE_ROSTER;

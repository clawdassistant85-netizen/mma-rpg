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
  TAKEDOWN_BASE_CHANCE: {
    grappler: 0.8,
    balanced: 0.5,
    striker: 0.3
  },
  GROUND_MOVES: {
    jab: { name: 'Ground & Pound', damage: 22, staminaCost: 8, cooldown: 500 },
    cross: { name: 'Elbow', damage: 32, staminaCost: 18, cooldown: 900 },
    takedown: { name: 'Submission Attempt', staminaCost: 22, cooldown: 1200 },
    special: { name: 'Stand Up', staminaCost: 6, cooldown: 600 }
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
  resolveTakedownAttempt: function(scene, enemy) {
    var style = this.getPlayerGrappleStyle(scene);
    var baseChance = this.TAKEDOWN_BASE_CHANCE[style] || 0.5;
    var defense = enemy && enemy.type && typeof enemy.type.groundDefense === 'number' ? enemy.type.groundDefense : 0.2;
    var chance = Phaser.Math.Clamp(baseChance - (defense * 0.55), 0.1, 0.95);
    return Math.random() < chance;
  },
  executeGroundMove: function(scene, moveKey) {
    if (!scene.groundState || !scene.groundState.active || scene.gameOver) return;
    var map = { heavy: 'cross', grapple: 'takedown' };
    moveKey = map[moveKey] || moveKey;
    if (moveKey === 'special') return scene.endGroundState('player-standup');
    var gm = this.GROUND_MOVES[moveKey];
    if (!gm) return;
    var cdKey = 'ground_' + moveKey;
    var s = scene.player.stats;
    if (!scene.player.cooldowns[cdKey]) scene.player.cooldowns[cdKey] = 0;
    if (scene.player.cooldowns[cdKey] > 0 || s.stamina < gm.staminaCost) return;
    s.stamina -= gm.staminaCost;
    scene.player.cooldowns[cdKey] = gm.cooldown;
    var enemy = scene.groundState.enemy;
    if (!enemy || !enemy.active || enemy.state === 'dead') return scene.endGroundState('enemy-dead');

    if (moveKey === 'takedown') {
      var subChance = Phaser.Math.Clamp(0.2 + ((scene.player.stats.level || 1) * 0.03) - ((enemy.type.groundDefense || 0.2) * 0.2), 0.1, 0.65);
      if (Math.random() < subChance) {
        enemy.stats.hp = 0;
        MMA.UI.showDamageText(scene, enemy.x, enemy.y - 36, 'SUBMISSION!', '#ff66ff');
        MMA.Enemies.killEnemy(scene, enemy);
        scene.endGroundState('submission');
      } else {
        MMA.UI.showDamageText(scene, enemy.x, enemy.y - 24, 'ESCAPED SUB!', '#ffaa66');
      }
      return;
    }

    var dmg = gm.damage + (scene.player.attackBonus || 0);
    enemy.stats.hp -= dmg;
    MMA.UI.recordHitDealt(dmg, false, 1);
    MMA.UI.showDamageText(scene, enemy.x, enemy.y - 20, '-' + dmg, '#ffd54f');
    MMA.VFX.flashEnemyHit(scene, enemy, 90);
    if (enemy.stats.hp <= 0) {
      MMA.Enemies.killEnemy(scene, enemy);
      scene.endGroundState('enemy-dead');
    }
  },
  MOVE_ROSTER: {
    jab:{ name:'Jab', type:'strike', damage:8, staminaCost:5, cooldown:400, unlockLevel:1, unlockType:'start' },
    cross:{ name:'Cross', type:'strike', damage:12, staminaCost:8, cooldown:600, unlockLevel:1, unlockType:'start' },
    hook:{ name:'Hook', type:'strike', damage:15, staminaCost:10, cooldown:800, unlockLevel:2, unlockType:'level' },
    lowKick:{ name:'Low Kick', type:'strike', damage:10, staminaCost:7, cooldown:600, unlockLevel:2, unlockType:'level' },
    uppercut:{ name:'Uppercut', type:'strike', damage:18, staminaCost:12, cooldown:900, unlockLevel:3, unlockType:'level' },
    takedown:{ name:'Takedown', type:'grapple', damage:5, staminaCost:20, cooldown:1200, unlockLevel:1, unlockType:'start' },
    bodyShot:{ name:'Body Shot', type:'strike', damage:20, staminaCost:14, cooldown:850, unlockLevel:4, unlockType:'level' },
    guardPass:{ name:'Guard Pass', type:'grapple', damage:10, staminaCost:12, cooldown:1000, unlockLevel:4, unlockType:'level' },
    headKick:{ name:'Head Kick', type:'strike', damage:25, staminaCost:18, cooldown:1000, unlockLevel:5, unlockType:'level' },
    guillotine:{ name:'Guillotine', type:'sub', damage:25, staminaCost:18, cooldown:1500, unlockLevel:5, unlockType:'level' },
    mountCtrl:{ name:'Mount Control', type:'grapple', damage:0, staminaCost:8, cooldown:800, unlockLevel:5, unlockType:'level' },
    rnc:{ name:'RNC', type:'sub', damage:35, staminaCost:25, cooldown:2000, unlockLevel:6, unlockType:'level' },
    kimura:{ name:'Kimura', type:'sub', damage:27, staminaCost:20, cooldown:1800, unlockLevel:6, unlockType:'level' },
    spinningBackFist:{ name:'Spinning Back Fist', type:'strike', damage:30, staminaCost:20, cooldown:1200, unlockLevel:7, unlockType:'level' },
    elbowStrike:{ name:'Elbow Strike', type:'strike', damage:22, staminaCost:15, cooldown:900, unlockLevel:99, unlockType:'enemy', fromEnemy:'muayThaiFighter' },
    kneeStrike:{ name:'Knee Strike', type:'strike', damage:20, staminaCost:14, cooldown:850, unlockLevel:99, unlockType:'enemy', fromEnemy:'muayThaiFighter' },
    singleLeg:{ name:'Single Leg', type:'grapple', damage:5, staminaCost:15, cooldown:1100, unlockLevel:99, unlockType:'enemy', fromEnemy:'wrestler' },
    hipThrow:{ name:'Hip Throw', type:'grapple', damage:18, staminaCost:18, cooldown:1000, unlockLevel:99, unlockType:'enemy', fromEnemy:'judoka' },
    armbar:{ name:'Armbar', type:'sub', damage:30, staminaCost:22, cooldown:1800, unlockLevel:99, unlockType:'enemy', fromEnemy:'bjjBlackBelt' },
    triangleChoke:{ name:'Triangle Choke', type:'sub', damage:28, staminaCost:20, cooldown:1700, unlockLevel:99, unlockType:'enemy', fromEnemy:'bjjBlackBelt' }
  },
  executeAttack: function(scene, moveKey) {
    if (scene.groundState && scene.groundState.active) return this.executeGroundMove(scene, moveKey);
    if (scene.player.unlockedMoves.indexOf(moveKey) === -1) return MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 40, 'LOCKED', '#888888');
    var move = this.MOVE_ROSTER[moveKey]; if (!move) return;
    var s = scene.player.stats, cd = scene.player.cooldowns;
    if (!cd[moveKey]) cd[moveKey] = 0;
    if (cd[moveKey] > 0 || s.stamina < move.staminaCost || scene.gameOver) return;
    s.stamina -= move.staminaCost; cd[moveKey] = move.cooldown;
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
        var attackBonus = scene.player.attackBonus || 0;
        var baseDamage = Math.round((move.damage + attackBonus) * 1.2);
        var momentum = this.getMomentumModifiers(scene, baseDamage);
        var momentumDamage = momentum.surgeReady ? Math.round(momentum.damage * this.MOMENTUM_SURGE_DAMAGE_MULTIPLIER) : momentum.damage;
        var rolled = this.rollDamage(momentumDamage, momentum.critChance, momentum.forceCrit);
        var comboResult = this.applyComboBonus(scene, moveKey, rolled.damage, true);
        var pressureResult = this.applyPressureBreakIfReady(scene, comboResult.damage, enemy);
        var staminaBreakDamage = this.applyStaminaBreakIfActive(scene, enemy, pressureResult.damage);
        var dmg = staminaBreakDamage.damage;
        var crowdBonus = scene.registry.get('crowdDamageBonus') || 0;
        if (crowdBonus > 0) dmg = Math.round(dmg * (1 + crowdBonus));
        enemy.stats.hp -= dmg;
        // Track fight stats
        var comboCount = scene.player.comboState ? scene.player.comboState.index : 1;
        MMA.UI.recordHitDealt(dmg, rolled.crit, comboCount);
        MMA.UI.incrementCombo();
        if (window.sfx) window.sfx.hit();
        MMA.UI.showDamageText(scene, enemy.x, enemy.y - 20, '-' + dmg, rolled.crit ? '#ff6b6b' : undefined);
        if (rolled.crit) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 38, 'CRIT!', '#ff3333');
        if (comboResult.comboFinished) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 56, comboResult.comboLabel, '#66ff99');
        if (pressureResult.pressureBreak) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 74, 'PRESSURE BREAK!', '#ffb347');
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
        this.onStunChainHit(scene, enemy);
        MMA.VFX.flashEnemyHit(scene, enemy, 100); MMA.VFX.showImpactSpark(scene, enemy.x, enemy.y, moveKey === 'cross');
        enemy.staggerTimer = Math.max(enemy.staggerTimer || 0, 400); enemy.state = 'staggered';
        if (window.narrate) window.narrate('bigHit', { move: moveKey, damage: dmg }).then(function(msg){ if (msg) scene.registry.set('gameMessage', msg); scene.time.delayedCall(2500, function(){ scene.registry.set('gameMessage', ''); }); });
        if (enemy.stats.hp <= 0) MMA.Enemies.killEnemy(scene, enemy);
      }
    }
    if (!hit) {
      this.applyComboBonus(scene, moveKey, 0, false);
      this.onPressureMiss(scene);
      this.onMomentumMiss(scene);
      this.onStunChainMiss(scene);
      MMA.UI.resetCombo();
    }
    MMA.VFX.playAttackEffect(scene, moveKey, scene.player.x, scene.player.y - 3, px, py);
    scene.time.delayedCall(260, function(){ hitbox.destroy(); });
  },
  executeSpecialMove: function(scene) {
    if (scene.groundState && scene.groundState.active) return this.executeGroundMove(scene, 'special');
    if (scene.gameOver || scene.paused || scene.roomTransitioning) return;
    var unlocked = scene.player.unlockedMoves, bestMoveKey = null, bestDamage = -1;
    if (unlocked.indexOf('spinningBackFist') !== -1) bestMoveKey = 'spinningBackFist';
    else for (var i=0;i<unlocked.length;i++){ var key = unlocked[i], m = this.MOVE_ROSTER[key]; if (m && m.damage > bestDamage) { bestDamage = m.damage; bestMoveKey = key; } }
    if (!bestMoveKey) return;
    var move = this.MOVE_ROSTER[bestMoveKey], cds = scene.player.cooldowns;
    if (!cds[bestMoveKey]) cds[bestMoveKey] = 0;
    if (cds[bestMoveKey] > 0) return;
    var required = Math.ceil(move.staminaCost * 1.5);
    if (scene.player.stats.stamina < required) return MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 40, 'NOT ENOUGH STAMINA', '#ff4444');
    scene.player.stats.stamina -= required; cds[bestMoveKey] = move.cooldown;
    var DT = CONFIG.DISPLAY_TILE, px = scene.player.x + scene.lastDir.x * DT * 0.7, py = scene.player.y + scene.lastDir.y * DT * 0.7;
    var hitbox = scene.add.image(px, py, 'hitbox').setDisplaySize(DT * 1.7, DT * 1.7).setAlpha(0.6);
    var enemies = scene.enemyGroup.getChildren(), hit = false;
    for (var j=0; j<enemies.length; j++) {
      var enemy = enemies[j]; if (hit || !enemy.active || enemy.state === 'dead') continue;
      var dist = Phaser.Math.Distance.Between(scene.player.x, scene.player.y, enemy.x, enemy.y);
      if (dist <= DT * 2.5) {
        hit = true;
        var attackBonus = scene.player.attackBonus || 0;
        var baseDamage = Math.round((move.damage + attackBonus) * 1.2);
        var momentum = this.getMomentumModifiers(scene, baseDamage);
        var momentumDamage = momentum.surgeReady ? Math.round(momentum.damage * this.MOMENTUM_SURGE_DAMAGE_MULTIPLIER) : momentum.damage;
        var rolled = this.rollDamage(momentumDamage, momentum.critChance, momentum.forceCrit);
        var pressureResult = this.applyPressureBreakIfReady(scene, rolled.damage, enemy);
        var staminaBreakDamage = this.applyStaminaBreakIfActive(scene, enemy, pressureResult.damage);
        var dmg = staminaBreakDamage.damage;
        var crowdBonus = scene.registry.get('crowdDamageBonus') || 0;
        if (crowdBonus > 0) dmg = Math.round(dmg * (1 + crowdBonus));
        enemy.stats.hp -= dmg;
        // Track fight stats
        MMA.UI.recordHitDealt(dmg, rolled.crit, 1);
        MMA.UI.incrementCombo();
        if (window.sfx) window.sfx.hit();
        MMA.UI.showDamageText(scene, enemy.x, enemy.y - 30, '-' + dmg, rolled.crit ? '#ff6b6b' : '#ffd54f');
        if (rolled.crit) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 48, 'CRIT!', '#ff3333');
        if (pressureResult.pressureBreak) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 66, 'PRESSURE BREAK!', '#ffb347');
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
        this.onStunChainHit(scene, enemy);
        MMA.VFX.flashEnemyHit(scene, enemy, 100); MMA.VFX.showImpactSpark(scene, enemy.x, enemy.y, true);
        enemy.staggerTimer = Math.max(enemy.staggerTimer || 0, 600); enemy.state = 'staggered';
        if (window.narrate) window.narrate('bigHit', { move: bestMoveKey, damage: dmg }).then(function(msg){ if (msg) scene.registry.set('gameMessage', msg); scene.time.delayedCall(2500, function(){ scene.registry.set('gameMessage', ''); }); });
        if (enemy.stats.hp <= 0) MMA.Enemies.killEnemy(scene, enemy);
      }
    }
    if (!hit) {
      this.onPressureMiss(scene);
      this.onMomentumMiss(scene);
      this.onStunChainMiss(scene);
    }
    MMA.VFX.playAttackEffect(scene, 'cross', scene.player.x, scene.player.y - 4, px, py);
    scene.time.delayedCall(380, function(){ hitbox.destroy(); });
  },
  handleInput: function(scene, delta) {
    if (scene.player.stunnedUntil && scene.time.now < scene.player.stunnedUntil) {
      var cdMapStun = scene.player.cooldowns; Object.keys(cdMapStun).forEach(function(k){ if (cdMapStun[k] > 0) cdMapStun[k] = Math.max(0, cdMapStun[k] - delta); });
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
    }
    var cdMap = scene.player.cooldowns; Object.keys(cdMap).forEach(function(k){ if (cdMap[k] > 0) cdMap[k] = Math.max(0, cdMap[k] - delta); });
  }
};
window.MOVE_ROSTER = window.MOVE_ROSTER || window.MMA.Combat.MOVE_ROSTER;

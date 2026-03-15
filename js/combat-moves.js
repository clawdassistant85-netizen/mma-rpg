window.MMA = window.MMA || {};
window.MMA.Combat = window.MMA.Combat || {};
Object.assign(window.MMA.Combat, {
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
      if (!intuitionPrimed && !adrenalinePrimed) s.stamina -= move.staminaCost;
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
          // Audio: Trigger fight intensity layer on first hit
          if (window.MMA_AUDIO && window.MMA_AUDIO.onFirstHit) window.MMA_AUDIO.onFirstHit();
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
          // Audio: Trigger combo 10+ intensity layer
          if (window.MMA_AUDIO && window.MMA_AUDIO.onCombo10Plus) {
            var currentCombo = scene.player.comboState ? scene.player.comboState.index : 0;
            if (currentCombo >= 10) window.MMA_AUDIO.onCombo10Plus();
          }
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
          // Audio: Trigger finishing move and first KO intensity on critical kill
          if (enemy.stats.hp <= 0 && rolled.crit) {
            if (window.MMA_AUDIO && window.MMA_AUDIO.onFinishingMove) window.MMA_AUDIO.onFinishingMove();
            if (window.MMA_AUDIO && window.MMA_AUDIO.onFirstKO) window.MMA_AUDIO.onFirstKO();
          }
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
      if (!intuitionPrimed && !adrenalinePrimed) scene.player.stats.stamina -= required;
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
  STAMINA_BREAK_DAMAGE_MULTIPLIER: 1.5,
  STAMINA_BREAK_DURATION_MS: 2000,
  ENEMY_STAMINA_BASE_MULTIPLIER: 0.6,
  ENEMY_STAMINA_MIN: 30,
  TAUNT_STAMINA_COST: 6,
  TAUNT_COOLDOWN_MS: 1200,
  EXPLOIT_RECOVERY_WINDOW_MS: 400,
  EXPLOIT_RECOVERY_DAMAGE_MULTIPLIER: 1.3,
  RECOVERY_TECH_STAMINA_COST: 15,
  TRANSITION_CANCEL_STAMINA_PENALTY_PCT: 0.2,
  TRANSITION_CANCEL_COOLDOWN_REDUCTION_PCT: 0.45,
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
    }
});

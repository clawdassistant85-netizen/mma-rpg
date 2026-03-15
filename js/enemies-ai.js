window.MMA = window.MMA || {};
window.MMA.Enemies = window.MMA.Enemies || {};
Object.assign(window.MMA.Enemies, {


  // Check if player has ring rust (inactive for 3+ days)
  checkRingRust: function(scene) {
    var cfg = this.RING_RUST;
    if (!scene || !scene.player || !scene.player.stats) return false;

    // Already shaken off this session
    try {
      if (localStorage.getItem(cfg.SHAKEN_KEY) === 'true') return false;
    } catch(e) {}

    var lastFight = null;
    try {
      var stored = localStorage.getItem(cfg.STORAGE_KEY);
      if (stored) lastFight = parseInt(stored, 10);
    } catch(e) { lastFight = null; }

    if (!lastFight) {
      // No previous fight recorded - first time playing, no rust
      return false;
    }

    var now = Date.now();
    var daysSince = (now - lastFight) / (1000 * 60 * 60 * 24);

    if (daysSince >= cfg.INACTIVITY_DAYS) {
      // Apply ring rust debuffs
      this.applyRingRust(scene);
      return true;
    }

    return false;
  },



  // Apply ring rust debuffs to player
  applyRingRust: function(scene) {
    var cfg = this.RING_RUST;
    if (!scene || !scene.player || !scene.player.stats) return;

    // Mark as having ring rust applied this session
    try {
      localStorage.setItem(cfg.APPLIED_KEY, 'true');
    } catch(e) {}

    // Apply speed debuff
    if (!scene.player.stats.ringRustSpeedMod) {
      scene.player.stats.ringRustSpeedMod = 1 - cfg.SPEED_DEBUFF;
    }

    // Apply accuracy debuff (stored as multiplier for damage dealt)
    if (!scene.player.stats.ringRustAccuracyMod) {
      scene.player.stats.ringRustAccuracyMod = 1 - cfg.ACCURACY_DEBUFF;
    }

    // Initialize shake-off tracking
    scene._ringRustHitsLanded = 0;
    scene._ringRustShakeWindow = cfg.SHAKE_OFF_DURATION;

    // Show ring rust indicator
    if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
      MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 70, 'RING RUST!', '#888888');
      scene.time.delayedCall(1500, function() {
        MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 55, '-10% SPEED', '#aaaaaa');
      });
    }

    // Add sluggish animation to player sprite
    if (scene.player && scene.player.setAlpha) {
      scene.player.setAlpha(0.85);
      // Create subtle shake effect
      if (scene.tweens) {
        scene.tweens.add({
          targets: scene.player,
          x: '+=2',
          duration: 100,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    }

    // Set vignette overlay if UI supports it
    scene.registry.set('ringRustActive', true);

    // Show game message
    scene.registry.set('gameMessage', 'RING RUST: Land 5 hits to shake it off!');
    scene.time.delayedCall(3000, function() {
      if (scene.registry) scene.registry.set('gameMessage', '');
    });
  },



  // Record a landed hit on enemy (call this when player lands an attack)
  recordRingRustHit: function(scene) {
    var cfg = this.RING_RUST;
    if (!scene || !scene.player || !scene.player.stats) return;
    if (!scene.player.stats.ringRustSpeedMod) return; // No ring rust active

    scene._ringRustHitsLanded = (scene._ringRustHitsLanded || 0) + 1;

    // Check if ring rust should be shaken off
    if (scene._ringRustHitsLanded >= cfg.SHAKE_OFF_HITS) {
      this.shakeOffRingRust(scene);
    } else {
      // Show progress
      var remaining = cfg.SHAKE_OFF_HITS - scene._ringRustHitsLanded;
      if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
        MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 45, remaining + ' more to shake off!', '#aaaaaa');
      }
    }
  },



  // Shake off ring rust debuffs
  shakeOffRingRust: function(scene) {
    var cfg = this.RING_RUST;
    if (!scene || !scene.player || !scene.player.stats) return;

    // Clear debuffs
    scene.player.stats.ringRustSpeedMod = 1;
    scene.player.stats.ringRustAccuracyMod = 1;

    // Mark as shaken off
    try {
      localStorage.setItem(cfg.SHAKEN_KEY, 'true');
    } catch(e) {}

    // Clear vignette
    scene.registry.set('ringRustActive', false);

    // Clear sluggish animation
    if (scene.player) {
      if (scene.player.setAlpha) scene.player.setAlpha(1);
      // Stop any shake tweens on player
      if (scene.tweens) {
        scene.tweens.killTweensOf(scene.player);
      }
    }

    // Show success message
    if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
      MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 60, 'RING RUST SHAKEN!', '#44ff44');
      scene.time.delayedCall(1200, function() {
        MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 45, 'SPEED RESTORED!', '#44ff44');
      });
    }

    scene.registry.set('gameMessage', 'RING RUST SHAKEN OFF!');
    scene.time.delayedCall(2000, function() {
      if (scene.registry) scene.registry.set('gameMessage', '');
    });
  },



  // Update ring rust shake-off window
  updateRingRust: function(scene, delta) {
    if (!scene._ringRustShakeWindow || !scene.player || !scene.player.stats.ringRustSpeedMod) return;

    scene._ringRustShakeWindow -= delta;

    // If time runs out, keep debuffs but reset hit counter
    if (scene._ringRustShakeWindow <= 0) {
      scene._ringRustHitsLanded = 0;
      scene._ringRustShakeWindow = this.RING_RUST.SHAKE_OFF_DURATION;
    }
  },



  // Record fight time for ring rust tracking (call on enemy defeat)
  recordFightTime: function() {
    try {
      localStorage.setItem(this.RING_RUST.STORAGE_KEY, String(Date.now()));
    } catch(e) {}
  },



  // Start a telegraphed attack: pauses enemy briefly, shows cue, then applies damage.
  // Implemented here so we don't have to touch combat.js.
  startTelegraphAttack: function(enemy, player, scene, dmg, delayMs, cueText, cueColor, attackType) {
    if (!this.TELEGRAPH || !this.TELEGRAPH.ENABLED) return false;
    if (!enemy || !player || !scene) return false;
    if (enemy._telegraph && enemy._telegraph.active) return false;

    var dx = player.x - enemy.x;
    var dy = player.y - enemy.y;
    var dist = Math.sqrt(dx*dx + dy*dy) || 1;
    if (dist > (this.TELEGRAPH.MAX_DIST_TO_PLAYER || 260)) return false;

    // Get aura color based on attack type for Fight IQ visual
    var auraColor = this.FIGHT_IQ.DEFAULT_COLOR;
    if (this.FIGHT_IQ.ENABLED && attackType) {
      auraColor = this.FIGHT_IQ.ATTACK_COLORS[attackType] || this.FIGHT_IQ.DEFAULT_COLOR;
    }

    enemy._telegraph = {
      active: true,
      timer: (typeof delayMs === 'number' ? delayMs : (this.TELEGRAPH.DEFAULT_MS || 120)),
      dmg: dmg,
      cueText: cueText || '...?',
      cueColor: cueColor || '#ffffff',
      attackType: attackType || null,
      auraColor: auraColor
    };

    // Visual cue near the enemy.
    if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
      MMA.UI.showDamageText(scene, enemy.x, enemy.y - 45, enemy._telegraph.cueText, enemy._telegraph.cueColor);
    }

    // Fight IQ Aura Read: create colored halo around enemy during telegraph
    if (this.FIGHT_IQ.ENABLED && scene.add) {
      var cfg = this.FIGHT_IQ;
      var auraDist = cfg.AURA_DISTANCE || 18;

      // Calculate direction to player for positioning the aura
      var angleToPlayer = Math.atan2(dy, dx);

      // Create multiple aura circles for a pulsing effect
      var numAuras = 3;
      for (var i = 0; i < numAuras; i++) {
        var offsetAngle = angleToPlayer + (i - 1) * 0.5;
        var auraX = enemy.x + Math.cos(offsetAngle) * auraDist;
        var auraY = enemy.y + Math.sin(offsetAngle) * auraDist;

        var aura = scene.add.circle(auraX, auraY, 6 + i * 2, auraColor, cfg.AURA_OPACITY - i * 0.15);
        aura.setDepth(enemy.depth - 1);

        // Store reference to clean up later
        if (!enemy._fightIQAuras) enemy._fightIQAuras = [];
        enemy._fightIQAuras.push(aura);

        // Pulse animation
        if (cfg.AURA_PULSE && scene.tweens) {
          scene.tweens.add({
            targets: aura,
            alpha: cfg.AURA_OPACITY * 0.3,
            scale: 1.3,
            duration: 150,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
        }
      }
    }

    return true;
  },



  // Update telegraph timer; returns true if we handled enemy this frame.
  updateTelegraphAttack: function(enemy, player, scene, delta) {
    if (!enemy || !enemy._telegraph || !enemy._telegraph.active) return false;

    // Freeze enemy while telegraphing.
    if (enemy.setVelocity) enemy.setVelocity(0, 0);

    enemy._telegraph.timer -= delta;
    if (enemy._telegraph.timer <= 0) {
      // Apply damage when telegraph completes.
      if (enemy._telegraph.dmg && enemy._telegraph.dmg > 0) {
        window.MMA.Enemies.damagePlayer(enemy, scene, enemy._telegraph.dmg);
      }
      enemy._telegraph.active = false;

      // Clean up Fight IQ auras
      if (enemy._fightIQAuras && enemy._fightIQAuras.length > 0) {
        enemy._fightIQAuras.forEach(function(aura) {
          if (aura && aura.destroy) aura.destroy();
        });
        enemy._fightIQAuras = [];
      }
    }

    return true;
  },



  // Called when player lands an attack - records move and returns defense multiplier (lower = more damage)
  onPlayerAttack: function(scene, enemy, moveKey, damageDealt) {
    this.initAdaptiveTracking(scene);
    this.recordPlayerAttack(scene, moveKey);

    // Ring Rust: record landed hit to potentially shake off rust
    this.recordRingRustHit(scene);

    // Enemy Combo Memory: record attack for long-term pattern learning
    this.recordComboMemoryAttack(scene, enemy, moveKey);
    // Check if combo memory should trigger adaptation
    this.checkComboMemoryAdaptation(enemy, scene);

    // Rival Echo System: track player moves to detect repetition (fails clear if repeated)
    if (enemy && enemy.type && enemy.type.isRivalEcho) {
      var repeated = this.checkRivalEchoClearAttempt(moveKey);
      if (repeated) {
        this._echoMoveRepeated = true;
        // Show warning that echo cannot be cleared
        if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
          MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 45, 'MOVE REPEATED!', '#8844ff');
        }
      }
    }

    var adaptiveDef = this.getAdaptiveDefense(enemy, scene);
    var styleCounterDef = this.getStyleCounterDefenseMult(enemy, moveKey);

    // Show ADAPTED! feedback when enemy adapts to player's style
    if (adaptiveDef > 1) {
      this.showAdaptiveFeedback(scene, enemy);
    }

    // Apply vengeance defense penalty (player hits harder)
    var vengeanceDef = this.getVengeanceDefenseMult(enemy);

    // Territory Control: +defense on turf, -defense off turf
    var territoryDef = (this.getTerritoryDefenseMultiplier) ? this.getTerritoryDefenseMultiplier(enemy, scene) : 1;

    // Predator Patience: preemptive strike bonus during elite "size up" window.
    var predatorDef = (this.getPredatorPatienceDefenseMult) ? this.getPredatorPatienceDefenseMult(enemy) : 1;

    // Enemy Combo Memory: defense bonus against player's learned patterns
    var comboMemoryDef = this.getComboMemoryDefenseMult(enemy, moveKey);

    // Weight Class Advantage: light vs heavy / heavy vs light damage dynamic.
    var weightAdvDef = (this.getWeightClassDefenseMult) ? this.getWeightClassDefenseMult(enemy, moveKey, scene) : 1;

    // Track damage for Enemy Fear Tremble intensity scaling
    if (enemy && damageDealt > 0) {
      if (!enemy._recentDamage) enemy._recentDamage = 0;
      enemy._recentDamage += damageDealt;
      // Cap at a reasonable maximum to prevent extreme trembling
      enemy._recentDamage = Math.min(enemy._recentDamage, 50);
    }

    return adaptiveDef * styleCounterDef * vengeanceDef * territoryDef * predatorDef * comboMemoryDef * weightAdvDef;
  },



  // Show adaptive feedback text
  showAdaptiveFeedback: function(scene, enemy) {
    if (!scene._playerAttackHistory || scene._playerAttackHistory.length < 3) return;

    var counts = {};
    scene._playerAttackHistory.forEach(function(type) {
      counts[type] = (counts[type] || 0) + 1;
    });

    var maxType = null, maxCount = 0;
    Object.keys(counts).forEach(function(type) {
      if (counts[type] > maxCount) {
        maxCount = counts[type];
        maxType = type;
      }
    });

    if (maxCount >= 3 && maxType !== 'unknown') {
      MMA.UI.showDamageText(scene, enemy.x, enemy.y - 55, 'ADAPTED!', '#00ffff');
    }
  },



  // Check if enemy should enter mirror match mode (player low HP)
  checkMirrorMatch: function(enemy, scene) {
    var cfg = this.MIRROR_MATCH_CONFIG;
    if (!cfg) return false;
    if (!scene || !scene.player || !scene.player.stats) return false;
    if (enemy._mirrorMatchActive) return true; // Already active

    // Check cooldown
    if (enemy._mirrorMatchCooldown && Date.now() < enemy._mirrorMatchCooldown) return false;

    // Check player HP threshold
    var pHp = scene.player.stats.hp || 0;
    var pMax = scene.player.stats.maxHp || 1;
    if (pMax <= 0) return false;
    if (pHp / pMax > cfg.PLAYER_HP_THRESHOLD) return false;

    // Check if enemy type is eligible (non-boss, non-specialist)
    if (enemy.isBoss) return false;
    var ai = enemy.type && enemy.type.aiPattern;
    if (ai === 'regen' || ai === 'glitcher' || ai === 'echo' || ai === 'drunkMonk' || ai === 'feintMaster' || ai === 'trickster') return false;

    // Get player's recent attack moves
    var recentMoves = (scene._playerAttackMoveKeys || []).slice(-cfg.MIRROR_COUNT);
    if (recentMoves.length < 2) return false; // Need at least 2 moves to mirror

    // Activate mirror match
    enemy._mirrorMatchActive = true;
    enemy._mirrorMatchMoves = recentMoves;
    enemy._mirrorMatchIdx = 0;
    enemy._mirrorMatchTimer = cfg.MIRROR_WINDOW_MS;
    enemy._mirrorMatchCooldown = Date.now() + cfg.COOLDOWN_MS;

    // Show warning
    if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
      MMA.UI.showDamageText(scene, enemy.x, enemy.y - 50, cfg.WARNING_TEXT, '#ff66ff');
    }

    return true;
  },



  // Update mirror match state - call this in enemy AI
  updateMirrorMatch: function(enemy, scene, delta) {
    var cfg = this.MIRROR_MATCH_CONFIG;
    if (!enemy._mirrorMatchActive) return null;

    enemy._mirrorMatchTimer -= delta;

    // Check if mirror mode expired
    if (enemy._mirrorMatchTimer <= 0) {
      enemy._mirrorMatchActive = false;
      enemy._mirrorMatchMoves = null;
      enemy._mirrorMatchIdx = 0;
      return null;
    }

    // Return current mirrored move if ready to attack
    if (enemy._mirrorMatchMoves && enemy._mirrorMatchIdx < enemy._mirrorMatchMoves.length) {
      return enemy._mirrorMatchMoves[enemy._mirrorMatchIdx];
    }

    return null;
  },



  // Consume mirrored move after attack
  consumeMirrorMove: function(enemy) {
    if (!enemy._mirrorMatchActive) return;
    enemy._mirrorMatchIdx++;
    // If all moves used, reset for next attack cycle
    if (enemy._mirrorMatchIdx >= enemy._mirrorMatchMoves.length) {
      enemy._mirrorMatchIdx = 0;
    }
  },



  // Check if an elite enemy can break coordination and attack without token
  canEliteBreakCoordination: function(enemy) {
    if (!this.ELITE_COORDINATION_BREAK || !this.ELITE_COORDINATION_BREAK.ENABLED) return false;
    if (!enemy || !enemy.isElite) return false;
    if (enemy.isBoss) return false; // bosses already bypass token

    // Check cooldown since last elite strike text
    var now = Date.now();
    if (enemy._lastEliteStrikeTime && (now - enemy._lastEliteStrikeTime) < this.ELITE_COORDINATION_BREAK.COOLDOWN_MS) {
      return false;
    }

    return Math.random() < this.ELITE_COORDINATION_BREAK.CHANCE;
  },



  // Record elite strike for cooldown tracking and optionally show floating text
  recordEliteStrike: function(enemy, scene, showText) {
    enemy._lastEliteStrikeTime = Date.now();
    if (showText && scene && typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
      MMA.UI.showDamageText(scene, enemy.x, enemy.y - 40, 'ELITE STRIKE!', '#ff00ff');
    }
  },



  // Check if enemy should taunt
  checkEnemyTaunt: function(enemy, scene, delta) {
    var cfg = this.TAUNT_CONFIG;
    if (!cfg || !cfg.ENABLED) return false;
    if (!scene || !scene.player || !enemy) return false;
    
    var zone = scene.currentZone || 1;
    if (zone < cfg.MIN_ZONE) return false;
    
    // Bosses and elites don't taunt (they have other mechanics)
    if (enemy.isBoss || enemy.isElite) return false;
    
    // Can't taunt while staggered, fleeing, or dead
    if (enemy.state === 'dead' || enemy.isFleeing || enemy.staggerTimer > 0) return false;
    
    // Check cooldown
    if (!enemy._tauntCooldown) enemy._tauntCooldown = 0;
    enemy._tauntCooldown -= delta;
    if (enemy._tauntCooldown > 0) return false;
    
    // Check chance
    if (Math.random() > cfg.CHANCE) return false;
    
    // Get taunt line based on AI pattern
    var ai = enemy.type && enemy.type.aiPattern;
    var lines = cfg.TAUNT_LINES[ai] || cfg.TAUNT_LINES['default'];
    var line = lines[Math.floor(Math.random() * lines.length)];
    
    // Execute the taunt
    this.executeEnemyTaunt(enemy, scene, line);
    
    return true;
  },



  // Execute enemy taunt
  executeEnemyTaunt: function(enemy, scene, line) {
    var cfg = this.TAUNT_CONFIG;
    
    // Set cooldown
    enemy._tauntCooldown = cfg.COOLDOWN_MS;
    
    // Show taunt text above enemy
    if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
      MMA.UI.showDamageText(scene, enemy.x, enemy.y - 60, cfg.TAUNT_EMOTE + ' ' + line, cfg.TAUNT_TEXT_COLOR);
    }
    
    // Apply player Focus reduction
    if (scene.player && scene.player.stats && cfg.FOCUS_REDUCTION > 0) {
      scene.player.stats.focus = Math.max(0, (scene.player.stats.focus || 0) - cfg.FOCUS_REDUCTION);
      // Update Focus UI if available
      if (scene.registry) {
        scene.registry.set('focus', scene.player.stats.focus);
      }
    }
    
    // Apply damage bonus to taunting enemy
    if (cfg.DAMAGE_BONUS > 0) {
      enemy._tauntDamageBonus = cfg.DAMAGE_BONUS;
      enemy._tauntBonusTimer = cfg.DURATION_MS;
    }
    
    // Visual effect: enemy pulses to show confidence
    if (scene.tweens) {
      scene.tweens.add({
        targets: enemy,
        alpha: 0.5,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 150,
        yoyo: true,
        ease: 'Sine.easeInOut'
      });
    }
  },



  // Update taunt timers and effects
  updateEnemyTaunts: function(enemy, delta) {
    if (!enemy._tauntBonusTimer) return;
    
    enemy._tauntBonusTimer -= delta;
    if (enemy._tauntBonusTimer <= 0) {
      enemy._tauntBonusTimer = 0;
      enemy._tauntDamageBonus = 0;
    }
  },



  checkGangUpCoordination: function(scene, delta) {
    if (!this.GANG_UP_CONFIG || !this.GANG_UP_CONFIG.ENABLED) return;
    if (!scene || !scene.enemies || !scene.player) return;
    
    if (!scene._gangUpCooldown) scene._gangUpCooldown = 0;
    scene._gangUpCooldown -= delta;
    if (scene._gangUpCooldown > 0) return;
    
    var enemies = scene.enemies.filter(function(e) {
      return e && e.active && e.state !== 'dead' && !e.isBoss && !e.isFleeing && !e.isSizingUp;
    });
    
    if (enemies.length < this.GANG_UP_CONFIG.MIN_ENEMIES) return;
    if (Math.random() > 0.004 * (delta / 16)) return;
    
    var distractor = null;
    var minDist = Infinity;
    var player = scene.player;
    
    enemies.forEach(function(e) {
      var dx = e.x - player.x;
      var dy = e.y - player.y;
      var dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < minDist) {
        minDist = dist;
        distractor = e;
      }
    });
    
    if (!distractor) return;
    
    var flankers = [];
    var dx = distractor.x - player.x;
    var dy = distractor.y - player.y;
    var baseAngle = Math.atan2(dy, dx);
    
    var self = this;
    enemies.forEach(function(e) {
      if (e === distractor) return;
      var ex = e.x - player.x;
      var ey = e.y - player.y;
      var angle = Math.atan2(ey, ex);
      var angleDiff = Math.abs(angle - baseAngle);
      if (angleDiff > self.GANG_UP_CONFIG.FLANK_ANGLE && angleDiff < Math.PI - self.GANG_UP_CONFIG.FLANK_ANGLE) {
        flankers.push(e);
      }
    });
    
    if (flankers.length < 2) {
      flankers = enemies.filter(function(e) { return e !== distractor; }).slice(0, 2);
    }
    
    if (flankers.length < 1) return;
    
    this._triggerGangUp(scene, distractor, flankers);
  },



  _triggerGangUp: function(scene, distractor, flankers) {
    var cfg = this.GANG_UP_CONFIG;
    scene._gangUpCooldown = cfg.COOLDOWN_MS;
    
    distractor._isGangUpDistractor = true;
    distractor._gangUpTimer = cfg.WARNING_MS + cfg.DISTRACT_DURATION;
    flankers.forEach(function(f) {
      f._isGangUpFlanker = true;
      f._gangUpTimer = cfg.WARNING_MS + cfg.ATTACK_WINDOW_MS;
      f._gangUpTargetAngle = Math.atan2(scene.player.y - f.y, scene.player.x - f.x);
    });
    
    var warningText = ['GANG UP!', 'COORDINATED!', 'FLANK HIM!'][Math.floor(Math.random() * 3)];
    MMA.UI.showDamageText(scene, distractor.x, distractor.y - 55, warningText, '#ff8800');
    
    var warningCircle = scene.add.circle(scene.player.x, scene.player.y, 60, 0xff8800, 0.3);
    warningCircle.setDepth(scene.player.depth + 10);
    
    scene.tweens.add({
      targets: warningCircle,
      alpha: 0.1,
      scale: 1.3,
      duration: 200,
      yoyo: true,
      repeat: 4,
      onComplete: function() {
        warningCircle.destroy();
      }
    });
    
    var self = this;
    scene.time.delayedCall(cfg.WARNING_MS, function() {
      if (!distractor || !distractor.active || distractor.state === 'dead') return;
      
      var dmg = Math.round(distractor.type.attackDamage * cfg.DISTRACTOR_DAMAGE);
      if (distractor.hasAttackToken || distractor.isBoss) {
        MMA.Enemies.damagePlayer(distractor, scene, dmg);
        MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 35, ' DISTRACTED!', '#ff8800');
        scene.player._gangUpStunTimer = cfg.DISTRACT_DURATION;
      }
      
      flankers.forEach(function(flanker, idx) {
        if (!flanker || !flanker.active || flanker.state === 'dead') return;
        
        scene.time.delayedCall(150 + idx * 200, function() {
          if (!flanker || !flanker.active || flanker.state === 'dead') return;
          
          var flankerDmg = Math.round(flanker.type.attackDamage * cfg.FLANKER_DAMAGE_MULT);
          if (flanker.hasAttackToken || flanker.isBoss) {
            MMA.Enemies.damagePlayer(flanker, scene, flankerDmg);
            MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 35 - (idx * 15), 'FLANKED!', '#ff4444');
          }
        });
      });
      
      scene.time.delayedCall(cfg.WARNING_MS + cfg.ATTACK_WINDOW_MS, function() {
        if (distractor) distractor._isGangUpDistractor = false;
        flankers.forEach(function(f) {
          if (f) {
            f._isGangUpFlanker = false;
            f._gangUpTimer = 0;
          }
        });
      });
    });
  },



  updateGangUp: function(enemy, delta) {
    if (!enemy._gangUpTimer) return;
    enemy._gangUpTimer -= delta;
    if (enemy._gangUpTimer <= 0) {
      enemy._isGangUpDistractor = false;
      enemy._isGangUpFlanker = false;
      enemy._gangUpTimer = 0;
    }
  },



  checkSwarmBehavior: function(scene, delta) {
    if (!this.SWARM_CONFIG || !this.SWARM_CONFIG.ENABLED) return;
    if (!scene || !scene.enemies || !scene.player) return;
    if (scene._swarmActive) return;
    
    if (!scene._swarmCooldown) scene._swarmCooldown = 0;
    scene._swarmCooldown -= delta;
    if (scene._swarmCooldown > 0) return;
    
    var candidates = scene.enemies.filter(function(e) {
      if (!e || !e.active || e.state === 'dead') return false;
      if (e.isBoss || e.isElite) return false;
      var ai = e.type && e.type.aiPattern;
      if (ai === 'coach' || ai === 'regen' || ai === 'glitcher' || ai === 'echo' || ai === 'tutor' || ai === 'feintMaster' || ai === 'trickster') return false;
      return true;
    });
    
    if (candidates.length < this.SWARM_CONFIG.MIN_MEMBERS) return;
    
    var visited = [];
    var self = this;
    
    function findNearbyGroup(enemy, radius) {
      var group = [enemy];
      candidates.forEach(function(other) {
        if (other === enemy || visited.indexOf(other) !== -1) return;
        var dx = other.x - enemy.x;
        var dy = other.y - enemy.y;
        if (Math.sqrt(dx*dx + dy*dy) <= radius) {
          group.push(other);
        }
      });
      return group;
    }
    
    var bestGroup = null;
    var bestSize = 0;
    
    for (var i = 0; i < candidates.length; i++) {
      if (visited.indexOf(candidates[i]) !== -1) continue;
      var group = findNearbyGroup(candidates[i], self.SWARM_CONFIG.MERGE_RADIUS);
      if (group.length > bestSize) {
        bestSize = group.length;
        bestGroup = group;
        group.forEach(function(e) { visited.push(e); });
      }
    }
    
    if (!bestGroup || bestGroup.length < this.SWARM_CONFIG.MIN_MEMBERS) return;
    if (Math.random() > 0.003) return;
    
    this._formSwarm(scene, bestGroup);
  },



  _formSwarm: function(scene, members) {
    var cfg = this.SWARM_CONFIG;
    scene._swarmActive = true;
    scene._swarmCooldown = cfg.MERGE_COOLDOWN_MS;
    scene._swarmTimer = cfg.SWARM_DURATION;
    scene._swarmMembers = members;
    
    var totalHp = 0;
    var centerX = 0, centerY = 0;
    
    members.forEach(function(e) {
      totalHp += e.stats.hp;
      centerX += e.x;
      centerY += e.y;
    });
    
    centerX /= members.length;
    centerY /= members.length;
    
    var self = this;
    members.forEach(function(e) {
      e._isSwarming = true;
      e._swarmCenterX = centerX;
      e._swarmCenterY = centerY;
    });
    
    var swarmCircle = scene.add.circle(centerX, centerY, 50, 0xff00ff, 0.2);
    swarmCircle.setDepth(100);
    scene._swarmVisual = swarmCircle;
    
    scene.tweens.add({
      targets: swarmCircle,
      alpha: 0.4,
      scale: 1.4,
      duration: 400,
      yoyo: true,
      repeat: -1
    });
    
    MMA.UI.showDamageText(scene, centerX, centerY - 60, cfg.FORM_TEXT, '#ff00ff');
    
    members.forEach(function(e) {
      e._swarmAttackSpeedMod = 1 + cfg.ATTACK_SPEED_BONUS;
      e._swarmDamageMod = 1 + cfg.DAMAGE_BONUS;
    });
    
    scene.time.delayedCall(cfg.SWARM_DURATION, function() {
      if (scene._swarmActive) {
        self._breakSwarm(scene);
      }
    });
  },



  _breakSwarm: function(scene, splitByDamage) {
    if (!scene._swarmActive) return;
    
    var members = scene._swarmMembers || [];
    var cfg = this.SWARM_CONFIG;
    
    scene._swarmActive = false;
    scene._swarmMembers = null;
    
    if (scene._swarmVisual) {
      scene._swarmVisual.destroy();
      scene._swarmVisual = null;
    }
    
    members.forEach(function(e) {
      if (e && e.active) {
        e._isSwarming = false;
        e._swarmAttackSpeedMod = 1;
        e._swarmDamageMod = 1;
        e._swarmCenterX = null;
        e._swarmCenterY = null;
      }
    });
    
    if (splitByDamage) {
      MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 50, cfg.SPLIT_TEXT, '#ff4444');
    }
  },



  updateSwarm: function(scene, delta) {
    if (!scene._swarmActive) return;
    
    var cfg = this.SWARM_CONFIG;
    scene._swarmTimer -= delta;
    
    if (scene._swarmVisual && scene._swarmMembers) {
      var centerX = 0, centerY = 0, aliveCount = 0;
      scene._swarmMembers.forEach(function(e) {
        if (e && e.active && e.state !== 'dead') {
          centerX += e.x;
          centerY += e.y;
          aliveCount++;
        }
      });
      
      if (aliveCount > 0) {
        centerX /= aliveCount;
        centerY /= aliveCount;
        scene._swarmVisual.x = centerX;
        scene._swarmVisual.y = centerY;
      }
    }
    
    if (scene._swarmTimer <= 0) {
      this._breakSwarm(scene);
    }
  },



  getSwarmDamageMult: function(enemy) {
    if (!enemy || !enemy._isSwarming) return 1;
    return enemy._swarmDamageMod || 1;
  },



  getSwarmAttackSpeedMult: function(enemy) {
    if (!enemy || !enemy._isSwarming) return 1;
    return enemy._swarmAttackSpeedMod || 1;
  },


  // Pack damage multiplier helper
  getPackDamageMultiplier: function(enemy, scene) {
    if (!enemy || !scene) return 1;
    const PACK_RADIUS = 100;
    // Count nearby allies (excluding self) that are active and not dead
    var allies = (scene.enemies || []).filter(function(other) {
      if (other === enemy) return false;
      if (!other.active || other.state === 'dead') return false;
      var dx = other.x - enemy.x, dy = other.y - enemy.y;
      return Math.sqrt(dx*dx + dy*dy) <= PACK_RADIUS;
    });
    var count = allies.length;
    if (count <= 0) return 1;
    // Each ally gives +10% damage, capped at +30%
    var bonus = Math.min(count * 0.10, 0.30);
    return 1 + bonus;
  },



  // Check and execute boss phase shifts
  checkPhaseShift: function(enemy, scene) {
    if (!enemy || !enemy.isBoss) return false;
    var config = this.PHASE_SHIFT_CONFIG;
    var hpPct = enemy.stats.hp / enemy.stats.maxHp;

    // Check each threshold
    for (var i = 0; i < config.THRESHOLDS.length; i++) {
      var threshold = config.THRESHOLDS[i];
      var phaseKey = 'phaseShift_' + threshold;

      // If HP crossed threshold and haven't triggered this phase yet
      if (hpPct <= threshold && !enemy[phaseKey]) {
        enemy[phaseKey] = true;  // Mark as triggered
        this.executePhaseShift(enemy, scene, i);
        return true;
      }
    }
    return false;
  },



  // Execute phase shift on boss
  executePhaseShift: function(enemy, scene, phaseIndex) {
    var config = this.PHASE_SHIFT_CONFIG;
    var phase = config.PHASES[phaseIndex];

    // Mark as phase shifting (invulnerable)
    enemy.isPhaseShifting = true;
    enemy.phaseShiftTimer = config.INVULN_DURATION;

    // Store original stats if first phase
    if (!enemy._originalPhaseStats) {
      enemy._originalPhaseStats = {
        attackDamage: enemy.type.attackDamage,
        attackCooldownMax: enemy.type.attackCooldownMax,
        aiPattern: enemy.type.aiPattern
      };
    }

    // Apply phase bonuses
    enemy.type.attackDamage = Math.round(enemy._originalPhaseStats.attackDamage * phase.damageMult);
    enemy.type.attackCooldownMax = Math.round(enemy._originalPhaseStats.attackCooldownMax / phase.attackSpeedMult);
    enemy.type.aiPattern = phase.aiTo;  // Change AI pattern

    // Visual effects
    enemy.setTint(phase.tint);

    // Show phase text
    if (MMA.UI && MMA.UI.showDamageText) {
      MMA.UI.showDamageText(scene, enemy.x, enemy.y - 70, phase.text, '#ffffff');
    }

    // Show invulnerability indicator
    var invulnCircle = scene.add.circle(enemy.x, enemy.y, enemy.displayWidth, 0xffff00, 0.3);
    scene.tweens.add({
      targets: invulnCircle,
      alpha: 0,
      scale: 1.5,
      duration: config.INVULN_DURATION,
      onComplete: function() { invulnCircle.destroy(); }
    });

    // Screen flash for dramatic effect
    scene.cameras.main.flash(200, 255, 255, 255);

    // Update boss message
    scene.registry.set('gameMessage', phase.text);
    scene.time.delayedCall(1500, function() { scene.registry.set('gameMessage', ''); });

    // After invulnerability, clear tint and continue
    scene.time.delayedCall(config.INVULN_DURATION, function() {
      enemy.isPhaseShifting = false;
      // Keep phase tint but add slight pulsing to show ongoing transformation
      scene.tweens.add({
        targets: enemy,
        alpha: 0.75,
        duration: 300,
        yoyo: true,
        repeat: 2,
        onComplete: function() { enemy.setTint(phase.tint); }
      });
    });
  },



  // Update phase shift timers
  updatePhaseShift: function(enemy, delta) {
    if (!enemy || !enemy.isPhaseShifting) return;

    enemy.phaseShiftTimer -= delta;
    if (enemy.phaseShiftTimer <= 0) {
      enemy.isPhaseShifting = false;
    }
  },



  // Apply phase shift damage multiplier when attacking
  getPhaseShiftDamageMult: function(enemy) {
    if (!enemy || !enemy._originalPhaseStats) return 1;
    // Find which phase we're in based on triggered flags
    var config = this.PHASE_SHIFT_CONFIG;
    for (var i = config.THRESHOLDS.length - 1; i >= 0; i--) {
      var threshold = config.THRESHOLDS[i];
      var phaseKey = 'phaseShift_' + threshold;
      if (enemy[phaseKey]) {
        return config.PHASES[i].damageMult;
      }
    }
    return 1;
  },



  getTerritoryAttackMultiplier: function(enemy, scene) {
    if (!enemy || !scene) return 1;
    if (!enemy.homeRoomId) return 1;

    var curRoom = scene.currentRoomId || scene.roomId || null;
    if (!curRoom || curRoom !== enemy.homeRoomId) return 1;

    // If we don't have a home anchor, treat as no bonus.
    if (enemy.homeX === undefined || enemy.homeY === undefined) return 1;

    var dx = enemy.x - enemy.homeX;
    var dy = enemy.y - enemy.homeY;
    var dist = Math.sqrt(dx*dx + dy*dy);
    if (dist > this.TERRITORY_CONFIG.HOME_RADIUS) return 1;

    // One-time toast per enemy per room entry.
    if (!enemy._territoryShown && typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
      enemy._territoryShown = true;
      MMA.UI.showDamageText(scene, enemy.x, enemy.y - 55, 'HOME TURF!', '#66ccff');
    }

    return 1 + this.TERRITORY_CONFIG.ATTACK_BONUS;
  },



  // Territory Control: defense modifier (implemented as damage scaling via onPlayerAttack defense multiplier).
  // - On turf (home room + within radius): enemy effectively has +5% defense (player deals ~5% less damage)
  // - Off turf: enemy effectively has -15% defense (player deals ~15% more damage)
  getTerritoryDefenseMultiplier: function(enemy, scene) {
    if (!enemy || !scene) return 1;
    if (!enemy.homeRoomId) return 1;

    var curRoom = scene.currentRoomId || scene.roomId || null;
    var onHomeRoom = !!(curRoom && curRoom === enemy.homeRoomId);

    // No home anchor => can't evaluate.
    if (enemy.homeX === undefined || enemy.homeY === undefined) return 1;

    var dx = enemy.x - enemy.homeX;
    var dy = enemy.y - enemy.homeY;
    var dist = Math.sqrt(dx*dx + dy*dy);
    var onTurf = onHomeRoom && (dist <= this.TERRITORY_CONFIG.HOME_RADIUS);

    // Toast once when forced away from turf (but only if we have a valid home room).
    if (!onTurf && !enemy._territoryAwayShown && typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
      enemy._territoryAwayShown = true;
      MMA.UI.showDamageText(scene, enemy.x, enemy.y - 55, 'OUT OF TURF!', '#ffaa66');
    }
    if (onTurf) {
      enemy._territoryAwayShown = false;
    }

    if (onTurf) return 1.05;
    // If the enemy left its home room OR is too far from its anchor, make it easier to damage.
    return 0.85;
  },



  _ensureTagTeams: function(scene) {
    if (!this.TAG_TEAM.ENABLED) return;
    var z = scene.currentZone || 1;
    if (z < this.TAG_TEAM.MIN_ZONE) return;

    var roomId = scene.currentRoomId || 'unknown';
    if (scene._tagTeamRoomId === roomId && scene._tagTeamPairs) return;

    scene._tagTeamRoomId = roomId;
    scene._tagTeamPairs = [];

    // Pair up non-boss, non-coach enemies.
    var fighters = (scene.enemies || []).filter(function(e) {
      return e && e.active && e.state !== 'dead' && !e.isBoss && e.typeKey !== 'coach' && e.typeKey !== 'shadowRival';
    });

    // Shuffle for variety
    for (var i = fighters.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = fighters[i]; fighters[i] = fighters[j]; fighters[j] = tmp;
    }

    for (var p = 0; p < fighters.length - 1; p += 2) {
      var a = fighters[p], b = fighters[p + 1];
      if (!a || !b) continue;
      var pairId = 'tt_' + roomId + '_' + p;
      a.tagTeamPairId = pairId;
      b.tagTeamPairId = pairId;
      scene._tagTeamPairs.push({ id: pairId, a: a, b: b, active: a, nextSwapAt: Date.now() + this.TAG_TEAM.SWAP_MS });
    }
  },



  _updateTagTeams: function(scene, delta) {
    if (!scene._tagTeamPairs || !scene._tagTeamPairs.length) return;

    var now = Date.now();
    for (var i = 0; i < scene._tagTeamPairs.length; i++) {
      var pair = scene._tagTeamPairs[i];
      if (!pair || !pair.a || !pair.b) continue;
      if (!pair.a.active || pair.a.state === 'dead' || !pair.b.active || pair.b.state === 'dead') continue;

      if (now >= pair.nextSwapAt) {
        pair.active = (pair.active === pair.a) ? pair.b : pair.a;
        pair.nextSwapAt = now + this.TAG_TEAM.SWAP_MS;
      }

      // Mark resting/active for downstream AI logic.
      pair.a.isResting = (pair.active !== pair.a);
      pair.b.isResting = (pair.active !== pair.b);

      // Resting partner recovers attack cooldown faster.
      var rest = pair.a.isResting ? pair.a : pair.b;
      if (rest && rest.attackCooldown > 0) rest.attackCooldown = Math.max(0, rest.attackCooldown - delta * 1.5);

      // Encourage resting partner to flank and keep distance.
      if (rest && scene.player) {
        var dx = rest.x - scene.player.x;
        var dy = rest.y - scene.player.y;
        var dist = Math.sqrt(dx*dx + dy*dy) || 1;
        if (dist < this.TAG_TEAM.REST_DISTANCE) {
          var ang = Math.atan2(dy, dx) + (Math.random() < 0.5 ? this.TAG_TEAM.FLANK_ANGLE : -this.TAG_TEAM.FLANK_ANGLE);
          var spd = (rest.type && rest.type.speed ? rest.type.speed : 80);
          rest.setVelocity(Math.cos(ang) * spd, Math.sin(ang) * spd);
        }
      }
    }
  },



  coordination: {
    COOLDOWN_MS: 2600,
    DURATION_MS: 1400,
    RETREAT_THRESHOLD: 0.22,
    checkCoordination: function(scene, delta) {
      if (!scene || !scene.player || !scene.enemies) return;
      if (scene._mmaCoordinationCooldown === undefined) scene._mmaCoordinationCooldown = 0;
      if (scene._mmaCoordinationCooldown > 0) {
        scene._mmaCoordinationCooldown -= delta;
        if (scene._mmaCoordinationCooldown < 0) scene._mmaCoordinationCooldown = 0;
      }
      if (scene._mmaCoordinationCooldown > 0) return;

      var fighters = scene.enemies.filter(function(e) {
        return e && e.active && e.state !== 'dead' && !e.isBoss && !e.isFleeing;
      });
      if (fighters.length < 2) return;
      if (Math.random() > 0.005 * (delta / 16)) return;

      var leader = fighters[Math.floor(Math.random() * fighters.length)];
      var flankers = fighters.filter(function(e) { return e !== leader; }).slice(0, 2);
      if (!leader || !flankers.length) return;

      var callout = ['FLANK HIM!', 'PRESS NOW!', 'CUT HIM OFF!'][Math.floor(Math.random() * 3)];
      if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
        MMA.UI.showDamageText(scene, leader.x, leader.y - 46, callout, '#ff8800');
      }

      leader.coordinationRole = 'press';
      leader.coordinationTimer = this.DURATION_MS;
      for (var i = 0; i < flankers.length; i++) {
        flankers[i].coordinationRole = 'flank';
        flankers[i].coordinationSide = i === 0 ? 1 : -1;
        flankers[i].coordinationTimer = this.DURATION_MS + i * 160;
      }

      scene._mmaCoordinationCooldown = this.COOLDOWN_MS;
    },

    updateEnemy: function(enemy, player, scene, delta) {
      if (!enemy || !player || !enemy.coordinationTimer) return false;

      enemy.coordinationTimer -= delta;
      if (enemy.coordinationTimer <= 0) {
        enemy.coordinationTimer = 0;
        enemy.coordinationRole = null;
        enemy.coordinationSide = 0;
        return false;
      }

      var dx = player.x - enemy.x;
      var dy = player.y - enemy.y;
      var dist = Math.sqrt(dx * dx + dy * dy) || 1;
      var hpRatio = enemy.stats && enemy.stats.maxHp ? (enemy.stats.hp / enemy.stats.maxHp) : 1;
      var retreat = hpRatio <= this.RETREAT_THRESHOLD;
      var speed = enemy.type && enemy.type.speed ? enemy.type.speed : (enemy.baseSpeed || 80);

      if (retreat) {
        enemy.setVelocity(-(dx / dist) * speed * 1.2, -(dy / dist) * speed * 1.2);
        return true;
      }

      if (enemy.coordinationRole === 'press') {
        enemy.setVelocity((dx / dist) * speed * 1.08, (dy / dist) * speed * 1.08);
        return true;
      }

      if (enemy.coordinationRole === 'flank') {
        var angle = Math.atan2(dy, dx) + ((enemy.coordinationSide || 1) * 0.9);
        var targetX = player.x - Math.cos(angle) * 74;
        var targetY = player.y - Math.sin(angle) * 74;
        var tx = targetX - enemy.x;
        var ty = targetY - enemy.y;
        var flankDist = Math.sqrt(tx * tx + ty * ty) || 1;
        enemy.setVelocity((tx / flankDist) * speed * 1.04, (ty / flankDist) * speed * 1.04);
        return true;
      }

      return false;
    }
  },



  _playEnemyAnimation: function(scene, enemy, animationKey) {
    if (!scene || !enemy || !window.MMA || !MMA.Sprites || typeof MMA.Sprites.playEnemyAnimation !== 'function') return null;
    return MMA.Sprites.playEnemyAnimation(enemy, animationKey, scene);
  },



  _didPlayerRecentlyAttack: function(scene, windowMs) {
    if (!scene || !scene.player) return false;
    var now = scene.time && typeof scene.time.now === 'number' ? scene.time.now : Date.now();
    return !!(scene.player._mmaLastAttackAt && now - scene.player._mmaLastAttackAt <= (windowMs || 240));
  },


  _getPlayerStyle: function(scene) {
    // Best-effort inference without touching other files.
    // If the game already tracks style, respect it.
    try {
      if (scene && scene.player && scene.player.stats && scene.player.stats.dominantStyle) return scene.player.stats.dominantStyle;
      if (scene && scene.player && scene.player.dominantStyle) return scene.player.dominantStyle;
    } catch(e) {}

    var moves = (scene && scene.player && scene.player.unlockedMoves) ? scene.player.unlockedMoves : [];
    var g = 0, s = 0;
    for (var i=0; i<moves.length; i++) {
      var k = (moves[i] || '').toLowerCase();
      if (k.indexOf('takedown') !== -1 || k.indexOf('throw') !== -1 || k.indexOf('armbar') !== -1 || k.indexOf('guard') !== -1 || k.indexOf('singleleg') !== -1 || k.indexOf('single_leg') !== -1) g++;
      else s++;
    }
    if (g > s) return 'grappler';
    if (s > g) return 'striker';
    return 'balanced';
  },


  updateEnemies: function(scene, delta) {
    // Pack behavior: enemies gain speed bonus when near allies
    var PACK_RADIUS = 100; // pixels
    var SPEED_BONUS = 30; // additional speed when in pack
    var FLEE_HP_THRESHOLD = 0.2; // 20% HP
    var FLEE_CHANCE = 0.3; // 30% chance to flee when low HP
    var FLEE_DURATION = 1500; // ms
    var FLEE_COOLDOWN = 6000; // ms
    var ATTACK_TOKEN_RADIUS = 140; // max distance for token eligibility
    var ATTACK_TOKEN_TTL = 350; // ms token lifetime

    var self = this;

    // Throttle expensive per-frame systems — accumulate time, only run periodically
    scene._enemyThrottleAccum = (scene._enemyThrottleAccum || 0) + delta;
    var runThrottled = scene._enemyThrottleAccum >= 100; // run throttled systems at most 10x/sec
    if (runThrottled) scene._enemyThrottleAccum = 0;

    if (runThrottled) {
      // Role icons: text labels, no need to run at 60fps
      this.updateRoleIcons(scene, delta);

      // Weight read icons: cosmetic, can also be throttled.
      this.updateWeightIcons(scene);

      // Comeback Kid: if the player just died, record the archetype that finished them.
      self.recordComebackLossIfNeeded(scene);

      // Ring Rust: update shake-off timer
      self.updateRingRust(scene, delta);

      // Tag Team AI: establish pairs per-room and update who is "active".
      self._ensureTagTeams(scene);
      self._updateTagTeams(scene, delta);
      self.coordination.checkCoordination(scene, delta);

      // Gang Up Coordination: check for coordinated 3+ enemy attacks
      self.checkGangUpCoordination(scene, delta);

      // Swarm Behavior: check for swarm merge
      self.checkSwarmBehavior(scene, delta);
      self.updateSwarm(scene, delta);
    }

    // Rival Echo System: update ghost aura position for echo enemies
    scene.enemies.forEach(function(e) {
      if (e && e.active && e.type && e.type.isRivalEcho) {
        self.updateRivalEchoGhost(e);
      }
    });

    // Enemy Taunt System: check for and update taunts
    scene.enemies.forEach(function(e) {
      if (e && e.active && e.state !== 'dead') {
        self.checkEnemyTaunt(e, scene, delta);
        self.updateEnemyTaunts(e, delta);
      }
    });

    // --- Attack token coordination ---
    var now = Date.now();
    // Validate existing token and clear if dead or expired
    if (!scene._enemyAttackToken || !scene._enemyAttackToken.enemy || !scene._enemyAttackToken.enemy.active || now > scene._enemyAttackToken.expiresAt) {
      // Find eligible enemies within radius, choose closest to player
      var candidates = scene.enemies.filter(function(e) {
        var target = self.getTargetPlayer(scene, e);
        return target && e.active && e.state !== 'dead' && !e.isBoss && !(e.isFleeing) && !e.isResting && Math.hypot(e.x - target.x, e.y - target.y) <= ATTACK_TOKEN_RADIUS;
      });
      if (candidates.length) {
        // pick closest
        var primary = candidates.reduce(function(best, cur) {
          var bestTarget = self.getTargetPlayer(scene, best);
          var curTarget = self.getTargetPlayer(scene, cur);
          var dBest = bestTarget ? Math.hypot(best.x - bestTarget.x, best.y - bestTarget.y) : Number.MAX_SAFE_INTEGER;
          var dCur = curTarget ? Math.hypot(cur.x - curTarget.x, cur.y - curTarget.y) : Number.MAX_SAFE_INTEGER;
          return dCur < dBest ? cur : best;
        }, candidates[0]);
        scene._enemyAttackToken = { enemy: primary, expiresAt: now + ATTACK_TOKEN_TTL };
      } else {
        scene._enemyAttackToken = null;
      }
    }
    // Mark each enemy with token flag
    scene.enemies.forEach(function(e) { if (!e) return; e.hasAttackToken = (scene._enemyAttackToken && e === scene._enemyAttackToken.enemy); });

    var nowMs = Date.now(); // cache once — used in damage trail per enemy
    scene.enemies.forEach(function(e) {
      if (!e.active || e.state === 'dead') return;

      // Predator Patience: elites pause briefly at spawn to "size up" the player.
      // While sizing up, they won't move or attack; player gets a single preemptive strike bonus.
      if (e.isSizingUp) {
        e.setVelocity(0, 0);
        if (!e._predatorToastShown && typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
          e._predatorToastShown = true;
          MMA.UI.showDamageText(scene, e.x, e.y - 50, (self.PREDATOR_PATIENCE && self.PREDATOR_PATIENCE.TOAST_TEXT) ? self.PREDATOR_PATIENCE.TOAST_TEXT : 'SIZING UP...', (self.PREDATOR_PATIENCE && self.PREDATOR_PATIENCE.TOAST_COLOR) ? self.PREDATOR_PATIENCE.TOAST_COLOR : '#c0c0ff');
        }
        e.sizingUpTimer = (e.sizingUpTimer || 0) - delta;
        if (e.sizingUpTimer <= 0) {
          e.isSizingUp = false;
          e.sizingUpTimer = 0;
        }
        // Still update UI elements (hp bar / role icon) below.
      }

      var targetPlayer = self.getTargetPlayer(scene, e);
      if (!targetPlayer) return;
      
      // Update HP bar position and width
      if (e._hpBarBg) {
        e._hpBarBg.x = e.x;
        e._hpBarBg.y = e.y - e.displayHeight/2 - 8;
        e._hpBarFill.x = e.x;
        e._hpBarFill.y = e.y - e.displayHeight/2 - 8;
        var ratio = Math.max(0, e.stats.hp / e.stats.maxHp);
        e._hpBarFill.width = 36 * ratio;
        
        // Health Bar Damage Trail: update trail bar showing recent damage
        if (e._hpDamageTrail) {
          e._hpDamageTrail.x = e.x;
          e._hpDamageTrail.y = e.y - e.displayHeight/2 - 8;
          
          // Calculate total damage in trail (damage that hasn't healed)
          var trailHistory = e._damageTrailHistory || [];
          var now = nowMs; // use cached value from outer loop
          var maxHp = e._trailMaxHp || e.stats.maxHp || 60;
          
          // Filter out old entries (older than 3 seconds) and calculate trail width
          var recentDamage = 0;
          trailHistory = trailHistory.filter(function(entry) {
            var age = now - entry.timestamp;
            if (age > 3000) return false; // Remove entries older than 3 seconds
            recentDamage += entry.damage;
            return true;
          });
          e._damageTrailHistory = trailHistory;
          
          // Trail shows damage recently taken but not yet faded - sits behind current HP
          // The trail extends from current HP up to the highest point of recent damage
          var currentHp = e.stats.hp;
          var trailEnd = Math.min(maxHp, currentHp + recentDamage);
          var trailRatio = Math.max(0, trailEnd / maxHp);
          var trailWidth = 36 * trailRatio;
          
          // Only show trail if there's actual damage in the window
          if (recentDamage > 0 && trailRatio > ratio) {
            e._hpDamageTrail.width = trailWidth;
            e._hpDamageTrail.setAlpha(0.7);
            // Color fades from bright red (recent) to dark red (fading)
            var ageFactor = trailHistory.length > 0 ? (now - trailHistory[0].timestamp) / 3000 : 1;
            var alpha = 0.7 * (1 - ageFactor * 0.5);
            e._hpDamageTrail.setAlpha(Math.max(0.3, alpha));
          } else {
            e._hpDamageTrail.width = 0;
            e._hpDamageTrail.setAlpha(0);
          }
        }
      }

      // Update Role Icon position each frame
      if (e._roleIcon) {
        e._roleIcon.x = e.x;
        e._roleIcon.y = e.y - e.displayHeight/2 - 18;

        // Dynamic Role Call: update icon text based on transient state.
        if (self.getDynamicRoleIcon) {
          var t = self.getDynamicRoleIcon(e);
          if (t && e._roleIconLastText !== t && typeof e._roleIcon.setText === 'function') {
            e._roleIcon.setText(t);
            e._roleIconLastText = t;
          }
        }

        // Hide icon if enemy is dead/inactive
        if (!e.active || e.state === 'dead') {
          e._roleIcon.setVisible(false);
        } else {
          e._roleIcon.setVisible(true);
        }
      }

      // Predator Patience: don't run AI while sizing up.
      if (e.isSizingUp) {
        if (e.attackCooldown > 0) e.attackCooldown -= delta;
        return;
      }

      // Body Language Read: if enemy is telegraphing an attack, handle it and skip AI for this frame.
      if (self.updateTelegraphAttack && self.updateTelegraphAttack(e, scene.player, scene, delta)) {
        return;
      }

      // Update injury states (decay over time)
      self.updateInjuries(e, delta);

      // Update vengeance timers (5 second duration, then expires)
      self.updateVengeance(e, delta);

      // Flash KO Blindness: update blindness timer
      self.updateBlindness(e, delta);

      // Regenerator gimmick: periodic self-heal (non-boss only)
      if (e.type && e.type.aiPattern === 'regen' && !e.isBoss) {
        var rCfg = self.REGENERATOR_CONFIG;
        if (e._regenTickMs === undefined) e._regenTickMs = rCfg.BASE_INTERVAL_MS;
        if (e._regenTimer === undefined) e._regenTimer = e._regenTickMs;

        // Scale regen when at critical HP
        var hpPct = (e.stats && e.stats.maxHp) ? (e.stats.hp / e.stats.maxHp) : 1;
        var interval = (hpPct <= rCfg.CRITICAL_HP_PCT) ? rCfg.CRITICAL_INTERVAL_MS : rCfg.BASE_INTERVAL_MS;
        e._regenTickMs = interval;

        e._regenTimer -= delta;
        if (e._regenTimer <= 0) {
          e._regenTimer += e._regenTickMs;
          if (e.stats && e.stats.hp < e.stats.maxHp) {
            var healPct = rCfg.HEAL_PCT_PER_TICK * (hpPct <= rCfg.CRITICAL_HP_PCT ? rCfg.CRITICAL_HEAL_MULT : 1);
            var heal = Math.max(1, Math.round(e.stats.maxHp * healPct));
            e.stats.hp = Math.min(e.stats.maxHp, e.stats.hp + heal);
            if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
              MMA.UI.showDamageText(scene, e.x, e.y - 55, 'REGEN +' + heal, '#22ff66');
            }
          }
        }
      }

      // Coach Down Disarray: after a Coach is KO'd, nearby allies are briefly disorganized.
      // - they get SHAKEN (slower movement + slower attacks)
      // - they cannot receive new coach boosts (noCoachTimer)
      // This is driven by killEnemy() setting shakenTimer/noCoachTimer.
      if (e.noCoachTimer === undefined) e.noCoachTimer = 0;
      if (e.noCoachTimer > 0) {
        e.noCoachTimer -= delta;
        if (e.noCoachTimer < 0) e.noCoachTimer = 0;
      }

      if (e.shakenTimer === undefined) e.shakenTimer = 0;
      if (e.shakenMoveMult === undefined) e.shakenMoveMult = 1;
      if (e.shakenAttackMult === undefined) e.shakenAttackMult = 1;

      if (e.shakenTimer > 0) {
        e.shakenTimer -= delta;
        e.shakenMoveMult = 0.85;
        e.shakenAttackMult = 1.25; // increases cooldown multiplier (slower attacks)
        if (!e._shakenShown && typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
          e._shakenShown = true;
          MMA.UI.showDamageText(scene, e.x, e.y - 45, 'SHAKEN!', '#33ffcc');
        }
        if (e.shakenTimer <= 0) {
          e.shakenTimer = 0;
          e.shakenMoveMult = 1;
          e.shakenAttackMult = 1;
          e._shakenShown = false;
        }
      } else {
        e.shakenMoveMult = 1;
        e.shakenAttackMult = 1;
      }

      // Desperation Enrage: non-boss enemies enter enrage when below 25% HP
      if (!e.isBoss && !e.isElite) {
        var hpPct = e.stats.hp / e.stats.maxHp;
        var config = self.ENRAGE_CONFIG;

        // Initialize enrage state if not present
        if (e.enrageCooldown === undefined) e.enrageCooldown = 0;

        // Reduce cooldown
        if (e.enrageCooldown > 0) e.enrageCooldown -= delta;

        // Check if should trigger enrage (only once per trigger, not continuous)
        if (hpPct <= config.HP_THRESHOLD && !e.isEnraged && e.enrageCooldown <= 0) {
          e.isEnraged = true;
          e.enrageTimer = config.DURATION;
          e.enrageCooldown = config.COOLDOWN;
          e.enrageSpeedBonus = config.SPEED_BONUS;
          e.enrageAttackBonus = config.ATTACK_SPEED_BONUS;

          // Show ENRAGED! text
          if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
            MMA.UI.showDamageText(scene, e.x, e.y - 50, 'ENRAGED!', '#ff0000');
          }
        }

        // Apply enrage bonuses while active
        if (e.isEnraged) {
          e.enrageTimer -= delta;
          if (e.enrageTimer <= 0) {
            // Enrage ended
            e.isEnraged = false;
            e.enrageSpeedBonus = 0;
            e.enrageAttackBonus = 0;
          }
        }
      } else {
        // Reset enrage flags for boss/elite (they don't enrage)
        e.isEnraged = false;
        e.enrageSpeedBonus = 0;
        e.enrageAttackBonus = 0;
      }

      // Sore Loser AI: when enemy drops below 10% HP, enter desperate final stand
      // - +50% attack speed, -30% accuracy (miss chance) for 3 seconds
      // Does not apply to bosses or enemies that already have enrage
      if (!e.isBoss && !e.isEnraged) {
        var soreLoserCfg = self.SORE_LOSER_CONFIG;
        var soreHpPct = e.stats.hp / e.stats.maxHp;

        // Initialize sore loser state if not present
        if (e.soreLoserActive === undefined) e.soreLoserActive = false;

        // Trigger Sore Loser when below threshold
        if (soreHpPct <= soreLoserCfg.HP_THRESHOLD && !e.soreLoserActive) {
          e.soreLoserActive = true;
          e.soreLoserTimer = soreLoserCfg.DURATION;
          e.soreLoserAttackSpeedBonus = soreLoserCfg.ATTACK_SPEED_BONUS;
          e.soreLoserAccuracyPenalty = soreLoserCfg.ACCURACY_PENALTY;

          // Show DESPERATION! text
          if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
            MMA.UI.showDamageText(scene, e.x, e.y - 50, soreLoserCfg.WARNING_TEXT, soreLoserCfg.WARNING_COLOR);
            scene.time.delayedCall(600, function() {
              MMA.UI.showDamageText(scene, e.x, e.y - 35, soreLoserCfg.ACTIVE_TEXT, soreLoserCfg.ACTIVE_COLOR);
            });
          }

          // Visual effect: red pulsing tint
          e.setTint(0xff4444);
          if (scene.tweens) {
            scene.tweens.add({
              targets: e,
              alpha: 0.65,
              duration: 200,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut'
            });
          }
        }

        // Apply Sore Loser bonuses while active
        if (e.soreLoserActive) {
          e.soreLoserTimer -= delta;
          if (e.soreLoserTimer <= 0) {
            // Sore Loser ended - enemy is about to be defeated
            e.soreLoserActive = false;
            e.soreLoserAttackSpeedBonus = 0;
            e.soreLoserAccuracyPenalty = 0;
            // Restore original tint if not elite/boss/nemesis
            if (e.type && e.type.isElite && e.type.eliteData && e.type.eliteData.colorGlow) {
              e.setTint(e.type.eliteData.colorGlow);
            } else if (e.isNemesis) {
              e.setTint(self.NEMESIS_CONFIG.GLOW_COLOR);
            } else {
              e.clearTint();
            }
            // Stop alpha tween
            if (scene.tweens) {
              scene.tweens.killTweensOf(e);
              e.setAlpha(1);
            }
          }
        }
      }

      if (e.counterCooldown > 0) e.counterCooldown -= delta;
      if (e.eliteAbility === 'focusStrike') {
        e.focusCharge = (e.focusCharge || 0) + delta;
        if (e.focusCharge >= 2200 && !e.focusReady) {
          e.focusReady = true;
          if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
            MMA.UI.showDamageText(scene, e.x, e.y - 50, 'FOCUS!', '#66ffff');
          }
        }
      } else if (e.eliteAbility === 'chaosRush') {
        e.chaosRushTimer = (e.chaosRushTimer || 0) + delta;
        if (e.chaosRushTimer >= 2600) {
          e.chaosRushTimer = 0;
          e.chaosRushActive = true;
        }
      }

      var aiStateNow = e.aiState || '';
      if (e._mmaLastAiState !== aiStateNow) {
        if (aiStateNow === 'windup' || aiStateNow === 'feintWindup' || aiStateNow === 'focusWindup' || aiStateNow === 'counterWindup' || aiStateNow === 'chaosRush') {
          self._playEnemyAnimation(scene, e, 'attackWindup');
        }
        e._mmaLastAiState = aiStateNow;
      }

      // Apply enrage speed bonus to effective speed calculation later
      if (e.staggerTimer > 0 && !e._mmaHitAnimQueued) {
        self._playEnemyAnimation(scene, e, 'hitReaction');
        e._mmaHitAnimQueued = true;
      } else if (e.staggerTimer <= 0) {
        e._mmaHitAnimQueued = false;
      }

      if (e.staggerTimer > 0) { e.staggerTimer -= delta; e.setVelocity(0,0); return; }
      // Flee logic for non-boss enemies
      if (!e.isBoss) {
        // Default flee tuning
        var fleeHpThreshold = FLEE_HP_THRESHOLD;
        var fleeChance = FLEE_CHANCE;
        var fleeDuration = FLEE_DURATION;
        var fleeCooldown = FLEE_COOLDOWN;

        // Bully AI: always flees at critical HP (panic), no randomness.
        if (e.type && e.type.aiPattern === 'bully') {
          fleeHpThreshold = 0.20;
          fleeChance = 1.0;
          fleeDuration = 2200;
          fleeCooldown = 8000;
        }

        if (!e.fleeCooldown) e.fleeCooldown = 0;
        if (e.fleeCooldown > 0) {
          e.fleeCooldown -= delta;
        } else if (!e.isFleeing && e.stats.hp <= e.stats.maxHp * fleeHpThreshold) {
          if (Math.random() < fleeChance) {
            e.isFleeing = true;
            e.fleeTimer = fleeDuration;
            e.fleeCooldown = fleeCooldown;
            // Show flee text
            if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
              MMA.UI.showDamageText(scene, e.x, e.y - 30, 'FLEE!', '#ff0000');
            }
          }
        }
        if (e.isFleeing) {
          // Increase speed by 40%
          e.type.speed = Math.round(e.baseSpeed * 1.4);
          // Move away from player
          var dx = e.x - targetPlayer.x;
          var dy = e.y - targetPlayer.y;
          var dist = Math.sqrt(dx*dx + dy*dy) || 1;
          e.setVelocity((dx/dist)*e.type.speed, (dy/dist)*e.type.speed);
          e.fleeTimer -= delta;
          if (e.fleeTimer <= 0) {
            e.isFleeing = false;
            // Reset speed to base (pack bonus will apply later)
            e.type.speed = e.baseSpeed;
          }
          // Do not return here to allow other AI processes (e.g., enrage) while fleeing.
        }
      }
      // Handle boss phase shifts (new Phase Shift Boss system)
      if (e.isBoss) {
        // Check for phase shifts at 75%, 50%, 25% HP
        self.checkPhaseShift(e, scene);
        // Update phase shift timer
        self.updatePhaseShift(e, delta);
        // Skip regular attacks while phase shifting (invulnerable)
        if (e.isPhaseShifting) {
          e.setVelocity(0, 0);
          return;
        }
      }
      // Compute effective speed with pack bonus and Coach support
      var allies = scene.enemies.filter(function(other){return other!==e && other.active && other.state!=='dead';});
      var closeAllies = allies.filter(function(other){
        var dx = other.x - e.x, dy = other.y - e.y;
        return Math.sqrt(dx*dx+dy*dy) <= PACK_RADIUS;
      });
      var bonus = closeAllies.length > 0 ? SPEED_BONUS : 0;
      // Coach support: boosts nearby allies' attack speed.
      // IMPORTANT: attackSpeedMod is a *cooldown multiplier* (lower = faster).
      // We track and replace coach/enrage multipliers each frame to avoid compounding.
      var coachCfg = self.COACH_CONFIG || { BOOST_RADIUS: 200, ATTACK_SPEED_BONUS: 0.15 };
      var coachRadius = coachCfg.BOOST_RADIUS || 200;
      var perCoach = coachCfg.ATTACK_SPEED_BONUS || 0.15;

      var coachCount = allies.filter(function(other){
        if (other.typeKey !== 'coach') return false;
        var dx = other.x - e.x, dy = other.y - e.y;
        return Math.sqrt(dx*dx+dy*dy) <= coachRadius;
      }).length;

      // Convert "+attack speed" into cooldown multiplier.
      // Example: 1 coach at +15% attack speed => 0.85 cooldown multiplier.
      var coachAttackMult = 1;
      if (coachCount > 0) {
        coachAttackMult = Math.max(0.55, 1 - (coachCount * perCoach));

        // Cosmetic: occasional coaching toast on buffed allies (not on the coach itself).
        if (e.typeKey !== 'coach' && (!e._coachToastAt || (now - e._coachToastAt) > 1800) && typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
          e._coachToastAt = now;
          MMA.UI.showDamageText(scene, e.x, e.y - 40, 'COACHED!', '#33ffcc');
        }
      }

      // Apply coach multiplier without compounding.
      var prevCoach = (typeof e._coachLastAttackMult === 'number') ? e._coachLastAttackMult : 1;
      e.attackSpeedMod = (e.attackSpeedMod || 1) / prevCoach;
      e._coachLastAttackMult = coachAttackMult;
      e.attackSpeedMod = e.attackSpeedMod * coachAttackMult;

      // Apply enrage attack speed bonus if active (+30% faster attacks) without compounding.
      var enrageAttackMult = (e.enrageAttackBonus) ? (1 - e.enrageAttackBonus) : 1;
      var prevEnrage = (typeof e._enrageLastAttackMult === 'number') ? e._enrageLastAttackMult : 1;
      e.attackSpeedMod = (e.attackSpeedMod || 1) / prevEnrage;
      e._enrageLastAttackMult = enrageAttackMult;
      e.attackSpeedMod = e.attackSpeedMod * enrageAttackMult;

      // Apply Sore Loser attack speed bonus (+50% faster attacks) without compounding
      var soreLoserAttackMult = (e.soreLoserActive && e.soreLoserAttackSpeedBonus) ? (1 - e.soreLoserAttackSpeedBonus) : 1;
      var prevSoreLoser = (typeof e._soreLoserLastAttackMult === 'number') ? e._soreLoserLastAttackMult : 1;
      e.attackSpeedMod = (e.attackSpeedMod || 1) / prevSoreLoser;
      e._soreLoserLastAttackMult = soreLoserAttackMult;
      e.attackSpeedMod = e.attackSpeedMod * soreLoserAttackMult;

      // Apply enrage speed bonus if active (+25% move speed)
      var enrageSpeedBonus = (e.enrageSpeedBonus || 0);
      // Cap speed at double baseSpeed (including enrage bonus)
      var maxSpeed = e.baseSpeed * 2 * (1 + enrageSpeedBonus);

      // Rival Echo System: +15% attack speed for echo enemies
      if (e.type && e.type.isRivalEcho) {
        var echoAttackMult = 1 - self.RIVAL_ECHO_CONFIG.ATTACK_SPEED_BONUS;
        e.attackSpeedMod = (e.attackSpeedMod || 1) * echoAttackMult;
      }

      e.type.speed = Math.min(e.baseSpeed + bonus, maxSpeed);

      if (self.coordination.updateEnemy(e, targetPlayer, scene, delta)) {
        if (e.attackCooldown > 0) e.attackCooldown -= delta;
        return;
      }

      var ai = self.AI[e.type.aiPattern || 'chase'];
      (ai || self.AI.chase)(e, targetPlayer, scene, delta);
    });
  }
});


window.MMA.Enemies.AI = {
  // Regen AI: behaves like chase AI; its gimmick is handled in updateEnemies via periodic healing.
  regen: function(enemy, player, scene, dt){
    return window.MMA.Enemies.AI.chase(enemy, player, scene, dt);
  },

  defender: function(enemy, player, scene, dt) {
    var dx = player.x - enemy.x;
    var dy = player.y - enemy.y;
    var dist = Math.sqrt(dx * dx + dy * dy) || 1;
    var speedMod = (enemy.moveSpeedMod || 1) * (enemy.shakenMoveMult || 1);
    var attackMod = (enemy.attackSpeedMod || 1) * (enemy.shakenAttackMult || 1);
    var recentAttack = window.MMA.Enemies._didPlayerRecentlyAttack(scene, enemy.eliteAbility === 'counterStance' ? 320 : 220);
    var strafeAngle = Math.atan2(dy, dx) + (enemy.circleDir || 1) * 1.15;

    if (enemy.counterCooldown > 0) enemy.counterCooldown -= dt;
    if (!enemy.circleDir) enemy.circleDir = Math.random() < 0.5 ? 1 : -1;

    if (enemy.aiState === 'counterWindup') {
      enemy.setVelocity(0, 0);
      enemy.counterTimer -= dt;
      if (enemy.counterTimer <= 0) {
        enemy.aiState = 'recover';
        enemy.counterTimer = 260;
        enemy.attackCooldown = enemy.type.attackCooldownMax * 1.15 * attackMod;
        MMA.Player.damage(scene, Math.round(enemy.type.attackDamage * (enemy.eliteAbility === 'counterStance' ? 1.45 : 1.25)));
        MMA.UI.showDamageText(scene, player.x, player.y - 34, 'COUNTER!', '#ff5555');
      }
      return;
    }

    if (enemy.aiState === 'recover') {
      enemy.setVelocity(-(dx / dist) * enemy.type.speed * 0.42, -(dy / dist) * enemy.type.speed * 0.42);
      enemy.counterTimer -= dt;
      if (enemy.counterTimer <= 0) enemy.aiState = null;
      return;
    }

    if (enemy.blockTimer > 0) {
      enemy.blockTimer -= dt;
      enemy.isBlocking = true;
      enemy.setVelocity(0, 0);
      if (enemy.blockTimer <= 0) {
        enemy.isBlocking = false;
        enemy.aiState = 'counterWindup';
        enemy.counterTimer = enemy.eliteAbility === 'counterStance' ? 110 : 150;
      }
      return;
    }

    if (recentAttack && dist <= enemy.type.attackRange * 1.45 && enemy.counterCooldown <= 0) {
      enemy.blockTimer = enemy.eliteAbility === 'counterStance' ? 320 : 240;
      enemy.counterCooldown = 900;
      enemy.isBlocking = true;
      if (window.sfx && typeof window.sfx.block === 'function') window.sfx.block();
      MMA.UI.showDamageText(scene, enemy.x, enemy.y - 36, 'BLOCK!', '#88ddff');
      return;
    }

    if (dist < enemy.type.chaseRange) {
      if (dist > enemy.type.attackRange * 1.1) {
        enemy.setVelocity((dx / dist) * enemy.type.speed * 0.86 * speedMod, (dy / dist) * enemy.type.speed * 0.86 * speedMod);
      } else if (dist < enemy.type.attackRange * 0.75) {
        enemy.setVelocity(Math.cos(strafeAngle) * enemy.type.speed * 0.84 * speedMod, Math.sin(strafeAngle) * enemy.type.speed * 0.84 * speedMod);
      } else {
        enemy.setVelocity(0, 0);
        if ((enemy.hasAttackToken || enemy.isBoss) && enemy.attackCooldown <= 0) {
          enemy.attackCooldown = enemy.type.attackCooldownMax * attackMod;
          MMA.Player.damage(scene, Math.round(enemy.type.attackDamage * 0.95));
          MMA.UI.showDamageText(scene, player.x, player.y - 28, 'JAB!', '#cc4444');
        }
      }
    } else {
      enemy.setVelocity(0, 0);
    }

    if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;
  },

  boxer: function(enemy, player, scene, dt) {
    return window.MMA.Enemies.AI.defender(enemy, player, scene, dt);
  },

  karateka: function(enemy, player, scene, dt) {
    var dx = player.x - enemy.x;
    var dy = player.y - enemy.y;
    var dist = Math.sqrt(dx * dx + dy * dy) || 1;
    var attackMod = (enemy.attackSpeedMod || 1) * (enemy.shakenAttackMult || 1);

    if (enemy.aiState === 'focusWindup') {
      enemy.setVelocity(0, 0);
      enemy.focusWindupTimer -= dt;
      if (enemy.focusWindupTimer <= 0) {
        enemy.aiState = 'retreat';
        enemy.retreatTimer = 520;
        enemy.focusReady = false;
        enemy.focusCharge = 0;
        enemy.attackCooldown = enemy.type.attackCooldownMax * 1.1 * attackMod;
        MMA.Player.damage(scene, Math.round(enemy.type.attackDamage * 1.8));
        MMA.UI.showDamageText(scene, player.x, player.y - 32, 'FOCUS STRIKE!', '#66ffff');
      }
      return;
    }

    if (enemy.focusReady && dist <= enemy.type.attackRange * 1.3 && enemy.attackCooldown <= 0) {
      enemy.aiState = 'focusWindup';
      enemy.focusWindupTimer = 260;
      enemy.setVelocity(0, 0);
      return;
    }

    return window.MMA.Enemies.AI.kickboxer(enemy, player, scene, dt);
  },

  streetFighter: function(enemy, player, scene, dt) {
    var dx = player.x - enemy.x;
    var dy = player.y - enemy.y;
    var dist = Math.sqrt(dx * dx + dy * dy) || 1;
    var speedMod = (enemy.moveSpeedMod || 1) * (enemy.shakenMoveMult || 1);
    var attackMod = (enemy.attackSpeedMod || 1) * (enemy.shakenAttackMult || 1);

    if (enemy.aiState === 'chaosRush') {
      enemy.chaosRushTimerActive -= dt;
      enemy.setVelocity((dx / dist) * enemy.type.speed * 1.7 * speedMod, (dy / dist) * enemy.type.speed * 1.7 * speedMod);
      if (!enemy._chaosRushDamageDone && dist <= enemy.type.attackRange * 1.2) {
        enemy._chaosRushDamageDone = true;
        MMA.Player.damage(scene, Math.round(enemy.type.attackDamage * 1.6));
        MMA.UI.showDamageText(scene, player.x, player.y - 34, 'CHAOS RUSH!', '#ff9933');
      }
      if (enemy.chaosRushTimerActive <= 0) {
        enemy.aiState = 'recover';
        enemy.counterTimer = 320;
        enemy.chaosRushActive = false;
        enemy._chaosRushDamageDone = false;
      }
      return;
    }

    if (enemy.chaosRushActive && dist <= enemy.type.chaseRange) {
      enemy.aiState = 'chaosRush';
      enemy.chaosRushTimerActive = 260;
      enemy.attackCooldown = enemy.type.attackCooldownMax * 1.2 * attackMod;
      return;
    }

    return window.MMA.Enemies.AI.combo(enemy, player, scene, dt);
  },

  stunner: function(enemy, player, scene, dt){
    // Simple stun AI: approach player, then perform a stun attack that pauses player controls for 1.5s
    var dx = player.x - enemy.x, dy = player.y - enemy.y, dist = Math.sqrt(dx*dx + dy*dy) || 1;
    var speedMod = (enemy.moveSpeedMod || 1) * (enemy.shakenMoveMult || 1);
    var attackMod = (enemy.attackSpeedMod || 1) * (enemy.shakenAttackMult || 1);
    var vulnMult = window.MMA.Enemies.getInjuryDamageMultiplier(enemy);
    if (enemy.aiState === 'stunned') {
      // During stun cooldown, do nothing
      enemy.setVelocity(0,0);
      enemy.stunTimer -= dt;
      if (enemy.stunTimer <= 0) enemy.aiState = null;
      return;
    }
    if (dist < enemy.type.chaseRange) {
      if (dist < enemy.type.attackRange) {
        enemy.setVelocity(0,0);
        var isEliteBreaker = window.MMA.Enemies.canEliteBreakCoordination(enemy);
        if ((enemy.hasAttackToken || enemy.isBoss || isEliteBreaker) && enemy.attackCooldown <= 0) {
          // Perform stun attack
          enemy.aiState = 'stunned';
          enemy.stunTimer = 1500; // 1.5s player stun
          enemy.attackCooldown = enemy.type.attackCooldownMax * attackMod;
          // Apply damage and stun effect
          var dmg = Math.round(enemy.type.attackDamage * vulnMult * (window.MMA.Enemies.getPackDamageMultiplier ? window.MMA.Enemies.getPackDamageMultiplier(enemy, scene) : 1) * (window.MMA.Enemies.getVengeanceDamageMult ? window.MMA.Enemies.getVengeanceDamageMult(enemy) : 1) * (window.MMA.Enemies.getTerritoryAttackMultiplier ? window.MMA.Enemies.getTerritoryAttackMultiplier(enemy, scene) : 1));
          // Apply elite coordination break damage penalty
          if (isEliteBreaker) {
            dmg = Math.round(dmg * window.MMA.Enemies.ELITE_COORDINATION_BREAK.DAMAGE_MULT);
            window.MMA.Enemies.recordEliteStrike(enemy, scene, true);
          }
          // Body Language Read: stunner gives an extra tell.
          if (!window.MMA.Enemies.startTelegraphAttack(enemy, player, scene, dmg, 140, 'HAND FAKE', '#ff00ff', 'HAND FAKE')) {
            window.MMA.Enemies.damagePlayer(enemy, scene, dmg);
          }
          // Add a stun flag to player (simple implementation via registry)
          scene.registry.set('playerStunned', true);
          scene.time.delayedCall(1500, function(){ scene.registry.set('playerStunned', false); });
          MMA.UI.showDamageText(scene, player.x, player.y - 30, 'STUN!', '#ff00ff');
        }
      } else {
        enemy.setVelocity((dx/dist)*enemy.type.speed*speedMod, (dy/dist)*enemy.type.speed*speedMod);
      }
    } else {
      enemy.setVelocity(0,0);
    }
    if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;
  },
  chase: function(enemy, player, scene, dt){
    var dx = player.x - enemy.x, dy = player.y - enemy.y, dist = Math.sqrt(dx*dx + dy*dy) || 1;
    // Apply injury speed modifiers
    var speedMod = (enemy.moveSpeedMod || 1) * (enemy.shakenMoveMult || 1);
    var attackMod = (enemy.attackSpeedMod || 1) * (enemy.shakenAttackMult || 1);
    var vulnMult = window.MMA.Enemies.getInjuryDamageMultiplier(enemy);
    var phaseMult = window.MMA.Enemies.getPhaseShiftDamageMult(enemy);

    // Mirror Match Protocol: check if should activate (player low HP)
    var mirrorMove = null;
    if (!enemy._mirrorMatchActive && !enemy.isBoss) {
      window.MMA.Enemies.checkMirrorMatch(enemy, scene);
    }
    if (enemy._mirrorMatchActive) {
      mirrorMove = window.MMA.Enemies.updateMirrorMatch(enemy, scene, dt);
    }

    if (dist < enemy.type.chaseRange) {
      if (dist < enemy.type.attackRange) {
        enemy.setVelocity(0,0);
        // Attack token check: token holder can deal damage, OR elite enemies can break coordination
        var isEliteBreaker = window.MMA.Enemies.canEliteBreakCoordination(enemy);
        if (enemy.hasAttackToken || enemy.isBoss || isEliteBreaker) {
          if (enemy.attackCooldown <= 0) {
            enemy.attackCooldown = enemy.type.attackCooldownMax * attackMod;

            // Calculate damage - apply mirror match penalty if mirroring
            var dmg = Math.round(enemy.type.attackDamage * vulnMult * phaseMult * (window.MMA.Enemies.getPackDamageMultiplier ? window.MMA.Enemies.getPackDamageMultiplier(enemy, scene) : 1) * (window.MMA.Enemies.getVengeanceDamageMult ? window.MMA.Enemies.getVengeanceDamageMult(enemy) : 1) * (window.MMA.Enemies.getTerritoryAttackMultiplier ? window.MMA.Enemies.getTerritoryAttackMultiplier(enemy, scene) : 1));

            // Apply elite coordination break damage penalty
            if (isEliteBreaker) {
              dmg = Math.round(dmg * window.MMA.Enemies.ELITE_COORDINATION_BREAK.DAMAGE_MULT);
              window.MMA.Enemies.recordEliteStrike(enemy, scene, true);
            }

            // If mirroring a player move, apply damage reduction and show special text
            if (mirrorMove) {
              dmg = Math.round(dmg * window.MMA.Enemies.MIRROR_MATCH_CONFIG.DAMAGE_MULT);
              window.MMA.Enemies.consumeMirrorMove(enemy);
              if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
                MMA.UI.showDamageText(scene, player.x, player.y - 35, window.MMA.Enemies.MIRROR_MATCH_CONFIG.MIRROR_TEXT + ' ' + mirrorMove, '#ff66ff');
              }
            }

            // Body Language Read: short telegraph before the hit.
            // Check for Flash KO Blindness miss chance
            if (window.MMA.Enemies.rollBlindMiss(enemy)) {
              MMA.UI.showDamageText(scene, player.x, player.y - 35, 'MISS!', '#ffffff');
            } else if (!window.MMA.Enemies.startTelegraphAttack(enemy, player, scene, dmg, 120, 'SHOULDER DIP', '#66ccff', 'SHOULDER DIP')) {
              window.MMA.Enemies.damagePlayer(enemy, scene, dmg);
            }
          }
        } else {
          // Non-token enemies strafe or step back
          var angle = Math.atan2(dy, dx) + Math.PI / 2; // perpendicular
          enemy.setVelocity(Math.cos(angle) * enemy.type.speed * speedMod, Math.sin(angle) * enemy.type.speed * speedMod);
        }
      } else enemy.setVelocity((dx/dist)*enemy.type.speed*speedMod, (dy/dist)*enemy.type.speed*speedMod);
    } else enemy.setVelocity(0,0);
    if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;
  },

  // Tank AI: slow, methodical, heavy hitter with long windup telegraph
  // Designed as a "wall" - high defense, slow attacks that punish players who focus fire
  tank: function(enemy, player, scene, dt) {
    var dx = player.x - enemy.x, dy = player.y - enemy.y, dist = Math.sqrt(dx*dx + dy*dy) || 1;
    var speedMod = (enemy.moveSpeedMod || 1) * (enemy.shakenMoveMult || 1);
    var attackMod = (enemy.attackSpeedMod || 1) * (enemy.shakenAttackMult || 1);
    var vulnMult = window.MMA.Enemies.getInjuryDamageMultiplier(enemy);

    // Tank has special states: windup -> strike -> recovery
    if (enemy.aiState === 'windup') {
      // Standing still, preparing heavy strike - telegraph to player
      enemy.setVelocity(0, 0);
      enemy.windupTimer -= dt;
      if (enemy.windupTimer <= 0) {
        // Execute heavy strike
        enemy.aiState = 'striking';
        enemy.strikeTimer = 150;
        var baseDmg = enemy.type.attackDamage * 1.5; // Heavy hit bonus
        var dmg = Math.round(baseDmg * vulnMult *
          (window.MMA.Enemies.getPackDamageMultiplier ? window.MMA.Enemies.getPackDamageMultiplier(enemy, scene) : 1) *
          (window.MMA.Enemies.getVengeanceDamageMult ? window.MMA.Enemies.getVengeanceDamageMult(enemy) : 1) *
          (window.MMA.Enemies.getTerritoryAttackMultiplier ? window.MMA.Enemies.getTerritoryAttackMultiplier(enemy, scene) : 1));

        if (!window.MMA.Enemies.startTelegraphAttack(enemy, player, scene, dmg, 0, 'HEAVY STRIKE!', '#888888', 'SHOULDER DIP')) {
          window.MMA.Enemies.damagePlayer(enemy, scene, dmg);
        }
        MMA.UI.showDamageText(scene, enemy.x, enemy.y - 35, 'SMASH!', '#888888');
      }
      return;
    }

    if (enemy.aiState === 'striking') {
      enemy.setVelocity(0, 0);
      enemy.strikeTimer -= dt;
      if (enemy.strikeTimer <= 0) {
        enemy.aiState = 'recovering';
        enemy.recoveryTimer = 1200 * attackMod; // Long recovery after heavy hit
      }
      return;
    }

    if (enemy.aiState === 'recovering') {
      // Slowly back away during recovery
      enemy.setVelocity(-(dx/dist) * enemy.type.speed * 0.3 * speedMod, -(dy/dist) * enemy.type.speed * 0.3 * speedMod);
      enemy.recoveryTimer -= dt;
      if (enemy.recoveryTimer <= 0) {
        enemy.aiState = null;
      }
      return;
    }

    // Normal behavior: approach slowly
    if (dist < enemy.type.chaseRange) {
      if (dist < enemy.type.attackRange) {
        // In range - start windup
        enemy.setVelocity(0, 0);
        var isEliteBreaker = window.MMA.Enemies.canEliteBreakCoordination(enemy);
        if ((enemy.hasAttackToken || enemy.isBoss || isEliteBreaker) && enemy.attackCooldown <= 0) {
          enemy.aiState = 'windup';
          enemy.windupTimer = 500; // 500ms windup gives player time to react
          enemy.attackCooldown = enemy.type.attackCooldownMax * attackMod;

          // Show telegraph
          if (!window.MMA.Enemies.startTelegraphAttack(enemy, player, scene, 0, 450, 'BRACING...', '#aaaaaa', 'SHOULDER DIP')) {
            // If telegraph fails, attack immediately
          }
        }
      } else {
        // Approach slowly - tanks don't rush
        enemy.setVelocity((dx/dist) * enemy.type.speed * 0.5 * speedMod, (dy/dist) * enemy.type.speed * 0.5 * speedMod);
      }
    } else {
      enemy.setVelocity(0, 0);
    }
    if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;
  },

  kicker: function(enemy, player, scene, dt){
    var dx = player.x - enemy.x, dy = player.y - enemy.y, dist = Math.sqrt(dx*dx + dy*dy) || 1;
    var speedMod = (enemy.moveSpeedMod || 1) * (enemy.shakenMoveMult || 1);
    var attackMod = (enemy.attackSpeedMod || 1) * (enemy.shakenAttackMult || 1);
    var vulnMult = window.MMA.Enemies.getInjuryDamageMultiplier(enemy);

    if (enemy.aiState === 'windup') { enemy.setVelocity(0,0); enemy.windupTimer -= dt; if (enemy.windupTimer <= 0) { enemy.aiState = 'kicking'; enemy.kickTimer = 200; window.MMA.Enemies.damagePlayer(enemy, scene, Math.round((enemy.type.attackDamage + 5) * vulnMult * (window.MMA.Enemies.getTerritoryAttackMultiplier ? window.MMA.Enemies.getTerritoryAttackMultiplier(enemy, scene) : 1))); } return; }
    if (enemy.aiState === 'kicking') { enemy.setVelocity(0,0); enemy.kickTimer -= dt; if (enemy.kickTimer <= 0) { enemy.aiState = 'retreat'; enemy.retreatTimer = 800; } return; }
    if (enemy.aiState === 'retreat') { enemy.setVelocity(-(dx/dist)*enemy.type.speed*1.2*speedMod, -(dy/dist)*enemy.type.speed*1.2*speedMod); enemy.retreatTimer -= dt; if (enemy.retreatTimer <= 0) enemy.aiState = null; return; }
    var min = 80, max = 120;
    if (dist < enemy.type.chaseRange) {
      if (dist >= min && dist <= max) { enemy.aiState = 'windup'; enemy.windupTimer = 400; enemy.setVelocity(0,0); }
      else if (dist < min) enemy.setVelocity(-(dx/dist)*enemy.type.speed*0.7*speedMod, -(dy/dist)*enemy.type.speed*0.7*speedMod);
      else enemy.setVelocity((dx/dist)*enemy.type.speed*0.8*speedMod, (dy/dist)*enemy.type.speed*0.8*speedMod);
    } else enemy.setVelocity(0,0);
    if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;
  },
  grasper: function(enemy, player, scene, dt){ var dx = player.x - enemy.x, dy = player.y - enemy.y, dist = Math.sqrt(dx*dx + dy*dy) || 1; if (enemy.aiState === 'grabbing') { enemy.setVelocity(0,0); enemy.grabTimer -= dt; player.setVelocity(0,0); if (player.stats) player.stats.hp -= Math.floor(enemy.type.attackDamage * 0.3 * (dt/1000) * (window.MMA.Enemies.getTerritoryAttackMultiplier ? window.MMA.Enemies.getTerritoryAttackMultiplier(enemy, scene) : 1)); if (enemy.grabTimer <= 0) { enemy.aiState = 'recovery'; enemy.recoveryTimer = 600; } return; } if (enemy.aiState === 'recovery') { enemy.setVelocity(0,0); enemy.recoveryTimer -= dt; if (enemy.recoveryTimer <= 0) enemy.aiState = null; return; } if (dist < enemy.type.chaseRange) { if (dist < enemy.type.attackRange) { enemy.setVelocity(0,0); if (enemy.attackCooldown <= 0) { enemy.aiState = 'grabbing'; enemy.grabTimer = 1000; enemy.attackCooldown = enemy.type.attackCooldownMax + 1000; window.MMA.Enemies.damagePlayer(enemy, scene, Math.round(enemy.type.attackDamage * (window.MMA.Enemies.getTerritoryAttackMultiplier ? window.MMA.Enemies.getTerritoryAttackMultiplier(enemy, scene) : 1))); MMA.UI.showDamageText(scene, player.x, player.y - 30, 'GRABBED!', '#ffaa00'); } } else enemy.setVelocity((dx/dist)*enemy.type.speed, (dy/dist)*enemy.type.speed); } else enemy.setVelocity(0,0); if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt; },
  thrower: function(enemy, player, scene, dt){ var dx = player.x - enemy.x, dy = player.y - enemy.y, dist = Math.sqrt(dx*dx + dy*dy) || 1; if (enemy.aiState === 'throwing') { enemy.setVelocity(0,0); enemy.throwTimer -= dt; if (enemy.throwTimer <= 0) { enemy.aiState = 'recovery'; enemy.recoveryTimer = 700; } return; } if (enemy.aiState === 'recovery') { enemy.setVelocity(0,0); enemy.recoveryTimer -= dt; if (enemy.recoveryTimer <= 0) enemy.aiState = null; return; } if (dist < enemy.type.chaseRange) { if (dist < enemy.type.attackRange * 0.7) { enemy.setVelocity(0,0); if (enemy.attackCooldown <= 0) { enemy.aiState = 'throwing'; enemy.throwTimer = 300; enemy.attackCooldown = enemy.type.attackCooldownMax; window.MMA.Enemies.damagePlayer(enemy, scene, Math.round(enemy.type.attackDamage * 1.8 * (window.MMA.Enemies.getTerritoryAttackMultiplier ? window.MMA.Enemies.getTerritoryAttackMultiplier(enemy, scene) : 1))); MMA.UI.showDamageText(scene, player.x, player.y - 30, 'THROWN!', '#ff6600'); } } else if (dist < enemy.type.attackRange) enemy.setVelocity((dx/dist)*enemy.type.speed * 0.5, (dy/dist)*enemy.type.speed * 0.5); else enemy.setVelocity((dx/dist)*enemy.type.speed, (dy/dist)*enemy.type.speed); } else enemy.setVelocity(0,0); if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt; },
  subHunter: function(enemy, player, scene, dt){ var dx = player.x - enemy.x, dy = player.y - enemy.y, dist = Math.sqrt(dx*dx + dy*dy) || 1;
    // Ensure escapeMeter exists
    if (enemy.escapeMeter === undefined) enemy.escapeMeter = 0;
    
    // Initialize cached submission escape keys on scene (once)
    if (scene && scene._mmaSubmitKeys === undefined) {
      scene._mmaSubmitKeys = {
        space: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        shift: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)
      };
    }
    
    // Submission state with escape mechanic
    if (enemy.aiState === 'submitting') {
      enemy.setVelocity(0,0);
      enemy.submitTimer -= dt;
      
      // Damage over time to player - clamp HP to not go below 0
      if (player && player.stats) {
        var dotDamage = Math.floor(enemy.type.attackDamage * 0.4 * (dt/1000) * (window.MMA.Enemies.getTerritoryAttackMultiplier ? window.MMA.Enemies.getTerritoryAttackMultiplier(enemy, scene) : 1));
        player.stats.hp = Math.max(0, player.stats.hp - dotDamage);
      }
      
      // Escape handling: player can mash SPACE or SHIFT to escape (using JustDown, not isDown)
      if (scene && scene._mmaSubmitKeys) {
        var spaceKey = scene._mmaSubmitKeys.space;
        var shiftKey = scene._mmaSubmitKeys.shift;
        var escaped = false;
        
        if (Phaser.Input.Keyboard.JustDown(spaceKey) || Phaser.Input.Keyboard.JustDown(shiftKey)) {
          enemy.escapeMeter++;
          
          // Throttle escape progress toast to max 2 times/sec (500ms)
          var now = Date.now();
          if (!enemy._lastEscapeToastAt || (now - enemy._lastEscapeToastAt) >= 500) {
            enemy._lastEscapeToastAt = now;
            if (player) {
              MMA.UI.showDamageText(scene, player.x, player.y - 60, 'ESCAPE ' + enemy.escapeMeter + '/5', '#ffff00');
            }
          }
        }
        
        // Threshold for escape (5 presses)
        if (enemy.escapeMeter >= 5) {
          // Escape succeeded
          enemy.aiState = 'reset';
          enemy.resetTimer = 500;
          enemy.escapeMeter = 0;
          enemy._lastEscapeToastAt = 0;
          MMA.UI.showDamageText(scene, enemy.x, enemy.y - 30, 'ESCAPED!', '#00ff00');
          scene.registry.set('gameMessage', 'You escaped the submission!');
          scene.time.delayedCall(1500, function(){ scene.registry.set('gameMessage', ''); });
          return; // exit early
        }
      }
      if (enemy.submitTimer <= 0) {
        // Submission completed without escape - clamp HP to not go below 0
        enemy.aiState = 'reset';
        enemy.resetTimer = 500;
        // Apply big damage burst to player - clamp HP to not go below 0
        if (player && player.stats) {
          var burstDamage = Math.max(10, Math.floor(enemy.type.attackDamage * 2 * (window.MMA.Enemies.getTerritoryAttackMultiplier ? window.MMA.Enemies.getTerritoryAttackMultiplier(enemy, scene) : 1)));
          player.stats.hp = Math.max(0, player.stats.hp - burstDamage);
        }
        MMA.UI.showDamageText(scene, player.x, player.y - 50, 'SUBMISSION HIT!', '#ff0000');
        scene.registry.set('gameMessage', 'You were submitted!');
        scene.time.delayedCall(1800, function(){ scene.registry.set('gameMessage', ''); });
      }
      return;
    }
    if (enemy.aiState === 'reset') {
      enemy.setVelocity(0,0);
      enemy.resetTimer -= dt;
      if (enemy.resetTimer <= 0) {
        enemy.aiState = null;
        enemy.circleAngle = Math.atan2(dy, dx) + Math.PI;
        enemy.escapeMeter = 0;
      }
      return;
    }
    if (dist < enemy.type.chaseRange) {
      var min = 100, max = 160;
      if (dist >= min && dist <= max) {
        if (!enemy.circleAngle) enemy.circleAngle = Math.atan2(dy, dx);
        enemy.circleAngle += 1.5 * (dt/1000);
        var targetX = player.x + Math.cos(enemy.circleAngle) * min,
            targetY = player.y + Math.sin(enemy.circleAngle) * min;
        var cx = targetX - enemy.x, cy = targetY - enemy.y,
            cdist = Math.sqrt(cx*cx + cy*cy) || 1;
        enemy.setVelocity((cx/cdist)*enemy.type.speed, (cy/cdist)*enemy.type.speed);
        if (enemy.attackCooldown <= 0 && Math.random() < 0.005) {
          enemy.aiState = 'submitting';
          enemy.submitTimer = 2000; // 2s window
          enemy.attackCooldown = enemy.type.attackCooldownMax;
          enemy.escapeMeter = 0;
          enemy._lastEscapeToastAt = 0;
          MMA.UI.showDamageText(scene, player.x, player.y - 40, 'SUBMISSION!', '#ff00ff');
          scene.registry.set('gameMessage', 'Submission! Mash SPACE or SHIFT!');
          scene.time.delayedCall(2000, function(){ scene.registry.set('gameMessage', ''); });
        }
      } else if (dist < min) {
        enemy.setVelocity(-(dx/dist)*enemy.type.speed, -(dy/dist)*enemy.type.speed);
      } else {
        enemy.setVelocity((dx/dist)*enemy.type.speed * 0.7, (dy/dist)*enemy.type.speed * 0.7);
      }
    } else {
      enemy.setVelocity(0,0);
    }
    if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;
  },
  // Kickboxer AI: circles at range, fast kicks, retreats after attacks
  kickboxer: function(enemy, player, scene, dt){ var dx = player.x - enemy.x, dy = player.y - enemy.y, dist = Math.sqrt(dx*dx + dy*dy) || 1; if (enemy.aiState === 'windup') { enemy.setVelocity(0,0); enemy.windupTimer -= dt; if (enemy.windupTimer <= 0) { enemy.aiState = 'kicking'; enemy.kickTimer = 180; window.MMA.Enemies.damagePlayer(enemy, scene, Math.round(enemy.type.attackDamage * (window.MMA.Enemies.getTerritoryAttackMultiplier ? window.MMA.Enemies.getTerritoryAttackMultiplier(enemy, scene) : 1))); MMA.UI.showDamageText(scene, enemy.x, enemy.y - 30, 'HIGH KICK!', '#00cccc'); } return; } if (enemy.aiState === 'kicking') { enemy.setVelocity(0,0); enemy.kickTimer -= dt; if (enemy.kickTimer <= 0) { enemy.aiState = 'retreat'; enemy.retreatTimer = 600; } return; } if (enemy.aiState === 'retreat') { enemy.setVelocity(-(dx/dist)*enemy.type.speed * 1.3, -(dy/dist)*enemy.type.speed * 1.3); enemy.retreatTimer -= dt; if (enemy.retreatTimer <= 0) enemy.aiState = null; return; } var min = 70, max = 140; if (dist < enemy.type.chaseRange) { if (dist >= min && dist <= max) { if (!enemy.circleDir) enemy.circleDir = Math.random() < 0.5 ? 1 : -1; if (!enemy.circleAngle) enemy.circleAngle = Math.atan2(dy, dx); enemy.circleAngle += enemy.circleDir * 2.5 * (dt/1000); var targetX = player.x + Math.cos(enemy.circleAngle) * min, targetY = player.y + Math.sin(enemy.circleAngle) * min; var cx = targetX - enemy.x, cy = targetY - enemy.y, cdist = Math.sqrt(cx*cx + cy*cy) || 1; enemy.setVelocity((cx/cdist)*enemy.type.speed * 0.9, (cy/cdist)*enemy.type.speed * 0.9); if (enemy.attackCooldown <= 0 && Math.random() < 0.008) { enemy.aiState = 'windup'; enemy.windupTimer = 250; enemy.setVelocity(0,0); } } else if (dist < min) { enemy.setVelocity(-(dx/dist)*enemy.type.speed * 0.6, -(dy/dist)*enemy.type.speed * 0.6); } else { enemy.setVelocity((dx/dist)*enemy.type.speed * 0.85, (dy/dist)*enemy.type.speed * 0.85); } } else enemy.setVelocity(0,0); if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt; },
  // Combo Striker AI: fast jab-cross-hook chains with brief pauses between combos
  combo: function(enemy, player, scene, dt){
    var dx = player.x - enemy.x, dy = player.y - enemy.y, dist = Math.sqrt(dx*dx + dy*dy) || 1;
    var speedMod = (enemy.moveSpeedMod || 1) * (enemy.shakenMoveMult || 1);
    var attackMod = (enemy.attackSpeedMod || 1) * (enemy.shakenAttackMult || 1);
    var vulnMult = window.MMA.Enemies.getInjuryDamageMultiplier(enemy);
    var vengeanceMult = window.MMA.Enemies.getVengeanceDamageMult(enemy);

    // Mirror Match Protocol: check if should activate (player low HP)
    var mirrorMove = null;
    if (!enemy._mirrorMatchActive && !enemy.isBoss) {
      window.MMA.Enemies.checkMirrorMatch(enemy, scene);
    }
    if (enemy._mirrorMatchActive) {
      mirrorMove = window.MMA.Enemies.updateMirrorMatch(enemy, scene, dt);
    }

    if (enemy.aiState && enemy.aiState.startsWith('combo')) {
      enemy.setVelocity(0,0);
      enemy.comboTimer -= dt;
      if (enemy.comboTimer <= 0) {
        var comboNum = parseInt(enemy.aiState.replace('combo','')) || 0;
        var hits = [Math.round(enemy.type.attackDamage * vulnMult * vengeanceMult), Math.round(enemy.type.attackDamage * 1.3 * vulnMult * vengeanceMult), Math.round(enemy.type.attackDamage * 1.6 * vulnMult * vengeanceMult)];
        var names = ['JAB!', 'CROSS!', 'HOOK!'];
        if (comboNum < 3) {
          var tMult = (window.MMA.Enemies.getTerritoryAttackMultiplier ? window.MMA.Enemies.getTerritoryAttackMultiplier(enemy, scene) : 1);
          var isEliteBreaker = window.MMA.Enemies.canEliteBreakCoordination(enemy);
          var dmg = Math.round((hits[comboNum] || Math.round(enemy.type.attackDamage * vulnMult * vengeanceMult)) * tMult);
          // Apply elite coordination break damage penalty
          if (isEliteBreaker) {
            dmg = Math.round(dmg * window.MMA.Enemies.ELITE_COORDINATION_BREAK.DAMAGE_MULT);
          }
          // Apply mirror match damage reduction if mirroring
          if (mirrorMove) {
            dmg = Math.round(dmg * window.MMA.Enemies.MIRROR_MATCH_CONFIG.DAMAGE_MULT);
            window.MMA.Enemies.consumeMirrorMove(enemy);
            MMA.UI.showDamageText(scene, player.x, player.y - 35, window.MMA.Enemies.MIRROR_MATCH_CONFIG.MIRROR_TEXT + ' ' + mirrorMove, '#ff66ff');
          }
          // Check for Flash KO Blindness miss chance
          if (window.MMA.Enemies.rollBlindMiss(enemy)) {
            MMA.UI.showDamageText(scene, player.x, player.y - 35, 'MISS!', '#ffffff');
          } else {
            window.MMA.Enemies.damagePlayer(enemy, scene, dmg);
          }
          MMA.UI.showDamageText(scene, player.x, player.y - 30, names[comboNum] || 'HIT!', '#ff3366');
          enemy.aiState = 'combo' + (comboNum + 1);
          enemy.comboTimer = 180 * attackMod;
        } else {
          enemy.aiState = 'recover';
          enemy.comboTimer = 500 * attackMod;
        }
      }
      return;
    }
    if (enemy.aiState === 'recover') { enemy.setVelocity(0,0); enemy.comboTimer -= dt; if (enemy.comboTimer <= 0) enemy.aiState = null; return; }
    if (dist < enemy.type.chaseRange) {
      if (dist < enemy.type.attackRange) {
        enemy.setVelocity(0,0);
        var isEliteBreaker = window.MMA.Enemies.canEliteBreakCoordination(enemy);
        if ((enemy.hasAttackToken || enemy.isBoss || isEliteBreaker) && enemy.attackCooldown <= 0 && !enemy.aiState) {
          enemy.aiState = 'combo1';
          enemy.comboTimer = 120 * attackMod;
          enemy.attackCooldown = enemy.type.attackCooldownMax;
          // Apply elite coordination break damage penalty if breaking coordination
          if (isEliteBreaker) {
            window.MMA.Enemies.recordEliteStrike(enemy, scene, true);
          }
        }
      } else {
        enemy.setVelocity((dx/dist)*enemy.type.speed*speedMod, (dy/dist)*enemy.type.speed*speedMod);
      }
    } else enemy.setVelocity(0,0);
    if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;
  },

  // Bully AI: hunts aggressively when player HP is low, but panics and flees at critical HP.
  bully: function(enemy, player, scene, dt) {
    var dx = player.x - enemy.x, dy = player.y - enemy.y, dist = Math.sqrt(dx*dx + dy*dy) || 1;
    var speedMod = (enemy.moveSpeedMod || 1) * (enemy.shakenMoveMult || 1);
    var attackMod = (enemy.attackSpeedMod || 1) * (enemy.shakenAttackMult || 1);
    var vulnMult = window.MMA.Enemies.getInjuryDamageMultiplier(enemy);

    var pHp = (player && player.stats) ? player.stats.hp : 1;
    var pMax = (player && player.stats) ? (player.stats.maxHp || 1) : 1;
    var pPct = pMax > 0 ? (pHp / pMax) : 1;

    // If player is low, bully pushes harder (but still respects attack token coordination)
    var aggro = (pPct <= 0.30);
    var spd = enemy.type.speed * (aggro ? 1.25 : 1.0) * speedMod;
    var vengeanceMult = window.MMA.Enemies.getVengeanceDamageMult(enemy);

    if (dist < enemy.type.chaseRange) {
      if (dist < enemy.type.attackRange) {
        enemy.setVelocity(0, 0);
        var isEliteBreaker = window.MMA.Enemies.canEliteBreakCoordination(enemy);
        if ((enemy.hasAttackToken || enemy.isBoss || isEliteBreaker) && enemy.attackCooldown <= 0) {
          enemy.attackCooldown = enemy.type.attackCooldownMax * (aggro ? 0.75 : 1.0) * attackMod;
          var dmg = Math.round(enemy.type.attackDamage * vulnMult * (aggro ? 1.2 : 1.0) * (window.MMA.Enemies.getPackDamageMultiplier ? window.MMA.Enemies.getPackDamageMultiplier(enemy, scene) : 1) * vengeanceMult * (window.MMA.Enemies.getTerritoryAttackMultiplier ? window.MMA.Enemies.getTerritoryAttackMultiplier(enemy, scene) : 1));
          // Apply elite coordination break damage penalty
          if (isEliteBreaker) {
            dmg = Math.round(dmg * window.MMA.Enemies.ELITE_COORDINATION_BREAK.DAMAGE_MULT);
            window.MMA.Enemies.recordEliteStrike(enemy, scene, true);
          }
          // Body Language Read: bully telegraph is more aggressive/obvious.
          if (!window.MMA.Enemies.startTelegraphAttack(enemy, player, scene, dmg, 100, 'PRESSURE STEP', '#ff8800', 'PRESSURE STEP')) {
            window.MMA.Enemies.damagePlayer(enemy, scene, dmg);
          }
          if (aggro && Math.random() < 0.25) MMA.UI.showDamageText(scene, player.x, player.y - 30, 'BULLIED!', '#ff8800');
        }
      } else {
        enemy.setVelocity((dx / dist) * spd, (dy / dist) * spd);
      }
    } else {
      enemy.setVelocity(0, 0);
    }

    if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;
  },

  // Feint Master AI: circles at mid range, performs fake windup (no damage), then real strike 300ms later
  feintMaster: function(enemy, player, scene, dt) {
    var dx = player.x - enemy.x, dy = player.y - enemy.y, dist = Math.sqrt(dx*dx + dy*dy) || 1;
    var speedMod = (enemy.moveSpeedMod || 1) * (enemy.shakenMoveMult || 1);
    var attackMod = (enemy.attackSpeedMod || 1) * (enemy.shakenAttackMult || 1);
    var vulnMult = window.MMA.Enemies.getInjuryDamageMultiplier(enemy);

    // feintWindup: fake windup - no damage, shows "FEINT!" text
    if (enemy.aiState === 'feintWindup') {
      enemy.setVelocity(0, 0);
      enemy.feintTimer -= dt;
      if (enemy.feintTimer <= 0) {
        // Transition to real strike after 300ms total (220ms feint + ~80ms more)
        enemy.aiState = 'realStrike';
        enemy.strikeTimer = 80; // remaining time to true strike
        // Show attack name for real strike
        MMA.UI.showDamageText(scene, enemy.x, enemy.y - 30, 'STRIKE!', '#ff00ff');
      }
      return;
    }

    // realStrike: actual damaging attack - only deal damage if hasAttackToken or isBoss
    if (enemy.aiState === 'realStrike') {
      enemy.setVelocity(0, 0);
      enemy.strikeTimer -= dt;
      if (enemy.strikeTimer <= 0) {
        // Deal damage only with token or if boss
        if (enemy.hasAttackToken || enemy.isBoss) {
          var vengeanceMult = window.MMA.Enemies.getVengeanceDamageMult(enemy);
          var dmg = Math.round(enemy.type.attackDamage * vulnMult * 1.3 * vengeanceMult * (window.MMA.Enemies.getTerritoryAttackMultiplier ? window.MMA.Enemies.getTerritoryAttackMultiplier(enemy, scene) : 1)); // slightly stronger on real hit
          window.MMA.Enemies.damagePlayer(enemy, scene, dmg);
          MMA.UI.showDamageText(scene, player.x, player.y - 30, '-' + dmg + ' HP', '#ff0000');
        }
        // Enter retreat phase
        enemy.aiState = 'retreat';
        enemy.retreatTimer = 600;
      }
      return;
    }

    // Retreat after real strike
    if (enemy.aiState === 'retreat') {
      enemy.setVelocity(-(dx / dist) * enemy.type.speed * 1.2 * speedMod, -(dy / dist) * enemy.type.speed * 1.2 * speedMod);
      enemy.retreatTimer -= dt;
      if (enemy.retreatTimer <= 0) {
        enemy.aiState = null;
      }
      return;
    }

    // Circle at mid range when not attacking
    var minRange = 70;
    var maxRange = 150;

    if (dist < enemy.type.chaseRange) {
      if (dist >= minRange && dist <= maxRange) {
        // Circle the player
        if (!enemy.circleDir) enemy.circleDir = Math.random() < 0.5 ? 1 : -1;
        if (!enemy.circleAngle) enemy.circleAngle = Math.atan2(dy, dx);
        enemy.circleAngle += enemy.circleDir * 2.0 * (dt / 1000);
        var targetX = player.x + Math.cos(enemy.circleAngle) * minRange;
        var targetY = player.y + Math.sin(enemy.circleAngle) * minRange;
        var cx = targetX - enemy.x, cy = targetY - enemy.y;
        var cdist = Math.sqrt(cx * cx + cy * cy) || 1;
        enemy.setVelocity((cx / cdist) * enemy.type.speed * 0.85 * speedMod, (cy / cdist) * enemy.type.speed * 0.85 * speedMod);

        // Random chance to start feint attack when in range and cooldown ready
        if (enemy.attackCooldown <= 0 && Math.random() < 0.006) {
          enemy.aiState = 'feintWindup';
          enemy.feintTimer = 220; // fake windup duration (no damage)
          enemy.attackCooldown = enemy.type.attackCooldownMax * attackMod;
          enemy.setVelocity(0, 0);
          // Show feint indicator
          MMA.UI.showDamageText(scene, enemy.x, enemy.y - 40, 'FEINT!', '#ffff00');
        }
      } else if (dist < minRange) {
        // Back up slightly
        enemy.setVelocity(-(dx / dist) * enemy.type.speed * 0.6 * speedMod, -(dy / dist) * enemy.type.speed * 0.6 * speedMod);
      } else {
        // Approach player
        enemy.setVelocity((dx / dist) * enemy.type.speed * 0.8 * speedMod, (dy / dist) * enemy.type.speed * 0.8 * speedMod);
      }
    } else {
      enemy.setVelocity(0, 0);
    }

    if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;
  },

  // Tutor AI: behaves like chase, but when attacking it cycles through the player's last 3 move keys.
  // This is a best-effort "mirror"; if no learned moves are available it just punches normally.
  tutor: function(enemy, player, scene, dt) {
    var dx = player.x - enemy.x, dy = player.y - enemy.y, dist = Math.sqrt(dx*dx + dy*dy) || 1;
    var speedMod = (enemy.moveSpeedMod || 1) * (enemy.shakenMoveMult || 1);
    var attackMod = (enemy.attackSpeedMod || 1) * (enemy.shakenAttackMult || 1);
    var vulnMult = window.MMA.Enemies.getInjuryDamageMultiplier(enemy);
    var vengeanceMult = window.MMA.Enemies.getVengeanceDamageMult(enemy);

    if (dist < enemy.type.chaseRange) {
      if (dist < enemy.type.attackRange) {
        enemy.setVelocity(0, 0);
        var isEliteBreaker = window.MMA.Enemies.canEliteBreakCoordination(enemy);
        if ((enemy.hasAttackToken || enemy.isBoss || isEliteBreaker) && enemy.attackCooldown <= 0) {
          enemy.attackCooldown = enemy.type.attackCooldownMax * attackMod;

          var moveKey = null;
          if (enemy.learnedMoves && enemy.learnedMoves.length) {
            moveKey = enemy.learnedMoves[enemy.learnedMoveIdx % enemy.learnedMoves.length];
            enemy.learnedMoveIdx = (enemy.learnedMoveIdx || 0) + 1;
          }

          // Translate move key to a group for light damage tuning + flavor text.
          var g = (window.MMA.Enemies.ADAPTIVE_TACTICS && window.MMA.Enemies.ADAPTIVE_TACTICS.MOVE_TYPE_GROUPS) ? window.MMA.Enemies.ADAPTIVE_TACTICS.MOVE_TYPE_GROUPS : {};
          var group = moveKey ? (g[moveKey] || 'unknown') : 'unknown';
          var groupMult = (group === 'grappler') ? 1.15 : (group === 'kicker') ? 1.10 : 1.0;

          var dmg = Math.round(enemy.type.attackDamage * vulnMult * groupMult * (window.MMA.Enemies.getPackDamageMultiplier ? window.MMA.Enemies.getPackDamageMultiplier(enemy, scene) : 1) * vengeanceMult * (window.MMA.Enemies.getTerritoryAttackMultiplier ? window.MMA.Enemies.getTerritoryAttackMultiplier(enemy, scene) : 1));
          // Apply elite coordination break damage penalty
          if (isEliteBreaker) {
            dmg = Math.round(dmg * window.MMA.Enemies.ELITE_COORDINATION_BREAK.DAMAGE_MULT);
            window.MMA.Enemies.recordEliteStrike(enemy, scene, true);
          }
          window.MMA.Enemies.damagePlayer(enemy, scene, dmg);

          if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
            MMA.UI.showDamageText(scene, enemy.x, enemy.y - 30, moveKey ? ('MIRROR: ' + moveKey) : 'TUTOR STRIKE!', '#66ff33');
          }
        }
      } else {
        enemy.setVelocity((dx / dist) * enemy.type.speed * speedMod, (dy / dist) * enemy.type.speed * speedMod);
      }
    } else {
      enemy.setVelocity(0, 0);
    }

    if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;
  },

  // Glitcher AI: occasionally blinks behind the player, then does a quick strike.
  glitcher: function(enemy, player, scene, dt) {
    var cfg = window.MMA.Enemies.GLITCHER_CONFIG;
    var dx = player.x - enemy.x, dy = player.y - enemy.y, dist = Math.sqrt(dx*dx + dy*dy) || 1;
    var speedMod = (enemy.moveSpeedMod || 1) * (enemy.shakenMoveMult || 1);
    var attackMod = (enemy.attackSpeedMod || 1) * (enemy.shakenAttackMult || 1);
    var vulnMult = window.MMA.Enemies.getInjuryDamageMultiplier(enemy);
    var vengeanceMult = window.MMA.Enemies.getVengeanceDamageMult(enemy);

    if (enemy._blinkCd === undefined) enemy._blinkCd = 500 + Math.random() * 800;
    if (enemy._blinkCd > 0) enemy._blinkCd -= dt;

    // Handle scheduled post-blink strike
    if (enemy.aiState === 'blinkStrike') {
      enemy.setVelocity(0, 0);
      enemy._blinkStrikeTimer -= dt;
      if (enemy._blinkStrikeTimer <= 0) {
        enemy.aiState = null;
        if (enemy.hasAttackToken || enemy.isBoss) {
          var dmg = Math.round(enemy.type.attackDamage * cfg.STRIKE_MULT * vulnMult * (window.MMA.Enemies.getPackDamageMultiplier ? window.MMA.Enemies.getPackDamageMultiplier(enemy, scene) : 1) * vengeanceMult * (window.MMA.Enemies.getTerritoryAttackMultiplier ? window.MMA.Enemies.getTerritoryAttackMultiplier(enemy, scene) : 1));
          // Body Language Read: very short "glitch tell" before impact.
          if (!window.MMA.Enemies.startTelegraphAttack(enemy, player, scene, dmg, 80, 'GLITCH TELL', '#00e5ff', 'GLITCH TELL')) {
            window.MMA.Enemies.damagePlayer(enemy, scene, dmg);
          }
          if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
            MMA.UI.showDamageText(scene, player.x, player.y - 30, 'GLITCH HIT!', '#00e5ff');
          }
        }
      }
      if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;
      return;
    }

    // Attempt blink when within range window and cooldown ready
    if (dist >= cfg.MIN_DIST && dist <= cfg.MAX_DIST && enemy._blinkCd <= 0 && enemy.attackCooldown <= 0) {
      // Teleport behind player (opposite direction of vector from enemy -> player)
      var ux = dx / dist, uy = dy / dist;
      var targetX = player.x - ux * cfg.BEHIND_DISTANCE;
      var targetY = player.y - uy * cfg.BEHIND_DISTANCE;

      // Visual blink
      if (enemy.setTint) enemy.setTint(0x00e5ff);
      if (scene && scene.tweens) {
        scene.tweens.add({ targets: enemy, alpha: 0.15, duration: 80, yoyo: true, repeat: 1, ease: 'Sine.easeInOut' });
      }
      enemy.x = targetX;
      enemy.y = targetY;

      if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
        MMA.UI.showDamageText(scene, enemy.x, enemy.y - 40, 'BLINK!', '#00e5ff');
      }

      enemy.aiState = 'blinkStrike';
      enemy._blinkStrikeTimer = cfg.STRIKE_DELAY_MS;
      enemy._blinkCd = cfg.COOLDOWN_MS;
      enemy.attackCooldown = enemy.type.attackCooldownMax * 0.9 * attackMod;
      return;
    }

    // Default behavior: chase like a fast striker
    if (dist < enemy.type.chaseRange) {
      if (dist < enemy.type.attackRange) {
        enemy.setVelocity(0, 0);
        var isEliteBreaker = window.MMA.Enemies.canEliteBreakCoordination(enemy);
        if ((enemy.hasAttackToken || enemy.isBoss || isEliteBreaker) && enemy.attackCooldown <= 0) {
          enemy.attackCooldown = enemy.type.attackCooldownMax * attackMod;
          var dmg = Math.round(enemy.type.attackDamage * vulnMult * (window.MMA.Enemies.getPackDamageMultiplier ? window.MMA.Enemies.getPackDamageMultiplier(enemy, scene) : 1) * vengeanceMult * (window.MMA.Enemies.getTerritoryAttackMultiplier ? window.MMA.Enemies.getTerritoryAttackMultiplier(enemy, scene) : 1));
          // Apply elite coordination break damage penalty
          if (isEliteBreaker) {
            dmg = Math.round(dmg * window.MMA.Enemies.ELITE_COORDINATION_BREAK.DAMAGE_MULT);
            window.MMA.Enemies.recordEliteStrike(enemy, scene, true);
          }
          window.MMA.Enemies.damagePlayer(enemy, scene, dmg);
        }
      } else {
        enemy.setVelocity((dx / dist) * enemy.type.speed * speedMod, (dy / dist) * enemy.type.speed * speedMod);
      }
    } else {
      enemy.setVelocity(0, 0);
    }

    if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;
  },

  // Echo AI: records player's attack pattern and plays it back after a delay
  // Player must vary their approach or get hit by their own combo
  echo: function(enemy, player, scene, dt) {
    var cfg = window.MMA.Enemies.ECHO_CONFIG;
    var dx = player.x - enemy.x, dy = player.y - enemy.y, dist = Math.sqrt(dx*dx + dy*dy) || 1;
    var speedMod = (enemy.moveSpeedMod || 1) * (enemy.shakenMoveMult || 1);
    var attackMod = (enemy.attackSpeedMod || 1) * (enemy.shakenAttackMult || 1);
    var vulnMult = window.MMA.Enemies.getInjuryDamageMultiplier(enemy);
    var vengeanceMult = window.MMA.Enemies.getVengeanceDamageMult(enemy);

    // Initialize echo tracking if needed
    if (!enemy._echoRecorded) enemy._echoRecorded = [];
    if (!enemy._echoRecordStart) enemy._echoRecordStart = 0;
    if (!enemy._echoState) enemy._echoState = 'recording'; // 'recording', 'waiting', 'playback'

    // Start recording window timer
    if (enemy._echoState === 'recording') {
      if (enemy._echoRecordStart === 0) {
        enemy._echoRecordStart = Date.now();
      }

      // Record player's attacks within the window
      var now = Date.now();
      if (now - enemy._echoRecordStart < cfg.RECORD_WINDOW_MS) {
        // Check if player recently attacked (by checking attack history)
        var recentAttacks = (scene._playerAttackMoveKeys || []).slice(-cfg.MAX_RECORDED_ATTACKS);
        // Copy any new attacks not yet recorded
        recentAttacks.forEach(function(moveKey) {
          if (enemy._echoRecorded.indexOf(moveKey) === -1 && enemy._echoRecorded.length < cfg.MAX_RECORDED_ATTACKS) {
            enemy._echoRecorded.push(moveKey);
          }
        });
      } else if (enemy._echoRecorded.length > 0) {
        // Recording window complete, start waiting for playback
        enemy._echoState = 'waiting';
        enemy._echoWaitTimer = 600; // brief pause before playback
        enemy._echoPlaybackIdx = 0;
      }
    }

    // Waiting state - brief pause before echo playback
    if (enemy._echoState === 'waiting') {
      enemy.setVelocity(0, 0);
      enemy._echoWaitTimer -= dt;
      if (enemy._echoWaitTimer <= 0 && enemy._echoRecorded.length > 0) {
        enemy._echoState = 'playback';
        // Show echoing warning
        if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
          MMA.UI.showDamageText(scene, enemy.x, enemy.y - 50, cfg.WARNING_TEXT, '#9933ff');
        }
      }
    }

    // Playback state - replay recorded attacks
    if (enemy._echoState === 'playback') {
      enemy.setVelocity(0, 0);

      if (!enemy._echoPlaybackTimer) enemy._echoPlaybackTimer = 0;
      enemy._echoPlaybackTimer -= dt;

      if (enemy._echoPlaybackTimer <= 0) {
        // Execute next recorded attack
        if (enemy._echoPlaybackIdx < enemy._echoRecorded.length) {
          var moveKey = enemy._echoRecorded[enemy._echoPlaybackIdx];
          enemy._echoPlaybackIdx++;

          // Calculate damage based on original move (scaled down)
          var g = (window.MMA.Enemies.ADAPTIVE_TACTICS && window.MMA.Enemies.ADAPTIVE_TACTICS.MOVE_TYPE_GROUPS) ? window.MMA.Enemies.ADAPTIVE_TACTICS.MOVE_TYPE_GROUPS : {};
          var group = moveKey ? (g[moveKey] || 'unknown') : 'unknown';
          var groupMult = (group === 'grappler') ? 1.2 : (group === 'kicker') ? 1.1 : 1.0;

          var dmg = Math.round(enemy.type.attackDamage * cfg.DAMAGE_MULT * groupMult * vulnMult * vengeanceMult * (window.MMA.Enemies.getTerritoryAttackMultiplier ? window.MMA.Enemies.getTerritoryAttackMultiplier(enemy, scene) : 1));
          window.MMA.Enemies.damagePlayer(enemy, scene, dmg);

          if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
            MMA.UI.showDamageText(scene, player.x, player.y - 30, cfg.PLAYBACK_TEXT + ' ' + (moveKey || 'ATK'), '#9933ff');
          }

          enemy._echoPlaybackTimer = cfg.PLAYBACK_DELAY_MS;
        } else {
          // Playback complete - reset and start recording again
          enemy._echoState = 'recording';
          enemy._echoRecorded = [];
          enemy._echoRecordStart = 0;
          enemy._echoPlaybackIdx = 0;
        }
      }
    }

    // Standard chase behavior when not in echo states
    if (enemy._echoState === 'recording') {
      if (dist < enemy.type.chaseRange) {
        if (dist < enemy.type.attackRange) {
          enemy.setVelocity(0, 0);
          var isEliteBreaker = window.MMA.Enemies.canEliteBreakCoordination(enemy);
          if ((enemy.hasAttackToken || enemy.isBoss || isEliteBreaker) && enemy.attackCooldown <= 0) {
            enemy.attackCooldown = enemy.type.attackCooldownMax * attackMod;
            var dmg = Math.round(enemy.type.attackDamage * vulnMult * vengeanceMult * (window.MMA.Enemies.getTerritoryAttackMultiplier ? window.MMA.Enemies.getTerritoryAttackMultiplier(enemy, scene) : 1));
            // Apply elite coordination break damage penalty
            if (isEliteBreaker) {
              dmg = Math.round(dmg * window.MMA.Enemies.ELITE_COORDINATION_BREAK.DAMAGE_MULT);
              window.MMA.Enemies.recordEliteStrike(enemy, scene, true);
            }
            window.MMA.Enemies.damagePlayer(enemy, scene, dmg);
          }
        } else {
          enemy.setVelocity((dx / dist) * enemy.type.speed * speedMod, (dy / dist) * enemy.type.speed * speedMod);
        }
      } else {
        enemy.setVelocity(0, 0);
      }
    }

    if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;
  },

  // Drunk Monk AI: unpredictable attack patterns - swings wildly, trips randomly, occasionally lands devastating accidental hits
  // Unsettling RNG element that keeps players on toes
  drunkMonk: function(enemy, player, scene, dt) {
    var dx = player.x - enemy.x, dy = player.y - enemy.y, dist = Math.sqrt(dx*dx + dy*dy) || 1;
    var speedMod = (enemy.moveSpeedMod || 1) * (enemy.shakenMoveMult || 1);
    var attackMod = (enemy.attackSpeedMod || 1) * (enemy.shakenAttackMult || 1);
    var vulnMult = window.MMA.Enemies.getInjuryDamageMultiplier(enemy);
    var vengeanceMult = window.MMA.Enemies.getVengeanceDamageMult(enemy);

    // Initialize drunk state
    if (enemy._drunkState === undefined) enemy._drunkState = 'wander'; // 'wander', 'windup', 'swing', 'trip', 'recovery'
    if (enemy._drunkTimer === undefined) enemy._drunkTimer = 0;
    if (enemy._drunkWobble === undefined) enemy._drunkWobble = 0;

    // Wobble effect: random slight position jitter
    enemy._drunkWobble += (Math.random() - 0.5) * 0.8;
    enemy._drunkWobble *= 0.9; // decay
    enemy.x += enemy._drunkWobble;

    // Handle trip state (stumbles randomly)
    if (enemy._drunkState === 'trip') {
      enemy.setVelocity(0, 0);
      enemy._drunkTimer -= dt;
      if (enemy._drunkTimer <= 0) {
        enemy._drunkState = 'recovery';
        enemy._drunkTimer = 400;
        // Trip recovery has a chance to do an accidental wild swing
        if (Math.random() < 0.35) {
          enemy._drunkState = 'accidentalSwing';
          enemy._drunkTimer = 150;
        }
      }
      return;
    }

    // Accidental devastating hit (the drunk lands a lucky shot)
    if (enemy._drunkState === 'accidentalSwing') {
      enemy.setVelocity(0, 0);
      enemy._drunkTimer -= dt;
      if (enemy._drunkTimer <= 0 && (enemy.hasAttackToken || enemy.isBoss)) {
        // BIG damage! Lucky hit
        var luckyMult = 1.8 + Math.random() * 0.7; // 1.8x to 2.5x damage
        var dmg = Math.round(enemy.type.attackDamage * luckyMult * vulnMult * vengeanceMult * (window.MMA.Enemies.getPackDamageMultiplier ? window.MMA.Enemies.getPackDamageMultiplier(enemy, scene) : 1) * (window.MMA.Enemies.getTerritoryAttackMultiplier ? window.MMA.Enemies.getTerritoryAttackMultiplier(enemy, scene) : 1));
        window.MMA.Enemies.damagePlayer(enemy, scene, dmg);
        if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
          MMA.UI.showDamageText(scene, player.x, player.y - 40, 'LUCKY SHOT!', '#ffa500');
          MMA.UI.showDamageText(scene, player.x, player.y - 25, '-' + dmg + '!', '#ff0000');
        }
        enemy._drunkState = 'wander';
        enemy._drunkTimer = 800 + Math.random() * 600;
      }
      return;
    }

    // Recovery after swing
    if (enemy._drunkState === 'recovery') {
      enemy.setVelocity(0, 0);
      enemy._drunkTimer -= dt;
      if (enemy._drunkTimer <= 0) {
        enemy._drunkState = 'wander';
        enemy._drunkTimer = 500 + Math.random() * 800;
      }
      return;
    }

    // Windup for a wild swing
    if (enemy._drunkState === 'windup') {
      enemy.setVelocity(0, 0);
      enemy._drunkTimer -= dt;
      if (enemy._drunkTimer <= 0) {
        enemy._drunkState = 'swing';
        enemy._drunkTimer = 180;
      }
      return;
    }

    // The actual swing attack
    if (enemy._drunkState === 'swing') {
      enemy.setVelocity(0, 0);
      enemy._drunkTimer -= dt;
      if (enemy._drunkTimer <= 0) {
        var isEliteBreaker = window.MMA.Enemies.canEliteBreakCoordination(enemy);
        if ((enemy.hasAttackToken || enemy.isBoss || isEliteBreaker)) {
          // Normal swing damage with slight bonus
          var dmg = Math.round(enemy.type.attackDamage * 1.15 * vulnMult * vengeanceMult * (window.MMA.Enemies.getPackDamageMultiplier ? window.MMA.Enemies.getPackDamageMultiplier(enemy, scene) : 1) * (window.MMA.Enemies.getTerritoryAttackMultiplier ? window.MMA.Enemies.getTerritoryAttackMultiplier(enemy, scene) : 1));
          // Apply elite coordination break damage penalty
          if (isEliteBreaker) {
            dmg = Math.round(dmg * window.MMA.Enemies.ELITE_COORDINATION_BREAK.DAMAGE_MULT);
            window.MMA.Enemies.recordEliteStrike(enemy, scene, true);
          }
          window.MMA.Enemies.damagePlayer(enemy, scene, dmg);
        }
        if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
          MMA.UI.showDamageText(scene, enemy.x, enemy.y - 30, 'WILD SWING!', '#8866aa');
        }
        // Random trip after swing (drunk being clumsy)
        if (Math.random() < 0.25) {
          enemy._drunkState = 'trip';
          enemy._drunkTimer = 600;
        } else {
          enemy._drunkState = 'wander';
          enemy._drunkTimer = 600 + Math.random() * 700;
        }
      }
      return;
    }

    // Wander state: unpredictable movement
    if (enemy._drunkState === 'wander') {
      enemy._drunkTimer -= dt;

      // Occasionally do random things
      if (enemy._drunkTimer <= 0) {
        var roll = Math.random();
        if (roll < 0.15) {
          // Trip!
          enemy._drunkState = 'trip';
          enemy._drunkTimer = 500 + Math.random() * 400;
          if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
            MMA.UI.showDamageText(scene, enemy.x, enemy.y - 35, 'TRIPPED!', '#aaaaaa');
          }
        } else if (roll < 0.45) {
          // Wind up a swing
          enemy._drunkState = 'windup';
          enemy._drunkTimer = 250 + Math.random() * 150;
        } else {
          // Just wander around unpredictably
          enemy._drunkState = 'wander';
          enemy._drunkTimer = 400 + Math.random() * 600;
        }
      }

      // Move unpredictably - add noise to direction
      if (dist < enemy.type.chaseRange) {
        var noise = (Math.random() - 0.5) * 0.6;
        var angle = Math.atan2(dy, dx) + noise;
        var spd = enemy.type.speed * 0.6 * speedMod;
        enemy.setVelocity(Math.cos(angle) * spd, Math.sin(angle) * spd);
      } else {
        enemy.setVelocity(0, 0);
      }
    }

    if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;
  },

  // Temperamental Enforcer AI: heavy hitter that gets faster when allies die, but becomes less accurate
  enforcer: function(enemy, player, scene, dt) {
    var cfg = window.MMA.Enemies.ENFORCER_CONFIG;
    var dx = player.x - enemy.x, dy = player.y - enemy.y, dist = Math.sqrt(dx*dx + dy*dy) || 1;
    var speedMod = (enemy.moveSpeedMod || 1) * (enemy.shakenMoveMult || 1);
    var attackMod = (enemy.attackSpeedMod || 1) * (enemy.shakenAttackMult || 1);
    var vulnMult = window.MMA.Enemies.getInjuryDamageMultiplier(enemy);
    var vengeanceMult = window.MMA.Enemies.getVengeanceDamageMult(enemy);

    // Handle enrage timer and stacks
    if (!enemy.enforceRageStacks) enemy.enforceRageStacks = 0;
    if (!enemy.enforceRageTimer) enemy.enforceRageTimer = 0;

    // Update enrage duration
    if (enemy.enforceRageTimer > 0) {
      enemy.enforceRageTimer -= dt;
      if (enemy.enforceRageTimer <= 0) {
        // Enrage expired
        enemy.enforceRageStacks = 0;
        enemy.enforceRageTimer = 0;
        // Clear red tint
        enemy.clearTint();
      }
    }

    // Calculate enforcer bonuses
    var rageStacks = enemy.enforceRageStacks || 0;
    var attackSpeedBonus = 1 - (rageStacks * cfg.ATTACK_SPEED_BONUS); // Reduce cooldown multiplier
    var accuracyPenalty = rageStacks * cfg.ACCURACY_PENALTY; // Miss chance

    // Apply attack speed bonus
    var totalAttackMod = attackMod * attackSpeedBonus;

    if (dist < enemy.type.chaseRange) {
      if (dist < enemy.type.attackRange) {
        enemy.setVelocity(0, 0);
        var isEliteBreaker = window.MMA.Enemies.canEliteBreakCoordination(enemy);
        if ((enemy.hasAttackToken || enemy.isBoss || isEliteBreaker) && enemy.attackCooldown <= 0) {
          // Check accuracy - chance to miss when enraged
          if (Math.random() < accuracyPenalty) {
            // Miss!
            if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
              MMA.UI.showDamageText(scene, player.x, player.y - 30, 'MISSED!', '#888888');
            }
            // Reset cooldown but no damage
            enemy.attackCooldown = enemy.type.attackCooldownMax * totalAttackMod;
          } else {
            // Hit!
            enemy.attackCooldown = enemy.type.attackCooldownMax * totalAttackMod;
            var dmg = Math.round(enemy.type.attackDamage * vulnMult * (window.MMA.Enemies.getPackDamageMultiplier ? window.MMA.Enemies.getPackDamageMultiplier(enemy, scene) : 1) * vengeanceMult * (window.MMA.Enemies.getTerritoryAttackMultiplier ? window.MMA.Enemies.getTerritoryAttackMultiplier(enemy, scene) : 1));
            // Apply elite coordination break damage penalty
            if (isEliteBreaker) {
              dmg = Math.round(dmg * window.MMA.Enemies.ELITE_COORDINATION_BREAK.DAMAGE_MULT);
              window.MMA.Enemies.recordEliteStrike(enemy, scene, true);
            }
            window.MMA.Enemies.damagePlayer(enemy, scene, dmg);
            // Show damage text with enrage indicator
            var hitText = rageStacks > 0 ? 'ENFORCER HIT!' : 'SMASH!';
            var hitColor = rageStacks > 0 ? '#ff4444' : '#ff8800';
            if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
              MMA.UI.showDamageText(scene, player.x, player.y - 30, hitText, hitColor);
            }
          }
        }
      } else {
        // Approach - slower than normal due to heavy build
        enemy.setVelocity((dx / dist) * enemy.type.speed * 0.75 * speedMod, (dy / dist) * enemy.type.speed * 0.75 * speedMod);
      }
    } else {
      enemy.setVelocity(0, 0);
    }

    if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;
  },

  // Drunk Monk AI: unpredictable attack patterns - swings wildly, trips randomly,
  // occasionally lands devastating accidental hits. Creates unsettling RNG element.
  drunkMonk: function(enemy, player, scene, dt) {
    var dx = player.x - enemy.x, dy = player.y - enemy.y, dist = Math.sqrt(dx*dx + dy*dy) || 1;
    var speedMod = (enemy.moveSpeedMod || 1) * (enemy.shakenMoveMult || 1);
    var attackMod = (enemy.attackSpeedMod || 1) * (enemy.shakenAttackMult || 1);
    var vulnMult = window.MMA.Enemies.getInjuryDamageMultiplier(enemy);
    var vengeanceMult = window.MMA.Enemies.getVengeanceDamageMult(enemy);

    // Initialize drunk state tracking
    if (enemy._drunkState === undefined) {
      enemy._drunkState = 'wander'; // wander, stumble, attack, trip, recover
      enemy._drunkTimer = 0;
      enemy._drunkDirection = Math.random() * Math.PI * 2;
      enemy._luckyHitChance = 0.08; // 8% chance for devastating lucky hit
    }

    // State machine for drunk behavior
    if (enemy._drunkState === 'wander') {
      enemy.setVelocity(0, 0);
      enemy._drunkTimer -= dt;

      // Random direction changes while wandering
      if (Math.random() < 0.02) {
        enemy._drunkDirection = Math.random() * Math.PI * 2;
      }

      // Move in random direction, generally toward player but erratically
      var towardPlayer = Math.atan2(dy, dx);
      var wanderAngle = towardPlayer + (Math.random() - 0.5) * 1.5; // Wide variance
      var speed = enemy.type.speed * 0.4 * speedMod;

      enemy.setVelocity(Math.cos(wanderAngle) * speed, Math.sin(wanderAngle) * speed);

      if (enemy._drunkTimer <= 0) {
        // Randomly transition to next state
        var rand = Math.random();
        if (rand < 0.35) {
          enemy._drunkState = 'stumble';
          enemy._drunkTimer = 400 + Math.random() * 300;
          enemy.setVelocity(0, 0);
          MMA.UI.showDamageText(scene, enemy.x, enemy.y - 40, 'WOAH!', '#aa66aa');
        } else if (rand < 0.65 && dist < enemy.type.chaseRange) {
          enemy._drunkState = 'wildSwing';
          enemy._drunkTimer = 200 + Math.random() * 200;
          enemy.setVelocity(0, 0);
        } else if (rand < 0.85 && dist < enemy.type.attackRange) {
          enemy._drunkState = 'trip';
          enemy._drunkTimer = 600 + Math.random() * 400;
          enemy.setVelocity(0, 0);
          MMA.UI.showDamageText(scene, enemy.x, enemy.y - 40, 'OOPS!', '#aa66aa');
        } else {
          enemy._drunkState = 'wander';
          enemy._drunkTimer = 800 + Math.random() * 600;
        }
      }
    }
    else if (enemy._drunkState === 'stumble') {
      // Stumble around unpredictably
      enemy._drunkTimer -= dt;

      // Rapid direction changes during stumble
      if (Math.random() < 0.15) {
        enemy._drunkDirection = Math.random() * Math.PI * 2;
      }

      var stumbleSpeed = enemy.type.speed * 0.6 * speedMod;
      enemy.setVelocity(Math.cos(enemy._drunkDirection) * stumbleSpeed, Math.sin(enemy._drunkDirection) * stumbleSpeed);

      if (enemy._drunkTimer <= 0) {
        enemy._drunkState = 'wander';
        enemy._drunkTimer = 600 + Math.random() * 800;
      }
    }
    else if (enemy._drunkState === 'wildSwing') {
      // Wild swinging attack - less accurate but can be devastating
      enemy._drunkTimer -= dt;
      enemy.setVelocity(0, 0);

      if (enemy._drunkTimer <= 0 && enemy.attackCooldown <= 0) {
        enemy.attackCooldown = enemy.type.attackCooldownMax * 1.5 * attackMod;

        // Check for lucky critical hit
        var isLucky = Math.random() < enemy._luckyHitChance;
        var damageMult = isLucky ? 2.5 : 0.7; // Lucky = 2.5x, Normal = 0.7x (less accurate)
        var tMult = window.MMA.Enemies.getTerritoryAttackMultiplier ? window.MMA.Enemies.getTerritoryAttackMultiplier(enemy, scene) : 1;

        var dmg = Math.round(enemy.type.attackDamage * damageMult * vulnMult * vengeanceMult * tMult);
        window.MMA.Enemies.damagePlayer(enemy, scene, dmg);

        var hitText = isLucky ? 'LUCKY SHOT!' : 'WILD SWING!';
        var hitColor = isLucky ? '#ffff00' : '#aa66aa';
        MMA.UI.showDamageText(scene, player.x, player.y - 30, hitText + ' -' + dmg, hitColor);

        enemy._drunkState = 'recover';
        enemy._drunkTimer = 500 + Math.random() * 400;
      }
    }
    else if (enemy._drunkState === 'trip') {
      // Trip and fall - but can land on player for damage
      enemy._drunkTimer -= dt;
      enemy.setVelocity(0, 0);

      if (enemy._drunkTimer <= 0 && enemy.attackCooldown <= 0) {
        enemy.attackCooldown = enemy.type.attackCooldownMax * attackMod;

        // Check if tripped INTO player (lucky fall damage)
        var distToPlayer = Math.sqrt(Math.pow(player.x - enemy.x, 2) + Math.pow(player.y - enemy.y, 2));
        var landedOnPlayer = distToPlayer < enemy.type.attackRange * 1.5;

        if (landedOnPlayer) {
          var isLucky = Math.random() < enemy._luckyHitChance;
          var damageMult = isLucky ? 3.0 : 1.2;
          var tMult = window.MMA.Enemies.getTerritoryAttackMultiplier ? window.MMA.Enemies.getTerritoryAttackMultiplier(enemy, scene) : 1;

          var dmg = Math.round(enemy.type.attackDamage * damageMult * vulnMult * vengeanceMult * tMult);
          window.MMA.Enemies.damagePlayer(enemy, scene, dmg);

          var hitText = isLucky ? 'CRASH LAND!' : 'OOPS!';
          var hitColor = isLucky ? '#ff0000' : '#aa66aa';
          MMA.UI.showDamageText(scene, player.x, player.y - 30, hitText + ' -' + dmg, hitColor);
        } else {
          MMA.UI.showDamageText(scene, enemy.x, enemy.y - 30, 'TRIPPED!', '#aa66aa');
        }

        enemy._drunkState = 'recover';
        enemy._drunkTimer = 700 + Math.random() * 500;
      }
    }
    else if (enemy._drunkState === 'recover') {
      // Recovering from wild action
      enemy._drunkTimer -= dt;
      enemy.setVelocity(0, 0);

      if (enemy._drunkTimer <= 0) {
        enemy._drunkState = 'wander';
        enemy._drunkTimer = 500 + Math.random() * 700;
      }
    }

    // Always reduce attack cooldown
    if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;
  },

  // Trickster AI: special enemy that vanishes and reappears behind the player during combat
  // Requires quick camera awareness to defend. Visual: dissolve particle effect followed by reappearance behind player
  trickster: function(enemy, player, scene, dt) {
    var cfg = window.MMA.Enemies.TRICKSTER_CONFIG;
    var dx = player.x - enemy.x, dy = player.y - enemy.y, dist = Math.sqrt(dx*dx + dy*dy) || 1;
    var speedMod = (enemy.moveSpeedMod || 1) * (enemy.shakenMoveMult || 1);
    var attackMod = (enemy.attackSpeedMod || 1) * (enemy.shakenAttackMult || 1);
    var vulnMult = window.MMA.Enemies.getInjuryDamageMultiplier(enemy);
    var vengeanceMult = window.MMA.Enemies.getVengeanceDamageMult(enemy);

    // Initialize trickster state
    if (enemy._trickState === undefined) enemy._trickState = 'chase'; // 'chase', 'vanish', 'reappear', 'strike'
    if (enemy._trickTimer === undefined) enemy._trickTimer = 0;
    if (enemy._lastTeleport === undefined) enemy._lastTeleport = 0;

    var now = Date.now();
    var timeSinceTeleport = now - (enemy._lastTeleport || 0);

    // Check HP threshold for teleport ability
    var hpRatio = enemy.stats.hp / enemy.stats.maxHp;
    var canTeleport = hpRatio >= cfg.MIN_HP_FOR_TELEPORT && timeSinceTeleport >= cfg.MIN_COOLDOWN_MS;

    // Handle vanish state - enemy disappears with dissolve effect
    if (enemy._trickState === 'vanish') {
      enemy.setVelocity(0, 0);
      enemy._trickTimer -= dt;

      // Visual: fade out with dissolve effect
      if (enemy.setAlpha && enemy._trickTimer > cfg.TELEPORT_DURATION * 0.5) {
        enemy.setAlpha(Math.max(0, enemy.alpha - 0.08));
      }

      // Create dissolve particles (simulated with small circles)
      if (scene && scene.add && Math.random() < 0.3) {
        var px = enemy.x + (Math.random() - 0.5) * 30;
        var py = enemy.y + (Math.random() - 0.5) * 40;
        var particle = scene.add.circle(px, py, 3 + Math.random() * 4, 0xff00aa, 0.6);
        scene.tweens.add({
          targets: particle,
          alpha: 0,
          scale: 0.1,
          duration: 300,
          onComplete: function() { if (particle.destroy) particle.destroy(); }
        });
      }

      if (enemy._trickTimer <= 0) {
        // Teleport behind player
        var ux = dx / dist, uy = dy / dist;
        enemy.x = player.x - ux * cfg.BEHIND_DISTANCE;
        enemy.y = player.y - uy * cfg.BEHIND_DISTANCE;
        enemy._trickState = 'reappear';
        enemy._trickTimer = cfg.TELEPORT_DURATION;

        // Show behind you warning
        if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
          MMA.UI.showDamageText(scene, player.x, player.y - 50, cfg.TELEPORT_TEXT, cfg.TELEPORT_COLOR);
        }
      }
      return;
    }

    // Handle reappear state - enemy reappears with dissolve effect
    if (enemy._trickState === 'reappear') {
      enemy.setVelocity(0, 0);
      enemy._trickTimer -= dt;

      // Visual: fade back in with dissolve effect
      if (enemy.setAlpha && enemy._trickTimer < cfg.TELEPORT_DURATION * 0.5) {
        enemy.setAlpha(Math.min(1, enemy.alpha + 0.1));
      }

      // Create reappear particles
      if (scene && scene.add && Math.random() < 0.4) {
        var px = enemy.x + (Math.random() - 0.5) * 30;
        var py = enemy.y + (Math.random() - 0.5) * 40;
        var particle = scene.add.circle(px, py, 2 + Math.random() * 3, 0xff66ff, 0.7);
        scene.tweens.add({
          targets: particle,
          alpha: 0,
          scale: 1.5,
          duration: 250,
          onComplete: function() { if (particle.destroy) particle.destroy(); }
        });
      }

      if (enemy._trickTimer <= 0) {
        enemy._trickState = 'strike';
        enemy._trickTimer = cfg.STRIKE_DELAY;
        // Set tint to show ready to strike
        if (enemy.setTint) enemy.setTint(0xff00ff);
      }
      return;
    }

    // Handle strike state - powerful attack from behind
    if (enemy._trickState === 'strike') {
      enemy.setVelocity(0, 0);
      enemy._trickTimer -= dt;

      // Restore alpha and tint
      if (enemy.setAlpha) enemy.setAlpha(1);
      if (enemy.setTint) enemy.setTint(cfg.WARNING_COLOR);

      if (enemy._trickTimer <= 0 && enemy.attackCooldown <= 0) {
        if (enemy.hasAttackToken || enemy.isBoss) {
          // Apply damage with bonus for post-teleport strike
          var tMult = window.MMA.Enemies.getTerritoryAttackMultiplier ? window.MMA.Enemies.getTerritoryAttackMultiplier(enemy, scene) : 1;
          var dmg = Math.round(enemy.type.attackDamage * cfg.DAMAGE_MULT * vulnMult * vengeanceMult * tMult);
          window.MMA.Enemies.damagePlayer(enemy, scene, dmg);

          if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
            MMA.UI.showDamageText(scene, player.x, player.y - 30, 'BACKSTAB! -' + dmg, '#ff00ff');
          }
        }

        // Reset to chase
        enemy._trickState = 'chase';
        enemy._trickTimer = 0;
        enemy._lastTeleport = now;
        enemy.attackCooldown = enemy.type.attackCooldownMax * attackMod;
        if (enemy.setTint) enemy.clearTint();
      }
      return;
    }

    // Attempt to trigger teleport
    if (canTeleport && Math.random() < cfg.TELEPORT_CHANCE * (dt / 16)) {
      enemy._trickState = 'vanish';
      enemy._trickTimer = cfg.TELEPORT_DURATION;

      // Show vanish warning
      if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
        MMA.UI.showDamageText(scene, enemy.x, enemy.y - 45, cfg.WARNING_TEXT, cfg.WARNING_COLOR);
      }

      // Set tint during vanish
      if (enemy.setTint) enemy.setTint(0x440044);
      return;
    }

    // Default chase behavior
    if (dist < enemy.type.chaseRange) {
      if (dist < enemy.type.attackRange) {
        enemy.setVelocity(0, 0);
        var isEliteBreaker = window.MMA.Enemies.canEliteBreakCoordination(enemy);
        if ((enemy.hasAttackToken || enemy.isBoss || isEliteBreaker) && enemy.attackCooldown <= 0) {
          enemy.attackCooldown = enemy.type.attackCooldownMax * attackMod;
          var tMult = window.MMA.Enemies.getTerritoryAttackMultiplier ? window.MMA.Enemies.getTerritoryAttackMultiplier(enemy, scene) : 1;
          var dmg = Math.round(enemy.type.attackDamage * vulnMult * vengeanceMult * tMult);
          if (isEliteBreaker) {
            dmg = Math.round(dmg * window.MMA.Enemies.ELITE_COORDINATION_BREAK.DAMAGE_MULT);
            window.MMA.Enemies.recordEliteStrike(enemy, scene, true);
          }
          window.MMA.Enemies.damagePlayer(enemy, scene, dmg);
        }
      } else {
        enemy.setVelocity((dx / dist) * enemy.type.speed * speedMod, (dy / dist) * enemy.type.speed * speedMod);
      }
    } else {
      enemy.setVelocity(0, 0);
    }

    if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;
  },

  // Bounty Hunter AI: aggressive hunter that pursues player relentlessly
  // Gains bonuses when player is low HP, has red glow, and tracks the player
  bountyHunter: function(enemy, player, scene, dt) {
    var cfg = window.MMA.Enemies.BOUNTY_HUNTER_CONFIG;
    var dx = player.x - enemy.x, dy = player.y - enemy.y, dist = Math.sqrt(dx*dx + dy*dy) || 1;
    var speedMod = (enemy.moveSpeedMod || 1) * (enemy.shakenMoveMult || 1);
    var attackMod = (enemy.attackSpeedMod || 1) * (enemy.shakenAttackMult || 1);
    var vulnMult = window.MMA.Enemies.getInjuryDamageMultiplier(enemy);
    var vengeanceMult = window.MMA.Enemies.getVengeanceDamageMult(enemy);

    // Tracking bonus: extra damage when player is low HP
    var playerHpRatio = (scene.player && scene.player.stats) ? (scene.player.stats.hp / scene.player.stats.maxHp) : 1;
    var trackingBonus = (playerHpRatio <= cfg.LOW_HP_THRESHOLD) ? cfg.TRACKING_BONUS : 0;

    // Apply pursuit speed bonus
    var pursuitSpeed = enemy.type.speed * cfg.PURSUE_SPEED_MULT * speedMod;

    // Bounty hunter has longer attack range (can snipe)
    var snipeRange = cfg.SNIPE_RANGE;

    if (dist < enemy.type.chaseRange * 1.2) {
      if (dist < snipeRange) {
        enemy.setVelocity(0, 0);
        var isEliteBreaker = window.MMA.Enemies.canEliteBreakCoordination(enemy);
        if ((enemy.hasAttackToken || enemy.isBoss || isEliteBreaker) && enemy.attackCooldown <= 0) {
          enemy.attackCooldown = enemy.type.attackCooldownMax * attackMod;
          
          // Calculate damage with tracking bonus
          var tMult = window.MMA.Enemies.getTerritoryAttackMultiplier ? window.MMA.Enemies.getTerritoryAttackMultiplier(enemy, scene) : 1;
          var dmg = Math.round(enemy.type.attackDamage * (1 + trackingBonus) * vulnMult * vengeanceMult * tMult);
          
          if (isEliteBreaker) {
            dmg = Math.round(dmg * window.MMA.Enemies.ELITE_COORDINATION_BREAK.DAMAGE_MULT);
            window.MMA.Enemies.recordEliteStrike(enemy, scene, true);
          }
          
          // Body Language Read: brief telegraph
          if (!window.MMA.Enemies.startTelegraphAttack(enemy, player, scene, dmg, 100, 'HUNTER STRIKE', '#ff4444', 'SHOULDER DIP')) {
            window.MMA.Enemies.damagePlayer(enemy, scene, dmg);
          }
          
          // Show tracking bonus text if active
          if (trackingBonus > 0 && typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
            MMA.UI.showDamageText(scene, player.x, player.y - 40, 'TRACKING SHOT!', '#ff4444');
          }
        }
      } else {
        // Pursuit: move faster than normal
        enemy.setVelocity((dx/dist) * pursuitSpeed, (dy/dist) * pursuitSpeed);
      }
    } else {
      enemy.setVelocity(0, 0);
    }

    if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;
  },

  // Showstopper AI: rare enemy that "pauses" the player mid-attack for 1 second
  // Visual: clockwork gears appear briefly around the enemy during pause
  showstopper: function(enemy, player, scene, dt) {
    var cfg = window.MMA.Enemies.SHOWSTOPPER_CONFIG;
    var dx = player.x - enemy.x, dy = player.y - enemy.y, dist = Math.sqrt(dx*dx + dy*dy) || 1;
    var speedMod = (enemy.moveSpeedMod || 1) * (enemy.shakenMoveMult || 1);
    var attackMod = (enemy.attackSpeedMod || 1) * (enemy.shakenAttackMult || 1);
    var vulnMult = window.MMA.Enemies.getInjuryDamageMultiplier(enemy);
    var vengeanceMult = window.MMA.Enemies.getVengeanceDamageMult(enemy);

    // Initialize showstopper state
    if (enemy._showstopperPaused === undefined) enemy._showstopperPaused = false;
    if (enemy._showstopperGears === undefined) enemy._showstopperGears = [];
    if (enemy._pauseCooldown === undefined) enemy._pauseCooldown = 0;

    var now = Date.now();

    // Reduce pause cooldown
    if (enemy._pauseCooldown > 0) enemy._pauseCooldown -= dt;

    // Handle pause state - player is frozen
    if (enemy._showstopperPaused) {
      enemy.setVelocity(0, 0);
      enemy._pauseTimer -= dt;

      // Rotate gears during pause
      if (enemy._showstopperGears) {
        enemy._showstopperGears.forEach(function(gear, idx) {
          if (gear && gear.active) {
            gear.angle += (cfg.GEAR_ROTATION_SPEED / 16) * (idx % 2 === 0 ? 1 : -1);
          }
        });
      }

      if (enemy._pauseTimer <= 0) {
        // Pause ended - restore player
        enemy._showstopperPaused = false;
        
        // Clean up gears
        if (enemy._showstopperGears) {
          enemy._showstopperGears.forEach(function(gear) {
            if (gear && gear.destroy) gear.destroy();
          });
          enemy._showstopperGears = [];
        }

        // Restore player movement
        if (scene.player && scene.player.setMovable) {
          scene.player.setMovable(true);
        }
        if (scene.player && scene.player.setInteractive) {
          scene.player.setInteractive(true);
        }
        // Remove any pause indicators
        scene.children.each(function(obj) {
          if (obj && obj._isPauseIndicator) {
            obj.destroy();
          }
        });
      }
      return;
    }

    // Normal showstopper AI behavior
    if (dist < enemy.type.chaseRange) {
      if (dist < enemy.type.attackRange * 1.1) {
        enemy.setVelocity(0, 0);
        
        var isEliteBreaker = window.MMA.Enemies.canEliteBreakCoordination(enemy);
        if ((enemy.hasAttackToken || enemy.isBoss || isEliteBreaker) && enemy.attackCooldown <= 0) {
          enemy.attackCooldown = enemy.type.attackCooldownMax * attackMod;
          
          var tMult = window.MMA.Enemies.getTerritoryAttackMultiplier ? window.MMA.Enemies.getTerritoryAttackMultiplier(enemy, scene) : 1;
          var dmg = Math.round(enemy.type.attackDamage * vulnMult * vengeanceMult * tMult);
          
          if (isEliteBreaker) {
            dmg = Math.round(dmg * window.MMA.Enemies.ELITE_COORDINATION_BREAK.DAMAGE_MULT);
            window.MMA.Enemies.recordEliteStrike(enemy, scene, true);
          }

          // Check if we should trigger pause effect
          var canPause = enemy._pauseCooldown <= 0;
          var willPause = canPause && Math.random() < cfg.PAUSE_CHANCE;
          
          if (willPause) {
            // Trigger pause effect
            enemy._showstopperPaused = true;
            enemy._pauseTimer = cfg.PAUSE_DURATION;
            enemy._pauseCooldown = cfg.MIN_COOLDOWN_MS;
            
            // Freeze player
            if (scene.player) {
              if (scene.player.setVelocity) scene.player.setVelocity(0, 0);
              if (scene.player.setMovable) scene.player.setMovable(false);
              if (scene.player.setInteractive) scene.player.setInteractive(false);
            }
            
            // Show warning text
            if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
              MMA.UI.showDamageText(scene, player.x, player.y - 50, cfg.WARNING_TEXT, cfg.WARNING_COLOR);
              scene.time.delayedCall(400, function() {
                MMA.UI.showDamageText(scene, player.x, player.y - 35, cfg.PAUSE_TEXT, cfg.PAUSE_COLOR);
              });
            }
            
            // Create clockwork gears visual around enemy
            if (scene && scene.add) {
              for (var i = 0; i < cfg.GEAR_COUNT; i++) {
                var angle = (Math.PI * 2 / cfg.GEAR_COUNT) * i;
                var gearX = enemy.x + Math.cos(angle) * 35;
                var gearY = enemy.y + Math.sin(angle) * 35;
                
                var gear = scene.add.circle(gearX, gearY, 12, 0xffaa00, 0.8);
                gear._isPauseIndicator = true;
                
                // Add gear teeth effect (small rectangles)
                for (var t = 0; t < 8; t++) {
                  var toothAngle = (Math.PI * 2 / 8) * t + angle;
                  var toothX = gearX + Math.cos(toothAngle) * 15;
                  var toothY = gearY + Math.sin(toothAngle) * 15;
                  var tooth = scene.add.circle(toothX, toothY, 4, 0xff8800, 0.6);
                  tooth._isPauseIndicator = true;
                }
                
                enemy._showstopperGears.push(gear);
              }
              
              // Add central gear
              var centerGear = scene.add.circle(enemy.x, enemy.y, 20, 0xffcc00, 0.9);
              centerGear._isPauseIndicator = true;
              enemy._showstopperGears.push(centerGear);
            }
            
            // Screen flash effect
            if (scene.cameras && scene.cameras.main) {
              scene.cameras.main.flash(150, 255, 200, 100);
            }
            
            // Don't deal damage while paused - the pause IS the attack effect
            return;
          }
          
          // Normal attack without pause
          // Body Language Read: brief telegraph
          if (!window.MMA.Enemies.startTelegraphAttack(enemy, player, scene, dmg, 80, 'CLOCKWORK STRIKE', '#ffaa00', 'SHOULDER DIP')) {
            window.MMA.Enemies.damagePlayer(enemy, scene, dmg);
          }
        }
      } else {
        enemy.setVelocity((dx/dist) * enemy.type.speed * speedMod, (dy/dist) * enemy.type.speed * speedMod);
      }
    } else {
      enemy.setVelocity(0, 0);
    }

    if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;
  }
};
window.ENEMY_TYPES = window.ENEMY_TYPES || window.MMA.Enemies.TYPES;
// Rival System: recurring boss "Shadow" that appears across zones with scaling stats and style-based dialogue.
window.MMA.Enemies.spawnShadow = function(scene, playerStyle) {
    var base = { hp: 5000, attack: 250, defense: 150 };
    var zoneIdx = scene.registry ? scene.registry.get('zoneIndex') || 1 : 1;
    var scale = 1 + (zoneIdx - 1) * 0.2;
    var shadow = {
      name: 'Shadow',
      type: { aiPattern: 'shadow' },
      hp: Math.round(base.hp * scale),
      maxHp: Math.round(base.hp * scale),
      attack: Math.round(base.attack * scale),
      defense: Math.round(base.defense * scale),
      isBoss: true,
      decideAction: function() {
        var recent = scene._playerAttackMoveKeys || [];
        if (recent.length >= 3) {
          return recent[recent.length - 1] + '_counter';
        }
        return 'basicAttack';
      },
      getDialogue: function() {
        if (playerStyle === 'striker') return "You think your punches can match my shadows?";
        if (playerStyle === 'grappler') return "Your holds are futile against darkness!";
        return "We shall see who controls the ring!";
      }
    };
    if (!scene.enemies) scene.enemies = [];
    scene.enemies.push(shadow);
    MMA.UI.showMessage(scene, shadow.getDialogue());
    return shadow;
};
window.ENEMY_AI = window.ENEMY_AI || window.MMA.Enemies.AI;

// ============================================================
// ENSEMBLE CAST: Recurring Enemy Character Roster
// Distinct enemy characters with backstory, unique voice lines
// ============================================================

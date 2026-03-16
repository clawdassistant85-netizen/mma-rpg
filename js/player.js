window.MMA = window.MMA || {};
window.MMA.Player = {
  // Ring Rust System - track idle time between sessions
  RING_RUST_KEY: 'mma_rpg_last_played',
  RING_RUST_DAYS: 3, // Days before ring rust applies
  RING_RUST_SPEED_DEBUFF: 0.10, // -10% movement speed
  RING_RUST_ACCURACY_DEBUFF: 0.05, // -5% accuracy
  
  // Check and apply ring rust on load
  checkRingRust: function() {
    var lastPlayed = localStorage.getItem(this.RING_RUST_KEY);
    if (!lastPlayed) return { hasRust: false };
    
    var lastDate = new Date(parseInt(lastPlayed));
    var now = new Date();
    var daysDiff = Math.floor((now - lastPlayed) / (1000 * 60 * 60 * 24));
    
    return {
      hasRust: daysDiff >= this.RING_RUST_DAYS,
      daysSince: daysDiff
    };
  },
  
  // Record current play time (call on game start)
  recordPlayTime: function() {
    localStorage.setItem(this.RING_RUST_KEY, String(Date.now()));
  },
  
  // Clear ring rust after player lands 5+ hits in first fight
  clearRingRust: function() {
    if (localStorage.getItem('mma_rpg_ring_rust_cleared') === 'true') return;
    localStorage.setItem('mma_rpg_ring_rust_cleared', 'true');
  },
  
  // Check if ring rust has been cleared this session
  hasRingRustBeenCleared: function() {
    return localStorage.getItem('mma_rpg_ring_rust_cleared') === 'true';
  },
  
  create: function(scene) {
    var DT = CONFIG.DISPLAY_TILE;
    scene.player = scene.physics.add.sprite(8 * DT, 6 * DT, 'player');
    scene.player.setDisplaySize(DT, DT * 1.5);
    scene.player.body.setSize(26, 38);
    scene.player.body.setOffset(11, 18);
    scene.player.body.setCollideWorldBounds(true);
    scene.player.stats = { 
      hp:200, maxHp:200, stamina:100, maxStamina:100, xp:0, level:1,
      // Style-based XP (new system)
      strikingXP: 0,
      grapplingXP: 0,
      submissionXP: 0,
      strikingLevel: 1,
      grapplingLevel: 1,
      submissionLevel: 1,
      // RPG Attributes (base values)
      strength: 10,
      speed: 10,
      defense: 10,
      agility: 10,
      endurance: 10
    };
    // Default move loadout (4 slots)
    scene.player.moveLoadout = ['jab', 'takedown', 'cross', 'hook'];
    // Unlocked submissions (for ground game)
    scene.player.unlockedSubmissions = ['rnc']; // Starts with RNC
    // Derived bonuses from attributes and outfit
    scene.player.speedBonus = 0;
    scene.player.defenseBonus = 0;
    scene.player.attackBonus = 0;
    scene.player.dodgeChance = 0;
    scene.player.staminaRegenBonus = 0;
    scene.player.cooldowns = {};
    scene.player.styleGauge = { striking: 0, grappling: 0 };
    scene.player.secondWindUsed = false;
    scene.player.secondWindUntil = 0;
    scene.player.unlockedMoves = ['jab', 'takedown']; // Start with basics; unlock more through gameplay
    if (scene._savedGameData) {
      var st = scene._savedGameData.playerStats, mv = scene._savedGameData.playerUnlockedMoves;
      if (st && typeof st === 'object') { 
        scene.player.stats.hp = st.hp; 
        scene.player.stats.maxHp = st.maxHp; 
        scene.player.stats.stamina = st.stamina; 
        scene.player.stats.maxStamina = st.maxStamina; 
        scene.player.stats.xp = st.xp; 
        scene.player.stats.level = st.level;
        // Load style XP (new system)
        scene.player.stats.strikingXP = st.strikingXP || 0;
        scene.player.stats.grapplingXP = st.grapplingXP || 0;
        scene.player.stats.submissionXP = st.submissionXP || 0;
        scene.player.stats.strikingLevel = st.strikingLevel || 1;
        scene.player.stats.grapplingLevel = st.grapplingLevel || 1;
        scene.player.stats.submissionLevel = st.submissionLevel || 1;
      }
      if (Array.isArray(mv) && mv.length > 0) scene.player.unlockedMoves = mv.slice();
      // Load move loadout
      if (scene._savedGameData.moveLoadout && scene._savedGameData.moveLoadout.length === 4) {
        scene.player.moveLoadout = scene._savedGameData.moveLoadout.slice();
      }
      // Load unlocked submissions
      if (scene._savedGameData.unlockedSubmissions) {
        scene.player.unlockedSubmissions = scene._savedGameData.unlockedSubmissions.slice();
      }
      // Load outfit data
      if (scene._savedGameData.outfitData) {
        MMA.Outfits.loadOutfitData(scene._savedGameData.outfitData);
      }
    }
    // Apply outfit modifiers
    this.applyOutfitModifiers(scene);
    
    // Apply Ring Rust debuff if player hasn't played in 3+ days
    var rustCheck = this.checkRingRust();
    var rustCleared = this.hasRingRustBeenCleared();
    scene.player.hasRingRust = rustCheck.hasRust && !rustCleared;
    if (scene.player.hasRingRust) {
      // Apply debuffs: -10% speed, -5% accuracy (stored as debuff flags)
      scene.player.ringRustSpeedDebuff = this.RING_RUST_SPEED_DEBUFF;
      scene.player.ringRustAccuracyDebuff = this.RING_RUST_ACCURACY_DEBUFF;
      console.log('[Ring Rust] Active - ' + rustCheck.daysSince + ' days since last play');
    } else {
      scene.player.ringRustSpeedDebuff = 0;
      scene.player.ringRustAccuracyDebuff = 0;
    }
    // Track ring rust hits this room (need 5 hits to clear)
    scene.player.ringRustHitsThisRoom = 0;
    
    // Set player texture based on equipped outfit
    var outfit = MMA.Outfits.getEquippedOutfit();
    if (outfit) {
      var outfitKey = outfit.visualKey || 'streetClothes';
      var outfitTexture = 'player_' + outfitKey;
      // Check if outfit texture exists, otherwise use default
      if (scene.textures.exists(outfitTexture)) {
        scene.player.setTexture(outfitTexture);
      }
      scene.player._mmaOutfitKey = outfitKey;
    }
    scene.player.state = 'idle';
    scene.player.hitFlash = 0;
    scene.player.justLeveled = false;
    scene.physics.add.collider(scene.player, scene.walls);
    scene.physics.add.overlap(scene.player, scene.doors, function(player, door){ MMA.Zones.handleDoorEnter(scene, player, door); }, null, scene);
    scene.playerHpGfx = scene.add.graphics().setDepth(5);
  },
  createP2: function(scene) {
    var DT = CONFIG.DISPLAY_TILE;
    scene.player2 = scene.physics.add.sprite(10 * DT, 6 * DT, 'player');
    scene.player2.setDisplaySize(DT, DT * 1.5);
    scene.player2.body.setSize(26, 38);
    scene.player2.body.setOffset(11, 18);
    scene.player2.body.setCollideWorldBounds(true);
    scene.player2.setTint(0x88aaff);
    scene.player2.stats = { hp: 200, maxHp: 200 };
    scene.player2.isNetworkPlayer = true;
    scene.physics.add.collider(scene.player2, scene.walls);
  },
  handleMovement: function(scene, time, delta) {
    if (scene.player.stunnedUntil && scene.time.now < scene.player.stunnedUntil) {
      scene.player.body.setVelocity(0, 0);
      return { vx: 0, vy: 0 };
    }
    var vx = 0, vy = 0;
    var baseSpeed = CONFIG.PLAYER_SPEED + (scene.player.speedBonus || 0);
    // Ring Rust debuff: -10% speed if active
    if (scene.player.ringRustSpeedDebuff) {
      baseSpeed *= (1 - scene.player.ringRustSpeedDebuff);
    }
    // Weather effects: rain makes movement slippery
    var weatherSlippery = scene.registry.get('weatherSlippery');
    if (weatherSlippery) {
      baseSpeed *= 0.75; // 25% slower on wet surfaces
    }
    if (scene.cursors.left.isDown  || scene.wasd.left.isDown)  vx = -baseSpeed;
    if (scene.cursors.right.isDown || scene.wasd.right.isDown) vx =  baseSpeed;
    if (scene.cursors.up.isDown    || scene.wasd.up.isDown)    vy = -baseSpeed;
    if (scene.cursors.down.isDown  || scene.wasd.down.isDown)  vy =  baseSpeed;
    if (window.MMA_TOUCH) { if (window.MMA_TOUCH.left) vx = -CONFIG.PLAYER_SPEED; if (window.MMA_TOUCH.right) vx = CONFIG.PLAYER_SPEED; if (window.MMA_TOUCH.up) vy = -CONFIG.PLAYER_SPEED; if (window.MMA_TOUCH.down) vy = CONFIG.PLAYER_SPEED; }
    scene.player.body.setVelocity(vx, vy);
    if (vx !== 0 || vy !== 0) { scene.player.setFlipX(vx < 0); var len = Math.sqrt(vx*vx + vy*vy); scene.lastDir.x = vx / len; scene.lastDir.y = vy / len; }
    return { vx: vx, vy: vy };
  },
  regenStaminaTick: function(scene) {
    var s = scene.player.stats;
    // Base regen + endurance bonus (1 point = 0.5 extra stamina per tick)
    var enduranceBonus = ((s.endurance || 10) - 10) * 0.5;
    var regenAmount = (CONFIG.STAMINA_REGEN * 0.1) + enduranceBonus;
    s.stamina = Math.min(s.maxStamina, s.stamina + regenAmount);
  },
  damage: function(scene, damage) {
    if (scene.gameOver) return;
    // Reset Second Wind eligibility if player healed above 50%
    if (scene.player.stats.hp > Math.floor(scene.player.stats.maxHp * 0.5)) {
      scene.player.secondWindUsed = false;
    }
    // Check for dodge (agility-based)
    var dodgeChance = scene.player.dodgeChance || 0;
    if (Math.random() < dodgeChance) {
      MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 20, 'DODGE!', '#88ff88');
      return;
    }
    var reducedDamage = Math.max(1, Math.round(damage - (scene.player.defenseBonus || 0)));
    scene.player.stats.hp -= reducedDamage;
    // Track damage taken for unlock system
    try {
      var _mu = JSON.parse(localStorage.getItem('mma_move_history') || '{}');
      _mu._meta = _mu._meta || {};
      _mu._meta.damageTaken = (_mu._meta.damageTaken || 0) + reducedDamage;
      localStorage.setItem('mma_move_history', JSON.stringify(_mu));
    } catch(e) {}
    // Decrease durability of equipped gear on damage
    if (scene.player && scene.player.equipmentDurability) {
      for (var gearKey in scene.player.equipmentDurability) {
        if (!scene.player.equipmentDurability.hasOwnProperty(gearKey)) continue;
        var dur = scene.player.equipmentDurability[gearKey];
        if (dur > 0) {
          scene.player.equipmentDurability[gearKey] = Math.max(0, dur - 1);
          if (scene.player.equipmentDurability[gearKey] === 0) {
            // Gear broken effect: reduce related stats by 20%
            // Simple implementation: reduce attack and defense bonuses
            if (scene.player.attackBonus) scene.player.attackBonus *= 0.8;
            if (scene.player.defenseBonus) scene.player.defenseBonus *= 0.8;
            // Show warning
            if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
              MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 40, gearKey + ' broken!', '#ff4444');
            }
          }
        }
      }
    }
    // Track damage taken in fight stats
    MMA.UI.recordHitTaken(reducedDamage);
    MMA.UI.resetCombo();
    MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 20, '-' + reducedDamage, '#ff8888');
    scene.player.setTint(0xff6666);
    scene.time.delayedCall(200, function() { if (scene.player && scene.player.active) scene.player.clearTint(); });
    // Second Wind Surge: at ≤15% HP, trigger once per life for 3s attack speed burst
    if (!scene.player.secondWindUsed && scene.player.stats.hp > 0 &&
        scene.player.stats.hp <= Math.floor(scene.player.stats.maxHp * 0.15)) {
      scene.player.secondWindUsed = true;
      scene.player.secondWindUntil = scene.time.now + 3000;
      scene.player.stats.attackSpeedBonus = (scene.player.stats.attackSpeedBonus || 0) + 0.4;
      MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 50, 'SECOND WIND!', '#FFD700');
      scene.registry.set('gameMessage', 'SECOND WIND!');
      scene.time.delayedCall(3000, function() {
        scene.player.stats.attackSpeedBonus = Math.max(0, (scene.player.stats.attackSpeedBonus || 0.4) - 0.4);
        scene.player.secondWindUntil = 0;
        scene.registry.set('gameMessage', '');
      });
    }
    if (scene.player.stats.hp <= 0) {
      scene.player.stats.hp = 0; scene.gameOver = true; scene.player.body.setVelocity(0,0); scene.registry.set('gameMessage', 'GAME OVER');
    }
  },
  // Apply outfit stat modifiers to player
  applyOutfitModifiers: function(scene) {
    if (!scene.player || !MMA.Outfits) return;
    
    var outfit = MMA.Outfits.getEquippedOutfit();
    if (!outfit) return;
    
    var mods = outfit.modifiers;
    var s = scene.player.stats;
    
    // Apply attribute modifiers (base + modifier)
    s.strength = 10 + (mods.strength || 0);
    s.speed = 10 + (mods.speed || 0);
    s.defense = 10 + (mods.defense || 0);
    s.agility = 10 + (mods.agility || 0);
    s.endurance = 10 + (mods.endurance || 0);
    
    // Calculate derived bonuses
    // Speed: each point = 5 speed bonus
    scene.player.speedBonus = (mods.speed || 0) * 5;
    // Defense: each point = 2 damage reduction
    scene.player.defenseBonus = (mods.defense || 0) * 2;
    // Strength: each point = 3 attack bonus
    scene.player.attackBonus = (mods.strength || 0) * 3;
    // Agility: each point = 1% dodge chance
    scene.player.dodgeChance = Math.max(0, Math.min(0.3, (mods.agility || 0) * 0.01));
    // Endurance is already used in regenStaminaTick
    
    // Update player texture based on outfit
    var outfitKey = outfit.visualKey || 'streetClothes';
    scene.player._mmaOutfitKey = outfitKey;
    
    // Change player texture to match outfit
    var outfitTexture = 'player_' + outfitKey;
    if (scene.textures.exists(outfitTexture)) {
      scene.player.setTexture(outfitTexture);
      // Restart idle animation with new texture
      var animKey = outfitTexture + '_idle';
      if (scene.anims.exists(animKey)) {
        scene.player.play(animKey, true);
      }
    }
  },
  // Equip a new outfit and update stats
  equipOutfit: function(scene, outfitId) {
    var modifiers = MMA.Outfits.equip(outfitId);
    if (modifiers) {
      this.applyOutfitModifiers(scene);
      return true;
    }
    return false;
  },
  // Check for outfit unlocks based on level
  checkOutfitUnlocks: function(scene, newLevel) {
    var unlocked = MMA.Outfits.checkLevelUnlocks(newLevel);
    if (unlocked.length > 0) {
      MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 40, 'NEW OUTFIT UNLOCKED!', '#ffd700');
    }
    return unlocked;
  },
  // Award style XP based on move type
  awardStyleXP: function(scene, moveKey) {
    var move = MMA.Combat.MOVE_ROSTER[moveKey];
    if (!move) return;
    
    var s = scene.player.stats;
    var xpGain = Math.max(5, Math.round(move.damage || 5));
    
    if (move.type === 'strike') {
      s.strikingXP += xpGain;
      this.checkStyleLevelUp(scene, 'striking');
      // Check for striking move unlocks
      this.checkMoveUnlocksByStyle(scene);
    } else if (move.type === 'grapple') {
      s.grapplingXP += xpGain;
      this.checkStyleLevelUp(scene, 'grappling');
      this.checkMoveUnlocksByStyle(scene);
    } else if (move.type === 'sub') {
      s.submissionXP += xpGain;
      this.checkStyleLevelUp(scene, 'submission');
      this.checkMoveUnlocksByStyle(scene);
    }
  },
  // Get XP required for a given style level
  getStyleXPForLevel: function(level) {
    return level * 75; // 75, 150, 225, 300...
  },
  // Check and process style level-up
  checkStyleLevelUp: function(scene, styleType) {
    var s = scene.player.stats;
    var currentXP, currentLevel, xpKey, levelKey;
    
    if (styleType === 'striking') {
      currentXP = s.strikingXP;
      currentLevel = s.strikingLevel;
      xpKey = 'strikingXP';
      levelKey = 'strikingLevel';
    } else if (styleType === 'grappling') {
      currentXP = s.grapplingXP;
      currentLevel = s.grapplingLevel;
      xpKey = 'grapplingXP';
      levelKey = 'grapplingLevel';
    } else if (styleType === 'submission') {
      currentXP = s.submissionXP;
      currentLevel = s.submissionLevel;
      xpKey = 'submissionXP';
      levelKey = 'submissionLevel';
    }
    
    var xpNeeded = this.getStyleXPForLevel(currentLevel + 1);
    while (currentXP >= xpNeeded && currentLevel < 10) {
      currentXP -= xpNeeded;
      currentLevel++;
      s[levelKey] = currentLevel;
      s[xpKey] = currentXP;
      xpNeeded = this.getStyleXPForLevel(currentLevel + 1);
      
      // Show level up notification
      var styleName = styleType.charAt(0).toUpperCase() + styleType.slice(1);
      MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 50, styleName + ' LV ' + currentLevel + '!', '#ff66ff');
      try { if (window.sfx) window.sfx.levelup(); } catch(e) {}
      
      // Check for new moves unlocked
      this.checkMoveUnlocksByStyle(scene);
    }
  },
  // Get overall player level (average of style levels)
  getOverallLevel: function(scene) {
    var s = scene.player.stats;
    return Math.floor((s.strikingLevel + s.grapplingLevel + s.submissionLevel) / 3);
  },
  checkMoveUnlocksByStyle: function(scene) {
    var s = scene.player.stats;
    var unlocked = scene.player.unlockedMoves;
    var newUnlocks = [];

    // Read usage from localStorage
    var history = {};
    try { history = JSON.parse(localStorage.getItem('mma_move_history') || '{}'); } catch(e) {}
    var meta = history._meta || {};
    var wins = meta.wins || s.wins || (scene.registry && scene.registry.get('wins')) || 0;
    var level = s.level || this.getOverallLevel(scene) || 1;
    var damageTaken = meta.damageTaken || 0;
    var totalGroundTime = meta.totalGroundTime || 0;

    var has = function(key) { return unlocked.indexOf(key) !== -1; };
    var grant = function(key, label) {
      if (!has(key)) {
        unlocked.push(key);
        newUnlocks.push(label);
        // Show in-game unlock banner
        if (window.MMA && MMA.UI && typeof MMA.UI.showUnlockBanner === 'function') {
          MMA.UI.showUnlockBanner(scene, key, label);
        }
      }
    };

    // Helper: total strike uses
    var totalStrikes = (history.jab||0) + (history.cross||0) + (history.hook||0) + (history.uppercut||0) + (history.bodyShot||0);

    // === UNLOCK CONDITIONS ===

    // CROSS: jab x30 OR level 3
    if (!has('cross')) {
      if ((history.jab||0) >= 30 || level >= 3)
        grant('cross', 'Cross');
    }

    // HOOK: jab x20 + cross x20 OR level 5
    if (!has('hook')) {
      if (((history.jab||0) >= 20 && (history.cross||0) >= 20) || level >= 5)
        grant('hook', 'Hook');
    }

    // UPPERCUT: cross x25 OR level 6
    if (!has('uppercut')) {
      if ((history.cross||0) >= 25 || level >= 6)
        grant('uppercut', 'Uppercut');
    }

    // LOW KICK: 40 total strikes OR level 4
    if (!has('lowKick')) {
      if (totalStrikes >= 40 || level >= 4)
        grant('lowKick', 'Low Kick');
    }

    // HEAD KICK: lowKick x20 OR (level 7 + 10 wins)
    if (!has('headKick')) {
      if ((history.lowKick||0) >= 20 || (level >= 7 && wins >= 10))
        grant('headKick', 'Head Kick');
    }

    // BODY SHOT: hook x15 OR cross x25 OR (level 5 + 5 wins)
    if (!has('bodyShot')) {
      if ((history.hook||0) >= 15 || (history.cross||0) >= 25 || (level >= 5 && wins >= 5))
        grant('bodyShot', 'Body Shot');
    }

    // GUILLOTINE: takedown x15 OR level 4
    if (!has('guillotine')) {
      if ((history.takedown||0) >= 15 || level >= 4)
        grant('guillotine', 'Guillotine');
    }

    // DODGE: damageTaken >= 100 OR level 3
    if (!has('dodge')) {
      if (damageTaken >= 100 || level >= 3)
        grant('dodge', 'Dodge');
    }

    // GNP: takedown x10 + groundTime 60s OR level 5
    if (!has('gnp')) {
      if (((history.takedown||0) >= 10 && totalGroundTime >= 60) || level >= 5)
        grant('gnp', 'Ground & Pound');
    }

    // ELBOW: gnp x15 OR level 6
    if (!has('elbow')) {
      if ((history.gnp||0) >= 15 || level >= 6)
        grant('elbow', 'Elbow');
    }

    // SUBMISSION: guillotine x10 OR (level 7 + 15 wins)
    if (!has('submission')) {
      if ((history.guillotine||0) >= 10 || (level >= 7 && wins >= 15))
        grant('submission', 'Submission');
    }

    // IMPROVE POSITION: any ground move x20 + groundTime 90s OR (level 6 + 10 wins)
    if (!has('improvePosition')) {
      var groundMoves = (history.gnp||0) + (history.elbow||0) + (history.submission||0);
      if ((groundMoves >= 20 && totalGroundTime >= 90) || (level >= 6 && wins >= 10))
        grant('improvePosition', 'Improve Position');
    }

    // SPECIAL: 5+ moves unlocked + 20 wins (prestige)
    if (!has('special')) {
      if (unlocked.length >= 5 && wins >= 20)
        grant('special', 'Special Move');
    }

    // Existing style-level unlocks for submissions (keep these — they add armbar/triangle/kimura)
    if (s.submissionLevel >= 2 && unlocked.indexOf('armbar') === -1) {
      unlocked.push('armbar');
      if (scene.player.unlockedSubmissions && scene.player.unlockedSubmissions.indexOf('armbar') === -1)
        scene.player.unlockedSubmissions.push('armbar');
      newUnlocks.push('Armbar');
    }
    if (s.submissionLevel >= 3 && unlocked.indexOf('triangleChoke') === -1) {
      unlocked.push('triangleChoke');
      if (scene.player.unlockedSubmissions && scene.player.unlockedSubmissions.indexOf('triangleChoke') === -1)
        scene.player.unlockedSubmissions.push('triangleChoke');
      newUnlocks.push('Triangle');
    }
    if (s.submissionLevel >= 4 && unlocked.indexOf('kimura') === -1) {
      unlocked.push('kimura');
      if (scene.player.unlockedSubmissions && scene.player.unlockedSubmissions.indexOf('kimura') === -1)
        scene.player.unlockedSubmissions.push('kimura');
      newUnlocks.push('Kimura');
    }

    // Announce new unlocks
    if (newUnlocks.length > 0 && window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
      MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 60, 
        'UNLOCKED: ' + newUnlocks.join(', '), '#FFD700');
    }

    // Persist updated state
    scene.registry.set('unlockedMoves', unlocked.slice());
    return newUnlocks;
  },
  // Set a move in a loadout slot
  setLoadoutSlot: function(scene, slotIndex, moveKey) {
    if (slotIndex < 0 || slotIndex > 3) return false;
    if (scene.player.unlockedMoves.indexOf(moveKey) === -1) return false;
    scene.player.moveLoadout[slotIndex] = moveKey;
    return true;
  },
  // Get current loadout
  getLoadout: function(scene) {
    return scene.player.moveLoadout ? scene.player.moveLoadout.slice() : ['jab', 'cross', 'takedown', 'hook'];
  }
};

// Pre-Fight Ritual System
MMA.Player.RITUAL_TYPES = {
  shadowBox: { label: '🥊 Shadow Box', effect: 'attackSpeed', value: 0.05, duration: 10000 },
  ropeJump: { label: '🪢 Rope Jump', effect: 'staminaRegen', value: 0.10, duration: 15000 },
  meditate: { label: '🧘 Meditate', effect: 'focusGain', value: 0.10, duration: 12000 },
};

MMA.Player.applyRitual = function(scene, ritualKey) {
  var ritual = MMA.Player.RITUAL_TYPES[ritualKey];
  if (!ritual || !scene || !scene.player) return;

  scene.player._activeRitual = ritualKey;
  scene.player._ritualUntil = scene.time.now + ritual.duration;
  scene.player._ritualEffect = ritual.effect;
  scene.player._ritualValue = ritual.value;

  // Mastery tracking
  try {
    var ritualCounts = JSON.parse(localStorage.getItem('mma_ritual_counts') || '{}');
    ritualCounts[ritualKey] = (ritualCounts[ritualKey] || 0) + 1;
    // Check for mastery bonus at 20 uses
    if (ritualCounts[ritualKey] === 20) {
      var bonusMap = { shadowBox: 'Warm-Up Expert', ropeJump: 'Cardio King', meditate: 'Mental Fortress' };
      var bonusTitle = bonusMap[ritualKey];
      if (bonusTitle && window.MMA && MMA.UI && typeof MMA.UI.queueAchievementToast === 'function') {
        MMA.UI.queueAchievementToast(scene, bonusTitle + ' unlocked!', '🏆');
      }
    }
    localStorage.setItem('mma_ritual_counts', JSON.stringify(ritualCounts));
  } catch(e) {}

  if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
    MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 30, ritual.label, '#FFD700');
  }
};

MMA.Player.getRitualBonus = function(scene, effectType) {
  var p = scene && scene.player;
  if (!p || !p._activeRitual || !p._ritualEffect) return 0;
  if (scene.time.now > (p._ritualUntil || 0)) { p._activeRitual = null; return 0; }
  if (p._ritualEffect !== effectType) return 0;
  return p._ritualValue || 0;
};

// Blood Sweat Equity Tracker
MMA.Player.getEquityStats = function() {
  try {
    return JSON.parse(localStorage.getItem('mma_equity') || '{"dealt":0,"taken":0}');
  } catch(e) { return {dealt:0, taken:0}; }
};

MMA.Player.updateEquity = function(dealt, taken) {
  try {
    var eq = MMA.Player.getEquityStats();
    eq.dealt += dealt || 0;
    eq.taken += taken || 0;
    localStorage.setItem('mma_equity', JSON.stringify(eq));
    return MMA.Player.getEquityTier(eq);
  } catch(e) { return 0; }
};

MMA.Player.getEquityTier = function(eq) {
  if (!eq || !eq.taken || eq.taken === 0) return 0;
  var ratio = eq.dealt / eq.taken;
  if (ratio >= 5) return 3; // Gold: +15% movement speed at <25% HP
  if (ratio >= 2) return 2; // Silver: +10% crit damage
  if (ratio >= 1) return 1; // Bronze: +5% all damage
  return 0;
};

MMA.Player.getEquityBonus = function(bonusType) {
  var eq = MMA.Player.getEquityStats();
  var tier = MMA.Player.getEquityTier(eq);
  if (bonusType === 'damage' && tier >= 1) return 0.05;
  if (bonusType === 'crit' && tier >= 2) return 0.10;
  if (bonusType === 'speed' && tier >= 3) return 0.15;
  return 0;
};

MMA.Player.getFightIQ = function(scene) {
  try {
    var saves = JSON.parse(localStorage.getItem('mma_rpg_save') || '{}');
    return saves.bossesDefeated || 0;
  } catch(e) { return 0; }
};

MMA.Player.getFightIQBonus = function(scene) {
  var iq = MMA.Player.getFightIQ(scene);
  if (iq >= 6) return { staminaReduction: 0.15, predictWindow: 20 }; // "flow state"
  if (iq >= 3) return { predictWindow: 10 }; // anticipate attacks 10% faster
  return {};
};

MMA.Player.recordBossDefeated = function(scene) {
  try {
    var saves = JSON.parse(localStorage.getItem('mma_rpg_save') || '{}');
    saves.bossesDefeated = (saves.bossesDefeated || 0) + 1;
    localStorage.setItem('mma_rpg_save', JSON.stringify(saves));
    var iq = saves.bossesDefeated;
    if (iq === 3 && window.MMA && MMA.UI && typeof MMA.UI.queueAchievementToast === 'function') {
      MMA.UI.queueAchievementToast(scene, 'Fight IQ: Anticipation unlocked', '🧠');
    }
    if (iq === 6 && window.MMA && MMA.UI && typeof MMA.UI.queueAchievementToast === 'function') {
      MMA.UI.queueAchievementToast(scene, 'Fight IQ: Flow State unlocked!', '🧠');
    }
  } catch(e) {}
};

MMA.Player.recordFinisher = function(moveKey) {
  try {
    var finishers = JSON.parse(localStorage.getItem('mma_finishers') || '{}');
    finishers[moveKey] = (finishers[moveKey] || 0) + 1;
    localStorage.setItem('mma_finishers', JSON.stringify(finishers));
  } catch(e) {}
};

MMA.Player.getTopFinisher = function() {
  try {
    var finishers = JSON.parse(localStorage.getItem('mma_finishers') || '{}');
    var top = null, max = 0;
    Object.keys(finishers).forEach(function(k) {
      if (finishers[k] > max) { max = finishers[k]; top = k; }
    });
    return top;
  } catch(e) { return null; }
};

MMA.Player.getFinisherBonus = function(moveKey) {
  var top = MMA.Player.getTopFinisher();
  return (top && top === moveKey) ? 1.2 : 1.0;
};
// === TECHNIQUE RUST SYSTEM ===
MMA.Player.recordMoveUsed = MMA.Player.recordMoveUsed || function(moveKey) {
  try {
    var rust = JSON.parse(localStorage.getItem('mma_technique_rust') || '{}');
    if (!rust[moveKey]) rust[moveKey] = { uses: 0, lastRoom: 0 };
    rust[moveKey].uses++;
    rust[moveKey].lastRoom = parseInt(localStorage.getItem('mma_rooms_cleared') || '0');
    localStorage.setItem('mma_technique_rust', JSON.stringify(rust));
  } catch(e) {}
};
MMA.Player.getTechniqueRustMult = MMA.Player.getTechniqueRustMult || function(moveKey) {
  try {
    var rust = JSON.parse(localStorage.getItem('mma_technique_rust') || '{}');
    var cur = parseInt(localStorage.getItem('mma_rooms_cleared') || '0');
    var data = rust[moveKey];
    if (!data) return 0.85;
    var unused = cur - (data.lastRoom || 0);
    if (unused <= 5) return 1.0;
    if (unused <= 15) return 0.95;
    if (unused <= 30) return 0.90;
    return 0.85;
  } catch(e) { return 1.0; }
};
MMA.Player.getRustLabel = MMA.Player.getRustLabel || function(moveKey) {
  var m = MMA.Player.getTechniqueRustMult(moveKey);
  if (m >= 1.0) return null;
  if (m >= 0.95) return '~';
  if (m >= 0.90) return 'RUSTY';
  return 'VERY RUSTY';
};

// === WEATHERED GEAR DEGRADATION ===
MMA.Player.degradeGear = MMA.Player.degradeGear || function(scene, damageTaken) {
  var p = scene && scene.player;
  if (!p || !p.stats) return;
  if (!p.stats._gearDurability) p.stats._gearDurability = 100;
  p.stats._gearDurability = Math.max(0, p.stats._gearDurability - Math.floor(damageTaken * 0.1));
  if (p.stats._gearDurability === 0 && p.stats.armor > 0 && !p.stats._gearBroken) {
    p.stats._gearBroken = true;
    if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
      MMA.UI.showDamageText(scene, p.x, p.y - 30, 'GEAR BROKEN!', '#888888');
    }
  }
};
MMA.Player.repairGear = MMA.Player.repairGear || function(scene) {
  var p = scene && scene.player;
  if (!p || !p.stats) return;
  p.stats._gearDurability = 100;
  p.stats._gearBroken = false;
  if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
    MMA.UI.showDamageText(scene, p.x, p.y - 30, 'GEAR REPAIRED', '#00ff88');
  }
};
MMA.Player.getGearArmorValue = MMA.Player.getGearArmorValue || function(scene) {
  var p = scene && scene.player;
  if (!p || !p.stats) return 0;
  if (p.stats._gearBroken) return 0;
  var dur = p.stats._gearDurability !== undefined ? p.stats._gearDurability : 100;
  return Math.round((p.stats.armor || 0) * (dur / 100));
};
// === FIGHTING STYLE EVOLUTION ===
// After 20 fights, player's dominant style grants passive bonus
MMA.Player.checkStyleEvolution = MMA.Player.checkStyleEvolution || function(scene) {
  var p = scene && scene.player;
  if (!p || !p.stats) return;
  try {
    var fights = parseInt(localStorage.getItem('mma_total_fights') || '0');
    if (fights < 20) return;
    var dna = p._styleDNACounts || {};
    var total = (dna.strike||0) + (dna.grapple||0) + (dna.kick||0) + (dna.special||0);
    if (total < 10) return;
    var dominant = 'balanced';
    var max = 0;
    Object.keys(dna).forEach(function(k) { if ((dna[k]||0) > max) { max = dna[k]; dominant = k; } });
    var ratio = max / total;
    if (ratio < 0.5) return; // Not dominant enough
    if (p._styleEvolution === dominant) return; // Already evolved
    p._styleEvolution = dominant;
    var bonuses = {
      strike:  { label: 'BOXER', crit: 0.10 },
      grapple: { label: 'GRAPPLER', takedownMult: 1.20 },
      kick:    { label: 'KICKER', kickMult: 1.20 },
      special: { label: 'SPECIALIST', specialMult: 1.30 }
    };
    var b = bonuses[dominant];
    if (b && window.MMA && MMA.UI && typeof MMA.UI.queueAchievementToast === 'function') {
      MMA.UI.queueAchievementToast(scene, 'STYLE: ' + b.label, '🥊');
    }
  } catch(e) {}
};

MMA.Player.getStyleEvolutionBonus = MMA.Player.getStyleEvolutionBonus || function(scene, moveType) {
  var p = scene && scene.player;
  if (!p || !p._styleEvolution) return 1.0;
  var bonuses = {
    strike:  { strike: 1.10 },
    grapple: { grapple: 1.20, takedown: 1.20 },
    kick:    { kick: 1.20 },
    special: { special: 1.30 }
  };
  var b = bonuses[p._styleEvolution];
  return (b && b[moveType]) ? b[moveType] : 1.0;
};

// === MENTAL FORTITUDE ===
// Losing streaks build mental toughness; after 3 losses, +15% dmg
MMA.Player.recordLoss = MMA.Player.recordLoss || function() {
  try {
    var streak = parseInt(localStorage.getItem('mma_loss_streak') || '0') + 1;
    localStorage.setItem('mma_loss_streak', streak);
  } catch(e) {}
};

MMA.Player.recordWin = MMA.Player.recordWin || function() {
  try {
    localStorage.setItem('mma_loss_streak', '0');
    var wins = parseInt(localStorage.getItem('mma_total_wins') || '0') + 1;
    localStorage.setItem('mma_total_wins', wins);
    var fights = parseInt(localStorage.getItem('mma_total_fights') || '0') + 1;
    localStorage.setItem('mma_total_fights', fights);
    // Track wins for move unlock system
    var _wmu = JSON.parse(localStorage.getItem('mma_move_history') || '{}');
    _wmu._meta = _wmu._meta || {};
    _wmu._meta.wins = (_wmu._meta.wins || 0) + 1;
    localStorage.setItem('mma_move_history', JSON.stringify(_wmu));
  } catch(e) {}
};

MMA.Player.getMentalFortitudeBonus = MMA.Player.getMentalFortitudeBonus || function() {
  try {
    var streak = parseInt(localStorage.getItem('mma_loss_streak') || '0');
    if (streak >= 5) return 1.25;
    if (streak >= 3) return 1.15;
    if (streak >= 1) return 1.05;
    return 1.0;
  } catch(e) { return 1.0; }
};

MMA.Player.getMentalFortitudeLabel = MMA.Player.getMentalFortitudeLabel || function() {
  try {
    var streak = parseInt(localStorage.getItem('mma_loss_streak') || '0');
    if (streak >= 5) return '💪 IRON WILL (+25%)';
    if (streak >= 3) return '😤 DETERMINED (+15%)';
    if (streak >= 1) return '👊 RESILIENT (+5%)';
    return null;
  } catch(e) { return null; }
};

// === SIGNATURE MOVE UNLOCK ===
// After using same move 15+ times, it becomes a "signature" with +10% bonus
MMA.Player.getSignatureMoves = MMA.Player.getSignatureMoves || function() {
  try {
    var rust = JSON.parse(localStorage.getItem('mma_technique_rust') || '{}');
    var sigs = [];
    Object.keys(rust).forEach(function(k) {
      if ((rust[k].uses || 0) >= 15) sigs.push(k);
    });
    return sigs;
  } catch(e) { return []; }
};

MMA.Player.isSignatureMove = MMA.Player.isSignatureMove || function(moveKey) {
  return MMA.Player.getSignatureMoves().indexOf(moveKey) !== -1;
};

MMA.Player.getSignatureBonus = MMA.Player.getSignatureBonus || function(moveKey) {
  return MMA.Player.isSignatureMove(moveKey) ? 1.10 : 1.0;
};
// === TOURNAMENT BRACKET TRACKER ===
// Tracks a mini single-elimination bracket within a zone
MMA.Player.initTournamentBracket = MMA.Player.initTournamentBracket || function(size) {
  try {
    var bracket = {
      size: size || 4,
      round: 1,
      wins: 0,
      losses: 0,
      active: true,
      startedAt: Date.now()
    };
    localStorage.setItem('mma_bracket', JSON.stringify(bracket));
    return bracket;
  } catch(e) { return null; }
};

MMA.Player.getBracket = MMA.Player.getBracket || function() {
  try { return JSON.parse(localStorage.getItem('mma_bracket') || 'null'); } catch(e) { return null; }
};

MMA.Player.advanceBracket = MMA.Player.advanceBracket || function(scene, won) {
  try {
    var b = MMA.Player.getBracket();
    if (!b || !b.active) return null;
    if (won) {
      b.wins++;
      b.round++;
      // Check if bracket complete
      var rounds = Math.log2(b.size);
      if (b.round > rounds) {
        b.active = false;
        b.champion = true;
        if (window.MMA && MMA.UI && typeof MMA.UI.queueAchievementToast === 'function') {
          MMA.UI.queueAchievementToast(scene, '🏆 TOURNAMENT CHAMPION!', '🏆');
        }
        // Unlock home arena
        if (window.MMA && MMA.Zones && typeof MMA.Zones.unlockHomeArena === 'function') {
          MMA.Zones.unlockHomeArena(scene);
        }
      }
    } else {
      b.losses++;
      b.active = false;
      if (window.MMA && MMA.UI && typeof MMA.UI.queueAchievementToast === 'function') {
        MMA.UI.queueAchievementToast(scene, 'Eliminated in Round ' + b.round, '❌');
      }
    }
    localStorage.setItem('mma_bracket', JSON.stringify(b));
    return b;
  } catch(e) { return null; }
};

MMA.Player.getBracketLabel = MMA.Player.getBracketLabel || function() {
  try {
    var b = MMA.Player.getBracket();
    if (!b || !b.active) return null;
    var rounds = Math.log2(b.size || 4);
    var remaining = rounds - b.round + 1;
    if (remaining <= 1) return 'FINAL MATCH';
    if (remaining <= 2) return 'SEMI-FINAL';
    return 'ROUND ' + b.round + ' of ' + rounds;
  } catch(e) { return null; }
};

// === CHAMPIONSHIP PROGRESS ===
MMA.Player.getChampionshipProgress = MMA.Player.getChampionshipProgress || function() {
  try {
    var save = JSON.parse(localStorage.getItem('mma_rpg_save') || '{}');
    var bosses = save.bossesDefeated || 0;
    return {
      bosses: bosses,
      champion: bosses >= 4,
      label: bosses >= 4 ? '👑 CHAMPION' : ('Boss ' + bosses + '/4')
    };
  } catch(e) { return { bosses: 0, champion: false, label: 'Boss 0/4' }; }
};
// === FIGHTER'S CREED SYSTEM ===
// Philosophy selected at game start affects playstyle bonuses
MMA.Player.CREEDS = {
  aggressive: {
    label: 'THE AGGRESSOR',
    desc: 'High risk, high reward. Attack bonuses, defense penalty.',
    attackMult: 1.15,
    defenseMult: 0.90,
    staminaCostMult: 1.10,
    color: '#ff4422'
  },
  technical: {
    label: 'THE TECHNICIAN',
    desc: 'Precise and efficient. Combo bonuses, stamina efficiency.',
    attackMult: 1.05,
    defenseMult: 1.05,
    comboBonusMult: 1.20,
    staminaCostMult: 0.90,
    color: '#4488ff'
  },
  defensive: {
    label: 'THE GUARDIAN',
    desc: 'Turtle up and counter. Defense bonuses, attack penalty.',
    attackMult: 0.90,
    defenseMult: 1.20,
    counterMult: 1.25,
    staminaCostMult: 0.95,
    color: '#44cc88'
  },
  balanced: {
    label: 'THE HYBRID',
    desc: 'No specialization. Slight bonus to all stats.',
    attackMult: 1.05,
    defenseMult: 1.05,
    staminaCostMult: 1.00,
    color: '#ffcc00'
  }
};

MMA.Player.setCreed = MMA.Player.setCreed || function(creedKey) {
  try {
    localStorage.setItem('mma_creed_choice', creedKey);
  } catch(e) {}
};

MMA.Player.getCreed = MMA.Player.getCreed || function() {
  try {
    var key = localStorage.getItem('mma_creed_choice') || 'balanced';
    return MMA.Player.CREEDS[key] || MMA.Player.CREEDS.balanced;
  } catch(e) { return MMA.Player.CREEDS.balanced; }
};

MMA.Player.getCreedKey = MMA.Player.getCreedKey || function() {
  try { return localStorage.getItem('mma_creed_choice') || 'balanced'; } catch(e) { return 'balanced'; }
};

MMA.Player.getCreedAttackMult = MMA.Player.getCreedAttackMult || function() {
  return MMA.Player.getCreed().attackMult || 1;
};

MMA.Player.getCreedDefenseMult = MMA.Player.getCreedDefenseMult || function() {
  return MMA.Player.getCreed().defenseMult || 1;
};

MMA.Player.getCreedStaminaMult = MMA.Player.getCreedStaminaMult || function() {
  return MMA.Player.getCreed().staminaCostMult || 1;
};

// Show creed selector overlay (called from LobbyScene on first run)
MMA.Player.showCreedSelector = MMA.Player.showCreedSelector || function(onSelect) {
  var existing = document.getElementById('creed-selector');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'creed-selector';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:monospace;';

  var title = document.createElement('div');
  title.textContent = 'CHOOSE YOUR CREED';
  title.style.cssText = 'color:#fff;font-size:22px;font-weight:bold;margin-bottom:24px;letter-spacing:3px;';
  overlay.appendChild(title);

  var creeds = MMA.Player.CREEDS;
  Object.keys(creeds).forEach(function(key) {
    var c = creeds[key];
    var btn = document.createElement('button');
    btn.style.cssText = 'display:block;width:260px;margin:8px;padding:12px 16px;background:#111;border:2px solid ' + c.color + ';color:' + c.color + ';font-family:monospace;font-size:13px;cursor:pointer;border-radius:4px;text-align:left;';
    btn.innerHTML = '<strong>' + c.label + '</strong><br><span style="color:#aaa;font-size:11px;">' + c.desc + '</span>';
    btn.onclick = function() {
      MMA.Player.setCreed(key);
      overlay.remove();
      if (typeof onSelect === 'function') onSelect(key);
    };
    overlay.appendChild(btn);
  });

  document.body.appendChild(overlay);
};

// === TECHNIQUE INHERITANCE ===
// Defeating an enemy grants 8% chance to temporarily inherit one of their techniques
MMA.Player.INHERITANCE_CHANCE = 0.08;
MMA.Player._inheritedTech = null;
MMA.Player._inheritedTechExpiry = 0;

MMA.Player.tryInheritTechnique = MMA.Player.tryInheritTechnique || function(scene, enemyType) {
  if (Math.random() > MMA.Player.INHERITANCE_CHANCE) return null;
  if (!enemyType || !enemyType.aiPattern) return null;

  // Map AI pattern to a move key
  var techMap = {
    'boxer': 'jab', 'kickboxer': 'headKick', 'wrestler': 'takedown',
    'muayThai': 'lowKick', 'bjj': 'guillotine', 'brawler': 'hook',
    'trickster': 'special', 'drunkMonk': 'bodyShot'
  };
  var moveKey = techMap[enemyType.aiPattern] || null;
  if (!moveKey) return null;

  MMA.Player._inheritedTech = moveKey;
  MMA.Player._inheritedTechExpiry = Date.now() + 60000; // lasts 60s

  if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function' && scene && scene.player) {
    MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 50, '📖 INHERITED: ' + moveKey.toUpperCase(), '#cc88ff');
  }
  return moveKey;
};

MMA.Player.getInheritedTechBonus = MMA.Player.getInheritedTechBonus || function(moveKey) {
  if (!MMA.Player._inheritedTech || Date.now() > MMA.Player._inheritedTechExpiry) return 1;
  if (MMA.Player._inheritedTech === moveKey) return 1.10; // +10% damage
  return 1;
};

MMA.Player.isInheritedTech = MMA.Player.isInheritedTech || function(moveKey) {
  return MMA.Player._inheritedTech === moveKey && Date.now() < MMA.Player._inheritedTechExpiry;
};

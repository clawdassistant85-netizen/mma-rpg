window.MMA = window.MMA || {};
window.MMA.Player = {
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
    scene.player.moveLoadout = ['jab', 'cross', 'takedown', 'hook'];
    // Unlocked submissions (for ground game)
    scene.player.unlockedSubmissions = ['rnc']; // Starts with RNC
    // Derived bonuses from attributes and outfit
    scene.player.speedBonus = 0;
    scene.player.defenseBonus = 0;
    scene.player.attackBonus = 0;
    scene.player.dodgeChance = 0;
    scene.player.staminaRegenBonus = 0;
    scene.player.cooldowns = {};
    scene.player.unlockedMoves = ['jab', 'cross', 'takedown', 'hook'];
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
  handleMovement: function(scene, time, delta) {
    if (scene.player.stunnedUntil && scene.time.now < scene.player.stunnedUntil) {
      scene.player.body.setVelocity(0, 0);
      return { vx: 0, vy: 0 };
    }
    var vx = 0, vy = 0;
    var baseSpeed = CONFIG.PLAYER_SPEED + (scene.player.speedBonus || 0);
    // Weather effects: rain makes movement slippery
    var weatherActive = scene.registry.get('weatherActive');
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
    // Check for dodge (agility-based)
    var dodgeChance = scene.player.dodgeChance || 0;
    if (Math.random() < dodgeChance) {
      MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 20, 'DODGE!', '#88ff88');
      return;
    }
    var reducedDamage = Math.max(1, Math.round(damage - (scene.player.defenseBonus || 0)));
    scene.player.stats.hp -= reducedDamage;
    // Track damage taken in fight stats
    MMA.UI.recordHitTaken(reducedDamage);
    MMA.UI.resetCombo();
    MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 20, '-' + reducedDamage, '#ff8888');
    scene.player.setTint(0xff6666);
    scene.time.delayedCall(200, function() { if (scene.player && scene.player.active) scene.player.clearTint(); });
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
      MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 40, 'NEW OUTFED OUTFIT UNLOCKED!', '#ffd700');
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
  // Check and unlock moves based on style levels
  checkMoveUnlocksByStyle: function(scene) {
    var s = scene.player.stats;
    var unlocked = scene.player.unlockedMoves;
    var newUnlocks = [];
    
    // Striking unlocks
    if (s.strikingLevel >= 2 && unlocked.indexOf('hook') === -1) { unlocked.push('hook'); newUnlocks.push('Hook'); }
    if (s.strikingLevel >= 2 && unlocked.indexOf('lowKick') === -1) { unlocked.push('lowKick'); newUnlocks.push('Low Kick'); }
    if (s.strikingLevel >= 3 && unlocked.indexOf('uppercut') === -1) { unlocked.push('uppercut'); newUnlocks.push('Uppercut'); }
    if (s.strikingLevel >= 4 && unlocked.indexOf('bodyShot') === -1) { unlocked.push('bodyShot'); newUnlocks.push('Body Shot'); }
    if (s.strikingLevel >= 5 && unlocked.indexOf('headKick') === -1) { unlocked.push('headKick'); newUnlocks.push('Head Kick'); }
    if (s.strikingLevel >= 7 && unlocked.indexOf('spinningBackFist') === -1) { unlocked.push('spinningBackFist'); newUnlocks.push('Spinning BF'); }
    
    // Grappling unlocks
    if (s.grapplingLevel >= 2 && unlocked.indexOf('hipThrow') === -1) { unlocked.push('hipThrow'); newUnlocks.push('Hip Throw'); }
    if (s.grapplingLevel >= 3 && unlocked.indexOf('singleLeg') === -1) { unlocked.push('singleLeg'); newUnlocks.push('Single Leg'); }
    if (s.grapplingLevel >= 4 && unlocked.indexOf('guardPass') === -1) { unlocked.push('guardPass'); newUnlocks.push('Guard Pass'); }
    if (s.grapplingLevel >= 5 && unlocked.indexOf('mountCtrl') === -1) { unlocked.push('mountCtrl'); newUnlocks.push('Mount Ctrl'); }
    
    // Submission unlocks
    if (s.submissionLevel >= 2 && unlocked.indexOf('armbar') === -1) { 
      unlocked.push('armbar'); 
      // Also add to ground submissions
      if (scene.player.unlockedSubmissions.indexOf('armbar') === -1) {
        scene.player.unlockedSubmissions.push('armbar');
      }
      newUnlocks.push('Armbar'); 
    }
    if (s.submissionLevel >= 3 && unlocked.indexOf('triangleChoke') === -1) { 
      unlocked.push('triangleChoke'); 
      if (scene.player.unlockedSubmissions.indexOf('triangleChoke') === -1) {
        scene.player.unlockedSubmissions.push('triangleChoke');
      }
      newUnlocks.push('Triangle'); 
    }
    if (s.submissionLevel >= 4 && unlocked.indexOf('kimura') === -1) { 
      unlocked.push('kimura'); 
      if (scene.player.unlockedSubmissions.indexOf('kimura') === -1) {
        scene.player.unlockedSubmissions.push('kimura');
      }
      newUnlocks.push('Kimura'); 
    }
    if (s.submissionLevel >= 5 && unlocked.indexOf('americana') === -1) { 
      unlocked.push('americana'); 
      if (scene.player.unlockedSubmissions.indexOf('americana') === -1) {
        scene.player.unlockedSubmissions.push('americana');
      }
      newUnlocks.push('Americana'); 
    }
    if (s.submissionLevel >= 6 && unlocked.indexOf('heelHook') === -1) { 
      unlocked.push('heelHook'); 
      if (scene.player.unlockedSubmissions.indexOf('heelHook') === -1) {
        scene.player.unlockedSubmissions.push('heelHook');
      }
      newUnlocks.push('Heel Hook'); 
    }
    if (s.submissionLevel >= 7 && unlocked.indexOf('kneebar') === -1) { 
      unlocked.push('kneebar'); 
      if (scene.player.unlockedSubmissions.indexOf('kneebar') === -1) {
        scene.player.unlockedSubmissions.push('kneebar');
      }
      newUnlocks.push('Kneebar'); 
    }
    
    if (newUnlocks.length > 0) {
      MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 60, 'NEW MOVE: ' + newUnlocks.join(', '), '#ffd700');
    }
    
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

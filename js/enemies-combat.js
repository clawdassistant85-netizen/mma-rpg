window.MMA = window.MMA || {};
window.MMA.Enemies = window.MMA.Enemies || {};
Object.assign(window.MMA.Enemies, {


  // Opponent Scouting Report: allows players to scout boss enemies before fighting
  // Reveals attack patterns, recommended counters, and suggested fighting style
  // Costs in-game currency (10g per scout), multiple scouts unlock more details
  SCOUTING_SYSTEM: {
    STORAGE_KEY: 'mma_rpg_scouted_enemies',
    COST_PER_SCOUT: 10,                 // Gold cost to scout an enemy
    MAX_SCOUT_LEVELS: 3,                // Max scouting depth (basic/full/complete)
    
    // Scouting data for each enemy type
    SCOUT_DATA: {
      // Boss: MMA Champ
      'mmaChamp': {
        name: 'MMA Champ',
        tier1: {
          attacks: 'Fast combinations, takes damage well',
          weakness: 'Vulnerable to grappling when winded',
          style: 'Balanced striker/grappler'
        },
        tier2: {
          attacks: 'Uses ground-and-pound, strong clinch game',
          weakness: 'Slow to recover after takedowns',
          style: 'Prefers controlling opponents'
        },
        tier3: {
          attacks: 'Signature spinning backfist, powerful hooks',
          weakness: 'Opens up after heavy strikes, predictable patterns',
          style: 'Aggressive pressure fighter'
        }
      },
      // Rival
      'shadowRival': {
        name: 'Shadow Rival',
        tier1: {
          attacks: 'Copies your fighting style',
          weakness: 'Slower reaction when you switch styles',
          style: 'Adaptive mirror'
        },
        tier2: {
          attacks: 'Uses your most frequent moves against you',
          weakness: "Cannot adapt to unfamiliar techniques",
          style: 'Pattern learner'
        },
        tier3: {
          attacks: 'Unpredictable when you vary your combos',
          weakness: 'Needs time to "read" your attacks',
          style: 'Mind games expert'
        }
      },
      // Showstopper
      'showstopper': {
        name: 'Showstopper',
        tier1: {
          attacks: 'Pauses player mid-attack briefly',
          weakness: ' telegraphed by gear spinning',
          style: 'Time manipulation'
        },
        tier2: {
          attacks: 'Clockwork gears appear before freeze',
          weakness: 'Predictable timing after first use',
          style: 'Technical control'
        },
        tier3: {
          attacks: 'Freezes for 1 second, then strikes hard',
          weakness: 'Vulnerable during freeze animation',
          style: 'Punishment specialist'
        }
      },
      // Default fallback for other enemies
      'default': {
        name: 'Unknown Enemy',
        tier1: {
          attacks: 'Basic attacks',
          weakness: 'Unknown - discover through combat',
          style: 'Unknown'
        },
        tier2: {
          attacks: 'Standard combo patterns',
          weakness: 'Find patterns by observing',
          style: 'Typical fighter'
        },
        tier3: {
          attacks: 'Full attack repertoire',
          weakness: 'Study attack patterns carefully',
          style: 'Fully revealed'
        }
      }
    },
    
    // Get scout data for an enemy type
    getScoutData: function(typeKey) {
      return this.SCOUT_DATA[typeKey] || this.SCOUT_DATA['default'];
    }
  },



  // Check if an enemy has been scouted (returns scout level 0-3)
  getScoutLevel: function(typeKey) {
    try {
      var data = localStorage.getItem(this.SCOUTING_SYSTEM.STORAGE_KEY);
      var scouted = data ? JSON.parse(data) : {};
      return scouted[typeKey] || 0;
    } catch(e) { return 0; }
  },



  // Check if enemy is scouted (any level)
  isEnemyScouted: function(typeKey) {
    return this.getScoutLevel(typeKey) > 0;
  },



  // Get scouting cost for next level
  getScoutCost: function(typeKey) {
    var currentLevel = this.getScoutLevel(typeKey);
    if (currentLevel >= this.SCOUTING_SYSTEM.MAX_SCOUT_LEVELS) return 0;
    return this.SCOUTING_SYSTEM.COST_PER_SCOUT * (currentLevel + 1);
  },



  // Attempt to scout an enemy (returns {success: bool, message: string, newLevel: number})
  scoutEnemy: function(typeKey, playerGold) {
    var currentLevel = this.getScoutLevel(typeKey);
    if (currentLevel >= this.SCOUTING_SYSTEM.MAX_SCOUT_LEVELS) {
      return { success: false, message: 'Fully scouted!', newLevel: currentLevel };
    }
    
    var cost = this.getScoutCost(typeKey);
    if (playerGold < cost) {
      return { success: false, message: 'Need ' + cost + 'g to scout!', newLevel: currentLevel };
    }
    
    // Deduct gold and save scout level
    var newLevel = currentLevel + 1;
    try {
      var data = localStorage.getItem(this.SCOUTING_SYSTEM.STORAGE_KEY);
      var scouted = data ? JSON.parse(data) : {};
      scouted[typeKey] = newLevel;
      localStorage.setItem(this.SCOUTING_SYSTEM.STORAGE_KEY, JSON.stringify(scouted));
    } catch(e) {}
    
    return { success: true, message: 'Scouted! (' + newLevel + '/' + this.SCOUTING_SYSTEM.MAX_SCOUT_LEVELS + ')', newLevel: newLevel, cost: cost };
  },



  // Get scouting info for UI display
  getScoutInfo: function(typeKey) {
    var level = this.getScoutLevel(typeKey);
    var data = this.SCOUTING_SYSTEM.getScoutData(typeKey);
    
    var info = {
      name: data.name || typeKey,
      level: level,
      maxLevel: this.SCOUTING_SYSTEM.MAX_SCOUT_LEVELS,
      nextCost: this.getScoutCost(typeKey),
      isFullyScouted: level >= this.SCOUTING_SYSTEM.MAX_SCOUT_LEVELS,
      tiers: []
    };
    
    // Add tier info based on scout level
    if (level >= 1) {
      info.tiers.push({ label: 'BASICS', text: data.tier1 });
    }
    if (level >= 2) {
      info.tiers.push({ label: 'PATTERNS', text: data.tier2 });
    }
    if (level >= 3) {
      info.tiers.push({ label: 'COMPLETE', text: data.tier3 });
    }
    
    return info;
  },



  // Get current bounty level from storage
  getBountyLevel: function() {
    try {
      var data = localStorage.getItem(this.BOUNTY_SYSTEM.STORAGE_KEY);
      return data ? parseInt(data, 10) : 0;
    } catch(e) { return 0; }
  },



  // Increase bounty level (call after boss defeat)
  increaseBounty: function() {
    var current = this.getBountyLevel();
    if (current >= this.BOUNTY_SYSTEM.MAX_BOUNTY) return current;
    var newLevel = current + 1;
    try {
      localStorage.setItem(this.BOUNTY_SYSTEM.STORAGE_KEY, String(newLevel));
    } catch(e) {}
    return newLevel;
  },



  // Decrease bounty level (mercy kill reduces bounty)
  decreaseBounty: function() {
    var current = this.getBountyLevel();
    if (current <= 0) return 0;
    var newLevel = current - 1;
    try {
      localStorage.setItem(this.BOUNTY_SYSTEM.STORAGE_KEY, String(newLevel));
    } catch(e) {}
    return newLevel;
  },



  // Get bounty multipliers for enemy stats
  getBountyMultipliers: function() {
    var level = this.getBountyLevel();
    var cfg = this.BOUNTY_SYSTEM;
    return {
      hp: 1 + (level * cfg.HP_PER_LEVEL),
      damage: 1 + (level * cfg.DAMAGE_PER_LEVEL),
      speed: 1 + (level * cfg.SPEED_PER_LEVEL),
      xp: 1 + (level * 0.10) // +10% XP per bounty level for risk/reward
    };
  },



  // Check if a bounty hunter should spawn in this room
  shouldSpawnBountyHunter: function(scene) {
    var level = this.getBountyLevel();
    if (level <= 0) return false;
    var zone = scene.currentZone || 1;
    if (zone < 2) return false; // Bounty hunters only appear from zone 2+
    
    var cfg = this.BOUNTY_SYSTEM;
    var chance = cfg.SPAWN_CHANCE_BASE + (level * cfg.SPAWN_CHANCE_PER_LEVEL);
    chance = Math.min(chance, 0.5); // Cap at 50% chance
    
    return Math.random() < chance;
  },



  // Apply bounty hunter modifications to enemy type
  applyBountyHunterMods: function(type) {
    var mults = this.getBountyMultipliers();
    type.hp = Math.round(type.hp * mults.hp);
    type.maxHp = type.hp;
    type.attackDamage = Math.round(type.attackDamage * mults.damage);
    type.speed = Math.round(type.speed * mults.speed);
    type.xpReward = Math.round(type.xpReward * mults.xp);
    type.isBountyHunter = true;
    return type;
  },



  // Get bounty warning text for UI
  getBountyWarning: function() {
    var level = this.getBountyLevel();
    if (level >= this.BOUNTY_SYSTEM.MAX_BOUNTY) {
      return { text: this.BOUNTY_SYSTEM.MAX_BOUNTY_TEXT, color: '#ff0000' };
    }
    if (level > 0) {
      return { text: 'BOUNTY LV.' + level, color: '#ff4444' };
    }
    return null;
  },



  // Mercy kill tracking: record that player used non-lethal finish
  recordMercyKill: function() {
    // Called when enemy is defeated without lethal damage (stun/knockout only)
    // Reduces bounty by 1
    var newLevel = this.decreaseBounty();
    if (newLevel >= 0 && typeof MMA !== 'undefined' && MMA.UI && MMA.UI.showDamageText) {
      // This will be shown in the scene context
    }
  },



  // Get active mercenary contract tier from scene
  getContractTier: function(scene) {
    var tier = null;
    // Try scene.registry first
    if (scene && scene.registry) {
      tier = scene.registry.get('mercenaryContractTier');
    }
    // Fall back to scene property
    if (!tier && scene && scene.mercenaryContractTier) {
      tier = scene.mercenaryContractTier;
    }
    // Validate tier exists in config
    if (tier && this.MERCENARY_CONTRACTS[tier]) {
      return tier;
    }
    return null;
  },



  // Get contract multipliers for a given tier
  getContractMultipliers: function(tier) {
    if (!tier || !this.MERCENARY_CONTRACTS[tier]) {
      return this.MERCENARY_CONTRACTS.none;
    }
    return this.MERCENARY_CONTRACTS[tier];
  },



  // Get death count for a specific enemy type
  _getNemesisDeathCount: function(typeKey) {
    try {
      var data = localStorage.getItem(this.NEMESIS_CONFIG.STORAGE_KEY);
      var deaths = data ? JSON.parse(data) : {};
      return deaths[typeKey] || 0;
    } catch(e) { return 0; }
  },



  // Record that an enemy type defeated the player
  recordNemesisDefeat: function(typeKey) {
    try {
      var data = localStorage.getItem(this.NEMESIS_CONFIG.STORAGE_KEY);
      var deaths = data ? JSON.parse(data) : {};
      deaths[typeKey] = (deaths[typeKey] || 0) + 1;
      localStorage.setItem(this.NEMESIS_CONFIG.STORAGE_KEY, JSON.stringify(deaths));
    } catch(e) {}
  },



  // Get the current nemesis enemy type (most defeats)
  getCurrentNemesis: function() {
    try {
      var data = localStorage.getItem(this.NEMESIS_CONFIG.STORAGE_KEY);
      var deaths = data ? JSON.parse(data) : {};
      var threshold = this.NEMESIS_CONFIG.DEFEAT_THRESHOLD;
      var maxType = null, maxCount = 0;
      Object.keys(deaths).forEach(function(type) {
        if (deaths[type] > maxCount && deaths[type] >= threshold) {
          maxCount = deaths[type];
          maxType = type;
        }
      });
      return maxType;
    } catch(e) { return null; }
  },



  // Check if player has slain the nemesis
  hasSlainNemesis: function() {
    try {
      return localStorage.getItem(this.NEMESIS_CONFIG.SLAYER_KEY) === 'true';
    } catch(e) { return false; }
  },



  // Mark nemesis as slain
  markNemesisSlain: function() {
    try {
      localStorage.setItem(this.NEMESIS_CONFIG.SLAYER_KEY, 'true');
    } catch(e) {}
  },



  // Apply nemesis modifiers to enemy type (called during spawn)
  applyNemesisModifiers: function(type, scene) {
    var nemesis = this.getCurrentNemesis();
    if (!nemesis) return type;

    // Check if this is the nemesis type (exact match or base type)
    var isNemesis = (type.typeKey === nemesis) ||
                    (type.baseType && type.baseType === nemesis) ||
                    (type.aiPattern && this._getAiPatternFromType(nemesis) === type.aiPattern);

    if (!isNemesis) return type;

    // Apply nemesis bonuses
    var cfg = this.NEMESIS_CONFIG;
    type.hp = Math.round(type.hp * (1 + cfg.HP_BONUS));
    type.maxHp = type.hp;
    type.attackDamage = Math.round(type.attackDamage * (1 + cfg.DAMAGE_BONUS));
    type.speed = Math.round(type.speed * (1 + cfg.SPEED_BONUS));
    type.xpReward = Math.round(type.xpReward * 1.5); // 50% more XP for beating nemesis

    // Mark as nemesis
    type.isNemesis = true;
    type.nemesisType = nemesis;

    return type;
  },



  // Helper: get AI pattern from type key (for matching)
  _getAiPatternFromType: function(typeKey) {
    var mapping = {
      'streetThug': 'chase', 'barBrawler': 'chase', 'muayThaiFighter': 'kicker',
      'wrestler': 'grasper', 'judoka': 'thrower', 'groundNPounder': 'chase',
      'bjjBlackBelt': 'subHunter', 'mmaChamp': 'chase', 'kickboxer': 'kickboxer',
      'striker': 'combo', 'stunner': 'stunner', 'coach': 'coach',
      'drunkMonk': 'drunkMonk', 'shadowRival': 'chase', 'feintMaster': 'feintMaster',
      'bully': 'bully', 'regenerator': 'regen', 'glitcher': 'glitcher',
      'tutor': 'tutor', 'echo': 'echo', 'enforcer': 'enforcer', 'tank': 'tank', 'trickster': 'trickster'
    };
    return mapping[typeKey] || 'chase';
  },



  // Check if enemy is nemesis and return special damage text
  getNemesisText: function(enemy) {
    if (enemy && enemy.type && enemy.type.isNemesis) {
      return { text: 'NEMESIS!', color: this.NEMESIS_CONFIG.TEXT_COLOR };
    }
    return null;
  },



  // Get death count for a specific enemy type (for rival echo)
  _getRivalEchoDeathCount: function(typeKey) {
    try {
      var data = localStorage.getItem(this.RIVAL_ECHO_CONFIG.STORAGE_KEY);
      var defeats = data ? JSON.parse(data) : {};
      return defeats[typeKey] || 0;
    } catch(e) { return 0; }
  },



  // Record a defeat to a specific enemy type (for rival echo tracking)
  recordRivalEchoDefeat: function(typeKey) {
    try {
      var data = localStorage.getItem(this.RIVAL_ECHO_CONFIG.STORAGE_KEY);
      var defeats = data ? JSON.parse(data) : {};
      defeats[typeKey] = (defeats[typeKey] || 0) + 1;
      localStorage.setItem(this.RIVAL_ECHO_CONFIG.STORAGE_KEY, JSON.stringify(defeats));
    } catch(e) {}
  },



  // Get current rival echo enemy type (most defeats, threshold met)
  getCurrentRivalEcho: function() {
    try {
      var data = localStorage.getItem(this.RIVAL_ECHO_CONFIG.STORAGE_KEY);
      var defeats = data ? JSON.parse(data) : {};
      var threshold = this.RIVAL_ECHO_CONFIG.DEFEAT_THRESHOLD;
      var maxType = null, maxCount = 0;
      Object.keys(defeats).forEach(function(type) {
        if (defeats[type] > maxCount && defeats[type] >= threshold) {
          maxCount = defeats[type];
          maxType = type;
        }
      });
      return maxType;
    } catch(e) { return null; }
  },



  // Check if player has cleared the current rival echo
  hasClearedRivalEcho: function() {
    try {
      var data = localStorage.getItem(this.RIVAL_ECHO_CONFIG.CLEAR_KEY);
      if (!data) return false;
      var clearData = JSON.parse(data);
      var currentEcho = this.getCurrentRivalEcho();
      if (!currentEcho) return true; // No active echo
      return clearData && clearData[currentEcho] === true;
    } catch(e) { return false; }
  },



  // Mark rival echo as cleared (player defeated echo enemy without repeating moves)
  markRivalEchoCleared: function(typeKey) {
    try {
      var data = localStorage.getItem(this.RIVAL_ECHO_CONFIG.CLEAR_KEY);
      var clearData = data ? JSON.parse(data) : {};
      clearData[typeKey] = true;
      localStorage.setItem(this.RIVAL_ECHO_CONFIG.CLEAR_KEY, JSON.stringify(clearData));
    } catch(e) {}
  },



  // Check if player repeated a move during current echo fight (to prevent clearing)
  checkRivalEchoClearAttempt: function(moveKey) {
    if (!this._lastEchoMoveKey) return false;
    var repeated = (moveKey === this._lastEchoMoveKey);
    this._lastEchoMoveKey = moveKey;
    return repeated;
  },



  // Reset current echo move tracking for new fight
  resetRivalEchoTracking: function() {
    this._lastEchoMoveKey = null;
  },



  // Apply rival echo modifiers to enemy type (called during spawn)
  applyRivalEchoModifiers: function(type, scene) {
    var echo = this.getCurrentRivalEcho();
    // Check if player has already cleared this echo
    if (this.hasClearedRivalEcho()) return type;
    if (!echo) return type;

    // Check if this is the echo type (exact match or base type)
    var isEcho = (type.typeKey === echo) ||
                  (type.baseType && type.baseType === echo) ||
                  (type.aiPattern && this._getAiPatternFromType(echo) === type.aiPattern);

    if (!isEcho) return type;

    // Apply echo bonuses
    var cfg = this.RIVAL_ECHO_CONFIG;
    type.speed = Math.round(type.speed * (1 + cfg.ATTACK_SPEED_BONUS));
    type.xpReward = Math.round(type.xpReward * 1.25); // 25% more XP for beating echo

    // Mark as rival echo
    type.isRivalEcho = true;
    type.rivalEchoType = echo;

    return type;
  },



  // Get rival echo text for enemy
  getRivalEchoText: function(enemy) {
    if (enemy && enemy.type && enemy.type.isRivalEcho) {
      return { text: this.RIVAL_ECHO_CONFIG.ECHO_TEXT, color: this.RIVAL_ECHO_CONFIG.ECHO_COLOR_TEXT };
    }
    return null;
  },



  // Apply rival echo visual aura (ghost effect) to enemy sprite
  applyRivalEchoAura: function(enemy, scene) {
    if (!enemy || !enemy.type || !enemy.type.isRivalEcho) return;

    var cfg = this.RIVAL_ECHO_CONFIG;

    // Apply purple ghost tint
    if (enemy.setTint) {
      enemy.setTint(cfg.ECHO_COLOR);
    }

    // Create ghost aura (semi-transparent duplicate)
    if (scene && scene.add) {
      // Create a ghost sprite behind the enemy
      var ghost = scene.add.sprite(enemy.x, enemy.y, enemy.texture.key);
      ghost.setDisplaySize(enemy.displayWidth, enemy.displayHeight);
      ghost.setAlpha(0.35);
      ghost.setTint(cfg.ECHO_COLOR);
      ghost.setDepth(enemy.depth - 1);
      enemy._rivalEchoGhost = ghost;

      // Sync ghost position with enemy
      if (scene.events) {
        scene.events.on('update', function() {
          if (ghost && ghost.active) {
            ghost.x = enemy.x;
            ghost.y = enemy.y;
            ghost.rotation = enemy.rotation;
          }
        });
      }
    }

    // Show RIVAL ECHO text
    if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
      MMA.UI.showDamageText(scene, enemy.x, enemy.y - 55, cfg.ECHO_TEXT, cfg.ECHO_COLOR_TEXT);
    }
  },



  // Update rival echo ghost position (called each frame)
  updateRivalEchoGhost: function(enemy) {
    if (enemy._rivalEchoGhost && enemy._rivalEchoGhost.active) {
      enemy._rivalEchoGhost.x = enemy.x;
      enemy._rivalEchoGhost.y = enemy.y;
      enemy._rivalEchoGhost.rotation = enemy.rotation;
    }
  },



  // Clean up rival echo ghost on enemy death
  cleanupRivalEchoGhost: function(enemy) {
    if (enemy._rivalEchoGhost && enemy._rivalEchoGhost.destroy) {
      enemy._rivalEchoGhost.destroy();
      enemy._rivalEchoGhost = null;
    }
  },



  // Initialize adaptive tracking for a scene
  initAdaptiveTracking: function(scene) {
    if (!scene._playerAttackHistory) {
      scene._playerAttackHistory = [];
    }
    // Also track raw move keys for enemies that "mirror" the player.
    if (!scene._playerAttackMoveKeys) {
      scene._playerAttackMoveKeys = [];
    }
  },



  // Record player attack move type
  recordPlayerAttack: function(scene, moveKey) {
    this.initAdaptiveTracking(scene);
    var moveType = this.ADAPTIVE_TACTICS.MOVE_TYPE_GROUPS[moveKey] || 'unknown';

    scene._playerAttackHistory.push(moveType);
    if (scene._playerAttackHistory.length > this.ADAPTIVE_TACTICS.TRACK_COUNT) {
      scene._playerAttackHistory.shift();
    }

    // Mirror-tracking: keep raw keys too (same window size)
    scene._playerAttackMoveKeys.push(moveKey);
    if (scene._playerAttackMoveKeys.length > this.ADAPTIVE_TACTICS.TRACK_COUNT) {
      scene._playerAttackMoveKeys.shift();
    }
  },



  // Get defense bonus based on player's attack pattern
  getAdaptiveDefense: function(enemy, scene) {
    if (!scene._playerAttackHistory || scene._playerAttackHistory.length < 3) return 1;

    // Count move type frequency in recent attacks
    var counts = {};
    var self = this;
    scene._playerAttackHistory.forEach(function(type) {
      counts[type] = (counts[type] || 0) + 1;
    });

    // Find most frequent move type
    var maxType = null, maxCount = 0;
    Object.keys(counts).forEach(function(type) {
      if (counts[type] > maxCount) {
        maxCount = counts[type];
        maxType = type;
      }
    });

    // Need at least 3 of same type to trigger adaptation
    if (maxCount >= 3 && maxType !== 'unknown') {
      // Check if enemy's current attack matches the player's frequent style
      var enemyStyle = enemy.type.aiPattern;
      var isGrappleEnemy = (enemyStyle === 'grasper' || enemyStyle === 'thrower' || enemyStyle === 'subHunter');
      var isStrikerEnemy = (enemyStyle === 'combo' || enemyStyle === 'kickboxer' || enemyStyle === 'kicker');

      // Adapt defense: striker enemies adapt to striker attacks, grapplers to grappler
      if ((maxType === 'striker' && isStrikerEnemy) || (maxType === 'grappler' && isGrappleEnemy) || (maxType === 'kicker' && (enemyStyle === 'kickboxer' || enemyStyle === 'kicker'))) {
        return 1 + self.ADAPTIVE_TACTICS.DEFENSE_BONUS;
      }
    }

    return 1;
  },



  // Initialize combo memory tracking for an enemy
  initComboMemory: function(enemy) {
    if (!enemy) return;
    enemy._comboMemoryAttacks = [];
    enemy._comboMemoryStartTime = Date.now();
    enemy._comboMemoryAdapted = false;
    enemy._comboMemoryPattern = null;
  },



  // Record player attack for combo memory (called from onPlayerAttack)
  recordComboMemoryAttack: function(scene, enemy, moveKey) {
    if (!enemy || enemy._comboMemoryAdapted || enemy.isBoss) return;

    // Initialize if not present
    if (!enemy._comboMemoryAttacks) {
      this.initComboMemory(enemy);
    }

    var now = Date.now();
    var config = this.ENEMY_COMBO_MEMORY;

    // Add attack with timestamp
    enemy._comboMemoryAttacks.push({
      move: moveKey,
      time: now
    });

    // Clean old attacks outside the tracking window
    var cutoffTime = now - config.TRACK_WINDOW_MS;
    enemy._comboMemoryAttacks = enemy._comboMemoryAttacks.filter(function(a) {
      return a.time > cutoffTime;
    });
  },



  // Check if enemy should adapt based on combo memory (called in update)
  checkComboMemoryAdaptation: function(enemy, scene) {
    if (!enemy || enemy._comboMemoryAdapted || enemy.isBoss) return false;
    if (!enemy._comboMemoryAttacks || enemy._comboMemoryAttacks.length === 0) return false;

    var config = this.ENEMY_COMBO_MEMORY;
    var now = Date.now();
    var elapsed = now - enemy._comboMemoryStartTime;

    // Check if enough time has passed and enough attacks recorded
    if (elapsed < config.ADAPTATION_TIME_MS) return false;
    if (enemy._comboMemoryAttacks.length < config.MIN_ATTACKS_TO_TRACK) return false;

    // Analyze the player's most frequent combo pattern
    var pattern = this._analyzeComboPattern(enemy._comboMemoryAttacks);
    if (!pattern) return false;

    // Mark as adapted and store the pattern
    enemy._comboMemoryAdapted = true;
    enemy._comboMemoryPattern = pattern;

    // Show adaptation feedback
    if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
      var patternName = this._getPatternName(pattern);
      MMA.UI.showDamageText(scene, enemy.x, enemy.y - 55, config.ADAPTED_TEXT, config.ADAPTED_COLOR);
      scene.time.delayedCall(800, function() {
        MMA.UI.showDamageText(scene, enemy.x, enemy.y - 40, 'READS: ' + patternName, '#ff99ff');
      });
    }

    return true;
  },



  // Analyze player's combo pattern from recorded attacks
  _analyzeComboPattern: function(attacks) {
    if (!attacks || attacks.length < this.ENEMY_COMBO_MEMORY.MIN_ATTACKS_TO_TRACK) return null;

    // Group attacks by move type
    var moveCounts = {};
    var self = this;
    attacks.forEach(function(a) {
      var type = self.ADAPTIVE_TACTICS.MOVE_TYPE_GROUPS[a.move] || 'unknown';
      moveCounts[type] = (moveCounts[type] || 0) + 1;
    });

    // Find most frequent move type
    var maxType = null, maxCount = 0;
    Object.keys(moveCounts).forEach(function(type) {
      if (moveCounts[type] > maxCount) {
        maxCount = moveCounts[type];
        maxType = type;
      }
    });

    if (maxType && maxCount >= this.ENEMY_COMBO_MEMORY.MIN_ATTACKS_TO_TRACK) {
      return { type: maxType, count: maxCount };
    }

    return null;
  },



  // Get human-readable name for the pattern
  _getPatternName: function(pattern) {
    if (!pattern) return '???';
    var type = pattern.type;
    if (type === 'striker') return 'STRIKER';
    if (type === 'grappler') return 'GRAPPLER';
    if (type === 'kicker') return 'KICKER';
    return type.toUpperCase();
  },



  // Get defense bonus from combo memory adaptation
  getComboMemoryDefenseMult: function(enemy, moveKey) {
    if (!enemy || !enemy._comboMemoryAdapted || !enemy._comboMemoryPattern) return 1;
    if (!moveKey) return 1;

    var pattern = enemy._comboMemoryPattern;
    var moveType = this.ADAPTIVE_TACTICS.MOVE_TYPE_GROUPS[moveKey] || 'unknown';

    // If player's current move matches the adapted pattern, apply defense bonus
    if (moveType === pattern.type) {
      return 1 + this.ENEMY_COMBO_MEMORY.DEFENSE_BONUS;
    }

    return 1;
  },



  // Fighter Type Counter: enemies have a hidden style affinity.
  // Elite variant multiplier
  getEliteMultiplier: function(enemy) {
    if (enemy && enemy.isElite) {
      return 2; // double damage multiplier for elite enemies
    }
    return 1;
  },



  // Wrapper around MMA.Player.damage so enemy systems can attribute hits (for Comeback Kid, etc)
  damagePlayer: function(attackerEnemy, scene, dmg) {
    // Apply taunt damage bonus if enemy recently taunted
    if (attackerEnemy && attackerEnemy._tauntDamageBonus) {
      var tauntMult = this.getTauntDamageMultiplier(attackerEnemy);
      dmg = Math.round(dmg * tauntMult);
    }

    // Sore Loser AI: apply accuracy penalty (miss chance) when active
    if (attackerEnemy && attackerEnemy.soreLoserActive && attackerEnemy.soreLoserAccuracyPenalty) {
      // Roll for miss
      if (Math.random() < attackerEnemy.soreLoserAccuracyPenalty) {
        // Enemy missed due to desperation/inaccuracy
        if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
          MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 40, 'MISSED!', '#aaaaaa');
        }
        return; // Don't apply damage
      }
    }

    try {
      if (scene && attackerEnemy) {
        scene._lastAttackerTypeKey = attackerEnemy.typeKey || (attackerEnemy.type ? attackerEnemy.type.id : null) || null;
        scene._lastAttackerName = (attackerEnemy.type && attackerEnemy.type.name) ? attackerEnemy.type.name : (attackerEnemy.typeKey || null);
      }
    } catch (e) {}
    if (typeof MMA !== 'undefined' && MMA.Player && typeof MMA.Player.damage === 'function') {
      MMA.Player.damage(scene, dmg);
    }
  },



  _comebackKey: function(typeKey) {
    return 'mma_rpg_comeback_' + String(typeKey || 'unknown');
  },



  // Apply fear tremble visual effect based on HP and recent damage
  applyFearTremble: function(enemy, scene) {
    if (!enemy || !scene) return;
    // Ensure enemy has hp stats
    if (!enemy.stats || typeof enemy.stats.hp !== 'number' || typeof enemy.stats.maxHp !== 'number') return;
    var cfg = this.FEAR_TREMBLE_CONFIG;
    var hpPct = enemy.stats.hp / enemy.stats.maxHp;
    if (hpPct > cfg.HP_THRESHOLD) {
      // Not low enough, clear any existing tween
      if (enemy._trembleTween) {
        enemy._trembleTween.stop();
        enemy._trembleTween = null;
        enemy.setPosition(enemy.x, enemy.y); // reset position
      }
      return;
    }
    // Determine recent damage amount (stored on enemy._recentDamage)
    var recentDamage = enemy._recentDamage || 0;
    var intensity = cfg.BASE_AMPLITUDE + (recentDamage * cfg.INTENSITY_SCALE);
    intensity = Math.min(intensity, cfg.MAX_AMPLITUDE);
    // If tween already matches intensity, keep it
    if (enemy._trembleTween && enemy._trembleTween.data && enemy._trembleTween.data[0].value === intensity) {
      return;
    }
    // Stop previous tween
    if (enemy._trembleTween) enemy._trembleTween.stop();
    // Create a small shake tween
    enemy._trembleTween = scene.tweens.add({
      targets: enemy,
      x: enemy.x + intensity,
      yoyo: true,
      repeat: -1,
      duration: 100,
      ease: 'Sine.easeInOut',
      onUpdate: function(tween, target) {
        // Randomize direction each repeat
        var sign = Math.random() < 0.5 ? -1 : 1;
        target.x = target.x + sign * intensity;
      }
    });
  },



  // Call this each frame for all enemies (to be hooked into the main update loop elsewhere)
  updateFearTrembleAll: function(scene, delta) {
    if (!scene || !scene.enemies) return;
    for (var i = 0; i < scene.enemies.length; i++) {
      var enemy = scene.enemies[i];
      this.applyFearTremble(enemy, scene);
    }
  },



  // Apply coach boost to allies in scene
  applyCoachBoost: function(scene) {
    if (!scene.enemies) return;
    // Find all coach enemies
    var coaches = scene.enemies.filter(function(e){ return e.type && e.type.id === 'coach'; });
    if (coaches.length===0) return;

    // For each non-coach enemy, check distance to any coach
    scene.enemies.forEach(function(enemy){
      if (enemy.type && enemy.type.id === 'coach') return;

      // Coach Down Disarray: temporarily prevent re-coaching
      if (enemy.noCoachTimer && enemy.noCoachTimer > 0) {
        if (enemy.baseAttackSpeed) enemy.attackSpeed = enemy.baseAttackSpeed;
        return;
      }

      var boosted = false;
      coaches.forEach(function(coach){
        var dx = enemy.x - coach.x;
        var dy = enemy.y - coach.y;
        var dist = Math.sqrt(dx*dx + dy*dy);
        if (dist <= MMA.Enemies.COACH_CONFIG.BOOST_RADIUS) {
          boosted = true;
        }
      });
      if (boosted) {
        // Apply attack speed multiplier if not already
        enemy.attackSpeed = (enemy.baseAttackSpeed||enemy.attackSpeed||1) * (1 + MMA.Enemies.COACH_CONFIG.ATTACK_SPEED_BONUS);
      } else {
        // Reset to base if previously boosted
        if (enemy.baseAttackSpeed) enemy.attackSpeed = enemy.baseAttackSpeed;
      }
    });
  },



  // Get damage multiplier including taunt bonus
  getTauntDamageMultiplier: function(enemy) {
    if (!enemy) return 1;
    return 1 + (enemy._tauntDamageBonus || 0);
  },



  // Apply injury to enemy from player attack
  applyInjury: function(enemy, limbType) {
    if (!enemy.injuries) {
      enemy.injuries = { armHits: 0, legHits: 0, lastHitTime: 0 };
    }
    enemy.injuries.lastHitTime = Date.now();

    var stackKey = limbType === 'leg' ? 'legHits' : 'armHits';
    var debuffKey = limbType === 'leg' ? 'legHits' : 'armHits';

    if (enemy.injuries[stackKey] < this.INJURY_SYSTEM.MAX_STACKS) {
      enemy.injuries[stackKey]++;
    }

    // Apply speed debuffs immediately
    this.applyInjuryDebuffs(enemy);

    return enemy.injuries[stackKey];
  },



  // Apply debuffs based on injury stacks
  applyInjuryDebuffs: function(enemy) {
    if (!enemy.injuries) return;

    var armDebuff = enemy.injuries.armHits * this.INJURY_SYSTEM.ARM_HIT_DEBUFF;
    var legDebuff = enemy.injuries.legHits * this.INJURY_SYSTEM.LEG_HIT_DEBUFF;

    // Modify attack cooldown (higher = slower = more debuff)
    var baseCooldown = enemy.type.attackCooldownMax / 1.8; // reverse the spawn scaling
    enemy.attackSpeedMod = 1 + armDebuff;

    // Modify movement speed
    enemy.moveSpeedMod = 1 - legDebuff;

    // Check for vulnerability (3+ total hits)
    var totalHits = enemy.injuries.armHits + enemy.injuries.legHits;
    enemy.isVulnerable = totalHits >= 3;
  },



  // Update injury states (called every frame)
  updateInjuries: function(enemy, delta) {
    if (!enemy.injuries || enemy.state === 'dead') return;

    var now = Date.now();
    var timeSinceHit = now - enemy.injuries.lastHitTime;

    // Decay stacks after duration
    if (timeSinceHit > this.INJURY_SYSTEM.STACK_DURATION && (enemy.injuries.armHits > 0 || enemy.injuries.legHits > 0)) {
      // Remove oldest stack
      if (enemy.injuries.legHits > enemy.injuries.armHits) {
        enemy.injuries.legHits--;
      } else {
        enemy.injuries.armHits--;
      }
      enemy.injuries.lastHitTime = now; // Reset timer
      this.applyInjuryDebuffs(enemy);
    }

    // Apply modifiers to actual enemy behavior
    if (enemy.attackSpeedMod) {
      enemy.attackCooldown = (enemy.attackCooldown || 0);
    }
  },



  // Get damage multiplier for attacking injured enemy
  getInjuryDamageMultiplier: function(enemy) {
    if (!enemy.injuries) return 1;
    return enemy.isVulnerable ? (1 + this.INJURY_SYSTEM.DAMAGE_BONUS_VULN) : 1;
  },



  // Loyalty Bond: Apply Vengeance to nearby allies when an enemy dies
  applyVengeanceToNearby: function(dyingEnemy, scene) {
    if (!dyingEnemy || !scene || !scene.enemies) return;

    var config = this.VENGEANCE_CONFIG;
    var now = Date.now();

    // Don't trigger on boss deaths (they have their own mechanics)
    if (dyingEnemy.isBoss) return;

    // Find nearby alive enemies within radius
    (scene.enemies || []).forEach(function(other) {
      if (!other || other === dyingEnemy) return;
      if (!other.active || other.state === 'dead') return;
      if (other.isBoss) return; // bosses don't get vengeance

      var dx = other.x - dyingEnemy.x;
      var dy = other.y - dyingEnemy.y;
      var dist = Math.sqrt(dx*dx + dy*dy);

      if (dist <= config.RADIUS) {
        // Apply vengeance - refresh timer if already active
        other.vengeanceTimer = config.DURATION;
        other.vengeanceDamageMult = 1 + config.DAMAGE_BONUS;
        other.vengeanceDefenseMult = config.DEFENSE_MULT;

        // Show VENGEANCE! floating text once per trigger
        if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
          MMA.UI.showDamageText(scene, other.x, other.y - 50, 'VENGEANCE!', '#ff4400');
        }

        // Add subtle red tint to show vengeance state
        other.setTint(0xff6644);

        // Create pulse effect
        if (scene.tweens) {
          scene.tweens.add({
            targets: other,
            alpha: 0.6,
            duration: 200,
            yoyo: true,
            repeat: 3,
            ease: 'Sine.easeInOut'
          });
        }
      }
    });
  },



  // Get vengeance damage multiplier for enemy attacks
  getVengeanceDamageMult: function(enemy) {
    if (!enemy) return 1;
    return enemy.vengeanceDamageMult || 1;
  },



  // Get vengeance defense multiplier (applied to adaptive defense)
  getVengeanceDefenseMult: function(enemy) {
    if (!enemy) return 1;
    return enemy.vengeanceDefenseMult || 1;
  },



  // Update vengeance timers - call this in updateEnemies
  updateVengeance: function(enemy, delta) {
    if (!enemy || !enemy.vengeanceTimer) return;

    enemy.vengeanceTimer -= delta;

    if (enemy.vengeanceTimer <= 0) {
      // Vengeance expired - reset multipliers
      enemy.vengeanceTimer = 0;
      enemy.vengeanceDamageMult = 1;
      enemy.vengeanceDefenseMult = 1;

      // Clear tint if enemy is still alive
      if (enemy.active && enemy.state !== 'dead') {
        // Clear custom tint - restore original if elite/boss
        if (enemy.type && enemy.type.isElite && enemy.type.eliteData && enemy.type.eliteData.colorGlow) {
          enemy.setTint(enemy.type.eliteData.colorGlow);
        } else if (enemy.isBoss) {
          enemy.setTint(0xffd700);
        } else {
          enemy.clearTint();
        }
      }
    }
  },



  // Visual feedback for injury (called when enemy takes damage)
  showInjuryFeedback: function(scene, enemy, limbType) {
    if (!enemy.injuries) return;
    
    var totalHits = enemy.injuries.armHits + enemy.injuries.legHits;
    var color = limbType === 'leg' ? '#00aaff' : '#ff6600';
    var text = limbType === 'leg' ? 'LEG HIT!' : 'ARM HIT!';
    
    // Show hit text
    MMA.UI.showDamageText(scene, enemy.x, enemy.y - 40, text, color);
    
    // Show stack count if vulnerable
    if (enemy.isVulnerable && totalHits >= 3) {
      MMA.UI.showDamageText(scene, enemy.x, enemy.y - 60, 'VULNERABLE!', '#ff0000');
    }
  },



  // Check if current enemy type has blindness from previous KO
  getBlindnessState: function(typeKey) {
    if (!this.FLASH_KO_BLINDNESS || !this.FLASH_KO_BLINDNESS.ENABLED) return null;
    try {
      var data = localStorage.getItem(this.FLASH_KO_BLINDNESS.STORAGE_KEY);
      if (!data) return null;
      var blindData = JSON.parse(data);
      if (!blindData) return null;

      // Check if this type matches and hasn't expired
      if (blindData.typeKey === typeKey && blindData.expiresAt > Date.now()) {
        return blindData;
      }
    } catch(e) {}
    return null;
  },



  // Apply blindness to an enemy (called during spawn)
  applyBlindnessToEnemy: function(enemy) {
    var cfg = this.FLASH_KO_BLINDNESS;
    var blindState = this.getBlindnessState(enemy.typeKey);

    if (blindState) {
      // Mark enemy as blinded
      enemy.isBlinded = true;
      enemy.blindnessExpiresAt = blindState.expiresAt;

      // Apply visual effect - white afterimage/sickness tint
      enemy.setTint(0xffffff);

      // Add subtle wobble animation to show disorientation
      if (enemy.scene && enemy.scene.tweens) {
        enemy.scene.tweens.add({
          targets: enemy,
          alpha: 0.7,
          x: enemy.x + 3,
          duration: 150,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }

      // Show "BLINDED!" text once when spawning
      if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
        MMA.UI.showDamageText(enemy.scene, enemy.x, enemy.y - 55, cfg.BLIND_TEXT, cfg.BLIND_COLOR);
      }

      return true;
    }
    return false;
  },



  // Record a KO that will cause blindness to same-type enemies
  recordFlashKO: function(typeKey) {
    if (!this.FLASH_KO_BLINDNESS || !this.FLASH_KO_BLINDNESS.ENABLED) return;

    try {
      var cfg = this.FLASH_KO_BLINDNESS;
      var data = {
        typeKey: typeKey,
        expiresAt: Date.now() + cfg.DURATION
      };
      localStorage.setItem(cfg.STORAGE_KEY, JSON.stringify(data));
    } catch(e) {}
  },



  // Clear blindness state (called when blindness expires)
  clearBlindness: function() {
    try {
      localStorage.removeItem(this.FLASH_KO_BLINDNESS.STORAGE_KEY);
    } catch(e) {}
  },



  // Update blindness state (called each frame for blinded enemies)
  updateBlindness: function(enemy, delta) {
    if (!enemy || !enemy.isBlinded) return;

    // Check if blindness has expired
    if (enemy.blindnessExpiresAt && Date.now() > enemy.blindnessExpiresAt) {
      // Remove blindness
      enemy.isBlinded = false;

      // Restore visuals
      enemy.clearTint();
      if (enemy.scene && enemy.scene.tweens) {
        enemy.scene.tweens.killTweensOf(enemy);
        enemy.setAlpha(1);
      }

      // Clear storage
      this.clearBlindness();
      return;
    }

    // While blinded, enemy has chance to miss attacks (handled in AI damage calculation)
    // This is applied in the damagePlayer call - we add a miss chance
  },



  // Calculate if blinded enemy misses attack
  rollBlindMiss: function(enemy) {
    if (!enemy || !enemy.isBlinded) return false;
    if (!this.FLASH_KO_BLINDNESS || !this.FLASH_KO_BLINDNESS.ENABLED) return false;

    return Math.random() < this.FLASH_KO_BLINDNESS.MISS_CHANCE;
  },



  // Spawn a rare item pickup
  spawnItem: function(scene, x, y, itemKey) {
    var itemData = this.RARE_ITEMS[itemKey];
    if (!itemData) return null;

    var pickupTexture = scene.textures.exists('item_pickup') ? 'item_pickup' : 'pickup_health';
    var item = scene.physics.add.sprite(x, y, pickupTexture);
    item.setDisplaySize(20, 20);
    item.setTint(itemData.color);
    item.itemData = itemData;
    item.itemKey = itemKey;
    item.isPickup = true;

    // Floating animation
    scene.tweens.add({
      targets: item,
      y: y - 10,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Spin animation
    scene.tweens.add({
      targets: item,
      angle: 360,
      duration: 2000,
      repeat: -1,
      ease: 'Linear'
    });

    if (scene.pickupGroup) {
      scene.pickupGroup.add(item);
    }

    return item;
  },



  applyEliteAbility: function(enemy, ability) {
    if (!enemy || !ability) return;
    enemy.eliteAbility = ability;
    if (ability === 'counterStance') {
      enemy.counterWindow = 400;
      enemy.counterCooldown = 0;
    } else if (ability === 'focusStrike') {
      enemy.focusCharge = 0;
      enemy.focusReady = false;
    } else if (ability === 'chaosRush') {
      enemy.chaosRushTimer = 0;
      enemy.chaosRushActive = false;
    }
  },


  // Health Bar Damage Trail: record damage for visual trail effect
  recordDamageTrail: function(enemy, damage) {
    if (!enemy || !enemy._damageTrailHistory) return;
    var maxHp = enemy._trailMaxHp || enemy.stats.maxHp || 60;
    // Cap damage at maxHp to prevent trail overflow
    var cappedDamage = Math.min(damage, maxHp);
    enemy._damageTrailHistory.push({
      damage: cappedDamage,
      maxHp: maxHp,
      timestamp: Date.now()
    });
    // Limit history to prevent memory issues - max 20 entries
    if (enemy._damageTrailHistory.length > 20) {
      enemy._damageTrailHistory = enemy._damageTrailHistory.slice(-20);
    }
  },


  killEnemy: function(scene, enemy) {
    if (window.MMA && MMA.Network && typeof MMA.Network.isClient === 'function' && MMA.Network.isClient()) return;
    scene.enemiesDefeated = (scene.enemiesDefeated || 0) + 1;
    enemy.state = 'dead';
    enemy.aiState = 'dead';
    enemy.setVelocity(0, 0);
    if (enemy.body) enemy.body.enable = false;
    
    // Clean up damage trail
    if (enemy._hpDamageTrail) {
      enemy._hpDamageTrail.destroy();
      enemy._hpDamageTrail = null;
    }
    enemy._damageTrailHistory = [];
    
    this._playEnemyAnimation(scene, enemy, 'deathFrames');

    // Rival Echo System: clean up ghost aura on death
    if (enemy.type && enemy.type.isRivalEcho) {
      this.cleanupRivalEchoGhost(enemy);
    }

    // Loyalty Bond: trigger Vengeance on nearby allies when a non-boss enemy dies
    if (!enemy.isBoss) {
      this.applyVengeanceToNearby(enemy, scene);
    }

    // Temperamental Enforcer: when an ally dies nearby, Enforcer gains enrage stacks
    if (!enemy.isBoss && enemy.typeKey !== 'enforcer') {
      var enfCfg = this.ENFORCER_CONFIG;
      (scene.enemies || []).forEach(function(other) {
        if (!other || other === enemy) return;
        if (!other.active || other.state === 'dead') return;
        if (other.typeKey !== 'enforcer') return;
        if (other.isBoss) return;
        var dx = other.x - enemy.x, dy = other.y - enemy.y;
        if (Math.sqrt(dx*dx + dy*dy) <= enfCfg.ENRAGE_RADIUS) {
          // Gain enrage stack
          if (!other.enforceRageStacks) other.enforceRageStacks = 0;
          if (other.enforceRageStacks < enfCfg.MAX_ENRAGE_STACKS) {
            other.enforceRageStacks++;
            other.enforceRageTimer = enfCfg.ENRAGE_DURATION;
            // Visual feedback
            if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
              MMA.UI.showDamageText(scene, other.x, other.y - 50, '+ENFORCER RAGE! (' + other.enforceRageStacks + ')', enfCfg.STACK_COLOR);
            }
            // Show red tint
            other.setTint(0xff4444);
          }
        }
      });
    }

    // Coach Demoralize: when a Coach goes down, nearby allies get briefly SHAKEN.
    if (enemy.typeKey === 'coach') {
      var R = 170;
      (scene.enemies || []).forEach(function(other){
        if (!other || other === enemy) return;
        if (!other.active || other.state === 'dead') return;
        if (other.isBoss) return; // bosses ignore morale hits
        var dx = other.x - enemy.x, dy = other.y - enemy.y;
        if (Math.sqrt(dx*dx + dy*dy) <= R) {
          other.shakenTimer = Math.max(other.shakenTimer || 0, 2600);
          other.noCoachTimer = Math.max(other.noCoachTimer || 0, (MMA.Enemies.COACH_CONFIG.NO_COACH_DURATION_MS || 5000));
          other._shakenShown = false; // allow popup once
        }
      });
      if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
        MMA.UI.showDamageText(scene, enemy.x, enemy.y - 60, 'COACH DOWN!', '#33ffcc');
      }
    }

    // Track enemy defeated in fight stats
    MMA.UI.recordEnemyDefeated();

    // Nemesis Encounter System: if defeated a nemesis enemy, grant Nemesis Slayer title and exclusive item
    if (enemy.type && enemy.type.isNemesis && !this.hasSlainNemesis()) {
      this.markNemesisSlain();
      // Grant Nemesis Slayer title (best-effort via registry)
      if (scene.registry) {
        var titles = scene.registry.get('playerTitles') || [];
        if (titles.indexOf(this.NEMESIS_CONFIG.SLAYER_TITLE) === -1) {
          titles.push(this.NEMESIS_CONFIG.SLAYER_TITLE);
          scene.registry.set('playerTitles', titles);
        }
      }
      // Spawn exclusive Nemesis Ring item
      if (typeof this.spawnItem === 'function') {
        this.spawnItem(scene, enemy.x, enemy.y, this.NEMESIS_CONFIG.SLAYER_ITEM);
      }
      // Show celebration message
      if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
        MMA.UI.showDamageText(scene, enemy.x, enemy.y - 60, 'NEMESIS SLAYER!', '#ffd700');
        scene.time.delayedCall(1500, function() {
          MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 50, 'TITLE EARNED!', '#ffd700');
        });
      }
      // Clear nemesis deaths for this type (new nemesis will emerge)
      try {
        var data = localStorage.getItem(this.NEMESIS_CONFIG.STORAGE_KEY);
        var deaths = data ? JSON.parse(data) : {};
        delete deaths[enemy.typeKey || enemy.type.nemesisType];
        localStorage.setItem(this.NEMESIS_CONFIG.STORAGE_KEY, JSON.stringify(deaths));
      } catch(e) {}
    }

    // Rival Echo System: if defeated a rival echo enemy, record the defeat and check if echo clears
    if (enemy.type && enemy.type.isRivalEcho) {
      // Record this defeat for rival echo tracking
      var echoType = enemy.type.rivalEchoType || enemy.typeKey;
      this.recordRivalEchoDefeat(echoType);

      // Check if player varied their moves enough to clear the echo
      // (This is tracked in onPlayerAttack - if no moves were repeated, clear)
      if (!this._echoMoveRepeated) {
        // Player did not repeat any moves - echo is cleared!
        this.markRivalEchoCleared(echoType);
        if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
          MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 50, 'ECHO MASTERED!', '#8844ff');
        }
      }
      // Reset tracking for next fight
      this._echoMoveRepeated = false;
      this.resetRivalEchoTracking();
    }

    // Check for outfit unlocks based on enemy type
    if (MMA.Outfits) {
      var outfitUnlocked = MMA.Outfits.recordEnemyDefeat(enemy.typeKey);
      if (outfitUnlocked && outfitUnlocked.length > 0 && scene.player) {
        MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 50, 'NEW OUTFIT!', '#ffd700');
      }
    }

    var contractTier = this.getContractTier(scene);
    var xp = enemy.type.xpReward; scene.player.stats.xp += xp;
    scene._mmaRoomXpGained = (scene._mmaRoomXpGained || 0) + xp;
    if (scene.registry) {
      scene.registry.set('lastEnemyDefeated', enemy.type.name || enemy.typeKey || 'Enemy');
      scene.registry.set('xpGained', scene._mmaRoomXpGained);
      scene.registry.set('fightStats', Object.assign({}, MMA.UI.fightStats));
    }
    MMA.UI.showDamageText(scene, enemy.x, enemy.y - 30, '+' + xp + ' XP', '#e8c830');

    // Elite enemy rare item drop
    if (enemy.type.isElite && enemy.type.eliteData) {
      // Record elite defeat in Trophy Room
      var eliteType = enemy.type.typeKey || 'elite';
      var zone = scene.registry.get('currentZone') || 1;
      if (MMA.UI.recordEliteDefeat) {
        MMA.UI.recordEliteDefeat(eliteType, zone);
      }

      // Check for Mercenary Contract loot guarantee
      var rareItem = enemy.type.eliteData.rareItem;
      var dropChance = enemy.type.eliteData.dropChance || 0.2;
      var forceDrop = (contractTier && rareItem);

      if (forceDrop || Math.random() < dropChance) {
        if (rareItem) {
          // Spawn the rare item as a pickup
          if (typeof this.spawnItem === 'function') {
            this.spawnItem(scene, enemy.x, enemy.y, rareItem);
          }
          // Also record the rare item in Trophy Room
          if (MMA.UI.recordRareItem) {
            MMA.UI.recordRareItem(rareItem);
          }
          // Show CONTRACT LOOT! if guaranteed by contract, otherwise RARE DROP!
          if (forceDrop && typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
            MMA.UI.showDamageText(scene, enemy.x, enemy.y - 50, 'CONTRACT LOOT!', '#ffd700');
          } else {
            MMA.UI.showDamageText(scene, enemy.x, enemy.y - 50, 'RARE DROP!', '#ff00ff');
          }
        }
      }
    }

    // Mercenary Contract boss drop: spawn a rare item when boss dies with active contract
    if (enemy.isBoss && contractTier) {
      var rareItemKeys = Object.keys(this.RARE_ITEMS || {});
      if (rareItemKeys.length > 0) {
        var randomKey = rareItemKeys[Math.floor(Math.random() * rareItemKeys.length)];
        if (typeof this.spawnItem === 'function') {
          this.spawnItem(scene, enemy.x, enemy.y, randomKey);
        }
        if (MMA.UI.recordRareItem) {
          MMA.UI.recordRareItem(randomKey);
        }
        if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
          MMA.UI.showDamageText(scene, enemy.x, enemy.y - 60, 'CONTRACT LOOT!', '#ffd700');
        }
      }
    }

    if (enemy.isBoss) {
      // Record boss defeat in Trophy Room
      var bossId = enemy.typeKey || 'boss';
      var zone = scene.registry.get('currentZone') || 1;
      var duration = scene.runStartMs ? Date.now() - scene.runStartMs : 0;
      if (MMA.UI.recordBossDefeat) {
        MMA.UI.recordBossDefeat(bossId, zone, duration);
      }
      
      // Blood Money Bounty: increase bounty after boss defeat
      var newBountyLevel = this.increaseBounty();
      if (newBountyLevel > 0) {
        var bountyText = 'BOUNTY INCREASED TO LV.' + newBountyLevel + '!';
        if (newBountyLevel >= this.BOUNTY_SYSTEM.MAX_BOUNTY) {
          bountyText = 'MAX BOUNTY REACHED!';
        }
        // Show bounty message after victory
        scene.time.delayedCall(500, function() {
          scene.registry.set('gameMessage', bountyText);
          scene.time.delayedCall(2000, function() { scene.registry.set('gameMessage', ''); });
        });
      }
      
      scene.registry.set('gameMessage', 'VICTORY!'); scene.cameras.main.flash(500, 255, 215, 0); scene.gameOver = true;
      scene.registry.set('playerStats', Object.assign({}, scene.player.stats)); scene.registry.set('enemiesDefeated', scene.enemiesDefeated); scene.registry.set('playTime', Math.floor((Date.now() - scene.runStartMs) / 1000)); scene.registry.set('fightStats', Object.assign({}, MMA.UI.fightStats)); scene.registry.set('xpGained', scene._mmaRoomXpGained || 0); scene.registry.set('bossDefeated', true);
      scene.time.delayedCall(3000, function(){ scene.scene.stop(); scene.scene.launch('VictoryScene'); });
      return;
    }

    // Rival defeat moment (doesn't end run)
    if (enemy.typeKey === 'shadowRival') {
      scene.registry.set('gameMessage', 'SHADOW: "This isn\'t over."');
      scene.time.delayedCall(1800, function(){ scene.registry.set('gameMessage', ''); });
    }

    // Tutor Enemy: always teaches one random technique you don't already know (if available).
    if (enemy.typeKey === 'tutor') {
      try {
        var roster = (MMA && MMA.Combat && MMA.Combat.MOVE_ROSTER) ? MMA.Combat.MOVE_ROSTER : null;
        var known = (scene.player && scene.player.unlockedMoves) ? scene.player.unlockedMoves : [];
        if (roster && known) {
          var candidates = Object.keys(roster).filter(function(k){ return known.indexOf(k) === -1; });
          if (candidates.length) {
            var teachKey = candidates[Math.floor(Math.random() * candidates.length)];
            var moveInfo = roster[teachKey];
            if (teachKey && moveInfo) {
              scene.player.unlockedMoves.push(teachKey);
              scene.registry.set('unlockedMoves', scene.player.unlockedMoves.slice());
              if (window.MMA && MMA.UI && typeof MMA.UI.setActionButtonLabels === 'function') MMA.UI.setActionButtonLabels(false, scene);
              scene.registry.set('gameMessage', 'TUTOR TAUGHT: ' + (moveInfo.name || teachKey));
              scene.time.delayedCall(2200, function(){ scene.registry.set('gameMessage', ''); });
              if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
                MMA.UI.showDamageText(scene, enemy.x, enemy.y - 60, 'TECHNIQUE LEARNED!', '#66ff33');
              }
              // Reuse existing unlock flow so UI stays consistent.
              scene.scene.pause();
              scene.scene.launch('UnlockScene', { moveKey: teachKey });
            }
          }
        }
      } catch (err) {
        // Non-fatal: tutoring is a bonus.
      }
    }

    var enemyTaughtMove = (typeof checkMoveUnlock === 'function') ? checkMoveUnlock(enemy.typeKey, scene.player.stats.level, scene.player.unlockedMoves) : null;
    if (enemyTaughtMove) {
      var moveInfo = MMA.Combat.MOVE_ROSTER[enemyTaughtMove];
      if (moveInfo && scene.player.unlockedMoves.indexOf(enemyTaughtMove) === -1) {
        scene.player.unlockedMoves.push(enemyTaughtMove); scene.registry.set('unlockedMoves', scene.player.unlockedMoves.slice()); scene.scene.pause(); scene.scene.launch('UnlockScene', { moveKey: enemyTaughtMove });
      }
    }
    var leveled = (typeof checkLevelUp === 'function') ? checkLevelUp(scene.player.stats) : false;
    if (leveled) {
      scene.player.justLeveled = true; if (window.sfx) window.sfx.levelup(); var newMoves = [];
      Object.keys(MMA.Combat.MOVE_ROSTER).forEach(function(k){ var m = MMA.Combat.MOVE_ROSTER[k]; if (m.unlockLevel === scene.player.stats.level && m.unlockType === 'level') { if (scene.player.unlockedMoves.indexOf(k) === -1) scene.player.unlockedMoves.push(k); newMoves.push(m.name); } });
      scene.registry.set('unlockedMoves', scene.player.unlockedMoves.slice());
      if (window.MMA && MMA.UI && typeof MMA.UI.setActionButtonLabels === 'function') MMA.UI.setActionButtonLabels(false, scene);
      if (window.narrate) window.narrate('levelUp', { level: scene.player.stats.level }).then(function(msg){ var current = scene.registry.get('gameMessage') || ''; if (msg && (current === '' || current.indexOf('LEVEL') === 0)) { scene.registry.set('gameMessage', msg); scene.time.delayedCall(3000, function(){ scene.registry.set('gameMessage', ''); }); } });
      scene.registry.set('gameMessage', newMoves.length ? 'LEVEL UP! NEW MOVES: ' + newMoves.join(', ') : 'LEVEL ' + scene.player.stats.level + '!');
      scene.time.delayedCall(2500, function(){ scene.registry.set('gameMessage', ''); });
      if (!(window.MMA && MMA.Network && typeof MMA.Network.isClient === 'function' && MMA.Network.isClient()) && window.saveGame) window.saveGame(scene.player.stats, scene.player.unlockedMoves, scene.currentZone, scene.currentRoomId);
    }
    if (enemy._hpBarBg) { enemy._hpBarBg.destroy(); enemy._hpBarFill.destroy(); }
    // Health Bar Damage Trail: clean up trail bar
    if (enemy._hpDamageTrail) { enemy._hpDamageTrail.destroy(); enemy._hpDamageTrail = null; }
    enemy._damageTrailHistory = [];
    // Destroy role icon on death
    if (enemy._roleIcon) { enemy._roleIcon.destroy(); enemy._roleIcon = null; }
    // Destroy weight icon on death
    if (enemy._weightIcon) { enemy._weightIcon.destroy(); enemy._weightIcon = null; }
    MMA.Items.spawnDropsForEnemy(scene, enemy);
    scene.enemies = scene.enemies.filter(function(e){ return e !== enemy; });
    scene.time.delayedCall(320, function() {
      if (enemy && enemy.active) enemy.destroy();
    });
    if (!(window.MMA && MMA.Network && typeof MMA.Network.isClient === 'function' && MMA.Network.isClient()) && window.saveGame) window.saveGame(scene.player.stats, scene.player.unlockedMoves, scene.currentZone, scene.currentRoomId);
    var alive = scene.enemies.filter(function(e){ return e.state !== 'dead' && e.active; });
    if (alive.length === 0) {
      if (scene.rapidFireState && scene.rapidFireState.active) {
        scene.registry.set('gameMessage', 'RAPID FIRE: NEXT WAVE INCOMING');
        scene.time.delayedCall(900, function(){
          if (scene.registry.get('gameMessage') === 'RAPID FIRE: NEXT WAVE INCOMING') scene.registry.set('gameMessage', '');
        });
        return;
      }
      scene.registry.set('gameMessage', 'ROOM CLEAR! 🏆');
      // Show fight stats
      scene.time.delayedCall(1500, function(){ MMA.UI.showFightStats(scene); });
      scene.time.delayedCall(3500, function(){ scene.registry.set('gameMessage', ''); });
      if (scene.registry) {
        scene.registry.set('fightStats', Object.assign({}, MMA.UI.fightStats));
        scene.registry.set('xpGained', scene._mmaRoomXpGained || 0);
      }
      if (scene.currentZone >= 3) { try { localStorage.clear(); } catch(e) {} scene.scene.pause('GameScene'); scene.scene.launch('VictoryScene'); }
    }
  }
});

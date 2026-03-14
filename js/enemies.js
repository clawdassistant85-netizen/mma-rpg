window.MMA = window.MMA || {};
window.MMA.Enemies = {
  // Helper: compute total damage multiplier for an enemy (packs, vengeance, injuries, enrage, elite)
  getTotalDamageMultiplier: function(enemy, scene) {
    // Base pack multiplier
    var pack = (this.getPackDamageMultiplier) ? this.getPackDamageMultiplier(enemy, scene) : 1;
    // Vengeance damage multiplier
    var vengeance = (this.getVengeanceDamageMult) ? this.getVengeanceDamageMult(enemy) : 1;
    // Injury vulnerability multiplier
    var injury = (this.getInjuryDamageMultiplier) ? this.getInjuryDamageMultiplier(enemy) : 1;
    // Enrage attack bonus (converted to multiplier)
    var enrage = (enemy && enemy.isEnraged && enemy.enrageAttackBonus) ? (1 - enemy.enrageAttackBonus) : 1;
    var elite = (this.getEliteMultiplier) ? this.getEliteMultiplier(enemy) : 1;
    return pack * vengeance * injury * enrage * elite;
  },
  // Mercenary Contracts: boosts enemy stats when active (purchased by player)
  MERCENARY_CONTRACTS: {
    // No contract: default behavior
    none: { hpMultiplier: 1, attackMultiplier: 1, xpMultiplier: 1 },
    // Bronze: entry-level contract
    bronze: { hpMultiplier: 1.25, attackMultiplier: 1.10, xpMultiplier: 1.10 },
    // Silver: mid-tier contract
    silver: { hpMultiplier: 1.50, attackMultiplier: 1.20, xpMultiplier: 1.20 },
    // Gold: top-tier contract
    gold: { hpMultiplier: 2.0, attackMultiplier: 1.35, xpMultiplier: 1.35 }
  },

  // Blood Money Bounty: after defeating a boss, player gains a bounty that attracts mercenary hunters
  // Higher bounty = harder enemies spawn in subsequent zones with scaling bonuses
  BOUNTY_SYSTEM: {
    STORAGE_KEY: 'mma_rpg_bounty_level',
    MAX_BOUNTY: 10,                  // Maximum bounty level
    HP_PER_LEVEL: 0.15,              // +15% HP per bounty level
    DAMAGE_PER_LEVEL: 0.12,          // +12% damage per bounty level
    SPEED_PER_LEVEL: 0.05,           // +5% speed per bounty level
    SPAWN_CHANCE_BASE: 0.12,         // Base chance to spawn bounty hunter
    SPAWN_CHANCE_PER_LEVEL: 0.04,    // +4% per bounty level
    MERCY_WINDOW_MS: 12000,          // Time window to use mercy (non-lethal) to reduce bounty
    MERCY_REDUCTION: 1,              // Reduce bounty by 1 on mercy kill
    MAX_BOUNTY_TEXT: 'MAX BOUNTY!',
    HUNTER_NAME: 'Bounty Hunter',
    HUNTER_COLOR: 0xff4444,          // Red tint for bounty hunters
    WARNING_TEXT: 'BOUNTY HUNTER!',
    APPROACH_TEXT: 'The hunter tracks you...'
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

  // Nemesis Encounter System: tracks which enemy archetype has defeated player most across sessions
  // That archetype becomes a "Nemesis" with unique dialogue, purple/black glow, scales to player level
  // Defeating Nemesis grants "Nemesis Slayer" title and exclusive equipment drop
  NEMESIS_CONFIG: {
    STORAGE_KEY: 'mma_rpg_nemesis_deaths',
    SLAYER_KEY: 'mma_rpg_nemesis_slain',
    DEFEAT_THRESHOLD: 2,          // Min deaths to become a nemesis
    HP_BONUS: 0.25,               // +25% HP for nemesis enemies
    DAMAGE_BONUS: 0.20,           // +20% damage for nemesis enemies
    SPEED_BONUS: 0.10,            // +10% speed for nemesis enemies
    LEVEL_GAP: 1,                 // Always within 1 level of player
    GLOW_COLOR: 0x8800ff,         // Purple glow for nemesis
    TEXT_COLOR: '#aa44ff',        // Purple text color
    SLAYER_TITLE: 'Nemesis Slayer',
    SLAYER_ITEM: 'nemesisRing'    // Exclusive ring drop
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

  // Rival Echo System: after losing to an enemy type 3+ times, that enemy's style "echoes"
  // in future fights until player proves mastery by defeating without repeating moves.
  // Visual: defeated-echo enemies have translucent "ghost" aura in player's color.
  RIVAL_ECHO_CONFIG: {
    STORAGE_KEY: 'mma_rpg_rival_echo',
    CLEAR_KEY: 'mma_rpg_rival_echo_cleared',
    DEFEAT_THRESHOLD: 3,        // Min defeats to trigger echo
    ATTACK_SPEED_BONUS: 0.15,   // +15% attack speed for echo enemies
    ECHO_COLOR: 0x8844ff,       // Purple ghost aura
    ECHO_TEXT: 'RIVAL ECHO!',
    ECHO_COLOR_TEXT: '#8844ff',
    CLEAR_WINDOW_MS: 8000       // Time to clear echo after spawn
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

  // Adaptive Tactics: enemy analyzes player's last 5 attacks and gains +15% defense against repeated move types
  ADAPTIVE_TACTICS: {
    TRACK_COUNT: 5,           // Number of recent attacks to track
    DEFENSE_BONUS: 0.15,       // +15% defense against repeated move types
    MOVE_TYPE_GROUPS: {        // Group similar moves together
      'jab': 'striker', 'cross': 'striker', 'hook': 'striker', 'uppercut': 'striker', 'bodyShot': 'striker', 'elbowStrike': 'striker', 'spinningBackFist': 'striker',
      'lowKick': 'kicker', 'headKick': 'kicker', 'roundhouseKick': 'kicker', 'kneeStrike': 'kicker',
      'takedown': 'grappler', 'singleLegTakedown': 'grappler', 'single_leg_takedown': 'grappler', 'hipThrow': 'grappler', 'guardPass': 'grappler', 'mountCtrl': 'grappler',
      'armbar': 'grappler', 'guillotine': 'grappler', 'triangleChoke': 'grappler', 'kimura': 'grappler', 'rnc': 'grappler'
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

  // Enemy Combo Memory: enemies track player attack patterns over 45+ seconds
  // and adapt by gaining +20% defense against most-used combos
  ENEMY_COMBO_MEMORY: {
    ADAPTATION_TIME_MS: 45000,    // 45 seconds to trigger adaptation
    DEFENSE_BONUS: 0.20,          // +20% defense against player's favorite combos
    TRACK_WINDOW_MS: 12000,       // Track attacks within last 12 seconds for pattern
    MIN_ATTACKS_TO_TRACK: 8,      // Minimum attacks needed to establish pattern
    ADAPTED_TEXT: 'MEMORY ADAPTED!',
    ADAPTED_COLOR: '#ff66ff'
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

  // - striker-style enemies take +20% damage from grappler moves
  // - grappler-style enemies take +20% damage from striker pressure
  // - kickboxer-style enemies take +15% damage from striker (hands) pressure (crowding them)
  STYLE_COUNTER: {
    STRIKER_TAKES_FROM_GRAPPLER: 1.20,
    GRAPPLER_TAKES_FROM_STRIKER: 1.20,
    KICKBOXER_TAKES_FROM_STRIKER: 1.15
  },

  // Ring Rust: fighters who haven't competed in 3+ real-time days start with "ring rust" debuffs
  // -10% movement speed, -5% accuracy until they "shake it off" by landing 5+ hits in first fight.
  // Visual: slight sluggish animation, foggy vignette overlay. Resets after first room clear.
  RING_RUST: {
    INACTIVITY_DAYS: 3,              // Days of inactivity to trigger ring rust
    SPEED_DEBUFF: 0.10,             // -10% movement speed
    ACCURACY_DEBUFF: 0.05,          // -5% accuracy (implemented as damage dealt penalty)
    SHAKE_OFF_HITS: 5,              // Hits needed to shake off ring rust
    SHAKE_OFF_DURATION: 8000,       // Time window to land hits to shake off
    STORAGE_KEY: 'mma_rpg_last_fight',
    SHAKEN_KEY: 'mma_rpg_ring_rust_shaken',
    APPLIED_KEY: 'mma_rpg_ring_rust_applied'
  },

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

  // Body Language Read: enemies briefly telegraph attacks with subtle cues.
  // This makes attacks feel "readable" and gives players a small reaction window.
  TELEGRAPH: {
    ENABLED: true,
    DEFAULT_MS: 120,
    // Only telegraph if enemy is within this distance (avoids noisy spam off-screen)
    MAX_DIST_TO_PLAYER: 260
  },

  // Fight IQ Aura Read: enemy attack telegraphing system that displays subtle colored halos
  // around enemy limbs 300ms before attack - yellow for jabs, orange for crosses,
  // red for haymakers, blue for grapples. Creates readable attack prediction for skilled players.
  FIGHT_IQ: {
    ENABLED: true,
    AURA_DISTANCE: 18,          // Distance of aura from enemy center
    AURA_OPACITY: 0.6,          // Base opacity of the aura
    AURA_PULSE: true,           // Whether aura pulses
    // Attack type to color mapping for halos
    ATTACK_COLORS: {
      // Striker attacks (fast, yellow/orange)
      'jab': 0xffff00,           // Yellow - quick jab
      'cross': 0xffa500,         // Orange - power cross
      'hook': 0xff8c00,         // Dark orange - hook
      'uppercut': 0xff6600,     // Red-orange - uppercut
      'bodyShot': 0xffaa00,     // Amber - body shot
      'elbowStrike': 0xffcc00,  // Gold - elbow
      'spinningBackFist': 0xffd700, // Gold - spinning
      // Kicker attacks (legs, cyan/green)
      'lowKick': 0x00ff88,      // Teal - low kick
      'headKick': 0x00ffff,     // Cyan - head kick
      'roundhouseKick': 0x00cccc, // Cyan-dark - roundhouse
      'kneeStrike': 0x88ff00,   // Lime - knee
      // Grappler attacks (blue/purple)
      'takedown': 0x4444ff,     // Blue - takedown
      'singleLegTakedown': 0x4444ff, // Blue
      'single_leg_takedown': 0x4444ff, // Blue
      'hipThrow': 0x6666ff,     // Purple-blue - throw
      'guardPass': 0x8888ff,    // Light purple
      'mountCtrl': 0xaaaaff,    // Lavender
      'armbar': 0x2200ff,       // Deep blue - submission
      'guillotine': 0x3300ff,   // Deep blue
      'triangleChoke': 0x4400ff, // Purple
      'kimura': 0x5500ff,       // Purple
      'rnc': 0x6600ff,          // Deep purple
      // Special/finisher (red/magenta)
      'SHOULDER DIP': 0xff4444, // Red - basic attack telegraph
      'HAND FAKE': 0xff00ff,    // Magenta - stunner fake
      'PRESSURE STEP': 0xff8800, // Orange-red - bully attack
      'FEINT!': 0xffff00,       // Yellow - feint
      'STRIKE!': 0xff0000,      // Red - feint real
      'GLITCH TELL': 0x00e5ff, // Cyan - glitcher tell
      'HIGH KICK': 0x00ffcc,   // Teal - kickboxer
      'GRAB!': 0x4444ff,       // Blue - grab
      'THROWN!': 0xff4444       // Red - thrown
    },
    // Default color for unknown attacks
    DEFAULT_COLOR: 0xffffff
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

  // Comeback Kid: if the player dies to an archetype, the next encounter vs that archetype
  // spawns the enemy at -10% HP and grants the player +1 focus (best-effort).
  COMEBACK_KID: {
    ENABLED: true,
    ENEMY_HP_MULT: 0.90,
    PLAYER_FOCUS_BONUS: 1
  },

  _comebackKey: function(typeKey) {
    return 'mma_rpg_comeback_' + String(typeKey || 'unknown');
  },

  recordComebackLossIfNeeded: function(scene) {
    if (!this.COMEBACK_KID || !this.COMEBACK_KID.ENABLED) return;
    if (!scene || !scene.player || !scene.player.stats) return;
    if (scene._comebackLossRecorded) return;
    if (scene.player.stats.hp > 0) return;

    var typeKey = scene._lastAttackerTypeKey;
    if (!typeKey || typeKey === 'unknown') return;

    try {
      localStorage.setItem(this._comebackKey(typeKey), String(Date.now()));
      scene._comebackLossRecorded = true;
      if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
        MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 55, 'COMEBACK LOADED', '#66ccff');
      }
    } catch (e) {}

    // Nemesis Encounter System: record this defeat for nemesis tracking
    this.recordNemesisDefeat(typeKey);
  },

  applyComebackIfAny: function(scene, typeKey, typeObj) {
    if (!this.COMEBACK_KID || !this.COMEBACK_KID.ENABLED) return;
    if (!scene || !typeKey || !typeObj) return;

    var k = this._comebackKey(typeKey);
    var has = false;
    try { has = !!localStorage.getItem(k); } catch (e) { has = false; }
    if (!has) return;

    // Consume the comeback so it only applies once.
    try { localStorage.removeItem(k); } catch (e) {}

    typeObj.hp = Math.max(1, Math.round(typeObj.hp * this.COMEBACK_KID.ENEMY_HP_MULT));
    typeObj.maxHp = typeObj.hp;

    // Best-effort: give +1 Focus meter.
    try {
      var bonus = this.COMEBACK_KID.PLAYER_FOCUS_BONUS || 1;
      if (scene.player && scene.player.stats) {
        scene.player.stats.focus = (scene.player.stats.focus || 0) + bonus;
      }
      if (scene.registry && typeof scene.registry.get === 'function' && typeof scene.registry.set === 'function') {
        var cur = scene.registry.get('focus') || 0;
        scene.registry.set('focus', cur + bonus);
      }
      if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function' && scene.player) {
        MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 55, 'COMEBACK +FOCUS', '#66ccff');
      }
    } catch (e) {}
  },

  getMoveGroup: function(moveKey) {
    var g = (this.ADAPTIVE_TACTICS && this.ADAPTIVE_TACTICS.MOVE_TYPE_GROUPS) ? this.ADAPTIVE_TACTICS.MOVE_TYPE_GROUPS : {};
    return (moveKey && g[moveKey]) ? g[moveKey] : 'unknown';
  },

  // Returns a multiplier applied to the player's damage against this enemy.
  // NOTE: this is implemented as a "defense" multiplier because the current integration point
  // for player hits is onPlayerAttack() which returns a defense multiplier.
  getStyleCounterDefenseMult: function(enemy, moveKey) {
    if (!enemy || !enemy.type) return 1;
    var ai = enemy.type.aiPattern;
    var group = this.getMoveGroup(moveKey);

    var isStrikerEnemy = (ai === 'chase' || ai === 'combo' || ai === 'kicker');
    var isGrapplerEnemy = (ai === 'grasper' || ai === 'thrower' || ai === 'subHunter');
    var isKickboxerEnemy = (ai === 'kickboxer');

    // If the enemy is vulnerable to the player's move group, reduce defense (multiplier < 1).
    if (isStrikerEnemy && group === 'grappler') return 1 / this.STYLE_COUNTER.STRIKER_TAKES_FROM_GRAPPLER;
    if (isGrapplerEnemy && group === 'striker') return 1 / this.STYLE_COUNTER.GRAPPLER_TAKES_FROM_STRIKER;
    if (isKickboxerEnemy && group === 'striker') return 1 / this.STYLE_COUNTER.KICKBOXER_TAKES_FROM_STRIKER;

    return 1;
  },

  // Predator Patience: while an elite is "sizing up", the first player hit gets a preemptive bonus.
  // Implemented as a defense multiplier (< 1 means more damage).
  getPredatorPatienceDefenseMult: function(enemy) {
    if (!this.PREDATOR_PATIENCE || !this.PREDATOR_PATIENCE.ENABLED) return 1;
    if (!enemy) return 1;

    // Only apply if enemy is currently sizing up AND has not consumed the window.
    if (enemy.isSizingUp && !enemy._predatorPreemptiveConsumed) {
      enemy._predatorPreemptiveConsumed = true;
      var mult = this.PREDATOR_PATIENCE.PREEMPTIVE_DAMAGE_MULT || 1.5;
      // Translate damage multiplier into defense multiplier.
      return 1 / mult;
    }
    return 1;
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

    // Track damage for Enemy Fear Tremble intensity scaling
    if (enemy && damageDealt > 0) {
      if (!enemy._recentDamage) enemy._recentDamage = 0;
      enemy._recentDamage += damageDealt;
      // Cap at a reasonable maximum to prevent extreme trembling
      enemy._recentDamage = Math.min(enemy._recentDamage, 50);
    }

    return adaptiveDef * styleCounterDef * vengeanceDef * territoryDef * predatorDef * comboMemoryDef;
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

  // Enemy Fear Tremble: enemies below 25% HP develop visible tremble animation
  // Intensity scales with recent damage dealt, telegraphing low-HP state without relying on health bar
  FEAR_TREMBLE_CONFIG: {
    HP_THRESHOLD: 0.25,        // Trigger tremble at 25% HP
    BASE_AMPLITUDE: 2,        // Base pixel shake amount
    MAX_AMPLITUDE: 6,         // Maximum shake when taking heavy damage
    DAMAGE_WINDOW_MS: 1500,   // Time window to track recent damage
    INTENSITY_SCALE: 0.15     // How much recent damage affects tremble intensity
  },

  // Desperation Enrage: non-boss enemies rage when below 25% HP
  ENRAGE_CONFIG: {
    HP_THRESHOLD: 0.25,        // Trigger at 25% HP
    DURATION: 2000,           // 2 second enrage duration
    COOLDOWN: 8000,           // 8 second cooldown between enrages
    SPEED_BONUS: 0.25,        // +25% move speed
    ATTACK_SPEED_BONUS: 0.30  // +30% attack speed (faster attacks)
  },

  // Sore Loser AI: defeated enemies (below 10% HP) gain a desperate final attack burst
  // - 50% attack speed increase but -30% accuracy for their last 3 seconds
  // Creates dramatic last-stand moments
  SORE_LOSER_CONFIG: {
    HP_THRESHOLD: 0.10,        // Trigger at 10% HP
    DURATION: 3000,            // 3 second desperate burst duration
    ATTACK_SPEED_BONUS: 0.50,  // +50% attack speed (faster attacks)
    ACCURACY_PENALTY: 0.30,    // -30% accuracy (miss chance)
    WARNING_TEXT: 'DESPERATION!',
    WARNING_COLOR: '#ff4444',
    ACTIVE_TEXT: 'FINAL STAND!',
    ACTIVE_COLOR: '#ff6666'
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

  // Gimmick Specialist: Regenerator enemy slowly heals over time.
  // Visual cue: green tint, periodic "REGEN" floating text.
  REGENERATOR_CONFIG: {
    BASE_INTERVAL_MS: 1000,
    CRITICAL_INTERVAL_MS: 700,
    HEAL_PCT_PER_TICK: 0.03,      // 3% max HP per tick
    CRITICAL_HP_PCT: 0.30,        // below 30% HP -> faster/stronger regen
    CRITICAL_HEAL_MULT: 1.7
  },

  // Gimmick Specialist: Glitcher "teleports" (blinks) behind the player.
  // Visual cue: cyan tint, brief fade-out/fade-in and "BLINK!" text.
  GLITCHER_CONFIG: {
    COOLDOWN_MS: 3600,
    MIN_DIST: 60,
    MAX_DIST: 220,
    BEHIND_DISTANCE: 85,
    STRIKE_DELAY_MS: 180,
    STRIKE_MULT: 1.15
  },

  // Loyalty Bond / Vengeance Mode: when a non-boss ally dies, nearby enemies enter VENGEANCE
  // Coach Enemy: support-type enemy that boosts nearby allies (+15% attack speed per Coach in room)
  COACH_CONFIG: {
    BOOST_RADIUS: 200,
    ATTACK_SPEED_BONUS: 0.15,

    // When a Coach is KO'd, nearby allies become temporarily disorganized:
    // - cannot receive new coach boosts
    // - their attack cadence slows (handled via updateEnemies shakenAttackMult)
    NO_COACH_DURATION_MS: 5000
  },

  // Mirror Match Protocol: when player HP drops below 30%, enemy temporarily mirrors player's last 3 attacks
  // Player can exploit by sequencing weak attacks to confuse enemy AI - strategic mind games at low HP
  // Creates satisfying "outsmarting" moments when player predicts their own pattern
  MIRROR_MATCH_CONFIG: {
    PLAYER_HP_THRESHOLD: 0.30,      // Trigger when player below 30% HP
    MIRROR_WINDOW_MS: 4000,         // How long mirroring lasts
    MIRROR_COUNT: 3,                // Number of recent moves to mirror
    DAMAGE_MULT: 0.70,              // Mirrored attacks deal 70% damage
    WARNING_TEXT: 'READING YOU...', // Text when entering mirror mode
    MIRROR_TEXT: 'MIRROR!',          // Text during mirrored attack
    COOLDOWN_MS: 8000               // Time before next mirror attempt
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

  // Echo Enemy: rare enemy that "records" player's attack pattern and plays it back after 5 seconds
  // Creates mind-game dynamics - player must vary approach or get hit by their own combo
  ECHO_CONFIG: {
    RECORD_WINDOW_MS: 5000,    // Time window to record player attacks
    PLAYBACK_DELAY_MS: 800,    // Delay between each recorded attack during playback
    DAMAGE_MULT: 0.85,         // Echo attacks deal 85% of original damage
    MAX_RECORDED_ATTACKS: 6,   // Maximum attacks to record
    WARNING_TEXT: 'ECHOING...', // Text shown when starting playback
    PLAYBACK_TEXT: 'ECHO!'     // Text shown during each echo attack
  },

  // Elite Coordination Break: elite enemies can occasionally attack without the attack token
  // This makes them feel more elite and dangerous - they break the coordination system
  ELITE_COORDINATION_BREAK: {
    ENABLED: true,
    CHANCE: 0.35,           // 35% chance to attack without token when no token held
    DAMAGE_MULT: 0.75,       // Coordinated-break attacks deal 75% damage
    COOLDOWN_MS: 1000        // Minimum time between elite strike texts per enemy
  },

  // Predator Patience: Elite+ enemies "size you up" for a few seconds after spawning.
  // During this window they will not attack, and the player gets a preemptive strike bonus.
  // (Implemented fully within enemies.js; no other file hooks required.)
  PREDATOR_PATIENCE: {
    ENABLED: true,
    ONLY_ELITES: true,
    SIZE_UP_MS: 3000,
    PREEMPTIVE_DAMAGE_MULT: 1.5,
    TOAST_TEXT: 'SIZING UP...',
    TOAST_COLOR: '#c0c0ff'
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
  VENGEANCE_CONFIG: {
    RADIUS: 170,               // pixels - range to trigger vengeance
    DURATION: 5000,           // 5 seconds duration
    DAMAGE_BONUS: 0.20,       // +20% damage dealt
    DEFENSE_PENALTY: 0.15,    // -15% defense (player hits harder)
    DEFENSE_MULT: 0.85        // Multiplier applied to defense (1 - 0.15 = 0.85)
  },

  // Enemy Taunt System: enemies occasionally taunt the player during combat
  // Taunts can lower player Focus meter and boost enemy morale
  TAUNT_CONFIG: {
    ENABLED: true,
    MIN_ZONE: 2,               // Taunts start appearing in zone 2+
    COOLDOWN_MS: 8000,        // Minimum time between taunts per enemy
    CHANCE: 0.003,            // Chance per frame to taunt (roughly once per 5-6 seconds)
    FOCUS_REDUCTION: 8,        // Amount of Focus to drain from player
    DAMAGE_BONUS: 0.10,       // +10% damage for taunting enemy after taunt
    DURATION_MS: 3000,         // Duration of damage bonus
    // Taunt lines by enemy type/AI pattern
    TAUNT_LINES: {
      // Aggressive/chase types
      'chase': ['YOU CAN\'T HURT ME!', 'IS THAT ALL YOU GOT?', 'PATHETIC!', 'HIT HARDER!'],
      // Combo attackers
      'combo': ['TOO SLOW!', 'MISSED ME!', 'NICE TRY!', 'BOXING IS DEAD!'],
      // Kickboxers
      'kickboxer': ['LEGS FOR DAYS!', 'KICKS > PUNCHES!', 'MY RANGE!'],
      // Grapple types
      'grasper': ['GONNA GRIND YOU DOWN!', 'WANNABES DON\'T GRAPPLE!', 'GROUND GAME!'],
      'thrower': ['WEIGHT CLASS!', 'LEARN TO THROW!', 'BUDDY SYSTEM!'],
      'subHunter': ['TAP OR SLEEP!', 'SUBMISSION SPECIALIST!', 'ONE ARM BAR!'],
      // Specialists
      'tank': ['CAN\'T SCRATCH ME!', 'ARMORED UP!', 'FULL DEFENSE!'],
      'enforcer': ['BIG AND MEAN!', 'BEHIND ME!', 'WRONG SIDE!'],
      'regen': ['HEALING UP!', 'WEAR ME DOWN!', 'ALL DAY!'],
      'glitcher': ['CAN\'T TOUCH THIS!', 'GLITCH MODE!', 'PHASE SHIFT!'],
      'bully': ['SMALL FRY!', 'GO HOME KID!', 'SCARED YET?'],
      // Default/generic
      'default': ['COME ON!', 'LET\'S GO!', 'FIGHT ME!', 'BROWN NOSER!', 'DANCE!']
    },
    TAUNT_TEXT_COLOR: '#ffaa00',
    TAUNT_EMOTE: '💢'
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

  // Get damage multiplier including taunt bonus
  getTauntDamageMultiplier: function(enemy) {
    if (!enemy) return 1;
    return 1 + (enemy._tauntDamageBonus || 0);
  },

  // Injury System: tracking cumulative limb hits for stacking debuffs
  INJURY_SYSTEM: {
    ARM_HIT_DEBUFF: 0.10, // -10% attack speed per stack
    LEG_HIT_DEBUFF: 0.05,  // -5% movement speed per stack
    MAX_STACKS: 5,         // Max debuff stacks
    STACK_DURATION: 8000,  // How long stacks last before decaying
    DAMAGE_BONUS_VULN: 0.15 // +15% damage to vulnerable enemies
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

  // Gang Up Coordination: when 3+ enemies are alive, they can trigger coordinated attacks
  // - One enemy stuns player (distracts) while others flank and attack from sides
  // - Visual warning indicator appears 1s before trigger
  // - Rewards single-target focus or area attacks
  GANG_UP_CONFIG: {
    ENABLED: true,
    MIN_ENEMIES: 3,
    COOLDOWN_MS: 8000,
    WARNING_MS: 1000,
    DISTRACT_DURATION: 600,
    ATTACK_WINDOW_MS: 800,
    DISTRACTOR_DAMAGE: 0.3,
    FLANKER_DAMAGE_MULT: 1.3,
    FLANK_ANGLE: 1.2
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
    
    enemies.forEach(function(e) {
      if (e === distractor) return;
      var ex = e.x - player.x;
      var ey = e.y - player.y;
      var angle = Math.atan2(ey, ex);
      var angleDiff = Math.abs(angle - baseAngle);
      if (angleDiff > this.GANG_UP_CONFIG.FLANK_ANGLE && angleDiff < Math.PI - this.GANG_UP_CONFIG.FLANK_ANGLE) {
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

  SWARM_CONFIG: {
    ENABLED: true,
    MIN_MEMBERS: 3,
    MERGE_COOLDOWN_MS: 12000,
    SWARM_DURATION: 8000,
    ATTACK_SPEED_BONUS: 0.6,
    DAMAGE_BONUS: 0.4,
    SPLIT_DAMAGE_THRESHOLD: 25,
    SPLIT_TEXT: 'SPLIT!',
    FORM_TEXT: 'SWARM!',
    MERGE_RADIUS: 80
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

  TYPES: {
    streetThug:{name:'Street Thug',hp:40,maxHp:40,speed:80,attackDamage:8,attackCooldownMax:1200,attackRange:55,chaseRange:220,color:0xe83030,xpReward:15,teachesMove:'hook',zone:1,aiPattern:'chase',groundDefense:0.2,groundEscape:0.2},
    barBrawler:{name:'Bar Brawler',hp:65,maxHp:65,speed:65,attackDamage:14,attackCooldownMax:1500,attackRange:60,chaseRange:200,color:0xe87030,xpReward:25,teachesMove:'cross',zone:1,aiPattern:'chase',groundDefense:0.4,groundEscape:0.35},
    muayThaiFighter:{name:'Muay Thai Fighter',hp:85,maxHp:85,speed:90,attackDamage:18,attackCooldownMax:1000,attackRange:70,chaseRange:250,color:0x30e870,xpReward:40,teachesMove:'elbowStrike',zone:1,aiPattern:'kicker'},
    wrestler:{name:'Wrestler',hp:90,maxHp:90,speed:70,attackDamage:12,attackCooldownMax:1300,attackRange:60,chaseRange:210,color:0x4488cc,xpReward:30,teachesMove:'singleLegTakedown',zone:2,aiPattern:'grasper',groundDefense:0.7,groundEscape:0.6},
    judoka:{name:'Judoka',hp:85,maxHp:85,speed:75,attackDamage:14,attackCooldownMax:1200,attackRange:65,chaseRange:220,color:0x8844cc,xpReward:35,teachesMove:'hipThrow',zone:2,aiPattern:'thrower'},
    groundNPounder:{name:'Ground-n-Pounder',hp:100,maxHp:100,speed:60,attackDamage:16,attackCooldownMax:1400,attackRange:70,chaseRange:230,color:0xcc8844,xpReward:40,teachesMove:'guardPass',zone:2,aiPattern:'chase'},
    bjjBlackBelt:{name:'BJJ Black Belt',hp:120,maxHp:120,speed:55,attackDamage:22,attackCooldownMax:1600,attackRange:65,chaseRange:240,color:0x222222,xpReward:50,teachesMove:'armbar',zone:3,aiPattern:'subHunter'},
    mmaChamp:{name:'MMA Champ',hp:200,maxHp:200,speed:85,attackDamage:25,attackCooldownMax:1100,attackRange:70,chaseRange:260,color:0xffd700,xpReward:100,teachesMove:'spinningBackFist',zone:3,aiPattern:'chase'},
    kickboxer:{name:'Kickboxer',hp:70,maxHp:70,speed:100,attackDamage:16,attackCooldownMax:900,attackRange:90,chaseRange:280,color:0x00cccc,xpReward:35,teachesMove:'roundhouseKick',zone:2,aiPattern:'kickboxer',groundDefense:0.2,groundEscape:0.1},
    striker:{name:'Striker',hp:55,maxHp:55,speed:95,attackDamage:10,attackCooldownMax:600,attackRange:50,chaseRange:260,color:0xff3366,xpReward:32,teachesMove:'jab',zone:2,aiPattern:'combo',groundDefense:0.2,groundEscape:0.1},
    boxer:{name:'Boxer',hp:68,maxHp:68,speed:108,attackDamage:12,attackCooldownMax:700,attackRange:58,chaseRange:260,color:0xcc4444,xpReward:38,teachesMove:'jab',zone:2,aiPattern:'boxer',groundDefense:0.25,groundEscape:0.2},
    karateka:{name:'Karateka',hp:82,maxHp:82,speed:78,attackDamage:18,attackCooldownMax:1400,attackRange:82,chaseRange:230,color:0xf1f1f1,xpReward:42,teachesMove:'roundhouseKick',zone:2,aiPattern:'karateka',groundDefense:0.3,groundEscape:0.2},
    streetFighter:{name:'Street Fighter',hp:92,maxHp:92,speed:92,attackDamage:17,attackCooldownMax:1150,attackRange:68,chaseRange:270,color:0xff9922,xpReward:55,teachesMove:'bodyShot',zone:3,aiPattern:'streetFighter',groundDefense:0.35,groundEscape:0.3},
    stunner:{name:'Stunner',hp:80,maxHp:80,speed:70,attackDamage:12,attackCooldownMax:1200,attackRange:60,chaseRange:250,color:0x8800ff,xpReward:45,teachesMove:null,zone:2,aiPattern:'stunner',groundDefense:0.3,groundEscape:0.2},
    // Coach Enemy: support-type that boosts nearby allies (+15% attack speed per Coach in radius)
    coach:{name:'Coach',hp:60,maxHp:60,speed:88,attackDamage:6,attackCooldownMax:1800,attackRange:40,chaseRange:260,color:0x33ffcc,xpReward:45,teachesMove:null,zone:2,aiPattern:'coach'},
    drunkMonk:{name:'Drunk Monk',hp:70,maxHp:70,speed:75,attackDamage:12,attackCooldownMax:1300,attackRange:55,chaseRange:230,color:0x8866aa,xpReward:30,teachesMove:null,zone:2,aiPattern:'drunkMonk'},
    // Rival System: recurring "Shadow" boss that appears across zones with scaling stats
    shadowRival:{name:'Shadow Rival',hp:150,maxHp:150,speed:92,attackDamage:22,attackCooldownMax:1150,attackRange:70,chaseRange:280,color:0x111111,xpReward:90,teachesMove:null,zone:2,aiPattern:'chase'},
    // Feint Master: zones 2-3, mid HP, good speed, performs fake windup then real strike
    feintMaster:{name:'Feint Master',hp:75,maxHp:75,speed:95,attackDamage:16,attackCooldownMax:1400,attackRange:65,chaseRange:250,color:0xff00ff,xpReward:50,teachesMove:null,zone:2,aiPattern:'feintMaster',groundDefense:0.3,groundEscape:0.25},

    // Bully AI: pressures harder when player is low HP; panics/flees when its own HP is critical
    bully:{name:'Bully',hp:95,maxHp:95,speed:82,attackDamage:15,attackCooldownMax:1150,attackRange:60,chaseRange:260,color:0xff8800,xpReward:55,teachesMove:null,zone:2,aiPattern:'bully',groundDefense:0.35,groundEscape:0.25},

    // Gimmick Specialist: Regenerator (slow heal over time; punishes passive play)
    regenerator:{name:'Regenerator',hp:85,maxHp:85,speed:78,attackDamage:12,attackCooldownMax:1250,attackRange:60,chaseRange:240,color:0x22ff66,xpReward:60,teachesMove:null,zone:2,aiPattern:'regen',groundDefense:0.35,groundEscape:0.25},

    // Gimmick Specialist: Glitcher (blink teleport behind player + quick strike)
    glitcher:{name:'Glitcher',hp:80,maxHp:80,speed:92,attackDamage:14,attackCooldownMax:1050,attackRange:62,chaseRange:270,color:0x00e5ff,xpReward:65,teachesMove:null,zone:2,aiPattern:'glitcher',groundDefense:0.30,groundEscape:0.25},

    // Tutor Enemy: trainer-type that teaches a technique upon victory.
    // Also "mirrors" the player's recent attacks (best-effort) to force adaptation.
    tutor:{name:'Tutor',hp:95,maxHp:95,speed:84,attackDamage:14,attackCooldownMax:1150,attackRange:65,chaseRange:260,color:0x66ff33,xpReward:70,teachesMove:null,zone:2,aiPattern:'tutor',groundDefense:0.45,groundEscape:0.35},

    // Echo Enemy: rare zone 3+ enemy that records player attacks and plays them back
    echo:{name:'Echo',hp:110,maxHp:110,speed:88,attackDamage:16,attackCooldownMax:1000,attackRange:60,chaseRange:250,color:0x9933ff,xpReward:65,teachesMove:null,zone:3,aiPattern:'echo',groundDefense:0.35,groundEscape:0.25},

    // Temperamental Enforcer: heavy enemy that enrages when allies are defeated - gains +30% attack speed but loses 10% accuracy
    enforcer:{name:'Enforcer',hp:130,maxHp:130,speed:55,attackDamage:20,attackCooldownMax:1600,attackRange:65,chaseRange:220,color:0xff4444,xpReward:60,teachesMove:null,zone:2,aiPattern:'enforcer',groundDefense:0.5,groundEscape:0.4},

    // Tank: slow, heavily armored enemy that absorbs hits and delivers slow but powerful strikes
    // Designed to be a "wall" that players must work around - high defense, slow attacks, punishing to focus fire on
    tank:{name:'Tank',hp:150,maxHp:150,speed:45,attackDamage:18,attackCooldownMax:1800,attackRange:55,chaseRange:200,color:0x555555,xpReward:50,teachesMove:null,zone:2,aiPattern:'tank',groundDefense:0.75,groundEscape:0.3},

    // Trickster: special enemy that occasionally vanishes and reappears behind the player during combat
    // Requires quick camera awareness to defend. Visual: dissolve particle effect followed by reappearance behind player
    trickster:{name:'Trickster',hp:75,maxHp:75,speed:95,attackDamage:14,attackCooldownMax:1100,attackRange:65,chaseRange:270,color:0xff00aa,xpReward:55,teachesMove:null,zone:2,aiPattern:'trickster',groundDefense:0.25,groundEscape:0.2},

    // Showstopper: rare boss variant that "pauses" the player mid-attack
    // Requires timing adjustment to land hits. Visual: clockwork gears appear briefly around the enemy during pause
    showstopper:{name:'Showstopper',hp:140,maxHp:140,speed:75,attackDamage:18,attackCooldownMax:1400,attackRange:65,chaseRange:250,color:0xffaa00,xpReward:80,teachesMove:null,zone:3,aiPattern:'showstopper',groundDefense:0.4,groundEscape:0.3},

    // Bounty Hunter: mercenary hunter that tracks players with active bounties
    // Spawns based on bounty level, scales with player progress, has unique red glow
    bountyHunter:{name:'Bounty Hunter',hp:110,maxHp:110,speed:98,attackDamage:18,attackCooldownMax:950,attackRange:65,chaseRange:280,color:0xff4444,xpReward:75,teachesMove:null,zone:2,aiPattern:'bountyHunter',groundDefense:0.35,groundEscape:0.25}
  },

  // Bounty Hunter AI Config: aggressive hunter with tracking capabilities
  BOUNTY_HUNTER_CONFIG: {
    TRACKING_BONUS: 0.15,         // +15% damage when player is low HP
    LOW_HP_THRESHOLD: 0.30,       // Trigger tracking bonus below 30% HP
    PURSUE_SPEED_MULT: 1.2,       // 20% faster pursuit
    SNIPE_RANGE: 120,              // Can attack from longer range
    HUNTER_GLOW: 0xff4444          // Red glow color
  },

  // Trickster AI Config: teleports behind player mid-combat
  TRICKSTER_CONFIG: {
    TELEPORT_CHANCE: 0.008,         // Chance per frame to attempt teleport when eligible
    MIN_HP_FOR_TELEPORT: 0.40,      // Only teleport when above 40% HP
    MIN_COOLDOWN_MS: 3500,         // Minimum time between teleports
    BEHIND_DISTANCE: 70,            // Distance behind player to teleport to
    TELEPORT_DURATION: 400,         // How long the teleport effect lasts
    STRIKE_DELAY: 250,             // Delay before attacking after teleport
    DAMAGE_MULT: 1.25,             // Damage multiplier for post-teleport attacks
    WARNING_TEXT: 'VANISH!',
    WARNING_COLOR: '#ff00ff',
    TELEPORT_TEXT: 'BEHIND YOU!',
    TELEPORT_COLOR: '#ff66ff'
  },

  // Showstopper Enemy: rare boss variant that "pauses" the player for 1 second mid-attack
  // Requires timing adjustment to land hits. Visual: clockwork gears appear briefly around the enemy during pause
  SHOWSTOPPER_CONFIG: {
    PAUSE_DURATION: 1000,           // 1 second player pause
    PAUSE_CHANCE: 0.15,            // 15% chance per attack to trigger pause
    MIN_COOLDOWN_MS: 4000,         // Minimum time between pause triggers
    GEAR_COUNT: 4,                 // Number of clockwork gears to display
    GEAR_ROTATION_SPEED: 200,       // Rotation speed per gear (ms per degree)
    WARNING_TEXT: 'FREEZE!',
    WARNING_COLOR: '#ffaa00',
    PAUSE_TEXT: 'TIME STOPPED!',
    PAUSE_COLOR: '#ffcc00'
  },

  // Flash KO Blindness: dramatic KO causes camera flash that leaves enemy temporarily blinded
  // in next room (if same enemy type) - 30% miss chance for 10 seconds, visual white afterimage effect
  FLASH_KO_BLINDNESS: {
    ENABLED: true,
    MISS_CHANCE: 0.30,         // 30% miss chance while blinded
    DURATION: 10000,           // 10 seconds blindness duration
    STORAGE_KEY: 'mma_rpg_ko_blindness',
    BLIND_TEXT: 'BLINDED!',
    BLIND_COLOR: '#ffffff'
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

  // Temperamental Enforcer Config: triggers when allies die nearby
  ENFORCER_CONFIG: {
    ENRAGE_RADIUS: 180,           // pixels - range to detect ally deaths
    ATTACK_SPEED_BONUS: 0.30,    // +30% attack speed when enraged
    ACCURACY_PENALTY: 0.10,      // -10% accuracy (miss chance) when enraged
    MAX_ENRAGE_STACKS: 3,        // Max enrage stacks from multiple ally deaths
    ENRAGE_DURATION: 6000,       // How long enrage lasts (ms)
    STACK_GAIN_TEXT: 'ENFORCER ENRAGED!',
    STACK_COLOR: '#ff2200'
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

  // Phase Shift Boss: boss enemies trigger phase shifts at 75%, 50%, and 25% HP
  // Each shift changes their attack pattern (striker→grappler or vice versa), grants brief invulnerability, and has unique visual
  PHASE_SHIFT_CONFIG: {
    THRESHOLDS: [0.75, 0.50, 0.25],  // HP percentages that trigger phase shifts
    INVULN_DURATION: 500,             // 0.5s invulnerability during shift
    PHASES: [
      { name: 'aggressive', attackSpeedMult: 1.3, damageMult: 1.2, tint: 0xff0000, text: 'PHASE 2!', aiFrom: 'chase', aiTo: 'combo' },
      { name: 'defensive', attackSpeedMult: 0.8, damageMult: 1.4, tint: 0x00ff00, text: 'PHASE 3!', aiFrom: 'combo', aiTo: 'grasper' },
      { name: 'enraged', attackSpeedMult: 1.5, damageMult: 1.6, tint: 0xff00ff, text: 'FINAL FORM!', aiFrom: 'grasper', aiTo: 'subHunter' }
    ]
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

  // Territory Control: enemies gain +10% attack when fighting in their "home" room (where they first spawned)
  // and within a short radius of their home position.
  TERRITORY_CONFIG: {
    HOME_RADIUS: 150,
    ATTACK_BONUS: 0.10
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

  // Elite variants: 2x HP, stronger attacks, unique glow, rare drops
  ELITE_TYPES: {
    eliteStreetThug:{baseType:'streetThug',name:'Elite Street Thug',hpMultiplier:2,attackMultiplier:1.5,speedBonus:15,color:0xff4444,colorGlow:0xff0000,xpMultiplier:2.5,dropChance:0.2,rareItem:'speedPotion'},
    eliteBarBrawler:{baseType:'barBrawler',name:'Elite Bouncer',hpMultiplier:2,attackMultiplier:1.5,speedBonus:10,color:0xff7744,colorGlow:0xff6600,xpMultiplier:2.5,dropChance:0.2,rareItem:'powerGloves'},
    eliteMuayThai:{baseType:'muayThaiFighter',name:'Elite Muay Thai',hpMultiplier:2,attackMultiplier:1.6,speedBonus:20,color:0x44ff88,colorGlow:0x00ff44,xpMultiplier:2.5,dropChance:0.25,rareItem:'elbowPads'},
    eliteWrestler:{baseType:'wrestler',name:'Elite Wrestler',hpMultiplier:2,attackMultiplier:1.5,speedBonus:12,color:0x66aaff,colorGlow:0x0088ff,xpMultiplier:2.5,dropChance:0.2,rareItem:'wrestlingBoots'},
    eliteJudoka:{baseType:'judoka',name:'Elite Judoka',hpMultiplier:2,attackMultiplier:1.6,speedBonus:15,color:0xaa66ff,colorGlow:0x8800ff,xpMultiplier:2.5,dropChance:0.25,rareItem:'giBelt'},
    eliteGroundNPounder:{baseType:'groundNPounder',name:'Elite Ground Pounder',hpMultiplier:2,attackMultiplier:1.5,speedBonus:8,color:0xffaa66,colorGlow:0xff8800,xpMultiplier:2.5,dropChance:0.2,rareItem:'kneePads'},
    eliteBJJ:{baseType:'bjjBlackBelt',name:'Elite BJJ Master',hpMultiplier:2,attackMultiplier:1.7,speedBonus:18,color:0x444444,colorGlow:0x222222,xpMultiplier:3,dropChance:0.3,rareItem:'submissionGloves'},
    eliteStriker:{baseType:'striker',name:'Elite Striker',hpMultiplier:2,attackMultiplier:1.6,speedBonus:20,color:0xff6699,colorGlow:0xff0066,xpMultiplier:2.5,dropChance:0.22,rareItem:'speedPotion'},
    eliteKickboxer:{baseType:'kickboxer',name:'Elite Kickboxer',hpMultiplier:2,attackMultiplier:1.6,speedBonus:22,color:0x00ffff,colorGlow:0x00cccc,xpMultiplier:2.5,dropChance:0.22,rareItem:'speedPotion'},
    eliteTank:{baseType:'tank',name:'Heavy Tank',hpMultiplier:2.2,attackMultiplier:1.7,speedBonus:8,color:0x666666,colorGlow:0x444444,xpMultiplier:2.8,dropChance:0.25,rareItem:'armorPlating'},
    eliteBoxer:{baseType:'boxer',name:'Elite Boxer',hpMultiplier:2,attackMultiplier:1.5,speedBonus:18,color:0xff6666,colorGlow:0xff0000,xpMultiplier:2.6,dropChance:0.24,rareItem:'speedPotion',specialAbility:'counterStance'},
    eliteKarateka:{baseType:'karateka',name:'Sensei',hpMultiplier:2.4,attackMultiplier:1.75,speedBonus:14,color:0xffffff,colorGlow:0x00ffff,xpMultiplier:3,dropChance:0.28,rareItem:'giBelt',specialAbility:'focusStrike'},
    eliteStreetFighter:{baseType:'streetFighter',name:'Chaos King',hpMultiplier:2.2,attackMultiplier:1.65,speedBonus:16,color:0xffaa44,colorGlow:0xff5500,xpMultiplier:2.8,dropChance:0.26,rareItem:'powerGloves',specialAbility:'chaosRush'}
  },
  // Chance to spawn elite instead of regular (15%)
  ELITE_SPAWN_CHANCE: 0.15,

  // Rare items that elite enemies can drop
  RARE_ITEMS: {
    speedPotion:{name:'Speed Potion',stat:'speed',value:10,duration:30000,color:0x00ff00,description:'+10 Speed for 30s'},
    powerGloves:{name:'Power Gloves',stat:'attackDamage',value:5,duration:30000,color:0xff0000,description:'+5 Attack for 30s'},
    elbowPads:{name:'Elbow Pads',stat:'defense',value:3,duration:30000,color:0xffff00,description:'+3 Defense for 30s'},
    wrestlingBoots:{name:'Wrestling Boots',stat:'speed',value:8,duration:30000,color:0x0088ff,description:'+8 Speed for 30s'},
    giBelt:{name:'Gi Belt',stat:'defense',value:5,duration:30000,color:0xff8800,description:'+5 Defense for 30s'},
    kneePads:{name:'Knee Pads',stat:'hp',value:20,duration:0,color:0xaa8800,description:'+20 Max HP (permanent)'},
    submissionGloves:{name:'Submission Gloves',stat:'attackDamage',value:8,duration:45000,color:0x8800ff,description:'+8 Attack for 45s'},
    armorPlating:{name:'Armor Plating',stat:'defense',value:8,duration:60000,color:0x888888,description:'+8 Defense for 60s'},
    nemesisRing:{name:'Nemesis Ring',stat:'all',value:15,duration:120000,color:0x8800ff,description:'+15 All Stats for 2min (Nemesis Slayer exclusive)'}
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

  // Tag Team AI: paired enemies alternate who "pressures" the player.
  // The resting partner backs off, repositions, and recovers faster.
  TAG_TEAM: {
    ENABLED: true,
    MIN_ZONE: 2,
    SWAP_MS: 2000,
    REST_DISTANCE: 140,  // try to stay at least this far from player while resting
    FLANK_ANGLE: 1.1     // radians offset for flanking while resting
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

  AI: {},
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
  // Ensemble Cast: recurring enemy characters with unique names, backstories, and voice lines.
  // These replace generic enemy types occasionally for personality and lore.
  ENSEMBLE_CAST: {
    // Chance to spawn an ensemble character instead of generic enemy (per spawn attempt)
    SPAWN_CHANCE: 0.08,
    // Zone requirements for each character
    MIN_ZONE: 2,
    // Named characters pool - each has baseType, unique name, title, and voice lines
    CHARACTERS: [
      { baseType: 'streetThug', name: 'Rocco', title: 'the Brick', zone: 2, color: 0xcc4444,
        intro: "Rocco: 'You picked the wrong alley, pal.'",
        defeat: "Rocco: 'Not bad... for an amateur.'",
        attack: ['GRAB!', 'SUCKER!', 'STREET FIGHT!'] },
      { baseType: 'streetThug', name: 'Maya', title: 'Fist First', zone: 2, color: 0xcc44cc,
        intro: "Maya: 'Let's see what you got.'",
        defeat: "Maya: 'You got potential. Don't waste it.'",
        attack: ['QUICK!', 'DUCK!', 'COMBO!'] },
      { baseType: 'barBrawler', name: 'Big Tony', title: 'The Bouncer', zone: 2, color: 0xff8844,
        intro: "Tony: 'Nobody causes trouble in MY bar.'",
        defeat: "Tony: 'Alright, you win. Drinks are on me.'",
        attack: ['OUTTA HERE!', 'BEGONE!', 'ELBOW!'] },
      { baseType: 'wrestler', name: 'Kneecap Karl', title: 'Leg Lock Legend', zone: 2, color: 0x4488ff,
        intro: "Karl: 'Hope you like ground work.'",
        defeat: "Karl: 'Taught you everything you know.'",
        attack: ['TAKEDOWN!', 'LEG GRAB!', 'PIN!'] },
      { baseType: 'muayThaiFighter', name: 'Saenchai', title: 'The Thai Storm', zone: 3, color: 0x44ff88,
        intro: "Saenchai: 'Ready for the Eight Limbs?'",
        defeat: "Saenchai: 'Respect. You fight well.'",
        attack: ['ELBOW!', 'KNEE!', 'MUAY THAI!'] },
      { baseType: 'kickboxer', name: 'Dutch', title: 'The Dutch Destroyer', zone: 2, color: 0x44ffff,
        intro: "Dutch: 'Feet first, questions later.'",
        defeat: "Dutch: 'Fast hands... but my kicks are faster.'",
        attack: ['HIGH KICK!', 'CALF SMASH!', 'ROUNDHOUSE!'] },
      { baseType: 'striker', name: 'Flash Fiona', title: 'Pocket Rocket', zone: 2, color: 0xff4488,
        intro: "Fiona: 'Blink and you'll miss it.'",
        defeat: "Fiona: 'Fastest hands in the east... or west.'",
        attack: ['JAB!', 'COMBO!', 'SPEED!'] },
      { baseType: 'bjjBlackBelt', name: 'Professor Pete', title: 'The Submission Artist', zone: 3, color: 0x666666,
        intro: "Pete: 'Tap out. It's less embarrassing.'",
        defeat: "Pete: 'Technique beats strength. Remember that.'",
        attack: ['ARM BAR!', 'TRIANGLE!', 'GUILLOTINE!'] },
      { baseType: 'judoka', name: 'Yoshi', title: 'Throw Master', zone: 3, color: 0x8844ff,
        intro: "Yoshi: 'Balance is everything. You have none.'",
        defeat: "Yoshi: 'Impressive for a rookie.'",
        attack: ['HIP THROW!', 'SEOI NAGE!', 'IPPN!'] }
    ]
  },

  // Check if we should spawn an ensemble character instead of generic enemy
  _checkEnsembleSpawn: function(scene, baseTypeKey) {
    var cfg = this.ENSEMBLE_CAST;
    var zone = scene.currentZone || 1;
    if (zone < cfg.MIN_ZONE) return null;
    if (Math.random() > cfg.SPAWN_CHANCE) return null;

    // Support both array and object-keyed CHARACTERS format
    var charList = Array.isArray(cfg.CHARACTERS)
      ? cfg.CHARACTERS
      : Object.keys(cfg.CHARACTERS).map(function(k) {
          var c = cfg.CHARACTERS[k];
          if (!c.id) c.id = k;
          return c;
        });

    // Filter characters by zone and baseType match
    var candidates = charList.filter(function(c) {
      return c.baseType === baseTypeKey && c.zone <= zone;
    });
    if (candidates.length === 0) return null;

    return candidates[Math.floor(Math.random() * candidates.length)];
  },

  // Apply ensemble character to enemy type (called in spawnEnemy)
  _applyEnsembleCharacter: function(type, character) {
    if (!character) return type;
    type.name = character.name;
    type.title = character.title;
    type.color = character.color;
    type.isEnsemble = true;
    type.ensembleData = character;
    return type;
  },

  // Show ensemble character intro dialogue
  _showEnsembleIntro: function(scene, enemy) {
    var data = enemy.type.ensembleData;
    if (!data || !data.intro) return;
    scene.registry.set('gameMessage', data.intro);
    scene.time.delayedCall(2500, function(){ scene.registry.set('gameMessage', ''); });
  },

  // Get random attack voice line for ensemble character
  _getEnsembleAttackLine: function(enemy) {
    var data = enemy.type.ensembleData;
    if (!data || !data.attack || data.attack.length === 0) return null;
    return data.attack[Math.floor(Math.random() * data.attack.length)];
  },

  // Enemy Health Bar Color Coding: different enemy types have different colored health bars
  // Helps players quickly identify threats in crowded rooms
  getHealthBarColor: function(enemy) {
    if (!enemy || !enemy.type) return 0xe83030; // default red
    
    var ai = enemy.type.aiPattern;
    var tk = enemy.typeKey;
    
    // Boss: gold
    if (enemy.isBoss) return 0xffd700;
    
    // Elite: purple glow
    if (enemy.isElite) return 0xff00ff;
    
    // Nemesis: dark purple
    if (enemy.type && enemy.type.isNemesis) return 0x8800ff;
    
    // Rival Echo: light purple
    if (enemy.type && enemy.type.isRivalEcho) return 0xaa66ff;
    
    // Coach: cyan (support type)
    if (tk === 'coach' || ai === 'coach') return 0x00ffff;
    
    // Grappler patterns (grasper, thrower, subHunter): blue
    if (ai === 'grasper' || ai === 'thrower' || ai === 'subHunter') return 0x4444ff;
    
    // Kicker patterns: green
    if (ai === 'kickboxer' || ai === 'kicker') return 0x44ff44;
    
    // Tank: gray (heavy/armored)
    if (ai === 'tank') return 0x888888;
    
    // Stunner: magenta
    if (ai === 'stunner') return 0xff44ff;
    
    // Regenerator: bright green
    if (ai === 'regen') return 0x22ff66;
    
    // Glitcher: cyan
    if (ai === 'glitcher') return 0x00e5ff;
    
    // Trickster: pink
    if (ai === 'trickster') return 0xff66aa;
    
    // Echo: purple
    if (ai === 'echo') return 0x9933ff;
    
    // Enforcer: orange-red
    if (ai === 'enforcer') return 0xff4400;
    
    // Bully: orange
    if (ai === 'bully') return 0xff8800;
    
    // Drunk Monk: purple-brown
    if (ai === 'drunkMonk') return 0x9966aa;
    
    // Feint Master: magenta
    if (ai === 'feintMaster') return 0xff00ff;
    
    // Tutor: lime green
    if (ai === 'tutor') return 0x66ff33;
    
    // Showstopper: orange-gold (clockwork gears)
    if (ai === 'showstopper') return 0xffaa00;
    
    // Default striker/combo/chase: red
    return 0xe83030;
  },

  // Role Icon mapping for Enemy Role Call feature
  getRoleIcon: function(enemy) {
    if (!enemy || !enemy.type) return '⚔';
    var ai = enemy.type.aiPattern;
    var tk = enemy.typeKey;

    // Boss gets crown
    if (enemy.isBoss) return '👑';

    // Support/coach type
    if (tk === 'coach' || ai === 'coach') return '📣';

    // Grappler patterns
    if (ai === 'grasper' || ai === 'thrower' || ai === 'subHunter') return '⛓';

    // Kicker patterns
    if (ai === 'kickboxer' || ai === 'kicker') return '🦵';

    // Combo/striker patterns
    if (ai === 'combo' || ai === 'chase' || ai === 'striker') return '👊';

    // Stunner
    if (ai === 'stunner') return '✨';

    // Regenerator
    if (ai === 'regen') return '♻';

    // Glitcher
    if (ai === 'glitcher') return '⚡';

    // Echo
    if (ai === 'echo') return '🪞';

    // Enforcer
    if (ai === 'enforcer') return '🐂';

    // Tank
    if (ai === 'tank') return '🛡';

    // Trickster
    if (ai === 'trickster') return '👻';

    return '⚔';
  },

  // Dynamic Role Call: role icon reacts to temporary enemy states for quick threat reading.
  // (kept purely cosmetic; does not change gameplay mechanics)
  getDynamicRoleIcon: function(enemy) {
    var base = this.getRoleIcon(enemy);
    if (!enemy) return base;

    // Priority order: phase shift / invuln -> rage -> vengeance -> fleeing -> fear
    if (enemy.isPhaseShifting) return '🛡';
    if (enemy.isEnraged) return '🔥' + base;
    if (enemy.vengeanceTimer && enemy.vengeanceTimer > 0) return '😡' + base;
    if (enemy.isFleeing) return '🏃' + base;

    // Fear tremble indicator (below threshold and not boss)
    try {
      if (!enemy.isBoss && enemy.stats && enemy.stats.maxHp > 0) {
        var hpPct = enemy.stats.hp / enemy.stats.maxHp;
        if (this.FEAR_TREMBLE_CONFIG && hpPct <= this.FEAR_TREMBLE_CONFIG.HP_THRESHOLD) return '😰' + base;
      }
    } catch (e) {}

    return base;
  },

  // Update role icons for all enemies in the scene
  updateRoleIcons: function(scene, delta) {
    if (!scene || !scene.enemies) return;
    var self = this;
    scene.enemies.forEach(function(enemy) {
      if (!enemy || !enemy._roleIcon) return;
      var newIcon = self.getDynamicRoleIcon(enemy);
      if (newIcon !== enemy._roleIconLastText) {
        enemy._roleIcon.setText(newIcon);
        enemy._roleIconLastText = newIcon;
      }
    });
  },

  getActivePlayers: function(scene) {
    var players = [];
    if (scene && scene.player && scene.player.active) players.push(scene.player);
    if (scene && scene.player2 && scene.player2.active) players.push(scene.player2);
    return players;
  },
  getTargetPlayer: function(scene, enemy) {
    var players = this.getActivePlayers(scene);
    if (!players.length) return scene && scene.player ? scene.player : null;
    if (!enemy) return players[0];
    return players.reduce(function(best, candidate) {
      var bestDist = Math.hypot(enemy.x - best.x, enemy.y - best.y);
      var nextDist = Math.hypot(enemy.x - candidate.x, enemy.y - candidate.y);
      return nextDist < bestDist ? candidate : best;
    }, players[0]);
  },
  spawnEnemy: function(scene, typeKey, x, y, forceElite, options) {
    var self = this;
    var opts = options || {};
    var isElite = forceElite || (!opts.skipEliteRoll && Math.random() < this.ELITE_SPAWN_CHANCE && !typeKey.includes('champ') && typeKey !== 'shadowRival');
    var eliteType = null;
    var baseTypeKey = typeKey;

    // Check if there's an elite variant for this type
    if (isElite) {
      var eliteKey = 'elite' + typeKey.charAt(0).toUpperCase() + typeKey.slice(1);
      if (typeKey === 'muayThaiFighter') eliteKey = 'eliteMuayThai';
      if (typeKey === 'groundNPounder') eliteKey = 'eliteGroundNPounder';
      if (typeKey === 'bjjBlackBelt') eliteKey = 'eliteBJJ';
      if (typeKey === 'streetFighter') eliteKey = 'eliteStreetFighter';

      if (this.ELITE_TYPES[eliteKey]) {
        eliteType = this.ELITE_TYPES[eliteKey];
        baseTypeKey = eliteType.baseType;
      }
    }

    var baseType = this.TYPES[baseTypeKey];
    var type = Object.assign({}, baseType);
    type.id = typeKey;
    type.typeKey = typeKey;

    // Ensemble Cast: check if we should spawn a named character instead of generic enemy
    // Only apply if not elite and not boss/rival special types
    var ensembleChar = null;
    if (!eliteType && typeKey !== 'shadowRival' && typeKey !== 'mmaChamp' && typeKey !== 'coach') {
      ensembleChar = self._checkEnsembleSpawn(scene, baseTypeKey);
      if (ensembleChar) {
        type = self._applyEnsembleCharacter(type, ensembleChar);
      }
    }

    // Apply elite multipliers
    if (eliteType) {
      type.hp = Math.round(baseType.hp * eliteType.hpMultiplier);
      type.maxHp = type.hp;
      type.attackDamage = Math.round(baseType.attackDamage * eliteType.attackMultiplier);
      type.speed = Math.round(baseType.speed + eliteType.speedBonus);
      type.xpReward = Math.round(baseType.xpReward * eliteType.xpMultiplier);
      type.name = eliteType.name;
      type.color = eliteType.color;
      type.isElite = true;
      type.eliteData = eliteType;
    }

    // Zone-based difficulty scaling: enemies spawned above their base zone get stronger
    var currentZone = scene.currentZone || 1;
    var enemyBaseZone = baseType.zone || 1;
    var zoneDiff = currentZone - enemyBaseZone;

    // Rival scaling: the Shadow Rival always scales (and is treated as a mini-boss)
    if (typeKey === 'shadowRival') {
      var z = Math.max(1, currentZone);
      // Stronger every zone: +20% hp, +12% dmg, +6% speed per zone (capped)
      var rHp = Math.min((z - 1) * 0.20, 1.20);
      var rDmg = Math.min((z - 1) * 0.12, 0.90);
      var rSpd = Math.min((z - 1) * 0.06, 0.45);
      type.hp = Math.round(type.hp * (1 + rHp));
      type.maxHp = type.hp;
      type.attackDamage = Math.round(type.attackDamage * (1 + rDmg));
      type.speed = Math.round(type.speed * (1 + rSpd));
      type.xpReward = Math.round(type.xpReward * (1 + rHp * 0.6));
      type.isRival = true;

      var style = self._getPlayerStyle(scene);
      type.rivalStyle = style;
      if (style === 'striker') type.name = 'Shadow Rival (Striker)';
      else if (style === 'grappler') type.name = 'Shadow Rival (Grappler)';
      else type.name = 'Shadow Rival';
    } else if (zoneDiff > 0) {
      // Only scale for non-boss enemies (mmaChamp)
      var isBoss = (typeKey === 'mmaChamp');
      if (!isBoss) {
        // Mild scaling: 15% per zone above base, capped at 75% total
        var scaleFactor = Math.min(zoneDiff * 0.15, 0.75);
        type.hp = Math.round(type.hp * (1 + scaleFactor));
        type.maxHp = type.hp;
        type.attackDamage = Math.round(type.attackDamage * (1 + scaleFactor * 0.8));
        type.speed = Math.round(type.speed * (1 + scaleFactor * 0.5));
        type.xpReward = Math.round(type.xpReward * (1 + scaleFactor));
        type.scaledFromZone = enemyBaseZone;
        type.scaledToZone = currentZone;
      }
    }

    // Nemesis Encounter System: apply nemesis modifiers if this is the current nemesis type
    // Only apply to non-boss, non-elite, non-rival enemies to avoid stacking too many bonuses
    if (!eliteType && typeKey !== 'shadowRival' && typeKey !== 'mmaChamp') {
      type = self.applyNemesisModifiers(type, scene);
    }

    // Rival Echo System: apply echo modifiers if player has lost 3+ times to this enemy type
    // Only apply if nemesis not already applied
    if (!eliteType && typeKey !== 'shadowRival' && typeKey !== 'mmaChamp' && !type.isNemesis) {
      type = self.applyRivalEchoModifiers(type, scene);
    }

    // Apply Mercenary Contract multipliers AFTER elite/rival/zone/nemesis scaling
    var contractTier = this.getContractTier(scene);
    if (contractTier) {
      var contractMult = this.getContractMultipliers(contractTier);
      type.hp = Math.round(type.hp * contractMult.hpMultiplier);
      type.maxHp = type.hp;
      type.attackDamage = Math.round(type.attackDamage * contractMult.attackMultiplier);
      type.xpReward = Math.round(type.xpReward * contractMult.xpMultiplier);
      type.hasContract = true;
      type.contractTier = contractTier;
    }

    // Blood Money Bounty: apply bounty hunter modifications if this is a bounty hunter
    if (typeKey === 'bountyHunter') {
      type = self.applyBountyHunterMods(type);
      // Apply distinctive red tint
      type.color = self.BOUNTY_SYSTEM.HUNTER_COLOR;
    }

    // Comeback Kid: if you died to this archetype last run, weaken it slightly and grant +Focus.
    this.applyComebackIfAny(scene, typeKey, type);

    type.attackDamage = Math.max(1, Math.round(type.attackDamage * 0.36)); type.attackCooldownMax = Math.round(type.attackCooldownMax * 1.8); type.speed = Math.round(type.speed * 0.85);
    if (typeof type.groundDefense !== 'number') type.groundDefense = 0.25;
    if (typeof type.groundEscape !== 'number') type.groundEscape = 0.2;
    var tex = (window.MMA && MMA.Sprites && typeof MMA.Sprites.resolveEnemyTextureKey === 'function')
      ? MMA.Sprites.resolveEnemyTextureKey(typeKey, baseTypeKey)
      : ((baseTypeKey === 'streetThug') ? 'enemy_thug' : 'enemy_brawler');
    var e = scene.physics.add.sprite(x, y, tex);
    e.setDisplaySize(CONFIG.DISPLAY_TILE, CONFIG.DISPLAY_TILE * 1.5); if (baseTypeKey === 'barBrawler') e.setDisplaySize(CONFIG.DISPLAY_TILE * 1.08, CONFIG.DISPLAY_TILE * 1.62);
    e.body.setSize(24, 36); e.body.setOffset(12, 18); e.stats = { hp: type.hp, maxHp: type.maxHp }; e.type = type; e.typeKey = typeKey; e.baseTypeKey = baseTypeKey; e.baseSpeed = type.speed; // store base speed
    e.state = 'idle'; e.attackCooldown = 0; e.staggerTimer = 0;
    // Enemy Combo Memory: initialize tracking for long-term pattern learning
    self.initComboMemory(e);
    e.isBoss = (typeKey === 'mmaChamp'); e.phaseTwo = false; e.isElite = !!eliteType;

    // Tutor Enemy: snapshot player's recent move keys so it can "mirror" your habits.
    if (typeKey === 'tutor') {
      try {
        self.initAdaptiveTracking(scene);
        var keys = (scene && scene._playerAttackMoveKeys) ? scene._playerAttackMoveKeys.slice() : [];
        e.learnedMoves = keys.slice(Math.max(0, keys.length - 3));
        e.learnedMoveIdx = 0;
      } catch (err) {
        e.learnedMoves = [];
        e.learnedMoveIdx = 0;
      }
    }

    // Elite glow effect
    if (eliteType && eliteType.colorGlow) {
      e.setTint(eliteType.colorGlow);
      // Add pulsing glow effect
      scene.tweens.add({
        targets: e,
        alpha: 0.7,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
    if (eliteType && eliteType.specialAbility) {
      this.applyEliteAbility(e, eliteType.specialAbility);
    }

    // Predator Patience: elite+ enemies briefly "size up" before engaging.
    if (self.PREDATOR_PATIENCE && self.PREDATOR_PATIENCE.ENABLED) {
      var eligible = (e.isElite || e.typeKey === 'shadowRival');
      if (!e.isBoss && eligible) {
        e.isSizingUp = true;
        e.sizingUpTimer = self.PREDATOR_PATIENCE.SIZE_UP_MS || 3000;
        e._predatorPreemptiveConsumed = false;
        e._predatorToastShown = false;
      }
    }

    // Regenerator visual cue (only if not overridden by elite/boss/nemesis)
    if (!eliteType && !e.isBoss && type && type.aiPattern === 'regen') {
      e.setTint(0x22ff66);
      if (scene.tweens) {
        scene.tweens.add({
          targets: e,
          alpha: 0.75,
          duration: 650,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    }

    // Nemesis visual cue: purple glow with pulsing effect
    if (type.isNemesis) {
      e.setTint(self.NEMESIS_CONFIG.GLOW_COLOR);
      if (scene.tweens) {
        scene.tweens.add({
          targets: e,
          alpha: 0.7,
          duration: 400,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
      // Show nemesis spawn message
      var nemesisName = type.name || typeKey;
      scene.registry.set('gameMessage', 'NEMESIS: ' + nemesisName.toUpperCase() + '!');
      scene.time.delayedCall(2000, function(){ scene.registry.set('gameMessage', ''); });
    }

    if (e.isBoss) {
      e.setTint(0xffd700);
      if (!opts.silent) {
        scene.registry.set('gameMessage', 'BOSS FIGHT!');
        scene.time.delayedCall(2000, function(){ scene.registry.set('gameMessage', ''); });
      }
    }

    // Show elite spawn message
    if (eliteType && !opts.silent) {
      scene.registry.set('gameMessage', 'ELITE ENEMY!');
      scene.time.delayedCall(1500, function(){ scene.registry.set('gameMessage', ''); });
    }

    // Rival spawn message (style-dependent)
    if (typeKey === 'shadowRival' && !opts.silent) {
      var msg = 'A SHADOW RIVAL APPEARS!';
      if (type.rivalStyle === 'striker') msg = 'SHADOW: "Your hands won\'t save you."';
      if (type.rivalStyle === 'grappler') msg = 'SHADOW: "Let\'s see you wrestle with fate."';
      if (type.rivalStyle === 'balanced') msg = 'SHADOW: "Still undecided? I\'ll decide for you."';
      scene.registry.set('gameMessage', msg);
      scene.time.delayedCall(2200, function(){ scene.registry.set('gameMessage', ''); });
    }

    // Blood Money Bounty: show bounty hunter spawn message with red glow
    if (typeKey === 'bountyHunter') {
      e.setTint(self.BOUNTY_SYSTEM.HUNTER_COLOR);
      // Add pulsing glow effect for bounty hunter
      if (scene.tweens) {
        scene.tweens.add({
          targets: e,
          alpha: 0.7,
          duration: 350,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
      var bountyLvl = self.getBountyLevel();
      var bountyMsg = self.BOUNTY_SYSTEM.WARNING_TEXT;
      if (bountyLvl >= self.BOUNTY_SYSTEM.MAX_BOUNTY) {
        bountyMsg = 'MAX BOUNTY HUNTER!';
      }
      scene.registry.set('gameMessage', bountyMsg);
      scene.time.delayedCall(1800, function(){ scene.registry.set('gameMessage', ''); });
    }

    scene.enemyGroup.add(e); scene.enemies.push(e);
    e._netId = opts.netId || e._netId || ('e_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5));
    
    // HP bar above enemy sprite - color coded by enemy type
    var hpBarColor = self.getHealthBarColor(e);
    var hpBg = scene.add.rectangle(0, -e.displayHeight/2 - 8, 36, 5, 0x333333).setOrigin(0.5);
    var hpFill = scene.add.rectangle(0, -e.displayHeight/2 - 8, 36, 5, hpBarColor).setOrigin(0.5);
    // Health Bar Damage Trail: shows recent damage taken as a fading red trail behind the HP bar
    var damageTrail = scene.add.rectangle(0, -e.displayHeight/2 - 8, 36, 5, 0xaa0000).setOrigin(0.5);
    damageTrail.setAlpha(0.7);
    e._hpBarBg = hpBg;
    e._hpBarFill = hpFill;
    e._hpDamageTrail = damageTrail;
    // Damage trail history: array of { damage: number, maxHp: number, timestamp: number }
    e._damageTrailHistory = [];
    // Store maxHp for trail calculations
    e._trailMaxHp = e.stats.maxHp || e.stats.hp || 60;

    if (!opts.silent && window.narrate) window.narrate('combatStart', { enemy: { name: type.name || typeKey } }).then(function(msg){ if (msg) scene.registry.set('gameMessage', msg); scene.time.delayedCall(3000, function(){ scene.registry.set('gameMessage', ''); }); });

    // Ensemble Cast: show intro dialogue for named characters
    if (ensembleChar) {
      self._showEnsembleIntro(scene, e);
    }

    // Flash KO Blindness: check if this enemy type should be blinded from previous KO
    self.applyBlindnessToEnemy(e);

    // Rival Echo System: apply ghost aura to echo enemies
    if (e.type && e.type.isRivalEcho) {
      self.applyRivalEchoAura(e, scene);
    }

    // Enemy Role Call: create icon above enemy based on role
    e._roleIconBase = self.getRoleIcon(e);
    var roleIcon = scene.add.text(0, 0, e._roleIconBase, {
      fontSize: '14px',
      fontFamily: 'Arial'
    });
    roleIcon.setOrigin(0.5);
    roleIcon.setAlpha(0.85);
    roleIcon.setDepth(e.depth + 1);
    e._roleIcon = roleIcon;
    e._roleIconLastText = e._roleIconBase;

    return e;
  },
  spawnForRoom: function(scene, roomId) {
    if (window.MMA && MMA.Network && typeof MMA.Network.isClient === 'function' && MMA.Network.isClient()) return;
    var DT = CONFIG.DISPLAY_TILE;
    var positions = MMA.Zones.getRoomSpawnPositions(roomId || scene.currentRoomId);
    var pool = (MMA.Zones.getRoomEnemyPool(roomId || scene.currentRoomId) || []).slice();

    // Ring Rust: check if player has ring rust (inactive for 3+ days)
    // Only check once per scene load (not on every room)
    if (!scene._ringRustChecked) {
      scene._ringRustChecked = true;
      this.checkRingRust(scene);
    }

    // Rival System: small chance to replace one spawn with the Shadow Rival in zone 2+
    // (We don't touch zones.js; we inject here so it works everywhere.)
    var z = scene.currentZone || 1;
    if (z >= 2 && positions && positions.length && pool && pool.length) {
      var chance = Math.min(0.08 + (z - 2) * 0.03, 0.18); // 8% in zone2 → up to 18%
      if (Math.random() < chance) {
        var replaceIdx = Math.floor(Math.random() * pool.length);
        pool[replaceIdx] = 'shadowRival';
      }
    }

    // Feint Master: small chance to spawn in zone 2+ (do not replace bosses or shadowRival)
    if (z >= 2 && positions && positions.length && pool && pool.length) {
      var feintChance = 0.06 + (z - 2) * 0.02; // 6% in zone2 → up to 10%
      if (Math.random() < feintChance) {
        var replaceIdx = Math.floor(Math.random() * pool.length);
        // Only replace if not boss and not already shadowRival
        var currentType = pool[replaceIdx];
        if (currentType !== 'mmaChamp' && currentType !== 'shadowRival') {
          pool[replaceIdx] = 'feintMaster';
        }
      }
    }

    // Bully AI: uncommon spawn in zone 2+ (replaces a non-boss spawn)
    if (z >= 2 && positions && positions.length && pool && pool.length) {
      var bullyChance = 0.07 + (z - 2) * 0.02; // 7% in zone2 → up to 11%
      if (Math.random() < bullyChance) {
        var replaceIdx = Math.floor(Math.random() * pool.length);
        var currentType = pool[replaceIdx];
        if (currentType !== 'mmaChamp' && currentType !== 'shadowRival' && currentType !== 'coach') {
          pool[replaceIdx] = 'bully';
        }
      }
    }

    // Gimmick Specialist: Regenerator spawn (zone 2+) (replaces a non-boss spawn)
    if (z >= 2 && positions && positions.length && pool && pool.length) {
      var regenChance = 0.06 + (z - 2) * 0.015; // 6% in zone2 → up to ~9%
      if (Math.random() < regenChance) {
        var replaceIdx = Math.floor(Math.random() * pool.length);
        var currentType = pool[replaceIdx];
        if (currentType !== 'mmaChamp' && currentType !== 'shadowRival' && currentType !== 'coach') {
          pool[replaceIdx] = 'regenerator';
        }
      }
    }

    // Tutor Enemy: rare spawn in zone 2+ (replaces a non-boss spawn)
    if (z >= 2 && positions && positions.length && pool && pool.length) {
      var tutorChance = 0.05 + (z - 2) * 0.01; // 5% in zone2 → up to 7%
      if (Math.random() < tutorChance) {
        var replaceIdx = Math.floor(Math.random() * pool.length);
        var currentType = pool[replaceIdx];
        if (currentType !== 'mmaChamp' && currentType !== 'shadowRival' && currentType !== 'coach') {
          pool[replaceIdx] = 'tutor';
        }
      }
    }

    // Gimmick Specialist: Glitcher spawn (zone 2+) (replaces a non-boss spawn)
    if (z >= 2 && positions && positions.length && pool && pool.length) {
      var glitchChance = 0.05 + (z - 2) * 0.015; // 5% in zone2 → up to ~8%
      if (Math.random() < glitchChance) {
        var replaceIdx = Math.floor(Math.random() * pool.length);
        var currentType = pool[replaceIdx];
        if (currentType !== 'mmaChamp' && currentType !== 'shadowRival' && currentType !== 'coach' && currentType !== 'tutor') {
          pool[replaceIdx] = 'glitcher';
        }
      }
    }

    // Trickster: special enemy that vanishes and reappears behind player (zone 2+)
    if (z >= 2 && positions && positions.length && pool && pool.length) {
      var tricksterChance = 0.04 + (z - 2) * 0.015; // 4% in zone2 → up to ~7%
      if (Math.random() < tricksterChance) {
        var replaceIdx = Math.floor(Math.random() * pool.length);
        var currentType = pool[replaceIdx];
        if (currentType !== 'mmaChamp' && currentType !== 'shadowRival' && currentType !== 'coach' && currentType !== 'tutor' && currentType !== 'glitcher') {
          pool[replaceIdx] = 'trickster';
        }
      }
    }

    // Drunk Monk: rare spawn in zone 2+ (unpredictable AI)
    if (z >= 2 && positions && positions.length && pool && pool.length) {
      var monkChance = 0.04 + (z - 2) * 0.015; // 4% zone2 up to ~9%
      if (Math.random() < monkChance) {
        var replaceIdx = Math.floor(Math.random() * pool.length);
        var currentType = pool[replaceIdx];
        if (currentType !== 'mmaChamp' && currentType !== 'shadowRival' && currentType !== 'coach') {
          pool[replaceIdx] = 'drunkMonk';
        }
      }
    }
    // Echo Enemy: rare spawn in zone 3+ (records player attacks and plays them back)
    if (z >= 3 && positions && positions.length && pool && pool.length) {
      var echoChance = 0.04 + (z - 3) * 0.015; // 4% in zone3 → up to ~7%
      if (Math.random() < echoChance) {
        var replaceIdx = Math.floor(Math.random() * pool.length);
        var currentType = pool[replaceIdx];
        if (currentType !== 'mmaChamp' && currentType !== 'shadowRival' && currentType !== 'coach' && currentType !== 'tutor' && currentType !== 'glitcher') {
          pool[replaceIdx] = 'echo';
        }
      }
    }

    // Temperamental Enforcer: uncommon spawn in zone 2+ (enrages when allies die)
    if (z >= 2 && positions && positions.length && pool && pool.length) {
      var enforcerChance = 0.06 + (z - 2) * 0.02; // 6% in zone2 → up to 10%
      if (Math.random() < enforcerChance) {
        var replaceIdx = Math.floor(Math.random() * pool.length);
        var currentType = pool[replaceIdx];
        if (currentType !== 'mmaChamp' && currentType !== 'shadowRival' && currentType !== 'coach' && currentType !== 'tutor' && currentType !== 'glitcher' && currentType !== 'echo') {
          pool[replaceIdx] = 'enforcer';
        }
      }
    }

    // Tank: uncommon spawn in zone 2+ (slow heavy hitter, high defense)
    if (z >= 2 && positions && positions.length && pool && pool.length) {
      var tankChance = 0.05 + (z - 2) * 0.015; // 5% in zone2 → up to ~8%
      if (Math.random() < tankChance) {
        var replaceIdx = Math.floor(Math.random() * pool.length);
        var currentType = pool[replaceIdx];
        if (currentType !== 'mmaChamp' && currentType !== 'shadowRival' && currentType !== 'coach' && currentType !== 'tutor' && currentType !== 'glitcher' && currentType !== 'echo' && currentType !== 'enforcer') {
          pool[replaceIdx] = 'tank';
        }
      }
    }

    // Showstopper: rare boss variant in zone 3+ that pauses player mid-attack
    // Clockwork gears appear around enemy, time "stops" for 1 second
    if (z >= 3 && positions && positions.length && pool && pool.length) {
      var showstopperChance = 0.03 + (z - 3) * 0.01; // 3% in zone3 → up to ~5%
      if (Math.random() < showstopperChance) {
        var replaceIdx = Math.floor(Math.random() * pool.length);
        var currentType = pool[replaceIdx];
        if (currentType !== 'mmaChamp' && currentType !== 'shadowRival' && currentType !== 'coach' && currentType !== 'tutor' && currentType !== 'glitcher' && currentType !== 'echo' && currentType !== 'enforcer' && currentType !== 'tank') {
          pool[replaceIdx] = 'showstopper';
        }
      }
    }

    // Blood Money Bounty: Bounty Hunter spawn based on player bounty level
    // Bounty hunters appear when player has accumulated bounty from boss defeats
    var bountyLevel = this.getBountyLevel();
    if (bountyLevel > 0 && positions && positions.length && pool && pool.length) {
      var bountyChance = 0.12 + (bountyLevel * 0.04); // 12% base + 4% per level
      bountyChance = Math.min(bountyChance, 0.45); // Cap at 45%
      if (Math.random() < bountyChance) {
        var replaceIdx = Math.floor(Math.random() * pool.length);
        var currentType = pool[replaceIdx];
        // Only replace non-boss enemies
        if (currentType !== 'mmaChamp' && currentType !== 'shadowRival' && currentType !== 'coach') {
          pool[replaceIdx] = 'bountyHunter';
        }
      }
    }

    for (var i=0; i<positions.length; i++) this.spawnEnemy(scene, pool[i % pool.length], positions[i].col * DT + DT/2, positions[i].row * DT + DT/2);

    // Initialize Tag Team pairings for this room after spawns.
    this._ensureTagTeams(scene);
  },
  spawnBoss: function(scene, x, y) { return this.spawnEnemy(scene, 'mmaChamp', x, y); },
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
    scene.enemies.forEach(function(e) { e.hasAttackToken = (scene._enemyAttackToken && e === scene._enemyAttackToken.enemy); });

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
};
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
    // Submission state with escape mechanic
    if (enemy.aiState === 'submitting') {
      enemy.setVelocity(0,0);
      enemy.submitTimer -= dt;
      // Damage over time to player
      if (player && player.stats) player.stats.hp -= Math.floor(enemy.type.attackDamage * 0.4 * (dt/1000) * (window.MMA.Enemies.getTerritoryAttackMultiplier ? window.MMA.Enemies.getTerritoryAttackMultiplier(enemy, scene) : 1));
      // Escape handling: player can mash Space (or any key) to escape
      if (scene && scene.input && scene.input.keyboard) {
        var space = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        if (Phaser.Input.Keyboard.JustDown(space) || space.isDown) {
          enemy.escapeMeter++;
        }
        // Threshold for escape (e.g., 5 presses)
        if (enemy.escapeMeter >= 5) {
          // Escape succeeded
          enemy.aiState = 'reset';
          enemy.resetTimer = 500;
          enemy.escapeMeter = 0;
          MMA.UI.showDamageText(scene, enemy.x, enemy.y - 30, 'ESCAPED!', '#00ff00');
          scene.registry.set('gameMessage', 'You escaped the submission!');
          scene.time.delayedCall(1500, function(){ scene.registry.set('gameMessage', ''); });
          return; // exit early
        }
      }
      if (enemy.submitTimer <= 0) {
        // Submission completed without escape
        enemy.aiState = 'reset';
        enemy.resetTimer = 500;
        // Apply big damage burst to player
        if (player && player.stats) player.stats.hp -= Math.max(10, Math.floor(enemy.type.attackDamage * 2 * (window.MMA.Enemies.getTerritoryAttackMultiplier ? window.MMA.Enemies.getTerritoryAttackMultiplier(enemy, scene) : 1)));
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
          MMA.UI.showDamageText(scene, player.x, player.y - 40, 'SUBMISSION!', '#ff00ff');
          scene.registry.set('gameMessage', 'Submission! Mash Space!');
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

window.MMA.Enemies.ENSEMBLE_CAST = {
  CHARACTERS: {
    'iron_jaw_joe': {
      name: 'Iron Jaw Joe',
      backstory: 'Took a record 47 unanswered punches in the underground circuit before going pro.',
      baseType: 'striker',
      zone: 1,
      uniqueTrait: 'extraToughChin',
      color: 0xcc8844,
      voiceLines: {
        start: ["Ready to throw in the towel?", "Lets see what you have got.", "My jaw has been waiting for this."],
        hit: ["Is that all you got?", "Tickles me, really.", "My grandmother hits harder."],
        lowHp: ["Alright, you are earning my respect.", "Now we are talking!", "Finally, a real fight!"],
        ko: ["Guess... I am human after all.", "Respect... fighter.", "You will remember this one."]
      },
      spawnChance: 0.12
    },
    'snake_bite_sally': {
      name: 'Snake-Bite Sally',
      backstory: 'Ex-poison striker who learned to fight in the Everglades. Her quick strikes leave opponents seeing double.',
      baseType: 'striker',
      zone: 1,
      uniqueTrait: 'venomStrike',
      color: 0x44aa44,
      voiceLines: {
        start: ["Slithering in for the kill.", "Hope you are not allergic to venom.", "Lets dance, prey."],
        hit: ["That is just a taste!", "Poison working?", "Feel the toxins sink in."],
        lowHp: ["You are tougher than expected...", "Fine, I will use REAL venom.", "Last chance to surrender!"],
        ko: ["Could not... escape... the snake.", "Snake... wins... eventually.", "You will... pay... for this."]
      },
      spawnChance: 0.10
    },
    'crusher_carl': {
      name: 'Crusher Carl',
      backstory: 'Former construction worker who crushed his way through amateur circuits.',
      baseType: 'wrestler',
      zone: 2,
      uniqueTrait: 'crushingGrip',
      color: 0x8844aa,
      voiceLines: {
        start: ["You ready to get crushed?", "Carl gonna make a believer out of you.", "Hold still, this wont hurt much."],
        hit: ["How is that feel?", "Bones creaking yet?", "Tap out before I squeeze!"],
        lowHp: ["You are stronger than you look!", "Alright, I respect that!", "Final warning - TAP OUT!"],
        ko: ["Could not... breathe...", "You earned... this.", "Carl remembers... you."]
      },
      spawnChance: 0.08
    },
    'the_professor': {
      name: 'The Professor',
      backstory: 'PhD in combat theory who fights as a hobby. Analyzes your patterns mid-fight.',
      baseType: 'tutor',
      zone: 2,
      uniqueTrait: 'patternAnalysis',
      color: 0x4488cc,
      voiceLines: {
        start: ["Interesting. Lets test hypothesis #47.", "Data suggests you will lose.", "I will learn from your technique."],
        hit: ["Fascinating. Adjusting parameters.", "Theory confirmed.", "Pattern recognized - exploited."],
        lowHp: ["Unexpected variance! Fascinating!", "You are exceeding all projections!", "Most impressive data set."],
        ko: ["Hypothesis... invalidated.", "You are an anomaly.", "Fascinating conclusion."]
      },
      spawnChance: 0.06
    },
    'mad_dog_marcus': {
      name: 'Mad Dog Marcus',
      backstory: 'Earned his nickname after a 12-round brawl with two broken hands. Never backs down.',
      baseType: 'bully',
      zone: 2,
      uniqueTrait: 'berserkerRage',
      color: 0xff4444,
      voiceLines: {
        start: ["I am gonna enjoy this!", "Finally, someone who will actually FIGHT!", "You think you can take me?!"],
        hit: ["THAT IS WHAT I AM TALKING ABOUT!", "MORE! GIVE ME MORE!", "IS THAT ALL YOU HAVE GOT?!"],
        lowHp: ["GOOD! NOW WE ARE EVEN!", "I LOVE THIS FEELING!", "YEAH, YEAH, YEAH!!!"],
        ko: ["Could not stop... did not want to.", "Worth every punch.", "Remember this fight."]
      },
      spawnChance: 0.09
    },
    'phantom_fist': {
      name: 'Phantom Fist',
      backstory: 'Mysterious striker who claims to have trained in a ghost dojo.',
      baseType: 'feintMaster',
      zone: 3,
      uniqueTrait: 'phaseStrike',
      color: 0xaaaaaa,
      voiceLines: {
        start: ["Can you see what is coming?", "I am already behind you.", "Ghosts do not miss."],
        hit: ["Did not feel that, did you?", "Phases right through.", "The ghost strikes unseen."],
        lowHp: ["Finally, a challenge!", "You are earning my attention.", "Lets get serious."],
        ko: ["Rest in peace.", "Ghost prevails.", "You saw nothing."]
      },
      spawnChance: 0.05
    },
    'gravedigger_gus': {
      name: 'Gravedigger Gus',
      backstory: 'Dug his own grave before every fight. Knows when opponents are about to strike.',
      baseType: 'bjjBlackBelt',
      zone: 3,
      uniqueTrait: 'graveSense',
      color: 0x333333,
      voiceLines: {
        start: ["I have dug a hole for you.", "This one is going in the ground.", "Know your place - six feet under."],
        hit: ["Rest already.", "Sleep eternal.", "Going in the hole."],
        lowHp: ["Interesting. You are still breathing.", "Most go down faster.", "I will dig a bigger hole."],
        ko: ["Rest in peace.", "Another one for the grave.", "Always knew you would lose."]
      },
      spawnChance: 0.05
    },
    'flash_finley': {
      name: 'Flash Finley',
      backstory: 'Claims to be the fastest fighter alive. Never lost a decision or gone past round 2.',
      baseType: 'kickboxer',
      zone: 3,
      uniqueTrait: 'lightningSpeed',
      color: 0xffff00,
      voiceLines: {
        start: ["Blink and you will miss it!", "Ready to be embarrassed?", "Speed kills - literally."],
        hit: ["Too slow!", "Did you even see that?", "Speed of light, baby!"],
        lowHp: ["Fine, I will get SERIOUS!", "You are faster than you look!", "Finally, someone worth the effort!"],
        ko: ["Too slow...", "Could not keep up.", "Remember blink."]
      },
      spawnChance: 0.06
    }
  },

  _getEncounterKey: function(charId) {
    return 'mma_ensemble_' + charId;
  },

  recordEncounter: function(charId, scene) {
    try {
      var key = this._getEncounterKey(charId);
      var existing = localStorage.getItem(key);
      if (!existing) {
        localStorage.setItem(key, JSON.stringify({
          firstEncounter: Date.now(),
          zoneEncountered: scene ? (scene.currentZone || 1) : 1,
          defeats: 0
        }));
        return true;
      }
      var data = JSON.parse(existing);
      data.lastEncounter = Date.now();
      data.defeats = (data.defeats || 0) + 1;
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {}
    return false;
  },

  getEncounteredCharacters: function() {
    var result = [];
    try {
      var chars = this.CHARACTERS;
      Object.keys(chars).forEach(function(charId) {
        var data = localStorage.getItem('mma_ensemble_' + charId);
        if (data) {
          var parsed = JSON.parse(data);
          parsed.id = charId;
          parsed.details = chars[charId];
          result.push(parsed);
        }
      });
    } catch (e) {}
    return result;
  },

  checkEnsembleSpawn: function(scene, pool, positions) {
    var zone = scene.currentZone || 1;
    var chars = this.CHARACTERS;
    var charKeys = Object.keys(chars);

    for (var i = 0; i < charKeys.length; i++) {
      var charId = charKeys[i];
      var char = chars[charId];

      if (char.zone > zone) continue;
      if (Math.random() > char.spawnChance) continue;

      for (var j = 0; j < pool.length; j++) {
        if (pool[j] === char.baseType) {
          var charTypeKey = 'ensemble_' + charId;
          this.createEnsembleType(charId, char);
          pool[j] = charTypeKey;
          return { charId: charId, char: char, poolIndex: j };
        }
      }
    }
    return null;
  },

  createEnsembleType: function(charId, char) {
    var baseType = window.MMA.Enemies.TYPES[char.baseType];
    if (!baseType) return;

    var typeKey = 'ensemble_' + charId;
    if (window.MMA.Enemies.TYPES[typeKey]) return;

    window.MMA.Enemies.TYPES[typeKey] = {
      name: char.name,
      hp: Math.round(baseType.hp * 1.3),
      maxHp: Math.round(baseType.hp * 1.3),
      speed: Math.round(baseType.speed * 1.1),
      attackDamage: Math.round(baseType.attackDamage * 1.2),
      attackCooldownMax: baseType.attackCooldownMax,
      attackRange: baseType.attackRange,
      chaseRange: baseType.chaseRange,
      color: char.color,
      xpReward: Math.round(baseType.xpReward * 1.5),
      teachesMove: null,
      zone: char.zone,
      aiPattern: baseType.aiPattern,
      groundDefense: baseType.groundDefense || 0.3,
      groundEscape: baseType.groundEscape || 0.25,
      isEnsemble: true,
      ensembleId: charId,
      uniqueTrait: char.uniqueTrait
    };
  },

  getVoiceLine: function(charId, category) {
    var char = this.CHARACTERS[charId];
    if (!char || !char.voiceLines || !char.voiceLines[category]) return null;
    var lines = char.voiceLines[category];
    return lines[Math.floor(Math.random() * lines.length)];
  },

  speak: function(enemy, scene, category) {
    if (!enemy || !enemy.type || !enemy.type.isEnsemble) return;

    var charId = enemy.type.ensembleId;
    var line = this.getVoiceLine(charId, category);

    if (line && MMA.UI && MMA.UI.showDamageText) {
      MMA.UI.showDamageText(scene, enemy.x, enemy.y - 60, '"' + line + '"', '#ffffff');
    }
    return line;
  }
};

var _originalSpawnForRoom = window.MMA.Enemies.spawnForRoom;
window.MMA.Enemies.spawnForRoom = function(scene, roomId) {
  var positions = MMA.Zones.getRoomSpawnPositions(roomId || scene.currentRoomId);
  var pool = (MMA.Zones.getRoomEnemyPool(roomId || scene.currentRoomId) || []).slice();

  var ensembleResult = null;
  if (positions && positions.length && pool && pool.length) {
    ensembleResult = window.MMA.Enemies.ENSEMBLE_CAST.checkEnsembleSpawn(scene, pool, positions);
  }

  _originalSpawnForRoom.call(this, scene, roomId);

  if (ensembleResult && scene.enemies && scene.enemies.length > 0) {
    var lastEnemy = scene.enemies[scene.enemies.length - 1];
    if (lastEnemy && lastEnemy.type) {
      lastEnemy.type.isEnsemble = true;
      lastEnemy.type.ensembleId = ensembleResult.charId;
      lastEnemy.type.ensembleChar = ensembleResult.char;

      if (ensembleResult.char.uniqueTrait === 'extraToughChin') {
        lastEnemy.stats.maxHp = Math.round(lastEnemy.stats.maxHp * 1.2);
        lastEnemy.stats.hp = lastEnemy.stats.maxHp;
      } else if (ensembleResult.char.uniqueTrait === 'venomStrike') {
        lastEnemy._hasVenom = true;
      } else if (ensembleResult.char.uniqueTrait === 'crushingGrip') {
        lastEnemy._crushingGrip = true;
      } else if (ensembleResult.char.uniqueTrait === 'patternAnalysis') {
        lastEnemy._patternAnalysis = true;
        lastEnemy.attackSpeedMod = 0.8;
      } else if (ensembleResult.char.uniqueTrait === 'berserkerRage') {
        lastEnemy._berserkerRage = true;
      }

      var isFirst = window.MMA.Enemies.ENSEMBLE_CAST.recordEncounter(ensembleResult.charId, scene);

      if (isFirst) {
        window.MMA.Enemies.ENSEMBLE_CAST.speak(lastEnemy, scene, 'start');
        scene.registry.set('gameMessage', 'NEW CHARACTER: ' + ensembleResult.char.name + '!');
        scene.time.delayedCall(2500, function() { scene.registry.set('gameMessage', ''); });
      }
    }
  }
};

var _originalDamagePlayer = window.MMA.Enemies.damagePlayer;
window.MMA.Enemies.damagePlayer = function(attackerEnemy, scene, dmg) {
  if (_originalDamagePlayer) {
    _originalDamagePlayer.call(this, attackerEnemy, scene, dmg);
  } else if (typeof MMA !== 'undefined' && MMA.Player && typeof MMA.Player.damage === 'function') {
    MMA.Player.damage(scene, dmg);
  }

  if (attackerEnemy && attackerEnemy.type && attackerEnemy.type.isEnsemble) {
    if (Math.random() < 0.15) {
      var hp = attackerEnemy.stats ? attackerEnemy.stats.hp : 1;
      var maxHp = attackerEnemy.stats ? attackerEnemy.stats.maxHp : 1;
      var category = (hp / maxHp <= 0.3) ? 'lowHp' : 'hit';
      window.MMA.Enemies.ENSEMBLE_CAST.speak(attackerEnemy, scene, category);
    }
  }
};

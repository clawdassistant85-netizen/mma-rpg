window.MMA = window.MMA || {};
window.MMA.Enemies = window.MMA.Enemies || {};
Object.assign(window.MMA.Enemies, {

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



  _inferWeightClassFromBase: function(baseTypeKey, typeKey) {
    var k = baseTypeKey || typeKey;
    // Heavy hitters / tanks
    if (k === 'barBrawler' || k === 'wrestler' || k === 'bjjBlackBelt' || k === 'enforcer' || k === 'tank' || k === 'showstopper' || k === 'shadowRival' || k === 'mmaChamp') return 'heavy';
    // Light/fast archetypes
    if (k === 'streetThug' || k === 'striker' || k === 'kickboxer' || k === 'muayThaiFighter' || k === 'coach' || k === 'drunkMonk' || k === 'feintMaster' || k === 'glitcher' || k === 'trickster') return 'light';
    // Default
    return 'medium';
  },



  // Apply weight class + stat tradeoffs to the type object (idempotent).
  applyWeightReadToType: function(type, baseTypeKey, typeKey) {
    if (!this.WEIGHT_READ || !this.WEIGHT_READ.ENABLED) return type;
    if (!type || type._weightReadApplied) return type;

    type.weightClass = type.weightClass || this._inferWeightClassFromBase(baseTypeKey, typeKey);
    var cls = type.weightClass;
    var cfg = (cls === 'heavy') ? this.WEIGHT_READ.HEAVY : (cls === 'light') ? this.WEIGHT_READ.LIGHT : this.WEIGHT_READ.MEDIUM;

    type.hp = Math.max(1, Math.round(type.hp * cfg.hpMult));
    type.maxHp = type.hp;
    type.attackDamage = Math.max(1, Math.round(type.attackDamage * cfg.dmgMult));
    type.speed = Math.max(10, Math.round(type.speed * cfg.speedMult));

    type._weightReadApplied = true;
    return type;
  },



  _getAttackWeightClass: function(moveKey) {
    var cfg = this.WEIGHT_CLASS_ADVANTAGE;
    if (!cfg || !cfg.ENABLED || !moveKey) return 'medium';
    if (cfg.LIGHT_MOVES && cfg.LIGHT_MOVES[moveKey]) return 'light';
    if (cfg.HEAVY_MOVES && cfg.HEAVY_MOVES[moveKey]) return 'heavy';
    return 'medium';
  },



  // Returns defense multiplier based on enemy weight class and move weight (lower = more damage).
  getWeightClassDefenseMult: function(enemy, moveKey, scene) {
    var cfg = this.WEIGHT_CLASS_ADVANTAGE;
    if (!cfg || !cfg.ENABLED) return 1;
    if (!enemy || !enemy.type || !enemy.type.weightClass) return 1;

    var enemyW = enemy.type.weightClass;
    var moveW = this._getAttackWeightClass(moveKey);
    if (enemyW === 'medium' || moveW === 'medium') return 1;

    var dmgMult = 1;
    if (moveW === 'light') {
      if (enemyW === 'heavy') dmgMult = cfg.LIGHT_ATTACK_VS_HEAVY;
      else if (enemyW === 'light') dmgMult = cfg.LIGHT_ATTACK_VS_LIGHT;
    } else if (moveW === 'heavy') {
      if (enemyW === 'light') dmgMult = cfg.HEAVY_ATTACK_VS_LIGHT;
      else if (enemyW === 'heavy') dmgMult = cfg.HEAVY_ATTACK_VS_HEAVY;
    }

    // Cosmetic feedback (throttled per enemy).
    try {
      if (dmgMult !== 1 && scene && typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
        var now = Date.now();
        var cd = cfg.FEEDBACK_COOLDOWN_MS || 900;
        if (!enemy._weightAdvToastAt || (now - enemy._weightAdvToastAt) >= cd) {
          enemy._weightAdvToastAt = now;
          MMA.UI.showDamageText(scene, enemy.x, enemy.y - 70, cfg.FEEDBACK_TEXT, cfg.FEEDBACK_COLOR || '#ffffff');
        }
      }
    } catch (e) {}

    // Translate damage multiplier into defense multiplier.
    return (dmgMult && dmgMult !== 0) ? (1 / dmgMult) : 1;
  },



  getWeightIconForEnemy: function(enemy) {
    if (!enemy || !enemy.type) return null;
    var cls = enemy.type.weightClass || 'medium';
    return (this.WEIGHT_READ && this.WEIGHT_READ.ICONS) ? (this.WEIGHT_READ.ICONS[cls] || this.WEIGHT_READ.ICONS.medium) : null;
  },



  updateWeightIcons: function(scene) {
    if (!scene || !scene.enemies) return;
    var self = this;
    scene.enemies.forEach(function(enemy) {
      if (!enemy || !enemy._weightIcon) return;
      enemy._weightIcon.x = enemy.x;
      enemy._weightIcon.y = enemy.y - enemy.displayHeight/2 - 32;
      // Weight class shouldn't change, but if it did, keep text updated.
      var t = self.getWeightIconForEnemy(enemy) || '';
      if (t !== enemy._weightIconLastText) {
        enemy._weightIcon.setText(t);
        enemy._weightIconLastText = t;
      }
      enemy._weightIcon.setVisible(enemy.active && enemy.state !== 'dead');
    });
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

    // Opponent Weight Read: assign weight class + apply small stat tradeoffs (light/medium/heavy).
    type = self.applyWeightReadToType(type, baseTypeKey, typeKey);

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

    // Opponent Weight Read: icon above the role icon for quick threat profile reading.
    if (self.WEIGHT_READ && self.WEIGHT_READ.ENABLED) {
      var wIconTxt = self.getWeightIconForEnemy(e);
      var wIcon = scene.add.text(0, 0, wIconTxt || '', {
        fontSize: '13px',
        fontFamily: 'Arial'
      });
      wIcon.setOrigin(0.5);
      wIcon.setAlpha(0.85);
      wIcon.setDepth(e.depth + 1);
      e._weightIcon = wIcon;
      e._weightIconLastText = wIconTxt;
    }

    return e;
  },

  // Feature 1: Style Translator functions
  recordEnemyDefeat: function(enemyKey) {
    try {
      var counts = JSON.parse(localStorage.getItem('mma_enemy_defeats') || '{}');
      counts[enemyKey] = (counts[enemyKey] || 0) + 1;
      localStorage.setItem('mma_enemy_defeats', JSON.stringify(counts));
      return counts[enemyKey];
    } catch(e) { return 0; }
  },

  getTranslatorLevel: function(enemyKey) {
    try {
      var counts = JSON.parse(localStorage.getItem('mma_enemy_defeats') || '{}');
      var n = counts[enemyKey] || 0;
      if (n >= 15) return 3;
      if (n >= 10) return 2;
      if (n >= 5)  return 1;
      return 0;
    } catch(e) { return 0; }
  },

  getTranslatorWindowMs: function(enemyKey) {
    var level = MMA.Enemies.getTranslatorLevel(enemyKey);
    return level * 100;
  },

  // Feature 2: Fear Memory
  recordEnemyKnockdown: function(enemyKey, moveKey) {
    try {
      var fears = JSON.parse(localStorage.getItem('mma_enemy_fears') || '{}');
      if (!fears[enemyKey]) fears[enemyKey] = {};
      fears[enemyKey][moveKey] = (fears[enemyKey][moveKey] || 0) + 1;
      localStorage.setItem('mma_enemy_fears', JSON.stringify(fears));
    } catch(e) {}
  },

  getFearMultiplier: function(enemyKey, moveKey) {
    try {
      var fears = JSON.parse(localStorage.getItem('mma_enemy_fears') || '{}');
      var enemyFears = fears[enemyKey] || {};
      var topFear = Object.keys(enemyFears).sort(function(a,b){ return enemyFears[b]-enemyFears[a]; })[0];
      if (topFear && topFear === moveKey) return 1.10;
      if (topFear && topFear !== moveKey) return 0.85;
      return 1.0;
    } catch(e) { return 1.0; }
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


  spawnBoss: function(scene, x, y) { return this.spawnEnemy(scene, 'mmaChamp', x, y); }
});

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

// Nemesis System
MMA.Enemies.recordPlayerDeath = function(killerType) {
  try {
    var deaths = JSON.parse(localStorage.getItem('mma_deaths_by_type') || '{}');
    deaths[killerType] = (deaths[killerType] || 0) + 1;
    localStorage.setItem('mma_deaths_by_type', JSON.stringify(deaths));
  } catch(e) {}
};

MMA.Enemies.getNemesisType = function() {
  try {
    var deaths = JSON.parse(localStorage.getItem('mma_deaths_by_type') || '{}');
    var max = 0, nemesis = null;
    Object.keys(deaths).forEach(function(type) {
      if (deaths[type] > max) { max = deaths[type]; nemesis = type; }
    });
    return nemesis;
  } catch(e) { return null; }
};

MMA.Enemies.applyNemesisTint = function(scene, enemy) {
  var nemType = MMA.Enemies.getNemesisType();
  if (!nemType || !enemy || !enemy.type) return;
  if (enemy.type.key !== nemType && enemy.type.behaviorType !== nemType) return;
  if (enemy._isNemesis) return;

  enemy._isNemesis = true;
  if (enemy.setTint) enemy.setTint(0x8800ff);

  // Scale stats slightly
  if (enemy.stats) {
    enemy.stats.hp = Math.round((enemy.stats.hp || 50) * 1.15);
    enemy.stats.maxHp = Math.round((enemy.stats.maxHp || 50) * 1.15);
    enemy.stats.attackDamage = Math.round((enemy.stats.attackDamage || 10) * 1.1);
  }

  // Pulse tween
  if (scene && scene.tweens) {
    scene.tweens.add({ targets: enemy, alpha: 0.7, duration: 500, yoyo: true, repeat: -1 });
  }

  // Label
  if (scene && scene.add) {
    var label = scene.add.text(enemy.x, enemy.y - 30, '⚡ NEMESIS', {
      fontSize: '8px', fontFamily: 'Arial Black', color: '#8800ff', stroke: '#000', strokeThickness: 2
    }).setDepth(30).setOrigin(0.5);
    enemy._nemesisLabel = label;
  }
};

MMA.Enemies.updateDrunkMonk = function(scene, enemy) {
  if (!enemy || !enemy.active || !enemy.type || enemy.type.key !== 'drunkMonk') return;
  if (!enemy._drunkTimer || scene.time.now > enemy._drunkTimer) {
    enemy._drunkTimer = scene.time.now + 1500 + Math.random() * 1000;
    // Random stumble
    var angle = Math.random() * Math.PI * 2;
    var spd = 40 + Math.random() * 60;
    if (enemy.body) {
      enemy.setVelocity(Math.cos(angle) * spd, Math.sin(angle) * spd);
    }
    // Occasional wild hit chance (20%)
    if (Math.random() < 0.2 && scene.player) {
      var dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, scene.player.x, scene.player.y);
      if (dist < 80) {
        var dmg = 20 + Math.floor(Math.random() * 15); // wild 20-35 damage
        if (window.MMA && MMA.Enemies && typeof MMA.Enemies.damagePlayer === 'function') {
          MMA.Enemies.damagePlayer(enemy, scene, dmg);
        }
        if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
          MMA.UI.showDamageText(scene, enemy.x, enemy.y - 20, 'WILD HIT! -' + dmg, '#886644');
        }
      }
    }
  }
};

MMA.Enemies.getZoneSpawnPool = function(zoneNum) {
  var pools = {
    1: ['brawler', 'kickboxer', 'wrestler', 'drunkMonk'],
    2: ['mmaVeteran', 'feintMaster', 'judoka', 'sumoWrestler', 'drunkMonk'],
    3: ['capoeira', 'speedster', 'feintMaster', 'kickboxingChampion'],
    4: ['mmaVeteran', 'kickboxingChampion', 'feintMaster', 'shadow']
  };
  return pools[zoneNum] || pools[1];
};

(function() {
  var _spawnForRoomZonePool = MMA.Enemies.spawnForRoom;
  if (typeof _spawnForRoomZonePool !== 'function') return;

  MMA.Enemies.spawnForRoom = function(scene, roomId) {
    if (scene && MMA && MMA.Zones && typeof MMA.Zones.getRoomEnemyPool === 'function') {
      var _origGetRoomEnemyPool = MMA.Zones.getRoomEnemyPool;
      try {
        MMA.Zones.getRoomEnemyPool = function(targetRoomId) {
          var basePool = (_origGetRoomEnemyPool.call(MMA.Zones, targetRoomId) || []).slice();
          var zoneNum = (scene && scene.currentZone) || 1;
          var zonePool = (MMA.Enemies.getZoneSpawnPool && MMA.Enemies.getZoneSpawnPool(zoneNum)) || [];
          if (!zonePool.length) return basePool;

          var allowed = {};
          for (var i = 0; i < zonePool.length; i++) allowed[zonePool[i]] = true;

          var filtered = [];
          for (var j = 0; j < basePool.length; j++) {
            if (allowed[basePool[j]]) filtered.push(basePool[j]);
          }

          return filtered.length ? filtered : basePool;
        };

        return _spawnForRoomZonePool.call(this, scene, roomId);
      } finally {
        MMA.Zones.getRoomEnemyPool = _origGetRoomEnemyPool;
      }
    }

    return _spawnForRoomZonePool.call(this, scene, roomId);
  };
})();

(function() {
  var _origUpdateRoleIcons = MMA.Enemies.updateRoleIcons;
  if (typeof _origUpdateRoleIcons !== 'function') return;

  MMA.Enemies.updateRoleIcons = function(scene, delta) {
    _origUpdateRoleIcons.call(this, scene, delta);
    if (!scene || !scene.enemies || typeof this.updateDrunkMonk !== 'function') return;
    scene.enemies.forEach(function(enemy) {
      MMA.Enemies.updateDrunkMonk(scene, enemy);
    });
  };
})();

// === OPPONENT STYLE TRANSLATOR ===
MMA.Enemies.recordEnemyDefeat = MMA.Enemies.recordEnemyDefeat || function(enemyKey) {
  try {
    var c = JSON.parse(localStorage.getItem('mma_enemy_defeats') || '{}');
    c[enemyKey] = (c[enemyKey] || 0) + 1;
    localStorage.setItem('mma_enemy_defeats', JSON.stringify(c));
    return c[enemyKey];
  } catch(e) { return 0; }
};
MMA.Enemies.getTranslatorLevel = MMA.Enemies.getTranslatorLevel || function(enemyKey) {
  try {
    var c = JSON.parse(localStorage.getItem('mma_enemy_defeats') || '{}');
    var n = c[enemyKey] || 0;
    if (n >= 15) return 3;
    if (n >= 10) return 2;
    if (n >= 5) return 1;
    return 0;
  } catch(e) { return 0; }
};
MMA.Enemies.getTranslatorWindowMs = MMA.Enemies.getTranslatorWindowMs || function(enemyKey) {
  return MMA.Enemies.getTranslatorLevel(enemyKey) * 100;
};

// === OPPONENT FEAR MEMORY ===
MMA.Enemies.recordEnemyKnockdown = MMA.Enemies.recordEnemyKnockdown || function(enemyKey, moveKey) {
  try {
    var fears = JSON.parse(localStorage.getItem('mma_enemy_fears') || '{}');
    if (!fears[enemyKey]) fears[enemyKey] = {};
    fears[enemyKey][moveKey] = (fears[enemyKey][moveKey] || 0) + 1;
    localStorage.setItem('mma_enemy_fears', JSON.stringify(fears));
  } catch(e) {}
};
MMA.Enemies.getFearMultiplier = MMA.Enemies.getFearMultiplier || function(enemyKey, moveKey) {
  try {
    var fears = JSON.parse(localStorage.getItem('mma_enemy_fears') || '{}');
    var ef = fears[enemyKey] || {};
    var top = Object.keys(ef).sort(function(a,b){ return ef[b]-ef[a]; })[0];
    if (top && top === moveKey) return 1.10;
    if (top && top !== moveKey) return 0.85;
    return 1.0;
  } catch(e) { return 1.0; }
};

// === ENEMY MUTATION CHAMBER ===
MMA.Enemies.checkMutation = MMA.Enemies.checkMutation || function(enemyKey, scene) {
  try {
    var muts = JSON.parse(localStorage.getItem('mma_enemy_mutations') || '{}');
    var zone = scene && scene.currentZone || 1;
    if (muts[enemyKey] && muts[enemyKey].zone === zone) return false;
    if (Math.random() < 0.1) {
      if (!muts[enemyKey]) muts[enemyKey] = {};
      muts[enemyKey].mutated = true;
      muts[enemyKey].zone = zone + 1;
      localStorage.setItem('mma_enemy_mutations', JSON.stringify(muts));
      return true;
    }
  } catch(e) {}
  return false;
};
MMA.Enemies.isMutated = MMA.Enemies.isMutated || function(enemyKey, scene) {
  try {
    var muts = JSON.parse(localStorage.getItem('mma_enemy_mutations') || '{}');
    var m = muts[enemyKey];
    return !!(m && m.mutated && m.zone === (scene && scene.currentZone || 1));
  } catch(e) { return false; }
};
MMA.Enemies.applyMutationVisual = MMA.Enemies.applyMutationVisual || function(scene, enemy) {
  if (!enemy || !enemy.type) return;
  if (!MMA.Enemies.isMutated(enemy.type.key, scene)) return;
  if (enemy._mutationApplied) return;
  enemy._mutationApplied = true;
  if (enemy.setScale) enemy.setScale(1.15);
  if (enemy.setTint) enemy.setTint(0xdd44aa);
  if (enemy.stats) {
    enemy.stats.hp = Math.round((enemy.stats.hp || 50) * 1.3);
    enemy.stats.maxHp = Math.round((enemy.stats.maxHp || 50) * 1.3);
  }
  if (enemy.type && enemy.type.stats) {
    enemy.type.stats.xpReward = Math.round((enemy.type.stats.xpReward || 20) * 2);
  }
};
// === SECRET TOURNAMENT UNLOCK ===
// After defeating 3 bosses, unlock secret tournament entry flag
MMA.EnemiesCore = window.MMA.EnemiesCore || {};

MMA.EnemiesCore.checkTournamentUnlock = MMA.EnemiesCore.checkTournamentUnlock || function(scene) {
  try {
    var save = JSON.parse(localStorage.getItem('mma_rpg_save') || '{}');
    var bosses = save.bossesDefeated || 0;
    if (bosses >= 3 && !save.tournamentUnlocked) {
      save.tournamentUnlocked = true;
      localStorage.setItem('mma_rpg_save', JSON.stringify(save));
      if (window.MMA && MMA.UI && typeof MMA.UI.queueAchievementToast === 'function') {
        MMA.UI.queueAchievementToast(scene, '🏆 SECRET TOURNAMENT UNLOCKED', '🏆');
      }
      return true;
    }
    return false;
  } catch(e) { return false; }
};

MMA.EnemiesCore.isTournamentUnlocked = MMA.EnemiesCore.isTournamentUnlocked || function() {
  try {
    var save = JSON.parse(localStorage.getItem('mma_rpg_save') || '{}');
    return !!save.tournamentUnlocked;
  } catch(e) { return false; }
};

// === ENEMY TAUNT SYSTEM ===
// Enemies taunt player at health milestones; player gains rage bonus if taunted
MMA.EnemiesCore.TAUNTS = {
  default: ['Come on!', 'Is that all?', 'Too slow!', "You'll need more than that!"],
  brawler: ['SMASH!', 'Feel the pain!', 'No mercy!'],
  feintMaster: ['Predictable...', 'Fooled again!', 'Read your moves.'],
  drunkMonk: ['Heh heh...', 'Spinning!', 'Woooo!']
};

MMA.EnemiesCore.tryEnemyTaunt = MMA.EnemiesCore.tryEnemyTaunt || function(scene, enemy) {
  if (!enemy || !scene) return;
  if (enemy._taunted) return;
  var hp = enemy.hp || 0;
  var maxHp = (enemy.stats && enemy.stats.maxHp) ? enemy.stats.maxHp : (enemy.maxHp || 100);
  var ratio = hp / maxHp;
  // Taunt at 75% HP
  if (ratio <= 0.75 && !enemy._taunt75) {
    enemy._taunt75 = true;
    MMA.EnemiesCore._doTaunt(scene, enemy);
  }
};

MMA.EnemiesCore._doTaunt = function(scene, enemy) {
  var pool = MMA.EnemiesCore.TAUNTS[enemy.type] || MMA.EnemiesCore.TAUNTS.default;
  var msg = pool[Math.floor(Math.random() * pool.length)];
  if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
    MMA.UI.showDamageText(scene, enemy.x, enemy.y - 35, msg, '#ff8800');
  }
  // Player gains +10% damage for 5s after being taunted (rage)
  var p = scene.player;
  if (p) {
    p._rageBonusUntil = Date.now() + 5000;
    if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
      MMA.UI.showDamageText(scene, p.x, p.y - 40, '😤 RAGE +10%', '#ff2200');
    }
  }
};

MMA.EnemiesCore.getRageBonus = MMA.EnemiesCore.getRageBonus || function(scene) {
  var p = scene && scene.player;
  if (p && p._rageBonusUntil && Date.now() < p._rageBonusUntil) return 1.10;
  return 1.0;
};

// === ENEMY MUTATION CHAMBER ===
// Defeated enemies evolve in next zone — track mutations per enemy type
MMA.Enemies.MUTATION_CHAMBER_KEY = 'mma_enemy_mutation_chamber';

MMA.Enemies.MUTATION_EVOLUTIONS = MMA.Enemies.MUTATION_EVOLUTIONS || {
  brawler:    { evolvedType: 'brawlerElite',   hpMult: 1.25, dmgMult: 1.20, label: '💀 EVOLVED BRAWLER',   color: 0xff2200 },
  boxer:      { evolvedType: 'boxerElite',     hpMult: 1.20, dmgMult: 1.15, label: '⚡ EVOLVED BOXER',     color: 0x4400ff },
  wrestler:   { evolvedType: 'wrestlerElite',  hpMult: 1.30, dmgMult: 1.10, label: '🔒 EVOLVED WRESTLER',  color: 0x006600 },
  kickboxer:  { evolvedType: 'kickboxerElite', hpMult: 1.20, dmgMult: 1.25, label: '🦵 EVOLVED KICKBOXER', color: 0xff6600 },
  drunkMonk:  { evolvedType: 'drunkMonkElite', hpMult: 1.15, dmgMult: 1.30, label: '🌀 SOBER MONK',        color: 0xaa00ff },
  trickster:  { evolvedType: 'tricksterElite', hpMult: 1.10, dmgMult: 1.20, label: '🃏 MASTER TRICKSTER',  color: 0x00ffcc }
};

MMA.Enemies.recordMutationCandidate = MMA.Enemies.recordMutationCandidate || function(aiPattern) {
  try {
    var data = JSON.parse(localStorage.getItem(MMA.Enemies.MUTATION_CHAMBER_KEY) || '{}');
    data[aiPattern] = (data[aiPattern] || 0) + 1;
    localStorage.setItem(MMA.Enemies.MUTATION_CHAMBER_KEY, JSON.stringify(data));
  } catch(e) {}
};

MMA.Enemies.getMutatedEnemyMods = MMA.Enemies.getMutatedEnemyMods || function(aiPattern, zone) {
  if (zone <= 1) return null; // No mutations in zone 1
  try {
    var data = JSON.parse(localStorage.getItem(MMA.Enemies.MUTATION_CHAMBER_KEY) || '{}');
    var kills = data[aiPattern] || 0;
    if (kills < 3) return null; // Need 3+ kills to trigger mutation
    var evo = MMA.Enemies.MUTATION_EVOLUTIONS[aiPattern];
    if (!evo) return null;
    return evo;
  } catch(e) { return null; }
};

MMA.Enemies.applyMutationToEnemy = MMA.Enemies.applyMutationToEnemy || function(enemy, scene) {
  if (!enemy || !enemy.type) return false;
  var aiPattern = enemy.type.aiPattern || enemy.type.key;
  var zone = (scene && scene.currentZone) || 1;
  var evo = MMA.Enemies.getMutatedEnemyMods(aiPattern, zone);
  if (!evo) return false;

  // Apply mutation mods
  if (enemy.stats) {
    enemy.stats.hp = Math.round((enemy.stats.hp || 100) * evo.hpMult);
    enemy.stats.maxHp = Math.round((enemy.stats.maxHp || 100) * evo.hpMult);
  }
  if (enemy.type) {
    enemy.type.attackDamage = Math.round((enemy.type.attackDamage || 10) * evo.dmgMult);
  }
  enemy._isMutated = true;
  enemy._mutationColor = evo.color;

  // Visual indicator
  if (scene && scene.add && enemy.sprite) {
    enemy.sprite.setTint(evo.color);
  }
  if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
    MMA.UI.showDamageText(scene, enemy.x, enemy.y - 40, evo.label, '#' + evo.color.toString(16).padStart(6,'0'));
  }
  return true;
};

// === ENEMY MOVE HISTORY TRACKING ===
// Track player's most-used moves for faction counter-intelligence
MMA.Enemies.recordPlayerMoveHistory = MMA.Enemies.recordPlayerMoveHistory || function(moveKey) {
  try {
    var hist = JSON.parse(localStorage.getItem('mma_move_history') || '{}');
    hist[moveKey] = (hist[moveKey] || 0) + 1;
    localStorage.setItem('mma_move_history', JSON.stringify(hist));
  } catch(e) {}
};

MMA.Enemies.getPlayerTopMoves = MMA.Enemies.getPlayerTopMoves || function(n) {
  try {
    var hist = JSON.parse(localStorage.getItem('mma_move_history') || '{}');
    return Object.keys(hist).sort(function(a,b){ return (hist[b]||0)-(hist[a]||0); }).slice(0, n || 3);
  } catch(e) { return []; }
};

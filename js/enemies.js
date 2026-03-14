window.MMA = window.MMA || {};
window.MMA.Enemies = {
  // Helper: compute total damage multiplier for an enemy (packs, vengeance, injuries, enrage)
  getTotalDamageMultiplier: function(enemy, scene) {
    // Base pack multiplier
    var pack = (this.getPackDamageMultiplier) ? this.getPackDamageMultiplier(enemy, scene) : 1;
    // Vengeance damage multiplier
    var vengeance = (this.getVengeanceDamageMult) ? this.getVengeanceDamageMult(enemy) : 1;
    // Injury vulnerability multiplier
    var injury = (this.getInjuryDamageMultiplier) ? this.getInjuryDamageMultiplier(enemy) : 1;
    // Enrage attack bonus (converted to multiplier)
    var enrage = (enemy && enemy.isEnraged && enemy.enrageAttackBonus) ? (1 - enemy.enrageAttackBonus) : 1;
    return pack * vengeance * injury * enrage;
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

  // Called when player lands an attack - records move and returns adaptive defense multiplier
  onPlayerAttack: function(scene, enemy, moveKey) {
    this.initAdaptiveTracking(scene);
    this.recordPlayerAttack(scene, moveKey);
    var adaptiveDef = this.getAdaptiveDefense(enemy, scene);
    // Apply vengeance defense penalty (player hits harder)
    var vengeanceDef = this.getVengeanceDefenseMult(enemy);
    return adaptiveDef * vengeanceDef;
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

  // Desperation Enrage: non-boss enemies rage when below 25% HP
  ENRAGE_CONFIG: {
    HP_THRESHOLD: 0.25,        // Trigger at 25% HP
    DURATION: 2000,           // 2 second enrage duration
    COOLDOWN: 8000,           // 8 second cooldown between enrages
    SPEED_BONUS: 0.25,        // +25% move speed
    ATTACK_SPEED_BONUS: 0.30  // +30% attack speed (faster attacks)
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
    ATTACK_SPEED_BONUS: 0.15
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
    stunner:{name:'Stunner',hp:80,maxHp:80,speed:70,attackDamage:12,attackCooldownMax:1200,attackRange:60,chaseRange:250,color:0x8800ff,xpReward:45,teachesMove:null,zone:2,aiPattern:'stunner',groundDefense:0.3,groundEscape:0.2},
    // Coach Enemy: support-type that boosts nearby allies (+15% attack speed per Coach in radius)
    coach:{name:'Coach',hp:60,maxHp:60,speed:88,attackDamage:6,attackCooldownMax:1800,attackRange:40,chaseRange:260,color:0x33ffcc,xpReward:45,teachesMove:null,zone:2,aiPattern:'coach'},
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
    tutor:{name:'Tutor',hp:95,maxHp:95,speed:84,attackDamage:14,attackCooldownMax:1150,attackRange:65,chaseRange:260,color:0x66ff33,xpReward:70,teachesMove:null,zone:2,aiPattern:'tutor',groundDefense:0.45,groundEscape:0.35}
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

  // Elite variants: 2x HP, stronger attacks, unique glow, rare drops
  ELITE_TYPES: {
    eliteStreetThug:{baseType:'streetThug',name:'Elite Street Thug',hpMultiplier:2,attackMultiplier:1.5,speedBonus:15,color:0xff4444,colorGlow:0xff0000,xpMultiplier:2.5,dropChance:0.2,rareItem:'speedPotion'},
    eliteBarBrawler:{baseType:'barBrawler',name:'Elite Bouncer',hpMultiplier:2,attackMultiplier:1.5,speedBonus:10,color:0xff7744,colorGlow:0xff6600,xpMultiplier:2.5,dropChance:0.2,rareItem:'powerGloves'},
    eliteMuayThai:{baseType:'muayThaiFighter',name:'Elite Muay Thai',hpMultiplier:2,attackMultiplier:1.6,speedBonus:20,color:0x44ff88,colorGlow:0x00ff44,xpMultiplier:2.5,dropChance:0.25,rareItem:'elbowPads'},
    eliteWrestler:{baseType:'wrestler',name:'Elite Wrestler',hpMultiplier:2,attackMultiplier:1.5,speedBonus:12,color:0x66aaff,colorGlow:0x0088ff,xpMultiplier:2.5,dropChance:0.2,rareItem:'wrestlingBoots'},
    eliteJudoka:{baseType:'judoka',name:'Elite Judoka',hpMultiplier:2,attackMultiplier:1.6,speedBonus:15,color:0xaa66ff,colorGlow:0x8800ff,xpMultiplier:2.5,dropChance:0.25,rareItem:'giBelt'},
    eliteGroundNPounder:{baseType:'groundNPounder',name:'Elite Ground Pounder',hpMultiplier:2,attackMultiplier:1.5,speedBonus:8,color:0xffaa66,colorGlow:0xff8800,xpMultiplier:2.5,dropChance:0.2,rareItem:'kneePads'},
    eliteBJJ:{baseType:'bjjBlackBelt',name:'Elite BJJ Master',hpMultiplier:2,attackMultiplier:1.7,speedBonus:18,color:0x444444,colorGlow:0x222222,xpMultiplier:3,dropChance:0.3,rareItem:'submissionGloves'},
    eliteStriker:{baseType:'striker',name:'Elite Striker',hpMultiplier:2,attackMultiplier:1.6,speedBonus:20,color:0xff6699,colorGlow:0xff0066,xpMultiplier:2.5,dropChance:0.22,rareItem:'speedPotion'}
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
    submissionGloves:{name:'Submission Gloves',stat:'attackDamage',value:8,duration:45000,color:0x8800ff,description:'+8 Attack for 45s'}
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
  spawnEnemy: function(scene, typeKey, x, y, forceElite) {
    var self = this;
    var isElite = forceElite || (Math.random() < this.ELITE_SPAWN_CHANCE && !typeKey.includes('champ') && typeKey !== 'shadowRival');
    var eliteType = null;
    var baseTypeKey = typeKey;
    
    // Check if there's an elite variant for this type
    if (isElite) {
      var eliteKey = 'elite' + typeKey.charAt(0).toUpperCase() + typeKey.slice(1);
      if (typeKey === 'muayThaiFighter') eliteKey = 'eliteMuayThai';
      if (typeKey === 'groundNPounder') eliteKey = 'eliteGroundNPounder';
      if (typeKey === 'bjjBlackBelt') eliteKey = 'eliteBJJ';
      
      if (this.ELITE_TYPES[eliteKey]) {
        eliteType = this.ELITE_TYPES[eliteKey];
        baseTypeKey = eliteType.baseType;
      }
    }
    
    var baseType = this.TYPES[baseTypeKey];
    var type = Object.assign({}, baseType);
    
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

    // Apply Mercenary Contract multipliers AFTER elite/rival/zone scaling
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

    type.attackDamage = Math.max(1, Math.round(type.attackDamage * 0.36)); type.attackCooldownMax = Math.round(type.attackCooldownMax * 1.8); type.speed = Math.round(type.speed * 0.85);
    if (typeof type.groundDefense !== 'number') type.groundDefense = 0.25;
    if (typeof type.groundEscape !== 'number') type.groundEscape = 0.2;
    var tex = (baseTypeKey === 'streetThug') ? 'enemy_thug' : 'enemy_brawler';
    var e = scene.physics.add.sprite(x, y, tex);
    e.setDisplaySize(CONFIG.DISPLAY_TILE, CONFIG.DISPLAY_TILE * 1.5); if (baseTypeKey === 'barBrawler') e.setDisplaySize(CONFIG.DISPLAY_TILE * 1.08, CONFIG.DISPLAY_TILE * 1.62);
    e.body.setSize(24, 36); e.body.setOffset(12, 18); e.stats = { hp: type.hp, maxHp: type.maxHp }; e.type = type; e.typeKey = typeKey; e.baseSpeed = type.speed; // store base speed
    e.state = 'idle'; e.attackCooldown = 0; e.staggerTimer = 0;
    e.isBoss = (typeKey === 'mmaChamp'); e.phaseTwo = false;

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

    // Regenerator visual cue (only if not overridden by elite/boss)
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
    
    if (e.isBoss) { e.setTint(0xffd700); scene.registry.set('gameMessage', 'BOSS FIGHT!'); scene.time.delayedCall(2000, function(){ scene.registry.set('gameMessage', ''); }); }
    
    // Show elite spawn message
    if (eliteType) {
      scene.registry.set('gameMessage', 'ELITE ENEMY!');
      scene.time.delayedCall(1500, function(){ scene.registry.set('gameMessage', ''); });
    }

    // Rival spawn message (style-dependent)
    if (typeKey === 'shadowRival') {
      var msg = 'A SHADOW RIVAL APPEARS!';
      if (type.rivalStyle === 'striker') msg = 'SHADOW: "Your hands won\'t save you."';
      if (type.rivalStyle === 'grappler') msg = 'SHADOW: "Let\'s see you wrestle with fate."';
      if (type.rivalStyle === 'balanced') msg = 'SHADOW: "Still undecided? I\'ll decide for you."';
      scene.registry.set('gameMessage', msg);
      scene.time.delayedCall(2200, function(){ scene.registry.set('gameMessage', ''); });
    }
    
    scene.enemyGroup.add(e); scene.enemies.push(e);
    
    // HP bar above enemy sprite
    var hpBg = scene.add.rectangle(0, -e.displayHeight/2 - 8, 36, 5, 0x333333).setOrigin(0.5);
    var hpFill = scene.add.rectangle(0, -e.displayHeight/2 - 8, 36, 5, 0xe83030).setOrigin(0.5);
    e._hpBarBg = hpBg;
    e._hpBarFill = hpFill;
    
    if (window.narrate) window.narrate('combatStart', { enemy: { name: type.name || typeKey } }).then(function(msg){ if (msg) scene.registry.set('gameMessage', msg); scene.time.delayedCall(3000, function(){ scene.registry.set('gameMessage', ''); }); });
    return e;
  },
  spawnForRoom: function(scene, roomId) {
    var DT = CONFIG.DISPLAY_TILE;
    var positions = MMA.Zones.getRoomSpawnPositions(roomId || scene.currentRoomId);
    var pool = (MMA.Zones.getRoomEnemyPool(roomId || scene.currentRoomId) || []).slice();

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

    for (var i=0; i<positions.length; i++) this.spawnEnemy(scene, pool[i % pool.length], positions[i].col * DT + DT/2, positions[i].row * DT + DT/2);

    // Initialize Tag Team pairings for this room after spawns.
    this._ensureTagTeams(scene);
  },
  spawnBoss: function(scene, x, y) { return this.spawnEnemy(scene, 'mmaChamp', x, y); },
  updateEnemies: function(scene, delta) {
    // Pack behavior: enemies gain speed bonus when near allies
    const PACK_RADIUS = 100; // pixels
    const SPEED_BONUS = 30; // additional speed when in pack
    const FLEE_HP_THRESHOLD = 0.2; // 20% HP
    const FLEE_CHANCE = 0.3; // 30% chance to flee when low HP
    const FLEE_DURATION = 1500; // ms
    const FLEE_COOLDOWN = 6000; // ms
    const ATTACK_TOKEN_RADIUS = 140; // max distance for token eligibility
    const ATTACK_TOKEN_TTL = 350; // ms token lifetime

    var self = this;

    // Tag Team AI: establish pairs per-room and update who is "active".
    self._ensureTagTeams(scene);
    self._updateTagTeams(scene, delta);

    // --- Attack token coordination ---
    var now = Date.now();
    // Validate existing token and clear if dead or expired
    if (!scene._enemyAttackToken || !scene._enemyAttackToken.enemy || !scene._enemyAttackToken.enemy.active || now > scene._enemyAttackToken.expiresAt) {
      // Find eligible enemies within radius, choose closest to player
      var candidates = scene.enemies.filter(function(e) {
        return e.active && e.state !== 'dead' && !e.isBoss && !(e.isFleeing) && !e.isResting && Math.hypot(e.x - scene.player.x, e.y - scene.player.y) <= ATTACK_TOKEN_RADIUS;
      });
      if (candidates.length) {
        // pick closest
        var primary = candidates.reduce(function(best, cur) {
          var dBest = Math.hypot(best.x - scene.player.x, best.y - scene.player.y);
          var dCur = Math.hypot(cur.x - scene.player.x, cur.y - scene.player.y);
          return dCur < dBest ? cur : best;
        }, candidates[0]);
        scene._enemyAttackToken = { enemy: primary, expiresAt: now + ATTACK_TOKEN_TTL };
      } else {
        scene._enemyAttackToken = null;
      }
    }
    // Mark each enemy with token flag
    scene.enemies.forEach(function(e) { e.hasAttackToken = (scene._enemyAttackToken && e === scene._enemyAttackToken.enemy); });

    scene.enemies.forEach(function(e) {
      if (!e.active || e.state === 'dead') return;
      
      // Update HP bar position and width
      if (e._hpBarBg) {
        e._hpBarBg.x = e.x;
        e._hpBarBg.y = e.y - e.displayHeight/2 - 8;
        e._hpBarFill.x = e.x;
        e._hpBarFill.y = e.y - e.displayHeight/2 - 8;
        var ratio = Math.max(0, e.stats.hp / e.stats.maxHp);
        e._hpBarFill.width = 36 * ratio;
      }
      
      // Update injury states (decay over time)
      self.updateInjuries(e, delta);

      // Update vengeance timers (5 second duration, then expires)
      self.updateVengeance(e, delta);

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

      // Coach Demoralize: after a Coach is KO'd, nearby allies become SHAKEN for a short time
      // (slower movement + slower attacks). This is driven by killEnemy() setting shakenTimer.
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
      
      // Apply enrage speed bonus to effective speed calculation later
      
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
          var dx = e.x - scene.player.x;
          var dy = e.y - scene.player.y;
          var dist = Math.sqrt(dx*dx + dy*dy) || 1;
          e.setVelocity((dx/dist)*e.type.speed, (dy/dist)*e.type.speed);
          e.fleeTimer -= delta;
          if (e.fleeTimer <= 0) {
            e.isFleeing = false;
            // Reset speed to base (pack bonus will apply later)
            e.type.speed = e.baseSpeed;
          }
          return; // skip other AI while fleeing
        }
      }
      // Handle boss phase two: adjust baseSpeed instead of type.speed
      if (e.isBoss && !e.phaseTwo && e.stats.hp <= e.stats.maxHp / 2) {
        e.phaseTwo = true;
        e.baseSpeed = Math.round(e.baseSpeed * 1.3);
        e.type.speed = e.baseSpeed; // ensure current speed reflects base
        e.type.attackCooldownMax = Math.round(e.type.attackCooldownMax * 0.7);
        e.setTint(0xff0000);
        scene.registry.set('gameMessage', 'BOSS ENRAGE!');
        scene.time.delayedCall(2000, function(){ scene.registry.set('gameMessage', ''); });
      }
      // Compute effective speed with pack bonus and Coach support
      var allies = scene.enemies.filter(function(other){return other!==e && other.active && other.state!=='dead';});
      var closeAllies = allies.filter(function(other){
        var dx = other.x - e.x, dy = other.y - e.y;
        return Math.sqrt(dx*dx+dy*dy) <= PACK_RADIUS;
      });
      var bonus = closeAllies.length > 0 ? SPEED_BONUS : 0;
      // Coach support: increase attack speed of nearby allies (+15% per Coach within radius 120)
      var coachBonus = 0;
      var COACH_RADIUS = 120;
      var coachCount = allies.filter(function(other){
        if (other.typeKey !== 'coach') return false;
        var dx = other.x - e.x, dy = other.y - e.y;
        return Math.sqrt(dx*dx+dy*dy) <= COACH_RADIUS;
      }).length;
      if (coachCount > 0) {
        coachBonus = coachCount * 0.15; // 15% per coach
      }
      e.attackSpeedMod = (e.attackSpeedMod || 1) * (1 + coachBonus);
      // Apply enrage attack speed bonus if active (+30% faster attacks)
      if (e.enrageAttackBonus) {
        e.attackSpeedMod = e.attackSpeedMod * (1 - e.enrageAttackBonus); // Reduce cooldown multiplier
      }
      // Apply enrage speed bonus if active (+25% move speed)
      var enrageSpeedBonus = (e.enrageSpeedBonus || 0);
      // Cap speed at double baseSpeed (including enrage bonus)
      var maxSpeed = e.baseSpeed * 2 * (1 + enrageSpeedBonus);
      e.type.speed = Math.min(e.baseSpeed + bonus, maxSpeed);

      var ai = self.AI[e.type.aiPattern || 'chase'];
      (ai || self.AI.chase)(e, scene.player, scene, delta);
    });
  },
  killEnemy: function(scene, enemy) {
    scene.enemiesDefeated = (scene.enemiesDefeated || 0) + 1;
    enemy.state = 'dead';

    // Loyalty Bond: trigger Vengeance on nearby allies when a non-boss enemy dies
    if (!enemy.isBoss) {
      this.applyVengeanceToNearby(enemy, scene);
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
          other._shakenShown = false; // allow popup once
        }
      });
      if (typeof MMA !== 'undefined' && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
        MMA.UI.showDamageText(scene, enemy.x, enemy.y - 60, 'COACH DOWN!', '#33ffcc');
      }
    }

    // Track enemy defeated in fight stats
    MMA.UI.recordEnemyDefeated();
    
    // Check for outfit unlocks based on enemy type
    if (MMA.Outfits) {
      var outfitUnlocked = MMA.Outfits.recordEnemyDefeat(enemy.typeKey);
      if (outfitUnlocked && outfitUnlocked.length > 0 && scene.player) {
        MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 50, 'NEW OUTFIT!', '#ffd700');
      }
    }
    
    var contractTier = this.getContractTier(scene);
    var xp = enemy.type.xpReward; scene.player.stats.xp += xp;
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
      scene.registry.set('gameMessage', 'VICTORY!'); scene.cameras.main.flash(500, 255, 215, 0); scene.gameOver = true;
      scene.registry.set('playerStats', Object.assign({}, scene.player.stats)); scene.registry.set('enemiesDefeated', scene.enemiesDefeated); scene.registry.set('playTime', Math.floor((Date.now() - scene.runStartMs) / 1000));
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
      if (window.saveGame) window.saveGame(scene.player.stats, scene.player.unlockedMoves, scene.currentZone, scene.currentRoomId);
    }
    if (enemy._hpBarBg) { enemy._hpBarBg.destroy(); enemy._hpBarFill.destroy(); }
    MMA.Items.spawnDropsForEnemy(scene, enemy);
    enemy.destroy(); scene.enemies = scene.enemies.filter(function(e){ return e !== enemy; });
    if (window.saveGame) window.saveGame(scene.player.stats, scene.player.unlockedMoves, scene.currentZone, scene.currentRoomId);
    var alive = scene.enemies.filter(function(e){ return e.state !== 'dead' && e.active; });
    if (alive.length === 0) {
      scene.registry.set('gameMessage', 'ROOM CLEAR! 🏆'); 
      // Show fight stats
      scene.time.delayedCall(1500, function(){ MMA.UI.showFightStats(scene); });
      scene.time.delayedCall(3500, function(){ scene.registry.set('gameMessage', ''); });
      if (scene.currentZone >= 3) { try { localStorage.clear(); } catch(e) {} scene.scene.pause('GameScene'); scene.scene.launch('VictoryScene'); }
    }
  }
};
window.MMA.Enemies.AI = {
  // Regen AI: behaves like chase AI; its gimmick is handled in updateEnemies via periodic healing.
  regen: function(enemy, player, scene, dt){
    return window.MMA.Enemies.AI.chase(enemy, player, scene, dt);
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
        if (enemy.attackCooldown <= 0) {
          // Perform stun attack
          enemy.aiState = 'stunned';
          enemy.stunTimer = 1500; // 1.5s player stun
          enemy.attackCooldown = enemy.type.attackCooldownMax * attackMod;
          // Apply damage and stun effect
          var dmg = Math.round(enemy.type.attackDamage * vulnMult * (window.MMA.Enemies.getPackDamageMultiplier ? window.MMA.Enemies.getPackDamageMultiplier(enemy, scene) : 1) * (window.MMA.Enemies.getVengeanceDamageMult ? window.MMA.Enemies.getVengeanceDamageMult(enemy) : 1));
          MMA.Player.damage(scene, dmg);
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
    
    if (dist < enemy.type.chaseRange) { 
      if (dist < enemy.type.attackRange) { 
        enemy.setVelocity(0,0); 
        // Attack token check: only token holder can deal damage
        if (enemy.hasAttackToken || enemy.isBoss) {
          if (enemy.attackCooldown <= 0) { 
            enemy.attackCooldown = enemy.type.attackCooldownMax * attackMod; 
            var dmg = Math.round(enemy.type.attackDamage * vulnMult * (window.MMA.Enemies.getPackDamageMultiplier ? window.MMA.Enemies.getPackDamageMultiplier(enemy, scene) : 1) * (window.MMA.Enemies.getVengeanceDamageMult ? window.MMA.Enemies.getVengeanceDamageMult(enemy) : 1));
            MMA.Player.damage(scene, dmg); 
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
  kicker: function(enemy, player, scene, dt){ 
    var dx = player.x - enemy.x, dy = player.y - enemy.y, dist = Math.sqrt(dx*dx + dy*dy) || 1; 
    var speedMod = (enemy.moveSpeedMod || 1) * (enemy.shakenMoveMult || 1);
    var attackMod = (enemy.attackSpeedMod || 1) * (enemy.shakenAttackMult || 1);
    var vulnMult = window.MMA.Enemies.getInjuryDamageMultiplier(enemy);
    
    if (enemy.aiState === 'windup') { enemy.setVelocity(0,0); enemy.windupTimer -= dt; if (enemy.windupTimer <= 0) { enemy.aiState = 'kicking'; enemy.kickTimer = 200; MMA.Player.damage(scene, Math.round((enemy.type.attackDamage + 5) * vulnMult)); } return; } 
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
  grasper: function(enemy, player, scene, dt){ var dx = player.x - enemy.x, dy = player.y - enemy.y, dist = Math.sqrt(dx*dx + dy*dy) || 1; if (enemy.aiState === 'grabbing') { enemy.setVelocity(0,0); enemy.grabTimer -= dt; player.setVelocity(0,0); if (player.stats) player.stats.hp -= Math.floor(enemy.type.attackDamage * 0.3 * (dt/1000)); if (enemy.grabTimer <= 0) { enemy.aiState = 'recovery'; enemy.recoveryTimer = 600; } return; } if (enemy.aiState === 'recovery') { enemy.setVelocity(0,0); enemy.recoveryTimer -= dt; if (enemy.recoveryTimer <= 0) enemy.aiState = null; return; } if (dist < enemy.type.chaseRange) { if (dist < enemy.type.attackRange) { enemy.setVelocity(0,0); if (enemy.attackCooldown <= 0) { enemy.aiState = 'grabbing'; enemy.grabTimer = 1000; enemy.attackCooldown = enemy.type.attackCooldownMax + 1000; MMA.Player.damage(scene, enemy.type.attackDamage); MMA.UI.showDamageText(scene, player.x, player.y - 30, 'GRABBED!', '#ffaa00'); } } else enemy.setVelocity((dx/dist)*enemy.type.speed, (dy/dist)*enemy.type.speed); } else enemy.setVelocity(0,0); if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt; },
  thrower: function(enemy, player, scene, dt){ var dx = player.x - enemy.x, dy = player.y - enemy.y, dist = Math.sqrt(dx*dx + dy*dy) || 1; if (enemy.aiState === 'throwing') { enemy.setVelocity(0,0); enemy.throwTimer -= dt; if (enemy.throwTimer <= 0) { enemy.aiState = 'recovery'; enemy.recoveryTimer = 700; } return; } if (enemy.aiState === 'recovery') { enemy.setVelocity(0,0); enemy.recoveryTimer -= dt; if (enemy.recoveryTimer <= 0) enemy.aiState = null; return; } if (dist < enemy.type.chaseRange) { if (dist < enemy.type.attackRange * 0.7) { enemy.setVelocity(0,0); if (enemy.attackCooldown <= 0) { enemy.aiState = 'throwing'; enemy.throwTimer = 300; enemy.attackCooldown = enemy.type.attackCooldownMax; MMA.Player.damage(scene, enemy.type.attackDamage * 1.8); MMA.UI.showDamageText(scene, player.x, player.y - 30, 'THROWN!', '#ff6600'); } } else if (dist < enemy.type.attackRange) enemy.setVelocity((dx/dist)*enemy.type.speed * 0.5, (dy/dist)*enemy.type.speed * 0.5); else enemy.setVelocity((dx/dist)*enemy.type.speed, (dy/dist)*enemy.type.speed); } else enemy.setVelocity(0,0); if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt; },
  subHunter: function(enemy, player, scene, dt){ var dx = player.x - enemy.x, dy = player.y - enemy.y, dist = Math.sqrt(dx*dx + dy*dy) || 1;
    // Ensure escapeMeter exists
    if (enemy.escapeMeter === undefined) enemy.escapeMeter = 0;
    // Submission state with escape mechanic
    if (enemy.aiState === 'submitting') {
      enemy.setVelocity(0,0);
      enemy.submitTimer -= dt;
      // Damage over time to player
      if (player && player.stats) player.stats.hp -= Math.floor(enemy.type.attackDamage * 0.4 * (dt/1000));
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
        if (player && player.stats) player.stats.hp -= Math.max(10, Math.floor(enemy.type.attackDamage * 2));
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
  kickboxer: function(enemy, player, scene, dt){ var dx = player.x - enemy.x, dy = player.y - enemy.y, dist = Math.sqrt(dx*dx + dy*dy) || 1; if (enemy.aiState === 'windup') { enemy.setVelocity(0,0); enemy.windupTimer -= dt; if (enemy.windupTimer <= 0) { enemy.aiState = 'kicking'; enemy.kickTimer = 180; MMA.Player.damage(scene, enemy.type.attackDamage); MMA.UI.showDamageText(scene, enemy.x, enemy.y - 30, 'HIGH KICK!', '#00cccc'); } return; } if (enemy.aiState === 'kicking') { enemy.setVelocity(0,0); enemy.kickTimer -= dt; if (enemy.kickTimer <= 0) { enemy.aiState = 'retreat'; enemy.retreatTimer = 600; } return; } if (enemy.aiState === 'retreat') { enemy.setVelocity(-(dx/dist)*enemy.type.speed * 1.3, -(dy/dist)*enemy.type.speed * 1.3); enemy.retreatTimer -= dt; if (enemy.retreatTimer <= 0) enemy.aiState = null; return; } var min = 70, max = 140; if (dist < enemy.type.chaseRange) { if (dist >= min && dist <= max) { if (!enemy.circleDir) enemy.circleDir = Math.random() < 0.5 ? 1 : -1; if (!enemy.circleAngle) enemy.circleAngle = Math.atan2(dy, dx); enemy.circleAngle += enemy.circleDir * 2.5 * (dt/1000); var targetX = player.x + Math.cos(enemy.circleAngle) * min, targetY = player.y + Math.sin(enemy.circleAngle) * min; var cx = targetX - enemy.x, cy = targetY - enemy.y, cdist = Math.sqrt(cx*cx + cy*cy) || 1; enemy.setVelocity((cx/cdist)*enemy.type.speed * 0.9, (cy/cdist)*enemy.type.speed * 0.9); if (enemy.attackCooldown <= 0 && Math.random() < 0.008) { enemy.aiState = 'windup'; enemy.windupTimer = 250; enemy.setVelocity(0,0); } } else if (dist < min) { enemy.setVelocity(-(dx/dist)*enemy.type.speed * 0.6, -(dy/dist)*enemy.type.speed * 0.6); } else { enemy.setVelocity((dx/dist)*enemy.type.speed * 0.85, (dy/dist)*enemy.type.speed * 0.85); } } else enemy.setVelocity(0,0); if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt; },
  // Combo Striker AI: fast jab-cross-hook chains with brief pauses between combos
  combo: function(enemy, player, scene, dt){ 
    var dx = player.x - enemy.x, dy = player.y - enemy.y, dist = Math.sqrt(dx*dx + dy*dy) || 1; 
    var speedMod = (enemy.moveSpeedMod || 1) * (enemy.shakenMoveMult || 1);
    var attackMod = (enemy.attackSpeedMod || 1) * (enemy.shakenAttackMult || 1);
    var vulnMult = window.MMA.Enemies.getInjuryDamageMultiplier(enemy);
    var vengeanceMult = window.MMA.Enemies.getVengeanceDamageMult(enemy);
    
    if (enemy.aiState && enemy.aiState.startsWith('combo')) { 
      enemy.setVelocity(0,0); 
      enemy.comboTimer -= dt; 
      if (enemy.comboTimer <= 0) { 
        var comboNum = parseInt(enemy.aiState.replace('combo','')) || 0; 
        var hits = [Math.round(enemy.type.attackDamage * vulnMult * vengeanceMult), Math.round(enemy.type.attackDamage * 1.3 * vulnMult * vengeanceMult), Math.round(enemy.type.attackDamage * 1.6 * vulnMult * vengeanceMult)]; 
        var names = ['JAB!', 'CROSS!', 'HOOK!']; 
        if (comboNum < 3) { 
          MMA.Player.damage(scene, hits[comboNum] || Math.round(enemy.type.attackDamage * vulnMult * vengeanceMult)); 
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
        if (enemy.attackCooldown <= 0 && !enemy.aiState) { 
          enemy.aiState = 'combo1'; 
          enemy.comboTimer = 120 * attackMod; 
          enemy.attackCooldown = enemy.type.attackCooldownMax; 
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
        if ((enemy.hasAttackToken || enemy.isBoss) && enemy.attackCooldown <= 0) {
          enemy.attackCooldown = enemy.type.attackCooldownMax * (aggro ? 0.75 : 1.0) * attackMod;
          var dmg = Math.round(enemy.type.attackDamage * vulnMult * (aggro ? 1.2 : 1.0) * (window.MMA.Enemies.getPackDamageMultiplier ? window.MMA.Enemies.getPackDamageMultiplier(enemy, scene) : 1) * vengeanceMult);
          MMA.Player.damage(scene, dmg);
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
          var dmg = Math.round(enemy.type.attackDamage * vulnMult * 1.3 * vengeanceMult); // slightly stronger on real hit
          MMA.Player.damage(scene, dmg);
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
        if ((enemy.hasAttackToken || enemy.isBoss) && enemy.attackCooldown <= 0) {
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

          var dmg = Math.round(enemy.type.attackDamage * vulnMult * groupMult * (window.MMA.Enemies.getPackDamageMultiplier ? window.MMA.Enemies.getPackDamageMultiplier(enemy, scene) : 1) * vengeanceMult);
          MMA.Player.damage(scene, dmg);

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
          var dmg = Math.round(enemy.type.attackDamage * cfg.STRIKE_MULT * vulnMult * (window.MMA.Enemies.getPackDamageMultiplier ? window.MMA.Enemies.getPackDamageMultiplier(enemy, scene) : 1) * vengeanceMult);
          MMA.Player.damage(scene, dmg);
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
        if ((enemy.hasAttackToken || enemy.isBoss) && enemy.attackCooldown <= 0) {
          enemy.attackCooldown = enemy.type.attackCooldownMax * attackMod;
          var dmg = Math.round(enemy.type.attackDamage * vulnMult * (window.MMA.Enemies.getPackDamageMultiplier ? window.MMA.Enemies.getPackDamageMultiplier(enemy, scene) : 1) * vengeanceMult);
          MMA.Player.damage(scene, dmg);
        }
      } else {
        enemy.setVelocity((dx / dist) * enemy.type.speed * speedMod, (dy / dist) * enemy.type.speed * speedMod);
      }
    } else {
      enemy.setVelocity(0, 0);
    }

    if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;
  }
};
window.ENEMY_TYPES = window.ENEMY_TYPES || window.MMA.Enemies.TYPES;
window.ENEMY_AI = window.ENEMY_AI || window.MMA.Enemies.AI;

window.MMA = window.MMA || {};
window.MMA.Enemies = {
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
    // Coach Enemy: support-type that boosts nearby allies (+15% attack speed per Coach in radius)
    coach:{name:'Coach',hp:60,maxHp:60,speed:88,attackDamage:6,attackCooldownMax:1800,attackRange:40,chaseRange:260,color:0x33ffcc,xpReward:45,teachesMove:null,zone:2,aiPattern:'coach'},
    // Rival System: recurring "Shadow" boss that appears across zones with scaling stats
    shadowRival:{name:'Shadow Rival',hp:150,maxHp:150,speed:92,attackDamage:22,attackCooldownMax:1150,attackRange:70,chaseRange:280,color:0x111111,xpReward:90,teachesMove:null,zone:2,aiPattern:'chase'}
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

    type.attackDamage = Math.max(1, Math.round(type.attackDamage * 0.36)); type.attackCooldownMax = Math.round(type.attackCooldownMax * 1.8); type.speed = Math.round(type.speed * 0.85);
    if (typeof type.groundDefense !== 'number') type.groundDefense = 0.25;
    if (typeof type.groundEscape !== 'number') type.groundEscape = 0.2;
    var tex = (baseTypeKey === 'streetThug') ? 'enemy_thug' : 'enemy_brawler';
    var e = scene.physics.add.sprite(x, y, tex);
    e.setDisplaySize(CONFIG.DISPLAY_TILE, CONFIG.DISPLAY_TILE * 1.5); if (baseTypeKey === 'barBrawler') e.setDisplaySize(CONFIG.DISPLAY_TILE * 1.08, CONFIG.DISPLAY_TILE * 1.62);
    e.body.setSize(24, 36); e.body.setOffset(12, 18); e.stats = { hp: type.hp, maxHp: type.maxHp }; e.type = type; e.typeKey = typeKey; e.baseSpeed = type.speed; // store base speed
    e.state = 'idle'; e.attackCooldown = 0; e.staggerTimer = 0;
    e.isBoss = (typeKey === 'mmaChamp'); e.phaseTwo = false;
    
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

    for (var i=0; i<positions.length; i++) this.spawnEnemy(scene, pool[i % pool.length], positions[i].col * DT + DT/2, positions[i].row * DT + DT/2);
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

    var self = this;
    scene.enemies.forEach(function(e) {
      if (!e.active || e.state === 'dead') return;
      
      // Update injury states (decay over time)
      self.updateInjuries(e, delta);
      
      if (e.staggerTimer > 0) { e.staggerTimer -= delta; e.setVelocity(0,0); return; }
      // Flee logic for non-boss enemies
      if (!e.isBoss) {
        if (!e.fleeCooldown) e.fleeCooldown = 0;
        if (e.fleeCooldown > 0) {
          e.fleeCooldown -= delta;
        } else if (!e.isFleeing && e.stats.hp <= e.stats.maxHp * FLEE_HP_THRESHOLD) {
          if (Math.random() < FLEE_CHANCE) {
            e.isFleeing = true;
            e.fleeTimer = FLEE_DURATION;
            e.fleeCooldown = FLEE_COOLDOWN;
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
      // Compute effective speed with pack bonus
      var allies = scene.enemies.filter(function(other){return other!==e && other.active && other.state!=='dead';});
      var closeAllies = allies.filter(function(other){
        var dx = other.x - e.x, dy = other.y - e.y;
        return Math.sqrt(dx*dx+dy*dy) <= PACK_RADIUS;
      });
      var bonus = closeAllies.length > 0 ? SPEED_BONUS : 0;
      // Cap speed at double baseSpeed
      e.type.speed = Math.min(e.baseSpeed + bonus, e.baseSpeed * 2);

      var ai = self.AI[e.type.aiPattern || 'chase'];
      (ai || self.AI.chase)(e, scene.player, scene, delta);
    });
  },
  killEnemy: function(scene, enemy) {
    scene.enemiesDefeated = (scene.enemiesDefeated || 0) + 1;
    enemy.state = 'dead';
    // Track enemy defeated in fight stats
    MMA.UI.recordEnemyDefeated();
    var xp = enemy.type.xpReward; scene.player.stats.xp += xp;
    MMA.UI.showDamageText(scene, enemy.x, enemy.y - 30, '+' + xp + ' XP', '#e8c830');
    
    // Elite enemy rare item drop
    if (enemy.type.isElite && enemy.type.eliteData) {
      var dropChance = enemy.type.eliteData.dropChance || 0.2;
      if (Math.random() < dropChance) {
        var rareItem = enemy.type.eliteData.rareItem;
        if (rareItem) {
          // Spawn the rare item as a pickup
          window.MMA.Enemies.spawnItem(scene, enemy.x, enemy.y, rareItem);
          MMA.UI.showDamageText(scene, enemy.x, enemy.y - 50, 'RARE DROP!', '#ff00ff');
        }
      }
    }
    
    if (enemy.isBoss) {
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
    if (enemy.hpFill && enemy.hpFill.active) enemy.hpFill.destroy();
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
  chase: function(enemy, player, scene, dt){ 
    var dx = player.x - enemy.x, dy = player.y - enemy.y, dist = Math.sqrt(dx*dx + dy*dy) || 1; 
    // Apply injury speed modifiers
    var speedMod = enemy.moveSpeedMod || 1;
    var attackMod = enemy.attackSpeedMod || 1;
    var vulnMult = window.MMA.Enemies.getInjuryDamageMultiplier(enemy);
    
    if (dist < enemy.type.chaseRange) { 
      if (dist < enemy.type.attackRange) { 
        enemy.setVelocity(0,0); 
        if (enemy.attackCooldown <= 0) { 
          enemy.attackCooldown = enemy.type.attackCooldownMax * attackMod; 
          var dmg = Math.round(enemy.type.attackDamage * vulnMult);
          MMA.Player.damage(scene, dmg); 
        } 
      } else enemy.setVelocity((dx/dist)*enemy.type.speed*speedMod, (dy/dist)*enemy.type.speed*speedMod); 
    } else enemy.setVelocity(0,0); 
    if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt; 
  },
  kicker: function(enemy, player, scene, dt){ 
    var dx = player.x - enemy.x, dy = player.y - enemy.y, dist = Math.sqrt(dx*dx + dy*dy) || 1; 
    var speedMod = enemy.moveSpeedMod || 1;
    var attackMod = enemy.attackSpeedMod || 1;
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
          enemy.submitTimer = 1200; // 1.2s window
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
    var speedMod = enemy.moveSpeedMod || 1;
    var attackMod = enemy.attackSpeedMod || 1;
    var vulnMult = window.MMA.Enemies.getInjuryDamageMultiplier(enemy);
    
    if (enemy.aiState && enemy.aiState.startsWith('combo')) { 
      enemy.setVelocity(0,0); 
      enemy.comboTimer -= dt; 
      if (enemy.comboTimer <= 0) { 
        var comboNum = parseInt(enemy.aiState.replace('combo','')) || 0; 
        var hits = [Math.round(enemy.type.attackDamage * vulnMult), Math.round(enemy.type.attackDamage * 1.3 * vulnMult), Math.round(enemy.type.attackDamage * 1.6 * vulnMult)]; 
        var names = ['JAB!', 'CROSS!', 'HOOK!']; 
        if (comboNum < 3) { 
          MMA.Player.damage(scene, hits[comboNum] || Math.round(enemy.type.attackDamage * vulnMult)); 
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
  }
};
window.ENEMY_TYPES = window.ENEMY_TYPES || window.MMA.Enemies.TYPES;
window.ENEMY_AI = window.ENEMY_AI || window.MMA.Enemies.AI;

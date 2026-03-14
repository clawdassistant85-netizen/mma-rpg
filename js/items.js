window.MMA = window.MMA || {};
window.MMA.Items = {
  PICKUPS: {
    healthPotion: { name:'Health Potion', color:0xff5c7a, description:'Restore 45 HP.', restoreHp:45, ttl:20000 },
    majorHealthPotion: { name:'Corner Bucket', color:0xff9f43, description:'Restore 80 HP and 20 stamina.', restoreHp:80, restoreStamina:20, ttl:20000 },
    staminaDrink: { name:'Electrolyte Drink', color:0x4ecdc4, description:'Restore 40 stamina.', restoreStamina:40, ttl:18000 },
    focusCapsule: { name:'Focus Capsule', color:0x55d6ff, description:'Gain 35 focus.', focus:35, ttl:18000 },
    adrenalineShot: { name:'Adrenaline Shot', type:'consumable', rarity:'uncommon', color:0xffd166, description:'+50% attack speed for 10s.', buffs:[{ prop:'attackSpeedMultiplierBonus', value:0.5, duration:10000 }], ttl:18000 },
    ironSkin: { name:'Iron Skin', color:0xa29bfe, description:'+4 defense for 22s.', buffs:[{ prop:'defenseBonus', value:4, duration:22000 }], ttl:18000 },
    powerTonic: { name:'Power Tonic', color:0xff7675, description:'+6 attack for 18s.', buffs:[{ prop:'attackBonus', value:6, duration:18000 }], ttl:18000 },
    footworkTape: { name:'Footwork Tape', color:0x7bed9f, description:'+8 speed and +0.05 dodge for 16s.', buffs:[{ prop:'speedBonus', value:8, duration:16000 }, { prop:'dodgeChance', value:0.05, duration:16000, clampMin:0, clampMax:0.45 }], ttl:18000 },
    heartPatch: { name:'Heart Patch', color:0xfeca57, description:'+15 max HP permanently.', maxHp:15, ttl:22000 },
    secondWind: { name:'Second Wind', color:0x48dbfb, description:'Restore 25 HP, 30 stamina, and 20 focus.', restoreHp:25, restoreStamina:30, focus:20, ttl:18000 },
    championBalm: { name:'Champion Balm', color:0xffd700, description:'Restore 60 HP and boost attack/defense for 25s.', restoreHp:60, buffs:[{ prop:'attackBonus', value:5, duration:25000 }, { prop:'defenseBonus', value:3, duration:25000 }], ttl:24000 },
    energyDrink: { name:'Energy Drink', type:'consumable', rarity:'common', color:0x00ff88, description:'+30 Stamina', restoreStamina:30, ttl:18000 },
    proteinShake: { name:'Protein Shake', type:'consumable', rarity:'common', color:0xff8f66, description:'+50 HP', restoreHp:50, ttl:18000 },
    smellingSalts: { name:'Smelling Salts', type:'consumable', rarity:'uncommon', color:0xe4ff5c, description:'Clear stun effects', clearStatus:true, ttl:18000 },
    icepack: { name:'Ice Pack', type:'consumable', rarity:'uncommon', color:0x7fdcff, description:'-30% damage taken for 15s', buffs:[{ prop:'damageReduction', value:0.30, duration:15000, clampMin:0, clampMax:0.8 }], ttl:18000 },
    bandage: { name:'Bandage', type:'consumable', rarity:'uncommon', color:0xffffff, description:'Regenerate 5 HP/sec for 10s', healPerSecond:5, healDuration:10000, ttl:18000 },
    mouthguard: { name:'Mouthguard', type:'equipment', rarity:'uncommon', color:0x9fe7ff, description:'+10 max HP (permanent)', maxHp:10, ttl:22000 },
    ankleWraps: { name:'Ankle Wraps', type:'equipment', rarity:'uncommon', color:0x7ed957, description:'+2 speed (permanent)', permanentBonuses:[{ prop:'speedBonus', value:10 }, { stat:'speed', value:2 }], ttl:22000 },
    handWraps: { name:'Hand Wraps', type:'equipment', rarity:'rare', color:0xffd0d0, description:'+5% crit chance (permanent)', permanentBonuses:[{ prop:'critChanceBonus', value:0.05 }], ttl:22000 },
    cupProtector: { name:'Cup Protector', type:'equipment', rarity:'rare', color:0x77aaff, description:'-10% incoming grapple damage', permanentBonuses:[{ prop:'grappleDamageReduction', value:0.10, clampMin:0, clampMax:0.7 }], ttl:22000 },
    headgear: { name:'Headgear', type:'equipment', rarity:'rare', color:0xf7b267, description:'-15% incoming strike damage', permanentBonuses:[{ prop:'strikeDamageReduction', value:0.15, clampMin:0, clampMax:0.75 }], ttl:22000 },
    championBelt: { name:'Champion Belt', type:'equipment', rarity:'rare', color:0xffd700, description:'+3 all stats', maxHp:15, permanentBonuses:[{ prop:'attackBonus', value:9 }, { prop:'defenseBonus', value:6 }, { prop:'speedBonus', value:15 }, { prop:'dodgeChance', value:0.03, clampMin:0, clampMax:0.45 }, { prop:'staminaRegenBonus', value:1.5 }, { prop:'critChanceBonus', value:0.03 }, { stat:'strength', value:3 }, { stat:'speed', value:3 }, { stat:'defense', value:3 }, { stat:'agility', value:3 }, { stat:'endurance', value:3 }], ttl:26000 },
    blackBelt: { name:'Black Belt', type:'equipment', rarity:'rare', color:0x2b2b2b, description:'+5 submission damage', permanentBonuses:[{ prop:'submissionDamageFlatBonus', value:5 }], ttl:24000 },
    goldGloves: { name:'Gold Gloves', type:'equipment', rarity:'rare', color:0xffc400, description:'+20% strike damage', permanentBonuses:[{ prop:'strikeDamageMultiplier', value:0.20 }], ttl:24000 }
  },

  DROP_TABLES: {
    streetThug: [
      { key:'energyDrink', weight:28 },
      { key:'proteinShake', weight:24 },
      { key:'bandage', weight:16 },
      { key:'footworkTape', weight:10 }
    ],
    barBrawler: [
      { key:'proteinShake', weight:24 },
      { key:'ironSkin', weight:18 },
      { key:'bandage', weight:18 },
      { key:'mouthguard', weight:10 }
    ],
    muayThaiFighter: [
      { key:'adrenalineShot', weight:24 },
      { key:'powerTonic', weight:20 },
      { key:'ankleWraps', weight:16 },
      { key:'icepack', weight:12 }
    ],
    kickboxer: [
      { key:'adrenalineShot', weight:24 },
      { key:'ankleWraps', weight:18 },
      { key:'footworkTape', weight:16 },
      { key:'icepack', weight:12 }
    ],
    striker: [
      { key:'powerTonic', weight:24 },
      { key:'energyDrink', weight:20 },
      { key:'handWraps', weight:12 },
      { key:'adrenalineShot', weight:14 }
    ],
    boxer: [
      { key:'handWraps', weight:24 },
      { key:'mouthguard', weight:18 },
      { key:'powerTonic', weight:18 },
      { key:'adrenalineShot', weight:10 }
    ],
    karateka: [
      { key:'ankleWraps', weight:20 },
      { key:'icepack', weight:16 },
      { key:'powerTonic', weight:20 },
      { key:'headgear', weight:8 }
    ],
    wrestler: [
      { key:'ironSkin', weight:22 },
      { key:'mouthguard', weight:18 },
      { key:'cupProtector', weight:14 },
      { key:'bandage', weight:16 }
    ],
    judoka: [
      { key:'mouthguard', weight:18 },
      { key:'cupProtector', weight:16 },
      { key:'ironSkin', weight:20 },
      { key:'championBalm', weight:8 }
    ],
    groundNPounder: [
      { key:'championBalm', weight:10 },
      { key:'proteinShake', weight:24 },
      { key:'goldGloves', weight:8 },
      { key:'icepack', weight:18 }
    ],
    bjjBlackBelt: [
      { key:'blackBelt', weight:12 },
      { key:'smellingSalts', weight:18 },
      { key:'cupProtector', weight:14 },
      { key:'championBalm', weight:10 }
    ],
    shadowRival: [
      { key:'championBelt', weight:14 },
      { key:'blackBelt', weight:18 },
      { key:'goldGloves', weight:18 },
      { key:'championBalm', weight:12 }
    ],
    mmaChamp: [
      { key:'championBelt', weight:20 },
      { key:'goldGloves', weight:20 },
      { key:'blackBelt', weight:16 },
      { key:'championBalm', weight:14 }
    ],
    consumable: [
      { key:'energyDrink', weight:18 },
      { key:'proteinShake', weight:18 },
      { key:'smellingSalts', weight:10 },
      { key:'icepack', weight:12 },
      { key:'adrenalineShot', weight:10 },
      { key:'bandage', weight:12 },
      { key:'healthPotion', weight:10 },
      { key:'staminaDrink', weight:10 }
    ],
    equipment: [
      { key:'mouthguard', weight:20 },
      { key:'ankleWraps', weight:18 },
      { key:'handWraps', weight:16 },
      { key:'cupProtector', weight:14 },
      { key:'headgear', weight:14 },
      { key:'heartPatch', weight:10 },
      { key:'footworkTape', weight:8 }
    ],
    rare: [
      { key:'championBelt', weight:24 },
      { key:'blackBelt', weight:34 },
      { key:'goldGloves', weight:42 }
    ]
  },

  RARITY_COLORS: {
    common: '#ffffff',
    uncommon: '#7ed957',
    rare: '#77aaff',
    epic: '#b18cff',
    legendary: '#ffcc33'
  },

  CORNER_POWERUP_MAP: {
    hp: ['healthPotion', 'proteinShake', 'bandage'],
    stamina: ['energyDrink', 'staminaDrink', 'adrenalineShot'],
    focus: ['focusCapsule', 'secondWind', 'smellingSalts']
  },

  ensurePickupSystem: function(scene) {
    if (!scene || !scene.physics || !scene.player) return;
    if (!scene.pickupGroup) scene.pickupGroup = scene.physics.add.group();
    if (!scene._pickupOverlapBound) {
      scene.physics.add.overlap(scene.player, scene.pickupGroup, function(player, item) {
        window.MMA.Items.applyPickup(scene, player, item);
      }, null, scene);
      scene._pickupOverlapBound = true;
    }
  },

  _getPickupTexture: function(scene) {
    return scene && scene.textures && scene.textures.exists('item_pickup') ? 'item_pickup' : 'pickup_health';
  },

  _copyPickupData: function(source) {
    var out = {};
    var key;
    for (key in source) {
      if (!source.hasOwnProperty(key)) continue;
      if (Array.isArray(source[key])) out[key] = source[key].slice();
      else out[key] = source[key];
    }
    return out;
  },

  spawnPickup: function(scene, x, y, pickupKey, options) {
    this.ensurePickupSystem(scene);
    if (!scene || !scene.pickupGroup) return null;

    var template = this.PICKUPS[pickupKey];
    if (!template) return null;

    var itemData = this._copyPickupData(template);
    var tex = this._getPickupTexture(scene);
    var item = scene.physics.add.sprite(x, y, tex);
    var scale = options && options.scale ? options.scale : 0.92;

    item.setDisplaySize(24 * scale, 24 * scale);
    item.setTint(itemData.color || 0xffffff);
    item.setDepth(11);
    item.itemData = itemData;
    item.itemKey = pickupKey;
    item.isPickup = true;
    item._mmaArenaPowerup = !!(options && options.arenaPowerup);
    item._mmaCornerSource = options && options.cornerSource ? options.cornerSource : null;
    if (item.body) item.body.setAllowGravity(false);

    scene.tweens.add({
      targets: item,
      y: y - 9,
      duration: 760,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    scene.tweens.add({
      targets: item,
      angle: 360,
      duration: 2400,
      repeat: -1,
      ease: 'Linear'
    });

    scene.tweens.add({
      targets: item,
      alpha: 0.72,
      duration: 620,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    scene.pickupGroup.add(item);

    var ttl = options && typeof options.ttl === 'number' ? options.ttl : itemData.ttl;
    if (ttl && ttl > 0) {
      scene.time.delayedCall(Math.max(0, ttl - 1600), function() {
        if (!item || !item.active) return;
        scene.tweens.add({
          targets: item,
          alpha: 0.15,
          duration: 120,
          yoyo: true,
          repeat: 6
        });
      });
      scene.time.delayedCall(ttl, function() {
        if (item && item.active) item.destroy();
      });
    }

    return item;
  },

  _applyTimedBuff: function(scene, player, buff) {
    if (!player || !buff || !buff.prop) return;
    var prop = buff.prop;
    var value = buff.value || 0;
    var duration = buff.duration || 0;
    var clampMin = buff.clampMin;
    var clampMax = buff.clampMax;

    if (typeof player[prop] !== 'number') player[prop] = 0;
    player[prop] += value;
    if (typeof clampMin === 'number' && player[prop] < clampMin) player[prop] = clampMin;
    if (typeof clampMax === 'number' && player[prop] > clampMax) player[prop] = clampMax;

    if (duration > 0 && scene && scene.time) {
      scene.time.delayedCall(duration, function() {
        if (!player || !player.active) return;
        if (typeof player[prop] !== 'number') player[prop] = 0;
        player[prop] -= value;
        if (typeof clampMin === 'number' && player[prop] < clampMin) player[prop] = clampMin;
        if (typeof clampMax === 'number' && player[prop] > clampMax) player[prop] = clampMax;
      });
    }
  },

  _applyPermanentBonuses: function(player, bonuses) {
    if (!player || !bonuses || !bonuses.length) return;
    for (var i = 0; i < bonuses.length; i++) {
      var bonus = bonuses[i];
      if (!bonus) continue;
      if (bonus.prop) {
        if (typeof player[bonus.prop] !== 'number') player[bonus.prop] = 0;
        player[bonus.prop] += bonus.value || 0;
        if (typeof bonus.clampMin === 'number' && player[bonus.prop] < bonus.clampMin) player[bonus.prop] = bonus.clampMin;
        if (typeof bonus.clampMax === 'number' && player[bonus.prop] > bonus.clampMax) player[bonus.prop] = bonus.clampMax;
      }
      if (bonus.stat && player.stats) {
        if (typeof player.stats[bonus.stat] !== 'number') player.stats[bonus.stat] = 0;
        player.stats[bonus.stat] += bonus.value || 0;
      }
    }
  },

  _applyLegacyItemStats: function(scene, player, itemData) {
    if (!player || !player.stats || !itemData || !itemData.stat) return;
    var stats = player.stats;
    var value = itemData.value || 0;
    var duration = itemData.duration || 0;

    if (itemData.stat === 'speed') {
      this._applyTimedBuff(scene, player, { prop:'speedBonus', value:value, duration:duration });
    } else if (itemData.stat === 'attackDamage') {
      this._applyTimedBuff(scene, player, { prop:'attackBonus', value:value, duration:duration });
    } else if (itemData.stat === 'defense') {
      this._applyTimedBuff(scene, player, { prop:'defenseBonus', value:value, duration:duration });
    } else if (itemData.stat === 'hp') {
      stats.maxHp += value;
      stats.hp = Math.min(stats.maxHp, stats.hp + value);
    }
  },

  _applyHealingOverTime: function(scene, player, itemData) {
    if (!scene || !scene.time || !player || !player.stats || !itemData.healPerSecond || !itemData.healDuration) return;
    var ticks = Math.max(1, Math.floor(itemData.healDuration / 1000));
    var healPerTick = itemData.healPerSecond;
    scene.time.addEvent({
      delay: 1000,
      repeat: ticks - 1,
      callback: function() {
        if (!player || !player.active || !player.stats) return;
        player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + healPerTick);
      }
    });
  },

  _applyPickupStats: function(scene, player, itemData) {
    var stats = player && player.stats ? player.stats : null;
    if (!stats) return;

    if (itemData.restoreHp) {
      stats.hp = Math.min(stats.maxHp, stats.hp + itemData.restoreHp);
    }
    if (itemData.restoreStamina) {
      stats.stamina = Math.min(stats.maxStamina, stats.stamina + itemData.restoreStamina);
    }
    if (itemData.maxHp) {
      stats.maxHp += itemData.maxHp;
      stats.hp = Math.min(stats.maxHp, stats.hp + itemData.maxHp);
    }
    if (itemData.clearStatus) {
      player.stunnedUntil = scene && scene.time ? scene.time.now : 0;
    }
    if (itemData.focus && window.MMA && MMA.Combat && typeof MMA.Combat.gainFocus === 'function') {
      MMA.Combat.gainFocus(scene, itemData.focus);
    }
    if (itemData.healPerSecond && itemData.healDuration) {
      this._applyHealingOverTime(scene, player, itemData);
    }
    if (itemData.buffs && itemData.buffs.length) {
      for (var i = 0; i < itemData.buffs.length; i++) this._applyTimedBuff(scene, player, itemData.buffs[i]);
    }
    if (itemData.permanentBonuses && itemData.permanentBonuses.length) {
      this._applyPermanentBonuses(player, itemData.permanentBonuses);
    }
    if (itemData.stat) this._applyLegacyItemStats(scene, player, itemData);
  },

  applyPickup: function(scene, player, item) {
    if (!item || !item.itemData || !player) return;
    var itemData = item.itemData;

    this._applyPickupStats(scene, player, itemData);

    if (window.sfx) {
      if (typeof window.sfx.playPickup === 'function') window.sfx.playPickup();
      else if (typeof window.sfx.uiConfirm === 'function') window.sfx.uiConfirm();
    }

    if (window.MMA && MMA.UI) {
      MMA.UI.showDamageText(scene, player.x, player.y - 32, itemData.name.toUpperCase(), '#66ffcc');
      scene.registry.set('gameMessage', 'Picked up ' + itemData.name + '! ' + (itemData.description || ''));
      scene.time.delayedCall(1800, function() { scene.registry.set('gameMessage', ''); });
    }

    item.destroy();
  },

  _pickWeighted: function(entries) {
    if (!entries || !entries.length) return null;
    var total = 0;
    var i;
    for (i = 0; i < entries.length; i++) total += entries[i].weight || 0;
    if (total <= 0) return entries[0].key;

    var roll = Math.random() * total;
    for (i = 0; i < entries.length; i++) {
      roll -= entries[i].weight || 0;
      if (roll <= 0) return entries[i].key;
    }
    return entries[entries.length - 1].key;
  },

  spawnDropsForEnemy: function(scene, enemy) {
    if (!scene || !enemy || enemy.state !== 'dead') return null;
    this.ensurePickupSystem(scene);

    var isBoss = !!enemy.isBoss || enemy.typeKey === 'shadowRival';
    var isElite = !!(enemy.isElite || (enemy.type && enemy.type.isElite));
    var enemyTable = this.DROP_TABLES[enemy.typeKey] || this.DROP_TABLES[enemy.baseTypeKey] || null;
    var dropKeys = [];

    if (enemyTable && enemyTable.length) {
      if (isBoss) {
        dropKeys.push(this._pickWeighted(enemyTable));
        dropKeys.push(this._pickWeighted(this.DROP_TABLES.equipment));
        if (Math.random() < 0.4) dropKeys.push(this._pickWeighted(this.DROP_TABLES.rare));
      } else if (isElite) {
        dropKeys.push(this._pickWeighted(enemyTable));
        if (Math.random() < 0.35) dropKeys.push(this._pickWeighted(this.DROP_TABLES.equipment));
      } else if (Math.random() < 0.35) {
        dropKeys.push(this._pickWeighted(enemyTable));
      }
    } else if (isBoss) {
      dropKeys.push(this._pickWeighted(this.DROP_TABLES.equipment));
      if (Math.random() < 0.3) dropKeys.push(this._pickWeighted(this.DROP_TABLES.rare));
    } else if (isElite) {
      if (Math.random() < 0.5) dropKeys.push(this._pickWeighted(this.DROP_TABLES.consumable));
      if (Math.random() < 0.15) dropKeys.push(this._pickWeighted(this.DROP_TABLES.equipment));
    } else if (Math.random() < 0.2) {
      dropKeys.push(this._pickWeighted(this.DROP_TABLES.consumable));
    }

    dropKeys = dropKeys.filter(function(key) { return !!key; });
    if (!dropKeys.length) return null;

    var ttl = isBoss ? 0 : 20000;
    var drops = [];
    for (var i = 0; i < dropKeys.length; i++) {
      var offset = (i - ((dropKeys.length - 1) / 2)) * 18;
      drops.push(this.spawnPickup(scene, enemy.x + offset, enemy.y - 4, dropKeys[i], { ttl: ttl, scale: isBoss ? 1.08 : 0.92 }));
    }
    return drops.length === 1 ? drops[0] : drops;
  },

  _getArenaCornerPosition: function(scene, corner) {
    var DT = CONFIG.DISPLAY_TILE;
    return {
      x: corner.col * DT + DT / 2,
      y: corner.row * DT + DT / 2
    };
  },

  _countCornerPowerups: function(scene) {
    if (!scene.pickupGroup) return 0;
    var children = scene.pickupGroup.getChildren();
    var count = 0;
    for (var i = 0; i < children.length; i++) {
      if (children[i] && children[i].active && children[i]._mmaArenaPowerup) count++;
    }
    return count;
  },

  _spawnArenaCornerPowerup: function(scene) {
    var types = scene.registry.get('ringPowerupTypes') || [];
    var corners = scene.registry.get('ringPowerupCorners') || [];
    if (!types.length || !corners.length) return null;

    var freeCorners = [];
    var children = scene.pickupGroup ? scene.pickupGroup.getChildren() : [];
    var i;
    for (i = 0; i < corners.length; i++) {
      var pos = this._getArenaCornerPosition(scene, corners[i]);
      var occupied = false;
      for (var j = 0; j < children.length; j++) {
        var child = children[j];
        if (!child || !child.active || !child._mmaArenaPowerup) continue;
        var dx = child.x - pos.x;
        var dy = child.y - pos.y;
        if (Math.sqrt(dx * dx + dy * dy) < 24) {
          occupied = true;
          break;
        }
      }
      if (!occupied) freeCorners.push(corners[i]);
    }
    if (!freeCorners.length) return null;

    var corner = freeCorners[Math.floor(Math.random() * freeCorners.length)];
    var type = types[Math.floor(Math.random() * types.length)];
    var options = this.CORNER_POWERUP_MAP[type] || ['healthPotion'];
    var pickupKey = options[Math.floor(Math.random() * options.length)];
    var spot = this._getArenaCornerPosition(scene, corner);
    var pickup = this.spawnPickup(scene, spot.x, spot.y, pickupKey, { ttl:12000, scale:1.05, arenaPowerup:true, cornerSource:type });

    if (pickup && scene.registry) {
      scene.registry.set('gameMessage', 'Corner power-up: ' + (this.PICKUPS[pickupKey].name || pickupKey));
      scene.time.delayedCall(1400, function() { scene.registry.set('gameMessage', ''); });
    }
    return pickup;
  },

  update: function(scene, time, delta) {
    if (!scene || !scene.player || !scene.physics) return;
    this.ensurePickupSystem(scene);

    if (scene.registry && scene.registry.get('ringPowerupsActive')) {
      if (scene._mmaCornerPowerupTimer === undefined) scene._mmaCornerPowerupTimer = 4200;
      scene._mmaCornerPowerupTimer -= delta;
      if (scene._mmaCornerPowerupTimer <= 0) {
        if (this._countCornerPowerups(scene) < 2) this._spawnArenaCornerPowerup(scene);
        scene._mmaCornerPowerupTimer = 6500 + Math.floor(Math.random() * 2500);
      }
    } else {
      scene._mmaCornerPowerupTimer = 4200;
    }
  }
};

window.MMA.Items.ITEMS = window.MMA.Items.PICKUPS;

(function() {
  var Items = window.MMA && MMA.Items;
  if (!Items) return;

  function snapshotCooldowns(player) {
    var copy = {};
    var source = player && player.cooldowns ? player.cooldowns : {};
    for (var key in source) {
      if (source.hasOwnProperty(key)) copy[key] = source[key];
    }
    return copy;
  }

  function applyAttackSpeedCooldowns(player, before) {
    if (!player || !player.cooldowns) return;
    var mult = 1 + (player.attackSpeedMultiplierBonus || 0);
    if (mult <= 1) return;
    for (var key in player.cooldowns) {
      if (!player.cooldowns.hasOwnProperty(key)) continue;
      var prev = before && before.hasOwnProperty(key) ? before[key] : 0;
      if (player.cooldowns[key] > prev) {
        player.cooldowns[key] = Math.max(40, Math.round(player.cooldowns[key] / mult));
      }
    }
  }

  if (window.MMA && MMA.Player && !MMA.Player._mmaItemsPatched) {
    var originalDamage = MMA.Player.damage;
    MMA.Player.damage = function(scene, damage) {
      var player = scene && scene.player;
      if (player) {
        var reduction = player.damageReduction || 0;
        reduction += scene && scene.groundState && scene.groundState.active ? (player.grappleDamageReduction || 0) : (player.strikeDamageReduction || 0);
        if (reduction > 0.85) reduction = 0.85;
        damage = Math.max(1, Math.round(damage * (1 - reduction)));
      }
      return originalDamage.call(this, scene, damage);
    };

    var originalRegenStaminaTick = MMA.Player.regenStaminaTick;
    MMA.Player.regenStaminaTick = function(scene) {
      originalRegenStaminaTick.call(this, scene);
      if (!scene || !scene.player || !scene.player.stats) return;
      var bonus = scene.player.staminaRegenBonus || 0;
      if (bonus > 0) {
        scene.player.stats.stamina = Math.min(scene.player.stats.maxStamina, scene.player.stats.stamina + bonus);
      }
    };

    MMA.Player._mmaItemsPatched = true;
  }

  if (window.MMA && MMA.Combat && !MMA.Combat._mmaItemsPatched) {
    var originalGetMomentumModifiers = MMA.Combat.getMomentumModifiers;
    MMA.Combat.getMomentumModifiers = function(scene, baseDamage) {
      var result = originalGetMomentumModifiers.call(this, scene, baseDamage);
      var player = scene && scene.player;
      if (!player) return result;
      if (player.strikeDamageMultiplier) result.damage = Math.round(result.damage * (1 + player.strikeDamageMultiplier));
      if (player.critChanceBonus) result.critChance = Math.min(0.95, (result.critChance || this.CRIT_CHANCE) + player.critChanceBonus);
      return result;
    };

    var originalExecuteAttack = MMA.Combat.executeAttack;
    MMA.Combat.executeAttack = function(scene, moveKey) {
      var before = scene && scene.player ? snapshotCooldowns(scene.player) : null;
      var output = originalExecuteAttack.apply(this, arguments);
      if (scene && scene.player) applyAttackSpeedCooldowns(scene.player, before);
      return output;
    };

    var originalExecuteSpecialMove = MMA.Combat.executeSpecialMove;
    MMA.Combat.executeSpecialMove = function(scene) {
      var before = scene && scene.player ? snapshotCooldowns(scene.player) : null;
      var output = originalExecuteSpecialMove.apply(this, arguments);
      if (scene && scene.player) applyAttackSpeedCooldowns(scene.player, before);
      return output;
    };

    var originalExecuteGroundMove = MMA.Combat.executeGroundMove;
    if (typeof originalExecuteGroundMove === 'function') {
      MMA.Combat.executeGroundMove = function(scene, moveKey) {
        var player = scene && scene.player;
        var before = player ? snapshotCooldowns(player) : null;
        var originalGroundDamage = null;
        if (player && this.GROUND_MOVES && this.GROUND_MOVES[moveKey] && player.strikeDamageMultiplier && moveKey !== 'takedown' && moveKey !== 'special') {
          originalGroundDamage = this.GROUND_MOVES[moveKey].damage;
          this.GROUND_MOVES[moveKey].damage = Math.round(originalGroundDamage * (1 + player.strikeDamageMultiplier));
        }
        var output = originalExecuteGroundMove.apply(this, arguments);
        if (originalGroundDamage !== null) this.GROUND_MOVES[moveKey].damage = originalGroundDamage;
        if (player) applyAttackSpeedCooldowns(player, before);
        return output;
      };
    }

    var originalExecuteSubmission = MMA.Combat.executeSubmission;
    MMA.Combat.executeSubmission = function(scene, subKey, subMove) {
      var player = scene && scene.player;
      var before = player ? snapshotCooldowns(player) : null;
      var moveData = {};
      var key;
      for (key in subMove) {
        if (subMove.hasOwnProperty(key)) moveData[key] = subMove[key];
      }
      if (player) {
        moveData.damage = (moveData.damage || 0) + (player.submissionDamageFlatBonus || 0);
        if (window.sfx && typeof window.sfx.submissionLock === 'function') window.sfx.submissionLock();
      }
      var output = originalExecuteSubmission.call(this, scene, subKey, moveData);
      if (player) applyAttackSpeedCooldowns(player, before);
      return output;
    };

    MMA.Combat._mmaItemsPatched = true;
  }
})();

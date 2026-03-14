window.MMA = window.MMA || {};
window.MMA.Zones = {
  ZONE1_ROOMS: {
    room1:{id:'room1',zone:1,weatherOptions:['clear','clear','rain','night'],weightClass:'light',doors:{left:{col:0,row:5},right:{col:15,row:5},up:{col:7,row:0}},connections:{left:'room2',right:'room3',up:'room4'},spawnPositions:[{col:3,row:3},{col:12,row:3},{col:12,row:9}],enemyPool:['streetThug','streetThug','barBrawler'],name:'Alley Entrance'},
    room2:{id:'room2',zone:1,weatherOptions:['clear','rain','wind','fog'],weightClass:'light',doors:{right:{col:15,row:5}},connections:{right:'room1'},spawnPositions:[{col:3,row:3},{col:3,row:9}],enemyPool:['streetThug','barBrawler'],name:'Side Alley'},
    // Secret alley with bonus loot hooks – discovered as a side path off the main street
    secret1:{
      id:'secret1',
      zone:1,
      weatherOptions:['night','clear'],
      weightClass:'light',
      doors:{down:{col:7,row:11}},
      connections:{down:'room2'},
      spawnPositions:[{col:7,row:6}],
      enemyPool:['barBrawler'],
      name:'Hidden Back Alley',
      secret:true,
      secretLabel:'Secret Loot Alley',
      bonusLootTags:['cash','rare'],
      bonusCurrencyMultiplier:2.0
    },
    room3:{id:'room3',zone:1,weatherOptions:['clear','clear','night','wind','fog'],weightClass:'light',doors:{left:{col:0,row:5}},connections:{left:'room1'},spawnPositions:[{col:3,row:5},{col:12,row:3},{col:12,row:9}],enemyPool:['barBrawler','barBrawler','muayThaiFighter'],name:'Back Lot'},
    room4:{id:'room4',zone:1,weatherOptions:['clear','rain','fog'],weightClass:'light',doors:{down:{col:7,row:11},up:{col:7,row:0}},connections:{down:'room1',up:'clinic1'},spawnPositions:[{col:3,row:8},{col:12,row:8}],enemyPool:['barBrawler','muayThaiFighter','muayThaiFighter'],name:'Storage Area'},
    // Clinic/Medical Bay: inter-zone recovery space between street and gym
    clinic1:{
      id:'clinic1',
      zone:1,
      weatherOptions:['clear','rain'],
      weightClass:'standard',
      doors:{down:{col:7,row:11},up:{col:7,row:0}},
      connections:{down:'room4',up:'gym1'},
      spawnPositions:[{col:7,row:6}],
      enemyPool:[],
      name:'Medical Tent',
      clinic:true,
      clinicLabel:'Clinic / Medical Bay',
      clinicServices:{ healHp:true, removeInjuries:true },
      clinicBaseCost:25,
      clinicCostPerZone:10
    }
  },
  ZONE2_ROOMS: {
    gym1:{id:'gym1',zone:2,weatherOptions:['clear'],weightClass:'middle',musicCue:'zone2',doors:{left:{col:0,row:5},right:{col:15,row:5},down:{col:7,row:11}},connections:{left:'gym2',right:'gym3',down:'clinic1'},spawnPositions:[{col:4,row:4},{col:11,row:4},{col:7,row:8}],enemyPool:['wrestler','judoka','groundNPounder'],name:'Gym Entrance'},
    gym2:{id:'gym2',zone:2,weatherOptions:['clear'],weightClass:'middle',musicCue:'zone2',doors:{right:{col:15,row:5}},connections:{right:'gym1'},spawnPositions:[{col:4,row:4},{col:4,row:8}],enemyPool:['wrestler','judoka'],name:'Weight Area'},
    gym3:{id:'gym3',zone:2,weatherOptions:['clear'],weightClass:'middle',musicCue:'zone2',doors:{left:{col:0,row:5},up:{col:7,row:0}},connections:{left:'gym1',up:'gym4'},spawnPositions:[{col:11,row:4},{col:11,row:8}],enemyPool:['judoka','groundNPounder'],enemyPoolTrainers:['wrestler','judoka'],name:'Mats Hall'},
    // Dedicated Training Room: used for speed/accuracy/endurance minigame hooks
    // Also serves as the Zone 2 Rival Crossroads – metadata-only branching hooks
    // that let other systems offer two thematic encounter paths and boss archetypes
    // without hardcoding layout here.
    gym4:{id:'gym4',zone:2,weatherOptions:['clear'],weightClass:'middle',musicCue:'zone2',doors:{down:{col:7,row:11},up:{col:7,row:0}},connections:{down:'gym3',up:'gymTraining'},spawnPositions:[{col:7,row:4},{col:7,row:8}],enemyPool:['wrestler','groundNPounder','groundNPounder'],name:'Training Ring',
      rivalCrossroads:true,
      rivalCrossroadsZone:2,
      rivalCrossroadsLabel:'Rival Crossroads – Gym Paths',
      rivalCrossroadsBranches:[
        { id:'zone2_aggro', label:'Sparring Gauntlet Path', bossArchetype:'strikerBoss', description:'High-pressure striking rooms leading to an aggressive striker-style rival.' },
        { id:'zone2_technical', label:'Technical Clinic Path', bossArchetype:'grapplerBoss', description:'Grappling-heavy rooms that culminate in a methodical grappler rival.' }
      ]
    },
    gymTraining:{id:'gymTraining',zone:2,weatherOptions:['clear'],weightClass:'middle',musicCue:'zone2',doors:{down:{col:7,row:11},up:{col:7,row:0}},connections:{down:'gym4',up:'trainingSim'},spawnPositions:[{col:5,row:4},{col:9,row:4},{col:7,row:8}],enemyPool:['wrestler','judoka','groundNPounder'],trainingTypes:['speed','accuracy','endurance'],trainingLabel:'Gym Training Room'},
    // Training Simulation: slow-mo friendly practice space with infinite stamina & dummy targets
    trainingSim:{
      id:'trainingSim',
      zone:2,
      weatherOptions:['clear'],
      weightClass:'middle',
      doors:{down:{col:7,row:11}},
      connections:{down:'gymTraining'},
      spawnPositions:[{col:7,row:6}],
      enemyPool:[],
      name:'Training Simulation Ring',
      trainingSimulation:true,
      trainingSimLabel:'Training Simulation',
      trainingSimOptions:{ infiniteStamina:true, spawnDummies:true, allowSlowMoToggle:true }
    }
  },
  ZONE3_ROOMS: {
    // Crowd metadata for arena rooms
    // crowdSize: approximate number of spectators
    // baseHype: initial hype level (0-1)
    // maxHype: maximum hype achievable (0-1)
    // crowdLabel: short description displayed to player
    // weightClass: "light", "middle", "heavy" or "standard" (default)
    oct1:{id:'oct1',zone:3,weatherOptions:['clear','night','fog'],weightClass:'middle',musicCue:'zone3',cornerPressure:true,crowdSize:200,baseHype:0.3,maxHype:0.8,crowdLabel:'Rowdy Entrance Crowd',
      ringPowerups:true,ringPowerupTypes:['hp','stamina','focus'],crowdFunding:true,crowdHypemen:true,
      crowdHypemanBuffs:[
        { id:'damage', label:'+10% damage (3 rooms)' },
        { id:'hypeGain', label:'+15% hype gain (3 rooms)' },
        { id:'stamina', label:'+20% stamina regen (3 rooms)' }
      ],
      doors:{right:{col:15,row:5},up:{col:7,row:0}},connections:{right:'oct2',up:'oct3'},
      spawnPositions:[{col:3,row:4},{col:12,row:4}],enemyPool:['bjjBlackBelt'],name:'Arena Entrance',narratorStyle:'arenaPrelims'},
    oct2:{id:'oct2',zone:3,weatherOptions:['clear','night','wind','fog'],weightClass:'middle',musicCue:'zone3',cornerPressure:true,crowdSize:300,baseHype:0.5,maxHype:0.9,crowdLabel:'Boisterous Prelim Crowd',
      ringPowerups:true,ringPowerupTypes:['hp','stamina','focus'],crowdFunding:true,crowdHypemen:true,
      crowdHypemanBuffs:[
        { id:'damage', label:'+10% damage (3 rooms)' },
        { id:'hypeGain', label:'+15% hype gain (3 rooms)' },
        { id:'stamina', label:'+20% stamina regen (3 rooms)' }
      ],
      preFightBetting:true,
      bettingMinWager:100,
      bettingMaxWager:1000,
      bettingPayoutMultipliers:{ lowRisk:1.2, mediumRisk:1.6, highRisk:2.2 },
      doors:{left:{col:0,row:5}},connections:{left:'oct1'},
      spawnPositions:[{col:3,row:3},{col:3,row:8}],enemyPool:['bjjBlackBelt','bjjBlackBelt'],name:'Prelim Cage',narratorStyle:'arenaPrelims'},
    oct3:{id:'oct3',zone:3,weatherOptions:['clear','night','fog'],weightClass:'heavy',musicCue:'zone3',cornerPressure:true,crowdSize:500,baseHype:0.7,maxHype:1.0,crowdLabel:'Electric Main Cage Crowd',
      ringPowerups:true,ringPowerupTypes:['hp','stamina','focus'],crowdFunding:true,crowdHypemen:true,
      crowdHypemanBuffs:[
        { id:'damage', label:'+10% damage (3 rooms)' },
        { id:'hypeGain', label:'+15% hype gain (3 rooms)' },
        { id:'stamina', label:'+20% stamina regen (3 rooms)' }
      ],
      preFightBetting:true,
      bettingMinWager:200,
      bettingMaxWager:1500,
      bettingPayoutMultipliers:{ lowRisk:1.3, mediumRisk:1.8, highRisk:2.5 },
      doors:{down:{col:7,row:11},up:{col:7,row:0}},connections:{down:'oct1',up:'oct4'},
      spawnPositions:[{col:5,row:5},{col:9,row:5}],enemyPool:['bjjBlackBelt'],name:'Main Cage',narratorStyle:'arenaMain'},
    oct4:{id:'oct4',zone:3,weatherOptions:['clear','night'],weightClass:'heavy',musicCue:'boss',cornerPressure:true,crowdSize:800,baseHype:0.9,maxHype:1.0,crowdLabel:'Championship Crowd',
      ringPowerups:true,ringPowerupTypes:['hp','stamina','focus'],crowdFunding:true,crowdHypemen:true,
      crowdHypemanBuffs:[
        { id:'damage', label:'+10% damage (3 rooms)' },
        { id:'hypeGain', label:'+15% hype gain (3 rooms)' },
        { id:'stamina', label:'+20% stamina regen (3 rooms)' }
      ],
      doors:{down:{col:7,row:11},up:{col:7,row:0}},connections:{down:'oct3',up:'survival1'},
      spawnPositions:[{col:7,row:6}],enemyPool:['mmaChamp'],name:'Championship Ring',narratorStyle:'arenaTitle'},
    // Survival Time Attack: 90s endurance room with escalating waves and score focus
    survival1:{
      id:'survival1',
      zone:3,
      weatherOptions:['clear','night','fog'],
      weightClass:'heavy',
      musicCue:'zone3',cornerPressure:true,
      crowdSize:900,
      baseHype:0.6,
      maxHype:1.0,
      crowdLabel:'Time-Attack Crowd',
      ringPowerups:true,
      ringPowerupTypes:['hp','stamina','focus'],
      doors:{down:{col:7,row:11},up:{col:7,row:0}},
      connections:{down:'oct4',up:'rapid1'},
      spawnPositions:[{col:4,row:5},{col:11,row:5}],
      enemyPool:['bjjBlackBelt','mmaChamp'],
      name:'Survival Time Attack Cage',
      narratorStyle:'arenaSurvival',
      survivalMode:true,
      survivalDurationSeconds:90,
      survivalScoreMultiplier:1.5
    },
    // Rapid Fire Room: 15s escalation sprint with short-interval spawns
    // Combat/enemy systems read rapidFire* registry keys to drive wave logic.
    rapid1:{
      id:'rapid1',
      zone:3,
      weatherOptions:['clear','night'],
      weightClass:'heavy',
      cornerPressure:true,
      crowdSize:750,
      baseHype:0.7,
      maxHype:1.0,
      crowdLabel:'Rapid Fire Crowd',
      ringPowerups:true,
      ringPowerupTypes:['hp','stamina','focus'],
      doors:{down:{col:7,row:11},up:{col:7,row:0}},
      connections:{down:'survival1',up:'bossRush1'},
      spawnPositions:[{col:4,row:5},{col:11,row:5}],
      enemyPool:['bjjBlackBelt','mmaChamp'],
      name:'Rapid Fire Cage',
      narratorStyle:'arenaSurvival',
      rapidFireMode:true,
      rapidFireDurationSeconds:15,
      rapidFireSpawnIntervalSeconds:2,
      rapidFireScoreMultiplier:2.0
    },
    // Boss Rush Corridor: sequential mini-boss gauntlet with no healing between waves
    bossRush1:{
      id:'bossRush1',
      zone:3,
      weatherOptions:['clear','night'],
      weightClass:'heavy',
      cornerPressure:true,
      crowdSize:900,
      baseHype:0.8,
      maxHype:1.0,
      crowdLabel:'Boss Rush Crowd',
      ringPowerups:true,
      ringPowerupTypes:['hp','stamina','focus'],crowdFunding:true,
      doors:{down:{col:7,row:11}},
      connections:{down:'rapid1'},
      spawnPositions:[{col:7,row:5}],
      enemyPool:['mmaChamp'],
      name:'Boss Rush Corridor',
      narratorStyle:'arenaTitle',
      bossRushMode:true,
      bossRushWaves:3,
      bossRushWaveEnemyPool:['mmaChamp','bjjBlackBelt'],
      bossRushNoHealBetweenWaves:true,
      bossRushRewardTags:['rare','equipment']
    }

  },
  // Zone 4: Champion's Dojo – endless arena unlocked after championship
  ZONE4_ROOMS: {
    dojo1:{
      id:'dojo1',
      zone:4,
      weatherOptions:['clear','night'],
      weightClass:'heavy',
      cornerPressure:true,
      // Champion's Dojo uses arena-style crowd metadata
      crowdSize:600,
      baseHype:0.6,
      maxHype:1.0,
      crowdLabel:'Legendary Dojo Crowd',
      // Ring side power-ups are active in the Dojo as well
      ringPowerups:true,
      ringPowerupTypes:['hp','stamina','focus'],crowdFunding:true,crowdHypemen:true,
      crowdHypemanBuffs:[
        { id:'damage', label:'+10% damage (3 rooms)' },
        { id:'hypeGain', label:'+15% hype gain (3 rooms)' },
        { id:'stamina', label:'+20% stamina regen (3 rooms)' }
      ],
      doors:{down:{col:7,row:11}},
      connections:{down:'oct4'},
      spawnPositions:[{col:7,row:5}],
      enemyPool:['mmaChamp'],
      name:"Champion's Dojo",
      narratorStyle:'dojoLegend',
      dojoMode:'championsDojo'
    }
  },
  getRoom: function(roomId){ return this.ZONE1_ROOMS[roomId] || this.ZONE2_ROOMS[roomId] || this.ZONE3_ROOMS[roomId] || this.ZONE4_ROOMS[roomId]; },
  getConnectedRoom: function(roomId, direction){ var r = this.getRoom(roomId); return r && r.connections ? r.connections[direction] : null; },
  getRoomSpawnPositions: function(roomId){ var r = this.getRoom(roomId); return r ? r.spawnPositions : []; },
  getRoomEnemyPool: function(roomId){ var r = this.getRoom(roomId); return r ? r.enemyPool : ['streetThug']; },
  getDoorDirection: function(room, col, row){ if (!room || !room.doors) return null; for (var dir in room.doors) if (room.doors[dir].col === col && room.doors[dir].row === row) return dir; return null; },
  // Weight class helpers
  getWeightClassForRoom: function(roomId) {
    var r = this.getRoom(roomId);
    return r && r.weightClass ? r.weightClass : 'standard';
  },
  getWeightClassLabel: function(weightClass) {
    if (weightClass === 'light') return 'Lightweight';
    if (weightClass === 'middle') return 'Middleweight';
    if (weightClass === 'heavy') return 'Heavyweight';
    return 'Standard';
  },
  computeWeightClassModifiers: function(weightClass) {
    // These multipliers are intentionally subtle so other systems can layer
    // them on top of existing stats without feeling unfair.
    if (weightClass === 'light') {
      return { speedMultiplier: 1.10, powerMultiplier: 0.92 };
    } else if (weightClass === 'middle') {
      return { speedMultiplier: 1.0, powerMultiplier: 1.0 };
    } else if (weightClass === 'heavy') {
      return { speedMultiplier: 0.92, powerMultiplier: 1.10 };
    }
    return { speedMultiplier: 1.0, powerMultiplier: 1.0 };
  },
  // Helper to get crowd metadata for a room (if any)
  getCrowdInfo: function(roomId) {
    var room = this.getRoom(roomId);
    if (!room) return null;
    if (room.crowdSize !== undefined) {
      return {
        crowdSize: room.crowdSize,
        baseHype: room.baseHype,
        maxHype: room.maxHype,
        crowdLabel: room.crowdLabel
      };
    }
    return null;
  },
  // Zone Narrator profiles: used by combat/UI systems to route commentary events.
  // This keeps per-zone voice and hype tuning in one place.
  getNarratorProfile: function(roomId) {
    var room = this.getRoom(roomId);
    if (!room) return null;
    var zone = room.zone || 1;
    // Only arena-style zones currently use live commentary
    if (zone !== 3 && zone !== 4) return null;
    var style = room.narratorStyle || 'arenaPrelims';
    var profile = {
      id: style,
      // base chance that a notable event produces a line (0-1)
      baseCommentChance: 0.35,
      // additional chance per 5-hit combo bucket
      comboCommentStep: 0.15,
      // how much hype a single line should add in arena zones
      hypePerComment: 0.05,
      // clamp so commentary cannot completely override design-time hype
      maxExtraHype: 0.25
    };
    // Slight flavor differences by style
    if (style === 'arenaMain') {
      profile.baseCommentChance = 0.45;
      profile.hypePerComment = 0.06;
    } else if (style === 'arenaTitle') {
      profile.baseCommentChance = 0.55;
      profile.hypePerComment = 0.08;
    } else if (style === 'arenaSurvival') {
      profile.baseCommentChance = 0.40;
      profile.hypePerComment = 0.05;
    } else if (style === 'dojoLegend') {
      profile.baseCommentChance = 0.50;
      profile.hypePerComment = 0.07;
    }
    return profile;
  },
  // Internal helper: pick a commentary line based on event type and payload.
  _pickNarratorLine: function(style, eventType, payload) {
    var combo = payload && payload.comboCount ? payload.comboCount : 0;
    if (eventType === 'combo') {
      if (combo >= 15) {
        return "He's putting on a clinic out there – " + combo + "+ hit combo!";
      } else if (combo >= 10) {
        return "Huge sequence – " + combo + " clean shots in a row!";
      } else if (combo >= 5) {
        return "Beautiful combination work, mixing levels nicely.";
      }
      return 'Sharp hands – staying just a step ahead in these exchanges.';
    } else if (eventType === 'comeback') {
      return 'What a comeback – he was hurt and now he is turning the whole fight around!';
    } else if (eventType === 'finish') {
      return 'That is it! What a finish – the crowd is on their feet!';
    } else if (eventType === 'hurt') {
      return 'He is wobbled – those shots are really starting to add up.';
    }
    // fallback
    return 'High-level chess in there – every move has a purpose.';
  },
  // Apply a commentary event: combat systems can call this with notable moments.
  // This function is side-effectful: it may raise crowd hype and update HUD text.
  handleNarratorEvent: function(scene, eventType, payload) {
    if (!scene || !scene.registry || !scene.currentRoomId) return;
    var profile = this.getNarratorProfile(scene.currentRoomId);
    if (!profile) return;
    // Decide whether to speak for this event
    var combo = payload && payload.comboCount ? payload.comboCount : 0;
    var comboBuckets = Math.floor(combo / 5);
    var chance = profile.baseCommentChance + comboBuckets * profile.comboCommentStep;
    if (chance > 0.85) chance = 0.85;
    if (Math.random() > chance) return;
    var line = this._pickNarratorLine(profile.id, eventType, payload || {});
    // Hype + damage bonus tuning
    var crowdActive = scene.registry.get('crowdActive');
    if (crowdActive) {
      var currentHype = scene.registry.get('crowdHype') || 0;
      var baseHype = scene.registry.get('crowdBaseHype') || 0;
      var maxHype = scene.registry.get('crowdMaxHype') || 1;
      var extraHype = currentHype - baseHype;
      if (extraHype < 0) extraHype = 0;
      var allowedExtra = profile.maxExtraHype;
      var delta = profile.hypePerComment;
      if (extraHype + delta > allowedExtra) {
        delta = Math.max(0, allowedExtra - extraHype);
      }
      if (delta > 0) {
        var newHype = currentHype + delta;
        if (newHype > maxHype) newHype = maxHype;
        scene.registry.set('crowdHype', newHype);
        var bonus = this.computeCrowdDamageBonus(newHype);
        scene.registry.set('crowdDamageBonus', bonus);
      }
    }
    // Surface a short-lived commentary line to HUD
    scene.registry.set('gameMessage', 'Commentary: ' + line);
    scene.time.delayedCall(2600, function(){ scene.registry.set('gameMessage', ''); });
  },
  // Corner Pressure configuration helper
  // Used by combat systems to determine when the player is "backed into the ropes".
  // We keep this data here so all arena geometry stays zone-driven.
  getCornerPressureConfig: function(roomId) {
    var room = this.getRoom(roomId);
    if (!room || !room.cornerPressure) return null;
    // Default to a 2x2 tile pocket in each corner of the ring.
    // These are expressed in tile coordinates so movement systems can
    // cheaply compare the player's grid position.
    var regions = [
      { colMin:1, colMax:2, rowMin:1, rowMax:2 },
      { colMin:13, colMax:14, rowMin:1, rowMax:2 },
      { colMin:1, colMax:2, rowMin:9, rowMax:10 },
      { colMin:13, colMax:14, rowMin:9, rowMax:10 }
    ];
    // Multipliers are intentionally modest – other buffs/debuffs stack on top.
    return {
      active: true,
      damageTakenMultiplier: 1.10,   // player takes +10% damage when cornered
      damageDealtMultiplier: 1.15,   // but deals +15% damage when they swing back
      regions: regions
    };
  },
  // Arena Wall Tech configuration helper
  // Exposes rope and corner post regions so movement/combat systems can
  // implement bounces, vaults, and rope-trip interactions without hardcoding
  // geometry. This is intentionally conservative so it layers cleanly with
  // corner pressure and crowd dynamics.
  getArenaWallTechConfig: function(roomId) {
    var room = this.getRoom(roomId);
    if (!room) return null;
    // Only cage/arena style zones support wall tech for now.
    if (room.zone !== 3 && room.zone !== 4) return null;
    // Use the same 16x12 tile grid assumptions as buildRoom(). Perimeter
    // walls live on col 0/15 and row 0/11; we keep interaction pockets just
    // inside those tiles so collision checks stay simple.
    var ropeSegments = [
      // Top and bottom ropes (horizontal runs just inside perimeter walls)
      { colMin:1, colMax:14, rowMin:1, rowMax:1, side:'top' },
      { colMin:1, colMax:14, rowMin:10, rowMax:10, side:'bottom' },
      // Left and right ropes (vertical runs)
      { colMin:1, colMax:1, rowMin:1, rowMax:10, side:'left' },
      { colMin:14, colMax:14, rowMin:1, rowMax:10, side:'right' }
    ];
    var cornerPosts = [
      { col:1, row:1, label:'topLeft' },
      { col:14, row:1, label:'topRight' },
      { col:1, row:10, label:'bottomLeft' },
      { col:14, row:10, label:'bottomRight' }
    ];
    return {
      active: true,
      // Bounce dodge: quick wall-touch dodge uses these speed modifiers
      bounceDodgeSpeedMultiplier: 1.20,
      bounceDodgeStaminaCostMultiplier: 1.15,
      // Rope vault: aerial attack launched off the ropes
      ropeVaultDamageMultiplier: 1.30,
      ropeVaultStaminaCostMultiplier: 1.25,
      // Rope trip: grappler-only bonus when slamming opponents into ropes
      ropeTripDamageMultiplier: 1.40,
      ropeTripStunSeconds: 0.75,
      ropeSegments: ropeSegments,
      cornerPosts: cornerPosts
    };
  },
  // Environmental Hazard Rooms helper
  // Encodes special room variants like slippery floors, loose ropes,
  // dark/limited-visibility arenas, and electrified cages entirely via
  // metadata so combat/movement systems can opt-in by reading registry
  // state instead of hardcoding specific room ids.
  getHazardConfigForRoom: function(roomId) {
    var room = this.getRoom(roomId);
    if (!room) return null;
    // For the first pass we keep things simple and flag a single
    // high-intensity arena room as an electrified cage hazard. This
    // gives combat and movement systems a clear place to hook in
    // without changing base arena layouts.
    if (room.id === 'survival1') {
      return {
        active: true,
        type: 'electrifiedCage',
        label: 'Electrified Cage',
        // Touching perimeter walls/ropes can be treated as periodic chip
        // damage by combat systems. Values are intentionally conservative
        // so this stacks gently with Corner Pressure and Wall Tech.
        wallTouchDamageMultiplier: 1.25,
        wallTouchTickSeconds: 1.0,
        visibilityMultiplier: 0.9,
        // Optional hook for VFX/audio systems: brief zap on contact.
        vfxKey: 'hazardZap',
        sfxKey: 'hazardZap'
      };
    }
    return null;
  },
  // Compute damage bonus (0 to 0.10) based on current hype (0-1)
  computeCrowdDamageBonus: function(hype) {
    var maxBonus = 0.10;
    return Math.min(maxBonus, maxBonus * hype);
  },
  // Crowd Hypeman helpers
  // Certain arena rooms flag specific crowd members as "hypemen" that can
  // be acknowledged (usually via a pre-fight taunt) to grant temporary
  // buffs. Zones only define metadata here – combat/UI systems are
  // responsible for wiring input and buff application.
  getCrowdHypemanConfig: function(roomId) {
    var room = this.getRoom(roomId);
    if (!room || !room.crowdHypemen) return null;
    return {
      active: true,
      // Available buff choices for this room. Each entry is a lightweight
      // descriptor that downstream systems can interpret as they like
      // (e.g., 3-room duration crowd buffs).
      buffs: (room.crowdHypemanBuffs || []).slice()
    };
  },
  // Pre-Fight Betting helpers
  // Certain high-profile arena rooms support a lightweight betting layer
  // before combat begins. Zones only define metadata here – UI and combat
  // systems are responsible for presenting wager options and resolving
  // payouts. This keeps betting optional and data-driven.
  getPreFightBettingConfig: function(roomId) {
    var room = this.getRoom(roomId);
    if (!room || !room.preFightBetting) return null;
    var min = room.bettingMinWager != null ? room.bettingMinWager : 100;
    var max = room.bettingMaxWager != null ? room.bettingMaxWager : 1000;
    var multipliers = room.bettingPayoutMultipliers || { lowRisk:1.2, mediumRisk:1.6, highRisk:2.2 };
    return {
      active: true,
      minWager: min,
      maxWager: max,
      payoutMultipliers: {
        lowRisk: multipliers.lowRisk || 1.2,
        mediumRisk: multipliers.mediumRisk || 1.6,
        highRisk: multipliers.highRisk || 2.2
      }
    };
  },
  // Crowd Funding System helpers
  // Arena zones with crowdFunding:true can accumulate a between-rooms
  // "donation" pool based on fight performance and current hype. Combat
  // systems can later spend this balance for mid-combat boosts.
  getCrowdFundingConfig: function(roomId) {
    var room = this.getRoom(roomId);
    if (!room || !room.crowdFunding) return null;
    var crowd = this.getCrowdInfo(roomId) || { crowdSize: 0 };
    // Keep numbers small so it feels like pocket money earned between rooms.
    return {
      active: true,
      // Base donation rate per point of performance score.
      // Final credit = performanceScore * (rate * crowdSizeScale)
      baseRate: 0.15,
      // Soft cap so one fight cannot flood the meter.
      maxPerFight: 150,
      // Crowd size increases generosity but with diminishing returns.
      crowdSizeScale: Math.min(3, 0.001 * (crowd.crowdSize || 0) + 0.25)
    };
  },
  // Rival Crossroads helpers
  // Metadata-only implementation of the backlog's "Rival Crossroads" feature.
  // Specific rooms (usually mid-zone hubs) can advertise multiple branch
  // options that lead to different encounter/boss archetypes. Zones just
  // define the data; player/combat/UI systems decide how to surface choices
  // and what branching actually does.
  getRivalCrossroadsConfig: function(roomId) {
    var room = this.getRoom(roomId);
    if (!room || !room.rivalCrossroads) return null;
    return {
      active: true,
      zone: room.rivalCrossroadsZone || room.zone || 1,
      label: room.rivalCrossroadsLabel || 'Rival Crossroads',
      branches: (room.rivalCrossroadsBranches || []).slice()
    };
  },
  // Store/read the currently chosen branch for this run so other systems can
  // tune enemy spawns, loot, or boss archetypes downstream without having to
  // know which room originally presented the decision.
  applyRivalCrossroadsChoice: function(scene, branchId) {
    if (!scene || !scene.registry || !branchId) return;
    scene.registry.set('rivalCrossroadsChosenBranch', branchId);
  },
  getRivalCrossroadsChoice: function(scene) {
    if (!scene || !scene.registry) return null;
    return scene.registry.get('rivalCrossroadsChosenBranch') || null;
  },
  // Register performance after a fight to grow the crowd funding pool.
  // payload can include: damageDealt, killCount, maxCombo.
  registerCrowdFundingPerformance: function(scene, payload) {
    if (!scene || !scene.registry || !scene.currentRoomId) return;
    var cfg = this.getCrowdFundingConfig(scene.currentRoomId);
    if (!cfg || !cfg.active) return;
    var damage = payload && payload.damageDealt ? payload.damageDealt : 0;
    var kills = payload && payload.killCount ? payload.killCount : 0;
    var combo = payload && payload.maxCombo ? payload.maxCombo : 0;
    // Simple weighted score: damage carries most weight, then kills, then combo flair.
    var performanceScore = (damage * 0.04) + (kills * 6) + (combo * 1.2);
    if (performanceScore <= 0) return;
    var hype = scene.registry.get('crowdHype') || 0;
    // Hype makes the crowd more generous (up to +50%).
    var hypeScale = 1 + 0.5 * Math.max(0, Math.min(1, hype));
    var donationRaw = performanceScore * cfg.baseRate * cfg.crowdSizeScale * hypeScale;
    var donation = Math.min(cfg.maxPerFight, donationRaw);
    if (donation <= 0.5) return; // Ignore tiny trickles.
    var existing = scene.registry.get('crowdFundingBalance') || 0;
    var newBalance = existing + Math.round(donation);
    scene.registry.set('crowdFundingBalance', newBalance);
    // Optional subtle HUD ping so players notice momentum without spam.
    scene.registry.set('gameMessage', 'Crowd Funding: +$'+Math.round(donation)+' from the arena crowd.');
    scene.time.delayedCall(2200, function(){ scene.registry.set('gameMessage', ''); });
  },
  // Time-of-day helpers for outdoor zones (currently used by Zone 1 street rooms)
  // Stored on the scene registry so other systems (UI, VFX) can read it.
  getTimeOfDayPhase: function(scene) {
    if (!scene || !scene.registry) return 'day';
    var phase = scene.registry.get('timeOfDayPhase');
    if (!phase) phase = 'day';
    return phase;
  },
  advanceTimeOfDay: function(scene) {
    if (!scene || !scene.registry) return;
    var current = this.getTimeOfDayPhase(scene);
    var order = ['day', 'sunset', 'night'];
    var idx = order.indexOf(current);
    if (idx === -1) idx = 0;
    var next = order[(idx + 1) % order.length];
    scene.registry.set('timeOfDayPhase', next);
    var label = next === 'day' ? 'Day' : (next === 'sunset' ? 'Sunset' : 'Night');
    scene.registry.set('timeOfDayLabel', label);
  },
  // Weather Adaptation System helpers
  // Lightweight, run-local implementation of the backlog's weather affinity
  // concept. We track how many rooms the player has fought in for each
  // weather type this session and expose small, data-driven multipliers that
  // combat systems can opt into. Affinity is intentionally subtle so it
  // layers cleanly with existing buffs like crowd hype and weight class.
  _getWeatherAffinityState: function(scene) {
    if (!scene || !scene.registry) return { map:{}, lastType:null };
    var map = scene.registry.get('weatherAffinityMap');
    if (!map) map = {};
    var last = scene.registry.get('weatherLastType') || null;
    return { map: map, lastType: last };
  },
  _storeWeatherAffinityState: function(scene, state) {
    if (!scene || !scene.registry || !state) return;
    scene.registry.set('weatherAffinityMap', state.map || {});
    scene.registry.set('weatherLastType', state.lastType || null);
  },
  _updateWeatherAffinityOnEnter: function(scene, weatherType) {
    if (!scene || !scene.registry || !weatherType) return;
    var state = this._getWeatherAffinityState(scene);
    var map = state.map;
    if (!map[weatherType]) map[weatherType] = { rooms:0, level:0 };
    // Increment exposure for this weather and recompute a coarse level.
    map[weatherType].rooms += 1;
    var rooms = map[weatherType].rooms;
    // Level 0: 0-2 rooms, Level 1: 3-5, Level 2: 6-8, Level 3+: 9+
    var level = 0;
    if (rooms >= 3 && rooms <= 5) level = 1;
    else if (rooms >= 6 && rooms <= 8) level = 2;
    else if (rooms >= 9) level = 3;
    map[weatherType].level = level;
    state.lastType = weatherType;
    this._storeWeatherAffinityState(scene, state);
    // Expose small damage / stamina efficiency multipliers keyed off level.
    var dmgMult = 1.0 + (0.04 * level);
    var staminaMult = 1.0 + (0.03 * level);
    scene.registry.set('weatherAffinityType', weatherType);
    scene.registry.set('weatherAffinityLevel', level);
    scene.registry.set('weatherAffinityDamageMultiplier', dmgMult);
    scene.registry.set('weatherAffinityStaminaMultiplier', staminaMult);
    // Surface a short, non-spammy message when the level increases.
    var lastNotifiedLevel = scene.registry.get('weatherAffinityLastNotifiedLevel_' + weatherType) || 0;
    if (level > 0 && level !== lastNotifiedLevel) {
      scene.registry.set('weatherAffinityLastNotifiedLevel_' + weatherType, level);
      var label = weatherType.charAt(0).toUpperCase() + weatherType.slice(1);
      var dmgPct = Math.round((dmgMult - 1.0) * 100);
      var stamPct = Math.round((staminaMult - 1.0) * 100);
      var msg = 'Weather Affinity: comfortable in ' + label + ' – +' + dmgPct + '% damage, +' + stamPct + '% stamina efficiency.';
      scene.time.delayedCall(2550, function(){
        scene.registry.set('gameMessage', msg);
        scene.time.delayedCall(2600, function(){ scene.registry.set('gameMessage', ''); });
      });
    }
  },
  // Weather helper: choose a weather type for the given room
  // weatherOptions on the room (array of strings) is preferred; otherwise we
  // infer from the zone (zone 1: outdoor street, zone 2: indoor gym, zone 3: arena).
  // Time-of-day adjusts visibility and mood in outdoor spaces.
  chooseWeatherForRoom: function(scene, room) {
    if (!room) return { type: 'clear' };
    var options = room.weatherOptions;
    if (!options || !options.length) {
      // Fallbacks by zone
      if (room.zone === 1) options = ['clear', 'clear', 'rain', 'night', 'wind'];
      else if (room.zone === 2) options = ['clear'];
      else if (room.zone === 3) options = ['clear', 'night'];
      else options = ['clear'];
    }
    var idx = Math.floor(Math.random() * options.length);
    var t = options[idx];
    var weather = { type: t };
    // Derived flags used by other systems (movement, projectiles, VFX)
    if (t === 'rain') {
      weather.slippery = true; // movement systems can read this
      weather.visibilityMultiplier = 0.9;
      weather.projectileDrift = 0;
      weather.label = 'Rain';
      weather.message = 'Rain makes the canvas slick – watch your footing.';
    } else if (t === 'night') {
      weather.slippery = false;
      weather.visibilityMultiplier = 0.6;
      weather.projectileDrift = 0;
      weather.label = 'Night';
      weather.message = 'Night lights limit visibility – pick your shots carefully.';
    } else if (t === 'wind') {
      weather.slippery = false;
      weather.visibilityMultiplier = 1.0;
      weather.projectileDrift = 0.35; // used for projectiles/long strikes
      weather.label = 'Wind';
      weather.message = 'Heavy wind can push projectiles off-line.';
    } else {
      weather.slippery = false;
      weather.visibilityMultiplier = 1.0;
      weather.projectileDrift = 0;
      weather.label = 'Clear';
      weather.message = '';
    }
    // Apply time-of-day visibility adjustment for outdoor zones.
    var phase = this.getTimeOfDayPhase(scene);
    var visFactor = 1.0;
    if (room.zone === 1) {
      if (phase === 'sunset') visFactor = 0.85;
      else if (phase === 'night') visFactor = 0.65;
    }
    weather.visibilityMultiplier = (weather.visibilityMultiplier || 1.0) * visFactor;
    return weather;
  },
  applyWeatherToScene: function(scene, room) {
    var weather = this.chooseWeatherForRoom(scene, room);
    // Update lightweight, session-local weather affinity state so combat
    // systems can reward players who repeatedly fight in the same
    // conditions. This keeps the "Weather Adaptation System" fully
    // zone-driven and requires no save-file changes.
    this._updateWeatherAffinityOnEnter(scene, weather.type);
    var active = weather.type !== 'clear';
    scene.registry.set('weatherActive', active);
    scene.registry.set('weatherType', weather.type);
    scene.registry.set('weatherSlippery', !!weather.slippery);
    scene.registry.set('weatherVisibilityMultiplier', weather.visibilityMultiplier || 1.0);
    scene.registry.set('weatherProjectileDrift', weather.projectileDrift || 0);
    scene.registry.set('weatherLabel', weather.label || '');
    if (active && weather.message) {
      // Show after crowd message so we do not spam the HUD
      scene.time.delayedCall(4500, function(){
        scene.registry.set('gameMessage', 'Weather: ' + weather.label + ' - ' + weather.message);
        scene.time.delayedCall(2500, function(){ scene.registry.set('gameMessage', ''); });
      });
    } else if (!active) {
      scene.registry.set('weatherLabel', '');
    }
  },
  buildRoom: function(scene, roomId) {
    var DT = CONFIG.DISPLAY_TILE, room = this.getRoom(roomId), zone = room && room.zone ? room.zone : 1;
    var floorKey = zone === 2 ? 'gymFloor' : ((zone === 3 || zone === 4) ? 'cageFloor' : 'floor');
    var wallKey = zone === 2 ? 'gymWalls' : ((zone === 3 || zone === 4) ? 'cageWall' : 'wall');
    scene.walls.clear(true, true); scene.doors.clear(true, true);
    scene.children.list.filter(function(child){ return child.texture && (child.texture.key === 'floor' || child.texture.key === 'gymFloor' || child.texture.key === 'cageFloor' || child.texture.key === 'crateProp' || child.texture.key === 'debrisProp' || child.texture.key === 'lampProp'); }).forEach(function(tile){ tile.destroy(); });
    for (var col=0; col<16; col++) for (var row=0; row<12; row++) {
      var x = col * DT + DT/2, y = row * DT + DT/2, isDoor = false;
      if (room && room.doors) { for (var dir in room.doors) { var d = room.doors[dir]; if (d.col === col && d.row === row) isDoor = true; } }
      if (col===0 || col===15 || row===0 || row===11) {
        if (!isDoor) scene.walls.create(x,y,wallKey).setDisplaySize(DT,DT).refreshBody();
        else scene.doors.create(x,y,wallKey).setDisplaySize(DT,DT).setAlpha(0.3).setData('direction', this.getDoorDirection(room,col,row));
      } else {
        scene.add.image(x,y,floorKey).setDisplaySize(DT,DT);
        if (zone === 1) {
          var r = Math.random();
          if (r < 0.02) scene.add.image(x,y,'lampProp').setDisplaySize(DT,DT).setAlpha(0.7);
          else if (r < 0.06) scene.add.image(x,y,'crateProp').setDisplaySize(DT,DT).setAlpha(0.55);
          else if (r < 0.12) scene.add.image(x,y,'debrisProp').setDisplaySize(DT,DT).setAlpha(0.65);
        }
      }
    }
    if (room) {
      // Set basic zone message
      scene.registry.set('gameMessage', 'ZONE ' + zone + ' - ' + room.name);
      scene.time.delayedCall(2000, function(){ scene.registry.set('gameMessage', ''); });
      // Crowd dynamics registry values
      var crowd = this.getCrowdInfo(roomId);
      if (crowd) {
        var hype = Math.min(1, Math.max(0, crowd.baseHype));
        var bonus = this.computeCrowdDamageBonus(hype);
        scene.registry.set('crowdActive', true);
        scene.registry.set('crowdHype', hype);
        scene.registry.set('crowdBaseHype', hype);
        scene.registry.set('crowdMaxHype', crowd.maxHype || 1);
        scene.registry.set('crowdMaxBonus', 0.10);
        scene.registry.set('crowdDamageBonus', bonus);
        scene.registry.set('crowdLabel', crowd.crowdLabel);
        // Show crowd message after short delay to avoid spam
        scene.time.delayedCall(2500, function(){
          var pct = Math.round(bonus * 100);
          scene.registry.set('gameMessage', 'Crowd is HYPED (+'+pct+'% damage)!');
          scene.time.delayedCall(2000, function(){ scene.registry.set('gameMessage', ''); });
        });
      } else {
        // No crowd info – disable crowd effects
        scene.registry.set('crowdActive', false);
        scene.registry.set('crowdHype', 0);
        scene.registry.set('crowdBaseHype', 0);
        scene.registry.set('crowdMaxHype', 0);
        scene.registry.set('crowdMaxBonus', 0);
        scene.registry.set('crowdDamageBonus', 0);
        scene.registry.set('crowdLabel', '');
      }
      // Pre-Fight Betting metadata: optional wager layer for select arena rooms.
      // When active, UI can surface bet choices and combat systems can
      // resolve payouts after the room is cleared.
      var bettingCfg = this.getPreFightBettingConfig(room.id);
      if (bettingCfg && bettingCfg.active) {
        scene.registry.set('bettingActive', true);
        scene.registry.set('bettingMinWager', bettingCfg.minWager);
        scene.registry.set('bettingMaxWager', bettingCfg.maxWager);
        scene.registry.set('bettingPayoutMultipliers', bettingCfg.payoutMultipliers);
        scene.time.delayedCall(2100, function(){
          scene.registry.set('gameMessage', 'Pre-Fight Betting: place wagers before the bell for bonus rewards.');
          scene.time.delayedCall(2300, function(){ scene.registry.set('gameMessage', ''); });
        });
      } else {
        scene.registry.set('bettingActive', false);
        scene.registry.set('bettingMinWager', 0);
        scene.registry.set('bettingMaxWager', 0);
        scene.registry.set('bettingPayoutMultipliers', { lowRisk:1.0, mediumRisk:1.0, highRisk:1.0 });
      }
      // Crowd Funding System metadata: arena-only donation pool based on
      // fight performance and hype. This is intentionally light-touch –
      // combat systems decide when/how to spend it for one-time boosts.
      if (room.crowdFunding && scene.registry.get('crowdActive')) {
        scene.registry.set('crowdFundingActive', true);
        // Preserve any existing balance when re-entering the same arena.
        var existingBalance = scene.registry.get('crowdFundingBalance');
        if (existingBalance == null) {
          scene.registry.set('crowdFundingBalance', 0);
        }
        // Static menu of boosts that other systems can hook into.
        scene.registry.set('crowdFundingOptions', [
          { id:'damageSpike', label:'+30% damage next attack', cost:75 },
          { id:'staminaRefill', label:'Instant +50% stamina', cost:60 },
          { id:'enemyDistraction', label:'Crowd distraction – next enemy attack whiffs', cost:90 }
        ]);
      } else {
        scene.registry.set('crowdFundingActive', false);
        // Preserve balance so donations feel persistent within the broader arena run.
        scene.registry.set('crowdFundingOptions', []);
      }
      // Rival Crossroads metadata: mid-zone decision rooms that let players
      // pick between different encounter/boss archetype paths. Implementation
      // is intentionally metadata-only here so that combat/player systems can
      // hook into it without the zones file owning progression logic.
      var crossroadsCfg = this.getRivalCrossroadsConfig(room.id);
      if (crossroadsCfg && crossroadsCfg.active && crossroadsCfg.branches.length) {
        scene.registry.set('rivalCrossroadsActive', true);
        scene.registry.set('rivalCrossroadsZone', crossroadsCfg.zone);
        scene.registry.set('rivalCrossroadsLabel', crossroadsCfg.label);
        scene.registry.set('rivalCrossroadsBranches', crossroadsCfg.branches);
        // Do not overwrite an existing choice – that is up to the systems
        // that actually present and resolve the decision.
        if (!scene.registry.get('rivalCrossroadsChosenBranch')) {
          scene.registry.set('rivalCrossroadsChosenBranch', null);
        }
        scene.time.delayedCall(2300, function(){
          var label = crossroadsCfg.label;
          scene.registry.set('gameMessage', label + ': choose your path to shape which rival awaits.');
          scene.time.delayedCall(2600, function(){ scene.registry.set('gameMessage', ''); });
        });
      } else {
        scene.registry.set('rivalCrossroadsActive', false);
        scene.registry.set('rivalCrossroadsZone', 0);
        scene.registry.set('rivalCrossroadsLabel', '');
        scene.registry.set('rivalCrossroadsBranches', []);
        // We deliberately keep rivalCrossroadsChosenBranch sticky across rooms
        // so downstream systems can continue to read it.
      }
      // Training Room metadata: used by player/combat/UI systems for minigames
      if (room.trainingTypes && room.trainingTypes.length) {
        scene.registry.set('trainingActive', true);
        scene.registry.set('trainingTypes', room.trainingTypes.slice());
        scene.registry.set('trainingLabel', room.trainingLabel || 'Training Room');
        // Lightweight flavor message so players know they are in a training space
        scene.time.delayedCall(2200, function(){
          scene.registry.set('gameMessage', 'Training Room: speed, accuracy, endurance drills available.');
          scene.time.delayedCall(2200, function(){ scene.registry.set('gameMessage', ''); });
        });
      } else {
        scene.registry.set('trainingActive', false);
        scene.registry.set('trainingTypes', []);
        scene.registry.set('trainingLabel', '');
      }
      // Training Simulation metadata: sandbox practice room with infinite stamina & dummy targets
      if (room.trainingSimulation) {
        scene.registry.set('trainingSimActive', true);
        scene.registry.set('trainingSimLabel', room.trainingSimLabel || 'Training Simulation');
        scene.registry.set('trainingSimOptions', room.trainingSimOptions || { infiniteStamina:true, spawnDummies:true, allowSlowMoToggle:true });
        scene.time.delayedCall(2350, function(){
          scene.registry.set('gameMessage', 'Training Simulation: infinite stamina and dummy targets – perfect for learning patterns.');
          scene.time.delayedCall(2600, function(){ scene.registry.set('gameMessage', ''); });
        });
      } else {
        scene.registry.set('trainingSimActive', false);
        scene.registry.set('trainingSimLabel', '');
        scene.registry.set('trainingSimOptions', {});
      }
      // Clinic / Medical Bay metadata: between-zone healing & injury removal hooks
      if (room.clinic) {
        scene.registry.set('clinicActive', true);
        scene.registry.set('clinicLabel', room.clinicLabel || 'Clinic');
        scene.registry.set('clinicServices', room.clinicServices || { healHp:true, removeInjuries:true });
        scene.registry.set('clinicBaseCost', room.clinicBaseCost != null ? room.clinicBaseCost : 25);
        scene.registry.set('clinicCostPerZone', room.clinicCostPerZone != null ? room.clinicCostPerZone : 10);
        // Hint to the player that this is a recovery-focused space
        scene.time.delayedCall(2150, function(){
          scene.registry.set('gameMessage', 'Clinic: spend fight earnings to heal up or clear lingering injuries.');
          scene.time.delayedCall(2600, function(){ scene.registry.set('gameMessage', ''); });
        });
      } else {
        scene.registry.set('clinicActive', false);
        scene.registry.set('clinicLabel', '');
        scene.registry.set('clinicServices', {});
        scene.registry.set('clinicBaseCost', 0);
        scene.registry.set('clinicCostPerZone', 0);
      }
      // Secret Room metadata: hidden rooms with bonus loot/currency hooks
      if (room.secret) {
        scene.registry.set('secretRoomActive', true);
        scene.registry.set('secretRoomLabel', room.secretLabel || room.secretLabel || 'Secret Room');
        scene.registry.set('secretBonusLootTags', (room.bonusLootTags || []).slice());
        scene.registry.set('secretCurrencyMultiplier', room.bonusCurrencyMultiplier != null ? room.bonusCurrencyMultiplier : 1.5);
        scene.time.delayedCall(2250, function(){
          scene.registry.set('gameMessage', 'Secret Room: bonus loot and extra payout opportunities here.');
          scene.time.delayedCall(2600, function(){ scene.registry.set('gameMessage', ''); });
        });
      } else {
        scene.registry.set('secretRoomActive', false);
        scene.registry.set('secretRoomLabel', '');
        scene.registry.set('secretBonusLootTags', []);
        scene.registry.set('secretCurrencyMultiplier', 1.0);
      }
      // Weight Class metadata: used by player/combat systems to adjust speed vs power
      var weightClass = room.weightClass || 'standard';
      var weightLabel = this.getWeightClassLabel(weightClass);
      var weightMods = this.computeWeightClassModifiers(weightClass);
      scene.registry.set('weightClass', weightClass);
      scene.registry.set('weightClassLabel', weightLabel);
      scene.registry.set('weightSpeedMultiplier', weightMods.speedMultiplier);
      scene.registry.set('weightPowerMultiplier', weightMods.powerMultiplier);
      if (weightClass !== 'standard') {
        scene.time.delayedCall(2600, function(){
          var msg;
          if (weightClass === 'light') msg = weightLabel + ' bout – faster movement, slightly lighter shots.';
          else if (weightClass === 'middle') msg = weightLabel + ' bout – balanced speed and power.';
          else if (weightClass === 'heavy') msg = weightLabel + ' bout – slower movement, heavier hits.';
          else msg = weightLabel + ' rules in effect.';
          scene.registry.set('gameMessage', msg);
          scene.time.delayedCall(2200, function(){ scene.registry.set('gameMessage', ''); });
        });
      } else {
        scene.registry.set('weightClassLabel', 'Standard');
      }
      // Champion's Dojo metadata: endless arena + leaderboard hooks
      if (room.dojoMode === 'championsDojo') {
        scene.registry.set('dojoActive', true);
        scene.registry.set('dojoMode', 'championsDojo');
        scene.registry.set('dojoLabel', room.name || "Champion's Dojo");
        scene.registry.set('dojoEndless', true);
        scene.registry.set('dojoZone', zone);
        // Flavor text so players know they reached a special arena
        scene.time.delayedCall(2400, function(){
          scene.registry.set('gameMessage', "Champion's Dojo: endless challengers await – chase your best streak.");
          scene.time.delayedCall(2600, function(){ scene.registry.set('gameMessage', ''); });
        });
      } else {
        scene.registry.set('dojoActive', false);
        scene.registry.set('dojoMode', '');
        scene.registry.set('dojoLabel', '');
        scene.registry.set('dojoEndless', false);
      }
      // Survival Time Attack metadata: 90s endurance rooms with score focus
      if (room.survivalMode) {
        scene.registry.set('survivalModeActive', true);
        scene.registry.set('survivalDurationSeconds', room.survivalDurationSeconds || 90);
        scene.registry.set('survivalScoreMultiplier', room.survivalScoreMultiplier || 1.0);
        scene.registry.set('survivalRoomName', room.name || 'Survival Room');
        scene.time.delayedCall(2450, function(){
          var dur = scene.registry.get('survivalDurationSeconds') || 90;
          scene.registry.set('gameMessage', 'Survival Time Attack: hold out for '+dur+' seconds – damage dealt = score.');
          scene.time.delayedCall(2800, function(){ scene.registry.set('gameMessage', ''); });
        });
      } else {
        scene.registry.set('survivalModeActive', false);
        scene.registry.set('survivalDurationSeconds', 0);
        scene.registry.set('survivalScoreMultiplier', 1.0);
        scene.registry.set('survivalRoomName', '');
      }
      // Rapid Fire Room metadata: short-timer wave sprint rooms
      if (room.rapidFireMode) {
        scene.registry.set('rapidFireModeActive', true);
        scene.registry.set('rapidFireDurationSeconds', room.rapidFireDurationSeconds || 15);
        scene.registry.set('rapidFireSpawnIntervalSeconds', room.rapidFireSpawnIntervalSeconds || 2);
        scene.registry.set('rapidFireScoreMultiplier', room.rapidFireScoreMultiplier || 2.0);
        scene.registry.set('rapidFireRoomName', room.name || 'Rapid Fire Room');
        scene.time.delayedCall(2450, function(){
          var dur = scene.registry.get('rapidFireDurationSeconds') || 15;
          scene.registry.set('gameMessage', 'Rapid Fire Room: defeat as many as possible in '+dur+' seconds.');
          scene.time.delayedCall(2600, function(){ scene.registry.set('gameMessage', ''); });
        });
      } else {
        scene.registry.set('rapidFireModeActive', false);
        scene.registry.set('rapidFireDurationSeconds', 0);
        scene.registry.set('rapidFireSpawnIntervalSeconds', 0);
        scene.registry.set('rapidFireScoreMultiplier', 1.0);
        scene.registry.set('rapidFireRoomName', '');
      }
      // Ring Side Power-Ups metadata: arena-only buff item hooks
      if (room.ringPowerups) {
        scene.registry.set('ringPowerupsActive', true);
        scene.registry.set('ringPowerupTypes', (room.ringPowerupTypes || ['hp','stamina','focus']).slice());
        // Four ring corners in tile coordinates for arena rings (1,1), (14,1), (1,10), (14,10)
        scene.registry.set('ringPowerupCorners', [
          { col:1, row:1 },
          { col:14, row:1 },
          { col:1, row:10 },
          { col:14, row:10 }
        ]);
        scene.time.delayedCall(2300, function(){
          scene.registry.set('gameMessage', 'Ring side power-ups active – watch the corners for buffs.');
          scene.time.delayedCall(2200, function(){ scene.registry.set('gameMessage', ''); });
        });
      } else {
        scene.registry.set('ringPowerupsActive', false);
        scene.registry.set('ringPowerupTypes', []);
        scene.registry.set('ringPowerupCorners', []);
      }
      // Crowd Hypeman metadata: highlighted crowd members that can be
      // acknowledged once per visit for temporary buffs.
      var hypemanCfg = this.getCrowdHypemanConfig(room.id);
      if (hypemanCfg && hypemanCfg.active && hypemanCfg.buffs.length) {
        scene.registry.set('crowdHypemanActive', true);
        scene.registry.set('crowdHypemanBuffs', hypemanCfg.buffs);
        // Reset availability on room enter; other systems can flip this flag
        // once the player has claimed a hypeman buff for the current visit.
        scene.registry.set('crowdHypemanAvailable', true);
        scene.time.delayedCall(2350, function(){
          scene.registry.set('gameMessage', 'Spot the hypemen in the crowd – taunt them before the bell for a temporary boost.');
          scene.time.delayedCall(2600, function(){ scene.registry.set('gameMessage', ''); });
        });
      } else {
        scene.registry.set('crowdHypemanActive', false);
        scene.registry.set('crowdHypemanBuffs', []);
        scene.registry.set('crowdHypemanAvailable', false);
      }
      // Corner Pressure metadata: arena zones where the ropes change the risk/reward
      var cornerCfg = this.getCornerPressureConfig(room.id);
      if (cornerCfg && cornerCfg.active) {
        scene.registry.set('cornerPressureActive', true);
        scene.registry.set('cornerPressureDamageTakenMultiplier', cornerCfg.damageTakenMultiplier);
        scene.registry.set('cornerPressureDamageDealtMultiplier', cornerCfg.damageDealtMultiplier);
        scene.registry.set('cornerPressureRegions', cornerCfg.regions);
        scene.time.delayedCall(2350, function(){
          scene.registry.set('gameMessage', 'Corner Pressure: trapped against the ropes = +10% damage taken, +15% damage dealt when you fight back.');
          scene.time.delayedCall(2600, function(){ scene.registry.set('gameMessage', ''); });
        });
      } else {
        scene.registry.set('cornerPressureActive', false);
        scene.registry.set('cornerPressureDamageTakenMultiplier', 1.0);
        scene.registry.set('cornerPressureDamageDealtMultiplier', 1.0);
        scene.registry.set('cornerPressureRegions', []);
      }
      // Arena Wall Tech metadata: environmental interaction zones for bounces/vaults/trips
      var wallTechCfg = this.getArenaWallTechConfig(room.id);
      if (wallTechCfg && wallTechCfg.active) {
        scene.registry.set('arenaWallTechActive', true);
        scene.registry.set('arenaWallTechRopeSegments', wallTechCfg.ropeSegments || []);
        scene.registry.set('arenaWallTechCornerPosts', wallTechCfg.cornerPosts || []);
        scene.registry.set('arenaWallTechBounceDodgeSpeedMultiplier', wallTechCfg.bounceDodgeSpeedMultiplier || 1.0);
        scene.registry.set('arenaWallTechBounceDodgeStaminaCostMultiplier', wallTechCfg.bounceDodgeStaminaCostMultiplier || 1.0);
        scene.registry.set('arenaWallTechRopeVaultDamageMultiplier', wallTechCfg.ropeVaultDamageMultiplier || 1.0);
        scene.registry.set('arenaWallTechRopeVaultStaminaCostMultiplier', wallTechCfg.ropeVaultStaminaCostMultiplier || 1.0);
        scene.registry.set('arenaWallTechRopeTripDamageMultiplier', wallTechCfg.ropeTripDamageMultiplier || 1.0);
        scene.registry.set('arenaWallTechRopeTripStunSeconds', wallTechCfg.ropeTripStunSeconds || 0);
        scene.time.delayedCall(2400, function(){
          scene.registry.set('gameMessage', 'Arena Wall Tech: bounce off posts, vault ropes, and trip foes into the cage.');
          scene.time.delayedCall(2600, function(){ scene.registry.set('gameMessage', ''); });
        });
      } else {
        scene.registry.set('arenaWallTechActive', false);
        scene.registry.set('arenaWallTechRopeSegments', []);
        scene.registry.set('arenaWallTechCornerPosts', []);
        scene.registry.set('arenaWallTechBounceDodgeSpeedMultiplier', 1.0);
        scene.registry.set('arenaWallTechBounceDodgeStaminaCostMultiplier', 1.0);
        scene.registry.set('arenaWallTechRopeVaultDamageMultiplier', 1.0);
        scene.registry.set('arenaWallTechRopeVaultStaminaCostMultiplier', 1.0);
        scene.registry.set('arenaWallTechRopeTripDamageMultiplier', 1.0);
        scene.registry.set('arenaWallTechRopeTripStunSeconds', 0);
      }
      // Environmental Hazard Rooms metadata: special room variants such as
      // slippery floors, loose ropes, dark sections, or electrified cages.
      // We keep this purely data-driven so that movement/combat/VFX systems
      // can decide how to react without hardcoding specific room ids.
      var hazardCfg = this.getHazardConfigForRoom(room.id);
      if (hazardCfg && hazardCfg.active) {
        scene.registry.set('hazardActive', true);
        scene.registry.set('hazardType', hazardCfg.type || 'generic');
        scene.registry.set('hazardLabel', hazardCfg.label || 'Hazard Room');
        scene.registry.set('hazardWallTouchDamageMultiplier', hazardCfg.wallTouchDamageMultiplier || 1.0);
        scene.registry.set('hazardWallTouchTickSeconds', hazardCfg.wallTouchTickSeconds || 1.0);
        scene.registry.set('hazardVisibilityMultiplier', hazardCfg.visibilityMultiplier || 1.0);
        scene.registry.set('hazardVfxKey', hazardCfg.vfxKey || '');
        scene.registry.set('hazardSfxKey', hazardCfg.sfxKey || '');
        scene.time.delayedCall(2425, function(){
          scene.registry.set('gameMessage', hazardCfg.label + ': watch the walls – environmental damage is live.');
          scene.time.delayedCall(2600, function(){ scene.registry.set('gameMessage', ''); });
        });
      } else {
        scene.registry.set('hazardActive', false);
        scene.registry.set('hazardType', '');
        scene.registry.set('hazardLabel', '');
        scene.registry.set('hazardWallTouchDamageMultiplier', 1.0);
        scene.registry.set('hazardWallTouchTickSeconds', 1.0);
        scene.registry.set('hazardVisibilityMultiplier', 1.0);
        scene.registry.set('hazardVfxKey', '');
        scene.registry.set('hazardSfxKey', '');
      }
      // Boss Rush Corridor metadata: sequential mini-boss waves with no healing between
      if (room.bossRushMode) {
        scene.registry.set('bossRushActive', true);
        scene.registry.set('bossRushWaves', room.bossRushWaves || 3);
        scene.registry.set('bossRushWaveEnemyPool', (room.bossRushWaveEnemyPool || ['mmaChamp']).slice());
        scene.registry.set('bossRushNoHealBetweenWaves', room.bossRushNoHealBetweenWaves !== false);
        scene.registry.set('bossRushRewardTags', (room.bossRushRewardTags || ['rare','equipment']).slice());
        scene.registry.set('bossRushRoomName', room.name || 'Boss Rush Corridor');
        scene.time.delayedCall(2500, function(){
          var waves = scene.registry.get('bossRushWaves') || 3;
          scene.registry.set('gameMessage', 'Boss Rush: '+waves+' back-to-back mini-bosses – no healing between waves.');
          scene.time.delayedCall(2800, function(){ scene.registry.set('gameMessage', ''); });
        });
      } else {
        scene.registry.set('bossRushActive', false);
        scene.registry.set('bossRushWaves', 0);
        scene.registry.set('bossRushWaveEnemyPool', []);
        scene.registry.set('bossRushNoHealBetweenWaves', false);
        scene.registry.set('bossRushRewardTags', []);
        scene.registry.set('bossRushRoomName', '');
      }
      // Apply zone-specific weather state so other systems can react
      this.applyWeatherToScene(scene, room);
    }
  },
  handleDoorEnter: function(scene, player, door) {
    if (scene.roomTransitioning || scene.gameOver) return;
    var direction = door.getData('direction'); if (!direction) return;
    var newRoomId = this.getConnectedRoom(scene.currentRoomId, direction);
    if (newRoomId) this.transitionToRoom(scene, newRoomId, direction);
  },
  transitionToRoom: function(scene, newRoomId, fromDirection) {
    scene.roomTransitioning = true;
    var room = this.getRoom(newRoomId), zone = room && room.zone ? room.zone : 1;
    // Advance time-of-day only for outdoor street zone so players feel a progression
    if (zone === 1) this.advanceTimeOfDay(scene);
    scene.registry.set('gameMessage', 'ENTERING ZONE ' + zone + ' - ' + room.name + '...');
    var self = this;
    scene.time.delayedCall(500, function(){
      scene.currentRoomId = newRoomId; scene.currentZone = zone;
      var DT = CONFIG.DISPLAY_TILE, spawnX = 8*DT, spawnY = 6*DT;
      if (fromDirection === 'left') { spawnX = 14*DT; spawnY = 6*DT; }
      else if (fromDirection === 'right') { spawnX = 2*DT; spawnY = 6*DT; }
      else if (fromDirection === 'up') { spawnX = 8*DT; spawnY = 10*DT; }
      else if (fromDirection === 'down') { spawnX = 8*DT; spawnY = 2*DT; }
      scene.player.setPosition(spawnX, spawnY).setActive(true).setVisible(true);
      if (scene.player.body) scene.player.body.enable = true;
      self.buildRoom(scene, newRoomId);
      scene.enemies.forEach(function(e){ if (e && e.active) e.destroy(); }); scene.enemies = [];
      // Reset fight stats for new room
      MMA.UI.resetFightStats();
      if (window.MMA && MMA.Enemies) MMA.Enemies.spawnForRoom(scene, newRoomId);
      if (window.saveGame) window.saveGame(scene.player.stats, scene.player.unlockedMoves, scene.currentZone, scene.currentRoomId);
      scene.roomTransitioning = false;
      scene.registry.set('gameMessage', 'ZONE ' + zone + ' - ' + room.name);
      scene.time.delayedCall(1500, function(){ scene.registry.set('gameMessage', ''); });
    });
  }
};

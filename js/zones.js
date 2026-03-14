window.MMA = window.MMA || {};
window.MMA.Zones = {
  ZONE1_ROOMS: {
    room1:{id:'room1',zone:1,weatherOptions:['clear','clear','rain','night'],weightClass:'light',doors:{left:{col:0,row:5},right:{col:15,row:5},up:{col:7,row:0}},connections:{left:'room2',right:'room3',up:'room4'},spawnPositions:[{col:3,row:3},{col:12,row:3},{col:12,row:9}],enemyPool:['streetThug','streetThug','barBrawler'],name:'Alley Entrance'},
    room2:{id:'room2',zone:1,weatherOptions:['clear','rain','wind','fog'],weightClass:'light',doors:{right:{col:15,row:5}},connections:{right:'room1'},spawnPositions:[{col:3,row:3},{col:3,row:9}],enemyPool:['streetThug','barBrawler'],name:'Side Alley'},
    room3:{id:'room3',zone:1,weatherOptions:['clear','clear','night','wind','fog'],weightClass:'light',doors:{left:{col:0,row:5}},connections:{left:'room1'},spawnPositions:[{col:3,row:5},{col:12,row:3},{col:12,row:9}],enemyPool:['barBrawler','barBrawler','muayThaiFighter'],name:'Back Lot'},
    room4:{id:'room4',zone:1,weatherOptions:['clear','rain','fog'],weightClass:'light',doors:{down:{col:7,row:11},up:{col:7,row:0}},connections:{down:'room1',up:'gym1'},spawnPositions:[{col:3,row:8},{col:12,row:8}],enemyPool:['barBrawler','muayThaiFighter','muayThaiFighter'],name:'Storage Area'}
  },
  ZONE2_ROOMS: {
    gym1:{id:'gym1',zone:2,weatherOptions:['clear'],weightClass:'middle',musicCue:'zone2',doors:{left:{col:0,row:5},right:{col:15,row:5},up:{col:7,row:0},down:{col:7,row:11}},connections:{left:'gym2',right:'gym3',up:'gym4',down:'room4'},spawnPositions:[{col:4,row:4},{col:11,row:4},{col:7,row:8}],enemyPool:['kickboxer','striker','coach'],name:'Sparring Ring'},
    gym2:{id:'gym2',zone:2,weatherOptions:['clear','dust'],weightClass:'heavy',musicCue:'zone2',doors:{right:{col:15,row:5},up:{col:7,row:0}},connections:{right:'gym1',up:'gymTraining'},spawnPositions:[{col:3,row:4},{col:3,row:8}],enemyPool:['wrestler','groundNPounder'],name:'Weight Room'},
    gym3:{id:'gym3',zone:2,weatherOptions:['clear'],weightClass:'light',musicCue:'zone2',doors:{left:{col:0,row:5}},connections:{left:'gym1'},spawnPositions:[{col:4,row:4},{col:11,row:8}],enemyPool:['striker','kickboxer'],name:'Locker Room'},
    gym4:{id:'gym4',zone:2,weatherOptions:['clear','dust'],weightClass:'middle',musicCue:'zone2',doors:{down:{col:7,row:11},up:{col:7,row:0}},connections:{down:'gym1',up:'gym5'},spawnPositions:[{col:3,row:3},{col:12,row:3},{col:3,row:8},{col:12,row:8}],enemyPool:['judoka','wrestler','coach'],trainingTypes:['speed','accuracy','endurance'],trainingLabel:'Mat Area Drills',name:'Mat Area'},
    gym5:{id:'gym5',zone:2,weatherOptions:['clear'],weightClass:'middle',musicCue:'boss',isBossRoom:true,doors:{down:{col:7,row:11},up:{col:7,row:0}},connections:{down:'gym4',up:'oct1'},spawnPositions:[{col:7,row:6}],enemyPool:['shadowRival'],name:"Coach's Office"},
    gymTraining:{id:'gymTraining',zone:2,weatherOptions:['clear','dust'],weightClass:'middle',musicCue:'zone2',doors:{down:{col:7,row:11}},connections:{down:'gym2'},spawnPositions:[{col:5,row:4},{col:9,row:4},{col:7,row:8}],enemyPool:['stunner','coach'],trainingTypes:['speed','accuracy','endurance'],trainingLabel:'Conditioning Corner',name:'Conditioning Corner'}
  },
  ZONE3_ROOMS: {
    oct1:{id:'oct1',zone:3,weatherOptions:['night','clear','fog'],weightClass:'middle',musicCue:'zone3',cornerPressure:true,crowdSize:180,baseHype:0.25,maxHype:0.7,crowdLabel:'Tunnel gamblers crowd',doors:{down:{col:7,row:11},right:{col:15,row:5},up:{col:7,row:0}},connections:{down:'gym5',right:'oct2',up:'oct3'},spawnPositions:[{col:4,row:4},{col:11,row:8}],enemyPool:['bully','bully'],name:'Tunnel Entrance',narratorStyle:'arenaPrelims'},
    oct2:{id:'oct2',zone:3,weatherOptions:['night','wind','fog'],weightClass:'heavy',musicCue:'zone3',cornerPressure:true,crowdSize:120,baseHype:0.2,maxHype:0.65,crowdLabel:'Back-alley railbirds',doors:{left:{col:0,row:5},up:{col:7,row:0}},connections:{left:'oct1',up:'survival1'},spawnPositions:[{col:3,row:4},{col:12,row:4},{col:8,row:8}],enemyPool:['bjjBlackBelt','bully'],name:'Back Alley',narratorStyle:'arenaPrelims'},
    oct3:{id:'oct3',zone:3,weatherOptions:['night','clear','fog'],weightClass:'heavy',musicCue:'zone3',cornerPressure:true,crowdSize:420,baseHype:0.55,maxHype:0.95,crowdLabel:'Pit crowd roaring',ringPowerups:true,ringPowerupTypes:['hp','stamina','focus'],doors:{down:{col:7,row:11},left:{col:0,row:5},up:{col:7,row:0}},connections:{down:'oct1',left:'survival1',up:'oct4'},spawnPositions:[{col:4,row:3},{col:11,row:3},{col:4,row:8},{col:11,row:8}],enemyPool:['bully','feintMaster','bjjBlackBelt'],name:'The Pit',narratorStyle:'arenaMain'},
    oct4:{id:'oct4',zone:3,weatherOptions:['night','clear'],weightClass:'heavy',musicCue:'boss',isBossRoom:true,cornerPressure:true,crowdSize:820,baseHype:0.85,maxHype:1.0,crowdLabel:'Championship pit crowd',ringPowerups:true,ringPowerupTypes:['hp','stamina','focus'],doors:{down:{col:7,row:11},up:{col:7,row:0}},connections:{down:'oct3',up:'dojo1'},spawnPositions:[{col:7,row:6}],enemyPool:['mmaChamp'],name:"Champion's Arena",narratorStyle:'arenaTitle'},
    survival1:{id:'survival1',zone:3,weatherOptions:['night','clear','fog'],weightClass:'middle',musicCue:'zone3',cornerPressure:true,crowdSize:260,baseHype:0.4,maxHype:0.8,crowdLabel:'VIP balcony chatter',doors:{right:{col:15,row:5},down:{col:7,row:11}},connections:{right:'oct3',down:'oct2'},spawnPositions:[{col:5,row:4},{col:10,row:4}],enemyPool:['feintMaster','feintMaster'],name:'VIP Lounge',narratorStyle:'arenaPrelims'}
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
      ringPowerupTypes:['hp','stamina','focus'],
      doors:{down:{col:7,row:11}},
      connections:{down:'oct4'},
      spawnPositions:[{col:7,row:5}],
      enemyPool:['mmaChamp'],
      name:"Champion's Dojo",
      narratorStyle:'dojoLegend',
      dojoMode:'championsDojo'
    }
  },
  ROOM_DECORATIONS: {
    room1: [
      { col:2, row:9, type:'barrel' },
      { col:6, row:2, type:'graffiti', w:1.6, h:0.8, alpha:0.82 },
      { col:13, row:2, type:'streetLamp' },
      { col:13, row:9, type:'trashCan' }
    ],
    room2: [
      { col:2, row:3, type:'trashCan' },
      { col:3, row:9, type:'barrel' },
      { col:12, row:2, type:'graffiti', w:1.5, h:0.8, alpha:0.8 },
      { col:13, row:8, type:'crates' }
    ],
    room3: [
      { col:2, row:5, type:'streetLamp' },
      { col:12, row:2, type:'graffiti', w:1.8, h:0.85, alpha:0.86 },
      { col:13, row:9, type:'barrel' },
      { col:5, row:9, type:'crates' }
    ],
    room4: [
      { col:2, row:8, type:'crates' },
      { col:13, row:8, type:'barrel' },
      { col:11, row:2, type:'graffiti', w:1.4, h:0.8, alpha:0.76 }
    ],
    gym1: [
      { col:3, row:2, type:'heavyBag' },
      { col:12, row:2, type:'speedBag' },
      { col:7, row:7, type:'boxingRing', w:2.8, h:1.8, depth:420, alpha:0.8 }
    ],
    gym2: [
      { col:3, row:2, type:'weightRack' },
      { col:12, row:2, type:'weightRack' },
      { col:8, row:8, type:'mirror', h:1.3, alpha:0.92 }
    ],
    gym3: [
      { col:3, row:2, type:'mirror', h:1.25, alpha:0.9 },
      { col:12, row:3, type:'heavyBag' },
      { col:12, row:8, type:'speedBag' }
    ],
    gym4: [
      { col:3, row:2, type:'mirror', h:1.2, alpha:0.88 },
      { col:12, row:2, type:'heavyBag' },
      { col:7, row:8, type:'boxingRing', w:2.5, h:1.5, depth:410, alpha:0.74 }
    ],
    gym5: [
      { col:7, row:2, type:'mirror', h:1.3, alpha:0.9 },
      { col:4, row:8, type:'weightRack' },
      { col:11, row:8, type:'weightRack' }
    ],
    gymTraining: [
      { col:4, row:2, type:'speedBag' },
      { col:10, row:2, type:'heavyBag' },
      { col:7, row:8, type:'weightRack' }
    ],
    oct1: [
      { col:7, row:8, type:'entranceTunnel', w:2.7, h:1.6, depth:440, alpha:0.88 },
      { col:3, row:2, type:'crowdSilhouette', w:2.4, h:1.2, alpha:0.62 },
      { col:12, row:2, type:'crowdSilhouette', w:2.4, h:1.2, alpha:0.62 }
    ],
    oct2: [
      { col:2, row:2, type:'cornerPost' },
      { col:13, row:2, type:'cornerPost' },
      { col:7, row:8, type:'crowdSilhouette', w:2.7, h:1.2, alpha:0.66 }
    ],
    oct3: [
      { col:7, row:6, type:'octagon', w:2.9, h:2.3, depth:460, alpha:0.78 },
      { col:2, row:2, type:'cornerPost' },
      { col:13, row:2, type:'cornerPost' },
      { col:7, row:1, type:'crowdSilhouette', w:2.8, h:1.2, alpha:0.64 }
    ],
    oct4: [
      { col:7, row:6, type:'octagon', w:3.0, h:2.35, depth:470, alpha:0.82 },
      { col:2, row:2, type:'cornerPost' },
      { col:13, row:2, type:'cornerPost' },
      { col:7, row:1, type:'crowdSilhouette', w:3.0, h:1.2, alpha:0.68 }
    ],
    survival1: [
      { col:7, row:2, type:'crowdSilhouette', w:2.8, h:1.2, alpha:0.65 },
      { col:4, row:8, type:'entranceTunnel', w:2.2, h:1.4, depth:430, alpha:0.82 },
      { col:11, row:8, type:'cornerPost' }
    ],
    dojo1: [
      { col:7, row:6, type:'octagon', w:3.0, h:2.35, depth:470, alpha:0.84 },
      { col:3, row:2, type:'crowdSilhouette', w:2.4, h:1.15, alpha:0.6 },
      { col:12, row:2, type:'crowdSilhouette', w:2.4, h:1.15, alpha:0.6 }
    ]
  },
  _cloneDecorationPositions: function(roomId) {
    var positions = this.ROOM_DECORATIONS[roomId] || [];
    return positions.map(function(pos) {
      return Object.assign({}, pos);
    });
  },
  getRoom: function(roomId){
    var room = this.ZONE1_ROOMS[roomId] || this.ZONE2_ROOMS[roomId] || this.ZONE3_ROOMS[roomId] || this.ZONE4_ROOMS[roomId];
    if (room && !room.decorationPositions) room.decorationPositions = this._cloneDecorationPositions(roomId);
    return room;
  },
  getConnectedRoom: function(roomId, direction){ var r = this.getRoom(roomId); return r && r.connections ? r.connections[direction] : null; },
  getRoomSpawnPositions: function(roomId){ var r = this.getRoom(roomId); return r ? r.spawnPositions : []; },
  getRoomEnemyPool: function(roomId){ var r = this.getRoom(roomId); return r ? r.enemyPool : ['streetThug']; },
  getMusicCueForRoom: function(roomIdOrRoom) {
    var room = typeof roomIdOrRoom === 'string' ? this.getRoom(roomIdOrRoom) : roomIdOrRoom;
    if (!room) return 'zone1';
    if (room.musicCue) return room.musicCue;
    if (room.isBossRoom) return 'boss';
    if (room.zone === 2) return 'zone2';
    if (room.zone >= 3) return 'zone3';
    return 'zone1';
  },
  applyRoomAudio: function(scene, roomIdOrRoom) {
    if (!window.MMA_AUDIO || typeof window.MMA_AUDIO.playBGM !== 'function') return;
    var room = typeof roomIdOrRoom === 'string' ? this.getRoom(roomIdOrRoom) : roomIdOrRoom;
    if (!room) return;
    window.MMA_AUDIO.playBGM(this.getMusicCueForRoom(room));
    if (window.MMA_AUDIO.ambient && typeof window.MMA_AUDIO.ambient.play === 'function') {
      var ambientType = room.zone === 1 ? 'traffic' : (room.zone === 2 ? 'gym' : 'crowd');
      window.MMA_AUDIO.ambient.play(ambientType);
    }
  },
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
  // Compute damage bonus (0 to 0.10) based on current hype (0-1)
  computeCrowdDamageBonus: function(hype) {
    var maxBonus = 0.10;
    return Math.min(maxBonus, maxBonus * hype);
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
    } else if (t === 'fog') {
      weather.slippery = false;
      weather.visibilityMultiplier = 0.72;
      weather.projectileDrift = 0;
      weather.label = 'Fog';
      weather.message = 'Fog hangs low over the room and makes openings harder to read.';
    } else if (t === 'dust') {
      weather.slippery = false;
      weather.visibilityMultiplier = 0.88;
      weather.projectileDrift = 0.08;
      weather.label = 'Dust';
      weather.message = 'Dust hangs in the air and softens long sight-lines.';
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
    if (window.MMA && MMA.VFX && typeof MMA.VFX.applyRoomWeather === 'function') {
      MMA.VFX.applyRoomWeather(scene, room, weather);
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
      if (window.MMA && MMA.Sprites && typeof MMA.Sprites.spawnZoneDecorations === 'function') {
        MMA.Sprites.spawnZoneDecorations(scene, zone, room);
      }
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
      // Apply zone-specific weather state so other systems can react
      this.applyWeatherToScene(scene, room);
      this.applyRoomAudio(scene, room);
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
    if (window.sfx) {
      if (typeof window.sfx.roomTransition === 'function') window.sfx.roomTransition();
      else if (typeof window.sfx.door === 'function') window.sfx.door();
    }
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

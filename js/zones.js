window.MMA = window.MMA || {};
window.MMA.Zones = {
  ZONE1_ROOMS: {
    room1:{id:'room1',zone:1,weatherOptions:['clear','clear','rain','night'],weightClass:'light',doors:{left:{col:0,row:5},right:{col:15,row:5},up:{col:7,row:0}},connections:{left:'room2',right:'room3',up:'room4'},spawnPositions:[{col:3,row:3},{col:12,row:3},{col:12,row:9}],enemyPool:['streetThug','streetThug','barBrawler'],name:'Alley Entrance'},
    room2:{id:'room2',zone:1,weatherOptions:['clear','rain','wind'],weightClass:'light',doors:{right:{col:15,row:5}},connections:{right:'room1'},spawnPositions:[{col:3,row:3},{col:3,row:9}],enemyPool:['streetThug','barBrawler'],name:'Side Alley'},
    room3:{id:'room3',zone:1,weatherOptions:['clear','clear','night','wind'],weightClass:'light',doors:{left:{col:0,row:5}},connections:{left:'room1'},spawnPositions:[{col:3,row:5},{col:12,row:3},{col:12,row:9}],enemyPool:['barBrawler','barBrawler','muayThaiFighter'],name:'Back Lot'},
    room4:{id:'room4',zone:1,weatherOptions:['clear','rain'],weightClass:'light',doors:{down:{col:7,row:11},up:{col:7,row:0}},connections:{down:'room1',up:'gym1'},spawnPositions:[{col:3,row:8},{col:12,row:8}],enemyPool:['barBrawler','muayThaiFighter','muayThaiFighter'],name:'Storage Area'}
  },
  ZONE2_ROOMS: {
    gym1:{id:'gym1',zone:2,weatherOptions:['clear'],weightClass:'middle',doors:{left:{col:0,row:5},right:{col:15,row:5},down:{col:7,row:11}},connections:{left:'gym2',right:'gym3',down:'room4'},spawnPositions:[{col:4,row:4},{col:11,row:4},{col:7,row:8}],enemyPool:['wrestler','judoka','groundNPounder'],name:'Gym Entrance'},
    gym2:{id:'gym2',zone:2,weatherOptions:['clear'],weightClass:'middle',doors:{right:{col:15,row:5}},connections:{right:'gym1'},spawnPositions:[{col:4,row:4},{col:4,row:8}],enemyPool:['wrestler','judoka'],name:'Weight Area'},
    gym3:{id:'gym3',zone:2,weatherOptions:['clear'],weightClass:'middle',doors:{left:{col:0,row:5},up:{col:7,row:0}},connections:{left:'gym1',up:'gym4'},spawnPositions:[{col:11,row:4},{col:11,row:8}],enemyPool:['judoka','groundNPounder'],enemyPoolTrainers:['wrestler','judoka'],name:'Mats Hall'},
    // Dedicated Training Room: used for speed/accuracy/endurance minigame hooks
    gym4:{id:'gym4',zone:2,weatherOptions:['clear'],weightClass:'middle',doors:{down:{col:7,row:11},up:{col:7,row:0}},connections:{down:'gym3',up:'gymTraining'},spawnPositions:[{col:7,row:4},{col:7,row:8}],enemyPool:['wrestler','groundNPounder','groundNPounder'],name:'Training Ring'},
    gymTraining:{id:'gymTraining',zone:2,weatherOptions:['clear'],weightClass:'middle',doors:{down:{col:7,row:11}},connections:{down:'gym4'},spawnPositions:[{col:5,row:4},{col:9,row:4},{col:7,row:8}],enemyPool:['wrestler','judoka','groundNPounder'],trainingTypes:['speed','accuracy','endurance'],trainingLabel:'Gym Training Room'}
  },
  ZONE3_ROOMS: {
    // Crowd metadata for arena rooms
    // crowdSize: approximate number of spectators
    // baseHype: initial hype level (0-1)
    // maxHype: maximum hype achievable (0-1)
    // crowdLabel: short description displayed to player
    // weightClass: "light", "middle", "heavy" or "standard" (default)
    oct1:{id:'oct1',zone:3,weatherOptions:['clear','night'],weightClass:'middle',cornerPressure:true,crowdSize:200,baseHype:0.3,maxHype:0.8,crowdLabel:'Rowdy Entrance Crowd',
      ringPowerups:true,ringPowerupTypes:['hp','stamina','focus'],
      doors:{right:{col:15,row:5},up:{col:7,row:0}},connections:{right:'oct2',up:'oct3'},
      spawnPositions:[{col:3,row:4},{col:12,row:4}],enemyPool:['bjjBlackBelt'],name:'Arena Entrance'},
    oct2:{id:'oct2',zone:3,weatherOptions:['clear','night','wind'],weightClass:'middle',cornerPressure:true,crowdSize:300,baseHype:0.5,maxHype:0.9,crowdLabel:'Boisterous Prelim Crowd',
      ringPowerups:true,ringPowerupTypes:['hp','stamina','focus'],
      doors:{left:{col:0,row:5}},connections:{left:'oct1'},
      spawnPositions:[{col:3,row:3},{col:3,row:8}],enemyPool:['bjjBlackBelt','bjjBlackBelt'],name:'Prelim Cage'},
    oct3:{id:'oct3',zone:3,weatherOptions:['clear','night'],weightClass:'heavy',cornerPressure:true,crowdSize:500,baseHype:0.7,maxHype:1.0,crowdLabel:'Electric Main Cage Crowd',
      ringPowerups:true,ringPowerupTypes:['hp','stamina','focus'],
      doors:{down:{col:7,row:11},up:{col:7,row:0}},connections:{down:'oct1',up:'oct4'},
      spawnPositions:[{col:5,row:5},{col:9,row:5}],enemyPool:['bjjBlackBelt'],name:'Main Cage'},
    oct4:{id:'oct4',zone:3,weatherOptions:['clear','night'],weightClass:'heavy',cornerPressure:true,crowdSize:800,baseHype:0.9,maxHype:1.0,crowdLabel:'Championship Crowd',
      ringPowerups:true,ringPowerupTypes:['hp','stamina','focus'],
      doors:{down:{col:7,row:11},up:{col:7,row:0}},connections:{down:'oct3',up:'survival1'},
      spawnPositions:[{col:7,row:6}],enemyPool:['mmaChamp'],name:'Championship Ring'},
    // Survival Time Attack: 90s endurance room with escalating waves and score focus
    survival1:{
      id:'survival1',
      zone:3,
      weatherOptions:['clear','night'],
      weightClass:'heavy',
      cornerPressure:true,
      crowdSize:900,
      baseHype:0.6,
      maxHype:1.0,
      crowdLabel:'Time-Attack Crowd',
      ringPowerups:true,
      ringPowerupTypes:['hp','stamina','focus'],
      doors:{down:{col:7,row:11}},
      connections:{down:'oct4'},
      spawnPositions:[{col:4,row:5},{col:11,row:5}],
      enemyPool:['bjjBlackBelt','mmaChamp'],
      name:'Survival Time Attack Cage',
      survivalMode:true,
      survivalDurationSeconds:90,
      survivalScoreMultiplier:1.5
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
      ringPowerupTypes:['hp','stamina','focus'],
      doors:{down:{col:7,row:11}},
      connections:{down:'oct4'},
      spawnPositions:[{col:7,row:5}],
      enemyPool:['mmaChamp'],
      name:"Champion's Dojo",
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

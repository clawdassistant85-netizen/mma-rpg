# DIGI_TASKS_V2.md — Feature Tasks for Digi (Codex Harness)

> **Important**: These tasks are safe to work on in parallel. Do NOT modify the files listed in the "DO NOT TOUCH" section — another agent is actively editing them.

## DO NOT TOUCH (Active Edits by Other Agents)
- `js/combat.js` — combat system, ground game, submissions
- `js/moves.js` — move definitions
- `js/progression.js` — leveling/XP system
- `js/player.js` — player stats, loadout, attribute system
- `js/ui.js` — mobile button labels, ground state UI
- `js/scenes/GameScene.js` — game loop, input handling
- `js/scenes/OutfitScene.js` — outfit selection screen
- `js/scenes/PauseScene.js` — pause menu screen
- `index.html` — HTML entry point
- `css/style.css` — styling

## Project Overview
- **Engine**: Phaser 3 (loaded via CDN in index.html)
- **Language**: Vanilla JavaScript (no modules, no bundler, no TypeScript)
- **Namespace**: All game modules use `window.MMA = window.MMA || {}; window.MMA.ModuleName = { ... }`
- **Sprites**: Generated programmatically via Canvas in `js/sprites.js` and `js/scenes/BootScene.js`
- **Audio**: Web Audio API in `js/sounds.js` with `window.MMA_AUDIO` namespace
- **Canvas**: 768×576 pixels, 16×12 tile grid (48px tiles)
- **Server**: `python3 -m http.server 8088` from project root
- **Repo**: `https://github.com/clawdassistant85-netizen/mma-rpg.git`

## How to Test
```bash
cd /Users/tobyglennpeters/.openclaw/workspace/mma-rpg
python3 -m http.server 8088
# Open http://localhost:8088 in browser
```

## After Making Changes
```bash
# Verify syntax on ALL modified files
node --check js/<filename>.js

# Commit and push
cd /Users/tobyglennpeters/.openclaw/workspace/mma-rpg
git add DIGI_TASKS_V2.md
git commit -m "Add DIGI_TASKS_V2.md - 30 detailed feature tasks for Digi"
git push origin main
```

---

# TASK CATEGORY 1: Visual Polish (5 Tasks)

## Task 1: Enemy Sprite Variants & Animations

**Files to edit**: `js/sprites.js`, `js/enemies.js`

**What to build**: Add animated sprite variants for enemy types. Currently enemies use static sprites. Create:
- Idle breathing animations (2-3 frame loop)
- Attack windup poses
- Hit reaction poses (stumble back)
- Death/fall animation

**Code example**:
```javascript
// In js/sprites.js, extend the existing texture generation
window.MMA.Sprites.ENEMY_VARIANTS = {
  streetThug: {
    baseKey: 'enemy_thug',
    idleFrames: ['enemy_thug_idle_0', 'enemy_thug_idle_1', 'enemy_thug_idle_2'],
    attackWindup: 'enemy_thug_windup',
    hitReaction: 'enemy_thug_hit',
    deathFrames: ['enemy_thug_death_0', 'enemy_thug_death_1']
  },
  barBrawler: { /* ... */ },
  muayThaiFighter: { /* ... */ },
  wrestler: { /* ... */ },
  judoka: { /* ... */ },
  kickboxer: { /* ... */ },
  striker: { /* ... */ },
  bjjBlackBelt: { /* ... */ }
};

// Animation helper
MMA.Sprites.playEnemyAnimation = function(sprite, animationKey, scene) {
  var variant = MMA.Sprites.ENEMY_VARIANTS[sprite.typeKey];
  if (!variant || !variant[animationKey]) return;
  
  var frameKey = variant[animationKey];
  if (Array.isArray(frameKey)) {
    scene.tweens.add({
      targets: sprite,
      texture: frameKey[0],
      duration: 100
    });
  } else {
    sprite.setTexture(frameKey);
  }
};
```

**Integration**: Call `MMA.Sprites.playEnemyAnimation(enemy, 'hitReaction', scene)` from combat.js when enemy takes damage.

**Testing**: Spawn enemies in game, verify they play correct animations on attack/hit/death.

---

## Task 2: Zone Environment Decorations

**Files to edit**: `js/sprites.js`, `js/zones.js`

**What to build**: Add environmental decorations per zone:
- Zone 1: Barrels, trash cans, crates, street lamps, graffiti
- Zone 2: Heavy bags, speed bags, weight racks, mirrors, boxing ring
- Zone 3: Octagon/cage, corner posts, entrance tunnel, crowd silhouettes

**Code example**:
```javascript
// In js/sprites.js
window.MMA.Sprites.DECORATIONS = {
  zone1: {
    barrel: { texture: 'decoration_barrel', size: { w: 1, h: 1.5 } },
    trashCan: { texture: 'decoration_trash', size: { w: 0.8, h: 1.2 } },
    streetLamp: { texture: 'decoration_lamp', size: { w: 0.5, h: 3 } }
  },
  zone2: {
    heavyBag: { texture: 'decoration_heavybag', size: { w: 1, h: 2 } },
    speedBag: { texture: 'decoration_speedbag', size: { w: 0.5, h: 1.5 } },
    weightRack: { texture: 'decoration_weights', size: { w: 2, h: 1.5 } },
    boxingRing: { texture: 'decoration_ring', size: { w: 6, h: 4 } }
  },
  zone3: {
    octagon: { texture: 'decoration_octagon', size: { w: 8, h: 6 } },
    cornerPost: { texture: 'decoration_corner', size: { w: 0.5, h: 0.5 } },
    crowdSilhouette: { texture: 'decoration_crowd', size: { w: 4, h: 2 } }
  }
};

MMA.Sprites.spawnZoneDecorations = function(scene, zone, roomId) {
  var decorList = MMA.Sprites.DECORATIONS['zone' + zone];
  if (!decorList) return;
  
  var room = MMA.Zones.getRoom(roomId);
  var spawnPositions = room.decorationPositions || [];
  
  spawnPositions.forEach(function(pos) {
    var decor = decorList[pos.type];
    if (!decor) return;
    
    var sprite = scene.add.sprite(pos.col * 48 + 24, pos.row * 48 + 24, decor.texture);
    sprite.setDisplaySize(decor.size.w * 48, decor.size.h * 48);
    sprite.setDepth(pos.row * 48);
    scene.roomDecorations.push(sprite);
  });
};
```

**Integration**: Add `decorationPositions` array to room definitions in `js/zones.js`, call spawn function in GameScene when entering a room.

**Testing**: Visit each zone, verify decorations appear and don't block gameplay.

---

## Task 3: Weather/Atmosphere Effects

**Files to edit**: `js/vfx.js`, `js/zones.js`

**What to build**: Weather and atmosphere effects:
- Rain (particle system)
- Fog/mist (layered sprites)
- Dust particles
- Lighting variation (torch flicker)

**Code example**:
```javascript
// In js/vfx.js
window.MMA.VFX = window.MMA.VFX || {};

MMA.VFX.weatherEffects = {
  rain: function(scene) {
    var particles = scene.add.particles(0, 0, 'particle_rain', {
      x: { min: 0, max: 768 },
      y: -20,
      lifespan: 2000,
      speedY: { min: 300, max: 500 },
      quantity: 2,
      frequency: 50,
      blendMode: 'ADD'
    });
    particles.setDepth(100);
    return particles;
  },
  
  fog: function(scene, density) {
    density = density || 0.3;
    var fog = scene.add.tileSprite(384, 288, 768, 576, 'fog_texture');
    fog.setAlpha(density);
    fog.setDepth(50);
    fog.setScrollFactor(0);
    return fog;
  },
  
  dust: function(scene) {
    var particles = scene.add.particles(0, 0, 'particle_dust', {
      x: { min: 0, max: 768 },
      y: { min: 0, max: 576 },
      lifespan: 4000,
      speedY: { min: -10, max: 10 },
      alpha: { start: 0.3, end: 0 },
      quantity: 1,
      frequency: 200
    });
    particles.setDepth(45);
    return particles;
  },
  
  clear: function(scene) {
    if (scene.weatherParticles) {
      scene.weatherParticles.destroy();
      scene.weatherParticles = null;
    }
  }
};

MMA.VFX.applyRoomWeather = function(scene, roomId) {
  var room = MMA.Zones.getRoom(roomId);
  var weather = room && room.weatherOptions ? 
    room.weatherOptions[Math.floor(Math.random() * room.weatherOptions.length)] : 'clear';
  
  MMA.VFX.weatherEffects.clear(scene);
  
  switch(weather) {
    case 'rain':
      scene.weatherParticles = MMA.VFX.weatherEffects.rain(scene);
      break;
    case 'fog':
      scene.fogLayer = MMA.VFX.weatherEffects.fog(scene, 0.4);
      break;
    case 'dust':
      scene.weatherParticles = MMA.VFX.weatherEffects.dust(scene);
      break;
    case 'night':
      scene.lightingOverlay = scene.add.rectangle(384, 288, 768, 576, 0x000044, 0.3);
      scene.lightingOverlay.setDepth(40);
      break;
  }
};
```

**Integration**: Call `MMA.VFX.applyRoomWeather(scene, roomId)` in GameScene when entering new room.

**Testing**: Visit rooms with different weather, verify effects appear.

---

## Task 4: Victory/Defeat Screen Animations

**Files to create**: `js/scenes/VictoryScene.js`, `js/scenes/DefeatScene.js`

**What to build**: Animated victory and defeat screens with stats summary and XP gain animation.

**Code example**:
```javascript
// js/scenes/VictoryScene.js
var VictoryScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function VictoryScene() {
    Phaser.Scene.call(this, { key: 'VictoryScene' });
  },
  create: function() {
    // Dark overlay
    this.add.rectangle(384, 288, 768, 576, 0x000000, 0.7).setDepth(10);
    
    // Victory text with animation
    var victoryText = this.add.text(384, 150, 'VICTORY!', {
      fontSize: '64px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setDepth(15);
    
    // Scale pulse animation
    this.tweens.add({
      targets: victoryText,
      scale: { from: 0.5, to: 1 },
      duration: 500,
      ease: 'Back.easeOut'
    });
    
    // Enemy defeated text
    var enemyName = this.registry.get('lastEnemyDefeated') || 'Enemy';
    this.add.text(384, 230, enemyName + ' defeated!', {
      fontSize: '28px',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(15);
    
    // Stats panel
    this.createStatsPanel();
    
    // XP gain animation
    this.animateXPGain();
    
    // Continue button
    this.createContinueButton();
  },
  
  createStatsPanel: function() {
    var stats = this.registry.get('fightStats') || {};
    var bg = this.add.rectangle(384, 360, 300, 120, 0x222222, 0.9).setDepth(15);
    bg.setStrokeStyle(2, 0xffd700);
    
    var style = { fontSize: '18px', color: '#cccccc' };
    this.add.text(230, 310, 'Damage: ' + (stats.damageDealt || 0), style).setDepth(15);
    this.add.text(230, 335, 'Hits: ' + (stats.hitsLanded || 0), style).setDepth(15);
    this.add.text(230, 360, 'Combo: ' + (stats.longestCombo || 0), style).setDepth(15);
  },
  
  animateXPGain: function() {
    var xpGained = this.registry.get('xpGained') || 0;
    var xpText = this.add.text(384, 480, '+0 XP', {
      fontSize: '36px',
      color: '#ffd700'
    }).setOrigin(0.5).setDepth(15);
    
    this.tweens.addCounter({
      from: 0,
      to: xpGained,
      duration: 1500,
      onUpdate: function(tween) {
        xpText.setText('+' + Math.round(tween.getValue()) + ' XP');
      }
    });
  },
  
  createContinueButton: function() {
    var btn = this.add.text(384, 530, '[ CONTINUE ]', {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5).setDepth(15).setInteractive({ useHandCursor: true });
    
    btn.on('pointerover', function() { btn.setColor('#66ff66'); });
    btn.on('pointerout', function() { btn.setColor('#00ff00'); });
    btn.on('pointerdown', function() {
      this.scene.start('GameScene');
    }, this);
  }
});
```

**Integration**: Launch VictoryScene from GameScene when room is cleared. Launch DefeatScene on player death.

**Testing**: Win a room, verify victory screen. Die, verify defeat screen.

---

## Task 5: Combo Counter Visual Display

**Files to edit**: `js/vfx.js`, `js/ui.js`

**What to build**: Visual combo counter that:
- Shows current combo count prominently
- Scales up on combo increments
- Changes color at milestones (5=yellow, 10=orange, 15+=red)
- Shakes on milestone hits

**Code example**:
```javascript
// In js/vfx.js
MMA.VFX.comboDisplay = {
  create: function(scene) {
    var container = scene.add.container(700, 100).setDepth(20);
    container.setVisible(false);
    
    var bg = scene.add.rectangle(0, 0, 60, 50, 0x000000, 0.6);
    bg.setStrokeStyle(2, 0xffd700);
    container.add(bg);
    
    var comboText = scene.add.text(0, -5, '0', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(comboText);
    
    var label = scene.add.text(0, 18, 'COMBO', {
      fontSize: '10px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    }).setOrigin(0.5);
    container.add(label);
    
    scene.comboDisplay = container;
    scene.comboText = comboText;
    scene.comboBg = bg;
  },
  
  update: function(scene, count) {
    if (!scene.comboDisplay) {
      MMA.VFX.comboDisplay.create(scene);
    }
    
    scene.comboText.setText(count);
    scene.comboDisplay.setVisible(count > 0);
    
    var color = '#ffffff';
    var strokeColor = 0xffd700;
    if (count >= 15) { color = '#ff0000'; strokeColor = 0xff0000; }
    else if (count >= 10) { color = '#ff8800'; strokeColor = 0xff8800; }
    else if (count >= 5) { color = '#ffff00'; strokeColor = 0xffff00; }
    
    scene.comboText.setColor(color);
    scene.comboBg.setStrokeStyle(2, strokeColor);
    
    if (count > 0) {
      scene.tweens.add({
        targets: scene.comboDisplay,
        scale: { from: 1.3, to: 1 },
        duration: 150,
        ease: 'Back.easeOut'
      });
    }
    
    if (count === 5 || count === 10 || count === 15 || count === 20) {
      scene.tweens.add({
        targets: scene.comboDisplay,
        x: '+=5',
        duration: 50,
        yoyo: true,
        repeat: 3
      });
    }
  }
};
```

**Integration**: Call `MMA.VFX.comboDisplay.update(scene, comboCount)` from combat.js when player lands a hit.

**Testing**: Land consecutive hits, verify combo counter appears and animates.

---

# TASK CATEGORY 2: Audio (5 Tasks)

## Task 6: Background Music Loops Per Zone

**Files to edit**: `js/sounds.js`

**What to build**: Procedural BGM for each zone:
- Zone 1: Dark ambient (low drone)
- Zone 2: Gym rhythm (kick pattern)
- Zone 3: Arena bass + crowd

**Code example**:
```javascript
// In js/sounds.js
MMA_AUDIO.bgm = {
  currentZone: null,
  isPlaying: false,
  
  zone1: function(ctx, startTime) {
    var drone = ctx.createOscillator();
    drone.type = 'sine';
    drone.frequency.setValueAtTime(55, startTime);
    var droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0.08, startTime);
    drone.connect(droneGain);
    droneGain.connect(ctx.destination);
    drone.start(startTime);
    drone.stop(startTime + 8);
  },
  
  zone2: function(ctx, startTime) {
    var playKick = function(time) {
      var osc = ctx.createOscillator();
      osc.frequency.setValueAtTime(150, time);
      osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
      var gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.5);
    };
  },
  
  zone3: function(ctx, startTime) {
    var bass = ctx.createOscillator();
    bass.type = 'sawtooth';
    bass.frequency.setValueAtTime(40, startTime);
    var bassFilter = ctx.createBiquadFilter();
    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(100, startTime);
    var bassGain = ctx.createGain();
    bassGain.gain.setValueAtTime(0.15, startTime);
    bass.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(ctx.destination);
    bass.start(startTime);
  },
  
  play: function(zone) {
    var ctx = MMA_AUDIO.getContext();
    if (!ctx) return;
    this.stop();
    this.currentZone = zone;
    this.isPlaying = true;
    var now = ctx.currentTime;
    if (zone === 1) this.zone1(ctx, now);
    else if (zone === 2) this.zone2(ctx, now);
    else if (zone === 3) this.zone3(ctx, now);
  },
  
  stop: function() {
    this.isPlaying = false;
    this.currentZone = null;
  }
};
```

**Integration**: Call `MMA_AUDIO.bgm.play(zone)` when entering a room.

**Testing**: Move between zones, verify BGM changes appropriately.

---

## Task 7: Crowd/Ambient Sounds

**Files to edit**: `js/sounds.js`

**What to build**: Ambient sound layers:
- Crowd murmur in arena
- Traffic in street
- Gym impacts

**Code example**:
```javascript
MMA_AUDIO.ambient = {
  createNoiseBuffer: function(ctx, duration) {
    var bufferSize = ctx.sampleRate * duration;
    var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  },
  
  crowd: function(ctx) {
    var source = ctx.createBufferSource();
    source.buffer = this.createNoiseBuffer(ctx, 4);
    source.loop = true;
    var filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;
    var gain = ctx.createGain();
    gain.gain.value = 0.1;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    return { source: source };
  },
  
  traffic: function(ctx) {
    var source = ctx.createBufferSource();
    source.buffer = this.createNoiseBuffer(ctx, 3);
    source.loop = true;
    var filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;
    var gain = ctx.createGain();
    gain.gain.value = 0.05;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    return { source: source };
  }
};
```

**Testing**: Visit each zone, verify ambient sounds match environment.

---

## Task 8: Distinct Sounds Per Move Type

**Files to edit**: `js/sounds.js`

**What to build**: Unique sounds for move types:
- Jabs: Quick snap
- Crosses: Deep power
- Kicks: Whoosh + impact
- Grapples: Grunts + grab
- Submissions: Joint pop

**Code example**:
```javascript
sfx.moves = {
  jab: function() {
    MMA_AUDIO.playTone([800, 400], 0.05, 'square');
    MMA_AUDIO.playTone(0, 0.03, 'noise');
  },
  
  cross: function() {
    MMA_AUDIO.playTone([300, 150], 0.12, 'sawtooth');
    MMA_AUDIO.playTone(0, 0.1, 'noise');
  },
  
  kick: function() {
    var ctx = MMA_AUDIO.getContext();
    var osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  },
  
  grapple: function() {
    MMA_AUDIO.playTone([200, 100], 0.08, 'square');
  },
  
  submission: function() {
    MMA_AUDIO.playTone([400, 100], 0.1, 'square');
    MMA_AUDIO.playTone(0, 0.08, 'noise');
  }
};
```

**Testing**: Use different moves, verify distinct sounds.

---

## Task 9: UI Navigation Sounds

**Files to edit**: `js/sounds.js`

**What to build**: Menu interaction sounds:
- Highlight
- Confirm
- Back
- Error

**Code example**:
```javascript
sfx.ui = {
  highlight: function() {
    MMA_AUDIO.playTone([600, 800], 0.04, 'sine');
  },
  
  confirm: function() {
    MMA_AUDIO.playTone(880, 0.06, 'sine');
    MMA_AUDIO.playTone(1100, 0.08, 'sine');
  },
  
  back: function() {
    MMA_AUDIO.playTone([400, 300], 0.06, 'triangle');
  },
  
  error: function() {
    MMA_AUDIO.playTone(150, 0.15, 'square');
  }
};
```

**Testing**: Navigate menus, verify sounds play on interactions.

---

## Task 10: Victory/Defeat Jingles

**Files to edit**: `js/sounds.js`, create scene files

**What to build**: Musical jingles:
- Victory: Ascending arpeggio
- Defeat: Descending sad tones

**Code example**:
```javascript
sfx.jingles = {
  victory: function() {
    var ctx = MMA_AUDIO.getContext();
    var now = ctx.currentTime;
    var notes = [262, 330, 392, 523]; // C4, E4, G4, C5
    notes.forEach(function(freq, i) {
      var osc = ctx.createOscillator();
      osc.frequency.value = freq;
      osc.type = 'sine';
      var gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.2, now + i * 0.15 + 0.02);
      gain.gain.linearRampToValueAtTime(0, now + i * 0.15 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.35);
    });
  },
  
  defeat: function() {
    var ctx = MMA_AUDIO.getContext();
    var now = ctx.currentTime;
    var notes = [392, 330, 262, 196]; // G4, E4, C4, G3
    notes.forEach(function(freq, i) {
      var osc = ctx.createOscillator();
      osc.frequency.value = freq;
      osc.type = 'triangle';
      var gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now + i * 0.25);
      gain.gain.linearRampToValueAtTime(0.15, now + i * 0.25 + 0.02);
      gain.gain.linearRampToValueAtTime(0, now + i * 0.25 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.25);
      osc.stop(now + i * 0.25 + 0.45);
    });
  }
};
```

**Testing**: Win/lose fights, verify jingles play.

---

# TASK CATEGORY 3: Enemy AI & Variety (5 Tasks)

## Task 11: New Enemy Types with Unique AI

**Files to edit**: `js/enemies.js`

**What to build**: New enemy types:
- **Boxer**: Fast jabs, slips, counters
- **Karateka**: Powerful kicks, waits for openings
- **Street Fighter**: Unpredictable mix of strikes and grabs

**Code example**:
```javascript
// Add to TYPES
boxer: {
  name: 'Boxer',
  hp: 65, maxHp: 65,
  speed: 110,
  attackDamage: 12,
  attackCooldownMax: 700,
  attackRange: 55,
  chaseRange: 250,
  color: 0xcc4444,
  xpReward: 35,
  teachesMove: 'jab',
  zone: 2,
  aiPattern: 'boxer',
  groundDefense: 0.2,
  groundEscape: 0.2
},
karateka: {
  name: 'Karateka',
  hp: 80, maxHp: 80,
  speed: 75,
  attackDamage: 18,
  attackCooldownMax: 1400,
  attackRange: 80,
  chaseRange: 220,
  color: 0xeeeeee,
  xpReward: 40,
  teachesMove: 'roundhouseKick',
  zone: 2,
  aiPattern: 'karateka',
  groundDefense: 0.3,
  groundEscape: 0.2
}

// Add AI pattern
MMA.Enemies.AI.boxer = function(enemy, player, scene, dt) {
  var dx = player.x - enemy.x, dy = player.y - enemy.y, dist = Math.sqrt(dx*dx + dy*dy) || 1;
  
  if (dist < enemy.type.chaseRange) {
    if (dist < enemy.type.attackRange) {
      enemy.setVelocity(0, 0);
      if (enemy.attackCooldown <= 0) {
        enemy.attackCooldown = enemy.type.attackCooldownMax;
        MMA.Enemies.damagePlayer(enemy, scene, enemy.type.attackDamage);
        MMA.UI.showDamageText(scene, player.x, player.y - 30, 'JAB!', '#ffffff');
      }
    } else {
      enemy.setVelocity((dx/dist)*enemy.type.speed, (dy/dist)*enemy.type.speed);
    }
  }
  if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;
};

MMA.Enemies.AI.karateka = function(enemy, player, scene, dt) {
  // Karateka waits at range, then strikes with powerful kicks
  var dx = player.x - enemy.x, dy = player.y - enemy.y, dist = Math.sqrt(dx*dx + dy*dy) || 1;
  
  if (enemy.aiState === 'waiting') {
    enemy.setVelocity(0, 0);
    enemy.waitTimer -= dt;
    if (enemy.waitTimer <= 0) {
      enemy.aiState = 'kicking';
      enemy.attackCooldown = enemy.type.attackCooldownMax;
      MMA.Enemies.damagePlayer(enemy, scene, enemy.type.attackDamage * 1.5);
    }
    return;
  }
  
  if (dist < enemy.type.chaseRange) {
    if (dist > enemy.type.attackRange * 1.2) {
      enemy.setVelocity((dx/dist)*enemy.type.speed * 0.7, (dy/dist)*enemy.type.speed * 0.7);
    } else {
      enemy.aiState = 'waiting';
      enemy.waitTimer = 800;
      enemy.setVelocity(0, 0);
    }
  }
  if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;
};
```

**Testing**: Spawn new enemies, verify they behave differently from existing types.

---

## Task 12: Elite Enemy Variants

**Files to edit**: `js/enemies.js`

**What to build**: Elite variants with:
- 2x HP, 1.5x damage
- Unique color glow
- Special abilities (regen, enrage, etc.)

**Code example**:
```javascript
// In ELITE_TYPES
ELITE_TYPES: {
  eliteBoxer: {
    baseType: 'boxer',
    name: 'Elite Boxer',
    hpMultiplier: 2,
    attackMultiplier: 1.5,
    speedBonus: 20,
    color: 0xff6666,
    colorGlow: 0xff0000,
    xpMultiplier: 2.5,
    dropChance: 0.25,
    specialAbility: 'counterStance'
  },
  eliteKarateka: {
    baseType: 'karateka',
    name: 'Sensei',
    hpMultiplier: 2.5,
    attackMultiplier: 1.8,
    speedBonus: 15,
    color: 0xffffff,
    colorGlow: 0x00ffff,
    xpMultiplier: 3,
    dropChance: 0.3,
    specialAbility: 'focusStrike'
  }
}

// Special abilities implementation
MMA.Enemies.applyEliteAbility = function(enemy, ability) {
  switch(ability) {
    case 'counterStance':
      // Enemy has increased counter window
      enemy.counterWindow = 400; // ms
      break;
    case 'focusStrike':
      // Periodic powerful attack
      enemy.focusCharge = true;
      break;
  }
};
```

**Testing**: Spawn elites, verify they are stronger and have glow effect.

---

## Task 13: Enemy Team Coordination

**Files to edit**: `js/enemies.js`

**What to build**: Enemies coordinate attacks:
- One distracts, others flank
- Call out attacks
- Retreat together

**Code example**:
```javascript
// Coordination system
MMA.Enemies.coordination = {
  // Check for coordination opportunity
  checkCoordination: function(scene, delta) {
    var enemies = scene.enemies.filter(function(e) {
      return e.active && e.state !== 'dead';
    });
    
    if (enemies.length < 2) return;
    
    // Find eligible coordinator (not currently coordinating)
    var coordinators = enemies.filter(function(e) {
      return !e.is Coordinating && e.attackCooldown <= 0;
    });
    
    if (coordinators.length === 0) return;
    
    // Random chance to coordinate
    if (Math.random() < 0.005 * (delta / 16)) {
      this.executeCoordination(scene, coordinators);
    }
  },
  
  executeCoordination: function(scene, coordinators) {
    var player = scene.player;
    if (!player) return;
    
    var leader = coordinators[0];
    leader.isCoordination = true;
    
    // Leader distracts
    var distractMsg = ['ATTACK NOW!', 'FLANK HIM!', 'COORDINATED!'][Math.floor(Math.random() * 3)];
    MMA.UI.showDamageText(scene, leader.x, leader.y - 40, distractMsg, '#ff8800');
    
    // Find flankers
    var flankers = coordinators.slice(1, 3);
    flankers.forEach(function(flanker, i) {
      setTimeout(function() {
        if (flanker && flanker.active) {
          var angle = Math.atan2(player.y - flanker.y, player.x - flanker.x);
          angle += (i === 0 ? 0.8 : -0.8); // Spread angles
          flanker.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);
          flanker.attackCooldown = 500;
        }
      }, 500 + i * 200);
    });
  }
};
```

**Testing**: Face multiple enemies, verify they coordinate attacks.

---

## Task 14: Defensive/Counter-AI Patterns

**Files to edit**: `js/enemies.js`

**What to build**: Enemy AI that:
- Blocks player attacks
- Counters after blocked attacks
- Uses evasive movement

**Code example**:
```javascript
// Add defensive AI patterns
MMA.Enemies.AI.defender = function(enemy, player, scene, dt) {
  var dx = player.x - enemy.x, dy = player.y - enemy.y, dist = Math.sqrt(dx*dx + dy*dy) || 1;
  
  // Track player attack state
  if (player.isAttacking && !enemy.isBlocking) {
    // Block the attack
    enemy.isBlocking = true;
    enemy.blockTimer = 400;
    
    // After blocking, counter
    scene.time.delayedCall(300, function() {
      if (enemy && enemy.active) {
        enemy.isBlocking = false;
        // Counter attack
        enemy.attackCooldown = enemy.type.attackCooldownMax;
        MMA.Enemies.damagePlayer(enemy, scene, Math.round(enemy.type.attackDamage * 1.3));
        MMA.UI.showDamageText(scene, player.x, player.y - 30, 'COUNTER!', '#ff0000');
      }
    });
  }
  
  if (enemy.blockTimer > 0) {
    enemy.blockTimer -= dt;
    enemy.setVelocity(0,
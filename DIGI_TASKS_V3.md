# MMA RPG — Complete Feature Implementation Brief

## Project Context

This is an action RPG fighting game built on Phaser 3 with procedural sprite generation and Web Audio API sound synthesis. The game uses a namespace pattern where all modules attach to `window.MMA` (e.g., `window.MMA.Enemies`, `window.MMA.Sprites`, `window.MMA.VFX`). All JS files are vanilla JavaScript without modules or bundlers. The game runs at 768×576 pixels with a 16×12 tile grid (48px tiles).

The codebase is located at `~/.openclaw/workspace/mma-rpg` and runs via `python3 -m http.server 8088` from the project root.

## DO NOT MODIFY

The following files are being actively edited by other agents and should not be modified:

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

## Implementation Instructions

Implement ALL of the following features. Work through them sequentially, testing as you go. When ALL features are complete, run `node --check` on every JS file, bump cache busters, restart server, and commit+push everything as one commit.

This is a single continuous implementation session. Read each section, implement the code, test briefly, then move to the next section. Do not skip around or implement partial features.

---

## Features to Implement

### A. Visual & Sprites

**Enemy Sprite Variants and Animations.** Currently enemies use static sprites. You need to add animated variants with idle breathing animations, attack windup poses, hit reaction poses, and death animations. Open `js/sprites.js` and add an `ENEMY_VARIANTS` object after the existing config objects. Each enemy type should have frames for idle (array of 3 texture keys), attackWindup (single key), hitReaction (single key), and deathFrames (array). Then add a helper function `MMA.Sprites.playEnemyAnimation(sprite, animationKey, scene)` that handles playing these animations. Finally, integrate this into `js/enemies.js` by calling the animation helper when enemies take damage or die.

```javascript
// Add to js/sprites.js after VISUAL_VARIANTS:
ENEMY_VARIANTS: {
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
},

playEnemyAnimation: function(sprite, animationKey, scene) {
  var variant = MMA.Sprites.ENEMY_VARIANTS[sprite.typeKey];
  if (!variant || !variant[animationKey]) return;
  
  var frameKey = variant[animationKey];
  if (Array.isArray(frameKey)) {
    // Play animation sequence
    scene.tweens.add({
      targets: sprite,
      texture: frameKey[0],
      duration: 100
    });
  } else {
    sprite.setTexture(frameKey);
  }
}
```

**Zone Environment Decorations.** Add environmental decorations that spawn in each zone. In `js/sprites.js`, create a `DECORATIONS` object mapping zone numbers to decoration types. Zone 1 should have barrels, trash cans, crates, street lamps, and graffiti. Zone 2 should have heavy bags, speed bags, weight racks, mirrors, and boxing ring elements. Zone 3 should have octagon/cage elements, corner posts, and crowd silhouettes. Then add `MMA.Sprites.spawnZoneDecorations(scene, zone, roomId)` that reads decoration spawn positions from room definitions in `js/zones.js` and creates sprites at those positions.

```javascript
// Add to js/sprites.js
DECORATIONS: {
  zone1: {
    barrel: { texture: 'decoration_barrel', size: { w: 1, h: 1.5 } },
    trashCan: { texture: 'decoration_trash', size: { w: 0.8, h: 1.2 } },
    streetLamp: { texture: 'decoration_lamp', size: { w: 0.5, h: 3 } },
    crate: { texture: 'decoration_crate', size: { w: 1, h: 1 } }
  },
  zone2: {
    heavyBag: { texture: 'decoration_heavybag', size: { w: 1, h: 2 } },
    speedBag: { texture: 'decoration_speedbag', size: { w: 0.5, h: 1.5 } },
    weightRack: { texture: 'decoration_weights', size: { w: 2, h: 1.5 } },
    mirror: { texture: 'decoration_mirror', size: { w: 1.5, h: 2.5 } }
  },
  zone3: {
    octagon: { texture: 'decoration_octagon', size: { w: 8, h: 6 } },
    cornerPost: { texture: 'decoration_corner', size: { w: 0.5, h: 0.5 } },
    crowdSilhouette: { texture: 'decoration_crowd', size: { w: 4, h: 2 } }
  }
},

spawnZoneDecorations: function(scene, zone, roomId) {
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
}
```

Add `decorationPositions` arrays to room definitions in `js/zones.js`.

**Weather and Atmosphere Effects.** Extend `js/vfx.js` to add weather effects. Add a `MMA.VFX.weatherEffects` object with functions for rain (particle system falling from top), fog/mist (tileSprite overlay), dust particles (floating ambient), and night (darkening overlay). Add `MMA.VFX.applyRoomWeather(scene, roomId)` that reads the room's weather options and applies the appropriate effect. The zone definitions already have `weatherOptions` arrays in each room - use those.

```javascript
// Extend js/vfx.js
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
  
  night: function(scene) {
    var overlay = scene.add.rectangle(384, 288, 768, 576, 0x000044, 0.3);
    overlay.setDepth(40);
    return overlay;
  },
  
  clear: function(scene) {
    if (scene.weatherParticles) {
      scene.weatherParticles.destroy();
      scene.weatherParticles = null;
    }
    if (scene.fogLayer) {
      scene.fogLayer.destroy();
      scene.fogLayer = null;
    }
    if (scene.lightingOverlay) {
      scene.lightingOverlay.destroy();
      scene.lightingOverlay = null;
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
      scene.lightingOverlay = MMA.VFX.weatherEffects.night(scene);
      break;
  }
};
```

Call this from GameScene when entering a room.

**Combo Counter Visual Display.** Add a visual combo counter to `js/vfx.js` that shows the current combo count prominently. It should scale up on combo increments, change color at milestones (5=yellow, 10=orange, 15+=red), and shake on milestone hits. Create `MMA.VFX.comboDisplay` with `create(scene)` and `update(scene, count)` functions.

```javascript
// Add to js/vfx.js
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

Call `MMA.VFX.comboDisplay.update(scene, comboCount)` from combat.js when the player lands a hit.

**Victory/Defeat Screen Animations.** The existing VictoryScene.js is functional but basic. Enhance it with animated victory text (scale pulse), XP gain animation (counting up), and stats display. Then create a new `js/scenes/DefeatScene.js` with similar polish showing the player's stats, XP earned, and retry option.

```javascript
// Enhanced create() in VictoryScene.js - add after existing create code
// Scale pulse animation on victory text
this.tweens.add({
  targets: victoryText,
  scale: { from: 0.5, to: 1 },
  duration: 500,
  ease: 'Back.easeOut'
});

// XP gain animation
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
```

---

### B. Audio System

**Background Music Loops Per Zone.** Extend `js/sounds.js` to add BGM for each zone. Zone 1 (street) should have dark ambient with low drone. Zone 2 (gym) should have gym rhythm with kick pattern. Zone 3 (arena) should have arena bass with crowd ambience. Add `MMA_AUDIO.bgm` object with `play(zone)` and `stop()` functions.

```javascript
// Add to js/sounds.js
MMA_AUDIO.bgm = {
  currentZone: null,
  isPlaying: false,
  
  zone1: function(ctx, startTime) {
    // Dark ambient drone
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
    // Gym kick pattern
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
    // Loop pattern
    for (var i = 0; i < 8; i++) {
      playKick(startTime + i * 0.5);
    }
  },
  
  zone3: function(ctx, startTime) {
    // Arena bass
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
    bass.stop(startTime + 8);
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

**Crowd and Ambient Sounds.** Add ambient sound layers to `js/sounds.js`. Create `MMA_AUDIO.ambient` with functions for crowd murmur (filtered noise), traffic (low-pass filtered noise), and gym impacts. These should loop continuously and layer with BGM.

```javascript
MMA_AUDIO.ambient = {
  currentAmbient: null,
  
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
    return { source: source, gain: gain };
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
    return { source: source, gain: gain };
  },
  
  gym: function(ctx) {
    // Gym ambient with occasional impact sounds
    var source = ctx.createBufferSource();
    source.buffer = this.createNoiseBuffer(ctx, 2);
    source.loop = true;
    var filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 800;
    var gain = ctx.createGain();
    gain.gain.value = 0.03;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    return { source: source, gain: gain };
  },
  
  play: function(type) {
    var ctx = MMA_AUDIO.getContext();
    if (!ctx) return;
    this.stop();
    
    switch(type) {
      case 'crowd':
        this.currentAmbient = this.crowd(ctx);
        break;
      case 'traffic':
        this.currentAmbient = this.traffic(ctx);
        break;
      case 'gym':
        this.currentAmbient = this.gym(ctx);
        break;
    }
  },
  
  stop: function() {
    if (this.currentAmbient && this.currentAmbient.source) {
      this.currentAmbient.source.stop();
      this.currentAmbient = null;
    }
  }
};
```

**Distinct Sounds Per Move Type.** Add move-specific sounds to `js/sounds.js`. Extend `sfx.moves` with unique sounds for jabs (quick snap), crosses (deep power), kicks (whoosh + impact), grapples (grunts + grab), and submissions (joint pop).

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

**UI Navigation Sounds.** Add menu interaction sounds to `js/sounds.js` with highlight, confirm, back, and error sounds.

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

**Victory and Defeat Jingles.** Add musical jingles that play on victory (ascending arpeggio) and defeat (descending sad tones).

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

---

### C. Enemy Types & AI

The enemy type definitions already exist in `js/enemies.js` with many variants including boxers, karatekas, and various AI patterns. However, you need to add defensive AI patterns and team coordination.

**Defensive and Counter-AI Patterns.** Add defensive AI to `js/enemies.js` that makes enemies block player attacks, counter after blocked attacks, and use evasive movement. Add a new AI pattern called 'defender' in the `MMA.Enemies.AI` object.

```javascript
// Add to MMA.Enemies.AI in js/enemies.js
defender: function(enemy, player, scene, dt) {
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
        enemy.attackCooldown = enemy.type.attackCooldownMax;
        MMA.Enemies.damagePlayer(enemy, scene, Math.round(enemy.type.attackDamage * 1.3));
        MMA.UI.showDamageText(scene, player.x, player.y - 30, 'COUNTER!', '#ff0000');
      }
    });
  }
  
  if (enemy.blockTimer > 0) {
    enemy.blockTimer -= dt;
    enemy.setVelocity(0, 0);
    return;
  }
  
  // Normal chase behavior when not blocking
  if (dist < enemy.type.chaseRange) {
    if (dist > enemy.type.attackRange) {
      enemy.setVelocity((dx/dist)*enemy.type.speed * 0.8, (dy/dist)*enemy.type.speed * 0.8);
    } else {
      enemy.setVelocity(0, 0);
    }
  }
  if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;
}
```

**Enemy Team Coordination.** Add coordination logic so multiple enemies work together. One distracts while others flank. Create `MMA.Enemies.coordination.checkCoordination(scene, delta)` that runs periodically and triggers coordinated attacks when multiple enemies are present.

```javascript
// Add to js/enemies.js
MMA.Enemies.coordination = {
  checkCoordination: function(scene, delta) {
    var enemies = scene.enemies.filter(function(e) {
      return e.active && e.state !== 'dead';
    });
    
    if (enemies.length < 2) return;
    
    var coordinators = enemies.filter(function(e) {
      return !e.isCoordination && e.attackCooldown <= 0;
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
    
    var distractMsg = ['ATTACK NOW!', 'FLANK HIM!', 'COORDINATED!'][Math.floor(Math.random() * 3)];
    MMA.UI.showDamageText(scene, leader.x, leader.y - 40, distractMsg, '#ff8800');
    
    var flankers = coordinators.slice(1, 3);
    flankers.forEach(function(flanker, i) {
      scene.time.delayedCall(500 + i * 200, function() {
        if (flanker && flanker.active) {
          var angle = Math.atan2(player.y - flanker.y, player.x - flanker.x);
          angle += (i === 0 ? 0.8 : -0.8);
          flanker.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);
          flanker.attackCooldown = 500;
        }
      });
    });
  }
};
```

Call `MMA.Enemies.coordination.checkCoordination(scene, delta)` from the enemy update loop.

---

### D. Zone & Room Content

The zone definitions in `js/zones.js` are already comprehensive with room connections, enemy pools, weather options, crowd metadata, and special room types (clinics, training rooms). However, you need to add decoration spawn positions to the room definitions.

Add `decorationPositions` arrays to room definitions in `js/zones.js`. Each decoration position needs `col`, `row`, and `type` properties. For example:

```javascript
// Add to room definitions in js/zones.js
room1: {
  id: 'room1',
  zone: 1,
  // ... existing properties ...
  decorationPositions: [
    { col: 2, row: 10, type: 'barrel' },
    { col: 13, row: 2, type: 'streetLamp' },
    { col: 14, row: 10, type: 'trashCan' }
  ]
}
```

---

### E. Items & Loot

The basic pickup system exists in `js/items.js` but enemy drops are not implemented. You need to add a full loot system.

**Enemy Drop Tables.** Extend `js/items.js` with enemy-specific loot tables. Create a `DROP_TABLES` object mapping enemy types to arrays of possible drops with weights and rarity tiers.

```javascript
// Extend js/items.js
DROP_TABLES: {
  streetThug: [
    { type: 'cash', weight: 60, min: 10, max: 30 },
    { type: 'stat', stat: 'attackDamage', value: 2, duration: 15000, weight: 25, name: 'Energy Drink', description: '+2 Attack (15s)' },
    { type: 'stat', stat: 'speed', value: 10, duration: 10000, weight: 15, name: 'Adrenaline', description: '+10 Speed (10s)' }
  ],
  barBrawler: [
    { type: 'cash', weight: 70, min: 20, max: 50 },
    { type: 'stat', stat: 'defense', value: 0.1, duration: 12000, weight: 20, name: 'Guard', description: '+10% Defense (12s)' },
    { type: 'hp', value: 15, weight: 10, name: 'First Aid', description: '+15 HP' }
  ],
  boss: [
    { type: 'cash', weight: 50, min: 100, max: 300 },
    { type: 'equipment', slot: 'gloves', rarity: 'rare', weight: 30 },
    { type: 'stat', stat: 'maxHp', value: 20, duration: 0, weight: 20, name: 'Heart of Endurance', description: '+20 Max HP' }
  ]
},

RARITY_COLORS: {
  common: '#ffffff',
  uncommon: '#1eff00',
  rare: '#0070dd',
  epic: '#a335ee',
  legendary: '#ff8000'
}
```

**Spawn Drops for Enemy.** Implement `MMA.Items.spawnDropsForEnemy(scene, enemy)` that reads the enemy's type from the drop table, rolls for drops based on weights, and spawns pickup sprites at the enemy's position.

```javascript
spawnDropsForEnemy: function(scene, enemy) {
  if (!enemy || !enemy.typeKey) return null;
  
  var dropTable = this.DROP_TABLES[enemy.typeKey] || this.DROP_TABLES.common || [];
  var drops = [];
  
  dropTable.forEach(function(drop) {
    // Roll for this drop
    if (Math.random() * 100 < drop.weight) {
      var itemData = {
        type: drop.type,
        name: drop.name || 'Item',
        description: drop.description || '',
        rarity: drop.rarity || 'common'
      };
      
      if (drop.type === 'cash') {
        itemData.value = drop.min + Math.floor(Math.random() * (drop.max - drop.min));
        itemData.stat = 'cash';
      } else if (drop.type === 'stat') {
        itemData.stat = drop.stat;
        itemData.value = drop.value;
        itemData.duration = drop.duration || 0;
      } else if (drop.type === 'hp') {
        itemData.value = drop.value;
        itemData.stat = 'hp';
      } else if (drop.type === 'equipment') {
        itemData.slot = drop.slot;
        itemData.rarity = drop.rarity;
      }
      
      drops.push(itemData);
    }
  });
  
  // Spawn pickup sprites
  var pickupSprites = [];
  drops.forEach(function(drop, i) {
    var offsetX = (i - (drops.length - 1) / 2) * 20;
    var pickup = scene.add.sprite(enemy.x + offsetX, enemy.y, 'pickup_' + drop.type);
    pickup.setDepth(10);
    pickup.itemData = drop;
    pickupSprites.push(pickup);
    
    // Animate pop-in
    pickup.setScale(0);
    scene.tweens.add({
      targets: pickup,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });
  });
  
  return pickupSprites;
}
```

---

### F. UI & Quality of Life

**Defeat Scene Creation.** Create `js/scenes/DefeatScene.js` showing the player's defeat with stats summary, XP earned (if any from partial progress), and retry button. Match the style of VictoryScene but with appropriate theming (dark colors, red accents).

```javascript
// js/scenes/DefeatScene.js
var DefeatScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function DefeatScene() {
    Phaser.Scene.call(this, { key: 'DefeatScene' });
  },

  create: function () {
    var centerX = this.cameras.main.width / 2;
    var centerY = this.cameras.main.height / 2;
    
    // Dark background
    var bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.85);
    bg.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

    // Defeat text with animation
    var defeatText = this.add.text(centerX, centerY - 140, 'DEFEATED', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '64px',
      color: '#ff3333',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: defeatText,
      scale: { from: 0.5, to: 1 },
      duration: 500,
      ease: 'Back.easeOut'
    });

    // Stats summary
    var enemiesDefeated = this.registry.get('enemiesDefeated') || 0;
    var playTime = this.registry.get('playTime') || 0;
    var minutes = Math.floor(playTime / 60);
    var seconds = Math.floor(playTime % 60);
    
    var summary = 'Enemies Defeated: ' + enemiesDefeated + '\nTime: ' + minutes + 'm ' + seconds + 's';
    this.add.text(centerX, centerY, summary, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#cccccc',
      align: 'center'
    }).setOrigin(0.5);

    // Retry button
    this.retryBtn = this.add.text(centerX, centerY + 120, '[ RETRY ]', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '28px',
      color: '#ff6666'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    this.retryBtn.on('pointerover', function() { this.retryBtn.setColor('#ff9999'); }, this);
    this.retryBtn.on('pointerout', function() { this.retryBtn.setColor('#ff6666'); }, this);
    this.retryBtn.on('pointerdown', this.retryGame, this);
    
    // Title button
    this.titleBtn = this.add.text(centerX, centerY + 170, '[ TITLE ]', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#888888'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    this.titleBtn.on('pointerover', function() { this.titleBtn.setColor('#aaaaaa'); }, this);
    this.titleBtn.on('pointerout', function() { this.titleBtn.setColor('#888888'); }, this);
    this.titleBtn.on('pointerdown', this.returnToTitle, this);
    
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  },

  update: function () {
    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.retryGame();
    }
  },

  retryGame: function() {
    this.scene.stop('GameScene');
    this.scene.start('GameScene');
  },

  returnToTitle: function() {
    this.scene.stop('GameScene');
    this.scene.start('TitleScene');
  }
});

---

## Final Checklist

Before committing, verify all of the following:

- Run `node --check` on every JS file you modified to ensure no syntax errors
- Ensure all code examples have been implemented, not just documented
- Bump cache busters in index.html if you added any new script references
- Restart the server and test that the game loads correctly
- Test at least one feature from each section (visual, audio, enemy, items, UI)

When ready to commit:

```bash
cd ~/.openclaw/workspace/mma-rpg
git add -A
git commit -m "Complete feature implementation"
git push origin main
```

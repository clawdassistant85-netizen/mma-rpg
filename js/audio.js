// MMA RPG zone audio extensions
(function() {
  'use strict';

  window.MMA = window.MMA || {};
  MMA.Audio = MMA.Audio || {};

  // Optional bridge to existing procedural ambient system.
  MMA.Audio.playAmbient = MMA.Audio.playAmbient || function(scene, zoneNum) {
    var z = zoneNum || 1;
    if (window.MMA_AUDIO && MMA_AUDIO.ambient && typeof MMA_AUDIO.ambient.play === 'function') {
      if (z >= 3) MMA_AUDIO.ambient.play('crowd');
      else if (z === 2) MMA_AUDIO.ambient.play('gym');
      else MMA_AUDIO.ambient.play('traffic');
    }
  };

  MMA.Audio.updateFightIntensity = function(scene, level) {
    // level: 0=ambient, 1=encounter, 2=combat, 3=combo, 4=finish
    if (!scene || scene._audioIntensity === level) return;
    scene._audioIntensity = level;
    // Log the intensity shift for web audio integration
    if (typeof console !== 'undefined') {
      // Placeholder for Web Audio API integration
      // console.log('Audio intensity:', level);
    }
  };

  MMA.Audio.getIntensityForState = function(scene) {
    if (!scene) return 0;
    if (scene._impactReplayActive) return 4;
    var enemies = scene.enemyGroup ? scene.enemyGroup.getChildren().filter(function(e) { return e.active && e.stats && e.stats.hp > 0; }) : [];
    if (enemies.length === 0) return 0;
    var combo = scene.player && scene.player.comboState ? scene.player.comboState.count || 0 : 0;
    if (combo >= 10) return 3;
    return 2;
  };

  // If playCrowdCheer doesn't exist, add it
  if (!MMA.Audio.playCrowdCheer) {
    MMA.Audio.playCrowdCheer = function(scene, zoneNum) {
      // Placeholder — cheer intensity varies by zone
      // Zone 4 arena gets loudest crowd
      var intensity = zoneNum >= 4 ? 'loud' : zoneNum >= 2 ? 'medium' : 'quiet';
      if (window.MMA && MMA.UI && typeof MMA.UI.addHype === 'function') {
        MMA.UI.addHype(scene, intensity === 'loud' ? 20 : intensity === 'medium' ? 12 : 6);
      }
    };
  }

  MMA.Audio.playZoneSting = MMA.Audio.playZoneSting || function(scene, zoneNum) {
    if (!scene) return;
    var stingNames = { 1: 'gym_sting', 2: 'underground_sting', 3: 'beach_sting', 4: 'arena_sting' };
    var sting = stingNames[zoneNum] || stingNames[1];
    // Try to play if sound exists in Phaser cache
    try {
      if (scene.sound && scene.cache && scene.cache.audio && scene.cache.audio.has(sting)) {
        scene.sound.play(sting, { volume: 0.6 });
      }
    } catch(e) {}
    // Regardless, boost hype on zone entry
    if (window.MMA && MMA.UI && typeof MMA.UI.addHype === 'function') {
      MMA.UI.addHype(scene, 15);
    }
  };
})();
// === ENTRANCE MUSIC STUB ===
// Per-creed entrance theme triggers on fight start
MMA.Audio = window.MMA.Audio || {};

MMA.Audio.playEntranceTheme = MMA.Audio.playEntranceTheme || function(scene, creed) {
  // Web Audio API stub - plays a short procedural tone sequence per creed
  try {
    var ctx = window._mmaAudioCtx;
    if (!ctx) { ctx = new (window.AudioContext || window.webkitAudioContext)(); window._mmaAudioCtx = ctx; }
    var themes = {
      striker:  [440, 550, 660, 880],
      grappler: [330, 440, 370, 440],
      balanced: [440, 494, 523, 587],
      brawler:  [220, 330, 440, 330]
    };
    var notes = themes[creed] || themes.balanced;
    notes.forEach(function(freq, i) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'square';
      gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.14);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.15);
    });
  } catch(e) {}
};

// === KO BELL ===
// Ring the bell on KO
MMA.Audio.playKOBell = MMA.Audio.playKOBell || function() {
  try {
    var ctx = window._mmaAudioCtx;
    if (!ctx) { ctx = new (window.AudioContext || window.webkitAudioContext)(); window._mmaAudioCtx = ctx; }
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 2.0);
    // Second ring after 0.5s
    var osc2 = ctx.createOscillator();
    var gain2 = ctx.createGain();
    osc2.connect(gain2); gain2.connect(ctx.destination);
    osc2.frequency.value = 880;
    osc2.type = 'sine';
    gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.5);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.2);
    osc2.start(ctx.currentTime + 0.5);
    osc2.stop(ctx.currentTime + 2.5);
  } catch(e) {}
};

// === COMBO ESCALATION MUSIC ===
// Music pitch rises with combo count
MMA.Audio.updateComboMusic = MMA.Audio.updateComboMusic || function(comboCount) {
  try {
    if (comboCount < 5) return;
    var ctx = window._mmaAudioCtx;
    if (!ctx) { ctx = new (window.AudioContext || window.webkitAudioContext)(); window._mmaAudioCtx = ctx; }
    var baseFreq = 220 + Math.min(comboCount * 8, 440);
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = baseFreq;
    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  } catch(e) {}
};
// === SIGNATURE ENTRANCE MUSIC COMPOSER ===
// Procedurally compose a custom entrance theme from building blocks
MMA.Audio = MMA.Audio || {};

MMA.Audio.ENTRANCE_THEMES = MMA.Audio.ENTRANCE_THEMES || {
  aggressive: {
    label: 'POWER THEME',
    bpm: 140,
    key: 'minor',
    drops: ['heavy_bass', 'distorted_guitar'],
    buildTime: 3000,
    color: '#ff4422'
  },
  technical: {
    label: 'PRECISION THEME',
    bpm: 120,
    key: 'dorian',
    drops: ['synth_arp', 'hi_hat_pattern'],
    buildTime: 4000,
    color: '#4488ff'
  },
  defensive: {
    label: 'FORTRESS THEME',
    bpm: 100,
    key: 'phrygian',
    drops: ['deep_pad', 'war_drum'],
    buildTime: 5000,
    color: '#44cc88'
  },
  balanced: {
    label: 'CHAMPION THEME',
    bpm: 128,
    key: 'major',
    drops: ['brass_fanfare', 'crowd_roar'],
    buildTime: 3500,
    color: '#ffcc00'
  }
};

MMA.Audio.composeEntranceTheme = MMA.Audio.composeEntranceTheme || function(creedKey) {
  var theme = MMA.Audio.ENTRANCE_THEMES[creedKey] || MMA.Audio.ENTRANCE_THEMES.balanced;
  try {
    var saved = JSON.parse(localStorage.getItem('mma_entrance_theme') || '{}');
    // Blend with saved customizations if any
    if (saved.creedKey === creedKey && saved.customBpm) {
      theme = Object.assign({}, theme, { bpm: saved.customBpm });
    }
    localStorage.setItem('mma_entrance_theme', JSON.stringify({ creedKey: creedKey, theme: theme, composedAt: Date.now() }));
  } catch(e) {}
  return theme;
};

MMA.Audio.getEntranceTheme = MMA.Audio.getEntranceTheme || function() {
  try {
    var saved = JSON.parse(localStorage.getItem('mma_entrance_theme') || '{}');
    return saved.theme || MMA.Audio.ENTRANCE_THEMES.balanced;
  } catch(e) { return MMA.Audio.ENTRANCE_THEMES.balanced; }
};

MMA.Audio.playEntranceComposition = MMA.Audio.playEntranceComposition || function(scene, creedKey) {
  var theme = MMA.Audio.composeEntranceTheme(creedKey || 'balanced');
  // Visual representation of the composed theme (no Web Audio dependency)
  if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function' && scene && scene.player) {
    var cx = (typeof CONFIG !== 'undefined' && CONFIG.CANVAS_W) ? CONFIG.CANVAS_W / 2 : 250;
    scene.time.delayedCall(0,    function() { MMA.UI.showDamageText(scene, cx, 160, '🎵 ' + theme.label, theme.color); });
    scene.time.delayedCall(800,  function() { MMA.UI.showDamageText(scene, cx, 180, theme.drops[0] ? theme.drops[0].replace(/_/g,' ').toUpperCase() : '', '#ffffff'); });
    scene.time.delayedCall(1600, function() { MMA.UI.showDamageText(scene, cx, 200, theme.bpm + ' BPM · ' + theme.key.toUpperCase(), '#aaaaaa'); });
  }
  return theme;
};

// Customize entrance theme BPM
MMA.Audio.customizeEntranceBpm = MMA.Audio.customizeEntranceBpm || function(creedKey, bpm) {
  try {
    var saved = JSON.parse(localStorage.getItem('mma_entrance_theme') || '{}');
    saved.creedKey = creedKey;
    saved.customBpm = Math.max(80, Math.min(180, bpm));
    localStorage.setItem('mma_entrance_theme', JSON.stringify(saved));
  } catch(e) {}
};

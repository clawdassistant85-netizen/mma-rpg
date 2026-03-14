// MMA RPG audio helpers
// Exposes a bus-based MMA_AUDIO API plus window.sfx shorthands.

(function() {
  'use strict';

  var audioCtx = null;
  var MMA_AUDIO = window.MMA_AUDIO || {};
  var audioState = {
    masterVolume: 1,
    musicVolume: 0.6,
    sfxVolume: 0.75
  };
  var musicState = {
    cue: null,
    timer: null,
    step: 0,
    layer: null,
    fadeMs: 650,
    pendingCue: null
  };

  function clamp01(value, fallback) {
    var n = typeof value === 'number' ? value : fallback;
    if (n < 0) return 0;
    if (n > 1) return 1;
    return n;
  }

  function createAudioContext() {
    if (audioCtx) return audioCtx;
    var Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    try {
      audioCtx = new Ctor();
    } catch (e) {
      console.warn('Unable to create AudioContext', e);
      audioCtx = null;
    }
    return audioCtx;
  }

  function ensureAudioGraph(ctx) {
    if (!ctx) return null;
    if (MMA_AUDIO.masterGain && MMA_AUDIO.musicGain && MMA_AUDIO.sfxGain) return MMA_AUDIO;

    MMA_AUDIO.masterGain = ctx.createGain();
    MMA_AUDIO.musicGain = ctx.createGain();
    MMA_AUDIO.sfxGain = ctx.createGain();
    MMA_AUDIO.musicGain.connect(MMA_AUDIO.masterGain);
    MMA_AUDIO.sfxGain.connect(MMA_AUDIO.masterGain);
    MMA_AUDIO.masterGain.connect(ctx.destination);
    refreshVolumes();
    return MMA_AUDIO;
  }

  function refreshVolumes() {
    var ctx = audioCtx;
    if (!ctx || !MMA_AUDIO.masterGain || !MMA_AUDIO.musicGain || !MMA_AUDIO.sfxGain) return;
    var now = ctx.currentTime;
    MMA_AUDIO.masterGain.gain.setValueAtTime(clamp01(audioState.masterVolume, 1), now);
    MMA_AUDIO.musicGain.gain.setValueAtTime(clamp01(audioState.musicVolume, 0.6), now);
    MMA_AUDIO.sfxGain.gain.setValueAtTime(clamp01(audioState.sfxVolume, 0.75), now);
  }

  function getAudioContext() {
    if (!audioCtx && window.phaserGame && window.phaserGame.sound && window.phaserGame.sound.context) {
      audioCtx = window.phaserGame.sound.context;
    }
    if (!audioCtx && window.game && window.game.sound && window.game.sound.context) {
      audioCtx = window.game.sound.context;
    }
    if (!audioCtx) audioCtx = createAudioContext();
    if (!audioCtx) return null;
    ensureAudioGraph(audioCtx);
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(function() {});
    }
    return audioCtx;
  }

  function getBusNode(busName) {
    var ctx = getAudioContext();
    if (!ctx) return null;
    ensureAudioGraph(ctx);
    if (busName === 'music') return MMA_AUDIO.musicGain;
    return MMA_AUDIO.sfxGain;
  }

  MMA_AUDIO.unlock = function() {
    var ctx = createAudioContext();
    if (!ctx) return;
    ensureAudioGraph(ctx);
    if (ctx.state === 'suspended') ctx.resume().catch(function() {});
    refreshVolumes();
    if (musicState.pendingCue) startMusic(musicState.pendingCue);
  };

  MMA_AUDIO.getContext = function() {
    var ctx = createAudioContext();
    if (ctx) ensureAudioGraph(ctx);
    return ctx;
  };

  MMA_AUDIO.setVolume = function(value) {
    audioState.masterVolume = clamp01(value, 1);
    refreshVolumes();
  };

  MMA_AUDIO.setMusicVolume = function(value) {
    audioState.musicVolume = clamp01(value, 0.6);
    refreshVolumes();
  };

  MMA_AUDIO.setSfxVolume = function(value) {
    audioState.sfxVolume = clamp01(value, 0.75);
    refreshVolumes();
  };

  window.MMA_AUDIO = MMA_AUDIO;

  function createNoiseBuffer(ctx, duration) {
    var sampleRate = ctx.sampleRate;
    var bufferSize = Math.max(1, Math.floor(sampleRate * duration));
    var buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  function scheduleTone(ctx, freqOrArray, duration, type, volume, startTime, outputNode, filterConfig) {
    try {
      if (!ctx) return;
      var now = typeof startTime === 'number' ? startTime : ctx.currentTime;
      var gainNode = ctx.createGain();
      var target = outputNode || ctx.destination;
      var chainEnd = gainNode;
      var source = null;
      var oscillator = null;
      var peak = typeof volume === 'number' ? volume : 0.18;

      if (filterConfig) {
        var filter = ctx.createBiquadFilter();
        filter.type = filterConfig.type || 'lowpass';
        filter.frequency.setValueAtTime(filterConfig.frequency || 1200, now);
        filter.Q.setValueAtTime(filterConfig.q || 0.6, now);
        filter.connect(gainNode);
        chainEnd = filter;
      }

      if (type === 'noise') {
        source = ctx.createBufferSource();
        source.buffer = createNoiseBuffer(ctx, duration);
        source.connect(chainEnd);
      } else {
        oscillator = ctx.createOscillator();
        oscillator.type = type || 'sine';
        if (Array.isArray(freqOrArray)) {
          oscillator.frequency.setValueAtTime(Math.max(1, freqOrArray[0]), now);
          oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, freqOrArray[1]), now + duration);
        } else {
          oscillator.frequency.setValueAtTime(Math.max(1, freqOrArray || 1), now);
        }
        oscillator.connect(chainEnd);
      }

      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.linearRampToValueAtTime(peak, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.03, duration));
      gainNode.connect(target);

      if (oscillator) {
        oscillator.start(now);
        oscillator.stop(now + duration);
      }
      if (source) {
        source.start(now);
        source.stop(now + duration);
      }
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  }

  function playBusTone(freqOrArray, duration, type, volume, busName, filterConfig) {
    var ctx = getAudioContext();
    if (!ctx) return;
    var outputNode = getBusNode(busName);
    scheduleTone(ctx, freqOrArray, duration, type, volume, ctx.currentTime, outputNode, filterConfig);
  }

  function playChord(freqs, duration, type, volume, busName, startTime) {
    var ctx = getAudioContext();
    if (!ctx || !freqs || !freqs.length) return;
    var outputNode = getBusNode(busName);
    var t = typeof startTime === 'number' ? startTime : ctx.currentTime;
    for (var i = 0; i < freqs.length; i++) {
      scheduleTone(ctx, freqs[i], duration, type, volume, t, outputNode);
    }
  }

  var MUSIC_CUES = {
    zone1: {
      stepMs: 260,
      steps: [
        [{ freq:92, dur:0.24, type:'triangle', vol:0.032 }, { freq:[780, 420], dur:0.06, type:'noise', vol:0.009, filter:{ type:'lowpass', frequency:1400 } }],
        null,
        [{ freq:110, dur:0.18, type:'triangle', vol:0.028 }, { freq:220, dur:0.08, type:'square', vol:0.008 }],
        [{ freq:[240, 180], dur:0.09, type:'triangle', vol:0.012 }],
        [{ freq:123, dur:0.18, type:'triangle', vol:0.028 }, { freq:[1200, 300], dur:0.05, type:'noise', vol:0.007, filter:{ type:'bandpass', frequency:900 } }],
        null,
        [{ freq:82, dur:0.22, type:'triangle', vol:0.03 }],
        [{ freq:[220, 160], dur:0.08, type:'triangle', vol:0.01 }]
      ]
    },
    zone2: {
      stepMs: 220,
      steps: [
        [{ freq:146, dur:0.12, type:'triangle', vol:0.026 }, { freq:73, dur:0.18, type:'sawtooth', vol:0.014 }],
        [{ freq:[1000, 220], dur:0.04, type:'noise', vol:0.01, filter:{ type:'bandpass', frequency:1800 } }],
        [{ freq:174, dur:0.14, type:'sawtooth', vol:0.024 }, { freq:261, dur:0.06, type:'square', vol:0.008 }],
        [{ freq:164, dur:0.12, type:'triangle', vol:0.02 }],
        [{ freq:[1400, 260], dur:0.045, type:'noise', vol:0.011, filter:{ type:'bandpass', frequency:2100 } }],
        [{ freq:196, dur:0.14, type:'sawtooth', vol:0.024 }],
        [{ freq:220, dur:0.12, type:'triangle', vol:0.02 }, { freq:110, dur:0.18, type:'triangle', vol:0.014 }],
        null
      ]
    },
    zone3: {
      stepMs: 190,
      steps: [
        [{ freq:82, dur:0.24, type:'triangle', vol:0.026 }, { freq:[400, 180], dur:0.08, type:'noise', vol:0.014, filter:{ type:'lowpass', frequency:900 } }],
        [{ freq:165, dur:0.1, type:'sawtooth', vol:0.018 }],
        [{ freq:98, dur:0.2, type:'triangle', vol:0.024 }, { freq:[900, 320], dur:0.05, type:'noise', vol:0.012, filter:{ type:'bandpass', frequency:1200 } }],
        [{ freq:196, dur:0.1, type:'square', vol:0.01 }],
        [{ freq:110, dur:0.22, type:'triangle', vol:0.026 }, { freq:220, dur:0.08, type:'sawtooth', vol:0.014 }],
        [{ freq:[520, 240], dur:0.08, type:'triangle', vol:0.012 }],
        [{ freq:[750, 220], dur:0.05, type:'noise', vol:0.011, filter:{ type:'lowpass', frequency:1000 } }],
        null
      ]
    },
    boss: {
      stepMs: 170,
      steps: [
        [{ freq:110, dur:0.18, type:'sawtooth', vol:0.03 }, { freq:220, dur:0.08, type:'square', vol:0.011 }],
        [{ freq:[1300, 240], dur:0.05, type:'noise', vol:0.016, filter:{ type:'bandpass', frequency:1700 } }],
        [{ freq:123, dur:0.16, type:'sawtooth', vol:0.03 }, { freq:246, dur:0.08, type:'square', vol:0.011 }],
        [{ freq:147, dur:0.16, type:'sawtooth', vol:0.03 }],
        [{ freq:[1600, 260], dur:0.05, type:'noise', vol:0.016, filter:{ type:'bandpass', frequency:1900 } }],
        [{ freq:165, dur:0.18, type:'sawtooth', vol:0.03 }, { freq:330, dur:0.08, type:'square', vol:0.012 }],
        [{ freq:196, dur:0.16, type:'triangle', vol:0.022 }],
        [{ freq:[220, 120], dur:0.1, type:'triangle', vol:0.014 }]
      ]
    },
    dojo: {
      stepMs: 210,
      steps: [
        [{ freq:147, dur:0.15, type:'triangle', vol:0.024 }, { freq:294, dur:0.07, type:'square', vol:0.009 }],
        [{ freq:165, dur:0.11, type:'triangle', vol:0.02 }],
        [{ freq:196, dur:0.15, type:'triangle', vol:0.024 }],
        [{ freq:[392, 247], dur:0.09, type:'triangle', vol:0.011 }],
        [{ freq:220, dur:0.15, type:'triangle', vol:0.024 }, { freq:110, dur:0.2, type:'sine', vol:0.014 }],
        [{ freq:196, dur:0.11, type:'triangle', vol:0.02 }],
        [{ freq:165, dur:0.15, type:'triangle', vol:0.022 }],
        null
      ]
    }
  };

  function normalizeCueName(cueName) {
    if (!cueName) return 'zone1';
    if (cueName === 'street') return 'zone1';
    if (cueName === 'gymWarmup' || cueName === 'gymRing' || cueName === 'training') return 'zone2';
    if (cueName === 'arenaWalkout' || cueName === 'arenaMain' || cueName === 'survival') return 'zone3';
    if (cueName === 'arenaTitle') return 'boss';
    if (cueName === 'dojoLegend') return 'dojo';
    return MUSIC_CUES[cueName] ? cueName : 'zone1';
  }

  function cueForZone(zone, cue) {
    if (cue) return normalizeCueName(cue);
    if (zone === 2) return 'zone2';
    if (zone === 3) return 'zone3';
    if (zone >= 4) return 'dojo';
    return 'zone1';
  }

  function clearMusicTimer() {
    if (musicState.timer) {
      window.clearTimeout(musicState.timer);
      musicState.timer = null;
    }
  }

  function fadeOutLayer(layer, fadeMs) {
    if (!layer || !layer.gain || !audioCtx) return;
    var now = audioCtx.currentTime;
    var fade = Math.max(0.12, (fadeMs || musicState.fadeMs) / 1000);
    layer.gain.gain.cancelScheduledValues(now);
    layer.gain.gain.setValueAtTime(Math.max(0.0001, layer.gain.gain.value), now);
    layer.gain.gain.linearRampToValueAtTime(0.0001, now + fade);
    window.setTimeout(function() {
      try { layer.gain.disconnect(); } catch (e) {}
    }, (fadeMs || musicState.fadeMs) + 60);
  }

  function stopMusic(fadeMs) {
    clearMusicTimer();
    fadeOutLayer(musicState.layer, fadeMs);
    musicState.cue = null;
    musicState.step = 0;
    musicState.layer = null;
  }

  function scheduleMusicTick() {
    if (!musicState.cue || !musicState.layer) return;
    var ctx = getAudioContext();
    var def = MUSIC_CUES[musicState.cue];
    if (!ctx || !def) return;

    var notes = def.steps[musicState.step % def.steps.length];
    var start = ctx.currentTime + 0.025;
    if (notes && notes.length) {
      for (var i = 0; i < notes.length; i++) {
        var note = notes[i];
        scheduleTone(
          ctx,
          note.freq,
          note.dur,
          note.type,
          note.vol,
          start,
          musicState.layer.gain,
          note.filter
        );
      }
    }

    musicState.step += 1;
    musicState.timer = window.setTimeout(scheduleMusicTick, def.stepMs);
  }

  function startMusic(cueName) {
    cueName = normalizeCueName(cueName);
    var ctx = getAudioContext();
    if (!ctx) {
      musicState.pendingCue = cueName;
      return;
    }
    ensureAudioGraph(ctx);
    if (musicState.cue === cueName && musicState.timer) return;

    var previousLayer = musicState.layer;
    clearMusicTimer();

    musicState.pendingCue = null;
    musicState.cue = cueName;
    musicState.step = 0;
    musicState.layer = { gain: ctx.createGain() };
    musicState.layer.gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    musicState.layer.gain.connect(MMA_AUDIO.musicGain);
    musicState.layer.gain.gain.linearRampToValueAtTime(1, ctx.currentTime + Math.max(0.2, musicState.fadeMs / 1000));

    fadeOutLayer(previousLayer, musicState.fadeMs);
    scheduleMusicTick();
  }

  function randomChoice(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function playVariant(variants) {
    randomChoice(variants)();
  }

  var sfx = {
    punch: function() {
      playVariant([
        function() {
          playBusTone(190, 0.07, 'square', 0.22, 'sfx');
          playBusTone([140, 96], 0.08, 'triangle', 0.14, 'sfx');
        },
        function() {
          playBusTone(220, 0.06, 'square', 0.2, 'sfx');
          playBusTone(0, 0.045, 'noise', 0.08, 'sfx', { type:'lowpass', frequency:1100 });
        },
        function() {
          playBusTone([210, 130], 0.08, 'sawtooth', 0.17, 'sfx');
          playBusTone(0, 0.035, 'noise', 0.06, 'sfx', { type:'bandpass', frequency:800 });
        },
        function() {
          playBusTone(240, 0.05, 'triangle', 0.18, 'sfx');
          playBusTone([180, 110], 0.07, 'square', 0.12, 'sfx');
        }
      ]);
    },

    kick: function() {
      playVariant([
        function() {
          playBusTone([170, 80], 0.15, 'triangle', 0.18, 'sfx');
          playBusTone(62, 0.2, 'sawtooth', 0.11, 'sfx');
        },
        function() {
          playBusTone([210, 90], 0.14, 'triangle', 0.19, 'sfx');
          playBusTone(0, 0.06, 'noise', 0.07, 'sfx', { type:'lowpass', frequency:900 });
        },
        function() {
          playBusTone([190, 76], 0.17, 'sawtooth', 0.16, 'sfx');
          playBusTone(0, 0.05, 'noise', 0.06, 'sfx', { type:'bandpass', frequency:650 });
        }
      ]);
    },

    hit: function() {
      playVariant([
        function() {
          playBusTone(0, 0.08, 'noise', 0.12, 'sfx', { type:'lowpass', frequency:1050 });
          playBusTone(130, 0.06, 'triangle', 0.07, 'sfx');
        },
        function() {
          playBusTone(0, 0.06, 'noise', 0.12, 'sfx', { type:'bandpass', frequency:900 });
          playBusTone([240, 150], 0.05, 'square', 0.08, 'sfx');
        },
        function() {
          playBusTone(0, 0.07, 'noise', 0.12, 'sfx', { type:'lowpass', frequency:850 });
          playBusTone([170, 110], 0.07, 'triangle', 0.08, 'sfx');
        }
      ]);
    },

    thud: function() {
      playBusTone([130, 52], 0.18, 'sine', 0.16, 'sfx');
      playBusTone(0, 0.12, 'noise', 0.08, 'sfx', { type:'lowpass', frequency:650 });
    },

    slap: function() {
      playBusTone([440, 240], 0.08, 'square', 0.13, 'sfx');
      playBusTone(0, 0.05, 'noise', 0.05, 'sfx', { type:'bandpass', frequency:1400 });
    },

    whoosh: function() {
      playBusTone([1600, 240], 0.12, 'noise', 0.08, 'sfx', { type:'bandpass', frequency:1100 });
      playBusTone([300, 110], 0.1, 'triangle', 0.06, 'sfx');
    },

    block: function() {
      this.whoosh();
      playBusTone(620, 0.05, 'square', 0.09, 'sfx');
    },

    heavyHit: function() {
      playBusTone([150, 70], 0.16, 'sawtooth', 0.18, 'sfx');
      playBusTone(0, 0.12, 'noise', 0.09, 'sfx', { type:'lowpass', frequency:720 });
      playBusTone(54, 0.18, 'triangle', 0.1, 'sfx');
    },

    crit: function() {
      this.heavyHit();
      playBusTone(880, 0.08, 'triangle', 0.08, 'sfx');
      playBusTone([1200, 480], 0.11, 'noise', 0.05, 'sfx', { type:'bandpass', frequency:1600 });
    },

    enemyDeath: function() {
      playBusTone([110, 46], 0.22, 'triangle', 0.14, 'sfx');
      playBusTone(0, 0.16, 'noise', 0.1, 'sfx', { type:'lowpass', frequency:560 });
    },

    ko: function() {
      this.enemyDeath();
      playBusTone(82, 0.16, 'sawtooth', 0.18, 'sfx');
      playBusTone([164, 55], 0.32, 'triangle', 0.14, 'sfx');
    },

    submissionLock: function() {
      playBusTone([140, 60], 0.2, 'sawtooth', 0.12, 'sfx');
      playBusTone([900, 220], 0.16, 'noise', 0.08, 'sfx', { type:'bandpass', frequency:700 });
    },

    door: function() {
      playBusTone([900, 220], 0.14, 'noise', 0.08, 'sfx', { type:'bandpass', frequency:850 });
      playBusTone([260, 120], 0.1, 'triangle', 0.06, 'sfx');
    },

    roomTransition: function() {
      this.door();
    },

    levelup: function() {
      this.levelUpJingle();
    },

    levelUpJingle: function() {
      var ctx = getAudioContext();
      if (!ctx) return;
      var t = ctx.currentTime;
      playChord([262, 330], 0.12, 'sine', 0.08, 'sfx', t);
      playChord([392, 494], 0.13, 'sine', 0.08, 'sfx', t + 0.12);
      playChord([523, 659], 0.16, 'sine', 0.09, 'sfx', t + 0.24);
      playChord([784, 1047], 0.28, 'triangle', 0.08, 'sfx', t + 0.4);
    },

    playPickup: function() {
      playBusTone(660, 0.06, 'triangle', 0.08, 'sfx');
      playBusTone(880, 0.08, 'sine', 0.07, 'sfx');
    },

    uiClick: function() {
      playBusTone([900, 620], 0.06, 'triangle', 0.08, 'sfx');
    },

    uiConfirm: function() {
      playBusTone(700, 0.08, 'sine', 0.08, 'sfx');
      playBusTone(920, 0.09, 'sine', 0.08, 'sfx');
    },

    uiBack: function() {
      playBusTone([520, 300], 0.08, 'triangle', 0.08, 'sfx');
    },

    stopMusic: function() {
      stopMusic();
    },

    playZoneMusic: function(zone, cue) {
      startMusic(cueForZone(zone, cue));
    },

    playCue: function(cue) {
      startMusic(cue);
    }
  };

  MMA_AUDIO.playBGM = function(zoneOrCue, cue) {
    if (typeof zoneOrCue === 'number') startMusic(cueForZone(zoneOrCue, cue));
    else startMusic(normalizeCueName(zoneOrCue));
  };

  MMA_AUDIO.stopBGM = function(fadeMs) {
    stopMusic(fadeMs);
  };

  MMA_AUDIO.bgm = {
    play: function(zoneOrCue, cue) {
      MMA_AUDIO.playBGM(zoneOrCue, cue);
    },
    stop: function(fadeMs) {
      MMA_AUDIO.stopBGM(fadeMs);
    }
  };

  MMA_AUDIO.ambient = {
    currentAmbient: null,

    _connectLayer: function(source, filter, gain) {
      if (!source || !filter || !gain || !MMA_AUDIO.musicGain) return null;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(MMA_AUDIO.musicGain);
      source.start();
      return { source: source, gain: gain };
    },

    crowd: function(ctx) {
      var source = ctx.createBufferSource();
      source.buffer = createNoiseBuffer(ctx, 3.4);
      source.loop = true;
      var filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 420;
      filter.Q.value = 0.5;
      var gain = ctx.createGain();
      gain.gain.value = 0.04;
      return this._connectLayer(source, filter, gain);
    },

    traffic: function(ctx) {
      var source = ctx.createBufferSource();
      source.buffer = createNoiseBuffer(ctx, 3.8);
      source.loop = true;
      var filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 180;
      var gain = ctx.createGain();
      gain.gain.value = 0.035;
      return this._connectLayer(source, filter, gain);
    },

    gym: function(ctx) {
      var source = ctx.createBufferSource();
      source.buffer = createNoiseBuffer(ctx, 2.6);
      source.loop = true;
      var filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 620;
      var gain = ctx.createGain();
      gain.gain.value = 0.028;
      return this._connectLayer(source, filter, gain);
    },

    play: function(type) {
      var ctx = getAudioContext();
      if (!ctx) return null;
      ensureAudioGraph(ctx);
      this.stop();
      if (type === 'crowd') this.currentAmbient = this.crowd(ctx);
      else if (type === 'gym') this.currentAmbient = this.gym(ctx);
      else this.currentAmbient = this.traffic(ctx);
      return this.currentAmbient;
    },

    stop: function() {
      if (!this.currentAmbient) return;
      try {
        this.currentAmbient.source.stop();
      } catch (err) {}
      this.currentAmbient = null;
    }
  };

  MMA_AUDIO.playHit = function(kind) {
    if (kind === 'kick') sfx.kick();
    else if (kind === 'crit') sfx.crit();
    else if (kind === 'block' || kind === 'dodge') sfx.block();
    else sfx.punch();
  };

  window.sfx = sfx;

  sfx.moves = {
    jab: function() {
      playBusTone([780, 420], 0.055, 'square', 0.11, 'sfx');
      playBusTone(0, 0.028, 'noise', 0.038, 'sfx', { type:'bandpass', frequency:1700 });
    },
    cross: function() {
      playBusTone([320, 130], 0.11, 'sawtooth', 0.15, 'sfx');
      playBusTone(0, 0.08, 'noise', 0.06, 'sfx', { type:'lowpass', frequency:880 });
    },
    kick: function() {
      playBusTone([620, 110], 0.14, 'triangle', 0.14, 'sfx');
      playBusTone([170, 72], 0.16, 'sawtooth', 0.1, 'sfx');
    },
    grapple: function() {
      playBusTone([220, 92], 0.09, 'square', 0.12, 'sfx');
      playBusTone(0, 0.05, 'noise', 0.05, 'sfx', { type:'bandpass', frequency:620 });
    },
    submission: function() {
      playBusTone([420, 110], 0.12, 'square', 0.11, 'sfx');
      playBusTone(0, 0.08, 'noise', 0.05, 'sfx', { type:'highpass', frequency:1500 });
    }
  };

  sfx.ui = {
    highlight: function() {
      playBusTone([620, 840], 0.04, 'sine', 0.08, 'sfx');
    },
    confirm: function() {
      playBusTone(880, 0.06, 'sine', 0.08, 'sfx');
      playBusTone(1100, 0.08, 'sine', 0.06, 'sfx');
    },
    back: function() {
      playBusTone([420, 280], 0.07, 'triangle', 0.08, 'sfx');
    },
    error: function() {
      playBusTone(180, 0.15, 'square', 0.1, 'sfx');
    }
  };

  sfx.jingles = {
    victory: function() {
      var ctx = getAudioContext();
      if (!ctx) return;
      var now = ctx.currentTime;
      playChord([262, 330], 0.12, 'sine', 0.08, 'sfx', now);
      playChord([392, 523], 0.14, 'sine', 0.08, 'sfx', now + 0.16);
      playChord([523, 659, 784], 0.28, 'triangle', 0.08, 'sfx', now + 0.34);
    },
    defeat: function() {
      var ctx = getAudioContext();
      if (!ctx) return;
      var now = ctx.currentTime;
      playChord([392, 330], 0.16, 'triangle', 0.07, 'sfx', now);
      playChord([262, 220], 0.18, 'triangle', 0.07, 'sfx', now + 0.2);
      playChord([196, 147], 0.24, 'triangle', 0.08, 'sfx', now + 0.42);
    }
  };

  sfx.uiClick = function() {
    sfx.ui.highlight();
  };

  sfx.uiConfirm = function() {
    sfx.ui.confirm();
  };

  sfx.uiBack = function() {
    sfx.ui.back();
  };

  sfx.uiError = function() {
    sfx.ui.error();
  };

  var originalPunch = sfx.punch;
  sfx.punch = function() {
    if (MMA_AUDIO._suppressGenericAttackSfx) return;
    originalPunch.call(sfx);
  };

  var originalKick = sfx.kick;
  sfx.kick = function() {
    if (MMA_AUDIO._suppressGenericAttackSfx) return;
    originalKick.call(sfx);
  };

  function playMoveTypeSound(moveKey) {
    var key = String(moveKey || '').toLowerCase();
    if (!key) return;
    if (key === 'jab') sfx.moves.jab();
    else if (key === 'cross' || key === 'hook' || key === 'uppercut' || key === 'bodyshot' || key === 'elbowstrike' || key === 'spinningbackfist') sfx.moves.cross();
    else if (key.indexOf('kick') !== -1 || key.indexOf('knee') !== -1) sfx.moves.kick();
    else if (key.indexOf('armbar') !== -1 || key.indexOf('triangle') !== -1 || key.indexOf('kimura') !== -1 || key.indexOf('guillotine') !== -1 || key.indexOf('rnc') !== -1 || key.indexOf('submission') !== -1) sfx.moves.submission();
    else if (key.indexOf('take') !== -1 || key.indexOf('throw') !== -1 || key.indexOf('grapple') !== -1 || key === 'takedown') sfx.moves.grapple();
  }

  function rememberPlayerAttack(scene, moveKey) {
    if (!scene || !scene.player) return;
    var now = scene.time && typeof scene.time.now === 'number' ? scene.time.now : Date.now();
    scene.player._mmaLastAttackAt = now;
    scene.player._mmaLastMoveKey = moveKey;
    scene.player._mmaAttackRecoverAt = now + 280;
  }

  function installCombatAudioPatch() {
    if (!window.MMA || !MMA.Combat || MMA.Combat._mmaMoveAudioPatched) return false;

    var originalExecuteAttack = MMA.Combat.executeAttack;
    MMA.Combat.executeAttack = function(scene, moveKey) {
      rememberPlayerAttack(scene, moveKey);
      MMA_AUDIO._suppressGenericAttackSfx = true;
      try {
        playMoveTypeSound(moveKey);
        return originalExecuteAttack.call(this, scene, moveKey);
      } finally {
        MMA_AUDIO._suppressGenericAttackSfx = false;
      }
    };

    var originalExecuteGroundMove = MMA.Combat.executeGroundMove;
    MMA.Combat.executeGroundMove = function(scene, moveKey) {
      rememberPlayerAttack(scene, moveKey);
      if (moveKey && moveKey !== 'special' && moveKey !== 'standup') playMoveTypeSound(moveKey);
      return originalExecuteGroundMove.call(this, scene, moveKey);
    };

    if (typeof MMA.Combat.executeSubmission === 'function') {
      var originalExecuteSubmission = MMA.Combat.executeSubmission;
      MMA.Combat.executeSubmission = function(scene, subKey, subMove) {
        rememberPlayerAttack(scene, subKey);
        playMoveTypeSound(subKey || 'submission');
        return originalExecuteSubmission.call(this, scene, subKey, subMove);
      };
    }

    MMA.Combat._mmaMoveAudioPatched = true;
    return true;
  }

  function retryCombatAudioPatch(remaining) {
    if (installCombatAudioPatch() || remaining <= 0) return;
    window.setTimeout(function() {
      retryCombatAudioPatch(remaining - 1);
    }, 250);
  }

  function installUiAudioPatch() {
    if (!window.MMA || !MMA.UI || MMA.UI._mmaAudioPatched) return false;
    var original = MMA.UI._applyVolumeSettings;
    MMA.UI._applyVolumeSettings = function() {
      if (typeof original === 'function') original.call(this);
      var soundVolume = this.settings && typeof this.settings.soundVolume === 'number' ? this.settings.soundVolume : audioState.sfxVolume;
      var musicVolume = this.settings && typeof this.settings.musicVolume === 'number' ? this.settings.musicVolume : audioState.musicVolume;
      MMA_AUDIO.setSfxVolume(soundVolume);
      MMA_AUDIO.setMusicVolume(musicVolume);
    };
    MMA.UI._mmaAudioPatched = true;
    if (typeof MMA.UI._applyVolumeSettings === 'function') MMA.UI._applyVolumeSettings.call(MMA.UI);
    return true;
  }

  function retryUiAudioPatch(remaining) {
    if (installUiAudioPatch() || remaining <= 0) return;
    window.setTimeout(function() {
      retryUiAudioPatch(remaining - 1);
    }, 250);
  }

  retryCombatAudioPatch(12);
  retryUiAudioPatch(12);
})();

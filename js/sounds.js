// MMA RPG Sound Effects - Web Audio API tones
// Exposes window.sfx for use in GameScene

(function() {
  'use strict';
  
  var audioCtx = null;

  // Shared audio manager so we only ever create the real AudioContext
  // in response to a user interaction (see unlock handler in index.html).
  var MMA_AUDIO = window.MMA_AUDIO || {};

  // Create and/or resume the shared AudioContext. This should normally be
  // called from the unlock handler wired to the user's first tap/click.
  function createAudioContext() {
    if (audioCtx) {
      return audioCtx;
    }
    var Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) {
      return null;
    }
    try {
      audioCtx = new Ctor();
    } catch (e) {
      console.warn('Unable to create AudioContext', e);
      audioCtx = null;
    }
    return audioCtx;
  }

  MMA_AUDIO.unlock = function() {
    var ctx = createAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      // Resume inside the interaction handler to satisfy autoplay rules
      ctx.resume();
    }
  };

  // Used by the SFX helpers to access the context. On desktop this may be
  // called before the explicit unlock; browsers there are generally more
  // permissive, but on mobile audio will start working only after unlock.
  MMA_AUDIO.getContext = function() {
    if (!audioCtx) {
      audioCtx = createAudioContext();
    }
    return audioCtx;
  };

  window.MMA_AUDIO = MMA_AUDIO;
  
  // Get or create AudioContext (prefer Phaser's if available, but route
  // construction/resume through the shared MMA_AUDIO manager when possible).
  function getAudioContext() {
    if (!audioCtx && window.game && window.game.sound && window.game.sound.context) {
      audioCtx = window.game.sound.context;
    }

    if (!audioCtx && window.MMA_AUDIO && typeof window.MMA_AUDIO.getContext === 'function') {
      audioCtx = window.MMA_AUDIO.getContext();
    }

    if (!audioCtx) {
      var Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      try {
        audioCtx = new Ctor();
      } catch (e) {
        console.warn('Unable to create fallback AudioContext', e);
        return null;
      }
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }
  
  // Create white noise buffer
  function createNoiseBuffer(ctx, duration) {
    var sampleRate = ctx.sampleRate;
    var bufferSize = sampleRate * duration;
    var buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }
  
  // Play a tone or noise
  // freqOrArray: number for Hz, or array [startFreq, endFreq] for sweep
  // duration: in seconds
  // type: 'sine', 'square', 'sawtooth', 'triangle', or 'noise'
  function playTone(freqOrArray, duration, type) {
    try {
      var ctx = getAudioContext();
      if (!ctx) return;

      var now = ctx.currentTime;
      
      var oscillator = null;
      var gainNode = ctx.createGain();
      var source = null;
      
      if (type === 'noise') {
        // White noise for impacts
        source = ctx.createBufferSource();
        source.buffer = createNoiseBuffer(ctx, duration);
      } else {
        // Oscillator for tones
        oscillator = ctx.createOscillator();
        oscillator.type = type || 'sine';
        
        if (Array.isArray(freqOrArray)) {
          // Frequency sweep
          oscillator.frequency.setValueAtTime(freqOrArray[0], now);
          oscillator.frequency.exponentialRampToValueAtTime(freqOrArray[1], now + duration);
        } else {
          oscillator.frequency.setValueAtTime(freqOrArray, now);
        }
        
        oscillator.connect(gainNode);
      }
      
      if (source) {
        source.connect(gainNode);
      }
      
      // Quick attack/decay envelope
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.32, now + 0.01); // attack
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration); // decay
      
      gainNode.connect(ctx.destination);
      
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
  
  // Sound effect functions
  window.sfx = {
    // Punch sounds - quick mid-frequency tones
    punch: function() {
      playTone(180, 0.08, 'square');
      playTone(120, 0.1, 'sawtooth');
    },
    
    // Kick sounds - lower frequency, longer
    kick: function() {
      playTone([150, 80], 0.15, 'triangle');
      playTone(60, 0.2, 'sawtooth');
    },
    
    // Generic hit/damage sound - short noise burst
    hit: function() {
      playTone(0, 0.1, 'noise');
    },

    // Heavier impact "thud" for big hits or knockdowns
    thud: function() {
      playTone([120, 50], 0.18, 'sine');
      playTone(0, 0.14, 'noise');
    },

    // Sharper "slap" for light strikes or fast combos
    slap: function() {
      playTone([400, 220], 0.09, 'square');
      playTone(0, 0.06, 'noise');
    },
    
    // Level up - ascending triumphant tones
    levelup: function() {
      playTone(262, 0.12, 'sine'); // C4
      playTone(330, 0.12, 'sine'); // E4
      playTone(392, 0.12, 'sine'); // G4
      playTone(523, 0.25, 'sine'); // C5
    },

    // UI sounds
    uiClick: function() {
      playTone([900, 600], 0.06, 'triangle');
    },

    uiConfirm: function() {
      playTone(700, 0.08, 'sine');
      playTone(900, 0.09, 'sine');
    },

    uiBack: function() {
      playTone([500, 300], 0.08, 'triangle');
    }
  };
  
})();

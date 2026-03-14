window.MMA = window.MMA || {};
window.MMA.Sprites = window.MMA.Sprites || {};

Object.assign(window.MMA.Sprites, {
  STYLE_AURA_COLORS: window.MMA.Sprites.STYLE_AURA_COLORS || {
    striker: 0xff4d4d,
    grappler: 0x4d88ff,
    balanced: 0xb26bff
  },
  BOSS_AURA_CONFIGS: window.MMA.Sprites.BOSS_AURA_CONFIGS || {},
  IDLE_TEXTURES: window.MMA.Sprites.IDLE_TEXTURES || {},
  RESONANCE_TEXTURES: window.MMA.Sprites.RESONANCE_TEXTURES || {},
  IMPACT_PARTICLE_TEXTURES: window.MMA.Sprites.IMPACT_PARTICLE_TEXTURES || {},
  FIRE_TRAIL_TEXTURES: window.MMA.Sprites.FIRE_TRAIL_TEXTURES || {},
  FOOTWORK_TEXTURES: window.MMA.Sprites.FOOTWORK_TEXTURES || {},
  EXERTION_TEXTURES: window.MMA.Sprites.EXERTION_TEXTURES || {},
  ATTACK_READ_TEXTURES: window.MMA.Sprites.ATTACK_READ_TEXTURES || {},

  textureAura: function(scene, key, color, alphaScale, variant) {
    var g = scene.make.graphics({ x:0, y:0, add:false });
    var outerAlpha = typeof alphaScale === 'number' ? alphaScale : 0.18;
    var midAlpha = Math.min(0.55, outerAlpha + 0.14);
    var mode = variant || 'core';
    if (mode === 'ring') {
      g.lineStyle(3, color, Math.min(0.9, outerAlpha + 0.42)); g.strokeEllipse(24, 38, 34, 50);
      g.lineStyle(2, 0xffffff, 0.24); g.strokeEllipse(24, 38, 24, 36);
      g.fillStyle(color, outerAlpha * 0.55); g.fillEllipse(24, 42, 18, 18);
    } else if (mode === 'flare') {
      g.fillStyle(color, outerAlpha * 0.85); g.fillTriangle(24, 5, 14, 36, 22, 28); g.fillTriangle(24, 5, 34, 36, 26, 28);
      g.fillTriangle(10, 34, 19, 66, 21, 40); g.fillTriangle(38, 34, 29, 66, 27, 40);
      g.fillStyle(color, outerAlpha * 0.65); g.fillEllipse(24, 38, 26, 40);
      g.lineStyle(2, 0xffffff, 0.18); g.strokeEllipse(24, 36, 18, 28);
    } else {
      g.fillStyle(color, outerAlpha); g.fillEllipse(24, 36, 38, 56);
      g.fillStyle(color, midAlpha); g.fillEllipse(24, 36, 28, 44);
      g.lineStyle(2, color, 0.8); g.strokeEllipse(24, 36, 24, 38);
      g.lineStyle(1, 0xffffff, 0.35); g.strokeEllipse(24, 36, 32, 48);
    }
    g.generateTexture(key, 48, 72); g.destroy();
  },
  textureResonance: function(scene, key, color, alphaScale, variant) {
    var g = scene.make.graphics({ x:0, y:0, add:false });
    var outerAlpha = typeof alphaScale === 'number' ? alphaScale : 0.18;
    var innerAlpha = Math.min(0.6, outerAlpha + 0.12);
    var mode = variant || 'core';
    if (mode === 'ring') {
      g.lineStyle(2, color, Math.min(0.9, outerAlpha + 0.34)); g.strokeEllipse(24, 36, 30, 44); g.strokeEllipse(24, 36, 18, 28);
    } else if (mode === 'flare') {
      g.fillStyle(color, outerAlpha * 0.7); g.fillTriangle(24, 8, 14, 28, 22, 24); g.fillTriangle(24, 8, 34, 28, 26, 24);
      g.fillTriangle(12, 38, 19, 60, 22, 42); g.fillTriangle(36, 38, 29, 60, 26, 42);
      g.fillStyle(color, outerAlpha * 0.42); g.fillEllipse(24, 38, 24, 34);
    } else {
      g.fillStyle(color, outerAlpha); g.fillEllipse(24, 36, 34, 50);
      g.fillStyle(color, innerAlpha); g.fillEllipse(24, 36, 20, 32);
      g.lineStyle(2, color, 0.74); g.strokeEllipse(24, 36, 26, 40);
    }
    g.generateTexture(key, 48, 72); g.destroy();
  },
  texturePickup: function(scene, key) { var g = scene.make.graphics({ x:0, y:0, add:false }); g.fillStyle(0x0f1724, 0.92); g.fillCircle(12, 12, 10); g.lineStyle(2, 0xffffff, 0.9); g.strokeCircle(12, 12, 10); g.fillStyle(0xffffff, 0.95); g.fillRect(10, 5, 4, 14); g.fillRect(5, 10, 14, 4); g.generateTexture(key, 24, 24); g.destroy(); },
  textureHitbox: function(scene, key) { var g = scene.make.graphics({ x:0, y:0, add:false }); g.fillStyle(0xffff00, 1); g.fillRect(0, 0, 24, 24); g.lineStyle(2, 0xffcc00, 1); g.strokeRect(1, 1, 22, 22); g.generateTexture(key, 24, 24); g.destroy(); },
  textureSweatParticle: function(scene, key, opts) { var g = scene.make.graphics({ x:0, y:0, add:false }); var fill = (opts && opts.fill) || 0x9fd4ff; g.fillStyle(fill, 0.9); g.fillEllipse(8, 10, 8, 12); g.generateTexture(key, 16, 16); g.destroy(); },
  textureFireTrailParticle: function(scene, key, opts) { var g = scene.make.graphics({ x:0, y:0, add:false }); var outer = (opts && opts.outer) || 0xff5a1f; g.fillStyle(outer, 0.92); g.fillTriangle(12, 0, 4, 16, 12, 12); g.fillTriangle(12, 0, 20, 16, 12, 12); g.generateTexture(key, 24, 24); g.destroy(); },
  textureFootworkDust: function(scene, key, opts) { var g = scene.make.graphics({ x:0, y:0, add:false }); var color = (opts && opts.color) || 0xd8d2c2; g.fillStyle(color, 0.6); g.fillEllipse(12, 12, 18, 10); g.generateTexture(key, 24, 24); g.destroy(); },
  textureFootprint: function(scene, key, opts) { var g = scene.make.graphics({ x:0, y:0, add:false }); var color = (opts && opts.color) || 0xc9c1b3; g.fillStyle(color, 0.4); g.fillEllipse(7, 11, 6, 10); g.generateTexture(key, 18, 18); g.destroy(); },
  textureBreathPuff: function(scene, key, opts) { var g = scene.make.graphics({ x:0, y:0, add:false }); var color = (opts && opts.color) || 0xe7f8ff; g.fillStyle(color, 0.6); g.fillCircle(12, 13, 8); g.generateTexture(key, 24, 24); g.destroy(); },
  textureStumbleSpark: function(scene, key, opts) { var g = scene.make.graphics({ x:0, y:0, add:false }); var color = (opts && opts.color) || 0xffd3a6; g.fillStyle(color, 0.92); g.fillTriangle(12, 0, 15, 9, 24, 12); g.fillTriangle(12, 24, 9, 15, 0, 12); g.generateTexture(key, 24, 24); g.destroy(); },
  textureAttackReadHalo: function(scene, key, opts) { var g = scene.make.graphics({ x:0, y:0, add:false }); var color = (opts && opts.color) || 0xd7c8ff; g.fillStyle(color, 0.42); g.fillEllipse(16, 16, 14, 14); g.lineStyle(2, color, 0.78); g.strokeEllipse(16, 16, 18, 18); g.generateTexture(key, 32, 32); g.destroy(); },

  ensureEffectTextures: function(scene) {
    var s = this;
    s.textureAura(scene, 'aura_striker', s.STYLE_AURA_COLORS.striker, 0.16, 'core');
    s.textureAura(scene, 'aura_grappler', s.STYLE_AURA_COLORS.grappler, 0.16, 'core');
    s.textureAura(scene, 'aura_balanced', s.STYLE_AURA_COLORS.balanced, 0.14, 'core');
    s.AURA_TEXTURES = { striker: 'aura_striker', grappler: 'aura_grappler', balanced: 'aura_balanced' };

    s.textureResonance(scene, 'resonance_striker', 0xff5a5a, 0.2, 'core');
    s.textureResonance(scene, 'resonance_grappler', 0x5aa8ff, 0.2, 'core');
    s.textureResonance(scene, 'resonance_hybrid', 0xb678ff, 0.2, 'core');
    s.RESONANCE_TEXTURES = {
      striker: { core: 'resonance_striker' },
      grappler: { core: 'resonance_grappler' },
      hybrid: { core: 'resonance_hybrid' },
      default: { core: 'resonance_hybrid' }
    };

    s.texturePickup(scene, 'item_pickup'); s.texturePickup(scene, 'pickup_health');
    s.textureSweatParticle(scene, 'impact_sweat', { fill: 0x9fd4ff });
    s.textureFireTrailParticle(scene, 'combo_fire_trail', { outer: 0xff6a26 });
    s.textureFootworkDust(scene, 'footwork_dust_soft', { color: 0xd7d0c1 });
    s.textureFootprint(scene, 'footwork_print_left', { color: 0xbab2a4 });
    s.textureFootprint(scene, 'footwork_print_right', { color: 0xbab2a4 });
    s.textureBreathPuff(scene, 'exertion_breath_heavy', { color: 0xe7f8ff });
    s.textureStumbleSpark(scene, 'exertion_stumble', { color: 0xffd3a6 });
    s.textureAttackReadHalo(scene, 'attack_read_default', { color: 0xd7c8ff });

    s.IMPACT_PARTICLE_TEXTURES = { sweat: 'impact_sweat' };
    s.FIRE_TRAIL_TEXTURES = { combo: 'combo_fire_trail' };
    s.FOOTWORK_TEXTURES = { dust: 'footwork_dust_soft', leftPrint: 'footwork_print_left', rightPrint: 'footwork_print_right' };
    s.EXERTION_TEXTURES = { heavyBreath: 'exertion_breath_heavy', stumble: 'exertion_stumble' };
    s.ATTACK_READ_TEXTURES = { default: 'attack_read_default' };

    s.textureHitbox(scene, 'hitbox');
  }
});

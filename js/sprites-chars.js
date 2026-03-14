window.MMA = window.MMA || {};
window.MMA.Sprites = window.MMA.Sprites || {};

Object.assign(window.MMA.Sprites, {
  IDLE_TEXTURES: window.MMA.Sprites.IDLE_TEXTURES || {},
  DAMAGE_TEXTURES: window.MMA.Sprites.DAMAGE_TEXTURES || {},
  LIMB_DAMAGE_TEXTURES: window.MMA.Sprites.LIMB_DAMAGE_TEXTURES || {},
  PORTRAIT_TEXTURES: window.MMA.Sprites.PORTRAIT_TEXTURES || {},
  REACTION_FACE_TEXTURES: window.MMA.Sprites.REACTION_FACE_TEXTURES || {},
  SILHOUETTE_TEXTURES: window.MMA.Sprites.SILHOUETTE_TEXTURES || {},
  TATTOO_TEXTURES: window.MMA.Sprites.TATTOO_TEXTURES || {},

  PLAYER_COLORS: { hair:0x2d1b12, skin:0xf1c38f, skinDark:0xd6a374, torso:0x2d66d3, torsoLight:0x4f85eb, belt:0x1a2a52, headband:0xd92b2b, glove:0xc9d9ff, legs:0x2a3f66, shoes:0x111111, bootDetail:0x222222, shoeAccent:0x333333, outline:0x1a1a1a },
  THUG_COLORS: { hair:0x171717, skin:0xd9a77b, skinDark:0xb9845a, torso:0xb62626, torsoLight:0xd13a3a, belt:0x551414, glove:0x7a1b1b, weapon:0x5c4033, legs:0x2d2d33, shoes:0x0c0c0c, bootDetail:0x1a1a1a, shoeAccent:0x2a2a2a, outline:0x1a1a1a },

  textureHuman: function(scene, key, colors, opts) {
    var g = scene.make.graphics({ x:0, y:0, add:false }); var s = 3;
    var armShift = (opts && typeof opts.armShift === 'number') ? opts.armShift : 0;
    var bodyW = (opts && opts.bodyW) ? opts.bodyW : 6;
    var bodyX = Math.floor((16 - bodyW) / 2);
    function px(x, y, w, h, color) { g.fillStyle(color, 1); g.fillRect(x * s, y * s, w * s, h * s); }
    px(5, 1, 6, 5, colors.skin); px(4, 0, 8, 2, colors.hair); px(6, 5, 4, 1, colors.skinDark);
    px(bodyX, 7, bodyW, 8, colors.torso); px(bodyX + 1, 8, bodyW - 2, 1, colors.torsoLight); px(7, 11, 2, 4, colors.belt);
    px(bodyX - 2 + armShift, 8, 2, 5, colors.skin); px(bodyX + bodyW + armShift, 8, 2, 5, colors.skin);
    px(bodyX - 1 + armShift, 9, 2, 2, colors.glove); px(bodyX + bodyW - 1 + armShift, 9, 2, 2, colors.glove);
    px(bodyX + 1, 16, 2, 6, colors.legs); px(bodyX + bodyW - 3, 16, 2, 6, colors.legs);
    px(bodyX + 1, 22, 2, 2, colors.shoes); px(bodyX + bodyW - 3, 22, 2, 2, colors.shoes);
    px(bodyX - 2, 7, 1, 9, colors.outline); px(bodyX + bodyW + 2, 7, 1, 9, colors.outline);
    g.generateTexture(key, 48, 72); g.destroy();
  },

  textureIdleSet: function(scene, baseKey, colors, baseOpts) {
    var frames = [
      { suffix: '', opts: {} },
      { suffix: '_idle_1', opts: { armShift: ((baseOpts.armShift || 0) - 1) } },
      { suffix: '_idle_2', opts: { armShift: ((baseOpts.armShift || 0) + 1) } },
      { suffix: '_idle_3', opts: { armShift: (baseOpts.armShift || 0) } }
    ];
    var keys = [];
    for (var i = 0; i < frames.length; i++) {
      var frameKey = i === 0 ? baseKey : (baseKey + frames[i].suffix);
      this.textureHuman(scene, frameKey, colors, Object.assign({}, baseOpts, frames[i].opts));
      keys.push(frameKey);
    }
    this.IDLE_TEXTURES[baseKey] = keys;
  },

  textureDamageSet: function(scene, baseKey, colors, baseOpts) {
    this.textureIdleSet(scene, baseKey, colors, baseOpts || {});
    this.textureIdleSet(scene, baseKey + '_hurt_1', colors, Object.assign({}, baseOpts, { armShift: (baseOpts.armShift || 0) - 1 }));
    this.textureIdleSet(scene, baseKey + '_hurt_2', colors, Object.assign({}, baseOpts, { armShift: (baseOpts.armShift || 0) - 2 }));
    this.DAMAGE_TEXTURES[baseKey] = { healthy: baseKey, bruised: baseKey + '_hurt_1', bloodied: baseKey + '_hurt_2' };
    this.LIMB_DAMAGE_TEXTURES[baseKey] = {};
  },

  texturePortrait: function(scene, key, colors, opts) {
    var g = scene.make.graphics({ x:0, y:0, add:false }); var accent = (opts && opts.accent) || colors.glove || 0xffffff;
    g.fillStyle(0x141820, 0.96); g.fillRoundedRect(0, 0, 48, 48, 8);
    g.fillStyle(accent, 0.18); g.fillEllipse(24, 26, 34, 26);
    g.fillStyle(colors.skin, 1); g.fillCircle(24, 15, 7);
    g.fillStyle(colors.hair, 1); g.fillEllipse(24, 11, 16, 10);
    g.generateTexture(key, 48, 48); g.destroy();
  },
  texturePortraitSet: function(scene, baseKey, colors, opts) {
    var set = { stance: baseKey + '_portrait_stance', grapple: baseKey + '_portrait_grapple', signature: baseKey + '_portrait_signature' };
    this.texturePortrait(scene, set.stance, colors, opts); this.texturePortrait(scene, set.grapple, colors, opts); this.texturePortrait(scene, set.signature, colors, opts);
    this.PORTRAIT_TEXTURES[baseKey] = set;
  },

  textureReactionFace: function(scene, key, colors, mood) {
    var g = scene.make.graphics({ x:0, y:0, add:false });
    g.fillStyle(0x141820, 0.96); g.fillRoundedRect(0, 0, 24, 24, 6);
    g.fillStyle(colors.skin, 1); g.fillCircle(12, 12, 7);
    g.generateTexture(key, 24, 24); g.destroy();
  },
  textureReactionFaceSet: function(scene, baseKey, colors) {
    var set = { determined: baseKey + '_face_determined', pained: baseKey + '_face_pained', exhausted: baseKey + '_face_exhausted' };
    this.textureReactionFace(scene, set.determined, colors, 'determined');
    this.textureReactionFace(scene, set.pained, colors, 'pained');
    this.textureReactionFace(scene, set.exhausted, colors, 'exhausted');
    this.REACTION_FACE_TEXTURES[baseKey] = set;
  },

  textureSilhouette: function(scene, baseKey, textureKey, colors, opts) {
    var g = scene.make.graphics({ x:0, y:0, add:false });
    g.fillStyle((opts && opts.tint) || 0x12091f, 1); g.fillEllipse(32, 20, 18, 18); g.fillRoundedRect(22, 24, 20, 26, 6);
    g.generateTexture(textureKey, 64, 86); g.destroy();
    this.SILHOUETTE_TEXTURES[baseKey] = textureKey;
  },

  textureTattoo: function(scene, key, config) {
    var g = scene.make.graphics({ x:0, y:0, add:false });
    var color = (config && config.color) || 0x7dd3fc;
    g.lineStyle(2, color, 0.9); g.lineBetween(24, 16, 24, 50); g.strokeCircle(24, 16, 3);
    g.generateTexture(key, 48, 72); g.destroy();
  },
  textureTattooSet: function(scene, baseKey, palette) {
    var set = { strike: baseKey + '_tattoo_strike', grapple: baseKey + '_tattoo_grapple', special: baseKey + '_tattoo_special' };
    this.textureTattoo(scene, set.strike, { type: 'strike', color: (palette && palette.strike) || 0xff6b6b });
    this.textureTattoo(scene, set.grapple, { type: 'grapple', color: (palette && palette.grapple) || 0x5dade2 });
    this.textureTattoo(scene, set.special, { type: 'special', color: (palette && palette.special) || 0xf7dc6f });
    this.TATTOO_TEXTURES[baseKey] = set;
  },

  generateOutfitTextures: function(scene, baseColors) {
    var outfitConfigs = {
      streetClothes: { torso: 0x2255aa, torsoLight: 0x4466cc },
      bjjGi: { torso: 0xffffff, torsoLight: 0xeeeeee, belt: 0x000000 },
      boxingTrunks: { torso: 0xff4444, torsoLight: 0xff6666, legs: 0xff4444 }
    };
    var outfitDamageKeys = {};
    for (var outfitKey in outfitConfigs) {
      var colors = Object.assign({}, baseColors, outfitConfigs[outfitKey]);
      var baseKey = 'player_' + outfitKey;
      this.textureDamageSet(scene, baseKey, colors, { armShift: 1, bodyW: 6, hasHeadband: true });
      outfitDamageKeys[outfitKey] = { healthy: baseKey, bruised: baseKey + '_hurt_1', bloodied: baseKey + '_hurt_2' };
    }
    this.OUTFIT_TEXTURES = outfitDamageKeys;
  },

  registerEnemyVariant: function(typeKey, baseKey) {
    if (!typeKey || !baseKey) return null;
    var idleFrames = this.IDLE_TEXTURES[baseKey] || [baseKey];
    var variant = { baseKey: baseKey, idleFrames: idleFrames.slice(), attackWindup: baseKey + '_windup', hitReaction: baseKey + '_hit', deathFrames: [baseKey + '_death_0', baseKey + '_death_1'] };
    this.ENEMY_VARIANTS = this.ENEMY_VARIANTS || {};
    this.ENEMY_TEXTURE_MAP = this.ENEMY_TEXTURE_MAP || {};
    this.ENEMY_VARIANTS[typeKey] = variant;
    this.ENEMY_TEXTURE_MAP[typeKey] = baseKey;
    return variant;
  },

  makeEssential: function(scene) {
    this.textureDamageSet(scene, 'player', this.PLAYER_COLORS, { armShift:1, bodyW:6, hasHeadband:true });
    this.texturePortraitSet(scene, 'player', this.PLAYER_COLORS, { accent: (this.STYLE_AURA_COLORS && this.STYLE_AURA_COLORS.striker) || 0xff4d4d });
    this.textureReactionFaceSet(scene, 'player', this.PLAYER_COLORS);
    this.textureTattooSet(scene, 'player', { strike: 0xff6b6b, grapple: 0x5dade2, special: 0xf7dc6f });
    this.textureSilhouette(scene, 'player', 'player_silhouette', this.PLAYER_COLORS, { tint: 0x180c2d });
  },

  makeOptional: function(scene) {
    this.textureDamageSet(scene, 'enemy_thug', this.THUG_COLORS, { armShift:0, bodyW:5, hasWeapon:true });
    this.texturePortraitSet(scene, 'enemy_thug', this.THUG_COLORS, { accent: 0xff7a7a });
    this.textureReactionFaceSet(scene, 'enemy_thug', this.THUG_COLORS);
    this.textureSilhouette(scene, 'enemy_thug', 'enemy_thug_silhouette', this.THUG_COLORS, { tint: 0x1f0c0c });
    this.registerEnemyVariant('streetThug', 'enemy_thug');
  },

  makeAll: function(scene) {
    if (this.ensureEnvTextures) this.ensureEnvTextures(scene);
    if (this.ensureEffectTextures) this.ensureEffectTextures(scene);
    this.makeEssential(scene);
    this.generateOutfitTextures(scene, this.PLAYER_COLORS);
    this.makeOptional(scene);
  }
});

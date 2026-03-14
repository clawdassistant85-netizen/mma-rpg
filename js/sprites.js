window.MMA = window.MMA || {};
window.MMA.Sprites = {
  IDLE_TEXTURES: {},
  DAMAGE_TEXTURES: {},
  LIMB_DAMAGE_TEXTURES: {},
  PORTRAIT_TEXTURES: {},
  AURA_TEXTURES: {},
  AURA_LAYER_TEXTURES: {},
  BOSS_AURA_CONFIGS: {
    champion: {
      key: 'champion',
      title: 'Gold Champion',
      color: 0xffd54f,
      glow: 0xfff2ad,
      pulseSpeed: 0.0052,
      hpPulseBoost: 0.012,
      alpha: 0.24,
      ringAlpha: 0.2,
      flareAlpha: 0.16,
      scale: 1.22,
      ringScale: 1.3,
      flareScale: 1.14,
      bob: 1.4,
      rotation: 3
    },
    undergroundKing: {
      key: 'undergroundKing',
      title: 'Underground King',
      color: 0xd83b4a,
      glow: 0xff8f96,
      pulseSpeed: 0.0064,
      hpPulseBoost: 0.016,
      alpha: 0.28,
      ringAlpha: 0.22,
      flareAlpha: 0.18,
      scale: 1.24,
      ringScale: 1.34,
      flareScale: 1.18,
      bob: 1.8,
      rotation: 4.2
    },
    shadowRival: {
      key: 'shadowRival',
      title: 'Shadow Rival',
      color: 0x4f3d8f,
      glow: 0xb9a8ff,
      pulseSpeed: 0.0072,
      hpPulseBoost: 0.02,
      alpha: 0.26,
      ringAlpha: 0.2,
      flareAlpha: 0.22,
      scale: 1.28,
      ringScale: 1.38,
      flareScale: 1.2,
      bob: 2.2,
      rotation: 5.4,
      staticJitter: 1.3
    }
  },
  IMPACT_PARTICLE_TEXTURES: {},
  FIRE_TRAIL_TEXTURES: {},
  FOOTWORK_TEXTURES: {},
  SILHOUETTE_TEXTURES: {},
  SIGNATURE_SILHOUETTE_CONFIG: {
    procCooldown: 420,
    duration: 190,
    specialDuration: 250,
    scale: 1.28,
    specialScale: 1.42,
    offsetX: 0,
    offsetY: -2,
    alpha: 0.34,
    specialAlpha: 0.48,
    tint: 0x180c2d,
    specialTint: 0x2b1250,
    glowTint: 0xbfa2ff,
    moveKeywords: ['signature', 'super', 'special', 'finisher', 'knockout', 'submission']
  },
  ENEMY_VARIANTS: {},
  ENEMY_TEXTURE_MAP: {},
  DECORATIONS: {},
  SHADOW_DOUBLE_CONFIG: {
    healthThreshold: 0.35,
    damageMultiplier: 0.3,
    procCooldown: 240,
    tint: 0x8a5cff,
    trailTint: 0xc7b8ff,
    hitTint: 0xe5d8ff,
    alpha: 0.42,
    attackAlpha: 0.62,
    offsetX: 14,
    attackOffsetX: 22,
    bobY: 2
  },
  MUSCLE_TENSION_CONFIG: {
    procCooldown: 120,
    lingerMs: 240,
    chargedLingerMs: 420,
    speedThreshold: 155,
    scaleX: 1.1,
    scaleY: 0.94,
    chargedScaleX: 1.16,
    chargedScaleY: 0.9,
    tint: 0xffd0d0,
    chargedTint: 0xfff0a6,
    alpha: 0.28,
    chargedAlpha: 0.42,
    offsetY: -6,
    pulseRate: 0.018,
    moveKeywords: ['special', 'signature', 'super', 'finisher', 'charge', 'haymaker', 'submission']
  },
  EXERTION_CONFIG: {
    heavyThreshold: 0.3,
    exhaustedThreshold: 0.08,
    recoveryThreshold: 0.36,
    breathPulseSpeed: 0.01,
    wobbleSpeed: 0.015,
    puffCooldown: 320,
    recoveryPuffCooldown: 520,
    stumbleCooldown: 520,
    breathOffsetY: -18,
    recoveryOffsetY: -14,
    wobbleAngle: 4,
    recoveryTint: 0xa8f0ff,
    heavyTint: 0xe7f8ff,
    exhaustedTint: 0xffd3a6
  },
  EXERTION_TEXTURES: {},
  LAST_CHANCE_CONFIG: {
    healthThreshold: 0.1,
    pulseSpeed: 0.012,
    pulseSpeedBoost: 0.02,
    alpha: 0.24,
    ringAlpha: 0.18,
    flareAlpha: 0.14,
    scale: 1.26,
    ringScale: 1.36,
    flareScale: 1.18,
    tint: 0xff3b30,
    glow: 0xffb0aa,
    labelCooldown: 1800
  },
  LAST_CHANCE_TEXTURES: {},
  ATTACK_READ_CONFIG: {
    telegraphMs: 300,
    cooldownThreshold: 180,
    alpha: 0.76,
    ringAlpha: 0.56,
    scale: 0.82,
    ringScale: 1.08,
    bob: 1.4,
    colors: {
      jab: 0xffe066,
      cross: 0xff9f1c,
      hook: 0xff5a36,
      haymaker: 0xff3b30,
      grapple: 0x4d88ff,
      default: 0xd7c8ff
    }
  },
  ATTACK_READ_TEXTURES: {},
  FEAR_TREMBLE_CONFIG: {
    healthThreshold: 0.25,
    pulseSpeed: 0.02,
    amplitude: 1.6,
    angle: 3.5,
    recentDamageWindowMs: 1400,
    damageBoostCap: 0.9,
    labelCooldown: 1800,
    tint: 0xffb3c1
  },
  VISUAL_VARIANTS: {},
  EQUIPMENT_TEXTURES: {},
  STYLE_AURA_COLORS: {
    striker: 0xff4d4d,
    grappler: 0x4d88ff,
    balanced: 0xb26bff
  },
  REACTION_FACE_TEXTURES: {},
  TATTOO_TEXTURES: {},
  RESONANCE_CONFIG: {
    moveHistoryLimit: 8,
    dominantWindow: 4,
    pulseSpeed: 0.0065,
    alpha: 0.2,
    ringAlpha: 0.14,
    flareAlpha: 0.12,
    scale: 1.18,
    ringScale: 1.28,
    flareScale: 1.1,
    colors: {
      striker: 0xff5a5a,
      grappler: 0x5aa8ff,
      hybrid: 0xb678ff,
      signature: 0xffd166,
      default: 0xa98bff
    }
  },
  RESONANCE_TEXTURES: {},
  VISUAL_ROLE_ALIASES: {
    trainer: 'npc_trainer',
    coach: 'npc_coach',
    sparringPartner: 'npc_trainer',
    gymNpc: 'npc_trainer',
    undergroundKing: 'enemy_underground_king_boss',
    underground_boss: 'enemy_underground_king_boss',
    cageBoss: 'enemy_underground_king_boss',
    champion: 'enemy_champion_boss',
    championBoss: 'enemy_champion_boss',
    titleBoss: 'enemy_champion_boss',
    shadowRival: 'enemy_shadow_boss'
  },
  makeAll: function(scene) {
    var self = scene;
    function textureFloorStreet(key) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      g.fillStyle(0x9b7a4b, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0xb38d58, 0.45); g.fillRect(1, 1, 14, 14);
      g.lineStyle(1, 0x6f5332, 0.6); g.lineBetween(0, 8, 16, 8); g.lineBetween(8, 0, 8, 16);
      g.lineStyle(1, 0xc8a56a, 0.35); g.lineBetween(0, 4, 16, 4); g.lineBetween(0, 12, 16, 12); g.lineBetween(4, 0, 4, 16); g.lineBetween(12, 0, 12, 16);
      g.fillStyle(0x5e462b, 0.35); g.fillRect(2, 2, 2, 2); g.fillRect(10, 10, 2, 2);
      g.generateTexture(key, 16, 16); g.destroy();
    }
    function textureWallStreet(key) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      g.fillStyle(0x3b3b40, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x4b4b52, 1); g.fillRect(1, 1, 14, 14);
      g.lineStyle(1, 0x2a2a2e, 0.95);
      g.lineBetween(0, 5, 16, 5); g.lineBetween(0, 11, 16, 11); g.lineBetween(5, 0, 5, 5); g.lineBetween(11, 0, 11, 5);
      g.lineBetween(8, 5, 8, 11); g.lineBetween(5, 11, 5, 16); g.lineBetween(11, 11, 11, 16);
      g.fillStyle(0x6a6a73, 0.55); g.fillRect(2, 2, 2, 2); g.fillRect(12, 8, 2, 2);
      g.generateTexture(key, 16, 16); g.destroy();
    }
    function textureGymFloor(key) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      g.fillStyle(0x1d3550, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x224566, 0.6); g.fillRect(0, 0, 16, 8);
      g.lineStyle(1, 0x2f5d8c, 0.8); g.lineBetween(0, 8, 16, 8);
      g.generateTexture(key, 16, 16); g.destroy();
    }
    function textureGymWall(key) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      g.fillStyle(0x4a4a4a, 1); g.fillRect(0, 0, 16, 16);
      g.lineStyle(1, 0x8a8a8a, 0.7); for (var i = 2; i < 16; i += 4) g.lineBetween(0, i, 16, i);
      g.generateTexture(key, 16, 16); g.destroy();
    }
    function textureCageFloor(key) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      g.fillStyle(0xe8e8e8, 1); g.fillRect(0, 0, 16, 16);
      g.lineStyle(1, 0xd24b4b, 0.7); g.lineBetween(0, 0, 16, 16); g.lineBetween(0, 16, 16, 0);
      g.generateTexture(key, 16, 16); g.destroy();
    }
    function textureCageWall(key) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      g.fillStyle(0x222222, 1); g.fillRect(0, 0, 16, 16);
      g.lineStyle(1, 0x777777, 0.5); g.lineBetween(0, 0, 16, 16); g.lineBetween(0, 16, 16, 0);
      g.generateTexture(key, 16, 16); g.destroy();
    }
    function textureCrate(key) { var g = self.make.graphics({ x:0, y:0, add:false }); g.fillStyle(0x6b4a2d, 1); g.fillRect(0, 0, 16, 16); g.lineStyle(2, 0x8a6340, 0.9); g.lineBetween(2, 2, 14, 14); g.lineBetween(14, 2, 2, 14); g.generateTexture(key, 16, 16); g.destroy(); }
    function textureDebris(key) { var g = self.make.graphics({ x:0, y:0, add:false }); g.fillStyle(0x333333, 0); g.fillRect(0, 0, 16, 16); g.fillStyle(0x555555, 0.8); g.fillCircle(4, 11, 2); g.fillCircle(9, 7, 1); g.fillCircle(12, 12, 2); g.generateTexture(key, 16, 16); g.destroy(); }
    function textureLamp(key) { var g = self.make.graphics({ x:0, y:0, add:false }); g.fillStyle(0x2b2b2b, 1); g.fillRect(7, 3, 2, 10); g.fillStyle(0xffdc73, 0.95); g.fillCircle(8, 2, 2); g.generateTexture(key, 16, 16); g.destroy(); }
    function textureHuman(key, colors, opts) {
      var g = self.make.graphics({ x:0, y:0, add:false }); var s = 3;
      var armShift = (opts && typeof opts.armShift === 'number') ? opts.armShift : 0;
      var bodyW = (opts && opts.bodyW) ? opts.bodyW : 6;
      var bodyX = Math.floor((16 - bodyW) / 2);
      var hasHeadband = (opts && opts.hasHeadband) || false;
      var hasWeapon = (opts && opts.hasWeapon) || false;
      var bigFists = (opts && opts.bigFists) || false;
      var torsoBob = (opts && typeof opts.torsoBob === 'number') ? opts.torsoBob : 0;
      var leftLegLift = (opts && typeof opts.leftLegLift === 'number') ? opts.leftLegLift : 0;
      var rightLegLift = (opts && typeof opts.rightLegLift === 'number') ? opts.rightLegLift : 0;
      var gloveBob = (opts && typeof opts.gloveBob === 'number') ? opts.gloveBob : 0;
      var damageLevel = (opts && typeof opts.damageLevel === 'number') ? opts.damageLevel : 0;
      var bodyLean = (opts && typeof opts.bodyLean === 'number') ? opts.bodyLean : 0;
      var leftArmDrop = (opts && typeof opts.leftArmDrop === 'number') ? opts.leftArmDrop : 0;
      var rightArmDrop = (opts && typeof opts.rightArmDrop === 'number') ? opts.rightArmDrop : 0;
      var headTilt = (opts && typeof opts.headTilt === 'number') ? opts.headTilt : 0;
      var hasCrown = (opts && opts.hasCrown) || false;
      var hasCape = (opts && opts.hasCape) || false;
      var hasShoulderWrap = (opts && opts.hasShoulderWrap) || false;
      var hasShadowVeil = (opts && opts.hasShadowVeil) || false;
      function px(x, y, w, h, color) { g.fillStyle(color, 1); g.fillRect(x * s, y * s, w * s, h * s); }
      px(5 + headTilt, 1 + torsoBob, 6, 5, colors.skin); px(4 + headTilt, 0 + torsoBob, 8, 2, colors.hair); px(4 + headTilt, 2 + torsoBob, 1, 2, colors.hair); px(11 + headTilt, 2 + torsoBob, 1, 2, colors.hair); px(6 + headTilt, 5 + torsoBob, 4, 1, colors.skinDark);
      if (hasHeadband) { px(4 + headTilt, 1 + torsoBob, 8, 1, colors.headband); px(4 + headTilt, 2 + torsoBob, 1, 1, colors.headband); px(11 + headTilt, 2 + torsoBob, 1, 1, colors.headband); }
      if (hasCrown) {
        px(5 + headTilt, 0 + torsoBob, 1, 1, colors.glove || 0xffd54f);
        px(7 + headTilt, -1 + torsoBob, 2, 2, colors.glove || 0xffd54f);
        px(10 + headTilt, 0 + torsoBob, 1, 1, colors.glove || 0xffd54f);
      }
      if (hasShadowVeil) {
        px(4 + headTilt, 3 + torsoBob, 8, 2, colors.outline || 0x12091f);
        px(5 + headTilt, 2 + torsoBob, 1, 1, colors.glove || 0xd7c8ff);
        px(10 + headTilt, 2 + torsoBob, 1, 1, colors.glove || 0xd7c8ff);
      }
      px(7 + headTilt, 6 + torsoBob, 2, 1, colors.skinDark);
      if (hasShoulderWrap) {
        px(bodyX - 1 + bodyLean, 7 + torsoBob, bodyW + 2, 2, colors.torsoLight);
        px(bodyX - 2 + bodyLean, 8 + torsoBob, 1, 2, colors.glove || colors.torsoLight);
        px(bodyX + bodyW + 1 + bodyLean, 8 + torsoBob, 1, 2, colors.glove || colors.torsoLight);
      }
      if (hasCape) {
        px(bodyX - 2 + bodyLean, 7 + torsoBob, 1, 10, colors.belt);
        px(bodyX + bodyW + 1 + bodyLean, 7 + torsoBob, 1, 10, colors.belt);
      }
      px(bodyX + bodyLean, 7 + torsoBob, bodyW, 8, colors.torso); px(bodyX + 1 + bodyLean, 8 + torsoBob, bodyW - 2, 1, colors.torsoLight); px(7 + bodyLean, 11 + torsoBob, 2, 4, colors.belt);
      var fistSize = bigFists ? 3 : 2; var fistY = (bigFists ? 8 : 9) + torsoBob + gloveBob;
      px(bodyX - 2 + armShift + bodyLean, 8 + torsoBob + leftArmDrop, 2, 5 - Math.min(leftArmDrop, 2), colors.skin); px(bodyX + bodyW + armShift + bodyLean, 8 + torsoBob + rightArmDrop, 2, 5 - Math.min(rightArmDrop, 2), colors.skin);
      px(bodyX - 1 + armShift + bodyLean, fistY + leftArmDrop, fistSize, fistSize, colors.glove); px(bodyX + bodyW - 1 + armShift + bodyLean, fistY + rightArmDrop, fistSize, fistSize, colors.glove);
      px(bodyX + bodyLean, 15 + torsoBob, bodyW, 1, colors.belt);
      px(bodyX + 1 + bodyLean, 16 + leftLegLift, 2, 6 - leftLegLift, colors.legs); px(bodyX + bodyW - 3 + bodyLean, 16 + rightLegLift, 2, 6 - rightLegLift, colors.legs);
      px(bodyX + 1 + bodyLean, 21, 2, 1, colors.bootDetail); px(bodyX + bodyW - 3 + bodyLean, 21, 2, 1, colors.bootDetail);
      px(bodyX + 1 + bodyLean, 22, 2, 2, colors.shoes); px(bodyX + bodyW - 3 + bodyLean, 22, 2, 2, colors.shoes);
      px(bodyX + 1 + bodyLean, 23, 2, 1, colors.shoeAccent); px(bodyX + bodyW - 3 + bodyLean, 23, 2, 1, colors.shoeAccent);
      if (hasWeapon) { px(bodyX + bodyW + 1 + bodyLean, 10 + torsoBob + rightArmDrop, 1, 6, colors.weapon); px(bodyX + bodyW + 2 + bodyLean, 9 + torsoBob + rightArmDrop, 1, 2, colors.weapon); }
      if (damageLevel >= 1) {
        px(4, 4 + torsoBob, 1, 1, 0x6a2d7c); px(11, 5 + torsoBob, 1, 1, 0x6a2d7c);
        px(bodyX - 1 + armShift + bodyLean, 13 + torsoBob + leftArmDrop, 2, 1, 0x6a2d7c); px(bodyX + bodyW - 1 + armShift + bodyLean, 13 + torsoBob + rightArmDrop, 2, 1, 0x6a2d7c);
        px(bodyX + 1 + bodyLean, 10 + torsoBob, Math.max(2, bodyW - 2), 1, 0x5e364f);
      }
      if (damageLevel >= 2) {
        px(7 + headTilt, 4 + torsoBob, 1, 2, 0x9b1c1c); px(8 + headTilt, 5 + torsoBob, 2, 1, 0x9b1c1c);
        px(bodyX + 2 + bodyLean, 12 + torsoBob, Math.max(2, bodyW - 4), 1, 0x9b1c1c);
        px(bodyX + 1 + bodyLean, 19, 2, 1, 0x9b1c1c); px(bodyX + bodyW - 3 + bodyLean, 19, 2, 1, 0x9b1c1c);
      }
      px(bodyX - 2 + bodyLean, 7 + torsoBob + leftArmDrop, 1, 9 - Math.min(leftArmDrop, 2), colors.outline); px(bodyX + bodyW + 2 + bodyLean, 7 + torsoBob + rightArmDrop, 1, 9 - Math.min(rightArmDrop, 2), colors.outline); px(5 + headTilt, 1 + torsoBob, 1, 6, colors.outline); px(10 + headTilt, 1 + torsoBob, 1, 6, colors.outline);
      g.generateTexture(key, 48, 72); g.destroy();
    }
    function textureIdleSet(baseKey, colors, baseOpts) {
      var frames = [
        { suffix: '', opts: {} },
        { suffix: '_idle_1', opts: { armShift: ((baseOpts.armShift || 0) - 1), torsoBob: -1, leftLegLift: 1, gloveBob: -1 } },
        { suffix: '_idle_2', opts: { armShift: ((baseOpts.armShift || 0) + 1), torsoBob: 0, rightLegLift: 1, gloveBob: 1 } },
        { suffix: '_idle_3', opts: { armShift: (baseOpts.armShift || 0), torsoBob: 1, leftLegLift: 0, rightLegLift: 0, gloveBob: 0 } }
      ];
      var keys = [];
      for (var i = 0; i < frames.length; i++) {
        var frameKey = i === 0 ? baseKey : (baseKey + frames[i].suffix);
        textureHuman(frameKey, colors, Object.assign({}, baseOpts, frames[i].opts));
        keys.push(frameKey);
      }
      window.MMA.Sprites.IDLE_TEXTURES[baseKey] = keys;
    }
    function textureDamageSet(baseKey, colors, baseOpts) {
      var damageBases = [
        { key: baseKey, damageLevel: 0 },
        {
          key: baseKey + '_hurt_1',
          damageLevel: 1,
          bodyLean: -1,
          leftArmDrop: 1,
          rightLegLift: 2,
          headTilt: -1
        },
        {
          key: baseKey + '_hurt_2',
          damageLevel: 2,
          bodyLean: -2,
          leftArmDrop: 2,
          rightArmDrop: 1,
          rightLegLift: 3,
          torsoBob: 1,
          headTilt: -1
        }
      ];
      var limbVariants = [
        { state: 'leftArm', suffix: '_limb_left_arm', opts: { leftArmDrop: 3, gloveBob: 1, bodyLean: -1, headTilt: -1 } },
        { state: 'rightArm', suffix: '_limb_right_arm', opts: { rightArmDrop: 3, gloveBob: 1, bodyLean: 1, headTilt: 1 } },
        { state: 'leftLeg', suffix: '_limb_left_leg', opts: { leftLegLift: 4, torsoBob: 1, bodyLean: 1, armShift: (baseOpts.armShift || 0) + 1 } },
        { state: 'rightLeg', suffix: '_limb_right_leg', opts: { rightLegLift: 4, torsoBob: 1, bodyLean: -1, armShift: (baseOpts.armShift || 0) - 1 } },
        { state: 'bothArms', suffix: '_limb_both_arms', opts: { leftArmDrop: 3, rightArmDrop: 3, gloveBob: 1, torsoBob: 1, headTilt: -1 } },
        { state: 'bothLegs', suffix: '_limb_both_legs', opts: { leftLegLift: 3, rightLegLift: 3, torsoBob: 2, bodyLean: -1 } }
      ];
      for (var i = 0; i < damageBases.length; i++) {
        textureIdleSet(damageBases[i].key, colors, Object.assign({}, baseOpts, damageBases[i], { damageLevel: damageBases[i].damageLevel }));
      }
      var limbMap = {};
      for (var j = 0; j < limbVariants.length; j++) {
        var variant = limbVariants[j];
        var variantKey = baseKey + variant.suffix;
        textureIdleSet(variantKey, colors, Object.assign({}, baseOpts, variant.opts, { damageLevel: Math.max(1, (baseOpts && baseOpts.damageLevel) || 0) }));
        limbMap[variant.state] = variantKey;
      }
      window.MMA.Sprites.DAMAGE_TEXTURES[baseKey] = {
        healthy: damageBases[0].key,
        bruised: damageBases[1].key,
        bloodied: damageBases[2].key
      };
      window.MMA.Sprites.LIMB_DAMAGE_TEXTURES[baseKey] = limbMap;
    }
    function texturePortrait(key, colors, opts) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      var pose = (opts && opts.pose) || 'stance';
      var accent = (opts && opts.accent) || colors.glove || 0xffffff;
      g.fillStyle(0x141820, 0.96); g.fillRoundedRect(0, 0, 48, 48, 8);
      g.fillStyle(0x263245, 0.92); g.fillRoundedRect(3, 3, 42, 42, 7);
      g.fillStyle(accent, 0.18); g.fillEllipse(24, 26, 34, 26);
      g.lineStyle(2, accent, 0.75); g.strokeRoundedRect(2, 2, 44, 44, 7);
      g.fillStyle(colors.skin, 1); g.fillCircle(24, 15, 7);
      g.fillStyle(colors.hair, 1); g.fillEllipse(24, 11, 16, 10);
      g.fillStyle(colors.skinDark, 0.9); g.fillRect(21, 20, 6, 3);
      g.fillStyle(colors.torso, 1); g.fillRoundedRect(15, 22, 18, 15, 5);
      g.fillStyle(colors.torsoLight, 0.85); g.fillRoundedRect(18, 24, 12, 5, 3);
      g.fillStyle(colors.belt, 1); g.fillRect(16, 33, 16, 3);
      g.fillStyle(colors.glove, 1);
      if (pose === 'grapple') {
        g.fillRoundedRect(7, 24, 10, 6, 3); g.fillRoundedRect(31, 20, 10, 6, 3);
        g.fillStyle(accent, 0.9); g.fillCircle(37, 17, 4);
        g.lineStyle(2, accent, 0.8); g.beginPath(); g.moveTo(35, 15); g.lineTo(42, 10); g.strokePath();
      } else if (pose === 'signature') {
        g.fillRoundedRect(8, 19, 10, 6, 3); g.fillRoundedRect(30, 14, 11, 7, 3);
        g.fillStyle(accent, 0.9); g.fillTriangle(34, 9, 42, 13, 35, 18);
        g.lineStyle(2, accent, 0.9); g.strokeTriangle(34, 9, 42, 13, 35, 18);
      } else {
        g.fillRoundedRect(8, 23, 10, 6, 3); g.fillRoundedRect(30, 23, 10, 6, 3);
        g.lineStyle(2, accent, 0.8); g.beginPath(); g.moveTo(36, 20); g.lineTo(41, 15); g.strokePath();
      }
      g.fillStyle(0xffffff, 0.09); g.fillRect(6, 6, 36, 8);
      g.generateTexture(key, 48, 48); g.destroy();
    }
    function texturePortraitSet(baseKey, colors, opts) {
      var accent = (opts && opts.accent) || colors.glove || colors.torsoLight || 0xffffff;
      var set = {
        stance: baseKey + '_portrait_stance',
        grapple: baseKey + '_portrait_grapple',
        signature: baseKey + '_portrait_signature'
      };
      texturePortrait(set.stance, colors, { pose: 'stance', accent: accent });
      texturePortrait(set.grapple, colors, { pose: 'grapple', accent: accent });
      texturePortrait(set.signature, colors, { pose: 'signature', accent: accent });
      window.MMA.Sprites.PORTRAIT_TEXTURES[baseKey] = set;
    }
    function textureAura(key, color, alphaScale, variant) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      var outerAlpha = typeof alphaScale === 'number' ? alphaScale : 0.18;
      var midAlpha = Math.min(0.55, outerAlpha + 0.14);
      var mode = variant || 'core';
      g.clear();
      if (mode === 'ring') {
        g.lineStyle(3, color, Math.min(0.9, outerAlpha + 0.42)); g.strokeEllipse(24, 38, 34, 50);
        g.lineStyle(2, 0xffffff, 0.24); g.strokeEllipse(24, 38, 24, 36);
        g.fillStyle(color, outerAlpha * 0.55); g.fillEllipse(24, 42, 18, 18);
      } else if (mode === 'flare') {
        g.fillStyle(color, outerAlpha * 0.85); g.fillTriangle(24, 5, 14, 36, 22, 28);
        g.fillTriangle(24, 5, 34, 36, 26, 28);
        g.fillTriangle(10, 34, 19, 66, 21, 40);
        g.fillTriangle(38, 34, 29, 66, 27, 40);
        g.fillStyle(color, outerAlpha * 0.65); g.fillEllipse(24, 38, 26, 40);
        g.lineStyle(2, 0xffffff, 0.18); g.strokeEllipse(24, 36, 18, 28);
      } else {
        g.fillStyle(color, outerAlpha); g.fillEllipse(24, 36, 38, 56);
        g.fillStyle(color, midAlpha); g.fillEllipse(24, 36, 28, 44);
        g.lineStyle(2, color, 0.8); g.strokeEllipse(24, 36, 24, 38);
        g.lineStyle(1, 0xffffff, 0.35); g.strokeEllipse(24, 36, 32, 48);
      }
      g.generateTexture(key, 48, 72); g.destroy();
    }
    function textureReactionFace(key, colors, mood) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      var browColor = colors.hair || 0x1a1a1a;
      var mouthColor = colors.skinDark || 0x8a5f43;
      var accent = colors.headband || colors.glove || 0xffffff;
      g.fillStyle(0x141820, 0.96); g.fillRoundedRect(0, 0, 24, 24, 6);
      g.fillStyle(0x263245, 0.92); g.fillRoundedRect(2, 2, 20, 20, 5);
      g.fillStyle(accent, 0.18); g.fillEllipse(12, 12, 16, 14);
      g.fillStyle(colors.skin, 1); g.fillCircle(12, 12, 7);
      g.fillStyle(colors.hair, 1); g.fillEllipse(12, 8, 14, 8);
      g.fillStyle(0xffffff, 1); g.fillCircle(9, 11, 2); g.fillCircle(15, 11, 2);
      if (mood === 'pained') {
        g.lineStyle(2, browColor, 1); g.lineBetween(7, 9, 10, 10); g.lineBetween(17, 9, 14, 10);
        g.fillStyle(0x9b1c1c, 0.95); g.fillCircle(9, 12, 1); g.fillCircle(15, 12, 1);
        g.lineStyle(2, mouthColor, 1); g.beginPath(); g.moveTo(8, 17); g.lineTo(10, 19); g.lineTo(12, 17); g.lineTo(14, 19); g.lineTo(16, 17); g.strokePath();
        g.fillStyle(0x6a2d7c, 0.9); g.fillCircle(6, 13, 1); g.fillCircle(18, 13, 1);
      } else if (mood === 'exhausted') {
        g.lineStyle(2, browColor, 0.9); g.lineBetween(7, 10, 10, 10); g.lineBetween(14, 10, 17, 10);
        g.fillStyle(browColor, 0.85); g.fillRect(8, 11, 2, 1); g.fillRect(14, 11, 2, 1);
        g.fillStyle(mouthColor, 1); g.fillEllipse(12, 17, 5, 3);
        g.fillStyle(0xff6b8a, 0.95); g.fillRoundedRect(10, 17, 4, 5, 2);
        g.fillStyle(0x9fd4ff, 0.8); g.fillCircle(18, 16, 1);
      } else {
        g.lineStyle(2, browColor, 1); g.lineBetween(7, 9, 10, 8); g.lineBetween(17, 9, 14, 8);
        g.fillStyle(browColor, 1); g.fillCircle(9, 11, 1); g.fillCircle(15, 11, 1);
        g.lineStyle(2, mouthColor, 1); g.beginPath(); g.moveTo(8, 17); g.lineTo(10, 16); g.lineTo(12, 16); g.lineTo(14, 16); g.lineTo(16, 17); g.strokePath();
        g.lineStyle(2, accent, 0.8); g.strokeRoundedRect(3, 3, 18, 18, 5);
      }
      g.generateTexture(key, 24, 24); g.destroy();
    }
    function textureSilhouette(baseKey, textureKey, colors, opts) {
      var accent = (opts && opts.accent) || colors.glove || colors.headband || 0xffffff;
      var shade = (opts && opts.tint) || 0x12091f;
      var pose = (opts && opts.pose) || 'stance';
      var g = self.make.graphics({ x:0, y:0, add:false });
      g.fillStyle(shade, 0); g.fillRect(0, 0, 64, 86);
      g.fillStyle(shade, 1);
      g.fillEllipse(32, 20, 18, 18);
      g.fillRoundedRect(22, 24, 20, 26, 6);
      if (pose === 'grapple') {
        g.fillRoundedRect(12, 28, 16, 10, 5);
        g.fillRoundedRect(37, 22, 15, 10, 5);
        g.fillTriangle(44, 18, 57, 24, 46, 32);
      } else if (pose === 'special') {
        g.fillRoundedRect(12, 22, 16, 9, 5);
        g.fillRoundedRect(37, 16, 17, 11, 5);
        g.fillTriangle(43, 10, 58, 18, 44, 28);
        g.fillTriangle(31, 6, 38, 20, 25, 19);
      } else {
        g.fillRoundedRect(12, 27, 15, 10, 5);
        g.fillRoundedRect(37, 27, 15, 10, 5);
      }
      g.fillRect(27, 47, 10, 8);
      g.fillRect(24, 53, 7, 20);
      g.fillRect(33, 53, 7, 20);
      g.fillEllipse(27.5, 75, 10, 6);
      g.fillEllipse(36.5, 75, 10, 6);
      g.lineStyle(3, accent, 0.25); g.strokeEllipse(32, 38, 42, 58);
      g.lineStyle(2, accent, 0.3); g.beginPath(); g.moveTo(12, 60); g.lineTo(20, 52); g.lineTo(28, 60); g.strokePath();
      g.beginPath(); g.moveTo(52, 60); g.lineTo(44, 52); g.lineTo(36, 60); g.strokePath();
      g.generateTexture(textureKey, 64, 86); g.destroy();
      window.MMA.Sprites.SILHOUETTE_TEXTURES[baseKey] = textureKey;
    }
    function textureReactionFaceSet(baseKey, colors) {
      var set = {
        determined: baseKey + '_face_determined',
        pained: baseKey + '_face_pained',
        exhausted: baseKey + '_face_exhausted'
      };
      textureReactionFace(set.determined, colors, 'determined');
      textureReactionFace(set.pained, colors, 'pained');
      textureReactionFace(set.exhausted, colors, 'exhausted');
      window.MMA.Sprites.REACTION_FACE_TEXTURES[baseKey] = set;
    }
    function textureTattoo(key, config) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      var color = (config && config.color) || 0x7dd3fc;
      var alpha = (config && typeof config.alpha === 'number') ? config.alpha : 0.92;
      var type = (config && config.type) || 'strike';
      g.fillStyle(0x000000, 0); g.fillRect(0, 0, 48, 72);
      g.lineStyle(2, color, alpha);
      if (type === 'grapple') {
        g.strokeCircle(15, 31, 4);
        g.strokeCircle(33, 31, 4);
        g.lineBetween(19, 31, 29, 31);
        g.lineBetween(12, 39, 18, 48);
        g.lineBetween(36, 39, 30, 48);
      } else if (type === 'special') {
        g.beginPath(); g.moveTo(24, 18); g.lineTo(29, 29); g.lineTo(41, 31); g.lineTo(32, 39); g.lineTo(34, 52); g.lineTo(24, 45); g.lineTo(14, 52); g.lineTo(16, 39); g.lineTo(7, 31); g.lineTo(19, 29); g.closePath(); g.strokePath();
        g.lineBetween(24, 18, 24, 52);
      } else {
        g.lineBetween(24, 16, 24, 50);
        g.lineBetween(17, 24, 31, 24);
        g.lineBetween(15, 36, 33, 36);
        g.strokeCircle(24, 16, 3);
      }
      g.lineStyle(1, color, alpha * 0.55);
      g.strokeEllipse(24, 34, 24, 36);
      g.generateTexture(key, 48, 72); g.destroy();
    }
    function textureTattooSet(baseKey, palette) {
      var set = {
        strike: baseKey + '_tattoo_strike',
        grapple: baseKey + '_tattoo_grapple',
        special: baseKey + '_tattoo_special'
      };
      textureTattoo(set.strike, { type: 'strike', color: (palette && palette.strike) || 0xff6b6b, alpha: 0.86 });
      textureTattoo(set.grapple, { type: 'grapple', color: (palette && palette.grapple) || 0x5dade2, alpha: 0.86 });
      textureTattoo(set.special, { type: 'special', color: (palette && palette.special) || 0xf7dc6f, alpha: 0.9 });
      window.MMA.Sprites.TATTOO_TEXTURES[baseKey] = set;
    }
    function textureResonance(key, color, alphaScale, variant) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      var outerAlpha = typeof alphaScale === 'number' ? alphaScale : 0.18;
      var innerAlpha = Math.min(0.6, outerAlpha + 0.12);
      var mode = variant || 'core';
      g.clear();
      if (mode === 'ring') {
        g.lineStyle(2, color, Math.min(0.9, outerAlpha + 0.34));
        g.strokeEllipse(24, 36, 30, 44);
        g.strokeEllipse(24, 36, 18, 28);
        g.lineStyle(1, 0xffffff, 0.2);
        g.beginPath(); g.moveTo(7, 37); g.lineTo(15, 24); g.lineTo(24, 34); g.lineTo(33, 21); g.lineTo(41, 37); g.strokePath();
      } else if (mode === 'flare') {
        g.fillStyle(color, outerAlpha * 0.7);
        g.fillTriangle(24, 8, 14, 28, 22, 24);
        g.fillTriangle(24, 8, 34, 28, 26, 24);
        g.fillTriangle(12, 38, 19, 60, 22, 42);
        g.fillTriangle(36, 38, 29, 60, 26, 42);
        g.fillStyle(color, outerAlpha * 0.42);
        g.fillEllipse(24, 38, 24, 34);
      } else {
        g.fillStyle(color, outerAlpha); g.fillEllipse(24, 36, 34, 50);
        g.fillStyle(color, innerAlpha); g.fillEllipse(24, 36, 20, 32);
        g.lineStyle(2, color, 0.74); g.strokeEllipse(24, 36, 26, 40);
        g.lineStyle(1, 0xffffff, 0.24); g.strokeEllipse(24, 36, 32, 46);
      }
      g.generateTexture(key, 48, 72); g.destroy();
    }
    function texturePickup(key) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      g.fillStyle(0x0f1724, 0.92); g.fillCircle(12, 12, 10);
      g.lineStyle(2, 0xffffff, 0.9); g.strokeCircle(12, 12, 10);
      g.fillStyle(0xffffff, 0.18); g.fillCircle(12, 12, 7);
      g.fillStyle(0xffffff, 0.95); g.fillRect(10, 5, 4, 14);
      g.fillRect(5, 10, 14, 4);
      g.generateTexture(key, 24, 24); g.destroy();
    }
    function textureHitbox(key) { var g = self.make.graphics({ x:0, y:0, add:false }); g.fillStyle(0xffff00, 1); g.fillRect(0, 0, 24, 24); g.lineStyle(2, 0xffcc00, 1); g.strokeRect(1, 1, 22, 22); g.generateTexture(key, 24, 24); g.destroy(); }
    function textureSweatParticle(key, opts) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      var fill = (opts && opts.fill) || 0x9fd4ff;
      var highlight = (opts && opts.highlight) || 0xffffff;
      var alpha = (opts && typeof opts.alpha === 'number') ? opts.alpha : 0.9;
      g.fillStyle(fill, alpha); g.fillEllipse(8, 10, 8, 12);
      g.fillStyle(highlight, 0.72); g.fillEllipse(6, 7, 3, 4);
      g.lineStyle(1, 0xffffff, 0.35); g.strokeEllipse(8, 10, 8, 12);
      g.generateTexture(key, 16, 16); g.destroy();
    }
    function textureFireTrailParticle(key, opts) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      var outer = (opts && opts.outer) || 0xff5a1f;
      var core = (opts && opts.core) || 0xfff1a3;
      var alpha = (opts && typeof opts.alpha === 'number') ? opts.alpha : 0.9;
      g.fillStyle(outer, alpha * 0.95); g.fillTriangle(12, 0, 4, 16, 12, 12);
      g.fillTriangle(12, 0, 20, 16, 12, 12);
      g.fillStyle(outer, alpha * 0.6); g.fillEllipse(12, 16, 14, 10);
      g.fillStyle(core, alpha); g.fillTriangle(12, 4, 8, 14, 12, 11);
      g.fillTriangle(12, 4, 16, 14, 12, 11);
      g.fillStyle(0xffffff, alpha * 0.4); g.fillEllipse(12, 10, 4, 6);
      g.lineStyle(1, 0xffffff, alpha * 0.18); g.strokeEllipse(12, 14, 12, 8);
      g.generateTexture(key, 24, 24); g.destroy();
    }
    function textureFootworkDust(key, opts) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      var color = (opts && opts.color) || 0xd8d2c2;
      var highlight = (opts && opts.highlight) || 0xf6f0de;
      var alpha = (opts && typeof opts.alpha === 'number') ? opts.alpha : 0.82;
      g.fillStyle(color, alpha * 0.34); g.fillEllipse(12, 12, 18, 10);
      g.fillEllipse(8, 14, 10, 6); g.fillEllipse(16, 14, 10, 6);
      g.fillStyle(color, alpha * 0.58); g.fillCircle(8, 12, 3); g.fillCircle(12, 9, 4); g.fillCircle(16, 12, 3);
      g.fillStyle(highlight, alpha * 0.38); g.fillCircle(11, 10, 2); g.fillCircle(15, 11, 1);
      g.generateTexture(key, 24, 24); g.destroy();
    }
    function textureFootprint(key, opts) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      var color = (opts && opts.color) || 0xc9c1b3;
      var alpha = (opts && typeof opts.alpha === 'number') ? opts.alpha : 0.4;
      g.fillStyle(color, alpha); g.fillEllipse(7, 11, 6, 10);
      g.fillEllipse(12, 6, 4, 4); g.fillEllipse(14, 8, 3, 3); g.fillEllipse(15, 11, 3, 3);
      g.fillEllipse(13, 14, 3, 3); g.fillEllipse(10, 16, 3, 3);
      g.generateTexture(key, 18, 18); g.destroy();
    }
    function textureBreathPuff(key, opts) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      var color = (opts && opts.color) || 0xe7f8ff;
      var alpha = (opts && typeof opts.alpha === 'number') ? opts.alpha : 0.85;
      g.fillStyle(color, alpha * 0.34); g.fillCircle(12, 13, 8);
      g.fillCircle(7, 14, 5); g.fillCircle(16, 14, 5);
      g.fillStyle(color, alpha * 0.52); g.fillCircle(9, 12, 4); g.fillCircle(14, 11, 5);
      g.fillStyle(0xffffff, alpha * 0.35); g.fillCircle(10, 10, 2); g.fillCircle(15, 12, 2);
      g.lineStyle(1, 0xffffff, alpha * 0.18); g.strokeEllipse(12, 13, 16, 12);
      g.generateTexture(key, 24, 24); g.destroy();
    }
    function textureStumbleSpark(key, opts) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      var color = (opts && opts.color) || 0xffd3a6;
      var alpha = (opts && typeof opts.alpha === 'number') ? opts.alpha : 0.92;
      g.fillStyle(color, alpha); g.fillTriangle(12, 0, 15, 9, 24, 12);
      g.fillTriangle(24, 12, 15, 15, 12, 24);
      g.fillTriangle(12, 24, 9, 15, 0, 12);
      g.fillTriangle(0, 12, 9, 9, 12, 0);
      g.fillStyle(0xffffff, alpha * 0.42); g.fillCircle(12, 12, 4);
      g.generateTexture(key, 24, 24); g.destroy();
    }
    function textureAttackReadHalo(key, opts) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      var color = (opts && opts.color) || 0xd7c8ff;
      var alpha = (opts && typeof opts.alpha === 'number') ? opts.alpha : 0.78;
      g.fillStyle(color, alpha * 0.22); g.fillEllipse(16, 16, 22, 22);
      g.fillStyle(color, alpha * 0.42); g.fillEllipse(16, 16, 14, 14);
      g.lineStyle(2, color, alpha); g.strokeEllipse(16, 16, 18, 18);
      g.lineStyle(1, 0xffffff, alpha * 0.4); g.strokeEllipse(16, 16, 26, 26);
      g.generateTexture(key, 32, 32); g.destroy();
    }
    function textureEnemyAnimationSet(baseKey, colors, baseOpts) {
      var opts = baseOpts || {};
      textureHuman(baseKey + '_windup', colors, Object.assign({}, opts, {
        armShift: (opts.armShift || 0) + 2,
        gloveBob: -1,
        bodyLean: 1,
        torsoBob: -1,
        leftArmDrop: 0,
        rightArmDrop: 1
      }));
      textureHuman(baseKey + '_hit', colors, Object.assign({}, opts, {
        bodyLean: -2,
        leftArmDrop: 2,
        rightArmDrop: 1,
        rightLegLift: 2,
        headTilt: -1,
        damageLevel: 1
      }));
      textureHuman(baseKey + '_death_0', colors, Object.assign({}, opts, {
        bodyLean: -2,
        leftArmDrop: 3,
        rightArmDrop: 3,
        leftLegLift: 3,
        rightLegLift: 2,
        torsoBob: 2,
        headTilt: -1,
        damageLevel: 2
      }));
      textureHuman(baseKey + '_death_1', colors, Object.assign({}, opts, {
        bodyLean: -3,
        leftArmDrop: 4,
        rightArmDrop: 4,
        leftLegLift: 4,
        rightLegLift: 4,
        torsoBob: 4,
        headTilt: -2,
        damageLevel: 2
      }));
    }
    function textureDecorationBarrel(key) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      g.fillStyle(0x694126, 1); g.fillRoundedRect(10, 8, 28, 36, 6);
      g.fillStyle(0x8a5734, 1); g.fillRoundedRect(12, 10, 24, 32, 5);
      g.lineStyle(3, 0x2a2a2a, 0.9); g.strokeRoundedRect(12, 14, 24, 10, 4); g.strokeRoundedRect(12, 28, 24, 10, 4);
      g.fillStyle(0x171717, 0.18); g.fillEllipse(24, 42, 20, 6);
      g.generateTexture(key, 48, 48); g.destroy();
    }
    function textureDecorationTrash(key) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      g.fillStyle(0x444b57, 1); g.fillRoundedRect(10, 12, 28, 28, 4);
      g.fillStyle(0x5d6776, 1); g.fillRoundedRect(8, 8, 32, 8, 4);
      g.lineStyle(2, 0x232831, 0.9); g.strokeRoundedRect(10, 12, 28, 28, 4);
      g.fillStyle(0xa1b42b, 0.8); g.fillRect(16, 18, 16, 4);
      g.generateTexture(key, 48, 48); g.destroy();
    }
    function textureDecorationGraffiti(key) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      g.fillStyle(0x000000, 0); g.fillRect(0, 0, 96, 48);
      g.lineStyle(5, 0xff4f5e, 0.92); g.beginPath(); g.moveTo(10, 30); g.lineTo(24, 12); g.lineTo(38, 28); g.lineTo(56, 10); g.lineTo(84, 28); g.strokePath();
      g.lineStyle(4, 0x35d2ff, 0.9); g.beginPath(); g.moveTo(14, 36); g.lineTo(30, 22); g.lineTo(42, 34); g.lineTo(62, 20); g.lineTo(80, 34); g.strokePath();
      g.fillStyle(0xffef61, 0.9); g.fillCircle(72, 14, 5);
      g.generateTexture(key, 96, 48); g.destroy();
    }
    function textureDecorationHeavyBag(key) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      g.lineStyle(3, 0xc8d3e1, 0.9); g.lineBetween(24, 0, 24, 10);
      g.fillStyle(0xb61f2d, 1); g.fillRoundedRect(10, 10, 28, 46, 8);
      g.fillStyle(0xd83f4f, 1); g.fillRoundedRect(14, 14, 20, 36, 6);
      g.lineStyle(2, 0x4b0f14, 0.9); g.strokeRoundedRect(10, 10, 28, 46, 8);
      g.generateTexture(key, 48, 64); g.destroy();
    }
    function textureDecorationSpeedBag(key) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      g.lineStyle(3, 0xc8d3e1, 0.9); g.lineBetween(24, 4, 24, 14);
      g.fillStyle(0x8b4dff, 1); g.fillEllipse(24, 28, 22, 28);
      g.fillStyle(0xb38aff, 1); g.fillEllipse(24, 24, 16, 18);
      g.lineStyle(2, 0x35136d, 0.85); g.strokeEllipse(24, 28, 22, 28);
      g.generateTexture(key, 48, 48); g.destroy();
    }
    function textureDecorationWeights(key) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      g.fillStyle(0x252a31, 1); g.fillRect(6, 34, 36, 6);
      g.fillRect(10, 12, 4, 26); g.fillRect(34, 12, 4, 26);
      g.lineStyle(4, 0xb7bec8, 0.95); g.lineBetween(12, 18, 36, 18); g.lineBetween(12, 28, 36, 28);
      g.fillStyle(0xe14848, 0.95); g.fillCircle(16, 18, 6); g.fillCircle(32, 18, 6); g.fillCircle(16, 28, 6); g.fillCircle(32, 28, 6);
      g.generateTexture(key, 48, 48); g.destroy();
    }
    function textureDecorationMirror(key) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      g.fillStyle(0x2a1a12, 1); g.fillRoundedRect(4, 4, 40, 56, 6);
      g.fillStyle(0x9fd8ff, 0.9); g.fillRoundedRect(8, 8, 32, 48, 4);
      g.fillStyle(0xffffff, 0.18); g.fillRect(12, 12, 18, 8);
      g.lineStyle(2, 0xd7f1ff, 0.8); g.strokeRoundedRect(8, 8, 32, 48, 4);
      g.generateTexture(key, 48, 64); g.destroy();
    }
    function textureDecorationBoxingRing(key) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      g.fillStyle(0x1f3e6b, 1); g.fillRoundedRect(6, 10, 116, 60, 10);
      g.fillStyle(0x2c568f, 1); g.fillRoundedRect(12, 16, 104, 48, 8);
      g.lineStyle(4, 0xffffff, 0.9); g.strokeRoundedRect(12, 16, 104, 48, 8);
      g.lineStyle(3, 0xf4d35e, 0.95); g.strokeRect(20, 24, 88, 32);
      g.fillStyle(0xcc4444, 1); g.fillRect(8, 8, 10, 10); g.fillRect(110, 8, 10, 10); g.fillRect(8, 62, 10, 10); g.fillRect(110, 62, 10, 10);
      g.generateTexture(key, 128, 80); g.destroy();
    }
    function textureDecorationOctagon(key) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      g.fillStyle(0x20252b, 1);
      g.beginPath();
      g.moveTo(34, 8); g.lineTo(94, 8); g.lineTo(120, 34); g.lineTo(120, 74); g.lineTo(94, 100); g.lineTo(34, 100); g.lineTo(8, 74); g.lineTo(8, 34); g.closePath();
      g.fillPath();
      g.lineStyle(4, 0xd4d8dd, 0.95);
      g.beginPath();
      g.moveTo(34, 8); g.lineTo(94, 8); g.lineTo(120, 34); g.lineTo(120, 74); g.lineTo(94, 100); g.lineTo(34, 100); g.lineTo(8, 74); g.lineTo(8, 34); g.closePath();
      g.strokePath();
      g.fillStyle(0x556270, 0.9); g.fillEllipse(64, 54, 78, 42);
      g.generateTexture(key, 128, 108); g.destroy();
    }
    function textureDecorationCorner(key) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      g.fillStyle(0xc81f1f, 1); g.fillRoundedRect(10, 10, 18, 18, 6);
      g.lineStyle(3, 0xffffff, 0.9); g.lineBetween(18, 0, 18, 10); g.lineBetween(18, 28, 18, 48);
      g.generateTexture(key, 36, 48); g.destroy();
    }
    function textureDecorationTunnel(key) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      g.fillStyle(0x0f1117, 1); g.fillRoundedRect(10, 6, 108, 64, 18);
      g.fillStyle(0x2d3644, 1); g.fillRoundedRect(18, 14, 92, 48, 14);
      g.fillStyle(0xf4d35e, 0.75); g.fillRect(54, 6, 20, 64);
      g.generateTexture(key, 128, 80); g.destroy();
    }
    function textureDecorationCrowd(key) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      g.fillStyle(0x0f1220, 1); g.fillRect(0, 0, 128, 64);
      for (var c = 0; c < 10; c++) {
        var cx = 10 + c * 12;
        var cy = 34 + (c % 3) * 4;
        g.fillStyle(0x1a2435 + (c % 2 ? 0x0c0c0c : 0), 0.95);
        g.fillCircle(cx, cy - 10, 5);
        g.fillRoundedRect(cx - 6, cy - 6, 12, 22, 5);
      }
      g.generateTexture(key, 128, 64); g.destroy();
    }
    function textureDecorationOctagon(key) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      g.fillStyle(0x20252b, 1);
      g.beginPath();
      g.moveTo(34, 8); g.lineTo(94, 8); g.lineTo(120, 34); g.lineTo(120, 74); g.lineTo(94, 100); g.lineTo(34, 100); g.lineTo(8, 74); g.lineTo(8, 34); g.closePath();
      g.fillPath();
      g.lineStyle(4, 0xd4d8dd, 0.95);
      g.beginPath();
      g.moveTo(34, 8); g.lineTo(94, 8); g.lineTo(120, 34); g.lineTo(120, 74); g.lineTo(94, 100); g.lineTo(34, 100); g.lineTo(8, 74); g.lineTo(8, 34); g.closePath();
      g.strokePath();
      g.fillStyle(0x556270, 0.9); g.fillEllipse(64, 54, 78, 42);
      g.generateTexture(key, 128, 108); g.destroy();
    }
    function textureDecorationCorner(key) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      g.fillStyle(0xc81f1f, 1); g.fillRoundedRect(10, 10, 18, 18, 6);
      g.lineStyle(3, 0xffffff, 0.9); g.lineBetween(18, 0, 18, 10); g.lineBetween(18, 28, 18, 48);
      g.generateTexture(key, 36, 48); g.destroy();
    }
    function textureDecorationTunnel(key) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      g.fillStyle(0x0f1117, 1); g.fillRoundedRect(10, 6, 108, 64, 18);
      g.fillStyle(0x2d3644, 1); g.fillRoundedRect(18, 14, 92, 48, 14);
      g.fillStyle(0xf4d35e, 0.75); g.fillRect(54, 6, 20, 64);
      g.generateTexture(key, 128, 80); g.destroy();
    }
    function textureDecorationCrowd(key) {
      var g = self.make.graphics({ x:0, y:0, add:false });
      g.fillStyle(0x0f1220, 1); g.fillRect(0, 0, 128, 64);
      for (var c = 0; c < 10; c++) {
        var cx = 10 + c * 12;
        var cy = 34 + (c % 3) * 4;
        g.fillStyle(0x1a2435 + (c % 2 ? 0x0c0c0c : 0), 0.95);
        g.fillCircle(cx, cy - 10, 5);
        g.fillRoundedRect(cx - 6, cy - 6, 12, 22, 5);
      }
      g.generateTexture(key, 128, 64); g.destroy();
    }

    textureFloorStreet('floor'); textureWallStreet('wall'); textureGymFloor('gymFloor'); textureGymWall('gymWalls');
    textureCageFloor('cageFloor'); textureCageWall('cageWall'); textureCrate('crateProp'); textureDebris('debrisProp'); textureLamp('lampProp');
    var playerColors = { hair:0x2d1b12, skin:0xf1c38f, skinDark:0xd6a374, torso:0x2d66d3, torsoLight:0x4f85eb, belt:0x1a2a52, headband:0xd92b2b, glove:0xc9d9ff, legs:0x2a3f66, shoes:0x111111, bootDetail:0x222222, shoeAccent:0x333333, outline:0x1a1a1a };
    var thugColors = { hair:0x171717, skin:0xd9a77b, skinDark:0xb9845a, torso:0xb62626, torsoLight:0xd13a3a, belt:0x551414, glove:0x7a1b1b, weapon:0x5c4033, legs:0x2d2d33, shoes:0x0c0c0c, bootDetail:0x1a1a1a, shoeAccent:0x2a2a2a, outline:0x1a1a1a };
    var brawlerColors = { hair:0x3d2516, skin:0xd6a178, skinDark:0xb7835c, torso:0xc66a2a, torsoLight:0xde8a44, belt:0x6b3a14, glove:0x8b4a1d, weapon:0x4a3020, legs:0x4f3a2a, shoes:0x1a120d, bootDetail:0x2a1a15, shoeAccent:0x3a2a20, outline:0x2a1a10 };
    var eliteColors = { hair:0x090909, skin:0xc99667, skinDark:0x9e6e49, torso:0x5c1fa8, torsoLight:0x7f46d1, belt:0x2d1259, glove:0xd6c8ff, weapon:0x7a7a90, legs:0x221d34, shoes:0x050505, bootDetail:0x171125, shoeAccent:0xbca6ff, outline:0xf3dc7a };
    var championBossColors = { hair:0xf1da7d, skin:0xd19a6c, skinDark:0xa86e43, torso:0x151515, torsoLight:0x3d3d3d, belt:0xb41f1f, glove:0xffd54f, weapon:0xe7d37a, legs:0x2b2b2b, shoes:0x090909, bootDetail:0x3d2a12, shoeAccent:0xffd54f, outline:0xfff1a8, headband:0xfff0a6 };
    var undergroundBossColors = { hair:0x1a1a1a, skin:0xc98c66, skinDark:0x9c623e, torso:0x4f0f16, torsoLight:0x81222d, belt:0x25070a, glove:0xd83b4a, weapon:0xff8f96, legs:0x2a1619, shoes:0x0c0506, bootDetail:0x311416, shoeAccent:0xff7a84, outline:0xffc0c6, headband:0x7d111d };
    var shadowBossColors = { hair:0xd9d7ff, skin:0xa882b8, skinDark:0x7f5e92, torso:0x25143f, torsoLight:0x4b2d78, belt:0x8a5cff, glove:0xd7c8ff, weapon:0xcab8ff, legs:0x1a1230, shoes:0x05030a, bootDetail:0x110a1e, shoeAccent:0x8a5cff, outline:0xe4dcff, headband:0x6d4ad8 };
    var trainerColors = { hair:0x5a3922, skin:0xe0b384, skinDark:0xbd8c64, torso:0x167a5c, torsoLight:0x2aa37f, belt:0x0f3f32, headband:0xf5f0d7, glove:0xe3fff7, legs:0x1b4f42, shoes:0x0b1614, bootDetail:0x15312c, shoeAccent:0x52d8b0, outline:0x0a241f };
    var coachColors = { hair:0xd9d9d9, skin:0xc99567, skinDark:0x9d6c47, torso:0x4d2a91, torsoLight:0x7551c2, belt:0x2b1657, headband:0xffd86b, glove:0xffefba, legs:0x2d2250, shoes:0x0c0815, bootDetail:0x1a1230, shoeAccent:0xcab6ff, outline:0xf0d88d };
    var boxerColors = { hair:0x121212, skin:0xdba67a, skinDark:0xb67b55, torso:0xc92f2f, torsoLight:0xec5656, belt:0x5f1010, glove:0xffffff, legs:0x2a3452, shoes:0x111111, bootDetail:0x252525, shoeAccent:0xccd6ff, outline:0x111111 };
    var karatekaColors = { hair:0x1e1e1e, skin:0xe0ba8c, skinDark:0xb8875e, torso:0xf1f1f1, torsoLight:0xffffff, belt:0x111111, glove:0xdddddd, legs:0xf1f1f1, shoes:0x1b1b1b, bootDetail:0x555555, shoeAccent:0xeeeeee, outline:0x171717, headband:0xe14848 };
    var streetFighterColors = { hair:0x2a130c, skin:0xd49a72, skinDark:0xac734c, torso:0xd96d1f, torsoLight:0xf09a42, belt:0x661818, glove:0xffc34d, legs:0x3d2759, shoes:0x15121a, bootDetail:0x372441, shoeAccent:0xe14848, outline:0x1a140f, headband:0xe14848 };
    var kickboxerColors = { hair:0x101010, skin:0xe2af86, skinDark:0xbb845b, torso:0x1f9d99, torsoLight:0x42c7c0, belt:0x0d4543, glove:0xc8f5ff, legs:0x143d51, shoes:0x081117, bootDetail:0x193140, shoeAccent:0x5de0e8, outline:0x112026 };
    var judokaColors = { hair:0x171717, skin:0xe0b384, skinDark:0xbc8a62, torso:0xf4f4f1, torsoLight:0xffffff, belt:0x4a2c11, glove:0xdfe4ef, legs:0xf0f0ed, shoes:0x121212, bootDetail:0x3d3d3d, shoeAccent:0x8d673f, outline:0x111111 };
    var wrestlerColors = { hair:0x2a1a12, skin:0xcf9a74, skinDark:0xa36b49, torso:0x2954c9, torsoLight:0x4f79ea, belt:0x9a9a9a, glove:0xb7d4ff, legs:0x2343a1, shoes:0x0c0c0c, bootDetail:0x1a1a1a, shoeAccent:0xd9e6ff, outline:0x111111 };
    var groundPounderColors = { hair:0x241912, skin:0xce9870, skinDark:0xa8704b, torso:0x6f4c2a, torsoLight:0x9f7141, belt:0x311b0d, glove:0xe0a35a, legs:0x332418, shoes:0x0c0c0c, bootDetail:0x201810, shoeAccent:0xc98b3c, outline:0x15100b };
    var strikerColors = { hair:0x161616, skin:0xddab82, skinDark:0xb87d57, torso:0xff2f6d, torsoLight:0xff6c98, belt:0x5d1231, glove:0xffd9ea, legs:0x2f2249, shoes:0x0b0812, bootDetail:0x1d1630, shoeAccent:0xffb0d0, outline:0x16121a };
    var bjjColors = { hair:0x101010, skin:0xc9976f, skinDark:0x9f6b48, torso:0x2f2f36, torsoLight:0x565662, belt:0x050505, glove:0xaab0bb, legs:0x25252b, shoes:0x090909, bootDetail:0x1d1d1f, shoeAccent:0x81848c, outline:0x0d0d0f };
    textureDamageSet('player', playerColors, { armShift:1, bodyW:6, hasHeadband:true });
    
    // Generate outfit variant textures for the player
    try {
      this.generateOutfitTextures(self, playerColors);
    } catch (e) {
      console.error('Error generating outfit textures:', e);
    }
    
    textureDamageSet('enemy_thug', thugColors, { armShift:0, bodyW:5, hasWeapon:true });
    textureDamageSet('enemy_brawler', brawlerColors, { armShift:1, bodyW:8, bigFists:true, hasWeapon:true });
    textureDamageSet('enemy_boxer', boxerColors, { armShift:1, bodyW:6, bigFists:true });
    textureDamageSet('enemy_karateka', karatekaColors, { armShift:0, bodyW:6, hasHeadband:true });
    textureDamageSet('enemy_streetfighter', streetFighterColors, { armShift:1, bodyW:7, hasHeadband:true, bigFists:true, hasWeapon:true });
    textureDamageSet('enemy_kickboxer', kickboxerColors, { armShift:1, bodyW:6, hasHeadband:true, bigFists:true });
    textureDamageSet('enemy_judoka', judokaColors, { armShift:0, bodyW:6 });
    textureDamageSet('enemy_wrestler', wrestlerColors, { armShift:1, bodyW:7, bigFists:true });
    textureDamageSet('enemy_groundpounder', groundPounderColors, { armShift:1, bodyW:8, bigFists:true });
    textureDamageSet('enemy_striker', strikerColors, { armShift:1, bodyW:6, bigFists:true });
    textureDamageSet('enemy_bjj', bjjColors, { armShift:0, bodyW:6 });
    textureDamageSet('enemy_thug_elite', eliteColors, { armShift:0, bodyW:5, hasWeapon:true, hasHeadband:true });
    textureDamageSet('enemy_brawler_boss', championBossColors, { armShift:1, bodyW:8, bigFists:true, hasWeapon:true, hasHeadband:true, hasCrown:true, hasCape:true });
    textureDamageSet('enemy_champion_boss', championBossColors, { armShift:1, bodyW:8, bigFists:true, hasWeapon:true, hasHeadband:true, hasCrown:true, hasCape:true });
    textureDamageSet('enemy_underground_king_boss', undergroundBossColors, { armShift:1, bodyW:8, bigFists:true, hasWeapon:true, hasHeadband:true, hasShoulderWrap:true, torsoBob:1 });
    textureDamageSet('enemy_shadow_boss', shadowBossColors, { armShift:1, bodyW:7, bigFists:true, hasWeapon:true, hasHeadband:true, hasShadowVeil:true });
    textureDamageSet('npc_trainer', trainerColors, { armShift:0, bodyW:6, hasHeadband:true });
    textureDamageSet('npc_coach', coachColors, { armShift:-1, bodyW:7, hasHeadband:true, bigFists:true });
    // textureEnemyAnimationSet calls deferred — textures not yet used in gameplay
    // Re-enable when animation system consumes _windup/_hit/_death keys

    textureTattooSet('player', { strike: 0xff6b6b, grapple: 0x5dade2, special: 0xf7dc6f });

    // --- OPTIONAL TEXTURES (portraits, reactions, auras) ---
    // Skipped during makeEssential() for fast mobile boot. Generated lazily via makeOptional().
    if (!MMA.Sprites._skipOptionalTextures) {
    texturePortraitSet('player', playerColors, { accent: window.MMA.Sprites.STYLE_AURA_COLORS.striker });
    texturePortraitSet('enemy_thug', thugColors, { accent: 0xff7a7a });
    texturePortraitSet('enemy_brawler', brawlerColors, { accent: 0xffb14d });
    texturePortraitSet('enemy_boxer', boxerColors, { accent: 0xffffff });
    texturePortraitSet('enemy_karateka', karatekaColors, { accent: 0xe14848 });
    texturePortraitSet('enemy_streetfighter', streetFighterColors, { accent: 0xffc34d });
    texturePortraitSet('enemy_kickboxer', kickboxerColors, { accent: 0x5de0e8 });
    texturePortraitSet('enemy_judoka', judokaColors, { accent: 0x8d673f });
    texturePortraitSet('enemy_wrestler', wrestlerColors, { accent: 0xd9e6ff });
    texturePortraitSet('enemy_groundpounder', groundPounderColors, { accent: 0xe0a35a });
    texturePortraitSet('enemy_striker', strikerColors, { accent: 0xffb0d0 });
    texturePortraitSet('enemy_bjj', bjjColors, { accent: 0xaab0bb });
    texturePortraitSet('enemy_thug_elite', eliteColors, { accent: 0xbca6ff });
    texturePortraitSet('enemy_brawler_boss', championBossColors, { accent: 0xffd54f });
    texturePortraitSet('enemy_champion_boss', championBossColors, { accent: 0xffd54f });
    texturePortraitSet('enemy_underground_king_boss', undergroundBossColors, { accent: 0xd83b4a });
    texturePortraitSet('enemy_shadow_boss', shadowBossColors, { accent: 0x8a5cff });
    texturePortraitSet('npc_trainer', trainerColors, { accent: 0x52d8b0 });
    texturePortraitSet('npc_coach', coachColors, { accent: 0xffd86b });
    textureReactionFaceSet('player', playerColors);
    textureReactionFaceSet('enemy_thug', thugColors);
    textureReactionFaceSet('enemy_brawler', brawlerColors);
    textureReactionFaceSet('enemy_boxer', boxerColors);
    textureReactionFaceSet('enemy_karateka', karatekaColors);
    textureReactionFaceSet('enemy_streetfighter', streetFighterColors);
    textureReactionFaceSet('enemy_kickboxer', kickboxerColors);
    textureReactionFaceSet('enemy_judoka', judokaColors);
    textureReactionFaceSet('enemy_wrestler', wrestlerColors);
    textureReactionFaceSet('enemy_groundpounder', groundPounderColors);
    textureReactionFaceSet('enemy_striker', strikerColors);
    textureReactionFaceSet('enemy_bjj', bjjColors);
    textureReactionFaceSet('enemy_thug_elite', eliteColors);
    textureReactionFaceSet('enemy_brawler_boss', championBossColors);
    textureReactionFaceSet('enemy_champion_boss', championBossColors);
    textureReactionFaceSet('enemy_underground_king_boss', undergroundBossColors);
    textureReactionFaceSet('enemy_shadow_boss', shadowBossColors);
    textureReactionFaceSet('npc_trainer', trainerColors);
    textureReactionFaceSet('npc_coach', coachColors);
    textureSilhouette('player', 'player_silhouette', playerColors, { pose: 'special', accent: window.MMA.Sprites.STYLE_AURA_COLORS.striker, tint: 0x180c2d });
    textureSilhouette('enemy_thug', 'enemy_thug_silhouette', thugColors, { pose: 'stance', accent: 0xff7a7a, tint: 0x1f0c0c });
    textureSilhouette('enemy_brawler', 'enemy_brawler_silhouette', brawlerColors, { pose: 'grapple', accent: 0xffb14d, tint: 0x271505 });
    textureSilhouette('enemy_boxer', 'enemy_boxer_silhouette', boxerColors, { pose: 'stance', accent: 0xffffff, tint: 0x1a0a0a });
    textureSilhouette('enemy_karateka', 'enemy_karateka_silhouette', karatekaColors, { pose: 'special', accent: 0xe14848, tint: 0x161616 });
    textureSilhouette('enemy_streetfighter', 'enemy_streetfighter_silhouette', streetFighterColors, { pose: 'special', accent: 0xffc34d, tint: 0x241106 });
    textureSilhouette('enemy_kickboxer', 'enemy_kickboxer_silhouette', kickboxerColors, { pose: 'special', accent: 0x5de0e8, tint: 0x0a1820 });
    textureSilhouette('enemy_judoka', 'enemy_judoka_silhouette', judokaColors, { pose: 'grapple', accent: 0x8d673f, tint: 0x131313 });
    textureSilhouette('enemy_wrestler', 'enemy_wrestler_silhouette', wrestlerColors, { pose: 'grapple', accent: 0xd9e6ff, tint: 0x0d1531 });
    textureSilhouette('enemy_groundpounder', 'enemy_groundpounder_silhouette', groundPounderColors, { pose: 'grapple', accent: 0xe0a35a, tint: 0x1b1209 });
    textureSilhouette('enemy_striker', 'enemy_striker_silhouette', strikerColors, { pose: 'special', accent: 0xffb0d0, tint: 0x170b17 });
    textureSilhouette('enemy_bjj', 'enemy_bjj_silhouette', bjjColors, { pose: 'grapple', accent: 0xaab0bb, tint: 0x111214 });
    textureSilhouette('enemy_thug_elite', 'enemy_thug_elite_silhouette', eliteColors, { pose: 'stance', accent: 0xbca6ff, tint: 0x140d23 });
    textureSilhouette('enemy_brawler_boss', 'enemy_brawler_boss_silhouette', championBossColors, { pose: 'special', accent: 0xffd54f, tint: 0x241a06 });
    textureSilhouette('enemy_champion_boss', 'enemy_champion_boss_silhouette', championBossColors, { pose: 'special', accent: 0xffd54f, tint: 0x241a06 });
    textureSilhouette('enemy_underground_king_boss', 'enemy_underground_king_boss_silhouette', undergroundBossColors, { pose: 'grapple', accent: 0xd83b4a, tint: 0x2a080d });
    textureSilhouette('enemy_shadow_boss', 'enemy_shadow_boss_silhouette', shadowBossColors, { pose: 'special', accent: 0x8a5cff, tint: 0x12091f });
    textureSilhouette('npc_trainer', 'npc_trainer_silhouette', trainerColors, { pose: 'stance', accent: 0x52d8b0, tint: 0x071814 });
    textureSilhouette('npc_coach', 'npc_coach_silhouette', coachColors, { pose: 'grapple', accent: 0xffd86b, tint: 0x180d28 });
    window.MMA.Sprites.VISUAL_VARIANTS = {
      mmaChamp: 'enemy_champion_boss',
      boss: 'enemy_champion_boss',
      champion: 'enemy_champion_boss',
      championBoss: 'enemy_champion_boss',
      titleBoss: 'enemy_champion_boss',
      undergroundKing: 'enemy_underground_king_boss',
      underground_boss: 'enemy_underground_king_boss',
      cageBoss: 'enemy_underground_king_boss',
      rival: 'enemy_shadow_boss',
      shadow: 'enemy_shadow_boss',
      shadowBoss: 'enemy_shadow_boss',
      shadowRival: 'enemy_shadow_boss',
      elite: 'enemy_thug_elite',
      boxer: 'enemy_boxer',
      karateka: 'enemy_karateka',
      streetFighter: 'enemy_streetfighter',
      kickboxer: 'enemy_kickboxer',
      judoka: 'enemy_judoka',
      wrestler: 'enemy_wrestler',
      groundNPounder: 'enemy_groundpounder',
      striker: 'enemy_striker',
      bjjBlackBelt: 'enemy_bjj',
      muayThaiFighter: 'enemy_kickboxer',
      trainer: 'npc_trainer',
      coach: 'npc_coach',
      sparringPartner: 'npc_trainer',
      gymNpc: 'npc_trainer'
    };
    textureDecorationBarrel('decoration_barrel');
    textureDecorationTrash('decoration_trash');
    textureDecorationGraffiti('decoration_graffiti');
    textureDecorationHeavyBag('decoration_heavybag');
    textureDecorationSpeedBag('decoration_speedbag');
    textureDecorationWeights('decoration_weights');
    textureDecorationMirror('decoration_mirror');
    textureDecorationBoxingRing('decoration_boxingring');
    textureDecorationOctagon('decoration_octagon');
    textureDecorationCorner('decoration_corner');
    textureDecorationTunnel('decoration_tunnel');
    textureDecorationCrowd('decoration_crowd');
    window.MMA.Sprites.registerEnemyVariant('streetThug', 'enemy_thug');
    window.MMA.Sprites.registerEnemyVariant('barBrawler', 'enemy_brawler');
    window.MMA.Sprites.registerEnemyVariant('muayThaiFighter', 'enemy_kickboxer');
    window.MMA.Sprites.registerEnemyVariant('wrestler', 'enemy_wrestler');
    window.MMA.Sprites.registerEnemyVariant('judoka', 'enemy_judoka');
    window.MMA.Sprites.registerEnemyVariant('groundNPounder', 'enemy_groundpounder');
    window.MMA.Sprites.registerEnemyVariant('bjjBlackBelt', 'enemy_bjj');
    window.MMA.Sprites.registerEnemyVariant('kickboxer', 'enemy_kickboxer');
    window.MMA.Sprites.registerEnemyVariant('striker', 'enemy_striker');
    window.MMA.Sprites.registerEnemyVariant('boxer', 'enemy_boxer');
    window.MMA.Sprites.registerEnemyVariant('karateka', 'enemy_karateka');
    window.MMA.Sprites.registerEnemyVariant('streetFighter', 'enemy_streetfighter');
    window.MMA.Sprites.registerEnemyVariant('coach', 'npc_coach');
    window.MMA.Sprites.registerEnemyVariant('shadowRival', 'enemy_shadow_boss');
    window.MMA.Sprites.registerEnemyVariant('mmaChamp', 'enemy_brawler_boss');
    window.MMA.Sprites.DECORATIONS = {
      zone1: {
        barrel: { texture: 'decoration_barrel', size: { w: 0.95, h: 0.95 } },
        trashCan: { texture: 'decoration_trash', size: { w: 0.95, h: 0.95 } },
        crates: { texture: 'crateProp', size: { w: 1.1, h: 1.1 } },
        streetLamp: { texture: 'lampProp', size: { w: 1.0, h: 1.0 }, kind: 'pulse', alpha: 0.9 },
        graffiti: { texture: 'decoration_graffiti', size: { w: 1.8, h: 0.9 }, alpha: 0.86 }
      },
      zone2: {
        heavyBag: { texture: 'decoration_heavybag', size: { w: 0.95, h: 1.25 }, kind: 'sway' },
        speedBag: { texture: 'decoration_speedbag', size: { w: 0.8, h: 0.9 }, kind: 'sway' },
        weightRack: { texture: 'decoration_weights', size: { w: 1.2, h: 1.0 } },
        mirror: { texture: 'decoration_mirror', size: { w: 1.0, h: 1.25 }, alpha: 0.9 },
        boxingRing: { texture: 'decoration_boxingring', size: { w: 2.7, h: 1.7 }, alpha: 0.88 }
      },
      zone3: {
        octagon: { texture: 'decoration_octagon', size: { w: 2.7, h: 2.2 }, alpha: 0.92 },
        cornerPost: { texture: 'decoration_corner', size: { w: 0.8, h: 1.0 } },
        entranceTunnel: { texture: 'decoration_tunnel', size: { w: 2.6, h: 1.6 }, alpha: 0.9 },
        crowdSilhouette: { texture: 'decoration_crowd', size: { w: 2.5, h: 1.2 }, kind: 'pulse', alpha: 0.72 }
      }
    };
    textureAura('aura_striker', window.MMA.Sprites.STYLE_AURA_COLORS.striker, 0.16, 'core');
    textureAura('aura_striker_ring', window.MMA.Sprites.STYLE_AURA_COLORS.striker, 0.22, 'ring');
    textureAura('aura_striker_flare', window.MMA.Sprites.STYLE_AURA_COLORS.striker, 0.2, 'flare');
    textureAura('aura_grappler', window.MMA.Sprites.STYLE_AURA_COLORS.grappler, 0.16, 'core');
    textureAura('aura_grappler_ring', window.MMA.Sprites.STYLE_AURA_COLORS.grappler, 0.22, 'ring');
    textureAura('aura_grappler_flare', window.MMA.Sprites.STYLE_AURA_COLORS.grappler, 0.2, 'flare');
    textureAura('aura_balanced', window.MMA.Sprites.STYLE_AURA_COLORS.balanced, 0.14, 'core');
    textureAura('aura_balanced_ring', window.MMA.Sprites.STYLE_AURA_COLORS.balanced, 0.2, 'ring');
    textureAura('aura_balanced_flare', window.MMA.Sprites.STYLE_AURA_COLORS.balanced, 0.18, 'flare');
    var lastChanceCfg = window.MMA.Sprites.LAST_CHANCE_CONFIG || {};
    textureAura('last_chance_pulse', lastChanceCfg.tint || 0xff3b30, lastChanceCfg.alpha || 0.24, 'core');
    textureAura('last_chance_pulse_ring', lastChanceCfg.glow || 0xffb0aa, lastChanceCfg.ringAlpha || 0.18, 'ring');
    textureAura('last_chance_pulse_flare', lastChanceCfg.tint || 0xff3b30, lastChanceCfg.flareAlpha || 0.14, 'flare');
    window.MMA.Sprites.LAST_CHANCE_TEXTURES = {
      core: 'last_chance_pulse',
      ring: 'last_chance_pulse_ring',
      flare: 'last_chance_pulse_flare'
    };
    Object.keys(window.MMA.Sprites.BOSS_AURA_CONFIGS).forEach(function(auraKey) {
      var cfg = window.MMA.Sprites.BOSS_AURA_CONFIGS[auraKey];
      textureAura('boss_aura_' + cfg.key, cfg.color, cfg.alpha || 0.22, 'core');
      textureAura('boss_aura_' + cfg.key + '_ring', cfg.glow || cfg.color, cfg.ringAlpha || 0.2, 'ring');
      textureAura('boss_aura_' + cfg.key + '_flare', cfg.color, cfg.flareAlpha || 0.18, 'flare');
    });
    window.MMA.Sprites.AURA_TEXTURES = {
      striker: 'aura_striker',
      grappler: 'aura_grappler',
      balanced: 'aura_balanced'
    };
    window.MMA.Sprites.AURA_LAYER_TEXTURES = {
      striker: { core: 'aura_striker', ring: 'aura_striker_ring', flare: 'aura_striker_flare' },
      grappler: { core: 'aura_grappler', ring: 'aura_grappler_ring', flare: 'aura_grappler_flare' },
      balanced: { core: 'aura_balanced', ring: 'aura_balanced_ring', flare: 'aura_balanced_flare' }
    };
    var resonanceCfg = window.MMA.Sprites.RESONANCE_CONFIG || {};
    var resonanceColors = resonanceCfg.colors || {};
    textureResonance('resonance_striker', resonanceColors.striker || 0xff5a5a, resonanceCfg.alpha || 0.2, 'core');
    textureResonance('resonance_striker_ring', resonanceColors.striker || 0xff5a5a, resonanceCfg.ringAlpha || 0.14, 'ring');
    textureResonance('resonance_striker_flare', resonanceColors.striker || 0xff5a5a, resonanceCfg.flareAlpha || 0.12, 'flare');
    textureResonance('resonance_grappler', resonanceColors.grappler || 0x5aa8ff, resonanceCfg.alpha || 0.2, 'core');
    textureResonance('resonance_grappler_ring', resonanceColors.grappler || 0x5aa8ff, resonanceCfg.ringAlpha || 0.14, 'ring');
    textureResonance('resonance_grappler_flare', resonanceColors.grappler || 0x5aa8ff, resonanceCfg.flareAlpha || 0.12, 'flare');
    textureResonance('resonance_hybrid', resonanceColors.hybrid || 0xb678ff, resonanceCfg.alpha || 0.2, 'core');
    textureResonance('resonance_hybrid_ring', resonanceColors.hybrid || 0xb678ff, resonanceCfg.ringAlpha || 0.14, 'ring');
    textureResonance('resonance_hybrid_flare', resonanceColors.hybrid || 0xb678ff, resonanceCfg.flareAlpha || 0.12, 'flare');
    textureResonance('resonance_signature', resonanceColors.signature || 0xffd166, resonanceCfg.alpha || 0.22, 'core');
    textureResonance('resonance_signature_ring', resonanceColors.signature || 0xffd166, resonanceCfg.ringAlpha || 0.16, 'ring');
    textureResonance('resonance_signature_flare', resonanceColors.signature || 0xffd166, resonanceCfg.flareAlpha || 0.14, 'flare');
    window.MMA.Sprites.RESONANCE_TEXTURES = {
      striker: { core: 'resonance_striker', ring: 'resonance_striker_ring', flare: 'resonance_striker_flare' },
      grappler: { core: 'resonance_grappler', ring: 'resonance_grappler_ring', flare: 'resonance_grappler_flare' },
      hybrid: { core: 'resonance_hybrid', ring: 'resonance_hybrid_ring', flare: 'resonance_hybrid_flare' },
      signature: { core: 'resonance_signature', ring: 'resonance_signature_ring', flare: 'resonance_signature_flare' },
      default: { core: 'resonance_hybrid', ring: 'resonance_hybrid_ring', flare: 'resonance_hybrid_flare' }
    };
    } // end optional textures block
    texturePickup('item_pickup');
    texturePickup('pickup_health');
    textureSweatParticle('impact_sweat', { fill: 0x9fd4ff, highlight: 0xffffff, alpha: 0.92 });
    textureSweatParticle('impact_sweat_heavy', { fill: 0xbfe6ff, highlight: 0xffffff, alpha: 0.98 });
    textureFireTrailParticle('combo_fire_trail', { outer: 0xff6a26, core: 0xfff1a3, alpha: 0.92 });
    textureFireTrailParticle('combo_fire_trail_hot', { outer: 0xff2a2a, core: 0xffd36e, alpha: 1 });
    textureFootworkDust('footwork_dust_soft', { color: 0xd7d0c1, highlight: 0xf7efdb, alpha: 0.76 });
    textureFootworkDust('footwork_dust_heavy', { color: 0xc9c0ae, highlight: 0xfff6e3, alpha: 0.94 });
    textureFootprint('footwork_print_left', { color: 0xbab2a4, alpha: 0.36 });
    textureFootprint('footwork_print_right', { color: 0xbab2a4, alpha: 0.36 });
    textureBreathPuff('exertion_breath_heavy', { color: 0xe7f8ff, alpha: 0.88 });
    textureBreathPuff('exertion_breath_recovery', { color: 0xa8f0ff, alpha: 0.8 });
    textureStumbleSpark('exertion_stumble', { color: 0xffd3a6, alpha: 0.96 });
    var attackReadCfg = window.MMA.Sprites.ATTACK_READ_CONFIG || {};
    var attackReadColors = attackReadCfg.colors || {};
    textureAttackReadHalo('attack_read_jab', { color: attackReadColors.jab || 0xffe066, alpha: attackReadCfg.alpha || 0.76 });
    textureAttackReadHalo('attack_read_cross', { color: attackReadColors.cross || 0xff9f1c, alpha: attackReadCfg.alpha || 0.76 });
    textureAttackReadHalo('attack_read_hook', { color: attackReadColors.hook || 0xff5a36, alpha: attackReadCfg.alpha || 0.76 });
    textureAttackReadHalo('attack_read_haymaker', { color: attackReadColors.haymaker || 0xff3b30, alpha: attackReadCfg.alpha || 0.76 });
    textureAttackReadHalo('attack_read_grapple', { color: attackReadColors.grapple || 0x4d88ff, alpha: attackReadCfg.alpha || 0.76 });
    textureAttackReadHalo('attack_read_default', { color: attackReadColors.default || 0xd7c8ff, alpha: attackReadCfg.alpha || 0.76 });
    window.MMA.Sprites.IMPACT_PARTICLE_TEXTURES = {
      sweat: 'impact_sweat',
      heavySweat: 'impact_sweat_heavy'
    };
    window.MMA.Sprites.FIRE_TRAIL_TEXTURES = {
      combo: 'combo_fire_trail',
      hot: 'combo_fire_trail_hot'
    };
    window.MMA.Sprites.FOOTWORK_TEXTURES = {
      dust: 'footwork_dust_soft',
      heavyDust: 'footwork_dust_heavy',
      leftPrint: 'footwork_print_left',
      rightPrint: 'footwork_print_right'
    };
    window.MMA.Sprites.EXERTION_TEXTURES = {
      heavyBreath: 'exertion_breath_heavy',
      recoveryBreath: 'exertion_breath_recovery',
      stumble: 'exertion_stumble'
    };
    window.MMA.Sprites.ATTACK_READ_TEXTURES = {
      jab: 'attack_read_jab',
      cross: 'attack_read_cross',
      hook: 'attack_read_hook',
      haymaker: 'attack_read_haymaker',
      grapple: 'attack_read_grapple',
      default: 'attack_read_default'
    };
    textureHitbox('hitbox');
  },
  
  // Fast boot: generate only gameplay-essential textures (env, characters, particles).
  // Portraits, reaction faces, auras, resonance skipped — call makeOptional() later.
  makeEssential: function(scene) {
    MMA.Sprites._skipOptionalTextures = true;
    try { this.makeAll(scene); } finally { MMA.Sprites._skipOptionalTextures = false; }
    this._essentialScene = scene;
  },
  // Generate the optional textures skipped by makeEssential(). Call after game starts.
  makeOptional: function(scene) {
    if (MMA.Sprites._optionalDone) return;
    MMA.Sprites._optionalDone = true;
    MMA.Sprites._skipOptionalTextures = false;
    // Re-run makeAll with optional flag cleared — only the guarded block will actually
    // re-generate textures that don't already exist in the texture manager.
    // We do this by temporarily wrapping generateTexture to skip existing keys.
    var mgr = scene && scene.textures;
    if (!mgr) return;
    var orig = scene.make && scene.make.graphics ? scene.make.graphics.bind(scene.make) : null;
    if (!orig) return;
    // Monkey-patch: skip generateTexture if key already exists
    var _origGenTex = Phaser.GameObjects.Graphics.prototype.generateTexture;
    Phaser.GameObjects.Graphics.prototype.generateTexture = function(key, w, h) {
      if (!mgr.exists(key)) { _origGenTex.call(this, key, w, h); }
      return this;
    };
    try { this.makeAll(scene); } finally {
      Phaser.GameObjects.Graphics.prototype.generateTexture = _origGenTex;
    }
  },

  // Generate player outfit variant textures
  generateOutfitTextures: function(self, baseColors) {
    var outfitConfigs = {
      streetClothes: { torso: 0x2255aa, torsoLight: 0x4466cc },
      bjjGi: { torso: 0xffffff, torsoLight: 0xeeeeee, belt: 0x000000, hasGiCollar: true },
      boxingTrunks: { torso: 0xff4444, torsoLight: 0xff6666, legs: 0xff4444 },
      muayThaiShorts: { torso: 0x4400ff, torsoLight: 0x6600ff, legs: 0x4400ff },
      streetFighter: { torso: 0xff8800, torsoLight: 0xffaa33, belt: 0xff0000, hasHeadband: true },
      mkNinja: { torso: 0x222222, torsoLight: 0x444444, legs: 0x111111, glove: 0x8800ff, hasMask: true },
      wrestlingSinglet: { torso: 0x0033aa, torsoLight: 0x0044cc, legs: 0x0033aa },
      championsRobe: { torso: 0xffd700, torsoLight: 0xffee66, belt: 0xffd700, legs: 0xaa8800, hasRobe: true }
    };

    var outfitDamageKeys = {};
    var idleRegistry = window.MMA.Sprites.IDLE_TEXTURES || {};

    function darkenColor(color, amount) {
      var r = Math.max(0, ((color >> 16) & 0xff) - amount);
      var g = Math.max(0, ((color >> 8) & 0xff) - amount);
      var b = Math.max(0, (color & 0xff) - amount);
      return (r << 16) | (g << 8) | b;
    }

    function buildIdleFrames(baseOpts) {
      var armShift = typeof baseOpts.armShift === 'number' ? baseOpts.armShift : 1;
      return [
        { suffix: '', opts: {} },
        { suffix: '_idle_1', opts: { armShift: armShift - 1, torsoBob: -1, leftLegLift: 1, gloveBob: -1 } },
        { suffix: '_idle_2', opts: { armShift: armShift + 1, torsoBob: 0, rightLegLift: 1, gloveBob: 1 } },
        { suffix: '_idle_3', opts: { armShift: armShift, torsoBob: 1, leftLegLift: 0, rightLegLift: 0, gloveBob: 0 } }
      ];
    }

    function generateOutfitTexture(key, colors, opts) {
      opts = opts || {};
      var g = self.make.graphics({ x: 0, y: 0, add: false });
      var s = 3;
      var armShift = typeof opts.armShift === 'number' ? opts.armShift : 1;
      var bodyW = opts.bodyW || 6;
      var bodyX = Math.floor((16 - bodyW) / 2);
      var torsoBob = typeof opts.torsoBob === 'number' ? opts.torsoBob : 0;
      var leftArmDrop = typeof opts.leftArmDrop === 'number' ? opts.leftArmDrop : 0;
      var rightArmDrop = typeof opts.rightArmDrop === 'number' ? opts.rightArmDrop : 0;
      var headTilt = typeof opts.headTilt === 'number' ? opts.headTilt : 0;
      var bodyLean = typeof opts.bodyLean === 'number' ? opts.bodyLean : 0;
      var leftLegLift = typeof opts.leftLegLift === 'number' ? opts.leftLegLift : 0;
      var rightLegLift = typeof opts.rightLegLift === 'number' ? opts.rightLegLift : 0;
      var gloveBob = typeof opts.gloveBob === 'number' ? opts.gloveBob : 0;
      var damageLevel = typeof opts.damageLevel === 'number' ? opts.damageLevel : 0;
      var hasHeadband = !!opts.hasHeadband;
      var hasMask = !!opts.hasMask;
      var hasGiCollar = !!opts.hasGiCollar;
      var hasRobe = !!opts.hasRobe;

      function px(x, y, w, h, color) {
        g.fillStyle(color, 1);
        g.fillRect(x * s, y * s, w * s, h * s);
      }

      px(5 + headTilt, 1 + torsoBob, 6, 5, colors.skin);
      px(4 + headTilt, 0 + torsoBob, 8, 2, colors.hair);
      px(4 + headTilt, 2 + torsoBob, 1, 2, colors.hair);
      px(11 + headTilt, 2 + torsoBob, 1, 2, colors.hair);
      px(6 + headTilt, 5 + torsoBob, 4, 1, colors.skinDark);

      if (hasMask) {
        px(5 + headTilt, 3 + torsoBob, 6, 2, 0x111111);
        px(5 + headTilt, 2 + torsoBob, 2, 1, 0x8800ff);
        px(9 + headTilt, 2 + torsoBob, 2, 1, 0x8800ff);
      }

      if (hasHeadband) {
        px(4 + headTilt, 1 + torsoBob, 8, 1, colors.headband || 0xd92b2b);
        px(4 + headTilt, 2 + torsoBob, 1, 1, colors.headband || 0xd92b2b);
        px(11 + headTilt, 2 + torsoBob, 1, 1, colors.headband || 0xd92b2b);
      }

      if (hasGiCollar) {
        px(5 + headTilt, 5 + torsoBob, 6, 1, 0xcccccc);
        px(bodyX + bodyLean, 7 + torsoBob, bodyW, 1, 0xdddddd);
      }

      px(bodyX + bodyLean, 7 + torsoBob, bodyW, 8, colors.torso);
      px(bodyX + 1 + bodyLean, 8 + torsoBob, bodyW - 2, 1, colors.torsoLight);

      if (hasRobe) {
        px(bodyX - 1 + bodyLean, 7 + torsoBob, 1, 8, colors.torsoLight);
        px(bodyX + bodyW + bodyLean, 7 + torsoBob, 1, 8, colors.torsoLight);
      }

      px(7 + bodyLean, 11 + torsoBob, 2, 4, colors.belt);
      px(bodyX + bodyLean, 15 + torsoBob, bodyW, 1, colors.belt);

      px(bodyX - 2 + armShift + bodyLean, 8 + torsoBob + leftArmDrop, 2, 5 - Math.min(leftArmDrop, 2), colors.skin);
      px(bodyX + bodyW + armShift + bodyLean, 8 + torsoBob + rightArmDrop, 2, 5 - Math.min(rightArmDrop, 2), colors.skin);

      var fistSize = 2;
      var fistY = 9 + torsoBob + gloveBob;
      px(bodyX - 1 + armShift + bodyLean, fistY + leftArmDrop, fistSize, fistSize, colors.glove);
      px(bodyX + bodyW - 1 + armShift + bodyLean, fistY + rightArmDrop, fistSize, fistSize, colors.glove);

      px(bodyX + 1 + bodyLean, 16 + leftLegLift, 2, 6 - leftLegLift, colors.legs);
      px(bodyX + bodyW - 3 + bodyLean, 16 + rightLegLift, 2, 6 - rightLegLift, colors.legs);
      px(bodyX + 1 + bodyLean, 21, 2, 1, colors.bootDetail);
      px(bodyX + bodyW - 3 + bodyLean, 21, 2, 1, colors.bootDetail);
      px(bodyX + 1 + bodyLean, 22, 2, 2, colors.shoes);
      px(bodyX + bodyW - 3 + bodyLean, 22, 2, 2, colors.shoes);
      px(bodyX + 1 + bodyLean, 23, 2, 1, colors.shoeAccent);
      px(bodyX + bodyW - 3 + bodyLean, 23, 2, 1, colors.shoeAccent);

      if (damageLevel >= 1) {
        px(4 + headTilt, 4 + torsoBob, 1, 1, 0x6a2d7c);
        px(11 + headTilt, 5 + torsoBob, 1, 1, 0x6a2d7c);
        px(bodyX - 1 + armShift + bodyLean, 13 + torsoBob + leftArmDrop, 2, 1, 0x6a2d7c);
        px(bodyX + bodyW - 1 + armShift + bodyLean, 13 + torsoBob + rightArmDrop, 2, 1, 0x6a2d7c);
        px(bodyX + 1 + bodyLean, 10 + torsoBob, Math.max(2, bodyW - 2), 1, 0x5e364f);
      }
      if (damageLevel >= 2) {
        px(7 + headTilt, 4 + torsoBob, 1, 2, 0x9b1c1c);
        px(8 + headTilt, 5 + torsoBob, 2, 1, 0x9b1c1c);
        px(bodyX + 2 + bodyLean, 12 + torsoBob, Math.max(2, bodyW - 4), 1, 0x9b1c1c);
        px(bodyX + 1 + bodyLean, 19, 2, 1, 0x9b1c1c);
        px(bodyX + bodyW - 3 + bodyLean, 19, 2, 1, 0x9b1c1c);
      }

      px(bodyX - 2 + bodyLean, 7 + torsoBob + leftArmDrop, 1, 9 - Math.min(leftArmDrop, 2), colors.outline);
      px(bodyX + bodyW + 2 + bodyLean, 7 + torsoBob + rightArmDrop, 1, 9 - Math.min(rightArmDrop, 2), colors.outline);
      px(5 + headTilt, 1 + torsoBob, 1, 6, colors.outline);
      px(10 + headTilt, 1 + torsoBob, 1, 6, colors.outline);

      g.generateTexture(key, 48, 72);
      g.destroy();
      return key;
    }

    function registerIdleSet(baseKey, colors, baseOpts) {
      var frames = buildIdleFrames(baseOpts || {});
      var keys = [];
      for (var i = 0; i < frames.length; i++) {
        var frameKey = i === 0 ? baseKey : (baseKey + frames[i].suffix);
        generateOutfitTexture(frameKey, colors, Object.assign({}, baseOpts, frames[i].opts));
        keys.push(frameKey);
      }
      idleRegistry[baseKey] = keys;
      return keys[0];
    }

    Object.keys(outfitConfigs).forEach(function(outfitKey) {
      var config = outfitConfigs[outfitKey];
      var colors = Object.assign({}, baseColors, config);
      var baseKey = 'player_' + outfitKey;
      var sharedOpts = {
        armShift: 1,
        bodyW: 6,
        hasHeadband: config.hasHeadband,
        hasMask: config.hasMask,
        hasGiCollar: config.hasGiCollar,
        hasRobe: config.hasRobe
      };

      registerIdleSet(baseKey, colors, Object.assign({}, sharedOpts, { damageLevel: 0 }));
      registerIdleSet(baseKey + '_hurt_1', Object.assign({}, colors, {
        torso: darkenColor(colors.torso, 26),
        torsoLight: darkenColor(colors.torsoLight, 18)
      }), Object.assign({}, sharedOpts, {
        damageLevel: 1,
        bodyLean: -1,
        leftArmDrop: 1,
        rightLegLift: 2,
        headTilt: -1
      }));
      registerIdleSet(baseKey + '_hurt_2', Object.assign({}, colors, {
        torso: darkenColor(colors.torso, 42),
        torsoLight: darkenColor(colors.torsoLight, 30)
      }), Object.assign({}, sharedOpts, {
        damageLevel: 2,
        armShift: 0,
        bodyLean: -2,
        leftArmDrop: 2,
        rightArmDrop: 1,
        rightLegLift: 3,
        torsoBob: 1,
        headTilt: -1
      }));

      outfitDamageKeys[outfitKey] = {
        healthy: baseKey,
        bruised: baseKey + '_hurt_1',
        bloodied: baseKey + '_hurt_2'
      };
    });

    window.MMA.Sprites.IDLE_TEXTURES = idleRegistry;
    window.MMA.Sprites.OUTFIT_TEXTURES = outfitDamageKeys;
    try {
      this.generateEquipmentTextures(self, baseColors, outfitDamageKeys);
    } catch (e) {
      console.error('Error generating equipment textures:', e);
    }
  },

  generateEquipmentTextures: function(self, baseColors, outfitDamageKeys) {
    var gearConfigs = {
      baseline: null,
      speed_wraps: { glove: 0x7dd3fc, headband: 0x9be7ff, accent: 0xdff7ff },
      fighters_gloves: { glove: 0xff4d4d, headband: 0xffb347, accent: 0xffddb3 },
      champions_belt: { glove: 0xffd54f, belt: 0xffd54f, headband: 0xfff0a6, accent: 0xfff4c2 }
    };
    var equipmentTextures = {};
    var idleRegistry = this.IDLE_TEXTURES || {};

    function tintColor(color, delta) {
      var r = (color >> 16) & 0xff;
      var g = (color >> 8) & 0xff;
      var b = color & 0xff;
      r = Phaser.Math.Clamp(r + delta, 0, 255);
      g = Phaser.Math.Clamp(g + delta, 0, 255);
      b = Phaser.Math.Clamp(b + delta, 0, 255);
      return Phaser.Display.Color.GetColor(r, g, b);
    }

    function buildIdleFrames(baseOpts) {
      var armShift = typeof baseOpts.armShift === 'number' ? baseOpts.armShift : 1;
      return [
        { suffix: '', opts: {} },
        { suffix: '_idle_1', opts: { armShift: armShift - 1, torsoBob: -1, leftLegLift: 1, gloveBob: -1 } },
        { suffix: '_idle_2', opts: { armShift: armShift + 1, torsoBob: 0, rightLegLift: 1, gloveBob: 1 } },
        { suffix: '_idle_3', opts: { armShift: armShift, torsoBob: 1, leftLegLift: 0, rightLegLift: 0, gloveBob: 0 } }
      ];
    }

    Object.keys(outfitDamageKeys || {}).forEach(function(outfitKey) {
      equipmentTextures[outfitKey] = {};
      var baseSet = outfitDamageKeys[outfitKey];
      Object.keys(gearConfigs).forEach(function(gearKey) {
        if (!gearConfigs[gearKey]) {
          equipmentTextures[outfitKey][gearKey] = baseSet;
          return;
        }

        var gear = gearConfigs[gearKey];
        var colors = Object.assign({}, baseColors, {
          glove: gear.glove || baseColors.glove,
          headband: gear.headband || baseColors.headband,
          belt: gear.belt || baseColors.belt,
          torsoLight: tintColor(baseColors.torsoLight, gearKey === 'champions_belt' ? 22 : 8),
          shoeAccent: gear.accent || baseColors.shoeAccent
        });
        var opts = {
          armShift: 1,
          bodyW: 6,
          hasHeadband: true,
          equipmentAccent: gear.accent || gear.glove || gear.belt || 0xffffff,
          equipmentType: gearKey
        };
        function registerIdleSet(baseKey, stateOpts) {
          var frames = buildIdleFrames(stateOpts || {});
          var keys = [];
          for (var i = 0; i < frames.length; i++) {
            var frameKey = i === 0 ? baseKey : (baseKey + frames[i].suffix);
            this.generateEquipmentVariantTexture(self, frameKey, colors, Object.assign({}, stateOpts, frames[i].opts));
            keys.push(frameKey);
          }
          idleRegistry[baseKey] = keys;
          return baseKey;
        }
        var prefix = 'player_' + outfitKey + '_' + gearKey;
        equipmentTextures[outfitKey][gearKey] = {
          healthy: registerIdleSet.call(this, prefix, Object.assign({}, opts, { damageLevel: 0 })),
          bruised: registerIdleSet.call(this, prefix + '_hurt_1', Object.assign({}, opts, { damageLevel: 1, bodyLean: -1, leftArmDrop: 1, rightLegLift: 2, headTilt: -1 })),
          bloodied: registerIdleSet.call(this, prefix + '_hurt_2', Object.assign({}, opts, { damageLevel: 2, bodyLean: -2, leftArmDrop: 2, rightArmDrop: 1, rightLegLift: 3, torsoBob: 1, headTilt: -1 }))
        };
      }, this);
    }, this);

    this.IDLE_TEXTURES = idleRegistry;
    this.EQUIPMENT_TEXTURES = equipmentTextures;
  },

  generateEquipmentVariantTexture: function(self, key, colors, opts) {
    var g = self.make.graphics({ x:0, y:0, add:false });
    var s = 3;
    var armShift = (opts && typeof opts.armShift === 'number') ? opts.armShift : 1;
    var bodyW = (opts && opts.bodyW) ? opts.bodyW : 6;
    var bodyX = Math.floor((16 - bodyW) / 2);
    var torsoBob = (opts && typeof opts.torsoBob === 'number') ? opts.torsoBob : 0;
    var leftLegLift = (opts && typeof opts.leftLegLift === 'number') ? opts.leftLegLift : 0;
    var rightLegLift = (opts && typeof opts.rightLegLift === 'number') ? opts.rightLegLift : 0;
    var gloveBob = (opts && typeof opts.gloveBob === 'number') ? opts.gloveBob : 0;
    var damageLevel = (opts && typeof opts.damageLevel === 'number') ? opts.damageLevel : 0;
    var bodyLean = (opts && typeof opts.bodyLean === 'number') ? opts.bodyLean : 0;
    var leftArmDrop = (opts && typeof opts.leftArmDrop === 'number') ? opts.leftArmDrop : 0;
    var rightArmDrop = (opts && typeof opts.rightArmDrop === 'number') ? opts.rightArmDrop : 0;
    var headTilt = (opts && typeof opts.headTilt === 'number') ? opts.headTilt : 0;
    var accent = (opts && opts.equipmentAccent) || colors.glove || colors.headband || 0xffffff;
    var equipmentType = (opts && opts.equipmentType) || 'baseline';
    function px(x, y, w, h, color) { g.fillStyle(color, 1); g.fillRect(x * s, y * s, w * s, h * s); }

    px(5 + headTilt, 1 + torsoBob, 6, 5, colors.skin); px(4 + headTilt, 0 + torsoBob, 8, 2, colors.hair); px(4 + headTilt, 2 + torsoBob, 1, 2, colors.hair); px(11 + headTilt, 2 + torsoBob, 1, 2, colors.hair); px(6 + headTilt, 5 + torsoBob, 4, 1, colors.skinDark);
    px(4 + headTilt, 1 + torsoBob, 8, 1, colors.headband || 0xd92b2b); px(4 + headTilt, 2 + torsoBob, 1, 1, colors.headband || 0xd92b2b); px(11 + headTilt, 2 + torsoBob, 1, 1, colors.headband || 0xd92b2b);
    if (equipmentType === 'speed_wraps') {
      px(3 + headTilt, 1 + torsoBob, 1, 1, accent); px(12 + headTilt, 1 + torsoBob, 1, 1, accent);
    }
    px(7 + headTilt, 6 + torsoBob, 2, 1, colors.skinDark); px(bodyX + bodyLean, 7 + torsoBob, bodyW, 8, colors.torso); px(bodyX + 1 + bodyLean, 8 + torsoBob, bodyW - 2, 1, colors.torsoLight); px(7 + bodyLean, 11 + torsoBob, 2, 4, colors.belt);
    var fistSize = equipmentType === 'fighters_gloves' ? 3 : 2;
    var fistY = (equipmentType === 'fighters_gloves' ? 8 : 9) + torsoBob + gloveBob;
    px(bodyX - 2 + armShift + bodyLean, 8 + torsoBob + leftArmDrop, 2, 5 - Math.min(leftArmDrop, 2), colors.skin); px(bodyX + bodyW + armShift + bodyLean, 8 + torsoBob + rightArmDrop, 2, 5 - Math.min(rightArmDrop, 2), colors.skin);
    px(bodyX - 1 + armShift + bodyLean, fistY + leftArmDrop, fistSize, fistSize, colors.glove); px(bodyX + bodyW - 1 + armShift + bodyLean, fistY + rightArmDrop, fistSize, fistSize, colors.glove);
    if (equipmentType === 'speed_wraps') {
      px(bodyX - 2 + armShift + bodyLean, 11 + torsoBob + leftArmDrop, 1, 2, accent); px(bodyX + bodyW + armShift + bodyLean, 11 + torsoBob + rightArmDrop, 1, 2, accent);
    }
    if (equipmentType === 'champions_belt') {
      px(bodyX + bodyLean, 15 + torsoBob, bodyW, 1, accent); px(bodyX + 1 + bodyLean, 14 + torsoBob, bodyW - 2, 1, accent);
    }
    px(bodyX + 1 + bodyLean, 16 + leftLegLift, 2, 6 - leftLegLift, colors.legs); px(bodyX + bodyW - 3 + bodyLean, 16 + rightLegLift, 2, 6 - rightLegLift, colors.legs);
    px(bodyX + 1 + bodyLean, 21, 2, 1, colors.bootDetail); px(bodyX + bodyW - 3 + bodyLean, 21, 2, 1, colors.bootDetail);
    px(bodyX + 1 + bodyLean, 22, 2, 2, colors.shoes); px(bodyX + bodyW - 3 + bodyLean, 22, 2, 2, colors.shoes);
    px(bodyX + 1 + bodyLean, 23, 2, 1, colors.shoeAccent); px(bodyX + bodyW - 3 + bodyLean, 23, 2, 1, colors.shoeAccent);
    if (damageLevel >= 1) {
      px(4, 4 + torsoBob, 1, 1, 0x6a2d7c); px(11, 5 + torsoBob, 1, 1, 0x6a2d7c);
      px(bodyX - 1 + armShift + bodyLean, 13 + torsoBob + leftArmDrop, 2, 1, 0x6a2d7c); px(bodyX + bodyW - 1 + armShift + bodyLean, 13 + torsoBob + rightArmDrop, 2, 1, 0x6a2d7c);
      px(bodyX + 1 + bodyLean, 10 + torsoBob, Math.max(2, bodyW - 2), 1, 0x5e364f);
    }
    if (damageLevel >= 2) {
      px(7 + headTilt, 4 + torsoBob, 1, 2, 0x9b1c1c); px(8 + headTilt, 5 + torsoBob, 2, 1, 0x9b1c1c);
      px(bodyX + 2 + bodyLean, 12 + torsoBob, Math.max(2, bodyW - 4), 1, 0x9b1c1c);
      px(bodyX + 1 + bodyLean, 19, 2, 1, 0x9b1c1c); px(bodyX + bodyW - 3 + bodyLean, 19, 2, 1, 0x9b1c1c);
    }
    px(bodyX - 2 + bodyLean, 7 + torsoBob + leftArmDrop, 1, 9 - Math.min(leftArmDrop, 2), colors.outline); px(bodyX + bodyW + 2 + bodyLean, 7 + torsoBob + rightArmDrop, 1, 9 - Math.min(rightArmDrop, 2), colors.outline); px(5 + headTilt, 1 + torsoBob, 1, 6, colors.outline); px(10 + headTilt, 1 + torsoBob, 1, 6, colors.outline);
    g.generateTexture(key, 48, 72); g.destroy();
    return key;
  },

  getEquipmentTexture: function(outfitKey, gearKey, damageState) {
    if (!this.EQUIPMENT_TEXTURES || !this.EQUIPMENT_TEXTURES[outfitKey]) return null;
    var gearSet = this.EQUIPMENT_TEXTURES[outfitKey][gearKey || 'baseline'] || this.EQUIPMENT_TEXTURES[outfitKey].baseline;
    if (!gearSet) return null;
    var state = damageState || 'healthy';
    return gearSet[state] || gearSet.healthy || null;
  },
  
  // Get outfit texture key for a given outfit
  getOutfitTexture: function(outfitKey, damageState) {
    if (!this.OUTFIT_TEXTURES || !this.OUTFIT_TEXTURES[outfitKey]) {
      return 'player'; // Fallback to default
    }
    var state = damageState || 'healthy';
    return this.OUTFIT_TEXTURES[outfitKey][state] || this.OUTFIT_TEXTURES[outfitKey].healthy;
  },

  registerEnemyVariant: function(typeKey, baseKey) {
    if (!typeKey || !baseKey) return null;
    var idleFrames = this.IDLE_TEXTURES[baseKey] || [baseKey];
    var variant = {
      baseKey: baseKey,
      idleFrames: idleFrames.slice(),
      attackWindup: baseKey + '_windup',
      hitReaction: baseKey + '_hit',
      deathFrames: [baseKey + '_death_0', baseKey + '_death_1']
    };
    this.ENEMY_VARIANTS[typeKey] = variant;
    this.ENEMY_TEXTURE_MAP[typeKey] = baseKey;
    return variant;
  },

  resolveEnemyTextureKey: function(typeKey, baseTypeKey) {
    var mapped = (typeKey && this.ENEMY_TEXTURE_MAP[typeKey]) || (baseTypeKey && this.ENEMY_TEXTURE_MAP[baseTypeKey]);
    if (mapped) return mapped;

    var variantAlias = (typeKey && this.VISUAL_VARIANTS[typeKey]) || (baseTypeKey && this.VISUAL_VARIANTS[baseTypeKey]);
    if (variantAlias) return variantAlias;

    if (typeKey === 'streetThug') return 'enemy_thug';
    return 'enemy_brawler';
  },

  playEnemyAnimation: function(sprite, animationKey, scene) {
    if (!sprite || !scene) return null;

    var variant = this.ENEMY_VARIANTS[sprite.typeKey] || this.ENEMY_VARIANTS[sprite.baseTypeKey] || this.ENEMY_VARIANTS[sprite._mmaVisualBaseKey];
    if (!variant) return null;

    var frameKey = variant[animationKey];
    if (!frameKey) return null;

    var frames = Array.isArray(frameKey) ? frameKey.slice() : [frameKey];
    var holdMs = animationKey === 'attackWindup' ? 180 : (animationKey === 'hitReaction' ? 130 : 340);
    var frameStep = frames.length > 1 ? Math.max(90, Math.floor(holdMs / frames.length)) : holdMs;
    var restoreKey = variant.baseKey;

    if (sprite.anims) sprite.anims.stop();
    sprite._mmaAnimOverrideUntil = (scene.time && typeof scene.time.now === 'number' ? scene.time.now : 0) + holdMs + 60;

    function applyFrame(index) {
      if (!sprite || !sprite.active) return;
      sprite._mmaCurrentVisualKey = frames[index];
      sprite.setTexture(frames[index]);
    }

    applyFrame(0);

    if (scene.time && frames.length > 1) {
      for (var i = 1; i < frames.length; i++) {
        (function(frameIndex) {
          scene.time.delayedCall(frameStep * frameIndex, function() {
            applyFrame(frameIndex);
          });
        })(i);
      }
    }

    if (animationKey !== 'deathFrames' && scene.time) {
      scene.time.delayedCall(holdMs, function() {
        if (!sprite || !sprite.active) return;
        sprite._mmaCurrentVisualKey = restoreKey;
        sprite.setTexture(restoreKey);
        var animKey = restoreKey + '_idle';
        if (sprite.anims && scene.anims && scene.anims.exists(animKey)) sprite.play(animKey, true);
      });
    }

    return frames[0];
  },

  clearZoneDecorations: function(scene) {
    if (!scene || !scene.roomDecorations) return;
    while (scene.roomDecorations.length) {
      var decor = scene.roomDecorations.pop();
      if (decor && decor.destroy) decor.destroy();
    }
  },

  spawnZoneDecorations: function(scene, zone, roomIdOrRoom) {
    if (!scene || !scene.add) return [];

    var room = typeof roomIdOrRoom === 'string' && window.MMA && MMA.Zones ? MMA.Zones.getRoom(roomIdOrRoom) : roomIdOrRoom;
    var decorList = this.DECORATIONS['zone' + zone];
    var placements = room && room.decorationPositions ? room.decorationPositions : [];
    var created = [];

    this.clearZoneDecorations(scene);
    scene.roomDecorations = scene.roomDecorations || [];

    for (var i = 0; i < placements.length; i++) {
      var pos = placements[i];
      var decor = decorList && decorList[pos.type];
      if (!decor) continue;

      var x = pos.x || (pos.col * 48 + 24);
      var y = pos.y || (pos.row * 48 + 24);
      var displayW = Math.round(((pos.w || decor.size.w) || 1) * 48);
      var displayH = Math.round(((pos.h || decor.size.h) || 1) * 48);
      var sprite = scene.add.image(x, y, decor.texture);
      sprite.setDisplaySize(displayW, displayH);
      sprite.setDepth(typeof pos.depth === 'number' ? pos.depth : (y + Math.round(displayH * 0.25)));
      sprite.setAlpha(typeof pos.alpha === 'number' ? pos.alpha : (typeof decor.alpha === 'number' ? decor.alpha : 0.95));
      if (pos.flipX && sprite.setFlipX) sprite.setFlipX(true);
      if (pos.flipY && sprite.setFlipY) sprite.setFlipY(true);

      if (decor.kind === 'sway' && scene.tweens) {
        scene.tweens.add({
          targets: sprite,
          angle: { from: -2.5, to: 2.5 },
          duration: 1100 + i * 80,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      } else if (decor.kind === 'pulse' && scene.tweens) {
        scene.tweens.add({
          targets: sprite,
          alpha: { from: sprite.alpha, to: Math.max(0.35, sprite.alpha - 0.15) },
          duration: 1400 + i * 60,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }

      scene.roomDecorations.push(sprite);
      created.push(sprite);
    }

    return created;
  }
};

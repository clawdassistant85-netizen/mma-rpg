window.MMA = window.MMA || {};
window.MMA.Sprites = {
  IDLE_TEXTURES: {},
  DAMAGE_TEXTURES: {},
  LIMB_DAMAGE_TEXTURES: {},
  PORTRAIT_TEXTURES: {},
  AURA_TEXTURES: {},
  AURA_LAYER_TEXTURES: {},
  IMPACT_PARTICLE_TEXTURES: {},
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
  VISUAL_VARIANTS: {},
  STYLE_AURA_COLORS: {
    striker: 0xff4d4d,
    grappler: 0x4d88ff,
    balanced: 0xb26bff
  },
  REACTION_FACE_TEXTURES: {},
  VISUAL_ROLE_ALIASES: {
    trainer: 'npc_trainer',
    coach: 'npc_coach',
    sparringPartner: 'npc_trainer',
    gymNpc: 'npc_trainer'
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
      function px(x, y, w, h, color) { g.fillStyle(color, 1); g.fillRect(x * s, y * s, w * s, h * s); }
      px(5 + headTilt, 1 + torsoBob, 6, 5, colors.skin); px(4 + headTilt, 0 + torsoBob, 8, 2, colors.hair); px(4 + headTilt, 2 + torsoBob, 1, 2, colors.hair); px(11 + headTilt, 2 + torsoBob, 1, 2, colors.hair); px(6 + headTilt, 5 + torsoBob, 4, 1, colors.skinDark);
      if (hasHeadband) { px(4 + headTilt, 1 + torsoBob, 8, 1, colors.headband); px(4 + headTilt, 2 + torsoBob, 1, 1, colors.headband); px(11 + headTilt, 2 + torsoBob, 1, 1, colors.headband); }
      px(7 + headTilt, 6 + torsoBob, 2, 1, colors.skinDark); px(bodyX + bodyLean, 7 + torsoBob, bodyW, 8, colors.torso); px(bodyX + 1 + bodyLean, 8 + torsoBob, bodyW - 2, 1, colors.torsoLight); px(7 + bodyLean, 11 + torsoBob, 2, 4, colors.belt);
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

    textureFloorStreet('floor'); textureWallStreet('wall'); textureGymFloor('gymFloor'); textureGymWall('gymWalls');
    textureCageFloor('cageFloor'); textureCageWall('cageWall'); textureCrate('crateProp'); textureDebris('debrisProp'); textureLamp('lampProp');
    var playerColors = { hair:0x2d1b12, skin:0xf1c38f, skinDark:0xd6a374, torso:0x2d66d3, torsoLight:0x4f85eb, belt:0x1a2a52, headband:0xd92b2b, glove:0xc9d9ff, legs:0x2a3f66, shoes:0x111111, bootDetail:0x222222, shoeAccent:0x333333, outline:0x1a1a1a };
    var thugColors = { hair:0x171717, skin:0xd9a77b, skinDark:0xb9845a, torso:0xb62626, torsoLight:0xd13a3a, belt:0x551414, glove:0x7a1b1b, weapon:0x5c4033, legs:0x2d2d33, shoes:0x0c0c0c, bootDetail:0x1a1a1a, shoeAccent:0x2a2a2a, outline:0x1a1a1a };
    var brawlerColors = { hair:0x3d2516, skin:0xd6a178, skinDark:0xb7835c, torso:0xc66a2a, torsoLight:0xde8a44, belt:0x6b3a14, glove:0x8b4a1d, weapon:0x4a3020, legs:0x4f3a2a, shoes:0x1a120d, bootDetail:0x2a1a15, shoeAccent:0x3a2a20, outline:0x2a1a10 };
    var eliteColors = { hair:0x090909, skin:0xc99667, skinDark:0x9e6e49, torso:0x5c1fa8, torsoLight:0x7f46d1, belt:0x2d1259, glove:0xd6c8ff, weapon:0x7a7a90, legs:0x221d34, shoes:0x050505, bootDetail:0x171125, shoeAccent:0xbca6ff, outline:0xf3dc7a };
    var bossColors = { hair:0xe7d37a, skin:0xd19a6c, skinDark:0xa86e43, torso:0x111111, torsoLight:0x3a3a3a, belt:0x9b1c1c, glove:0xffd54f, weapon:0xe7d37a, legs:0x2b2b2b, shoes:0x090909, bootDetail:0x3d2a12, shoeAccent:0xffd54f, outline:0xfff1a8 };
    var shadowBossColors = { hair:0xd9d7ff, skin:0xa882b8, skinDark:0x7f5e92, torso:0x25143f, torsoLight:0x4b2d78, belt:0x8a5cff, glove:0xd7c8ff, weapon:0xcab8ff, legs:0x1a1230, shoes:0x05030a, bootDetail:0x110a1e, shoeAccent:0x8a5cff, outline:0xe4dcff, headband:0x6d4ad8 };
    var trainerColors = { hair:0x5a3922, skin:0xe0b384, skinDark:0xbd8c64, torso:0x167a5c, torsoLight:0x2aa37f, belt:0x0f3f32, headband:0xf5f0d7, glove:0xe3fff7, legs:0x1b4f42, shoes:0x0b1614, bootDetail:0x15312c, shoeAccent:0x52d8b0, outline:0x0a241f };
    var coachColors = { hair:0xd9d9d9, skin:0xc99567, skinDark:0x9d6c47, torso:0x4d2a91, torsoLight:0x7551c2, belt:0x2b1657, headband:0xffd86b, glove:0xffefba, legs:0x2d2250, shoes:0x0c0815, bootDetail:0x1a1230, shoeAccent:0xcab6ff, outline:0xf0d88d };
    textureDamageSet('player', playerColors, { armShift:1, bodyW:6, hasHeadband:true });
    
    // Generate outfit variant textures for the player
    try {
      this.generateOutfitTextures(self, playerColors);
    } catch (e) {
      console.error('Error generating outfit textures:', e);
    }
    
    textureDamageSet('enemy_thug', thugColors, { armShift:0, bodyW:5, hasWeapon:true });
    textureDamageSet('enemy_brawler', brawlerColors, { armShift:1, bodyW:8, bigFists:true, hasWeapon:true });
    textureDamageSet('enemy_thug_elite', eliteColors, { armShift:0, bodyW:5, hasWeapon:true, hasHeadband:true });
    textureDamageSet('enemy_brawler_boss', bossColors, { armShift:1, bodyW:8, bigFists:true, hasWeapon:true, hasHeadband:true });
    textureDamageSet('enemy_shadow_boss', shadowBossColors, { armShift:1, bodyW:7, bigFists:true, hasWeapon:true, hasHeadband:true });
    textureDamageSet('npc_trainer', trainerColors, { armShift:0, bodyW:6, hasHeadband:true });
    textureDamageSet('npc_coach', coachColors, { armShift:-1, bodyW:7, hasHeadband:true, bigFists:true });
    texturePortraitSet('player', playerColors, { accent: window.MMA.Sprites.STYLE_AURA_COLORS.striker });
    texturePortraitSet('enemy_thug', thugColors, { accent: 0xff7a7a });
    texturePortraitSet('enemy_brawler', brawlerColors, { accent: 0xffb14d });
    texturePortraitSet('enemy_thug_elite', eliteColors, { accent: 0xbca6ff });
    texturePortraitSet('enemy_brawler_boss', bossColors, { accent: 0xffd54f });
    texturePortraitSet('enemy_shadow_boss', shadowBossColors, { accent: 0x8a5cff });
    texturePortraitSet('npc_trainer', trainerColors, { accent: 0x52d8b0 });
    texturePortraitSet('npc_coach', coachColors, { accent: 0xffd86b });
    textureReactionFaceSet('player', playerColors);
    textureReactionFaceSet('enemy_thug', thugColors);
    textureReactionFaceSet('enemy_brawler', brawlerColors);
    textureReactionFaceSet('enemy_thug_elite', eliteColors);
    textureReactionFaceSet('enemy_brawler_boss', bossColors);
    textureReactionFaceSet('enemy_shadow_boss', shadowBossColors);
    textureReactionFaceSet('npc_trainer', trainerColors);
    textureReactionFaceSet('npc_coach', coachColors);
    window.MMA.Sprites.VISUAL_VARIANTS = {
      mmaChamp: 'enemy_brawler_boss',
      boss: 'enemy_brawler_boss',
      rival: 'enemy_shadow_boss',
      shadow: 'enemy_shadow_boss',
      shadowBoss: 'enemy_shadow_boss',
      elite: 'enemy_thug_elite',
      trainer: 'npc_trainer',
      coach: 'npc_coach',
      sparringPartner: 'npc_trainer',
      gymNpc: 'npc_trainer'
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
    texturePickup('item_pickup');
    texturePickup('pickup_health');
    textureSweatParticle('impact_sweat', { fill: 0x9fd4ff, highlight: 0xffffff, alpha: 0.92 });
    textureSweatParticle('impact_sweat_heavy', { fill: 0xbfe6ff, highlight: 0xffffff, alpha: 0.98 });
    window.MMA.Sprites.IMPACT_PARTICLE_TEXTURES = {
      sweat: 'impact_sweat',
      heavySweat: 'impact_sweat_heavy'
    };
    textureHitbox('hitbox');
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
    
    // Get the textureHuman and textureDamageSet functions from the closure
    // We need to recreate similar logic for outfits
    
    function generateOutfitTexture(key, colors, opts) {
      var g = self.make.graphics({ x: 0, y: 0, add: false });
      var s = 3;
      var armShift = opts.armShift || 1;
      var bodyW = opts.bodyW || 6;
      var bodyX = Math.floor((16 - bodyW) / 2);
      
      var torsoBob = 0;
      var leftArmDrop = 0;
      var rightArmDrop = 0;
      var headTilt = 0;
      var bodyLean = 0;
      var leftLegLift = 0;
      var rightLegLift = 0;
      var gloveBob = 0;
      var hasHeadband = opts.hasHeadband || false;
      var hasMask = opts.hasMask || false;
      var hasGiCollar = opts.hasGiCollar || false;
      var hasRobe = opts.hasRobe || false;
      
      function px(x, y, w, h, color) {
        g.fillStyle(color, 1);
        g.fillRect(x * s, y * s, w * s, h * s);
      }
      
      // Head
      px(5 + headTilt, 1 + torsoBob, 6, 5, colors.skin);
      px(4 + headTilt, 0 + torsoBob, 8, 2, colors.hair);
      px(4 + headTilt, 2 + torsoBob, 1, 2, colors.hair);
      px(11 + headTilt, 2 + torsoBob, 1, 2, colors.hair);
      px(6 + headTilt, 5 + torsoBob, 4, 1, colors.skinDark);
      
      // Mask for ninja
      if (hasMask) {
        px(5 + headTilt, 3 + torsoBob, 6, 2, 0x111111);
        px(5 + headTilt, 2 + torsoBob, 2, 1, 0x8800ff);
        px(9 + headTilt, 2 + torsoBob, 2, 1, 0x8800ff);
      }
      
      // Headband
      if (hasHeadband) {
        px(4 + headTilt, 1 + torsoBob, 8, 1, colors.headband || 0xd92b2b);
        px(4 + headTilt, 2 + torsoBob, 1, 1, colors.headband || 0xd92b2b);
        px(11 + headTilt, 2 + torsoBob, 1, 1, colors.headband || 0xd92b2b);
      }
      
      // Gi collar
      if (hasGiCollar) {
        px(5 + headTilt, 5 + torsoBob, 6, 1, 0xcccccc);
        px(bodyX + bodyLean, 7 + torsoBob, bodyW, 1, 0xdddddd);
      }
      
      // Torso
      px(bodyX + bodyLean, 7 + torsoBob, bodyW, 8, colors.torso);
      px(bodyX + 1 + bodyLean, 8 + torsoBob, bodyW - 2, 1, colors.torsoLight);
      
      // Robe overlay
      if (hasRobe) {
        px(bodyX - 1 + bodyLean, 7 + torsoBob, 1, 8, colors.torsoLight);
        px(bodyX + bodyW + bodyLean, 7 + torsoBob, 1, 8, colors.torsoLight);
      }
      
      // Belt
      px(7 + bodyLean, 11 + torsoBob, 2, 4, colors.belt);
      px(bodyX + bodyLean, 15 + torsoBob, bodyW, 1, colors.belt);
      
      // Arms
      px(bodyX - 2 + armShift + bodyLean, 8 + torsoBob + leftArmDrop, 2, 5 - Math.min(leftArmDrop, 2), colors.skin);
      px(bodyX + bodyW + armShift + bodyLean, 8 + torsoBob + rightArmDrop, 2, 5 - Math.min(rightArmDrop, 2), colors.skin);
      
      // Gloves
      var fistSize = 2;
      var fistY = 9 + torsoBob + gloveBob;
      px(bodyX - 1 + armShift + bodyLean, fistY + leftArmDrop, fistSize, fistSize, colors.glove);
      px(bodyX + bodyW - 1 + armShift + bodyLean, fistY + rightArmDrop, fistSize, fistSize, colors.glove);
      
      // Legs
      px(bodyX + 1 + bodyLean, 16 + leftLegLift, 2, 6 - leftLegLift, colors.legs);
      px(bodyX + bodyW - 3 + bodyLean, 16 + rightLegLift, 2, 6 - rightLegLift, colors.legs);
      
      px(bodyX + 1 + bodyLean, 21, 2, 1, colors.bootDetail);
      px(bodyX + bodyW - 3 + bodyLean, 21, 2, 1, colors.bootDetail);
      
      px(bodyX + 1 + bodyLean, 22, 2, 2, colors.shoes);
      px(bodyX + bodyW - 3 + bodyLean, 22, 2, 2, colors.shoes);
      
      px(bodyX + 1 + bodyLean, 23, 2, 1, colors.shoeAccent);
      px(bodyX + bodyW - 3 + bodyLean, 23, 2, 1, colors.shoeAccent);
      
      // Outline
      px(bodyX - 2 + bodyLean, 7 + torsoBob + leftArmDrop, 1, 9 - Math.min(leftArmDrop, 2), colors.outline);
      px(bodyX + bodyW + 2 + bodyLean, 7 + torsoBob + rightArmDrop, 1, 9 - Math.min(rightArmDrop, 2), colors.outline);
      px(5 + headTilt, 1 + torsoBob, 1, 6, colors.outline);
      px(10 + headTilt, 1 + torsoBob, 1, 6, colors.outline);
      
      var texKey = 'player_' + key;
      g.generateTexture(texKey, 48, 72);
      g.destroy();
      return texKey;
    }
    
    // Generate textures for each outfit
    Object.keys(outfitConfigs).forEach(function(outfitKey) {
      var config = outfitConfigs[outfitKey];
      var colors = Object.assign({}, baseColors, config);
      
      // Generate damage states for this outfit
      var baseKey = 'player_' + outfitKey;
      var healthyKey = generateOutfitTexture(baseKey, colors, { armShift: 1, bodyW: 6, hasHeadband: config.hasHeadband, hasMask: config.hasMask, hasGiCollar: config.hasGiCollar, hasRobe: config.hasRobe });
      
      // Hurt state
      var hurtColors = Object.assign({}, colors);
      colors.torso = Math.max(0, colors.torso - 0x202020);
      var hurtKey = generateOutfitTexture(baseKey + '_hurt_1', colors, { 
        armShift: 1, bodyW: 6, bodyLean: -1, leftArmDrop: 1, rightLegLift: 2,
        hasHeadband: config.hasHeadband, hasMask: config.hasMask, hasGiCollar: config.hasGiCollar, hasRobe: config.hasRobe 
      });
      
      // Bloodied state
      var bloodiedColors = Object.assign({}, colors);
      bloodiedColors.torso = Math.max(0, bloodiedColors.torso - 0x303030);
      var bloodiedKey = generateOutfitTexture(baseKey + '_hurt_2', bloodiedColors, { 
        armShift: 0, bodyW: 6, bodyLean: -2, leftArmDrop: 2, rightLegLift: 3,
        hasHeadband: config.hasHeadband, hasMask: config.hasMask, hasGiCollar: config.hasGiCollar, hasRobe: config.hasRobe 
      });
      
      outfitDamageKeys[outfitKey] = {
        healthy: healthyKey,
        bruised: hurtKey,
        bloodied: bloodiedKey
      };
    });
    
    // Store outfit damage textures
    window.MMA.Sprites.OUTFIT_TEXTURES = outfitDamageKeys;
  },
  
  // Get outfit texture key for a given outfit
  getOutfitTexture: function(outfitKey, damageState) {
    if (!this.OUTFIT_TEXTURES || !this.OUTFIT_TEXTURES[outfitKey]) {
      return 'player'; // Fallback to default
    }
    var state = damageState || 'healthy';
    return this.OUTFIT_TEXTURES[outfitKey][state] || this.OUTFIT_TEXTURES[outfitKey].healthy;
  }
};

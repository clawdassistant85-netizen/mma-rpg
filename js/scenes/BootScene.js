var BootScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function BootScene() {
    Phaser.Scene.call(this, { key: 'BootScene' });
  },
  create: function() {
    MMA.Sprites.makeAll(this);
    this.registerIdleAnimations();
    this.installIdleAnimationHook();
    this.installVisualVariantHook();
    this.installEquipmentVisualHook();
    this.installDamageStateHook();
    this.installLimbDamageHook();
    this.installPortraitHook();
    this.installReactionFaceHook();
    this.installTechniqueTattooHook();
    this.installStyleAuraHook();
    this.installBossChromaAuraHook();
    this.installImpactSweatHook();
    this.installComboFireTrailHook();
    this.installArenaFootworkTrailHook();
    this.installShadowDoubleHook();
    this.installShadowDoubleDamageHook();
    this.installSignatureSilhouetteHook();
    this.installMuscleTensionHook();
    this.installExertionCueHook();
    this.installLastChancePulseHook();
    this.installFightIqAuraReadHook();
    this.installEnemyFearTrembleHook();
    this.scene.start('GameScene');
    this.scene.stop('BootScene');
  },
  registerIdleAnimations: function() {
    var self = this;
    var idleSets = (window.MMA && window.MMA.Sprites && window.MMA.Sprites.IDLE_TEXTURES) || {};
    Object.keys(idleSets).forEach(function(baseKey) {
      var animKey = baseKey + '_idle';
      if (self.anims.exists(animKey)) return;
      self.anims.create({
        key: animKey,
        frames: idleSets[baseKey].map(function(textureKey) {
          return { key: textureKey };
        }),
        frameRate: 5,
        repeat: -1,
        yoyo: true
      });
    });
  },
  installIdleAnimationHook: function() {
    if (Phaser.Physics.Arcade.Factory.prototype._mmaIdleHookInstalled) return;

    var originalSprite = Phaser.Physics.Arcade.Factory.prototype.sprite;
    Phaser.Physics.Arcade.Factory.prototype.sprite = function(x, y, key, frame) {
      var sprite = originalSprite.call(this, x, y, key, frame);
      sprite._mmaBaseTextureKey = key;
      sprite._mmaVisualBaseKey = key;
      sprite._mmaCurrentVisualKey = key;
      sprite._mmaLastDamageTier = 'healthy';
      var animKey = key + '_idle';
      if (sprite && sprite.anims && sprite.scene && sprite.scene.anims && sprite.scene.anims.exists(animKey)) {
        sprite.play(animKey);
      }
      return sprite;
    };

    Phaser.Physics.Arcade.Factory.prototype._mmaIdleHookInstalled = true;
  },
  installVisualVariantHook: function() {
    if (Phaser.Physics.Arcade.Sprite.prototype._mmaVisualVariantHookInstalled) return;

    function resolveVisualBase(sprite) {
      var spriteDefs = window.MMA && window.MMA.Sprites;
      var damageSets = spriteDefs && spriteDefs.DAMAGE_TEXTURES;
      var variants = spriteDefs && spriteDefs.VISUAL_VARIANTS;
      var roleAliases = spriteDefs && spriteDefs.VISUAL_ROLE_ALIASES;
      var fallback = sprite._mmaBaseTextureKey;
      if (!variants || !damageSets || !fallback) return fallback;

      var candidateKeys = [];
      if (sprite.typeKey) candidateKeys.push(String(sprite.typeKey));
      if (sprite.role) candidateKeys.push(String(sprite.role));
      if (sprite.npcRole) candidateKeys.push(String(sprite.npcRole));
      if (sprite.enemyClass) candidateKeys.push(String(sprite.enemyClass));
      if (sprite.archetype) candidateKeys.push(String(sprite.archetype));
      if (sprite.meta && sprite.meta.role) candidateKeys.push(String(sprite.meta.role));
      if (sprite.meta && sprite.meta.typeKey) candidateKeys.push(String(sprite.meta.typeKey));
      if (sprite.meta && sprite.meta.archetype) candidateKeys.push(String(sprite.meta.archetype));
      if (sprite.data && typeof sprite.data.get === 'function') {
        var dataRole = sprite.data.get('role');
        var dataTypeKey = sprite.data.get('typeKey');
        var dataArchetype = sprite.data.get('archetype');
        if (dataRole) candidateKeys.push(String(dataRole));
        if (dataTypeKey) candidateKeys.push(String(dataTypeKey));
        if (dataArchetype) candidateKeys.push(String(dataArchetype));
      }
      for (var i = 0; i < candidateKeys.length; i++) {
        var rawKey = candidateKeys[i];
        var mappedKey = variants[rawKey] ? rawKey : (roleAliases && roleAliases[rawKey] ? roleAliases[rawKey] : null);
        var variantKey = mappedKey && variants[mappedKey] ? variants[mappedKey] : (variants[rawKey] || mappedKey);
        if (variantKey && damageSets[variantKey]) return variantKey;
      }
      if ((sprite.isShadow || sprite.isRival) && variants.shadow && damageSets[variants.shadow]) return variants.shadow;
      if (sprite.isBoss && variants.boss && damageSets[variants.boss]) return variants.boss;
      if (sprite.isElite && variants.elite && damageSets[variants.elite]) return variants.elite;
      return fallback;
    }

    function resolveEquippedOutfitBase(sprite) {
      if (!sprite || !sprite.scene || sprite.scene.player !== sprite) return null;
      var spriteDefs = window.MMA && window.MMA.Sprites;
      if (!spriteDefs || !spriteDefs.OUTFIT_TEXTURES) return null;
      var outfitId = null;
      if (sprite.equippedOutfit && sprite.equippedOutfit.id) outfitId = sprite.equippedOutfit.id;
      if (!outfitId && sprite.stats && sprite.stats.equippedOutfit) outfitId = sprite.stats.equippedOutfit;
      if (!outfitId && sprite.data && typeof sprite.data.get === 'function') outfitId = sprite.data.get('equippedOutfit');
      if (!outfitId && window.MMA && window.MMA.Outfits && typeof window.MMA.Outfits.getEquippedOutfit === 'function') {
        var equipped = window.MMA.Outfits.getEquippedOutfit();
        if (equipped && equipped.id) outfitId = equipped.id;
      }
      return outfitId && spriteDefs.OUTFIT_TEXTURES[outfitId] ? spriteDefs.OUTFIT_TEXTURES[outfitId].healthy : null;
    }

    function resolveEquipmentTier(sprite) {
      if (!sprite || !sprite.scene || sprite.scene.player !== sprite) return 'baseline';
      function trophyHas(itemId) {
        try {
          var raw = window.localStorage ? window.localStorage.getItem('mma_rpg_trophy_room') : null;
          if (!raw) return false;
          var parsed = JSON.parse(raw);
          var items = parsed && parsed.rareItems;
          if (!Array.isArray(items)) return false;
          for (var i = 0; i < items.length; i++) {
            if (items[i] && items[i].id === itemId) return true;
          }
        } catch (e) {}
        return false;
      }
      if (trophyHas('champions_belt')) return 'champions_belt';
      if (trophyHas('fighters_gloves')) return 'fighters_gloves';
      if (trophyHas('speed_wraps')) return 'speed_wraps';
      return 'baseline';
    }

    var originalPreUpdate = Phaser.Physics.Arcade.Sprite.prototype.preUpdate;
    Phaser.Physics.Arcade.Sprite.prototype.preUpdate = function(time, delta) {
      originalPreUpdate.call(this, time, delta);

      if (!this.active || !this.scene || !this._mmaBaseTextureKey) return;
      if (this._mmaAnimOverrideUntil && time < this._mmaAnimOverrideUntil) return;
      var nextBase = resolveEquippedOutfitBase(this) || resolveVisualBase(this);
      var nextEquipmentTier = resolveEquipmentTier(this);
      if (!nextBase) return;
      if (this._mmaVisualBaseKey === nextBase && this._mmaEquipmentTier === nextEquipmentTier) return;

      this._mmaVisualBaseKey = nextBase;
      this._mmaEquipmentTier = nextEquipmentTier;
      this._mmaLastDamageTier = 'healthy';
      this._mmaCurrentVisualKey = nextBase;
      this.setTexture(nextBase);

      var animKey = nextBase + '_idle';
      if (this.anims && this.scene.anims && this.scene.anims.exists(animKey)) {
        this.play(animKey, true);
      }
    };

    Phaser.Physics.Arcade.Sprite.prototype._mmaVisualVariantHookInstalled = true;
  },
  installEquipmentVisualHook: function() {
    if (Phaser.Physics.Arcade.Sprite.prototype._mmaEquipmentVisualHookInstalled) return;

    function resolveDamageTier(sprite) {
      if (!sprite || !sprite.stats || !sprite.stats.maxHp) return sprite && sprite._mmaLastDamageTier ? sprite._mmaLastDamageTier : 'healthy';
      var ratio = Phaser.Math.Clamp(sprite.stats.hp / sprite.stats.maxHp, 0, 1);
      return ratio <= 0.33 ? 'bloodied' : (ratio <= 0.66 ? 'bruised' : 'healthy');
    }

    function resolveEquippedOutfit(sprite) {
      if (!sprite || !sprite.scene || sprite.scene.player !== sprite) return null;
      if (sprite.equippedOutfit && sprite.equippedOutfit.id) return sprite.equippedOutfit.id;
      if (sprite.stats && sprite.stats.equippedOutfit) return sprite.stats.equippedOutfit;
      if (sprite.data && typeof sprite.data.get === 'function') {
        var dataOutfit = sprite.data.get('equippedOutfit');
        if (dataOutfit) return dataOutfit;
      }
      if (window.MMA && window.MMA.Outfits && typeof window.MMA.Outfits.getEquippedOutfit === 'function') {
        var equipped = window.MMA.Outfits.getEquippedOutfit();
        if (equipped && equipped.id) return equipped.id;
      }
      return null;
    }

    function resolveEquipmentTier(sprite) {
      if (!sprite || !sprite.scene || sprite.scene.player !== sprite) return 'baseline';
      function trophyHas(itemId) {
        try {
          var raw = window.localStorage ? window.localStorage.getItem('mma_rpg_trophy_room') : null;
          if (!raw) return false;
          var parsed = JSON.parse(raw);
          var items = parsed && parsed.rareItems;
          if (!Array.isArray(items)) return false;
          for (var i = 0; i < items.length; i++) {
            if (items[i] && items[i].id === itemId) return true;
          }
        } catch (e) {}
        return false;
      }
      if (trophyHas('champions_belt')) return 'champions_belt';
      if (trophyHas('fighters_gloves')) return 'fighters_gloves';
      if (trophyHas('speed_wraps')) return 'speed_wraps';
      return 'baseline';
    }

    function refreshEquipmentVisual(sprite) {
      if (!sprite || !sprite.active || !sprite.scene || sprite.scene.player !== sprite) return;
      var spriteDefs = window.MMA && window.MMA.Sprites;
      if (!spriteDefs || !spriteDefs.OUTFIT_TEXTURES || !spriteDefs.EQUIPMENT_TEXTURES) return;
      var outfitId = resolveEquippedOutfit(sprite);
      if (!outfitId || !spriteDefs.OUTFIT_TEXTURES[outfitId]) return;
      var damageTier = resolveDamageTier(sprite);
      var tier = resolveEquipmentTier(sprite);
      var nextTexture = spriteDefs.getEquipmentTexture(outfitId, tier, damageTier) || spriteDefs.getOutfitTexture(outfitId, damageTier);
      if (!nextTexture || sprite._mmaCurrentVisualKey === nextTexture) {
        sprite._mmaEquipmentTier = tier;
        sprite._mmaVisualBaseKey = (spriteDefs.OUTFIT_TEXTURES[outfitId] && spriteDefs.OUTFIT_TEXTURES[outfitId].healthy) || sprite._mmaVisualBaseKey;
        return;
      }
      sprite._mmaEquipmentTier = tier;
      sprite._mmaVisualBaseKey = (spriteDefs.OUTFIT_TEXTURES[outfitId] && spriteDefs.OUTFIT_TEXTURES[outfitId].healthy) || sprite._mmaVisualBaseKey;
      sprite._mmaLastDamageTier = damageTier;
      sprite._mmaCurrentVisualKey = nextTexture;
      sprite.setTexture(nextTexture);
      var animKey = nextTexture + '_idle';
      if (sprite.anims && sprite.scene.anims && sprite.scene.anims.exists(animKey)) {
        sprite.play(animKey, true);
      }
    }

    Phaser.Physics.Arcade.Sprite.prototype.refreshEquipmentVisual = function() {
      refreshEquipmentVisual(this);
      return this._mmaCurrentVisualKey || (this.texture && this.texture.key) || null;
    };

    var originalPreUpdate = Phaser.Physics.Arcade.Sprite.prototype.preUpdate;
    Phaser.Physics.Arcade.Sprite.prototype.preUpdate = function(time, delta) {
      originalPreUpdate.call(this, time, delta);
      refreshEquipmentVisual(this);
    };

    Phaser.Physics.Arcade.Sprite.prototype._mmaEquipmentVisualHookInstalled = true;
  },

  installDamageStateHook: function() {
    if (Phaser.Physics.Arcade.Sprite.prototype._mmaDamageHookInstalled) return;

    var originalPreUpdate = Phaser.Physics.Arcade.Sprite.prototype.preUpdate;
    Phaser.Physics.Arcade.Sprite.prototype.preUpdate = function(time, delta) {
      originalPreUpdate.call(this, time, delta);

      if (!this.active || !this.scene || !this.stats || !this.stats.maxHp || !this._mmaBaseTextureKey) return;
      if (this._mmaAnimOverrideUntil && time < this._mmaAnimOverrideUntil) return;
      var damageSets = window.MMA && window.MMA.Sprites && window.MMA.Sprites.DAMAGE_TEXTURES;
      var visualBaseKey = this._mmaVisualBaseKey || this._mmaBaseTextureKey;
      if (!damageSets || !damageSets[visualBaseKey]) return;

      var ratio = Phaser.Math.Clamp(this.stats.hp / this.stats.maxHp, 0, 1);
      var nextTier = ratio <= 0.33 ? 'bloodied' : (ratio <= 0.66 ? 'bruised' : 'healthy');
      if (this._mmaLastDamageTier === nextTier) return;

      var nextTexture = damageSets[visualBaseKey][nextTier];
      if (!nextTexture || this._mmaCurrentVisualKey === nextTexture) {
        this._mmaLastDamageTier = nextTier;
        return;
      }

      this._mmaLastDamageTier = nextTier;
      this._mmaCurrentVisualKey = nextTexture;
      this.setTexture(nextTexture);

      var animKey = nextTexture + '_idle';
      if (this.anims && this.scene.anims && this.scene.anims.exists(animKey)) {
        this.play(animKey, true);
      }
    };

    Phaser.Physics.Arcade.Sprite.prototype._mmaDamageHookInstalled = true;
  },
  installLimbDamageHook: function() {
    if (Phaser.Physics.Arcade.Sprite.prototype._mmaLimbDamageHookInstalled) return;

    function readInjuryMap(sprite) {
      if (!sprite) return null;
      if (sprite.limbDamage) return sprite.limbDamage;
      if (sprite.injuries) return sprite.injuries;
      if (sprite.stats && sprite.stats.limbDamage) return sprite.stats.limbDamage;
      if (sprite.stats && sprite.stats.injuries) return sprite.stats.injuries;
      if (sprite.meta && sprite.meta.limbDamage) return sprite.meta.limbDamage;
      if (sprite.data && typeof sprite.data.get === 'function') {
        return sprite.data.get('limbDamage') || sprite.data.get('injuries') || null;
      }
      return null;
    }

    function readFlag(source, keys) {
      if (!source) return false;
      for (var i = 0; i < keys.length; i++) {
        var value = source[keys[i]];
        if (typeof value === 'number' && value > 0) return true;
        if (value === true) return true;
        if (typeof value === 'string' && value !== '' && value !== 'none' && value !== 'healthy') return true;
      }
      return false;
    }

    function inferLimbDamageState(sprite) {
      var injuryMap = readInjuryMap(sprite);
      if (!injuryMap) return null;
      var leftArm = readFlag(injuryMap, ['leftArm', 'armLeft', 'left_arm']);
      var rightArm = readFlag(injuryMap, ['rightArm', 'armRight', 'right_arm']);
      var leftLeg = readFlag(injuryMap, ['leftLeg', 'legLeft', 'left_leg']);
      var rightLeg = readFlag(injuryMap, ['rightLeg', 'legRight', 'right_leg']);

      if (leftArm && rightArm) return 'bothArms';
      if (leftLeg && rightLeg) return 'bothLegs';
      if (leftArm) return 'leftArm';
      if (rightArm) return 'rightArm';
      if (leftLeg) return 'leftLeg';
      if (rightLeg) return 'rightLeg';
      return null;
    }

    var originalPreUpdate = Phaser.Physics.Arcade.Sprite.prototype.preUpdate;
    Phaser.Physics.Arcade.Sprite.prototype.preUpdate = function(time, delta) {
      originalPreUpdate.call(this, time, delta);

      if (!this.active || !this.scene || !this._mmaBaseTextureKey) return;
      if (this._mmaAnimOverrideUntil && time < this._mmaAnimOverrideUntil) return;
      var visualBaseKey = this._mmaVisualBaseKey || this._mmaBaseTextureKey;
      var spriteDefs = window.MMA && window.MMA.Sprites;
      var limbSets = spriteDefs && spriteDefs.LIMB_DAMAGE_TEXTURES;
      var damageSets = spriteDefs && spriteDefs.DAMAGE_TEXTURES;
      if (!limbSets || !damageSets || !limbSets[visualBaseKey] || !damageSets[visualBaseKey]) return;

      var limbState = inferLimbDamageState(this);
      var healthyTexture = damageSets[visualBaseKey][this._mmaLastDamageTier || 'healthy'] || visualBaseKey;
      var nextTexture = limbState ? limbSets[visualBaseKey][limbState] : healthyTexture;
      if (!nextTexture || this._mmaCurrentVisualKey === nextTexture) {
        this._mmaLimbDamageState = limbState || null;
        return;
      }

      this._mmaLimbDamageState = limbState || null;
      this._mmaCurrentVisualKey = nextTexture;
      this.setTexture(nextTexture);

      var animKey = nextTexture + '_idle';
      if (this.anims && this.scene.anims && this.scene.anims.exists(animKey)) {
        this.play(animKey, true);
      }
    };

    Phaser.Physics.Arcade.Sprite.prototype._mmaLimbDamageHookInstalled = true;
  },
  installPortraitHook: function() {
    if (Phaser.Physics.Arcade.Sprite.prototype._mmaPortraitHookInstalled) return;

    function inferPortraitPose(sprite) {
      if (!sprite) return 'stance';
      if (sprite.portraitPose) return sprite.portraitPose;
      var movePool = [];
      if (Array.isArray(sprite.unlockedMoves)) movePool = movePool.concat(sprite.unlockedMoves);
      if (sprite.scene && sprite.scene.player === sprite && Array.isArray(sprite.scene.player.unlockedMoves)) {
        movePool = movePool.concat(sprite.scene.player.unlockedMoves);
      }
      var grappleScore = 0;
      var signatureScore = 0;
      for (var i = 0; i < movePool.length; i++) {
        var moveKey = String(movePool[i] || '').toLowerCase();
        if (!moveKey) continue;
        if (moveKey.indexOf('signature') !== -1 || moveKey.indexOf('super') !== -1 || moveKey.indexOf('finisher') !== -1) signatureScore += 2;
        if (moveKey.indexOf('grapple') !== -1 || moveKey.indexOf('throw') !== -1 || moveKey.indexOf('slam') !== -1 || moveKey.indexOf('armbar') !== -1 || moveKey.indexOf('triangle') !== -1 || moveKey.indexOf('clinch') !== -1 || moveKey.indexOf('take') !== -1) grappleScore++;
      }
      if (signatureScore > 0) return 'signature';
      if (grappleScore > 0) return 'grapple';
      return 'stance';
    }

    function resolvePortraitBase(sprite) {
      if (!sprite) return 'player';
      var visualBase = sprite._mmaVisualBaseKey || sprite._mmaBaseTextureKey || (sprite.texture && sprite.texture.key) || 'player';
      var portraitSets = window.MMA && window.MMA.Sprites && window.MMA.Sprites.PORTRAIT_TEXTURES;
      if (portraitSets && portraitSets[visualBase]) return visualBase;
      return portraitSets && portraitSets.player ? 'player' : visualBase;
    }

    Phaser.Physics.Arcade.Sprite.prototype.getPortraitTextureKey = function() {
      var portraitSets = window.MMA && window.MMA.Sprites && window.MMA.Sprites.PORTRAIT_TEXTURES;
      if (!portraitSets) return null;
      var baseKey = resolvePortraitBase(this);
      var poseKey = inferPortraitPose(this);
      var set = portraitSets[baseKey] || portraitSets.player;
      if (!set) return null;
      this._mmaPortraitBaseKey = baseKey;
      this._mmaPortraitPoseKey = poseKey;
      return set[poseKey] || set.stance || null;
    };

    Phaser.Physics.Arcade.Sprite.prototype.getPortraitTextureSet = function() {
      var portraitSets = window.MMA && window.MMA.Sprites && window.MMA.Sprites.PORTRAIT_TEXTURES;
      if (!portraitSets) return null;
      return portraitSets[resolvePortraitBase(this)] || portraitSets.player || null;
    };

    Phaser.Physics.Arcade.Sprite.prototype.refreshPortraitPose = function() {
      return this.getPortraitTextureKey();
    };

    Phaser.Physics.Arcade.Sprite.prototype._mmaPortraitHookInstalled = true;
  },
  installReactionFaceHook: function() {
    if (Phaser.Physics.Arcade.Sprite.prototype._mmaReactionFaceHookInstalled) return;

    function resolveReactionFaceBase(sprite) {
      if (!sprite) return 'player';
      var visualBase = sprite._mmaVisualBaseKey || sprite._mmaBaseTextureKey || (sprite.texture && sprite.texture.key) || 'player';
      var faceSets = window.MMA && window.MMA.Sprites && window.MMA.Sprites.REACTION_FACE_TEXTURES;
      if (faceSets && faceSets[visualBase]) return visualBase;
      return faceSets && faceSets.player ? 'player' : visualBase;
    }

    function inferReactionMood(sprite) {
      if (!sprite) return 'determined';
      if (sprite.reactionMood) return sprite.reactionMood;
      var stats = sprite.stats || {};
      var hpRatio = typeof stats.hp === 'number' && typeof stats.maxHp === 'number' && stats.maxHp > 0 ? Phaser.Math.Clamp(stats.hp / stats.maxHp, 0, 1) : 1;
      var staminaRatio = typeof stats.stamina === 'number' && typeof stats.maxStamina === 'number' && stats.maxStamina > 0 ? Phaser.Math.Clamp(stats.stamina / stats.maxStamina, 0, 1) : 1;
      var focusRatio = typeof stats.focus === 'number' && typeof stats.maxFocus === 'number' && stats.maxFocus > 0 ? Phaser.Math.Clamp(stats.focus / stats.maxFocus, 0, 1) : 0;
      var speed = sprite.body ? Math.abs(sprite.body.velocity.x || 0) + Math.abs(sprite.body.velocity.y || 0) : 0;
      if (staminaRatio <= 0.08 || (staminaRatio <= 0.18 && speed < 10)) return 'exhausted';
      if (hpRatio <= 0.35) return 'pained';
      if (focusRatio >= 0.95) return 'determined';
      return staminaRatio <= 0.2 ? 'exhausted' : 'determined';
    }

    function ensureReactionFace(sprite) {
      if (!sprite || !sprite.scene || !sprite.active) return null;
      if (sprite._mmaReactionFace && sprite._mmaReactionFace.active) return sprite._mmaReactionFace;
      var baseKey = resolveReactionFaceBase(sprite);
      var faceSets = window.MMA && window.MMA.Sprites && window.MMA.Sprites.REACTION_FACE_TEXTURES;
      var textureKey = faceSets && faceSets[baseKey] ? faceSets[baseKey].determined : null;
      if (!textureKey) return null;
      var face = sprite.scene.add.image(sprite.x, sprite.y - 34, textureKey);
      face.setDepth((sprite.depth || 0) + 4);
      face.setVisible(false);
      face._mmaOwner = sprite;
      sprite._mmaReactionFace = face;
      return face;
    }

    var originalPreUpdate = Phaser.Physics.Arcade.Sprite.prototype.preUpdate;
    Phaser.Physics.Arcade.Sprite.prototype.preUpdate = function(time, delta) {
      originalPreUpdate.call(this, time, delta);

      if (!this.active || !this.scene || !this._mmaBaseTextureKey) {
        if (this._mmaReactionFace) this._mmaReactionFace.setVisible(false);
        return;
      }
      var faceSets = window.MMA && window.MMA.Sprites && window.MMA.Sprites.REACTION_FACE_TEXTURES;
      if (!faceSets) return;
      var baseKey = resolveReactionFaceBase(this);
      var set = faceSets[baseKey] || faceSets.player;
      if (!set) return;

      var face = ensureReactionFace(this);
      if (!face) return;

      var mood = inferReactionMood(this);
      var textureKey = set[mood] || set.determined;
      if (face.texture && face.texture.key !== textureKey) face.setTexture(textureKey);

      var bob = Math.sin(time * 0.007 + (this.x * 0.01)) * 1.2;
      face.setVisible(true);
      face.setPosition(this.x, this.y - 34 + bob);
      face.setDepth((this.depth || 0) + 4);
      face.setScale(1);
      face.setFlipX(!!this.flipX);
      face.setAlpha(mood === 'pained' ? 0.95 : (mood === 'exhausted' ? 0.88 : 0.92));
      this._mmaReactionMood = mood;
    };

    var originalDestroy = Phaser.Physics.Arcade.Sprite.prototype.destroy;
    Phaser.Physics.Arcade.Sprite.prototype.destroy = function(fromScene) {
      if (this._mmaReactionFace) {
        this._mmaReactionFace.destroy();
        this._mmaReactionFace = null;
      }
      return originalDestroy.call(this, fromScene);
    };

    Phaser.Physics.Arcade.Sprite.prototype.getReactionFaceTextureKey = function() {
      var faceSets = window.MMA && window.MMA.Sprites && window.MMA.Sprites.REACTION_FACE_TEXTURES;
      if (!faceSets) return null;
      var baseKey = resolveReactionFaceBase(this);
      var mood = inferReactionMood(this);
      var set = faceSets[baseKey] || faceSets.player;
      return set ? (set[mood] || set.determined || null) : null;
    };

    Phaser.Physics.Arcade.Sprite.prototype._mmaReactionFaceHookInstalled = true;
  },
  installTechniqueTattooHook: function() {
    if (Phaser.Physics.Arcade.Sprite.prototype._mmaTechniqueTattooHookInstalled) return;

    function readMasteryMap(sprite) {
      if (!sprite) return null;
      var sources = [
        sprite.techniqueMastery,
        sprite.mastery,
        sprite.stats && sprite.stats.techniqueMastery,
        sprite.stats && sprite.stats.mastery,
        sprite.meta && sprite.meta.techniqueMastery,
        sprite.meta && sprite.meta.mastery
      ];
      if (sprite.data && typeof sprite.data.get === 'function') {
        sources.push(sprite.data.get('techniqueMastery'));
        sources.push(sprite.data.get('mastery'));
      }
      for (var i = 0; i < sources.length; i++) {
        if (sources[i] && typeof sources[i] === 'object') return sources[i];
      }
      try {
        if (window.localStorage) {
          var raw = window.localStorage.getItem('mma_rpg_save');
          if (raw) {
            var parsed = JSON.parse(raw);
            if (parsed && parsed.techniqueMastery && typeof parsed.techniqueMastery === 'object') return parsed.techniqueMastery;
            if (parsed && parsed.player && parsed.player.techniqueMastery && typeof parsed.player.techniqueMastery === 'object') return parsed.player.techniqueMastery;
            if (parsed && parsed.mastery && typeof parsed.mastery === 'object') return parsed.mastery;
          }
        }
      } catch (e) {}
      return null;
    }

    function inferTattooLoadout(sprite) {
      var mastery = readMasteryMap(sprite);
      if (!mastery) return [];
      var loadout = [];
      Object.keys(mastery).forEach(function(key) {
        var level = mastery[key];
        if (typeof level !== 'number' || level < 5) return;
        var token = String(key || '').toLowerCase();
        if (token.indexOf('special') !== -1 || token.indexOf('signature') !== -1 || token.indexOf('super') !== -1 || token.indexOf('focus') !== -1 || token.indexOf('chi') !== -1) {
          if (loadout.indexOf('special') === -1) loadout.push('special');
          return;
        }
        if (token.indexOf('grapple') !== -1 || token.indexOf('throw') !== -1 || token.indexOf('armbar') !== -1 || token.indexOf('triangle') !== -1 || token.indexOf('kimura') !== -1 || token.indexOf('submission') !== -1 || token.indexOf('takedown') !== -1 || token.indexOf('slam') !== -1 || token.indexOf('clinch') !== -1) {
          if (loadout.indexOf('grapple') === -1) loadout.push('grapple');
          return;
        }
        if (loadout.indexOf('strike') === -1) loadout.push('strike');
      });
      return loadout.slice(0, 3);
    }

    function ensureTattooOverlays(sprite) {
      if (!sprite || !sprite.scene || !sprite.active) return null;
      if (sprite._mmaTechniqueTattooOverlays && sprite._mmaTechniqueTattooOverlays.length) return sprite._mmaTechniqueTattooOverlays;
      var textures = window.MMA && window.MMA.Sprites && window.MMA.Sprites.TATTOO_TEXTURES;
      var set = textures && textures.player;
      if (!set) return null;
      var overlays = ['strike', 'grapple', 'special'].map(function(type) {
        var img = sprite.scene.add.image(sprite.x, sprite.y, set[type]);
        img.setBlendMode(Phaser.BlendModes.SCREEN);
        img.setVisible(false);
        img.setDepth((sprite.depth || 0) + 3);
        img._mmaTattooType = type;
        return img;
      });
      sprite._mmaTechniqueTattooOverlays = overlays;
      return overlays;
    }

    var originalPreUpdate = Phaser.Physics.Arcade.Sprite.prototype.preUpdate;
    Phaser.Physics.Arcade.Sprite.prototype.preUpdate = function(time, delta) {
      originalPreUpdate.call(this, time, delta);

      var isPlayer = !!(this.scene && this.scene.player === this);
      if (!this.active || !this.scene || !isPlayer) {
        if (this._mmaTechniqueTattooOverlays) {
          this._mmaTechniqueTattooOverlays.forEach(function(overlay) { if (overlay) overlay.setVisible(false); });
        }
        return;
      }

      var loadout = inferTattooLoadout(this);
      if (!loadout.length) {
        if (this._mmaTechniqueTattooOverlays) {
          this._mmaTechniqueTattooOverlays.forEach(function(overlay) { if (overlay) overlay.setVisible(false); });
        }
        return;
      }

      var overlays = ensureTattooOverlays(this);
      if (!overlays) return;
      var pulse = 0.74 + Math.abs(Math.sin(time * 0.0065)) * 0.26;
      for (var i = 0; i < overlays.length; i++) {
        var overlay = overlays[i];
        if (!overlay) continue;
        var enabled = loadout.indexOf(overlay._mmaTattooType) !== -1;
        overlay.setVisible(enabled);
        if (!enabled) continue;
        overlay.setPosition(this.x, this.y - 1);
        overlay.setDepth((this.depth || 0) + 3 + i);
        overlay.setScale(this.scaleX || 1, this.scaleY || 1);
        overlay.setFlipX(!!this.flipX);
        overlay.setAlpha(0.2 + pulse * 0.22 + i * 0.04);
        overlay.setAngle((this.flipX ? -1 : 1) * i * 2);
      }
      this._mmaTechniqueTattooState = loadout.join(',');
    };

    var originalDestroy = Phaser.Physics.Arcade.Sprite.prototype.destroy;
    Phaser.Physics.Arcade.Sprite.prototype.destroy = function(fromScene) {
      if (this._mmaTechniqueTattooOverlays) {
        this._mmaTechniqueTattooOverlays.forEach(function(overlay) {
          if (overlay) overlay.destroy();
        });
        this._mmaTechniqueTattooOverlays = null;
      }
      return originalDestroy.call(this, fromScene);
    };

    Phaser.Physics.Arcade.Sprite.prototype.getTechniqueTattooState = function() {
      return inferTattooLoadout(this);
    };

    Phaser.Physics.Arcade.Sprite.prototype._mmaTechniqueTattooHookInstalled = true;
  },
  installStyleAuraHook: function() {
    if (Phaser.Physics.Arcade.Sprite.prototype._mmaStyleAuraHookInstalled) return;

    function isGrappleMove(moveKey) {
      return moveKey.indexOf('grapple') !== -1 || moveKey.indexOf('throw') !== -1 || moveKey.indexOf('take') !== -1 || moveKey.indexOf('armbar') !== -1 || moveKey.indexOf('triangle') !== -1 || moveKey.indexOf('clinch') !== -1 || moveKey.indexOf('slam') !== -1 || moveKey.indexOf('suplex') !== -1 || moveKey.indexOf('takedown') !== -1 || moveKey.indexOf('submission') !== -1;
    }

    function readNumber(source, keys) {
      if (!source) return null;
      for (var i = 0; i < keys.length; i++) {
        var value = source[keys[i]];
        if (typeof value === 'number' && !isNaN(value)) return value;
      }
      return null;
    }

    function inferDominantStyle(sprite) {
      if (sprite.dominantStyle) return sprite.dominantStyle;
      if (sprite.stats && sprite.stats.dominantStyle) return sprite.stats.dominantStyle;
      if (sprite.styleGauge && typeof sprite.styleGauge === 'object') {
        if ((sprite.styleGauge.grappler || 0) > (sprite.styleGauge.striker || 0)) return 'grappler';
        if ((sprite.styleGauge.striker || 0) > (sprite.styleGauge.grappler || 0)) return 'striker';
      }
      if (sprite.stats) {
        var strikeStat = readNumber(sprite.stats, ['striker', 'strike', 'striking', 'power']);
        var grappleStat = readNumber(sprite.stats, ['grappler', 'grapple', 'grappling', 'control']);
        if (strikeStat !== null || grappleStat !== null) {
          strikeStat = strikeStat || 0;
          grappleStat = grappleStat || 0;
          if (grappleStat > strikeStat) return 'grappler';
          if (strikeStat > grappleStat) return 'striker';
        }
      }
      var unlockedMoves = sprite.unlockedMoves || (sprite.scene && sprite.scene.player === sprite && sprite.scene.player.unlockedMoves) || [];
      var strikingMoves = 0;
      var grapplingMoves = 0;
      for (var i = 0; i < unlockedMoves.length; i++) {
        var moveKey = String(unlockedMoves[i] || '').toLowerCase();
        if (!moveKey) continue;
        if (isGrappleMove(moveKey)) grapplingMoves++;
        else strikingMoves++;
      }
      if (grapplingMoves > strikingMoves) return 'grappler';
      if (strikingMoves > grapplingMoves) return 'striker';
      return 'balanced';
    }

    function computeAuraIntensity(sprite) {
      var hpRatio = 1;
      if (sprite.stats && sprite.stats.maxHp) hpRatio = Phaser.Math.Clamp(sprite.stats.hp / sprite.stats.maxHp, 0, 1);
      var staminaRatio = 1;
      if (sprite.stats && sprite.stats.maxStamina) staminaRatio = Phaser.Math.Clamp(sprite.stats.stamina / sprite.stats.maxStamina, 0, 1);
      var speed = sprite.body ? Math.abs(sprite.body.velocity.x || 0) + Math.abs(sprite.body.velocity.y || 0) : 0;
      var moveBoost = Phaser.Math.Clamp(speed / 220, 0, 0.35);
      var lowHpBoost = Phaser.Math.Clamp((1 - hpRatio) * 0.55, 0, 0.55);
      var staminaBoost = Phaser.Math.Clamp((1 - staminaRatio) * 0.18, 0, 0.18);
      var attackBoost = sprite._mmaShadowAttackTimer > 0 ? 0.22 : 0;
      return Phaser.Math.Clamp(0.55 + moveBoost + lowHpBoost + staminaBoost + attackBoost, 0.45, 1.45);
    }

    function ensureAura(sprite) {
      if (!sprite || !sprite.scene || !sprite.active) return null;
      if (sprite._mmaStyleAura && sprite._mmaStyleAura.core && sprite._mmaStyleAura.core.active) return sprite._mmaStyleAura;
      var layerKeys = (window.MMA && window.MMA.Sprites && window.MMA.Sprites.AURA_LAYER_TEXTURES && window.MMA.Sprites.AURA_LAYER_TEXTURES.balanced) || { core: 'aura_balanced', ring: 'aura_balanced_ring', flare: 'aura_balanced_flare' };
      var aura = {
        core: sprite.scene.add.image(sprite.x, sprite.y, layerKeys.core),
        ring: sprite.scene.add.image(sprite.x, sprite.y, layerKeys.ring),
        flare: sprite.scene.add.image(sprite.x, sprite.y, layerKeys.flare)
      };
      aura.core.setBlendMode(Phaser.BlendModes.ADD);
      aura.ring.setBlendMode(Phaser.BlendModes.SCREEN);
      aura.flare.setBlendMode(Phaser.BlendModes.ADD);
      aura.core.setVisible(false);
      aura.ring.setVisible(false);
      aura.flare.setVisible(false);
      aura.core._mmaOwner = sprite;
      aura.ring._mmaOwner = sprite;
      aura.flare._mmaOwner = sprite;
      sprite._mmaStyleAura = aura;
      return aura;
    }

    function setAuraVisibility(aura, visible) {
      if (!aura) return;
      aura.core.setVisible(visible);
      aura.ring.setVisible(visible);
      aura.flare.setVisible(visible);
    }

    var originalPreUpdate = Phaser.Physics.Arcade.Sprite.prototype.preUpdate;
    Phaser.Physics.Arcade.Sprite.prototype.preUpdate = function(time, delta) {
      originalPreUpdate.call(this, time, delta);

      if (!this.active || !this.scene || !this._mmaBaseTextureKey) {
        if (this._mmaStyleAura) setAuraVisibility(this._mmaStyleAura, false);
        return;
      }
      var auraTextureLayers = window.MMA && window.MMA.Sprites && window.MMA.Sprites.AURA_LAYER_TEXTURES;
      if (!auraTextureLayers) return;
      var wantsAura = !!(this === this.scene.player || this.stats || this.dominantStyle || this.unlockedMoves || this.styleGauge);
      if (!wantsAura) return;

      var styleKey = inferDominantStyle(this);
      var auraTextures = auraTextureLayers[styleKey] || auraTextureLayers.balanced;
      var aura = ensureAura(this);
      if (!aura) return;

      setAuraVisibility(aura, true);
      if (aura.core.texture && aura.core.texture.key !== auraTextures.core) aura.core.setTexture(auraTextures.core);
      if (aura.ring.texture && aura.ring.texture.key !== auraTextures.ring) aura.ring.setTexture(auraTextures.ring);
      if (aura.flare.texture && aura.flare.texture.key !== auraTextures.flare) aura.flare.setTexture(auraTextures.flare);

      var pulse = 0.78 + Math.abs(Math.sin(time * 0.006)) * 0.22;
      var swirl = Math.sin(time * 0.0035);
      var intensity = computeAuraIntensity(this);
      var baseScaleX = (this.scaleX || 1);
      var baseScaleY = (this.scaleY || 1);
      var auraY = this.y + 2;
      var ringY = auraY + Math.sin(time * 0.004) * 1.5;
      var flareY = auraY - 2 - Math.abs(Math.sin(time * 0.008)) * 2;

      aura.core.setPosition(this.x, auraY);
      aura.ring.setPosition(this.x, ringY);
      aura.flare.setPosition(this.x, flareY);

      aura.core.setDepth((this.depth || 0) - 1);
      aura.ring.setDepth((this.depth || 0) - 2);
      aura.flare.setDepth((this.depth || 0) - 3);

      aura.core.setFlipX(!!this.flipX);
      aura.ring.setFlipX(!!this.flipX);
      aura.flare.setFlipX(!!this.flipX);

      aura.core.setScale(baseScaleX * (1.16 + pulse * 0.08), baseScaleY * (1.04 + pulse * 0.06));
      aura.ring.setScale(baseScaleX * (1.24 + intensity * 0.1), baseScaleY * (1.12 + intensity * 0.08));
      aura.flare.setScale(baseScaleX * (1.04 + intensity * 0.06), baseScaleY * (0.94 + intensity * 0.12));

      aura.core.setAlpha(0.18 + pulse * 0.18 + intensity * 0.1);
      aura.ring.setAlpha(0.14 + pulse * 0.12 + intensity * 0.08);
      aura.flare.setAlpha(0.08 + Math.abs(swirl) * 0.16 + intensity * 0.1);
      aura.ring.setAngle(swirl * 4);
      aura.flare.setAngle(swirl * 7);
      this._mmaStyleAuraKey = styleKey;
    };

    var originalDestroy = Phaser.Physics.Arcade.Sprite.prototype.destroy;
    Phaser.Physics.Arcade.Sprite.prototype.destroy = function(fromScene) {
      if (this._mmaStyleAura) {
        this._mmaStyleAura.core.destroy();
        this._mmaStyleAura.ring.destroy();
        this._mmaStyleAura.flare.destroy();
        this._mmaStyleAura = null;
      }
      return originalDestroy.call(this, fromScene);
    };

    Phaser.Physics.Arcade.Sprite.prototype._mmaStyleAuraHookInstalled = true;
  },
  installBossChromaAuraHook: function() {
    if (Phaser.Physics.Arcade.Sprite.prototype._mmaBossChromaAuraHookInstalled) return;

    function getBossAuraConfigs() {
      return (window.MMA && window.MMA.Sprites && window.MMA.Sprites.BOSS_AURA_CONFIGS) || {};
    }

    function getBossAuraLayers(key) {
      return {
        core: 'boss_aura_' + key,
        ring: 'boss_aura_' + key + '_ring',
        flare: 'boss_aura_' + key + '_flare'
      };
    }

    function normalizeToken(value) {
      return String(value || '').toLowerCase();
    }

    function spriteHasBossIdentity(sprite) {
      if (!sprite) return false;
      if (sprite.isBoss || sprite.isRival || sprite.isShadow) return true;
      var values = [
        sprite.typeKey,
        sprite.role,
        sprite.npcRole,
        sprite.enemyClass,
        sprite.archetype,
        sprite.title,
        sprite.bossTitle,
        sprite.name,
        sprite.displayName,
        sprite.meta && sprite.meta.role,
        sprite.meta && sprite.meta.typeKey,
        sprite.meta && sprite.meta.archetype,
        sprite.meta && sprite.meta.title,
        sprite.meta && sprite.meta.bossTitle,
        sprite.meta && sprite.meta.name
      ];
      if (sprite.data && typeof sprite.data.get === 'function') {
        values.push(sprite.data.get('role'));
        values.push(sprite.data.get('typeKey'));
        values.push(sprite.data.get('archetype'));
        values.push(sprite.data.get('title'));
        values.push(sprite.data.get('bossTitle'));
        values.push(sprite.data.get('name'));
      }
      for (var i = 0; i < values.length; i++) {
        var token = normalizeToken(values[i]);
        if (token && (token.indexOf('boss') !== -1 || token.indexOf('champion') !== -1 || token.indexOf('king') !== -1 || token.indexOf('rival') !== -1 || token.indexOf('shadow') !== -1)) {
          return true;
        }
      }
      return false;
    }

    function resolveBossAuraKey(sprite) {
      if (!sprite || !spriteHasBossIdentity(sprite)) return null;
      var configs = getBossAuraConfigs();
      var values = [
        sprite.typeKey,
        sprite.role,
        sprite.npcRole,
        sprite.enemyClass,
        sprite.archetype,
        sprite.title,
        sprite.bossTitle,
        sprite.name,
        sprite.displayName,
        sprite._mmaVisualBaseKey,
        sprite._mmaBaseTextureKey,
        sprite.meta && sprite.meta.role,
        sprite.meta && sprite.meta.typeKey,
        sprite.meta && sprite.meta.archetype,
        sprite.meta && sprite.meta.title,
        sprite.meta && sprite.meta.bossTitle,
        sprite.meta && sprite.meta.name
      ];
      if (sprite.data && typeof sprite.data.get === 'function') {
        values.push(sprite.data.get('role'));
        values.push(sprite.data.get('typeKey'));
        values.push(sprite.data.get('archetype'));
        values.push(sprite.data.get('title'));
        values.push(sprite.data.get('bossTitle'));
        values.push(sprite.data.get('name'));
      }
      for (var i = 0; i < values.length; i++) {
        var token = normalizeToken(values[i]);
        if (!token) continue;
        if (token.indexOf('shadow') !== -1 || token.indexOf('rival') !== -1) return configs.shadowRival ? 'shadowRival' : null;
        if (token.indexOf('underground') !== -1 || token.indexOf('king') !== -1 || token.indexOf('cage') !== -1) return configs.undergroundKing ? 'undergroundKing' : null;
        if (token.indexOf('champion') !== -1 || token.indexOf('belt') !== -1 || token.indexOf('title') !== -1) return configs.champion ? 'champion' : null;
      }
      if (sprite.isShadow || sprite.isRival) return configs.shadowRival ? 'shadowRival' : null;
      if (sprite._mmaVisualBaseKey === 'enemy_shadow_boss') return configs.shadowRival ? 'shadowRival' : null;
      if (sprite._mmaVisualBaseKey === 'enemy_underground_king_boss') return configs.undergroundKing ? 'undergroundKing' : null;
      if (sprite._mmaVisualBaseKey === 'enemy_champion_boss' || sprite._mmaVisualBaseKey === 'enemy_brawler_boss') return configs.champion ? 'champion' : null;
      return configs.champion ? 'champion' : null;
    }

    function ensureBossAura(sprite, auraKey) {
      if (!sprite || !sprite.scene || !sprite.active || !auraKey) return null;
      if (sprite._mmaBossChromaAura && sprite._mmaBossChromaAura.core && sprite._mmaBossChromaAura.core.active) return sprite._mmaBossChromaAura;
      var layers = getBossAuraLayers(auraKey);
      var aura = {
        core: sprite.scene.add.image(sprite.x, sprite.y, layers.core),
        ring: sprite.scene.add.image(sprite.x, sprite.y, layers.ring),
        flare: sprite.scene.add.image(sprite.x, sprite.y, layers.flare)
      };
      aura.core.setBlendMode(Phaser.BlendModes.ADD);
      aura.ring.setBlendMode(Phaser.BlendModes.SCREEN);
      aura.flare.setBlendMode(Phaser.BlendModes.ADD);
      aura.core.setVisible(false);
      aura.ring.setVisible(false);
      aura.flare.setVisible(false);
      aura.core._mmaOwner = sprite;
      aura.ring._mmaOwner = sprite;
      aura.flare._mmaOwner = sprite;
      sprite._mmaBossChromaAura = aura;
      return aura;
    }

    function setAuraVisible(aura, visible) {
      if (!aura) return;
      aura.core.setVisible(visible);
      aura.ring.setVisible(visible);
      aura.flare.setVisible(visible);
    }

    var originalPreUpdate = Phaser.Physics.Arcade.Sprite.prototype.preUpdate;
    Phaser.Physics.Arcade.Sprite.prototype.preUpdate = function(time, delta) {
      originalPreUpdate.call(this, time, delta);

      if (!this.active || !this.scene || !this._mmaBaseTextureKey) {
        if (this._mmaBossChromaAura) setAuraVisible(this._mmaBossChromaAura, false);
        return;
      }

      var auraKey = resolveBossAuraKey(this);
      if (!auraKey) {
        if (this._mmaBossChromaAura) setAuraVisible(this._mmaBossChromaAura, false);
        return;
      }

      var configs = getBossAuraConfigs();
      var cfg = configs[auraKey];
      if (!cfg) return;
      var layers = getBossAuraLayers(auraKey);
      var aura = ensureBossAura(this, auraKey);
      if (!aura) return;
      setAuraVisible(aura, true);

      if (aura.core.texture && aura.core.texture.key !== layers.core) aura.core.setTexture(layers.core);
      if (aura.ring.texture && aura.ring.texture.key !== layers.ring) aura.ring.setTexture(layers.ring);
      if (aura.flare.texture && aura.flare.texture.key !== layers.flare) aura.flare.setTexture(layers.flare);

      var hpRatio = 1;
      if (this.stats && this.stats.maxHp) hpRatio = Phaser.Math.Clamp(this.stats.hp / this.stats.maxHp, 0, 1);
      var lowHpBoost = (1 - hpRatio);
      var pulseSpeed = (cfg.pulseSpeed || 0.005) + lowHpBoost * (cfg.hpPulseBoost || 0.01);
      var pulse = 0.72 + Math.abs(Math.sin(time * pulseSpeed)) * (0.26 + lowHpBoost * 0.18);
      var crackle = Math.sin(time * (pulseSpeed * 1.7) + this.x * 0.06);
      var jitter = (cfg.staticJitter || 0) * lowHpBoost;
      var xJitter = jitter ? crackle * jitter : 0;
      var yJitter = jitter ? Math.cos(time * (pulseSpeed * 2.1)) * (jitter * 0.7) : 0;
      var bob = Math.sin(time * (pulseSpeed * 0.9)) * (cfg.bob || 1.5);
      var baseScaleX = this.scaleX || 1;
      var baseScaleY = this.scaleY || 1;
      var baseDepth = (this.depth || 0) - 2;

      aura.core.setPosition(this.x + xJitter, this.y + bob + yJitter);
      aura.ring.setPosition(this.x - xJitter * 0.5, this.y + bob * 0.8);
      aura.flare.setPosition(this.x + xJitter * 1.2, this.y - 2 + yJitter);
      aura.core.setDepth(baseDepth);
      aura.ring.setDepth(baseDepth - 1);
      aura.flare.setDepth(baseDepth - 2);
      aura.core.setFlipX(!!this.flipX);
      aura.ring.setFlipX(!!this.flipX);
      aura.flare.setFlipX(!!this.flipX);

      aura.core.setScale(baseScaleX * ((cfg.scale || 1.22) + pulse * 0.06), baseScaleY * (((cfg.scale || 1.22) - 0.12) + pulse * 0.05));
      aura.ring.setScale(baseScaleX * ((cfg.ringScale || 1.3) + pulse * 0.08), baseScaleY * (((cfg.ringScale || 1.3) - 0.14) + pulse * 0.06));
      aura.flare.setScale(baseScaleX * ((cfg.flareScale || 1.14) + lowHpBoost * 0.08), baseScaleY * (((cfg.flareScale || 1.14) - 0.08) + pulse * 0.07));
      aura.core.setAlpha((cfg.alpha || 0.24) + pulse * 0.14 + lowHpBoost * 0.12);
      aura.ring.setAlpha((cfg.ringAlpha || 0.2) + Math.abs(crackle) * 0.1 + lowHpBoost * 0.14);
      aura.flare.setAlpha((cfg.flareAlpha || 0.16) + pulse * 0.08 + lowHpBoost * 0.12);
      aura.core.setTint(cfg.color || 0xffffff);
      aura.ring.setTint(cfg.glow || cfg.color || 0xffffff);
      aura.flare.setTint(cfg.color || 0xffffff);
      aura.ring.setAngle(crackle * (cfg.rotation || 3));
      aura.flare.setAngle(-crackle * ((cfg.rotation || 3) + 1.5));
      this._mmaBossAuraKey = auraKey;
    };

    var originalDestroy = Phaser.Physics.Arcade.Sprite.prototype.destroy;
    Phaser.Physics.Arcade.Sprite.prototype.destroy = function(fromScene) {
      if (this._mmaBossChromaAura) {
        this._mmaBossChromaAura.core.destroy();
        this._mmaBossChromaAura.ring.destroy();
        this._mmaBossChromaAura.flare.destroy();
        this._mmaBossChromaAura = null;
      }
      return originalDestroy.call(this, fromScene);
    };

    Phaser.Physics.Arcade.Sprite.prototype._mmaBossChromaAuraHookInstalled = true;
  },
  installImpactSweatHook: function() {
    if (window.MMA && window.MMA.Combat && window.MMA.Combat._mmaImpactSweatHookInstalled) return;
    if (!window.MMA || !window.MMA.Combat) return;

    function getImpactTextures() {
      return (window.MMA && window.MMA.Sprites && window.MMA.Sprites.IMPACT_PARTICLE_TEXTURES) || {};
    }

    function readComboCount(scene) {
      return (scene && scene.player && scene.player.comboState && typeof scene.player.comboState.index === 'number') ? scene.player.comboState.index : 1;
    }

    function spawnSweatBurst(scene, attacker, defender, damage, moveKey, comboCount, isSpecial) {
      if (!scene || !scene.add || !scene.tweens || !defender || !defender.active) return;
      var textures = getImpactTextures();
      var heavy = !!(isSpecial || comboCount >= 6 || damage >= 18);
      var textureKey = heavy ? (textures.heavySweat || textures.sweat) : textures.sweat;
      if (!textureKey) return;

      var dirX = 0;
      var dirY = -1;
      if (attacker && defender) {
        dirX = defender.x - attacker.x;
        dirY = defender.y - attacker.y;
        var len = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
        dirX /= len;
        dirY /= len;
      }
      var spread = Math.min(18, 8 + comboCount * 0.8 + (isSpecial ? 4 : 0));
      var droplets = Math.max(4, Math.min(14, 4 + Math.floor(comboCount / 2) + (heavy ? 3 : 0)));
      var originX = defender.x - dirX * 10;
      var originY = defender.y - 18 - Math.max(0, dirY) * 6;
      for (var i = 0; i < droplets; i++) {
        var droplet = scene.add.image(originX, originY, textureKey);
        var angle = Phaser.Math.FloatBetween(-spread, spread);
        var speed = Phaser.Math.Between(35, heavy ? 135 : 95) + comboCount * 4;
        var velocity = new Phaser.Math.Vector2(dirX || 0, dirY || -1).rotate(Phaser.Math.DegToRad(angle)).scale(speed);
        var driftX = velocity.x + Phaser.Math.Between(-16, 16);
        var driftY = velocity.y - Phaser.Math.Between(10, heavy ? 34 : 22);
        var scale = Phaser.Math.FloatBetween(heavy ? 0.5 : 0.38, heavy ? 0.95 : 0.72);
        droplet.setDepth((defender.depth || 0) + 5);
        droplet.setScale(scale);
        droplet.setRotation(Phaser.Math.FloatBetween(-0.6, 0.6));
        droplet.setAlpha(heavy ? 0.92 : 0.78);
        if (heavy && i % 3 === 0) droplet.setTint(0xe8f7ff);
        scene.tweens.add({
          targets: droplet,
          x: originX + driftX,
          y: originY + driftY + Phaser.Math.Between(-6, 8),
          alpha: 0,
          scaleX: scale * 0.55,
          scaleY: scale * 0.55,
          angle: droplet.angle + Phaser.Math.Between(-90, 90),
          duration: Phaser.Math.Between(180, heavy ? 360 : 280),
          ease: 'Quad.easeOut',
          onComplete: function(tween, targets) {
            if (targets && targets[0]) targets[0].destroy();
          }
        });
      }

      if (comboCount >= 5 && window.MMA && window.MMA.UI && typeof MMA.UI.showDamageText === 'function') {
        var label = comboCount >= 10 ? 'SWEAT STORM!' : 'SWEAT SHOWER!';
        MMA.UI.showDamageText(scene, defender.x, defender.y - 96, label, heavy ? '#d7f0ff' : '#b8e8ff');
      }
      defender._mmaLastImpactSweatAt = scene.time && typeof scene.time.now === 'number' ? scene.time.now : 0;
      defender._mmaLastImpactMove = moveKey || null;
    }

    function snapshotEnemyHealth(scene) {
      var enemies = (scene && scene.enemyGroup && typeof scene.enemyGroup.getChildren === 'function') ? scene.enemyGroup.getChildren() : [];
      return enemies.map(function(enemy) {
        return {
          enemy: enemy,
          hp: enemy && enemy.stats && typeof enemy.stats.hp === 'number' ? enemy.stats.hp : null
        };
      });
    }

    function applyImpactSweat(scene, beforeState, moveKey, isSpecial) {
      if (!scene || !scene.player) return;
      var comboCount = readComboCount(scene);
      for (var i = 0; i < beforeState.length; i++) {
        var entry = beforeState[i];
        var enemy = entry.enemy;
        if (!enemy || !enemy.active || !enemy.stats || typeof entry.hp !== 'number' || typeof enemy.stats.hp !== 'number') continue;
        var dealt = Math.max(0, entry.hp - enemy.stats.hp);
        if (dealt <= 0) continue;
        spawnSweatBurst(scene, scene.player, enemy, dealt, moveKey, comboCount, isSpecial);
      }
    }

    function wrapCombatMethod(methodName, moveResolver, isSpecialResolver) {
      var original = window.MMA.Combat[methodName];
      if (typeof original !== 'function' || original._mmaImpactSweatWrapped) return;
      var wrapped = function(scene) {
        var before = snapshotEnemyHealth(scene);
        var result = original.apply(this, arguments);
        applyImpactSweat(scene, before, moveResolver ? moveResolver.apply(this, arguments) : methodName, isSpecialResolver ? isSpecialResolver.apply(this, arguments) : false);
        return result;
      };
      wrapped._mmaImpactSweatWrapped = true;
      window.MMA.Combat[methodName] = wrapped;
    }

    wrapCombatMethod('executeMove', function(scene, moveKey) { return moveKey; }, function(scene, moveKey) { return moveKey === 'special'; });
    wrapCombatMethod('executeSpecialMove', function() { return 'special'; }, function() { return true; });
    wrapCombatMethod('executeGroundMove', function(scene, moveKey) { return moveKey; }, function(scene, moveKey) { return moveKey === 'special' || moveKey === 'submission'; });

    window.MMA.Combat._mmaImpactSweatHookInstalled = true;
  },

  installComboFireTrailHook: function() {
    if (window.MMA && window.MMA.Combat && window.MMA.Combat._mmaComboFireTrailHookInstalled) return;
    if (!window.MMA || !window.MMA.Combat) return;

    function getFireTextures() {
      return (window.MMA && window.MMA.Sprites && window.MMA.Sprites.FIRE_TRAIL_TEXTURES) || {};
    }

    function readComboCount(scene) {
      return (scene && scene.player && scene.player.comboState && typeof scene.player.comboState.index === 'number') ? scene.player.comboState.index : 0;
    }

    function spawnFireTrail(scene, actor, comboCount, moveKey, isSpecial) {
      if (!scene || !scene.add || !scene.tweens || !actor || !actor.active || comboCount < 10) return;
      var textures = getFireTextures();
      var heavy = !!(isSpecial || comboCount >= 15);
      var textureKey = heavy ? (textures.hot || textures.combo) : textures.combo;
      if (!textureKey) return;

      var dirX = actor.flipX ? -1 : 1;
      if (actor.body && Math.abs(actor.body.velocity.x) > 6) dirX = Math.sign(actor.body.velocity.x);
      if (!dirX) dirX = 1;
      var intensity = Math.min(1, (comboCount - 10) / 10);
      var flames = 3 + Math.min(7, Math.floor((comboCount - 10) / 2)) + (heavy ? 2 : 0);
      var anchorX = actor.x - (dirX * (14 + comboCount * 0.25));
      var anchorY = actor.y - 18;

      for (var i = 0; i < flames; i++) {
        var flame = scene.add.image(anchorX + Phaser.Math.Between(-4, 4), anchorY + Phaser.Math.Between(-10, 10), textureKey);
        var scale = Phaser.Math.FloatBetween(0.35, heavy ? 0.95 : 0.75) + intensity * 0.18;
        flame.setDepth((actor.depth || 0) + 3);
        flame.setBlendMode(Phaser.BlendModes.ADD);
        flame.setScale(scale);
        flame.setAlpha(0.68 + intensity * 0.24);
        flame.setAngle(dirX < 0 ? Phaser.Math.Between(-25, 8) : Phaser.Math.Between(-8, 25));
        if (heavy && i % 2 === 0) flame.setTint(0xffb36b);
        scene.tweens.add({
          targets: flame,
          x: flame.x - dirX * Phaser.Math.Between(14, 28),
          y: flame.y + Phaser.Math.Between(-18, 12),
          alpha: 0,
          scaleX: scale * 0.35,
          scaleY: scale * 0.2,
          angle: flame.angle + Phaser.Math.Between(-20, 20),
          duration: Phaser.Math.Between(140, heavy ? 240 : 190),
          ease: 'Quad.easeOut',
          onComplete: function(tween, targets) {
            if (targets && targets[0]) targets[0].destroy();
          }
        });
      }

      if (!actor._mmaComboFireTrailLastLabel || actor._mmaComboFireTrailLastLabel + 900 < (scene.time && scene.time.now || 0)) {
        if (window.MMA && window.MMA.UI && typeof MMA.UI.showDamageText === 'function') {
          MMA.UI.showDamageText(scene, actor.x, actor.y - 88, comboCount >= 15 ? 'INFERNO COMBO!' : 'FIRE TRAIL!', heavy ? '#ffcf8a' : '#ff9d57');
        }
        actor._mmaComboFireTrailLastLabel = scene.time && typeof scene.time.now === 'number' ? scene.time.now : 0;
      }
      actor._mmaComboFireTrailMove = moveKey || null;
    }

    function wrapCombatMethod(methodName, moveResolver, specialResolver) {
      var original = window.MMA.Combat[methodName];
      if (typeof original !== 'function' || original._mmaComboFireTrailWrapped) return;
      var wrapped = function(scene) {
        var result = original.apply(this, arguments);
        var comboCount = readComboCount(scene);
        spawnFireTrail(scene, scene && scene.player, comboCount, moveResolver ? moveResolver.apply(this, arguments) : methodName, specialResolver ? specialResolver.apply(this, arguments) : false);
        return result;
      };
      wrapped._mmaComboFireTrailWrapped = true;
      window.MMA.Combat[methodName] = wrapped;
    }

    wrapCombatMethod('executeMove', function(scene, moveKey) { return moveKey; }, function(scene, moveKey) { return moveKey === 'special'; });
    wrapCombatMethod('executeSpecialMove', function() { return 'special'; }, function() { return true; });
    wrapCombatMethod('executeGroundMove', function(scene, moveKey) { return moveKey; }, function(scene, moveKey) { return moveKey === 'special' || moveKey === 'submission'; });

    window.MMA.Combat._mmaComboFireTrailHookInstalled = true;
  },
  installArenaFootworkTrailHook: function() {
    if (Phaser.Physics.Arcade.Sprite.prototype._mmaArenaFootworkTrailHookInstalled) return;

    function getFootworkTextures() {
      return (window.MMA && window.MMA.Sprites && window.MMA.Sprites.FOOTWORK_TEXTURES) || {};
    }

    function inferArenaSurface(scene, sprite) {
      var values = [
        scene && scene.zoneKey,
        scene && scene.zoneId,
        scene && scene.zoneType,
        scene && scene.roomTheme,
        scene && scene.roomType,
        scene && scene.arenaType,
        sprite && sprite.zoneKey,
        sprite && sprite.role,
        sprite && sprite.meta && sprite.meta.zoneKey,
        sprite && sprite.meta && sprite.meta.roomType
      ];
      for (var i = 0; i < values.length; i++) {
        var token = String(values[i] || '').toLowerCase();
        if (!token) continue;
        if (token.indexOf('arena') !== -1 || token.indexOf('cage') !== -1 || token.indexOf('ring') !== -1 || token.indexOf('champion') !== -1 || token.indexOf('underground') !== -1) {
          return true;
        }
      }
      return false;
    }

    function shouldTrail(sprite) {
      if (!sprite || !sprite.active || !sprite.scene || !sprite.body || !sprite._mmaBaseTextureKey) return false;
      return inferArenaSurface(sprite.scene, sprite);
    }

    function spawnDust(scene, sprite, intensity, leftStep) {
      var textures = getFootworkTextures();
      var textureKey = intensity > 0.72 ? (textures.heavyDust || textures.dust) : textures.dust;
      if (!scene || !scene.add || !scene.tweens || !textureKey) return;
      var dir = sprite.flipX ? -1 : 1;
      if (sprite.body && Math.abs(sprite.body.velocity.x) > 6) dir = Math.sign(sprite.body.velocity.x) || dir;
      var footX = sprite.x + (leftStep ? -8 : 8) - dir * 5;
      var footY = sprite.y + 18;
      var dust = scene.add.image(footX + Phaser.Math.Between(-2, 2), footY + Phaser.Math.Between(-1, 2), textureKey);
      dust.setDepth((sprite.depth || 0) - 1);
      dust.setBlendMode(Phaser.BlendModes.SCREEN);
      var scale = Phaser.Math.FloatBetween(0.4, 0.68) + intensity * 0.32;
      dust.setScale(scale);
      dust.setAlpha(0.24 + intensity * 0.42);
      dust.setAngle(Phaser.Math.Between(-16, 16));
      scene.tweens.add({
        targets: dust,
        x: dust.x - dir * Phaser.Math.Between(5, 12),
        y: dust.y - Phaser.Math.Between(6, 12),
        alpha: 0,
        scaleX: scale * (1.35 + intensity * 0.4),
        scaleY: scale * (1.15 + intensity * 0.3),
        duration: Phaser.Math.Between(220, 360),
        ease: 'Quad.easeOut',
        onComplete: function(tween, targets) {
          if (targets && targets[0]) targets[0].destroy();
        }
      });
    }

    function spawnFootprint(scene, sprite, intensity, leftStep) {
      var textures = getFootworkTextures();
      var textureKey = leftStep ? textures.leftPrint : textures.rightPrint;
      if (!scene || !scene.add || !scene.tweens || !textureKey) return;
      var print = scene.add.image(sprite.x + (leftStep ? -7 : 7), sprite.y + 21, textureKey);
      print.setDepth((sprite.depth || 0) - 3);
      print.setRotation((sprite.flipX ? -1 : 1) * Phaser.Math.FloatBetween(-0.12, 0.12));
      print.setScale(0.72 + intensity * 0.26);
      print.setAlpha(0.14 + intensity * 0.2);
      scene.tweens.add({
        targets: print,
        alpha: 0,
        duration: 2000,
        ease: 'Sine.easeOut',
        onComplete: function(tween, targets) {
          if (targets && targets[0]) targets[0].destroy();
        }
      });
    }

    var originalPreUpdate = Phaser.Physics.Arcade.Sprite.prototype.preUpdate;
    Phaser.Physics.Arcade.Sprite.prototype.preUpdate = function(time, delta) {
      originalPreUpdate.call(this, time, delta);

      if (!shouldTrail(this)) return;

      var speed = Math.sqrt(Math.pow(this.body.velocity.x || 0, 2) + Math.pow(this.body.velocity.y || 0, 2));
      if (speed < 40) return;

      var now = this.scene && this.scene.time && typeof this.scene.time.now === 'number' ? this.scene.time.now : time;
      var normalized = Phaser.Math.Clamp((speed - 40) / 180, 0, 1);
      var cadence = Phaser.Math.Linear(320, 90, normalized);
      if (this._mmaFootworkTrailNextAt && now < this._mmaFootworkTrailNextAt) return;

      this._mmaFootworkTrailNextAt = now + cadence;
      this._mmaFootworkLeftStep = !this._mmaFootworkLeftStep;
      var leftStep = !!this._mmaFootworkLeftStep;
      spawnDust(this.scene, this, normalized, leftStep);
      spawnFootprint(this.scene, this, normalized, leftStep);
      this._mmaLastFootworkSpeed = speed;
    };

    Phaser.Physics.Arcade.Sprite.prototype._mmaArenaFootworkTrailHookInstalled = true;
  },
  installShadowDoubleHook: function() {
    if (Phaser.Physics.Arcade.Sprite.prototype._mmaShadowDoubleHookInstalled) return;

    function getShadowConfig() {
      return (window.MMA && window.MMA.Sprites && window.MMA.Sprites.SHADOW_DOUBLE_CONFIG) || {};
    }

    function isRageModeActive(sprite) {
      var cfg = getShadowConfig();
      var threshold = typeof cfg.healthThreshold === 'number' ? cfg.healthThreshold : 0.35;
      if (sprite._mmaRageMode) return true;
      if (!sprite.stats || !sprite.stats.maxHp) return false;
      return (sprite.stats.hp / sprite.stats.maxHp) <= threshold;
    }

    Phaser.Physics.Arcade.Sprite.prototype.isShadowDoubleRageActive = function() {
      return isRageModeActive(this);
    };

    Phaser.Physics.Arcade.Sprite.prototype.getShadowDoubleDamageMultiplier = function() {
      var cfg = getShadowConfig();
      return typeof cfg.damageMultiplier === 'number' ? cfg.damageMultiplier : 0.3;
    };

    Phaser.Physics.Arcade.Sprite.prototype.canTriggerShadowDoubleDamage = function(now) {
      if (!this.isShadowDoubleRageActive || !this.isShadowDoubleRageActive()) return false;
      var cfg = getShadowConfig();
      var cooldown = typeof cfg.procCooldown === 'number' ? cfg.procCooldown : 240;
      var timeNow = typeof now === 'number' ? now : 0;
      return !this._mmaShadowDamageLockedUntil || this._mmaShadowDamageLockedUntil <= timeNow;
    };

    Phaser.Physics.Arcade.Sprite.prototype.lockShadowDoubleDamage = function(now) {
      var cfg = getShadowConfig();
      var cooldown = typeof cfg.procCooldown === 'number' ? cfg.procCooldown : 240;
      this._mmaShadowDamageLockedUntil = (typeof now === 'number' ? now : 0) + cooldown;
      return this._mmaShadowDamageLockedUntil;
    };

    function detectAttackBurst(sprite, delta) {
      var cooldowns = sprite.cooldowns;
      if (!cooldowns) return false;
      var prev = sprite._mmaShadowCooldownSnapshot || {};
      var attackStarted = false;
      Object.keys(cooldowns).forEach(function(key) {
        var nextValue = cooldowns[key] || 0;
        var prevValue = prev[key] || 0;
        if (nextValue > prevValue + 120) attackStarted = true;
        prev[key] = nextValue;
      });
      sprite._mmaShadowCooldownSnapshot = prev;
      if (attackStarted) sprite._mmaShadowAttackTimer = 220;
      if (sprite._mmaShadowAttackTimer > 0) {
        sprite._mmaShadowAttackTimer = Math.max(0, sprite._mmaShadowAttackTimer - (delta || 0));
        return true;
      }
      return false;
    }

    function ensureShadowDouble(sprite) {
      if (!sprite || !sprite.scene || !sprite.active) return null;
      if (sprite._mmaShadowDouble && sprite._mmaShadowDouble.active) return sprite._mmaShadowDouble;
      var textureKey = (sprite.texture && sprite.texture.key) || sprite._mmaCurrentVisualKey || sprite._mmaBaseTextureKey || 'player';
      var shadow = sprite.scene.add.image(sprite.x, sprite.y, textureKey);
      shadow.setDepth((sprite.depth || 0) - 2);
      shadow.setBlendMode(Phaser.BlendModes.SCREEN);
      shadow.setVisible(false);
      shadow._mmaOwner = sprite;
      sprite._mmaShadowDouble = shadow;
      return shadow;
    }

    var originalPreUpdate = Phaser.Physics.Arcade.Sprite.prototype.preUpdate;
    Phaser.Physics.Arcade.Sprite.prototype.preUpdate = function(time, delta) {
      originalPreUpdate.call(this, time, delta);

      var isPlayer = !!(this.scene && this.scene.player === this);
      if (!this.active || !this.scene || !this._mmaBaseTextureKey || !isPlayer) {
        if (this._mmaShadowDouble) this._mmaShadowDouble.setVisible(false);
        return;
      }

      var rageActive = isRageModeActive(this);
      var shadow = ensureShadowDouble(this);
      if (!shadow) return;
      if (!rageActive) {
        shadow.setVisible(false);
        return;
      }

      var cfg = getShadowConfig();
      var attackBurst = detectAttackBurst(this, delta);
      var moveDir = this.flipX ? -1 : 1;
      var travelX = this.body && Math.abs(this.body.velocity.x) > 8 ? Math.sign(this.body.velocity.x) : moveDir;
      if (!travelX) travelX = moveDir || 1;
      var baseOffsetX = attackBurst ? (cfg.attackOffsetX || 22) : (cfg.offsetX || 14);
      var offsetX = -travelX * baseOffsetX;
      var bobY = Math.sin(time * 0.01) * (cfg.bobY || 2);
      var textureKey = (this.texture && this.texture.key) || this._mmaCurrentVisualKey || this._mmaBaseTextureKey;
      if (textureKey && shadow.texture && shadow.texture.key !== textureKey) shadow.setTexture(textureKey);
      shadow.setVisible(true);
      shadow.setPosition(this.x + offsetX, this.y + bobY);
      shadow.setScale(this.scaleX || 1, this.scaleY || 1);
      shadow.setFlipX(!this.flipX);
      shadow.setTint(attackBurst ? (cfg.trailTint || 0xc7b8ff) : (cfg.tint || 0x8a5cff));
      shadow.setAlpha(attackBurst ? (cfg.attackAlpha || 0.62) : (cfg.alpha || 0.42));
      shadow.setDepth((this.depth || 0) - 2);
      shadow.setAngle(attackBurst ? (travelX < 0 ? -6 : 6) : 0);
    };

    var originalDestroy = Phaser.Physics.Arcade.Sprite.prototype.destroy;
    Phaser.Physics.Arcade.Sprite.prototype.destroy = function(fromScene) {
      if (this._mmaShadowDouble) {
        this._mmaShadowDouble.destroy();
        this._mmaShadowDouble = null;
      }
      return originalDestroy.call(this, fromScene);
    };

    Phaser.Physics.Arcade.Sprite.prototype._mmaShadowDoubleHookInstalled = true;
  },
  installShadowDoubleDamageHook: function() {
    if (window.MMA && window.MMA.Combat && window.MMA.Combat._mmaShadowDoubleDamageHookInstalled) return;
    if (!window.MMA || !window.MMA.Combat) return;

    function getShadowConfig() {
      return (window.MMA && window.MMA.Sprites && window.MMA.Sprites.SHADOW_DOUBLE_CONFIG) || {};
    }

    function isRagePlayer(scene) {
      var player = scene && scene.player;
      return !!(player && typeof player.isShadowDoubleRageActive === 'function' && player.isShadowDoubleRageActive());
    }

    function snapshotEnemyHealth(scene) {
      var enemies = (scene && scene.enemyGroup && typeof scene.enemyGroup.getChildren === 'function') ? scene.enemyGroup.getChildren() : [];
      return enemies.map(function(enemy) {
        return {
          enemy: enemy,
          hp: enemy && enemy.stats && typeof enemy.stats.hp === 'number' ? enemy.stats.hp : null
        };
      });
    }

    function applyShadowEchoDamage(scene, beforeState, moveKey) {
      if (!scene || !scene.player || !isRagePlayer(scene)) return;
      var player = scene.player;
      var now = scene.time && typeof scene.time.now === 'number' ? scene.time.now : 0;
      if (typeof player.canTriggerShadowDoubleDamage === 'function' && !player.canTriggerShadowDoubleDamage(now)) return;

      var cfg = getShadowConfig();
      var bonusMultiplier = typeof player.getShadowDoubleDamageMultiplier === 'function' ? player.getShadowDoubleDamageMultiplier() : 0.3;
      var applied = false;
      for (var i = 0; i < beforeState.length; i++) {
        var entry = beforeState[i];
        var enemy = entry.enemy;
        if (!enemy || !enemy.active || !enemy.stats || typeof entry.hp !== 'number' || typeof enemy.stats.hp !== 'number') continue;
        var dealt = Math.max(0, entry.hp - enemy.stats.hp);
        if (dealt <= 0) continue;

        var echoDamage = Math.max(1, Math.round(dealt * bonusMultiplier));
        enemy.stats.hp -= echoDamage;
        applied = true;
        player.lockShadowDoubleDamage(now);

        MMA.UI.recordHitDealt(echoDamage, false, 1);
        MMA.UI.showDamageText(scene, enemy.x, enemy.y - 52, 'SHADOW DOUBLE!', '#cdb7ff');
        MMA.UI.showDamageText(scene, enemy.x, enemy.y - 34, '-' + echoDamage, '#b58cff');
        if (window.sfx && typeof window.sfx.hit === 'function') window.sfx.hit();
        if (window.MMA && window.MMA.VFX) {
          MMA.VFX.flashEnemyHit(scene, enemy, 70, cfg.hitTint || 0xe5d8ff);
          MMA.VFX.showImpactSpark(scene, enemy.x, enemy.y - 4, moveKey === 'special');
        }
        enemy.staggerTimer = Math.max(enemy.staggerTimer || 0, 250);
        enemy.state = enemy.stats.hp > 0 ? 'staggered' : enemy.state;
        if (enemy.stats.hp <= 0 && window.MMA && window.MMA.Enemies && typeof MMA.Enemies.killEnemy === 'function') {
          MMA.Enemies.killEnemy(scene, enemy);
        }
        break;
      }

      if (applied && player._mmaShadowDouble && player._mmaShadowDouble.active) {
        player._mmaShadowAttackTimer = Math.max(player._mmaShadowAttackTimer || 0, 260);
      }
    }

    function wrapCombatMethod(methodName, moveResolver) {
      var original = window.MMA.Combat[methodName];
      if (typeof original !== 'function' || original._mmaShadowWrapped) return;
      var wrapped = function(scene) {
        var before = snapshotEnemyHealth(scene);
        var result = original.apply(this, arguments);
        applyShadowEchoDamage(scene, before, moveResolver ? moveResolver.apply(this, arguments) : methodName);
        return result;
      };
      wrapped._mmaShadowWrapped = true;
      window.MMA.Combat[methodName] = wrapped;
    }

    wrapCombatMethod('executeMove', function(scene, moveKey) { return moveKey; });
    wrapCombatMethod('executeSpecialMove', function() { return 'special'; });
    wrapCombatMethod('executeGroundMove', function(scene, moveKey) { return moveKey; });

    window.MMA.Combat._mmaShadowDoubleDamageHookInstalled = true;
  },
  installSignatureSilhouetteHook: function() {
    if (window.MMA && window.MMA.Combat && window.MMA.Combat._mmaSignatureSilhouetteHookInstalled) return;
    if (!window.MMA || !window.MMA.Combat) return;

    function getSilhouetteConfig() {
      return (window.MMA && window.MMA.Sprites && window.MMA.Sprites.SIGNATURE_SILHOUETTE_CONFIG) || {};
    }

    function isSignatureMove(moveKey) {
      var cfg = getSilhouetteConfig();
      var keywords = Array.isArray(cfg.moveKeywords) ? cfg.moveKeywords : [];
      var normalized = String(moveKey || '').toLowerCase();
      if (!normalized) return false;
      for (var i = 0; i < keywords.length; i++) {
        if (normalized.indexOf(String(keywords[i]).toLowerCase()) !== -1) return true;
      }
      return normalized === 'special';
    }

    function resolveSilhouetteBase(sprite) {
      if (!sprite) return 'player';
      var baseKey = sprite._mmaVisualBaseKey || sprite._mmaBaseTextureKey || (sprite.texture && sprite.texture.key) || 'player';
      var set = window.MMA && window.MMA.Sprites && window.MMA.Sprites.SILHOUETTE_TEXTURES;
      if (set && set[baseKey]) return baseKey;
      return set && set.player ? 'player' : baseKey;
    }

    function ensureSilhouette(sprite) {
      if (!sprite || !sprite.scene || !sprite.active) return null;
      if (sprite._mmaSignatureSilhouette && sprite._mmaSignatureSilhouette.active) return sprite._mmaSignatureSilhouette;
      var textureMap = window.MMA && window.MMA.Sprites && window.MMA.Sprites.SILHOUETTE_TEXTURES;
      if (!textureMap) return null;
      var baseKey = resolveSilhouetteBase(sprite);
      var textureKey = textureMap[baseKey] || textureMap.player;
      if (!textureKey) return null;
      var image = sprite.scene.add.image(sprite.x, sprite.y, textureKey);
      image.setVisible(false);
      image.setBlendMode(Phaser.BlendModes.MULTIPLY);
      image.setDepth((sprite.depth || 0) - 4);
      image._mmaOwner = sprite;
      sprite._mmaSignatureSilhouette = image;
      return image;
    }

    function triggerSilhouette(scene, actor, moveKey) {
      if (!scene || !actor || !actor.active || !actor.scene) return;
      var now = scene.time && typeof scene.time.now === 'number' ? scene.time.now : 0;
      if (actor._mmaSignatureSilhouetteLockedUntil && actor._mmaSignatureSilhouetteLockedUntil > now) return;
      var cfg = getSilhouetteConfig();
      var silhouette = ensureSilhouette(actor);
      if (!silhouette) return;
      var textureMap = window.MMA && window.MMA.Sprites && window.MMA.Sprites.SILHOUETTE_TEXTURES;
      var baseKey = resolveSilhouetteBase(actor);
      var textureKey = textureMap[baseKey] || textureMap.player;
      if (textureKey && silhouette.texture && silhouette.texture.key !== textureKey) silhouette.setTexture(textureKey);
      var isSpecial = isSignatureMove(moveKey);
      var duration = isSpecial ? (cfg.specialDuration || 250) : (cfg.duration || 190);
      var scale = isSpecial ? (cfg.specialScale || 1.42) : (cfg.scale || 1.28);
      var alpha = isSpecial ? (cfg.specialAlpha || 0.48) : (cfg.alpha || 0.34);
      silhouette.setVisible(true);
      silhouette.setPosition(actor.x + (cfg.offsetX || 0), actor.y + (cfg.offsetY || -2));
      silhouette.setScale((actor.scaleX || 1) * scale, (actor.scaleY || 1) * scale);
      silhouette.setFlipX(!!actor.flipX);
      silhouette.setDepth((actor.depth || 0) - 4);
      silhouette.setTint(isSpecial ? (cfg.specialTint || 0x2b1250) : (cfg.tint || 0x180c2d));
      silhouette.setAlpha(alpha);
      silhouette.setAngle(actor.flipX ? -4 : 4);
      actor._mmaSignatureSilhouetteLockedUntil = now + (cfg.procCooldown || 420);
      actor._mmaSignatureSilhouetteLastMove = moveKey || null;
      actor._mmaSignatureSilhouetteTimer = duration;
      if (scene.tweens) {
        scene.tweens.killTweensOf(silhouette);
        scene.tweens.add({
          targets: silhouette,
          alpha: 0,
          scaleX: (actor.scaleX || 1) * (scale + 0.18),
          scaleY: (actor.scaleY || 1) * (scale + 0.12),
          y: actor.y + (cfg.offsetY || -2) - (isSpecial ? 12 : 8),
          angle: actor.flipX ? -9 : 9,
          duration: duration,
          ease: 'Cubic.easeOut',
          onComplete: function() {
            if (silhouette && silhouette.active) silhouette.setVisible(false);
          }
        });
      }
      if (window.MMA && window.MMA.VFX) {
        if (typeof MMA.VFX.flashEnemyHit === 'function' && actor !== scene.player) {
          MMA.VFX.flashEnemyHit(scene, actor, 60, cfg.glowTint || 0xbfa2ff);
        } else if (typeof MMA.VFX.showImpactSpark === 'function') {
          MMA.VFX.showImpactSpark(scene, actor.x, actor.y - 8, isSpecial);
        }
      }
      if (window.MMA && window.MMA.UI && typeof MMA.UI.showDamageText === 'function' && isSpecial) {
        MMA.UI.showDamageText(scene, actor.x, actor.y - 82, 'SIGNATURE!', '#d8c0ff');
      }
    }

    function wrapCombatMethod(methodName, actorResolver, moveResolver) {
      var original = window.MMA.Combat[methodName];
      if (typeof original !== 'function' || original._mmaSignatureSilhouetteWrapped) return;
      var wrapped = function(scene) {
        var result = original.apply(this, arguments);
        var actor = actorResolver ? actorResolver.apply(this, arguments) : (scene && scene.player);
        var moveKey = moveResolver ? moveResolver.apply(this, arguments) : methodName;
        if (isSignatureMove(moveKey)) triggerSilhouette(scene, actor, moveKey);
        return result;
      };
      wrapped._mmaSignatureSilhouetteWrapped = true;
      window.MMA.Combat[methodName] = wrapped;
    }

    wrapCombatMethod('executeMove', function(scene) { return scene && scene.player; }, function(scene, moveKey) { return moveKey; });
    wrapCombatMethod('executeSpecialMove', function(scene) { return scene && scene.player; }, function() { return 'special'; });
    wrapCombatMethod('executeGroundMove', function(scene) { return scene && scene.player; }, function(scene, moveKey) { return moveKey; });

    if (!Phaser.Physics.Arcade.Sprite.prototype._mmaSignatureSilhouetteCleanupInstalled) {
      var originalDestroy = Phaser.Physics.Arcade.Sprite.prototype.destroy;
      Phaser.Physics.Arcade.Sprite.prototype.destroy = function(fromScene) {
        if (this._mmaSignatureSilhouette) {
          this._mmaSignatureSilhouette.destroy();
          this._mmaSignatureSilhouette = null;
        }
        return originalDestroy.call(this, fromScene);
      };
      Phaser.Physics.Arcade.Sprite.prototype._mmaSignatureSilhouetteCleanupInstalled = true;
    }

    window.MMA.Combat._mmaSignatureSilhouetteHookInstalled = true;
  },
  installMuscleTensionHook: function() {
    if (Phaser.Physics.Arcade.Sprite.prototype._mmaMuscleTensionHookInstalled) return;

    function getTensionConfig() {
      return (window.MMA && window.MMA.Sprites && window.MMA.Sprites.MUSCLE_TENSION_CONFIG) || {};
    }

    function getSceneNow(sprite) {
      return sprite && sprite.scene && sprite.scene.time && typeof sprite.scene.time.now === 'number' ? sprite.scene.time.now : 0;
    }

    function isChargedMove(moveKey) {
      var cfg = getTensionConfig();
      var keywords = Array.isArray(cfg.moveKeywords) ? cfg.moveKeywords : [];
      var normalized = String(moveKey || '').toLowerCase();
      if (!normalized) return false;
      for (var i = 0; i < keywords.length; i++) {
        if (normalized.indexOf(String(keywords[i]).toLowerCase()) !== -1) return true;
      }
      return false;
    }

    function getSpeed(sprite) {
      if (!sprite || !sprite.body) return 0;
      return Math.abs(sprite.body.velocity.x || 0) + Math.abs(sprite.body.velocity.y || 0);
    }

    function ensureOverlay(sprite) {
      if (!sprite || !sprite.scene || !sprite.active) return null;
      if (sprite._mmaMuscleTensionOverlay && sprite._mmaMuscleTensionOverlay.active) return sprite._mmaMuscleTensionOverlay;
      var textureKey = (sprite.texture && sprite.texture.key) || sprite._mmaCurrentVisualKey || sprite._mmaBaseTextureKey || 'player';
      var overlay = sprite.scene.add.image(sprite.x, sprite.y, textureKey);
      overlay.setBlendMode(Phaser.BlendModes.ADD);
      overlay.setVisible(false);
      overlay.setDepth((sprite.depth || 0) + 2);
      overlay._mmaOwner = sprite;
      sprite._mmaMuscleTensionOverlay = overlay;
      return overlay;
    }

    Phaser.Physics.Arcade.Sprite.prototype.triggerMuscleTension = function(moveKey, forceCharged) {
      var cfg = getTensionConfig();
      var now = getSceneNow(this);
      var charged = !!forceCharged || isChargedMove(moveKey) || getSpeed(this) >= (cfg.speedThreshold || 155);
      var linger = charged ? (cfg.chargedLingerMs || 420) : (cfg.lingerMs || 240);
      this._mmaMuscleTensionState = charged ? 'charged' : 'active';
      this._mmaMuscleTensionUntil = now + linger;
      this._mmaMuscleTensionMove = moveKey || null;
      return this._mmaMuscleTensionUntil;
    };

    var originalPreUpdate = Phaser.Physics.Arcade.Sprite.prototype.preUpdate;
    Phaser.Physics.Arcade.Sprite.prototype.preUpdate = function(time, delta) {
      originalPreUpdate.call(this, time, delta);

      if (!this.active || !this.scene || !this._mmaBaseTextureKey) {
        if (this._mmaMuscleTensionOverlay) this._mmaMuscleTensionOverlay.setVisible(false);
        return;
      }

      var cfg = getTensionConfig();
      var overlay = ensureOverlay(this);
      if (!overlay) return;
      var now = getSceneNow(this);
      var state = this._mmaMuscleTensionUntil && this._mmaMuscleTensionUntil > now ? (this._mmaMuscleTensionState || 'active') : null;
      if (!state) {
        overlay.setVisible(false);
        return;
      }

      var textureKey = (this.texture && this.texture.key) || this._mmaCurrentVisualKey || this._mmaBaseTextureKey;
      if (textureKey && overlay.texture && overlay.texture.key !== textureKey) overlay.setTexture(textureKey);
      var remaining = Math.max(0, this._mmaMuscleTensionUntil - now);
      var total = state === 'charged' ? (cfg.chargedLingerMs || 420) : (cfg.lingerMs || 240);
      var life = total > 0 ? Phaser.Math.Clamp(remaining / total, 0, 1) : 0;
      var pulse = 0.72 + Math.abs(Math.sin(time * (cfg.pulseRate || 0.018))) * 0.28;
      var scaleX = state === 'charged' ? (cfg.chargedScaleX || 1.16) : (cfg.scaleX || 1.1);
      var scaleY = state === 'charged' ? (cfg.chargedScaleY || 0.9) : (cfg.scaleY || 0.94);
      var tint = state === 'charged' ? (cfg.chargedTint || 0xfff0a6) : (cfg.tint || 0xffd0d0);
      var alpha = (state === 'charged' ? (cfg.chargedAlpha || 0.42) : (cfg.alpha || 0.28)) * life;

      overlay.setVisible(true);
      overlay.setPosition(this.x, this.y + (cfg.offsetY || -6));
      overlay.setDepth((this.depth || 0) + 2);
      overlay.setScale((this.scaleX || 1) * (scaleX + pulse * 0.03), (this.scaleY || 1) * (scaleY + pulse * 0.02));
      overlay.setFlipX(!!this.flipX);
      overlay.setAlpha(alpha);
      overlay.setTint(tint);
      overlay.setAngle(this.angle || 0);
    };

    var originalDestroy = Phaser.Physics.Arcade.Sprite.prototype.destroy;
    Phaser.Physics.Arcade.Sprite.prototype.destroy = function(fromScene) {
      if (this._mmaMuscleTensionOverlay) {
        this._mmaMuscleTensionOverlay.destroy();
        this._mmaMuscleTensionOverlay = null;
      }
      return originalDestroy.call(this, fromScene);
    };

    function wrapCombatMethod(methodName, actorResolver, moveResolver, chargeResolver) {
      var original = window.MMA && window.MMA.Combat && window.MMA.Combat[methodName];
      if (typeof original !== 'function' || original._mmaMuscleTensionWrapped) return;
      var wrapped = function(scene) {
        var actor = actorResolver ? actorResolver.apply(this, arguments) : (scene && scene.player);
        var moveKey = moveResolver ? moveResolver.apply(this, arguments) : methodName;
        var charged = chargeResolver ? chargeResolver.apply(this, arguments) : false;
        if (actor && typeof actor.triggerMuscleTension === 'function') actor.triggerMuscleTension(moveKey, charged);
        return original.apply(this, arguments);
      };
      wrapped._mmaMuscleTensionWrapped = true;
      window.MMA.Combat[methodName] = wrapped;
    }

    if (window.MMA && window.MMA.Combat) {
      wrapCombatMethod('executeMove', function(scene) { return scene && scene.player; }, function(scene, moveKey) { return moveKey; }, function(scene, moveKey) { return isChargedMove(moveKey); });
      wrapCombatMethod('executeSpecialMove', function(scene) { return scene && scene.player; }, function() { return 'special'; }, function() { return true; });
      wrapCombatMethod('executeGroundMove', function(scene) { return scene && scene.player; }, function(scene, moveKey) { return moveKey; }, function(scene, moveKey) { return isChargedMove(moveKey); });
    }

    Phaser.Physics.Arcade.Sprite.prototype._mmaMuscleTensionHookInstalled = true;
  },
  installExertionCueHook: function() {
    if (Phaser.Physics.Arcade.Sprite.prototype._mmaExertionCueHookInstalled) return;

    function getExertionConfig() {
      return (window.MMA && window.MMA.Sprites && window.MMA.Sprites.EXERTION_CONFIG) || {};
    }

    function getExertionTextures() {
      return (window.MMA && window.MMA.Sprites && window.MMA.Sprites.EXERTION_TEXTURES) || {};
    }

    function getRatio(value, maxValue, fallback) {
      if (typeof value !== 'number' || typeof maxValue !== 'number' || maxValue <= 0) return fallback;
      return Phaser.Math.Clamp(value / maxValue, 0, 1);
    }

    function inferExertionState(sprite) {
      var cfg = getExertionConfig();
      var stats = sprite && sprite.stats ? sprite.stats : {};
      var staminaRatio = getRatio(stats.stamina, stats.maxStamina, 1);
      var hpRatio = getRatio(stats.hp, stats.maxHp, 1);
      var speed = sprite && sprite.body ? Math.abs(sprite.body.velocity.x || 0) + Math.abs(sprite.body.velocity.y || 0) : 0;
      var heavyThreshold = typeof cfg.heavyThreshold === 'number' ? cfg.heavyThreshold : 0.3;
      var exhaustedThreshold = typeof cfg.exhaustedThreshold === 'number' ? cfg.exhaustedThreshold : 0.08;
      var recoveryThreshold = typeof cfg.recoveryThreshold === 'number' ? cfg.recoveryThreshold : 0.36;
      if (staminaRatio <= exhaustedThreshold) return 'exhausted';
      if (staminaRatio <= heavyThreshold) return speed > 8 ? 'heavy' : 'recovery';
      if (staminaRatio <= recoveryThreshold && (sprite._mmaLastExertionState === 'exhausted' || sprite._mmaLastExertionState === 'heavy' || hpRatio <= 0.5)) return 'recovery';
      return null;
    }

    function ensureBreathPuff(sprite) {
      if (!sprite || !sprite.scene || !sprite.active) return null;
      if (sprite._mmaBreathPuff && sprite._mmaBreathPuff.active) return sprite._mmaBreathPuff;
      var textures = getExertionTextures();
      var puff = sprite.scene.add.image(sprite.x, sprite.y, textures.heavyBreath || 'exertion_breath_heavy');
      puff.setBlendMode(Phaser.BlendModes.SCREEN);
      puff.setVisible(false);
      puff.setDepth((sprite.depth || 0) + 5);
      sprite._mmaBreathPuff = puff;
      return puff;
    }

    function ensureStumbleSpark(sprite) {
      if (!sprite || !sprite.scene || !sprite.active) return null;
      if (sprite._mmaStumbleSpark && sprite._mmaStumbleSpark.active) return sprite._mmaStumbleSpark;
      var textures = getExertionTextures();
      var spark = sprite.scene.add.image(sprite.x, sprite.y, textures.stumble || 'exertion_stumble');
      spark.setBlendMode(Phaser.BlendModes.ADD);
      spark.setVisible(false);
      spark.setDepth((sprite.depth || 0) + 6);
      sprite._mmaStumbleSpark = spark;
      return spark;
    }

    function triggerBreathPuff(sprite, state, time) {
      var puff = ensureBreathPuff(sprite);
      if (!puff || !sprite.scene || !sprite.scene.tweens) return;
      var cfg = getExertionConfig();
      var textures = getExertionTextures();
      var heavy = state === 'heavy' || state === 'exhausted';
      var textureKey = heavy ? (textures.heavyBreath || 'exertion_breath_heavy') : (textures.recoveryBreath || 'exertion_breath_recovery');
      var tint = state === 'exhausted' ? (cfg.exhaustedTint || 0xffd3a6) : (heavy ? (cfg.heavyTint || 0xe7f8ff) : (cfg.recoveryTint || 0xa8f0ff));
      var offsetY = heavy ? (cfg.breathOffsetY || -18) : (cfg.recoveryOffsetY || -14);
      if (puff.texture && puff.texture.key !== textureKey) puff.setTexture(textureKey);
      puff.setVisible(true);
      puff.setPosition(sprite.x + (sprite.flipX ? -8 : 8), sprite.y + offsetY);
      puff.setScale(heavy ? 0.42 : 0.34);
      puff.setAlpha(heavy ? 0.72 : 0.56);
      puff.setTint(tint);
      puff.setAngle(sprite.flipX ? -10 : 10);
      sprite.scene.tweens.killTweensOf(puff);
      sprite.scene.tweens.add({
        targets: puff,
        x: puff.x + (sprite.flipX ? -10 : 10),
        y: puff.y - (heavy ? 10 : 7),
        alpha: 0,
        scaleX: heavy ? 1.14 : 0.9,
        scaleY: heavy ? 1.14 : 0.9,
        duration: heavy ? 320 : 420,
        ease: 'Quad.easeOut',
        onComplete: function() {
          if (puff && puff.active) puff.setVisible(false);
        }
      });
      sprite._mmaNextBreathPuffAt = time + (heavy ? (cfg.puffCooldown || 320) : (cfg.recoveryPuffCooldown || 520));
    }

    function triggerStumbleSpark(sprite, time) {
      var spark = ensureStumbleSpark(sprite);
      if (!spark || !sprite.scene || !sprite.scene.tweens) return;
      var cfg = getExertionConfig();
      spark.setVisible(true);
      spark.setPosition(sprite.x + Phaser.Math.Between(-4, 4), sprite.y - 34 + Phaser.Math.Between(-2, 2));
      spark.setScale(0.32);
      spark.setAlpha(0.95);
      spark.setAngle(Phaser.Math.Between(-20, 20));
      spark.setTint(cfg.exhaustedTint || 0xffd3a6);
      sprite.scene.tweens.killTweensOf(spark);
      sprite.scene.tweens.add({
        targets: spark,
        y: spark.y - 6,
        alpha: 0,
        scaleX: 0.9,
        scaleY: 0.9,
        angle: spark.angle + Phaser.Math.Between(-25, 25),
        duration: 220,
        ease: 'Cubic.easeOut',
        onComplete: function() {
          if (spark && spark.active) spark.setVisible(false);
        }
      });
      sprite._mmaNextStumbleAt = time + (cfg.stumbleCooldown || 520);
    }

    var originalPreUpdate = Phaser.Physics.Arcade.Sprite.prototype.preUpdate;
    Phaser.Physics.Arcade.Sprite.prototype.preUpdate = function(time, delta) {
      originalPreUpdate.call(this, time, delta);

      if (!this.active || !this.scene || !this._mmaBaseTextureKey || !this.stats || !this.stats.maxStamina) {
        if (this._mmaBreathPuff) this._mmaBreathPuff.setVisible(false);
        if (this._mmaStumbleSpark) this._mmaStumbleSpark.setVisible(false);
        return;
      }

      var cfg = getExertionConfig();
      var state = inferExertionState(this);
      var staminaRatio = getRatio(this.stats.stamina, this.stats.maxStamina, 1);
      var now = this.scene && this.scene.time && typeof this.scene.time.now === 'number' ? this.scene.time.now : time;
      this._mmaLastExertionState = state;

      if (!state) {
        if (this._mmaBreathPuff) this._mmaBreathPuff.setVisible(false);
        if (this._mmaStumbleSpark) this._mmaStumbleSpark.setVisible(false);
        this.setAngle(0);
        return;
      }

      if (!this._mmaBreathPuff || !this._mmaBreathPuff.visible) ensureBreathPuff(this);
      if (state === 'exhausted' && (!this._mmaNextStumbleAt || now >= this._mmaNextStumbleAt)) {
        triggerStumbleSpark(this, now);
      }
      if (!this._mmaNextBreathPuffAt || now >= this._mmaNextBreathPuffAt) {
        triggerBreathPuff(this, state, now);
      }

      var wobble = state === 'exhausted' ? Math.sin(time * (cfg.wobbleSpeed || 0.015)) * (cfg.wobbleAngle || 4) * (1 - staminaRatio) : 0;
      this.setAngle(wobble);
    };

    var originalDestroy = Phaser.Physics.Arcade.Sprite.prototype.destroy;
    Phaser.Physics.Arcade.Sprite.prototype.destroy = function(fromScene) {
      if (this._mmaBreathPuff) {
        this._mmaBreathPuff.destroy();
        this._mmaBreathPuff = null;
      }
      if (this._mmaStumbleSpark) {
        this._mmaStumbleSpark.destroy();
        this._mmaStumbleSpark = null;
      }
      return originalDestroy.call(this, fromScene);
    };

    Phaser.Physics.Arcade.Sprite.prototype._mmaExertionCueHookInstalled = true;
  },
  installLastChancePulseHook: function() {
    if (Phaser.Physics.Arcade.Sprite.prototype._mmaLastChancePulseHookInstalled) return;

    function getLastChanceConfig() {
      return (window.MMA && window.MMA.Sprites && window.MMA.Sprites.LAST_CHANCE_CONFIG) || {};
    }

    function getLastChanceTextures() {
      return (window.MMA && window.MMA.Sprites && window.MMA.Sprites.LAST_CHANCE_TEXTURES) || {};
    }

    function ensureLastChancePulse(sprite) {
      if (!sprite || !sprite.scene || !sprite.active) return null;
      if (sprite._mmaLastChancePulse && sprite._mmaLastChancePulse.core && sprite._mmaLastChancePulse.core.active) return sprite._mmaLastChancePulse;
      var textures = getLastChanceTextures();
      if (!textures.core || !textures.ring || !textures.flare) return null;
      var pulse = {
        core: sprite.scene.add.image(sprite.x, sprite.y, textures.core),
        ring: sprite.scene.add.image(sprite.x, sprite.y, textures.ring),
        flare: sprite.scene.add.image(sprite.x, sprite.y, textures.flare)
      };
      pulse.core.setBlendMode(Phaser.BlendModes.ADD);
      pulse.ring.setBlendMode(Phaser.BlendModes.SCREEN);
      pulse.flare.setBlendMode(Phaser.BlendModes.ADD);
      pulse.core.setVisible(false);
      pulse.ring.setVisible(false);
      pulse.flare.setVisible(false);
      sprite._mmaLastChancePulse = pulse;
      return pulse;
    }

    function setPulseVisible(pulse, visible) {
      if (!pulse) return;
      pulse.core.setVisible(visible);
      pulse.ring.setVisible(visible);
      pulse.flare.setVisible(visible);
    }

    function isPlayerLowHp(sprite) {
      if (!sprite || !sprite.scene || sprite.scene.player !== sprite || !sprite.stats || !sprite.stats.maxHp) return false;
      var cfg = getLastChanceConfig();
      var threshold = typeof cfg.healthThreshold === 'number' ? cfg.healthThreshold : 0.1;
      return Phaser.Math.Clamp(sprite.stats.hp / sprite.stats.maxHp, 0, 1) <= threshold;
    }

    var originalPreUpdate = Phaser.Physics.Arcade.Sprite.prototype.preUpdate;
    Phaser.Physics.Arcade.Sprite.prototype.preUpdate = function(time, delta) {
      originalPreUpdate.call(this, time, delta);

      if (!this.active || !this.scene || !this._mmaBaseTextureKey) {
        if (this._mmaLastChancePulse) setPulseVisible(this._mmaLastChancePulse, false);
        return;
      }

      if (!isPlayerLowHp(this)) {
        if (this._mmaLastChancePulse) setPulseVisible(this._mmaLastChancePulse, false);
        return;
      }

      var cfg = getLastChanceConfig();
      var textures = getLastChanceTextures();
      if (!textures.core) return;
      var pulse = ensureLastChancePulse(this);
      if (!pulse) return;
      setPulseVisible(pulse, true);

      var hpRatio = Phaser.Math.Clamp(this.stats.hp / this.stats.maxHp, 0, 1);
      var danger = Phaser.Math.Clamp(1 - (hpRatio / Math.max(0.001, cfg.healthThreshold || 0.1)), 0, 1);
      var pulseSpeed = (cfg.pulseSpeed || 0.012) + danger * (cfg.pulseSpeedBoost || 0.02);
      var beat = 0.72 + Math.abs(Math.sin(time * pulseSpeed)) * (0.28 + danger * 0.16);
      var wobble = Math.sin(time * pulseSpeed * 0.5) * (1 + danger * 2.5);
      var baseDepth = (this.depth || 0) + 1;
      var baseScaleX = this.scaleX || 1;
      var baseScaleY = this.scaleY || 1;

      pulse.core.setPosition(this.x, this.y + 1);
      pulse.ring.setPosition(this.x, this.y + Math.sin(time * pulseSpeed * 0.4) * 1.5);
      pulse.flare.setPosition(this.x, this.y - 2 - Math.abs(Math.sin(time * pulseSpeed * 0.9)) * 2);
      pulse.core.setDepth(baseDepth);
      pulse.ring.setDepth(baseDepth - 1);
      pulse.flare.setDepth(baseDepth - 2);
      pulse.core.setFlipX(!!this.flipX);
      pulse.ring.setFlipX(!!this.flipX);
      pulse.flare.setFlipX(!!this.flipX);
      pulse.core.setTint(cfg.tint || 0xff3b30);
      pulse.ring.setTint(cfg.glow || 0xffb0aa);
      pulse.flare.setTint(cfg.tint || 0xff3b30);
      pulse.core.setScale(baseScaleX * ((cfg.scale || 1.26) + beat * 0.08), baseScaleY * (((cfg.scale || 1.26) - 0.12) + beat * 0.05));
      pulse.ring.setScale(baseScaleX * ((cfg.ringScale || 1.36) + beat * 0.12), baseScaleY * (((cfg.ringScale || 1.36) - 0.16) + beat * 0.08));
      pulse.flare.setScale(baseScaleX * ((cfg.flareScale || 1.18) + danger * 0.12), baseScaleY * (((cfg.flareScale || 1.18) - 0.1) + beat * 0.06));
      pulse.core.setAlpha((cfg.alpha || 0.24) + beat * 0.18 + danger * 0.18);
      pulse.ring.setAlpha((cfg.ringAlpha || 0.18) + beat * 0.12 + danger * 0.16);
      pulse.flare.setAlpha((cfg.flareAlpha || 0.14) + beat * 0.08 + danger * 0.12);
      pulse.ring.setAngle(wobble * 3.5);
      pulse.flare.setAngle(-wobble * 5.5);

      var now = this.scene && this.scene.time && typeof this.scene.time.now === 'number' ? this.scene.time.now : 0;
      var labelCooldown = typeof cfg.labelCooldown === 'number' ? cfg.labelCooldown : 1800;
      if (window.MMA && window.MMA.UI && typeof MMA.UI.showDamageText === 'function' && (!this._mmaLastChanceLabelAt || now - this._mmaLastChanceLabelAt >= labelCooldown)) {
        MMA.UI.showDamageText(this.scene, this.x, this.y - 82, 'LAST CHANCE!', '#ff8a80');
        this._mmaLastChanceLabelAt = now;
      }
    };

    var originalDestroy = Phaser.Physics.Arcade.Sprite.prototype.destroy;
    Phaser.Physics.Arcade.Sprite.prototype.destroy = function(fromScene) {
      if (this._mmaLastChancePulse) {
        this._mmaLastChancePulse.core.destroy();
        this._mmaLastChancePulse.ring.destroy();
        this._mmaLastChancePulse.flare.destroy();
        this._mmaLastChancePulse = null;
      }
      return originalDestroy.call(this, fromScene);
    };

    Phaser.Physics.Arcade.Sprite.prototype._mmaLastChancePulseHookInstalled = true;
  },
  installFightIqAuraReadHook: function() {
    if (Phaser.Physics.Arcade.Sprite.prototype._mmaFightIqAuraReadHookInstalled) return;

    function getReadConfig() {
      return (window.MMA && window.MMA.Sprites && window.MMA.Sprites.ATTACK_READ_CONFIG) || {};
    }

    function getReadTextures() {
      return (window.MMA && window.MMA.Sprites && window.MMA.Sprites.ATTACK_READ_TEXTURES) || {};
    }

    function ensureReadAura(sprite, side) {
      if (!sprite || !sprite.scene || !sprite.active) return null;
      sprite._mmaAttackReadAura = sprite._mmaAttackReadAura || {};
      if (sprite._mmaAttackReadAura[side] && sprite._mmaAttackReadAura[side].active) return sprite._mmaAttackReadAura[side];
      var textures = getReadTextures();
      var aura = sprite.scene.add.image(sprite.x, sprite.y, textures.default || 'attack_read_default');
      aura.setBlendMode(Phaser.BlendModes.ADD);
      aura.setVisible(false);
      aura.setDepth((sprite.depth || 0) + 3);
      sprite._mmaAttackReadAura[side] = aura;
      return aura;
    }

    function hideReadAuras(sprite) {
      if (!sprite || !sprite._mmaAttackReadAura) return;
      Object.keys(sprite._mmaAttackReadAura).forEach(function(side) {
        if (sprite._mmaAttackReadAura[side]) sprite._mmaAttackReadAura[side].setVisible(false);
      });
    }

    function inferAttackType(key) {
      var token = String(key || '').toLowerCase();
      if (!token) return 'default';
      if (token.indexOf('grapple') !== -1 || token.indexOf('throw') !== -1 || token.indexOf('clinch') !== -1 || token.indexOf('slam') !== -1 || token.indexOf('take') !== -1 || token.indexOf('submission') !== -1) return 'grapple';
      if (token.indexOf('haymaker') !== -1 || token.indexOf('overhand') !== -1 || token.indexOf('power') !== -1) return 'haymaker';
      if (token.indexOf('hook') !== -1) return 'hook';
      if (token.indexOf('cross') !== -1 || token.indexOf('straight') !== -1) return 'cross';
      if (token.indexOf('jab') !== -1) return 'jab';
      return 'default';
    }

    function inferAttackSide(key) {
      var token = String(key || '').toLowerCase();
      if (token.indexOf('left') !== -1) return 'left';
      if (token.indexOf('right') !== -1) return 'right';
      if (token.indexOf('hook') !== -1) return 'left';
      if (token.indexOf('cross') !== -1 || token.indexOf('overhand') !== -1) return 'right';
      return 'right';
    }

    function updateCooldownSnapshot(sprite, time) {
      if (!sprite || !sprite.cooldowns) return;
      var cfg = getReadConfig();
      var threshold = typeof cfg.cooldownThreshold === 'number' ? cfg.cooldownThreshold : 180;
      var prev = sprite._mmaAttackReadCooldowns || {};
      Object.keys(sprite.cooldowns).forEach(function(key) {
        var nextValue = sprite.cooldowns[key] || 0;
        var prevValue = prev[key] || 0;
        if (nextValue > prevValue + threshold) {
          sprite._mmaAttackReadType = inferAttackType(key);
          sprite._mmaAttackReadSide = inferAttackSide(key);
          sprite._mmaAttackReadUntil = time + (cfg.telegraphMs || 300);
        }
        prev[key] = nextValue;
      });
      sprite._mmaAttackReadCooldowns = prev;
    }

    function drawReadAura(sprite, time) {
      if (!sprite || !sprite.active || !sprite.scene || sprite.scene.player === sprite) {
        hideReadAuras(sprite);
        return;
      }
      updateCooldownSnapshot(sprite, time);
      if (!sprite._mmaAttackReadUntil || sprite._mmaAttackReadUntil <= time) {
        hideReadAuras(sprite);
        return;
      }
      var cfg = getReadConfig();
      var textures = getReadTextures();
      var type = sprite._mmaAttackReadType || 'default';
      var side = sprite._mmaAttackReadSide || 'right';
      var alphaLife = Phaser.Math.Clamp((sprite._mmaAttackReadUntil - time) / Math.max(1, cfg.telegraphMs || 300), 0, 1);
      var bob = Math.sin(time * 0.02) * (cfg.bob || 1.4);
      var primary = ensureReadAura(sprite, side);
      var secondary = ensureReadAura(sprite, side === 'left' ? 'right' : 'left');
      if (!primary) return;
      if (secondary) secondary.setVisible(type === 'grapple');
      var textureKey = textures[type] || textures.default;
      if (primary.texture && primary.texture.key !== textureKey) primary.setTexture(textureKey);
      var sideDir = side === 'left' ? -1 : 1;
      primary.setVisible(true);
      primary.setPosition(sprite.x + sideDir * 14, sprite.y - 18 + bob);
      primary.setDepth((sprite.depth || 0) + 3);
      primary.setScale((cfg.scale || 0.82) + (1 - alphaLife) * 0.18);
      primary.setAlpha((cfg.alpha || 0.76) * alphaLife);
      primary.setTint((cfg.colors && cfg.colors[type]) || (cfg.colors && cfg.colors.default) || 0xd7c8ff);
      if (secondary && type === 'grapple') {
        if (secondary.texture && secondary.texture.key !== textureKey) secondary.setTexture(textureKey);
        secondary.setPosition(sprite.x - sideDir * 14, sprite.y - 18 - bob);
        secondary.setDepth((sprite.depth || 0) + 3);
        secondary.setScale((cfg.ringScale || 1.08) - (1 - alphaLife) * 0.12);
        secondary.setAlpha((cfg.ringAlpha || 0.56) * alphaLife);
        secondary.setTint((cfg.colors && cfg.colors.grapple) || 0x4d88ff);
      }
    }

    var originalPreUpdate = Phaser.Physics.Arcade.Sprite.prototype.preUpdate;
    Phaser.Physics.Arcade.Sprite.prototype.preUpdate = function(time, delta) {
      originalPreUpdate.call(this, time, delta);
      if (!this.active || !this.scene || !this._mmaBaseTextureKey) {
        hideReadAuras(this);
        return;
      }
      drawReadAura(this, time);
    };

    var originalDestroy = Phaser.Physics.Arcade.Sprite.prototype.destroy;
    Phaser.Physics.Arcade.Sprite.prototype.destroy = function(fromScene) {
      if (this._mmaAttackReadAura) {
        Object.keys(this._mmaAttackReadAura).forEach(function(side) {
          if (this._mmaAttackReadAura[side]) this._mmaAttackReadAura[side].destroy();
        }, this);
        this._mmaAttackReadAura = null;
      }
      return originalDestroy.call(this, fromScene);
    };

    Phaser.Physics.Arcade.Sprite.prototype._mmaFightIqAuraReadHookInstalled = true;
  },
  installEnemyFearTrembleHook: function() {
    if (Phaser.Physics.Arcade.Sprite.prototype._mmaEnemyFearTrembleHookInstalled) return;

    function getFearConfig() {
      return (window.MMA && window.MMA.Sprites && window.MMA.Sprites.FEAR_TREMBLE_CONFIG) || {};
    }

    function isEnemy(sprite) {
      return !!(sprite && sprite.scene && sprite.scene.player !== sprite && sprite.stats && sprite.stats.maxHp);
    }

    function markRecentDamage(scene, beforeState) {
      if (!scene) return;
      var now = scene.time && typeof scene.time.now === 'number' ? scene.time.now : 0;
      for (var i = 0; i < beforeState.length; i++) {
        var entry = beforeState[i];
        var enemy = entry.enemy;
        if (!enemy || !enemy.active || !enemy.stats || typeof entry.hp !== 'number' || typeof enemy.stats.hp !== 'number') continue;
        var dealt = Math.max(0, entry.hp - enemy.stats.hp);
        if (dealt <= 0) continue;
        enemy._mmaFearRecentDamage = Math.max(enemy._mmaFearRecentDamage || 0, dealt);
        enemy._mmaFearRecentDamageAt = now;
      }
    }

    function snapshotEnemyHealth(scene) {
      var enemies = (scene && scene.enemyGroup && typeof scene.enemyGroup.getChildren === 'function') ? scene.enemyGroup.getChildren() : [];
      return enemies.map(function(enemy) {
        return {
          enemy: enemy,
          hp: enemy && enemy.stats && typeof enemy.stats.hp === 'number' ? enemy.stats.hp : null
        };
      });
    }

    function wrapCombatMethod(methodName) {
      if (!window.MMA || !window.MMA.Combat) return;
      var original = window.MMA.Combat[methodName];
      if (typeof original !== 'function' || original._mmaFearTrembleWrapped) return;
      var wrapped = function(scene) {
        var before = snapshotEnemyHealth(scene);
        var result = original.apply(this, arguments);
        markRecentDamage(scene, before);
        return result;
      };
      wrapped._mmaFearTrembleWrapped = true;
      window.MMA.Combat[methodName] = wrapped;
    }

    wrapCombatMethod('executeMove');
    wrapCombatMethod('executeSpecialMove');
    wrapCombatMethod('executeGroundMove');

    var originalPreUpdate = Phaser.Physics.Arcade.Sprite.prototype.preUpdate;
    Phaser.Physics.Arcade.Sprite.prototype.preUpdate = function(time, delta) {
      originalPreUpdate.call(this, time, delta);

      if (!this.active || !this.scene || !isEnemy(this)) {
        if (this._mmaFearBaseScaleX) this.setScale(this._mmaFearBaseScaleX, this._mmaFearBaseScaleY || this._mmaFearBaseScaleX);
        this.setAngle(0);
        this.setAlpha(1);
        this.clearTint();
        this._mmaFearActive = false;
        return;
      }

      var cfg = getFearConfig();
      var hpRatio = Phaser.Math.Clamp(this.stats.hp / this.stats.maxHp, 0, 1);
      var threshold = typeof cfg.healthThreshold === 'number' ? cfg.healthThreshold : 0.25;
      var recentWindow = typeof cfg.recentDamageWindowMs === 'number' ? cfg.recentDamageWindowMs : 1400;
      var now = this.scene.time && typeof this.scene.time.now === 'number' ? this.scene.time.now : time;
      var recentDamage = 0;
      if (this._mmaFearRecentDamageAt && now - this._mmaFearRecentDamageAt <= recentWindow) {
        recentDamage = this._mmaFearRecentDamage || 0;
      } else if (this._mmaFearRecentDamageAt && now - this._mmaFearRecentDamageAt > recentWindow) {
        this._mmaFearRecentDamage = 0;
      }

      if (hpRatio > threshold) {
        if (this._mmaFearActive) {
          this.setAngle(0);
          this.setAlpha(1);
          this.clearTint();
          this.setScale(this._mmaFearBaseScaleX || this.scaleX || 1, this._mmaFearBaseScaleY || this.scaleY || 1);
        }
        this._mmaFearActive = false;
        return;
      }

      if (!this._mmaFearBaseScaleX) {
        this._mmaFearBaseScaleX = this.scaleX || 1;
        this._mmaFearBaseScaleY = this.scaleY || 1;
      }

      var fearIntensity = Phaser.Math.Clamp((threshold - hpRatio) / Math.max(0.001, threshold), 0, 1);
      var damageBoost = Phaser.Math.Clamp(recentDamage / 24, 0, typeof cfg.damageBoostCap === 'number' ? cfg.damageBoostCap : 0.9);
      var totalIntensity = Phaser.Math.Clamp(fearIntensity + damageBoost, 0, 1.8);
      var pulse = Math.sin(time * (cfg.pulseSpeed || 0.02));
      var jiggle = Math.cos(time * ((cfg.pulseSpeed || 0.02) * 1.8));
      var amplitude = (cfg.amplitude || 1.6) * (0.4 + totalIntensity);
      var angle = (cfg.angle || 3.5) * totalIntensity;

      this.setAngle((pulse + jiggle * 0.35) * angle);
      this.setScale(
        (this._mmaFearBaseScaleX || 1) + Math.abs(jiggle) * 0.03 * totalIntensity,
        (this._mmaFearBaseScaleY || 1) - Math.abs(pulse) * 0.02 * Math.min(1, totalIntensity)
      );
      this.setTintFill((cfg.tint || 0xffb3c1));
      this.setAlpha(0.92 + Math.abs(pulse) * 0.08);
      this._mmaFearActive = true;

      var labelCooldown = typeof cfg.labelCooldown === 'number' ? cfg.labelCooldown : 1800;
      if (window.MMA && window.MMA.UI && typeof MMA.UI.showDamageText === 'function' && (!this._mmaFearLabelAt || now - this._mmaFearLabelAt >= labelCooldown)) {
        MMA.UI.showDamageText(this.scene, this.x, this.y - 72, 'THEY\'RE SHOOK', '#ffb3c1');
        this._mmaFearLabelAt = now;
      }
    };

    var originalDestroy = Phaser.Physics.Arcade.Sprite.prototype.destroy;
    Phaser.Physics.Arcade.Sprite.prototype.destroy = function(fromScene) {
      this._mmaFearActive = false;
      return originalDestroy.call(this, fromScene);
    };

    Phaser.Physics.Arcade.Sprite.prototype._mmaEnemyFearTrembleHookInstalled = true;
  }
});

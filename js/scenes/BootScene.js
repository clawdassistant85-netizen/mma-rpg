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
    this.installDamageStateHook();
    this.installLimbDamageHook();
    this.installPortraitHook();
    this.installReactionFaceHook();
    this.installStyleAuraHook();
    this.installShadowDoubleHook();
    this.installShadowDoubleDamageHook();
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

    var originalPreUpdate = Phaser.Physics.Arcade.Sprite.prototype.preUpdate;
    Phaser.Physics.Arcade.Sprite.prototype.preUpdate = function(time, delta) {
      originalPreUpdate.call(this, time, delta);

      if (!this.active || !this.scene || !this._mmaBaseTextureKey) return;
      if (this._mmaAnimOverrideUntil && time < this._mmaAnimOverrideUntil) return;
      var nextBase = resolveVisualBase(this);
      if (!nextBase || this._mmaVisualBaseKey === nextBase) return;

      this._mmaVisualBaseKey = nextBase;
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
  }
});

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
    this.installPortraitHook();
    this.installStyleAuraHook();
    this.installShadowDoubleHook();
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
      var fallback = sprite._mmaBaseTextureKey;
      if (!variants || !damageSets || !fallback) return fallback;

      if (sprite.typeKey && variants[sprite.typeKey] && damageSets[variants[sprite.typeKey]]) return variants[sprite.typeKey];
      if (sprite.isBoss && variants.boss && damageSets[variants.boss]) return variants.boss;
      if (sprite.isElite && variants.elite && damageSets[variants.elite]) return variants.elite;
      return fallback;
    }

    var originalPreUpdate = Phaser.Physics.Arcade.Sprite.prototype.preUpdate;
    Phaser.Physics.Arcade.Sprite.prototype.preUpdate = function(time, delta) {
      originalPreUpdate.call(this, time, delta);

      if (!this.active || !this.scene || !this._mmaBaseTextureKey) return;
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
  installStyleAuraHook: function() {
    if (Phaser.Physics.Arcade.Sprite.prototype._mmaStyleAuraHookInstalled) return;

    function inferDominantStyle(sprite) {
      if (sprite.dominantStyle) return sprite.dominantStyle;
      if (sprite.stats && sprite.stats.dominantStyle) return sprite.stats.dominantStyle;
      var unlockedMoves = sprite.unlockedMoves || (sprite.scene && sprite.scene.player === sprite && sprite.scene.player.unlockedMoves) || [];
      var strikingMoves = 0;
      var grapplingMoves = 0;
      for (var i = 0; i < unlockedMoves.length; i++) {
        var moveKey = String(unlockedMoves[i] || '').toLowerCase();
        if (!moveKey) continue;
        if (moveKey.indexOf('grapple') !== -1 || moveKey.indexOf('throw') !== -1 || moveKey.indexOf('take') !== -1 || moveKey.indexOf('armbar') !== -1 || moveKey.indexOf('triangle') !== -1 || moveKey.indexOf('clinch') !== -1 || moveKey.indexOf('slam') !== -1) grapplingMoves++;
        else strikingMoves++;
      }
      if (grapplingMoves > strikingMoves) return 'grappler';
      if (strikingMoves > grapplingMoves) return 'striker';
      return 'balanced';
    }

    function ensureAura(sprite) {
      if (!sprite || !sprite.scene || !sprite.active) return null;
      if (sprite._mmaStyleAura && sprite._mmaStyleAura.active) return sprite._mmaStyleAura;
      var aura = sprite.scene.add.image(sprite.x, sprite.y, 'aura_balanced');
      aura.setDepth((sprite.depth || 0) - 1);
      aura.setBlendMode(Phaser.BlendModes.ADD);
      aura.setAlpha(0.55);
      aura.setVisible(false);
      aura._mmaOwner = sprite;
      sprite._mmaStyleAura = aura;
      return aura;
    }

    var originalPreUpdate = Phaser.Physics.Arcade.Sprite.prototype.preUpdate;
    Phaser.Physics.Arcade.Sprite.prototype.preUpdate = function(time, delta) {
      originalPreUpdate.call(this, time, delta);

      if (!this.active || !this.scene || !this._mmaBaseTextureKey) {
        if (this._mmaStyleAura) this._mmaStyleAura.setVisible(false);
        return;
      }
      var auraTextures = window.MMA && window.MMA.Sprites && window.MMA.Sprites.AURA_TEXTURES;
      if (!auraTextures) return;
      var wantsAura = !!(this === this.scene.player || this.stats || this.dominantStyle || this.unlockedMoves);
      if (!wantsAura) return;

      var styleKey = inferDominantStyle(this);
      var auraTexture = auraTextures[styleKey] || auraTextures.balanced;
      var aura = ensureAura(this);
      if (!aura) return;

      aura.setVisible(true);
      if (aura.texture && aura.texture.key !== auraTexture) aura.setTexture(auraTexture);
      aura.setPosition(this.x, this.y + 2);
      aura.setDepth((this.depth || 0) - 1);
      aura.setFlipX(!!this.flipX);
      aura.setScale((this.scaleX || 1) * 1.2, (this.scaleY || 1) * 1.08);
      aura.setAlpha(0.3 + Math.abs(Math.sin(time * 0.006)) * 0.25);
      this._mmaStyleAuraKey = styleKey;
    };

    var originalDestroy = Phaser.Physics.Arcade.Sprite.prototype.destroy;
    Phaser.Physics.Arcade.Sprite.prototype.destroy = function(fromScene) {
      if (this._mmaStyleAura) {
        this._mmaStyleAura.destroy();
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
  }
});

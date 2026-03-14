window.MMA = window.MMA || {};
window.MMA.VFX = {
  _track: function(scene, obj) {
    if (!scene || !obj) return obj;
    if (!scene._mmaVfxObjects) scene._mmaVfxObjects = [];
    scene._mmaVfxObjects.push(obj);
    return obj;
  },

  _getCamera: function(scene) {
    return scene && scene.cameras ? scene.cameras.main : null;
  },

  _toColorString: function(color, fallback) {
    if (typeof color === 'number') return '#' + ('000000' + (color >>> 0).toString(16)).slice(-6);
    if (typeof color === 'string' && color) return color;
    return fallback || '#ffffff';
  },

  _randomRange: function(min, max) {
    return min + Math.random() * (max - min);
  },

  screenShake: function(scene, intensity, duration) {
    var cam = this._getCamera(scene);
    if (!cam) return;
    cam.shake(duration || 100, intensity || 0.005);
  },

  triggerScreenShake: function(scene, duration, intensity) {
    this.screenShake(scene, intensity, duration);
  },

  screenFlash: function(scene, color, alpha, duration) {
    var cam = this._getCamera(scene);
    if (!scene || !scene.add || !cam) return;

    var overlay = this._track(
      scene,
      scene.add.rectangle(cam.width * 0.5, cam.height * 0.5, cam.width, cam.height, color || 0xffffff, alpha || 0.22)
    );
    overlay.setDepth(1200);
    overlay.setScrollFactor(0);

    scene.tweens.add({
      targets: overlay,
      alpha: 0,
      duration: duration || 100,
      onComplete: function() {
        overlay.destroy();
      }
    });
  },

  slowMo: function(scene, scale, duration) {
    if (!scene) return;

    var nextScale = Math.max(0.08, Math.min(1, scale || 0.3));
    var time = scene.time || null;
    var tweens = scene.tweens || null;
    var world = scene.physics && scene.physics.world ? scene.physics.world : null;
    var token = (scene._mmaSlowMoToken || 0) + 1;
    var previousTimeScale = time && typeof time.timeScale === 'number' ? time.timeScale : 1;
    var previousTweenScale = tweens && typeof tweens.timeScale === 'number' ? tweens.timeScale : 1;
    var previousWorldScale = world && typeof world.timeScale === 'number' ? world.timeScale : 1;

    scene._mmaSlowMoToken = token;

    if (time && typeof time.timeScale === 'number') time.timeScale = nextScale;
    if (tweens && typeof tweens.timeScale === 'number') tweens.timeScale = nextScale;
    if (world && typeof world.timeScale === 'number') world.timeScale = nextScale;

    window.setTimeout(function() {
      if (!scene || scene._mmaSlowMoToken !== token) return;
      if (time && typeof time.timeScale === 'number') time.timeScale = previousTimeScale;
      if (tweens && typeof tweens.timeScale === 'number') tweens.timeScale = previousTweenScale;
      if (world && typeof world.timeScale === 'number') world.timeScale = previousWorldScale;
    }, duration || 500);
  },

  spawnMotionTrail: function(scene, x, y, color) {
    if (!scene || !scene.add) return null;

    var trail = this._track(scene, scene.add.circle(x, y, 4, color || 0x4a90e2, 0.28).setDepth(6));
    scene.tweens.add({
      targets: trail,
      alpha: 0,
      scaleX: 0.25,
      scaleY: 0.25,
      duration: 220,
      onComplete: function() {
        trail.destroy();
      }
    });
    return trail;
  },

  flashEnemyHit: function(scene, enemy, duration, tintColor) {
    if (!scene || !scene.time || !enemy || !enemy.active) return;

    var tint = tintColor || 0xffffff;
    var restoreTint = enemy.isTinted ? enemy.tintTopLeft : null;
    var ring = null;

    enemy.setTint(tint);
    if (scene.add) {
      ring = this._track(scene, scene.add.circle(enemy.x, enemy.y - 6, 8, tint, 0.22).setDepth(14));
      scene.tweens.add({
        targets: ring,
        scaleX: 2.2,
        scaleY: 2.2,
        alpha: 0,
        duration: duration || 110,
        onComplete: function() {
          ring.destroy();
        }
      });
    }

    scene.time.delayedCall(duration || 100, function() {
      if (!enemy || !enemy.active) return;
      if (restoreTint !== null && restoreTint !== 0xffffff) enemy.setTint(restoreTint);
      else enemy.clearTint();
    });
  },

  playAttackEffect: function(scene, moveKey, fromX, fromY, toX, toY) {
    if (!scene || !scene.add) return null;

    var heavy = moveKey === 'cross' || moveKey === 'special' || moveKey === 'headKick';
    var color = heavy ? 0xffd166 : 0xffffff;
    var width = heavy ? 5 : 3;
    var life = heavy ? 170 : 110;
    var angle = Math.atan2(toY - fromY, toX - fromX);
    var slash = this._track(scene, scene.add.graphics().setDepth(12));

    slash.lineStyle(width, color, 1);
    slash.lineBetween(fromX, fromY, toX, toY);
    slash.fillStyle(color, 0.28);
    slash.fillTriangle(
      toX,
      toY,
      toX - Math.cos(angle - 0.35) * 18,
      toY - Math.sin(angle - 0.35) * 18,
      toX - Math.cos(angle + 0.35) * 18,
      toY - Math.sin(angle + 0.35) * 18
    );

    scene.tweens.add({
      targets: slash,
      alpha: 0,
      duration: life,
      onComplete: function() {
        slash.destroy();
      }
    });

    this.spawnMotionTrail(scene, toX - Math.cos(angle) * 10, toY - Math.sin(angle) * 10, color);
    return slash;
  },

  hitSpark: function(scene, x, y, color, options) {
    if (!scene || !scene.add) return [];

    var heavy = !!(options && options.heavy);
    var tint = color || (heavy ? 0xffd54f : 0xffffff);
    var particles = [];
    var burstCount = heavy ? 8 : 6;
    var core = this._track(scene, scene.add.circle(x, y, heavy ? 5 : 3, tint, 0.92).setDepth(13));

    particles.push(core);
    scene.tweens.add({
      targets: core,
      scaleX: heavy ? 2.2 : 1.6,
      scaleY: heavy ? 2.2 : 1.6,
      alpha: 0,
      duration: heavy ? 190 : 140,
      onComplete: function() {
        core.destroy();
      }
    });

    for (var i = 0; i < burstCount; i++) {
      var angle = (Math.PI * 2 * i) / burstCount + this._randomRange(-0.25, 0.25);
      var distance = heavy ? this._randomRange(18, 34) : this._randomRange(12, 22);
      var particle = this._track(scene, scene.add.circle(x, y, heavy ? 3 : 2, tint, 0.95).setDepth(13));
      particles.push(particle);
      (function(p) {
        scene.tweens.add({
          targets: p,
          x: x + Math.cos(angle) * distance,
          y: y + Math.sin(angle) * distance,
          alpha: 0,
          scaleX: 0.35,
          scaleY: 0.35,
          duration: heavy ? 240 : 170,
          onComplete: function() {
            p.destroy();
          }
        });
      })(particle);
    }

    if (heavy) this.screenShake(scene, 0.007, 110);
    return particles;
  },

  showImpactSpark: function(scene, x, y, heavy, color) {
    return this.hitSpark(scene, x, y, color || (heavy ? 0xffd54f : 0xffffff), { heavy: !!heavy });
  },

  groundPound: function(scene, x, y, options) {
    if (!scene || !scene.add) return null;

    var heavy = !!(options && options.heavy);
    var pulse = this._track(scene, scene.add.ellipse(x, y + 14, heavy ? 32 : 24, heavy ? 14 : 10, 0xff4d4d, 0.18).setDepth(4));
    var shockwave = this._track(scene, scene.add.circle(x, y + 10, heavy ? 10 : 8, 0xffffff, 0).setDepth(12));

    shockwave.setStrokeStyle(heavy ? 4 : 3, heavy ? 0xff9966 : 0xff7777, 0.75);
    scene.tweens.add({
      targets: shockwave,
      scaleX: heavy ? 4.8 : 3.8,
      scaleY: heavy ? 2.1 : 1.8,
      alpha: 0,
      duration: heavy ? 220 : 180,
      onComplete: function() {
        shockwave.destroy();
      }
    });
    scene.tweens.add({
      targets: pulse,
      scaleX: heavy ? 3.2 : 2.6,
      scaleY: heavy ? 1.8 : 1.5,
      alpha: 0,
      duration: heavy ? 210 : 170,
      onComplete: function() {
        pulse.destroy();
      }
    });

    for (var i = 0; i < (heavy ? 6 : 4); i++) {
      var debris = this._track(scene, scene.add.circle(x, y + 8, 2, 0xffcc99, 0.7).setDepth(11));
      var dx = this._randomRange(-22, 22);
      var dy = this._randomRange(-8, 12);
      (function(p) {
        scene.tweens.add({
          targets: p,
          x: x + dx,
          y: y + dy,
          alpha: 0,
          duration: heavy ? 240 : 180,
          onComplete: function() {
            p.destroy();
          }
        });
      })(debris);
    }

    this.screenShake(scene, heavy ? 0.005 : 0.0035, heavy ? 110 : 80);
    return shockwave;
  },

  _normalizeDamageColor: function(text, color) {
    var raw = this._toColorString(color, '');
    var label = String(text || '');
    var upper = label.toUpperCase();

    if (/^\-\d+(\s*HP)?$/.test(upper)) {
      if (raw === '#ff6b6b' || raw === '#ff6666' || raw === '#ff3333') return '#ffe066';
      if (raw === '#ffd54f' || raw === '') return '#ffffff';
      return raw;
    }
    if (/^\+\d+/.test(upper) || upper.indexOf('HEAL') !== -1 || upper.indexOf('RESTORE') !== -1) {
      return raw || '#66ff99';
    }
    if (upper.indexOf('CRIT') !== -1) return raw || '#ffe066';
    if (upper.indexOf('XP') !== -1) return raw || '#e8c830';
    return raw || '#ffffff';
  },

  showDamageNumber: function(scene, x, y, text, color) {
    if (!scene || !scene.add || !scene.tweens) return null;

    var label = String(text || '');
    var tint = this._normalizeDamageColor(label, color);
    var driftX = this._randomRange(-10, 10);
    var targetX = x + this._randomRange(-14, 14);
    var targetY = y - this._randomRange(42, 56);
    var isCrit = label.toUpperCase().indexOf('CRIT') !== -1 || tint === '#ffe066';
    var damageText = this._track(
      scene,
      scene.add.text(x + driftX, y, label, {
        fontFamily: 'Arial Black, sans-serif',
        fontSize: isCrit ? '18px' : '16px',
        color: tint,
        stroke: '#000000',
        strokeThickness: isCrit ? 4 : 3
      }).setOrigin(0.5).setDepth(30)
    );

    damageText.setScale(isCrit ? 1.08 : 0.96);
    scene.tweens.add({
      targets: damageText,
      x: targetX,
      y: targetY,
      alpha: 0,
      scaleX: isCrit ? 1.18 : 1.05,
      scaleY: isCrit ? 1.18 : 1.05,
      duration: 1000,
      ease: 'Cubic.easeOut',
      onComplete: function() {
        damageText.destroy();
      }
    });

    if (label.toUpperCase() === 'CRIT!') this.screenShake(scene, 0.006, 120);
    return damageText;
  },

  playKOAnimation: function(scene, target, options) {
    if (!scene || !scene.add || !target) return null;

    var boss = !!(options && options.boss);
    var tint = boss ? 0xffd166 : 0xffffff;
    var depth = typeof target.depth === 'number' ? target.depth + 2 : 16;
    var ghost = null;

    this.flashEnemyHit(scene, target, 200, 0xffffff);
    this.slowMo(scene, 0.3, 500);
    this.screenFlash(scene, 0xffffff, boss ? 0.42 : 0.28, 100);

    if (scene.tweens && typeof target.setAlpha === 'function') {
      scene.tweens.add({
        targets: target,
        y: target.y + (boss ? 20 : 14),
        alpha: 0,
        duration: boss ? 260 : 180,
        ease: 'Quad.easeOut'
      });
    }

    if (target.texture && target.texture.key) {
      ghost = this._track(scene, scene.add.image(target.x, target.y, target.texture.key).setDepth(depth));
      if (ghost.setFrame && target.frame && target.frame.name !== undefined) ghost.setFrame(target.frame.name);
      if (ghost.setDisplaySize && target.displayWidth && target.displayHeight) ghost.setDisplaySize(target.displayWidth, target.displayHeight);
      if (ghost.setOrigin && typeof target.originX === 'number' && typeof target.originY === 'number') ghost.setOrigin(target.originX, target.originY);
      if (ghost.setFlipX) ghost.setFlipX(!!target.flipX);
      ghost.setTint(tint);
      ghost.setAlpha(0.9);
    } else {
      ghost = this._track(
        scene,
        scene.add.rectangle(target.x, target.y, target.displayWidth || 24, target.displayHeight || 36, tint, 0.75).setDepth(depth)
      );
    }

    var shock = this._track(scene, scene.add.circle(target.x, target.y - 4, boss ? 14 : 10, tint, boss ? 0.24 : 0.16).setDepth(depth + 1));
    scene.tweens.add({
      targets: shock,
      scaleX: boss ? 5.2 : 4,
      scaleY: boss ? 5.2 : 4,
      alpha: 0,
      duration: boss ? 340 : 240,
      onComplete: function() {
        shock.destroy();
      }
    });

    scene.tweens.add({
      targets: ghost,
      y: target.y + (boss ? 34 : 26),
      angle: target.flipX ? -16 : 16,
      alpha: 0,
      scaleX: 0.92,
      scaleY: 0.78,
      duration: boss ? 520 : 420,
      ease: 'Quad.easeOut',
      onComplete: function() {
        ghost.destroy();
      }
    });

    this.hitSpark(scene, target.x, target.y - 8, tint, { heavy: true });
    this.screenShake(scene, boss ? 0.01 : 0.0075, boss ? 180 : 120);

    if (window.sfx) {
      if (boss && typeof window.sfx.ko === 'function') window.sfx.ko();
      else if (typeof window.sfx.enemyDeath === 'function') window.sfx.enemyDeath();
      else if (typeof window.sfx.heavyHit === 'function') window.sfx.heavyHit();
    }

    return ghost;
  }
};

window.MMA.VFX._rememberWeatherObject = function(scene, obj) {
  if (!scene || !obj) return obj;
  if (!scene._mmaWeatherFxObjects) scene._mmaWeatherFxObjects = [];
  scene._mmaWeatherFxObjects.push(obj);
  return obj;
};

window.MMA.VFX._rememberWeatherCleanup = function(scene, cleanupFn) {
  if (!scene || typeof cleanupFn !== 'function') return;
  if (!scene._mmaWeatherFxCleanup) scene._mmaWeatherFxCleanup = [];
  scene._mmaWeatherFxCleanup.push(cleanupFn);
};

window.MMA.VFX._createWeatherGraphics = function(scene, depth, updater) {
  if (!scene || !scene.add || !scene.events) return null;

  var layer = this._rememberWeatherObject(scene, scene.add.graphics().setDepth(depth || 60));
  var tick = function(time, delta) {
    if (!layer || !layer.active) return;
    updater(layer, delta || 16);
  };

  scene.events.on('update', tick);
  this._rememberWeatherCleanup(scene, function() {
    if (scene && scene.events) scene.events.off('update', tick);
  });
  updater(layer, 16);
  return layer;
};

window.MMA.VFX.clearWeatherEffects = function(scene) {
  if (!scene) return;

  var cleanups = scene._mmaWeatherFxCleanup || [];
  while (cleanups.length) {
    var cleanup = cleanups.pop();
    try {
      cleanup();
    } catch (err) {}
  }

  var objects = scene._mmaWeatherFxObjects || [];
  while (objects.length) {
    var obj = objects.pop();
    if (obj && obj.destroy) obj.destroy();
  }

  scene.weatherParticles = null;
  scene.fogLayer = null;
  scene.lightingOverlay = null;
  scene.windLayer = null;
};

window.MMA.VFX.weatherEffects = {
  clear: function(scene) {
    window.MMA.VFX.clearWeatherEffects(scene);
  },

  rain: function(scene) {
    var VFX = window.MMA.VFX;
    var drops = [];
    for (var i = 0; i < 36; i++) {
      drops.push({
        x: VFX._randomRange(-40, 808),
        y: VFX._randomRange(-580, 576),
        len: VFX._randomRange(10, 20),
        speed: VFX._randomRange(360, 520),
        drift: VFX._randomRange(42, 75)
      });
    }

    return VFX._createWeatherGraphics(scene, 100, function(layer, delta) {
      var step = delta / 1000;
      layer.clear();
      layer.lineStyle(2, 0xb7d8ff, 0.4);
      for (var idx = 0; idx < drops.length; idx++) {
        var drop = drops[idx];
        drop.x += drop.drift * step;
        drop.y += drop.speed * step;
        if (drop.y - drop.len > 620 || drop.x > 830) {
          drop.x = VFX._randomRange(-70, 760);
          drop.y = VFX._randomRange(-160, -20);
        }
        layer.lineBetween(drop.x, drop.y, drop.x - 5, drop.y - drop.len);
      }
    });
  },

  fog: function(scene, density) {
    var VFX = window.MMA.VFX;
    var fog = VFX._rememberWeatherObject(scene, scene.add.container(0, 0).setDepth(50));
    var alpha = typeof density === 'number' ? density : 0.28;
    var layers = [
      { x: 150, y: 180, w: 320, h: 140, speed: 18 },
      { x: 520, y: 250, w: 380, h: 160, speed: -24 },
      { x: 330, y: 420, w: 430, h: 180, speed: 12 }
    ];

    for (var i = 0; i < layers.length; i++) {
      var cfg = layers[i];
      var puff = scene.add.ellipse(cfg.x, cfg.y, cfg.w, cfg.h, 0xdde6f2, alpha);
      puff.setBlendMode(Phaser.BlendModes.SCREEN);
      fog.add(puff);
      scene.tweens.add({
        targets: puff,
        x: cfg.x + cfg.speed,
        alpha: alpha * 0.65,
        duration: 4200 + i * 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
    return fog;
  },

  dust: function(scene) {
    var VFX = window.MMA.VFX;
    var motes = [];
    for (var i = 0; i < 22; i++) {
      motes.push({
        x: VFX._randomRange(0, 768),
        y: VFX._randomRange(0, 576),
        r: VFX._randomRange(1, 3),
        dx: VFX._randomRange(-8, 10),
        dy: VFX._randomRange(-10, 6),
        alpha: VFX._randomRange(0.08, 0.22)
      });
    }

    return VFX._createWeatherGraphics(scene, 45, function(layer, delta) {
      var step = delta / 1000;
      layer.clear();
      for (var idx = 0; idx < motes.length; idx++) {
        var mote = motes[idx];
        mote.x += mote.dx * step;
        mote.y += mote.dy * step;
        if (mote.x < -10) mote.x = 778;
        if (mote.x > 778) mote.x = -10;
        if (mote.y < -10) mote.y = 586;
        if (mote.y > 586) mote.y = -10;
        layer.fillStyle(0xd9c39a, mote.alpha);
        layer.fillCircle(mote.x, mote.y, mote.r);
      }
    });
  },

  wind: function(scene) {
    var VFX = window.MMA.VFX;
    var gusts = [];
    for (var i = 0; i < 16; i++) {
      gusts.push({
        x: VFX._randomRange(-220, 760),
        y: VFX._randomRange(60, 540),
        len: VFX._randomRange(26, 58),
        speed: VFX._randomRange(120, 220),
        alpha: VFX._randomRange(0.08, 0.18)
      });
    }

    return VFX._createWeatherGraphics(scene, 65, function(layer, delta) {
      var step = delta / 1000;
      layer.clear();
      for (var idx = 0; idx < gusts.length; idx++) {
        var gust = gusts[idx];
        gust.x += gust.speed * step;
        if (gust.x - gust.len > 820) {
          gust.x = VFX._randomRange(-220, -40);
          gust.y = VFX._randomRange(60, 540);
        }
        layer.lineStyle(2, 0xcfe8ff, gust.alpha);
        layer.lineBetween(gust.x, gust.y, gust.x + gust.len, gust.y + 2);
      }
    });
  },

  night: function(scene) {
    var VFX = window.MMA.VFX;
    var overlay = VFX._rememberWeatherObject(scene, scene.add.rectangle(384, 288, 768, 576, 0x081226, 0.28).setDepth(40));
    overlay.setScrollFactor(0);

    var lampA = VFX._rememberWeatherObject(scene, scene.add.ellipse(118, 94, 160, 120, 0x4d6b9d, 0.12).setDepth(41));
    lampA.setBlendMode(Phaser.BlendModes.SCREEN);
    lampA.setScrollFactor(0);
    var lampB = VFX._rememberWeatherObject(scene, scene.add.ellipse(650, 118, 190, 140, 0x3f5f90, 0.1).setDepth(41));
    lampB.setBlendMode(Phaser.BlendModes.SCREEN);
    lampB.setScrollFactor(0);

    scene.tweens.add({
      targets: overlay,
      alpha: { from: 0.24, to: 0.34 },
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    scene.tweens.add({
      targets: [lampA, lampB],
      alpha: { from: 0.08, to: 0.15 },
      duration: 1900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    scene.lightingOverlay = overlay;
    return overlay;
  }
};

window.MMA.VFX.applyRoomWeather = function(scene, roomIdOrRoom, weather) {
  if (!scene) return null;

  var room = typeof roomIdOrRoom === 'string' && window.MMA && MMA.Zones ? MMA.Zones.getRoom(roomIdOrRoom) : roomIdOrRoom;
  var activeWeather = weather;
  if (!activeWeather && window.MMA && MMA.Zones && typeof MMA.Zones.chooseWeatherForRoom === 'function') {
    activeWeather = MMA.Zones.chooseWeatherForRoom(scene, room);
  }
  if (!activeWeather) activeWeather = { type: 'clear' };

  this.weatherEffects.clear(scene);

  if (activeWeather.type === 'rain') {
    scene.weatherParticles = this.weatherEffects.rain(scene);
  } else if (activeWeather.type === 'fog') {
    scene.fogLayer = this.weatherEffects.fog(scene, room && room.zone >= 3 ? 0.34 : 0.24);
  } else if (activeWeather.type === 'dust') {
    scene.weatherParticles = this.weatherEffects.dust(scene);
  } else if (activeWeather.type === 'wind') {
    scene.windLayer = this.weatherEffects.wind(scene);
  }

  if (activeWeather.type === 'night' || activeWeather.type === 'fog' || (activeWeather.type === 'rain' && room && room.zone === 1)) {
    scene.lightingOverlay = this.weatherEffects.night(scene);
  }

  return activeWeather.type;
};

window.MMA.VFX.comboDisplay = {
  create: function(scene) {
    if (!scene || !window.MMA || !MMA.UI || typeof MMA.UI.showComboCounter !== 'function') return null;
    return MMA.UI.showComboCounter(scene);
  },

  update: function(scene, count) {
    if (!scene || !window.MMA || !MMA.UI) return;
    if (count > 0) {
      if (!MMA.UI.comboCounter || !MMA.UI.comboCounter.container) this.create(scene);
      if (typeof MMA.UI.updateComboCounter === 'function') MMA.UI.updateComboCounter(scene, count);
    } else if (typeof MMA.UI.hideComboCounter === 'function') {
      MMA.UI.hideComboCounter(scene);
    }
  }
};

(function() {
  var VFX = window.MMA && window.MMA.VFX;
  if (!VFX) return;

  function getActiveGameScene() {
    if (!window.phaserGame || !window.phaserGame.scene || typeof window.phaserGame.scene.getScene !== 'function') return null;
    try {
      var scene = window.phaserGame.scene.getScene('GameScene');
      return scene && scene.scene && scene.scene.isActive() ? scene : scene;
    } catch (err) {
      return null;
    }
  }

  function installUiPatch() {
    if (!window.MMA || !MMA.UI || MMA.UI._mmaVfxDamageNumbers) return false;

    MMA.UI.showDamageText = function(scene, x, y, text, color) {
      return VFX.showDamageNumber(scene, x, y, text, color);
    };
    MMA.UI._mmaVfxDamageNumbers = true;
    return true;
  }

  function installEnemyPatch() {
    if (!window.MMA || !MMA.Enemies || MMA.Enemies._mmaVfxKoPatch) return false;

    var originalKillEnemy = MMA.Enemies.killEnemy;
    MMA.Enemies.killEnemy = function(scene, enemy) {
      if (enemy && !enemy._mmaKoEffectPlayed) {
        enemy._mmaKoEffectPlayed = true;
        VFX.playKOAnimation(scene, enemy, { boss: !!enemy.isBoss });
      }
      return originalKillEnemy.apply(this, arguments);
    };
    MMA.Enemies._mmaVfxKoPatch = true;
    return true;
  }

  function installGroundPatch() {
    if (!window.MMA || !MMA.Combat || MMA.Combat._mmaVfxGroundPatch) return false;

    var originalExecuteGroundMove = MMA.Combat.executeGroundMove;
    MMA.Combat.executeGroundMove = function(scene, moveKey) {
      var enemy = scene && scene.groundState ? scene.groundState.enemy : null;
      var beforeHp = enemy && enemy.stats ? enemy.stats.hp : null;
      var hitX = enemy ? enemy.x : (scene && scene.player ? scene.player.x : 0);
      var hitY = enemy ? enemy.y : (scene && scene.player ? scene.player.y : 0);
      var result = originalExecuteGroundMove.apply(this, arguments);

      if (beforeHp !== null && moveKey !== 'takedown' && moveKey !== 'special' && enemy && enemy.stats && enemy.stats.hp < beforeHp) {
        VFX.groundPound(scene, hitX, hitY, { heavy: moveKey === 'cross' });
        VFX.hitSpark(scene, hitX, hitY - 6, moveKey === 'cross' ? 0xffd166 : 0xffffff, { heavy: moveKey === 'cross' });
      }
      return result;
    };
    MMA.Combat._mmaVfxGroundPatch = true;
    return true;
  }

  function installComboPatch() {
    if (!window.MMA || !MMA.UI || MMA.UI._mmaComboDisplayPatched) return false;

    var originalIncrementCombo = MMA.UI.incrementCombo;
    MMA.UI.incrementCombo = function() {
      var result = originalIncrementCombo.apply(this, arguments);
      var scene = getActiveGameScene();
      if (scene) VFX.comboDisplay.update(scene, this.fightStats.currentCombo || 0);
      return result;
    };

    var originalResetCombo = MMA.UI.resetCombo;
    MMA.UI.resetCombo = function() {
      var result = originalResetCombo.apply(this, arguments);
      var scene = getActiveGameScene();
      if (scene) VFX.comboDisplay.update(scene, 0);
      return result;
    };

    var originalResetFightStats = MMA.UI.resetFightStats;
    MMA.UI.resetFightStats = function() {
      var result = originalResetFightStats.apply(this, arguments);
      var scene = getActiveGameScene();
      if (scene && typeof this.destroyComboCounter === 'function') this.destroyComboCounter();
      return result;
    };

    MMA.UI._mmaComboDisplayPatched = true;
    return true;
  }

  function retryPatches(remaining) {
    installEnemyPatch();
    installGroundPatch();
    installUiPatch();
    installComboPatch();
    if (remaining <= 0 || (window.MMA && window.MMA.UI && window.MMA.UI._mmaVfxDamageNumbers)) return;
    window.setTimeout(function() {
      retryPatches(remaining - 1);
    }, 200);
  }

  retryPatches(15);
})();

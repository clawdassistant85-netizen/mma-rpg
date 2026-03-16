window.MMA = window.MMA || {};

var _vfxDomCache = {};
function _vfxGetEl(id) {
  if (!_vfxDomCache[id] || !_vfxDomCache[id].parentNode) {
    _vfxDomCache[id] = document.getElementById(id);
  }
  return _vfxDomCache[id];
}
window.MMA.VFX = window.MMA.VFX || {};
MMA.VFX._clearDOMCache = function() { _vfxDomCache = {}; };

window.MMA.VFX = {
  _removeTrackedObject: function(scene, obj) {
    if (!scene || !scene._mmaVfxObjects || !obj) return;
    var idx = scene._mmaVfxObjects.indexOf(obj);
    if (idx !== -1) scene._mmaVfxObjects.splice(idx, 1);
  },

  _ensureSceneVfxCleanup: function(scene) {
    if (!scene || !scene.events || scene._mmaVfxCleanupInstalled) return;
    scene._mmaVfxCleanupInstalled = true;

    var cleanup = function() {
      var objects = scene._mmaVfxObjects || [];
      while (objects.length) {
        var obj = objects.pop();
        if (obj && obj.active && typeof obj.destroy === 'function') obj.destroy();
      }
      scene._mmaVfxObjects = [];
      scene._mmaVfxCleanupInstalled = false;
    };

    scene.events.once('shutdown', cleanup);
    scene.events.once('destroy', cleanup);
  },

  _track: function(scene, obj) {
    if (!scene || !obj) return obj;
    this._ensureSceneVfxCleanup(scene);
    if (!scene._mmaVfxObjects) scene._mmaVfxObjects = [];
    if (scene._mmaVfxObjects.indexOf(obj) === -1) scene._mmaVfxObjects.push(obj);
    if (typeof obj.once === 'function') {
      var self = this;
      obj.once('destroy', function() {
        self._removeTrackedObject(scene, obj);
      });
    }
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

  updateLowHpEffect: function(scene) {
    if (!scene || !scene.player || !scene.player.stats) {
      if (scene && scene._lowHpOverlay) { scene._lowHpOverlay.destroy(); scene._lowHpOverlay = null; }
      return;
    }
    var ratio = Math.max(0, scene.player.stats.hp) / Math.max(1, scene.player.stats.maxHp);
    if (ratio >= 0.25) {
      if (scene._lowHpOverlay) { scene._lowHpOverlay.destroy(); scene._lowHpOverlay = null; }
      return;
    }
    if (!scene._lowHpOverlay || !scene._lowHpOverlay.active) {
      scene._lowHpOverlay = this._track(scene, scene.add.graphics());
      scene._lowHpOverlay.setDepth(100).setScrollFactor(0);
    }
    var alpha = Math.abs(Math.sin(scene.time.now * 0.003)) * 0.6 * (1 - ratio / 0.25);
    var cam = scene.cameras ? scene.cameras.main : null;
    var w = cam ? cam.width : 390, h = cam ? cam.height : 700;
    scene._lowHpOverlay.clear();
    scene._lowHpOverlay.lineStyle(18, 0xff2222, alpha);
    scene._lowHpOverlay.strokeRect(0, 0, w, h);
  },

  showComboLetter: function(scene, comboCount, x, y) {
    if (!scene || !scene.add || !scene.tweens) return null;
    var words = { 5:{text:'NICE!',color:'#FFFFFF'}, 10:{text:'BEAST!',color:'#FFFF00'}, 15:{text:'MONSTER!',color:'#FF8800'}, 20:{text:'LEGEND!',color:'#FFD700'} };
    var milestones = [20,15,10,5];
    var hit = milestones.find(function(m){ return comboCount >= m; });
    if (!hit || comboCount !== hit) return null; // only exact milestones
    var w = words[hit];
    var txt = this._track(scene, scene.add.text(x, y - 80, w.text, {fontSize:'28px',fontFamily:'Arial Black',color:w.color,stroke:'#000',strokeThickness:4}));
    txt.setOrigin(0.5).setDepth(150);
    scene.tweens.add({targets:txt, y:y-140, alpha:0, duration:1500, onComplete:function(){ txt.destroy(); }});
    return txt;
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

  if (scene.events && typeof scene.events.listenerCount === 'function') {
    console.log('scene update listeners after weather clear:', scene.events.listenerCount('update'));
  }
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

window.MMA.VFX.showComboLetter = function(scene, comboCount) {
  if (!scene || !scene.add || !scene.tweens) return null;
  var word = null;
  if (comboCount >= 20) word = 'LEGEND';
  else if (comboCount === 15) word = 'MONSTER';
  else if (comboCount === 10) word = 'BEAST';
  else if (comboCount === 5) word = 'NICE';
  if (!word) return null;

  var colors = { NICE:'#ffffff', BEAST:'#ffaa00', MONSTER:'#ff4400', LEGEND:'#FFD700' };
  var W = (typeof CONFIG !== 'undefined' && CONFIG.CANVAS_W) ? CONFIG.CANVAS_W : 500;
  var H = (typeof CONFIG !== 'undefined' && CONFIG.CANVAS_H) ? CONFIG.CANVAS_H : 400;
  var txt = this._track(scene, scene.add.text(W / 2, H / 2 - 60, word, {
    fontSize: '36px',
    fontFamily: 'Arial Black',
    color: colors[word] || '#ffffff',
    stroke: '#000000',
    strokeThickness: 6
  }));

  txt.setOrigin(0.5).setDepth(290).setScrollFactor(0).setScale(0.3).setAlpha(0.9);

  scene.tweens.add({
    targets: txt,
    scaleX: 1.4,
    scaleY: 1.4,
    alpha: 0,
    ease: 'Power2',
    duration: 800,
    onComplete: function() {
      if (txt.active) txt.destroy();
    }
  });

  if (word === 'LEGEND' && scene.cameras && scene.cameras.main) {
    scene.cameras.main.shake(300, 0.015);
  }
  return txt;
};

window.MMA.VFX.updateLastChancePulse = function(scene) {
  if (!scene || !scene.player || !scene.player.stats) return;
  var ratio = scene.player.stats.hp / (scene.player.stats.maxHp || 100);
  var W = (typeof CONFIG !== 'undefined' && CONFIG.CANVAS_W) ? CONFIG.CANVAS_W : 500;
  var H = (typeof CONFIG !== 'undefined' && CONFIG.CANVAS_H) ? CONFIG.CANVAS_H : 400;

  if (ratio > 0.1) {
    if (scene._lastChancePulseTween) {
      scene._lastChancePulseTween.stop();
      scene._lastChancePulseTween = null;
    }
    if (scene._lastChanceOverlay && scene._lastChanceOverlay.active) {
      scene._lastChanceOverlay.destroy();
      scene._lastChanceOverlay = null;
    }
    return;
  }

  if (!scene._lastChanceOverlay || !scene._lastChanceOverlay.active) {
    scene._lastChanceOverlay = this._track(scene, scene.add.rectangle(W / 2, H / 2, W, H, 0xff0000, 0)
      .setDepth(280)
      .setScrollFactor(0));
    var ov = scene._lastChanceOverlay;
    scene._lastChancePulseTween = scene.tweens.add({
      targets: ov,
      alpha: 0.18,
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut'
    });
  } else {
    scene._lastChanceOverlay.setPosition(W / 2, H / 2);
    scene._lastChanceOverlay.setSize(W, H);
  }
};

window.MMA.VFX.updateDesaturateEffect = function(scene) {
  if (!scene || !scene.player || !scene.player.stats) return;
  var ratio = scene.player.stats.hp / (scene.player.stats.maxHp || 100);
  var W = (typeof CONFIG !== 'undefined' && CONFIG.CANVAS_W) ? CONFIG.CANVAS_W : 500;
  var H = (typeof CONFIG !== 'undefined' && CONFIG.CANVAS_H) ? CONFIG.CANVAS_H : 400;

  if (ratio >= 0.5) {
    if (scene._desatOverlay && scene._desatOverlay.active) scene._desatOverlay.setAlpha(0);
    return;
  }

  var intensity = Math.min(1.0, (0.5 - ratio) / 0.5);
  var alpha = intensity * 0.45;

  if (!scene._desatOverlay || !scene._desatOverlay.active) {
    scene._desatOverlay = this._track(scene, scene.add.rectangle(W / 2, H / 2, W, H, 0x888888, 0)
      .setDepth(270)
      .setScrollFactor(0)
      .setBlendMode('MULTIPLY'));
  }
  scene._desatOverlay.setPosition(W / 2, H / 2);
  scene._desatOverlay.setSize(W, H);
  scene._desatOverlay.setAlpha(alpha);
};

window.MMA.VFX.updateEnemyHpTrail = function() {
  if (typeof document === 'undefined') return;
  var bar = document.getElementById('boss-hp-fill') || document.querySelector('.enemy-hp-fill');
  if (!bar || !bar.parentNode) return;

  var ghost = document.getElementById('boss-hp-ghost');
  if (!ghost) {
    ghost = document.createElement('div');
    ghost.id = 'boss-hp-ghost';
    ghost.style.cssText = 'position:absolute;top:0;left:0;height:100%;background:rgba(255,80,80,0.5);transition:width 0.8s ease;pointer-events:none;z-index:1;border-radius:inherit;';
    bar.parentNode.style.position = 'relative';
    ghost.style.width = bar.style.width || '100%';
    bar.parentNode.insertBefore(ghost, bar);
  }

  var currentW = parseFloat(bar.style.width);
  if (isNaN(currentW)) currentW = 0;
  var ghostW = parseFloat(ghost.style.width);
  if (isNaN(ghostW)) ghostW = currentW;

  if (currentW < ghostW) {
    ghost.style.width = ghostW + '%';
    window.setTimeout(function() {
      ghost.style.width = currentW + '%';
    }, 200);
  } else if (currentW > ghostW) {
    ghost.style.width = currentW + '%';
  }
};

(function() {
  var VFX = window.MMA && window.MMA.VFX;
  if (!VFX || !window.MMA || !MMA.UI || MMA.UI._mmaComboLetterPatched) return;

  var originalIncrementCombo = MMA.UI.incrementCombo;
  if (typeof originalIncrementCombo !== 'function') return;

  function getActiveGameScene() {
    if (!window.phaserGame || !window.phaserGame.scene || typeof window.phaserGame.scene.getScene !== 'function') return null;
    try {
      return window.phaserGame.scene.getScene('GameScene');
    } catch (err) {
      return null;
    }
  }

  MMA.UI.incrementCombo = function() {
    var result = originalIncrementCombo.apply(this, arguments);
    var comboCount = this && this.fightStats ? this.fightStats.currentCombo || 0 : 0;
    var scene = getActiveGameScene();
    if (scene) VFX.showComboLetter(scene, comboCount);
    return result;
  };

  MMA.UI._mmaComboLetterPatched = true;
})();

MMA.VFX.showCrowdRipple = function(scene, intensity) {
  var el = document.getElementById('crowd-ripple');
  if (!el) {
    el = document.createElement('div');
    el.id = 'crowd-ripple';
    el.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:15;overflow:hidden;';
    var gc = document.getElementById('game-container') || document.body;
    gc.appendChild(el);
  }
  el.innerHTML = '';
  var rings = Math.min(3, Math.floor((intensity || 1) / 5));
  for (var i = 0; i < rings; i++) {
    var ring = document.createElement('div');
    var delay = i * 200;
    ring.style.cssText = 'position:absolute;top:50%;left:50%;width:40px;height:40px;border:2px solid rgba(255,215,0,0.4);border-radius:50%;transform:translate(-50%,-50%);animation:rippleOut 1s ' + delay + 'ms ease-out forwards;';
    el.appendChild(ring);
  }
  // Inject keyframe if needed
  if (!document.getElementById('ripple-style')) {
    var s = document.createElement('style');
    s.id = 'ripple-style';
    s.textContent = '@keyframes rippleOut{to{width:300px;height:300px;opacity:0;}}';
    document.head.appendChild(s);
  }
  setTimeout(function() { if(el.parentNode) el.innerHTML = ''; }, 1500);
};

MMA.VFX.showImpactReplay = function(scene, enemy) {
  if (!scene || !enemy) return;
  if (scene._impactReplayActive) return;
  scene._impactReplayActive = true;

  // Slow time
  scene.time.timeScale = 0.2;
  if (scene.physics) scene.physics.world.timeScale = 5;

  // Afterimage of enemy
  if (scene.add && enemy.x && enemy.y) {
    var ghost = scene.add.rectangle(enemy.x, enemy.y, enemy.displayWidth || 24, enemy.displayHeight || 36, enemy.type && enemy.type.color ? enemy.type.color : 0xff2200, 0.5).setDepth(199).setScrollFactor(0);
    scene.tweens.add({ targets: ghost, alpha: 0, duration: 400, onComplete: function() { if(ghost.active) ghost.destroy(); } });
  }

  scene.time.delayedCall(400, function() {
    scene.time.timeScale = 1;
    if (scene.physics) scene.physics.world.timeScale = 1;
    scene._impactReplayActive = false;
  });
};

MMA.VFX.updateExertionEffect = function(scene) {
  if (!scene || !scene.player || !scene.player.stats) return;
  var ratio = scene.player.stats.stamina / (scene.player.stats.maxStamina || 100);
  if (ratio > 0.2) {
    if (scene._exertionOverlay && scene._exertionOverlay.active) {
      scene._exertionOverlay.setAlpha(0);
    }
    return;
  }
  var W = (typeof CONFIG !== 'undefined' && CONFIG.CANVAS_W) ? CONFIG.CANVAS_W : 500;
  var H = (typeof CONFIG !== 'undefined' && CONFIG.CANVAS_H) ? CONFIG.CANVAS_H : 400;
  if (!scene._exertionOverlay || !scene._exertionOverlay.active) {
    scene._exertionOverlay = scene.add.rectangle(W/2, H/2, W, H, 0x000033, 0)
      .setDepth(265).setScrollFactor(0);
  }
  var intensity = (0.2 - ratio) / 0.2; // 0→1 as stamina drops 20%→0
  scene._exertionOverlay.setAlpha(intensity * 0.25);
};

MMA.VFX.showSweatShower = function(scene, x, y, damage) {
  if (!scene || !scene.add || damage < 15) return;
  var count = Math.min(8, Math.floor(damage / 5));
  for (var i = 0; i < count; i++) {
    (function() {
      var drop = scene.add.circle(
        x + (Math.random()*16 - 8), y,
        1 + Math.random() * 2,
        0xaaddff, 0.8
      ).setDepth(205);
      var vx = (Math.random() - 0.5) * 60;
      var vy = -30 - Math.random() * 40;
      scene.tweens.add({
        targets: drop,
        x: drop.x + vx * 0.5,
        y: drop.y + 30,
        alpha: 0, scaleX: 0.3, scaleY: 0.3,
        duration: 400 + Math.random() * 200,
        ease: 'Power2',
        onComplete: function() { if(drop.active) drop.destroy(); }
      });
    })();
  }
};

MMA.VFX.showKnockdownDust = function(scene, x, y) {
  if (!scene || !scene.add) return;
  for (var i = 0; i < 6; i++) {
    (function() {
      var size = 6 + Math.random() * 10;
      var dust = scene.add.circle(
        x + (Math.random()*30-15),
        y + 10,
        size, 0xbbaa88, 0.5 + Math.random() * 0.3
      ).setDepth(198);
      scene.tweens.add({
        targets: dust,
        x: dust.x + (Math.random()*40-20),
        y: dust.y - 15 - Math.random()*15,
        alpha: 0, scaleX: 2, scaleY: 2,
        duration: 500 + Math.random()*300,
        onComplete: function() { if(dust.active) dust.destroy(); }
      });
    })();
  }
};

// Feature 1: Combo Fever Dream
MMA.VFX.startFeverDream = function(scene) {
  if (!scene || scene._feverDreamActive) return;
  scene._feverDreamActive = true;
  scene._feverCharge = 0;
  if (scene.time) scene.time.timeScale = 0.9;
  if (scene.physics) scene.physics.world.timeScale = 1.11;
  var W = (typeof CONFIG !== 'undefined' && CONFIG.CANVAS_W) ? CONFIG.CANVAS_W : 500;
  var H = (typeof CONFIG !== 'undefined' && CONFIG.CANVAS_H) ? CONFIG.CANVAS_H : 400;
  if (!scene._feverOverlay) {
    scene._feverOverlay = scene.add.rectangle(W/2, H/2, W, H, 0xff8800, 0).setDepth(260).setScrollFactor(0);
  }
  scene.tweens.add({ targets: scene._feverOverlay, alpha: 0.12, duration: 300, yoyo: true, repeat: -1 });
  if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
    var p = scene.player;
    if (p) MMA.UI.showDamageText(scene, p.x, p.y - 40, '🔥 FEVER DREAM!', '#ff8800');
  }
};
MMA.VFX.addFeverCharge = function(scene, dmg) {
  if (!scene || !scene._feverDreamActive) return;
  scene._feverCharge = (scene._feverCharge || 0) + (dmg || 0);
};
MMA.VFX.endFeverDream = function(scene, target) {
  if (!scene || !scene._feverDreamActive) return;
  scene._feverDreamActive = false;
  if (scene.time) scene.time.timeScale = 1;
  if (scene.physics) scene.physics.world.timeScale = 1;
  if (scene._feverOverlay && scene._feverOverlay.active) {
    scene.tweens.killTweensOf(scene._feverOverlay);
    scene.tweens.add({ targets: scene._feverOverlay, alpha: 0, duration: 300 });
  }
  var explosion = Math.round((scene._feverCharge || 0) * 0.20);
  scene._feverCharge = 0;
  if (explosion > 0 && target && target.stats) {
    target.stats.hp = Math.max(0, target.stats.hp - explosion);
    if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
      MMA.UI.showDamageText(scene, target.x, target.y - 30, 'FEVER BURST! -' + explosion, '#ff8800');
    }
    if (scene.cameras) scene.cameras.main.flash(300, 255, 120, 0);
  }
};

// Feature 2: Fight Photographer Moment
MMA.VFX.triggerPhotographerMoment = function(scene, label) {
  if (!scene || scene._photoActive) return;
  scene._photoActive = true;
  var W = (typeof CONFIG !== 'undefined' && CONFIG.CANVAS_W) ? CONFIG.CANVAS_W : 500;
  var H = (typeof CONFIG !== 'undefined' && CONFIG.CANVAS_H) ? CONFIG.CANVAS_H : 400;
  if (scene.time) scene.time.timeScale = 0.05;
  if (scene.cameras) scene.cameras.main.flash(200, 255, 255, 255, false);
  var txt = scene.add.text(W/2, H/2 - 20, '📸 ' + (label || 'MOMENT!'), {
    fontSize: '14px', fontFamily: 'Arial Black', color: '#ffffff', stroke: '#000', strokeThickness: 3
  }).setOrigin(0.5).setDepth(300).setScrollFactor(0);
  scene.time.delayedCall(800, function() {
    scene._photoActive = false;
    if (scene.time) scene.time.timeScale = 1;
    scene.tweens.add({ targets: txt, alpha: 0, duration: 400, onComplete: function() { if(txt.active) txt.destroy(); } });
    try {
      var gallery = JSON.parse(localStorage.getItem('mma_fight_gallery') || '[]');
      gallery.push({ label: label, ts: Date.now(), zone: scene.currentZone || 1 });
      if (gallery.length > 20) gallery = gallery.slice(-20);
      localStorage.setItem('mma_fight_gallery', JSON.stringify(gallery));
    } catch(e) {}
  });
};
// === COMBO FEVER DREAM ===
MMA.VFX.startFeverDream = MMA.VFX.startFeverDream || function(scene) {
  if (!scene || scene._feverDreamActive) return;
  scene._feverDreamActive = true;
  scene._feverCharge = 0;
  if (scene.time) scene.time.timeScale = 0.9;
  if (scene.physics) scene.physics.world.timeScale = 1.11;
  var W = (typeof CONFIG !== 'undefined' && CONFIG.CANVAS_W) ? CONFIG.CANVAS_W : 500;
  var H = (typeof CONFIG !== 'undefined' && CONFIG.CANVAS_H) ? CONFIG.CANVAS_H : 400;
  if (!scene._feverOverlay) {
    scene._feverOverlay = scene.add.rectangle(W/2, H/2, W, H, 0xff8800, 0).setDepth(260).setScrollFactor(0);
  }
  scene.tweens.add({ targets: scene._feverOverlay, alpha: 0.12, duration: 300, yoyo: true, repeat: -1 });
  var p = scene.player;
  if (p && window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
    MMA.UI.showDamageText(scene, p.x, p.y - 40, '🔥 FEVER DREAM!', '#ff8800');
  }
};
MMA.VFX.addFeverCharge = MMA.VFX.addFeverCharge || function(scene, dmg) {
  if (!scene || !scene._feverDreamActive) return;
  scene._feverCharge = (scene._feverCharge || 0) + (dmg || 0);
};
MMA.VFX.endFeverDream = MMA.VFX.endFeverDream || function(scene, target) {
  if (!scene || !scene._feverDreamActive) return;
  scene._feverDreamActive = false;
  if (scene.time) scene.time.timeScale = 1;
  if (scene.physics) scene.physics.world.timeScale = 1;
  if (scene._feverOverlay && scene._feverOverlay.active) {
    scene.tweens.killTweensOf(scene._feverOverlay);
    scene.tweens.add({ targets: scene._feverOverlay, alpha: 0, duration: 300 });
  }
  var explosion = Math.round((scene._feverCharge || 0) * 0.20);
  scene._feverCharge = 0;
  if (explosion > 0 && target && target.stats) {
    target.stats.hp = Math.max(0, target.stats.hp - explosion);
    if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
      MMA.UI.showDamageText(scene, target.x, target.y - 30, 'FEVER BURST! -' + explosion, '#ff8800');
    }
    if (scene.cameras) scene.cameras.main.flash(300, 255, 120, 0);
  }
};

// === FIGHT PHOTOGRAPHER MOMENT ===
MMA.VFX.triggerPhotographerMoment = MMA.VFX.triggerPhotographerMoment || function(scene, label) {
  if (!scene || scene._photoActive) return;
  scene._photoActive = true;
  var W = (typeof CONFIG !== 'undefined' && CONFIG.CANVAS_W) ? CONFIG.CANVAS_W : 500;
  var H = (typeof CONFIG !== 'undefined' && CONFIG.CANVAS_H) ? CONFIG.CANVAS_H : 400;
  if (scene.time) scene.time.timeScale = 0.05;
  if (scene.cameras) scene.cameras.main.flash(200, 255, 255, 255, false);
  var txt = scene.add.text(W/2, H/2 - 20, '📸 ' + (label || 'MOMENT!'), {
    fontSize: '14px', fontFamily: 'Arial Black', color: '#ffffff', stroke: '#000', strokeThickness: 3
  }).setOrigin(0.5).setDepth(300).setScrollFactor(0);
  scene.time.delayedCall(800, function() {
    scene._photoActive = false;
    if (scene.time) scene.time.timeScale = 1;
    scene.tweens.add({ targets: txt, alpha: 0, duration: 400, onComplete: function() { if(txt.active) txt.destroy(); } });
    try {
      var gallery = JSON.parse(localStorage.getItem('mma_fight_gallery') || '[]');
      gallery.push({ label: label, ts: Date.now(), zone: scene.currentZone || 1 });
      if (gallery.length > 20) gallery = gallery.slice(-20);
      localStorage.setItem('mma_fight_gallery', JSON.stringify(gallery));
    } catch(e) {}
  });
};
// === CINEMATIC HIT DIRECTOR ===
// On big hits, briefly frame-freeze + zoom toward impact point
MMA.VFX = window.MMA.VFX || {};

MMA.VFX.cinematicHit = MMA.VFX.cinematicHit || function(scene, x, y) {
  if (!scene || scene._cinematicActive) return;
  scene._cinematicActive = true;
  // Brief camera zoom
  var cam = scene.cameras && scene.cameras.main;
  if (cam) {
    cam.zoomTo(1.15, 80);
    scene.time.delayedCall(180, function() {
      cam.zoomTo(1.0, 120);
    });
  }
  // Flash white ring at impact
  if (scene.add && scene.add.circle) {
    var ring = scene.add.circle(x, y, 20, 0xffffff, 0.8).setDepth(300);
    scene.tweens.add({
      targets: ring, scaleX: 4, scaleY: 4, alpha: 0,
      duration: 220,
      onComplete: function() { if (ring.active) ring.destroy(); }
    });
  }
  scene.time.delayedCall(300, function() { scene._cinematicActive = false; });
};

// === CORNER DESPERATION FLASH ===
// Player near ring edge at low HP: screen edge pulses red urgently
MMA.VFX.updateCornerDesperation = MMA.VFX.updateCornerDesperation || function(scene) {
  if (!scene || !scene.player) return;
  var p = scene.player;
  if (!p.stats) return;
  var hpRatio = p.stats.hp / (p.stats.maxHp || 100);
  var CANVAS_W = (typeof CONFIG !== 'undefined' && CONFIG.CANVAS_W) ? CONFIG.CANVAS_W : 500;
  var CANVAS_H = (typeof CONFIG !== 'undefined' && CONFIG.CANVAS_H) ? CONFIG.CANVAS_H : 700;
  var MARGIN = 80;
  var nearEdge = (p.x < MARGIN || p.x > CANVAS_W - MARGIN || p.y < MARGIN + 80 || p.y > CANVAS_H - MARGIN);
  var desperate = hpRatio < 0.25 && nearEdge;
  var el = _vfxGetEl('corner-desperation-overlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'corner-desperation-overlay';
    el.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:40;border:0px solid #ff0000;transition:border-width 0.1s,opacity 0.1s;opacity:0;';
    var gc = _vfxGetEl('game-container') || document.body;
    gc.appendChild(el);
  }
  if (desperate) {
    var pulse = Math.sin(Date.now() / 150) * 0.5 + 0.5;
    el.style.opacity = (0.4 + pulse * 0.4).toFixed(2);
    el.style.borderWidth = (6 + pulse * 6).toFixed(0) + 'px';
  } else {
    el.style.opacity = '0';
    el.style.borderWidth = '0px';
  }
};

// === VICTORY FIREWORKS ===
// On zone clear, burst of colorful particles from top of screen
MMA.VFX.showVictoryFireworks = MMA.VFX.showVictoryFireworks || function(scene) {
  if (!scene || !scene.add) return;
  var CANVAS_W = (typeof CONFIG !== 'undefined' && CONFIG.CANVAS_W) ? CONFIG.CANVAS_W : 500;
  var colors = [0xff0000, 0x00ff88, 0xFFD700, 0x00aaff, 0xff00ff];
  for (var burst = 0; burst < 5; burst++) {
    (function(b) {
      scene.time.delayedCall(b * 180, function() {
        var bx = 80 + Math.random() * (CANVAS_W - 160);
        for (var i = 0; i < 10; i++) {
          var angle = (i / 10) * Math.PI * 2;
          var speed = 80 + Math.random() * 80;
          var dot = scene.add.circle(bx, 60, 4, colors[b % colors.length], 1).setDepth(250);
          scene.tweens.add({
            targets: dot,
            x: bx + Math.cos(angle) * speed,
            y: 60 + Math.sin(angle) * speed,
            alpha: 0, duration: 700 + Math.random() * 300,
            onComplete: function() { if (dot.active) dot.destroy(); }
          });
        }
      });
    })(burst);
  }
};
// === PARRY FLASH VFX ===
MMA.VFX.showParryFlash = MMA.VFX.showParryFlash || function(scene, x, y) {
  if (!scene || !scene.add) return;
  var ring = scene.add.circle(x, y, 30, 0xffffff, 0.9).setDepth(300);
  scene.tweens.add({
    targets: ring, scaleX: 3, scaleY: 3, alpha: 0, duration: 200,
    onComplete: function() { if (ring.active) ring.destroy(); }
  });
};

// === BERSERKER AURA VFX ===
// Pulsing red glow around berserker enemy
MMA.VFX.updateBerserkerAura = MMA.VFX.updateBerserkerAura || function(scene, enemy) {
  if (!scene || !enemy || !enemy.active) return;
  if (!enemy._berserker) {
    if (enemy._berserkerAura) { enemy._berserkerAura.destroy(); enemy._berserkerAura = null; }
    return;
  }
  if (!enemy._berserkerAura && scene.add) {
    var aura = scene.add.circle(enemy.x, enemy.y, 28, 0xff0000, 0.0).setDepth(enemy.depth - 1);
    enemy._berserkerAura = aura;
  }
  if (enemy._berserkerAura) {
    enemy._berserkerAura.setPosition(enemy.x, enemy.y);
    var pulse = Math.sin(Date.now() / 120) * 0.2 + 0.25;
    enemy._berserkerAura.setAlpha(pulse);
  }
};

// === REVENGE CHARGE GLOW ===
MMA.VFX.showRevengeCharge = MMA.VFX.showRevengeCharge || function(scene, enemy) {
  if (!scene || !enemy || !scene.add) return;
  var glow = scene.add.circle(enemy.x, enemy.y, 20, 0xff4400, 0.7).setDepth(enemy.depth + 1);
  scene.tweens.add({
    targets: glow, scaleX: 2.5, scaleY: 2.5, alpha: 0, duration: 400,
    onComplete: function() { if (glow.active) glow.destroy(); }
  });
};

// === GUARD BREAK EXPLOSION ===
MMA.VFX.showGuardBreak = MMA.VFX.showGuardBreak || function(scene, x, y) {
  if (!scene || !scene.add) return;
  if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
    MMA.UI.showDamageText(scene, x, y - 20, '💥 GUARD BROKEN!', '#FFD700');
  }
  for (var i = 0; i < 6; i++) {
    var angle = (i / 6) * Math.PI * 2;
    var shard = scene.add.rectangle(x, y, 8, 3, 0xFFD700, 1).setDepth(280);
    scene.tweens.add({
      targets: shard,
      x: x + Math.cos(angle) * 40,
      y: y + Math.sin(angle) * 40,
      alpha: 0, angle: 180,
      duration: 350,
      onComplete: function() { if (shard.active) shard.destroy(); }
    });
  }
};

// === MOMENTUM TRAIL ===
// Player on fire gets a brief trail of golden particles
MMA.VFX.showMomentumTrail = MMA.VFX.showMomentumTrail || function(scene, player) {
  if (!scene || !player || !scene.add) return;
  var dot = scene.add.circle(player.x, player.y, 5, 0xFFD700, 0.7).setDepth(180);
  scene.tweens.add({
    targets: dot, alpha: 0, scaleX: 0.3, scaleY: 0.3,
    duration: 300,
    onComplete: function() { if (dot.active) dot.destroy(); }
  });
};
// === CORNER DOMINATION VFX ===
// Red glow on walls when enemy is cornered
MMA.VFX.updateCornerDomVFX = MMA.VFX.updateCornerDomVFX || function(scene) {
  if (!scene) return;
  var enemies = scene.enemies || [];
  var cornered = enemies.some(function(e) { return e && e.active && e._cornerDominating; });
  var el = _vfxGetEl('corner-dom-wall-glow');
  if (!el) {
    el = document.createElement('div');
    el.id = 'corner-dom-wall-glow';
    el.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:35;border:0px solid #ff4400;transition:border-width 0.15s,opacity 0.15s;opacity:0;';
    var gc = _vfxGetEl('game-container') || document.body;
    gc.appendChild(el);
  }
  if (cornered) {
    var pulse = Math.sin(Date.now() / 200) * 0.3 + 0.5;
    el.style.opacity = pulse.toFixed(2);
    el.style.borderWidth = '5px';
  } else {
    el.style.opacity = '0';
    el.style.borderWidth = '0px';
  }
};

// === CONDITIONING FATIGUE FLASH ===
// When a move is exhausted, brief red flash on the button
MMA.VFX.flashFatiguedMove = MMA.VFX.flashFatiguedMove || function(moveKey) {
  var btn = document.querySelector('[data-move="' + moveKey + '"]');
  if (!btn) return;
  var orig = btn.style.background;
  btn.style.background = 'rgba(255,0,0,0.5)';
  setTimeout(function() { btn.style.background = orig; }, 200);
};

// === RIVALRY COUNTER FLASH ===
// When rivalry counter style activates on enemy, show indicator
MMA.VFX.showRivalryCounter = MMA.VFX.showRivalryCounter || function(scene, enemy) {
  if (!scene || !enemy) return;
  if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
    var styleLabels = { strike: 'COUNTER: STRIKER', grapple: 'COUNTER: GRAPPLER', kick: 'COUNTER: KICKER' };
    var label = styleLabels[enemy._rivalryCounter] || 'COUNTER STYLE';
    MMA.UI.showDamageText(scene, enemy.x, enemy.y - 35, label, '#ff0088');
  }
};

// === TOURNAMENT ENTRY FLASH ===
MMA.VFX.showTournamentEntry = MMA.VFX.showTournamentEntry || function(scene) {
  if (!scene) return;
  var el = document.getElementById('tournament-entry-flash');
  if (el) el.remove();
  el = document.createElement('div');
  el.id = 'tournament-entry-flash';
  el.style.cssText = 'position:absolute;inset:0;background:rgba(136,0,255,0.3);z-index:180;pointer-events:none;';
  var gc = document.getElementById('game-container') || document.body;
  gc.appendChild(el);
  scene.time.delayedCall(400, function() { if (el.parentNode) el.remove(); });
  if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
    var cx = (typeof CONFIG !== 'undefined' && CONFIG.CANVAS_W) ? CONFIG.CANVAS_W / 2 : 250;
    MMA.UI.showDamageText(scene, cx, 120, '🏆 TOURNAMENT UNLOCKED', '#FFD700');
  }
};
// === WEATHER HAZARD VFX ===
// Persistent overlay effects for weather rooms
MMA.VFX.startWeatherHazardVFX = MMA.VFX.startWeatherHazardVFX || function(scene, weatherType) {
  if (!scene) return;
  // Clear previous
  MMA.VFX.stopWeatherHazardVFX(scene);
  if (weatherType === 'rain') {
    // Falling rain particles
    scene._weatherTimer = scene.time.addEvent({
      delay: 80,
      callback: function() {
        if (!scene || scene.gameOver) return;
        var CANVAS_W = (typeof CONFIG !== 'undefined' && CONFIG.CANVAS_W) ? CONFIG.CANVAS_W : 500;
        var x = Math.random() * CANVAS_W;
        var drop = scene.add.rectangle(x, 0, 2, 12, 0x4488ff, 0.5).setDepth(50);
        scene.tweens.add({
          targets: drop, y: 700, alpha: 0, duration: 600 + Math.random() * 200,
          onComplete: function() { if (drop.active) drop.destroy(); }
        });
      },
      repeat: -1
    });
  } else if (weatherType === 'ice') {
    // Blue frost tint on screen edges
    var frost = document.getElementById('frost-overlay');
    if (!frost) {
      frost = document.createElement('div');
      frost.id = 'frost-overlay';
      frost.style.cssText = 'position:absolute;inset:0;background:radial-gradient(ellipse at center, transparent 60%, rgba(100,200,255,0.25) 100%);pointer-events:none;z-index:45;';
      var gc = document.getElementById('game-container') || document.body;
      gc.appendChild(frost);
    }
  } else if (weatherType === 'heat') {
    // Heat shimmer — orange edge glow
    var heat = document.getElementById('heat-overlay');
    if (!heat) {
      heat = document.createElement('div');
      heat.id = 'heat-overlay';
      heat.style.cssText = 'position:absolute;inset:0;background:radial-gradient(ellipse at center, transparent 55%, rgba(255,100,0,0.2) 100%);pointer-events:none;z-index:45;';
      var gc2 = document.getElementById('game-container') || document.body;
      gc2.appendChild(heat);
    }
  }
};

MMA.VFX.stopWeatherHazardVFX = MMA.VFX.stopWeatherHazardVFX || function(scene) {
  if (scene && scene._weatherTimer) { scene._weatherTimer.remove(); scene._weatherTimer = null; }
  ['frost-overlay','heat-overlay'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.remove();
  });
};

// === BLOODLINE INHERITANCE FLASH ===
MMA.VFX.showBloodlineFlash = MMA.VFX.showBloodlineFlash || function(scene, moveKey) {
  if (!scene) return;
  if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function' && scene.player) {
    MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 45, '🧬 ' + moveKey.toUpperCase(), '#cc00ff');
  }
};

// === BET WIN/LOSE FLASH ===
MMA.VFX.showBetResult = MMA.VFX.showBetResult || function(scene, won, amount) {
  if (!scene || !scene.add) return;
  var CANVAS_W = (typeof CONFIG !== 'undefined' && CONFIG.CANVAS_W) ? CONFIG.CANVAS_W : 500;
  var color = won ? 0x00ff88 : 0xff2200;
  var overlay = scene.add.rectangle(CANVAS_W/2, 350, CANVAS_W, 700, color, 0.2).setDepth(300);
  scene.tweens.add({
    targets: overlay, alpha: 0, duration: 600,
    onComplete: function() { if (overlay.active) overlay.destroy(); }
  });
  if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
    var cx = CANVAS_W / 2;
    MMA.UI.showDamageText(scene, cx, 200, won ? ('💰 BET WON +' + (amount*2) + 'g') : ('💸 BET LOST -' + amount + 'g'), won ? '#00ff88' : '#ff2200');
  }
};
// === FEAR TELL VFX ===
// Enemy flinch indicator after 3+ hits of same type
MMA.VFX.showFearTell = MMA.VFX.showFearTell || function(scene, enemy) {
  if (!scene || !enemy) return;
  if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
    MMA.UI.showDamageText(scene, enemy.x, enemy.y - 35, '😨 FLINCH!', '#ff88aa');
  }
  // Brief red ring under enemy
  if (!scene.add) return;
  var ring = scene.add.graphics().setDepth(8);
  ring.lineStyle(3, 0xff2244, 0.8);
  ring.strokeCircle(enemy.x, enemy.y + 16, 22);
  scene.tweens.add({
    targets: ring, alpha: 0, duration: 500,
    onComplete: function() { if (ring.active) ring.destroy(); }
  });
};

// === MUTATION FLASH ===
MMA.VFX.showMutationFlash = MMA.VFX.showMutationFlash || function(scene, mutType) {
  if (!scene || !scene.add) return;
  var colors = { power: 0xff4400, swift: 0x44aaff, drain: 0xaa00ff, ko: 0xff0000 };
  var col = colors[mutType] || 0xffffff;
  var CANVAS_W = (typeof CONFIG !== 'undefined' && CONFIG.CANVAS_W) ? CONFIG.CANVAS_W : 500;
  var overlay = scene.add.rectangle(CANVAS_W/2, 350, CANVAS_W, 700, col, 0.18).setDepth(200);
  scene.tweens.add({
    targets: overlay, alpha: 0, duration: 400,
    onComplete: function() { if (overlay.active) overlay.destroy(); }
  });
};

// === RING POSITION INDICATOR ===
// Brief HUD text showing current ring position bonus
MMA.VFX.showRingPositionHint = MMA.VFX.showRingPositionHint || function(scene) {
  if (!scene || !window.MMA || !MMA.Combat) return;
  var pos = typeof MMA.Combat.getRingPosition === 'function' ? MMA.Combat.getRingPosition(scene) : 'center';
  var info = (MMA.Combat.RING_POSITIONS || {})[pos];
  if (!info || pos === 'center') return;
  if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function' && scene.player) {
    MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 60, info.label + ' ' + info.desc, '#ffcc44');
  }
};

// === WARMUP VULNERABILITY FLASH ===
MMA.VFX.showWarmupHit = MMA.VFX.showWarmupHit || function(scene, enemy) {
  if (!scene || !enemy) return;
  if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
    MMA.UI.showDamageText(scene, enemy.x, enemy.y - 40, '⚡ COLD! +40%', '#ffee00');
  }
  if (scene.cameras) scene.cameras.main.flash(150, 255, 240, 100);
};

// === CREED BADGE ===
// Persistent small badge showing player's creed in top HUD
MMA.VFX.showCreedBadge = MMA.VFX.showCreedBadge || function() {
  var existing = document.getElementById('creed-badge');
  if (existing) return;
  if (!window.MMA || !MMA.Player || typeof MMA.Player.getCreed !== 'function') return;
  var creed = MMA.Player.getCreed();
  var badge = document.createElement('div');
  badge.id = 'creed-badge';
  badge.textContent = creed.label;
  badge.style.cssText = 'position:absolute;top:4px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.7);color:' + creed.color + ';font-family:monospace;font-size:10px;padding:2px 8px;border-radius:10px;border:1px solid ' + creed.color + ';z-index:200;pointer-events:none;letter-spacing:1px;';
  var gc = document.getElementById('game-container') || document.body;
  gc.appendChild(badge);
};

window.MMA = window.MMA || {};
window.MMA.UI = window.MMA.UI || {};
// Hype meter state (DOM-based, complements Phaser meter)
MMA.UI.hype = { value: 0, peaked: false };

Object.assign(window.MMA.UI, {
  comboCounter: {
    container: null,
    text: null,
    visible: false
  },
  // Hype meter for crowd engagement,
  showComboCounter: function(scene) {
    if (this.comboCounter.container) return this.comboCounter.container;
    if (!scene || !scene.cameras || !scene.cameras.main) return null;
    var centerX = scene.cameras.main.width / 2;
    var topY = 80;
    
    var container = scene.add.container(centerX, topY);
    container.setDepth(50);
    container.setAlpha(0);
    
    // Background glow
    var glow = scene.add.graphics();
    glow.fillStyle(0xff6b00, 0.3);
    glow.fillCircle(0, 0, 50);
    container.add(glow);
    
    // Combo text
    var text = scene.add.text(0, 0, '0', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '42px',
      color: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    container.add(text);
    
    // "COMBO" label
    var label = scene.add.text(0, 30, 'COMBO', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(label);
    
    this.comboCounter.container = container;
    this.comboCounter.text = text;
    
    // Fade in
    scene.tweens.add({
      targets: container,
      alpha: 1,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 150,
      ease: 'Back.easeOut',
      onComplete: function() {
        scene.tweens.add({
          targets: container,
          scaleX: 1,
          scaleY: 1,
          duration: 100
        });
      }
    });
    
    return container;
  },
  updateComboCounter: function(scene, count) {
    if (!this.comboCounter.container) {
      this.showComboCounter(scene);
    }
    
    var container = this.comboCounter.container;
    var text = this.comboCounter.text;
    if (!container || !text || !scene) return;
    // Guard: Phaser text object may be destroyed after room transition
    if (!text.active || !text.scene) return;
    
    // Update text
    text.setText(count > 0 ? count.toString() : '0');
    
    // Pulse effect on increment
    if (count > 0) {
      scene.tweens.add({
        targets: container,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 80,
        yoyo: true,
        ease: 'Quad.easeOut'
      });
      
      // Color intensifies with higher combos
      if (count >= 10) {
        text.setColor('#ff0000');
      } else if (count >= 5) {
        text.setColor('#ff6600');
      } else {
        text.setColor('#ffcc00');
      }
    }
    
    // Show if not visible
    if (count > 0 && !this.comboCounter.visible) {
      container.setAlpha(1);
      this.comboCounter.visible = true;
    }
  },
  hideComboCounter: function(scene) {
    var container = this.comboCounter.container;
    if (!container) return;
    
    scene.tweens.add({
      targets: container,
      alpha: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 200,
      ease: 'Quad.easeIn',
      onComplete: function() {
        container.setVisible(false);
      }
    });
    
    this.comboCounter.visible = false;
  },
  destroyComboCounter: function() {
    if (this.comboCounter.container) {
      this.comboCounter.container.destroy();
      this.comboCounter.container = null;
      this.comboCounter.text = null;
    }
    this.comboCounter.visible = false;
  },
  // Hype meter methods,
  hypeMeter: {
    value: 0,
    maxValue: 100,
    container: null,
    bar: null,
    label: null
  },
  showHypeMeter: function(scene) {
    if (typeof this.initHypeMeterDOM === 'function') this.initHypeMeterDOM();
    if (typeof this.renderHypeMeter === 'function') this.renderHypeMeter();
    if (this.hypeMeter.container) return this.hypeMeter.container;
    if (!scene || !scene.cameras || !scene.cameras.main) return null;
    var rightX = scene.cameras.main.width - 30;
    var topY = 60;
    
    var container = scene.add.container(rightX, topY);
    container.setDepth(50);
    
    // Background
    var bg = scene.add.graphics();
    bg.fillStyle(0x000000, 0.6);
    bg.fillRoundedRect(-20, -35, 40, 120, 8);
    container.add(bg);
    
    // Label
    var label = scene.add.text(0, -20, 'HYPE', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(label);
    
    // Bar background
    var barBg = scene.add.graphics();
    barBg.fillStyle(0x333333, 0.8);
    barBg.fillRect(-12, -5, 24, 90);
    container.add(barBg);
    
    // Bar fill
    var bar = scene.add.graphics();
    bar.fillStyle(0xff00ff, 1);
    bar.fillRect(-10, 0, 20, 0);
    container.add(bar);
    
    this.hypeMeter.container = container;
    this.hypeMeter.bar = bar;
    this.hypeMeter.label = label;
    
    return container;
  },
  updateHypeMeter: function(scene, value, maxValue) {
    if (!this.hypeMeter.container) {
      this.showHypeMeter(scene);
    }
    
    this.hypeMeter.value = Math.max(0, Math.min(value, maxValue));
    this.hypeMeter.maxValue = maxValue;
    
    var pct = this.hypeMeter.value / maxValue;
    var barHeight = pct * 85;
    
    // Clear and redraw bar
    var bar = this.hypeMeter.bar;
    bar.clear();
    
    // Color based on hype level
    var color;
    if (pct >= 0.8) {
      color = 0xff00ff; // Purple for max hype
    } else if (pct >= 0.5) {
      color = 0x00ffff; // Cyan
    } else {
      color = 0xffff00; // Yellow
    }
    
    bar.fillStyle(color, 1);
    bar.fillRect(-10, 0, 20, -barHeight);
  },
  addHype: function(scene, amount) {
    if (typeof amount !== 'number') {
      amount = typeof scene === 'number' ? scene : 0;
      scene = null;
    }
    // Update Phaser meter
    var newValue = this.hypeMeter.value + amount;
    this.updateHypeMeter(scene, newValue, this.hypeMeter.maxValue);
    // Update DOM hype state
    MMA.UI.hype.value = Math.min(100, MMA.UI.hype.value + amount);
    var el = document.getElementById('hype-bar');
    if (el) el.style.width = MMA.UI.hype.value + '%';
    if (MMA.UI.hype.value >= 100 && !MMA.UI.hype.peaked) {
      MMA.UI.hype.peaked = true;
      if (scene && typeof MMA.UI.showDamageText === 'function') {
        MMA.UI.showDamageText(scene, 200, 40, 'CROWD BOOST! +10% DMG', '#FFD700');
      }
    }
  },
  drainHype: function(delta) {
    MMA.UI.hype.value = Math.max(0, MMA.UI.hype.value - (delta * 0.008));
    if (MMA.UI.hype.value < 80) MMA.UI.hype.peaked = false;
    var el = document.getElementById('hype-bar');
    if (el) el.style.width = MMA.UI.hype.value + '%';
    // Also drain Phaser meter
    if (this.hypeMeter && this.hypeMeter.container) {
      this.updateHypeMeter(null, this.hypeMeter.value - (delta * 0.008), this.hypeMeter.maxValue);
    }
  },
  getHypeBonus: function() {
    return MMA.UI.hype.value >= 80 ? 1.1 : 1.0;
  },
  destroyHypeMeter: function() {
    if (this.hypeMeter.container) {
      this.hypeMeter.container.destroy();
      this.hypeMeter.container = null;
      this.hypeMeter.bar = null;
      this.hypeMeter.label = null;
    }
    this.hypeMeter.value = 0;
  },
  // Fighter's Diary - auto-logged milestones and memorable moments

  focusMeter: { value: 0, maxValue: 100, container: null, bar: null, label: null, glow: null },
  showFocusMeter: function(scene) {
    if (this.focusMeter.container) return this.focusMeter.container;
    var leftX = 30, topY = 60;
    var container = scene.add.container(leftX, topY); container.setDepth(50);
    var bg = scene.add.graphics(); bg.fillStyle(0x000000, 0.6); bg.fillRoundedRect(-20,-35,40,120,8); container.add(bg);
    var label = scene.add.text(0,-20,'FOCUS',{fontFamily:'Arial,sans-serif',fontSize:'12px',color:'#66e6ff',fontStyle:'bold'}).setOrigin(0.5); container.add(label);
    var barBg = scene.add.graphics(); barBg.fillStyle(0x333333,0.8); barBg.fillRect(-12,-5,24,90); container.add(barBg);
    var bar = scene.add.graphics(); bar.fillStyle(0x66e6ff,1); bar.fillRect(-10,0,20,0); container.add(bar);
    var glow = scene.add.graphics(); glow.fillStyle(0x66e6ff,0); glow.fillCircle(0,45,35); container.add(glow);
    this.focusMeter.container=container; this.focusMeter.bar=bar; this.focusMeter.label=label; this.focusMeter.glow=glow;
    return container;
  },
  updateFocusMeter: function(scene, value, maxValue) {
    if (!this.focusMeter.container) this.showFocusMeter(scene);
    this.focusMeter.value = Math.max(0, Math.min(value, maxValue));
    this.focusMeter.maxValue = maxValue;
    var pct = this.focusMeter.value / maxValue;
    var bar = this.focusMeter.bar; bar.clear();
    var color = pct>=1.0?0xffffff:pct>=0.7?0x66e6ff:pct>=0.3?0x4488ff:0x224488;
    bar.fillStyle(color,1); bar.fillRect(-10,0,20,-(pct*85));
    var glow = this.focusMeter.glow; glow.clear();
    if (pct>=1.0){glow.fillStyle(0x66e6ff,0.4+0.2*Math.sin(Date.now()/150));glow.fillCircle(0,45,35);}
  },
  resetFocusMeter: function() { this.focusMeter.value = 0; },
  isFocusFull: function() { return this.focusMeter.value >= this.focusMeter.maxValue; },
  destroyFocusMeter: function() {
    if (this.focusMeter.container) { this.focusMeter.container.destroy(); this.focusMeter.container=null; this.focusMeter.bar=null; this.focusMeter.label=null; this.focusMeter.glow=null; }
    this.focusMeter.value = 0;
  }
});

MMA.UI.initHypeMeterDOM = function() {
  if (document.getElementById('hype-meter')) return;
  var container = document.getElementById('game-container') || document.body;
  var meter = document.createElement('div');
  meter.id = 'hype-meter';
  meter.style.cssText = 'position:absolute;bottom:52px;left:50%;transform:translateX(-50%);width:120px;height:8px;background:#222;border-radius:4px;z-index:50;overflow:hidden;';
  var fill = document.createElement('div');
  fill.id = 'hype-meter-fill';
  fill.style.cssText = 'height:100%;width:0%;background:#888;border-radius:4px;transition:width 0.3s,background 0.3s;';
  meter.appendChild(fill);
  var label = document.createElement('div');
  label.id = 'hype-meter-label';
  label.style.cssText = 'text-align:center;font-size:7px;color:#888;margin-top:1px;font-family:Arial;';
  label.textContent = '🎤 COLD';
  meter.appendChild(label);
  container.appendChild(meter);
};

MMA.UI.initVarietyMeterDOM = function() {
  if (document.getElementById('variety-meter')) return;
  var container = document.getElementById('game-container') || document.body;
  var meter = document.createElement('div');
  meter.id = 'variety-meter';
  meter.style.cssText = 'position:absolute;bottom:62px;left:4px;width:60px;z-index:50;';
  var label = document.createElement('div');
  label.style.cssText = 'font-size:6px;color:#888;font-family:Arial;text-align:center;margin-bottom:1px;';
  label.textContent = 'VARIETY';
  var barBg = document.createElement('div');
  barBg.style.cssText = 'height:4px;background:#222;border-radius:2px;overflow:hidden;';
  var barFill = document.createElement('div');
  barFill.id = 'variety-meter-fill';
  barFill.style.cssText = 'height:100%;width:0%;background:#00ffcc;border-radius:2px;transition:width 0.2s;';
  barBg.appendChild(barFill);
  meter.appendChild(label);
  meter.appendChild(barBg);
  container.appendChild(meter);
};

MMA.UI.updateVarietyMeter = function() {
  var fill = _getEl('variety-meter-fill');
  if (!fill) return;
  var bonus = window.MMA && MMA.Combat && typeof MMA.Combat.getVarietyBonus === 'function' ? MMA.Combat.getVarietyBonus() : 0;
  var pct = Math.max(0, Math.min(1, bonus / 0.4));
  fill.style.width = (pct * 100).toFixed(0) + '%';
  // Color shifts from cyan to gold as it fills
  if (pct > 0.7) fill.style.background = '#FFD700';
  else if (pct > 0.4) fill.style.background = '#ffaa00';
  else fill.style.background = '#00ffcc';
};

MMA.UI.initPressureMeterDOM = function() {
  if (document.getElementById('pressure-meter')) return;
  var container = document.getElementById('game-container') || document.body;
  var meter = document.createElement('div');
  meter.id = 'pressure-meter';
  meter.style.cssText = 'position:absolute;bottom:70px;left:4px;width:60px;z-index:50;';
  var label = document.createElement('div');
  label.id = 'pressure-meter-label';
  label.style.cssText = 'font-size:6px;color:#ff4400;font-family:Arial;text-align:center;margin-bottom:1px;';
  label.textContent = 'PRESSURE';
  var barBg = document.createElement('div');
  barBg.style.cssText = 'height:4px;background:#222;border-radius:2px;overflow:hidden;';
  var barFill = document.createElement('div');
  barFill.id = 'pressure-meter-fill';
  barFill.style.cssText = 'height:100%;width:0%;background:#ff4400;border-radius:2px;transition:width 0.15s;';
  barBg.appendChild(barFill);
  meter.appendChild(label);
  meter.appendChild(barBg);
  container.appendChild(meter);
};

MMA.UI.updatePressureMeter = function() {
  var fill = _getEl('pressure-meter-fill');
  if (!fill) return;
  var level = window.MMA && MMA.Combat ? (MMA.Combat._pressureLevel || 0) : 0;
  fill.style.width = level + '%';
  var label = _getEl('pressure-meter-label');
  if (label) label.textContent = level >= 100 ? '💥 PRESSURE!' : 'PRESSURE';
};

MMA.UI.checkTechniqueMutation = function(scene, moveKey) {
  if (!scene || !scene.player || !scene.player.moveMastery) return null;
  var mastery = scene.player.moveMastery[moveKey];
  var uses = mastery ? (typeof mastery === 'object' ? mastery.uses || 0 : mastery) : 0;

  if (!scene.player._mutations) scene.player._mutations = {};
  if (scene.player._mutations[moveKey]) return scene.player._mutations[moveKey]; // already mutated

  if (uses >= 15) {
    var bonusTypes = ['stun', 'range', 'stamina', 'damage'];
    var bonus = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];
    scene.player._mutations[moveKey] = bonus;

    var labels = { stun: '+stun chance', range: '+range', stamina: '-stamina cost', damage: '+5% dmg' };
    if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
      MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 30,
        moveKey.toUpperCase() + ' MUTATED: ' + (labels[bonus] || bonus), '#cc88ff');
    }
    // Save mutation
    try {
      var saved = JSON.parse(localStorage.getItem('mma_mutations') || '{}');
      saved[moveKey] = bonus;
      localStorage.setItem('mma_mutations', JSON.stringify(saved));
    } catch(e) {}
    return bonus;
  }
  return null;
};
// === WEATHER HUD INDICATOR ===
// Shows current session weather condition in top corner

// DOM element cache for hot update paths
var _domCache = {};
function _getEl(id) {
  if (!_domCache[id] || !_domCache[id].parentNode) {
    _domCache[id] = document.getElementById(id);
  }
  return _domCache[id];
}
window.MMA.UIMeter = window.MMA.UIMeter || {};
MMA.UIMeter._clearDOMCache = function() { _domCache = {}; };

MMA.UIMeter = window.MMA.UIMeter || {};

MMA.UIMeter.initWeatherHUD = MMA.UIMeter.initWeatherHUD || function() {
  var el = document.getElementById('weather-hud');
  if (el) return;
  el = document.createElement('div');
  el.id = 'weather-hud';
  el.style.cssText = 'position:absolute;top:8px;right:8px;font-size:9px;color:#FFD700;background:rgba(0,0,0,0.5);padding:2px 6px;border-radius:4px;z-index:60;pointer-events:none;';
  var label = (window.MMA && MMA.CombatMoves && typeof MMA.CombatMoves.getWeatherLabel === 'function')
    ? MMA.CombatMoves.getWeatherLabel() : '';
  el.textContent = label;
  var gc = document.getElementById('game-container') || document.body;
  gc.appendChild(el);
};

// === JUDGE SCORE METER ===
// Thin bar at top showing crowd judge scoring (0-100)
MMA.UIMeter.initJudgeMeter = MMA.UIMeter.initJudgeMeter || function() {
  var el = _getEl('judge-meter');
  if (el) return;
  el = document.createElement('div');
  el.id = 'judge-meter';
  el.style.cssText = 'position:absolute;top:0;left:0;width:0%;height:3px;background:linear-gradient(90deg,#FFD700,#ff8800);z-index:70;pointer-events:none;transition:width 0.3s;';
  var gc = document.getElementById('game-container') || document.body;
  gc.appendChild(el);
};

MMA.UIMeter.updateJudgeMeter = MMA.UIMeter.updateJudgeMeter || function() {
  var el = _getEl('judge-meter');
  if (!el) return;
  var score = (window.MMA && MMA.Combat && MMA.Combat._judgeScore) ? MMA.Combat._judgeScore : 0;
  el.style.width = Math.min(100, score) + '%';
  // Color shifts green at high scores
  if (score >= 70) {
    el.style.background = 'linear-gradient(90deg,#00ff88,#FFD700)';
  } else {
    el.style.background = 'linear-gradient(90deg,#FFD700,#ff8800)';
  }
};

// === GEAR DURABILITY BAR ===
// Small bar under HP showing gear durability
MMA.UIMeter.initGearDurabilityBar = MMA.UIMeter.initGearDurabilityBar || function() {
  var el = document.getElementById('gear-dur-bar');
  if (el) return;
  var wrap = document.createElement('div');
  wrap.id = 'gear-dur-wrap';
  wrap.style.cssText = 'position:absolute;bottom:52px;left:8px;width:80px;z-index:60;pointer-events:none;';
  var label = document.createElement('div');
  label.style.cssText = 'font-size:7px;color:#888;margin-bottom:1px;';
  label.textContent = 'GEAR';
  var bar = document.createElement('div');
  bar.id = 'gear-dur-bar';
  bar.style.cssText = 'height:3px;width:100%;background:#444;border-radius:2px;overflow:hidden;';
  var fill = document.createElement('div');
  fill.id = 'gear-dur-fill';
  fill.style.cssText = 'height:100%;width:100%;background:#aaaaaa;transition:width 0.3s,background 0.3s;';
  bar.appendChild(fill);
  wrap.appendChild(label);
  wrap.appendChild(bar);
  var gc = document.getElementById('game-container') || document.body;
  gc.appendChild(wrap);
};

MMA.UIMeter.updateGearDurabilityBar = MMA.UIMeter.updateGearDurabilityBar || function(scene) {
  var fill = _getEl('gear-dur-fill');
  if (!fill) return;
  var p = scene && scene.player;
  var dur = (p && p.stats && p.stats._gearDurability !== undefined) ? p.stats._gearDurability : 100;
  fill.style.width = dur + '%';
  if (dur <= 20) fill.style.background = '#ff2200';
  else if (dur <= 50) fill.style.background = '#ff8800';
  else fill.style.background = '#aaaaaa';
};
// === CORNER DOMINATION HUD ===
MMA.UIMeter.initCornerDomHUD = MMA.UIMeter.initCornerDomHUD || function() {
  var el = document.getElementById('corner-dom-hud');
  if (el) return;
  el = document.createElement('div');
  el.id = 'corner-dom-hud';
  el.style.cssText = 'position:absolute;bottom:62px;left:50%;transform:translateX(-50%);font-size:9px;font-weight:bold;color:#ff8800;background:rgba(0,0,0,0.6);padding:2px 8px;border-radius:4px;z-index:60;pointer-events:none;opacity:0;transition:opacity 0.25s;';
  el.textContent = '📐 CORNER +15%';
  var gc = document.getElementById('game-container') || document.body;
  gc.appendChild(el);
};

MMA.UIMeter.updateCornerDomHUD = MMA.UIMeter.updateCornerDomHUD || function(scene) {
  var el = document.getElementById('corner-dom-hud');
  if (!el) return;
  var enemies = scene && scene.enemies || [];
  var cornered = enemies.some(function(e) { return e && e.active && e._cornerDominating; });
  el.style.opacity = cornered ? '1' : '0';
};

// === CONDITIONING FATIGUE INDICATOR ===
// Shows fatigue level next to move buttons if severely tired
MMA.UIMeter.updateFatigueIndicators = MMA.UIMeter.updateFatigueIndicators || function() {
  var moves = ['jab','cross','hook','uppercut','lowKick','headKick','clinchKnee','takedown','clinch','submission','groundPound'];
  moves.forEach(function(move) {
    var btn = document.querySelector('[data-move="' + move + '"]');
    if (!btn) return;
    var label = (window.MMA && MMA.Combat && typeof MMA.Combat.getConditioningLabel === 'function')
      ? MMA.Combat.getConditioningLabel(move) : null;
    // Add/remove fatigue class
    if (label) {
      btn.style.opacity = label === 'EXHAUSTED' ? '0.45' : label === 'FATIGUED' ? '0.65' : '0.85';
      btn.title = label;
    } else {
      btn.style.opacity = '';
      btn.title = '';
    }
  });
};

// === FIGHT NIGHT STAR RATING ===
// 1-5 stars based on combo variety, judge score, speed
MMA.UIMeter.calcFightStarRating = MMA.UIMeter.calcFightStarRating || function(scene) {
  var score = 0;
  // Judge score contribution (max 50pts)
  var judgeScore = (window.MMA && MMA.Combat && MMA.Combat._judgeScore) ? MMA.Combat._judgeScore : 0;
  score += Math.round(judgeScore * 0.5);
  // Combo variety (max 30pts) — unique moves used
  var fatigue = (window.MMA && MMA.Combat && MMA.Combat._moveFatigue) ? MMA.Combat._moveFatigue : {};
  var uniqueMoves = Object.keys(fatigue).length;
  score += Math.min(30, uniqueMoves * 4);
  // Hype meter (max 20pts)
  var hype = (window.MMA && MMA.UI && MMA.UI._hypeMeter) ? MMA.UI._hypeMeter : 0;
  score += Math.round(hype * 0.2);
  // Convert to stars
  if (score >= 85) return 5;
  if (score >= 65) return 4;
  if (score >= 45) return 3;
  if (score >= 25) return 2;
  return 1;
};

MMA.UIMeter.showFightStarRating = MMA.UIMeter.showFightStarRating || function(scene) {
  var stars = MMA.UIMeter.calcFightStarRating(scene);
  var el = document.getElementById('fight-star-rating');
  if (el) el.remove();
  el = document.createElement('div');
  el.id = 'fight-star-rating';
  el.style.cssText = 'position:absolute;top:28%;left:50%;transform:translateX(-50%);font-size:20px;z-index:160;pointer-events:none;';
  el.textContent = '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
  var gc = document.getElementById('game-container') || document.body;
  gc.appendChild(el);
  scene.time.delayedCall(3000, function() { if (el.parentNode) el.remove(); });
};

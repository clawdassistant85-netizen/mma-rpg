window.MMA = window.MMA || {};
window.MMA.UI = {
  // Danger Proximity Warning - screen edge flashes when enemies are about to attack
  dangerWarning: {
    active: false,
    overlay: null,
    arrow: null,
    currentThreat: null, // { type: 'coordination'|'special', direction: 'left'|'right'|'up'|'down', source: enemy }
    warningDuration: 1000, // 1 second warning
    fadeDuration: 300
  },
  // Show danger warning overlay
  showDangerWarning: function(scene, threatType, direction, enemy) {
    // Only show if not already showing a warning (or show higher priority)
    if (this.dangerWarning.active && threatType !== 'special') return; // Special overrides coordination
    
    var self = this;
    this.dangerWarning.currentThreat = {
      type: threatType,
      direction: direction,
      source: enemy,
      timestamp: Date.now()
    };
    this.dangerWarning.active = true;
    
    // Get or create overlay
    var overlay = this.getDangerWarningOverlay();
    if (!overlay) return;
    
    // Set color based on threat type
    var color = threatType === 'special' ? 'rgba(255, 0, 0,' : 'rgba(255, 191, 0,';
    var intensity = threatType === 'special' ? 0.6 : 0.4;
    
    // Show overlay
    overlay.classList.add('active');
    overlay.style.background = color + intensity + ')';
    
    // Create/update arrow
    this.showDangerArrow(scene, direction, threatType);
    
    // Play warning sound if available
    if (window.MMA_AUDIO && window.MMA_AUDIO.playDangerWarning) {
      window.MMA_AUDIO.playDangerWarning();
    }
    
    // Auto-hide after warning duration
    setTimeout(function() {
      self.hideDangerWarning(scene);
    }, this.dangerWarning.warningDuration);
  },
  // Get or create danger warning overlay element
  getDangerWarningOverlay: function() {
    if (!this.dangerWarning.overlay) {
      var el = document.getElementById('danger-warning-overlay');
      if (!el) {
        el = document.createElement('div');
        el.id = 'danger-warning-overlay';
        document.getElementById('game-shell').appendChild(el);
      }
      this.dangerWarning.overlay = el;
    }
    return this.dangerWarning.overlay;
  },
  // Show directional arrow for danger
  showDangerArrow: function(scene, direction, threatType) {
    var arrow = this.dangerWarning.arrow;
    var overlay = this.getDangerWarningOverlay();
    
    // Remove existing arrow
    if (arrow && arrow.parentNode) {
      arrow.parentNode.removeChild(arrow);
    }
    
    // Create new arrow
    arrow = document.createElement('div');
    arrow.id = 'danger-arrow';
    arrow.style.cssText = 'position:absolute;z-index:30;pointer-events:none;font-size:32px;opacity:0;transition:opacity 150ms ease;';
    
    // Position based on direction
    var arrows = { left: '◀', right: '▶', up: '▲', down: '▼' };
    arrow.textContent = arrows[direction] || '⚠';
    
    var color = threatType === 'special' ? '#ff0000' : '#ffbf00';
    arrow.style.color = color;
    
    switch(direction) {
      case 'left':
        arrow.style.left = '15%';
        arrow.style.top = '50%';
        arrow.style.transform = 'translateY(-50%)';
        break;
      case 'right':
        arrow.style.right = '15%';
        arrow.style.top = '50%';
        arrow.style.transform = 'translateY(-50%)';
        break;
      case 'up':
        arrow.style.top = '20%';
        arrow.style.left = '50%';
        arrow.style.transform = 'translateX(-50%)';
        break;
      case 'down':
        arrow.style.bottom = '20%';
        arrow.style.left = '50%';
        arrow.style.transform = 'translateX(-50%)';
        break;
    }
    
    overlay.appendChild(arrow);
    this.dangerWarning.arrow = arrow;
    
    // Fade in arrow
    requestAnimationFrame(function() {
      arrow.style.opacity = '1';
    });
  },
  // Hide danger warning
  hideDangerWarning: function(scene) {
    this.dangerWarning.active = false;
    this.dangerWarning.currentThreat = null;
    
    var overlay = this.getDangerWarningOverlay();
    if (overlay) {
      overlay.classList.remove('active');
    }
    
    var arrow = this.dangerWarning.arrow;
    if (arrow) {
      arrow.style.opacity = '0';
      setTimeout(function() {
        if (arrow && arrow.parentNode) {
          arrow.parentNode.removeChild(arrow);
        }
      }, 150);
      this.dangerWarning.arrow = null;
    }
  },
  // Check if danger warning is active
  isDangerWarningActive: function() {
    return this.dangerWarning.active;
  },
  // Get current threat info
  getCurrentThreat: function() {
    return this.dangerWarning.currentThreat;
  },
  // Fight Timer Display - countdown for timed challenges
  fightTimer: {
    active: false,
    duration: 0,
    remaining: 0,
    container: null,
    text: null,
    intervalId: null,
    lastUpdate: 0
  },
  // Start fight timer (for timed challenges)
  startFightTimer: function(scene, durationMs) {
    this.stopFightTimer();
    this.fightTimer.active = true;
    this.fightTimer.duration = durationMs;
    this.fightTimer.remaining = durationMs;
    this.fightTimer.lastUpdate = Date.now();
    
    var container = this.showFightTimer(scene);
    
    // Start countdown interval
    var self = this;
    this.fightTimer.intervalId = setInterval(function() {
      if (!self.fightTimer.active) {
        clearInterval(self.fightTimer.intervalId);
        return;
      }
      
      var now = Date.now();
      var delta = now - self.fightTimer.lastUpdate;
      self.fightTimer.lastUpdate = now;
      self.fightTimer.remaining = Math.max(0, self.fightTimer.remaining - delta);
      
      self.updateFightTimer(scene);
      
      // Check for timer expiring
      if (self.fightTimer.remaining <= 0) {
        self.onFightTimerExpired(scene);
      }
    }, 100);
    
    return container;
  },
  // Show fight timer display
  showFightTimer: function(scene) {
    if (this.fightTimer.container) return this.fightTimer.container;
    
    var topX = scene.cameras.main.width / 2;
    var topY = 180;
    
    var container = scene.add.container(topX, topY);
    container.setDepth(55);
    
    // Background
    var bg = scene.add.graphics();
    bg.fillStyle(0x000000, 0.7);
    bg.fillRoundedRect(-50, -15, 100, 30, 8);
    container.add(bg);
    
    // Timer text
    var text = scene.add.text(0, 0, '00:00', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '20px',
      color: '#44ff44'
    }).setOrigin(0.5);
    container.add(text);
    
    container.setVisible(false);
    container.setAlpha(0);
    
    this.fightTimer.container = container;
    this.fightTimer.text = text;
    
    return container;
  },
  // Update fight timer display
  updateFightTimer: function(scene) {
    if (!this.fightTimer.active) return;
    
    if (!this.fightTimer.container) {
      this.showFightTimer(scene);
    }
    
    var container = this.fightTimer.container;
    var text = this.fightTimer.text;
    var remaining = this.fightTimer.remaining;
    
    // Format time
    var totalSec = Math.ceil(remaining / 1000);
    var mins = Math.floor(totalSec / 60);
    var secs = totalSec % 60;
    var timeStr = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
    
    text.setText(timeStr);
    
    // Color changes based on time remaining
    var totalDuration = this.fightTimer.duration;
    var pct = remaining / totalDuration;
    
    if (pct <= 0.2) {
      text.setColor('#ff4444'); // Critical - red
    } else if (pct <= 0.5) {
      text.setColor('#ffaa00'); // Warning - orange
    } else {
      text.setColor('#44ff44'); // Normal - green
    }
    
    // Show container
    if (!container.visible) {
      container.setVisible(true);
      scene.tweens.add({
        targets: container,
        alpha: 1,
        duration: 200
      });
    }
    
    // Pulse effect when critical
    if (pct <= 0.2) {
      scene.tweens.add({
        targets: container,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200,
        yoyo: true,
        repeat: 1
      });
    }
  },
  // Handle timer expiration
  onFightTimerExpired: function(scene) {
    this.stopFightTimer();
    
    // Show "TIME'S UP" message
    var centerX = scene.cameras.main.width / 2;
    var centerY = scene.cameras.main.height / 2;
    
    var text = scene.add.text(centerX, centerY, "TIME'S UP!", {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '48px',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setDepth(100);
    
    scene.tweens.add({
      targets: text,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 300,
      yoyo: true,
      repeat: 2,
      onComplete: function() {
        text.destroy();
      }
    });
    
    // Trigger timeout callback if defined
    if (this.fightTimer.onTimeout) {
      this.fightTimer.onTimeout(scene);
    }
  },
  // Stop fight timer
  stopFightTimer: function() {
    this.fightTimer.active = false;
    if (this.fightTimer.intervalId) {
      clearInterval(this.fightTimer.intervalId);
      this.fightTimer.intervalId = null;
    }
  },
  // Destroy fight timer display
  destroyFightTimer: function(scene) {
    this.stopFightTimer();
    if (this.fightTimer.container) {
      this.fightTimer.container.destroy();
      this.fightTimer.container = null;
      this.fightTimer.text = null;
    }
  },
  // Set callback for timer expiration
  setFightTimerCallback: function(callback) {
    this.fightTimer.onTimeout = callback;
  },
  cooldowns: {
    jab: { remaining: 0, total: 0 },
    heavy: { remaining: 0, total: 0 },
    grapple: { remaining: 0, total: 0 },
    special: { remaining: 0, total: 0 }
  },
  // Fight stats tracking
  fightStats: {
    damageDealt: 0,
    damageTaken: 0,
    hitsLanded: 0,
    hitsTaken: 0,
    longestCombo: 0,
    currentCombo: 0,
    enemiesDefeated: 0,
    critsLanded: 0
  },
  // Combo counter display
  comboCounter: {
    container: null,
    text: null,
    visible: false
  },
  // Hype meter for crowd engagement
  hypeMeter: {
    value: 0,
    maxValue: 100,
    container: null,
    bar: null,
    label: null
  },
  // Focus/Chi Meter - builds during combat, fuels special abilities
  focusMeter: {
    value: 0,
    maxValue: 100,
    container: null,
    bar: null,
    label: null,
    glow: null
  },
  // Momentum System - consecutive hits build momentum stacks for bonus damage
  momentumMeter: {
    stacks: 0,
    maxStacks: 5,
    container: null,
    indicators: [],
    surgeText: null,
    surgeActive: false,
    surgeTimeout: null
  },
  resetFightStats: function() {
    this.fightStats = {
      damageDealt: 0,
      damageTaken: 0,
      hitsLanded: 0,
      hitsTaken: 0,
      longestCombo: 0,
      currentCombo: 0,
      enemiesDefeated: 0,
      critsLanded: 0
    };
    // Reset per-fight style points
    this.fightStylePoints = { strike: 0, grapple: 0 };
    // Deactivate health pulse on fight reset
    this.deactivateHealthPulse();
    // Reset focus meter for new fight
    this.resetFocusMeter();
    // Reset momentum for new fight
    this.momentumMeter.stacks = 0;
    this.momentumMeter.surgeActive = false;
    if (this.momentumMeter.surgeTimeout) {
      clearTimeout(this.momentumMeter.surgeTimeout);
      this.momentumMeter.surgeTimeout = null;
    }
    // Reset perfect block counter for new fight
    this.perfectBlockCounter.count = 0;
    this.perfectBlockCounter.lastBlockTime = 0;
  },
  // Per-fight style tracking (resets each fight)
  fightStylePoints: { strike: 0, grapple: 0 },
  recordHitDealt: function(damage, isCrit, comboCount) {
    this.fightStats.damageDealt += damage;
    this.fightStats.hitsLanded += 1;
    if (isCrit) this.fightStats.critsLanded += 1;
    if (comboCount > this.fightStats.longestCombo) {
      this.fightStats.longestCombo = comboCount;
    }
  },
  recordHitTaken: function(damage) {
    this.fightStats.damageTaken += damage;
    this.fightStats.hitsTaken += 1;
  },
  incrementCombo: function() {
    this.fightStats.currentCombo += 1;
    if (this.fightStats.currentCombo > this.fightStats.longestCombo) {
      this.fightStats.longestCombo = this.fightStats.currentCombo;
    }
  },
  resetCombo: function() {
    this.fightStats.currentCombo = 0;
  },
  recordEnemyDefeated: function() {
    this.fightStats.enemiesDefeated += 1;
  },
  // Combo counter display methods
  showComboCounter: function(scene) {
    if (this.comboCounter.container) return this.comboCounter.container;
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
  // Hype meter methods
  showHypeMeter: function(scene) {
    if (this.hypeMeter.container) return this.hypeMeter.container;
    
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
    var newValue = this.hypeMeter.value + amount;
    this.updateHypeMeter(scene, newValue, this.hypeMeter.maxValue);
  },
  drainHype: function(scene, amount) {
    var newValue = this.hypeMeter.value - amount;
    this.updateHypeMeter(scene, newValue, this.hypeMeter.maxValue);
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
  // Focus Meter methods
  showFocusMeter: function(scene) {
    if (this.focusMeter.container) return this.focusMeter.container;
    
    var leftX = 30;
    var topY = 60;
    
    var container = scene.add.container(leftX, topY);
    container.setDepth(50);
    
    // Background
    var bg = scene.add.graphics();
    bg.fillStyle(0x000000, 0.6);
    bg.fillRoundedRect(-20, -35, 40, 120, 8);
    container.add(bg);
    
    // Label
    var label = scene.add.text(0, -20, 'FOCUS', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#66e6ff',
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
    bar.fillStyle(0x66e6ff, 1);
    bar.fillRect(-10, 0, 20, 0);
    container.add(bar);
    
    // Glow effect (hidden until full)
    var glow = scene.add.graphics();
    glow.fillStyle(0x66e6ff, 0);
    glow.fillCircle(0, 45, 35);
    container.add(glow);
    
    this.focusMeter.container = container;
    this.focusMeter.bar = bar;
    this.focusMeter.label = label;
    this.focusMeter.glow = glow;
    
    return container;
  },
  updateFocusMeter: function(scene, value, maxValue) {
    if (!this.focusMeter.container) {
      this.showFocusMeter(scene);
    }
    
    this.focusMeter.value = Math.max(0, Math.min(value, maxValue));
    this.focusMeter.maxValue = maxValue;
    
    var pct = this.focusMeter.value / maxValue;
    var barHeight = pct * 85;
    
    // Clear and redraw bar
    var bar = this.focusMeter.bar;
    bar.clear();
    
    // Color based on focus level
    var color;
    if (pct >= 1.0) {
      color = 0xffffff; // White for full
    } else if (pct >= 0.7) {
      color = 0x66e6ff; // Cyan for high
    } else if (pct >= 0.3) {
      color = 0x4488ff; // Blue for medium
    } else {
      color = 0x224488; // Dark blue for low
    }
    
    bar.fillStyle(color, 1);
    bar.fillRect(-10, 0, 20, -barHeight);
    
    // Update glow for full meter
    var glow = this.focusMeter.glow;
    glow.clear();
    if (pct >= 1.0) {
      glow.fillStyle(0x66e6ff, 0.4 + 0.2 * Math.sin(Date.now() / 150));
      glow.fillCircle(0, 45, 35);
    }
  },
  // Reset focus meter (call at start of new fight)
  resetFocusMeter: function() {
    this.focusMeter.value = 0;
  },
  // Check if focus is full and ready
  isFocusFull: function() {
    return this.focusMeter.value >= this.focusMeter.maxValue;
  },
  destroyFocusMeter: function() {
    if (this.focusMeter.container) {
      this.focusMeter.container.destroy();
      this.focusMeter.container = null;
      this.focusMeter.bar = null;
      this.focusMeter.label = null;
      this.focusMeter.glow = null;
    }
    this.focusMeter.value = 0;
  },
  // Momentum System methods - builds on landed hits, max 5 stacks, each adds +5% damage and +2% crit
  showMomentumMeter: function(scene) {
    if (this.momentumMeter.container) return this.momentumMeter.container;
    
    var centerX = scene.cameras.main.width / 2;
    var topY = 155; // Below style gauge
    
    var container = scene.add.container(centerX, topY);
    container.setDepth(50);
    
    // Background pill shape
    var bg = scene.add.graphics();
    bg.fillStyle(0x000000, 0.6);
    bg.fillRoundedRect(-70, -10, 140, 20, 10);
    container.add(bg);
    
    // Label
    var label = scene.add.text(0, -18, 'MOMENTUM', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '9px',
      color: '#ffaa00',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(label);
    
    // Stack indicators (5 circles)
    var indicators = [];
    var startX = -55;
    var spacing = 22;
    
    for (var i = 0; i < 5; i++) {
      var ind = scene.add.graphics();
      ind.fillStyle(0x333333, 1);
      ind.fillCircle(startX + i * spacing, 0, 8);
      container.add(ind);
      indicators.push(ind);
    }
    
    this.momentumMeter.container = container;
    this.momentumMeter.indicators = indicators;
    
    return container;
  },
  // Update momentum stacks display
  updateMomentumMeter: function(scene, stacks) {
    if (!this.momentumMeter.container) {
      this.showMomentumMeter(scene);
    }
    
    stacks = Math.max(0, Math.min(stacks, this.momentumMeter.maxStacks));
    this.momentumMeter.stacks = stacks;
    
    var indicators = this.momentumMeter.indicators;
    var startX = -55;
    var spacing = 22;
    
    for (var i = 0; i < 5; i++) {
      var ind = indicators[i];
      ind.clear();
      
      if (i < stacks) {
        // Active stack - golden glow
        ind.fillStyle(0xffaa00, 1);
        ind.fillCircle(startX + i * spacing, 0, 8);
        ind.lineStyle(2, 0xffdd44, 1);
        ind.strokeCircle(startX + i * spacing, 0, 8);
      } else {
        // Empty slot
        ind.fillStyle(0x333333, 1);
        ind.fillCircle(startX + i * spacing, 0, 8);
      }
    }
    
    // Pulse effect when gaining a stack
    if (stacks > 0 && this.momentumMeter.container) {
      scene.tweens.add({
        targets: this.momentumMeter.container,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 100,
        yoyo: true,
        ease: 'Quad.easeOut'
      });
    }
  },
  // Add momentum stack (returns true if reached max)
  addMomentumStack: function(scene) {
    var newStacks = Math.min(this.momentumMeter.stacks + 1, this.momentumMeter.maxStacks);
    this.updateMomentumMeter(scene, newStacks);
    
    // Check for Momentum Surge (5 stacks)
    if (newStacks >= 5 && !this.momentumMeter.surgeActive) {
      this.triggerMomentumSurge(scene);
      return true;
    }
    return false;
  },
  // Reset momentum (on getting hit or missing)
  resetMomentum: function(scene) {
    this.updateMomentumMeter(scene || this.momentumMeter.container._scene, 0);
    this.momentumMeter.surgeActive = false;
    if (this.momentumMeter.surgeTimeout) {
      clearTimeout(this.momentumMeter.surgeTimeout);
      this.momentumMeter.surgeTimeout = null;
    }
    if (this.momentumMeter.surgeText && this.momentumMeter.surgeText.destroy) {
      this.momentumMeter.surgeText.destroy();
      this.momentumMeter.surgeText = null;
    }
  },
  // Trigger Momentum Surge effect at 5 stacks
  triggerMomentumSurge: function(scene) {
    this.momentumMeter.surgeActive = true;
    
    var centerX = scene.cameras.main.width / 2;
    var centerY = scene.cameras.main.height / 2;
    
    // Create surge text
    var surgeText = scene.add.text(centerX, centerY - 80, 'MOMENTUM SURGE!', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '36px',
      color: '#ffdd00',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setDepth(100);
    
    // Glow effect
    var glow = scene.add.graphics();
    glow.fillStyle(0xffaa00, 0.3);
    glow.fillCircle(centerX, centerY, 150);
    glow.setDepth(99);
    
    // Flash the momentum container gold
    var container = this.momentumMeter.container;
    if (container) {
      scene.tweens.add({
        targets: container,
        alpha: 0.3,
        duration: 100,
        yoyo: true,
        repeat: 3
      });
    }
    
    // Animate surge text
    scene.tweens.add({
      targets: surgeText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 200,
      yoyo: true,
      repeat: 2
    });
    
    scene.tweens.add({
      targets: [surgeText, glow],
      alpha: 0,
      delay: 1200,
      duration: 400,
      onComplete: function() {
        if (surgeText && surgeText.destroy) surgeText.destroy();
        if (glow && glow.destroy) glow.destroy();
      }
    });
    
    this.momentumMeter.surgeText = surgeText;
    
    // Screen edge flash (cyan for momentum)
    var flash = scene.add.graphics();
    flash.fillStyle(0x00ffff, 0.4);
    flash.fillRect(0, 0, scene.cameras.main.width, scene.cameras.main.height);
    flash.setDepth(98);
    scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      onComplete: function() { if (flash && flash.destroy) flash.destroy(); }
    });
    
    // Auto-reset after 5 seconds if not triggered
    var self = this;
    if (this.momentumMeter.surgeTimeout) {
      clearTimeout(this.momentumMeter.surgeTimeout);
    }
    this.momentumMeter.surgeTimeout = setTimeout(function() {
      self.momentumMeter.surgeActive = false;
    }, 5000);
  },
  // Check if momentum surge is active (next attack auto-crits with +50% damage)
  isMomentumSurgeActive: function() {
    return this.momentumMeter.surgeActive;
  },
  // Consume momentum surge (after triggering the empowered attack)
  consumeMomentumSurge: function() {
    this.momentumMeter.surgeActive = false;
    if (this.momentumMeter.container && this.momentumMeter.container._scene) {
      this.resetMomentum(this.momentumMeter.container._scene);
    }
  },
  // Get momentum damage bonus (5% per stack)
  getMomentumDamageBonus: function() {
    return this.momentumMeter.stacks * 0.05;
  },
  // Get momentum crit bonus (2% per stack)
  getMomentumCritBonus: function() {
    return this.momentumMeter.stacks * 0.02;
  },
  destroyMomentumMeter: function() {
    if (this.momentumMeter.container) {
      this.momentumMeter.container.destroy();
      this.momentumMeter.container = null;
      this.momentumMeter.indicators = [];
    }
    if (this.momentumMeter.surgeText && this.momentumMeter.surgeText.destroy) {
      this.momentumMeter.surgeText.destroy();
      this.momentumMeter.surgeText = null;
    }
    if (this.momentumMeter.surgeTimeout) {
      clearTimeout(this.momentumMeter.surgeTimeout);
      this.momentumMeter.surgeTimeout = null;
    }
    this.momentumMeter.stacks = 0;
    this.momentumMeter.surgeActive = false;
  },
  // Fighter's Diary - auto-logged milestones and memorable moments
  fighterDiary: {
    entries: [], // { id, text, timestamp, icon, type }
    milestoneThresholds: [5, 10, 25, 50, 100], // Unlock lore at these milestone counts
    unlockedLore: [], // Array of lore snippets unlocked
    loreSnippets: [
      { threshold: 5, title: "First Steps", text: "Your journey as a fighter begins. Every master was once a beginner." },
      { threshold: 10, title: "Finding Your Style", text: "You start to gravitate toward a particular fighting style. The ring reveals your nature." },
      { threshold: 25, title: "Rising Threat", text: "Rumors spread of a new fighter making waves. The Underground takes notice." },
      { threshold: 50, title: "Contender Status", text: "You're no longer an unknown. Other fighters study your techniques." },
      { threshold: 100, title: "Legend Status", text: "Your name echoes through the arena. They've stopped underestimating you." }
    ]
  },
  // Record a diary entry
  recordDiaryEntry: function(text, type, icon) {
    var entry = {
      id: Date.now(),
      text: text,
      type: type || 'milestone',
      icon: icon || '📝',
      timestamp: Date.now()
    };
    this.fighterDiary.entries.unshift(entry); // Add to front
    // Keep only last 50 entries
    if (this.fighterDiary.entries.length > 50) {
      this.fighterDiary.entries = this.fighterDiary.entries.slice(0, 50);
    }
    this.saveFighterDiary();
    return entry;
  },
  // Check and unlock lore based on total fights
  checkLoreUnlocks: function() {
    var totalFights = this.fighterCard.stats.totalFights;
    var self = this;
    this.fighterDiary.loreSnippets.forEach(function(lore) {
      if (totalFights >= lore.threshold && self.fighterDiary.unlockedLore.indexOf(lore.threshold) === -1) {
        self.fighterDiary.unlockedLore.push(lore.threshold);
        // Also record as diary entry
        self.recordDiaryEntry(lore.title + ': ' + lore.text, 'lore', '📜');
      }
    });
  },
  // Save/load diary
  saveFighterDiary: function() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      var key = 'mma-rpg-diary';
      var data = {
        entries: this.fighterDiary.entries,
        unlockedLore: this.fighterDiary.unlockedLore
      };
      window.localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {}
  },
  loadFighterDiary: function() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      var key = 'mma-rpg-diary';
      var raw = window.localStorage.getItem(key);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return;
      if (data.entries) this.fighterDiary.entries = data.entries;
      if (data.unlockedLore) this.fighterDiary.unlockedLore = data.unlockedLore;
    } catch (e) {}
  },
  // Show Fighter's Diary as a popup
  showFighterDiary: function(scene) {
    var self = this;
    var W = scene.cameras.main.width;
    var H = scene.cameras.main.height;
    var cw = Math.min(360, W - 40);
    var ch = Math.min(480, H - 40);
    var cx = (W - cw) / 2;
    var cy = (H - ch) / 2;
    var con = scene.add.container(cx, cy);
    con.setDepth(200);

    // Background
    var g = scene.add.graphics();
    g.fillStyle(0x000000, 0.92);
    g.fillRoundedRect(0, 0, cw, ch, 16);
    g.lineStyle(3, 0x44ffaa, 1);
    g.strokeRoundedRect(0, 0, cw, ch, 16);
    con.add(g);

    // Header
    var hdr = scene.add.graphics();
    hdr.fillStyle(0x1a3a2a, 1);
    hdr.fillRoundedRect(4, 4, cw - 8, 50, 12);
    con.add(hdr);

    var title = scene.add.text(cw / 2, 29, '📖 FIGHTER\'S DIARY', { fontFamily: 'Arial Black, sans-serif', fontSize: '16px', color: '#44ffaa' }).setOrigin(0.5);
    con.add(title);

    // Scroll container for entries
    var contentY = 65;
    var contentH = ch - 120;
    var contentBg = scene.add.graphics();
    contentBg.fillStyle(0x0a1a14, 1);
    contentBg.fillRoundedRect(10, contentY, cw - 20, contentH, 8);
    con.add(contentBg);

    var entriesContainer = scene.add.container(0, contentY);
    con.add(entriesContainer);

    // Render diary entries
    var entries = this.fighterDiary.entries.slice(0, 8); // Show up to 8 entries
    if (entries.length === 0) {
      var emptyText = scene.add.text(cw / 2 - 20, contentY + contentH / 2, 'No entries yet.\nKeep fighting!', { fontSize: '14px', color: '#666666', align: 'center' }).setOrigin(0.5);
      entriesContainer.add(emptyText);
    } else {
      entries.forEach(function(entry, idx) {
        var y = 10 + idx * 48;
        if (y > contentH - 50) return;
        
        // Entry background
        var entryBg = scene.add.graphics();
        entryBg.fillStyle(0x1a2a22, 0.8);
        entryBg.fillRoundedRect(15, y, cw - 50, 42, 6);
        entriesContainer.add(entryBg);
        
        // Entry icon
        var icon = scene.add.text(25, y + 21, entry.icon, { fontSize: '18px' }).setOrigin(0, 0.5);
        entriesContainer.add(icon);
        
        // Entry text
        var entryText = scene.add.text(50, y + 12, entry.text.substring(0, 40) + (entry.text.length > 40 ? '...' : ''), { fontSize: '12px', color: '#aaffcc' }).setOrigin(0, 0);
        entriesContainer.add(entryText);
        
        // Timestamp
        var date = new Date(entry.timestamp);
        var timeStr = date.toLocaleDateString();
        var timeText = scene.add.text(50, y + 26, timeStr, { fontSize: '10px', color: '#668877' }).setOrigin(0, 0);
        entriesContainer.add(timeText);
      });
    }

    // Lore section
    var loreY = ch - 45;
    var loreTitle = scene.add.text(20, loreY, 'LORE UNLOCKED: ' + this.fighterDiary.unlockedLore.length + '/' + this.fighterDiary.loreSnippets.length, { fontSize: '11px', color: '#ffaa44', fontStyle: 'bold' }).setOrigin(0, 0.5);
    con.add(loreTitle);

    // Close button
    var closeBtn = scene.add.text(cw / 2, ch - 18, 'CLOSE', {
      fontSize: '13px',
      color: '#ffffff',
      backgroundColor: '#225544',
      padding: { left: 16, right: 16, top: 6, bottom: 6 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    con.add(closeBtn);

    con.close = function() {
      scene.tweens.add({
        targets: con,
        alpha: 0,
        scaleX: 0.9,
        scaleY: 0.9,
        duration: 150,
        onComplete: function() { con.destroy(); }
      });
    };
    closeBtn.on('pointerdown', function() { con.close(); });

    con.setAlpha(0);
    con.setScale(0.9);
    scene.tweens.add({
      targets: con,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });

    return con;
  },
  // Helper to record specific milestones
  recordMilestone: function(type, data) {
    var entry = null;
    switch(type) {
      case 'grapple_ko':
        entry = this.recordDiaryEntry('First KO with a grapple!', 'achievement', '🤼');
        break;
      case 'survived_boss':
        var seconds = Math.round(data.duration / 1000);
        entry = this.recordDiaryEntry('Survived ' + seconds + 's vs ' + (data.bossName || 'Boss'), 'survival', '⏱️');
        break;
      case 'combo_streak':
        entry = this.recordDiaryEntry('5-hit combo streak x' + data.count + '!', 'combo', '💥');
        break;
      case 'first_win':
        entry = this.recordDiaryEntry('Won first fight! The journey begins.', 'first', '🥊');
        break;
      case 'boss_defeated':
        entry = this.recordDiaryEntry('Defeated ' + (data.bossName || 'a boss') + '!', 'boss', '💀');
        break;
      case 'zone_clear':
        entry = this.recordDiaryEntry('Cleared Zone ' + data.zone + '!', 'zone', '🏆');
        break;
      case 'perfect_fight':
        entry = this.recordDiaryEntry('Won without taking damage!', 'perfect', '💎');
        break;
      case 'underdog_win':
        entry = this.recordDiaryEntry('Underdog victory! Won with low HP.', 'underdog', '🦁');
        break;
      case 'speed_demon':
        var seconds = Math.round(data.duration / 1000);
        entry = this.recordDiaryEntry('Speed Demon! Won in ' + seconds + 's.', 'speed', '⚡');
        break;
      case 'crit_combo':
        entry = this.recordDiaryEntry('Landed ' + data.count + ' crits in one fight!', 'crit', '🎯');
        break;
      case 'style_master':
        entry = this.recordDiaryEntry('Mastered ' + data.style + ' style!', 'style', '🔥');
        break;
    }
    this.checkLoreUnlocks();
    return entry;
  },
  // Fighter Card - visual profile with stats, style, achievements
  fighterCard: {
    stats: { totalFights: 0, wins: 0, losses: 0, enemiesDefeated: 0, totalDamageDealt: 0, totalHitsLanded: 0, longestCombo: 0, critsLanded: 0, perfectBlocks: 0 },
    achievements: [],
    style: 'balanced',
    stylePoints: { strike: 0, grapple: 0 },
    // Move usage tracking for Style DNA Breakdown
    moveUsageStats: {
      jab: 0, cross: 0, hook: 0, kick: 0, uppercut: 0, // strikes
      takedown: 0, grapple: 0, submission: 0, clinch: 0, // grapples
      special: 0, counter: 0, dodge: 0, block: 0 // other
    },
    // Legacy Records - personal bests that persist
    legacyRecords: {
      longestCombo: 0,
      totalKOs: 0,
      roomsClearedNoDamage: 0,
      fastestBossKillMs: Infinity,
      totalPerfectBlocks: 0,
      totalCrits: 0,
      highestDamageInSingleFight: 0,
      longestFightMs: 0,
      totalEnemiesDefeated: 0,
      zonesCompleted: 0,
      bossesDefeated: 0,
      highestComboInSingleFight: 0,
      winsWithoutTakingDamage: 0,
      underdogWins: 0,
      speedDemonWins: 0
    }
  },
  // Trophy Room - collection of bosses, elites, and rare items
  trophyRoom: {
    bosses: [], // { id, name, zone, dateDefeated, fightDuration }
    eliteEnemies: [], // { type, zone, dateDefeated }
    rareItems: [], // { id, name, type, dateAcquired, rarity }
    // Known boss definitions for display
    bossRegistry: {
      'shadow': { name: 'Shadow', zone: 1, icon: '👤', desc: 'Your rival' },
      'heavyweights': { name: 'The Heavyweights', zone: 1, icon: '💪', desc: 'Twin enforcers' },
      'grapple_master': { name: 'Grapple Master', zone: 2, icon: '🤼', desc: 'Ground game expert' },
      'striker_king': { name: 'Striker King', zone: 2, icon: '👊', desc: 'Fists of fury' },
      'coach': { name: 'The Coach', zone: 2, icon: '🎓', desc: 'Enemy support specialist' },
      'elite_kickboxer': { name: 'Elite Kickboxer', zone: 3, icon: '🦵', desc: 'Advanced striker' },
      'elite_wrestler': { name: 'Elite Wrestler', zone: 3, icon: '🏋️', desc: 'Elite grappler' },
      'champion': { name: 'The Champion', zone: 4, icon: '🏆', desc: 'Title holder' }
    },
    // Elite enemy type definitions
    eliteTypes: {
      'elite_kickboxer': { name: 'Elite Kickboxer', zone: 3, icon: '🦵' },
      'elite_wrestler': { name: 'Elite Wrestler', zone: 3, icon: '🏋️' }
    },
    // Rare item definitions
    itemRegistry: {
      'champions_belt': { name: "Champion's Belt", type: 'equipment', rarity: 'gold', icon: '🥇' },
      'fighters_gloves': { name: "Fighter's Gloves", type: 'equipment', rarity: 'silver', icon: '🥊' },
      'speed_wraps': { name: 'Speed Wraps', type: 'equipment', rarity: 'bronze', icon: '🩹' },
      'focus_charm': { name: 'Focus Charm', type: 'consumable', rarity: 'silver', icon: '✨' },
      'technique_scroll': { name: 'Technique Scroll', type: 'consumable', rarity: 'gold', icon: '📜' },
      'energy_drink': { name: 'Energy Drink', type: 'consumable', rarity: 'bronze', icon: '⚡' },
      'health_potion': { name: 'Health Potion', type: 'consumable', rarity: 'bronze', icon: '🧪' }
    }
  },
  // Mini-map for zone navigation
  miniMap: {
    exploredRooms: [], // {x, y, type, cleared} - explored room positions
    currentRoom: null, // {x, y, type}
    gridSize: 40 // pixels per room cell
  },
  // Initialize mini-map with room data
  initMiniMap: function() {
    this.miniMap.exploredRooms = [];
    this.miniMap.currentRoom = null;
  },
  // Record room exploration
  recordRoomExplored: function(roomX, roomY, roomType) {
    // Check if already recorded
    for (var i = 0; i < this.miniMap.exploredRooms.length; i++) {
      var r = this.miniMap.exploredRooms[i];
      if (r.x === roomX && r.y === roomY) return; // Already explored
    }
    this.miniMap.exploredRooms.push({
      x: roomX,
      y: roomY,
      type: roomType || 'enemy',
      cleared: false
    });
  },
  // Mark current room position
  setCurrentRoom: function(roomX, roomY, roomType) {
    this.miniMap.currentRoom = { x: roomX, y: roomY, type: roomType || 'enemy' };
    this.recordRoomExplored(roomX, roomY, roomType);
  },
  // Mark room as cleared
  markRoomCleared: function(roomX, roomY) {
    for (var i = 0; i < this.miniMap.exploredRooms.length; i++) {
      var r = this.miniMap.exploredRooms[i];
      if (r.x === roomX && r.y === roomY) {
        r.cleared = true;
        return;
      }
    }
  },
  // Get room type color
  getRoomColor: function(room, isCurrent) {
    if (isCurrent) return 0x00ff00; // Green for current
    if (!room.cleared) {
      if (room.type === 'boss') return 0xff0000; // Red for boss
      if (room.type === 'elite') return 0xff8800; // Orange for elite
      if (room.type === 'treasure') return 0xffff00; // Yellow for treasure
      if (room.type === 'shop') return 0x00ffff; // Cyan for shop
      if (room.type === 'secret') return 0xff00ff; // Purple for secret
      return 0xff4444; // Red for uncleared enemy
    }
    return 0x444444; // Gray for cleared
  },
  // Show mini-map overlay
  showMiniMap: function(scene) {
    var self = this;
    var W = scene.cameras.main.width;
    var H = scene.cameras.main.height;
    
    // Check if already open
    if (scene.activeMiniMap && scene.activeMiniMap.close) {
      scene.activeMiniMap.close();
      return;
    }
    
    var cw = Math.min(280, W - 40);
    var ch = cw + 60;
    var cx = (W - cw) / 2;
    var cy = (H - ch) / 2;
    var con = scene.add.container(cx, cy);
    con.setDepth(200);
    
    // Background
    var g = scene.add.graphics();
    g.fillStyle(0x000000, 0.92);
    g.fillRoundedRect(0, 0, cw, ch, 16);
    g.lineStyle(3, 0x44aaff, 1);
    g.strokeRoundedRect(0, 0, cw, ch, 16);
    con.add(g);
    
    // Header
    var hdr = scene.add.graphics();
    hdr.fillStyle(0x1a2a4a, 1);
    hdr.fillRoundedRect(4, 4, cw - 8, 36, 12);
    con.add(hdr);
    
    var title = scene.add.text(cw / 2, 24, '🗺️ ZONE MAP', { fontFamily: 'Arial Black, sans-serif', fontSize: '15px', color: '#44aaff' }).setOrigin(0.5);
    con.add(title);
    
    // Map area
    var mapY = 50;
    var mapSize = cw - 30;
    var cellSize = mapSize / 9;
    var mapX = 15;
    
    // Draw grid background
    var mapBg = scene.add.graphics();
    mapBg.fillStyle(0x111122, 1);
    mapBg.fillRoundedRect(mapX, mapY, mapSize, mapSize, 8);
    con.add(mapBg);
    
    // Draw grid lines
    var gridLines = scene.add.graphics();
    gridLines.lineStyle(1, 0x333355, 0.5);
    for (var i = 0; i <= 9; i++) {
      var pos = i * cellSize;
      gridLines.lineBetween(mapX + pos, mapY, mapX + pos, mapY + mapSize);
      gridLines.lineBetween(mapX, mapY + pos, mapX + mapSize, mapY + pos);
    }
    con.add(gridLines);
    
    // Get current room coordinates
    var currX = this.miniMap.currentRoom ? this.miniMap.currentRoom.x : 0;
    var currY = this.miniMap.currentRoom ? this.miniMap.currentRoom.y : 0;
    
    // Draw explored rooms
    var explored = this.miniMap.exploredRooms;
    var offset = 4;
    
    for (var j = 0; j < explored.length; j++) {
      var room = explored[j];
      var relX = room.x - currX + offset;
      var relY = room.y - currY + offset;
      
      if (relX >= 0 && relX < 9 && relY >= 0 && relY < 9) {
        var isCurrent = room.x === currX && room.y === currY;
        var color = this.getRoomColor(room, isCurrent);
        
        var rx = mapX + relX * cellSize + 2;
        var ry = mapY + relY * cellSize + 2;
        var rs = cellSize - 4;
        
        var roomGfx = scene.add.graphics();
        roomGfx.fillStyle(color, isCurrent ? 1 : 0.8);
        roomGfx.fillRoundedRect(rx, ry, rs, rs, 3);
        
        if (isCurrent) {
          roomGfx.lineStyle(2, 0xffffff, 1);
          roomGfx.strokeRoundedRect(rx, ry, rs, rs, 3);
        }
        con.add(roomGfx);
        
        // Icons for special rooms
        if (room.type === 'boss') {
          var icon = scene.add.text(rx + rs/2, ry + rs/2, '👹', { fontSize: Math.floor(cellSize * 0.5) + 'px' }).setOrigin(0.5);
          con.add(icon);
        } else if (room.type === 'elite') {
          var icon = scene.add.text(rx + rs/2, ry + rs/2, '⭐', { fontSize: Math.floor(cellSize * 0.5) + 'px' }).setOrigin(0.5);
          con.add(icon);
        } else if (room.type === 'treasure') {
          var icon = scene.add.text(rx + rs/2, ry + rs/2, '💎', { fontSize: Math.floor(cellSize * 0.5) + 'px' }).setOrigin(0.5);
          con.add(icon);
        } else if (room.type === 'shop') {
          var icon = scene.add.text(rx + rs/2, ry + rs/2, '🛒', { fontSize: Math.floor(cellSize * 0.5) + 'px' }).setOrigin(0.5);
          con.add(icon);
        }
      }
    }
    
    // Legend
    var legendY = mapY + mapSize + 8;
    var legendItems = [
      { color: 0x00ff00, label: 'Current' },
      { color: 0xff4444, label: 'Enemy' },
      { color: 0xff0000, label: 'Boss' },
      { color: 0xffff00, label: 'Loot' },
      { color: 0x444444, label: 'Cleared' }
    ];
    
    legendItems.forEach(function(item, idx) {
      var lx = mapX + idx * (mapSize / legendItems.length);
      var box = scene.add.graphics();
      box.fillStyle(item.color, 1);
      box.fillRect(lx, legendY, 10, 10);
      con.add(box);
      var lbl = scene.add.text(lx + 12, legendY + 1, item.label, { fontSize: '9px', color: '#aaaaaa' }).setOrigin(0, 0);
      con.add(lbl);
    });
    
    // Room count
    var countText = scene.add.text(cw / 2, ch - 18, 'Rooms: ' + explored.length, { fontSize: '11px', color: '#44aaff' }).setOrigin(0.5);
    con.add(countText);
    
    // Close button
    var closeBtn = scene.add.text(cw / 2, ch - 38, 'CLOSE', {
      fontSize: '11px',
      color: '#ffffff',
      backgroundColor: '#335577',
      padding: { left: 12, right: 12, top: 4, bottom: 4 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    con.add(closeBtn);
    
    con.close = function() {
      scene.tweens.add({
        targets: con,
        alpha: 0,
        scaleX: 0.9,
        scaleY: 0.9,
        duration: 150,
        onComplete: function() { 
          scene.activeMiniMap = null;
          con.destroy(); 
        }
      });
    };
    closeBtn.on('pointerdown', function() { con.close(); });
    
    // Click outside to close
    var closeArea = scene.add.rectangle(W/2, H/2, W, H).setInteractive({ useHandCursor: false });
    closeArea.on('pointerdown', function() { con.close(); });
    closeArea.setDepth(199);
    closeArea.setAlpha(0);
    con.add(closeArea);
    
    scene.activeMiniMap = con;
    
    con.setAlpha(0);
    con.setScale(0.9);
    scene.tweens.add({
      targets: con,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });
    
    return con;
  },
  // Destroy mini-map data
  destroyMiniMap: function() {
    this.miniMap.exploredRooms = [];
    this.miniMap.currentRoom = null;
  },
  // Style Gauge - shows player's striking vs grappling preference in real-time
  styleGauge: {
    value: 0, // -100 = full grappler, +100 = full striker, 0 = balanced
    maxValue: 100,
    container: null,
    strikerBar: null,
    grapplerBar: null,
    label: null,
    icon: null
  },
  // Show Style Gauge in HUD
  showStyleGauge: function(scene) {
    if (this.styleGauge.container) return this.styleGauge.container;
    
    var centerX = scene.cameras.main.width / 2;
    var topY = 25;
    
    var container = scene.add.container(centerX, topY);
    container.setDepth(50);
    
    // Background
    var bg = scene.add.graphics();
    bg.fillStyle(0x000000, 0.6);
    bg.fillRoundedRect(-55, -12, 110, 24, 12);
    container.add(bg);
    
    // Striker side (left, red)
    var strikerBar = scene.add.graphics();
    strikerBar.fillStyle(0xff4444, 1);
    strikerBar.fillRect(-50, -6, 45, 12);
    container.add(strikerBar);
    
    // Grappler side (right, blue)
    var grapplerBar = scene.add.graphics();
    grapplerBar.fillStyle(0x4488ff, 1);
    grapplerBar.fillRect(5, -6, 45, 12);
    container.add(grapplerBar);
    
    // Center divider
    var divider = scene.add.graphics();
    divider.fillStyle(0xffffff, 0.5);
    divider.fillRect(-2, -6, 4, 12);
    container.add(divider);
    
    // Icon in center
    var icon = scene.add.text(0, 0, '⚖️', { fontSize: '14px' }).setOrigin(0.5);
    container.add(icon);
    
    // Label below
    var label = scene.add.text(0, 18, 'STYLE', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '9px',
      color: '#aaaaaa',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(label);
    
    this.styleGauge.container = container;
    this.styleGauge.strikerBar = strikerBar;
    this.styleGauge.grapplerBar = grapplerBar;
    this.styleGauge.label = label;
    this.styleGauge.icon = icon;
    
    // Also show technique mastery meter below style gauge
    this.showTechniqueMasteryMeter(scene);
    this.updateTechniqueMasteryMeter(scene);
    
    return container;
  },
  // Update Style Gauge display
  updateStyleGauge: function(scene, stylePoints) {
    if (!this.styleGauge.container) {
      this.showStyleGauge(scene);
    }
    
    var sp = stylePoints || this.fighterCard.stylePoints;
    var striker = sp.strike || 0;
    var grappler = sp.grapple || 0;
    var total = striker + grappler;
    
    // Calculate gauge position (-100 to +100)
    if (total === 0) {
      this.styleGauge.value = 0;
    } else {
      // If more strikes, positive; more grapples, negative
      var diff = striker - grappler;
      var maxDiff = Math.max(total, 50); // Scale relative to activity
      this.styleGauge.value = Math.max(-100, Math.min(100, (diff / maxDiff) * 100));
    }
    
    var value = this.styleGauge.value;
    var strikerWidth, grapplerWidth;
    
    if (value >= 0) {
      // Strikers dominate
      strikerWidth = 5 + (value / 100) * 45;
      grapplerWidth = 50 - strikerWidth;
    } else {
      // Grapplers dominate
      grapplerWidth = 5 + (Math.abs(value) / 100) * 45;
      strikerWidth = 50 - grapplerWidth;
    }
    
    // Redraw bars
    var strikerBar = this.styleGauge.strikerBar;
    var grapplerBar = this.styleGauge.grapplerBar;
    
    strikerBar.clear();
    grapplerBar.clear();
    
    // Striker bar (left side, fills from center left)
    strikerBar.fillStyle(0xff4444, 1);
    strikerBar.fillRect(-50, -6, strikerWidth, 12);
    
    // Grappler bar (right side, fills from center right)
    grapplerBar.fillStyle(0x4488ff, 1);
    grapplerBar.fillRect(50 - grapplerWidth, -6, grapplerWidth, 12);
    
    // Update icon based on dominant style
    var icon = this.styleGauge.icon;
    if (value > 30) {
      icon.setText('👊'); // Striker
    } else if (value < -30) {
      icon.setText('🤼'); // Grappler
    } else {
      icon.setText('⚖️'); // Balanced
    }
  },
  destroyStyleGauge: function() {
    if (this.styleGauge.container) {
      this.styleGauge.container.destroy();
      this.styleGauge.container = null;
      this.styleGauge.strikerBar = null;
      this.styleGauge.grapplerBar = null;
      this.styleGauge.label = null;
      this.styleGauge.icon = null;
    }
    this.styleGauge.value = 0;
  },
  // Technique Mastery Progress - tracks mastery levels (1-5 stars) for learned techniques
  techniqueMastery: {
    // Mastery data: { techniqueKey: { xp: number, level: number, totalXp: number } }
    techniques: {},
    // XP needed per level: [0, 10, 25, 50, 100] - level 1 needs 10 XP, level 2 needs 25, etc.
    xpThresholds: [0, 10, 25, 50, 100, 200],
    // Milestone bonuses at 3/6/10 techniques mastered (level 3+)
    milestoneBonuses: {
      3: { name: 'Technique Apprentice', bonus: '+5% damage' },
      6: { name: 'Technique Expert', bonus: '+10% damage' },
      10: { name: 'Technique Master', bonus: '+15% damage' }
    },
    unlockedMilestones: [],
    container: null,
    indicators: []
  },
  // Weight Class System - determines speed/power tradeoffs based on player stats
  weightClass: {
    current: 'featherweight', // featherweight, lightweight, welterweight, middleweight, heavyweight
    container: null,
    // Weight class definitions with stat tradeoffs
    classes: {
      featherweight: { 
        name: 'Featherweight', 
        icon: '🪶', 
        color: '#44ff88',
        speedBonus: 0.25, 
        powerBonus: -0.15,
        staminaBonus: 0.10,
        desc: '+Speed, -Power'
      },
      lightweight: { 
        name: 'Lightweight', 
        icon: '⚡', 
        color: '#44ffff',
        speedBonus: 0.15, 
        powerBonus: -0.05,
        staminaBonus: 0.05,
        desc: '+Speed, -Power'
      },
      welterweight: { 
        name: 'Welterweight', 
        icon: '⚖️', 
        color: '#ffff44',
        speedBonus: 0, 
        powerBonus: 0,
        staminaBonus: 0,
        desc: 'Balanced'
      },
      middleweight: { 
        name: 'Middleweight', 
        icon: '💪', 
        color: '#ff8844',
        speedBonus: -0.05, 
        powerBonus: 0.15,
        staminaBonus: 0,
        desc: '+Power, -Speed'
      },
      heavyweight: { 
        name: 'Heavyweight', 
        icon: '🏋️', 
        color: '#ff4444',
        speedBonus: -0.15, 
        powerBonus: 0.30,
        staminaBonus: -0.10,
        desc: '++Power, -Speed'
      }
    }
  },
  // Show Technique Mastery meter (next to Style Gauge)
  showTechniqueMasteryMeter: function(scene) {
    if (this.techniqueMastery.container) return this.techniqueMastery.container;
    
    var centerX = scene.cameras.main.width / 2;
    var topY = 45; // Below style gauge
    
    var container = scene.add.container(centerX, topY);
    container.setDepth(50);
    
    // Background pill
    var bg = scene.add.graphics();
    bg.fillStyle(0x000000, 0.5);
    bg.fillRoundedRect(-50, -8, 100, 16, 8);
    container.add(bg);
    
    // Label
    var label = scene.add.text(0, -5, 'TECHNIQUE', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '8px',
      color: '#aa88ff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(label);
    
    // Star indicators (5 slots for techniques, but we show aggregate mastery)
    var indicators = [];
    var startX = -40;
    var spacing = 16;
    
    for (var i = 0; i < 5; i++) {
      var star = scene.add.text(startX + i * spacing, 6, '☆', {
        fontSize: '12px',
        color: '#444444'
      }).setOrigin(0.5);
      container.add(star);
      indicators.push(star);
    }
    
    this.techniqueMastery.container = container;
    this.techniqueMastery.indicators = indicators;
    
    return container;
  },
  // Update Technique Mastery display based on mastered techniques count
  updateTechniqueMasteryMeter: function(scene) {
    if (!this.techniqueMastery.container) {
      this.showTechniqueMasteryMeter(scene);
    }
    
    var mastery = this.techniqueMastery;
    var indicators = mastery.indicators;
    
    // Count techniques with level 3+ (considered "mastered")
    var techniques = mastery.techniques || {};
    var masteredCount = 0;
    var totalMasteryLevel = 0;
    var totalTechniques = 0;
    
    for (var key in techniques) {
      var tech = techniques[key];
      totalTechniques++;
      totalMasteryLevel += tech.level || 0;
      if ((tech.level || 0) >= 3) {
        masteredCount++;
      }
    }
    
    // Update star indicators based on mastered count (max 5 stars)
    var displayStars = Math.min(5, masteredCount);
    
    for (var i = 0; i < 5; i++) {
      var star = indicators[i];
      if (i < displayStars) {
        // Filled star - gold/purple gradient effect
        star.setText('★');
        if (displayStars >= 4) {
          star.setColor('#ff44ff'); // Purple for high mastery
        } else if (displayStars >= 2) {
          star.setColor('#ffaa00'); // Gold for medium mastery
        } else {
          star.setColor('#44ffaa'); // Green for low mastery
        }
      } else {
        star.setText('☆');
        star.setColor('#444444');
      }
    }
    
    // Check for milestone unlocks
    this.checkTechniqueMilestones(scene, masteredCount);
    
    return { masteredCount: masteredCount, totalLevel: totalMasteryLevel };
  },
  // Add mastery XP to a technique
  addTechniqueMasteryXP: function(techniqueKey, xpAmount, scene) {
    var mastery = this.techniqueMastery;
    var techniques = mastery.techniques;
    
    // Initialize technique if not exists
    if (!techniques[techniqueKey]) {
      techniques[techniqueKey] = { xp: 0, level: 1, totalXp: 0 };
    }
    
    var tech = techniques[techniqueKey];
    var oldLevel = tech.level;
    tech.xp += xpAmount;
    tech.totalXp += xpAmount;
    
    // Level up based on thresholds
    var newLevel = 1;
    for (var i = 1; i < mastery.xpThresholds.length; i++) {
      if (tech.totalXp >= mastery.xpThresholds[i]) {
        newLevel = i;
      }
    }
    tech.level = newLevel;
    
    // Level up effect
    if (newLevel > oldLevel && scene) {
      this.showTechniqueLevelUp(scene, techniqueKey, newLevel);
    }
    
    // Update the display
    if (scene) {
      this.updateTechniqueMasteryMeter(scene);
    }
    
    return { oldLevel: oldLevel, newLevel: newLevel };
  },
  // Show technique level up notification
  showTechniqueLevelUp: function(scene, techniqueKey, newLevel) {
    var centerX = scene.cameras.main.width / 2;
    var centerY = scene.cameras.main.height / 2 - 50;
    
    // Get technique name from roster
    var moveName = techniqueKey;
    if (window.MMA && MMA.Combat && MMA.Combat.MOVE_ROSTER && MMA.Combat.MOVE_ROSTER[techniqueKey]) {
      moveName = MMA.Combat.MOVE_ROSTER[techniqueKey].name;
    }
    
    var text = scene.add.text(centerX, centerY, moveName.toUpperCase() + ' MASTERY ' + newLevel + '!', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '18px',
      color: '#ff44ff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(100);
    
    // Star display
    var stars = '';
    for (var i = 0; i < newLevel; i++) {
      stars += '★';
    }
    var starText = scene.add.text(centerX, centerY + 22, stars, {
      fontSize: '16px',
      color: '#ffaa00'
    }).setOrigin(0.5).setDepth(100);
    
    // Animate
    scene.tweens.add({
      targets: [text, starText],
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 200,
      yoyo: true,
      ease: 'Quad.easeOut'
    });
    
    scene.tweens.add({
      targets: [text, starText],
      alpha: 0,
      y: centerY - 30,
      delay: 1500,
      duration: 500,
      onComplete: function() {
        if (text && text.destroy) text.destroy();
        if (starText && starText.destroy) starText.destroy();
      }
    });
  },
  // Check and unlock technique milestones
  checkTechniqueMilestones: function(scene, masteredCount) {
    var mastery = this.techniqueMastery;
    var bonuses = mastery.milestoneBonuses;
    
    for (var threshold in bonuses) {
      threshold = parseInt(threshold);
      if (masteredCount >= threshold && mastery.unlockedMilestones.indexOf(threshold) === -1) {
        // New milestone unlocked!
        mastery.unlockedMilestones.push(threshold);
        this.showTechniqueMilestoneUnlock(scene, threshold, bonuses[threshold]);
      }
    }
  },
  // Show milestone unlock notification
  showTechniqueMilestoneUnlock: function(scene, threshold, bonus) {
    var centerX = scene.cameras.main.width / 2;
    var centerY = scene.cameras.main.height / 2;
    
    var text = scene.add.text(centerX, centerY - 40, 'MILESTONE UNLOCKED!', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '20px',
      color: '#ff44ff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(100);
    
    var title = scene.add.text(centerX, centerY, bonus.name, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#ffaa00',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(100);
    
    var desc = scene.add.text(centerX, centerY + 20, bonus.bonus, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#44ffaa'
    }).setOrigin(0.5).setDepth(100);
    
    // Flash effect
    var flash = scene.add.graphics();
    flash.fillStyle(0xff44ff, 0.3);
    flash.fillRect(0, 0, scene.cameras.main.width, scene.cameras.main.height);
    flash.setDepth(99);
    
    scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      onComplete: function() { if (flash && flash.destroy) flash.destroy(); }
    });
    
    scene.tweens.add({
      targets: [text, title, desc],
      alpha: 0,
      y: centerY - 50,
      delay: 2500,
      duration: 500,
      onComplete: function() {
        if (text && text.destroy) text.destroy();
        if (title && title.destroy) title.destroy();
        if (desc && desc.destroy) desc.destroy();
      }
    });
  },
  // Get technique mastery damage bonus
  getTechniqueMasteryBonus: function() {
    var mastery = this.techniqueMastery;
    var techniques = mastery.techniques || {};
    var masteredCount = 0;
    
    for (var key in techniques) {
      if ((techniques[key].level || 0) >= 3) {
        masteredCount++;
      }
    }
    
    // Bonus based on milestone
    if (masteredCount >= 10) return 0.15;
    if (masteredCount >= 6) return 0.10;
    if (masteredCount >= 3) return 0.05;
    return 0;
  },
  // Save technique mastery data
  saveTechniqueMastery: function() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      var key = 'mma-rpg-technique-mastery';
      var data = {
        techniques: this.techniqueMastery.techniques,
        unlockedMilestones: this.techniqueMastery.unlockedMilestones
      };
      window.localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {}
  },
  // Load technique mastery data
  loadTechniqueMastery: function() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      var key = 'mma-rpg-technique-mastery';
      var raw = window.localStorage.getItem(key);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return;
      if (data.techniques) this.techniqueMastery.techniques = data.techniques;
      if (data.unlockedMilestones) this.techniqueMastery.unlockedMilestones = data.unlockedMilestones;
    } catch (e) {}
  },
  // Destroy technique mastery meter
  destroyTechniqueMasteryMeter: function() {
    if (this.techniqueMastery.container) {
      this.techniqueMastery.container.destroy();
      this.techniqueMastery.container = null;
      this.techniqueMastery.indicators = [];
    }
  },
  // Weight Class Indicator methods
  // Determine weight class based on player stats (level + total fights + upgrades)
  calculateWeightClass: function(playerStats) {
    var totalPower = 0;
    if (playerStats) {
      // Calculate based on level, upgrades, and total stats
      totalPower = (playerStats.level || 1) * 10;
      totalPower += (playerStats.strength || 0) * 5;
      totalPower += (playerStats.upgrades?.power || 0) * 20;
      totalPower += (playerStats.totalFights || 0);
    }
    
    // Determine weight class based on total power
    if (totalPower < 30) return 'featherweight';
    if (totalPower < 60) return 'lightweight';
    if (totalPower < 100) return 'welterweight';
    if (totalPower < 160) return 'middleweight';
    return 'heavyweight';
  },
  // Get weight class bonuses
  getWeightClassBonuses: function() {
    var wc = this.weightClass.classes[this.weightClass.current];
    return wc || this.weightClass.classes.welterweight;
  },
  // Apply weight class bonuses to a stat value
  applyWeightClassBonus: function(statValue, bonusType) {
    var bonuses = this.getWeightClassBonuses();
    var bonus = bonuses[bonusType + 'Bonus'] || 0;
    return statValue * (1 + bonus);
  },
  // Show Weight Class indicator in HUD
  showWeightClassIndicator: function(scene) {
    if (this.weightClass.container) return this.weightClass.container;
    
    var leftX = 30;
    var topY = 120; // Below focus meter
    
    var container = scene.add.container(leftX, topY);
    container.setDepth(50);
    
    // Background pill
    var bg = scene.add.graphics();
    bg.fillStyle(0x000000, 0.6);
    bg.fillRoundedRect(-18, -10, 36, 20, 10);
    container.add(bg);
    
    // Icon text (will be updated)
    var icon = scene.add.text(0, 0, '⚖️', { 
      fontSize: '14px' 
    }).setOrigin(0.5);
    container.add(icon);
    
    // Label below
    var label = scene.add.text(0, 16, 'CLASS', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '8px',
      color: '#aaaaaa',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(label);
    
    this.weightClass.container = container;
    this.weightClass.icon = icon;
    this.weightClass.label = label;
    
    return container;
  },
  // Update Weight Class display
  updateWeightClassIndicator: function(scene, playerStats) {
    // Calculate current weight class
    var newClass = this.calculateWeightClass(playerStats);
    
    // Only update if changed
    if (newClass !== this.weightClass.current) {
      this.weightClass.current = newClass;
    }
    
    // Create container if needed
    if (!this.weightClass.container) {
      this.showWeightClassIndicator(scene);
    }
    
    var wc = this.weightClass.classes[this.weightClass.current];
    var container = this.weightClass.container;
    var icon = this.weightClass.icon;
    
    // Update icon and color
    icon.setText(wc.icon);
    icon.setColor(wc.color);
    
    // Pulse effect on change
    if (container) {
      scene.tweens.add({
        targets: container,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 150,
        yoyo: true,
        ease: 'Quad.easeOut'
      });
    }
  },
  // Show weight class details in a tooltip (on hover/click)
  showWeightClassTooltip: function(scene, x, y) {
    var wc = this.weightClass.classes[this.weightClass.current];
    
    // Create tooltip container
    var tooltip = scene.add.container(x, y);
    tooltip.setDepth(100);
    
    // Background
    var bg = scene.add.graphics();
    bg.fillStyle(0x000000, 0.9);
    bg.fillRoundedRect(0, 0, 140, 60, 8);
    bg.lineStyle(2, wc.color, 1);
    bg.strokeRoundedRect(0, 0, 140, 60, 8);
    tooltip.add(bg);
    
    // Title
    var title = scene.add.text(70, 12, wc.name.toUpperCase(), {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '12px',
      color: wc.color
    }).setOrigin(0.5);
    tooltip.add(title);
    
    // Stats
    var statsText = scene.add.text(10, 30, wc.desc, {
      fontSize: '11px',
      color: '#aaaaaa'
    });
    tooltip.add(statsText);
    
    // Auto-hide after 2 seconds
    scene.time.delayedCall(2000, function() {
      tooltip.destroy();
    });
    
    return tooltip;
  },
  // Destroy weight class indicator
  destroyWeightClassIndicator: function() {
    if (this.weightClass.container) {
      this.weightClass.container.destroy();
      this.weightClass.container = null;
      this.weightClass.icon = null;
      this.weightClass.label = null;
    }
  },
  // Update DOM-based weight class indicator (called from index.html)
  updateWeightClassFromDOM: function(playerStats) {
    var el = document.getElementById('weight-class-indicator');
    if (!el) return;
    
    // Calculate weight class
    var newClass = this.calculateWeightClass(playerStats);
    var oldClass = this.weightClass.current;
    
    // Only update if changed
    if (newClass !== oldClass) {
      this.weightClass.current = newClass;
    }
    
    var wc = this.weightClass.classes[this.weightClass.current];
    
    // Update DOM elements
    var icon = el.querySelector('.wc-icon');
    var name = el.querySelector('.wc-name');
    var bonus = el.querySelector('.wc-bonus');
    
    if (icon) icon.textContent = wc.icon;
    if (name) {
      name.textContent = wc.name;
      name.style.color = wc.color;
    }
    if (bonus) bonus.textContent = wc.desc;
    
    // Update indicator color
    el.style.borderColor = wc.color;
    el.style.color = wc.color;
  },
  // Stamina warning indicator
  staminaWarning: {
    active: false,
    container: null,
    scene: null,
    shown: false
  },
  // Perfect Block Counter - tracks perfect blocks with satisfying feedback
  perfectBlockCounter: {
    count: 0,
    lastBlockTime: 0,
    container: null,
    text: null,
    flashEffect: null
  },
  // Health Pulse Warning - red vignette when HP < 25%
  healthPulse: {
    active: false,
    overlay: null,
    currentHpPercent: 100,
    scene: null,
    intervalId: null
  },
  ACHIEVEMENTS: {
    firstFight: { id: 'firstFight', name: 'First Blood', desc: 'Win your first fight', icon: '🥊' },
    threeWins: { id: 'threeWins', name: 'Rising Star', desc: 'Win 3 fights', icon: '⭐' },
    tenWins: { id: 'tenWins', name: 'Contender', desc: 'Win 10 fights', icon: '🌟' },
    fiftyWins: { id: 'fiftyWins', name: 'Champion', desc: 'Win 50 fights', icon: '🏆' },
    striker: { id: 'striker', name: 'Striker', desc: 'Land 50 strikes', icon: '👊' },
    grappler: { id: 'grappler', name: 'Grappler', desc: 'Land 20 grapples', icon: '🤼' },
    combo10: { id: 'combo10', name: 'Combo King', desc: 'Hit a 10-hit combo', icon: '💥' },
    combo25: { id: 'combo25', name: 'Unstoppable', desc: 'Hit a 25-hit combo', icon: '🔥' },
    noDamage: { id: 'noDamage', name: 'Untouchable', desc: 'Win without taking damage', icon: '💎' },
    perfectBlock: { id: 'perfectBlock', name: 'Shield', desc: 'Land 10 perfect blocks', icon: '🛡️' },
    speedDemon: { id: 'speedDemon', name: 'Speed Demon', desc: 'Win in under 30 seconds', icon: '⚡' },
    underdog: { id: 'underdog', name: 'Underdog', desc: 'Win with less than 20% HP', icon: '🦁' },
    bossKiller: { id: 'bossKiller', name: 'Boss Killer', desc: 'Defeat a boss enemy', icon: '💀' }
  },
  recordStylePoint: function(type) {
    if (type === 'strike' || type === 'jab' || type === 'cross' || type === 'hook' || type === 'kick') this.fighterCard.stylePoints.strike++;
    else if (type === 'grapple' || type === 'takedown' || type === 'sub') this.fighterCard.stylePoints.grapple++;
    this.updateStyle();
  },
  // Record move usage for Style DNA Breakdown
  recordMoveUsage: function(moveKey, scene) {
    var mu = this.fighterCard.moveUsageStats;
    if (mu.hasOwnProperty(moveKey)) {
      mu[moveKey]++;
    }
    // Also update style points (career)
    var strikeMoves = { jab:1, cross:1, hook:1, kick:1, uppercut:1 };
    var grappleMoves = { takedown:1, grapple:1, submission:1, clinch:1 };
    if (strikeMoves[moveKey]) {
      this.fighterCard.stylePoints.strike++;
      this.fightStylePoints.strike++;
    } else if (grappleMoves[moveKey]) {
      this.fighterCard.stylePoints.grapple++;
      this.fightStylePoints.grapple++;
    }
    this.updateStyle();
    // Update style gauge in real-time during combat (using per-fight points)
    if (scene) {
      this.updateStyleGauge(scene, this.fightStylePoints);
      // Add technique mastery XP for this move
      this.addTechniqueMasteryXP(moveKey, 1, scene);
    }
  },
  // Get Style DNA breakdown percentages
  getStyleBreakdown: function() {
    var mu = this.fighterCard.moveUsageStats;
    var total = 0;
    for (var k in mu) total += mu[k];
    if (total === 0) return { strike: 50, grapple: 50, other: 0 };
    
    var strikeMoves = ['jab', 'cross', 'hook', 'kick', 'uppercut'];
    var grappleMoves = ['takedown', 'grapple', 'submission', 'clinch'];
    
    var strikeCount = 0, grappleCount = 0;
    for (var i = 0; i < strikeMoves.length; i++) {
      strikeCount += mu[strikeMoves[i]] || 0;
    }
    for (var j = 0; j < grappleMoves.length; j++) {
      grappleCount += mu[grappleMoves[j]] || 0;
    }
    var otherCount = total - strikeCount - grappleCount;
    
    return {
      strike: Math.round((strikeCount / total) * 100),
      grapple: Math.round((grappleCount / total) * 100),
      other: Math.round((otherCount / total) * 100),
      total: total
    };
  },
  // Get top moves for display
  getTopMoves: function(limit) {
    var mu = this.fighterCard.moveUsageStats;
    var moves = [];
    for (var k in mu) {
      if (mu[k] > 0) moves.push({ key: k, count: mu[k] });
    }
    moves.sort(function(a, b) { return b.count - a.count; });
    return moves.slice(0, limit || 5);
  },
  // Draw pie chart for Style DNA
  drawStylePieChart: function(scene, container, x, y, radius) {
    var breakdown = this.getStyleBreakdown();
    if (breakdown.total === 0) return;
    
    var strikeColor = 0xff4444;  // Red for striker
    var grappleColor = 0x4488ff;  // Blue for grappler
    var otherColor = 0x888888;   // Gray for other
    
    var segments = [];
    if (breakdown.strike > 0) segments.push({ pct: breakdown.strike / 100, color: strikeColor });
    if (breakdown.grapple > 0) segments.push({ pct: breakdown.grapple / 100, color: grappleColor });
    if (breakdown.other > 0) segments.push({ pct: breakdown.other / 100, color: otherColor });
    
    if (segments.length === 0) return;
    
    // Draw pie segments
    var startAngle = -Math.PI / 2; // Start from top
    for (var i = 0; i < segments.length; i++) {
      var seg = segments[i];
      var endAngle = startAngle + (seg.pct * 2 * Math.PI);
      
      var wedge = scene.add.graphics();
      wedge.fillStyle(seg.color, 1);
      wedge.slice(x, y, radius, startAngle, endAngle, false);
      wedge.fillPath();
      container.add(wedge);
      
      // Add slight gap between segments
      startAngle = endAngle + 0.02;
    }
    
    // Draw center circle (donut hole)
    var donut = scene.add.graphics();
    donut.fillStyle(0x000000, 1);
    donut.fillCircle(x, y, radius * 0.5);
    container.add(donut);
    
    // Draw center label
    var labelStyle = this.fighterCard.style;
    var centerColor = labelStyle === 'striker' ? strikeColor : (labelStyle === 'grappler' ? grappleColor : 0x44ff88);
    var centerText = scene.add.text(x, y - 6, this.getStyleLabel(), {
      fontSize: '10px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(centerText);
    
    var centerPct = scene.add.text(x, y + 8, breakdown.strike + '%', {
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(centerPct);
    
    // Draw legend below
    var legendY = y + radius + 15;
    var legendItems = [
      { label: 'Strikes', pct: breakdown.strike, color: strikeColor },
      { label: 'Grapples', pct: breakdown.grapple, color: grappleColor }
    ];
    
    for (var j = 0; j < legendItems.length; j++) {
      var item = legendItems[j];
      var lx = x - radius + j * (radius * 1.8);
      
      // Color box
      var box = scene.add.graphics();
      box.fillStyle(item.color, 1);
      box.fillRect(lx - 10, legendY - 4, 8, 8);
      container.add(box);
      
      // Label
      var lbl = scene.add.text(lx, legendY, item.label + ' ' + item.pct + '%', {
        fontSize: '9px',
        color: '#cccccc'
      }).setOrigin(0, 0.5);
      container.add(lbl);
    }
  },
  updateStyle: function() {
    var sp = this.fighterCard.stylePoints;
    if (sp.strike > sp.grapple + 10) this.fighterCard.style = 'striker';
    else if (sp.grapple > sp.strike + 10) this.fighterCard.style = 'grappler';
    else this.fighterCard.style = 'balanced';
  },
  getStyleColor: function() {
    var s = this.fighterCard.style;
    if (s === 'striker') return '#ff4444';
    if (s === 'grappler') return '#4488ff';
    return '#44ff88';
  },
  getStyleLabel: function() {
    var s = this.fighterCard.style;
    if (s === 'striker') return 'STRIKER';
    if (s === 'grappler') return 'GRAPPLER';
    return 'BALANCED';
  },
  checkAchievements: function(fightData) {
    var st = this.fighterCard.stats;
    if (fightData.won && st.wins === 0) this.unlockAchievement('firstFight');
    if (st.wins >= 3 && !this.hasAchievement('threeWins')) this.unlockAchievement('threeWins');
    if (st.wins >= 10 && !this.hasAchievement('tenWins')) this.unlockAchievement('tenWins');
    if (st.wins >= 50 && !this.hasAchievement('fiftyWins')) this.unlockAchievement('fiftyWins');
    if (st.totalHitsLanded >= 50 && !this.hasAchievement('striker')) this.unlockAchievement('striker');
    if ((fightData.grapplesLanded||0) >= 20 && !this.hasAchievement('grappler')) this.unlockAchievement('grappler');
    if (st.longestCombo >= 10 && !this.hasAchievement('combo10')) this.unlockAchievement('combo10');
    if (st.longestCombo >= 25 && !this.hasAchievement('combo25')) this.unlockAchievement('combo25');
    if (fightData.won && fightData.damageTaken === 0 && st.totalFights > 0) this.unlockAchievement('noDamage');
    if (st.perfectBlocks >= 10 && !this.hasAchievement('perfectBlock')) this.unlockAchievement('perfectBlock');
    if (fightData.won && (fightData.duration||0) < 30000 && st.totalFights > 0) this.unlockAchievement('speedDemon');
    if (fightData.won && (fightData.finalHpPercent||0) < 20 && st.totalFights > 0) this.unlockAchievement('underdog');
  },
  // Legacy Records - check and update personal bests
  checkLegacyRecords: function(fightData) {
    var rec = this.fighterCard.legacyRecords;
    var st = this.fighterCard.stats;
    var changed = false;
    
    // Longest combo
    if ((fightData.longestCombo||0) > rec.longestCombo) {
      rec.longestCombo = fightData.longestCombo;
      changed = true;
    }
    
    // Highest combo in single fight
    if ((fightData.longestCombo||0) > rec.highestComboInSingleFight) {
      rec.highestComboInSingleFight = fightData.longestCombo;
      changed = true;
    }
    
    // Total KOs
    rec.totalKOs = st.enemiesDefeated;
    
    // Total enemies defeated
    rec.totalEnemiesDefeated = st.enemiesDefeated;
    
    // Total perfect blocks
    rec.totalPerfectBlocks = st.perfectBlocks;
    
    // Total crits
    rec.totalCrits = st.critsLanded;
    
    // Highest damage in single fight
    if ((fightData.damageDealt||0) > rec.highestDamageInSingleFight) {
      rec.highestDamageInSingleFight = fightData.damageDealt;
      changed = true;
    }
    
    // Longest fight
    if ((fightData.duration||0) > rec.longestFightMs) {
      rec.longestFightMs = fightData.duration;
      changed = true;
    }
    
    // Fastest boss kill
    if (fightData.isBossFight && fightData.won && (fightData.duration||0) > 0 && fightData.duration < rec.fastestBossKillMs) {
      rec.fastestBossKillMs = fightData.duration;
      changed = true;
    }
    
    // Rooms cleared without taking damage
    if (fightData.won && fightData.damageTaken === 0 && fightData.isRoomClear) {
      rec.roomsClearedNoDamage++;
      changed = true;
    }
    
    // Wins without taking damage
    if (fightData.won && fightData.damageTaken === 0 && st.totalFights > 0) {
      rec.winsWithoutTakingDamage++;
      changed = true;
    }
    
    // Underdog wins (won with < 20% HP)
    if (fightData.won && (fightData.finalHpPercent||0) < 20 && st.totalFights > 0) {
      rec.underdogWins++;
      changed = true;
    }
    
    // Speed demon wins (won in under 30 seconds)
    if (fightData.won && (fightData.duration||0) < 30000 && st.totalFights > 0) {
      rec.speedDemonWins++;
      changed = true;
    }
    
    // Zones completed
    if (fightData.zoneCompleted) {
      rec.zonesCompleted = Math.max(rec.zonesCompleted, fightData.currentZone||1);
      changed = true;
    }
    
    // Bosses defeated
    if (fightData.bossDefeated) {
      rec.bossesDefeated++;
      changed = true;
    }
    
    if (changed) this.saveLegacyRecords();
    return changed;
  },
  // Stamina Warning Indicator - shows when stamina is critically low
  showStaminaWarning: function(scene) {
    if (this.staminaWarning.shown) return;
    
    var centerX = scene.cameras.main.width / 2;
    var topY = 140;
    
    var container = scene.add.container(centerX, topY);
    container.setDepth(60);
    container.setAlpha(0);
    
    // Warning background
    var bg = scene.add.graphics();
    bg.fillStyle(0xff0000, 0.8);
    bg.fillRoundedRect(-80, -15, 160, 30, 8);
    container.add(bg);
    
    // Warning text
    var text = scene.add.text(0, 0, 'LOW STAMINA!', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(text);
    
    this.staminaWarning.container = container;
    this.staminaWarning.scene = scene;
    this.staminaWarning.shown = true;
    
    // Fade in with pulse
    scene.tweens.add({
      targets: container,
      alpha: 1,
      duration: 200,
      onComplete: function() {
        scene.tweens.add({
          targets: container,
          alpha: 0.6,
          duration: 400,
          yoyo: true,
          repeat: 2
        });
      }
    });
    
    // Auto-hide after 2 seconds
    scene.time.delayedCall(2000, function() {
      if (container) {
        scene.tweens.add({
          targets: container,
          alpha: 0,
          duration: 200,
          onComplete: function() {
            if (container) container.destroy();
          }
        });
      }
      this.staminaWarning.shown = false;
    }, [], this);
  },
  checkStaminaWarning: function(scene, currentStamina, maxStamina) {
    // Show warning when stamina drops below 20%
    if (currentStamina / maxStamina < 0.2 && !this.staminaWarning.shown) {
      this.showStaminaWarning(scene);
    }
  },
  resetStaminaWarning: function() {
    this.staminaWarning.shown = false;
    this.staminaWarning.scene = null;
  },
  // Perfect Block Counter - track perfect blocks with visual feedback
  showPerfectBlockCounter: function(scene) {
    if (this.perfectBlockCounter.container) return this.perfectBlockCounter.container;
    
    // Show in top-right area, above action buttons
    var rightX = scene.cameras.main.width - 40;
    var topY = 50;
    
    var container = scene.add.container(rightX, topY);
    container.setDepth(50);
    container.setAlpha(0);
    
    // Background glow (only visible when counter > 0)
    var glow = scene.add.graphics();
    glow.fillStyle(0x00ffff, 0);
    glow.fillCircle(0, 0, 30);
    container.add(glow);
    
    // Counter icon and text
    var icon = scene.add.text(-15, 0, '🛡️', { fontSize: '18px' }).setOrigin(0.5);
    container.add(icon);
    
    var text = scene.add.text(10, 0, '0', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '16px',
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0, 0.5);
    container.add(text);
    
    this.perfectBlockCounter.container = container;
    this.perfectBlockCounter.text = text;
    this.perfectBlockCounter.glow = glow;
    this.perfectBlockCounter.icon = icon;
    
    // Fade in
    container.setAlpha(1);
    
    return container;
  },
  // Record a perfect block - call this when player perfectly times a block
  recordPerfectBlock: function(scene) {
    var now = Date.now();
    var pbc = this.perfectBlockCounter;
    
    // Increment counter
    pbc.count++;
    pbc.lastBlockTime = now;
    
    // Show/ensure container exists
    if (!pbc.container) {
      this.showPerfectBlockCounter(scene);
    }
    
    // Update text
    if (pbc.text) {
      pbc.text.setText(pbc.count.toString());
      
      // Pulse effect on increment
      scene.tweens.add({
        targets: pbc.container,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 80,
        yoyo: true,
        ease: 'Quad.easeOut'
      });
      
      // Glow effect for high counts
      if (pbc.count >= 5) {
        pbc.text.setColor('#ff00ff'); // Purple for high mastery
      } else if (pbc.count >= 3) {
        pbc.text.setColor('#00ff00'); // Green for medium
      }
    }
    
    // Update glow intensity
    if (pbc.glow) {
      var glowIntensity = Math.min(0.4, 0.1 + (pbc.count * 0.05));
      pbc.glow.clear();
      pbc.glow.fillStyle(0x00ffff, glowIntensity);
      pbc.glow.fillCircle(0, 0, 30 + (pbc.count * 2));
    }
    
    // Show "PERFECT!" popup
    var centerX = scene.cameras.main.width / 2;
    var centerY = scene.cameras.main.height / 2;
    
    var popup = scene.add.text(centerX, centerY - 60, 'PERFECT BLOCK!', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '20px',
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(100);
    
    scene.tweens.add({
      targets: popup,
      y: centerY - 100,
      alpha: 0,
      duration: 800,
      onComplete: function() {
        if (popup && popup.destroy) popup.destroy();
      }
    });
    
    // Screen edge flash for perfect block
    var flash = scene.add.graphics();
    flash.fillStyle(0x00ffff, 0.2);
    flash.fillRect(0, 0, scene.cameras.main.width, scene.cameras.main.height);
    flash.setDepth(98);
    scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 200,
      onComplete: function() { if (flash && flash.destroy) flash.destroy(); }
    });
    
    return pbc.count;
  },
  // Get perfect block count
  getPerfectBlockCount: function() {
    return this.perfectBlockCounter.count;
  },
  // Reset perfect block counter (call at start of each fight)
  resetPerfectBlockCounter: function(scene) {
    this.perfectBlockCounter.count = 0;
    this.perfectBlockCounter.lastBlockTime = 0;
    
    if (this.perfectBlockCounter.container) {
      if (this.perfectBlockCounter.text) {
        this.perfectBlockCounter.text.setText('0');
        this.perfectBlockCounter.text.setColor('#00ffff');
      }
      if (this.perfectBlockCounter.glow) {
        this.perfectBlockCounter.glow.clear();
        this.perfectBlockCounter.glow.fillStyle(0x00ffff, 0);
        this.perfectBlockCounter.glow.fillCircle(0, 0, 30);
      }
    }
  },
  // Destroy perfect block counter
  destroyPerfectBlockCounter: function() {
    if (this.perfectBlockCounter.container) {
      this.perfectBlockCounter.container.destroy();
      this.perfectBlockCounter.container = null;
      this.perfectBlockCounter.text = null;
      this.perfectBlockCounter.glow = null;
      this.perfectBlockCounter.icon = null;
    }
    this.perfectBlockCounter.count = 0;
  },
  // Health Pulse Warning - activates when HP < 25%
  getHealthPulseOverlay: function() {
    if (!this.healthPulse.overlay) {
      this.healthPulse.overlay = document.getElementById('health-pulse-overlay');
    }
    return this.healthPulse.overlay;
  },
  updateHealthPulse: function(scene, currentHp, maxHp) {
    var hpPercent = maxHp > 0 ? (currentHp / maxHp) * 100 : 0;
    this.healthPulse.currentHpPercent = hpPercent;
    
    var overlay = this.getHealthPulseOverlay();
    if (!overlay) return;
    
    // Activate when HP < 25%
    if (hpPercent < 25 && !this.healthPulse.active) {
      this.healthPulse.active = true;
      overlay.classList.add('active');
    } else if (hpPercent >= 25 && this.healthPulse.active) {
      this.deactivateHealthPulse();
      return;
    }
    
    if (!this.healthPulse.active) return;
    
    // Scale intensity based on how low HP is (more intense as HP approaches 0%)
    // At 25% HP: subtle pulse (inset 20px, opacity 0.3)
    // At 5% HP: intense pulse (inset 80px, opacity 0.8)
    var severity = Math.max(0, Math.min(1, (25 - hpPercent) / 20)); // 0 at 25%, 1 at 5% or below
    
    var insetPx = 20 + (severity * 60); // 20-80px
    var opacity = 0.3 + (severity * 0.5); // 0.3-0.8
    
    // Update the pulse animation intensity via box-shadow
    var shadow = 'inset ' + insetPx + 'px ' + insetPx + 'px ' + insetPx + 'px ' + insetPx + 'px rgba(255, 0, 0, ' + opacity + ')';
    overlay.style.boxShadow = shadow;
    
    // Adjust animation speed - faster pulse as HP gets lower
    var duration = Math.max(400, 800 - (severity * 400)); // 800ms at 25%, 400ms at critical
    overlay.style.animationDuration = duration + 'ms';
  },
  deactivateHealthPulse: function() {
    this.healthPulse.active = false;
    var overlay = this.getHealthPulseOverlay();
    if (overlay) {
      overlay.classList.remove('active');
      overlay.style.boxShadow = 'inset 0 0 0 0 rgba(255, 0, 0, 0)';
    }
  },
  // Save legacy records and move stats to localStorage
  saveLegacyRecords: function() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      var key = 'mma-rpg-legacy';
      var data = {
        legacy: this.fighterCard.legacyRecords,
        moves: this.fighterCard.moveUsageStats
      };
      window.localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {}
  },
  // Load legacy records and move stats from localStorage
  loadLegacyRecords: function() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      var key = 'mma-rpg-legacy';
      var raw = window.localStorage.getItem(key);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return;
      // Merge legacy records
      if (data.legacy) {
        var rec = this.fighterCard.legacyRecords;
        for (var k in data.legacy) {
          if (rec.hasOwnProperty(k)) {
            rec[k] = data.legacy[k];
          }
        }
      }
      // Merge move usage stats
      if (data.moves) {
        var mu = this.fighterCard.moveUsageStats;
        for (var mk in data.moves) {
          if (mu.hasOwnProperty(mk)) {
            mu[mk] = data.moves[mk];
          }
        }
      }
    } catch (e) {}
  },
  // Trophy Room - save/load
  saveTrophyRoom: function() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      var key = 'mma-rpg-trophies';
      var data = {
        bosses: this.trophyRoom.bosses,
        eliteEnemies: this.trophyRoom.eliteEnemies,
        rareItems: this.trophyRoom.rareItems
      };
      window.localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {}
  },
  loadTrophyRoom: function() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      var key = 'mma-rpg-trophies';
      var raw = window.localStorage.getItem(key);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return;
      if (data.bosses) this.trophyRoom.bosses = data.bosses;
      if (data.eliteEnemies) this.trophyRoom.eliteEnemies = data.eliteEnemies;
      if (data.rareItems) this.trophyRoom.rareItems = data.rareItems;
    } catch (e) {}
  },
  // Record a boss defeat
  recordBossDefeat: function(bossId, zone, durationMs) {
    // Check if already recorded
    for (var i = 0; i < this.trophyRoom.bosses.length; i++) {
      if (this.trophyRoom.bosses[i].id === bossId) return; // Already recorded
    }
    this.trophyRoom.bosses.push({
      id: bossId,
      zone: zone,
      dateDefeated: Date.now(),
      fightDuration: durationMs || 0
    });
    this.saveTrophyRoom();
  },
  // Record an elite enemy defeat
  recordEliteDefeat: function(eliteType, zone) {
    this.trophyRoom.eliteEnemies.push({
      type: eliteType,
      zone: zone,
      dateDefeated: Date.now()
    });
    this.saveTrophyRoom();
  },
  // Record a rare item acquisition
  recordRareItem: function(itemId) {
    // Check if already have this item
    for (var i = 0; i < this.trophyRoom.rareItems.length; i++) {
      if (this.trophyRoom.rareItems[i].id === itemId) return; // Already have
    }
    var itemDef = this.trophyRoom.itemRegistry[itemId];
    if (!itemDef) return;
    this.trophyRoom.rareItems.push({
      id: itemId,
      name: itemDef.name,
      type: itemDef.type,
      rarity: itemDef.rarity,
      dateAcquired: Date.now()
    });
    this.saveTrophyRoom();
  },
  // Get trophy counts
  getTrophyCounts: function() {
    return {
      bosses: this.trophyRoom.bosses.length,
      elites: this.trophyRoom.eliteEnemies.length,
      items: this.trophyRoom.rareItems.length,
      total: this.trophyRoom.bosses.length + this.trophyRoom.eliteEnemies.length + this.trophyRoom.rareItems.length
    };
  },
  // Show Trophy Room UI
  showTrophyRoom: function(scene) {
    var self = this;
    var W = scene.cameras.main.width;
    var H = scene.cameras.main.height;
    var cw = Math.min(400, W - 40);
    var ch = Math.min(480, H - 40);
    var cx = (W - cw) / 2;
    var cy = (H - ch) / 2;
    var con = scene.add.container(cx, cy);
    con.setDepth(200);

    // Background
    var g = scene.add.graphics();
    g.fillStyle(0x000000, 0.92);
    g.fillRoundedRect(0, 0, cw, ch, 16);
    g.lineStyle(3, 0x9933ff, 1);
    g.strokeRoundedRect(0, 0, cw, ch, 16);
    con.add(g);

    // Header
    var hdr = scene.add.graphics();
    hdr.fillStyle(0x2a1a3a, 1);
    hdr.fillRoundedRect(4, 4, cw - 8, 50, 12);
    con.add(hdr);

    var title = scene.add.text(cw / 2, 29, '🏆 TROPHY ROOM', { fontFamily: 'Arial Black, sans-serif', fontSize: '18px', color: '#9933ff' }).setOrigin(0.5);
    con.add(title);

    // Tab buttons
    var tabs = [
      { id: 'bosses', label: 'Bosses', icon: '👹' },
      { id: 'elites', label: 'Elites', icon: '⭐' },
      { id: 'items', label: 'Items', icon: '💎' }
    ];
    var activeTab = 'bosses';
    var tabButtons = [];
    var tabY = 65;
    var tabWidth = (cw - 40) / 3;

    tabs.forEach(function(tab, i) {
      var tx = 20 + i * tabWidth + tabWidth / 2;
      var isActive = activeTab === tab.id;
      var btn = scene.add.container(tx, tabY);
      var bg = scene.add.graphics();
      bg.fillStyle(isActive ? 0x6633aa : 0x222222, 1);
      bg.fillRoundedRect(-tabWidth / 2 + 2, -12, tabWidth - 4, 24, 6);
      if (isActive) {
        bg.lineStyle(2, 0xcc66ff, 1);
        bg.strokeRoundedRect(-tabWidth / 2 + 2, -12, tabWidth - 4, 24, 6);
      }
      btn.add(bg);
      var lbl = scene.add.text(0, 0, tab.icon + ' ' + tab.label, { fontSize: '12px', color: isActive ? '#ffffff' : '#888888' }).setOrigin(0.5);
      btn.add(lbl);
      btn.setSize(tabWidth - 4, 24);
      btn.setInteractive({ useHandCursor: true });
      btn.on('pointerdown', function() {
        activeTab = tab.id;
        updateContent();
      });
      con.add(btn);
      tabButtons.push(btn);
    });

    // Content area
    var contentY = 100;
    var contentH = ch - 130;
    var contentBg = scene.add.graphics();
    contentBg.fillStyle(0x111111, 1);
    contentBg.fillRoundedRect(10, contentY, cw - 20, contentH, 8);
    con.add(contentBg);

    var contentContainer = scene.add.container(0, contentY);
    con.add(contentContainer);

    function getRarityColor(rarity) {
      if (rarity === 'gold') return '#ffd700';
      if (rarity === 'silver') return '#c0c0c0';
      return '#cd7f32';
    }

    function updateContent() {
      contentContainer.removeAll();
      var items = [];
      var titleText = '';

      if (activeTab === 'bosses') {
        titleText = 'DEFEATED BOSSES';
        items = self.trophyRoom.bosses;
        items.forEach(function(boss) {
          var def = self.trophyRoom.bossRegistry[boss.id] || { name: boss.id, icon: '👹', desc: '' };
          contentContainer.add(scene.add.text(20, items.indexOf(boss) * 45, def.icon + ' ' + def.name + ' (Zone ' + boss.zone + ')', { fontSize: '13px', color: '#ff6666' }));
          var sec = Math.round((boss.fightDuration || 0) / 1000);
          contentContainer.add(scene.add.text(20, items.indexOf(boss) * 45 + 16, def.desc + ' - ' + sec + 's', { fontSize: '11px', color: '#888888' }));
        });
        if (items.length === 0) {
          contentContainer.add(scene.add.text(cw / 2 - 20, contentH / 2, 'No bosses defeated yet', { fontSize: '14px', color: '#666666' }).setOrigin(0.5));
        }
      } else if (activeTab === 'elites') {
        titleText = 'ELITE ENEMIES';
        items = self.trophyRoom.eliteEnemies;
        items.forEach(function(elite) {
          var def = self.trophyRoom.eliteTypes[elite.type] || { name: elite.type, icon: '⭐' };
          contentContainer.add(scene.add.text(20, items.indexOf(elite) * 40, def.icon + ' ' + def.name + ' (Zone ' + elite.zone + ')', { fontSize: '13px', color: '#66ccff' }));
        });
        if (items.length === 0) {
          contentContainer.add(scene.add.text(cw / 2 - 20, contentH / 2, 'No elite enemies defeated yet', { fontSize: '14px', color: '#666666' }).setOrigin(0.5));
        }
      } else if (activeTab === 'items') {
        titleText = 'RARE ITEMS';
        items = self.trophyRoom.rareItems;
        items.forEach(function(item) {
          var color = getRarityColor(item.rarity);
          contentContainer.add(scene.add.text(20, items.indexOf(item) * 40, (self.trophyRoom.itemRegistry[item.id] ? self.trophyRoom.itemRegistry[item.id].icon : '📦') + ' ' + item.name, { fontSize: '13px', color: color }));
          contentContainer.add(scene.add.text(20, items.indexOf(item) * 40 + 16, item.type.toUpperCase() + ' - ' + item.rarity.toUpperCase(), { fontSize: '10px', color: '#666666' }));
        });
        if (items.length === 0) {
          contentContainer.add(scene.add.text(cw / 2 - 20, contentH / 2, 'No rare items collected yet', { fontSize: '14px', color: '#666666' }).setOrigin(0.5));
        }
      }
    }

    updateContent();

    // Close button
    var closeBtn = scene.add.text(cw / 2, ch - 30, 'CLOSE', {
      fontSize: '13px',
      color: '#ffffff',
      backgroundColor: '#553388',
      padding: { left: 16, right: 16, top: 6, bottom: 6 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    con.add(closeBtn);

    con.close = function() {
      scene.tweens.add({
        targets: con,
        alpha: 0,
        scaleX: 0.9,
        scaleY: 0.9,
        duration: 150,
        onComplete: function() { con.destroy(); }
      });
    };
    closeBtn.on('pointerdown', function() { con.close(); });

    con.setAlpha(0);
    con.setScale(0.9);
    scene.tweens.add({
      targets: con,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });

    return con;
  },
  // Add Trophy Room button to Fighter Card
  unlockAchievement: function(achId) {
    if (this.hasAchievement(achId)) return;
    this.fighterCard.achievements.push(achId);
  },
  hasAchievement: function(achId) { return this.fighterCard.achievements.indexOf(achId) !== -1; },
  updateCareerStats: function(fightData) {
    var st = this.fighterCard.stats;
    var prevWins = st.wins;
    st.totalFights++;
    if (fightData.won) st.wins++; else st.losses++;
    st.enemiesDefeated += fightData.enemiesDefeated || 0;
    st.totalDamageDealt += fightData.damageDealt || 0;
    st.totalHitsLanded += fightData.hitsLanded || 0;
    if ((fightData.longestCombo||0) > st.longestCombo) st.longestCombo = fightData.longestCombo;
    st.critsLanded += fightData.critsLanded || 0;
    st.perfectBlocks += fightData.perfectBlocks || 0;
    this.checkAchievements(fightData);
    this.checkLegacyRecords(fightData);
    
    // Record milestones in Fighter's Diary
    if (fightData.won && prevWins === 0) {
      this.recordMilestone('first_win');
    }
    if (fightData.won && fightData.damageTaken === 0) {
      this.recordMilestone('perfect_fight');
    }
    if (fightData.won && (fightData.finalHpPercent||0) < 20) {
      this.recordMilestone('underdog_win');
    }
    if (fightData.won && (fightData.duration||0) < 30000) {
      this.recordMilestone('speed_demon', { duration: fightData.duration });
    }
    if (fightData.bossDefeated) {
      this.recordMilestone('boss_defeated', { bossName: fightData.bossName });
    }
    if (fightData.zoneCompleted) {
      this.recordMilestone('zone_clear', { zone: fightData.currentZone });
    }
    if ((fightData.critsLanded||0) >= 5 && (fightData.critsLanded||0) > 0) {
      this.recordMilestone('crit_combo', { count: fightData.critsLanded });
    }
    // Check lore unlocks based on total fights
    this.checkLoreUnlocks();
  },
  showFighterCard: function(scene) {
    var self = this, W = scene.cameras.main.width, H = scene.cameras.main.height;
    var cw = Math.min(380, W - 60), ch = Math.min(500, H - 60);
    var cx = (W - cw) / 2, cy = (H - ch) / 2;
    var con = scene.add.container(cx, cy); con.setDepth(200);
    var g = scene.add.graphics();
    g.fillStyle(0x000000, 0.9); g.fillRoundedRect(0, 0, cw, ch, 16);
    g.lineStyle(3, 0xe8c830, 1); g.strokeRoundedRect(0, 0, cw, ch, 16);
    con.add(g);
    var hdr = scene.add.graphics(); hdr.fillStyle(0x1a1a2e, 1); hdr.fillRoundedRect(4, 4, cw - 8, 60, 12); con.add(hdr);
    var icn = scene.add.text(30, 34, '🥊', { fontSize: '36px' }).setOrigin(0.5); con.add(icn);
    var ttl = scene.add.text(70, 20, 'FIGHTER CARD', { fontFamily: 'Arial Black, sans-serif', fontSize: '22px', color: '#e8c830' }).setOrigin(0, 0.5); con.add(ttl);
    var stc = this.getStyleColor(), stl = this.getStyleLabel();
    var stt = scene.add.text(70, 42, stl, { fontSize: '12px', color: stc, fontStyle: 'bold' }).setOrigin(0, 0.5); con.add(stt);
    // Weight class display
    var wc = this.weightClass.classes[this.weightClass.current];
    var wct = scene.add.text(150, 42, wc.icon + ' ' + wc.name, { fontSize: '11px', color: wc.color, fontStyle: 'bold' }).setOrigin(0, 0.5); con.add(wct);
    var st = this.fighterCard.stats, sy = 80, c1x = 20, c2x = cw / 2 + 10;
    con.add(scene.add.text(c1x, sy, 'CAREER STATS', { fontSize: '11px', color: '#888888', fontStyle: 'bold' }).setDepth(10));
    ['Record: '+st.wins+'W - '+st.losses+'L', 'Fights: '+st.totalFights, 'KOs: '+st.enemiesDefeated, 'Damage: '+st.totalDamageDealt, 'Hits: '+st.totalHitsLanded, 'Best Combo: '+st.longestCombo, 'Crits: '+st.critsLanded].forEach(function(line, i) {
      con.add(scene.add.text(i<4?c1x:c2x, sy+18+(i%4)*18, line, { fontSize: '13px', color: '#ffffff' }).setDepth(10));
    });
    var ay = sy + 90; con.add(scene.add.text(c1x, ay, 'ACHIEVEMENTS', { fontSize: '11px', color: '#888888', fontStyle: 'bold' }).setDepth(10));
    var al = Object.keys(this.ACHIEVEMENTS), ar = 4, as = 36, asy = ay + 20;
    al.forEach(function(aid, idx) {
      var has = self.hasAchievement(aid), inf = self.ACHIEVEMENTS[aid], col = idx%ar, row = Math.floor(idx/ar);
      var ax = c1x + 8 + col*(as+8), ay2 = asy + row*(as+8);
      var bbg = scene.add.graphics(); bbg.fillStyle(has?0x333333:0x111111,1); bbg.fillCircle(ax+as/2, ay2+as/2, as/2);
      if(has){ bbg.lineStyle(2,0xe8c830,1); bbg.strokeCircle(ax+as/2, ay2+as/2, as/2); }
      con.add(bbg); con.add(scene.add.text(ax+as/2, ay2+as/2, has?inf.icon:'?', { fontSize: has?'18px':'14px', color: has?'#ffffff':'#444444' }).setOrigin(0.5).setDepth(10));
    });
    // Legacy Records section
    var rec = this.fighterCard.legacyRecords;
    var ly = ay + 100;
    // Calculate dynamic height based on how many rows we need
    var lh = 85; 
    var hasMoves = self.getStyleBreakdown().total > 0;
    if (hasMoves) lh += 50; // Add space for pie chart
    if (ch < ly + lh + 30) { ch = ly + lh + 30; con.removeAll(); con.add(g); con.add(hdr); con.add(icn); con.add(ttl); con.add(stt); }
    con.add(scene.add.text(c1x, ly, 'LEGACY RECORDS', { fontSize: '11px', color: '#ff8800', fontStyle: 'bold' }).setDepth(10));
    var lrLines = [];
    if (rec.longestCombo > 0) lrLines.push('Best Combo: ' + rec.longestCombo);
    if (rec.totalKOs > 0) lrLines.push('Total KOs: ' + rec.totalKOs);
    if (rec.roomsClearedNoDamage > 0) lrLines.push('No-Damage Rooms: ' + rec.roomsClearedNoDamage);
    if (rec.bossesDefeated > 0) lrLines.push('Bosses: ' + rec.bossesDefeated);
    if (rec.zonesCompleted > 0) lrLines.push('Zones: ' + rec.zonesCompleted);
    if (rec.winsWithoutTakingDamage > 0) lrLines.push('Perfect Wins: ' + rec.winsWithoutTakingDamage);
    if (rec.underdogWins > 0) lrLines.push('Underdog Wins: ' + rec.underdogWins);
    if (rec.speedDemonWins > 0) lrLines.push('Speed Wins: ' + rec.speedDemonWins);
    if (rec.fastestBossKillMs < Infinity) {
      var bossSec = Math.round(rec.fastestBossKillMs / 1000);
      lrLines.push('Fastest Boss: ' + bossSec + 's');
    }
    if (rec.highestDamageInSingleFight > 0) lrLines.push('Max Dmg: ' + rec.highestDamageInSingleFight);
    if (lrLines.length === 0) lrLines.push('No records yet!');
    lrLines.forEach(function(line, i) {
      con.add(scene.add.text(c1x + 5, ly + 15 + i * 14, line, { fontSize: '12px', color: '#ffaa44' }).setDepth(10));
    });
    
    // Style DNA Breakdown - pie chart
    var dnaY = ly + 85;
    var hasMoves = self.getStyleBreakdown().total > 0;
    if (hasMoves) {
      con.add(scene.add.text(c1x, dnaY, 'STYLE DNA', { fontSize: '11px', color: '#aa44ff', fontStyle: 'bold' }).setDepth(10));
      self.drawStylePieChart(scene, con, cw - 60, dnaY + 28, 28);
      
      // Show top move
      var topMoves = self.getTopMoves(3);
      if (topMoves.length > 0) {
        var topLabel = topMoves[0].key.charAt(0).toUpperCase() + topMoves[0].key.slice(1);
        con.add(scene.add.text(c1x, dnaY + 12, 'Top: ' + topLabel + ' x' + topMoves[0].count, { fontSize: '10px', color: '#cc88ff' }).setDepth(10));
      }
    }
    
    // Diary button
    var diaryBtn = scene.add.text(cw - 90, ch - 18, '📖 Diary', {
      fontSize: '12px',
      color: '#44ffaa',
      backgroundColor: '#1a3a2a',
      padding: { left: 8, right: 8, top: 4, bottom: 4 }
    }).setInteractive({ useHandCursor: true });
    diaryBtn.on('pointerdown', function() {
      scene.time.delayedCall(100, function() {
        scene.activeFighterDiary = self.showFighterDiary(scene);
      });
    });
    con.add(diaryBtn);
    
    con.add(scene.add.text(cw/2, ch-15, 'Tap card or press C to close', { fontSize: '12px', color: '#666666' }).setOrigin(0.5).setDepth(10));
    con.close = function() { scene.tweens.add({ targets: con, alpha: 0, scaleX: 0.9, scaleY: 0.9, duration: 150, onComplete: function(){ if (scene.activeFighterCard === con) scene.activeFighterCard = null; con.destroy(); } }); };
    con.setSize(cw, ch);
    con.setInteractive(new Phaser.Geom.Rectangle(0, 0, cw, ch), Phaser.Geom.Rectangle.Contains);
    con.on('pointerdown', function() { con.close(); });
    con.setAlpha(0); con.setScale(0.9);
    scene.tweens.add({ targets: con, alpha: 1, scaleX: 1, scaleY: 1, duration: 200, ease: 'Back.easeOut' });
    return con;
  },
  showFightStats: function(scene) {
    var stats = this.fightStats;
    var centerX = scene.cameras.main.width / 2;
    var centerY = scene.cameras.main.height / 2;
    
    // Container
    var container = scene.add.container(centerX, centerY);
    container.setDepth(100);
    
    // Background
    var bg = scene.add.graphics();
    bg.fillStyle(0x000000, 0.85);
    bg.fillRoundedRect(-160, -120, 320, 240, 16);
    bg.lineStyle(3, 0xe8c830, 1);
    bg.strokeRoundedRect(-160, -120, 320, 240, 16);
    container.add(bg);
    
    // Title
    var title = scene.add.text(0, -95, 'FIGHT STATS', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#e8c830',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(title);
    
    // Stats lines
    var statsText = [
      'Damage Dealt: ' + stats.damageDealt,
      'Damage Taken: ' + stats.damageTaken,
      'Hits Landed: ' + stats.hitsLanded,
      'Hits Taken: ' + stats.hitsTaken,
      'Longest Combo: ' + stats.longestCombo,
      'Enemies Defeated: ' + stats.enemiesDefeated,
      'Crits: ' + stats.critsLanded
    ];
    
    var yOffset = -55;
    statsText.forEach(function(line, i) {
      var txt = scene.add.text(0, yOffset + (i * 22), line, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        color: '#ffffff'
      }).setOrigin(0.5);
      container.add(txt);
    });
    
    // Auto-dismiss after 3 seconds
    scene.time.delayedCall(3000, function() {
      container.destroy();
    });
    
    return container;
  },
  cooldownActive: false,
  setCooldown: function(action, durationMs) {
    if (!this.cooldowns[action]) return;
    this.cooldowns[action].total = durationMs;
    this.cooldowns[action].remaining = durationMs;
    this.cooldownActive = true;
    this._updateCooldownUI(action);
  },
  updateCooldowns: function(deltaMs, scene) {
    if (!this.cooldownActive && !scene) return;
    var anyActive = false;
    var self = this;
    
    // Check stamina warning if scene provided with player
    if (scene && scene.player && scene.player.stats) {
      this.checkStaminaWarning(scene, scene.player.stats.stamina, scene.player.stats.maxStamina);
    }
    
    Object.keys(this.cooldowns).forEach(function(action) {
      var cd = self.cooldowns[action];
      if (cd.remaining > 0) {
        cd.remaining = Math.max(0, cd.remaining - deltaMs);
        self._updateCooldownUI(action);
        anyActive = true;
      }
    });
    this.cooldownActive = anyActive;
  },
  _updateCooldownUI: function(action) {
    var btn = document.querySelector('.action-btn[data-action="' + action + '"]');
    if (!btn) return;
    var cd = this.cooldowns[action];
    var overlay = btn.querySelector('.cooldown-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'cooldown-overlay';
      btn.appendChild(overlay);
    }
    var pct = cd.total > 0 ? (cd.remaining / cd.total) * 100 : 0;
    overlay.style.height = pct + '%';
    if (cd.remaining > 0) {
      btn.classList.add('on-cooldown');
    } else {
      btn.classList.remove('on-cooldown');
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }
  },
  clearCooldown: function(action) {
    if (!this.cooldowns[action]) return;
    this.cooldowns[action].remaining = 0;
    this._updateCooldownUI(action);
  },
  clearAllCooldowns: function() {
    var self = this;
    Object.keys(this.cooldowns).forEach(function(action) {
      self.clearCooldown(action);
    });
    this.cooldownActive = false;
  },
  isOnCooldown: function(action) {
    return this.cooldowns[action] ? this.cooldowns[action].remaining > 0 : false;
  },
  showDamageText: function(scene, x, y, text, color) {
    var t = scene.add.text(x, y, text, { fontSize: '16px', color: color || '#ff4444', stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5).setDepth(10);
    scene.tweens.add({ targets: t, y: y - 40, alpha: 0, duration: 600, onComplete: function() { t.destroy(); } });
  },
  // Move Input Display functions
  moveInputIcons: {
    jab: '👊', cross: '✊', hook: '🪝', kick: '🦵', uppercut: '⬆️',
    takedown: '🦵', grapple: '🤼', special: '⭐', block: '🛡️', dodge: '💨',
    heavy: '💥', standup: '⬆️'
  },
  showMoveInputDisplay: function(scene) {
    if (!this.settings.showMoveInput) return;
    if (this.moveInputDisplay.container) return this.moveInputDisplay.container;
    
    var leftX = 30;
    var bottomY = scene.cameras.main.height - 30;
    
    var container = scene.add.container(leftX, bottomY);
    container.setDepth(50);
    
    // Background pill
    var bg = scene.add.graphics();
    bg.fillStyle(0x000000, 0.5);
    bg.fillRoundedRect(-5, -18, 180, 36, 18);
    container.add(bg);
    
    // "INPUTS" label
    var label = scene.add.text(0, -22, 'INPUTS', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '9px',
      color: '#888888',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(label);
    
    // Create icon slots (6 positions)
    var icons = [];
    var startX = 8;
    var spacing = 28;
    
    for (var i = 0; i < 6; i++) {
      var icon = scene.add.text(startX + i * spacing, 0, '·', {
        fontSize: '20px'
      }).setOrigin(0.5);
      container.add(icon);
      icons.push(icon);
    }
    
    this.moveInputDisplay.container = container;
    this.moveInputDisplay.icons = icons;
    
    return container;
  },
  recordMoveInput: function(moveKey, scene) {
    if (!this.settings.showMoveInput) return;
    
    var icon = this.moveInputIcons[moveKey] || '❓';
    
    // Add to history
    this.moveInputDisplay.history.unshift({
      key: moveKey,
      icon: icon,
      timestamp: Date.now()
    });
    
    // Keep only maxHistory items
    if (this.moveInputDisplay.history.length > this.moveInputDisplay.maxHistory) {
      this.moveInputDisplay.history.pop();
    }
    
    this.updateMoveInputDisplay(scene);
  },
  updateMoveInputDisplay: function(scene) {
    if (!this.settings.showMoveInput) return;
    
    // Create container if doesn't exist
    if (!this.moveInputDisplay.container) {
      this.showMoveInputDisplay(scene);
    }
    
    var icons = this.moveInputDisplay.icons;
    var history = this.moveInputDisplay.history;
    
    // Update each icon
    for (var i = 0; i < icons.length; i++) {
      var icon = icons[i];
      if (history[i]) {
        icon.setText(history[i].icon);
        icon.setAlpha(1);
        
        // Flash effect for newest input
        if (i === 0) {
          scene.tweens.add({
            targets: icon,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 80,
            yoyo: true,
            ease: 'Quad.easeOut'
          });
        }
      } else {
        icon.setText('·');
        icon.setAlpha(0.3);
      }
    }
  },
  clearMoveInputDisplay: function() {
    this.moveInputDisplay.history = [];
    if (this.moveInputDisplay.icons) {
      this.moveInputDisplay.icons.forEach(function(icon) {
        icon.setText('·');
        icon.setAlpha(0.3);
      });
    }
  },
  destroyMoveInputDisplay: function() {
    if (this.moveInputDisplay.container) {
      this.moveInputDisplay.container.destroy();
      this.moveInputDisplay.container = null;
      this.moveInputDisplay.icons = [];
    }
    this.moveInputDisplay.history = [];
  },
  // Settings Menu
  settings: {
    difficulty: 'normal',
    soundVolume: 0.8,
    musicVolume: 0.6,
    showHud: true,
    vibration: true,
    showMoveInput: true
  },
  // Move Input Display - shows last 6 button inputs in real-time
  moveInputDisplay: {
    history: [], // Array of last inputs { key, icon, timestamp }
    maxHistory: 6,
    container: null,
    icons: []
  },
  showSettingsMenu: function(scene) {
    var self = this;
    var W = scene.cameras.main.width;
    var H = scene.cameras.main.height;
    var cw = Math.min(340, W - 60);
    var ch = Math.min(420, H - 80);
    var cx = (W - cw) / 2;
    var cy = (H - ch) / 2;
    var con = scene.add.container(cx, cy);
    con.setDepth(200);
    
    var g = scene.add.graphics();
    g.fillStyle(0x000000, 0.92);
    g.fillRoundedRect(0, 0, cw, ch, 16);
    g.lineStyle(3, 0x4488ff, 1);
    g.strokeRoundedRect(0, 0, cw, ch, 16);
    con.add(g);
    
    var hdr = scene.add.graphics();
    hdr.fillStyle(0x1a2a4a, 1);
    hdr.fillRoundedRect(4, 4, cw - 8, 50, 12);
    con.add(hdr);
    
    var title = scene.add.text(cw / 2, 29, 'SETTINGS', { fontFamily: 'Arial Black, sans-serif', fontSize: '20px', color: '#4488ff' }).setOrigin(0.5);
    con.add(title);
    
    var startY = 70;
    var rowHeight = 55;
    var labelX = 30;
    var controlX = cw - 90;
    
    // Difficulty
    var diffLabel = scene.add.text(labelX, startY, 'Difficulty', { fontSize: '14px', color: '#ffffff' }).setOrigin(0, 0.5);
    con.add(diffLabel);
    
    var difficulties = ['easy', 'normal', 'hard'];
    var diffColors = { easy: '#44ff88', normal: '#ffff44', hard: '#ff4444' };
    difficulties.forEach(function(diff, i) {
      var diffX = controlX + i * 42;
      var btn = scene.add.container(diffX, startY);
      var bg = scene.add.graphics();
      var isActive = self.settings.difficulty === diff;
      bg.fillStyle(isActive ? diffColors[diff] : 0x333333, 1);
      bg.fillRoundedRect(-18, -12, 36, 24, 6);
      if (isActive) { bg.lineStyle(2, diffColors[diff], 1); bg.strokeRoundedRect(-18, -12, 36, 24, 6); }
      btn.add(bg);
      var txt = scene.add.text(0, 0, diff.charAt(0).toUpperCase(), { fontSize: '11px', color: isActive ? '#000000' : '#888888', fontStyle: 'bold' }).setOrigin(0.5);
      btn.add(txt);
      btn.setSize(36, 24);
      btn.setInteractive({ useHandCursor: true });
      btn.on('pointerdown', function() { self.settings.difficulty = diff; self.showSettingsMenu(scene); });
      con.add(btn);
    });
    
    // SFX Volume
    var soundY = startY + rowHeight;
    con.add(scene.add.text(labelX, soundY, 'SFX Volume', { fontSize: '14px', color: '#ffffff' }).setOrigin(0, 0.5));
    this._createSlider(scene, con, controlX + 40, soundY, this.settings.soundVolume, function(val) { self.settings.soundVolume = val; self._applyVolumeSettings(); });
    
    // Music Volume
    var musicY = startY + rowHeight * 2;
    con.add(scene.add.text(labelX, musicY, 'Music Volume', { fontSize: '14px', color: '#ffffff' }).setOrigin(0, 0.5));
    this._createSlider(scene, con, controlX + 40, musicY, this.settings.musicVolume, function(val) { self.settings.musicVolume = val; self._applyVolumeSettings(); });
    
    // Vibration toggle
    var vibY = startY + rowHeight * 3;
    con.add(scene.add.text(labelX, vibY, 'Vibration', { fontSize: '14px', color: '#ffffff' }).setOrigin(0, 0.5));
    var vibToggle = scene.add.container(cw - 60, vibY);
    var vibBg = scene.add.graphics();
    var isVibOn = this.settings.vibration;
    vibBg.fillStyle(isVibOn ? 0x44ff88 : 0x333333, 1);
    vibBg.fillRoundedRect(-20, -12, 40, 24, 12);
    vibToggle.add(vibBg);
    var vibKnob = scene.add.graphics();
    vibKnob.fillStyle(0xffffff, 1);
    vibKnob.fillCircle(isVibOn ? 8 : -8, 0, 8);
    vibToggle.add(vibKnob);
    vibToggle.setSize(40, 24);
    vibToggle.setInteractive({ useHandCursor: true });
    vibToggle.on('pointerdown', function() { self.settings.vibration = !self.settings.vibration; self.showSettingsMenu(scene); });
    con.add(vibToggle);
    
    // HUD toggle
    var hudY = startY + rowHeight * 4;
    con.add(scene.add.text(labelX, hudY, 'Show HUD', { fontSize: '14px', color: '#ffffff' }).setOrigin(0, 0.5));
    var hudToggle = scene.add.container(cw - 60, hudY);
    var hudBg = scene.add.graphics();
    var isHudOn = this.settings.showHud;
    hudBg.fillStyle(isHudOn ? 0x44ff88 : 0x333333, 1);
    hudBg.fillRoundedRect(-20, -12, 40, 24, 12);
    hudToggle.add(hudBg);
    var hudKnob = scene.add.graphics();
    hudKnob.fillStyle(0xffffff, 1);
    hudKnob.fillCircle(isHudOn ? 8 : -8, 0, 8);
    hudToggle.add(hudKnob);
    hudToggle.setSize(40, 24);
    hudToggle.setInteractive({ useHandCursor: true });
    hudToggle.on('pointerdown', function() { self.settings.showHud = !self.settings.showHud; self.showSettingsMenu(scene); });
    con.add(hudToggle);
    
    // Move Input Display toggle
    var inputY = startY + rowHeight * 5;
    con.add(scene.add.text(labelX, inputY, 'Move Inputs', { fontSize: '14px', color: '#ffffff' }).setOrigin(0, 0.5));
    var inputToggle = scene.add.container(cw - 60, inputY);
    var inputBg = scene.add.graphics();
    var isInputOn = this.settings.showMoveInput;
    inputBg.fillStyle(isInputOn ? 0x44ff88 : 0x333333, 1);
    inputBg.fillRoundedRect(-20, -12, 40, 24, 12);
    inputToggle.add(inputBg);
    var inputKnob = scene.add.graphics();
    inputKnob.fillStyle(0xffffff, 1);
    inputKnob.fillCircle(isInputOn ? 8 : -8, 0, 8);
    inputToggle.add(inputKnob);
    inputToggle.setSize(40, 24);
    inputToggle.setInteractive({ useHandCursor: true });
    inputToggle.on('pointerdown', function() { self.settings.showMoveInput = !self.settings.showMoveInput; self.showSettingsMenu(scene); });
    con.add(inputToggle);
    
    var closeBtn = scene.add.text(cw / 2, ch - 48, 'CLOSE', {
      fontSize: '13px',
      color: '#ffffff',
      backgroundColor: '#335577',
      padding: { left: 12, right: 12, top: 5, bottom: 5 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    con.add(closeBtn);
    con.add(scene.add.text(cw / 2, ch - 25, 'Tap CLOSE or press ESC', { fontSize: '11px', color: '#666666' }).setOrigin(0.5));
    
    con.close = function() { scene.tweens.add({ targets: con, alpha: 0, scaleX: 0.9, scaleY: 0.9, duration: 150, onComplete: function(){ con.destroy(); } }); };
    closeBtn.on('pointerdown', function() { con.close(); });
    con.setAlpha(0);
    con.setScale(0.9);
    scene.tweens.add({ targets: con, alpha: 1, scaleX: 1, scaleY: 1, duration: 200, ease: 'Back.easeOut' });
    return con;
  },
  _createSlider: function(scene, container, x, y, initialValue, onChange) {
    var track = scene.add.graphics();
    track.fillStyle(0x333333, 1);
    track.fillRoundedRect(-60, -6, 120, 12, 6);
    container.add(track);
    var fill = scene.add.graphics();
    fill.fillStyle(0x4488ff, 1);
    fill.fillRoundedRect(-60, -6, 120 * initialValue, 12, 6);
    container.add(fill);
    var knob = scene.add.graphics();
    knob.fillStyle(0xffffff, 1);
    knob.fillCircle(-60 + 120 * initialValue, 0, 10);
    container.add(knob);
    var slider = scene.add.container(x, y);
    slider.setSize(120, 20);
    slider.setInteractive({ useHandCursor: true });
    slider.on('pointerdown', function(pointer) {
      var val = Math.max(0, Math.min(1, (pointer.x - x + 60) / 120));
      fill.clear(); fill.fillStyle(0x4488ff, 1); fill.fillRoundedRect(-60, -6, 120 * val, 12, 6);
      knob.clear(); knob.fillStyle(0xffffff, 1); knob.fillCircle(-60 + 120 * val, 0, 10);
      if (onChange) onChange(val);
    });
    slider.on('pointermove', function(pointer) {
      if (pointer.isDown) {
        var val = Math.max(0, Math.min(1, (pointer.x - x + 60) / 120));
        fill.clear(); fill.fillStyle(0x4488ff, 1); fill.fillRoundedRect(-60, -6, 120 * val, 12, 6);
        knob.clear(); knob.fillStyle(0xffffff, 1); knob.fillCircle(-60 + 120 * val, 0, 10);
        if (onChange) onChange(val);
      }
    });
    container.add(slider);
    return slider;
  },
  _applyVolumeSettings: function() {
    if (window.MMA_AUDIO && window.MMA_AUDIO.sfxGain) { window.MMA_AUDIO.sfxGain.gain.value = this.settings.soundVolume; }
  },
  getDifficultyMultiplier: function() {
    var diff = this.settings.difficulty;
    if (diff === 'easy') return 0.75;
    if (diff === 'hard') return 1.5;
    return 1.0;
  },
  getEnemyHpMultiplier: function() {
    var diff = this.settings.difficulty;
    if (diff === 'easy') return 0.7;
    if (diff === 'hard') return 1.5;
    return 1.0;
  },
  updateHUDRegistry: function(scene) {
    scene.registry.set('playerStats', {
      hp: Math.round(scene.player.stats.hp),
      maxHp: scene.player.stats.maxHp,
      stamina: Math.round(scene.player.stats.stamina),
      maxStamina: scene.player.stats.maxStamina,
      xp: scene.player.stats.xp,
      level: scene.player.stats.level
    });
    this.updateGroundHUD(scene);
  },
  setActionButtonLabels: function(groundActive, scene) {
    var roster = window.MMA.Combat.MOVE_ROSTER;
    var loadout = ['jab', 'cross', 'takedown', 'hook'];
    var unlocked = [];
    
    // Get loadout from player if available
    if (scene && scene.player && scene.player.moveLoadout) {
      loadout = scene.player.moveLoadout;
    }
    if (scene && scene.player && scene.player.unlockedMoves) {
      unlocked = scene.player.unlockedMoves;
    }
    
    // Map actions to loadout slots
    var slotMap = { jab: 0, heavy: 1, grapple: 2, special: 3 };
    
    if (groundActive && scene && scene.groundState && scene.groundState.active) {
      // Ground game - show position-based moves
      var position = scene.groundState.position || 'fullGuard';
      var positionLabels = {
        fullGuard: { jab: 'G&P', heavy: 'Elbow', grapple: 'Submit', special: 'Improve' },
        halfGuard: { jab: 'G&P', heavy: 'Elbow', grapple: 'Submit', special: 'Improve' },
        sideControl: { jab: 'G&P', heavy: 'Elbow', grapple: 'Submit', special: 'Mount' },
        mount: { jab: 'G&P', heavy: 'Pound', grapple: 'Submit', special: 'Back' },
        backControl: { jab: 'Choke', heavy: 'Choke', grapple: 'Submit', special: 'Escape' }
      };
      
      // Get valid submissions for current position
      var posSubs = this.getSubmissionsForPosition(position, scene);
      
      // Show the first available submission name on the grapple button
      var subName = 'Submit';
      if (posSubs && posSubs.length > 0 && roster[posSubs[0]]) {
        subName = roster[posSubs[0]].name;
      }
      
      var labels = positionLabels[position] || positionLabels.fullGuard;
      labels.grapple = subName;  // Show actual submission name
      
      Object.keys(labels).forEach(function(action) {
        var btn = document.querySelector('.action-btn[data-action="' + action + '"]');
        if (btn) btn.textContent = labels[action];
      });
      
      // Update stand up button visibility
      this.updateStandUpButton(scene);
    } else {
      // Standing - use loadout to show moves
      var actionToSlot = { jab: 0, heavy: 1, grapple: 2, special: 3 };
      Object.keys(actionToSlot).forEach(function(action) {
        var slotIndex = actionToSlot[action];
        var moveKey = loadout[slotIndex] || 'jab';
        var move = roster[moveKey];
        var btn = document.querySelector('.action-btn[data-action="' + action + '"]');
        if (btn && move) {
          btn.textContent = move.name;
        } else if (btn) {
          btn.textContent = action === 'jab' ? 'Jab' : (action === 'heavy' ? 'Heavy' : (action === 'grapple' ? 'Grapple' : 'Special'));
        }
      });
    }
    this.updateSpecialButton(scene || null, !!groundActive);
  },
  // Get submissions available for a given ground position
  getSubmissionsForPosition: function(position, scene) {
    var unlockedSubs = [];
    if (scene && scene.player && scene.player.unlockedSubmissions) {
      unlockedSubs = scene.player.unlockedSubmissions;
    } else {
      unlockedSubs = ['rnc']; // default
    }
    
    // Position-based submission availability (RNC available from guard + back control)
    var positionSubs = {
      fullGuard: ['rnc', 'triangleChoke', 'armbar', 'guillotine'],
      halfGuard: ['kimura', 'americana', 'rnc'],
      sideControl: ['americana', 'kimura'],
      mount: ['armbar', 'americana', 'rnc'],
      backControl: ['rnc', 'kimura', 'americana']
    };
    
    var allowed = positionSubs[position] || positionSubs.fullGuard;
    
    // Return only unlocked submissions that are valid for this position
    return allowed.filter(function(sub) {
      return unlockedSubs.indexOf(sub) !== -1;
    });
  },
  // Update stand up button based on ground state
  updateStandUpButton: function(scene) {
    var btn = document.getElementById('standup-btn');
    if (!btn) return;
    
    if (scene && scene.groundState && scene.groundState.active) {
      btn.style.display = '';
      // Position determines if can stand up
      var position = scene.groundState.position || 'fullGuard';
      // Can only stand up from full guard or half guard
      var canStandUp = (position === 'fullGuard' || position === 'halfGuard');
      btn.disabled = !canStandUp;
      btn.style.opacity = canStandUp ? '1' : '0.5';
    } else {
      btn.style.display = 'none';
    }
  },
  getBestSpecialMoveKey: function(scene) {
    if (!scene || !scene.player || !scene.player.unlockedMoves || !window.MMA || !MMA.Combat || !MMA.Combat.MOVE_ROSTER) return null;
    var roster = MMA.Combat.MOVE_ROSTER;
    var unlocked = scene.player.unlockedMoves;
    var skip = { jab:true, cross:true, takedown:true };
    if (unlocked.indexOf('spinningBackFist') !== -1) return 'spinningBackFist';
    var bestKey = null;
    var bestDamage = -1;
    for (var i = 0; i < unlocked.length; i++) {
      var key = unlocked[i];
      var m = roster[key];
      if (!m || skip[key]) continue;
      var dmg = typeof m.damage === 'number' ? m.damage : 0;
      if (dmg > bestDamage) {
        bestDamage = dmg;
        bestKey = key;
      }
    }
    return bestKey;
  },
  updateSpecialButton: function(scene, forceGround) {
    var btn = document.querySelector('.action-btn[data-action="special"]');
    if (!btn) return;
    var onGround = !!forceGround || !!(scene && scene.groundState && scene.groundState.active);
    if (onGround) {
      btn.style.display = '';
      btn.textContent = 'Stand Up';
      return;
    }
    var best = this.getBestSpecialMoveKey(scene);
    if (!best) {
      btn.style.display = 'none';
      return;
    }
    btn.style.display = '';
    var move = MMA.Combat.MOVE_ROSTER[best];
    btn.textContent = (move && move.name) ? move.name : 'Special';
  },
  bindMobilePauseButton: function(scene) {
    var btn = document.getElementById('mobile-pause-btn');
    if (!btn || btn._mmaBound) return;
    btn._mmaBound = true;
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      if (!scene || scene.gameOver || scene.roomTransitioning || scene.paused || scene.scene.isActive('PauseScene')) return;
      scene.registry.set('unlockedMoves', scene.player.unlockedMoves.slice());
      scene.registry.set('playerStats', Object.assign({}, scene.player.stats));
      scene.physics.pause();
      scene.paused = true;
      scene.scene.launch('PauseScene');
    });
  },
  setPauseButtonVisible: function(show) {
    var btn = document.getElementById('mobile-pause-btn');
    if (!btn) return;
    btn.style.display = show ? 'block' : 'none';
  },
  showTouchControls: function(show) {
    // Show/hide d-pad and action buttons (hidden on title screen, shown during gameplay)
    var isMobile = window.matchMedia && !window.matchMedia('(pointer: fine)').matches;
    if (!isMobile) return; // Don't show on desktop
    var dpad = document.getElementById('dpad');
    var ac = document.getElementById('action-cluster');
    if (dpad) dpad.style.display = show ? 'block' : 'none';
    if (ac) ac.style.display = show ? 'block' : 'none';
  },
  showGroundBanner: function(text) {
    var el = document.getElementById('ground-banner');
    if (!el) return;
    el.textContent = text || 'GROUND GAME';
    el.classList.add('active');
    setTimeout(function() { el.classList.remove('active'); }, 900);
  },
  updateGroundHUD: function(scene) {
    var overlay = document.getElementById('ground-overlay');
    var timerFill = document.getElementById('ground-timer-fill');
    var positionText = overlay ? overlay.querySelector('.position-text') : null;
    if (!overlay || !timerFill) return;
    var active = !!(scene.groundState && scene.groundState.active);
    overlay.style.display = active ? 'block' : 'none';
    if (active) {
      var pct = Math.max(0, Math.min(1, scene.groundState.timer / 10000));
      timerFill.style.width = (pct * 100) + '%';
      
      // Show position text
      if (positionText) {
        var position = scene.groundState.position || 'fullGuard';
        var positionLabels = {
          fullGuard: 'FULL GUARD',
          halfGuard: 'HALF GUARD',
          sideControl: 'SIDE CONTROL',
          mount: 'MOUNT',
          backControl: 'BACK CONTROL'
        };
        positionText.textContent = positionLabels[position] || 'GROUND';
        positionText.style.display = '';
      }
    } else if (positionText) {
      positionText.style.display = 'none';
    }
  },
  handleResponsiveLayout: function() {
    if (window.phaserGame && window.phaserGame.scale) window.phaserGame.scale.refresh();
    var landscape = window.innerWidth > window.innerHeight;
    var dpad = document.getElementById("dpad");
    var cluster = document.getElementById("action-cluster");
    var startBtn = document.getElementById("dom-start-btn");
    var pauseBtn = document.getElementById("mobile-pause-btn");
    if (!dpad || !cluster) return;
    var minDim = Math.min(window.innerWidth, window.innerHeight);
    var maxDim = Math.max(window.innerWidth, window.innerHeight);
    var dpadSize = landscape ? Math.min(100, minDim * 0.15) : Math.min(90, minDim * 0.22);
    var dpadBtnSize = Math.floor(dpadSize * 0.38); var dpadBtnFont = Math.floor(dpadSize * 0.18);
    var clusterWidth = landscape ? Math.min(150, maxDim * 0.18) : Math.min(140, minDim * 0.35);
    var clusterHeight = landscape ? Math.min(130, minDim * 0.2) : Math.min(120, minDim * 0.3);
    var actionBtnWidth = Math.floor(clusterWidth * 0.4); var actionBtnHeight = Math.floor(clusterHeight * 0.32); var actionBtnFont = Math.floor(actionBtnHeight * 0.35);
    dpad.style.width = dpadSize + "px"; dpad.style.height = dpadSize + "px"; dpad.style.left = landscape ? "2vw" : "2.5vw"; dpad.style.bottom = landscape ? "1vh" : "2vh";
    dpad.querySelectorAll(".dpad-btn").forEach(function(btn){ btn.style.width = dpadBtnSize + "px"; btn.style.height = dpadBtnSize + "px"; btn.style.fontSize = dpadBtnFont + "px"; btn.style.lineHeight = dpadBtnSize + "px"; });
    var up = dpad.querySelector(".dpad-up"), down = dpad.querySelector(".dpad-down"), left = dpad.querySelector(".dpad-left"), right = dpad.querySelector(".dpad-right");
    var c = dpadSize / 2, off = (dpadSize - dpadBtnSize) / 2;
    if (up) { up.style.left = c - dpadBtnSize / 2 + "px"; up.style.top = off + "px"; }
    if (down) { down.style.left = c - dpadBtnSize / 2 + "px"; down.style.bottom = off + "px"; }
    if (left) { left.style.left = off + "px"; left.style.top = c - dpadBtnSize / 2 + "px"; }
    if (right) { right.style.right = off + "px"; right.style.top = c - dpadBtnSize / 2 + "px"; }
    cluster.style.width = clusterWidth + "px"; cluster.style.height = clusterHeight + "px"; cluster.style.right = landscape ? "2vw" : "2.5vw"; cluster.style.bottom = landscape ? "1vh" : "2.5vh";
    cluster.querySelectorAll(".action-btn").forEach(function(btn){ btn.style.width = actionBtnWidth + "px"; btn.style.height = actionBtnHeight + "px"; btn.style.fontSize = actionBtnFont + "px"; btn.style.lineHeight = actionBtnHeight + "px"; });
    var jab = cluster.querySelector("[data-action=\"jab\"]"); var heavy = cluster.querySelector("[data-action=\"heavy\"]"); var grapple = cluster.querySelector("[data-action=\"grapple\"]"); var special = cluster.querySelector("[data-action=\"special\"]");
    var hOffset = (clusterWidth - actionBtnWidth) / 2;
    var topPad = 4;
    var sidePad = 2;
    var midY = Math.round((clusterHeight - actionBtnHeight) / 2);
    if (jab) { jab.style.left = hOffset + "px"; jab.style.top = topPad + "px"; }
    if (heavy) { heavy.style.right = sidePad + "px"; heavy.style.top = midY + "px"; }
    if (grapple) { grapple.style.left = sidePad + "px"; grapple.style.top = midY + "px"; }
    if (special) { special.style.left = hOffset + "px"; special.style.bottom = topPad + "px"; }
    if (startBtn) { startBtn.style.bottom = landscape ? "6%" : "9%"; var fs = Math.min(20, Math.floor(minDim * 0.04)); startBtn.style.fontSize = fs + "px"; startBtn.style.padding = (fs * 0.8) + "px " + (fs * 1.7) + "px"; }
    if (pauseBtn) { var pSize = Math.max(34, Math.floor(minDim * 0.07)); pauseBtn.style.width = pSize + "px"; pauseBtn.style.height = pSize + "px"; pauseBtn.style.lineHeight = pSize + "px"; pauseBtn.style.fontSize = Math.max(16, Math.floor(pSize * 0.52)) + "px"; }
  }
};

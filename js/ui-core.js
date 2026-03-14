window.MMA = window.MMA || {};
window.MMA.UI = window.MMA.UI || {};

Object.assign(window.MMA.UI, {
  cooldowns: {
    jab: { remaining: 0, total: 0 },
    heavy: { remaining: 0, total: 0 },
    grapple: { remaining: 0, total: 0 },
    special: { remaining: 0, total: 0 }
  },
  // Fight stats tracking,
  _domCache: {
    actionButtons: {},
    standupBtn: null,
    mobilePauseBtn: null
  },
  getActionButton: function(action) {
    if (!action) return null;
    var btn = this._domCache.actionButtons[action];
    if (!btn || !btn.isConnected) {
      btn = document.querySelector('.action-btn[data-action="' + action + '"]');
      this._domCache.actionButtons[action] = btn || null;
    }
    return btn;
  },
  getStandUpButton: function() {
    var btn = this._domCache.standupBtn;
    if (!btn || !btn.isConnected) {
      btn = document.getElementById('standup-btn');
      this._domCache.standupBtn = btn || null;
    }
    return btn;
  },
  getMobilePauseButton: function() {
    var btn = this._domCache.mobilePauseBtn;
    if (!btn || !btn.isConnected) {
      btn = document.getElementById('mobile-pause-btn');
      this._domCache.mobilePauseBtn = btn || null;
    }
    return btn;
  },
  staminaWarning: {
    active: false,
    container: null,
    scene: null,
    shown: false
  },
  // Health Pulse Warning - red vignette when HP < 25%,
  healthPulse: {
    active: false,
    overlay: null,
    currentHpPercent: 100,
    scene: null,
    intervalId: null
  },
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
  // Health Pulse Warning - activates when HP < 25%,
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
  // Save legacy records and move stats to localStorage,
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
    var btn = this.getActionButton(action);
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
  // Settings Menu,
  updateHUDRegistry: function(scene) {
    scene.registry.set('playerStats', {
      hp: Math.round(scene.player.stats.hp),
      maxHp: scene.player.stats.maxHp,
      stamina: Math.round(scene.player.stats.stamina),
      maxStamina: scene.player.stats.maxStamina,
      xp: scene.player.stats.xp,
      level: scene.player.stats.level,
      strikingLevel: scene.player.stats.strikingLevel,
      grapplingLevel: scene.player.stats.grapplingLevel,
      submissionLevel: scene.player.stats.submissionLevel,
      strikingXP: scene.player.stats.strikingXP,
      grapplingXP: scene.player.stats.grapplingXP,
      submissionXP: scene.player.stats.submissionXP
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
        var btn = window.MMA.UI.getActionButton(action);
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
        var btn = window.MMA.UI.getActionButton(action);
        if (btn && move) {
          btn.textContent = move.name;
        } else if (btn) {
          btn.textContent = action === 'jab' ? 'Jab' : (action === 'heavy' ? 'Heavy' : (action === 'grapple' ? 'Grapple' : 'Special'));
        }
      });
    }
    this.updateSpecialButton(scene || null, !!groundActive);
  },
  // Get submissions available for a given ground position,
  getSubmissionsForPosition: function(position, scene) {
    var unlockedSubs = [];
    if (scene && scene.player && scene.player.unlockedSubmissions) {
      unlockedSubs = scene.player.unlockedSubmissions;
    } else {
      unlockedSubs = ['rnc']; // default
    }
    
    // Position-based submission availability
    var positionSubs = {
      fullGuard: ['triangleChoke', 'armbar'],
      halfGuard: ['kimura', 'americana'],
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
  // Update stand up button based on ground state,
  updateStandUpButton: function(scene) {
    var btn = this.getStandUpButton();
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
    var btn = this.getActionButton('special');
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
    var btn = this.getMobilePauseButton();
    if (!btn) return;
    btn._mmaScene = scene;
    if (btn._mmaBound) return;
    btn._mmaBound = true;
    btn.addEventListener('click', function(e) {
      var activeScene = btn._mmaScene;
      e.preventDefault();
      if (!activeScene || !activeScene.scene || !activeScene.scene.isActive || !activeScene.scene.isActive()) return;
      if (activeScene.gameOver || activeScene.roomTransitioning || activeScene.paused || activeScene.scene.isActive('PauseScene')) return;
      activeScene.registry.set('unlockedMoves', activeScene.player.unlockedMoves.slice());
      activeScene.registry.set('playerStats', Object.assign({}, activeScene.player.stats));
      activeScene.physics.pause();
      activeScene.paused = true;
      activeScene.scene.launch('PauseScene');
    });
  },
  setPauseButtonVisible: function(show) {
    var btn = this.getMobilePauseButton();
    if (!btn) return;
    btn.style.display = show ? 'block' : 'none';
  },
  showGroundBanner: function(text) {
    var el = document.getElementById('ground-banner');
    if (!el) return;
    el.textContent = text || 'GROUND GAME';
    el.classList.add('active');
    setTimeout(function() { el.classList.remove('active'); }, 900);
  },
  updateGroundHUD: function(scene) {
    if (!this._groundHUDRefs || !this._groundHUDRefs.overlay || !this._groundHUDRefs.overlay.isConnected || !this._groundHUDRefs.timerFill || !this._groundHUDRefs.timerFill.isConnected) {
      var overlay = document.getElementById('ground-overlay');
      this._groundHUDRefs = {
        overlay: overlay || null,
        timerFill: document.getElementById('ground-timer-fill'),
        positionText: overlay ? overlay.querySelector('.position-text') : null
      };
    }
    var refs = this._groundHUDRefs;
    if (!refs.overlay || !refs.timerFill) return;
    var active = !!(scene.groundState && scene.groundState.active);
    refs.overlay.style.display = active ? 'block' : 'none';
    if (active) {
      var pct = Math.max(0, Math.min(1, scene.groundState.timer / 10000));
      refs.timerFill.style.width = (pct * 100) + '%';
      
      // Show position text
      if (refs.positionText) {
        var position = scene.groundState.position || 'fullGuard';
        var positionLabels = {
          fullGuard: 'FULL GUARD',
          halfGuard: 'HALF GUARD',
          sideControl: 'SIDE CONTROL',
          mount: 'MOUNT',
          backControl: 'BACK CONTROL'
        };
        refs.positionText.textContent = positionLabels[position] || 'GROUND';
        refs.positionText.style.display = '';
      }
    } else if (refs.positionText) {
      refs.positionText.style.display = 'none';
    }
  },
  showTouchControls: function(show) {
    var isMobile = window.matchMedia && !window.matchMedia('(pointer: fine)').matches;
    if (!isMobile) return;
    var dpad = document.getElementById('dpad');
    var ac = document.getElementById('action-cluster');
    if (dpad) dpad.style.display = show ? 'block' : 'none';
    if (ac) ac.style.display = show ? 'block' : 'none';
  }
});

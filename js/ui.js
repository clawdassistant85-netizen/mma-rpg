/**
 * MMA RPG UI Module - Hype Meter
 * Visual bar showing crowd engagement that fills with combos and drains over time
 * Feature from FEATURE_BACKLOG.md (UI section)
 */

(function() {
  'use strict';

  // Hype Meter state
  var hypeMeter = {
    current: 0,
    max: 100,
    visible: false,
    decayTimer: null,
    decayRate: 2, // per second
    decayInterval: 1000, // ms
    // Combo thresholds for hype gain
    comboThresholds: [
      { hits: 3, gain: 10 },
      { hits: 5, gain: 15 },
      { hits: 10, gain: 25 },
      { hits: 15, gain: 40 },
      { hits: 20, gain: 60 }
    ],
    // DOM elements
    container: null,
    barFill: null
  };

  // Initialize Hype Meter DOM
  function _initHypeMeter() {
    hypeMeter.container = document.getElementById('hype-meter');
    if (hypeMeter.container) {
      hypeMeter.barFill = hypeMeter.container.querySelector('.hype-bar-fill');
    }
  }

  // Show/hide hype meter
  function _showHypeMeter() {
    if (!hypeMeter.container) _initHypeMeter();
    if (hypeMeter.container && !hypeMeter.visible) {
      hypeMeter.container.classList.add('visible');
      hypeMeter.visible = true;
    }
  }

  function _hideHypeMeter() {
    if (hypeMeter.container && hypeMeter.visible) {
      hypeMeter.container.classList.remove('visible');
      hypeMeter.visible = false;
    }
  }

  // Update hype meter display
  function _updateHypeDisplay() {
    if (!hypeMeter.barFill) return;
    var percent = (hypeMeter.current / hypeMeter.max) * 100;
    hypeMeter.barFill.style.width = percent + '%';
    
    // Add charged effect at high hype
    if (percent >= 75) {
      hypeMeter.barFill.classList.add('charged');
    } else {
      hypeMeter.barFill.classList.remove('charged');
    }
  }

  // Add hype (called on combo hits)
  function _addHype(comboCount) {
    _showHypeMeter();
    
    // Find the appropriate hype gain for this combo count
    var gain = 5; // default small gain
    for (var i = hypeMeter.comboThresholds.length - 1; i >= 0; i--) {
      if (comboCount >= hypeMeter.comboThresholds[i].hits) {
        gain = hypeMeter.comboThresholds[i].gain;
        break;
      }
    }
    
    hypeMeter.current = Math.min(hypeMeter.max, hypeMeter.current + gain);
    _updateHypeDisplay();
    
    // Restart decay timer
    _restartDecay();
  }

  // Start decay timer
  function _startDecay() {
    if (hypeMeter.decayTimer) return;
    hypeMeter.decayTimer = setInterval(function() {
      if (hypeMeter.current > 0) {
        hypeMeter.current = Math.max(0, hypeMeter.current - hypeMeter.decayRate);
        _updateHypeDisplay();
      } else {
        _stopDecay();
        _hideHypeMeter();
      }
    }, hypeMeter.decayInterval);
  }

  function _stopDecay() {
    if (hypeMeter.decayTimer) {
      clearInterval(hypeMeter.decayTimer);
      hypeMeter.decayTimer = null;
    }
  }

  function _restartDecay() {
    _stopDecay();
    _startDecay();
  }

  // Get current hype level (for damage bonus calculation)
  function _getHypeBonus() {
    // 0-25% hype = 0% bonus
    // 25-50% = +5% damage
    // 50-75% = +10% damage
    // 75-100% = +15% damage
    var percent = (hypeMeter.current / hypeMeter.max) * 100;
    if (percent >= 75) return 0.15;
    if (percent >= 50) return 0.10;
    if (percent >= 25) return 0.05;
    return 0;
  }

  // Reset hype meter (between rooms/fights)
  function _resetHype() {
    hypeMeter.current = 0;
    _stopDecay();
    _updateHypeDisplay();
    _hideHypeMeter();
  }

  // Get hype percentage
  function _getHypePercent() {
    return hypeMeter.current;
  }

  // Expose to window.MMA.UI
  if (typeof window.MMA !== 'undefined' && window.MMA.UI) {
    window.MMA.UI.hypeMeter = {
      addHype: _addHype,
      getBonus: _getHypeBonus,
      getPercent: _getHypePercent,
      reset: _resetHype,
      show: _showHypeMeter,
      hide: _hideHypeMeter
    };
  }

  // Also expose globally for direct access
  window.MMA_HYPE = {
    addHype: _addHype,
    getBonus: _getHypeBonus,
    getPercent: _getHypePercent,
    reset: _resetHype
  };

})();

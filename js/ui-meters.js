window.MMA = window.MMA || {};
window.MMA.UI = window.MMA.UI || {};

Object.assign(window.MMA.UI, {
  comboCounter: {
    container: null,
    text: null,
    visible: false
  },
  // Hype meter for crowd engagement,
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
  // Hype meter methods,
  hypeMeter: {
    value: 0,
    maxValue: 100,
    container: null,
    bar: null,
    label: null
  },
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

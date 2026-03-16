window.MMA = window.MMA || {};
window.MMA.UI = window.MMA.UI || {};

Object.assign(window.MMA.UI, {
  settings: {
    difficulty: 'normal',
    soundVolume: 0.8,
    musicVolume: 0.6,
    showHud: true,
    showInputDisplay: false,
    vibration: true
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
    MMA.UI.showEquityInSettings();
    MMA.UI.showDiaryInSettings();
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
  }
});

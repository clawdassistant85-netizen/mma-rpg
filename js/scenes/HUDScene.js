var HUDScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function HUDScene() {
    Phaser.Scene.call(this, { key: 'HUDScene' });
  },
  create: function() {
    // Background bar backing
    this.add.rectangle(110, 16, 204, 14, 0x333333).setOrigin(0.5);
    this.add.rectangle(110, 34, 204, 14, 0x333333).setOrigin(0.5);
    // HP bar
    this.hpBar = this.add.rectangle(9, 9, 200, 12, 0xe83030).setOrigin(0);
    this.add.text(8, 8, 'HP', { fontSize:'10px', color:'#ffffff' }).setDepth(10);
    // Stamina bar
    this.staBar = this.add.rectangle(9, 27, 200, 12, 0x30a8e8).setOrigin(0);
    this.add.text(8, 26, 'STA', { fontSize:'10px', color:'#ffffff' }).setDepth(10);
    // XP / Level text
    this.xpText = this.add.text(CONFIG.CANVAS_W - 8, 8, 'LVL 1 | XP 0/100', {
      fontSize: '13px', color: '#e8c830'
    }).setOrigin(1, 0);
    // Style levels display
    this.styleText = this.add.text(CONFIG.CANVAS_W - 8, 24, 'STR 1 | GRA 1 | SUB 1', {
      fontSize: '10px', color: '#aaaaaa'
    }).setOrigin(1, 0);
    // Style gauge labels
    this._strikerLabel = this.add.text(10, 50, 'STR: 0', {
      fontSize: '11px', fontFamily: 'Arial', color: '#ff6666'
    }).setDepth(10).setScrollFactor(0);
    this._grapplerLabel = this.add.text(10, 64, 'GRP: 0', {
      fontSize: '11px', fontFamily: 'Arial', color: '#6688ff'
    }).setDepth(10).setScrollFactor(0);
    // Controls hint
    this.add.text(CONFIG.CANVAS_W/2, CONFIG.CANVAS_H - 20,
      'WASD: Move | J: Jab | K: Cross | L: Take | U: Hook | N: LowKick | O: Uppercut | P: Body',
      { fontSize:'9px', color:'#888888' }).setOrigin(0.5, 1);
    this.add.text(CONFIG.CANVAS_W/2, CONFIG.CANVAS_H - 8,
      'SPACE: Head Kick | G: Guillotine',
      { fontSize:'9px', color:'#888888' }).setOrigin(0.5, 1);
    // Message text (center screen)
    this.msgText = this.add.text(CONFIG.CANVAS_W/2, CONFIG.CANVAS_H/2, '', {
      fontSize:'32px', color:'#ffffff', stroke:'#000000', strokeThickness:4
    }).setOrigin(0.5).setDepth(20);
  },
  update: function() {
    var stats = this.registry.get('playerStats');
    if (stats) {
      this.hpBar.width  = Math.max(0, (stats.hp  / stats.maxHp)  * 200);
      this.staBar.width = Math.max(0, (stats.stamina / stats.maxStamina) * 200);
      this.xpText.setText('LVL ' + stats.level + ' | XP ' + stats.xp + '/' + (stats.level * 100));
      // Show style levels
      var strLvl = stats.strikingLevel || 1;
      var graLvl = stats.grapplingLevel || 1;
      var subLvl = stats.submissionLevel || 1;
      this.styleText.setText('STR ' + strLvl + ' | GRA ' + graLvl + ' | SUB ' + subLvl);
      var msg = this.registry.get('gameMessage') || '';
      this.msgText.setText(msg);
    }

    if (this._strikerLabel && this._grapplerLabel) {
      var gs = this.scene.get('GameScene');
      if (gs && gs.player && gs.player.styleGauge) {
        this._strikerLabel.setText('STR: ' + Math.round(gs.player.styleGauge.striking));
        this._grapplerLabel.setText('GRP: ' + Math.round(gs.player.styleGauge.grappling));
      }
    }
  }
});

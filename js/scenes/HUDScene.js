var HUDScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function HUDScene() {
    Phaser.Scene.call(this, { key: 'HUDScene' });
  },
  create: function() {
    var isMobile = typeof window !== 'undefined' && window.matchMedia && !window.matchMedia('(pointer: fine)').matches;
    var ms = isMobile ? 2.0 : 1.0; // mobile scale multiplier
    // Background bar backing
    this.add.rectangle(110, isMobile ? 22 : 16, 204, 14, 0x333333).setOrigin(0.5);
    this.add.rectangle(110, isMobile ? 40 : 34, 204, 14, 0x333333).setOrigin(0.5);
    // HP bar
    this.hpBar = this.add.rectangle(9, isMobile ? 15 : 9, 200, 12, 0xe83030).setOrigin(0);
    this.add.text(8, isMobile ? 14 : 8, 'HP', { fontSize:(10 * ms) + 'px', color:'#ffffff' }).setDepth(10);
    // Stamina bar
    this.staBar = this.add.rectangle(9, isMobile ? 33 : 27, 200, 12, 0x30a8e8).setOrigin(0);
    this.add.text(8, isMobile ? 32 : 26, 'STA', { fontSize:(10 * ms) + 'px', color:'#ffffff' }).setDepth(10);
    // XP / Level text
    this.xpText = this.add.text(CONFIG.CANVAS_W - 8, isMobile ? 14 : 8, 'LVL 1 | XP 0/100', {
      fontSize: (13 * ms) + 'px', color: '#e8c830'
    }).setOrigin(1, 0);
    // Style levels display
    this.styleText = this.add.text(CONFIG.CANVAS_W - 8, isMobile ? 30 : 24, 'STR 1 | GRA 1 | SUB 1', {
      fontSize: (10 * ms) + 'px', color: '#aaaaaa'
    }).setOrigin(1, 0);
    // Controls hint
    var hint1 = this.add.text(CONFIG.CANVAS_W/2, CONFIG.CANVAS_H - 20,
      'WASD: Move | J: Jab | K: Cross | L: Take | U: Hook | N: LowKick | O: Uppercut | P: Body',
      { fontSize:'9px', color:'#888888' }).setOrigin(0.5, 1);
    hint1.setVisible(!isMobile);
    var hint2 = this.add.text(CONFIG.CANVAS_W/2, CONFIG.CANVAS_H - 8,
      'SPACE: Head Kick | G: Guillotine',
      { fontSize:'9px', color:'#888888' }).setOrigin(0.5, 1);
    hint2.setVisible(!isMobile);
    // Message text (center screen)
    this.msgText = this.add.text(CONFIG.CANVAS_W/2, CONFIG.CANVAS_H/2, '', {
      fontSize:'32px', color:'#ffffff', stroke:'#000000', strokeThickness:4
    }).setOrigin(0.5).setDepth(20);
  },
  update: function() {
    var stats = this.registry.get('playerStats');
    if (!stats) return;
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
});

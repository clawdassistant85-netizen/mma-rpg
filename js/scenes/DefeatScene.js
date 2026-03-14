var DefeatScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function DefeatScene() {
    Phaser.Scene.call(this, { key: 'DefeatScene' });
  },

  stopActiveAudio: function() {
    if (!window.MMA_AUDIO) return;
    if (window.MMA_AUDIO.ambient && typeof window.MMA_AUDIO.ambient.stop === 'function') window.MMA_AUDIO.ambient.stop();
    if (window.MMA_AUDIO.bgm && typeof window.MMA_AUDIO.bgm.stop === 'function') window.MMA_AUDIO.bgm.stop(0);
    else if (typeof window.MMA_AUDIO.stopBGM === 'function') window.MMA_AUDIO.stopBGM(0);
  },

  formatPlayTime: function(totalSeconds) {
    var seconds = Math.max(0, Math.floor(totalSeconds || 0));
    var minutes = Math.floor(seconds / 60);
    return minutes + 'm ' + (seconds % 60) + 's';
  },

  animateStats: function(targets) {
    var self = this;
    var ticks = 20;
    var currentTick = 0;

    this.time.addEvent({
      delay: 50,
      repeat: ticks - 1,
      callback: function() {
        currentTick += 1;
        var progress = currentTick / ticks;
        var enemiesValue = Math.round(targets.enemiesDefeated * progress);
        var timeValue = Math.round(targets.playTime * progress);
        self.enemiesStatText.setText('Enemies Defeated: ' + enemiesValue);
        self.timeStatText.setText('Time: ' + self.formatPlayTime(timeValue));
        if (self.xpStatText) self.xpStatText.setText('XP Earned: ' + Math.round(targets.xpGained * progress));
      }
    });
  },

  create: function () {
    var centerX = this.cameras.main.width / 2;
    var centerY = this.cameras.main.height / 2;
    var enemiesDefeated = this.registry.get('enemiesDefeated') || 0;
    var playTime = this.registry.get('playTime') || 0;
    var xpGained = this.registry.get('xpGained') || 0;
    var restartBtn = document.getElementById('dom-restart-btn');

    if (restartBtn) restartBtn.style.display = 'none';

    this.stopActiveAudio();
    if (window.sfx && window.sfx.jingles && typeof window.sfx.jingles.defeat === 'function') {
      window.sfx.jingles.defeat();
    }

    var bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.85);
    bg.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    bg.fillStyle(0xff3333, 0.08);
    bg.fillCircle(centerX, centerY - 120, 170);

    var defeatText = this.add.text(centerX, centerY - 140, 'DEFEATED', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '64px',
      color: '#ff3333',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setDepth(15);

    this.tweens.add({
      targets: defeatText,
      scale: { from: 0.5, to: 1 },
      duration: 500,
      ease: 'Back.easeOut'
    });

    this.enemiesStatText = this.add.text(centerX, centerY - 12, 'Enemies Defeated: 0', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#cccccc',
      align: 'center'
    }).setOrigin(0.5).setDepth(15);
    this.timeStatText = this.add.text(centerX, centerY + 18, 'Time: 0m 0s', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#cccccc',
      align: 'center'
    }).setOrigin(0.5).setDepth(15);
    this.xpStatText = null;
    if (xpGained > 0) {
      this.xpStatText = this.add.text(centerX, centerY + 48, 'XP Earned: 0', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        color: '#cccccc',
        align: 'center'
      }).setOrigin(0.5).setDepth(15);
    }

    this.animateStats({
      enemiesDefeated: enemiesDefeated,
      playTime: playTime,
      xpGained: xpGained
    });

    this.retryBtn = this.add.text(centerX, centerY + 120, '[ RETRY ]', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '28px',
      color: '#ff6666'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(15);

    this.retryBtn.on('pointerover', function () { this.retryBtn.setColor('#ff9999'); }, this);
    this.retryBtn.on('pointerout', function () { this.retryBtn.setColor('#ff6666'); }, this);
    this.retryBtn.on('pointerdown', this.retryGame, this);

    this.titleBtn = this.add.text(centerX, centerY + 170, '[ TITLE ]', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#888888'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(15);

    this.titleBtn.on('pointerover', function () { this.titleBtn.setColor('#aaaaaa'); }, this);
    this.titleBtn.on('pointerout', function () { this.titleBtn.setColor('#888888'); }, this);
    this.titleBtn.on('pointerdown', this.returnToTitle, this);

    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  },

  update: function () {
    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.retryGame();
    }
  },

  retryGame: function() {
    if (window.sfx && window.sfx.ui && typeof window.sfx.ui.confirm === 'function') window.sfx.ui.confirm();
    if (typeof clearSaveGame === 'function') clearSaveGame();
    this.stopActiveAudio();
    if (this.scene.isActive('HUDScene')) this.scene.stop('HUDScene');
    this.scene.stop('DefeatScene');
    this.scene.stop('GameScene');
    this.scene.start('GameScene');
  },

  returnToTitle: function() {
    if (window.sfx && window.sfx.ui && typeof window.sfx.ui.back === 'function') window.sfx.ui.back();
    if (typeof clearSaveGame === 'function') clearSaveGame();
    this.stopActiveAudio();
    if (this.scene.isActive('HUDScene')) this.scene.stop('HUDScene');
    this.scene.stop('DefeatScene');
    this.scene.stop('GameScene');
    this.scene.start('TitleScene');
  }
});

var VictoryScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function VictoryScene() {
    Phaser.Scene.call(this, { key: 'VictoryScene' });
  },

  create: function () {
    var centerX = this.cameras.main.width / 2;
    var centerY = this.cameras.main.height / 2;
    var fightStats = this.registry.get('fightStats') || {};
    var xpGained = this.registry.get('xpGained') || 0;
    var lastEnemy = this.registry.get('lastEnemyDefeated') || 'Champion';

    if (window.MMA_AUDIO) {
      if (window.MMA_AUDIO.ambient && typeof window.MMA_AUDIO.ambient.stop === 'function') window.MMA_AUDIO.ambient.stop();
      if (typeof window.MMA_AUDIO.stopBGM === 'function') window.MMA_AUDIO.stopBGM(220);
    }
    if (window.sfx && window.sfx.jingles && typeof window.sfx.jingles.victory === 'function') {
      window.sfx.jingles.victory();
    }

    var bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.8);
    bg.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    bg.fillStyle(0xffc400, 0.08);
    bg.fillCircle(centerX, centerY - 120, 180);

    var victoryText = this.add.text(centerX, centerY - 150, 'YOU WIN!', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '64px',
      color: '#ffffff',
      stroke: '#e83030',
      strokeThickness: 6
    }).setOrigin(0.5);
    this.tweens.add({
      targets: victoryText,
      scale: { from: 0.55, to: 1.02 },
      duration: 520,
      ease: 'Back.easeOut'
    });
    this.tweens.add({
      targets: victoryText,
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.add.text(centerX, centerY - 80, 'MMA CHAMPION', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '32px',
      color: '#e8c830'
    }).setOrigin(0.5);

    var stats = this.registry.get('playerStats') || {};
    var xp = stats.xp || 0;
    var level = stats.level || 1;
    var enemiesDefeated = this.registry.get('enemiesDefeated') || 0;
    var playTime = this.registry.get('playTime') || 0;
    var minutes = Math.floor(playTime / 60);
    var seconds = Math.floor(playTime % 60);
    var timeStr = minutes + 'm ' + seconds + 's';

    var summary = [
      'Level: ' + level,
      'Total XP: ' + xp,
      'Enemies Defeated: ' + enemiesDefeated,
      'Longest Combo: ' + (fightStats.longestCombo || 0),
      'Time: ' + timeStr,
      'Final Opponent: ' + lastEnemy
    ].join('\n');
    this.add.text(centerX, centerY, summary, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    var xpText = this.add.text(centerX, centerY + 118, '+0 XP', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '36px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    this.tweens.addCounter({
      from: 0,
      to: xpGained,
      duration: 1400,
      onUpdate: function(tween) {
        xpText.setText('+' + Math.round(tween.getValue()) + ' XP');
      }
    });

    this.instr = this.add.text(centerX, centerY + 168, 'TAP or press ENTER to return to title', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#dddddd'
    }).setOrigin(0.5);
    this.tweens.add({
      targets: this.instr,
      alpha: { from: 1, to: 0.2 },
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.input.on('pointerdown', this.returnToTitle, this);
  },

  update: function () {
    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.returnToTitle();
    }
  },

  returnToTitle: function() {
    if (window.sfx && window.sfx.ui && typeof window.sfx.ui.confirm === 'function') window.sfx.ui.confirm();
    if (typeof clearSaveGame === 'function') {
      clearSaveGame();
    }
    this.scene.stop('VictoryScene');
    this.scene.start('TitleScene');
  }
});

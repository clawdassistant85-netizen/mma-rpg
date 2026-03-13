var VictoryScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function VictoryScene() {
    Phaser.Scene.call(this, { key: 'VictoryScene' });
  },

  create: function () {
    var centerX = this.cameras.main.width / 2;
    var centerY = this.cameras.main.height / 2;
    // Background
    var bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.8);
    bg.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

    // Title
    this.add.text(centerX, centerY - 140, 'YOU WIN!', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '64px',
      color: '#ffffff',
      stroke: '#e83030',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(centerX, centerY - 80, 'MMA CHAMPION', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '32px',
      color: '#e8c830'
    }).setOrigin(0.5);

    // Stats summary – pull from registry (fallbacks if missing)
    var stats = this.registry.get('playerStats') || {};
    var xp = stats.xp || 0;
    var level = stats.level || 1;
    var enemiesDefeated = this.registry.get('enemiesDefeated') || 0;
    var playTime = this.registry.get('playTime') || 0; // seconds
    var minutes = Math.floor(playTime / 60);
    var seconds = Math.floor(playTime % 60);
    var timeStr = minutes + 'm ' + seconds + 's';

    var summary = 'XP: ' + xp + '\nLevel: ' + level + '\nEnemies Defeated: ' + enemiesDefeated + '\nTime: ' + timeStr;
    this.add.text(centerX, centerY, summary, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // Instruction
    this.instr = this.add.text(centerX, centerY + 140, 'Press ENTER to return to title', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#dddddd'
    }).setOrigin(0.5);
    this.tweens.add({
      targets: this.instr,
      alpha: { from: 1, to: 0.2 },
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // Input
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  },

  update: function () {
    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      // Clear save so the next run starts fresh
      if (typeof clearSaveGame === 'function') {
        clearSaveGame();
      }

      // Stop VictoryScene and go back to TitleScene
      this.scene.stop('VictoryScene');
      this.scene.start('TitleScene');
    }
  }
});
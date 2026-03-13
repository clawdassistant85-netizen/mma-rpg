window.TitleScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function TitleScene() {
    Phaser.Scene.call(this, { key: 'TitleScene' });
  },

  create: function () {
    var centerX = this.cameras.main.width / 2;
    var centerY = this.cameras.main.height / 2;

    // Simple starfield-style background using graphics
    var g = this.add.graphics();
    g.fillStyle(0x050509, 1);
    g.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

    // Scatter a few "stars"
    g.fillStyle(0x444477, 1);
    for (var i = 0; i < 80; i++) {
      var x = Phaser.Math.Between(0, this.cameras.main.width);
      var y = Phaser.Math.Between(0, this.cameras.main.height);
      var size = Phaser.Math.Between(1, 2);
      g.fillRect(x, y, size, size);
    }

    // Game title
    this.add.text(centerX, centerY - 120, 'MMA RPG', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '48px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Subtitle / flavor text
    this.add.text(centerX, centerY - 60, 'Street. Gym. Octagon.', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#e8c830'
    }).setOrigin(0.5);

    // Blinking prompt text (updated below depending on save state)
    this.pressText = this.add.text(centerX, centerY + 10, 'TAP OR PRESS ENTER TO START', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: this.pressText,
      alpha: { from: 1, to: 0.2 },
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    // Controls legend
    var controlsText = [
      'Controls:',
      'WASD – move',
      'J / K – light / heavy strike',
      'L – takedown & grapples',
      'SPACE – special move',
      'I – move list / pause',
      'ESC – quick pause'
    ].join('\n');

    this.add.text(centerX, centerY + 80, controlsText, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#dddddd',
      align: 'center'
    }).setOrigin(0.5, 0);

    // Input: ENTER or tap to start game
    this.input.on('pointerdown', () => {
      if (!this.hasSave) {
        this.scene.start('BootScene');
      } else if (this.hasSave && this.pressText.text.startsWith('CONTINUE')) {
        // ignore tap, wait for Y/N
      }
    });
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    // Continue prompt keys
    this.yKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Y);
    this.nKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N);

    // Check for saved game
    this.hasSave = false;
    if (typeof hasSaveGame === 'function') {
      this.hasSave = hasSaveGame();
    } else if (typeof loadGame === 'function') {
      this.hasSave = !!loadGame();
    }

    if (this.hasSave) {
      this.pressText.setText('CONTINUE? (Y/N)');
    }
  },

  update: function () {
    // If no save exists, ENTER starts a fresh game
    if (!this.hasSave && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.scene.start('BootScene');
      return;
    }

    // When a save exists, ask for explicit Y/N
    if (this.hasSave) {
      if (Phaser.Input.Keyboard.JustDown(this.yKey)) {
        // Continue from save; GameScene will load from localStorage
        this.scene.start('BootScene');
        return;
      }
      if (Phaser.Input.Keyboard.JustDown(this.nKey)) {
        // Clear save and start new game
        if (typeof clearSaveGame === 'function') {
          clearSaveGame();
        } else if (typeof window !== 'undefined' && window.localStorage) {
          try { window.localStorage.removeItem('mma-rpg-save'); } catch (e) {}
        }
        this.hasSave = false;
        this.pressText.setText('PRESS ENTER TO START');
        this.scene.start('BootScene');
        return;
      }
    }
  }
});

var UnlockScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function UnlockScene() {
    Phaser.Scene.call(this, { key: 'UnlockScene' });
  },

  init: function(data) {
    // data.moveKey passed from GameScene
    this.moveKey = data.moveKey || null;
  },

  create: function() {
    var self = this;
    var DT = CONFIG.DISPLAY_TILE;
    var centerX = this.cameras.main.width / 2;
    var centerY = this.cameras.main.height / 2;

    // Background overlay semi-transparent
    var bg = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.6)
      .setOrigin(0, 0);

    // Title
    this.add.text(centerX, centerY - 80, 'NEW MOVE!', {
      fontSize: '48px',
      color: '#ffdd33',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    var moveInfo = MOVE_ROSTER[this.moveKey];
    var moveName = moveInfo ? moveInfo.name || this.moveKey : this.moveKey;
    var details = moveInfo ? ('Damage: ' + moveInfo.damage + '\nStamina: ' + moveInfo.staminaCost) : '';

    this.add.text(centerX, centerY, moveName, {
      fontSize: '36px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.add.text(centerX, centerY + 60, details, {
      fontSize: '24px',
      color: '#dddddd',
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(centerX, centerY + 130, 'TAP or press ENTER to continue', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    var dismiss = function() {
      self.scene.stop('UnlockScene');
      var gameScene = self.scene.get('GameScene');
      if (gameScene) {
        gameScene.scene.resume();
        gameScene.physics.resume();
        gameScene.paused = false;
      }
    };
    this.input.on('pointerdown', dismiss);

    // Auto close after 3 seconds
    this.time.delayedCall(3000, function() {
      // Stop UnlockScene and resume GameScene
      dismiss();
    });
  },

  update: function() {
    if (this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.scene.stop('UnlockScene');
      var gameScene = this.scene.get('GameScene');
      if (gameScene) {
        gameScene.scene.resume();
        gameScene.physics.resume();
        gameScene.paused = false;
      }
    }
  }
});

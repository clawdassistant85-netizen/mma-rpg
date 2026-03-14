var LobbyScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function LobbyScene() {
    Phaser.Scene.call(this, { key: 'LobbyScene' });
  },

  create: function() {
    var self = this;
    var cx = this.cameras.main.width / 2;
    var cy = this.cameras.main.height / 2;
    var SERVER_URL = 'ws://' + window.location.hostname + ':8089';

    if (window.MMA && MMA.Network && typeof MMA.Network.disconnect === 'function') {
      MMA.Network.disconnect();
    }

    this.add.text(cx, 80, 'MMA RPG - CO-OP', {
      fontSize: '36px', color: '#ffd700', fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.statusText = this.add.text(cx, cy + 80, '', {
      fontSize: '18px', color: '#aaaaaa', fontFamily: 'Arial', align: 'center'
    }).setOrigin(0.5);

    var joinBtn;

    var hostBtn = this.add.text(cx - 120, cy, '[ HOST ]', {
      fontSize: '28px', color: '#66ff66', fontFamily: 'Arial'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    hostBtn.on('pointerover', function() { hostBtn.setColor('#aaffaa'); });
    hostBtn.on('pointerout', function() { hostBtn.setColor('#66ff66'); });
    hostBtn.on('pointerdown', function() {
      hostBtn.setAlpha(0.4);
      if (joinBtn) joinBtn.setAlpha(0.4);
      MMA.Network.host(SERVER_URL, function(code) {
        self.statusText.setText('Room code: ' + code + '\nWaiting for player 2...');
      });
      MMA.Network.on('peer_joined', function() {
        self.statusText.setText('Player 2 connected! Starting...');
        self.time.delayedCall(800, function() {
          self.scene.start('BootScene');
        });
      });
    });

    joinBtn = this.add.text(cx + 120, cy, '[ JOIN ]', {
      fontSize: '28px', color: '#6699ff', fontFamily: 'Arial'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    joinBtn.on('pointerover', function() { joinBtn.setColor('#99bbff'); });
    joinBtn.on('pointerout', function() { joinBtn.setColor('#6699ff'); });
    joinBtn.on('pointerdown', function() {
      var code = prompt('Enter room code:');
      if (!code) return;
      code = code.trim().toUpperCase();
      hostBtn.setAlpha(0.4);
      joinBtn.setAlpha(0.4);
      self.statusText.setText('Connecting...');
      MMA.Network.join(SERVER_URL, code, function() {
        self.statusText.setText('Connected! Starting...');
        self.time.delayedCall(800, function() {
          self.scene.start('BootScene');
        });
      }, function(reason) {
        hostBtn.setAlpha(1);
        joinBtn.setAlpha(1);
        self.statusText.setText('Error: ' + reason);
      });
    });

    var soloBtn = this.add.text(cx, cy + 140, '[ SOLO PLAY ]', {
      fontSize: '18px', color: '#888888', fontFamily: 'Arial'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    soloBtn.on('pointerover', function() { soloBtn.setColor('#aaaaaa'); });
    soloBtn.on('pointerout', function() { soloBtn.setColor('#888888'); });
    soloBtn.on('pointerdown', function() {
      if (window.MMA && MMA.Network && typeof MMA.Network.disconnect === 'function') {
        MMA.Network.disconnect();
      }
      self.scene.start('TitleScene');
    });
  }
});

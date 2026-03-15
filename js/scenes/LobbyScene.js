var LobbyScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function LobbyScene() {
    Phaser.Scene.call(this, { key: 'LobbyScene' });
  },

  create: function() {
    var self = this;
    var W = this.cameras.main.width;
    var H = this.cameras.main.height;
    var cx = W / 2;
    var cy = H / 2;
    var SERVER_URL = 'ws://' + window.location.hostname + ':8089';
    var isLAN = window.location.hostname === 'localhost' ||
                /^192\.|^10\.|^172\./.test(window.location.hostname);
    var showCoop = isLAN;

    if (window.MMA && MMA.Network && typeof MMA.Network.disconnect === 'function') {
      MMA.Network.disconnect();
    }
    var startBtn = document.getElementById('dom-start-btn');
    if (startBtn) startBtn.style.display = 'none';

    var bg = this.add.graphics();
    bg.fillStyle(0x070a14, 1);
    bg.fillRect(0, 0, W, H);
    bg.fillStyle(0x111a33, 0.9);
    bg.fillRoundedRect(28, 32, W - 56, H - 64, 24);
    bg.fillStyle(0x5c1f1f, 0.18);
    bg.fillCircle(cx - 120, cy - 70, 150);
    bg.fillStyle(0x1f4d5c, 0.18);
    bg.fillCircle(cx + 130, cy + 40, 130);

    this.add.text(cx, 72, 'MMA RPG', {
      fontSize: '44px', color: '#ffd700', fontFamily: 'Arial', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add.text(cx, 108, 'by Toby, Digi & ARIA 🌸', {
      fontSize: '18px', color: '#9fb3d1', fontFamily: 'Arial'
    }).setOrigin(0.5);
    if (!showCoop) {
      this.add.text(cx, 148, 'HOW TO PLAY', {
        fontSize: '15px', color: '#ffd700', fontFamily: 'Arial', fontStyle: 'bold'
      }).setOrigin(0.5);
      this.add.text(cx, 168, '─────────────────────────────', {
        fontSize: '11px', color: '#334466', fontFamily: 'Arial'
      }).setOrigin(0.5);
      this.add.text(cx - 170, 194, 'Move', {
        fontSize: '13px', color: '#c8d8f0', fontFamily: 'Arial'
      });
      this.add.text(cx - 20, 194, 'D-Pad  /  WASD keys', {
        fontSize: '13px', color: '#c8d8f0', fontFamily: 'Arial'
      });
      this.add.text(cx - 170, 218, 'Attack', {
        fontSize: '13px', color: '#c8d8f0', fontFamily: 'Arial'
      });
      this.add.text(cx - 20, 218, 'Tap action buttons  /  J K L U N O P SPACE', {
        fontSize: '13px', color: '#c8d8f0', fontFamily: 'Arial'
      });
      this.add.text(cx - 170, 242, 'Takedown', {
        fontSize: '13px', color: '#c8d8f0', fontFamily: 'Arial'
      });
      this.add.text(cx - 20, 242, 'Ground game — pick a submission to finish', {
        fontSize: '13px', color: '#c8d8f0', fontFamily: 'Arial'
      });
      this.add.text(cx - 170, 266, 'Navigate', {
        fontSize: '13px', color: '#c8d8f0', fontFamily: 'Arial'
      });
      this.add.text(cx - 20, 266, 'Walk through doors to explore new rooms', {
        fontSize: '13px', color: '#c8d8f0', fontFamily: 'Arial'
      });
      this.add.text(cx, 290, '─────────────────────────────', {
        fontSize: '11px', color: '#334466', fontFamily: 'Arial'
      }).setOrigin(0.5);
    } else {
      this.add.text(cx, cy - 92, 'Press ENTER or click SOLO PLAY to start', {
        fontSize: '16px', color: '#d7deea', fontFamily: 'Arial'
      }).setOrigin(0.5);
    }

    this.statusText = this.add.text(cx, cy + 80, '', {
      fontSize: '18px', color: '#aaaaaa', fontFamily: 'Arial', align: 'center'
    }).setOrigin(0.5);

    var joinBtn;
    var hostBtn;
    var soloBtn;

    function lockSelection() {
      self._selectionLocked = true;
      if (hostBtn) hostBtn.disableInteractive();
      if (joinBtn) joinBtn.disableInteractive();
      if (soloBtn) soloBtn.disableInteractive();
    }

    function hasLocalSave() {
      if (typeof hasSaveGame === 'function') return hasSaveGame();
      if (typeof loadGame === 'function') return !!loadGame();
      return false;
    }

    function startSolo() {
      if (self._selectionLocked) return;
      lockSelection();
      if (window.MMA && MMA.Network && typeof MMA.Network.disconnect === 'function') {
        MMA.Network.disconnect();
      }
      if (hasLocalSave()) self.scene.start('TitleScene');
      else self.scene.start('BootScene');
    }

    if (showCoop) {
      hostBtn = this.add.text(cx - 120, cy, '[ HOST ]', {
        fontSize: '28px', color: '#66ff66', fontFamily: 'Arial'
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      hostBtn.on('pointerover', function() { hostBtn.setColor('#aaffaa'); });
      hostBtn.on('pointerout', function() { hostBtn.setColor('#66ff66'); });
      hostBtn.on('pointerdown', function() {
        if (self._selectionLocked) return;
        lockSelection();
        hostBtn.setAlpha(0.4);
        if (joinBtn) joinBtn.setAlpha(0.4);
        if (soloBtn) soloBtn.setAlpha(0.4);
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
        if (self._selectionLocked) return;
        var code = prompt('Enter room code:');
        if (!code) return;
        lockSelection();
        code = code.trim().toUpperCase();
        hostBtn.setAlpha(0.4);
        joinBtn.setAlpha(0.4);
        if (soloBtn) soloBtn.setAlpha(0.4);
        self.statusText.setText('Connecting...');
        MMA.Network.join(SERVER_URL, code, function() {
          self.statusText.setText('Connected! Starting...');
          self.time.delayedCall(800, function() {
            self.scene.start('BootScene');
          });
        }, function(reason) {
          self._selectionLocked = false;
          hostBtn.setInteractive({ useHandCursor: true });
          joinBtn.setInteractive({ useHandCursor: true });
          if (soloBtn) soloBtn.setInteractive({ useHandCursor: true });
          hostBtn.setAlpha(1);
          joinBtn.setAlpha(1);
          if (soloBtn) soloBtn.setAlpha(1);
          self.statusText.setText('Error: ' + reason);
        });
      });

      soloBtn = this.add.text(cx, cy + 140, '[ SOLO PLAY ]', {
        fontSize: '18px', color: '#888888', fontFamily: 'Arial'
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      soloBtn.on('pointerover', function() { soloBtn.setColor('#aaaaaa'); });
      soloBtn.on('pointerout', function() { soloBtn.setColor('#888888'); });
      soloBtn.on('pointerdown', startSolo);
    } else {
      soloBtn = this.add.text(cx, cy + 30, '▶  PLAY', {
        fontSize: '36px', color: '#66ff66', fontFamily: 'Arial', fontStyle: 'bold'
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      soloBtn.on('pointerover', function() { soloBtn.setColor('#aaffaa'); });
      soloBtn.on('pointerout', function() { soloBtn.setColor('#66ff66'); });
      soloBtn.on('pointerdown', startSolo);

      this.add.text(cx, cy + 80, 'tap or press ENTER to begin', {
        fontSize: '13px', color: '#7284a8', fontFamily: 'Arial'
      }).setOrigin(0.5);
    }

    this.add.text(14, H - 12, 'v0.4.0', {
      fontSize: '12px', color: '#7284a8', fontFamily: 'Arial'
    }).setOrigin(0, 1);

    this.input.keyboard.once('keydown-ENTER', function() {
      startSolo();
    });
  }
});

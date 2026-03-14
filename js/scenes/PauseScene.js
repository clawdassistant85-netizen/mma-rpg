// PauseScene.js — Move list / info overlay (I key toggle)
// Press I or Esc to open/close. GameScene physics paused while active.

var PAUSE_MOVE_CONTROLS = {
  jab:         { key: 'J',     label: 'Jab',              type: 'Strike'  },
  cross:       { key: 'K',     label: 'Cross',            type: 'Strike'  },
  hook:        { key: 'U',     label: 'Hook',             type: 'Strike'  },
  lowKick:     { key: 'N',     label: 'Low Kick',         type: 'Strike'  },
  uppercut:    { key: 'O',     label: 'Uppercut',         type: 'Strike'  },
  bodyShot:    { key: 'P',     label: 'Body Shot',        type: 'Strike'  },
  headKick:    { key: 'Space', label: 'Head Kick',        type: 'Strike'  },
  spinningBackFist: { key: '-', label: 'Spinning BF',     type: 'Strike'  },
  elbowStrike: { key: '-',     label: 'Elbow Strike',     type: 'Strike'  },
  kneeStrike:  { key: '-',     label: 'Knee Strike',      type: 'Strike'  },
  takedown:    { key: 'L',     label: 'Takedown',         type: 'Grapple' },
  guardPass:   { key: '-',     label: 'Guard Pass',       type: 'Grapple' },
  mountCtrl:   { key: '-',     label: 'Mount Control',    type: 'Grapple' },
  singleLeg:   { key: '-',     label: 'Single Leg',       type: 'Grapple' },
  hipThrow:    { key: '-',     label: 'Hip Throw',        type: 'Grapple' },
  guillotine:  { key: 'G',     label: 'Guillotine',       type: 'Sub'     },
  rnc:         { key: '-',     label: 'RNC Choke',        type: 'Sub'     },
  kimura:      { key: '-',     label: 'Kimura',           type: 'Sub'     },
  armbar:      { key: '-',     label: 'Armbar',           type: 'Sub'     },
  triangleChoke: { key: '-',   label: 'Triangle Choke',   type: 'Sub'     }
};

var PauseScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function PauseScene() {
    Phaser.Scene.call(this, { key: 'PauseScene' });
  },

  create: function() {
    var self = this;
    var W = CONFIG.CANVAS_W;
    var H = CONFIG.CANVAS_H;

    var PANEL_X  = 55;
    var PANEL_Y  = 35;
    var PANEL_W  = W - 110;
    var PANEL_H  = H - 70;

    // ── Dark full-screen backdrop
    var bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.72);
    bg.fillRect(0, 0, W, H);

    // ── Panel background + border
    var panel = this.add.graphics();
    panel.fillStyle(0x0d0704, 0.95);
    panel.fillRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H);
    panel.lineStyle(2, 0xe8c830, 1);
    panel.strokeRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H);

    // ── Title
    this.add.text(W / 2, PANEL_Y + 18, '🥊  MOVE LIST', {
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#e8c830',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0).setDepth(10);

    // ── Divider
    var divGfx = this.add.graphics();
    divGfx.lineStyle(1, 0xe8c830, 0.4);
    divGfx.beginPath();
    divGfx.moveTo(PANEL_X + 10, PANEL_Y + 46);
    divGfx.lineTo(PANEL_X + PANEL_W - 10, PANEL_Y + 46);
    divGfx.strokePath();

    // ── Stats block
    var stats = this.registry.get('playerStats') || {
      hp: 100, maxHp: 100, stamina: 100, maxStamina: 100, xp: 0, level: 1
    };

    var statsY = PANEL_Y + 54;
    this.add.text(PANEL_X + 14, statsY, 'STATS', {
      fontSize: '12px', color: '#888888', stroke: '#000', strokeThickness: 2
    }).setDepth(10);

    var statsLine = [
      'LVL ' + stats.level,
      'HP ' + stats.hp + '/' + stats.maxHp,
      'STA ' + Math.round(stats.stamina) + '/' + stats.maxStamina,
      'XP ' + stats.xp
    ].join('   ');

    this.add.text(PANEL_X + 14, statsY + 16, statsLine, {
      fontSize: '13px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setDepth(10);

    // ── Outfit info
    var outfitY = statsY + 36;
    var equippedOutfit = null;
    if (window.MMA && MMA.Outfits) {
      equippedOutfit = MMA.Outfits.getEquippedOutfit();
    }
    if (equippedOutfit) {
      this.add.text(PANEL_X + 14, outfitY, 'EQUIPPED: ' + equippedOutfit.name, {
        fontSize: '12px',
        color: '#9b59b6',
        stroke: '#000000',
        strokeThickness: 2
      }).setDepth(10);
    }

    // ── Second divider
    var div2 = this.add.graphics();
    div2.lineStyle(1, 0x555533, 0.6);
    div2.beginPath();
    div2.moveTo(PANEL_X + 10, outfitY + 20);
    div2.lineTo(PANEL_X + PANEL_W - 10, outfitY + 20);
    div2.strokePath();

    // ── Moves section
    var movesHeaderY = statsY + 44;
    this.add.text(PANEL_X + 14, movesHeaderY, 'UNLOCKED MOVES', {
      fontSize: '12px', color: '#888888', stroke: '#000', strokeThickness: 2
    }).setDepth(10);

    var unlockedMoves = this.registry.get('unlockedMoves') || ['jab', 'cross'];

    var ROW_H   = 24;
    var COL_W   = Math.floor(PANEL_W / 2);
    var startY  = movesHeaderY + 18;
    var KEY_W   = 38;
    var NAME_W  = 100;

    unlockedMoves.forEach(function(mk, idx) {
      var info = PAUSE_MOVE_CONTROLS[mk];
      if (!info) return;

      var col = idx % 2;
      var row = Math.floor(idx / 2);
      var tx  = PANEL_X + 14 + col * COL_W;
      var ty  = startY + row * ROW_H;

      // Stop rendering if we overflow the panel
      if (ty + ROW_H > PANEL_Y + PANEL_H - 30) return;

      // [Key] badge
      var keyColor = info.key === '-' ? '#555555' : '#e8c830';
      self.add.text(tx, ty, '[' + info.key + ']', {
        fontSize: '12px',
        color: keyColor,
        stroke: '#000000',
        strokeThickness: 2
      }).setDepth(10);

      // Move name
      self.add.text(tx + KEY_W, ty, info.label, {
        fontSize: '12px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }).setDepth(10);

      // Type badge
      var typeColor = '#888888';
      if (info.type === 'Strike')  typeColor = '#ff8844';
      if (info.type === 'Grapple') typeColor = '#44aaff';
      if (info.type === 'Sub')     typeColor = '#cc44cc';

      self.add.text(tx + KEY_W + NAME_W, ty, info.type, {
        fontSize: '11px',
        color: typeColor,
        stroke: '#000000',
        strokeThickness: 2
      }).setDepth(10);
    });


    var closeBtn = this.add.text(W / 2, PANEL_Y + PANEL_H - 44, 'CLOSE', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#444444',
      padding: { left: 14, right: 14, top: 6, bottom: 6 }
    }).setOrigin(0.5, 1).setDepth(12).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', function(){ self.closePause(); });

    // ── Footer
    this.add.text(W / 2, PANEL_Y + PANEL_H - 18, 'TAP CLOSE or press I / ESC to return', {
      fontSize: '13px',
      color: '#666666',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 1).setDepth(10);

    // ── Close keys
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.iKey   = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);

    this.input.on('pointerdown', function(pointer){
      if (pointer.y < PANEL_Y || pointer.y > PANEL_Y + PANEL_H || pointer.x < PANEL_X || pointer.x > PANEL_X + PANEL_W) {
        self.closePause();
      }
    });
  },

  update: function() {
    if (
      Phaser.Input.Keyboard.JustDown(this.escKey) ||
      Phaser.Input.Keyboard.JustDown(this.iKey)
    ) {
      this.closePause();
    }
  },

  closePause: function() {
    // Tell GameScene to resume physics + game logic
    var gameScene = this.scene.get('GameScene');
    if (gameScene && gameScene.resumeFromPause) {
      gameScene.resumeFromPause();
    }
    this.scene.stop();
  }
});

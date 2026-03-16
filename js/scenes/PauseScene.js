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
  takedown:    { key: 'L',     label: 'Takedown',        type: 'Grapple' },
  guardPass:   { key: '-',     label: 'Guard Pass',       type: 'Grapple' },
  mountCtrl:   { key: '-',     label: 'Mount Control',    type: 'Grapple' },
  singleLeg:   { key: '-',     label: 'Single Leg',       type: 'Grapple' },
  hipThrow:    { key: '-',     label: 'Hip Throw',        type: 'Grapple' },
  guillotine:  { key: 'G',     label: 'Guillotine',       type: 'Sub'     },
  rnc:         { key: '-',     label: 'RNC Choke',        type: 'Sub'     },
  kimura:      { key: '-',     label: 'Kimura',           type: 'Sub'     },
  armbar:      { key: '-',     label: 'Armbar',           type: 'Sub'     },
  triangleChoke: { key: '-',   label: 'Triangle Choke',   type: 'Sub'     },
  americana:   { key: '-',     label: 'Americana',        type: 'Sub'     },
  heelHook:    { key: '-',     label: 'Heel Hook',        type: 'Sub'     },
  kneebar:     { key: '-',     label: 'Kneebar',         type: 'Sub'     }
};

var PauseScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function PauseScene() {
    Phaser.Scene.call(this, { key: 'PauseScene' });
  },

  _setMobileControlsPointerEvents: function(enabled) {
    var ids = ['dpad', 'action-cluster', 'mobile-pause-btn'];
    ids.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.style.pointerEvents = enabled ? '' : 'none';
    });
  },

  create: function() {
    var self = this;
    this._setMobileControlsPointerEvents(false);
    var W = CONFIG.CANVAS_W;
    var H = CONFIG.CANVAS_H;
    var isMobile = window.innerWidth <= 480 || !window.matchMedia('(pointer: fine)').matches;

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
      fontSize: isMobile ? '14px' : '12px', color: '#888888', stroke: '#000', strokeThickness: 2
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

    // ── Style levels (new system)
    var strLvl = stats.strikingLevel || 1;
    var graLvl = stats.grapplingLevel || 1;
    var subLvl = stats.submissionLevel || 1;
    var styleLine = 'STR ' + strLvl + ' | GRA ' + graLvl + ' | SUB ' + subLvl;
    this.add.text(PANEL_X + 14, statsY + 34, styleLine, {
      fontSize: '11px',
      color: '#aaaaaa',
      stroke: '#000000',
      strokeThickness: 2
    }).setDepth(10);
    
    // Show XP progress for each style
    var strXP = stats.strikingXP || 0;
    var graXP = stats.grapplingXP || 0;
    var subXP = stats.submissionXP || 0;
    var strXPNext = (strLvl) * 75;
    var graXPNext = (graLvl) * 75;
    var subXPNext = (subLvl) * 75;
    this.add.text(PANEL_X + 14, statsY + 46, 'XP: ' + strXP + '/' + strXPNext + ' | ' + graXP + '/' + graXPNext + ' | ' + subXP + '/' + subXPNext, {
      fontSize: '10px',
      color: '#666666',
      stroke: '#000000',
      strokeThickness: 2
    }).setDepth(10);

    // ── Unlocked moves set (needed by mobile controls picker regardless of layout)
    var unlockedMoves = this.registry.get('unlockedMoves') || ['jab', 'cross'];
    var unlockedSet = {};
    unlockedMoves.forEach(function(moveKey) { unlockedSet[moveKey] = true; });

    var controlsY; // set differently for mobile vs desktop

    if (!isMobile) {
      // ── Outfit info (desktop only)
      var outfitY = statsY + 70;
      var equippedOutfit = null;
      if (window.MMA && MMA.Outfits) {
        equippedOutfit = MMA.Outfits.getEquippedOutfit();
      }
      if (equippedOutfit) {
        this.add.text(PANEL_X + 14, outfitY, 'EQUIPPED: ' + equippedOutfit.name, {
          fontSize: '12px', color: '#9b59b6', stroke: '#000000', strokeThickness: 2
        }).setDepth(10);
      }

      // ── Second divider (desktop only)
      var div2 = this.add.graphics();
      div2.lineStyle(1, 0x555533, 0.6);
      div2.beginPath();
      div2.moveTo(PANEL_X + 10, outfitY + 20);
      div2.lineTo(PANEL_X + PANEL_W - 10, outfitY + 20);
      div2.strokePath();

      // ── Moves section (desktop only)
      var movesHeaderY = outfitY + 34;
      this.add.text(PANEL_X + 14, movesHeaderY, 'UNLOCKED MOVES', {
        fontSize: '12px', color: '#888888', stroke: '#000', strokeThickness: 2
      }).setDepth(10);

      var ROW_H  = 24;
      var COL_W  = Math.floor(PANEL_W / 2);
      var startY = movesHeaderY + 18;
      var KEY_W  = 38;
      var NAME_W = 100;

      unlockedMoves.forEach(function(mk, idx) {
        var info = PAUSE_MOVE_CONTROLS[mk];
        if (!info) return;
        var col = idx % 2;
        var row = Math.floor(idx / 2);
        var tx  = PANEL_X + 14 + col * COL_W;
        var ty  = startY + row * ROW_H;
        if (ty + ROW_H > PANEL_Y + PANEL_H - 30) return;
        var keyColor = info.key === '-' ? '#555555' : '#e8c830';
        self.add.text(tx, ty, '[' + info.key + ']', { fontSize: '12px', color: keyColor, stroke: '#000000', strokeThickness: 2 }).setDepth(10);
        self.add.text(tx + KEY_W, ty, info.label, { fontSize: '12px', color: '#ffffff', stroke: '#000000', strokeThickness: 2 }).setDepth(10);
        var typeColor = info.type === 'Strike' ? '#ff8844' : info.type === 'Grapple' ? '#44aaff' : info.type === 'Sub' ? '#cc44cc' : '#888888';
        self.add.text(tx + KEY_W + NAME_W, ty, info.type, { fontSize: '11px', color: typeColor, stroke: '#000000', strokeThickness: 2 }).setDepth(10);
      });

      // ── Loadout section (desktop only)
      var gameScene = this.scene.get('GameScene');
      var loadout = ['jab', 'cross', 'takedown', 'hook'];
      if (gameScene && gameScene.player && gameScene.player.moveLoadout) {
        loadout = gameScene.player.moveLoadout;
      }
      var loadoutY = startY + Math.ceil(unlockedMoves.length / 2) * ROW_H + 20;
      this.add.text(PANEL_X + 14, loadoutY, 'LOADOUT (J-K-L-U)', {
        fontSize: '12px', color: '#44aaff', stroke: '#000', strokeThickness: 2
      }).setDepth(10);
      var slotColors = ['#ff8844', '#ff8844', '#44aaff', '#44aaff'];
      for (var i = 0; i < 4; i++) {
        var lMoveKey = loadout[i] || 'jab';
        var lMoveInfo = PAUSE_MOVE_CONTROLS[lMoveKey] || { label: lMoveKey };
        var lIsUnlocked = !!unlockedSet[lMoveKey];
        var slotX = PANEL_X + 14 + i * ((PANEL_W - 28) / 4);
        var slotBg = this.add.graphics();
        slotBg.fillStyle(0x222222, 0.8);
        slotBg.fillRoundedRect(slotX, loadoutY + 16, (PANEL_W - 28) / 4 - 4, 32, 4);
        slotBg.lineStyle(1, lIsUnlocked ? slotColors[i] : '#555555', 0.6);
        slotBg.strokeRoundedRect(slotX, loadoutY + 16, (PANEL_W - 28) / 4 - 4, 32, 4);
        this.add.text(slotX + 10, loadoutY + 20, (i + 1) + ':', { fontSize: '10px', color: lIsUnlocked ? '#888888' : '#555555' }).setDepth(10);
        this.add.text(slotX + 24, loadoutY + 24, lMoveInfo.label, { fontSize: '11px', color: lIsUnlocked ? '#ffffff' : '#777777' }).setDepth(10);
      }
      controlsY = loadoutY + 65;

    } else {
      // ── Mobile: compact — jump straight to MOBILE CONTROLS after stats
      controlsY = statsY + 90;
    }
    this.add.text(PANEL_X + 14, controlsY, 'MOBILE CONTROLS (tap slot to remap)', {
      fontSize: '11px', color: '#ffaa44', stroke: '#000', strokeThickness: 2
    }).setDepth(10);

    var ALL_MOVES = [
      {key:'jab',name:'Jab'},{key:'cross',name:'Cross'},{key:'hook',name:'Hook'},
      {key:'lowKick',name:'Low Kick'},{key:'uppercut',name:'Uppercut'},{key:'bodyShot',name:'Body Shot'},
      {key:'headKick',name:'Head Kick'},{key:'takedown',name:'Takedown'},
      {key:'guillotine',name:'Guillotine'},{key:'special',name:'Special'}
    ];
    var mobileLoadout = window.MMA_LOADOUT || {1:'jab',2:'cross',3:'hook',4:'lowKick',5:'takedown',6:'special',7:'headKick',8:'guillotine'};
    var slotRadius = 22;
    var slotsPerRow = 4;
    var slotSpacing = (PANEL_W - 28) / slotsPerRow;
    var slotObjs = [];

    for (var s = 1; s <= 8; s++) {
      var row = Math.floor((s-1) / slotsPerRow);
      var col = (s-1) % slotsPerRow;
      var sx = PANEL_X + 14 + slotSpacing * col + slotSpacing/2;
      var sy = controlsY + 20 + row * (slotRadius * 2 + 10) + slotRadius;
      
      var slotGfx = this.add.graphics().setDepth(10);
      var moveKey = mobileLoadout[s] || 'jab';
      var moveObj = ALL_MOVES.find(function(m){ return m.key === moveKey; }) || {key:moveKey, name:moveKey};
      var isUnlocked = unlockedSet[moveKey] || moveKey === 'jab' || moveKey === 'takedown' || moveKey === 'special';
      
      slotGfx.fillStyle(isUnlocked ? 0x222244 : 0x221111, 0.9);
      slotGfx.fillCircle(sx, sy, slotRadius);
      slotGfx.lineStyle(2, isUnlocked ? 0x4488ff : 0x553333, 1);
      slotGfx.strokeCircle(sx, sy, slotRadius);
      
      this.add.text(sx - slotRadius + 3, sy - slotRadius + 2, s + '', {
        fontSize: '8px', color: '#888888'
      }).setDepth(11);
      
      var nameText = this.add.text(sx, sy, moveObj.name, {
        fontSize: '9px', color: isUnlocked ? '#ffffff' : '#666666',
        align: 'center', wordWrap: {width: slotRadius * 1.6}
      }).setOrigin(0.5).setDepth(11);
      
      var hitArea = this.add.rectangle(sx, sy, slotRadius*2, slotRadius*2, 0x000000, 0)
        .setInteractive({cursor:'pointer'}).setDepth(12);
      
      (function(slotNum, slotGfxRef, nameTextRef, sxRef, syRef) {
        hitArea.on('pointerdown', function() {
          self._showMovePicker(slotNum, sxRef, syRef, unlockedSet, ALL_MOVES, slotGfxRef, nameTextRef, mobileLoadout);
        });
      })(s, slotGfx, nameText, sx, sy, mobileLoadout);
      
      slotObjs.push({num: s, gfx: slotGfx, text: nameText, x: sx, y: sy});
    }
    this._slotObjs = slotObjs;
    
    // ── Ground game controls hint
    var groundY = controlsY + 20 + 2 * (slotRadius * 2 + 10) + 6;
    this.add.text(PANEL_X + 14, groundY, 'GROUND GAME: L for submissions, 1-4 to select', {
      fontSize: '10px', color: '#cc44cc', stroke: '#000', strokeThickness: 2
    }).setDepth(10);

    var closeBtn = this.add.text(W / 2, PANEL_Y + PANEL_H - 44, 'CLOSE', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#444444',
      padding: { left: 14, right: 14, top: 6, bottom: 6 }
    }).setOrigin(0.5, 1).setDepth(12).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', function(){ self.closePause(); });

    // ── Footer
    this.add.text(W / 2, PANEL_Y + PANEL_H - 18, 'Tap the button above or press I / ESC to return', {
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
    if (this._pickerContainer) {
      this._pickerContainer.destroy();
      this._pickerContainer = null;
    }
    this._setMobileControlsPointerEvents(true);
    var gameScene = this.scene.get('GameScene');
    if (gameScene && gameScene.resumeFromPause) {
      gameScene.resumeFromPause();
    }
    if (gameScene && gameScene.scene) {
      gameScene.scene.resume('GameScene');
      gameScene.scene.stop('PauseScene');
    } else {
      this.scene.stop('PauseScene');
    }
  },

  _showMovePicker: function(slotNum, slotX, slotY, unlockedSet, ALL_MOVES, slotGfx, nameText, loadout) {
    var self = this;
    if (this._pickerContainer) { this._pickerContainer.destroy(); this._pickerContainer = null; }

    var closeBg = self.add.rectangle(CONFIG.CANVAS_W/2, CONFIG.CANVAS_H/2, CONFIG.CANVAS_W, CONFIG.CANVAS_H, 0x000000, 0)
      .setInteractive().setDepth(19);
    closeBg.on('pointerdown', function() {
      if (self._pickerContainer) { self._pickerContainer.destroy(); self._pickerContainer = null; }
    });

    var pickerHeight = Math.min(ALL_MOVES.length * 22 + 30, 200);
    var pickerBg = this.add.graphics().setDepth(20);
    pickerBg.fillStyle(0x111122, 0.97);
    pickerBg.fillRoundedRect(slotX - 80, slotY - 20, 160, pickerHeight, 8);
    pickerBg.lineStyle(1, 0x4488ff, 0.8);
    pickerBg.strokeRoundedRect(slotX - 80, slotY - 20, 160, pickerHeight, 8);

    var children = [closeBg, pickerBg];
    var header = this.add.text(slotX, slotY - 8, 'SLOT ' + slotNum + ' — Pick Move', {
      fontSize: '10px', color: '#ffaa44', align: 'center'
    }).setOrigin(0.5).setDepth(21);
    children.push(header);

    ALL_MOVES.forEach(function(move, idx) {
      var isUnlocked = unlockedSet[move.key] || move.key === 'jab' || move.key === 'takedown' || move.key === 'special';
      var my = slotY + 14 + idx * 20;
      if (my > slotY + 180) return;
      var item = self.add.text(slotX, my, move.name, {
        fontSize: '11px', color: isUnlocked ? '#ffffff' : '#555555', align: 'center'
      }).setOrigin(0.5).setDepth(21);
      if (isUnlocked) {
        item.setInteractive({cursor:'pointer'});
        item.on('pointerdown', function() {
          loadout[slotNum] = move.key;
          window.MMA_LOADOUT = loadout;
          try { localStorage.setItem('mma_loadout', JSON.stringify(loadout)); } catch(e){}
          var btn = document.querySelector('[data-slot="' + slotNum + '"]');
          if (btn) {
            btn.setAttribute('data-action', move.key);
            btn.textContent = move.name;
            btn.setAttribute('aria-label', 'Slot ' + slotNum + ': ' + move.name);
          }
          nameText.setText(move.name);
          if (slotGfx) {
            slotGfx.clear();
            slotGfx.fillStyle(0x222244, 0.9);
            slotGfx.fillCircle(slotX, slotY, 22);
            slotGfx.lineStyle(2, 0x4488ff, 1);
            slotGfx.strokeCircle(slotX, slotY, 22);
          }
          if (self._pickerContainer) { self._pickerContainer.destroy(); self._pickerContainer = null; }
        });
      }
      children.push(item);
    });

    this._pickerContainer = self.add.container(0, 0, children).setDepth(20);
  }
});

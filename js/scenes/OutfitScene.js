// OutfitScene.js — Outfit selection screen
// Press E to open/close from GameScene

var OutfitScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function OutfitScene() {
    Phaser.Scene.call(this, { key: 'OutfitScene' });
  },

  create: function() {
    var self = this;
    var W = CONFIG.CANVAS_W;
    var H = CONFIG.CANVAS_H;

    var PANEL_X = 40;
    var PANEL_Y = 30;
    var PANEL_W = W - 80;
    var PANEL_H = H - 60;

    // Get outfit data
    this.outfits = MMA.Outfits.getAllOutfits();
    this.equippedOutfit = MMA.Outfits.getEquippedOutfit();
    this.selectedOutfit = this.equippedOutfit ? this.equippedOutfit.id : 'streetClothes';

    // Dark full-screen backdrop
    var bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.75);
    bg.fillRect(0, 0, W, H);

    // Panel background + border
    var panel = this.add.graphics();
    panel.fillStyle(0x1a1a2e, 0.95);
    panel.fillRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H);
    panel.lineStyle(3, 0x9b59b6, 1);
    panel.strokeRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H);

    // Title
    this.add.text(W / 2, PANEL_Y + 14, '⚔️  EQUIPMENT  ⚔️', {
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#9b59b6',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5, 0).setDepth(10);

    // Divider
    var divGfx = this.add.graphics();
    divGfx.lineStyle(1, 0x9b59b6, 0.5);
    divGfx.beginPath();
    divGfx.moveTo(PANEL_X + 10, PANEL_Y + 46);
    divGfx.lineTo(PANEL_X + PANEL_W - 10, PANEL_Y + 46);
    divGfx.strokePath();

    // Current outfit display
    var currentY = PANEL_Y + 56;
    var currentText = 'Current: ' + (this.equippedOutfit ? this.equippedOutfit.name : 'None');
    this.add.text(PANEL_X + 14, currentY, currentText, {
      fontSize: '14px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 2
    }).setDepth(10);

    // Outfit grid
    this.outfitItems = [];
    var gridStartY = currentY + 30;
    var itemWidth = 160;
    var itemHeight = 90;
    var cols = Math.floor((PANEL_W - 20) / itemWidth);
    var padding = 10;
    var idx = 0;
    
    var self = this;
    
    Object.keys(this.outfits).forEach(function(outfitId) {
      var outfit = self.outfits[outfitId];
      var col = idx % cols;
      var row = Math.floor(idx / cols);
      
      var itemX = PANEL_X + 14 + col * (itemWidth + padding);
      var itemY = gridStartY + row * (itemHeight + padding);
      
      // Skip if out of bounds
      if (itemY + itemHeight > PANEL_Y + PANEL_H - 80) return;
      
      var isUnlocked = MMA.Outfits.isUnlocked(outfitId);
      var isEquipped = (outfitId === self.equippedOutfit.id);
      
      var item = self.createOutfitItem(itemX, itemY, itemWidth - 10, itemHeight, outfit, isUnlocked, isEquipped);
      self.outfitItems.push({
        outfitId: outfitId,
        container: item.container,
        isUnlocked: isUnlocked
      });
      
      idx++;
    });

    // Close button
    var closeBtn = this.add.text(W / 2, PANEL_Y + PANEL_H - 35, 'CLOSE', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#444444',
      padding: { left: 14, right: 14, top: 6, bottom: 6 }
    }).setOrigin(0.5, 1).setDepth(12).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', function() { self.closeOutfit(); });

    // Footer
    this.add.text(W / 2, PANEL_Y + PANEL_H - 12, 'Press E or ESC to close | Click to equip unlocked outfit', {
      fontSize: '12px',
      color: '#888888',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 1).setDepth(10);

    // Keyboard
    this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    // Click outside to close
    this.input.on('pointerdown', function(pointer) {
      if (pointer.y < PANEL_Y || pointer.y > PANEL_Y + PANEL_H || pointer.x < PANEL_X || pointer.x > PANEL_X + PANEL_W) {
        self.closeOutfit();
      }
    });
  },

  createOutfitItem: function(x, y, w, h, outfit, isUnlocked, isEquipped) {
    var self = this;
    var container = this.add.container(x, y);
    
    // Background
    var bg = this.add.graphics();
    var bgColor = isEquipped ? 0x2d5a27 : (isUnlocked ? 0x2a2a3e : 0x1a1a1a);
    var borderColor = isEquipped ? 0x44ff44 : (isUnlocked ? 0x666666 : 0x333333);
    bg.fillStyle(bgColor, 1);
    bg.fillRect(0, 0, w, h);
    bg.lineStyle(2, borderColor, isEquipped ? 1 : 0.6);
    bg.strokeRect(0, 0, w, h);
    container.add(bg);
    
    // Outfit name
    var nameColor = isUnlocked ? '#ffffff' : '#555555';
    var nameText = this.add.text(w / 2, 12, outfit.name, {
      fontSize: '13px',
      fontStyle: 'bold',
      color: nameColor,
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0);
    container.add(nameText);
    
    // Stat modifiers
    var mods = outfit.modifiers;
    var statLines = [];
    var statColor = isUnlocked ? '#aaaaaa' : '#444444';
    if (mods.strength !== 0) statLines.push('STR: ' + (mods.strength > 0 ? '+' : '') + mods.strength);
    if (mods.speed !== 0) statLines.push('SPD: ' + (mods.speed > 0 ? '+' : '') + mods.speed);
    if (mods.defense !== 0) statLines.push('DEF: ' + (mods.defense > 0 ? '+' : '') + mods.defense);
    if (mods.agility !== 0) statLines.push('AGI: ' + (mods.agility > 0 ? '+' : '') + mods.agility);
    if (mods.endurance !== 0) statLines.push('END: ' + (mods.endurance > 0 ? '+' : '') + mods.endurance);
    
    var statsText = statLines.join('\n');
    var statsObj = this.add.text(6, 30, statsText, {
      fontSize: '11px',
      color: statColor,
      stroke: '#000000',
      strokeThickness: 1,
      lineSpacing: -2
    }).setDepth(10);
    container.add(statsObj);
    
    // Unlock condition or equipped badge
    if (isEquipped) {
      var eqText = this.add.text(w / 2, h - 12, 'EQUIPPED', {
        fontSize: '10px',
        color: '#44ff44',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5, 1);
      container.add(eqText);
    } else if (!isUnlocked) {
      var lockText = this.add.text(w / 2, h - 12, outfit.unlockCondition, {
        fontSize: '9px',
        color: '#ff6666',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5, 1);
      container.add(lockText);
    }
    
    // Make interactive if unlocked
    if (isUnlocked) {
      bg.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
      bg.on('pointerdown', function() {
        self.equipOutfit(outfit.id);
      });
      bg.on('pointerover', function() {
        bg.clear();
        bg.fillStyle(isEquipped ? 0x2d5a27 : 0x3a3a5e, 1);
        bg.fillRect(0, 0, w, h);
        bg.lineStyle(2, 0x9b59b6, 1);
        bg.strokeRect(0, 0, w, h);
      });
      bg.on('pointerout', function() {
        bg.clear();
        bg.fillStyle(isEquipped ? 0x2d5a27 : 0x2a2a3e, 1);
        bg.fillRect(0, 0, w, h);
        bg.lineStyle(2, isEquipped ? 0x44ff44 : 0x666666, isEquipped ? 1 : 0.6);
        bg.strokeRect(0, 0, w, h);
      });
    }
    
    return { container: container };
  },

  equipOutfit: function(outfitId) {
    var gameScene = this.scene.get('GameScene');
    
    var success = MMA.Player.equipOutfit(gameScene, outfitId);
    if (success) {
      this.equippedOutfit = MMA.Outfits.getEquippedOutfit();
      
      // Update UI
      var self = this;
      Object.keys(this.outfits).forEach(function(outfitId) {
        var item = self.outfitItems.find(function(i) { return i.outfitId === outfitId; });
        if (item) {
          var isEquipped = (outfitId === self.equippedOutfit.id);
          // Visual update would go here - for now just refresh
        }
      });
      
      // Show feedback
      var outfit = MMA.Outfits.getOutfit(outfitId);
      this.showEquipFeedback(outfit.name);
    }
  },

  showEquipFeedback: function(outfitName) {
    var W = CONFIG.CANVAS_W;
    var H = CONFIG.CANVAS_H;
    var feedback = this.add.text(W / 2, H / 2, 'EQUIPPED: ' + outfitName, {
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#44ff44',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(20);
    
    this.tweens.add({
      targets: feedback,
      alpha: 0,
      y: feedback.y - 30,
      duration: 1000,
      onComplete: function() {
        feedback.destroy();
      }
    });
  },

  update: function() {
    if (
      Phaser.Input.Keyboard.JustDown(this.escKey) ||
      Phaser.Input.Keyboard.JustDown(this.eKey)
    ) {
      this.closeOutfit();
    }
  },

  closeOutfit: function() {
    var gameScene = this.scene.get('GameScene');
    if (gameScene && gameScene.resumeFromPause) {
      gameScene.resumeFromPause();
    }
    this.scene.stop();
  }
});

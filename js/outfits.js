// Outfit definitions for MMA RPG
// Each outfit provides stat modifiers and visual variants

window.MMA = window.MMA || {};
window.MMA.Outfits = {
  // All available outfits
  OUTFITS: {
    streetClothes: {
      id: 'streetClothes',
      name: 'Street Clothes',
      description: 'Your everyday wear. No special bonuses.',
      modifiers: { strength: 0, speed: 0, defense: 0, agility: 0, endurance: 0 },
      visualKey: 'streetClothes',
      unlocked: true,
      unlockCondition: 'Always unlocked'
    },
    bjjGi: {
      id: 'bjjGi',
      name: 'BJJ Gi',
      description: 'Traditional Brazilian Jiu-Jitsu gi. Heavy but defensive.',
      modifiers: { strength: 0, speed: -1, defense: 3, agility: 0, endurance: 2 },
      visualKey: 'bjjGi',
      unlocked: false,
      unlockCondition: 'Reach Level 2'
    },
    boxingTrunks: {
      id: 'boxingTrunks',
      name: 'Boxing Trunks',
      description: 'Classic boxing shorts. Fast and agile.',
      modifiers: { strength: 0, speed: 3, defense: -1, agility: 2, endurance: 0 },
      visualKey: 'boxingTrunks',
      unlocked: false,
      unlockCondition: 'Reach Level 3'
    },
    muayThaiShorts: {
      id: 'muayThaiShorts',
      name: 'Muay Thai Shorts',
      description: 'Traditional Muay Thai shorts. Powerful kicks.',
      modifiers: { strength: 2, speed: 2, defense: 0, agility: 0, endurance: -1 },
      visualKey: 'muayThaiShorts',
      unlocked: false,
      unlockCondition: 'Defeat a Muay Thai Fighter'
    },
    streetFighterOutfit: {
      id: 'streetFighterOutfit',
      name: 'Street Fighter Outfit',
      description: 'A fighter\'s attire. Strong and quick.',
      modifiers: { strength: 3, speed: 0, defense: -2, agility: 1, endurance: 0 },
      visualKey: 'streetFighter',
      unlocked: false,
      unlockCondition: 'Reach Level 5'
    },
    mkNinjaSuit: {
      id: 'mkNinjaSuit',
      name: 'MK Ninja Suit',
      description: 'A mysterious ninja outfit. Extremely agile.',
      modifiers: { strength: 1, speed: 2, defense: 0, agility: 2, endurance: -2 },
      visualKey: 'mkNinja',
      unlocked: false,
      unlockCondition: 'Reach Level 7'
    },
    wrestlingSinglet: {
      id: 'wrestlingSinglet',
      name: 'Wrestling Singlet',
      description: 'Olympic-style wrestling singlet. Maximum defense.',
      modifiers: { strength: 2, speed: -3, defense: 4, agility: 0, endurance: 0 },
      visualKey: 'wrestlingSinglet',
      unlocked: false,
      unlockCondition: 'Defeat a Wrestler'
    },
    championsRobe: {
      id: 'championsRobe',
      name: "Champion's Robe",
      description: 'Worn by true champions. +2 to all stats.',
      modifiers: { strength: 2, speed: 2, defense: 2, agility: 2, endurance: 2 },
      visualKey: 'championsRobe',
      unlocked: false,
      unlockCondition: 'Defeat the MMA Champ'
    }
  },

  // Track unlocked outfits and equipped outfit
  playerOutfitData: {
    equipped: 'streetClothes',
    unlocked: ['streetClothes'],
    defeatedEnemies: {
      muayThaiFighter: false,
      wrestler: false,
      mmaChamp: false
    }
  },

  // Get all outfits
  getAllOutfits: function() {
    return this.OUTFITS;
  },

  // Get outfit by ID
  getOutfit: function(id) {
    return this.OUTFITS[id];
  },

  // Get currently equipped outfit
  getEquippedOutfit: function() {
    return this.OUTFITS[this.playerOutfitData.equipped];
  },

  // Check if an outfit is unlocked
  isUnlocked: function(outfitId) {
    return this.playerOutfitData.unlocked.includes(outfitId);
  },

  // Equip an outfit (returns modifiers)
  equip: function(outfitId) {
    if (!this.OUTFITS[outfitId]) return null;
    if (!this.isUnlocked(outfitId)) return null;
    
    this.playerOutfitData.equipped = outfitId;
    return this.OUTFITS[outfitId].modifiers;
  },

  // Unlock an outfit
  unlock: function(outfitId) {
    if (!this.OUTFITS[outfitId]) return false;
    if (this.playerOutfitData.unlocked.includes(outfitId)) return false;
    
    this.playerOutfitData.unlocked.push(outfitId);
    this.OUTFITS[outfitId].unlocked = true;
    return true;
  },

  // Check and unlock outfits based on player level
  checkLevelUnlocks: function(playerLevel) {
    var unlocked = [];
    // Level 2: BJJ Gi
    if (playerLevel >= 2 && !this.isUnlocked('bjjGi')) {
      this.unlock('bjjGi');
      unlocked.push('bjjGi');
    }
    // Level 3: Boxing Trunks
    if (playerLevel >= 3 && !this.isUnlocked('boxingTrunks')) {
      this.unlock('boxingTrunks');
      unlocked.push('boxingTrunks');
    }
    // Level 5: Street Fighter Outfit
    if (playerLevel >= 5 && !this.isUnlocked('streetFighterOutfit')) {
      this.unlock('streetFighterOutfit');
      unlocked.push('streetFighterOutfit');
    }
    // Level 7: MK Ninja Suit
    if (playerLevel >= 7 && !this.isUnlocked('mkNinjaSuit')) {
      this.unlock('mkNinjaSuit');
      unlocked.push('mkNinjaSuit');
    }
    return unlocked;
  },

  // Record enemy defeat for unlock checks
  recordEnemyDefeat: function(enemyType) {
    var unlocked = [];
    if (enemyType === 'muayThaiFighter' && !this.playerOutfitData.defeatedEnemies.muayThaiFighter) {
      this.playerOutfitData.defeatedEnemies.muayThaiFighter = true;
      if (!this.isUnlocked('muayThaiShorts')) {
        this.unlock('muayThaiShorts');
        unlocked.push('muayThaiShorts');
      }
    }
    if (enemyType === 'wrestler' && !this.playerOutfitData.defeatedEnemies.wrestler) {
      this.playerOutfitData.defeatedEnemies.wrestler = true;
      if (!this.isUnlocked('wrestlingSinglet')) {
        this.unlock('wrestlingSinglet');
        unlocked.push('wrestlingSinglet');
      }
    }
    if (enemyType === 'mmaChamp' && !this.playerOutfitData.defeatedEnemies.mmaChamp) {
      this.playerOutfitData.defeatedEnemies.mmaChamp = true;
      if (!this.isUnlocked('championsRobe')) {
        this.unlock('championsRobe');
        unlocked.push('championsRobe');
      }
    }
    return unlocked;
  },

  // Get outfit colors for sprite generation
  getOutfitColors: function(outfitKey) {
    var defaultColors = {
      skin: 0xd4a574,
      skinDark: 0x8b6914,
      hair: 0x3d2314,
      torso: 0x2255aa,
      torsoLight: 0x4466cc,
      legs: 0x333333,
      belt: 0x664422,
      glove: 0xcc3333,
      shoes: 0x222222,
      shoeAccent: 0xffcc00,
      outline: 0x000000,
      headband: 0xcc3333
    };

    var outfitColors = {
      streetClothes: { torso: 0x2255aa, torsoLight: 0x4466cc },  // Blue shirt
      bjjGi: { torso: 0xffffff, torsoLight: 0xeeeeee, belt: 0x000000 },  // White gi with black belt
      boxingTrunks: { torso: 0xff4444, torsoLight: 0xff6666, legs: 0xff4444 },  // Red boxing shorts
      muayThaiShorts: { torso: 0x4400ff, torsoLight: 0x6600ff, legs: 0x4400ff },  // Purple Thai shorts
      streetFighter: { torso: 0xff8800, torsoLight: 0xffaa33, belt: 0xff0000 },  // Orange gi-like
      mkNinja: { torso: 0x222222, torsoLight: 0x444444, legs: 0x111111, glove: 0x8800ff },  // Dark ninja with purple gloves
      wrestlingSinglet: { torso: 0x0033aa, torsoLight: 0x0044cc, legs: 0x0033aa },  // Blue singlet
      championsRobe: { torso: 0xffd700, torsoLight: 0xffee66, belt: 0xffd700, legs: 0xaa8800 }  // Gold champion robe
    };

    var colors = Object.assign({}, defaultColors);
    if (outfitColors[outfitKey]) {
      Object.assign(colors, outfitColors[outfitKey]);
    }
    return colors;
  },

  // Get outfit visual options for sprite generation
  getOutfitVisualOpts: function(outfitKey) {
    var defaultOpts = {};
    
    var outfitOpts = {
      bjjGi: { hasGiCollar: true },
      streetFighter: { hasHeadband: true },
      mkNinja: { hasMask: true },
      wrestlingSinglet: { singletStyle: true },
      championsRobe: { hasRobe: true, hasCape: true }
    };

    return Object.assign({}, defaultOpts, outfitOpts[outfitKey] || {});
  },

  // Save outfit data
  saveOutfitData: function() {
    return JSON.stringify(this.playerOutfitData);
  },

  // Load outfit data
  loadOutfitData: function(jsonStr) {
    try {
      var data = JSON.parse(jsonStr);
      if (data) {
        if (data.equipped && this.OUTFITS[data.equipped]) {
          this.playerOutfitData.equipped = data.equipped;
        }
        if (Array.isArray(data.unlocked)) {
          this.playerOutfitData.unlocked = data.unlocked;
          // Update outfit unlocked status
          var self = this;
          data.unlocked.forEach(function(id) {
            if (self.OUTFITS[id]) self.OUTFITS[id].unlocked = true;
          });
        }
        if (data.defeatedEnemies) {
          this.playerOutfitData.defeatedEnemies = Object.assign(
            {},
            this.playerOutfitData.defeatedEnemies,
            data.defeatedEnemies
          );
        }
      }
    } catch (e) {
      // Fail silently
    }
  }
};

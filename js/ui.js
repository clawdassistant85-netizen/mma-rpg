window.MMA = window.MMA || {};
window.MMA.UI = {
  cooldowns: {
    jab: { remaining: 0, total: 0 },
    heavy: { remaining: 0, total: 0 },
    grapple: { remaining: 0, total: 0 },
    special: { remaining: 0, total: 0 }
  },
  // Fight stats tracking
  fightStats: {
    damageDealt: 0,
    damageTaken: 0,
    hitsLanded: 0,
    hitsTaken: 0,
    longestCombo: 0,
    currentCombo: 0,
    enemiesDefeated: 0,
    critsLanded: 0
  },
  // Combo counter display
  comboCounter: {
    container: null,
    text: null,
    visible: false
  },
  // Hype meter for crowd engagement
  hypeMeter: {
    value: 0,
    maxValue: 100,
    container: null,
    bar: null,
    label: null
  },
  resetFightStats: function() {
    this.fightStats = {
      damageDealt: 0,
      damageTaken: 0,
      hitsLanded: 0,
      hitsTaken: 0,
      longestCombo: 0,
      currentCombo: 0,
      enemiesDefeated: 0,
      critsLanded: 0
    };
  },
  recordHitDealt: function(damage, isCrit, comboCount) {
    this.fightStats.damageDealt += damage;
    this.fightStats.hitsLanded += 1;
    if (isCrit) this.fightStats.critsLanded += 1;
    if (comboCount > this.fightStats.longestCombo) {
      this.fightStats.longestCombo = comboCount;
    }
  },
  recordHitTaken: function(damage) {
    this.fightStats.damageTaken += damage;
    this.fightStats.hitsTaken += 1;
  },
  incrementCombo: function() {
    this.fightStats.currentCombo += 1;
    if (this.fightStats.currentCombo > this.fightStats.longestCombo) {
      this.fightStats.longestCombo = this.fightStats.currentCombo;
    }
  },
  resetCombo: function() {
    this.fightStats.currentCombo = 0;
  },
  recordEnemyDefeated: function() {
    this.fightStats.enemiesDefeated += 1;
  },
  // Combo counter display methods
  showComboCounter: function(scene) {
    if (this.comboCounter.container) return this.comboCounter.container;
    var centerX = scene.cameras.main.width / 2;
    var topY = 80;
    
    var container = scene.add.container(centerX, topY);
    container.setDepth(50);
    container.setAlpha(0);
    
    // Background glow
    var glow = scene.add.graphics();
    glow.fillStyle(0xff6b00, 0.3);
    glow.fillCircle(0, 0, 50);
    container.add(glow);
    
    // Combo text
    var text = scene.add.text(0, 0, '0', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '42px',
      color: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    container.add(text);
    
    // "COMBO" label
    var label = scene.add.text(0, 30, 'COMBO', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(label);
    
    this.comboCounter.container = container;
    this.comboCounter.text = text;
    
    // Fade in
    scene.tweens.add({
      targets: container,
      alpha: 1,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 150,
      ease: 'Back.easeOut',
      onComplete: function() {
        scene.tweens.add({
          targets: container,
          scaleX: 1,
          scaleY: 1,
          duration: 100
        });
      }
    });
    
    return container;
  },
  updateComboCounter: function(scene, count) {
    if (!this.comboCounter.container) {
      this.showComboCounter(scene);
    }
    
    var container = this.comboCounter.container;
    var text = this.comboCounter.text;
    
    // Update text
    text.setText(count > 0 ? count.toString() : '0');
    
    // Pulse effect on increment
    if (count > 0) {
      scene.tweens.add({
        targets: container,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 80,
        yoyo: true,
        ease: 'Quad.easeOut'
      });
      
      // Color intensifies with higher combos
      if (count >= 10) {
        text.setColor('#ff0000');
      } else if (count >= 5) {
        text.setColor('#ff6600');
      } else {
        text.setColor('#ffcc00');
      }
    }
    
    // Show if not visible
    if (count > 0 && !this.comboCounter.visible) {
      container.setAlpha(1);
      this.comboCounter.visible = true;
    }
  },
  hideComboCounter: function(scene) {
    var container = this.comboCounter.container;
    if (!container) return;
    
    scene.tweens.add({
      targets: container,
      alpha: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 200,
      ease: 'Quad.easeIn',
      onComplete: function() {
        container.setVisible(false);
      }
    });
    
    this.comboCounter.visible = false;
  },
  destroyComboCounter: function() {
    if (this.comboCounter.container) {
      this.comboCounter.container.destroy();
      this.comboCounter.container = null;
      this.comboCounter.text = null;
    }
    this.comboCounter.visible = false;
  },
  // Hype meter methods
  showHypeMeter: function(scene) {
    if (this.hypeMeter.container) return this.hypeMeter.container;
    
    var rightX = scene.cameras.main.width - 30;
    var topY = 60;
    
    var container = scene.add.container(rightX, topY);
    container.setDepth(50);
    
    // Background
    var bg = scene.add.graphics();
    bg.fillStyle(0x000000, 0.6);
    bg.fillRoundedRect(-20, -35, 40, 120, 8);
    container.add(bg);
    
    // Label
    var label = scene.add.text(0, -20, 'HYPE', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(label);
    
    // Bar background
    var barBg = scene.add.graphics();
    barBg.fillStyle(0x333333, 0.8);
    barBg.fillRect(-12, -5, 24, 90);
    container.add(barBg);
    
    // Bar fill
    var bar = scene.add.graphics();
    bar.fillStyle(0xff00ff, 1);
    bar.fillRect(-10, 0, 20, 0);
    container.add(bar);
    
    this.hypeMeter.container = container;
    this.hypeMeter.bar = bar;
    this.hypeMeter.label = label;
    
    return container;
  },
  updateHypeMeter: function(scene, value, maxValue) {
    if (!this.hypeMeter.container) {
      this.showHypeMeter(scene);
    }
    
    this.hypeMeter.value = Math.max(0, Math.min(value, maxValue));
    this.hypeMeter.maxValue = maxValue;
    
    var pct = this.hypeMeter.value / maxValue;
    var barHeight = pct * 85;
    
    // Clear and redraw bar
    var bar = this.hypeMeter.bar;
    bar.clear();
    
    // Color based on hype level
    var color;
    if (pct >= 0.8) {
      color = 0xff00ff; // Purple for max hype
    } else if (pct >= 0.5) {
      color = 0x00ffff; // Cyan
    } else {
      color = 0xffff00; // Yellow
    }
    
    bar.fillStyle(color, 1);
    bar.fillRect(-10, 0, 20, -barHeight);
  },
  addHype: function(scene, amount) {
    var newValue = this.hypeMeter.value + amount;
    this.updateHypeMeter(scene, newValue, this.hypeMeter.maxValue);
  },
  drainHype: function(scene, amount) {
    var newValue = this.hypeMeter.value - amount;
    this.updateHypeMeter(scene, newValue, this.hypeMeter.maxValue);
  },
  destroyHypeMeter: function() {
    if (this.hypeMeter.container) {
      this.hypeMeter.container.destroy();
      this.hypeMeter.container = null;
      this.hypeMeter.bar = null;
      this.hypeMeter.label = null;
    }
    this.hypeMeter.value = 0;
  },
  // Fighter Card - visual profile with stats, style, achievements
  fighterCard: {
    stats: { totalFights: 0, wins: 0, losses: 0, enemiesDefeated: 0, totalDamageDealt: 0, totalHitsLanded: 0, longestCombo: 0, critsLanded: 0, perfectBlocks: 0 },
    achievements: [],
    style: 'balanced',
    stylePoints: { strike: 0, grapple: 0 },
    // Legacy Records - personal bests that persist
    legacyRecords: {
      longestCombo: 0,
      totalKOs: 0,
      roomsClearedNoDamage: 0,
      fastestBossKillMs: Infinity,
      totalPerfectBlocks: 0,
      totalCrits: 0,
      highestDamageInSingleFight: 0,
      longestFightMs: 0,
      totalEnemiesDefeated: 0,
      zonesCompleted: 0,
      bossesDefeated: 0,
      highestComboInSingleFight: 0,
      winsWithoutTakingDamage: 0,
      underdogWins: 0,
      speedDemonWins: 0
    }
  },
  ACHIEVEMENTS: {
    firstFight: { id: 'firstFight', name: 'First Blood', desc: 'Win your first fight', icon: '🥊' },
    threeWins: { id: 'threeWins', name: 'Rising Star', desc: 'Win 3 fights', icon: '⭐' },
    tenWins: { id: 'tenWins', name: 'Contender', desc: 'Win 10 fights', icon: '🌟' },
    fiftyWins: { id: 'fiftyWins', name: 'Champion', desc: 'Win 50 fights', icon: '🏆' },
    striker: { id: 'striker', name: 'Striker', desc: 'Land 50 strikes', icon: '👊' },
    grappler: { id: 'grappler', name: 'Grappler', desc: 'Land 20 grapples', icon: '🤼' },
    combo10: { id: 'combo10', name: 'Combo King', desc: 'Hit a 10-hit combo', icon: '💥' },
    combo25: { id: 'combo25', name: 'Unstoppable', desc: 'Hit a 25-hit combo', icon: '🔥' },
    noDamage: { id: 'noDamage', name: 'Untouchable', desc: 'Win without taking damage', icon: '💎' },
    perfectBlock: { id: 'perfectBlock', name: 'Shield', desc: 'Land 10 perfect blocks', icon: '🛡️' },
    speedDemon: { id: 'speedDemon', name: 'Speed Demon', desc: 'Win in under 30 seconds', icon: '⚡' },
    underdog: { id: 'underdog', name: 'Underdog', desc: 'Win with less than 20% HP', icon: '🦁' },
    bossKiller: { id: 'bossKiller', name: 'Boss Killer', desc: 'Defeat a boss enemy', icon: '💀' }
  },
  recordStylePoint: function(type) {
    if (type === 'strike' || type === 'jab' || type === 'cross' || type === 'hook' || type === 'kick') this.fighterCard.stylePoints.strike++;
    else if (type === 'grapple' || type === 'takedown' || type === 'sub') this.fighterCard.stylePoints.grapple++;
    this.updateStyle();
  },
  updateStyle: function() {
    var sp = this.fighterCard.stylePoints;
    if (sp.strike > sp.grapple + 10) this.fighterCard.style = 'striker';
    else if (sp.grapple > sp.strike + 10) this.fighterCard.style = 'grappler';
    else this.fighterCard.style = 'balanced';
  },
  getStyleColor: function() {
    var s = this.fighterCard.style;
    if (s === 'striker') return '#ff4444';
    if (s === 'grappler') return '#4488ff';
    return '#44ff88';
  },
  getStyleLabel: function() {
    var s = this.fighterCard.style;
    if (s === 'striker') return 'STRIKER';
    if (s === 'grappler') return 'GRAPPLER';
    return 'BALANCED';
  },
  checkAchievements: function(fightData) {
    var st = this.fighterCard.stats;
    if (fightData.won && st.wins === 0) this.unlockAchievement('firstFight');
    if (st.wins >= 3 && !this.hasAchievement('threeWins')) this.unlockAchievement('threeWins');
    if (st.wins >= 10 && !this.hasAchievement('tenWins')) this.unlockAchievement('tenWins');
    if (st.wins >= 50 && !this.hasAchievement('fiftyWins')) this.unlockAchievement('fiftyWins');
    if (st.totalHitsLanded >= 50 && !this.hasAchievement('striker')) this.unlockAchievement('striker');
    if ((fightData.grapplesLanded||0) >= 20 && !this.hasAchievement('grappler')) this.unlockAchievement('grappler');
    if (st.longestCombo >= 10 && !this.hasAchievement('combo10')) this.unlockAchievement('combo10');
    if (st.longestCombo >= 25 && !this.hasAchievement('combo25')) this.unlockAchievement('combo25');
    if (fightData.won && fightData.damageTaken === 0 && st.totalFights > 0) this.unlockAchievement('noDamage');
    if (st.perfectBlocks >= 10 && !this.hasAchievement('perfectBlock')) this.unlockAchievement('perfectBlock');
    if (fightData.won && (fightData.duration||0) < 30000 && st.totalFights > 0) this.unlockAchievement('speedDemon');
    if (fightData.won && (fightData.finalHpPercent||0) < 20 && st.totalFights > 0) this.unlockAchievement('underdog');
  },
  // Legacy Records - check and update personal bests
  checkLegacyRecords: function(fightData) {
    var rec = this.fighterCard.legacyRecords;
    var st = this.fighterCard.stats;
    var changed = false;
    
    // Longest combo
    if ((fightData.longestCombo||0) > rec.longestCombo) {
      rec.longestCombo = fightData.longestCombo;
      changed = true;
    }
    
    // Highest combo in single fight
    if ((fightData.longestCombo||0) > rec.highestComboInSingleFight) {
      rec.highestComboInSingleFight = fightData.longestCombo;
      changed = true;
    }
    
    // Total KOs
    rec.totalKOs = st.enemiesDefeated;
    
    // Total enemies defeated
    rec.totalEnemiesDefeated = st.enemiesDefeated;
    
    // Total perfect blocks
    rec.totalPerfectBlocks = st.perfectBlocks;
    
    // Total crits
    rec.totalCrits = st.critsLanded;
    
    // Highest damage in single fight
    if ((fightData.damageDealt||0) > rec.highestDamageInSingleFight) {
      rec.highestDamageInSingleFight = fightData.damageDealt;
      changed = true;
    }
    
    // Longest fight
    if ((fightData.duration||0) > rec.longestFightMs) {
      rec.longestFightMs = fightData.duration;
      changed = true;
    }
    
    // Fastest boss kill
    if (fightData.isBossFight && fightData.won && (fightData.duration||0) > 0 && fightData.duration < rec.fastestBossKillMs) {
      rec.fastestBossKillMs = fightData.duration;
      changed = true;
    }
    
    // Rooms cleared without taking damage
    if (fightData.won && fightData.damageTaken === 0 && fightData.isRoomClear) {
      rec.roomsClearedNoDamage++;
      changed = true;
    }
    
    // Wins without taking damage
    if (fightData.won && fightData.damageTaken === 0 && st.totalFights > 0) {
      rec.winsWithoutTakingDamage++;
      changed = true;
    }
    
    // Underdog wins (won with < 20% HP)
    if (fightData.won && (fightData.finalHpPercent||0) < 20 && st.totalFights > 0) {
      rec.underdogWins++;
      changed = true;
    }
    
    // Speed demon wins (won in under 30 seconds)
    if (fightData.won && (fightData.duration||0) < 30000 && st.totalFights > 0) {
      rec.speedDemonWins++;
      changed = true;
    }
    
    // Zones completed
    if (fightData.zoneCompleted) {
      rec.zonesCompleted = Math.max(rec.zonesCompleted, fightData.currentZone||1);
      changed = true;
    }
    
    // Bosses defeated
    if (fightData.bossDefeated) {
      rec.bossesDefeated++;
      changed = true;
    }
    
    if (changed) this.saveLegacyRecords();
    return changed;
  },
  // Save legacy records to localStorage
  saveLegacyRecords: function() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      var key = 'mma-rpg-legacy';
      window.localStorage.setItem(key, JSON.stringify(this.fighterCard.legacyRecords));
    } catch (e) {}
  },
  // Load legacy records from localStorage
  loadLegacyRecords: function() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      var key = 'mma-rpg-legacy';
      var raw = window.localStorage.getItem(key);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return;
      // Merge with defaults
      var rec = this.fighterCard.legacyRecords;
      for (var k in data) {
        if (rec.hasOwnProperty(k)) {
          rec[k] = data[k];
        }
      }
    } catch (e) {}
  },
  unlockAchievement: function(achId) {
    if (this.hasAchievement(achId)) return;
    this.fighterCard.achievements.push(achId);
  },
  hasAchievement: function(achId) { return this.fighterCard.achievements.indexOf(achId) !== -1; },
  updateCareerStats: function(fightData) {
    var st = this.fighterCard.stats;
    st.totalFights++;
    if (fightData.won) st.wins++; else st.losses++;
    st.enemiesDefeated += fightData.enemiesDefeated || 0;
    st.totalDamageDealt += fightData.damageDealt || 0;
    st.totalHitsLanded += fightData.hitsLanded || 0;
    if ((fightData.longestCombo||0) > st.longestCombo) st.longestCombo = fightData.longestCombo;
    st.critsLanded += fightData.critsLanded || 0;
    st.perfectBlocks += fightData.perfectBlocks || 0;
    this.checkAchievements(fightData);
    this.checkLegacyRecords(fightData);
  },
  showFighterCard: function(scene) {
    var self = this, W = scene.cameras.main.width, H = scene.cameras.main.height;
    var cw = Math.min(380, W - 60), ch = Math.min(500, H - 60);
    var cx = (W - cw) / 2, cy = (H - ch) / 2;
    var con = scene.add.container(cx, cy); con.setDepth(200);
    var g = scene.add.graphics();
    g.fillStyle(0x000000, 0.9); g.fillRoundedRect(0, 0, cw, ch, 16);
    g.lineStyle(3, 0xe8c830, 1); g.strokeRoundedRect(0, 0, cw, ch, 16);
    con.add(g);
    var hdr = scene.add.graphics(); hdr.fillStyle(0x1a1a2e, 1); hdr.fillRoundedRect(4, 4, cw - 8, 60, 12); con.add(hdr);
    var icn = scene.add.text(30, 34, '🥊', { fontSize: '36px' }).setOrigin(0.5); con.add(icn);
    var ttl = scene.add.text(70, 20, 'FIGHTER CARD', { fontFamily: 'Arial Black, sans-serif', fontSize: '22px', color: '#e8c830' }).setOrigin(0, 0.5); con.add(ttl);
    var stc = this.getStyleColor(), stl = this.getStyleLabel();
    var stt = scene.add.text(70, 42, stl, { fontSize: '12px', color: stc, fontStyle: 'bold' }).setOrigin(0, 0.5); con.add(stt);
    var st = this.fighterCard.stats, sy = 80, c1x = 20, c2x = cw / 2 + 10;
    con.add(scene.add.text(c1x, sy, 'CAREER STATS', { fontSize: '11px', color: '#888888', fontStyle: 'bold' }).setDepth(10));
    ['Record: '+st.wins+'W - '+st.losses+'L', 'Fights: '+st.totalFights, 'KOs: '+st.enemiesDefeated, 'Damage: '+st.totalDamageDealt, 'Hits: '+st.totalHitsLanded, 'Best Combo: '+st.longestCombo, 'Crits: '+st.critsLanded].forEach(function(line, i) {
      con.add(scene.add.text(i<4?c1x:c2x, sy+18+(i%4)*18, line, { fontSize: '13px', color: '#ffffff' }).setDepth(10));
    });
    var ay = sy + 90; con.add(scene.add.text(c1x, ay, 'ACHIEVEMENTS', { fontSize: '11px', color: '#888888', fontStyle: 'bold' }).setDepth(10));
    var al = Object.keys(this.ACHIEVEMENTS), ar = 4, as = 36, asy = ay + 20;
    al.forEach(function(aid, idx) {
      var has = self.hasAchievement(aid), inf = self.ACHIEVEMENTS[aid], col = idx%ar, row = Math.floor(idx/ar);
      var ax = c1x + 8 + col*(as+8), ay2 = asy + row*(as+8);
      var bbg = scene.add.graphics(); bbg.fillStyle(has?0x333333:0x111111,1); bbg.fillCircle(ax+as/2, ay2+as/2, as/2);
      if(has){ bbg.lineStyle(2,0xe8c830,1); bbg.strokeCircle(ax+as/2, ay2+as/2, as/2); }
      con.add(bbg); con.add(scene.add.text(ax+as/2, ay2+as/2, has?inf.icon:'?', { fontSize: has?'18px':'14px', color: has?'#ffffff':'#444444' }).setOrigin(0.5).setDepth(10));
    });
    // Legacy Records section
    var rec = this.fighterCard.legacyRecords;
    var ly = ay + 100;
    // Calculate dynamic height based on how many rows we need
    var lh = 85; 
    if (ch < ly + lh + 30) { ch = ly + lh + 30; con.removeAll(); con.add(g); con.add(hdr); con.add(icn); con.add(ttl); con.add(stt); }
    con.add(scene.add.text(c1x, ly, 'LEGACY RECORDS', { fontSize: '11px', color: '#ff8800', fontStyle: 'bold' }).setDepth(10));
    var lrLines = [];
    if (rec.longestCombo > 0) lrLines.push('Best Combo: ' + rec.longestCombo);
    if (rec.totalKOs > 0) lrLines.push('Total KOs: ' + rec.totalKOs);
    if (rec.roomsClearedNoDamage > 0) lrLines.push('No-Damage Rooms: ' + rec.roomsClearedNoDamage);
    if (rec.bossesDefeated > 0) lrLines.push('Bosses: ' + rec.bossesDefeated);
    if (rec.zonesCompleted > 0) lrLines.push('Zones: ' + rec.zonesCompleted);
    if (rec.winsWithoutTakingDamage > 0) lrLines.push('Perfect Wins: ' + rec.winsWithoutTakingDamage);
    if (rec.underdogWins > 0) lrLines.push('Underdog Wins: ' + rec.underdogWins);
    if (rec.speedDemonWins > 0) lrLines.push('Speed Wins: ' + rec.speedDemonWins);
    if (rec.fastestBossKillMs < Infinity) {
      var bossSec = Math.round(rec.fastestBossKillMs / 1000);
      lrLines.push('Fastest Boss: ' + bossSec + 's');
    }
    if (rec.highestDamageInSingleFight > 0) lrLines.push('Max Dmg: ' + rec.highestDamageInSingleFight);
    if (lrLines.length === 0) lrLines.push('No records yet!');
    lrLines.forEach(function(line, i) {
      con.add(scene.add.text(c1x + 5, ly + 15 + i * 14, line, { fontSize: '12px', color: '#ffaa44' }).setDepth(10));
    });
    con.add(scene.add.text(cw/2, ch-15, 'Press I or ESC to close', { fontSize: '12px', color: '#666666' }).setOrigin(0.5).setDepth(10));
    con.close = function() { scene.tweens.add({ targets: con, alpha: 0, scaleX: 0.9, scaleY: 0.9, duration: 150, onComplete: function(){ con.destroy(); } }); };
    con.setAlpha(0); con.setScale(0.9);
    scene.tweens.add({ targets: con, alpha: 1, scaleX: 1, scaleY: 1, duration: 200, ease: 'Back.easeOut' });
    return con;
  },
  showFightStats: function(scene) {
    var stats = this.fightStats;
    var centerX = scene.cameras.main.width / 2;
    var centerY = scene.cameras.main.height / 2;
    
    // Container
    var container = scene.add.container(centerX, centerY);
    container.setDepth(100);
    
    // Background
    var bg = scene.add.graphics();
    bg.fillStyle(0x000000, 0.85);
    bg.fillRoundedRect(-160, -120, 320, 240, 16);
    bg.lineStyle(3, 0xe8c830, 1);
    bg.strokeRoundedRect(-160, -120, 320, 240, 16);
    container.add(bg);
    
    // Title
    var title = scene.add.text(0, -95, 'FIGHT STATS', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#e8c830',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(title);
    
    // Stats lines
    var statsText = [
      'Damage Dealt: ' + stats.damageDealt,
      'Damage Taken: ' + stats.damageTaken,
      'Hits Landed: ' + stats.hitsLanded,
      'Hits Taken: ' + stats.hitsTaken,
      'Longest Combo: ' + stats.longestCombo,
      'Enemies Defeated: ' + stats.enemiesDefeated,
      'Crits: ' + stats.critsLanded
    ];
    
    var yOffset = -55;
    statsText.forEach(function(line, i) {
      var txt = scene.add.text(0, yOffset + (i * 22), line, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        color: '#ffffff'
      }).setOrigin(0.5);
      container.add(txt);
    });
    
    // Auto-dismiss after 3 seconds
    scene.time.delayedCall(3000, function() {
      container.destroy();
    });
    
    return container;
  },
  cooldownActive: false,
  setCooldown: function(action, durationMs) {
    if (!this.cooldowns[action]) return;
    this.cooldowns[action].total = durationMs;
    this.cooldowns[action].remaining = durationMs;
    this.cooldownActive = true;
    this._updateCooldownUI(action);
  },
  updateCooldowns: function(deltaMs) {
    if (!this.cooldownActive) return;
    var anyActive = false;
    var self = this;
    Object.keys(this.cooldowns).forEach(function(action) {
      var cd = self.cooldowns[action];
      if (cd.remaining > 0) {
        cd.remaining = Math.max(0, cd.remaining - deltaMs);
        self._updateCooldownUI(action);
        anyActive = true;
      }
    });
    this.cooldownActive = anyActive;
  },
  _updateCooldownUI: function(action) {
    var btn = document.querySelector('.action-btn[data-action="' + action + '"]');
    if (!btn) return;
    var cd = this.cooldowns[action];
    var overlay = btn.querySelector('.cooldown-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'cooldown-overlay';
      btn.appendChild(overlay);
    }
    var pct = cd.total > 0 ? (cd.remaining / cd.total) * 100 : 0;
    overlay.style.height = pct + '%';
    if (cd.remaining > 0) {
      btn.classList.add('on-cooldown');
    } else {
      btn.classList.remove('on-cooldown');
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }
  },
  clearCooldown: function(action) {
    if (!this.cooldowns[action]) return;
    this.cooldowns[action].remaining = 0;
    this._updateCooldownUI(action);
  },
  clearAllCooldowns: function() {
    var self = this;
    Object.keys(this.cooldowns).forEach(function(action) {
      self.clearCooldown(action);
    });
    this.cooldownActive = false;
  },
  isOnCooldown: function(action) {
    return this.cooldowns[action] ? this.cooldowns[action].remaining > 0 : false;
  },
  showDamageText: function(scene, x, y, text, color) {
    var t = scene.add.text(x, y, text, { fontSize: '16px', color: color || '#ff4444', stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5).setDepth(10);
    scene.tweens.add({ targets: t, y: y - 40, alpha: 0, duration: 600, onComplete: function() { t.destroy(); } });
  },
  // Settings Menu
  settings: {
    difficulty: 'normal',
    soundVolume: 0.8,
    musicVolume: 0.6,
    showHud: true,
    vibration: true
  },
  showSettingsMenu: function(scene) {
    var self = this;
    var W = scene.cameras.main.width;
    var H = scene.cameras.main.height;
    var cw = Math.min(340, W - 60);
    var ch = Math.min(420, H - 80);
    var cx = (W - cw) / 2;
    var cy = (H - ch) / 2;
    var con = scene.add.container(cx, cy);
    con.setDepth(200);
    
    var g = scene.add.graphics();
    g.fillStyle(0x000000, 0.92);
    g.fillRoundedRect(0, 0, cw, ch, 16);
    g.lineStyle(3, 0x4488ff, 1);
    g.strokeRoundedRect(0, 0, cw, ch, 16);
    con.add(g);
    
    var hdr = scene.add.graphics();
    hdr.fillStyle(0x1a2a4a, 1);
    hdr.fillRoundedRect(4, 4, cw - 8, 50, 12);
    con.add(hdr);
    
    var title = scene.add.text(cw / 2, 29, 'SETTINGS', { fontFamily: 'Arial Black, sans-serif', fontSize: '20px', color: '#4488ff' }).setOrigin(0.5);
    con.add(title);
    
    var startY = 70;
    var rowHeight = 55;
    var labelX = 30;
    var controlX = cw - 90;
    
    // Difficulty
    var diffLabel = scene.add.text(labelX, startY, 'Difficulty', { fontSize: '14px', color: '#ffffff' }).setOrigin(0, 0.5);
    con.add(diffLabel);
    
    var difficulties = ['easy', 'normal', 'hard'];
    var diffColors = { easy: '#44ff88', normal: '#ffff44', hard: '#ff4444' };
    difficulties.forEach(function(diff, i) {
      var diffX = controlX + i * 42;
      var btn = scene.add.container(diffX, startY);
      var bg = scene.add.graphics();
      var isActive = self.settings.difficulty === diff;
      bg.fillStyle(isActive ? diffColors[diff] : 0x333333, 1);
      bg.fillRoundedRect(-18, -12, 36, 24, 6);
      if (isActive) { bg.lineStyle(2, diffColors[diff], 1); bg.strokeRoundedRect(-18, -12, 36, 24, 6); }
      btn.add(bg);
      var txt = scene.add.text(0, 0, diff.charAt(0).toUpperCase(), { fontSize: '11px', color: isActive ? '#000000' : '#888888', fontStyle: 'bold' }).setOrigin(0.5);
      btn.add(txt);
      btn.setSize(36, 24);
      btn.setInteractive({ useHandCursor: true });
      btn.on('pointerdown', function() { self.settings.difficulty = diff; self.showSettingsMenu(scene); });
      con.add(btn);
    });
    
    // SFX Volume
    var soundY = startY + rowHeight;
    con.add(scene.add.text(labelX, soundY, 'SFX Volume', { fontSize: '14px', color: '#ffffff' }).setOrigin(0, 0.5));
    this._createSlider(scene, con, controlX + 40, soundY, this.settings.soundVolume, function(val) { self.settings.soundVolume = val; self._applyVolumeSettings(); });
    
    // Music Volume
    var musicY = startY + rowHeight * 2;
    con.add(scene.add.text(labelX, musicY, 'Music Volume', { fontSize: '14px', color: '#ffffff' }).setOrigin(0, 0.5));
    this._createSlider(scene, con, controlX + 40, musicY, this.settings.musicVolume, function(val) { self.settings.musicVolume = val; self._applyVolumeSettings(); });
    
    // Vibration toggle
    var vibY = startY + rowHeight * 3;
    con.add(scene.add.text(labelX, vibY, 'Vibration', { fontSize: '14px', color: '#ffffff' }).setOrigin(0, 0.5));
    var vibToggle = scene.add.container(cw - 60, vibY);
    var vibBg = scene.add.graphics();
    var isVibOn = this.settings.vibration;
    vibBg.fillStyle(isVibOn ? 0x44ff88 : 0x333333, 1);
    vibBg.fillRoundedRect(-20, -12, 40, 24, 12);
    vibToggle.add(vibBg);
    var vibKnob = scene.add.graphics();
    vibKnob.fillStyle(0xffffff, 1);
    vibKnob.fillCircle(isVibOn ? 8 : -8, 0, 8);
    vibToggle.add(vibKnob);
    vibToggle.setSize(40, 24);
    vibToggle.setInteractive({ useHandCursor: true });
    vibToggle.on('pointerdown', function() { self.settings.vibration = !self.settings.vibration; self.showSettingsMenu(scene); });
    con.add(vibToggle);
    
    // HUD toggle
    var hudY = startY + rowHeight * 4;
    con.add(scene.add.text(labelX, hudY, 'Show HUD', { fontSize: '14px', color: '#ffffff' }).setOrigin(0, 0.5));
    var hudToggle = scene.add.container(cw - 60, hudY);
    var hudBg = scene.add.graphics();
    var isHudOn = this.settings.showHud;
    hudBg.fillStyle(isHudOn ? 0x44ff88 : 0x333333, 1);
    hudBg.fillRoundedRect(-20, -12, 40, 24, 12);
    hudToggle.add(hudBg);
    var hudKnob = scene.add.graphics();
    hudKnob.fillStyle(0xffffff, 1);
    hudKnob.fillCircle(isHudOn ? 8 : -8, 0, 8);
    hudToggle.add(hudKnob);
    hudToggle.setSize(40, 24);
    hudToggle.setInteractive({ useHandCursor: true });
    hudToggle.on('pointerdown', function() { self.settings.showHud = !self.settings.showHud; self.showSettingsMenu(scene); });
    con.add(hudToggle);
    
    con.add(scene.add.text(cw / 2, ch - 25, 'Press ESC to close', { fontSize: '11px', color: '#666666' }).setOrigin(0.5));
    
    con.close = function() { scene.tweens.add({ targets: con, alpha: 0, scaleX: 0.9, scaleY: 0.9, duration: 150, onComplete: function(){ con.destroy(); } }); };
    con.setAlpha(0);
    con.setScale(0.9);
    scene.tweens.add({ targets: con, alpha: 1, scaleX: 1, scaleY: 1, duration: 200, ease: 'Back.easeOut' });
    return con;
  },
  _createSlider: function(scene, container, x, y, initialValue, onChange) {
    var track = scene.add.graphics();
    track.fillStyle(0x333333, 1);
    track.fillRoundedRect(-60, -6, 120, 12, 6);
    container.add(track);
    var fill = scene.add.graphics();
    fill.fillStyle(0x4488ff, 1);
    fill.fillRoundedRect(-60, -6, 120 * initialValue, 12, 6);
    container.add(fill);
    var knob = scene.add.graphics();
    knob.fillStyle(0xffffff, 1);
    knob.fillCircle(-60 + 120 * initialValue, 0, 10);
    container.add(knob);
    var slider = scene.add.container(x, y);
    slider.setSize(120, 20);
    slider.setInteractive({ useHandCursor: true });
    slider.on('pointerdown', function(pointer) {
      var val = Math.max(0, Math.min(1, (pointer.x - x + 60) / 120));
      fill.clear(); fill.fillStyle(0x4488ff, 1); fill.fillRoundedRect(-60, -6, 120 * val, 12, 6);
      knob.clear(); knob.fillStyle(0xffffff, 1); knob.fillCircle(-60 + 120 * val, 0, 10);
      if (onChange) onChange(val);
    });
    slider.on('pointermove', function(pointer) {
      if (pointer.isDown) {
        var val = Math.max(0, Math.min(1, (pointer.x - x + 60) / 120));
        fill.clear(); fill.fillStyle(0x4488ff, 1); fill.fillRoundedRect(-60, -6, 120 * val, 12, 6);
        knob.clear(); knob.fillStyle(0xffffff, 1); knob.fillCircle(-60 + 120 * val, 0, 10);
        if (onChange) onChange(val);
      }
    });
    container.add(slider);
    return slider;
  },
  _applyVolumeSettings: function() {
    if (window.MMA_AUDIO && window.MMA_AUDIO.sfxGain) { window.MMA_AUDIO.sfxGain.gain.value = this.settings.soundVolume; }
  },
  getDifficultyMultiplier: function() {
    var diff = this.settings.difficulty;
    if (diff === 'easy') return 0.75;
    if (diff === 'hard') return 1.5;
    return 1.0;
  },
  getEnemyHpMultiplier: function() {
    var diff = this.settings.difficulty;
    if (diff === 'easy') return 0.7;
    if (diff === 'hard') return 1.5;
    return 1.0;
  },
  updateHUDRegistry: function(scene) {
    scene.registry.set('playerStats', {
      hp: Math.round(scene.player.stats.hp),
      maxHp: scene.player.stats.maxHp,
      stamina: Math.round(scene.player.stats.stamina),
      maxStamina: scene.player.stats.maxStamina,
      xp: scene.player.stats.xp,
      level: scene.player.stats.level
    });
    this.updateGroundHUD(scene);
  },
  setActionButtonLabels: function(groundActive) {
    var labels = groundActive ? {
      jab: 'G&P',
      heavy: 'Elbow',
      grapple: 'Submit',
      special: 'Stand Up'
    } : {
      jab: 'Jab',
      heavy: 'Heavy',
      grapple: 'Grapple',
      special: 'Special'
    };
    Object.keys(labels).forEach(function(action) {
      var btn = document.querySelector('.action-btn[data-action="' + action + '"]');
      if (btn) btn.textContent = labels[action];
    });
  },
  showGroundBanner: function(text) {
    var el = document.getElementById('ground-banner');
    if (!el) return;
    el.textContent = text || 'GROUND GAME';
    el.classList.add('active');
    setTimeout(function() { el.classList.remove('active'); }, 900);
  },
  updateGroundHUD: function(scene) {
    var overlay = document.getElementById('ground-overlay');
    var timerFill = document.getElementById('ground-timer-fill');
    if (!overlay || !timerFill) return;
    var active = !!(scene.groundState && scene.groundState.active);
    overlay.style.display = active ? 'block' : 'none';
    if (active) {
      var pct = Math.max(0, Math.min(1, scene.groundState.timer / 10000));
      timerFill.style.width = (pct * 100) + '%';
    }
  },
  handleResponsiveLayout: function() {
    if (window.phaserGame && window.phaserGame.scale) window.phaserGame.scale.refresh();
    var landscape = window.innerWidth > window.innerHeight;
    var dpad = document.getElementById("dpad");
    var cluster = document.getElementById("action-cluster");
    var startBtn = document.getElementById("dom-start-btn");
    if (!dpad || !cluster) return;
    var minDim = Math.min(window.innerWidth, window.innerHeight);
    var maxDim = Math.max(window.innerWidth, window.innerHeight);
    var dpadSize = landscape ? Math.min(100, minDim * 0.15) : Math.min(90, minDim * 0.22);
    var dpadBtnSize = Math.floor(dpadSize * 0.38); var dpadBtnFont = Math.floor(dpadSize * 0.18);
    var clusterWidth = landscape ? Math.min(150, maxDim * 0.18) : Math.min(140, minDim * 0.35);
    var clusterHeight = landscape ? Math.min(130, minDim * 0.2) : Math.min(120, minDim * 0.3);
    var actionBtnWidth = Math.floor(clusterWidth * 0.4); var actionBtnHeight = Math.floor(clusterHeight * 0.32); var actionBtnFont = Math.floor(actionBtnHeight * 0.35);
    dpad.style.width = dpadSize + "px"; dpad.style.height = dpadSize + "px"; dpad.style.left = landscape ? "2vw" : "2.5vw"; dpad.style.bottom = landscape ? "1vh" : "2vh";
    dpad.querySelectorAll(".dpad-btn").forEach(function(btn){ btn.style.width = dpadBtnSize + "px"; btn.style.height = dpadBtnSize + "px"; btn.style.fontSize = dpadBtnFont + "px"; btn.style.lineHeight = dpadBtnSize + "px"; });
    var up = dpad.querySelector(".dpad-up"), down = dpad.querySelector(".dpad-down"), left = dpad.querySelector(".dpad-left"), right = dpad.querySelector(".dpad-right");
    var c = dpadSize / 2, off = (dpadSize - dpadBtnSize) / 2;
    if (up) { up.style.left = c - dpadBtnSize / 2 + "px"; up.style.top = off + "px"; }
    if (down) { down.style.left = c - dpadBtnSize / 2 + "px"; down.style.bottom = off + "px"; }
    if (left) { left.style.left = off + "px"; left.style.top = c - dpadBtnSize / 2 + "px"; }
    if (right) { right.style.right = off + "px"; right.style.top = c - dpadBtnSize / 2 + "px"; }
    cluster.style.width = clusterWidth + "px"; cluster.style.height = clusterHeight + "px"; cluster.style.right = landscape ? "2vw" : "2.5vw"; cluster.style.bottom = landscape ? "1vh" : "2.5vh";
    cluster.querySelectorAll(".action-btn").forEach(function(btn){ btn.style.width = actionBtnWidth + "px"; btn.style.height = actionBtnHeight + "px"; btn.style.fontSize = actionBtnFont + "px"; btn.style.lineHeight = actionBtnHeight + "px"; });
    var jab = cluster.querySelector("[data-action=\"jab\"]"); var heavy = cluster.querySelector("[data-action=\"heavy\"]"); var grapple = cluster.querySelector("[data-action=\"grapple\"]"); var special = cluster.querySelector("[data-action=\"special\"]");
    var hOffset = (clusterWidth - actionBtnWidth) / 2;
    var topPad = 4;
    var sidePad = 2;
    var midY = Math.round((clusterHeight - actionBtnHeight) / 2);
    if (jab) { jab.style.left = hOffset + "px"; jab.style.top = topPad + "px"; }
    if (heavy) { heavy.style.right = sidePad + "px"; heavy.style.top = midY + "px"; }
    if (grapple) { grapple.style.left = sidePad + "px"; grapple.style.top = midY + "px"; }
    if (special) { special.style.left = hOffset + "px"; special.style.bottom = topPad + "px"; }
    if (startBtn) { startBtn.style.bottom = landscape ? "6%" : "9%"; var fs = Math.min(20, Math.floor(minDim * 0.04)); startBtn.style.fontSize = fs + "px"; startBtn.style.padding = (fs * 0.8) + "px " + (fs * 1.7) + "px"; }
  }
};

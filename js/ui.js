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
    // Deactivate health pulse on fight reset
    this.deactivateHealthPulse();
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
  // Fighter's Diary - auto-logged milestones and memorable moments
  fighterDiary: {
    entries: [], // { id, text, timestamp, icon, type }
    milestoneThresholds: [5, 10, 25, 50, 100], // Unlock lore at these milestone counts
    unlockedLore: [], // Array of lore snippets unlocked
    loreSnippets: [
      { threshold: 5, title: "First Steps", text: "Your journey as a fighter begins. Every master was once a beginner." },
      { threshold: 10, title: "Finding Your Style", text: "You start to gravitate toward a particular fighting style. The ring reveals your nature." },
      { threshold: 25, title: "Rising Threat", text: "Rumors spread of a new fighter making waves. The Underground takes notice." },
      { threshold: 50, title: "Contender Status", text: "You're no longer an unknown. Other fighters study your techniques." },
      { threshold: 100, title: "Legend Status", text: "Your name echoes through the arena. They've stopped underestimating you." }
    ]
  },
  // Record a diary entry
  recordDiaryEntry: function(text, type, icon) {
    var entry = {
      id: Date.now(),
      text: text,
      type: type || 'milestone',
      icon: icon || '📝',
      timestamp: Date.now()
    };
    this.fighterDiary.entries.unshift(entry); // Add to front
    // Keep only last 50 entries
    if (this.fighterDiary.entries.length > 50) {
      this.fighterDiary.entries = this.fighterDiary.entries.slice(0, 50);
    }
    this.saveFighterDiary();
    return entry;
  },
  // Check and unlock lore based on total fights
  checkLoreUnlocks: function() {
    var totalFights = this.fighterCard.stats.totalFights;
    var self = this;
    this.fighterDiary.loreSnippets.forEach(function(lore) {
      if (totalFights >= lore.threshold && self.fighterDiary.unlockedLore.indexOf(lore.threshold) === -1) {
        self.fighterDiary.unlockedLore.push(lore.threshold);
        // Also record as diary entry
        self.recordDiaryEntry(lore.title + ': ' + lore.text, 'lore', '📜');
      }
    });
  },
  // Save/load diary
  saveFighterDiary: function() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      var key = 'mma-rpg-diary';
      var data = {
        entries: this.fighterDiary.entries,
        unlockedLore: this.fighterDiary.unlockedLore
      };
      window.localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {}
  },
  loadFighterDiary: function() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      var key = 'mma-rpg-diary';
      var raw = window.localStorage.getItem(key);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return;
      if (data.entries) this.fighterDiary.entries = data.entries;
      if (data.unlockedLore) this.fighterDiary.unlockedLore = data.unlockedLore;
    } catch (e) {}
  },
  // Show Fighter's Diary as a popup
  showFighterDiary: function(scene) {
    var self = this;
    var W = scene.cameras.main.width;
    var H = scene.cameras.main.height;
    var cw = Math.min(360, W - 40);
    var ch = Math.min(480, H - 40);
    var cx = (W - cw) / 2;
    var cy = (H - ch) / 2;
    var con = scene.add.container(cx, cy);
    con.setDepth(200);

    // Background
    var g = scene.add.graphics();
    g.fillStyle(0x000000, 0.92);
    g.fillRoundedRect(0, 0, cw, ch, 16);
    g.lineStyle(3, 0x44ffaa, 1);
    g.strokeRoundedRect(0, 0, cw, ch, 16);
    con.add(g);

    // Header
    var hdr = scene.add.graphics();
    hdr.fillStyle(0x1a3a2a, 1);
    hdr.fillRoundedRect(4, 4, cw - 8, 50, 12);
    con.add(hdr);

    var title = scene.add.text(cw / 2, 29, '📖 FIGHTER\'S DIARY', { fontFamily: 'Arial Black, sans-serif', fontSize: '16px', color: '#44ffaa' }).setOrigin(0.5);
    con.add(title);

    // Scroll container for entries
    var contentY = 65;
    var contentH = ch - 120;
    var contentBg = scene.add.graphics();
    contentBg.fillStyle(0x0a1a14, 1);
    contentBg.fillRoundedRect(10, contentY, cw - 20, contentH, 8);
    con.add(contentBg);

    var entriesContainer = scene.add.container(0, contentY);
    con.add(entriesContainer);

    // Render diary entries
    var entries = this.fighterDiary.entries.slice(0, 8); // Show up to 8 entries
    if (entries.length === 0) {
      var emptyText = scene.add.text(cw / 2 - 20, contentY + contentH / 2, 'No entries yet.\nKeep fighting!', { fontSize: '14px', color: '#666666', align: 'center' }).setOrigin(0.5);
      entriesContainer.add(emptyText);
    } else {
      entries.forEach(function(entry, idx) {
        var y = 10 + idx * 48;
        if (y > contentH - 50) return;
        
        // Entry background
        var entryBg = scene.add.graphics();
        entryBg.fillStyle(0x1a2a22, 0.8);
        entryBg.fillRoundedRect(15, y, cw - 50, 42, 6);
        entriesContainer.add(entryBg);
        
        // Entry icon
        var icon = scene.add.text(25, y + 21, entry.icon, { fontSize: '18px' }).setOrigin(0, 0.5);
        entriesContainer.add(icon);
        
        // Entry text
        var entryText = scene.add.text(50, y + 12, entry.text.substring(0, 40) + (entry.text.length > 40 ? '...' : ''), { fontSize: '12px', color: '#aaffcc' }).setOrigin(0, 0);
        entriesContainer.add(entryText);
        
        // Timestamp
        var date = new Date(entry.timestamp);
        var timeStr = date.toLocaleDateString();
        var timeText = scene.add.text(50, y + 26, timeStr, { fontSize: '10px', color: '#668877' }).setOrigin(0, 0);
        entriesContainer.add(timeText);
      });
    }

    // Lore section
    var loreY = ch - 45;
    var loreTitle = scene.add.text(20, loreY, 'LORE UNLOCKED: ' + this.fighterDiary.unlockedLore.length + '/' + this.fighterDiary.loreSnippets.length, { fontSize: '11px', color: '#ffaa44', fontStyle: 'bold' }).setOrigin(0, 0.5);
    con.add(loreTitle);

    // Close button
    var closeBtn = scene.add.text(cw / 2, ch - 18, 'CLOSE', {
      fontSize: '13px',
      color: '#ffffff',
      backgroundColor: '#225544',
      padding: { left: 16, right: 16, top: 6, bottom: 6 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    con.add(closeBtn);

    con.close = function() {
      scene.tweens.add({
        targets: con,
        alpha: 0,
        scaleX: 0.9,
        scaleY: 0.9,
        duration: 150,
        onComplete: function() { con.destroy(); }
      });
    };
    closeBtn.on('pointerdown', function() { con.close(); });

    con.setAlpha(0);
    con.setScale(0.9);
    scene.tweens.add({
      targets: con,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });

    return con;
  },
  // Helper to record specific milestones
  recordMilestone: function(type, data) {
    var entry = null;
    switch(type) {
      case 'grapple_ko':
        entry = this.recordDiaryEntry('First KO with a grapple!', 'achievement', '🤼');
        break;
      case 'survived_boss':
        var seconds = Math.round(data.duration / 1000);
        entry = this.recordDiaryEntry('Survived ' + seconds + 's vs ' + (data.bossName || 'Boss'), 'survival', '⏱️');
        break;
      case 'combo_streak':
        entry = this.recordDiaryEntry('5-hit combo streak x' + data.count + '!', 'combo', '💥');
        break;
      case 'first_win':
        entry = this.recordDiaryEntry('Won first fight! The journey begins.', 'first', '🥊');
        break;
      case 'boss_defeated':
        entry = this.recordDiaryEntry('Defeated ' + (data.bossName || 'a boss') + '!', 'boss', '💀');
        break;
      case 'zone_clear':
        entry = this.recordDiaryEntry('Cleared Zone ' + data.zone + '!', 'zone', '🏆');
        break;
      case 'perfect_fight':
        entry = this.recordDiaryEntry('Won without taking damage!', 'perfect', '💎');
        break;
      case 'underdog_win':
        entry = this.recordDiaryEntry('Underdog victory! Won with low HP.', 'underdog', '🦁');
        break;
      case 'speed_demon':
        var seconds = Math.round(data.duration / 1000);
        entry = this.recordDiaryEntry('Speed Demon! Won in ' + seconds + 's.', 'speed', '⚡');
        break;
      case 'crit_combo':
        entry = this.recordDiaryEntry('Landed ' + data.count + ' crits in one fight!', 'crit', '🎯');
        break;
      case 'style_master':
        entry = this.recordDiaryEntry('Mastered ' + data.style + ' style!', 'style', '🔥');
        break;
    }
    this.checkLoreUnlocks();
    return entry;
  },
  // Fighter Card - visual profile with stats, style, achievements
  fighterCard: {
    stats: { totalFights: 0, wins: 0, losses: 0, enemiesDefeated: 0, totalDamageDealt: 0, totalHitsLanded: 0, longestCombo: 0, critsLanded: 0, perfectBlocks: 0 },
    achievements: [],
    style: 'balanced',
    stylePoints: { strike: 0, grapple: 0 },
    // Move usage tracking for Style DNA Breakdown
    moveUsageStats: {
      jab: 0, cross: 0, hook: 0, kick: 0, uppercut: 0, // strikes
      takedown: 0, grapple: 0, submission: 0, clinch: 0, // grapples
      special: 0, counter: 0, dodge: 0, block: 0 // other
    },
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
  // Trophy Room - collection of bosses, elites, and rare items
  trophyRoom: {
    bosses: [], // { id, name, zone, dateDefeated, fightDuration }
    eliteEnemies: [], // { type, zone, dateDefeated }
    rareItems: [], // { id, name, type, dateAcquired, rarity }
    // Known boss definitions for display
    bossRegistry: {
      'shadow': { name: 'Shadow', zone: 1, icon: '👤', desc: 'Your rival' },
      'heavyweights': { name: 'The Heavyweights', zone: 1, icon: '💪', desc: 'Twin enforcers' },
      'grapple_master': { name: 'Grapple Master', zone: 2, icon: '🤼', desc: 'Ground game expert' },
      'striker_king': { name: 'Striker King', zone: 2, icon: '👊', desc: 'Fists of fury' },
      'coach': { name: 'The Coach', zone: 2, icon: '🎓', desc: 'Enemy support specialist' },
      'elite_kickboxer': { name: 'Elite Kickboxer', zone: 3, icon: '🦵', desc: 'Advanced striker' },
      'elite_wrestler': { name: 'Elite Wrestler', zone: 3, icon: '🏋️', desc: 'Elite grappler' },
      'champion': { name: 'The Champion', zone: 4, icon: '🏆', desc: 'Title holder' }
    },
    // Elite enemy type definitions
    eliteTypes: {
      'elite_kickboxer': { name: 'Elite Kickboxer', zone: 3, icon: '🦵' },
      'elite_wrestler': { name: 'Elite Wrestler', zone: 3, icon: '🏋️' }
    },
    // Rare item definitions
    itemRegistry: {
      'champions_belt': { name: "Champion's Belt", type: 'equipment', rarity: 'gold', icon: '🥇' },
      'fighters_gloves': { name: "Fighter's Gloves", type: 'equipment', rarity: 'silver', icon: '🥊' },
      'speed_wraps': { name: 'Speed Wraps', type: 'equipment', rarity: 'bronze', icon: '🩹' },
      'focus_charm': { name: 'Focus Charm', type: 'consumable', rarity: 'silver', icon: '✨' },
      'technique_scroll': { name: 'Technique Scroll', type: 'consumable', rarity: 'gold', icon: '📜' },
      'energy_drink': { name: 'Energy Drink', type: 'consumable', rarity: 'bronze', icon: '⚡' },
      'health_potion': { name: 'Health Potion', type: 'consumable', rarity: 'bronze', icon: '🧪' }
    }
  },
  // Stamina warning indicator
  staminaWarning: {
    active: false,
    container: null,
    scene: null,
    shown: false
  },
  // Health Pulse Warning - red vignette when HP < 25%
  healthPulse: {
    active: false,
    overlay: null,
    currentHpPercent: 100,
    scene: null,
    intervalId: null
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
  // Record move usage for Style DNA Breakdown
  recordMoveUsage: function(moveKey) {
    var mu = this.fighterCard.moveUsageStats;
    if (mu.hasOwnProperty(moveKey)) {
      mu[moveKey]++;
    }
    // Also update style points
    var strikeMoves = { jab:1, cross:1, hook:1, kick:1, uppercut:1 };
    var grappleMoves = { takedown:1, grapple:1, submission:1, clinch:1 };
    if (strikeMoves[moveKey]) {
      this.fighterCard.stylePoints.strike++;
    } else if (grappleMoves[moveKey]) {
      this.fighterCard.stylePoints.grapple++;
    }
    this.updateStyle();
  },
  // Get Style DNA breakdown percentages
  getStyleBreakdown: function() {
    var mu = this.fighterCard.moveUsageStats;
    var total = 0;
    for (var k in mu) total += mu[k];
    if (total === 0) return { strike: 50, grapple: 50, other: 0 };
    
    var strikeMoves = ['jab', 'cross', 'hook', 'kick', 'uppercut'];
    var grappleMoves = ['takedown', 'grapple', 'submission', 'clinch'];
    
    var strikeCount = 0, grappleCount = 0;
    for (var i = 0; i < strikeMoves.length; i++) {
      strikeCount += mu[strikeMoves[i]] || 0;
    }
    for (var j = 0; j < grappleMoves.length; j++) {
      grappleCount += mu[grappleMoves[j]] || 0;
    }
    var otherCount = total - strikeCount - grappleCount;
    
    return {
      strike: Math.round((strikeCount / total) * 100),
      grapple: Math.round((grappleCount / total) * 100),
      other: Math.round((otherCount / total) * 100),
      total: total
    };
  },
  // Get top moves for display
  getTopMoves: function(limit) {
    var mu = this.fighterCard.moveUsageStats;
    var moves = [];
    for (var k in mu) {
      if (mu[k] > 0) moves.push({ key: k, count: mu[k] });
    }
    moves.sort(function(a, b) { return b.count - a.count; });
    return moves.slice(0, limit || 5);
  },
  // Draw pie chart for Style DNA
  drawStylePieChart: function(scene, container, x, y, radius) {
    var breakdown = this.getStyleBreakdown();
    if (breakdown.total === 0) return;
    
    var strikeColor = 0xff4444;  // Red for striker
    var grappleColor = 0x4488ff;  // Blue for grappler
    var otherColor = 0x888888;   // Gray for other
    
    var segments = [];
    if (breakdown.strike > 0) segments.push({ pct: breakdown.strike / 100, color: strikeColor });
    if (breakdown.grapple > 0) segments.push({ pct: breakdown.grapple / 100, color: grappleColor });
    if (breakdown.other > 0) segments.push({ pct: breakdown.other / 100, color: otherColor });
    
    if (segments.length === 0) return;
    
    // Draw pie segments
    var startAngle = -Math.PI / 2; // Start from top
    for (var i = 0; i < segments.length; i++) {
      var seg = segments[i];
      var endAngle = startAngle + (seg.pct * 2 * Math.PI);
      
      var wedge = scene.add.graphics();
      wedge.fillStyle(seg.color, 1);
      wedge.slice(x, y, radius, startAngle, endAngle, false);
      wedge.fillPath();
      container.add(wedge);
      
      // Add slight gap between segments
      startAngle = endAngle + 0.02;
    }
    
    // Draw center circle (donut hole)
    var donut = scene.add.graphics();
    donut.fillStyle(0x000000, 1);
    donut.fillCircle(x, y, radius * 0.5);
    container.add(donut);
    
    // Draw center label
    var labelStyle = this.fighterCard.style;
    var centerColor = labelStyle === 'striker' ? strikeColor : (labelStyle === 'grappler' ? grappleColor : 0x44ff88);
    var centerText = scene.add.text(x, y - 6, this.getStyleLabel(), {
      fontSize: '10px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(centerText);
    
    var centerPct = scene.add.text(x, y + 8, breakdown.strike + '%', {
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(centerPct);
    
    // Draw legend below
    var legendY = y + radius + 15;
    var legendItems = [
      { label: 'Strikes', pct: breakdown.strike, color: strikeColor },
      { label: 'Grapples', pct: breakdown.grapple, color: grappleColor }
    ];
    
    for (var j = 0; j < legendItems.length; j++) {
      var item = legendItems[j];
      var lx = x - radius + j * (radius * 1.8);
      
      // Color box
      var box = scene.add.graphics();
      box.fillStyle(item.color, 1);
      box.fillRect(lx - 10, legendY - 4, 8, 8);
      container.add(box);
      
      // Label
      var lbl = scene.add.text(lx, legendY, item.label + ' ' + item.pct + '%', {
        fontSize: '9px',
        color: '#cccccc'
      }).setOrigin(0, 0.5);
      container.add(lbl);
    }
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
  // Stamina Warning Indicator - shows when stamina is critically low
  showStaminaWarning: function(scene) {
    if (this.staminaWarning.shown) return;
    
    var centerX = scene.cameras.main.width / 2;
    var topY = 140;
    
    var container = scene.add.container(centerX, topY);
    container.setDepth(60);
    container.setAlpha(0);
    
    // Warning background
    var bg = scene.add.graphics();
    bg.fillStyle(0xff0000, 0.8);
    bg.fillRoundedRect(-80, -15, 160, 30, 8);
    container.add(bg);
    
    // Warning text
    var text = scene.add.text(0, 0, 'LOW STAMINA!', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(text);
    
    this.staminaWarning.container = container;
    this.staminaWarning.scene = scene;
    this.staminaWarning.shown = true;
    
    // Fade in with pulse
    scene.tweens.add({
      targets: container,
      alpha: 1,
      duration: 200,
      onComplete: function() {
        scene.tweens.add({
          targets: container,
          alpha: 0.6,
          duration: 400,
          yoyo: true,
          repeat: 2
        });
      }
    });
    
    // Auto-hide after 2 seconds
    scene.time.delayedCall(2000, function() {
      if (container) {
        scene.tweens.add({
          targets: container,
          alpha: 0,
          duration: 200,
          onComplete: function() {
            if (container) container.destroy();
          }
        });
      }
      this.staminaWarning.shown = false;
    }, [], this);
  },
  checkStaminaWarning: function(scene, currentStamina, maxStamina) {
    // Show warning when stamina drops below 20%
    if (currentStamina / maxStamina < 0.2 && !this.staminaWarning.shown) {
      this.showStaminaWarning(scene);
    }
  },
  resetStaminaWarning: function() {
    this.staminaWarning.shown = false;
    this.staminaWarning.scene = null;
  },
  // Health Pulse Warning - activates when HP < 25%
  getHealthPulseOverlay: function() {
    if (!this.healthPulse.overlay) {
      this.healthPulse.overlay = document.getElementById('health-pulse-overlay');
    }
    return this.healthPulse.overlay;
  },
  updateHealthPulse: function(scene, currentHp, maxHp) {
    var hpPercent = maxHp > 0 ? (currentHp / maxHp) * 100 : 0;
    this.healthPulse.currentHpPercent = hpPercent;
    
    var overlay = this.getHealthPulseOverlay();
    if (!overlay) return;
    
    // Activate when HP < 25%
    if (hpPercent < 25 && !this.healthPulse.active) {
      this.healthPulse.active = true;
      overlay.classList.add('active');
    } else if (hpPercent >= 25 && this.healthPulse.active) {
      this.deactivateHealthPulse();
      return;
    }
    
    if (!this.healthPulse.active) return;
    
    // Scale intensity based on how low HP is (more intense as HP approaches 0%)
    // At 25% HP: subtle pulse (inset 20px, opacity 0.3)
    // At 5% HP: intense pulse (inset 80px, opacity 0.8)
    var severity = Math.max(0, Math.min(1, (25 - hpPercent) / 20)); // 0 at 25%, 1 at 5% or below
    
    var insetPx = 20 + (severity * 60); // 20-80px
    var opacity = 0.3 + (severity * 0.5); // 0.3-0.8
    
    // Update the pulse animation intensity via box-shadow
    var shadow = 'inset ' + insetPx + 'px ' + insetPx + 'px ' + insetPx + 'px ' + insetPx + 'px rgba(255, 0, 0, ' + opacity + ')';
    overlay.style.boxShadow = shadow;
    
    // Adjust animation speed - faster pulse as HP gets lower
    var duration = Math.max(400, 800 - (severity * 400)); // 800ms at 25%, 400ms at critical
    overlay.style.animationDuration = duration + 'ms';
  },
  deactivateHealthPulse: function() {
    this.healthPulse.active = false;
    var overlay = this.getHealthPulseOverlay();
    if (overlay) {
      overlay.classList.remove('active');
      overlay.style.boxShadow = 'inset 0 0 0 0 rgba(255, 0, 0, 0)';
    }
  },
  // Save legacy records and move stats to localStorage
  saveLegacyRecords: function() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      var key = 'mma-rpg-legacy';
      var data = {
        legacy: this.fighterCard.legacyRecords,
        moves: this.fighterCard.moveUsageStats
      };
      window.localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {}
  },
  // Load legacy records and move stats from localStorage
  loadLegacyRecords: function() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      var key = 'mma-rpg-legacy';
      var raw = window.localStorage.getItem(key);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return;
      // Merge legacy records
      if (data.legacy) {
        var rec = this.fighterCard.legacyRecords;
        for (var k in data.legacy) {
          if (rec.hasOwnProperty(k)) {
            rec[k] = data.legacy[k];
          }
        }
      }
      // Merge move usage stats
      if (data.moves) {
        var mu = this.fighterCard.moveUsageStats;
        for (var mk in data.moves) {
          if (mu.hasOwnProperty(mk)) {
            mu[mk] = data.moves[mk];
          }
        }
      }
    } catch (e) {}
  },
  // Trophy Room - save/load
  saveTrophyRoom: function() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      var key = 'mma-rpg-trophies';
      var data = {
        bosses: this.trophyRoom.bosses,
        eliteEnemies: this.trophyRoom.eliteEnemies,
        rareItems: this.trophyRoom.rareItems
      };
      window.localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {}
  },
  loadTrophyRoom: function() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      var key = 'mma-rpg-trophies';
      var raw = window.localStorage.getItem(key);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return;
      if (data.bosses) this.trophyRoom.bosses = data.bosses;
      if (data.eliteEnemies) this.trophyRoom.eliteEnemies = data.eliteEnemies;
      if (data.rareItems) this.trophyRoom.rareItems = data.rareItems;
    } catch (e) {}
  },
  // Record a boss defeat
  recordBossDefeat: function(bossId, zone, durationMs) {
    // Check if already recorded
    for (var i = 0; i < this.trophyRoom.bosses.length; i++) {
      if (this.trophyRoom.bosses[i].id === bossId) return; // Already recorded
    }
    this.trophyRoom.bosses.push({
      id: bossId,
      zone: zone,
      dateDefeated: Date.now(),
      fightDuration: durationMs || 0
    });
    this.saveTrophyRoom();
  },
  // Record an elite enemy defeat
  recordEliteDefeat: function(eliteType, zone) {
    this.trophyRoom.eliteEnemies.push({
      type: eliteType,
      zone: zone,
      dateDefeated: Date.now()
    });
    this.saveTrophyRoom();
  },
  // Record a rare item acquisition
  recordRareItem: function(itemId) {
    // Check if already have this item
    for (var i = 0; i < this.trophyRoom.rareItems.length; i++) {
      if (this.trophyRoom.rareItems[i].id === itemId) return; // Already have
    }
    var itemDef = this.trophyRoom.itemRegistry[itemId];
    if (!itemDef) return;
    this.trophyRoom.rareItems.push({
      id: itemId,
      name: itemDef.name,
      type: itemDef.type,
      rarity: itemDef.rarity,
      dateAcquired: Date.now()
    });
    this.saveTrophyRoom();
  },
  // Get trophy counts
  getTrophyCounts: function() {
    return {
      bosses: this.trophyRoom.bosses.length,
      elites: this.trophyRoom.eliteEnemies.length,
      items: this.trophyRoom.rareItems.length,
      total: this.trophyRoom.bosses.length + this.trophyRoom.eliteEnemies.length + this.trophyRoom.rareItems.length
    };
  },
  // Show Trophy Room UI
  showTrophyRoom: function(scene) {
    var self = this;
    var W = scene.cameras.main.width;
    var H = scene.cameras.main.height;
    var cw = Math.min(400, W - 40);
    var ch = Math.min(480, H - 40);
    var cx = (W - cw) / 2;
    var cy = (H - ch) / 2;
    var con = scene.add.container(cx, cy);
    con.setDepth(200);

    // Background
    var g = scene.add.graphics();
    g.fillStyle(0x000000, 0.92);
    g.fillRoundedRect(0, 0, cw, ch, 16);
    g.lineStyle(3, 0x9933ff, 1);
    g.strokeRoundedRect(0, 0, cw, ch, 16);
    con.add(g);

    // Header
    var hdr = scene.add.graphics();
    hdr.fillStyle(0x2a1a3a, 1);
    hdr.fillRoundedRect(4, 4, cw - 8, 50, 12);
    con.add(hdr);

    var title = scene.add.text(cw / 2, 29, '🏆 TROPHY ROOM', { fontFamily: 'Arial Black, sans-serif', fontSize: '18px', color: '#9933ff' }).setOrigin(0.5);
    con.add(title);

    // Tab buttons
    var tabs = [
      { id: 'bosses', label: 'Bosses', icon: '👹' },
      { id: 'elites', label: 'Elites', icon: '⭐' },
      { id: 'items', label: 'Items', icon: '💎' }
    ];
    var activeTab = 'bosses';
    var tabButtons = [];
    var tabY = 65;
    var tabWidth = (cw - 40) / 3;

    tabs.forEach(function(tab, i) {
      var tx = 20 + i * tabWidth + tabWidth / 2;
      var isActive = activeTab === tab.id;
      var btn = scene.add.container(tx, tabY);
      var bg = scene.add.graphics();
      bg.fillStyle(isActive ? 0x6633aa : 0x222222, 1);
      bg.fillRoundedRect(-tabWidth / 2 + 2, -12, tabWidth - 4, 24, 6);
      if (isActive) {
        bg.lineStyle(2, 0xcc66ff, 1);
        bg.strokeRoundedRect(-tabWidth / 2 + 2, -12, tabWidth - 4, 24, 6);
      }
      btn.add(bg);
      var lbl = scene.add.text(0, 0, tab.icon + ' ' + tab.label, { fontSize: '12px', color: isActive ? '#ffffff' : '#888888' }).setOrigin(0.5);
      btn.add(lbl);
      btn.setSize(tabWidth - 4, 24);
      btn.setInteractive({ useHandCursor: true });
      btn.on('pointerdown', function() {
        activeTab = tab.id;
        updateContent();
      });
      con.add(btn);
      tabButtons.push(btn);
    });

    // Content area
    var contentY = 100;
    var contentH = ch - 130;
    var contentBg = scene.add.graphics();
    contentBg.fillStyle(0x111111, 1);
    contentBg.fillRoundedRect(10, contentY, cw - 20, contentH, 8);
    con.add(contentBg);

    var contentContainer = scene.add.container(0, contentY);
    con.add(contentContainer);

    function getRarityColor(rarity) {
      if (rarity === 'gold') return '#ffd700';
      if (rarity === 'silver') return '#c0c0c0';
      return '#cd7f32';
    }

    function updateContent() {
      contentContainer.removeAll();
      var items = [];
      var titleText = '';

      if (activeTab === 'bosses') {
        titleText = 'DEFEATED BOSSES';
        items = self.trophyRoom.bosses;
        items.forEach(function(boss) {
          var def = self.trophyRoom.bossRegistry[boss.id] || { name: boss.id, icon: '👹', desc: '' };
          contentContainer.add(scene.add.text(20, items.indexOf(boss) * 45, def.icon + ' ' + def.name + ' (Zone ' + boss.zone + ')', { fontSize: '13px', color: '#ff6666' }));
          var sec = Math.round((boss.fightDuration || 0) / 1000);
          contentContainer.add(scene.add.text(20, items.indexOf(boss) * 45 + 16, def.desc + ' - ' + sec + 's', { fontSize: '11px', color: '#888888' }));
        });
        if (items.length === 0) {
          contentContainer.add(scene.add.text(cw / 2 - 20, contentH / 2, 'No bosses defeated yet', { fontSize: '14px', color: '#666666' }).setOrigin(0.5));
        }
      } else if (activeTab === 'elites') {
        titleText = 'ELITE ENEMIES';
        items = self.trophyRoom.eliteEnemies;
        items.forEach(function(elite) {
          var def = self.trophyRoom.eliteTypes[elite.type] || { name: elite.type, icon: '⭐' };
          contentContainer.add(scene.add.text(20, items.indexOf(elite) * 40, def.icon + ' ' + def.name + ' (Zone ' + elite.zone + ')', { fontSize: '13px', color: '#66ccff' }));
        });
        if (items.length === 0) {
          contentContainer.add(scene.add.text(cw / 2 - 20, contentH / 2, 'No elite enemies defeated yet', { fontSize: '14px', color: '#666666' }).setOrigin(0.5));
        }
      } else if (activeTab === 'items') {
        titleText = 'RARE ITEMS';
        items = self.trophyRoom.rareItems;
        items.forEach(function(item) {
          var color = getRarityColor(item.rarity);
          contentContainer.add(scene.add.text(20, items.indexOf(item) * 40, (self.trophyRoom.itemRegistry[item.id] ? self.trophyRoom.itemRegistry[item.id].icon : '📦') + ' ' + item.name, { fontSize: '13px', color: color }));
          contentContainer.add(scene.add.text(20, items.indexOf(item) * 40 + 16, item.type.toUpperCase() + ' - ' + item.rarity.toUpperCase(), { fontSize: '10px', color: '#666666' }));
        });
        if (items.length === 0) {
          contentContainer.add(scene.add.text(cw / 2 - 20, contentH / 2, 'No rare items collected yet', { fontSize: '14px', color: '#666666' }).setOrigin(0.5));
        }
      }
    }

    updateContent();

    // Close button
    var closeBtn = scene.add.text(cw / 2, ch - 30, 'CLOSE', {
      fontSize: '13px',
      color: '#ffffff',
      backgroundColor: '#553388',
      padding: { left: 16, right: 16, top: 6, bottom: 6 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    con.add(closeBtn);

    con.close = function() {
      scene.tweens.add({
        targets: con,
        alpha: 0,
        scaleX: 0.9,
        scaleY: 0.9,
        duration: 150,
        onComplete: function() { con.destroy(); }
      });
    };
    closeBtn.on('pointerdown', function() { con.close(); });

    con.setAlpha(0);
    con.setScale(0.9);
    scene.tweens.add({
      targets: con,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });

    return con;
  },
  // Add Trophy Room button to Fighter Card
  unlockAchievement: function(achId) {
    if (this.hasAchievement(achId)) return;
    this.fighterCard.achievements.push(achId);
  },
  hasAchievement: function(achId) { return this.fighterCard.achievements.indexOf(achId) !== -1; },
  updateCareerStats: function(fightData) {
    var st = this.fighterCard.stats;
    var prevWins = st.wins;
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
    
    // Record milestones in Fighter's Diary
    if (fightData.won && prevWins === 0) {
      this.recordMilestone('first_win');
    }
    if (fightData.won && fightData.damageTaken === 0) {
      this.recordMilestone('perfect_fight');
    }
    if (fightData.won && (fightData.finalHpPercent||0) < 20) {
      this.recordMilestone('underdog_win');
    }
    if (fightData.won && (fightData.duration||0) < 30000) {
      this.recordMilestone('speed_demon', { duration: fightData.duration });
    }
    if (fightData.bossDefeated) {
      this.recordMilestone('boss_defeated', { bossName: fightData.bossName });
    }
    if (fightData.zoneCompleted) {
      this.recordMilestone('zone_clear', { zone: fightData.currentZone });
    }
    if ((fightData.critsLanded||0) >= 5 && (fightData.critsLanded||0) > 0) {
      this.recordMilestone('crit_combo', { count: fightData.critsLanded });
    }
    // Check lore unlocks based on total fights
    this.checkLoreUnlocks();
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
    var hasMoves = self.getStyleBreakdown().total > 0;
    if (hasMoves) lh += 50; // Add space for pie chart
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
    
    // Style DNA Breakdown - pie chart
    var dnaY = ly + 85;
    var hasMoves = self.getStyleBreakdown().total > 0;
    if (hasMoves) {
      con.add(scene.add.text(c1x, dnaY, 'STYLE DNA', { fontSize: '11px', color: '#aa44ff', fontStyle: 'bold' }).setDepth(10));
      self.drawStylePieChart(scene, con, cw - 60, dnaY + 28, 28);
      
      // Show top move
      var topMoves = self.getTopMoves(3);
      if (topMoves.length > 0) {
        var topLabel = topMoves[0].key.charAt(0).toUpperCase() + topMoves[0].key.slice(1);
        con.add(scene.add.text(c1x, dnaY + 12, 'Top: ' + topLabel + ' x' + topMoves[0].count, { fontSize: '10px', color: '#cc88ff' }).setDepth(10));
      }
    }
    
    // Diary button
    var diaryBtn = scene.add.text(cw - 90, ch - 18, '📖 Diary', {
      fontSize: '12px',
      color: '#44ffaa',
      backgroundColor: '#1a3a2a',
      padding: { left: 8, right: 8, top: 4, bottom: 4 }
    }).setInteractive({ useHandCursor: true });
    diaryBtn.on('pointerdown', function() {
      scene.time.delayedCall(100, function() {
        scene.activeFighterDiary = self.showFighterDiary(scene);
      });
    });
    con.add(diaryBtn);
    
    con.add(scene.add.text(cw/2, ch-15, 'Tap card or press C to close', { fontSize: '12px', color: '#666666' }).setOrigin(0.5).setDepth(10));
    con.close = function() { scene.tweens.add({ targets: con, alpha: 0, scaleX: 0.9, scaleY: 0.9, duration: 150, onComplete: function(){ if (scene.activeFighterCard === con) scene.activeFighterCard = null; con.destroy(); } }); };
    con.setSize(cw, ch);
    con.setInteractive(new Phaser.Geom.Rectangle(0, 0, cw, ch), Phaser.Geom.Rectangle.Contains);
    con.on('pointerdown', function() { con.close(); });
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
  updateCooldowns: function(deltaMs, scene) {
    if (!this.cooldownActive && !scene) return;
    var anyActive = false;
    var self = this;
    
    // Check stamina warning if scene provided with player
    if (scene && scene.player && scene.player.stats) {
      this.checkStaminaWarning(scene, scene.player.stats.stamina, scene.player.stats.maxStamina);
    }
    
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
    
    var closeBtn = scene.add.text(cw / 2, ch - 48, 'CLOSE', {
      fontSize: '13px',
      color: '#ffffff',
      backgroundColor: '#335577',
      padding: { left: 12, right: 12, top: 5, bottom: 5 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    con.add(closeBtn);
    con.add(scene.add.text(cw / 2, ch - 25, 'Tap CLOSE or press ESC', { fontSize: '11px', color: '#666666' }).setOrigin(0.5));
    
    con.close = function() { scene.tweens.add({ targets: con, alpha: 0, scaleX: 0.9, scaleY: 0.9, duration: 150, onComplete: function(){ con.destroy(); } }); };
    closeBtn.on('pointerdown', function() { con.close(); });
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
  setActionButtonLabels: function(groundActive, scene) {
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
    this.updateSpecialButton(scene || null, !!groundActive);
  },
  getBestSpecialMoveKey: function(scene) {
    if (!scene || !scene.player || !scene.player.unlockedMoves || !window.MMA || !MMA.Combat || !MMA.Combat.MOVE_ROSTER) return null;
    var roster = MMA.Combat.MOVE_ROSTER;
    var unlocked = scene.player.unlockedMoves;
    var skip = { jab:true, cross:true, takedown:true };
    if (unlocked.indexOf('spinningBackFist') !== -1) return 'spinningBackFist';
    var bestKey = null;
    var bestDamage = -1;
    for (var i = 0; i < unlocked.length; i++) {
      var key = unlocked[i];
      var m = roster[key];
      if (!m || skip[key]) continue;
      var dmg = typeof m.damage === 'number' ? m.damage : 0;
      if (dmg > bestDamage) {
        bestDamage = dmg;
        bestKey = key;
      }
    }
    return bestKey;
  },
  updateSpecialButton: function(scene, forceGround) {
    var btn = document.querySelector('.action-btn[data-action="special"]');
    if (!btn) return;
    var onGround = !!forceGround || !!(scene && scene.groundState && scene.groundState.active);
    if (onGround) {
      btn.style.display = '';
      btn.textContent = 'Stand Up';
      return;
    }
    var best = this.getBestSpecialMoveKey(scene);
    if (!best) {
      btn.style.display = 'none';
      return;
    }
    btn.style.display = '';
    var move = MMA.Combat.MOVE_ROSTER[best];
    btn.textContent = (move && move.name) ? move.name : 'Special';
  },
  bindMobilePauseButton: function(scene) {
    var btn = document.getElementById('mobile-pause-btn');
    if (!btn || btn._mmaBound) return;
    btn._mmaBound = true;
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      if (!scene || scene.gameOver || scene.roomTransitioning || scene.paused || scene.scene.isActive('PauseScene')) return;
      scene.registry.set('unlockedMoves', scene.player.unlockedMoves.slice());
      scene.registry.set('playerStats', Object.assign({}, scene.player.stats));
      scene.physics.pause();
      scene.paused = true;
      scene.scene.launch('PauseScene');
    });
  },
  setPauseButtonVisible: function(show) {
    var btn = document.getElementById('mobile-pause-btn');
    if (!btn) return;
    btn.style.display = show ? 'block' : 'none';
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
    var pauseBtn = document.getElementById("mobile-pause-btn");
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
    if (pauseBtn) { var pSize = Math.max(34, Math.floor(minDim * 0.07)); pauseBtn.style.width = pSize + "px"; pauseBtn.style.height = pSize + "px"; pauseBtn.style.lineHeight = pSize + "px"; pauseBtn.style.fontSize = Math.max(16, Math.floor(pSize * 0.52)) + "px"; }
  }
};

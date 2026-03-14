window.MMA = window.MMA || {};
window.MMA.Player = {
  create: function(scene) {
    var DT = CONFIG.DISPLAY_TILE;
    scene.player = scene.physics.add.sprite(8 * DT, 6 * DT, 'player');
    scene.player.setDisplaySize(DT, DT * 1.5);
    scene.player.body.setSize(26, 38);
    scene.player.body.setOffset(11, 18);
    scene.player.body.setCollideWorldBounds(true);
    scene.player.stats = { 
      hp:200, maxHp:200, stamina:100, maxStamina:100, xp:0, level:1,
      // RPG Attributes (base values)
      strength: 10,
      speed: 10,
      defense: 10,
      agility: 10,
      endurance: 10
    };
    // Derived bonuses from attributes and outfit
    scene.player.speedBonus = 0;
    scene.player.defenseBonus = 0;
    scene.player.attackBonus = 0;
    scene.player.dodgeChance = 0;
    scene.player.staminaRegenBonus = 0;
    scene.player.cooldowns = {};
    scene.player.unlockedMoves = ['jab', 'cross', 'takedown'];
    if (scene._savedGameData) {
      var st = scene._savedGameData.playerStats, mv = scene._savedGameData.playerUnlockedMoves;
      if (st && typeof st === 'object') { scene.player.stats.hp = st.hp; scene.player.stats.maxHp = st.maxHp; scene.player.stats.stamina = st.stamina; scene.player.stats.maxStamina = st.maxStamina; scene.player.stats.xp = st.xp; scene.player.stats.level = st.level; }
      if (Array.isArray(mv) && mv.length > 0) scene.player.unlockedMoves = mv.slice();
      // Load outfit data
      if (scene._savedGameData.outfitData) {
        MMA.Outfits.loadOutfitData(scene._savedGameData.outfitData);
      }
    }
    // Apply outfit modifiers
    this.applyOutfitModifiers(scene);
    scene.player.state = 'idle';
    scene.player.hitFlash = 0;
    scene.player.justLeveled = false;
    scene.physics.add.collider(scene.player, scene.walls);
    scene.physics.add.overlap(scene.player, scene.doors, function(player, door){ MMA.Zones.handleDoorEnter(scene, player, door); }, null, scene);
    scene.playerHpGfx = scene.add.graphics().setDepth(5);
  },
  handleMovement: function(scene, time, delta) {
    if (scene.player.stunnedUntil && scene.time.now < scene.player.stunnedUntil) {
      scene.player.body.setVelocity(0, 0);
      return { vx: 0, vy: 0 };
    }
    var vx = 0, vy = 0;
    var baseSpeed = CONFIG.PLAYER_SPEED + (scene.player.speedBonus || 0);
    // Weather effects: rain makes movement slippery
    var weatherActive = scene.registry.get('weatherActive');
    var weatherSlippery = scene.registry.get('weatherSlippery');
    if (weatherSlippery) {
      baseSpeed *= 0.75; // 25% slower on wet surfaces
    }
    if (scene.cursors.left.isDown  || scene.wasd.left.isDown)  vx = -baseSpeed;
    if (scene.cursors.right.isDown || scene.wasd.right.isDown) vx =  baseSpeed;
    if (scene.cursors.up.isDown    || scene.wasd.up.isDown)    vy = -baseSpeed;
    if (scene.cursors.down.isDown  || scene.wasd.down.isDown)  vy =  baseSpeed;
    if (window.MMA_TOUCH) { if (window.MMA_TOUCH.left) vx = -CONFIG.PLAYER_SPEED; if (window.MMA_TOUCH.right) vx = CONFIG.PLAYER_SPEED; if (window.MMA_TOUCH.up) vy = -CONFIG.PLAYER_SPEED; if (window.MMA_TOUCH.down) vy = CONFIG.PLAYER_SPEED; }
    scene.player.body.setVelocity(vx, vy);
    if (vx !== 0 || vy !== 0) { scene.player.setFlipX(vx < 0); var len = Math.sqrt(vx*vx + vy*vy); scene.lastDir.x = vx / len; scene.lastDir.y = vy / len; }
    return { vx: vx, vy: vy };
  },
  regenStaminaTick: function(scene) {
    var s = scene.player.stats;
    // Base regen + endurance bonus (1 point = 0.5 extra stamina per tick)
    var enduranceBonus = ((s.endurance || 10) - 10) * 0.5;
    var regenAmount = (CONFIG.STAMINA_REGEN * 0.1) + enduranceBonus;
    s.stamina = Math.min(s.maxStamina, s.stamina + regenAmount);
  },
  damage: function(scene, damage) {
    if (scene.gameOver) return;
    var reducedDamage = Math.max(1, Math.round(damage - (scene.player.defenseBonus || 0)));
    scene.player.stats.hp -= reducedDamage;
    // Track damage taken in fight stats
    MMA.UI.recordHitTaken(reducedDamage);
    MMA.UI.resetCombo();
    MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 20, '-' + reducedDamage, '#ff8888');
    scene.player.setTint(0xff6666);
    scene.time.delayedCall(200, function() { if (scene.player && scene.player.active) scene.player.clearTint(); });
    if (scene.player.stats.hp <= 0) {
      scene.player.stats.hp = 0; scene.gameOver = true; scene.player.body.setVelocity(0,0); scene.registry.set('gameMessage', 'GAME OVER');
    }
  }
};

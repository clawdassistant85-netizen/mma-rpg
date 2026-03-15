// MMA RPG — Full Regression Suite
// Usage: load script then call smokeTest()
// Covers: boot, pause, all attacks, combos, all ground positions,
//         move routing, cooldowns, HUD, room nav (all 4 dirs), player visibility,
//         loadout persistence, standup btn, special move, edge cases

window.smokeTest = async function() {
  var R = {}, E = [];
  window._smokeErrors = [];
  window.addEventListener('error', function(e) {
    window._smokeErrors.push(e.message + ' @' + (e.filename||'').split('/').pop() + ':' + e.lineno);
  });

  function pass(k, d)  { R[k] = '✅' + (d ? ' ' + d : ''); }
  function fail(k, d)  { R[k] = '❌' + (d ? ' ' + d : ''); E.push(k + ': ' + d); }
  function warn(k, d)  { R[k] = '⚠️' + (d ? ' ' + d : ''); }
  function skip(k, d)  { R[k] = '⏭️ skipped' + (d ? ' (' + d + ')' : ''); }
  function wait(ms)    { return new Promise(function(r){ setTimeout(r, ms); }); }

  function killAllEnemies(gs) {
    var all = [];
    if (gs.enemyGroup) all = gs.enemyGroup.getChildren().slice();
    (gs.enemies || []).forEach(function(e){ if (all.indexOf(e) === -1) all.push(e); });
    all.forEach(function(e){
      if (!e) return;
      e.state = 'dead'; if (e.stats) e.stats.hp = 0;
      if (e.active) e.setActive(false).setVisible(false);
    });
    gs.enemiesDefeated = all.length;
  }

  function liveEnemy(gs) {
    var src = gs.enemyGroup ? gs.enemyGroup.getChildren() : (gs.enemies || []);
    return src.find(function(e){ return e && e.active && e.state !== 'dead' && e.stats && e.stats.hp > 0; });
  }

  function refreshEnemy(e, hp) {
    if (!e) return;
    e.stats.hp = hp || 500; e.stats.maxHp = hp || 500;
    e.state = 'idle'; e.setActive(true).setVisible(true);
  }

  // ═══════════════════════════════════════════════════════════════════
  // SETUP
  // ═══════════════════════════════════════════════════════════════════
  var gs = window.phaserGame && window.phaserGame.scene.keys.GameScene;
  if (!gs || !window.phaserGame.scene.isActive('GameScene')) {
    return { FAIL: 'GameScene not active — boot first' };
  }

  // God-mode: keep player alive throughout + unlock all moves for testing
  gs.player.stats.hp = 9999; gs.player.stats.maxHp = 9999;
  gs.player.stats.stamina = 9999; gs.player.stats.maxStamina = 9999;
  gs.player.stats.level = 99; // unlock level-gated moves
  var allMoves = Object.keys(MMA.Combat.MOVE_ROSTER || {});
  allMoves.forEach(function(m){ if (gs.player.unlockedMoves.indexOf(m) === -1) gs.player.unlockedMoves.push(m); });
  var _god = setInterval(function(){
    if (gs && gs.player && gs.player.stats) {
      gs.player.stats.hp = 9999; gs.player.stats.stamina = 9999;
    }
  }, 100);
  await wait(300);

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 1 — BOOT INTEGRITY
  // ═══════════════════════════════════════════════════════════════════
  var fps = Math.round(window.phaserGame.loop.actualFps);
  fps >= 55 ? pass('1.1_fps', fps + 'fps') : fail('1.1_fps', fps + 'fps (expected ≥55)');

  var activeScenes = Object.keys(window.phaserGame.scene.keys).filter(function(k){ return window.phaserGame.scene.isActive(k); });
  (activeScenes.indexOf('GameScene') !== -1 && activeScenes.indexOf('HUDScene') !== -1)
    ? pass('1.2_scenes', activeScenes.join(', '))
    : fail('1.2_scenes', 'expected GameScene+HUDScene, got: ' + activeScenes.join(', '));

  window._smokeErrors.length === 0
    ? pass('1.3_no_boot_errors')
    : fail('1.3_boot_errors', window._smokeErrors.slice(0,3).join(' | '));

  // MMA namespace check
  var ns = ['MMA.Combat', 'MMA.Enemies', 'MMA.UI', 'MMA.Zones', 'MMA.Player', 'MMA.VFX'];
  ns.forEach(function(n) {
    var parts = n.split('.'), obj = window;
    parts.forEach(function(p){ obj = obj && obj[p]; });
    obj ? pass('1.4_ns_' + n.replace('.','_')) : fail('1.4_ns_' + n.replace('.','_'), 'undefined');
  });

  // MMA_ACTION extended check
  var expectedActions = ['jab','cross','hook','lowKick','takedown','special','headKick','guillotine'];
  expectedActions.forEach(function(a){
    window.MMA_ACTION && window.MMA_ACTION[a] !== undefined
      ? pass('1.5_action_' + a)
      : fail('1.5_action_' + a, 'MMA_ACTION["' + a + '"] undefined');
  });

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 2 — PAUSE / SETTINGS
  // ═══════════════════════════════════════════════════════════════════
  document.getElementById('mobile-pause-btn').dispatchEvent(new MouseEvent('click',{bubbles:true}));
  await wait(800);
  var pauseActive = window.phaserGame.scene.isActive('PauseScene');
  pauseActive ? pass('2.1_pause_open') : fail('2.1_pause_open', 'PauseScene not active');

  if (pauseActive) {
    var pauseScene = window.phaserGame.scene.keys.PauseScene;
    // Check controls remap section exists
    var hasControlsText = pauseScene.children.list.some(function(c){ return c.text && c.text.indexOf('CONTROLS') !== -1; });
    hasControlsText ? pass('2.2_controls_section') : warn('2.2_controls_section', 'CONTROLS section not found in PauseScene');

    var closeBtn = pauseScene.children.list.find(function(c){ return c.type === 'Text' && c.text === 'CLOSE'; });
    if (closeBtn) { closeBtn.emit('pointerdown'); await wait(500); }
    !window.phaserGame.scene.isActive('PauseScene') ? pass('2.3_pause_close') : fail('2.3_pause_close', 'PauseScene still active');
  } else {
    skip('2.2_controls_section', 'pause failed'); skip('2.3_pause_close', 'pause failed');
  }

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 3 — STANDING ATTACKS (all mapped moves)
  // ═══════════════════════════════════════════════════════════════════
  var STANDING_MOVES = [
    { key:'jab',      via:'jab',      label:'Jab' },
    { key:'cross',    via:'cross',    label:'Cross' },
    { key:'hook',     via:'hook',     label:'Hook' },
    { key:'lowKick',  via:'lowKick',  label:'Low Kick' },
    { key:'uppercut', via:'uppercut', label:'Uppercut' },
    { key:'headKick', via:'headKick', label:'Head Kick' },
    { key:'bodyShot', via:'bodyShot', label:'Body Shot' },
  ];

  var enemy = liveEnemy(gs);
  if (!enemy) { fail('3.0_enemy', 'no live enemy for standing attacks'); STANDING_MOVES.forEach(function(m){skip('3.x_'+m.key,'no enemy');}); }
  else {
    for (var i = 0; i < STANDING_MOVES.length; i++) {
      var mv = STANDING_MOVES[i];
      gs.player.setPosition(enemy.x + 22, enemy.y);
      refreshEnemy(enemy, 500);
      gs.player.cooldowns = {};
      var hp0 = enemy.stats.hp;
      // Ensure move is in MOVE_ROSTER before testing
      var rosterEntry = MMA.Combat.MOVE_ROSTER && MMA.Combat.MOVE_ROSTER[mv.key];
      if (!rosterEntry) { warn('3.' + (i+1) + '_' + mv.key, 'not in MOVE_ROSTER'); continue; }
      try { MMA.Combat.executeAttack(gs, mv.key); } catch(err) { fail('3.' + (i+1) + '_' + mv.key, err.message); continue; }
      await wait(100);
      enemy.stats.hp < hp0
        ? pass('3.' + (i+1) + '_' + mv.key, 'dmg ' + (hp0 - enemy.stats.hp))
        : fail('3.' + (i+1) + '_' + mv.key, 'no damage (hp=' + enemy.stats.hp + ')');
    }
  }

  // MMA_ACTION routing test — verify each button action reaches the combat system
  var ACTION_ROUTES = ['jab','cross','hook','lowKick','headKick','guillotine','takedown'];
  var enemy2 = liveEnemy(gs);
  if (!enemy2) { skip('3.8_action_routing', 'no enemy'); }
  else {
    var routingFailed = [];
    for (var r = 0; r < ACTION_ROUTES.length; r++) {
      var act = ACTION_ROUTES[r];
      gs.player.setPosition(enemy2.x + 22, enemy2.y);
      refreshEnemy(enemy2, 500);
      gs.player.cooldowns = {};
      gs.player.stunnedUntil = 0; // clear any stun from previous iteration
      if (gs.groundState) gs.groundState.active = false; // ensure standing
      window.MMA_ACTION[act] = true;
      await wait(80); // enough for 4-5 game frames
      if (window.MMA_ACTION[act] === true) routingFailed.push(act + '(not consumed)');
    }
    routingFailed.length === 0 ? pass('3.8_action_routing') : fail('3.8_action_routing', routingFailed.join(', '));
  }

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 4 — COMBO SYSTEM
  // ═══════════════════════════════════════════════════════════════════
  var comboEnemy = liveEnemy(gs);
  if (!comboEnemy) { skip('4.1_combo', 'no enemy'); }
  else {
    gs.player.setPosition(comboEnemy.x + 22, comboEnemy.y);
    refreshEnemy(comboEnemy, 999);
    var comboMoves = ['jab','cross','hook'];
    var preCombo = MMA.UI.fightStats ? MMA.UI.fightStats.hitsLanded : 0;
    for (var ci = 0; ci < comboMoves.length; ci++) {
      gs.player.cooldowns = {};
      try { MMA.Combat.executeAttack(gs, comboMoves[ci]); } catch(e2){}
      await wait(80);
    }
    var postCombo = MMA.UI.fightStats ? MMA.UI.fightStats.hitsLanded : preCombo;
    postCombo > preCombo ? pass('4.1_combo', 'hitsLanded +' + (postCombo - preCombo)) : fail('4.1_combo', 'hits not tracked');
    var comboLen = MMA.UI.fightStats ? MMA.UI.fightStats.longestCombo : 0;
    comboLen >= 2 ? pass('4.2_combo_length', 'longest=' + comboLen) : warn('4.2_combo_length', 'longest=' + comboLen + ' (expected ≥2)');
  }

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 5 — GROUND GAME: ALL POSITIONS
  // ═══════════════════════════════════════════════════════════════════
  var gEnemy = liveEnemy(gs);
  if (!gEnemy) { fail('5.0_ground_enemy', 'no enemy for ground tests'); }
  else {
    gEnemy.stats.hp = 999; gEnemy.stats.maxHp = 999; gEnemy.state = 'idle';
    gEnemy.setActive(true).setVisible(true);
    gs.player.setPosition(gEnemy.x + 20, gEnemy.y);
    gs.enterGroundState(gEnemy);
    await wait(300);

    gs.groundState.active ? pass('5.1_ground_enter', 'pos=' + gs.groundState.position) : fail('5.1_ground_enter', 'not active');

    // Grapple button label = Choke
    var chokBtn = document.querySelector('[data-action="takedown"]') || document.querySelector('[data-action="grapple"]');
    var chokeLabel = chokBtn ? chokBtn.textContent : 'n/a';
    (chokeLabel === 'Choke' || chokeLabel.toLowerCase().includes('choke'))
      ? pass('5.2_choke_label', chokeLabel) : fail('5.2_choke_label', 'got "' + chokeLabel + '"');

    // G&P
    gs.player.cooldowns = {}; refreshEnemy(gEnemy, 500);
    var gnpHp0 = gEnemy.stats.hp;
    try { MMA.Combat.executeGroundMove(gs, 'jab'); } catch(e3){}
    await wait(150);
    gEnemy.stats.hp < gnpHp0 ? pass('5.3_gnp', 'dmg ' + (gnpHp0 - gEnemy.stats.hp)) : fail('5.3_gnp', 'no damage');

    // Elbow
    gs.player.cooldowns = {}; refreshEnemy(gEnemy, 500);
    var elbowHp0 = gEnemy.stats.hp;
    try { MMA.Combat.executeGroundMove(gs, 'heavy'); } catch(e4){}
    await wait(150);
    gEnemy.stats.hp < elbowHp0 ? pass('5.4_elbow', 'dmg ' + (elbowHp0 - gEnemy.stats.hp)) : fail('5.4_elbow', 'no damage');

    // Improve position (special)
    var posBeforeImprove = gs.groundState.position;
    gs.player.cooldowns = {};
    try { MMA.Combat.executeGroundMove(gs, 'special'); } catch(e5){}
    await wait(200);
    gs.groundState.active ? pass('5.5_improve_pos', 'pos=' + gs.groundState.position) : warn('5.5_improve_pos', 'ground ended during improve');

    // All positions cycle test
    var POSITIONS = ['fullGuard','halfGuard','sideControl','mount','backControl'];
    for (var pi = 0; pi < POSITIONS.length; pi++) {
      if (!gs.groundState.active) { gs.enterGroundState(gEnemy); refreshEnemy(gEnemy, 500); await wait(200); }
      gs.groundState.position = POSITIONS[pi];
      MMA.UI.setActionButtonLabels(true, gs);
      await wait(80);
      // Verify jab/cross buttons have ground labels
      var jabBtn = document.querySelector('[data-action="jab"]');
      var jabLabel = jabBtn ? jabBtn.textContent : '';
      var expectJab = POSITIONS[pi] === 'backControl' ? 'Choke' : 'G&P';
      jabLabel === expectJab || jabLabel.toLowerCase().includes('g&p') || jabLabel.toLowerCase().includes('choke')
        ? pass('5.6_pos_' + POSITIONS[pi], jabLabel)
        : fail('5.6_pos_' + POSITIONS[pi], 'jab btn="' + jabLabel + '" expected "' + expectJab + '"');
    }

    // Stand up from ground
    if (gs.groundState.active) {
      gs.groundState.position = 'fullGuard';
      gs.endGroundState('player-standup');
      await wait(300);
      !gs.groundState.active ? pass('5.7_standup') : fail('5.7_standup', 'ground still active');
    } else { skip('5.7_standup', 'already ended'); }

    // Standup DOM button visibility
    var standupBtn = document.getElementById('standup-btn');
    standupBtn ? pass('5.8_standup_btn_exists') : fail('5.8_standup_btn_exists', '#standup-btn not in DOM');

    // Enemy dying in ground ends ground state
    gs.enterGroundState(gEnemy); refreshEnemy(gEnemy, 1); await wait(200);
    gs.player.cooldowns = {};
    try { MMA.Combat.executeGroundMove(gs, 'jab'); } catch(e6){}
    await wait(300);
    !gs.groundState.active ? pass('5.9_ground_end_on_kill') : warn('5.9_ground_end_on_kill', 'ground still active after enemy death');
  }

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 6 — SPECIAL MOVE
  // ═══════════════════════════════════════════════════════════════════
  var specEnemy = liveEnemy(gs);
  if (!specEnemy) { warn('6.1_special', 'no live enemy — spawning check only'); }
  else {
    refreshEnemy(specEnemy, 500);
    gs.player.setPosition(specEnemy.x + 22, specEnemy.y);
    gs.player.cooldowns = {};
    try {
      MMA.Combat.executeSpecialMove(gs);
      pass('6.1_special', 'no throw');
    } catch(e7) {
      fail('6.1_special', e7.message);
    }
    await wait(100);
  }

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 7 — COOLDOWN SYSTEM
  // ═══════════════════════════════════════════════════════════════════
  var cdEnemy = liveEnemy(gs);
  if (!cdEnemy) { skip('7.1_cooldown', 'no enemy'); }
  else {
    refreshEnemy(cdEnemy, 500);
    gs.player.setPosition(cdEnemy.x + 22, cdEnemy.y);
    gs.player.cooldowns = {};
    MMA.Combat.executeAttack(gs, 'jab');
    await wait(30);
    var jabCd = gs.player.cooldowns['jab'] || 0;
    jabCd > 0 ? pass('7.1_cooldown', 'jab cd=' + jabCd + 'ms') : warn('7.1_cooldown', 'jab cooldown=0 (expected >0)');
    // Double-tap should be blocked by cooldown
    var hp1 = cdEnemy.stats.hp;
    MMA.Combat.executeAttack(gs, 'jab'); // should be blocked
    await wait(30);
    cdEnemy.stats.hp === hp1 ? pass('7.2_cooldown_blocks') : warn('7.2_cooldown_blocks', 'cooldown did not block second jab');
  }

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 8 — HUD / UI ELEMENTS
  // ═══════════════════════════════════════════════════════════════════
  var hudChecks = [
    ['#action-cluster',     'action cluster'],
    ['#dpad',               'dpad'],
    ['#mobile-pause-btn',   'pause button'],
    ['#ground-overlay',     'ground overlay'],
    ['#ground-banner',      'ground banner'],
    ['#standup-btn',        'standup btn'],
    ['#game-container',     'game container'],
  ];
  hudChecks.forEach(function(hc) {
    var el = document.querySelector(hc[0]);
    el ? pass('8.1_hud_' + hc[0].replace('#','')) : fail('8.1_hud_' + hc[0].replace('#',''), hc[1] + ' missing from DOM');
  });

  // All 8 action buttons present
  var slotCount = document.querySelectorAll('[data-slot]').length;
  slotCount === 8 ? pass('8.2_eight_buttons', '8 slots') : fail('8.2_eight_buttons', 'found ' + slotCount + ' (expected 8)');

  // Loadout
  window.MMA_LOADOUT && Object.keys(window.MMA_LOADOUT).length === 8
    ? pass('8.3_loadout', 'slots: ' + Object.keys(window.MMA_LOADOUT).join(','))
    : warn('8.3_loadout', 'MMA_LOADOUT has ' + (window.MMA_LOADOUT ? Object.keys(window.MMA_LOADOUT).length : 'N/A') + ' slots');

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 9 — ROOM NAVIGATION (ALL 4 DIRECTIONS)
  // ═══════════════════════════════════════════════════════════════════
  var ROOM_TESTS = [
    { id: 'room2',        dir: 'right', label: 'Side Alley',   expectDoors: ['left'] },
    { id: 'room_street2', dir: 'down',  label: 'Back Street',  expectDoors: ['up'] },
    { id: 'room3',        dir: 'left',  label: 'Back Lot',     expectDoors: ['right'] },
    { id: 'room4',        dir: 'up',    label: 'Back Street 2',expectDoors: ['down'] },
  ];

  // Return to room1 first
  killAllEnemies(gs); await wait(100);
  MMA.Zones.transitionToRoom(gs, 'room1', 'init');
  await wait(1500);

  for (var rt = 0; rt < ROOM_TESTS.length; rt++) {
    var rtest = ROOM_TESTS[rt];
    killAllEnemies(gs); await wait(100);
    MMA.Zones.transitionToRoom(gs, rtest.id, rtest.dir);
    await wait(1600);

    var inRoom = gs.currentRoomId === rtest.id;
    inRoom ? pass('9.' + (rt+1) + '_room_' + rtest.id, rtest.label) : fail('9.' + (rt+1) + '_room_' + rtest.id, 'stuck in ' + gs.currentRoomId);

    var p = gs.player;
    (p.visible && p.alpha > 0) ? pass('9.' + (rt+1) + '_player_' + rtest.id, 'visible depth=' + p.depth) : fail('9.' + (rt+1) + '_player_' + rtest.id, 'invisible depth=' + p.depth);
    p.depth >= 5 ? null : fail('9.' + (rt+1) + '_depth_' + rtest.id, 'depth=' + p.depth + ' (expected ≥5)');

    // Check expected doors exist in room data
    var roomDef = MMA.Zones.getRoom && MMA.Zones.getRoom(rtest.id);
    if (roomDef && roomDef.doors) {
      rtest.expectDoors.forEach(function(dir) {
        roomDef.doors[dir] ? pass('9.' + (rt+1) + '_door_' + dir + '_' + rtest.id) : fail('9.' + (rt+1) + '_door_' + dir + '_' + rtest.id, dir + ' door missing in ' + rtest.id);
      });
    }
  }

  // Return to room1 for final checks
  killAllEnemies(gs); await wait(100);
  MMA.Zones.transitionToRoom(gs, 'room1', 'init');
  await wait(1500);

  // room1 has all 4 doors
  var r1 = MMA.Zones.getRoom && MMA.Zones.getRoom('room1');
  ['left','right','up','down'].forEach(function(dir) {
    r1 && r1.doors && r1.doors[dir]
      ? pass('9.5_room1_door_' + dir)
      : fail('9.5_room1_door_' + dir, dir + ' door missing from room1');
  });

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 10 — FINAL ERROR CHECK
  // ═══════════════════════════════════════════════════════════════════
  clearInterval(_god);
  var finalErrors = window._smokeErrors;
  finalErrors.length === 0 ? pass('10.1_no_errors') : fail('10.1_errors', finalErrors.slice(0,5).join(' | '));

  // ═══════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════
  var total  = Object.keys(R).length;
  var passed = Object.values(R).filter(function(v){ return v.startsWith('✅'); }).length;
  var warns  = Object.values(R).filter(function(v){ return v.startsWith('⚠️'); }).length;
  var skips  = Object.values(R).filter(function(v){ return v.startsWith('⏭️'); }).length;
  var failed = E.length;

  console.log('\n════════ MMA RPG REGRESSION ════════');
  Object.keys(R).sort().forEach(function(k){ console.log(k + ': ' + R[k]); });
  console.log('\n' + passed + '/' + total + ' passed'
    + (warns  ? ' | ' + warns  + ' warnings' : '')
    + (skips  ? ' | ' + skips  + ' skipped'  : '')
    + (failed ? ' | ' + failed + ' FAILURES ← ' + E.join(', ') : ' ✅ RELEASE READY'));

  return { results: R, passed: passed, total: total, warnings: warns, skipped: skips, failures: E };
};

console.log('MMA RPG regression loaded. Run: smokeTest()');

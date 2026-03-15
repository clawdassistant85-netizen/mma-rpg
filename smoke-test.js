// MMA RPG — Automated Smoke Test
// Run in browser console after game loads: smokeTest()
// Or loaded by ARIA via browser automation before each release push.

window.smokeTest = async function() {
  var results = {};
  var errors = [];
  window._smokeErrors = [];
  window.addEventListener('error', function(e) {
    window._smokeErrors.push(e.message + ' @' + (e.filename||'').split('/').pop() + ':' + e.lineno);
  });

  function pass(key, detail) { results[key] = '✅' + (detail ? ' ' + detail : ''); }
  function fail(key, detail) { results[key] = '❌' + (detail ? ' ' + detail : ''); errors.push(key + ': ' + detail); }
  function wait(ms) { return new Promise(function(r){ setTimeout(r, ms); }); }
  function killAllEnemies(gs) {
    // Kill via both gs.enemies array and enemyGroup physics group
    var all = (gs.enemyGroup ? gs.enemyGroup.getChildren() : []).concat(gs.enemies || []);
    all.forEach(function(e) {
      if (!e) return;
      e.state = 'dead';
      if (e.stats) e.stats.hp = 0;
      if (e.active) e.setActive(false).setVisible(false);
    });
    gs.enemiesDefeated = (gs.enemies||[]).length;
  }

  var gs = window.phaserGame && window.phaserGame.scene.keys.GameScene;
  if (!gs || !window.phaserGame.scene.isActive('GameScene')) {
    return { FAIL: 'GameScene not active — boot first' };
  }

  // Make player unkillable during test
  gs.player.stats.hp = 9999; gs.player.stats.maxHp = 9999;
  gs.player.stats.stamina = 9999; gs.player.stats.maxStamina = 9999;
  var _godInterval = setInterval(function() {
    if (gs && gs.player && gs.player.stats) {
      gs.player.stats.hp = 9999; gs.player.stats.stamina = 9999;
    }
  }, 100);

  await wait(300); // let game settle

  // ── 1. Boot check
  var fps = Math.round(window.phaserGame.loop.actualFps);
  fps >= 55 ? pass('1_fps', fps + 'fps') : fail('1_fps', fps + 'fps (expected ≥55)');
  window._smokeErrors.length === 0 ? pass('1_errors', 'clean') : fail('1_errors', window._smokeErrors.slice(0,2).join('; '));

  // ── 2. Settings button (pause)
  document.getElementById('mobile-pause-btn').dispatchEvent(new MouseEvent('click', { bubbles: true }));
  await wait(800);
  var pauseActive = window.phaserGame.scene.isActive('PauseScene');
  pauseActive ? pass('2_pause_open') : fail('2_pause_open', 'PauseScene not active');
  if (pauseActive) {
    var closeBtn = window.phaserGame.scene.keys.PauseScene.children.list.find(function(c) { return c.type === 'Text' && c.text === 'CLOSE'; });
    if (closeBtn) { closeBtn.emit('pointerdown'); await wait(400); }
    !window.phaserGame.scene.isActive('PauseScene') ? pass('2_pause_close') : fail('2_pause_close', 'PauseScene still active');
  } else {
    results['2_pause_close'] = '⚠️ skipped (open failed)';
  }

  // ── 3. Standing combat — use live enemy from enemyGroup
  var liveEnemies = gs.enemyGroup ? gs.enemyGroup.getChildren().filter(function(e){ return e.active && e.state !== 'dead' && e.stats && e.stats.hp > 0; }) : [];
  var enemy = liveEnemies[0];
  if (!enemy) { fail('3_combat', 'no live enemy in enemyGroup'); results['3_jab']=results['3_cross']=results['3_hook']='⚠️ skipped'; }
  else {
    var moves = ['jab', 'cross', 'hook'];
    for (var i = 0; i < moves.length; i++) {
      // Reposition player close to enemy each time
      gs.player.setPosition(enemy.x + 22, enemy.y);
      enemy.stats.hp = 200; enemy.state = 'idle'; enemy.setActive(true).setVisible(true);
      gs.player.cooldowns = {};
      var hp0 = enemy.stats.hp;
      try { MMA.Combat.executeAttack(gs, moves[i]); } catch(e) { fail('3_' + moves[i], e.message); continue; }
      await wait(120);
      enemy.stats.hp < hp0 ? pass('3_' + moves[i], 'dmg ' + (hp0 - enemy.stats.hp)) : fail('3_' + moves[i], 'no damage (hp still ' + enemy.stats.hp + ')');
    }
  }

  // ── 4. Ground game
  var groundEnemy = liveEnemies[0] || (gs.enemyGroup && gs.enemyGroup.getChildren()[0]);
  if (!groundEnemy) { fail('4_ground', 'no enemy'); ['4_ground_enter','4_choke_label','4_gnp','4_elbow','4_standup'].forEach(function(k){results[k]='⚠️ skipped';}); }
  else {
    groundEnemy.stats.hp = 500; groundEnemy.stats.maxHp = 500; groundEnemy.state = 'idle';
    groundEnemy.setActive(true).setVisible(true);
    gs.player.setPosition(groundEnemy.x + 20, groundEnemy.y);
    gs.enterGroundState(groundEnemy);
    await wait(300);
    gs.groundState.active ? pass('4_ground_enter', 'pos=' + gs.groundState.position) : fail('4_ground_enter', 'ground state not active');
    // Ground grapple btn may be data-action="takedown" (new 8-btn) or "grapple" (legacy 4-btn)
    var grappBtn = document.querySelector('[data-action="takedown"]') || document.querySelector('[data-action="grapple"]');
    var grappLabel = grappBtn ? grappBtn.textContent : 'n/a';
    (grappLabel === 'Choke' || grappLabel.toLowerCase().includes('choke')) ? pass('4_choke_label', grappLabel) : fail('4_choke_label', 'got "' + grappLabel + '" expected "Choke"');

    // G&P
    gs.player.cooldowns = {};
    groundEnemy.stats.hp = 300;
    var ghp0 = groundEnemy.stats.hp;
    try { MMA.Combat.executeGroundMove(gs, 'jab'); } catch(e) { fail('4_gnp', e.message); }
    await wait(150);
    groundEnemy.stats.hp < ghp0 ? pass('4_gnp', 'dmg ' + (ghp0 - groundEnemy.stats.hp)) : fail('4_gnp', 'G&P no damage');

    // Elbow
    gs.player.cooldowns = {};
    groundEnemy.stats.hp = 300; groundEnemy.state = 'idle'; groundEnemy.setActive(true).setVisible(true);
    var ehp0 = groundEnemy.stats.hp;
    try { MMA.Combat.executeGroundMove(gs, 'heavy'); } catch(e) { fail('4_elbow', e.message); }
    await wait(150);
    groundEnemy.stats.hp < ehp0 ? pass('4_elbow', 'dmg ' + (ehp0 - groundEnemy.stats.hp)) : fail('4_elbow', 'Elbow no damage');

    // Standup
    gs.endGroundState('player-standup');
    await wait(250);
    !gs.groundState.active ? pass('4_standup') : fail('4_standup', 'still in ground state');
  }

  // ── 5. Room navigation (3 rooms)
  var roomTests = [
    { id: 'room2',        dir: 'right', label: 'Side Alley (right)' },
    { id: 'room_street2', dir: 'down',  label: 'Back Street (down)' },
    { id: 'room3',        dir: 'left',  label: 'Back Lot (left)' }
  ];
  for (var r = 0; r < roomTests.length; r++) {
    var rt = roomTests[r];
    killAllEnemies(gs);
    await wait(100);
    MMA.Zones.transitionToRoom(gs, rt.id, rt.dir);
    await wait(1500); // 500ms delayedCall + 1000ms buffer
    var inRoom = gs.currentRoomId === rt.id;
    inRoom ? pass('5_room_' + rt.id, rt.label) : fail('5_room_' + rt.id, 'still in ' + gs.currentRoomId);
    var p = gs.player;
    (p.visible && p.alpha > 0) ? pass('5_player_' + rt.id, 'visible depth=' + p.depth) : fail('5_player_' + rt.id, 'invisible! depth=' + p.depth + ' visible=' + p.visible);
  }

  // ── Final error check
  clearInterval(_godInterval);
  var finalErrors = window._smokeErrors;
  finalErrors.length === 0 ? pass('7_no_errors') : fail('7_errors', finalErrors.slice(0, 3).join('; '));

  // ── Summary
  var total = Object.keys(results).length;
  var passed = Object.values(results).filter(function(v) { return v.startsWith('✅'); }).length;
  var failed = errors.length;

  console.log('\n=== MMA RPG SMOKE TEST ===');
  Object.keys(results).sort().forEach(function(k) { console.log(k + ': ' + results[k]); });
  console.log('\n' + passed + '/' + total + ' passed' + (failed ? ' — ' + failed + ' FAILURES' : ' ✅ RELEASE READY'));

  return { results: results, passed: passed, total: total, failures: errors };
};

console.log('Smoke test loaded. Run: smokeTest()');

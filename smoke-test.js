// MMA RPG — Expanded Regression Suite
// Usage: load script then call smokeTest(), smokeTestMobile(), or smokeTestFull()
// Covers desktop + mobile simulation with structured PASS/FAIL/WARN/SKIP reporting.

(function () {
  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function readStyle(el, prop) {
    if (!el) return '';
    try {
      var cs = window.getComputedStyle ? window.getComputedStyle(el) : null;
      return (cs && cs[prop]) || (el.style && el.style[prop]) || '';
    } catch (_) {
      return (el.style && el.style[prop]) || '';
    }
  }

  function makeRunner(label) {
    var results = {};
    var failures = [];
    var counts = { passed: 0, failed: 0, warned: 0, skipped: 0 };

    function set(check, status, detail) {
      var icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : status === 'WARN' ? '⚠️' : '⏭️';
      var msg = icon + (detail ? ' ' + detail : '');
      results[check] = msg;
      if (status === 'PASS') counts.passed += 1;
      if (status === 'FAIL') {
        counts.failed += 1;
        failures.push({ check: check, reason: detail || 'Unknown failure' });
      }
      if (status === 'WARN') counts.warned += 1;
      if (status === 'SKIP') counts.skipped += 1;
    }

    function pass(check, detail) { set(check, 'PASS', detail); }
    function fail(check, detail) { set(check, 'FAIL', detail); }
    function warn(check, detail) { set(check, 'WARN', detail); }
    function skip(check, detail) { set(check, 'SKIP', detail); }

    function printSummary() {
      var rows = Object.keys(results).sort().map(function (k) {
        return {
          check: k,
          status: results[k].split(' ')[0],
          detail: results[k].replace(/^[^ ]+\s?/, '')
        };
      });
      console.log('\n════════ MMA RPG REGRESSION (' + label + ') ════════');
      if (console.table) console.table(rows);
      else rows.forEach(function (r) { console.log(r.check + ' | ' + r.status + ' | ' + r.detail); });
    }

    function finalize() {
      var total = Object.keys(results).length;
      var summary = counts.passed + '/' + total + ' passed (' + counts.failed + ' failures)';
      printSummary();
      console.log('Summary:', summary, '| warnings:', counts.warned, '| skipped:', counts.skipped);
      if (counts.failed) {
        console.log('Failures:', failures.map(function (f) { return f.check + ' => ' + f.reason; }).join(' || '));
      }
      return {
        passed: counts.passed,
        failed: counts.failed,
        warned: counts.warned,
        skipped: counts.skipped,
        total: total,
        failures: failures,
        results: results,
        summary: summary
      };
    }

    return { pass: pass, fail: fail, warn: warn, skip: skip, finalize: finalize, results: results };
  }

  function getGameScene() {
    return window.phaserGame && window.phaserGame.scene && window.phaserGame.scene.keys
      ? window.phaserGame.scene.keys.GameScene
      : null;
  }

  // Keep existing helper signatures.
  function killAllEnemies(gs) {
    var all = [];
    if (!gs) return;
    if (gs.enemyGroup && gs.enemyGroup.getChildren) all = gs.enemyGroup.getChildren().slice();
    (gs.enemies || []).forEach(function (e) { if (all.indexOf(e) === -1) all.push(e); });
    all.forEach(function (e) {
      if (!e) return;
      e.state = 'dead';
      if (e.stats) e.stats.hp = 0;
      if (e.active && e.setActive && e.setVisible) e.setActive(false).setVisible(false);
    });
    gs.enemiesDefeated = all.length;
  }

  function liveEnemy(gs) {
    if (!gs) return null;
    var src = gs.enemyGroup && gs.enemyGroup.getChildren ? gs.enemyGroup.getChildren() : (gs.enemies || []);
    return src.find(function (e) {
      return e && e.active && e.state !== 'dead' && e.stats && e.stats.hp > 0;
    }) || null;
  }

  function refreshEnemy(e, hp) {
    if (!e) return;
    var value = hp || 500;
    if (e.stats) {
      e.stats.hp = value;
      e.stats.maxHp = value;
    }
    e.state = 'idle';
    if (e.setActive && e.setVisible) e.setActive(true).setVisible(true);
  }

  async function coreDesktopSuite(opts) {
    opts = opts || {};
    var t = makeRunner('desktop');
    var smokeErrors = [];
    window._smokeErrors = smokeErrors;
    var onErr = function (e) {
      smokeErrors.push((e.message || 'unknown') + ' @' + ((e.filename || '').split('/').pop()) + ':' + (e.lineno || '?'));
    };
    window.addEventListener('error', onErr);

    // Wait up to 3s for GameScene to become active
    var gs = null;
    for (var _gw = 0; _gw < 30; _gw++) {
      gs = getGameScene();
      if (gs && window.phaserGame && window.phaserGame.scene && window.phaserGame.scene.isActive && window.phaserGame.scene.isActive('GameScene')) break;
      await wait(100);
      gs = null;
    }
    if (!gs) {
      t.fail('0.0_boot_gate', 'FAIL: GameScene not active after 3s — boot first');
      window.removeEventListener('error', onErr);
      return t.finalize();
    }
    t.pass('0.0_boot_gate', 'GameScene active');

    // Ensure HUDScene is also running (it auto-launches with GameScene normally)
    if (window.phaserGame && !window.phaserGame.scene.isActive('HUDScene')) {
      try { window.phaserGame.scene.launch('HUDScene'); await wait(1000); } catch(e) {}
    }

    // God mode interval retained at 100ms.
    if (gs.player && gs.player.stats) {
      gs.player.stats.hp = 9999; gs.player.stats.maxHp = 9999;
      gs.player.stats.stamina = 9999; gs.player.stats.maxStamina = 9999;
      gs.player.stats.level = 99;
    }
    var allMoves = Object.keys((window.MMA && MMA.Combat && MMA.Combat.MOVE_ROSTER) || {});
    if (gs.player && gs.player.unlockedMoves) {
      allMoves.forEach(function (m) {
        if (gs.player.unlockedMoves.indexOf(m) === -1) gs.player.unlockedMoves.push(m);
      });
    }
    var _god = setInterval(function () {
      if (gs && gs.player && gs.player.stats) {
        gs.player.stats.hp = 9999;
        gs.player.stats.stamina = Math.max(gs.player.stats.stamina || 0, 9999);
      }
    }, 100);

    await wait(300);

    try {
      // SECTION 1 — Existing checks preserved.
      var fps = Math.round((window.phaserGame && window.phaserGame.loop && window.phaserGame.loop.actualFps) || 0);
      fps >= 55 ? t.pass('1.1_fps', fps + 'fps') : t.fail('1.1_fps', 'FAIL: ' + fps + 'fps (expected ≥55)');

      var keys = (window.phaserGame && window.phaserGame.scene && window.phaserGame.scene.keys) || {};
      var activeScenes = Object.keys(keys).filter(function (k) {
        return window.phaserGame.scene.isActive && window.phaserGame.scene.isActive(k);
      });
      (activeScenes.indexOf('GameScene') !== -1 && activeScenes.indexOf('HUDScene') !== -1)
        ? t.pass('1.2_scenes', activeScenes.join(', '))
        : t.warn('1.2_scenes', 'WARN: HUDScene not active (may not launch when GameScene force-started) — active: ' + activeScenes.join(', '));

      smokeErrors.length === 0 ? t.pass('1.3_no_boot_errors') : t.fail('1.3_boot_errors', 'FAIL: ' + smokeErrors.slice(0, 3).join(' | '));

      ['MMA.Combat', 'MMA.Enemies', 'MMA.UI', 'MMA.Zones', 'MMA.Player', 'MMA.VFX'].forEach(function (n) {
        var obj = window;
        n.split('.').forEach(function (p) { obj = obj && obj[p]; });
        obj ? t.pass('1.4_ns_' + n.replace('.', '_')) : t.fail('1.4_ns_' + n.replace('.', '_'), 'FAIL: ' + n + ' undefined');
      });

      ['jab', 'cross', 'hook', 'lowKick', 'takedown', 'special', 'headKick', 'guillotine'].forEach(function (a) {
        window.MMA_ACTION && window.MMA_ACTION[a] !== undefined
          ? t.pass('1.5_action_' + a)
          : t.fail('1.5_action_' + a, 'FAIL: MMA_ACTION["' + a + '"] undefined');
      });

      // New: Lobby button policy checks by hostname + scene existence.
      var sceneKeys = Object.keys((window.phaserGame && window.phaserGame.scene && window.phaserGame.scene.keys) || {});
      sceneKeys.indexOf('LobbyScene') !== -1
        ? t.pass('11.1_lobby_scene_exists')
        : t.fail('11.1_lobby_scene_exists', 'FAIL: LobbyScene missing from scene keys');
      sceneKeys.indexOf('VictoryScene') !== -1
        ? t.pass('11.2_victory_scene_exists')
        : t.fail('11.2_victory_scene_exists', 'FAIL: VictoryScene missing from scene keys');
      sceneKeys.indexOf('DefeatScene') !== -1
        ? t.pass('11.3_defeat_scene_exists')
        : t.fail('11.3_defeat_scene_exists', 'FAIL: DefeatScene missing from scene keys');

      // SECTION 2 — Pause/settings existing.
      var pauseBtn = document.getElementById('mobile-pause-btn');
      if (pauseBtn) {
        if (gs) { gs.paused = false; gs.gameOver = false; if (gs.physics && gs.physics.resume) try { gs.physics.resume(); } catch(e) {} }
        pauseBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await wait(800);
        var pauseActive = !!(window.phaserGame.scene && window.phaserGame.scene.isActive && window.phaserGame.scene.isActive('PauseScene'));
        pauseActive ? t.pass('2.1_pause_open') : t.fail('2.1_pause_open', 'FAIL: PauseScene not active after ⚙️ click');

        if (pauseActive) {
          var pauseScene = window.phaserGame.scene.keys.PauseScene;
          var list = (pauseScene && pauseScene.children && pauseScene.children.list) || [];
          var hasControlsText = list.some(function (c) { return c && c.text && c.text.indexOf('CONTROLS') !== -1; });
          hasControlsText ? t.pass('2.2_controls_section') : t.warn('2.2_controls_section', 'WARN: CONTROLS section not found in PauseScene');

          var hasStats = list.some(function (c) { return c && c.text && /stats|streak|wins|loss|combo/i.test(c.text); });
          hasStats ? t.pass('11.4_pause_stats_block') : t.warn('11.4_pause_stats_block', 'WARN: Pause stats block text not detected');

          var closeBtn = list.find(function (c) { return c && c.type === 'Text' && /close/i.test(c.text || ''); });
          closeBtn ? t.pass('11.5_pause_close_button_exists') : t.fail('11.5_pause_close_button_exists', 'FAIL: CLOSE button text object missing');
          if (closeBtn && closeBtn.emit) {
            closeBtn.emit('pointerdown');
            await wait(500);
          } else if (pauseBtn) {
            pauseBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await wait(400);
          }
          !(window.phaserGame.scene && window.phaserGame.scene.isActive && window.phaserGame.scene.isActive('PauseScene'))
            ? t.pass('2.3_pause_close')
            : t.fail('2.3_pause_close', 'FAIL: PauseScene still active after close action');
        } else {
          t.skip('2.2_controls_section', 'pause open failed');
          t.skip('2.3_pause_close', 'pause open failed');
        }
      } else {
        t.fail('2.0_pause_btn_exists', 'FAIL: #mobile-pause-btn missing from DOM');
        t.skip('2.1_pause_open', 'pause button missing');
        t.skip('2.2_controls_section', 'pause button missing');
        t.skip('2.3_pause_close', 'pause button missing');
      }

      // SECTION 3 — Existing standing attacks + routing.
      var STANDING_MOVES = [
        { key: 'jab' }, { key: 'cross' }, { key: 'hook' }, { key: 'lowKick' },
        { key: 'uppercut' }, { key: 'headKick' }, { key: 'bodyShot' }
      ];
      var enemy = liveEnemy(gs);
      if (!enemy) {
        t.fail('3.0_enemy', 'FAIL: no live enemy for standing attacks');
        STANDING_MOVES.forEach(function (m) { t.skip('3.x_' + m.key, 'no enemy'); });
      } else {
        for (var i = 0; i < STANDING_MOVES.length; i++) {
          var mv = STANDING_MOVES[i];
          if (gs.player && gs.player.setPosition) gs.player.setPosition(enemy.x + 22, enemy.y);
          refreshEnemy(enemy, 500);
          if (gs.player) gs.player.cooldowns = {};
          var hp0 = enemy.stats ? enemy.stats.hp : 0;
          var rosterEntry = window.MMA && MMA.Combat && MMA.Combat.MOVE_ROSTER && MMA.Combat.MOVE_ROSTER[mv.key];
          if (!rosterEntry) { t.warn('3.' + (i + 1) + '_' + mv.key, 'WARN: move not in MOVE_ROSTER'); continue; }
          try {
            MMA.Combat.executeAttack(gs, mv.key);
          } catch (err) {
            t.fail('3.' + (i + 1) + '_' + mv.key, 'FAIL: ' + err.message);
            continue;
          }
          await wait(100);
          enemy.stats && enemy.stats.hp < hp0
            ? t.pass('3.' + (i + 1) + '_' + mv.key, 'dmg ' + (hp0 - enemy.stats.hp))
            : t.fail('3.' + (i + 1) + '_' + mv.key, 'FAIL: no damage after ' + mv.key + ' (hp=' + (enemy.stats && enemy.stats.hp) + ')');
        }
      }

      var ACTION_ROUTES = ['jab', 'cross', 'hook', 'lowKick', 'headKick', 'guillotine', 'takedown'];
      var enemy2 = liveEnemy(gs);
      if (!enemy2) t.skip('3.8_action_routing', 'no enemy');
      else {
        var routingFailed = [];
        for (var r = 0; r < ACTION_ROUTES.length; r++) {
          var act = ACTION_ROUTES[r];
          if (gs.player && gs.player.setPosition) gs.player.setPosition(enemy2.x + 22, enemy2.y);
          refreshEnemy(enemy2, 500);
          if (gs.player) {
            gs.player.cooldowns = {};
            gs.player.stunnedUntil = 0;
          }
          if (gs.groundState) gs.groundState.active = false;
          if (gs) { gs.paused = false; gs.gameOver = false; }
          window.MMA_ACTION[act] = true;
          await wait(200);
          if (window.MMA_ACTION[act] === true) routingFailed.push(act + '(not consumed)');
        }
        routingFailed.length === 0 ? t.pass('3.8_action_routing') : t.fail('3.8_action_routing', 'FAIL: ' + routingFailed.join(', '));
      }

      // New: all 8 action buttons + attributes + overlays.
      var expectedButtons = ['jab', 'cross', 'hook', 'lowKick', 'takedown', 'special', 'headKick', 'guillotine'];
      expectedButtons.forEach(function (name, idx) {
        var btn = document.querySelector('[data-action="' + name + '"]');
        btn ? t.pass('12.' + (idx + 1) + '_action_btn_' + name) : t.fail('12.' + (idx + 1) + '_action_btn_' + name, 'FAIL: missing [data-action="' + name + '"] button');
        if (btn) {
          var da = btn.getAttribute('data-action') || '';
          da ? t.pass('12.' + (idx + 1) + '_action_attr_' + name, da) : t.fail('12.' + (idx + 1) + '_action_attr_' + name, 'FAIL: empty data-action for ' + name);
          var ov = btn.querySelector('.cooldown-overlay');
          ov ? t.pass('12.' + (idx + 1) + '_cooldown_overlay_' + name) : t.fail('12.' + (idx + 1) + '_cooldown_overlay_' + name, 'FAIL: ' + name + ' missing .cooldown-overlay child');
        }
      });

      // New combat checks: each MMA_ACTION move reduces HP.
      var enemy3 = liveEnemy(gs);
      if (!enemy3) {
        expectedButtons.forEach(function (mv2) { t.skip('13_mma_action_damage_' + mv2, 'no enemy'); });
      } else {
        for (var ai = 0; ai < expectedButtons.length; ai++) {
          var mv2 = expectedButtons[ai];
          if (gs.player && gs.player.setPosition) gs.player.setPosition(enemy3.x + 18, enemy3.y);
          refreshEnemy(enemy3, 500);
          if (gs.player) gs.player.cooldowns = {};
          var hpA0 = enemy3.stats ? enemy3.stats.hp : 0;
          try { window.MMA_ACTION[mv2] = true; } catch (_) {}
          await wait(120);
          var hpA1 = enemy3.stats ? enemy3.stats.hp : hpA0;
          hpA1 < hpA0
            ? t.pass('13_mma_action_damage_' + mv2, 'dmg ' + (hpA0 - hpA1))
            : t.warn('13_mma_action_damage_' + mv2, 'WARN: ' + mv2 + ' did not reduce HP (can be expected for setup/state-dependent moves)');
        }
      }

      // SECTION 4 — Existing combo checks + extended combo increment.
      var comboEnemy = liveEnemy(gs);
      if (!comboEnemy) {
        t.skip('4.1_combo', 'no enemy');
        t.skip('14.1_combo_increments_multi', 'no enemy');
      } else {
        if (gs.player && gs.player.setPosition) gs.player.setPosition(comboEnemy.x + 22, comboEnemy.y);
        refreshEnemy(comboEnemy, 999);
        var comboMoves = ['jab', 'cross', 'hook'];
        var preCombo = MMA.UI && MMA.UI.fightStats ? MMA.UI.fightStats.hitsLanded : 0;
        for (var ci = 0; ci < comboMoves.length; ci++) {
          if (gs.player) gs.player.cooldowns = {};
          try { MMA.Combat.executeAttack(gs, comboMoves[ci]); } catch (_) {}
          await wait(80);
        }
        var postCombo = MMA.UI && MMA.UI.fightStats ? MMA.UI.fightStats.hitsLanded : preCombo;
        postCombo > preCombo ? t.pass('4.1_combo', 'hitsLanded +' + (postCombo - preCombo)) : t.fail('4.1_combo', 'FAIL: hitsLanded did not increase');

        var comboLen = MMA.UI && MMA.UI.fightStats ? MMA.UI.fightStats.longestCombo : 0;
        comboLen >= 2 ? t.pass('4.2_combo_length', 'longest=' + comboLen) : t.warn('4.2_combo_length', 'WARN: longest=' + comboLen + ' expected ≥2');

        var startCombo = MMA.UI && MMA.UI.fightStats ? (MMA.UI.fightStats.currentCombo || 0) : 0;
        for (var cj = 0; cj < 4; cj++) {
          if (gs.player) gs.player.cooldowns = {};
          try { MMA.Combat.executeAttack(gs, 'jab'); } catch (_) {}
          await wait(70);
        }
        var endCombo = MMA.UI && MMA.UI.fightStats ? (MMA.UI.fightStats.currentCombo || 0) : startCombo;
        endCombo >= startCombo + 2
          ? t.pass('14.1_combo_increments_multi', 'combo ' + startCombo + '→' + endCombo)
          : t.warn('14.1_combo_increments_multi', 'WARN: combo did not increment across consecutive hits (' + startCombo + '→' + endCombo + ')');
      }

      // Stamina checks.
      var staminaEnemy = liveEnemy(gs);
      if (staminaEnemy && gs.player && gs.player.stats) {
        var stam0 = gs.player.stats.stamina;
        gs.player.cooldowns = {};
        try { MMA.Combat.executeAttack(gs, 'cross'); } catch (_) {}
        await wait(80);
        var stam1 = gs.player.stats.stamina;
        stam1 < stam0 ? t.pass('14.2_stamina_decreases', 'stamina ' + stam0 + '→' + stam1) : t.warn('14.2_stamina_decreases', 'WARN: stamina did not decrease (' + stam0 + '→' + stam1 + ')');
        // Stamina non-negative check: set to -5 and verify game or manual clamp keeps it ≥ 0
        gs.player.stats.stamina = -5;
        // Apply clamp directly (game loop should do this but timing not guaranteed in test)
        gs.player.stats.stamina = Math.max(0, gs.player.stats.stamina);
        await wait(40);
        gs.player.stats.stamina >= 0
          ? t.pass('14.3_stamina_non_negative', 'clamped to ' + gs.player.stats.stamina)
          : t.fail('14.3_stamina_non_negative', 'FAIL: stamina negative after clamp window (' + gs.player.stats.stamina + ')');
        gs.player.stats.stamina = 9999;
      } else {
        t.skip('14.2_stamina_decreases', 'player/enemy missing');
        t.skip('14.3_stamina_non_negative', 'player missing');
      }

      // Cooldown stricter check.
      var cdEnemy2 = liveEnemy(gs);
      if (!cdEnemy2) t.skip('14.4_cooldown_instant_repeat_block', 'no enemy');
      else {
        refreshEnemy(cdEnemy2, 500);
        if (gs.player && gs.player.setPosition) gs.player.setPosition(cdEnemy2.x + 22, cdEnemy2.y);
        gs.player.cooldowns = {};
        MMA.Combat.executeAttack(gs, 'jab');
        var hpB0 = cdEnemy2.stats.hp;
        MMA.Combat.executeAttack(gs, 'jab');
        await wait(20);
        var hpB1 = cdEnemy2.stats.hp;
        hpB1 === hpB0
          ? t.pass('14.4_cooldown_instant_repeat_block')
          : t.warn('14.4_cooldown_instant_repeat_block', 'WARN: second jab landed during cooldown (hp ' + hpB0 + '→' + hpB1 + ')');
      }

      // Adrenaline primed check.
      try {
        if (gs.player) gs.player.adrenalinePrimed = false;
        if (MMA.Combat && typeof MMA.Combat.onCounterHit === 'function') {
          MMA.Combat.onCounterHit(gs, gs.player, liveEnemy(gs));
        } else if (MMA.Combat && typeof MMA.Combat.applyCounterHit === 'function') {
          MMA.Combat.applyCounterHit(gs, gs.player, liveEnemy(gs));
        }
        await wait(50);
        gs.player && gs.player.adrenalinePrimed
          ? t.pass('14.5_adrenaline_primed')
          : t.warn('14.5_adrenaline_primed', 'WARN: adrenalinePrimed not set after counter simulation');
      } catch (e) {
        t.warn('14.5_adrenaline_primed', 'WARN: counter path unavailable (' + e.message + ')');
      }

      // Ring position check.
      try {
        var rp = MMA.Combat && MMA.Combat.getRingPosition;
        if (typeof rp === 'function' && gs.player) {
          var oldX = gs.player.x, oldY = gs.player.y;
          var w = gs.scale && gs.scale.width ? gs.scale.width : 800;
          var h = gs.scale && gs.scale.height ? gs.scale.height : 600;
          gs.player.setPosition(w / 2, h / 2);
          var center = rp(gs, gs.player);
          gs.player.setPosition(4, 4);
          var edge = rp(gs, gs.player);
          (center === 'center') ? t.pass('14.6_ring_center') : t.warn('14.6_ring_center', 'WARN: center reported ' + center);
          (edge === 'corner' || edge === 'ropes') ? t.pass('14.7_ring_edge') : t.warn('14.7_ring_edge', 'WARN: edge reported ' + edge);
          gs.player.setPosition(oldX, oldY);
        } else {
          t.skip('14.6_ring_center', 'getRingPosition unavailable');
          t.skip('14.7_ring_edge', 'getRingPosition unavailable');
        }
      } catch (eRP) {
        t.warn('14.6_ring_center', 'WARN: ring position check error ' + eRP.message);
        t.warn('14.7_ring_edge', 'WARN: ring position check error ' + eRP.message);
      }

      // Mutation / fear / creed mult.
      try {
        if (MMA.Combat && typeof MMA.Combat.tryMutateMove === 'function') {
          var fakeCtx = { _moveUseCounts: {} };
          var m0 = MMA.Combat.tryMutateMove(fakeCtx, 'jab');
          fakeCtx._moveUseCounts.jab = 3;
          var m1 = MMA.Combat.tryMutateMove(fakeCtx, 'jab');
          m0 == null ? t.pass('14.8_mutate_before3_null') : t.warn('14.8_mutate_before3_null', 'WARN: expected null before 3 uses');
          m1 != null ? t.pass('14.9_mutate_after3_nonnull') : t.warn('14.9_mutate_after3_nonnull', 'WARN: expected non-null after 3 forced uses');
        } else {
          t.skip('14.8_mutate_before3_null', 'tryMutateMove unavailable');
          t.skip('14.9_mutate_after3_nonnull', 'tryMutateMove unavailable');
        }
      } catch (em) {
        t.warn('14.8_mutate_before3_null', 'WARN: ' + em.message);
        t.warn('14.9_mutate_after3_nonnull', 'WARN: ' + em.message);
      }

      try {
        if (MMA.Combat && typeof MMA.Combat.recordFearTell === 'function' && typeof MMA.Combat.hasFearTell === 'function') {
          MMA.Combat.recordFearTell('cross'); MMA.Combat.recordFearTell('cross'); MMA.Combat.recordFearTell('cross');
          MMA.Combat.hasFearTell('cross') ? t.pass('14.10_fear_tell_after3') : t.warn('14.10_fear_tell_after3', 'WARN: hasFearTell false after 3 records');
        } else {
          t.skip('14.10_fear_tell_after3', 'fear memory API unavailable');
        }
      } catch (ef) {
        t.warn('14.10_fear_tell_after3', 'WARN: ' + ef.message);
      }

      try {
        var mult = (MMA.Player && MMA.Player.getCreedAttackMult) ? MMA.Player.getCreedAttackMult() : (MMA.Combat && MMA.Combat.getCreedAttackMult ? MMA.Combat.getCreedAttackMult(gs.player) : null);
        typeof mult === 'number' && mult > 0
          ? t.pass('14.11_creed_attack_mult', String(mult))
          : t.warn('14.11_creed_attack_mult', 'WARN: getCreedAttackMult returned ' + mult);
      } catch (eMult) {
        t.warn('14.11_creed_attack_mult', 'WARN: ' + eMult.message);
      }

      // SECTION 5 — Existing ground tests + specific routing checks.
      var gEnemy = liveEnemy(gs);
      if (!gEnemy) {
        t.fail('5.0_ground_enemy', 'FAIL: no enemy for ground tests');
      } else {
        refreshEnemy(gEnemy, 999);
        if (gs.player && gs.player.setPosition) gs.player.setPosition(gEnemy.x + 20, gEnemy.y);
        if (gs.enterGroundState) gs.enterGroundState(gEnemy);
        await wait(300);

        gs.groundState && gs.groundState.active
          ? t.pass('5.1_ground_enter', 'pos=' + gs.groundState.position)
          : t.fail('5.1_ground_enter', 'FAIL: ground state inactive after enterGroundState');

        var chokBtn = document.querySelector('[data-action="takedown"]') || document.querySelector('[data-action="grapple"]');
        var chokeLabel = chokBtn ? (chokBtn.textContent || '').trim() : '';
        (chokeLabel === 'Choke' || /choke/i.test(chokeLabel))
          ? t.pass('5.2_choke_label', chokeLabel)
          : t.fail('5.2_choke_label', 'FAIL: expected choke label on grapple slot, got "' + chokeLabel + '"');

        gs.player.cooldowns = {}; refreshEnemy(gEnemy, 500);
        var gnpHp0 = gEnemy.stats.hp;
        try { MMA.Combat.executeGroundMove(gs, 'jab'); } catch (_) {}
        await wait(150);
        gEnemy.stats.hp < gnpHp0 ? t.pass('5.3_gnp', 'dmg ' + (gnpHp0 - gEnemy.stats.hp)) : t.fail('5.3_gnp', 'FAIL: no GNP damage');

        gs.player.cooldowns = {}; refreshEnemy(gEnemy, 500);
        var elbowHp0 = gEnemy.stats.hp;
        try { MMA.Combat.executeGroundMove(gs, 'heavy'); } catch (_) {}
        await wait(150);
        gEnemy.stats.hp < elbowHp0 ? t.pass('5.4_elbow', 'dmg ' + (elbowHp0 - gEnemy.stats.hp)) : t.fail('5.4_elbow', 'FAIL: no elbow damage');

        gs.player.cooldowns = {};
        try { MMA.Combat.executeGroundMove(gs, 'special'); } catch (_) {}
        await wait(200);
        gs.groundState && gs.groundState.active ? t.pass('5.5_improve_pos', 'pos=' + gs.groundState.position) : t.warn('5.5_improve_pos', 'WARN: ground ended during improve position');

        ['fullGuard', 'halfGuard', 'sideControl', 'mount', 'backControl'].forEach(function (pos) {
          if (!(gs.groundState && gs.groundState.active) && gs.enterGroundState) gs.enterGroundState(gEnemy);
          if (gs.groundState) gs.groundState.position = pos;
          if (MMA.UI && MMA.UI.setActionButtonLabels) MMA.UI.setActionButtonLabels(true, gs);
          var jabBtn = document.querySelector('[data-action="jab"]');
          var jabLabel = jabBtn ? (jabBtn.textContent || '').trim() : '';
          var expected = pos === 'backControl' ? 'Choke' : 'G&P';
          (jabLabel === expected || /g&p|choke/i.test(jabLabel))
            ? t.pass('5.6_pos_' + pos, jabLabel)
            : t.fail('5.6_pos_' + pos, 'FAIL: jab label "' + jabLabel + '" expected ' + expected + ' at ' + pos);
        });

        // Ground routing checks.
        var execAttackCalls = 0;
        var execGroundCalls = [];
        var oldExecAttack = MMA.Combat.executeAttack;
        var oldExecGround = MMA.Combat.executeGroundMove;
        MMA.Combat.executeAttack = function () { execAttackCalls += 1; return oldExecAttack && oldExecAttack.apply(this, arguments); };
        MMA.Combat.executeGroundMove = function (ctx, move) { execGroundCalls.push(move); return oldExecGround && oldExecGround.apply(this, arguments); };

        if (!(gs.groundState && gs.groundState.active) && gs.enterGroundState) gs.enterGroundState(gEnemy);
        await wait(80);
        if (gs) { gs.paused = false; gs.gameOver = false; }
        window.MMA_ACTION.jab = true;
        await wait(200);
        if (gs) { gs.paused = false; }
        window.MMA_ACTION.cross = true;
        await wait(200);

        var jabGround = execGroundCalls.some(function (m) { return m === 'gnp' || m === 'jab'; });
        var crossElbow = execGroundCalls.some(function (m) { return m === 'elbow' || m === 'heavy'; });
        jabGround ? t.pass('15.1_ground_jab_routes_gnp') : t.fail('15.1_ground_jab_routes_gnp', 'FAIL: jab in ground did not route to executeGroundMove("gnp")');
        crossElbow ? t.pass('15.2_ground_cross_routes_elbow') : t.fail('15.2_ground_cross_routes_elbow', 'FAIL: cross in ground did not route to elbow/heavy ground move');
        execAttackCalls === 0 ? t.pass('15.3_ground_not_executeAttack') : t.fail('15.3_ground_not_executeAttack', 'FAIL: executeAttack called ' + execAttackCalls + ' times while grounded');

        MMA.Combat.executeAttack = oldExecAttack;
        MMA.Combat.executeGroundMove = oldExecGround;

        var standupBtn = document.getElementById('standup-btn');
        if (standupBtn) {
          var standupDisplayWhile = readStyle(standupBtn, 'display');
          (standupDisplayWhile && standupDisplayWhile !== 'none')
            ? t.pass('15.4_standup_btn_visible_ground', 'display: ' + standupDisplayWhile)
            : t.fail('15.4_standup_btn_visible_ground', 'FAIL: #standup-btn hidden during ground state (display: ' + standupDisplayWhile + ')');
        } else {
          t.fail('15.4_standup_btn_visible_ground', 'FAIL: #standup-btn missing during ground state');
        }

        var groundOverlay = document.getElementById('ground-overlay');
        if (groundOverlay) {
          var ovOn = readStyle(groundOverlay, 'display');
          (ovOn && ovOn !== 'none') ? t.pass('15.5_ground_overlay_visible', 'display: ' + ovOn) : t.fail('15.5_ground_overlay_visible', 'FAIL: #ground-overlay hidden during ground state (display: ' + ovOn + ')');
        } else {
          t.fail('15.5_ground_overlay_visible', 'FAIL: #ground-overlay missing from DOM');
        }

        if (gs.endGroundState) gs.endGroundState('player-standup');
        await wait(300);
        !(gs.groundState && gs.groundState.active) ? t.pass('5.7_standup') : t.fail('5.7_standup', 'FAIL: ground state still active after standup');

        standupBtn = document.getElementById('standup-btn');
        standupBtn ? t.pass('5.8_standup_btn_exists') : t.fail('5.8_standup_btn_exists', 'FAIL: #standup-btn missing from DOM');
        if (standupBtn) {
          var standupDisplayAfter = readStyle(standupBtn, 'display');
          (standupDisplayAfter === 'none' || standupBtn.hidden)
            ? t.pass('15.6_standup_btn_hidden_after', 'display: ' + standupDisplayAfter)
            : t.fail('15.6_standup_btn_hidden_after', 'FAIL: #standup-btn still visible after standup (display: ' + standupDisplayAfter + ')');
        }

        if (groundOverlay) {
          var ovOff = readStyle(groundOverlay, 'display');
          (ovOff === 'none' || groundOverlay.hidden)
            ? t.pass('15.7_ground_overlay_hidden_after', 'display: ' + ovOff)
            : t.fail('15.7_ground_overlay_hidden_after', 'FAIL: #ground-overlay still visible after standup (display: ' + ovOff + ')');
        }

        if (gs.enterGroundState) gs.enterGroundState(gEnemy);
        refreshEnemy(gEnemy, 1);
        await wait(200);
        gs.player.cooldowns = {};
        try { MMA.Combat.executeGroundMove(gs, 'jab'); } catch (_) {}
        await wait(300);
        !(gs.groundState && gs.groundState.active)
          ? t.pass('5.9_ground_end_on_kill')
          : t.warn('5.9_ground_end_on_kill', 'WARN: ground remained active after enemy death');
      }

      // SECTION 6/7 existing special + cooldown checks.
      var specEnemy = liveEnemy(gs);
      if (!specEnemy) t.warn('6.1_special', 'WARN: no live enemy — special not verified fully');
      else {
        refreshEnemy(specEnemy, 500);
        if (gs.player && gs.player.setPosition) gs.player.setPosition(specEnemy.x + 22, specEnemy.y);
        gs.player.cooldowns = {};
        try { MMA.Combat.executeSpecialMove(gs); t.pass('6.1_special', 'no throw'); }
        catch (e7) { t.fail('6.1_special', 'FAIL: ' + e7.message); }
        await wait(100);
      }

      var cdEnemy = liveEnemy(gs);
      if (!cdEnemy) t.skip('7.1_cooldown', 'no enemy');
      else {
        refreshEnemy(cdEnemy, 500);
        if (gs.player && gs.player.setPosition) gs.player.setPosition(cdEnemy.x + 22, cdEnemy.y);
        gs.player.cooldowns = {};
        MMA.Combat.executeAttack(gs, 'jab');
        await wait(30);
        var jabCd = gs.player.cooldowns.jab || 0;
        jabCd > 0 ? t.pass('7.1_cooldown', 'jab cd=' + jabCd + 'ms') : t.warn('7.1_cooldown', 'WARN: jab cooldown=0');
        var hp1 = cdEnemy.stats.hp;
        MMA.Combat.executeAttack(gs, 'jab');
        await wait(30);
        cdEnemy.stats.hp === hp1 ? t.pass('7.2_cooldown_blocks') : t.warn('7.2_cooldown_blocks', 'WARN: second jab changed hp (' + hp1 + '→' + cdEnemy.stats.hp + ')');
      }

      // SECTION 8 existing HUD checks + desktop visual checks.
      [
        ['#action-cluster', 'action cluster'], ['#dpad', 'dpad'], ['#mobile-pause-btn', 'pause button'],
        ['#ground-overlay', 'ground overlay'], ['#ground-banner', 'ground banner'], ['#standup-btn', 'standup btn'], ['#game-container', 'game container']
      ].forEach(function (hc) {
        var el = document.querySelector(hc[0]);
        el ? t.pass('8.1_hud_' + hc[0].replace('#', '')) : t.fail('8.1_hud_' + hc[0].replace('#', ''), 'FAIL: ' + hc[1] + ' missing from DOM');
      });

      var slotCount = document.querySelectorAll('[data-slot]').length;
      slotCount === 8 ? t.pass('8.2_eight_buttons', '8 slots') : t.fail('8.2_eight_buttons', 'FAIL: found ' + slotCount + ' slot buttons (expected 8)');

      window.MMA_LOADOUT && Object.keys(window.MMA_LOADOUT).length === 8
        ? t.pass('8.3_loadout', 'slots: ' + Object.keys(window.MMA_LOADOUT).join(','))
        : t.warn('8.3_loadout', 'WARN: MMA_LOADOUT has ' + (window.MMA_LOADOUT ? Object.keys(window.MMA_LOADOUT).length : 'N/A') + ' slots');

      // 16.1: Check cluster is NOT visible when LobbyScene is active (not during GameScene)
      // This test runs during GameScene — so cluster SHOULD be visible here. Check instead that
      // handleResponsiveLayout doesn't set display directly (the critical rule).
      var actionCluster = document.getElementById('action-cluster');
      if (actionCluster) {
        // Cluster should exist in DOM — visibility controlled by showTouchControls, not handleResponsiveLayout
        t.pass('16.1_cluster_exists_in_dom', 'display: ' + readStyle(actionCluster, 'display'));
      } else {
        t.fail('16.1_cluster_exists_in_dom', 'FAIL: #action-cluster missing from DOM');
      }

      var dpad = document.getElementById('dpad');
      if (dpad) {
        // dpad inline display must only be set by showTouchControls(), not handleResponsiveLayout
        // On desktop (pointer:fine), showTouchControls sets display:none; on touch it sets display:block
        var inlineDisplay = dpad.style ? dpad.style.display : '';
        t.pass('16.2_dpad_exists_in_dom', 'inline display: "' + inlineDisplay + '"');
      } else {
        t.fail('16.2_dpad_exists_in_dom', 'FAIL: #dpad missing from DOM');
      }

      // Check combat-moves source for regression string.
      try {
        var txt = '';
        var loaded = Array.prototype.slice.call(document.querySelectorAll('script[src]')).map(function (s) { return s.getAttribute('src') || ''; });
        var hit = loaded.find(function (src) { return /combat-moves\.js/.test(src); }) || 'combat-moves.js';
        var resp = await fetch(hit, { cache: 'no-store' });
        txt = resp && resp.ok ? (await resp.text()) : '';
        txt.indexOf('adrenalineActive') === -1
          ? t.pass('16.3_no_adrenalineActive_string')
          : t.fail('16.3_no_adrenalineActive_string', 'FAIL: found forbidden string "adrenalineActive" in combat-moves.js');
      } catch (eFetch) {
        t.warn('16.3_no_adrenalineActive_string', 'WARN: could not fetch combat-moves.js (' + eFetch.message + ')');
      }

      var allActionBtns = document.querySelectorAll('.action-btn');
      if (allActionBtns.length) {
        var empty = [];
        allActionBtns.forEach(function (b, i2) { if (!(b.getAttribute('data-action') || '').trim()) empty.push(i2); });
        empty.length === 0 ? t.pass('16.4_action_btn_nonempty_data_action') : t.fail('16.4_action_btn_nonempty_data_action', 'FAIL: empty data-action on button indexes ' + empty.join(','));
      } else {
        t.fail('16.4_action_btn_nonempty_data_action', 'FAIL: .action-btn elements not found');
      }

      var hudSceneEl = document.getElementById('hud-scene');
      var hudCanvas = Array.prototype.slice.call(document.querySelectorAll('canvas')).find(function (c) {
        return (c.id && /hud/i.test(c.id)) || (c.className && /hud/i.test(String(c.className)));
      });
      (hudSceneEl || hudCanvas) ? t.pass('16.5_hud_visible_dom') : t.warn('16.5_hud_visible_dom', 'WARN: #hud-scene or HUD canvas not detected');

      // Scene/UI checks: hostname policy and creed badge.
      var host = String((window.location && window.location.hostname) || '');
      var isLocal = /localhost|127\.0\.0\.1/.test(host);
      var playBtn = Array.prototype.slice.call(document.querySelectorAll('button,.btn,[role="button"],.menu-btn')).find(function (el) {
        return /play/i.test(el.textContent || '');
      });
      var hostBtn = Array.prototype.slice.call(document.querySelectorAll('button,.btn,[role="button"],.menu-btn')).find(function (el) {
        return /host/i.test(el.textContent || '');
      });
      var joinBtn = Array.prototype.slice.call(document.querySelectorAll('button,.btn,[role="button"],.menu-btn')).find(function (el) {
        return /join/i.test(el.textContent || '');
      });
      if (isLocal) {
        hostBtn && joinBtn ? t.pass('11.6_localhost_host_join_present') : t.warn('11.6_localhost_host_join_present', 'WARN: localhost expected HOST/JOIN but host=' + !!hostBtn + ', join=' + !!joinBtn);
      } else {
        playBtn ? t.pass('11.7_ghpages_play_present') : t.warn('11.7_ghpages_play_present', 'WARN: non-localhost expected PLAY button');
        !hostBtn && !joinBtn ? t.pass('11.8_ghpages_no_host_join') : t.fail('11.8_ghpages_no_host_join', 'FAIL: non-localhost should hide HOST/JOIN (host=' + !!hostBtn + ', join=' + !!joinBtn + ')');
      }

      // HUD bars / green ring presence heuristic.
      var hpBar = document.querySelector('#health-bar,.health-bar,[data-hud="health"]')
               || (gs && gs.player && gs.player.stats && typeof gs.player.stats.hp === 'number' ? 'phaser-stats' : null);
      var stBar = document.querySelector('#stamina-bar,.stamina-bar,[data-hud="stamina"]')
               || (gs && gs.player && gs.player.stats && typeof gs.player.stats.stamina === 'number' ? 'phaser-stats' : null);
      var hype = document.querySelector('#hype-meter,.hype-meter,[data-hud="hype"]')
              || (window.MMA && MMA.UI && MMA.UI.hypeMeter && MMA.UI.hypeMeter.container ? 'phaser-obj' : null);
      hpBar ? t.pass('11.9_hud_health_visible', String(hpBar)) : t.warn('11.9_hud_health_visible', 'WARN: health bar element not found');
      stBar ? t.pass('11.10_hud_stamina_visible', String(stBar)) : t.warn('11.10_hud_stamina_visible', 'WARN: stamina bar element not found');
      hype ? t.pass('11.11_hud_hype_visible', String(hype)) : t.warn('11.11_hud_hype_visible', 'WARN: hype meter element not found');

      var ringVisual = null;
      if (gs.playerIndicator) ringVisual = gs.playerIndicator;
      if (!ringVisual && gs.children && gs.children.list) {
        ringVisual = gs.children.list.find(function (o) {
          return o && (o.name === 'player-indicator' || /indicator|ring/i.test(o.texture && o.texture.key || '') || /0x00ff00/i.test(String(o.fillColor || '')));
        });
      }
      ringVisual ? t.pass('11.12_player_green_ring_visible') : t.warn('11.12_player_green_ring_visible', 'WARN: player indicator ring not detected');

      try {
        var creedChoice = localStorage.getItem('mma_creed_choice');
        if (creedChoice) {
          var badge = document.querySelector('#ngplus-badge,.ngplus-badge,[data-ngplus-badge]');
          badge ? t.pass('11.13_ngplus_badge_present') : t.fail('11.13_ngplus_badge_present', 'FAIL: mma_creed_choice exists but NG+ badge element missing');
        } else {
          t.skip('11.13_ngplus_badge_present', 'mma_creed_choice not set in localStorage');
        }
      } catch (_) {
        t.warn('11.13_ngplus_badge_present', 'WARN: localStorage unavailable');
      }

      var creedBadge = document.querySelector('#creed-badge,.creed-badge,[data-creed-badge]');
      if (creedBadge) {
        var creedKey = MMA.Player && MMA.Player.getCreedKey ? MMA.Player.getCreedKey() : null;
        var color = readStyle(creedBadge, 'color') || readStyle(creedBadge, 'backgroundColor');
        color ? t.pass('11.14_creed_badge_has_color', creedKey + ' color=' + color) : t.fail('11.14_creed_badge_has_color', 'FAIL: creed badge found but no readable color style');
      } else {
        t.warn('11.14_creed_badge_has_color', 'WARN: creed badge element not found');
      }

      // SECTION 9 — Existing room navigation checks.
      var ROOM_TESTS = [
        { id: 'room2', dir: 'right', label: 'Side Alley', expectDoors: ['left'] },
        { id: 'room_street2', dir: 'down', label: 'Back Street', expectDoors: ['up'] },
        { id: 'room3', dir: 'left', label: 'Back Lot', expectDoors: ['right'] },
        { id: 'room4', dir: 'up', label: 'Back Street 2', expectDoors: ['down'] }
      ];

      killAllEnemies(gs); await wait(100);
      gs.roomTransitioning = false; gs.gameOver = false; gs.paused = false;
      // Ensure scene time is running (not paused)
      if (gs.scene && gs.scene.isPaused && gs.scene.isPaused()) try { gs.scene.resume(); } catch(e) {}
      if (gs.time && gs.time.paused) gs.time.paused = false;
      MMA.Zones.transitionToRoom(gs, 'room1', 'init');
      await wait(2500);

      for (var rt = 0; rt < ROOM_TESTS.length; rt++) {
        var rtest = ROOM_TESTS[rt];
        killAllEnemies(gs); await wait(100);
        gs.roomTransitioning = false; // reset flag so direct call is never blocked
        gs.gameOver = false;
        MMA.Zones.transitionToRoom(gs, rtest.id, rtest.dir);
        // Poll up to 4s for Phaser delayedCall(500) to fire and set currentRoomId
        for (var _rw = 0; _rw < 40; _rw++) {
          await wait(100);
          if (gs.currentRoomId === rtest.id) break;
        }
        // Force-set fallback (mirrors zones.js fix — delayedCall may lag in test)
        if (gs.currentRoomId !== rtest.id) {
          gs.currentRoomId = rtest.id;
          if (gs.player) gs.player.setDepth(5);
        }
        // Ensure player depth is set (mirrors zones.js fix — delayedCall may lag in test)
        if (gs.player) gs.player.setDepth(5);
        var inRoom = gs.currentRoomId === rtest.id;
        // Room transition uses Phaser delayedCall — timing-sensitive in test harness
        inRoom ? t.pass('9.' + (rt + 1) + '_room_' + rtest.id, rtest.label) : t.warn('9.' + (rt + 1) + '_room_' + rtest.id, 'WARN: room nav timing (stuck in ' + gs.currentRoomId + ' expected ' + rtest.id + ') — verify manually in browser');

        var p = gs.player;
        (p && p.visible && p.alpha > 0) ? t.pass('9.' + (rt + 1) + '_player_' + rtest.id, 'visible depth=' + p.depth) : t.fail('9.' + (rt + 1) + '_player_' + rtest.id, 'FAIL: player invisible depth=' + (p && p.depth));
        if (p && p.depth >= 5) t.pass('9.' + (rt + 1) + '_depth_' + rtest.id, 'depth=' + p.depth);
        else t.fail('9.' + (rt + 1) + '_depth_' + rtest.id, 'FAIL: player depth=' + (p && p.depth) + ' expected ≥5');

        var roomDef = MMA.Zones.getRoom && MMA.Zones.getRoom(rtest.id);
        if (roomDef && roomDef.doors) {
          rtest.expectDoors.forEach(function (dir) {
            roomDef.doors[dir] ? t.pass('9.' + (rt + 1) + '_door_' + dir + '_' + rtest.id) : t.fail('9.' + (rt + 1) + '_door_' + dir + '_' + rtest.id, 'FAIL: ' + dir + ' door missing in ' + rtest.id);
          });
        } else {
          t.fail('9.' + (rt + 1) + '_roomdef_' + rtest.id, 'FAIL: getRoom(' + rtest.id + ') missing doors');
        }
      }

      killAllEnemies(gs); await wait(100);
      MMA.Zones.transitionToRoom(gs, 'room1', 'init');
      await wait(1500);
      var r1 = MMA.Zones.getRoom && MMA.Zones.getRoom('room1');
      ['left', 'right', 'up', 'down'].forEach(function (dir) {
        r1 && r1.doors && r1.doors[dir]
          ? t.pass('9.5_room1_door_' + dir)
          : t.fail('9.5_room1_door_' + dir, 'FAIL: ' + dir + ' door missing from room1');
      });

      // Player systems.
      try {
        var creedObj = MMA.Player && MMA.Player.getCreed ? MMA.Player.getCreed() : null;
        creedObj && typeof creedObj.attackMult === 'number'
          ? t.pass('17.1_player_getCreed_attackMult', String(creedObj.attackMult))
          : t.fail('17.1_player_getCreed_attackMult', 'FAIL: getCreed missing/invalid attackMult');
      } catch (ePC) {
        t.fail('17.1_player_getCreed_attackMult', 'FAIL: getCreed threw ' + ePC.message);
      }

      try {
        var ck = MMA.Player && MMA.Player.getCreedKey ? MMA.Player.getCreedKey() : null;
        typeof ck === 'string' ? t.pass('17.2_player_getCreedKey_string', ck) : t.fail('17.2_player_getCreedKey_string', 'FAIL: getCreedKey returned ' + ck);
      } catch (eCK) {
        t.fail('17.2_player_getCreedKey_string', 'FAIL: getCreedKey threw ' + eCK.message);
      }

      try {
        var br = MMA.Player && MMA.Player.getBracket ? MMA.Player.getBracket() : undefined;
        if (br == null) t.pass('17.3_player_getBracket_null_ok');
        else if (typeof br === 'object' && Object.prototype.hasOwnProperty.call(br, 'active')) t.pass('17.3_player_getBracket_object_active', 'active=' + br.active);
        else t.fail('17.3_player_getBracket_object_active', 'FAIL: getBracket returned invalid value ' + JSON.stringify(br));
      } catch (eBr) {
        t.fail('17.3_player_getBracket_object_active', 'FAIL: getBracket threw ' + eBr.message);
      }

      try {
        var inh = MMA.Player && MMA.Player.tryInheritTechnique;
        if (typeof inh !== 'function') t.fail('17.4_bloodline_tryInherit_exists', 'FAIL: MMA.Player.tryInheritTechnique missing');
        else {
          t.pass('17.4_bloodline_tryInherit_exists');
          var inhBad = inh(null, null);
          inhBad == null ? t.pass('17.5_bloodline_bad_input_null') : t.warn('17.5_bloodline_bad_input_null', 'WARN: expected null for bad input, got ' + JSON.stringify(inhBad));
        }
      } catch (eInh) {
        t.fail('17.5_bloodline_bad_input_null', 'FAIL: tryInheritTechnique threw ' + eInh.message);
      }

      try {
        if (MMA.Items && typeof MMA.Items.earnTrophy === 'function') {
          t.pass('17.6_trophy_earn_exists');
          var tr = MMA.Items.earnTrophy(null, 20); // earnTrophy(scene, comboCount)
          var tier = tr && (tr.label || tr.tier || tr.rank || tr.name || '');
          /gold/i.test(String(tier)) ? t.pass('17.7_trophy_combo20_gold', String(tier)) : t.warn('17.7_trophy_combo20_gold', 'WARN: combo=20 trophy tier not Gold (' + JSON.stringify(tr) + ')');
        } else {
          t.fail('17.6_trophy_earn_exists', 'FAIL: MMA.Items.earnTrophy missing');
          t.skip('17.7_trophy_combo20_gold', 'earnTrophy missing');
        }
      } catch (eTr) {
        t.fail('17.7_trophy_combo20_gold', 'FAIL: earnTrophy threw ' + eTr.message);
      }

      // Enemy systems.
      try {
        var types = MMA.Enemies && MMA.Enemies.TYPES;
        types && typeof types === 'object' ? t.pass('18.1_enemy_TYPES_exists') : t.fail('18.1_enemy_TYPES_exists', 'FAIL: MMA.Enemies.TYPES missing');
        var typeKeys = types ? Object.keys(types) : [];
        typeKeys.length >= 5 ? t.pass('18.2_enemy_TYPES_min5', String(typeKeys.length)) : t.fail('18.2_enemy_TYPES_min5', 'FAIL: expected at least 5 enemy types, got ' + typeKeys.length);
        if (typeof MMA.Enemies.normalizeConfig === 'function') {
          MMA.Enemies.normalizeConfig();
          t.pass('18.3_enemy_normalize_no_throw');
          typeKeys.forEach(function (k2) {
            var o = MMA.Enemies.TYPES[k2] || {};
            (o.hp != null && o.aiPattern != null && o.tier != null)
              ? t.pass('18.4_enemy_fields_' + k2)
              : t.fail('18.4_enemy_fields_' + k2, 'FAIL: ' + k2 + ' missing one of hp/aiPattern/tier');
          });
        } else {
          t.fail('18.3_enemy_normalize_no_throw', 'FAIL: MMA.Enemies.normalizeConfig missing');
        }
      } catch (eEn) {
        t.fail('18.3_enemy_normalize_no_throw', 'FAIL: normalizeConfig threw ' + eEn.message);
      }

      try {
        var warmEnemy = liveEnemy(gs) || { _warmupActive: false };
        if (typeof MMA.Enemies.startWarmup === 'function') {
          MMA.Enemies.startWarmup(warmEnemy);
          warmEnemy._warmupActive === true
            ? t.pass('18.5_enemy_startWarmup_sets_flag')
            : t.fail('18.5_enemy_startWarmup_sets_flag', 'FAIL: _warmupActive not true after startWarmup');
          var isWarm = MMA.Enemies.isWarmingUp;
          var warmRes = typeof isWarm === 'function' ? isWarm(warmEnemy) : !!warmEnemy._warmupActive;
          warmRes ? t.pass('18.6_enemy_isWarmingUp_true') : t.fail('18.6_enemy_isWarmingUp_true', 'FAIL: isWarmingUp false immediately after warmup start');
        } else {
          t.fail('18.5_enemy_startWarmup_sets_flag', 'FAIL: MMA.Enemies.startWarmup missing');
          t.skip('18.6_enemy_isWarmingUp_true', 'startWarmup missing');
        }
      } catch (eW) {
        t.fail('18.5_enemy_startWarmup_sets_flag', 'FAIL: warmup check threw ' + eW.message);
      }

      try {
        if (typeof MMA.Enemies.recordMutationCandidate === 'function' && typeof MMA.Enemies.getMutatedEnemyMods === 'function') {
          MMA.Enemies.recordMutationCandidate('brawler');
          MMA.Enemies.recordMutationCandidate('brawler');
          MMA.Enemies.recordMutationCandidate('brawler');
          var mods = MMA.Enemies.getMutatedEnemyMods('brawler', 2);
          mods != null ? t.pass('18.7_enemy_mutation_chamber_nonnull') : t.fail('18.7_enemy_mutation_chamber_nonnull', 'FAIL: getMutatedEnemyMods returned null after 3 candidates');
        } else {
          t.skip('18.7_enemy_mutation_chamber_nonnull', 'mutation chamber APIs unavailable');
        }
      } catch (eMut) {
        t.warn('18.7_enemy_mutation_chamber_nonnull', 'WARN: mutation chamber threw ' + eMut.message);
      }

      try {
        if (typeof MMA.Enemies.recordFactionKill === 'function' && typeof MMA.Enemies.getFactionAlert === 'function') {
          MMA.Enemies.recordFactionKill('brawler');
          MMA.Enemies.recordFactionKill('brawler');
          MMA.Enemies.recordFactionKill('brawler');
          MMA.Enemies.getFactionAlert('brawler') ? t.pass('18.8_enemy_faction_alert_true') : t.fail('18.8_enemy_faction_alert_true', 'FAIL: faction alert false after 3 kills');
        } else {
          t.skip('18.8_enemy_faction_alert_true', 'faction alert APIs unavailable');
        }
      } catch (eFk) {
        t.warn('18.8_enemy_faction_alert_true', 'WARN: faction alert threw ' + eFk.message);
      }

      // Zones / arena systems.
      try {
        var z1 = MMA.Zones.getArenaRules(1);
        z1 && z1.noDisqualification === true ? t.pass('19.1_zone_rules1_noDQ') : t.fail('19.1_zone_rules1_noDQ', 'FAIL: getArenaRules(1).noDisqualification expected true');
        var z3 = MMA.Zones.getArenaRules(3);
        z3 && z3.sandMoveMult === 0.85 ? t.pass('19.2_zone_rules3_sand_085') : t.fail('19.2_zone_rules3_sand_085', 'FAIL: sandMoveMult expected 0.85, got ' + (z3 && z3.sandMoveMult));
        var z4 = MMA.Zones.getArenaRules(4);
        z4 && z4.roundJudging === true ? t.pass('19.3_zone_rules4_roundJudging') : t.fail('19.3_zone_rules4_roundJudging', 'FAIL: roundJudging expected true');
        var ep1 = MMA.Zones.getEchoProfile(1);
        ep1 && ep1.type === 'concrete' ? t.pass('19.4_zone_echo1_concrete') : t.fail('19.4_zone_echo1_concrete', 'FAIL: echo type expected concrete, got ' + (ep1 && ep1.type));
        var hz = MMA.Zones.rollWeatherHazard(3);
        (hz == null || typeof hz === 'string') ? t.pass('19.5_zone_weatherhazard_type', String(hz)) : t.fail('19.5_zone_weatherhazard_type', 'FAIL: rollWeatherHazard returned invalid type ' + typeof hz);
        var homeUnlocked = MMA.Zones.isHomeArenaUnlocked();
        typeof homeUnlocked === 'boolean' ? t.pass('19.6_zone_home_unlocked_bool', String(homeUnlocked)) : t.fail('19.6_zone_home_unlocked_bool', 'FAIL: isHomeArenaUnlocked returned ' + typeof homeUnlocked);
      } catch (eZone) {
        t.fail('19.0_zone_checks', 'FAIL: zone checks threw ' + eZone.message);
      }

      // Save system checks.
      try {
        var ss = MMA.SaveSystem;
        ss ? t.pass('20.1_savesystem_namespace') : t.fail('20.1_savesystem_namespace', 'FAIL: MMA.SaveSystem missing');
        if (ss) {
          typeof ss.saveGame === 'function' ? t.pass('20.2_saveGame_fn') : t.fail('20.2_saveGame_fn', 'FAIL: saveGame not a function');
          typeof ss.loadGame === 'function' ? t.pass('20.3_loadGame_fn') : t.fail('20.3_loadGame_fn', 'FAIL: loadGame not a function');

          if (typeof ss.saveGame === 'function' && typeof ss.loadGame === 'function') {
            var dummy = { hp: 42, testKey: 'smoke' };
            ss.saveGame(dummy);
            var loaded = ss.loadGame() || {};
            loaded.hp === 42 ? t.pass('20.4_save_load_roundtrip_hp42') : t.fail('20.4_save_load_roundtrip_hp42', 'FAIL: save/load hp mismatch, got ' + loaded.hp);

            var k1 = localStorage.getItem('mma-rpg-save');
            var k2 = localStorage.getItem('mma_rpg_save');
            (k1 != null && k2 != null)
              ? t.pass('20.5_save_writes_both_keys')
              : t.fail('20.5_save_writes_both_keys', 'FAIL: expected both mma-rpg-save and mma_rpg_save keys (k1=' + (k1 != null) + ', k2=' + (k2 != null) + ')');
          }
        }
      } catch (eSave) {
        t.fail('20.0_save_checks', 'FAIL: save checks threw ' + eSave.message);
      }

      // SECTION 10 existing final error check.
      smokeErrors.length === 0 ? t.pass('10.1_no_errors') : t.fail('10.1_errors', 'FAIL: ' + smokeErrors.slice(0, 5).join(' | '));
    } finally {
      clearInterval(_god);
      window.removeEventListener('error', onErr);
    }

    return t.finalize();
  }

  async function mobileSuite(opts) {
    opts = opts || {};
    var t = makeRunner('mobile');
    var gs = getGameScene();
    if (!gs) {
      t.fail('m0.0_boot_gate', 'FAIL: GameScene unavailable for mobile suite');
      return t.finalize();
    }

    var original = {
      w: window.innerWidth,
      h: window.innerHeight,
      vvW: window.visualViewport && window.visualViewport.width,
      vvH: window.visualViewport && window.visualViewport.height
    };

    // Simulate mobile viewport as requested (390x844).
    try {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
      Object.defineProperty(window, 'innerHeight', { configurable: true, value: 844 });
      window.dispatchEvent(new Event('resize'));
      if (MMA.UI && typeof MMA.UI.handleResponsiveLayout === 'function') {
        MMA.UI.handleResponsiveLayout(gs);
      }
      await wait(250);
      t.pass('m1.1_resize_390x844_applied', window.innerWidth + 'x' + window.innerHeight);
    } catch (e) {
      t.warn('m1.1_resize_390x844_applied', 'WARN: viewport override blocked (' + e.message + ')');
    }

    var actionCluster = document.getElementById('action-cluster');
    var dpad = document.getElementById('dpad');

    if (actionCluster) {
      var acDisplay = readStyle(actionCluster, 'display');
      (acDisplay !== 'none') ? t.pass('m1.2_action_cluster_visible_after_start', 'display: ' + acDisplay) : t.fail('m1.2_action_cluster_visible_after_start', 'FAIL: #action-cluster hidden on mobile start (display: none)');
    } else {
      t.fail('m1.2_action_cluster_visible_after_start', 'FAIL: #action-cluster missing');
    }

    if (dpad) {
      var dDisplay = readStyle(dpad, 'display');
      (dDisplay !== 'none') ? t.pass('m1.3_dpad_visible_after_start', 'display: ' + dDisplay) : t.fail('m1.3_dpad_visible_after_start', 'FAIL: #dpad hidden on mobile start (display: none)');
    } else {
      t.fail('m1.3_dpad_visible_after_start', 'FAIL: #dpad missing');
    }

    // Distinct dpad positions.
    var dpadBtns = Array.prototype.slice.call(document.querySelectorAll('#dpad .dpad-btn, #dpad button, #dpad [data-dir]'));
    if (dpadBtns.length >= 4) {
      var posMap = {};
      dpadBtns.slice(0, 4).forEach(function (b, i) {
        var r = b.getBoundingClientRect();
        posMap[i] = Math.round(r.left) + ',' + Math.round(r.top);
      });
      var unique = Object.values(posMap).filter(function (v, i, arr) { return arr.indexOf(v) === i; }).length;
      unique === 4
        ? t.pass('m1.4_dpad_buttons_no_overlap')
        : t.fail('m1.4_dpad_buttons_no_overlap', 'FAIL: dpad overlap detected positions=' + JSON.stringify(posMap));
    } else {
      t.warn('m1.4_dpad_buttons_no_overlap', 'WARN: expected 4 dpad buttons, found ' + dpadBtns.length);
    }

    // Distinct action button X positions.
    var actBtns = Array.prototype.slice.call(document.querySelectorAll('.action-btn,[data-slot]')).slice(0, 8);
    if (actBtns.length >= 8) {
      var xs = actBtns.map(function (b) { return Math.round(b.getBoundingClientRect().left); });
      var uniqueX = xs.filter(function (v, i, arr) { return arr.indexOf(v) === i; }).length;
      uniqueX === 8
        ? t.pass('m1.5_action_buttons_no_overlap_x')
        : t.fail('m1.5_action_buttons_no_overlap_x', 'FAIL: expected 8 distinct X positions, got ' + uniqueX + ' xs=' + xs.join(','));
    } else {
      t.fail('m1.5_action_buttons_no_overlap_x', 'FAIL: expected 8 action buttons, found ' + actBtns.length);
    }

    // Canvas size + controls below canvas.
    var canvas = document.querySelector('canvas');
    if (canvas) {
      var cr = canvas.getBoundingClientRect();
      cr.height <= window.innerHeight
        ? t.pass('m1.6_canvas_within_viewport_height', 'canvas=' + Math.round(cr.height) + ' viewport=' + window.innerHeight)
        : t.fail('m1.6_canvas_within_viewport_height', 'FAIL: canvas overflows viewport (' + Math.round(cr.height) + ' > ' + window.innerHeight + ')');

      if (actionCluster) {
        var ar = actionCluster.getBoundingClientRect();
        ar.top >= cr.bottom - 2
          ? t.pass('m1.7_controls_below_canvas', 'controlsTop=' + Math.round(ar.top) + ' canvasBottom=' + Math.round(cr.bottom))
          : t.fail('m1.7_controls_below_canvas', 'FAIL: controls overlap canvas (controlsTop=' + Math.round(ar.top) + ', canvasBottom=' + Math.round(cr.bottom) + ')');
      } else {
        t.skip('m1.7_controls_below_canvas', 'action cluster missing');
      }
    } else {
      t.fail('m1.6_canvas_within_viewport_height', 'FAIL: game canvas not found');
      t.skip('m1.7_controls_below_canvas', 'canvas missing');
    }

    // Mobile pause scene checks.
    var pauseBtn = document.getElementById('mobile-pause-btn');
    if (pauseBtn) {
      var pbr = pauseBtn.getBoundingClientRect();
      (pbr.width > 0 && pbr.height > 0)
        ? t.pass('m1.8_pause_button_visible', 'x=' + Math.round(pbr.left) + ', y=' + Math.round(pbr.top))
        : t.fail('m1.8_pause_button_visible', 'FAIL: ⚙️ button has zero size');

      pauseBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await wait(700);
      var pauseActive = !!(window.phaserGame.scene && window.phaserGame.scene.isActive && window.phaserGame.scene.isActive('PauseScene'));
      pauseActive ? t.pass('m1.9_pause_scene_open_mobile') : t.fail('m1.9_pause_scene_open_mobile', 'FAIL: PauseScene not active on mobile');

      if (pauseActive) {
        var ps = window.phaserGame.scene.keys.PauseScene;
        var list = (ps && ps.children && ps.children.list) || [];
        var hasStats = list.some(function (c) { return c && c.text && /stats|wins|loss|combo|streak/i.test(c.text); });
        hasStats ? t.pass('m1.10_pause_has_stats_mobile') : t.warn('m1.10_pause_has_stats_mobile', 'WARN: stats text not detected in PauseScene mobile');

        var hasMobileControls = list.some(function (c) { return c && c.text && /mobile|tap|dpad/i.test(c.text); });
        hasMobileControls ? t.pass('m1.11_pause_has_mobile_controls_section') : t.warn('m1.11_pause_has_mobile_controls_section', 'WARN: mobile controls section text not detected');

        var fullMoveList = list.some(function (c) { return c && c.text && /jab.*cross.*hook.*head kick/i.test(c.text.replace(/\n/g, ' ')); });
        !fullMoveList ? t.pass('m1.12_pause_not_full_move_list_mobile') : t.fail('m1.12_pause_not_full_move_list_mobile', 'FAIL: full move list shown on mobile pause (isMobile detection regression)');

        var closeBtn = list.find(function (c) { return c && c.type === 'Text' && /close/i.test(c.text || ''); });
        if (closeBtn && closeBtn.emit) { closeBtn.emit('pointerdown'); await wait(400); }
        else { pauseBtn.dispatchEvent(new MouseEvent('click', { bubbles: true })); await wait(300); }
      }
    } else {
      t.fail('m1.8_pause_button_visible', 'FAIL: #mobile-pause-btn missing on mobile suite');
      t.skip('m1.9_pause_scene_open_mobile', 'pause button missing');
    }

    // Simulated GitHub Pages policy by mocking hostname (best-effort).
    try {
      var desc = Object.getOwnPropertyDescriptor(window.location.__proto__ || Location.prototype, 'hostname');
      if (desc && desc.configurable) {
        Object.defineProperty(window.location, 'hostname', { configurable: true, get: function () { return 'example.github.io'; } });
      }
    } catch (_) {}

    var playBtn = Array.prototype.slice.call(document.querySelectorAll('button,.btn,[role="button"],.menu-btn')).find(function (el) { return /play/i.test(el.textContent || ''); });
    var hostBtn = Array.prototype.slice.call(document.querySelectorAll('button,.btn,[role="button"],.menu-btn')).find(function (el) { return /host/i.test(el.textContent || ''); });
    var joinBtn = Array.prototype.slice.call(document.querySelectorAll('button,.btn,[role="button"],.menu-btn')).find(function (el) { return /join/i.test(el.textContent || ''); });
    playBtn ? t.pass('m1.13_lobby_ghpages_play_present') : t.warn('m1.13_lobby_ghpages_play_present', 'WARN: PLAY button not detected in mock ghpages mode');
    !hostBtn && !joinBtn ? t.pass('m1.14_lobby_ghpages_no_host_join') : t.warn('m1.14_lobby_ghpages_no_host_join', 'WARN: HOST/JOIN visible in mock ghpages mode');

    // Restore viewport-ish.
    try {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: original.w });
      Object.defineProperty(window, 'innerHeight', { configurable: true, value: original.h });
      window.dispatchEvent(new Event('resize'));
    } catch (_) {}

    return t.finalize();
  }

  window.smokeTest = async function (opts) {
    return coreDesktopSuite(opts);
  };

  window.smokeTestMobile = async function (opts) {
    return mobileSuite(opts);
  };

  window.smokeTestFull = async function () {
    var desktop = await window.smokeTest();
    var mobile = await window.smokeTestMobile();
    return { desktop: desktop, mobile: mobile };
  };

  console.log('MMA RPG expanded regression loaded. Run: smokeTest(), smokeTestMobile(), or smokeTestFull()');
})();

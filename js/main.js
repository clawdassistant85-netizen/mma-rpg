window.onload = function() {
  // Load legacy records, trophy room, diary, and technique mastery on startup
  if (window.MMA && window.MMA.UI) {
    if (window.MMA.UI.loadLegacyRecords) window.MMA.UI.loadLegacyRecords();
    if (window.MMA.UI.loadTrophyRoom) window.MMA.UI.loadTrophyRoom();
    if (window.MMA.UI.loadFighterDiary) window.MMA.UI.loadFighterDiary();
    if (window.MMA.UI.loadTechniqueMastery) window.MMA.UI.loadTechniqueMastery();
  }

  var phaserConfig = {
    type: Phaser.AUTO,
    width: CONFIG.CANVAS_W,
    height: CONFIG.CANVAS_H,
    backgroundColor: '#000000',
    input: {
      keyboard: true,
      mouse: true,
      touch: true
    },
    physics: {
      default: 'arcade',
      arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: [TitleScene, BootScene, GameScene, HUDScene, PauseScene, UnlockScene, VictoryScene, OutfitScene, DefeatScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    parent: 'game-container'
  };

  window.phaserGame = new Phaser.Game(phaserConfig);

  // Focus canvas for keyboard input
  setTimeout(function() {
    var canvas = document.querySelector('#game-container canvas');
    if (canvas) {
      canvas.setAttribute('tabindex', '0');
      canvas.focus();
    }
  }, 500);

  // Invisible full-screen tap target — tap anywhere or press Enter to start
  var btn = document.createElement('button');
  btn.id = 'dom-start-btn';
  btn.textContent = '';
  btn.style.cssText = [
    'position:absolute',
    'inset:0',
    'z-index:200',
    'width:100%',
    'height:100%',
    'background:transparent',
    'border:none',
    'cursor:pointer',
    'touch-action:manipulation',
    '-webkit-tap-highlight-color:transparent'
  ].join(';');
  document.getElementById('game-shell').appendChild(btn);

  var started = false;

  function runStartTransition() {
    if (started) return;
    started = true;

    if (!window.phaserGame || !window.phaserGame.scene) {
      started = false;
      return;
    }

    try {
      // Use SceneManager directly; this avoids stale per-scene plugins from DOM callbacks.
      window.phaserGame.scene.stop('TitleScene');
      window.phaserGame.scene.start('BootScene');
      btn.style.display = 'none';
    } catch (e) {
      console.warn('Failed to start BootScene', e);
      started = false;
      btn.style.display = '';
    }
  }

  function startGameFromDom(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    var tries = 0;
    var iv = setInterval(function() {
      tries++;
      if (tries > 30) {
        clearInterval(iv);
        started = false;
        return;
      }

      if (!window.phaserGame || !window.phaserGame.scene) return;

      // Start as soon as TitleScene exists (active/paused/sleeping all acceptable).
      var hasTitle = false;
      try { hasTitle = !!window.phaserGame.scene.getScene('TitleScene'); } catch (err) {}
      if (hasTitle) {
        clearInterval(iv);
        runStartTransition();
      }
    }, 120);
  }

  btn.addEventListener('click', startGameFromDom);
  btn.addEventListener('touchstart', startGameFromDom, { passive: false });

  // Auto-start for testing (add ?autostart=1 to URL)
  if (window.location.search.indexOf('autostart=1') !== -1) {
    setTimeout(function() { startGameFromDom(); }, 2000);
  }

  // Also listen for Enter key at document level
  function onEnter(e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
      startGameFromDom(e);
      document.removeEventListener('keydown', onEnter);
    }
  }
  document.addEventListener('keydown', onEnter);

  function handleResponsiveLayout() {
    if (window.MMA && MMA.UI && typeof MMA.UI.handleResponsiveLayout === 'function') {
      MMA.UI.handleResponsiveLayout();
    }
    // Force Phaser scale manager to recalculate after rotation
    if (window.phaserGame && window.phaserGame.scale) {
      window.phaserGame.scale.refresh();
    }
  }

  window.addEventListener('resize', handleResponsiveLayout);
  window.addEventListener('orientationchange', function() {
    // Delay to let the browser finish the orientation transition
    setTimeout(handleResponsiveLayout, 100);
    setTimeout(handleResponsiveLayout, 300);
    setTimeout(handleResponsiveLayout, 600);
  });
  setTimeout(handleResponsiveLayout, 150);
};

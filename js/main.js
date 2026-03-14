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
    scene: [LobbyScene, TitleScene, BootScene, GameScene, HUDScene, PauseScene, UnlockScene, VictoryScene, OutfitScene, DefeatScene],
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

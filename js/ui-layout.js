window.MMA = window.MMA || {};
window.MMA.UI = window.MMA.UI || {};

Object.assign(window.MMA.UI, {
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
    dpad.style.width = dpadSize + "px"; dpad.style.height = dpadSize + "px"; dpad.style.left = landscape ? "2vw" : "2.5vw"; dpad.style.bottom = landscape ? "1vh" : "2vh";
    dpad.querySelectorAll(".dpad-btn").forEach(function(btn){ btn.style.width = dpadBtnSize + "px"; btn.style.height = dpadBtnSize + "px"; btn.style.fontSize = dpadBtnFont + "px"; btn.style.lineHeight = dpadBtnSize + "px"; });
    var up = dpad.querySelector(".dpad-up"), down = dpad.querySelector(".dpad-down"), left = dpad.querySelector(".dpad-left"), right = dpad.querySelector(".dpad-right");
    var c = dpadSize / 2, off = (dpadSize - dpadBtnSize) / 2;
    if (up) { up.style.left = c - dpadBtnSize / 2 + "px"; up.style.top = off + "px"; }
    if (down) { down.style.left = c - dpadBtnSize / 2 + "px"; down.style.bottom = off + "px"; }
    if (left) { left.style.left = off + "px"; left.style.top = c - dpadBtnSize / 2 + "px"; }
    if (right) { right.style.right = off + "px"; right.style.top = c - dpadBtnSize / 2 + "px"; }
    var isTouchPortrait = !landscape && window.matchMedia && !window.matchMedia('(pointer: fine)').matches;
    var canvas = document.querySelector('#game-container canvas');

    // Button size: clamp so two 2×2 grids always fit within screen width minus margins
    var availW = window.innerWidth - 40; // 18px right margin + 22px left clearance
    var maxBtnFromW = Math.floor((availW - 8) / 4); // 4 buttons wide, 8px total gaps
    var btnSize = Math.min(maxBtnFromW, Math.max(44, Math.floor(minDim * 0.1)));
    var btnFont = Math.max(8, Math.floor(btnSize * 0.165));
    cluster.querySelectorAll('.action-btn').forEach(function(btn) {
      btn.style.width = btnSize + 'px';
      btn.style.height = btnSize + 'px';
      btn.style.fontSize = btnFont + 'px';
      btn.style.lineHeight = '1.2';
    });
    var gridGap = 5;
    var clusterW = (btnSize * 2 + gridGap) * 2 + 8; // two grids + gap between grids
    var clusterH = btnSize * 2 + gridGap;
    cluster.style.width = clusterW + 'px';
    cluster.style.height = clusterH + 'px';
    cluster.style.right = '18px';

    // Position controls just below the game canvas on touch-portrait, not fixed to viewport bottom
    if (isTouchPortrait && canvas) {
      var rect = canvas.getBoundingClientRect();
      if (rect.bottom > 0) {
        var topY = Math.round(rect.bottom) + 8;
        cluster.style.top = topY + 'px';
        cluster.style.bottom = 'auto';
        dpad.style.top = topY + 'px';
        dpad.style.bottom = 'auto';
        dpad.style.left = '18px';
        if (pauseBtn) { pauseBtn.style.top = (Math.round(rect.top) + 4) + 'px'; pauseBtn.style.bottom = 'auto'; }
      } else {
        // Canvas not yet painted — fall back to near-bottom positioning
        cluster.style.bottom = '2.5vh'; cluster.style.top = 'auto';
        dpad.style.bottom = '2.5vh'; dpad.style.top = 'auto';
        if (pauseBtn) { pauseBtn.style.bottom = (clusterH + 20) + 'px'; pauseBtn.style.top = 'auto'; }
      }
    } else {
      cluster.style.bottom = landscape ? "1vh" : "2.5vh"; cluster.style.top = 'auto';
      dpad.style.left = landscape ? "2vw" : "2.5vw"; dpad.style.bottom = landscape ? "1vh" : "2.5vh"; dpad.style.top = 'auto';
      if (pauseBtn) { pauseBtn.style.bottom = (clusterH + 20) + 'px'; pauseBtn.style.top = 'auto'; }
    }

    if (startBtn) { startBtn.style.bottom = landscape ? "6%" : "9%"; var fs = Math.min(20, Math.floor(minDim * 0.04)); startBtn.style.fontSize = fs + "px"; startBtn.style.padding = (fs * 0.8) + "px " + (fs * 1.7) + "px"; }
    if (pauseBtn) { var pSize = Math.max(34, Math.floor(minDim * 0.07)); pauseBtn.style.width = pSize + "px"; pauseBtn.style.height = pSize + "px"; pauseBtn.style.lineHeight = pSize + "px"; pauseBtn.style.fontSize = Math.max(16, Math.floor(pSize * 0.52)) + "px"; }
  }
});

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
    var dpadSize = landscape ? Math.min(100, minDim * 0.15) : Math.min(90, minDim * 0.22);
    var dpadBtnSize = Math.floor(dpadSize * 0.38);
    var dpadBtnFont = Math.floor(dpadSize * 0.18);

    // D-pad sizing
    dpad.style.width = dpadSize + "px";
    dpad.style.height = dpadSize + "px";
    dpad.querySelectorAll(".dpad-btn").forEach(function(btn) {
      btn.style.width = dpadBtnSize + "px"; btn.style.height = dpadBtnSize + "px";
      btn.style.fontSize = dpadBtnFont + "px"; btn.style.lineHeight = dpadBtnSize + "px";
    });

    // D-pad arrow positioning — JS owns all positioning; clear transform to avoid conflicts
    var cHalf = Math.round(dpadSize / 2 - dpadBtnSize / 2);
    var edge  = Math.max(3, Math.round(dpadSize * 0.05));
    var up = dpad.querySelector(".dpad-up"), dn = dpad.querySelector(".dpad-down"),
        lt = dpad.querySelector(".dpad-left"), rt = dpad.querySelector(".dpad-right");
    if (up) { up.style.left = cHalf+"px"; up.style.top = edge+"px";  up.style.bottom=""; up.style.right=""; up.style.transform="none"; }
    if (dn) { dn.style.left = cHalf+"px"; dn.style.bottom = edge+"px"; dn.style.top=""; dn.style.right=""; dn.style.transform="none"; }
    if (lt) { lt.style.left = edge+"px"; lt.style.top = cHalf+"px"; lt.style.bottom=""; lt.style.right=""; lt.style.transform="none"; }
    if (rt) { rt.style.right = edge+"px"; rt.style.top = cHalf+"px"; rt.style.bottom=""; rt.style.left=""; rt.style.transform="none"; }

    var isTouchPortrait = !landscape && window.matchMedia && !window.matchMedia('(pointer: fine)').matches;
    var canvas = document.querySelector('#game-container canvas');
    var clusterH;

    if (isTouchPortrait) {
      // ── Portrait touch: 4-button rows via absolute positioning ──────────────
      // D-pad anchored at left:18px in portrait (set below); cluster starts 8px to its right
      var DPAD_LEFT = 18;
      var clLeft  = DPAD_LEFT + Math.round(dpadSize) + 8;
      var clRight = 8;
      var clWidth = window.innerWidth - clLeft - clRight;
      var btnH   = 30;
      var btnGap = 4;
      // 4 buttons per row, 3 internal gaps
      var btnW = Math.floor((clWidth - 3 * btnGap) / 4);
      clusterH = 2 * btnH + btnGap; // two rows stacked

      // Cluster: flex column so the two grids stack vertically
      cluster.style.left          = clLeft + 'px';
      cluster.style.right         = clRight + 'px';
      cluster.style.width         = 'auto';
      cluster.style.height        = clusterH + 'px';
      // Do NOT set display here — visibility is controlled solely by showTouchControls()
      cluster.style.flexDirection = 'column';
      cluster.style.gap           = btnGap + 'px';
      cluster.style.padding       = '0';

      // Each grid: block + relative so buttons can absolute-position within it
      cluster.querySelectorAll('.action-grid').forEach(function(g) {
        g.style.display   = 'block';
        g.style.position  = 'relative';
        g.style.width     = '100%';
        g.style.height    = btnH + 'px';
        g.style.overflow  = 'visible';
      });

      // Buttons: col 0-3 positioned left-to-right inside their own grid row
      cluster.querySelectorAll('.action-btn').forEach(function(btn, i) {
        var col = i % 4;
        btn.style.position     = 'absolute';
        btn.style.top          = '0';
        btn.style.left         = (col * (btnW + btnGap)) + 'px';
        btn.style.width        = btnW + 'px';
        btn.style.height       = btnH + 'px';
        btn.style.display      = 'block';   // block needed for text-overflow ellipsis
        btn.style.borderRadius = '6px';
        btn.style.fontSize     = '8px';
        btn.style.lineHeight   = btnH + 'px';
        btn.style.textAlign    = 'left';    // left-align so ellipsis truncates from right
        btn.style.overflow     = 'hidden';
        btn.style.textOverflow = 'ellipsis';
        btn.style.whiteSpace   = 'nowrap';
        btn.style.padding      = '0 4px';
        btn.style.boxSizing    = 'border-box';
      });

    } else {
      // ── Landscape / desktop: original 2×2 circle sizing ─────────────────────
      var availW = window.innerWidth - 40;
      var maxBtnFromW = Math.floor((availW - 8) / 4);
      var btnSize = Math.min(maxBtnFromW, Math.max(44, Math.floor(minDim * 0.1)));
      var btnFont = Math.max(8, Math.floor(btnSize * 0.165));
      cluster.querySelectorAll('.action-btn').forEach(function(btn) {
        btn.style.position = '';   // clear any absolute from prior portrait run
        btn.style.width = btnSize + 'px'; btn.style.height = btnSize + 'px';
        btn.style.fontSize = btnFont + 'px'; btn.style.lineHeight = '1.2';
      });
      cluster.querySelectorAll('.action-grid').forEach(function(g) {
        g.style.display = ''; g.style.position = ''; g.style.height = '';
      });
      var gridGap = 5;
      var clusterW = (btnSize * 2 + gridGap) * 2 + 8;
      clusterH = btnSize * 2 + gridGap;
      cluster.style.width = clusterW + 'px'; cluster.style.height = clusterH + 'px';
      cluster.style.right = '18px'; cluster.style.left = 'auto';
      // Do NOT set display here — visibility is controlled solely by showTouchControls()
      cluster.style.flexDirection = 'row';
    }

    // ── Vertical positioning (below canvas or near bottom) ────────────────────
    if (isTouchPortrait && canvas) {
      var rect = canvas.getBoundingClientRect();
      if (rect.bottom > 0) {
        var topY = Math.round(rect.bottom) + 8;
        cluster.style.top = topY + 'px'; cluster.style.bottom = 'auto';
        dpad.style.top    = topY + 'px'; dpad.style.bottom    = 'auto';
        dpad.style.left   = DPAD_LEFT + 'px';
        if (pauseBtn) { pauseBtn.style.top = (Math.round(rect.top) + 4) + 'px'; pauseBtn.style.bottom = 'auto'; }
      } else {
        cluster.style.bottom = '2.5vh'; cluster.style.top = 'auto';
        dpad.style.bottom    = '2.5vh'; dpad.style.top    = 'auto';
        dpad.style.left      = DPAD_LEFT + 'px';
        if (pauseBtn) { pauseBtn.style.bottom = (clusterH + 20) + 'px'; pauseBtn.style.top = 'auto'; }
      }
    } else {
      cluster.style.bottom = landscape ? "1vh" : "2.5vh"; cluster.style.top = 'auto';
      dpad.style.left = landscape ? "2vw" : "2.5vw";
      dpad.style.bottom = landscape ? "1vh" : "2.5vh"; dpad.style.top = 'auto';
      if (clusterH !== undefined && pauseBtn) { pauseBtn.style.bottom = (clusterH + 20) + 'px'; pauseBtn.style.top = 'auto'; }
    }

    if (startBtn) {
      startBtn.style.bottom = landscape ? "6%" : "9%";
      var fs = Math.min(20, Math.floor(minDim * 0.04));
      startBtn.style.fontSize = fs + "px"; startBtn.style.padding = (fs * 0.8) + "px " + (fs * 1.7) + "px";
    }
    if (pauseBtn) {
      var pSize = Math.max(34, Math.floor(minDim * 0.07));
      pauseBtn.style.width = pSize + "px"; pauseBtn.style.height = pSize + "px";
      pauseBtn.style.lineHeight = pSize + "px"; pauseBtn.style.fontSize = Math.max(16, Math.floor(pSize * 0.52)) + "px";
    }
  }
});

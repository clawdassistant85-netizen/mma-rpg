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
});

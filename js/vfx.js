window.MMA = window.MMA || {};
window.MMA.VFX = {
  spawnMotionTrail: function(scene, x, y, color) {
    var t = scene.add.circle(x, y, 4, color || 0x4a90e2, 0.28).setDepth(6);
    scene.tweens.add({ targets: t, alpha: 0, scale: 0.3, duration: 220, onComplete: function(){ t.destroy(); } });
  },
  flashEnemyHit: function(scene, enemy, duration) {
    if (!enemy || !enemy.active) return;
    enemy.setTint(0xffffff);
    scene.time.delayedCall(duration || 100, function() { if (enemy && enemy.active) enemy.clearTint(); });
  },
  playAttackEffect: function(scene, moveKey, fromX, fromY, toX, toY) {
    var color = moveKey === 'cross' ? 0xffe066 : 0xffffff;
    var width = moveKey === 'cross' ? 4 : 2;
    var life = moveKey === 'cross' ? 150 : 100;
    var g = scene.add.graphics().setDepth(12);
    g.lineStyle(width, color, 1);
    g.lineBetween(fromX, fromY, toX, toY);
    scene.tweens.add({ targets: g, alpha: 0, duration: life, onComplete: function(){ g.destroy(); } });
  },
  showImpactSpark: function(scene, x, y, heavy) {
    var spark = scene.add.circle(x, y, 4, heavy ? 0xffd54f : 0xffffff, 1).setDepth(13);
    scene.tweens.add({ targets: spark, radius: heavy ? 16 : 12, alpha: 0, duration: heavy ? 180 : 120, onComplete: function(){ spark.destroy(); } });
    if (heavy) scene.cameras.main.shake(100, 0.006);
  }
};

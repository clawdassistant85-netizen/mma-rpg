window.MMA = window.MMA || {};
window.MMA.Items = {
  ensurePickupSystem: function(scene) {
    if (!scene.pickupGroup) scene.pickupGroup = scene.physics.add.group();
    if (!scene._pickupOverlapBound) {
      scene.physics.add.overlap(scene.player, scene.pickupGroup, function(player, item) {
        window.MMA.Items.applyPickup(scene, player, item);
      }, null, scene);
      scene._pickupOverlapBound = true;
    }
  },
  spawnDropsForEnemy: function(scene, enemy) {
    return null;
  },
  applyPickup: function(scene, player, item) {
    if (!item || !item.itemData) return;
    var itemData = item.itemData;
    var stats = player && player.stats ? player.stats : null;
    if (!stats) return;

    if (itemData.stat === 'speed') {
      player.speedBonus = (player.speedBonus || 0) + itemData.value;
      if (itemData.duration > 0) {
        scene.time.delayedCall(itemData.duration, function() {
          if (player.active) player.speedBonus = Math.max(0, (player.speedBonus || 0) - itemData.value);
        });
      }
    } else if (itemData.stat === 'attackDamage') {
      player.attackBonus = (player.attackBonus || 0) + itemData.value;
      if (itemData.duration > 0) {
        scene.time.delayedCall(itemData.duration, function() {
          if (player.active) player.attackBonus = Math.max(0, (player.attackBonus || 0) - itemData.value);
        });
      }
    } else if (itemData.stat === 'defense') {
      player.defenseBonus = (player.defenseBonus || 0) + itemData.value;
      if (itemData.duration > 0) {
        scene.time.delayedCall(itemData.duration, function() {
          if (player.active) player.defenseBonus = Math.max(0, (player.defenseBonus || 0) - itemData.value);
        });
      }
    } else if (itemData.stat === 'hp') {
      stats.maxHp += itemData.value;
      stats.hp = Math.min(stats.maxHp, stats.hp + itemData.value);
    }

    if (window.MMA && MMA.UI) {
      MMA.UI.showDamageText(scene, player.x, player.y - 32, itemData.name.toUpperCase(), '#66ffcc');
      scene.registry.set('gameMessage', itemData.description || itemData.name);
      scene.time.delayedCall(1500, function() { scene.registry.set('gameMessage', ''); });
    }

    item.destroy();
  },
  update: function(scene, time, delta) {
    if (!scene.player || !scene.physics) return;
    this.ensurePickupSystem(scene);
  }
};

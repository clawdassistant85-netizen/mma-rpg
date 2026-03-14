window.MMA = window.MMA || {};
window.MMA.Sprites = window.MMA.Sprites || {};

Object.assign(window.MMA.Sprites, {
  textureFloorStreet: function(scene, key) {
    var g = scene.make.graphics({ x:0, y:0, add:false });
    g.fillStyle(0x9b7a4b, 1); g.fillRect(0, 0, 16, 16);
    g.fillStyle(0xb38d58, 0.45); g.fillRect(1, 1, 14, 14);
    g.lineStyle(1, 0x6f5332, 0.6); g.lineBetween(0, 8, 16, 8); g.lineBetween(8, 0, 8, 16);
    g.lineStyle(1, 0xc8a56a, 0.35); g.lineBetween(0, 4, 16, 4); g.lineBetween(0, 12, 16, 12); g.lineBetween(4, 0, 4, 16); g.lineBetween(12, 0, 12, 16);
    g.fillStyle(0x5e462b, 0.35); g.fillRect(2, 2, 2, 2); g.fillRect(10, 10, 2, 2);
    g.generateTexture(key, 16, 16); g.destroy();
  },
  textureWallStreet: function(scene, key) {
    var g = scene.make.graphics({ x:0, y:0, add:false });
    g.fillStyle(0x3b3b40, 1); g.fillRect(0, 0, 16, 16);
    g.fillStyle(0x4b4b52, 1); g.fillRect(1, 1, 14, 14);
    g.lineStyle(1, 0x2a2a2e, 0.95);
    g.lineBetween(0, 5, 16, 5); g.lineBetween(0, 11, 16, 11); g.lineBetween(5, 0, 5, 5); g.lineBetween(11, 0, 11, 5);
    g.lineBetween(8, 5, 8, 11); g.lineBetween(5, 11, 5, 16); g.lineBetween(11, 11, 11, 16);
    g.fillStyle(0x6a6a73, 0.55); g.fillRect(2, 2, 2, 2); g.fillRect(12, 8, 2, 2);
    g.generateTexture(key, 16, 16); g.destroy();
  },
  textureGymFloor: function(scene, key) {
    var g = scene.make.graphics({ x:0, y:0, add:false });
    g.fillStyle(0x1d3550, 1); g.fillRect(0, 0, 16, 16);
    g.fillStyle(0x224566, 0.6); g.fillRect(0, 0, 16, 8);
    g.lineStyle(1, 0x2f5d8c, 0.8); g.lineBetween(0, 8, 16, 8);
    g.generateTexture(key, 16, 16); g.destroy();
  },
  textureGymWall: function(scene, key) {
    var g = scene.make.graphics({ x:0, y:0, add:false });
    g.fillStyle(0x4a4a4a, 1); g.fillRect(0, 0, 16, 16);
    g.lineStyle(1, 0x8a8a8a, 0.7); for (var i = 2; i < 16; i += 4) g.lineBetween(0, i, 16, i);
    g.generateTexture(key, 16, 16); g.destroy();
  },
  textureCageFloor: function(scene, key) {
    var g = scene.make.graphics({ x:0, y:0, add:false });
    g.fillStyle(0xe8e8e8, 1); g.fillRect(0, 0, 16, 16);
    g.lineStyle(1, 0xd24b4b, 0.7); g.lineBetween(0, 0, 16, 16); g.lineBetween(0, 16, 16, 0);
    g.generateTexture(key, 16, 16); g.destroy();
  },
  textureCageWall: function(scene, key) {
    var g = scene.make.graphics({ x:0, y:0, add:false });
    g.fillStyle(0x222222, 1); g.fillRect(0, 0, 16, 16);
    g.lineStyle(1, 0x777777, 0.5); g.lineBetween(0, 0, 16, 16); g.lineBetween(0, 16, 16, 0);
    g.generateTexture(key, 16, 16); g.destroy();
  },
  textureCrate: function(scene, key) { var g = scene.make.graphics({ x:0, y:0, add:false }); g.fillStyle(0x6b4a2d, 1); g.fillRect(0, 0, 16, 16); g.lineStyle(2, 0x8a6340, 0.9); g.lineBetween(2, 2, 14, 14); g.lineBetween(14, 2, 2, 14); g.generateTexture(key, 16, 16); g.destroy(); },
  textureDebris: function(scene, key) { var g = scene.make.graphics({ x:0, y:0, add:false }); g.fillStyle(0x333333, 0); g.fillRect(0, 0, 16, 16); g.fillStyle(0x555555, 0.8); g.fillCircle(4, 11, 2); g.fillCircle(9, 7, 1); g.fillCircle(12, 12, 2); g.generateTexture(key, 16, 16); g.destroy(); },
  textureLamp: function(scene, key) { var g = scene.make.graphics({ x:0, y:0, add:false }); g.fillStyle(0x2b2b2b, 1); g.fillRect(7, 3, 2, 10); g.fillStyle(0xffdc73, 0.95); g.fillCircle(8, 2, 2); g.generateTexture(key, 16, 16); g.destroy(); },

  ensureEnvTextures: function(scene) {
    this.textureFloorStreet(scene, 'floor'); this.textureWallStreet(scene, 'wall'); this.textureGymFloor(scene, 'gymFloor'); this.textureGymWall(scene, 'gymWalls');
    this.textureCageFloor(scene, 'cageFloor'); this.textureCageWall(scene, 'cageWall'); this.textureCrate(scene, 'crateProp'); this.textureDebris(scene, 'debrisProp'); this.textureLamp(scene, 'lampProp');

    this.DECORATIONS = this.DECORATIONS || {
      zone1: {
        barrel: { texture: 'decoration_barrel', size: { w: 0.95, h: 0.95 } },
        trashCan: { texture: 'decoration_trash', size: { w: 0.95, h: 0.95 } },
        crates: { texture: 'crateProp', size: { w: 1.1, h: 1.1 } },
        streetLamp: { texture: 'lampProp', size: { w: 1.0, h: 1.0 }, kind: 'pulse', alpha: 0.9 },
        graffiti: { texture: 'decoration_graffiti', size: { w: 1.8, h: 0.9 }, alpha: 0.86 }
      },
      zone2: {
        heavyBag: { texture: 'decoration_heavybag', size: { w: 0.95, h: 1.25 }, kind: 'sway' },
        speedBag: { texture: 'decoration_speedbag', size: { w: 0.8, h: 0.9 }, kind: 'sway' },
        weightRack: { texture: 'decoration_weights', size: { w: 1.2, h: 1.0 } },
        mirror: { texture: 'decoration_mirror', size: { w: 1.0, h: 1.25 }, alpha: 0.9 },
        boxingRing: { texture: 'decoration_boxingring', size: { w: 2.7, h: 1.7 }, alpha: 0.88 }
      },
      zone3: {
        octagon: { texture: 'decoration_octagon', size: { w: 2.7, h: 2.2 }, alpha: 0.92 },
        cornerPost: { texture: 'decoration_corner', size: { w: 0.8, h: 1.0 } },
        entranceTunnel: { texture: 'decoration_tunnel', size: { w: 2.6, h: 1.6 }, alpha: 0.9 },
        crowdSilhouette: { texture: 'decoration_crowd', size: { w: 2.5, h: 1.2 }, kind: 'pulse', alpha: 0.72 }
      }
    };
  },

  clearZoneDecorations: function(scene) {
    if (!scene || !scene.roomDecorations) return;
    while (scene.roomDecorations.length) {
      var decor = scene.roomDecorations.pop();
      if (decor && decor.destroy) decor.destroy();
    }
  },

  placeZoneDecorations: function(scene, zone, roomIdOrRoom) {
    if (!scene || !scene.add) return [];
    var room = typeof roomIdOrRoom === 'string' && window.MMA && MMA.Zones ? MMA.Zones.getRoom(roomIdOrRoom) : roomIdOrRoom;
    var decorList = this.DECORATIONS['zone' + zone];
    var placements = room && room.decorationPositions ? room.decorationPositions : [];
    var created = [];

    this.clearZoneDecorations(scene);
    scene.roomDecorations = scene.roomDecorations || [];

    for (var i = 0; i < placements.length; i++) {
      var pos = placements[i];
      var decor = decorList && decorList[pos.type];
      if (!decor) continue;
      var x = pos.x || (pos.col * 48 + 24);
      var y = pos.y || (pos.row * 48 + 24);
      var displayW = Math.round(((pos.w || decor.size.w) || 1) * 48);
      var displayH = Math.round(((pos.h || decor.size.h) || 1) * 48);
      var sprite = scene.add.image(x, y, decor.texture);
      sprite.setDisplaySize(displayW, displayH);
      sprite.setDepth(typeof pos.depth === 'number' ? pos.depth : (y + Math.round(displayH * 0.25)));
      sprite.setAlpha(typeof pos.alpha === 'number' ? pos.alpha : (typeof decor.alpha === 'number' ? decor.alpha : 0.95));
      if (pos.flipX && sprite.setFlipX) sprite.setFlipX(true);
      if (pos.flipY && sprite.setFlipY) sprite.setFlipY(true);
      scene.roomDecorations.push(sprite);
      created.push(sprite);
    }

    return created;
  }
});

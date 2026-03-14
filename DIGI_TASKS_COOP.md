# MMA RPG — LAN Co-op Implementation Brief

## Overview

Add 2-player LAN co-op to the existing beat-em-up. Player 1 hosts on their machine, Player 2 connects via browser on the same WiFi. Host is authoritative for enemy AI and room transitions. Both players control their own character over WebSocket.

**Working directory:** `/Users/tobyglennpeters/.openclaw/workspace/mma-rpg`

---

## Architecture

```
Host machine:
  python3 -m http.server 8088     ← game client (existing)
  node server/ws-server.js 8089   ← new WebSocket relay server

Both players open: http://192.168.1.249:8088
P1 clicks HOST → waits for P2
P2 clicks JOIN → enters host IP → connects
```

**Message flow:**
- Both players send their own position/state at 20hz
- Host additionally sends enemy states at 20hz
- Event messages (hits, room changes, game over) sent on occurrence

---

## Files to Create

### 1. `server/ws-server.js` — WebSocket relay server

```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8089 });

var rooms = {}; // roomCode -> { host: ws, client: ws }

function makeCode() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

wss.on('connection', function(ws) {
  ws.on('message', function(raw) {
    var msg;
    try { msg = JSON.parse(raw); } catch(e) { return; }

    if (msg.type === 'host') {
      var code = makeCode();
      rooms[code] = { host: ws, client: null };
      ws._roomCode = code;
      ws._role = 'host';
      ws.send(JSON.stringify({ type: 'hosted', code: code }));
    }

    else if (msg.type === 'join') {
      var room = rooms[msg.code];
      if (!room || room.client) {
        ws.send(JSON.stringify({ type: 'error', reason: 'Room not found or full' }));
        return;
      }
      room.client = ws;
      ws._roomCode = msg.code;
      ws._role = 'client';
      ws.send(JSON.stringify({ type: 'joined', code: msg.code }));
      room.host.send(JSON.stringify({ type: 'peer_joined' }));
    }

    else {
      // Relay all other messages to the peer
      var r = rooms[ws._roomCode];
      if (!r) return;
      var peer = ws._role === 'host' ? r.client : r.host;
      if (peer && peer.readyState === WebSocket.OPEN) {
        peer.send(raw); // forward as-is
      }
    }
  });

  ws.on('close', function() {
    var r = rooms[ws._roomCode];
    if (!r) return;
    var peer = ws._role === 'host' ? r.client : r.host;
    if (peer && peer.readyState === WebSocket.OPEN) {
      peer.send(JSON.stringify({ type: 'peer_disconnected' }));
    }
    delete rooms[ws._roomCode];
  });
});

console.log('MMA RPG co-op server running on ws://localhost:8089');
```

Run with: `node server/ws-server.js`  
Requires: `npm init -y && npm install ws` inside the `server/` directory (or project root).

---

### 2. `js/network.js` — Client networking module

```javascript
window.MMA = window.MMA || {};
window.MMA.Network = {
  ws: null,
  role: null,         // 'host' | 'client'
  roomCode: null,
  connected: false,
  ready: false,       // true when both players connected
  _handlers: {},

  isHost: function() { return this.role === 'host'; },
  isClient: function() { return this.role === 'client'; },
  isMultiplayer: function() { return this.connected && this.ready; },

  connect: function(url, onOpen) {
    var self = this;
    this.ws = new WebSocket(url);
    this.ws.onopen = function() { if (onOpen) onOpen(); };
    this.ws.onmessage = function(evt) {
      var msg;
      try { msg = JSON.parse(evt.data); } catch(e) { return; }
      var handlers = self._handlers[msg.type];
      if (handlers) handlers.forEach(function(fn) { fn(msg); });
    };
    this.ws.onclose = function() {
      self.connected = false;
      self.ready = false;
      var h = self._handlers['peer_disconnected'];
      if (h) h.forEach(function(fn) { fn({}); });
    };
  },

  on: function(type, fn) {
    if (!this._handlers[type]) this._handlers[type] = [];
    this._handlers[type].push(fn);
  },

  send: function(type, data) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    var msg = Object.assign({ type: type }, data || {});
    this.ws.send(JSON.stringify(msg));
  },

  host: function(serverUrl, onHosted) {
    var self = this;
    this.connect(serverUrl, function() {
      self.role = 'host';
      self.connected = true;
      self.send('host');
    });
    this.on('hosted', function(msg) {
      self.roomCode = msg.code;
      if (onHosted) onHosted(msg.code);
    });
    this.on('peer_joined', function() {
      self.ready = true;
    });
  },

  join: function(serverUrl, code, onJoined, onError) {
    var self = this;
    this.connect(serverUrl, function() {
      self.role = 'client';
      self.connected = true;
      self.send('join', { code: code });
    });
    this.on('joined', function(msg) {
      self.roomCode = msg.code;
      self.ready = true;
      if (onJoined) onJoined();
    });
    this.on('error', function(msg) {
      if (onError) onError(msg.reason);
    });
  },

  disconnect: function() {
    if (this.ws) this.ws.close();
    this.ws = null;
    this.role = null;
    this.connected = false;
    this.ready = false;
    this._handlers = {};
  },

  // Convenience: send own player state (called at 20hz from GameScene)
  sendPlayerState: function(player) {
    if (!this.isMultiplayer()) return;
    this.send('player_state', {
      x: Math.round(player.x),
      y: Math.round(player.y),
      hp: player.stats.hp,
      maxHp: player.stats.maxHp,
      flipX: player.flipX,
      isAttacking: player.isAttacking || false,
      facing: player.facing || 'right'
    });
  },

  // Host-only: send all enemy states (called at 20hz from GameScene)
  sendEnemyStates: function(enemies) {
    if (!this.isHost() || !this.isMultiplayer()) return;
    var states = enemies
      .filter(function(e) { return e && e.active; })
      .map(function(e) {
        return {
          id: e._netId,
          x: Math.round(e.x),
          y: Math.round(e.y),
          hp: e.hp,
          state: e.state,
          flipX: e.flipX
        };
      });
    this.send('enemy_states', { enemies: states });
  }
};
```

---

### 3. `js/scenes/LobbyScene.js` — Host/Join UI

```javascript
var LobbyScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function LobbyScene() {
    Phaser.Scene.call(this, { key: 'LobbyScene' });
  },

  create: function() {
    var self = this;
    var cx = this.cameras.main.width / 2;
    var cy = this.cameras.main.height / 2;
    var SERVER_URL = 'ws://' + window.location.hostname + ':8089';

    this.add.text(cx, 80, 'MMA RPG — CO-OP', {
      fontSize: '36px', color: '#ffd700', fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.statusText = this.add.text(cx, cy + 80, '', {
      fontSize: '18px', color: '#aaaaaa', fontFamily: 'Arial', align: 'center'
    }).setOrigin(0.5);

    // HOST button
    var hostBtn = this.add.text(cx - 120, cy, '[ HOST ]', {
      fontSize: '28px', color: '#66ff66', fontFamily: 'Arial'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    hostBtn.on('pointerover', function() { hostBtn.setColor('#aaffaa'); });
    hostBtn.on('pointerout', function() { hostBtn.setColor('#66ff66'); });
    hostBtn.on('pointerdown', function() {
      hostBtn.setAlpha(0.4);
      joinBtn.setAlpha(0.4);
      MMA.Network.host(SERVER_URL, function(code) {
        self.statusText.setText('Room code: ' + code + '\nWaiting for player 2...');
      });
      MMA.Network.on('peer_joined', function() {
        self.statusText.setText('Player 2 connected! Starting...');
        self.time.delayedCall(800, function() {
          self.scene.start('BootScene');
        });
      });
    });

    // JOIN button
    var joinBtn = this.add.text(cx + 120, cy, '[ JOIN ]', {
      fontSize: '28px', color: '#6699ff', fontFamily: 'Arial'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    joinBtn.on('pointerover', function() { joinBtn.setColor('#99bbff'); });
    joinBtn.on('pointerout', function() { joinBtn.setColor('#6699ff'); });
    joinBtn.on('pointerdown', function() {
      var code = prompt('Enter room code:');
      if (!code) return;
      code = code.trim().toUpperCase();
      self.statusText.setText('Connecting...');
      MMA.Network.join(SERVER_URL, code, function() {
        self.statusText.setText('Connected! Starting...');
        self.time.delayedCall(800, function() {
          self.scene.start('BootScene');
        });
      }, function(reason) {
        self.statusText.setText('Error: ' + reason);
      });
    });

    // Solo play button (skip multiplayer)
    var soloBtn = this.add.text(cx, cy + 140, '[ SOLO PLAY ]', {
      fontSize: '18px', color: '#888888', fontFamily: 'Arial'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    soloBtn.on('pointerover', function() { soloBtn.setColor('#aaaaaa'); });
    soloBtn.on('pointerout', function() { soloBtn.setColor('#888888'); });
    soloBtn.on('pointerdown', function() {
      self.scene.start('BootScene');
    });
  }
});
```

---

## Files to Modify

### 4. `js/player.js` — Add P2 creation + assign network IDs to enemies

After `MMA.Player.create`, add a new function `MMA.Player.createP2`:

```javascript
MMA.Player.createP2 = function(scene) {
  var DT = CONFIG.DISPLAY_TILE;
  scene.player2 = scene.physics.add.sprite(10 * DT, 6 * DT, 'player');
  scene.player2.setDisplaySize(DT, DT * 1.5);
  scene.player2.body.setSize(26, 38);
  scene.player2.body.setOffset(11, 18);
  scene.player2.body.setCollideWorldBounds(true);
  scene.player2.setTint(0x88aaff); // Blue tint distinguishes P2
  scene.player2.stats = { hp: 200, maxHp: 200 };
  scene.player2.isNetworkPlayer = true;
};
```

Also in `MMA.Player.create` or in `MMA.Enemies.spawnForRoom`, assign a `_netId` to each enemy after spawning:
```javascript
// In spawnForRoom, after pushing to scene.enemies:
enemy._netId = 'e_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5);
```

---

### 5. `js/scenes/GameScene.js` — Multiplayer hooks

**In `create()`**, after `MMA.Player.create(this)` (around line 44), add:

```javascript
// Multiplayer: spawn P2 sprite and wire network handlers
if (MMA.Network.isMultiplayer()) {
  MMA.Player.createP2(this);
  this._setupNetworkHandlers();
}
```

**Add new method `_setupNetworkHandlers`** to GameScene (after the existing methods):

```javascript
_setupNetworkHandlers: function() {
  var self = this;

  // Receive peer's player position
  MMA.Network.on('player_state', function(msg) {
    var p2 = self.player2;
    if (!p2 || !p2.active) return;
    p2.setPosition(msg.x, msg.y);
    p2.setFlipX(msg.flipX);
    if (p2.stats) { p2.stats.hp = msg.hp; p2.stats.maxHp = msg.maxHp; }
  });

  // Client receives enemy states from host
  MMA.Network.on('enemy_states', function(msg) {
    if (MMA.Network.isHost()) return; // Host doesn't apply its own broadcast
    var stateMap = {};
    msg.enemies.forEach(function(s) { stateMap[s.id] = s; });
    self.enemies.forEach(function(e) {
      var s = stateMap[e._netId];
      if (!s || !e.active) return;
      e.setPosition(s.x, s.y);
      e.setFlipX(s.flipX);
      e.hp = s.hp;
    });
  });

  // Room change: client follows host
  MMA.Network.on('room_change', function(msg) {
    if (MMA.Network.isHost()) return;
    MMA.Zones.transitionToRoom(self, msg.roomId, msg.fromDirection);
  });

  // Peer disconnected
  MMA.Network.on('peer_disconnected', function() {
    self.registry.set('gameMessage', 'CO-OP: Player 2 disconnected');
    if (self.player2) { self.player2.destroy(); self.player2 = null; }
  });
},
```

**In `update(delta)`**, add a 20hz sync tick. Add this near the top of the update method, after the gameOver check:

```javascript
// Network sync (20hz)
if (MMA.Network.isMultiplayer()) {
  this._netTick = (this._netTick || 0) + delta;
  if (this._netTick >= 50) {
    this._netTick = 0;
    MMA.Network.sendPlayerState(this.player);
    if (MMA.Network.isHost()) MMA.Network.sendEnemyStates(this.enemies);
  }
}
```

**Enemy AI gating** — client should not run enemy AI (host is authoritative). Find the enemy update loop in GameScene (search for `enemies.forEach` in update) and wrap it:

```javascript
// Only host runs enemy AI in multiplayer
if (!MMA.Network.isMultiplayer() || MMA.Network.isHost()) {
  // ... existing enemy update/AI code ...
}
```

---

### 6. `js/zones.js` — Gate room transitions in co-op

In `handleDoorEnter` (line ~1201), add co-op gating:

```javascript
handleDoorEnter: function(scene, player, door) {
  if (scene.roomTransitioning || scene.gameOver) return;
  var direction = door.getData('direction'); if (!direction) return;
  var newRoomId = this.getConnectedRoom(scene.currentRoomId, direction);
  if (!newRoomId) return;

  // Co-op: host signals room change; client waits for room_change message
  if (MMA.Network.isMultiplayer()) {
    if (MMA.Network.isClient()) return; // Client can't trigger transitions
    MMA.Network.send('room_change', { roomId: newRoomId, fromDirection: direction });
  }

  this.transitionToRoom(scene, newRoomId, direction);
},
```

---

### 7. `index.html` — Add new script tags

After `VictoryScene.js` and `DefeatScene.js`, add:

```html
  <script src="js/network.js?v=37"></script>
  <script src="js/scenes/LobbyScene.js?v=37"></script>
```

---

### 8. `js/main.js` — Register LobbyScene, set as entry point

Line 24, put `LobbyScene` **first** in the scenes array (Phaser auto-starts the first scene):
```javascript
scene: [LobbyScene, TitleScene, BootScene, GameScene, HUDScene, PauseScene, UnlockScene, VictoryScene, OutfitScene, DefeatScene],
```

That's all — no other changes needed in main.js. Phaser will auto-start LobbyScene on load.

**Note:** In `LobbyScene.js`, the solo play button should go to `TitleScene` (not BootScene) to preserve the normal title screen flow:
```javascript
soloBtn.on('pointerdown', function () {
  self.scene.start('TitleScene'); // ← TitleScene, not BootScene
});
```
Host/join buttons correctly go to `BootScene` (skip title, drop straight into game).

---

## V1 Scope Rules

- **Co-op only** — no PvP
- **Ground game is per-player** — P2 can't interfere with P1's grapple and vice versa
- **Enemies target nearest player** — use distance check in `MMA.Enemies.AI` when choosing target
- **Room transitions** — host-driven only; client follows via `room_change` message
- **Save/load** — host saves, client does not write to localStorage
- **Game over** — if P1 (host) dies, game ends for both; P2 dying shows a downed state but game continues

---

## Verification

1. `node --check` on every modified JS file
2. Start the ws server: `node server/ws-server.js`
3. Open two browser tabs to `http://localhost:8088`
4. Tab 1: HOST → note the room code
5. Tab 2: JOIN → enter code → both should see each other's character
6. Confirm: movement syncs, room transitions work, enemies move on both screens

**Do not run git commands. ARIA handles commits and pushes.**

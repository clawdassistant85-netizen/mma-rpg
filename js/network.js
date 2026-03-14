window.MMA = window.MMA || {};
window.MMA.Network = {
  ws: null,
  role: null,
  roomCode: null,
  connected: false,
  ready: false,
  _handlers: {},

  isHost: function() { return this.role === 'host'; },
  isClient: function() { return this.role === 'client'; },
  isMultiplayer: function() { return this.connected && this.ready; },

  connect: function(url, onOpen) {
    var self = this;

    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
    }

    this.ws = null;
    this.roomCode = null;
    this.connected = false;
    this.ready = false;
    this._handlers = {};

    this.ws = new WebSocket(url);
    this.ws.onopen = function() {
      if (onOpen) onOpen();
    };
    this.ws.onmessage = function(evt) {
      var msg;
      try { msg = JSON.parse(evt.data); } catch (e) { return; }
      if (msg.type === 'peer_disconnected') self.ready = false;
      if (msg.type === 'peer_joined') self.ready = true;
      var handlers = self._handlers[msg.type];
      if (handlers) handlers.forEach(function(fn) { fn(msg); });
    };
    this.ws.onclose = function() {
      self.connected = false;
      self.ready = false;
      self.roomCode = null;
      var handlers = self._handlers.peer_disconnected;
      if (handlers) handlers.forEach(function(fn) { fn({}); });
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
      self.disconnect();
    });
  },

  disconnect: function() {
    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
    }
    this.ws = null;
    this.role = null;
    this.roomCode = null;
    this.connected = false;
    this.ready = false;
    this._handlers = {};
  },

  sendPlayerState: function(player) {
    if (!player || !player.stats || !this.isMultiplayer()) return;
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

  sendEnemyStates: function(enemies) {
    if (!this.isHost() || !this.isMultiplayer()) return;
    var states = enemies
      .filter(function(e) { return e && e.active; })
      .map(function(e) {
        return {
          id: e._netId,
          typeKey: e.typeKey || (e.type && e.type.typeKey) || (e.type && e.type.id) || 'streetThug',
          isElite: !!e.isElite || !!(e.type && e.type.isElite),
          isBoss: !!e.isBoss,
          x: Math.round(e.x),
          y: Math.round(e.y),
          hp: e.stats && typeof e.stats.hp === 'number' ? e.stats.hp : e.hp,
          state: e.state,
          flipX: e.flipX
        };
      });
    this.send('enemy_states', { enemies: states });
  }
};

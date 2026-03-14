const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8089 });

var rooms = {}; // roomCode -> { host: ws, client: ws }

function makeCode() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

wss.on('connection', function(ws) {
  ws.on('message', function(raw) {
    var msg;
    try { msg = JSON.parse(raw); } catch (e) { return; }

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
      var r = rooms[ws._roomCode];
      if (!r) return;
      var peer = ws._role === 'host' ? r.client : r.host;
      if (peer && peer.readyState === WebSocket.OPEN) {
        peer.send(raw);
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

// Zone 1 Room Definitions
// 4 rooms connected by doorways

var ZONE1_ROOMS = {
  // Room 1 - Starting room (center)
  'room1': {
    id: 'room1',
    zone: 1,
    // Door positions: left, right, up (3 doors)
    doors: {
      left: { col: 0, row: 5 },
      right: { col: 15, row: 5 },
      up: { col: 7, row: 0 }
    },
    // Connections to other rooms
    connections: {
      left: 'room2',
      right: 'room3',
      up: 'room4'
    },
    // Spawn points for enemies in this room
    spawnPositions: [
      { col: 3, row: 3 },
      { col: 12, row: 3 },
      { col: 12, row: 9 }
    ],
    // Enemy types that can spawn here
    enemyPool: ['streetThug', 'streetThug', 'barBrawler'],
    // Room description
    name: 'Alley Entrance'
  },
  
  // Room 2 - Left room
  'room2': {
    id: 'room2',
    zone: 1,
    doors: {
      right: { col: 15, row: 5 }
    },
    connections: {
      right: 'room1'
    },
    spawnPositions: [
      { col: 3, row: 3 },
      { col: 3, row: 9 }
    ],
    enemyPool: ['streetThug', 'barBrawler'],
    name: 'Side Alley'
  },
  
  // Room 3 - Right room
  'room3': {
    id: 'room3',
    zone: 1,
    doors: {
      left: { col: 0, row: 5 }
    },
    connections: {
      left: 'room1'
    },
    spawnPositions: [
      { col: 3, row: 5 },
      { col: 12, row: 3 },
      { col: 12, row: 9 }
    ],
    enemyPool: ['barBrawler', 'barBrawler', 'muayThaiFighter'],
    name: 'Back Lot'
  },
  
  // Room 4 - Upper room (connects to Zone 2 gym)
  'room4': {
    id: 'room4',
    zone: 1,
    doors: {
      down: { col: 7, row: 11 },
      up: { col: 7, row: 0 }
    },
    connections: {
      down: 'room1',
      up: 'gym1'
    },
    spawnPositions: [
      { col: 3, row: 8 },
      { col: 12, row: 8 }
    ],
    enemyPool: ['barBrawler', 'muayThaiFighter', 'muayThaiFighter'],
    name: 'Storage Area'
  }
};

// Zone 2 Room Definitions – wrestling gym layout (more open space)
var ZONE2_ROOMS = {
  'gym1': {
    id: 'gym1',
    zone: 2,
    doors: {
      left:  { col: 0, row: 5 },
      right: { col: 15, row: 5 },
      down:  { col: 7, row: 11 }
    },
    connections: {
      left:  'gym2',
      right: 'gym3',
      down:  'room4'
    },
    spawnPositions: [
      { col: 4, row: 4 },
      { col: 11, row: 4 },
      { col: 7, row: 8 }
    ],
    enemyPool: ['wrestler', 'judoka', 'groundNPounder'],
    name: 'Gym Entrance'
  },
  'gym2': {
    id: 'gym2',
    zone: 2,
    doors: {
      right: { col: 15, row: 5 }
    },
    connections: {
      right: 'gym1'
    },
    spawnPositions: [
      { col: 4, row: 4 },
      { col: 4, row: 8 }
    ],
    enemyPool: ['wrestler', 'judoka'],
    name: 'Weight Area'
  },
  'gym3': {
    id: 'gym3',
    zone: 2,
    doors: {
      left: { col: 0, row: 5 },
      up:   { col: 7, row: 0 }
    },
    connections: {
      left: 'gym1',
      up:   'gym4'
    },
    spawnPositions: [
      { col: 11, row: 4 },
      { col: 11, row: 8 }
    ],
    enemyPool: ['judoka', 'groundNPounder'],
    name: 'Mats Hall'
  },
  'gym4': {
    id: 'gym4',
    zone: 2,
    doors: {
      down: { col: 7, row: 11 }
    },
    connections: {
      down: 'gym3'
    },
    spawnPositions: [
      { col: 7, row: 4 },
      { col: 7, row: 8 }
    ],
    enemyPool: ['wrestler', 'groundNPounder', 'groundNPounder'],
    name: 'Training Ring'
  }
};

// Zone 3 - The Octagon
var ZONE3_ROOMS = {
  'oct1': {
    id: 'oct1',
    zone: 3,
    doors: {
      right: { col: 15, row: 5 },
      up: { col: 7, row: 0 }
    },
    connections: {
      right: 'oct2',
      up: 'oct3'
    },
    spawnPositions: [
      { col: 3, row: 4 },
      { col: 12, row: 4 }
    ],
    enemyPool: ['bjjBlackBelt'],
    name: 'Arena Entrance'
  },
  'oct2': {
    id: 'oct2',
    zone: 3,
    doors: {
      left: { col: 0, row: 5 }
    },
    connections: {
      left: 'oct1'
    },
    spawnPositions: [
      { col: 3, row: 3 },
      { col: 3, row: 8 }
    ],
    enemyPool: ['bjjBlackBelt', 'bjjBlackBelt'],
    name: 'Prelim Cage'
  },
  'oct3': {
    id: 'oct3',
    zone: 3,
    doors: {
      down: { col: 7, row: 11 },
      up: { col: 7, row: 0 }
    },
    connections: {
      down: 'oct1',
      up: 'oct4'
    },
    spawnPositions: [
      { col: 5, row: 5 },
      { col: 9, row: 5 }
    ],
    enemyPool: ['bjjBlackBelt'],
    name: 'Main Cage'
  },
  'oct4': {
    id: 'oct4',
    zone: 3,
    doors: {
      down: { col: 7, row: 11 }
    },
    connections: {
      down: 'oct3'
    },
    spawnPositions: [
      { col: 7, row: 6 }
    ],
    enemyPool: ['mmaChamp'],
    name: 'Championship Ring'
  }
};

// Get room by ID (supports all zones)
function getRoom(roomId) {
  return ZONE1_ROOMS[roomId] || ZONE2_ROOMS[roomId] || ZONE3_ROOMS[roomId];
}

// Get connection from current room in a direction
function getConnectedRoom(roomId, direction) {
  var room = ZONE1_ROOMS[roomId] || ZONE2_ROOMS[roomId] || ZONE3_ROOMS[roomId];
  if (room && room.connections && room.connections[direction]) {
    return room.connections[direction];
  }
  return null;
}

// Get spawn positions for enemies in a room
function getRoomSpawnPositions(roomId) {
  var room = ZONE1_ROOMS[roomId] || ZONE2_ROOMS[roomId] || ZONE3_ROOMS[roomId];
  return room ? room.spawnPositions : [];
}

// Get enemy pool for room
function getRoomEnemyPool(roomId) {
  var room = ZONE1_ROOMS[roomId] || ZONE2_ROOMS[roomId] || ZONE3_ROOMS[roomId];
  return room ? room.enemyPool : ['streetThug'];
}

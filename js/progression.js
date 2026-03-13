// Progression System - XP, Leveling, Move Unlocks

// XP required for each level
function getXpForLevel(level) {
  return level * 100;
}

// Check if player should level up
function checkLevelUp(playerStats) {
  var xpNeeded = getXpForLevel(playerStats.level + 1);
  if (playerStats.xp >= xpNeeded) {
    playerStats.level++;
    playerStats.xp -= xpNeeded;
    playerStats.maxHp += 10;
    playerStats.hp = playerStats.maxHp;
    playerStats.maxStamina += 5;
    playerStats.stamina = playerStats.maxStamina;
    return true; // leveled up
  }
  return false;
}

// Full move roster with unlock requirements
var MOVE_ROSTER = {
  // Starting moves
  jab:        { name:'Jab',         type:'strike',  damage:8,  staminaCost:5,  cooldown:400,  unlockLevel:1,  unlockType:'start' },
  cross:      { name:'Cross',       type:'strike',  damage:12, staminaCost:8,  cooldown:600,  unlockLevel:1,  unlockType:'start' },
  
  // Level 2
  hook:       { name:'Hook',        type:'strike',  damage:15, staminaCost:10, cooldown:800,  unlockLevel:2,  unlockType:'level' },
  lowKick:    { name:'Low Kick',    type:'strike',  damage:10, staminaCost:7,  cooldown:600,  unlockLevel:2,  unlockType:'level' },
  
  // Level 3
  uppercut:   { name:'Uppercut',    type:'strike',  damage:18, staminaCost:12, cooldown:900,  unlockLevel:3,  unlockType:'level' },
  takedown:   { name:'Takedown',    type:'grapple', damage:5,  staminaCost:20, cooldown:1200, unlockLevel:3,  unlockType:'level' },
  
  // Level 4
  bodyShot:   { name:'Body Shot',   type:'strike',  damage:20, staminaCost:14, cooldown:850,  unlockLevel:4,  unlockType:'level' },
  guardPass:  { name:'Guard Pass',   type:'grapple', damage:10, staminaCost:12, cooldown:1000, unlockLevel:4,  unlockType:'level' },
  
  // Level 5
  headKick:   { name:'Head Kick',   type:'strike',  damage:25, staminaCost:18, cooldown:1000, unlockLevel:5,  unlockType:'level' },
  guillotine: { name:'Guillotine',  type:'sub',     damage:25, staminaCost:18, cooldown:1500, unlockLevel:5,  unlockType:'level' },
  mountCtrl:  { name:'Mount Control',type:'grapple', damage:0,  staminaCost:8,  cooldown:800,  unlockLevel:5,  unlockType:'level' },
  
  // Level 6
  rnc:        { name:'RNC',          type:'sub',     damage:35, staminaCost:25, cooldown:2000, unlockLevel:6,  unlockType:'level' },
  kimura:     { name:'Kimura',       type:'sub',     damage:27, staminaCost:20, cooldown:1800, unlockLevel:6,  unlockType:'level' },
  
  // Level 7
  spinningBackFist: { name:'Spinning Back Fist', type:'strike', damage:30, staminaCost:20, cooldown:1200, unlockLevel:7, unlockType:'level' },
  
  // Special/rare moves (from specific enemies)
  elbowStrike:   { name:'Elbow Strike',   type:'strike', damage:22, staminaCost:15, cooldown:900,  unlockLevel:99, unlockType:'enemy', fromEnemy:'muayThaiFighter' },
  kneeStrike:    { name:'Knee Strike',    type:'strike', damage:20, staminaCost:14, cooldown:850,  unlockLevel:99, unlockType:'enemy', fromEnemy:'muayThaiFighter' },
  singleLeg:     { name:'Single Leg',     type:'grapple', damage:5,  staminaCost:15, cooldown:1100, unlockLevel:99, unlockType:'enemy', fromEnemy:'wrestler' },
  hipThrow:      { name:'Hip Throw',      type:'grapple', damage:18, staminaCost:18, cooldown:1000, unlockLevel:99, unlockType:'enemy', fromEnemy:'judoka' },
  armbar:        { name:'Armbar',         type:'sub',     damage:30, staminaCost:22, cooldown:1800, unlockLevel:99, unlockType:'enemy', fromEnemy:'bjjBlackBelt' },
  triangleChoke: { name:'Triangle Choke', type:'sub',     damage:28, staminaCost:20, cooldown:1700, unlockLevel:99, unlockType:'enemy', fromEnemy:'bjjBlackBelt' }
};

// Get all moves available to player at current level
function getUnlockedMoves(playerLevel, playerUnlocks) {
  var unlocked = {};
  Object.keys(MOVE_ROSTER).forEach(function(key) {
    var move = MOVE_ROSTER[key];
    if (move.unlockLevel <= playerLevel && move.unlockType === 'level') {
      unlocked[key] = move;
    }
    if (playerUnlocks && playerUnlocks[key]) {
      unlocked[key] = move;
    }
  });
  return unlocked;
}

// Check if a new move was unlocked (from enemy defeat)
function checkMoveUnlock(enemyType, playerLevel, playerUnlocks) {
  var enemyKey = enemyType.typeKey || enemyType;
  var enemyDef = ENEMY_TYPES[enemyKey];
  if (!enemyDef || !enemyDef.teachesMove) return null;
  
  var moveKey = enemyDef.teachesMove;
  if (playerUnlocks && playerUnlocks[moveKey]) return null; // already have it
  
  return moveKey;
}

// Apply level up stats
function applyLevelUpStats(playerStats) {
  playerStats.level++;
  playerStats.maxHp += 10;
  playerStats.hp = playerStats.maxHp;
  playerStats.maxStamina += 5;
  playerStats.stamina = playerStats.maxStamina;
}

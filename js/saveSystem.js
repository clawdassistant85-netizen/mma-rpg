// Simple localStorage-based save system for MMA RPG
// Uses a single key and stores core player + progression state.

const SAVE_KEY = 'mma-rpg-save';

function saveGame(playerStats, playerUnlockedMoves, currentZone, currentRoomId) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    // Basic validation / cloning to avoid storing Phaser objects
    var stats = playerStats || {};
    var payload = {
      playerStats: {
        hp: stats.hp || 0,
        maxHp: stats.maxHp || 0,
        stamina: stats.stamina || 0,
        maxStamina: stats.maxStamina || 0,
        xp: stats.xp || 0,
        level: stats.level || 1
      },
      playerUnlockedMoves: Array.isArray(playerUnlockedMoves) ? playerUnlockedMoves.slice() : [],
      currentZone: typeof currentZone === 'number' ? currentZone : 1,
      currentRoomId: currentRoomId || 'room1'
    };
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  } catch (e) {
    // Fail silently — saving should never break gameplay
  }
}

function loadGame() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    var raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    var data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return null;
    // Minimal shape validation
    if (!data.playerStats || typeof data.playerStats !== 'object') return null;
    if (!data.currentRoomId) return null;
    return {
      playerStats: {
        hp: data.playerStats.hp || 0,
        maxHp: data.playerStats.maxHp || 0,
        stamina: data.playerStats.stamina || 0,
        maxStamina: data.playerStats.maxStamina || 0,
        xp: data.playerStats.xp || 0,
        level: data.playerStats.level || 1
      },
      playerUnlockedMoves: Array.isArray(data.playerUnlockedMoves) ? data.playerUnlockedMoves.slice() : [],
      currentZone: typeof data.currentZone === 'number' ? data.currentZone : 1,
      currentRoomId: data.currentRoomId || 'room1'
    };
  } catch (e) {
    return null;
  }
}

function hasSaveGame() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    var raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    // Quick parse check
    JSON.parse(raw);
    return true;
  } catch (e) {
    return false;
  }
}

function clearSaveGame() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.removeItem(SAVE_KEY);
  } catch (e) {
    // ignore
  }
}

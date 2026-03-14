// Simple localStorage-based save system for MMA RPG
// Uses a single key and stores core player + progression state.

const SAVE_KEY = 'mma-rpg-save';

function saveGame(playerStats, playerUnlockedMoves, currentZone, currentRoomId, moveLoadout, unlockedSubmissions) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    // Basic validation / cloning to avoid storing Phaser objects
    var stats = playerStats || {};
    var outfitData = (window.MMA && window.MMA.Outfits) ? window.MMA.Outfits.saveOutfitData() : null;
    var payload = {
      playerStats: {
        hp: stats.hp || 0,
        maxHp: stats.maxHp || 0,
        stamina: stats.stamina || 0,
        maxStamina: stats.maxStamina || 0,
        xp: stats.xp || 0,
        level: stats.level || 1,
        // Style XP (new system)
        strikingXP: stats.strikingXP || 0,
        grapplingXP: stats.grapplingXP || 0,
        submissionXP: stats.submissionXP || 0,
        strikingLevel: stats.strikingLevel || 1,
        grapplingLevel: stats.grapplingLevel || 1,
        submissionLevel: stats.submissionLevel || 1
      },
      playerUnlockedMoves: Array.isArray(playerUnlockedMoves) ? playerUnlockedMoves.slice() : [],
      moveLoadout: Array.isArray(moveLoadout) && moveLoadout.length === 4 ? moveLoadout.slice() : ['jab', 'cross', 'takedown', 'hook'],
      unlockedSubmissions: Array.isArray(unlockedSubmissions) ? unlockedSubmissions.slice() : ['rnc'],
      currentZone: typeof currentZone === 'number' ? currentZone : 1,
      currentRoomId: currentRoomId || 'room1',
      outfitData: outfitData
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
        level: data.playerStats.level || 1,
        // Style XP (new system)
        strikingXP: data.playerStats.strikingXP || 0,
        grapplingXP: data.playerStats.grapplingXP || 0,
        submissionXP: data.playerStats.submissionXP || 0,
        strikingLevel: data.playerStats.strikingLevel || 1,
        grapplingLevel: data.playerStats.grapplingLevel || 1,
        submissionLevel: data.playerStats.submissionLevel || 1
      },
      playerUnlockedMoves: Array.isArray(data.playerUnlockedMoves) ? data.playerUnlockedMoves.slice() : [],
      moveLoadout: Array.isArray(data.moveLoadout) && data.moveLoadout.length === 4 ? data.moveLoadout.slice() : ['jab', 'cross', 'takedown', 'hook'],
      unlockedSubmissions: Array.isArray(data.unlockedSubmissions) ? data.unlockedSubmissions.slice() : ['rnc'],
      currentZone: typeof data.currentZone === 'number' ? data.currentZone : 1,
      currentRoomId: data.currentRoomId || 'room1',
      outfitData: data.outfitData || null
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

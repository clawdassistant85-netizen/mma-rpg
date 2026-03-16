// Simple localStorage-based save system for MMA RPG
// Uses a single key and stores core player + progression state.

const SAVE_KEY = 'mma-rpg-save';
const LEGACY_SAVE_KEY = 'mma_rpg_save';

function saveGame(playerStats, playerUnlockedMoves, currentZone, currentRoomId, moveLoadout, unlockedSubmissions) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    // Basic validation / cloning to avoid storing Phaser objects
    var stats = playerStats || {};
    var outfitData = (window.MMA && window.MMA.Outfits) ? window.MMA.Outfits.saveOutfitData() : null;
    var normalizedStats = {
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
    };
    var payload = {
      playerStats: normalizedStats,
      hp: normalizedStats.hp,
      maxHp: normalizedStats.maxHp,
      stamina: normalizedStats.stamina,
      maxStamina: normalizedStats.maxStamina,
      xp: normalizedStats.xp,
      level: normalizedStats.level,
      playerUnlockedMoves: Array.isArray(playerUnlockedMoves) ? playerUnlockedMoves.slice() : [],
      moveLoadout: Array.isArray(moveLoadout) && moveLoadout.length === 4 ? moveLoadout.slice() : ['jab', 'cross', 'takedown', 'hook'],
      unlockedSubmissions: Array.isArray(unlockedSubmissions) ? unlockedSubmissions.slice() : ['rnc'],
      currentZone: typeof currentZone === 'number' ? currentZone : 1,
      currentRoomId: currentRoomId || 'room1',
      outfitData: outfitData
    };
    // Save creed and nemesis
    try { payload.creed = localStorage.getItem('mma_creed') || null; } catch(e) {}
    try { payload.deathsByType = JSON.parse(localStorage.getItem('mma_deaths_by_type') || '{}'); } catch(e) {}
    try { payload.mutations = JSON.parse(localStorage.getItem('mma_mutations') || '{}'); } catch(e) {}
    var serialized = JSON.stringify(payload);
    window.localStorage.setItem(SAVE_KEY, serialized);
    window.localStorage.setItem(LEGACY_SAVE_KEY, serialized);
  } catch (e) {
    // Fail silently — saving should never break gameplay
  }
}

function loadGame() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    var raw = window.localStorage.getItem(SAVE_KEY) || window.localStorage.getItem(LEGACY_SAVE_KEY);
    if (!raw) return null;
    var data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return null;
    // Minimal shape validation
    if (!data.playerStats || typeof data.playerStats !== 'object') return null;
    if (!data.currentRoomId) return null;
    var normalizedStats = {
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
    };
    return {
      playerStats: normalizedStats,
      hp: normalizedStats.hp,
      maxHp: normalizedStats.maxHp,
      stamina: normalizedStats.stamina,
      maxStamina: normalizedStats.maxStamina,
      xp: normalizedStats.xp,
      level: normalizedStats.level,
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
    var raw = window.localStorage.getItem(SAVE_KEY) || window.localStorage.getItem(LEGACY_SAVE_KEY);
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
    window.localStorage.removeItem(LEGACY_SAVE_KEY);
  } catch (e) {
    // ignore
  }
}

window.MMA = window.MMA || {};
window.MMA.SaveSystem = window.MMA.SaveSystem || {
  saveGame: saveGame,
  loadGame: loadGame,
  hasSaveGame: hasSaveGame,
  clearSaveGame: clearSaveGame,
  SAVE_KEY: SAVE_KEY,
  LEGACY_SAVE_KEY: LEGACY_SAVE_KEY
};
// === BATCH 24 SAVE EXTENSIONS ===
// Persist new b24 data: fight rep, tournament unlock, technique rust, gear durability

(function() {
  var SS = window.MMA && window.MMA.SaveSystem;
  if (!SS) return;

  var _origSave = SS.saveGame;
  if (typeof _origSave === 'function' && !SS._b24SaveHooked) {
    SS._b24SaveHooked = true;
    SS.saveGame = function(scene) {
      var result = _origSave.apply(this, arguments);
      try {
        var save = JSON.parse(localStorage.getItem(SAVE_KEY) || localStorage.getItem(LEGACY_SAVE_KEY) || '{}');
        // Fight club rep
        save.fightRep = JSON.parse(localStorage.getItem('mma_fight_rep') || '{}');
        // Technique rust
        save.techniqueRust = JSON.parse(localStorage.getItem('mma_technique_rust') || '{}');
        // Enemy respect
        save.enemyRespect = JSON.parse(localStorage.getItem('mma_enemy_respect') || '{}');
        // Gear durability
        var p = scene && scene.player;
        if (p && p.stats) {
          save.gearDurability = p.stats._gearDurability !== undefined ? p.stats._gearDurability : 100;
          save.gearBroken = !!p.stats._gearBroken;
        }
        var extendedSerialized = JSON.stringify(save);
        localStorage.setItem(SAVE_KEY, extendedSerialized);
        localStorage.setItem(LEGACY_SAVE_KEY, extendedSerialized);
      } catch(e) {}
      return result;
    };
  }

  var _origLoad = SS.loadGame;
  if (typeof _origLoad === 'function' && !SS._b24LoadHooked) {
    SS._b24LoadHooked = true;
    SS.loadGame = function(scene) {
      var loaded = _origLoad.call(this, scene);
      try {
        var save = JSON.parse(localStorage.getItem(SAVE_KEY) || localStorage.getItem(LEGACY_SAVE_KEY) || '{}');
        // Restore fight rep
        if (save.fightRep) localStorage.setItem('mma_fight_rep', JSON.stringify(save.fightRep));
        // Restore technique rust
        if (save.techniqueRust) localStorage.setItem('mma_technique_rust', JSON.stringify(save.techniqueRust));
        // Restore enemy respect
        if (save.enemyRespect) localStorage.setItem('mma_enemy_respect', JSON.stringify(save.enemyRespect));
        // Restore gear to player
        var p = scene && scene.player;
        if (p && p.stats) {
          p.stats._gearDurability = save.gearDurability !== undefined ? save.gearDurability : 100;
          p.stats._gearBroken = !!save.gearBroken;
        }
      } catch(e) {}
      return loaded;
    };
  }
})();

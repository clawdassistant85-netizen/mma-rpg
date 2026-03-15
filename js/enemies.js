// Enemies module for MMA RPG
// Added feature: Rival System - recurring boss "Shadow"
// The Shadow appears in multiple zones with scaling stats and dialogue based on player's fighting style.

window.MMA = window.MMA || {};
window.MMA.enemies = window.MMA.enemies || {};

/**
 * Base enemy constructor
 * @param {string} name
 * @param {object} stats - {hp, attack, defense, speed, style}
 * @param {function} behavior - function(gameState) defining AI actions
 */
function Enemy(name, stats, behavior) {
  this.name = name;
  this.stats = Object.assign({ hp: 100, attack: 10, defense: 5, speed: 5, style: "neutral" }, stats);
  this.behavior = behavior || function () {};
  this.isAlive = true;
}

// Helper to scale stats based on current zone level
function scaleStats(base, zoneLevel) {
  const factor = 1 + zoneLevel * 0.2; // 20% per zone level
  return {
    hp: Math.round(base.hp * factor),
    attack: Math.round(base.attack * factor),
    defense: Math.round(base.defense * factor),
    speed: Math.round(base.speed * factor),
    style: base.style,
  };
}

// Register a generic enemy type
window.MMA.enemies.register = function (key, factory) {
  window.MMA.enemies[key] = factory;
};

// Example regular enemy (placeholder)
window.MMA.enemies.register("kickboxer", function (zoneLevel) {
  const base = { hp: 80, attack: 12, defense: 4, speed: 8, style: "striker" };
  return new Enemy("Kickboxer", scaleStats(base, zoneLevel), function (state) {
    // Simple AI: attack if player in range
    // Placeholder behavior – actual combat logic resides elsewhere
  });
});

// ---- Rival System: Shadow ----
// The Shadow adapts to the player's dominant style.
// It appears in any zone where zoneLevel >= 2.
// Dialogue changes based on player's style ("striker", "grappler", "balanced").
window.MMA.enemies.register("shadowRival", function (zoneLevel, player) {
  // Determine base stats – stronger than regular enemies
  const base = { hp: 150, attack: 18, defense: 10, speed: 7, style: "rival" };
  const stats = scaleStats(base, zoneLevel);

  // Adjust dialogue based on player.style
  const dialogues = {
    striker: "I see you like throwing punches. Let's see how you handle a true shadow!",
    grappler: "Your grapples are impressive, but can you escape my darkness?",
    balanced: "A balanced fighter… you will need more than balance to survive!",
    neutral: "You think you have it all figured out? I am the thing you cannot predict.",
  };
  const playerStyle = player && player.style ? player.style : "neutral";
  const intro = dialogues[playerStyle] || dialogues["neutral"];

  // Behavior: simple placeholder – actual AI will be implemented elsewhere.
  function shadowBehavior(state) {
    // Example: if player HP low, increase aggression
    if (state.player && state.player.stats.hp < state.player.stats.maxHp * 0.3) {
      // Aggressive mode – higher attack
      this.stats.attack = Math.round(this.stats.attack * 1.3);
    }
    // Otherwise perform normal attack logic (omitted)
  }

  const enemy = new Enemy("Shadow", stats, shadowBehavior);
  enemy.introDialogue = intro;
  return enemy;
});

// Export for debugging (optional)
window.MMA.enemies.get = function (key, ...args) {
  if (typeof window.MMA.enemies[key] === "function") {
    return window.MMA.enemies[key](...args);
  }
  return null;
};

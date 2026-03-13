# MMA RPG — Architecture Spec

## File Structure
```
mma-rpg/
  index.html          # Game shell, loads Phaser + all scripts
  css/style.css       # UI overlays (HUD, menus)
  js/config.js        # Game config, constants
  js/moves.js         # Full move roster definitions
  js/enemies.js       # Enemy definitions + AI
  js/player.js        # Player class
  js/combat.js        # Combat system, damage calc
  js/progression.js   # XP, leveling, move unlocks
  js/narrator.js      # LLM integration (async, queued)
  js/scenes/
    BootScene.js      # Asset loading
    GameScene.js      # Main game loop
    HUDScene.js       # Overlay HUD (HP, stamina, XP)
    UnlockScene.js    # Move unlock popup
    PauseScene.js     # Move list / inventory
```

## Tech Stack
- **Phaser 3.60** (CDN: https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js)
- Pure HTML/JS/CSS, no build tools
- Tile size: 16px logical → rendered at 3x = 48px display
- Canvas size: 768x576 (16 tiles wide × 12 tiles tall × 3x scale)

## Player Data Structure
```js
player = {
  sprite: Phaser.GameObjects.Sprite,
  stats: { hp: 100, maxHp: 100, stamina: 100, maxStamina: 100, xp: 0, level: 1 },
  moveSet: ['jab', 'cross'],  // unlocked moves
  activeCooldowns: { jab: 0, cross: 0, ... },
  state: 'idle' | 'attacking' | 'staggered' | 'dead',
  facing: 'up' | 'down' | 'left' | 'right'
}
```

## Move Roster (20 moves)
| Move | Type | Damage | Stamina | Unlock |
|------|------|--------|---------|--------|
| Jab | Strike | 8 | 5 | Start |
| Cross | Strike | 12 | 8 | Start |
| Hook | Strike | 15 | 10 | Level 2 |
| Uppercut | Strike | 18 | 12 | Level 3 |
| Low Kick | Strike | 10 | 7 | Level 2 |
| Head Kick | Strike | 25 | 18 | Level 5 |
| Body Shot | Strike | 20 | 14 | Level 4 |
| Spinning Back Fist | Strike | 30 | 20 | Level 7 |
| Elbow Strike | Strike | 22 | 15 | Muay Thai Fighter |
| Knee Strike | Strike | 20 | 14 | Muay Thai Fighter |
| Double Leg Takedown | Grapple | 5+pin | 20 | Level 3 |
| Single Leg Takedown | Grapple | 5+pin | 15 | Wrestler |
| Hip Throw | Grapple | 18 | 18 | Judoka |
| Guard Pass | Grapple | 10 | 12 | Level 4 |
| Mount Control | Grapple | 0+bonus | 8 | Level 5 |
| Rear Naked Choke | Submission | 35 | 25 | Level 6 |
| Armbar | Submission | 30 | 22 | BJJ Fighter |
| Triangle Choke | Submission | 28 | 20 | BJJ Fighter |
| Guillotine | Submission | 25 | 18 | Level 5 |
| Kimura | Submission | 27 | 20 | Level 6 |

## Enemy Roster
| Name | HP | Pattern | Teaches | Zone |
|------|----|---------|---------|----|
| Street Thug | 40 | chase+jab | Hook | 1 |
| Bar Brawler | 60 | aggressive | Uppercut | 1 |
| Muay Thai Fighter | 80 | kicking | Elbow/Knee | 1 |
| Wrestler | 90 | grab-heavy | Single Leg | 2 |
| Judoka | 85 | throw-happy | Hip Throw | 2 |
| Ground-n-Pounder | 100 | takedown+GNP | Guard Pass | 2 |
| BJJ Black Belt | 120 | sub-hunter | Armbar/Triangle | 3 |
| MMA Champ (Boss) | 200 | all patterns | Spinning Back Fist | 3 |

## Enemy AI State Machine
```
idle → (player in range 200px) → chase
chase → (player in range 60px) → attack
attack → (hit lands) → cooldown(1000ms) → chase
attack → (player moves away) → chase
any state → (hp <= 0) → dead
any state → (hit while attacking) → stagger(400ms) → chase
```

## Combat System
```js
// Attack execution
function executeAttack(attackerId, move, targetId) {
  if (activeCooldowns[move] > 0) return false;
  if (stamina < moves[move].staminaCost) return false;
  stamina -= moves[move].staminaCost;
  activeCooldowns[move] = moves[move].cooldown;
  // Check overlap via Phaser physics
  // Apply damage + status effects
  // Trigger narrator event
}

// Damage calc
function calcDamage(move, attacker, defender) {
  let base = moves[move].damage;
  let levelBonus = attacker.level * 0.05;
  let staggerBonus = defender.state === 'staggered' ? 1.5 : 1.0;
  return Math.floor(base * (1 + levelBonus) * staggerBonus);
}
```

## Controls
- WASD: movement (8-directional)
- J: light attack (jab/low kick) — always available
- K: heavy attack (cross/power) — always available
- L: grapple attempt — unlocks at level 3
- Space: special move (top of unlocked set, high stamina)
- I: toggle move list overlay
- Enter: interact / confirm

## LLM Narrator
```js
// OpenClaw gateway endpoint
const LLM_URL = 'http://127.0.0.1:18789/v1/chat/completions';
const LLM_MODEL = 'exo/mlx-community/gpt-oss-120b-MXFP4-Q8';

// Prompt templates
const PROMPTS = {
  combatStart: (enemy) => `You are an MMA fight announcer. In 1 sentence, have the ${enemy.name} taunt the player before a fight. Be trash-talky and MMA-specific.`,
  moveUnlock: (move, enemy) => `In 1 sentence, describe the player absorbing the ${move} technique after defeating the ${enemy}. Be dramatic and martial-arts-flavored.`,
  bigHit: (move, damage) => `In 8 words or less, give hype commentary for landing a ${move} for ${damage} damage.`,
  levelUp: (level) => `In 1 sentence, narrate the player reaching level ${level} as an MMA fighter.`
};

// Fallbacks if LLM offline
const FALLBACKS = {
  combatStart: (enemy) => `${enemy.name} gets into fighting stance!`,
  moveUnlock: (move) => `You learned ${move}!`,
  bigHit: (move) => `${move.toUpperCase()}!`,
  levelUp: (level) => `Level ${level} reached!`
};
```

## Dungeon Zones
- **Zone 1 — The Street**: dark alley tileset, 4 rooms, enemies: Street Thug, Bar Brawler, Muay Thai Fighter
- **Zone 2 — The Gym**: wrestling mat tileset, 4 rooms, enemies: Wrestler, Judoka, Ground-n-Pounder
- **Zone 3 — The Octagon**: cage/arena tileset, 3 rooms + boss room, enemies: BJJ Black Belt, MMA Champ

## Pixel Art Palette (NES)
- Floor: #2c1810 (dark brown), #3d2415 (brown)
- Walls: #1a0f0a (near black), #4a2c1a (dark brown)
- Player: #e8c870 (skin), #1a4a8a (blue gi top), #2a2a6a (dark pants)
- Enemy: varies per type
- UI: #000000 bg, #ffffff text, #e83030 HP bar, #30a8e8 stamina bar, #e8c830 XP bar

## Phase 1 MVP Scope (builds first)
1. index.html with Phaser CDN
2. GameScene: 16x12 tile room with wall border, floor fill
3. Player: 16x16 colored rectangle, WASD movement, facing direction
4. Enemy: 16x16 colored rectangle, chase AI, attack when close
5. J key: jab attack with hitbox, deals 8 damage
6. HP bars drawn on sprites (Phaser graphics)
7. Enemy dies at 0 HP, simple "You Win" text
8. Player dies at 0 HP, "Game Over" text
9. HUD: HP + stamina bars top of screen
